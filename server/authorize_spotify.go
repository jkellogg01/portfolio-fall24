package main

import (
	"bytes"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
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
			w.WriteHeader(http.StatusInternalServerError)
			return
		} else if !token.Valid {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
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
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		// TODO: check for the state and check it against the cookie for the state
		if values.Has("error") {
			log.Printf("spotify authorization denied: %s", values.Get("error"))
			w.WriteHeader(http.StatusBadRequest)
			return
		} else if !values.Has("code") {
			log.Print("spotify has royally screwed up")
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		req, err := http.NewRequest(http.MethodGet, fmt.Sprintf(
			"https://accounts.spotify.com/api/token?grant_type=authorization_code&code=%s&redirect_uri=%s",
			url.QueryEscape(values.Get("code")), url.QueryEscape(os.Getenv("SPOTIFY_REDIRECT_URI")),
		), nil)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		clientInfo := fmt.Sprintf("%s:%s", os.Getenv("CLIENT_ID"), os.Getenv("CLIENT_SECRET"))
		encodedClientInfo := base64.StdEncoding.EncodeToString([]byte(clientInfo))
		req.Header.Add("Authorization", fmt.Sprintf("Basic %s", encodedClientInfo))
		req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
		res, err := http.DefaultClient.Do(req)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		} else if res.StatusCode != http.StatusOK {
			w.WriteHeader(http.StatusInternalServerError)
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
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		if body.TokenType != "Bearer" {
			w.WriteHeader(http.StatusInternalServerError)
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
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		respData, err := json.Marshal(tokenPair)
		if err == nil {
			w.Write(respData)
		}
		w.WriteHeader(http.StatusOK)
	}
}
