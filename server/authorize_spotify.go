package main

import (
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"net/url"
	"os"
	"time"

	"github.com/jkellogg01/portfolio-fall24/server/database"
	"github.com/jkellogg01/portfolio-fall24/server/jwt"
)

// api/spotify/authorize/{token}
func spotifyAuthBegin() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		tokenString := r.PathValue("token")
		token, err := jwt.ValidateAccessToken(tokenString)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "failed to validate access token")
			return
		} else if !token.Valid {
			respondWithError(w, http.StatusBadRequest, "invalid access token")
			return
		}
		http.SetCookie(w, &http.Cookie{
			Name:        "spotify-auth-state",
			Value:       generateRandomString(16),
			Path:        "/",
			Secure:      true,
			HttpOnly:    true,
			SameSite:    http.SameSiteLaxMode,
			Partitioned: true,
		})
		http.Redirect(w, r, fmt.Sprintf(
			"https://accounts.spotify.com/authorize?response_type=code&show_dialog=false&scope=%sclient_id=%s&redirect_uri=%s",
			url.QueryEscape("user-top-read"), url.QueryEscape(os.Getenv("SPOTIFY_CLIENT_ID")), url.QueryEscape(os.Getenv("SPOTIFY_REDIRECT_URI")),
		), 302)
	}
}

// api/spotify/authorize/callback
func spotifyAuthCallback(q *database.Queries) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		values, err := url.ParseQuery(r.URL.RawQuery)
		if err != nil {
			respondWithError(w, http.StatusBadRequest, "could not parse query parameters")
			return
		}
		state := values.Get("state")
		stateCookie, err := r.Cookie("spotify-auth-state")
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "could not parse state cookie")
			return
		} else if stateCookie.Value != state {
			respondWithError(w, http.StatusBadRequest, "state mismatch")
			return
		}
		if values.Has("error") {
			log.Printf("spotify authorization denied: %s", values.Get("error"))
			respondWithError(w, http.StatusBadRequest, "spotify authorization denied: %s", values.Get("error"))
			return
		} else if !values.Has("code") {
			respondWithError(w, http.StatusBadRequest, "spotify returned no error but provided no code")
			return
		}
		req, err := http.NewRequest(http.MethodGet, fmt.Sprintf(
			"https://accounts.spotify.com/api/token?grant_type=authorization_code&code=%s&redirect_uri=%s",
			url.QueryEscape(values.Get("code")), url.QueryEscape(os.Getenv("SPOTIFY_REDIRECT_URI")),
		), nil)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "failed to create token request")
			return
		}
		clientInfo := fmt.Sprintf("%s:%s", os.Getenv("CLIENT_ID"), os.Getenv("CLIENT_SECRET"))
		encodedClientInfo := base64.StdEncoding.EncodeToString([]byte(clientInfo))
		req.Header.Add("Authorization", fmt.Sprintf("Basic %s", encodedClientInfo))
		req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
		res, err := http.DefaultClient.Do(req)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "failed to request token from spotify")
			return
		} else if res.StatusCode != http.StatusOK {
			respondWithError(w, http.StatusInternalServerError, "got response %s from spotify's api", res.Status)
			return
		}
		var body struct {
			AccessToken  string `json:"access_token"`
			RefreshToken string `json:"refresh_token"`
			Scope        string `json:"scope,omitempty"`
			ExpiresIn    int    `json:"expires_in"`
			TokenType    string `json:"token_type"`
		}
		err = json.NewDecoder(res.Body).Decode(&body)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "failed to parse token response body")
			return
		}
		if body.TokenType != "Bearer" {
			respondWithError(w, http.StatusInternalServerError, "got invalid token type %s", body.TokenType)
			return
		}
		expireAt := time.Now().Add(time.Duration(body.ExpiresIn) * time.Second)
		tokenPair, err := q.CreateTokenPair(r.Context(), database.CreateTokenPairParams{
			AccessToken:  body.AccessToken,
			RefreshToken: body.RefreshToken,
			ExpiresAt:    expireAt.Unix(),
			Scope:        sql.NullString{Valid: body.Scope != "", String: body.Scope},
		})
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "failed to write token pair to database")
			return
		}
		respondWithJSON(w, http.StatusCreated, tokenPair)
	}
}

func generateRandomString(length int) string {
	buf := make([]byte, 0, length)
	for range length {
		char := byte(rand.Intn(62))
		if char < 10 {
			char += '0'
		} else if char < 36 {
			char += 'a'
		} else {
			char += 'A'
		}
		buf = append(buf, char)
	}
	return string(buf)
}
