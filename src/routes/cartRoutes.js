import { Router } from "express";
import { readProducts, saveUsers } from "../dal/dbReader.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { findProductById, getCartDetails } from "../utils/cartUtils.js";
import { createHttpError } from "../utils/httpError.js";

const router = Router();

const readPositiveInteger = (value, fieldName) => {
  const number = Number(value);

  if (!Number.isInteger(number) || number <= 0) {
    throw createHttpError(400, `${fieldName} must be a positive whole number.`);
  }

  return number;
};

router.get(
  "/",
  asyncHandler(async (request, response) => {
    const products = await readProducts();
    const cart = getCartDetails(request.user.cart, products);

    response.json({ cart });
  })
);

router.post(
  "/items",
  asyncHandler(async (request, response) => {
    const productId = readPositiveInteger(request.body.productId, "productId");
    const quantity = readPositiveInteger(request.body.quantity || 1, "quantity");

    const products = await readProducts();
    const product = findProductById(products, productId);

    if (!product) {
      throw createHttpError(404, "Product not found.");
    }

    if (product.stock <= 0) {
      throw createHttpError(400, "This product is out of stock.");
    }

    const existingCartItem = request.user.cart.find((cartItem) => {
      return cartItem.productId === productId;
    });
    const currentCartQuantity = existingCartItem ? existingCartItem.quantity : 0;

    if (currentCartQuantity + quantity > product.stock) {
      throw createHttpError(400, "Not enough stock is available for this product.");
    }

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
    } else {
      request.user.cart.push({ productId, quantity });
    }

    await saveUsers(request.users);

    response.status(201).json({
      message: "Product added to cart.",
      cart: getCartDetails(request.user.cart, products),
    });
  })
);

router.delete(
  "/items/:productId",
  asyncHandler(async (request, response) => {
    const productId = readPositiveInteger(request.params.productId, "productId");
    const itemExists = request.user.cart.some((cartItem) => {
      return cartItem.productId === productId;
    });

    if (!itemExists) {
      throw createHttpError(404, "This product is not in the cart.");
    }

    request.user.cart = request.user.cart.filter((cartItem) => {
      return cartItem.productId !== productId;
    });

    await saveUsers(request.users);

    const products = await readProducts();

    response.json({
      message: "Product removed from cart.",
      cart: getCartDetails(request.user.cart, products),
    });
  })
);

export default router;
