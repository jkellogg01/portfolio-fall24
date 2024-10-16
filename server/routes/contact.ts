import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { Resend } from "resend";
import { emailRequestSchema } from "../lib/types";

const resend = new Resend(process.env.RESEND_API_KEY!);

export const contactRoute = new Hono().post(
  "/",
  zValidator("json", emailRequestSchema),
  async (ctx) => {
    const body = await ctx.req.json();
    const { name, email, company, message } = emailRequestSchema.parse(body);
    const { data, error } = await resend.emails.send({
      from: "Contact Form <contact@jkellogg.dev>",
      to: process.env.MY_EMAIL!,
      replyTo: email,
      subject: "New Contact Form Response",
      html: `<h1>New message from ${name}${company !== undefined && ` - ${company}`}</h1><p>message: ${message}</p>`,
    });
    if (error) {
      return ctx.text(
        `encountered error ${error.name}:\n${error.message}`,
        500,
      );
    }

    console.log(`sent email with id ${data!.id}`);
    return ctx.text("contact response sent");
  },
);
