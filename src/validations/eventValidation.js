import { z } from "zod";

const futureDateTimeSchema = z
  .iso.datetime({ offset: true })
  .refine((value) => new Date(value).getTime() > Date.now(), {
    message: "Event date and time must be in the future",
  });

const createEventSchema = z.object({
  title: z.string().trim().min(3).max(100),
  description: z.string().trim().min(10),
  dateTime: futureDateTimeSchema,
  venue: z.string().trim().min(3),
  city: z.string().trim().min(3),
  capacity: z.number().int().min(1),
  category: z.enum(["music", "tech", "sports", "workshop", "other"]),
  price: z.number().min(0),
});

const updateEventSchema = createEventSchema.partial();

export { createEventSchema, updateEventSchema };
