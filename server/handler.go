package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

func respondWithError(w http.ResponseWriter, status int, format string, values ...any) {
	errorMessage := fmt.Sprintf(format, values...)
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
