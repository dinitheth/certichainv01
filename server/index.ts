import express from "express";
import cors from "cors";
import { db } from "./db";
import { institutionRegistrations } from "../shared/schema";
import { eq } from "drizzle-orm";

const app = express();
app.use(cors());
app.use(express.json());

// Get all registration requests
app.get("/api/registrations", async (req, res) => {
  try {
    const registrations = await db.select().from(institutionRegistrations).orderBy(institutionRegistrations.createdAt);
    res.json(registrations);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    res.status(500).json({ error: "Failed to fetch registrations" });
  }
});

// Get pending registration requests
app.get("/api/registrations/pending", async (req, res) => {
  try {
    const registrations = await db
      .select()
      .from(institutionRegistrations)
      .where(eq(institutionRegistrations.status, "pending"))
      .orderBy(institutionRegistrations.createdAt);
    res.json(registrations);
  } catch (error) {
    console.error("Error fetching pending registrations:", error);
    res.status(500).json({ error: "Failed to fetch pending registrations" });
  }
});

// Submit a new registration request
app.post("/api/registrations", async (req, res) => {
  try {
    const { name, email, website, location, description, walletAddress } = req.body;
    
    if (!name || !email || !website || !location || !description || !walletAddress) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if wallet already registered
    const existing = await db
      .select()
      .from(institutionRegistrations)
      .where(eq(institutionRegistrations.walletAddress, walletAddress.toLowerCase()));

    if (existing.length > 0) {
      return res.status(400).json({ error: "This wallet has already submitted a registration request" });
    }

    const [registration] = await db
      .insert(institutionRegistrations)
      .values({
        name,
        email,
        website,
        location,
        description,
        walletAddress: walletAddress.toLowerCase(),
      })
      .returning();

    res.status(201).json(registration);
  } catch (error) {
    console.error("Error creating registration:", error);
    res.status(500).json({ error: "Failed to create registration" });
  }
});

// Update registration status (approve/reject)
app.patch("/api/registrations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const [updated] = await db
      .update(institutionRegistrations)
      .set({ status, reviewedAt: new Date() })
      .where(eq(institutionRegistrations.id, parseInt(id)))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Registration not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating registration:", error);
    res.status(500).json({ error: "Failed to update registration" });
  }
});

// Check registration status by wallet address
app.get("/api/registrations/check/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const [registration] = await db
      .select()
      .from(institutionRegistrations)
      .where(eq(institutionRegistrations.walletAddress, walletAddress.toLowerCase()));

    if (!registration) {
      return res.json({ status: "not_found" });
    }

    res.json(registration);
  } catch (error) {
    console.error("Error checking registration:", error);
    res.status(500).json({ error: "Failed to check registration" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
});