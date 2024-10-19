package middleware

import (
	"fmt"
	"net/http"
	"os"
	"time"
)

type statusTappedWriter struct {
	http.ResponseWriter
	statusCode int
}

func (w *statusTappedWriter) WriteHeader(statusCode int) {
	w.statusCode = statusCode
	w.ResponseWriter.WriteHeader(statusCode)
}

func Log(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t := time.Now()
		tap := statusTappedWriter{
			ResponseWriter: w,
			statusCode:     0,
		}
		next.ServeHTTP(&tap, r)
		fmt.Fprintf(os.Stdout, "[%3d] %s @ %s in %v\n", tap.statusCode, r.Method, r.URL.Path, time.Since(t))
	})
}
