const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;
const paypalRoutes = require("./paypalRoutes");

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173"
}));
app.use(express.json({ limit: "10kb" }));
app.use("/api", paypalRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "PayGuard AI API",
    environment: "development"
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`PayGuard AI API running at http://localhost:${PORT}`);
});
