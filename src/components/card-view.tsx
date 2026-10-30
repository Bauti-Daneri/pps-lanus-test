import type { CSSProperties } from "react";
import Image from "next/image";
import type { CardSummary } from "@/server/movements";
import { formatBalance, formatExpiry } from "@/lib/format";

// La tarjeta escala proporcionalmente: el contenedor mide min(100%, 348px) y
// --u es 1/348 de su ancho, así que a 348 px vale exactamente 1px. Cada medida
// se escribe como u(N) con el N en px del Figma (tarjeta de 348x190).
const u = (n: number) => `calc(var(--u) * ${n})`;

const CARD_STYLE = {
  "--u": "calc(100cqw / 348)",
  aspectRatio: "348 / 190",
  borderRadius: u(24),
} as CSSProperties;

const MASKED_GROUP_LEFTS = [24, 81, 138];

// Alineada a la izquierda, como en el Figma (x=24 dentro de la columna).
function CardContainer({ children }: { children: React.ReactNode }) {
  return <div className="@container w-[min(100%,348px)]">{children}</div>;
}

export function CardView({ card }: { card: CardSummary | null }) {
  return <CardContainer>{card ? <FilledCard card={card} /> : <EmptyCard />}</CardContainer>;
}

// Mismas proporciones que la tarjeta real, para que loading.tsx no salte.
export function CardSkeleton() {
  return (
    <CardContainer>
      <div style={CARD_STYLE} className="w-full bg-border-2" />
    </CardContainer>
  );
}

function EmptyCard() {
  return (
    <div
      style={{ ...CARD_STYLE, padding: u(24), fontSize: u(14), lineHeight: 1.25 }}
      className="flex w-full items-center justify-center border border-border-1 bg-surface-3 text-center font-medium text-text-medium"
    >
      Todavía no tenés una tarjeta asociada.
    </div>
  );
}

function FilledCard({ card }: { card: CardSummary }) {
  return (
    <section
      aria-label="Tarjeta"
      style={CARD_STYLE}
      className="relative w-full bg-granate text-white shadow-card"
    >
      <p
        className="absolute font-medium"
        style={{ left: u(24), top: u(16), fontSize: u(14), lineHeight: u(22) }}
      >
        Balance
      </p>

      <div className="absolute" style={{ left: u(289), top: u(16) }}>
        <BrandLogo brand={card.brand} />
      </div>

      <Image
        src="/icons/usd-badge.svg"
        width={48}
        height={30}
        alt=""
        className="absolute"
        style={{ left: u(24), top: u(46), width: u(48), height: u(30) }}
      />
      <span
        className="absolute font-semibold"
        style={{ left: u(34), top: u(50), fontSize: u(14), lineHeight: u(22) }}
      >
        {card.currency}
      </span>
      <p
        className="absolute font-semibold"
        style={{ left: u(81), top: u(48), fontSize: u(22), lineHeight: u(28) }}
      >
        {formatBalance(card.balanceCents)}
      </p>

      <p style={{ fontSize: u(22), lineHeight: u(28) }}>
        <span className="sr-only">Tarjeta terminada en </span>
        {MASKED_GROUP_LEFTS.map((left) => (
          <span
            key={left}
            aria-hidden="true"
            className="absolute font-semibold"
            style={{ left: u(left), top: u(102) }}
          >
            ****
          </span>
        ))}
        <span className="absolute font-medium" style={{ left: u(195), top: u(100) }}>
          {card.last4}
        </span>
      </p>

      <p
        className="absolute font-medium"
        style={{ left: u(24), top: u(150), fontSize: u(16), lineHeight: u(22) }}
      >
        {card.holderName}
      </p>

      {/* Centrados entre sí en x=300.5 (centros en y=152.5 y y=170). El
          line-height queda sin unidad (1.5), así que también escala. */}
      <span
        className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-semibold"
        style={{ left: u(300.5), top: u(152.5), fontSize: u(10) }}
      >
        Exp. Date
      </span>
      <span
        className="absolute -translate-x-1/2 -translate-y-1/2 font-semibold"
        style={{ left: u(300.5), top: u(170), fontSize: u(13) }}
      >
        {formatExpiry(card.expMonth, card.expYear)}
      </span>
    </section>
  );
}

function BrandLogo({ brand }: { brand: CardSummary["brand"] }) {
  if (brand === "MASTERCARD") {
    return (
      <Image
        src="/icons/mastercard.svg"
        width={34}
        height={24}
        alt="Mastercard"
        style={{ width: u(34), height: u(24) }}
      />
    );
  }
  return (
    <span className="font-bold tracking-wide" style={{ fontSize: u(14), lineHeight: 1.25 }}>
      VISA
    </span>
  );
}
