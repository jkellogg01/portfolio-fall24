package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

func respondWithError(w http.ResponseWriter, r *http.Request, status int, format string, values ...any) {
	errorMessage := fmt.Sprintf(format, values...)
	ctx := context.WithValue(r.Context(), "error", errorMessage)
	r = r.WithContext(ctx)
	respondWithJSON(w, status, map[string]string{
		"error": errorMessage,
	})
}

func respondWithJSON(w http.ResponseWriter, status int, payload any) {
	body, err := json.Marshal(payload)
	w.WriteHeader(status)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to respond with json payload: %v\n", err)
		return
	}
	w.Write(body)
}
