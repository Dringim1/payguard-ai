const express = require("express");
const { randomUUID } = require("crypto");
const { getPayPalAccessToken } = require("./paypal");

const router = express.Router();

const PAYPAL_BASE =
  process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";

// Check PayPal Sandbox connection
router.get("/paypal/status", async (req, res) => {
  try {
    await getPayPalAccessToken();

    res.json({
      connected: true,
      environment: "sandbox",
      message: "PayPal Sandbox authentication successful."
    });
  } catch (error) {
    console.error("PayPal authentication check failed:", error.message);

    res.status(502).json({
      connected: false,
      environment: "sandbox",
      message: "PayPal Sandbox authentication failed."
    });
  }
});

// Create a PayPal Sandbox order
router.post("/paypal/orders", async (req, res) => {
  const { amount } = req.body;

  if (
    typeof amount !== "string" ||
    !/^(?:0|[1-9]\d{0,5})\.\d{2}$/.test(amount) ||
    Number(amount) <= 0 ||
    Number(amount) > 10000
  ) {
    return res.status(400).json({
      error: "Enter a valid USD amount between 0.01 and 10000.00."
    });
  }

  try {
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(
      `${PAYPAL_BASE}/v2/checkout/orders`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "PayPal-Request-Id": randomUUID()
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "USD",
                value: amount
              }
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("PayPal order creation failed:", {
        status: response.status,
        name: data.name,
        message: data.message,
        debugId: data.debug_id
      });

      return res.status(502).json({
        error: "PayPal could not create the Sandbox order."
      });
    }

    const approvalLink = data.links?.find(
      link => ["payer-action", "approve"].includes(link.rel)
    );

    if (!data.id || !approvalLink?.href) {
      return res.status(502).json({
        error: "PayPal returned an incomplete order response."
      });
    }

    res.status(201).json({
      orderId: data.id,
      status: data.status,
      amount,
      currency: "USD",
      approvalUrl: approvalLink.href,
      environment: "sandbox"
    });

  } catch (error) {
    console.error("Order creation error:", error.message);

    res.status(500).json({
      error: "Unable to create the Sandbox order."
    });
  }
});

module.exports = router;