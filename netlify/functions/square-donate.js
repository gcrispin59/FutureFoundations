// Square donation links API — public GET, admin POST to create links.
// Env: SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID, SQUARE_LINK_*, SQUARE_ADMIN_KEY

const SQUARE_VERSION = "2024-01-18";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function squareBaseUrl() {
  return process.env.SQUARE_ENVIRONMENT === "sandbox"
    ? "https://connect.squareupsandbox.com"
    : "https://connect.squareup.com";
}

function getTierLinks() {
  const tiers = [
    {
      id: "custom",
      label: "Choose your amount",
      amount_usd: null,
      url: process.env.SQUARE_LINK_CUSTOM,
    },
    {
      id: "supporter_5",
      label: "Supporter",
      amount_usd: 5,
      url: process.env.SQUARE_LINK_SUPPORTER_5,
    },
    {
      id: "defender_25",
      label: "Defender",
      amount_usd: 25,
      url: process.env.SQUARE_LINK_DEFENDER_25,
    },
    {
      id: "guardian_50",
      label: "Guardian",
      amount_usd: 50,
      url: process.env.SQUARE_LINK_GUARDIAN_50,
    },
    {
      id: "protector_100",
      label: "Protector",
      amount_usd: 100,
      url: process.env.SQUARE_LINK_PROTECTOR_100,
    },
  ];
  return tiers.filter((t) => t.url && t.url.trim());
}

async function createPaymentLink(body) {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!token || !locationId) {
    throw new Error("Square credentials not configured on server");
  }

  const amountCents = Math.round(Number(body.amount_usd) * 100);
  if (!amountCents || amountCents < 100) {
    throw new Error("amount_usd must be at least 1");
  }

  const name = body.name || `Donation — Future Foundations PAC ($${amountCents / 100})`;
  const redirectUrl =
    body.redirect_url ||
    process.env.SQUARE_DONATE_REDIRECT_URL ||
    "https://futurefoundationspac.org/donate/thank-you";

  const payload = {
    idempotency_key: crypto.randomUUID(),
    description: body.description || "Future Foundations PAC donation",
    quick_pay: {
      location_id: locationId,
      name,
      price_money: { amount: amountCents, currency: "USD" },
    },
    checkout_options: {
      redirect_url: redirectUrl,
      merchant_support_email:
        process.env.SQUARE_SUPPORT_EMAIL || "info@futurefoundationspac.org",
    },
    payment_note: "PAC civic education donation — Future Foundations PAC",
  };

  const response = await fetch(
    `${squareBaseUrl()}/v2/online-checkout/payment-links`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Square-Version": SQUARE_VERSION,
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.errors?.[0]?.detail || JSON.stringify(data));
  }
  return data.payment_link;
}

export default async function handler(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (request.method === "GET") {
      const tiers = getTierLinks();
      return new Response(
        JSON.stringify({
          provider: "square",
          dashboard: "https://app.squareup.com/dashboard",
          tiers,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (request.method === "POST") {
      const adminKey = request.headers.get("x-admin-key");
      if (!process.env.SQUARE_ADMIN_KEY || adminKey !== process.env.SQUARE_ADMIN_KEY) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const body = await request.json();
      const paymentLink = await createPaymentLink(body);
      return new Response(JSON.stringify({ payment_link: paymentLink }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
