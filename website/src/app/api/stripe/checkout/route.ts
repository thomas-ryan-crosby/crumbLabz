import { NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key);
}

export async function POST(request: Request) {
  try {
    const {
      projectId,
      contactId,
      contactName,
      contactEmail,
      companyName,
      projectName,
      retainerAmount,
      monthlyRate,
    } = await request.json();

    if (!projectId || !contactEmail || !retainerAmount || !monthlyRate) {
      return NextResponse.json(
        { error: "projectId, contactEmail, retainerAmount, and monthlyRate are required" },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Find or create Stripe customer
    const existingCustomers = await stripe.customers.list({
      email: contactEmail,
      limit: 1,
    });

    let customer: Stripe.Customer;
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: contactEmail,
        name: contactName,
        metadata: {
          contactId,
          companyName,
        },
      });
    }

    // Create a price for the monthly subscription
    const product = await stripe.products.create({
      name: `${projectName} — Monthly Maintenance & Development`,
      metadata: { projectId, contactId },
    });

    const recurringPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(monthlyRate * 100), // cents
      currency: "usd",
      recurring: { interval: "month" },
    });

    // Build checkout session with retainer (one-time) + subscription
    const baseUrl = request.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        // One-time retainer as an invoice item added to the first subscription invoice
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${projectName} — Project Retainer`,
            },
            unit_amount: Math.round(retainerAmount * 100),
          },
          quantity: 1,
        },
        // Monthly recurring
        {
          price: recurringPrice.id,
          quantity: 1,
        },
      ],
      metadata: {
        projectId,
        contactId,
        retainerAmount: retainerAmount.toString(),
        monthlyRate: monthlyRate.toString(),
      },
      success_url: `${baseUrl}/admin/contacts?payment=success&project=${projectId}`,
      cancel_url: `${baseUrl}/admin/contacts?payment=cancelled&project=${projectId}`,
    });

    return NextResponse.json({
      checkoutUrl: session.url,
      customerId: customer.id,
      sessionId: session.id,
    });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    const message = err instanceof Error ? err.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
