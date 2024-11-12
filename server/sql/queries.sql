-- name: GetTokenPair :one
SELECT access_token, refresh_token, expires_at
FROM spotify_token_pair
GROUP BY created_at, access_token, refresh_token, expires_at
LIMIT 1;

-- name: CreateTokenPair :one
INSERT INTO spotify_token_pair (
  access_token, refresh_token, expires_at, scope
) VALUES (
  $1, $2, $3, $4
) RETURNING *;
