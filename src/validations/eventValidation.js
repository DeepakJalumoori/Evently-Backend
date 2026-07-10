const { z } = require("zod");

const createEventSchema = z.object({
  title: z.string().min(3).max(100),

  description: z.string().min(10),

  dateTime: z.string(),

  venue: z.string().min(3),

  city: z.string().min(3),

  capacity: z.number().min(1),

  category: z.enum(["music", "tech", "sports", "workshop", "other"]),

  price: z.number(),
});

const updateEventSchema = createEventSchema.partial();

module.exports = {
  createEventSchema,
  updateEventSchema,
};
