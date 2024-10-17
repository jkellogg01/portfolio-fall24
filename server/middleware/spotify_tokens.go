package middleware

import (
	"context"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"time"

	"github.com/jkellogg01/portfolio-fall24/server/database"
)

func GetSpotifyToken(next http.Handler, q *database.Queries) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tokenPair, err := q.GetTokenPair(r.Context())
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		if tokenPair.ExpiresAt > time.Now().Unix() {
			ctx := context.WithValue(r.Context(), "spotify-access", tokenPair.AccessToken)
			next.ServeHTTP(w, r.WithContext(ctx))
			return
		}
		queryParams := url.Values{}
		queryParams.Add("grant_type", "refresh_token")
		queryParams.Add("refresh_token", tokenPair.RefreshToken)
		req, err := http.NewRequest(http.MethodPost, fmt.Sprintf("https://accounts.spotify.com/api/token?%s", queryParams.Encode()), nil)
		if err != nil {
			respondWithError(w, r, http.StatusInternalServerError, "failed to create token request")
			return
		}
		clientInfo := fmt.Sprintf("%s:%s", os.Getenv("SPOTIFY_CLIENT_ID"), os.Getenv("SPOTIFY_CLIENT_SECRET"))
		encodedClientInfo := base64.StdEncoding.EncodeToString([]byte(clientInfo))
		req.Header.Add("Authorization", fmt.Sprintf("Basic %s", encodedClientInfo))
		req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
		res, err := http.DefaultClient.Do(req)
		if err != nil {
			respondWithError(w, r, http.StatusInternalServerError, "failed to request token from spotify")
			return
		} else if res.StatusCode != http.StatusOK {
			respondWithError(w, r, http.StatusInternalServerError, "got response %s from spotify's api", res.Status)
			return
		}
		var body struct {
			AccessToken  string `json:"access_token"`
			RefreshToken string `json:"refresh_token,omitempty"`
			Scope        string `json:"scope,omitempty"`
			ExpiresIn    int    `json:"expires_in"`
			TokenType    string `json:"token_type"`
		}
		err = json.NewDecoder(res.Body).Decode(&body)
		if err != nil {
			respondWithError(w, r, http.StatusInternalServerError, "failed to parse token response body")
			return
		}
		if body.TokenType != "Bearer" {
			respondWithError(w, r, http.StatusInternalServerError, "got invalid token type %s", body.TokenType)
			return
		}
		if body.RefreshToken == "" {
			body.RefreshToken = tokenPair.RefreshToken
		}
		expireAt := time.Now().Add(time.Duration(body.ExpiresIn) * time.Second)
		newTokenPair, err := q.CreateTokenPair(r.Context(), database.CreateTokenPairParams{
			AccessToken:  body.AccessToken,
			RefreshToken: body.RefreshToken,
			ExpiresAt:    expireAt.Unix(),
			Scope:        sql.NullString{Valid: body.Scope != "", String: body.Scope},
		})
		if err != nil {
			respondWithError(w, r, http.StatusInternalServerError, "failed to write token pair to database")
			return
		}
		ctx := context.WithValue(r.Context(), "spotify-access", newTokenPair.AccessToken)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func respondWithError(w http.ResponseWriter, r *http.Request, status int, format string, values ...any) {
	errorMessage := fmt.Sprintf(format, values...)
	ctx := context.WithValue(r.Context(), "error", errorMessage)
	r = r.WithContext(ctx)
	body, err := json.Marshal(map[string]string{"error": errorMessage})
	w.WriteHeader(status)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to respond with json payload: %v\n", err)
		return
	}
	w.Write(body)
}
