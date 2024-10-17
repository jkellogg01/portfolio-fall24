-- name: GetTokenPair :one
SELECT access_token, refresh_token, expires_at
FROM spotify_token_pairs
GROUP BY created_at
LIMIT 1;

-- name: CreateTokenPair :one
INSERT INTO spotify_token_pairs (
  access_token, refresh_token, expires_at, scope
) VALUES (
  ?, ?, ?, ?
) RETURNING *;

-- TODO: name: PurgeTokenPairs :exec

