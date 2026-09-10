import Link from "next/link";
import { horarioFuncionamento } from "@/lib/horarioFuncionamento";

const NOMES_DIAS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface text-ink">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-12 sm:grid-cols-3 sm:px-10">
        <div>
          <p className="text-lg font-extrabold tracking-tight">VERO STORE</p>
          <p className="mt-2 text-sm text-inkSoft">
            Moda alternativa fora do padrão.
          </p>
          <p className="mt-4 text-sm text-inkSoft">
            Rua Exemplo, 123 — Bairro, Cidade/UF
          </p>
          <p className="mt-1 text-sm text-inkSoft">
            <a href="https://wa.me/5500000000000" className="underline underline-offset-2 hover:text-ink">
              (00) 00000-0000
            </a>
            {" · "}
            <a
              href="https://instagram.com/verostore"
              className="underline underline-offset-2 hover:text-ink"
            >
              @verostore
            </a>
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-ink">
            Horário de funcionamento
          </p>
          <ul className="mt-2 space-y-1 text-sm text-inkSoft">
            {NOMES_DIAS.map((nome, indice) => {
              const horario = horarioFuncionamento[indice];
              return (
                <li key={nome} className="flex justify-between gap-4">
                  <span>{nome}</span>
                  <span>
                    {horario ? `${horario.abre} – ${horario.fecha}` : "Fechado"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-ink">
            Pagamento e entrega
          </p>
          <p className="mt-2 text-sm text-inkSoft">
            Pagamento via Pix. Retirada na loja ou entrega combinada no
            checkout.
          </p>
          <Link
            href="/meus-pedidos"
            className="mt-3 inline-block text-sm font-bold text-ink underline underline-offset-2"
          >
            Já comprou? Acompanhe seu pedido
          </Link>
        </div>
      </div>

      <p className="border-t border-line px-6 py-6 text-center text-xs text-inkSoft sm:px-10">
        © {new Date().getFullYear()} Vero Store
      </p>
    </footer>
  );
}
