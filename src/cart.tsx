import { createContext, useContext, useEffect, useMemo, useState } from "react";
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
  persistenceAvailable: boolean;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const PRODUCTS: Product[] = [
  {
    id: "guardian",
    name: "Guardian Access",
    price: 99,
    priceLabel: "$99",
    period: "one-time Windows app license",
    description: "Full POPS desktop app access with lifetime POPS Membership included.",
    fulfillment: "Selection only. Installer delivery and activation instructions are not yet available.",
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
    fulfillment: "Selection only. Sponsorship payments are unavailable.",
  },
  {
    id: "membership",
    name: "POPS Membership",
    price: 12.99,
    priceLabel: "$12.99",
    period: "one-time lifetime membership",
    description: "Lifetime community membership for updates, education, events, and resource drops.",
    fulfillment: "Selection only. Membership payment and service availability remain to be confirmed.",
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

const CART_KEY = "pops:website-cart:v1";
function normalizeCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  const result: CartItem[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== 'object') continue;
    const product = PRODUCTS.find(item => item.id === entry.id && !item.requiresReview);
    if (!product || result.some(item => item.id === product.id)) continue;
    const raw = Number(entry.quantity);
    if (!Number.isFinite(raw) || raw < 1) continue;
    const quantity = product.id === 'sponsor' ? Math.min(99, Math.floor(raw)) : 1;
    result.push({...product, quantity});
  }
  return result.some(item => item.id === 'guardian') ? result.filter(item => item.id !== 'membership') : result;
}
function readCart(): CartItem[] {
  try { const saved=JSON.parse(localStorage.getItem(CART_KEY) || '[]'); return normalizeCart(saved); }
  catch { return []; }
}
export function CartProvider({ children }: { children: ReactNode }) {
  const [items,setItems] = useState<CartItem[]>(readCart);
  const [persistenceAvailable,setPersistenceAvailable] = useState(true);
  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(items.map(({id,quantity})=>({id,quantity})))); setPersistenceAvailable(true); }
    catch { setPersistenceAvailable(false); }
  },[items]);
  useEffect(() => {
    const update=(event: StorageEvent)=> {if(event.key===CART_KEY || event.key===null)setItems(readCart());};
    window.addEventListener('storage',update);
    return ()=>window.removeEventListener('storage',update);
  },[]);
  const value=useMemo<CartContextValue>(()=>({
    items, persistenceAvailable,
    addItem: (product) => setItems(current=>{
      const canonical=getProduct(product.id);
      if(!canonical || canonical.requiresReview || (canonical.id==='membership' && current.some(item=>item.id==='guardian')))return current;
      const existing=current.find(item=>item.id===canonical.id);
      return normalizeCart(existing ? current.map(item=>item.id===canonical.id ? {...item,quantity:item.quantity+1}:item):[...current,{...canonical,quantity:1}]);
    }),
    removeItem: (id)=>setItems(current=>current.filter(item=>item.id!==id)),
    updateQuantity: (id,quantity)=>setItems(current=>normalizeCart(current.map(item=>item.id===id?{...item,quantity}:item))),
    clearCart: ()=>setItems([]),
    itemCount: items.reduce((total,item)=>total+item.quantity,0),
    subtotal: items.reduce((total,item)=>total+Math.round(item.price*100)*item.quantity,0)/100,
  }),[items,persistenceAvailable]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
