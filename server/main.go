package main

import (
	"cmp"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/jkellogg01/portfolio-fall24/server/database"
	"github.com/jkellogg01/portfolio-fall24/server/jwt"
	"github.com/jkellogg01/portfolio-fall24/server/middleware"
	_ "github.com/mattn/go-sqlite3"
	"github.com/pressly/goose"
)

func main() {
	log.SetOutput(os.Stdout)

	db, err := initDB()
	if err != nil {
		log.Fatal(err)
	}

	token := jwt.GenerateAccessToken()
	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		log.Fatal(err)
	}

	queries := database.New(db)

	router := http.NewServeMux()

	api := http.NewServeMux()
	router.Handle("/api/", http.StripPrefix("/api", api))
	api.HandleFunc("GET /spotify/authorize/{token}", spotifyAuthBegin())
	api.HandleFunc("GET /spotify/authorize/callback", spotifyAuthCallback(queries))

	spotifyAuthed := http.NewServeMux()
	api.Handle("/spotify/", http.StripPrefix("/spotify", middleware.GetSpotifyToken(spotifyAuthed, queries)))
	spotifyAuthed.HandleFunc("GET /top/artists", spotifyTopArtists)

	dist := http.FileServer(http.Dir("dist"))
	router.Handle("/", dist)

	port := cmp.Or(os.Getenv("PORT"), "8080")
	server := http.Server{
		Addr:    fmt.Sprintf("0.0.0.0:%s", port),
		Handler: middleware.Log(router),
	}

	log.Printf("starting server at %s", server.Addr)
	var currentAddress string
	if os.Getenv("RAILWAY_PUBLIC_DOMAIN") != "" {
		currentAddress = os.Getenv("RAILWAY_PUBLIC_DOMAIN")
	} else {
		currentAddress = fmt.Sprintf("http://localhost:%s", port)
	}
	log.Printf("authorize spotify at:\n%s/api/spotify/authorize/%s", currentAddress, tokenString)
	err = server.ListenAndServe()
	if err != nil {
		log.Fatal(err)
	}
}

func initDB() (*sql.DB, error) {
	log.SetOutput(os.Stdout)
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		return nil, err
	}
	err = goose.SetDialect("sqlite3")
	if err != nil {
		return nil, err
	}
	err = goose.Up(db, "sql/schema")
	return db, err
}
