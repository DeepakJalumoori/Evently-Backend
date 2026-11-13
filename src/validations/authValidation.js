import { z } from "zod";

// bcrypt truncates input at 72 UTF-8 bytes regardless of character count.
// For registration, we strictly enforce this byte limit so new accounts never rely
// on silent truncation.
const registrationPasswordSchema = z
  .string()
  .min(6, { message: "Password must be at least 6 characters." })
  .refine((val) => Buffer.byteLength(val, "utf8") <= 72, {
    message: "Password must not exceed 72 bytes.",
  });

// For login, we enforce the minimum length but omit the 72-byte ceiling so existing
// users with legacy passwords (> 72 bytes) can authenticate via bcrypt truncation.
const loginPasswordSchema = z
  .string()
  .min(6, { message: "Password must be at least 6 characters." });

const registrationSchema = z.object({
  name: z.string().min(3).max(35),
  email: z.string().email().max(254),
  password: registrationPasswordSchema,
  role: z.enum(["organizer", "attendee"]),
});

const loginSchema = z.object({
  email: z.string().email().max(254),
  password: loginPasswordSchema,
});

export { registrationSchema, loginSchema };
