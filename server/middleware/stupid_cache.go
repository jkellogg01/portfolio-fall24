package middleware

import (
	"fmt"
	"net/http"
	"os"
	"slices"
	"time"
)

type cacheObject struct {
	body        []byte
	contentType string
	createdAt   time.Time
}

type bodyTappedWriter struct {
	http.ResponseWriter
	body       []byte
	statusCode int
}

func (w *bodyTappedWriter) Write(body []byte) (int, error) {
	w.body = body
	return w.ResponseWriter.Write(body)
}

func (w *bodyTappedWriter) WriteHeader(status int) {
	w.statusCode = status
	w.ResponseWriter.WriteHeader(status)
}

func StupidCache(next http.Handler) http.Handler {
	theCacheInQuestion := make(map[string]cacheObject)
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
		resp, ok := theCacheInQuestion[path]
		if ok && resp.createdAt.Add(time.Hour*time.Duration(24)).After(time.Now()) {
			fmt.Fprintf(os.Stdout, "[CACHE HIT] %s\n", path)
			w.Header().Set("Content-Type", resp.contentType)
			w.WriteHeader(http.StatusOK)
			w.Write(resp.body)
			return
		}
		tap := &bodyTappedWriter{ResponseWriter: w}
		next.ServeHTTP(tap, r)
		if tap.statusCode/100 != 2 {
			return
		}
		theCacheInQuestion[path] = cacheObject{
			body:        tap.body,
			contentType: tap.Header().Get("Content-Type"),
			createdAt:   time.Now(),
		}
	})
}
