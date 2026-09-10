import { FRETE_GRATIS_A_PARTIR_DE } from "@/lib/loja";
import { formatarPreco } from "@/lib/format";

export default function PromoBar() {
  return (
    <div className="bg-ink px-4 py-2 text-center text-xs font-bold uppercase tracking-wide text-bg">
      Frete grátis acima de {formatarPreco(FRETE_GRATIS_A_PARTIR_DE)} · Pagamento via Pix
    </div>
  );
}
