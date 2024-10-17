-- +goose Up
CREATE TABLE IF NOT EXISTS main.spotify_token_pairs (
  id integer PRIMARY KEY,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  scope text,
  created_at integer NOT NULL DEFAULT(unixepoch()),
  expires_at integer NOT NULL
);
