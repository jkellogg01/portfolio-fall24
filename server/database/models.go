// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0

package database

import (
	"github.com/jackc/pgx/v5/pgtype"
)

type SpotifyTokenPair struct {
	ID           int32            `json:"id"`
	AccessToken  string           `json:"access_token"`
	RefreshToken string           `json:"refresh_token"`
	Scope        pgtype.Text      `json:"scope"`
	CreatedAt    pgtype.Timestamp `json:"created_at"`
	ExpiresAt    pgtype.Timestamp `json:"expires_at"`
}
