package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"text/template"

	"github.com/resend/resend-go/v2"
)

type contactFormData struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Company string `json:"company,omitempty"`
	Message string `json:"message"`
}

func contactFormSubmit(w http.ResponseWriter, r *http.Request) {
	var body contactFormData
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		respondWithError(w, r, http.StatusInternalServerError, "failed to parse request body")
		return
	}
	if body.Email == body.Company {
		respondWithError(w, r, http.StatusBadRequest, "scam likely: email and company are the same")
		return
	}

	client := resend.NewClient(os.Getenv("RESEND_API_KEY"))

	var emailBody bytes.Buffer
	template.Must(template.New("").Parse("{{.Name}}{{if .Company}} from {{.Company}}{{end}}\n{{.Message}}")).Execute(&emailBody, body)

	params := &resend.SendEmailRequest{
		From:    "Contact Form <contact@jkellogg.dev",
		To:      []string{os.Getenv("MY_EMAIL")},
		Subject: "New Contact Form Response",
		ReplyTo: body.Email,
		Text:    emailBody.String(),
	}

	sent, err := client.Emails.Send(params)
	if err != nil {
		respondWithError(w, r, http.StatusInternalServerError, "failed to send contact form email")
		return
	}
	fmt.Printf("sent email %s from contact form response\n", sent.Id)
	respondWithJSON(w, http.StatusOK, nil)
}
