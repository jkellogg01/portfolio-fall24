import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY!);

const emailRequestSchema = z
  .object({
    name: z.string(),
    email: z.string().email(),
    company: z.string().optional(),
    message: z.string(),
  })
  .refine(
    ({ email, company }) => email !== company,
    "email may not be the same as company (this is a lazy way of me deterring bots)",
  );

export type EmailRequestBody = typeof emailRequestSchema._type;

export const contactRoute = new Hono().post(
  "/",
  zValidator("form", emailRequestSchema),
  async (ctx) => {
    const { name, email, company, message } = await ctx.req
      .formData()
      .then((data) => emailRequestSchema.parse(data));
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
