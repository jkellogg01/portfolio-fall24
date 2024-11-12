package main

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/stdlib"
	"github.com/pressly/goose"
)

func dbConnect(ctx context.Context) (*pgx.Conn, error) {
	connString := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASS"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_ROOT"),
		os.Getenv("DB_NAME"),
	)
	if os.Getenv("DB_HOST") == "127.0.0.1" ||
		os.Getenv("DB_HOST") == "localhost" {
		connString += "?sslmode=disable"
	}
	conn, err := pgx.Connect(ctx, connString)
	if err != nil {
		return nil, err
	}
	db := stdlib.OpenDB(*conn.Config())
	defer db.Close()
	err = goose.SetDialect("postgres")
	if err != nil {
		return nil, err
	}
	err = goose.Up(db, "./sql/schema")
	if err != nil {
		return nil, err
	}
	return conn, nil
}
