import express from "express";
import cors from "cors";

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

const app = express();

app.use(express.json());

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow server-to-server requests and configured frontend origins.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Redirect root URL to Swagger
app.get("/", (req, res) => {
  res.redirect("/api-docs");
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// User Routes
app.use("/api/auth", authRoutes);

// Event Routes
app.use("/api/events", eventRoutes);

// Booking Routes
app.use("/api/booking", bookingRoutes);

export default app;
