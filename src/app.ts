import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

// Import your webhook controller directly
import { handleStripeWebhook } from "./Controllers/Subscription.controller.js";

import AuthRoutes from "./Routes/AuthRoute.js";
import MusicRoute from "./Routes/MusicRoute.js";
import ArtistRoute from "./Routes/ArtistRoute.js";
import SearchRoute from "./Routes/SearchRoute.js";
import AnalyticsRoute from "./Routes/Analytics.Route.js";
import LikesRoute from "./Routes/Likes.Route.js";
import SubscriptionRoute from "./Routes/Subscription.Route.js";
import { errorHandler } from "./Middlewares/error.middleware.js";
import PlaylistRoute from "./Routes/Playlist.Route.js";

dotenv.config();

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:5173",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.post(
  "/subscription/webhook",

  express.raw({ type: "application/json", limit: "1mb" }),
  handleStripeWebhook
);

// 2. GLOBAL BODY PARSERS (For all other routes)
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use("/assets", express.static(path.join(process.cwd(), "Public", "assets")));

// 3. MOUNT REST OF ROUTERS
app.use("/auth", AuthRoutes);
app.use("/artist", ArtistRoute);
app.use("/music", MusicRoute);
app.use("/search", SearchRoute);
app.use("/stream", AnalyticsRoute);
app.use("/song", LikesRoute);
app.use("/subscription", SubscriptionRoute); 
app.use("/api", PlaylistRoute);

app.use(errorHandler);

export { app };
