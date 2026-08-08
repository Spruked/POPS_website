import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, ExternalLink, Lock, MonitorDown, ShieldCheck } from "lucide-react";
import PageSeo from "../components/PageSeo";
import { formatCurrency, useCart } from "../cart";

const squareCheckoutUrl = import.meta.env.VITE_SQUARE_CHECKOUT_URL as string | undefined;

export default function CheckoutPage() {
  const { clearCart, items, subtotal } = useCart();
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasWindowsApp = items.some((item) => item.id === "guardian");

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      note: String(formData.get("note") || ""),
      items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
    };

    try {
      const response = await fetch("/api/checkout/square", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const square = await response.json() as { checkout_url?: string };
        if (square.checkout_url) {
          clearCart();
          window.location.assign(square.checkout_url);
          return;
        }
      }

      const errorText = await response.text();
      if (!squareCheckoutUrl) {
        setNotice(errorText || "Square checkout is not configured yet. Add your Square credentials to the backend environment.");
        return;
      }
    } catch (error) {
      if (!squareCheckoutUrl) {
        setNotice(error instanceof Error ? error.message : "Square checkout could not be reached.");
        return;
      }
    } finally {
      setIsSubmitting(false);
    }

    if (!squareCheckoutUrl) {
      setNotice("Square checkout is ready to connect. Add SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID to the backend environment.");
      return;
    }

    clearCart();
    window.location.assign(squareCheckoutUrl);
  }

  return (
    <div className="commerce-page">
      <PageSeo
        title="Checkout | POPS"
        description="Complete your POPS purchase through Square and receive Windows app download or membership instructions."
        path="/checkout"
      />

      <section className="section">
        <div className="container">
          <div className="commerce-heading">
            <Link to="/cart" className="inline-link">
              <ArrowLeft size={14} />
              Back to Cart
            </Link>
            <h1>Checkout</h1>
            <p>
              Review your contact details, then continue to Square for secure payment. The POPS desktop app is a separate Windows download, not a WSL application.
            </p>
          </div>

          <div className="checkout-layout">
            <form className="checkout-form" onSubmit={handleCheckout}>
              <div className="checkout-panel">
                <div className="checkout-panel-heading">
                  <Lock size={20} />
                  <div>
                    <h2>Contact</h2>
                    <p>Used for receipts, license delivery, and support.</p>
                  </div>
                </div>

                <div className="checkout-field-grid">
                  <div className="form-group">
                    <label htmlFor="checkout-name">Full Name</label>
                    <input id="checkout-name" name="name" autoComplete="name" required placeholder="Your name" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="checkout-email">Email Address</label>
                    <input id="checkout-email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="checkout-note">Order Note</label>
                  <input id="checkout-note" name="note" placeholder="Optional note for license or sponsorship handling" />
                </div>
              </div>

              <div className="checkout-panel">
                <div className="checkout-panel-heading">
                  <MonitorDown size={20} />
                  <div>
                    <h2>Fulfillment</h2>
                    <p>What happens after Square confirms payment.</p>
                  </div>
                </div>

                <div className="fulfillment-list">
                  {hasWindowsApp && (
                    <div className="fulfillment-item">
                      <CheckCircle size={18} />
                      <span>Windows installer and license activation instructions are delivered after payment.</span>
                    </div>
                  )}
                  <div className="fulfillment-item">
                    <CheckCircle size={18} />
                    <span>Membership and sponsorship confirmations are sent to the checkout email.</span>
                  </div>
                  <div className="fulfillment-item">
                    <ShieldCheck size={18} />
                    <span>Payment processing, tax, and receipt handling are completed by Square.</span>
                  </div>
                </div>
              </div>

              {notice && <div className="checkout-notice">{notice}</div>}

              <button type="submit" className="btn btn-primary checkout-submit" disabled={isSubmitting}>
                {isSubmitting ? "Opening Square..." : "Continue to Square"}
                <ExternalLink size={16} />
              </button>
            </form>

            <aside className="order-summary">
              <span className="mono">Square Checkout</span>
              <div className="checkout-items">
                {items.map((item) => (
                  <div className="checkout-line" key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <span>Qty {item.quantity}</span>
                    </div>
                    <strong>{formatCurrency(item.price * item.quantity)}</strong>
                  </div>
                ))}
              </div>
              <div className="summary-row">
                <span>Subtotal</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>
              <div className="summary-row muted">
                <span>Tax and processing</span>
                <strong>Square</strong>
              </div>
              <div className="summary-total">
                <span>Estimated due</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>
              <p>Square checkout is created server-side from `SQUARE_ACCESS_TOKEN` and `SQUARE_LOCATION_ID`.</p>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
