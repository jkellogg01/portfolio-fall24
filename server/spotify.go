package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
)

type topArtists struct {
	Href    string `json:"href"`
	Limit   int    `json:"limit"`
	Offset  int    `json:"offset"`
	Next    string `json:"next,omitempty"`
	Prev    string `json:"previous,omitempty"`
	Total   int    `json:"total"`
	Artists []struct {
		ExternalURLs struct {
			Spotify string `json:"spotify"`
		} `json:"external_urls"`
		Followers struct {
			Href  string `json:"href,omitempty"`
			Total int    `json:"total"`
		} `json:"followers"`
		Genres     []string       `json:"genres"`
		Href       string         `json:"href"`
		ID         string         `json:"id"`
		Images     []spotifyImage `json:"images"`
		Name       string         `json:"name"`
		Popularity int            `json:"popularity"`
		Type       string         `json:"type"`
		URI        string         `json:"uri"`
	} `json:"items"`
}

type spotifyImage struct {
	URL    string `json:"url"`
	Height int    `json:"height,omitempty"`
	Widhth int    `json:"width,omitempty"`
}

func spotifyTopArtists(w http.ResponseWriter, r *http.Request) {
	search := r.URL.Query()
	limitString := search.Get("limit")
	limit, err := strconv.Atoi(limitString)
	if err != nil {
		respondWithError(w, r, http.StatusInternalServerError, "failed to parse search parameter: limit")
		return
	}
	if limit < 1 || limit > 50 {
		respondWithError(w, r, http.StatusBadRequest, "invalid limit: %d", limit)
		return
	}
	offsetString := search.Get("offset")
	offset, err := strconv.Atoi(offsetString)
	if err != nil {
		respondWithError(w, r, http.StatusInternalServerError, "failed to parse search parameter: offset")
		return
	}
	if offset != 0 {
		respondWithError(w, r, http.StatusBadRequest, "offsets are not supported!")
		return
	}
	timeRange := search.Get("time_range")
	if timeRange != "short_term" && timeRange != "medium_term" && timeRange != "long_term" {
		respondWithError(w, r, http.StatusBadRequest, "invalid time range: %s", timeRange)
		return
	}
	req, err := http.NewRequest(http.MethodGet, "https://api.spotify.com/v1/me/top/artists?"+search.Encode(), nil)
	if err != nil {
		respondWithError(w, r, http.StatusInternalServerError, "erroneous request")
		return
	}
	accessToken, ok := r.Context().Value("spotify-access").(string)
	if !ok {
		respondWithError(w, r, http.StatusInternalServerError, "spotify access token invalid or missing")
		return
	}
	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", accessToken))
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		respondWithError(w, r, http.StatusInternalServerError, "spotify API request failed")
		return
	} else if res.StatusCode/100 != 2 {
		respondWithError(w, r, res.StatusCode, "spotify API request returned %s", res.Status)
		return
	}
	var body topArtists
	err = json.NewDecoder(res.Body).Decode(&body)
	r.Body.Close()
	if err != nil {
		respondWithError(w, r, http.StatusInternalServerError, "failed to decode response body")
		return
	}
	respondWithJSON(w, http.StatusOK, body)
}
