import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

export interface Product {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  period: string;
  description: string;
  fulfillment: string;
  requiresReview?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const PRODUCTS: Product[] = [
  {
    id: "guardian",
    name: "Guardian Access",
    price: 149,
    priceLabel: "$149",
    period: "one-time Windows app license",
    description: "Full POPS desktop app access with lifetime POPS Membership included.",
    fulfillment: "Windows installer and license activation instructions after checkout.",
  },
  {
    id: "opendoor",
    name: "Open Door Access",
    price: 1,
    priceLabel: "Custom",
    period: "reviewed contribution",
    description: "Reviewed access request for fathers who cannot carry the full license price today.",
    fulfillment: "Manual review first, then approval code and Windows app download instructions if approved.",
    requiresReview: true,
  },
  {
    id: "sponsor",
    name: "Sponsor a Father",
    price: 25,
    priceLabel: "$25+",
    period: "support contribution",
    description: "Help fund approved Open Door license capacity.",
    fulfillment: "Sponsorship receipt and confirmation after checkout.",
  },
  {
    id: "membership",
    name: "POPS Membership",
    price: 12.99,
    priceLabel: "$12.99",
    period: "one-time lifetime membership",
    description: "Lifetime community membership for updates, education, events, and resource drops.",
    fulfillment: "Membership confirmation after checkout.",
  },
];

export function getProduct(id: string) {
  return PRODUCTS.find((product) => product.id === id);
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const value = useMemo<CartContextValue>(() => {
    function addItem(product: Product) {
      setItems((current) => {
        const existing = current.find((item) => item.id === product.id);

        if (existing) {
          return current.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }

        return [...current, { ...product, quantity: 1 }];
      });
    }

    function removeItem(id: string) {
      setItems((current) => current.filter((item) => item.id !== id));
    }

    function updateQuantity(id: string, quantity: number) {
      setItems((current) =>
        current
          .map((item) =>
            item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
          )
          .filter((item) => item.quantity > 0)
      );
    }

    function clearCart() {
      setItems([]);
    }

    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

    return {
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
