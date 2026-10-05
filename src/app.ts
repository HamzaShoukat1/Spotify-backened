import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import AuthRoutes from "./Routes/AuthRoute.js";
import { errorHandler } from "./Middlewares/error.middleware.js";
// import ProductRoutes from "./Routes/ProductRoutes.js";
// import CartRoutes from "./Routes/CartRoutes.js";
// import paymentRoutes from "./Routes/paymentRoutes.js";
// import OrdersRoutes from "./Routes/OrderRoutes.js";
// import ContactRoutes from "./Routes/ContactRoute.js";
// import ReviewRoutes from "./Routes/ReviewRoutes.js";
// import uploadRoutes from "./Routes/uploadRoutes.js";
// import StatsRoutes from "./Routes/State.Routes.js";
// import { apiLimiter } from "./Middlewares/rate.Limitter.js";
import ArtistRoute from "./Routes/ArtistRoute.js"

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

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);






app.use(
  express.json({
    limit: "16kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);


/*
|--------------------------------------------------------------------------
| Static Files
|--------------------------------------------------------------------------
*/

app.use(
  "/assets",
  express.static(
    path.join(process.cwd(), "Public", "assets")
  )
);


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use("/auth", AuthRoutes);
app.use("/artist", ArtistRoute)

// app.use("/product", ProductRoutes);

// app.use("/cart", CartRoutes);

// app.use("/AllOrders", OrdersRoutes);

// app.use("/order", OrdersRoutes);

// app.use("/review", ReviewRoutes);

// app.use("/contact", ContactRoutes);

// app.use("/dashboard", StatsRoutes);

// app.use("/upload", uploadRoutes);




// app.get("/", (_req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "TechTribe backend is running",
//     environment: process.env.NODE_ENV || "development",
//   });
// });



app.use(errorHandler);


export { app };