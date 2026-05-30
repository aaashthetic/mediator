import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { sql } from 'drizzle-orm';
import { db } from './src/config/db.js';
import { clerkMiddleware } from '@clerk/express';
import doctorRouter from './src/routes/doctorRouter.js';
import patientRouter from './src/routes/patientRouter.js';
import appointmentRouter from './src/routes/appointmentRouter.js';
import patientDocumentRouter from './src/routes/patientDocumentRouter.js';
import scheduleRouter from './src/routes/scheduleRouter.js';

const app = express();
const port = process.env.PORT || 8080;

// Middlewares
app.use(express.json());
app.use(cors({ 
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(clerkMiddleware());

// Routes
/*app.get("/api/test-db", async (req, res) => {
    try {
        // Execute a basic query using your active connection pool
        const result = await db.execute(sql`SELECT NOW();`);
        
        res.status(200).json({
            status: "success",
            message: "Connected to NeonDB successfully!",
            timestamp: result.rows || result
        });
    } catch (error) {
        console.error("Database connection error stack:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to connect to NeonDB",
            error: error.message || error
        });
    }
});*/



app.use("/api/doctors", doctorRouter);
app.use("/api/patients", patientRouter);
app.use("/api/appointments", appointmentRouter);
app.use("/api/documents", patientDocumentRouter);
app.use("/api/schedule", scheduleRouter);
app.get("/api/home", (req, res) => {
    res.json({ message: "Welcome to the Mediator API!" });
});

// Server running
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
