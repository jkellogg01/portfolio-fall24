import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { useState } from "react";
import { z } from "zod";

const emailRequestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional(),
  message: z.string().min(1),
});

const stringTypes = [
  { name: "typescript", required: "string", optional: "string?" },
  { name: "rust (also java!)", required: "String", optional: "Option<String>" },
  { name: "zig", required: "*const [_:0]u8", optional: "?*const [_:0]u8" },
  { name: "gleam", required: "String", optional: "Option(String)" },
  { name: "ocaml", required: "String", optional: "String option" },
];

export function ContactForm() {
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      company: "",
      message: "",
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: emailRequestSchema.refine(
        ({ email, company }) => email !== company,
        "if you have no company, just leave the company field blank!",
      ),
    },
    onSubmit: ({ value }) => {
      fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name: value.name,
          email: value.email,
          company: value.company,
          message: value.message,
        }),
      })
        .then((res) => {
          if (!res.ok) {
            console.error("failed to submit contact form response");
            return;
          }
          return res.text();
        })
        .then((data) => {
          console.debug(data);
        });
    },
  });

  const [stringType] = useState(() => {
    return stringTypes[Math.floor(Math.random() * stringTypes.length)];
  });
  console.log(`displaying string types like ${stringType.name}`);

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        event.stopPropagation();
        await form.handleSubmit();
        form.reset();
      }}
    >
      <h3 className="font-bold text-xl text-tokyonight-yellow">Contact Me</h3>
      <div className="flex flex-row gap-2 pt-2 w-full">
        <form.Field
          name="name"
          validators={{
            onChange: emailRequestSchema.shape.name,
          }}
          children={(field) => (
            <div className="w-full">
              <label>Name:</label>
              <input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                onBlur={field.handleBlur}
                placeholder={stringType.required}
                className="bg-tokyonight-background text-tokyonight-foreground placeholder-tokyonight-foreground-dark rounded-md p-2 w-full border border-tokyonight-foreground-dark"
                required
              />
              <small className="text-sm text-tokyonight-red">
                {field.state.meta.errors.join(", ")}
              </small>
            </div>
          )}
        />
        <form.Field
          name="company"
          validators={{
            onChange: emailRequestSchema.shape.company,
          }}
          children={(field) => (
            <div className="w-full">
              <label>Company:</label>
              <input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                onBlur={field.handleBlur}
                placeholder={stringType.optional}
                className="bg-tokyonight-background text-tokyonight-foreground placeholder-tokyonight-foreground-dark rounded-md p-2 w-full border border-tokyonight-foreground-dark"
              />
              <small className="text-sm text-tokyonight-red">
                {field.state.meta.errors.join(", ")}
              </small>
            </div>
          )}
        />
      </div>
      <form.Field
        name="email"
        validators={{
          onChange: emailRequestSchema.shape.email,
        }}
        children={(field) => (
          <div className="pt-2 w-full">
            <label>Email:</label>
            <input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.currentTarget.value)}
              onBlur={field.handleBlur}
              placeholder={stringType.required}
              className="bg-tokyonight-background text-tokyonight-foreground placeholder-tokyonight-foreground-dark rounded-md p-2 w-full border border-tokyonight-foreground-dark"
            />
            <small className="text-sm text-tokyonight-red">
              {field.state.meta.errors.join(", ")}
            </small>
          </div>
        )}
      />
      <form.Field
        name="message"
        validators={{
          onChange: emailRequestSchema.shape.message,
        }}
        children={(field) => (
          <div className="pt-2 w-full">
            <label>Message:</label>
            <textarea
              value={field.state.value}
              onChange={(e) => field.handleChange(e.currentTarget.value)}
              onBlur={field.handleBlur}
              placeholder={stringType.required}
              className="bg-tokyonight-background text-tokyonight-foreground placeholder-tokyonight-foreground-dark rounded-md p-2 w-full resize-y border border-tokyonight-foreground-dark"
            />
            <small className="text-sm text-tokyonight-red">
              {field.state.meta.errors.join(", ")}
            </small>
          </div>
        )}
      />
      <form.Subscribe
        selector={({ isSubmitting, canSubmit }) => {
          return { isSubmitting, canSubmit };
        }}
        children={({ isSubmitting, canSubmit }) => {
          if (isSubmitting) {
            return (
              <button
                type="submit"
                disabled
                className="bg-tokyonight-foreground-dark text-tokyonight-background"
              >
                Submitting...
              </button>
            );
          }

          return (
            <button
              type="submit"
              disabled={!canSubmit}
              className="bg-tokyonight-yellow active:bg-tokyonight-yellow-bright text-tokyonight-background-dark disabled:bg-tokyonight-foreground-dark disabled:text-tokyonight-background p-2 mt-2 rounded-md"
            >
              Submit
            </button>
          );
        }}
      />
    </form>
  );
}
