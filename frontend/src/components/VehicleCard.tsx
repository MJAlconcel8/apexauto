import { useState } from "react";
import { ArrowRight, MapPin, Star, BadgeDollarSign, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { VehicleCardProps } from "./types";
import { Badge } from "./Badge";
import { RangeGauge } from "./RangeGauge";
import { SpecReadout } from "./SpecReadout";
import { Btn } from "./Btn";

const fmtCAD = (n: number) => "$" + n.toLocaleString("en-CA");

export function VehicleCard({ v, dark = false, hideFinance = false, hideAddToCart = false, onView, onFinance, cardNavigateState }: VehicleCardProps) {
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [cartMsg, setCartMsg] = useState<string | null>(null);

  const handleFinance = () => {
    if (onFinance) onFinance(v);
    navigate('/finance', { state: { id: v.id, marque: v.marque, model: v.model, price: v.price, img: v.img } });
  };

  const handleAddToCart = async () => {
    setAdding(true);
    setCartMsg(null);
    try {
      let cartRes = await fetch('http://localhost:8080/users/me/carts/active', { credentials: 'include' });
      if (cartRes.status === 401) { navigate('/login'); return; }
      if (cartRes.status === 404) {
        const createRes = await fetch('http://localhost:8080/users/me/carts', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (createRes.status === 401) { navigate('/login'); return; }
        if (!createRes.ok) throw new Error();
        cartRes = createRes;
      } else if (!cartRes.ok) {
        throw new Error();
      }
      const cartData = await cartRes.json() as { cartId: number };
      const addRes = await fetch(`http://localhost:8080/carts/${cartData.cartId}/cart-lines`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId: Number(v.id), quantity: 1 }),
      });
      if (!addRes.ok) throw new Error();
      window.dispatchEvent(new Event('cart-updated'));
      setCartMsg('Added to cart!');
    } catch {
      setCartMsg('Failed to add.');
    } finally {
      setAdding(false);
    }
  };
  return (
    <article
      className={`group/card av-rise flex flex-col rounded-[14px] overflow-hidden border cursor-pointer hover:-translate-y-0.75 transition-all duration-220 ${
        dark
          ? "bg-card border-card-border hover:border-[rgba(14,99,255,0.35)] shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_30px_rgba(14,99,255,0.15)]"
          : "bg-white border-apex-line hover:border-[rgba(14,99,255,0.35)] shadow-[0_8px_24px_-14px_rgba(18,22,28,0.20)] hover:shadow-[0_14px_30px_-18px_rgba(18,22,28,0.35)]"
      }`}
      onClick={() => navigate(`/vehicle/${v.id}`, cardNavigateState ? { state: cardNavigateState } : undefined)}
    >
      {/* Image */}
      <div className="relative h-47 overflow-hidden">
        <img
          src={v.img}
          alt={`${v.marque} ${v.model}`}
          loading="lazy"
          className="w-full h-full object-cover block group-hover/card:scale-[1.045] transition-transform duration-500"
        />
        <div className={`absolute inset-0 ${dark ? "bg-[linear-gradient(to_top,#071428_2%,rgba(7,20,40,0.15)_45%,rgba(7,20,40,0.05)_100%)]" : "bg-[linear-gradient(to_top,#12161C_2%,rgba(18,22,28,0.15)_45%,rgba(18,22,28,0.05)_100%)]"}`} />
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <Badge badge={v.badge} />
          <span className="font-mono text-[10px] text-white tracking-[0.08em] bg-[rgba(18,22,28,0.55)] px-2 py-0.75 rounded-md backdrop-blur-xs">
            {v.marque.toUpperCase()} · {v.category?.toUpperCase() ?? v.year}
          </span>
        </div>
        <div className="absolute left-3.5 bottom-3 right-3.5">
          <h3 className="font-display font-extrabold text-[20px] text-white tracking-[-0.01em] [text-shadow:0_1px_8px_rgba(0,0,0,0.4)]">
            {v.model}
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col p-4.5 gap-3.5 flex-1">
        <div className="flex items-center gap-1 text-apex-green">
          <MapPin size={12} strokeWidth={2} />
          <span className="font-mono text-[11px]">
            {v.stock} in stock · {v.history}
          </span>
        </div>

        <div className={`flex items-center gap-3.5 py-3 border-t border-b ${dark ? "border-card-border" : "border-apex-line"}`}>
          <div className="shrink-0">
            <RangeGauge value={v.mileage} size={78} dark={dark} />
          </div>
          <div className="grid grid-cols-3 gap-2.5 flex-1">
            <SpecReadout label="Emission" value={v.emissionScore} unit="g/km" dark={dark} />
            <SpecReadout label="Fuel Use" value={v.fuelUsage.toFixed(1)} unit="L/100" dark={dark} />
            <SpecReadout label="Seats" value={v.seats} dark={dark} />
          </div>
        </div>

        {v.rating != null && (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  strokeWidth={1.5}
                  className={
                    i < Math.round(v.rating!)
                      ? "fill-apex-amber text-apex-amber"
                      : `fill-transparent ${dark ? "text-[rgba(255,255,255,0.2)]" : "text-apex-line"}`
                  }
                />
              ))}
            </div>
            <span className={`font-mono text-[11px] ${dark ? "text-muted-foreground" : "text-apex-muted"}`}>
              {v.rating.toFixed(1)} ({v.reviewCount?.toLocaleString()})
            </span>
          </div>
        )}

        <div className="flex flex-col gap-3 mt-auto">
          {/* Price row */}
          <div className="flex items-baseline gap-2">
            {v.was && (
              <span className={`font-mono text-[12px] line-through ${dark ? "text-muted-foreground" : "text-apex-muted"}`}>
                {fmtCAD(v.was)}
              </span>
            )}
            <span className={`font-mono text-[21px] font-semibold leading-none ${dark ? "text-foreground" : "text-apex-ink"}`}>
              {fmtCAD(v.price)}
            </span>
            {cartMsg && (
              <span
                className="font-mono text-[11px]"
                style={{ color: cartMsg.startsWith('Added') ? '#22c55e' : '#f87171' }}
              >
                {cartMsg}
              </span>
            )}
          </div>
          {/* Buttons row */}
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            {!hideFinance && (
              <Btn variant="outline" size="sm" icon={BadgeDollarSign} onClick={handleFinance}>
                Finance
              </Btn>
            )}
            {onView ? (
              <div className="flex-1">
                <Btn variant="primary" size="sm" icon={ArrowRight} onClick={() => onView(v)} fullWidth>
                  View
                </Btn>
              </div>
            ) : !hideAddToCart ? (
              <div className="flex-1">
                <Btn variant="primary" size="sm" icon={ShoppingCart} onClick={handleAddToCart} fullWidth>
                  {adding ? 'Adding…' : 'Add to Cart'}
                </Btn>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
