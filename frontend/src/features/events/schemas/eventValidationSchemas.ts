import { z } from "zod";

export const eventCategories = [
  { value: "tech", label: "Technology" },
  { value: "music", label: "Live Music" },
  { value: "sports", label: "Sports" },
  { value: "workshop", label: "Workshop" },
  { value: "other", label: "Other / Community" },
] as const;

export const createEventFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title cannot exceed 100 characters"),
    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters"),
    category: z.enum(["music", "tech", "sports", "workshop", "other"], {
      required_error: "Please select an event category",
    }),
    venue: z
      .string()
      .trim()
      .min(3, "Venue must be at least 3 characters"),
    city: z
      .string()
      .trim()
      .min(3, "City must be at least 3 characters"),
    date: z.string().min(1, "Please select an event date"),
    time: z.string().min(1, "Please select an event time"),
    price: z
      .union([z.string(), z.number()])
      .refine(
        (val) => (typeof val === "string" ? val.trim().length > 0 : !Number.isNaN(val)),
        { message: "Ticket price is required" }
      )
      .refine(
        (val) => !Number.isNaN(Number(val)),
        { message: "Price must be a valid number" }
      )
      .refine(
        (val) => Number(val) >= 0,
        { message: "Price must be 0 or greater" }
      )
      .transform((val) => Number(val)),
    capacity: z
      .union([z.string(), z.number()])
      .refine(
        (val) => (typeof val === "string" ? val.trim().length > 0 : !Number.isNaN(val)),
        { message: "Capacity is required" }
      )
      .refine(
        (val) => !Number.isNaN(Number(val)) && Number.isInteger(Number(val)),
        { message: "Capacity must be a whole number" }
      )
      .refine(
        (val) => Number(val) >= 1,
        { message: "Capacity must be at least 1 seat" }
      )
      .transform((val) => Number(val)),
  })
  .superRefine((data, ctx) => {
    if (!data.date || !data.time) return;

    const [year, month, day] = data.date.split("-").map(Number);
    const [hours, minutes] = data.time.split(":").map(Number);

    if (
      Number.isNaN(year) ||
      Number.isNaN(month) ||
      Number.isNaN(day) ||
      Number.isNaN(hours) ||
      Number.isNaN(minutes)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["date"],
        message: "Invalid date or time format",
      });
      return;
    }

    // Parse local date and time in user's browser timezone
    const eventDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
    if (Number.isNaN(eventDate.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["date"],
        message: "Invalid date or time",
      });
      return;
    }

    if (eventDate.getTime() <= Date.now()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["date"],
        message: "Event date and time must be in the future",
      });
    }
  });

export type CreateEventFormData = z.infer<typeof createEventFormSchema>;

export function createEditEventFormSchema(minCapacity: number = 1) {
  return createEventFormSchema.superRefine((data, ctx) => {
    if (data.capacity < minCapacity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["capacity"],
        message: `Capacity cannot be lower than ${minCapacity} (already booked seats)`,
      });
    }
  });
}

export type EditEventFormData = CreateEventFormData;
