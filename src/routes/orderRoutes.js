import { Router } from "express";
import { randomUUID } from "node:crypto";
import {
  readOrders,
  readProducts,
  saveOrders,
  saveProducts,
  saveUsers,
} from "../dal/dbReader.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { findProductById, getCartDetails, roundMoney } from "../utils/cartUtils.js";
import { createHttpError } from "../utils/httpError.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (request, response) => {
    const orders = await readOrders();
    const userOrders = orders.filter((order) => order.userId === request.user.id);

    response.json({
      count: userOrders.length,
      orders: userOrders,
    });
  })
);

router.post(
  "/checkout",
  asyncHandler(async (request, response) => {
    if (request.user.cart.length === 0) {
      throw createHttpError(400, "Cannot checkout with an empty cart.");
    }

    const products = await readProducts();

    for (const cartItem of request.user.cart) {
      const product = findProductById(products, cartItem.productId);

      if (!product) {
        throw createHttpError(400, "One of the products in the cart no longer exists.");
      }

      if (product.stock < cartItem.quantity) {
        throw createHttpError(400, `${product.name} does not have enough stock.`);
      }
    }

    const cart = getCartDetails(request.user.cart, products);

    if (request.user.balance < cart.total) {
      throw createHttpError(400, "Not enough money in balance to complete this order.");
    }

    for (const cartItem of request.user.cart) {
      const product = findProductById(products, cartItem.productId);
      product.stock -= cartItem.quantity;
    }

    const order = {
      id: randomUUID(),
      userId: request.user.id,
      items: cart.items,
      total: cart.total,
      createdAt: new Date().toISOString(),
    };

    const orders = await readOrders();
    orders.push(order);

    request.user.balance = roundMoney(request.user.balance - cart.total);
    request.user.cart = [];

    await saveProducts(products);
    await saveOrders(orders);
    await saveUsers(request.users);

    response.status(201).json({
      message: "Checkout completed successfully.",
      order,
      balance: request.user.balance,
    });
  })
);

export default router;
