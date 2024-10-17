package jwt

import (
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var (
	ErrIssuerInvalid = errors.New("this is not a valid token")
)

func GenerateAccessToken() *jwt.Token {
	expireDuration := 24 * time.Hour
	nowUTC := time.Now().UTC()
	issueTimestamp := jwt.NewNumericDate(nowUTC)
	expireTimestamp := jwt.NewNumericDate(nowUTC.Add(expireDuration))
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.RegisteredClaims{
		Issuer:    "jkellogg-portfolio",
		IssuedAt:  issueTimestamp,
		ExpiresAt: expireTimestamp,
	})
	return token
}

func ValidateAccessToken(tokenString string) (*jwt.Token, error) {
	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", t.Header["alg"])
		}
		return []byte(os.Getenv("JWT_SECRET")), nil
	})
	if err != nil {
		return nil, err
	}

	i, err := token.Claims.GetIssuer()
	if err != nil {
		return nil, err
	} else if i != "jkellogg-portfolio" {
		return nil, ErrIssuerInvalid
	}
	return token, nil
}
