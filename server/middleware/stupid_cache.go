package middleware

import (
	"fmt"
	"net/http"
	"os"
	"slices"
	"sync"
	"time"
)

type cache struct {
	data map[string]cacheItem
	mu   *sync.RWMutex
}

type cacheItem struct {
	body        []byte
	contentType string
	expiresAt   time.Time
}

func (c *cache) Set(k string, v cacheItem) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.data[k] = v
}

func (c *cache) Get(k string) *cacheItem {
	c.mu.RLock()
	defer c.mu.RUnlock()
	v, ok := c.data[k]
	if !ok {
		return nil
	}
	return &v
}

func (c *cache) Remove(k string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	delete(c.data, k)
}

type bodyTappedWriter struct {
	http.ResponseWriter
	body       []byte
	statusCode int
}

func (w *bodyTappedWriter) Write(body []byte) (int, error) {
	w.body = append(w.body, body...)
	return w.ResponseWriter.Write(body)
}

func (w *bodyTappedWriter) WriteHeader(status int) {
	w.statusCode = status
	w.ResponseWriter.WriteHeader(status)
}

func StupidCache(next http.Handler) http.Handler {
	theCacheInQuestion := cache{
		data: make(map[string]cacheItem),
		mu:   &sync.RWMutex{},
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !slices.Contains([]string{
			http.MethodGet,
			http.MethodOptions,
			http.MethodHead,
		}, r.Method) {
			next.ServeHTTP(w, r)
			return
		}
		path := r.URL.String()
		resp := theCacheInQuestion.Get(path)
		if resp != nil && resp.expiresAt.After(time.Now()) {
			fmt.Fprintf(os.Stdout, "[CACHE HIT] %s\n", path)
			w.Header().Set("Content-Type", resp.contentType)
			w.WriteHeader(http.StatusOK)
			w.Write(resp.body)
			return
		} else if resp != nil {
			// map memory doesn't get garbage collected but this should allow that
			// memory to be reused so that railway doesn't have to charge me
			// 300 million dollars a month
			theCacheInQuestion.Remove(path)
		}
		tap := &bodyTappedWriter{ResponseWriter: w}
		next.ServeHTTP(tap, r)
		if tap.statusCode/100 != 2 {
			return
		}
		theCacheInQuestion.Set(path, cacheItem{
			body:        tap.body,
			contentType: tap.Header().Get("Content-Type"),
			expiresAt:   time.Now().Add(24 * time.Hour),
		})
	})
}
