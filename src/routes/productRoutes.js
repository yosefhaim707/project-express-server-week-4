import { Router } from "express";
import { readProducts } from "../dal/dbReader.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createHttpError } from "../utils/httpError.js";

const router = Router();

const formatProduct = (product) => {
  return {
    ...product,
    inStock: product.stock > 0,
  };
};

router.get(
  "/",
  asyncHandler(async (request, response) => {
    const { search, inStock, maxPrice } = request.query;
    let products = await readProducts();

    if (search) {
      const searchText = String(search).toLowerCase();
      products = products.filter((product) => {
        return product.name.toLowerCase().includes(searchText);
      });
    }

    if (inStock !== undefined) {
      if (inStock !== "true" && inStock !== "false") {
        throw createHttpError(400, "inStock must be true or false.");
      }

      const shouldBeInStock = inStock === "true";
      products = products.filter((product) => {
        return (product.stock > 0) === shouldBeInStock;
      });
    }

    if (maxPrice !== undefined) {
      const maxPriceNumber = Number(maxPrice);

      if (Number.isNaN(maxPriceNumber)) {
        throw createHttpError(400, "maxPrice must be a number.");
      }

      products = products.filter((product) => product.price <= maxPriceNumber);
    }

    response.json({
      count: products.length,
      products: products.map(formatProduct),
    });
  })
);

export default router;
