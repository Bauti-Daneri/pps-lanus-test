import Image from "next/image";
import type { CardSummary } from "@/server/movements";
import { formatBalance, formatExpiry } from "@/lib/format";

const CARD_SIZE = "h-[190px] w-full max-w-[348px] rounded-3xl";

// Posiciones absolutas en px tomadas del Figma (tarjeta de 348x190).
const MASKED_GROUP_LEFTS = [24, 81, 138];

export function CardView({ card }: { card: CardSummary | null }) {
  if (!card) {
    return (
      <div
        className={`${CARD_SIZE} flex items-center justify-center border border-border-1 bg-surface-3 p-6 text-center text-body font-medium text-text-medium`}
      >
        Todavía no tenés una tarjeta asociada.
      </div>
    );
  }

  return (
    <section
      aria-label="Tarjeta"
      className={`${CARD_SIZE} relative bg-granate text-white shadow-card`}
    >
      <p className="absolute left-[24px] top-[16px] text-body leading-[22px] font-medium">
        Balance
      </p>

      <div className="absolute left-[289px] top-[16px]">
        <BrandLogo brand={card.brand} />
      </div>

      <Image
        src="/icons/usd-badge.svg"
        width={48}
        height={30}
        alt=""
        className="absolute left-[24px] top-[46px]"
      />
      <span className="absolute left-[34px] top-[50px] text-body leading-[22px] font-semibold">
        {card.currency}
      </span>
      <p className="absolute left-[81px] top-[48px] text-card font-semibold">
        {formatBalance(card.balanceCents)}
      </p>

      <p className="text-card">
        <span className="sr-only">Tarjeta terminada en </span>
        {MASKED_GROUP_LEFTS.map((left) => (
          <span
            key={left}
            aria-hidden="true"
            className="absolute top-[102px] font-semibold"
            style={{ left }}
          >
            ****
          </span>
        ))}
        <span className="absolute left-[195px] top-[100px] font-medium">{card.last4}</span>
      </p>

      <p className="absolute left-[24px] top-[150px] text-base leading-[22px] font-medium">
        {card.holderName}
      </p>

      {/* Centrados entre sí en x=300.5 (centros en y=152.5 y y=170). */}
      <span className="absolute left-[300.5px] top-[152.5px] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-semibold">
        Exp. Date
      </span>
      <span className="absolute left-[300.5px] top-[170px] -translate-x-1/2 -translate-y-1/2 text-[13px] font-semibold">
        {formatExpiry(card.expMonth, card.expYear)}
      </span>
    </section>
  );
}

function BrandLogo({ brand }: { brand: CardSummary["brand"] }) {
  if (brand === "MASTERCARD") {
    return <Image src="/icons/mastercard.svg" width={34} height={24} alt="Mastercard" />;
  }
  return <span className="text-body font-bold tracking-wide">VISA</span>;
}
