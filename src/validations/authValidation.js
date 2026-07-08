const { z } = require("zod");

const registrationSchema = z.object({
  name: z.string().min(3).max(35),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["organizer", "attendee"]),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

module.exports = {
  registrationSchema,
  loginSchema,
};
