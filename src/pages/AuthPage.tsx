import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

const AuthPage = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { configured, signIn, signUp } = useAuth();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (mode === "login") {
        await signIn(email, password);
        toast.success("Login realizado com sucesso.");
      } else {
        await signUp(email, password, displayName.trim());
        toast.success("Conta criada. Confira seu e-mail para confirmar o cadastro, se necessário.");
      }

      navigate("/profile");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível continuar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="px-4 pb-16 pt-24 md:px-12 md:pt-28">
        <section className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:p-7 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.34em] text-primary/80 md:text-sm md:tracking-[0.35em]">
                Conta
              </p>
              <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                Entre ou crie sua conta
              </h1>
              <p className="mt-5 text-sm leading-7 text-white/68 md:text-base">
                Salve favoritos, organize sua lista, continue assistindo em qualquer dispositivo e personalize seu perfil.
              </p>

              {!configured && (
                <div className="mt-6 rounded-[1.6rem] border border-amber-400/30 bg-amber-400/10 p-5 text-sm leading-7 text-amber-50">
                  Preencha <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> para ativar contas reais.
                </div>
              )}
            </div>

            <div className="rounded-[1.8rem] border border-white/10 bg-black/35 p-5">
              <div className="mb-5 flex gap-2 rounded-full border border-white/10 bg-white/[0.04] p-1">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`flex-1 rounded-full px-4 py-2 text-sm transition-colors ${
                    mode === "login" ? "bg-white text-black" : "text-white/68 hover:text-white"
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={`flex-1 rounded-full px-4 py-2 text-sm transition-colors ${
                    mode === "signup" ? "bg-white text-black" : "text-white/68 hover:text-white"
                  }`}
                >
                  Cadastro
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div>
                    <label className="mb-2 block text-sm text-white/70">Nome de perfil</label>
                    <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm text-white/70">E-mail</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">Senha</label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>

                <Button
                  type="submit"
                  disabled={submitting || !configured}
                  className="mt-2 h-12 rounded-full border border-white bg-white px-7 text-sm font-semibold text-black transition-colors duration-200 hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Carregando..." : mode === "login" ? "Entrar" : "Criar conta"}
                </Button>
              </form>

              <p className="mt-5 text-sm text-white/54">
                Ao continuar, você poderá sincronizar favoritos, minha lista e o progresso real de reprodução.
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default AuthPage;
