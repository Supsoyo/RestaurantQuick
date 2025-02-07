import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertOrderSchema } from "@shared/schema";

export function registerRoutes(app: Express) {
  const server = createServer(app);

  // Get all menu items
  app.get("/api/menu", async (_req, res) => {
    const items = await storage.getMenuItems();
    res.json(items);
  });

  // Get a specific menu item
  app.get("/api/menu/:id", async (req, res) => {
    const item = await storage.getMenuItem(Number(req.params.id));
    if (!item) {
      res.status(404).json({ message: "Menu item not found" });
      return;
    }
    res.json(item);
  });

  // Create a new order
  app.post("/api/orders", async (req, res) => {
    const result = insertOrderSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid order data" });
      return;
    }

    const table = await storage.getTable(result.data.tableId);
    if (!table) {
      res.status(404).json({ message: "Table not found" });
      return;
    }

    const order = await storage.createOrder(result.data);
    res.status(201).json(order);
  });

  // Get order status
  app.get("/api/orders/:id", async (req, res) => {
    const order = await storage.getOrder(Number(req.params.id));
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    const items = await storage.getOrderItems(order.id);
    res.json({ ...order, items });
  });

  return server;
}
