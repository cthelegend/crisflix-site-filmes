import { FormEvent, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
  const { configured, loading, signIn, signUp, user } = useAuth();

  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, []);

  if (!loading && user) {
    return <Navigate to="/profile" replace />;
  }

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
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(229,9,20,0.28),transparent_28%),linear-gradient(180deg,rgba(0,0,0,0.35),rgba(0,0,0,0.88))]" />
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80')", backgroundSize: "cover", backgroundPosition: "center" }} />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <section className="w-full max-w-md rounded-[2rem] border border-white/10 bg-black/72 p-5 backdrop-blur-2xl sm:p-7">
          <p className="text-center text-3xl font-bold tracking-[0.16em] text-primary" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            CRISFLIX
          </p>
          <h1 className="mt-6 text-center text-3xl font-bold text-white">
            {mode === "login" ? "Entrar" : "Criar conta"}
          </h1>
          <p className="mt-3 text-center text-sm leading-6 text-white/58">
            Salve favoritos, organize sua lista e continue assistindo com seu perfil.
          </p>

          {!configured && (
            <div className="mt-6 rounded-[1.3rem] border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-6 text-amber-50">
              Configure o Supabase para ativar contas reais.
            </div>
          )}

          <div className="mt-6 flex gap-2 rounded-full border border-white/10 bg-white/[0.04] p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-full px-4 py-2.5 text-sm transition-colors ${
                mode === "login" ? "bg-white text-black" : "text-white/68 hover:text-white"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-full px-4 py-2.5 text-sm transition-colors ${
                mode === "signup" ? "bg-white text-black" : "text-white/68 hover:text-white"
              }`}
            >
              Cadastro
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div>
                <label className="mb-2 block text-sm text-white/70">Nome do perfil</label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="h-12 rounded-2xl border-white/10 bg-white/[0.04] text-white"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm text-white/70">E-mail</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-2xl border-white/10 bg-white/[0.04] text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/70">Senha</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-12 rounded-2xl border-white/10 bg-white/[0.04] text-white"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting || !configured}
              className="mt-2 h-12 w-full rounded-full border border-white bg-white px-7 text-sm font-semibold text-black transition-colors duration-200 hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Carregando..." : mode === "login" ? "Entrar" : "Criar conta"}
            </Button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default AuthPage;
