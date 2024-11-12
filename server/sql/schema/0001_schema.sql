-- +goose Up
CREATE TABLE spotify_token_pair (
  id serial not null,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  scope text,
  created_at timestamp NOT NULL DEFAULT now(),
  expires_at timestamp NOT NULL
);

-- +goose Down
DROP TABLE spotify_token_pair;
