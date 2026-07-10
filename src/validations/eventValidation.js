const { z } = require("zod");

const createEventSchema = z.object({
  title: z.string().min(3).max(100),

  description: z.string().min(10),

  date: z.string(),

  location: z.string().min(3),

  capacity: z.number().min(1),
});

const updateEventSchema = createEventSchema.partial();

module.exports = {
  createEventSchema,
  updateEventSchema,
};
