import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertTableOrderSchema, insertFeedbackSchema, insertRestaurantSchema } from "@shared/schema";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export function registerRoutes(app: Express) {
  const server = createServer(app);

  // Auth routes
  app.get("/api/auth/login", (_req, res) => {
    // Add connect.sid to the cookie to maintain session
    res.cookie('connect.sid', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax'
    });
    res.redirect(`https://replit.com/auth_with_repl_site?domain=${process.env.REPLIT_DOMAIN}`);
  });

  app.get("/api/auth/callback", (req, res) => {
    // Get user data from Replit auth
    const userData = req.headers["x-replit-user-id"] && {
      id: req.headers["x-replit-user-id"] as string,
      name: req.headers["x-replit-user-name"] as string,
      profileImage: req.headers["x-replit-user-profile-image"] as string,
    };

    if (!userData) {
      console.error("Authentication failed - No user data received");
      res.redirect("/login?error=auth_failed");
      return;
    }

    // Set session data
    if (req.session) {
      req.session.user = userData;
    }

    res.redirect("/");
  });

  app.get("/api/auth/user", (req, res) => {
    const userData = req.headers["x-replit-user-id"] && {
      id: req.headers["x-replit-user-id"] as string,
      name: req.headers["x-replit-user-name"] as string,
      profileImage: req.headers["x-replit-user-profile-image"] as string,
    };

    if (!userData) {
      res.status(401).json({ user: null, error: "Not authenticated" });
      return;
    }

    res.json({ user: userData });
  });

  // Restaurant routes
  app.get("/api/restaurants", async (_req, res) => {
    const restaurants = await storage.getRestaurants();
    res.json(restaurants);
  });

  app.get("/api/restaurants/:id", async (req, res) => {
    const restaurant = await storage.getRestaurant(Number(req.params.id));
    if (!restaurant) {
      res.status(404).json({ message: "Restaurant not found" });
      return;
    }
    res.json(restaurant);
  });

  // Get menu items for a specific restaurant
  app.get("/api/restaurants/:restaurantId/menu", async (req, res) => {
    const items = await storage.getMenuItems(Number(req.params.restaurantId));
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
        currency: "ils", // Changed to Israeli Shekel
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

  // Table Orders API
  app.post("/api/table-orders", async (req, res) => {
    try {
      const result = insertTableOrderSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ message: "Invalid table order data", errors: result.error.errors });
        return;
      }

      const tableOrder = await storage.createTableOrder(result.data);
      res.status(201).json(tableOrder);
    } catch (error) {
      console.error("Error creating table order:", error);
      res.status(500).json({ message: "Failed to create table order" });
    }
  });

  app.get("/api/table-orders/:tableId", async (req, res) => {
    try {
      const tableOrders = await storage.getTableOrdersByTableId(Number(req.params.tableId));
      res.json(tableOrders);
    } catch (error) {
      console.error("Error fetching table orders:", error);
      res.status(500).json({ message: "Failed to fetch table orders" });
    }
  });

  app.patch("/api/table-orders/:id", async (req, res) => {
    try {
      const result = insertTableOrderSchema.partial().safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ message: "Invalid update data", errors: result.error.errors });
        return;
      }

      const tableOrder = await storage.updateTableOrder(Number(req.params.id), result.data);
      res.json(tableOrder);
    } catch (error) {
      console.error("Error updating table order:", error);
      res.status(500).json({ message: "Failed to update table order" });
    }
  });

  app.delete("/api/table-orders/:id", async (req, res) => {
    try {
      await storage.deleteTableOrder(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting table order:", error);
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

  // Get feedback by restaurant ID
  app.get("/api/restaurants/:restaurantId/feedback", async (req, res) => {
    const feedback = await storage.getFeedbackByRestaurantId(Number(req.params.restaurantId));
    res.json(feedback);
  });

  return server;
}