import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertTableOrderSchema, insertFeedbackSchema } from "@shared/schema";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

  // Create a payment intent
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent" });
    }
  });

  // Create a new order with payment
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

  // Create a table order
  app.post("/api/table-orders", async (req, res) => {
    const result = insertTableOrderSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid table order data" });
      return;
    }

    const table = await storage.getTable(result.data.tableId);
    if (!table) {
      res.status(404).json({ message: "Table not found" });
      return;
    }

    const tableOrder = await storage.createTableOrder(result.data);
    res.status(201).json(tableOrder);
  });

  // Get table orders by table ID
  app.get("/api/table-orders/:tableId", async (req, res) => {
    const tableOrders = await storage.getTableOrdersByTableId(Number(req.params.tableId));
    res.json(tableOrders);
  });

  // Update a table order
  app.patch("/api/table-orders/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { orderDetails } = req.body;

    try {
      const updatedOrder = await storage.updateTableOrder(id, { orderDetails });
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to update table order" });
    }
  });

  // Delete a table order
  app.delete("/api/table-orders/:id", async (req, res) => {
    const id = Number(req.params.id);

    try {
      await storage.deleteTableOrder(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete table order" });
    }
  });


  // Submit feedback
  app.post("/api/feedback", async (req, res) => {
    const result = insertFeedbackSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid feedback data" });
      return;
    }

    const feedback = await storage.createFeedback(result.data);
    res.status(201).json(feedback);
  });

  // Get feedback by table ID
  app.get("/api/feedback/:tableId", async (req, res) => {
    const feedback = await storage.getFeedbackByTableId(Number(req.params.tableId));
    res.json(feedback);
  });

  return server;
}