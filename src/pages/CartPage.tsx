import { Link } from "react-router-dom";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import PageSeo from "../components/PageSeo";
import { formatCurrency, PRODUCTS, useCart } from "../cart";

export default function CartPage() {
  const { addItem, itemCount, items, removeItem, subtotal, updateQuantity } = useCart();
  const suggestedProducts = PRODUCTS.filter(
    (product) => !product.requiresReview && !items.some((item) => item.id === product.id)
  );

  return (
    <div className="commerce-page">
      <PageSeo
        title="Cart | POPS"
        description="Review your POPS cart before completing secure checkout through Square."
        path="/cart"
      />

      <section className="section">
        <div className="container">
          <div className="commerce-heading">
            <Link to="/access" className="inline-link">
              <ArrowLeft size={14} />
              Continue Shopping
            </Link>
            <h1>Your Cart</h1>
            <p>
              POPS website purchases are separate from the desktop application. Guardian Access delivers the Windows installer and license activation instructions after Square checkout.
            </p>
          </div>

          {items.length === 0 ? (
            <div className="commerce-empty">
              <ShoppingBag size={42} />
              <h2>Your cart is empty.</h2>
              <p>Choose Guardian Access, Membership, or a sponsorship amount to continue.</p>
              <Link to="/access" className="btn btn-primary">Choose POPS Access</Link>
            </div>
          ) : (
            <div className="commerce-layout">
              <div className="cart-list">
                {items.map((item) => (
                  <article className="cart-item" key={item.id}>
                    <div className="cart-item-mark">
                      <ShoppingBag size={22} />
                    </div>
                    <div className="cart-item-main">
                      <div>
                        <h2>{item.name}</h2>
                        <p>{item.description}</p>
                        <span>{item.fulfillment}</span>
                      </div>
                      <div className="cart-item-controls">
                        <div className="quantity-control" aria-label={`${item.name} quantity`}>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity === 1}
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            <Minus size={14} />
                          </button>
                          <strong>{item.quantity}</strong>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          type="button"
                          className="icon-danger"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                    <div className="cart-item-price">
                      <strong>{formatCurrency(item.price * item.quantity)}</strong>
                      <span>{item.period}</span>
                    </div>
                  </article>
                ))}
              </div>

              <aside className="order-summary">
                <span className="mono">Order Summary</span>
                <div className="summary-row">
                  <span>Items</span>
                  <strong>{itemCount}</strong>
                </div>
                <div className="summary-row">
                  <span>Subtotal</span>
                  <strong>{formatCurrency(subtotal)}</strong>
                </div>
                <div className="summary-row muted">
                  <span>Tax</span>
                  <strong>Calculated by Square</strong>
                </div>
                <div className="summary-total">
                  <span>Due today</span>
                  <strong>{formatCurrency(subtotal)}</strong>
                </div>
                <Link to="/checkout" className="btn btn-primary summary-button">
                  Checkout with Square
                </Link>
                <p>Secure payment is completed through your Square checkout.</p>
              </aside>
            </div>
          )}

          {suggestedProducts.length > 0 && (
            <div className="commerce-suggestions">
              <span className="mono">Also Available</span>
              <div className="suggestion-grid">
                {suggestedProducts.map((product) => (
                  <button className="suggestion-card" key={product.id} onClick={() => addItem(product)}>
                    <strong>{product.name}</strong>
                    <span>{product.priceLabel} | {product.period}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
