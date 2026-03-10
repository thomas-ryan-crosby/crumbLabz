import { NextResponse } from "next/server";
import Stripe from "stripe";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin for server-side writes
if (getApps().length === 0) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (clientEmail && privateKey) {
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  } else {
    // Fallback: use project ID only (for environments with default credentials)
    initializeApp({ projectId });
  }
}

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key);
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET not configured" }, { status: 500 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const db = getFirestore();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { projectId, contactId } = session.metadata || {};

        if (projectId) {
          await db.collection("projects").doc(projectId).update({
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            paymentStatus: "retainer_paid",
            updatedAt: new Date(),
          });

          // Log activity
          if (contactId) {
            await db.collection("contacts").doc(contactId).collection("activity").add({
              type: "note",
              description: "Payment received — retainer paid and subscription started",
              actor: "System",
              createdAt: new Date(),
            });
          }
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as unknown as { subscription: string | null }).subscription;

        if (subscriptionId) {
          // Find project by subscription ID
          const projectsSnap = await db
            .collection("projects")
            .where("stripeSubscriptionId", "==", subscriptionId)
            .get();

          for (const doc of projectsSnap.docs) {
            await doc.ref.update({
              paymentStatus: "active",
              updatedAt: new Date(),
            });
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as unknown as { subscription: string | null }).subscription;

        if (subscriptionId) {
          const projectsSnap = await db
            .collection("projects")
            .where("stripeSubscriptionId", "==", subscriptionId)
            .get();

          for (const doc of projectsSnap.docs) {
            await doc.ref.update({
              paymentStatus: "past_due",
              updatedAt: new Date(),
            });
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const projectsSnap = await db
          .collection("projects")
          .where("stripeSubscriptionId", "==", subscription.id)
          .get();

        for (const doc of projectsSnap.docs) {
          await doc.ref.update({
            paymentStatus: "cancelled",
            updatedAt: new Date(),
          });
        }
        break;
      }
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
