package middleware

import (
	"fmt"
	"net/http"
	"os"
	"time"
)

type wrappedWriter struct {
	http.ResponseWriter
	statusCode int
}

func (w *wrappedWriter) WriteHeader(statusCode int) {
	w.statusCode = statusCode
	w.ResponseWriter.WriteHeader(statusCode)
}

func Log(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t := time.Now()
		wrapped := wrappedWriter{
			ResponseWriter: w,
			statusCode:     0,
		}
		next.ServeHTTP(&wrapped, r)
		fmt.Fprintf(os.Stdout, "[%3d] %s @ %s in %v", wrapped.statusCode, r.Method, r.URL.Path, time.Since(t))
		sentError, ok := r.Context().Value("error").(string)
		if !ok {
			fmt.Fprintf(os.Stdout, "\n")
			return
		}
		fmt.Fprintf(os.Stdout, " | %s\n", sentError)
	})
}
