import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import AuthRoutes from "./Routes/AuthRoute.js";
import MusicRoute from "./Routes/MusicRoute.js";
import ArtistRoute from "./Routes/ArtistRoute.js";
import SearchRoute from "./Routes/SearchRoute.js";
import AnalyticsRoute from "./Routes/Analytics.Route.js";
import LikesRoute from "./Routes/Likes.Route.js";
import SubscriptionRoute from "./Routes/Subscription.Route.js";
import { errorHandler } from "./Middlewares/error.middleware.js";

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


app.use("/subscription/webhook", express.raw({ type: "application/json" }));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use("/assets", express.static(path.join(process.cwd(), "Public", "assets")));

app.use("/auth", AuthRoutes);
app.use("/artist", ArtistRoute);
app.use("/music", MusicRoute);
app.use("/search", SearchRoute);
app.use("/stream", AnalyticsRoute);
app.use("/song", LikesRoute);
app.use("/subscription", SubscriptionRoute);

app.use(errorHandler);

export { app };