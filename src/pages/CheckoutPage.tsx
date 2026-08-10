import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, CreditCard, Lock, MonitorDown, ShieldCheck } from "lucide-react";
import PageSeo from "../components/PageSeo";
import { formatCurrency, useCart } from "../cart";

interface SquareConfig {
  application_id: string;
  location_id: string;
  environment: "production" | "sandbox";
}

interface PayPalConfig {
  client_id: string;
  environment: "production" | "sandbox";
}

interface SquareCard {
  attach: (selector: string) => Promise<void>;
  destroy?: () => Promise<void>;
  tokenize: () => Promise<{
    status: "OK" | string;
    token?: string;
    errors?: Array<{ message?: string; detail?: string }>;
  }>;
}

interface SquarePayments {
  card: () => Promise<SquareCard>;
  verifyBuyer?: (
    token: string,
    details: {
      amount: string;
      billingContact: { email?: string };
      currencyCode: "USD";
      intent: "CHARGE";
    },
  ) => Promise<{ token?: string }>;
}

interface PayPalButtons {
  close?: () => void;
  render: (selector: string) => Promise<void>;
}

interface PayPalNamespace {
  Buttons: (options: {
    createOrder: () => Promise<string>;
    onApprove: (data: { orderID?: string }) => Promise<void>;
    onError?: (error: unknown) => void;
  }) => PayPalButtons;
}

interface CheckoutPayload {
  name: string;
  email: string;
  note: string;
  items: Array<{ id: string; quantity: number }>;
}

interface SquarePaymentPayload extends CheckoutPayload {
  source_id: string;
  verification_token?: string;
}

declare global {
  interface Window {
    Square?: {
      payments: (applicationId: string, locationId: string) => SquarePayments;
    };
    paypal?: PayPalNamespace;
  }
}

function squareScriptUrl(environment: SquareConfig["environment"]) {
  return environment === "sandbox"
    ? "https://sandbox.web.squarecdn.com/v1/square.js"
    : "https://web.squarecdn.com/v1/square.js";
}

async function loadSquareScript(environment: SquareConfig["environment"]) {
  const scriptId = "square-web-payments-sdk";
  const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

  if (existingScript) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = squareScriptUrl(environment);
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Square payment form could not be loaded."));
    document.head.appendChild(script);
  });
}

function paypalScriptUrl(config: PayPalConfig) {
  const params = new URLSearchParams({
    "client-id": config.client_id,
    components: "buttons",
    currency: "USD",
    intent: "capture",
  });

  return `https://www.paypal.com/sdk/js?${params.toString()}`;
}

async function loadPayPalScript(config: PayPalConfig) {
  const scriptId = "paypal-js-sdk";
  const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

  if (existingScript) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = paypalScriptUrl(config);
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("PayPal checkout could not be loaded."));
    document.head.appendChild(script);
  });
}

async function readCheckoutError(response: Response, fallback: string) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const payload = await response.json() as { detail?: string };
    return payload.detail || fallback;
  }

  return await response.text() || fallback;
}

