"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    setCarregando(false);

    if (error) {
      setErro("E-mail ou senha incorretos. Tente novamente.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm rounded-lg border-2 border-paperLine/50 bg-white p-8">
        <p className="text-sm font-bold uppercase tracking-widest text-flame">
          serve bem
        </p>
        <h1 className="mt-1 font-display text-3xl tracking-wide text-ink">
          Painel do restaurante
        </h1>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-ink/70">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border-2 border-paperLine/60 bg-white px-3 py-2 text-ink outline-none"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="senha" className="block text-sm font-bold text-ink/70">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="mt-1 w-full rounded-md border-2 border-paperLine/60 bg-white px-3 py-2 text-ink outline-none"
              autoComplete="current-password"
            />
          </div>

          {erro && (
            <p className="text-sm text-red-700" role="alert">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-md bg-flame px-4 py-2 font-bold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
