import express from "express";
import accountRoutes from "./routes/accountRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import { requireAuth } from "./middleware/authMiddleware.js";

const app = express();

app.use(express.json());

app.get("/", (request, response) => {
  response.json({
    message: "Welcome to the optical store API.",
    routes: {
      auth: ["/auth/signup", "/auth/login"],
      products: ["/products"],
      cart: ["/cart", "/cart/items"],
      account: ["/account/balance"],
      orders: ["/orders", "/orders/checkout"],
    },
  });
});

app.get("/health", (request, response) => {
  response.json({
    status: "ok",
  });
});

app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/cart", requireAuth, cartRoutes);
app.use("/account", requireAuth, accountRoutes);
app.use("/orders", requireAuth, orderRoutes);

app.use((request, response) => {
  response.status(404).json({
    error: "Route not found.",
  });
});

app.use((error, request, response, next) => {
  const statusCode = error.statusCode || error.status || 500;
  const message =
    error instanceof SyntaxError && "body" in error
      ? "Request body must be valid JSON."
      : error.message;

  response.status(statusCode).json({
    error: statusCode === 500 ? "Something went wrong on the server." : message,
  });
});

export default app;
