from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request
from app.core.dependencies import get_current_user
from app.core.database import supabase
from app.core.config import settings
from pydantic import BaseModel

router = APIRouter(prefix="/api/payments", tags=["Payments"])

# ─── Schemas ────────────────────────────────────────────

class StripePaymentRequest(BaseModel):
    invoice_id: str
    currency: str = "usd"

class SadadPaymentRequest(BaseModel):
    invoice_id: str

# ─── Helpers ────────────────────────────────────────────

def _get_stripe():
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(status_code=503, detail="Stripe not configured")
    import stripe
    stripe.api_key = settings.STRIPE_SECRET_KEY
    return stripe

def _mark_invoice_paid(invoice_id: str, gateway: str, transaction_id: str):
    supabase.table("invoice").update({
        "status":  "PAID",
        "paid_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", invoice_id).execute()

    invoice = supabase.table("invoice").select("client_id, total_amount, currency").eq("id", invoice_id).single().execute()
    if invoice.data:
        supabase.table("payment").insert({
            "invoice_id":             invoice_id,
            "client_id":              invoice.data["client_id"],
            "amount":                 invoice.data["total_amount"],
            "currency":               invoice.data["currency"],
            "gateway":                gateway,
            "gateway_transaction_id": transaction_id,
            "status":                 "COMPLETED",
            "paid_at":                datetime.now(timezone.utc).isoformat(),
        }).execute()

# ─── POST /api/payments/stripe/create ───────────────────

@router.post("/stripe/create")
async def create_stripe_payment(body: StripePaymentRequest, current_user=Depends(get_current_user)):
    invoice = (
        supabase.table("invoice")
        .select("*")
        .eq("id", body.invoice_id)
        .single()
        .execute()
    )
    if not invoice.data:
        raise HTTPException(status_code=404, detail="Invoice not found")

    inv = invoice.data
    if inv["status"] == "PAID":
        raise HTTPException(status_code=400, detail="Invoice already paid")

    stripe = _get_stripe()
    amount_cents = int(inv["total_amount"] * 100)

    payment_intent = stripe.PaymentIntent.create(
        amount=amount_cents,
        currency=body.currency.lower(),
        metadata={
            "invoice_id": body.invoice_id,
            "firm_id":    inv["firm_id"],
        },
    )

    return {
        "client_secret": payment_intent["client_secret"],
        "payment_intent_id": payment_intent["id"],
        "amount": inv["total_amount"],
        "currency": body.currency,
    }

# ─── POST /api/payments/stripe/confirm ──────────────────

@router.post("/stripe/confirm")
async def confirm_stripe_payment(payment_intent_id: str, current_user=Depends(get_current_user)):
    stripe = _get_stripe()
    intent = stripe.PaymentIntent.retrieve(payment_intent_id)

    if intent["status"] != "succeeded":
        raise HTTPException(status_code=400, detail=f"Payment not succeeded: {intent['status']}")

    invoice_id = intent["metadata"].get("invoice_id")
    if invoice_id:
        _mark_invoice_paid(invoice_id, "STRIPE", payment_intent_id)

    return {"message": "Payment confirmed", "status": intent["status"]}

# ─── POST /api/payments/sadad/initiate ──────────────────

@router.post("/sadad/initiate")
async def initiate_sadad_payment(body: SadadPaymentRequest, current_user=Depends(get_current_user)):
    invoice = (
        supabase.table("invoice")
        .select("*")
        .eq("id", body.invoice_id)
        .single()
        .execute()
    )
    if not invoice.data:
        raise HTTPException(status_code=404, detail="Invoice not found")

    inv = invoice.data
    if inv["status"] == "PAID":
        raise HTTPException(status_code=400, detail="Invoice already paid")

    # Sadad bill reference = invoice number (client uses this in their bank app)
    bill_reference = inv["invoice_number"]

    # TODO: Call Sadad API to register the bill and get a payment reference
    # For now, return the reference so the client can pay via their bank

    return {
        "bill_reference": bill_reference,
        "amount":         inv["total_amount"],
        "currency":       inv["currency"],
        "instructions":   (
            f"Use reference '{bill_reference}' to pay SAR {inv['total_amount']:.2f} "
            "through your bank's SADAD service."
        ),
    }

# ─── POST /api/payments/webhook ─────────────────────────

@router.post("/webhook")
async def payment_webhook(request: Request):
    """Handle incoming webhooks from Stripe and Sadad."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    if sig_header and settings.STRIPE_WEBHOOK_SECRET:
        stripe = _get_stripe()
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid Stripe webhook signature")

        if event["type"] == "payment_intent.succeeded":
            intent = event["data"]["object"]
            invoice_id = intent["metadata"].get("invoice_id")
            if invoice_id:
                _mark_invoice_paid(invoice_id, "STRIPE", intent["id"])

        return {"received": True}

    # Sadad webhook (structure varies by provider — adapt as needed)
    try:
        data = await request.json()
        invoice_number = data.get("billNumber") or data.get("bill_number")
        transaction_id = data.get("transactionId") or data.get("transaction_id")
        status = data.get("status", "").upper()

        if status == "PAID" and invoice_number:
            invoice = (
                supabase.table("invoice")
                .select("id")
                .eq("invoice_number", invoice_number)
                .single()
                .execute()
            )
            if invoice.data:
                _mark_invoice_paid(invoice.data["id"], "SADAD", transaction_id or invoice_number)
    except Exception:
        pass

    return {"received": True}
