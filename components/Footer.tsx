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
    <footer className="border-t border-charline bg-night px-6 py-12 text-cream sm:px-10">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 sm:grid-cols-3">
        <div>
          <p className="font-display text-2xl tracking-wide">SERVE BEM</p>
          <p className="mt-2 text-sm text-cream/60">
            Hambúrgueres artesanais feitos na brasa.
          </p>
          <p className="mt-4 text-sm text-cream/60">
            Rua Exemplo, 123 — Bairro, Cidade/UF
          </p>
          <p className="mt-1 text-sm text-cream/60">
            <a
              href="https://wa.me/5500000000000"
              className="underline decoration-flame underline-offset-2"
            >
              (00) 00000-0000
            </a>
            {" · "}
            <a
              href="https://instagram.com/servebem"
              className="underline decoration-flame underline-offset-2"
            >
              @servebem
            </a>
          </p>
        </div>

        <div>
          <p className="font-display text-lg tracking-wide text-mustard">
            Horário de funcionamento
          </p>
          <ul className="mt-2 space-y-1 text-sm text-cream/60">
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
          <p className="font-display text-lg tracking-wide text-mustard">
            Formas de pagamento
          </p>
          <p className="mt-2 text-sm text-cream/60">
            Pix, dinheiro e cartão na entrega/retirada.
          </p>
        </div>
      </div>

      <p className="mx-auto mt-10 max-w-5xl border-t border-charline pt-6 text-xs text-cream/30">
        © {new Date().getFullYear()} Serve Bem Hamburgueria
      </p>
    </footer>
  );
}
