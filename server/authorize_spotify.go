package main

import (
	"cmp"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"net/url"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jkellogg01/portfolio-fall24/server/database"
	"github.com/jkellogg01/portfolio-fall24/server/jwt"
)

// api/spotify/authorize/{token}
func spotifyAuthBegin() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		tokenString := r.PathValue("token")
		token, err := jwt.ValidateAccessToken(tokenString)
		if err != nil {
			respondWithError(w, r, http.StatusInternalServerError, "failed to validate access token")
			return
		} else if !token.Valid {
			respondWithError(w, r, http.StatusBadRequest, "invalid access token")
			return
		}
		stateString := generateRandomString(16)
		http.SetCookie(w, &http.Cookie{
			Name:        "spotify-auth-state",
			Value:       stateString,
			Path:        "/",
			Secure:      true,
			HttpOnly:    true,
			SameSite:    http.SameSiteLaxMode,
			Partitioned: true,
		})
		queryParams := url.Values{}
		queryParams.Add("response_type", "code")
		queryParams.Add("client_id", os.Getenv("SPOTIFY_CLIENT_ID"))
		queryParams.Add("scope", "user-top-read")
		queryParams.Add("redirect_uri", os.Getenv("SPOTIFY_REDIRECT_URI"))
		queryParams.Add("state", stateString)
		http.Redirect(w, r, fmt.Sprintf("https://accounts.spotify.com/authorize?%s", queryParams.Encode()), 302)
	}
}

// api/spotify/authorize/callback
func spotifyAuthCallback(q *database.Queries) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		values, err := url.ParseQuery(r.URL.RawQuery)
		if err != nil {
			respondWithError(w, r, http.StatusBadRequest, "could not parse query parameters")
			return
		}
		state := values.Get("state")
		stateCookie, err := r.Cookie("spotify-auth-state")
		if err != nil {
			respondWithError(w, r, http.StatusInternalServerError, "could not parse state cookie")
			return
		} else if stateCookie.Value != state {
			respondWithError(w, r, http.StatusBadRequest, "state mismatch")
			return
		}
		if values.Has("error") {
			log.Printf("spotify authorization denied: %s", values.Get("error"))
			respondWithError(w, r, http.StatusBadRequest, "spotify authorization denied: %s", values.Get("error"))
			return
		} else if !values.Has("code") {
			respondWithError(w, r, http.StatusBadRequest, "spotify returned no error but provided no code")
			return
		}
		queryParams := url.Values{}
		queryParams.Add("grant_type", "authorization_code")
		queryParams.Add("code", values.Get("code"))
		queryParams.Add("redirect_uri", os.Getenv("SPOTIFY_REDIRECT_URI"))
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
			responseInfo := make(map[string]string)
			err := json.NewDecoder(res.Body).Decode(&responseInfo)
			if err == nil {
				fmt.Printf("%+v\n", responseInfo)
			}
			respondWithError(w, r, http.StatusInternalServerError, "got response %s from spotify's api", res.Status)
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
			respondWithError(w, r, http.StatusInternalServerError, "failed to parse token response body")
			return
		}
		if body.TokenType != "Bearer" {
			respondWithError(w, r, http.StatusInternalServerError, "got invalid token type %s", body.TokenType)
			return
		}
		expireAt := time.Now().Add(time.Duration(body.ExpiresIn) * time.Second)
		_, err = q.CreateTokenPair(r.Context(), database.CreateTokenPairParams{
			AccessToken:  body.AccessToken,
			RefreshToken: body.RefreshToken,
			ExpiresAt: pgtype.Timestamp{
				Time:             expireAt,
				InfinityModifier: pgtype.Finite,
				Valid:            true,
			},
			Scope: pgtype.Text{
				String: body.Scope,
				Valid:  body.Scope != "",
			},
		})
		if err != nil {
			respondWithError(w, r, http.StatusInternalServerError, "failed to write token pair to database")
			return
		}
		appURL := cmp.Or(os.Getenv("RAILWAY_PUBLIC_DOMAIN"), "http://localhost:8080")
		http.Redirect(w, r, appURL, http.StatusFound)
	}
}

func generateRandomString(length int) string {
	chars := "THEQUICKBROWNFOXJUMPSOVERTHELAZYDOGsphinxofblackquartzjudgemyvow0123456789"
	buf := make([]byte, length)
	for i := range length {
		buf[i] = chars[rand.Intn(len(chars))]
	}
	return string(buf)
}
