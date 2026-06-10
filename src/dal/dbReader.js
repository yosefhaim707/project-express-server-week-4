import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseJsonToObject, parseObjectToJson } from "../utils/dataParse.js";

const databaseFiles = {
  users: "users.db.json",
  products: "products.db.json",
  orders: "orders.db.json",
};

const getDatabaseFolder = () => {
  return path.resolve(process.cwd(), process.env.DB_BASE_PATH || "./db");
};

const getFilePath = (tableName) => {
  return path.join(getDatabaseFolder(), databaseFiles[tableName]);
};

const readTable = async (tableName) => {
  const filePath = getFilePath(tableName);
  const json = await readFile(filePath, "utf8");

  return parseJsonToObject(json);
};

const saveTable = async (tableName, data) => {
  await mkdir(getDatabaseFolder(), { recursive: true });
  await writeFile(getFilePath(tableName), parseObjectToJson(data));
};

export const readUsers = async () => {
  const data = await readTable("users");
  return data.users;
};

export const saveUsers = async (users) => {
  await saveTable("users", { users });
};

export const readProducts = async () => {
  const data = await readTable("products");
  return data.products;
};

export const saveProducts = async (products) => {
  await saveTable("products", { products });
};

export const readOrders = async () => {
  const data = await readTable("orders");
  return data.orders;
};

export const saveOrders = async (orders) => {
  await saveTable("orders", { orders });
};