export default function CheckoutPage() {
  const { clearCart, items, subtotal } = useCart();
  const formRef = useRef<HTMLFormElement | null>(null);
  const cardRef = useRef<SquareCard | null>(null);
  const paymentsRef = useRef<SquarePayments | null>(null);
  const paypalButtonsRef = useRef<PayPalButtons | null>(null);
  const [notice, setNotice] = useState("");
  const [paypalNotice, setPaypalNotice] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [cardReady, setCardReady] = useState(false);
  const [paypalReady, setPaypalReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasWindowsApp = items.some((item) => item.id === "guardian" || item.id === "guardian-intro");

  function checkoutPayload(form: HTMLFormElement): CheckoutPayload;
  function checkoutPayload(form: HTMLFormElement, extra: { source_id: string }): SquarePaymentPayload;
  function checkoutPayload(
    form: HTMLFormElement,
    extra?: { source_id: string },
  ): CheckoutPayload | SquarePaymentPayload {
    const formData = new FormData(form);

    return {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      note: String(formData.get("note") || ""),
      items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
      ...(extra || {}),
    };
  }

  useEffect(() => {
    let cancelled = false;

    async function initializeSquareCard() {
      try {
        const response = await fetch("/api/checkout/square/config");

        if (!response.ok) {
          throw new Error(await readCheckoutError(response, "Square checkout is not configured."));
        }

        const config = await response.json() as SquareConfig;

        await loadSquareScript(config.environment);

        if (!window.Square) {
          throw new Error("Square payment form did not initialize.");
        }

        const payments = window.Square.payments(config.application_id, config.location_id);
        const card = await payments.card();

        await card.attach("#square-card-container");

        if (cancelled) {
          await card.destroy?.();
          return;
        }

        paymentsRef.current = payments;
        cardRef.current = card;
        setCardReady(true);
      } catch (error) {
        if (!cancelled) {
          setNotice(error instanceof Error ? error.message : "Square checkout could not be loaded.");
        }
      }
    }

    initializeSquareCard();

    return () => {
      cancelled = true;
      setCardReady(false);
      paymentsRef.current = null;
      const currentCard = cardRef.current;
      cardRef.current = null;
      void currentCard?.destroy?.();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initializePayPalButtons() {
      try {
        const response = await fetch("/api/checkout/paypal/config");

        if (!response.ok) {
          setPaypalNotice(await readCheckoutError(response, "PayPal checkout is not configured."));
          return;
        }

        const config = await response.json() as PayPalConfig;

        await loadPayPalScript(config);

        if (!window.paypal) {
          throw new Error("PayPal checkout did not initialize.");
        }

        const buttons = window.paypal.Buttons({
          createOrder: async () => {
            const form = formRef.current;

            if (!form || !form.reportValidity()) {
              throw new Error("Contact details are required before PayPal checkout.");
            }

            setNotice("");
            setReceiptUrl("");

            const createResponse = await fetch("/api/checkout/paypal/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(checkoutPayload(form)),
            });

            if (!createResponse.ok) {
              throw new Error(await readCheckoutError(createResponse, "PayPal order could not be created."));
            }

            const paypalOrder = await createResponse.json() as { order_id?: string };

            if (!paypalOrder.order_id) {
              throw new Error("PayPal did not return an order ID.");
            }

            return paypalOrder.order_id;
          },
          onApprove: async (data) => {
            if (!data.orderID) {
              throw new Error("PayPal did not return an approved order ID.");
            }

            setIsSubmitting(true);

            try {
              const captureResponse = await fetch(`/api/checkout/paypal/orders/${data.orderID}/capture`, {
                method: "POST",
              });

              if (!captureResponse.ok) {
                throw new Error(await readCheckoutError(captureResponse, "PayPal payment could not be captured."));
              }

              const capture = await captureResponse.json() as { status?: string; capture_status?: string };
              clearCart();
              setNotice(
                capture.status === "COMPLETED" || capture.capture_status === "COMPLETED"
                  ? "PayPal payment complete."
                  : "PayPal payment submitted.",
              );
            } finally {
              setIsSubmitting(false);
            }
          },
          onError: (error) => {
            setNotice(error instanceof Error ? error.message : "PayPal checkout could not be completed.");
            setIsSubmitting(false);
          },
        });

        await buttons.render("#paypal-button-container");

        if (cancelled) {
          buttons.close?.();
          return;
        }

        paypalButtonsRef.current = buttons;
        setPaypalReady(true);
      } catch (error) {
        if (!cancelled) {
          setPaypalNotice(error instanceof Error ? error.message : "PayPal checkout could not be loaded.");
        }
      }
    }

    initializePayPalButtons();

    return () => {
      cancelled = true;
      setPaypalReady(false);
      const currentButtons = paypalButtonsRef.current;
      paypalButtonsRef.current = null;
      currentButtons?.close?.();
      const container = document.getElementById("paypal-button-container");

      if (container) {
        container.innerHTML = "";
      }
    };
  }, [items, subtotal]);

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setReceiptUrl("");
    setIsSubmitting(true);

    try {
      if (!cardRef.current) {
        throw new Error("Square payment form is still loading.");
      }

      const tokenResult = await cardRef.current.tokenize();

      if (tokenResult.status !== "OK" || !tokenResult.token) {
        const firstError = tokenResult.errors?.[0];
        throw new Error(firstError?.message || firstError?.detail || "Square could not tokenize the card.");
      }

      let verificationToken = "";
      const payload = checkoutPayload(event.currentTarget, {
        source_id: tokenResult.token,
      });
      const email = payload.email;

      if (paymentsRef.current?.verifyBuyer) {
        const verification = await paymentsRef.current.verifyBuyer(tokenResult.token, {
          amount: subtotal.toFixed(2),
          billingContact: { email },
          currencyCode: "USD",
          intent: "CHARGE",
        });
        verificationToken = verification.token || "";
      }

      payload.verification_token = verificationToken;

      const response = await fetch("/api/checkout/square/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const square = await response.json() as { receipt_url?: string; status?: string };
        clearCart();
        setReceiptUrl(square.receipt_url || "");
        setNotice(square.status === "COMPLETED" ? "Payment complete." : "Payment submitted to Square.");
        return;
      }

      let errorText = "Square payment could not be completed.";

      try {
        errorText = await readCheckoutError(response, errorText);
      } catch {
        errorText = await response.text() || errorText;
      }

      setNotice(errorText);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Square checkout could not be reached.");
    } finally {
      setIsSubmitting(false);
    }
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
              Review your contact details, enter payment securely below, and complete your POPS purchase without leaving this page. The POPS desktop app is delivered as a separate Windows download.
            </p>
          </div>

          <div className="checkout-layout">
            <form ref={formRef} className="checkout-form" onSubmit={handleCheckout}>
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
                  <CreditCard size={20} />
                  <div>
                    <h2>Card Payment</h2>
                    <p>Enter payment details in the secure Square form.</p>
                  </div>
                </div>

                <div id="square-card-container" className="square-card-container" />
                {!cardReady && <div className="square-card-loading">Loading secure Square payment form...</div>}
              </div>

              <div className="checkout-panel">
                <div className="checkout-panel-heading">
                  <CreditCard size={20} />
                  <div>
                    <h2>PayPal</h2>
                    <p>Use PayPal sandbox checkout for testing.</p>
                  </div>
                </div>

                <div id="paypal-button-container" className="paypal-button-container" />
                {!paypalReady && (
                  <div className="square-card-loading">
                    {paypalNotice || "Loading PayPal checkout..."}
                  </div>
                )}
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

              {notice && (
                <div className="checkout-notice">
                  {notice}
                  {receiptUrl && (
                    <>
                      {" "}
                      <a href={receiptUrl} target="_blank" rel="noreferrer">View Square receipt</a>
                    </>
                  )}
                </div>
              )}

              <button type="submit" className="btn btn-primary checkout-submit" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : `Pay ${formatCurrency(subtotal)}`}
                <CreditCard size={16} />
              </button>
            </form>

            <aside className="order-summary">
              <span className="mono">Checkout</span>
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
                <strong>Square or PayPal</strong>
              </div>
              <div className="summary-total">
                <span>Estimated due</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>
              <p>Card payments use Square. PayPal payments use PayPal sandbox until production credentials are configured.</p>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
