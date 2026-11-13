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

const getOrganizerEventsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(["all", "upcoming", "past"]).default("all"),
  sort: z
    .enum(["dateTime", "-dateTime", "createdAt", "-createdAt", "title", "-title"])
    .default("-createdAt"),
});

const getEventBookingsQuerySchema = z.object({
  status: z.enum(["all", "booked", "cancelled"]).default("all"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export {
  createEventSchema,
  updateEventSchema,
  getOrganizerEventsQuerySchema,
  getEventBookingsQuerySchema,
};
