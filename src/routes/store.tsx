import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShoppingBag, Sparkles, Star, Plus, Minus, Trash2, X,
  CheckCircle2, ShieldCheck, Truck, ArrowRight, Search,
  Filter, Heart, CreditCard, Building2, MapPin, ExternalLink,
  ChevronRight, Award, MessageCircle
} from "lucide-react";
import { toast } from "sonner";
import { Shell } from "@/components/esb/Shell";
import {
  getStoredStoreProducts,
  type WebStoreProduct,
} from "@/lib/storage";
import { formatNaira } from "@/lib/currency";

export const Route = createFileRoute("/store")({
  head: () => ({
    meta: [
      { title: "Luxury Web Store & E-Commerce — ESB Brand" },
      {
        name: "description",
        content:
          "Official online store for ESB Brand formulations, medical aesthetics homecare, and dental kits with nationwide Nigerian delivery in Naira (₦).",
      },
    ],
  }),
  component: WebStorePage,
});

interface CartItem {
  product: WebStoreProduct;
  quantity: number;
}

function WebStorePage() {
  const [products] = useState<WebStoreProduct[]>(() => getStoredStoreProducts());
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<WebStoreProduct | null>(null);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setShowCheckoutOpen] = useState(false);

  // Checkout form
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("+234 ");
  const [clientAddress, setClientAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState<"Port Harcourt" | "Abuja" | "Lagos" | "Other">("Port Harcourt");
  const [paymentMethod, setPaymentMethod] = useState<"transfer" | "card" | "delivery">("transfer");
  const [orderComplete, setOrderComplete] = useState<string | null>(null);

  const categories = ["All", "Skincare Kitchen", "Derma Aesthetics", "Skin Clinic", "Dental Care", "Rejuvenating"];

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === "All" || p.category === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ingredients.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const cartTotalUnits = cart.reduce((acc, it) => acc + it.quantity, 0);
  const cartSubtotalNgn = cart.reduce((acc, it) => acc + it.product.priceNgn * it.quantity, 0);
  const shippingFeeNgn =
    cartSubtotalNgn > 100_000
      ? 0
      : deliveryCity === "Port Harcourt" || deliveryCity === "Abuja"
      ? 3500
      : 6000;
  const grandTotalNgn = cartSubtotalNgn + (cart.length > 0 ? shippingFeeNgn : 0);

  const addToCart = (prod: WebStoreProduct) => {
    setCart((prev) => {
      const existing = prev.find((it) => it.product.id === prod.id);
      if (existing) {
        return prev.map((it) =>
          it.product.id === prod.id ? { ...it, quantity: it.quantity + 1 } : it
        );
      }
      return [...prev, { product: prod, quantity: 1 }];
    });
    toast.success(`Added ${prod.name} to cart!`, {
      description: `${formatNaira(prod.priceNgn)} · Instant checkout available`,
    });
  };

  const updateQuantity = (prodId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((it) => {
          if (it.product.id === prodId) {
            const nextQty = it.quantity + delta;
            return nextQty > 0 ? { ...it, quantity: nextQty } : null;
          }
          return it;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientAddress) return;

    const orderId = `ESB-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderComplete(orderId);
    setCart([]);
    toast.success(`Order Confirmed: ${orderId}!`, {
      description: `Dispatched to our delivery team. Receipt generated in Nigerian Naira.`,
    });
  };

  return (
    <Shell>
      <div className="space-y-8 max-w-7xl mx-auto pb-20">
        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-gold/30 bg-gradient-to-r from-background via-secondary/40 to-background p-6 sm:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-gold/15 text-gold border border-gold/40">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              <span>Official ESB Brand Luxury Web Store · All Prices in ₦ NGN</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-bold text-foreground leading-tight">
              Clinically Formulated Skincare & Aesthetics Elegance
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Bespoke formulations, medical-grade SPF, post-procedure restoration, and PAP+ Hollywood smile whitening. Handcrafted and formulated in Lagos for premium African skin.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setCartOpen(true)}
                className="px-5 py-2.5 rounded-full font-semibold text-xs bg-gold text-black flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Open Cart ({cartTotalUnits} items)</span>
              </button>
              <Link
                to="/inventory"
                className="px-5 py-2.5 rounded-full font-semibold text-xs bg-secondary text-foreground border border-border hover:border-gold/50 flex items-center gap-1.5 transition-colors"
              >
                <Truck className="h-4 w-4 text-gold" />
                <span>Live Delivery GPS Tracker</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-secondary/30 border border-border">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-gold text-black shadow-sm"
                    : "text-muted-foreground hover:text-foreground border border-transparent hover:border-border"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ingredient, brand, or formula..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-background border border-border focus:border-gold focus:outline-none"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="card-elevated rounded-2xl border border-border/80 overflow-hidden flex flex-col justify-between hover:border-gold/50 transition-all duration-300 group shadow-md"
            >
              <div>
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-black/40">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-gold border border-gold/40">
                      {prod.category}
                    </span>
                    {prod.bestseller && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-black shadow-sm">
                        BESTSELLER
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] text-amber-300 flex items-center gap-1 border border-amber-500/30">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span>{prod.rating}</span>
                    <span className="text-muted-foreground">({prod.reviewsCount})</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-2.5">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                      {prod.brand}
                    </span>
                    <h3 className="text-sm font-bold text-foreground mt-0.5 line-clamp-1 group-hover:text-gold transition-colors">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {prod.tagline}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-secondary/40 text-[11px] text-muted-foreground space-y-1">
                    <div>
                      <strong className="text-foreground">Key Actives:</strong> {prod.ingredients}
                    </div>
                  </div>
                </div>
              </div>

              {/* Price & Add to Cart Footer */}
              <div className="p-5 pt-0 border-t border-border/50 mt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase text-muted-foreground">Retail Price</div>
                    <div className="text-base font-display font-bold text-gold">
                      {formatNaira(prod.priceNgn)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedProduct(prod)}
                      className="px-2.5 py-1.5 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground text-xs"
                      title="View Clinical Guide"
                    >
                      Guide
                    </button>
                    <button
                      onClick={() => addToCart(prod)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gold text-black flex items-center gap-1 shadow-md hover:scale-105 active:scale-95 transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Instant Bumper & WhatsApp Channel Links */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={prod.bumperUrl || "https://dermaaesthetics.bumper.shop"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-2 rounded-xl text-[11px] font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center gap-1 transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Bumper Store</span>
                  </a>
                  <a
                    href={`https://wa.me/2348030000001?text=${encodeURIComponent(`Hello ESB Brand Concierge, I would like to order "${prod.name}" (${formatNaira(prod.priceNgn)}) for delivery to Port Harcourt / Abuja.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-2 rounded-xl text-[11px] font-semibold bg-green-500/15 hover:bg-green-500/25 text-green-300 border border-green-500/40 flex items-center justify-center gap-1 transition-colors"
                  >
                    <MessageCircle className="h-3 w-3" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Brand Locations & Physical Flagships Showcase */}
        <div className="p-8 rounded-3xl bg-secondary/30 border border-border/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Visit Our Physical Flagship Clinics in Nigeria
              </h2>
              <p className="text-xs text-muted-foreground">
                Pick up products in person or book a clinical doctor consultation across Port Harcourt & Abuja
              </p>
            </div>
            <Link
              to="/appointments"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gold text-black flex items-center gap-1.5 w-fit"
            >
              <span>Book In-Person Consultation</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                city: "Port Harcourt — Flagship Clinic & Formulation Lab",
                address: "Plot 14 Stadium Road, GRA Phase IV, Port Harcourt, Rivers State",
                services: "Full Laser Surgery, Aesthetic Injections & Skincare Kitchen Lab",
                phone: "+234 803 000 0001",
              },
              {
                city: "Abuja — Maitama Executive Aesthetic Suite",
                address: "18 Gana Street, Maitama, Abuja FCT",
                services: "VIP Concierge, Hollywood Smile Dental & Laser Rejuvenation",
                phone: "+234 809 777 8899",
              },
              {
                city: "Abuja — Wuse II Clinical Dispensing Hub",
                address: "Aminu Kano Crescent, Wuse II, Abuja FCT",
                services: "Medical Aesthetics, Botox & Cold-Chain Supply",
                phone: "+234 9 461 3320",
              },
            ].map((loc, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-background border border-border/70 space-y-2">
                <div className="text-xs font-bold text-gold flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{loc.city}</span>
                </div>
                <div className="text-xs text-foreground">{loc.address}</div>
                <div className="text-[11px] text-muted-foreground">{loc.services}</div>
                <div className="text-[11px] font-mono text-muted-foreground pt-1 border-t border-border/50">
                  Direct Line: {loc.phone}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Guide Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-background border border-gold/40 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scale-in">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-gold uppercase">{selectedProduct.category}</span>
                  <h3 className="text-base font-bold text-foreground mt-0.5">{selectedProduct.name}</h3>
                  <div className="text-sm font-mono font-bold text-gold mt-1">
                    {formatNaira(selectedProduct.priceNgn)}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs leading-relaxed max-h-80 overflow-y-auto">
                <p className="text-muted-foreground">{selectedProduct.description}</p>
                <div className="p-3 rounded-xl bg-secondary/50 space-y-1">
                  <div className="font-semibold text-foreground">Formulation Ingredients:</div>
                  <div className="text-muted-foreground text-[11px]">{selectedProduct.ingredients}</div>
                </div>
                <div className="p-3 rounded-xl bg-secondary/50 space-y-1">
                  <div className="font-semibold text-foreground">Clinical Usage Instructions:</div>
                  <div className="text-muted-foreground text-[11px]">{selectedProduct.usageGuide}</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <a
                    href={selectedProduct.bumperUrl || "https://dermaaesthetics.bumper.shop"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Instant Bumper Checkout</span>
                  </a>
                  <a
                    href={`https://wa.me/2348030000001?text=${encodeURIComponent(`Hello ESB Brand Concierge, I would like to order "${selectedProduct.name}" (${formatNaira(selectedProduct.priceNgn)}) for delivery to Port Harcourt / Abuja.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-green-500/15 hover:bg-green-500/25 text-green-300 border border-green-500/40 flex items-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="px-3.5 py-2 rounded-xl text-xs bg-secondary text-muted-foreground hover:text-foreground"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-gold text-black flex items-center gap-1.5 shadow-md"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add to Bag</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shopping Cart Drawer */}
        {cartOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
            <div className="bg-background border-l border-gold/40 w-full max-w-md h-full flex flex-col p-6 shadow-2xl animate-slide-in">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-gold" />
                  <h3 className="font-bold text-foreground">Your Shopping Cart ({cartTotalUnits})</h3>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
                  <div className="text-sm font-semibold text-foreground">Your cart is empty</div>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Explore our medical-grade skincare elixirs, SPF fluids, and whitening kits.
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto py-4 space-y-3">
                  {cart.map((it) => (
                    <div
                      key={it.product.id}
                      className="p-3 rounded-xl bg-secondary/40 border border-border flex items-center justify-between gap-3 text-xs"
                    >
                      <img
                        src={it.product.image}
                        alt={it.product.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground truncate">{it.product.name}</div>
                        <div className="text-gold font-mono font-medium">
                          {formatNaira(it.product.priceNgn)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(it.product.id, -1)}
                          className="h-6 w-6 rounded-md bg-secondary border border-border flex items-center justify-center text-foreground"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-mono text-xs w-4 text-center">{it.quantity}</span>
                        <button
                          onClick={() => updateQuantity(it.product.id, 1)}
                          className="h-6 w-6 rounded-md bg-gold/20 text-gold border border-gold/40 flex items-center justify-center"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cart.length > 0 && (
                <div className="pt-4 border-t border-border space-y-3">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal:</span>
                      <span className="font-mono text-foreground">{formatNaira(cartSubtotalNgn)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Express Shipping (Lagos/Abuja):</span>
                      <span className="font-mono text-foreground">
                        {shippingFeeNgn === 0 ? "FREE (VIP Order)" : formatNaira(shippingFeeNgn)}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-sm text-foreground pt-1 border-t border-border/50">
                      <span>Total (NGN):</span>
                      <span className="font-mono text-gold text-base">{formatNaira(grandTotalNgn)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCartOpen(false);
                      setShowCheckoutOpen(true);
                    }}
                    className="w-full py-3 rounded-xl font-bold text-xs bg-gold text-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Checkout Modal */}
        {checkoutOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <form
              onSubmit={handleCheckoutSubmit}
              className="bg-background border border-gold/40 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scale-in"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">Secure Checkout (₦ NGN)</h3>
                  <div className="text-xs text-gold font-mono font-bold mt-0.5">
                    Order Total: {formatNaira(grandTotalNgn)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCheckoutOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-muted-foreground">Full Name</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Chief Adeleke"
                    className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary/50 border border-border focus:border-gold focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-muted-foreground">Phone (WhatsApp Updates)</label>
                    <input
                      type="text"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+234 803 123 4567"
                      className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary/50 border border-border focus:border-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground">State / Region</label>
                    <select
                      value={deliveryCity}
                      onChange={(e) => setDeliveryCity(e.target.value as any)}
                      className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary/50 border border-border focus:border-gold focus:outline-none"
                    >
                      <option value="Lagos">Lagos (Same-Day / Next-Day)</option>
                      <option value="Abuja">Abuja FCT (Priority Express)</option>
                      <option value="Other">Nationwide Courier</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-muted-foreground">Delivery Address</label>
                  <input
                    type="text"
                    required
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="e.g. Plot 15, Admiralty Way, Lekki Phase 1"
                    className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary/50 border border-border focus:border-gold focus:outline-none"
                  />
                </div>

                {/* Nigerian Payment Options */}
                <div>
                  <label className="text-muted-foreground">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {[
                      { id: "transfer", label: "Bank Transfer", desc: "Instant Zenith/GTB" },
                      { id: "card", label: "Card Pay", desc: "Paystack/Flutterwave" },
                      { id: "delivery", label: "Pay on Delivery", desc: "Lagos/Abuja Only" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          paymentMethod === m.id
                            ? "bg-gold/20 border-gold text-foreground font-semibold"
                            : "bg-secondary/40 border-border text-muted-foreground"
                        }`}
                      >
                        <div className="text-[11px] font-bold">{m.label}</div>
                        <div className="text-[9px] text-muted-foreground mt-0.5">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {paymentMethod === "transfer" && (
                  <div className="p-3 rounded-xl bg-gold/10 border border-gold/30 text-xs space-y-1">
                    <div className="font-semibold text-gold">ESB Corporate Dedicated Account:</div>
                    <div className="text-foreground flex items-center justify-between font-mono">
                      <span>Zenith Bank: 1018992451</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText("1018992451");
                          toast.success("Account number copied!");
                        }}
                        className="text-[10px] text-gold underline"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Account Name: ESB Brand Aesthetics Nigeria Ltd
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowCheckoutOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs bg-secondary text-muted-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-gold text-black shadow-md"
                >
                  Confirm & Place Order
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Order Success Modal */}
        {orderComplete && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-background border border-gold/40 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl animate-scale-in">
              <div className="h-12 w-12 rounded-full bg-success/20 border border-success/40 text-success flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Order Successfully Placed!</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Thank you, <strong className="text-foreground">{clientName || "Valued Client"}</strong>. Your order is registered in the ESB dispatch system.
              </p>
              <div className="p-3 rounded-xl bg-secondary/50 font-mono text-xs text-gold border border-gold/30">
                Order Tracking ID: {orderComplete}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Link
                  to="/inventory"
                  className="flex-1 py-2 rounded-xl text-xs font-semibold bg-gold text-black flex items-center justify-center gap-1.5"
                >
                  <Truck className="h-3.5 w-3.5" />
                  <span>Track Delivery on Maps</span>
                </Link>
                <button
                  onClick={() => setOrderComplete(null)}
                  className="px-4 py-2 rounded-xl text-xs bg-secondary text-muted-foreground hover:text-foreground"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
