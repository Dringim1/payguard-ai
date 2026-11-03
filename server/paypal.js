const PAYPAL_BASE = "https://api-m.sandbox.paypal.com";

let cachedToken = null;
let tokenExpiresAt = 0;

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error("PayPal Sandbox credentials are not configured.");
  }

  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const credentials = Buffer
    .from(`${clientId}:${clientSecret}`)
    .toString("base64");

  const response = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json"
    },
    body: "grant_type=client_credentials"
  });

  if (!response.ok) {
  cachedToken = null;
  tokenExpiresAt = 0;

  const errorData = await response.json().catch(() => ({}));

  console.error("PayPal OAuth error:", {
    status: response.status,
    name: errorData.error,
    message: errorData.error_description,
    debugId: errorData.debug_id
  });

  throw new Error("PayPal Sandbox authentication failed.");
}

  const data = await response.json();

  if (!data.access_token || !data.expires_in) {
    throw new Error("PayPal returned an invalid authentication response.");
  }

  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

  return cachedToken;
}

module.exports = { getPayPalAccessToken };
