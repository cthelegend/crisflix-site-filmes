import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

function getAuthErrorMessage(error: unknown) {
  if (!(error instanceof Error)) return "Não foi possível continuar.";

  const message = error.message.toLowerCase();

  if (message.includes("rate limit") || message.includes("security purposes")) {
    return "Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.";
  }

  if (message.includes("already registered") || message.includes("already been registered")) {
    return "Este e-mail já está cadastrado. Use o login para entrar.";
  }

  if (message.includes("invalid login credentials")) {
    return "E-mail ou senha incorretos.";
  }

  if (message.includes("email not confirmed")) {
    return "Confirme seu e-mail antes de entrar.";
  }

  return error.message || "Não foi possível continuar.";
}

const AuthPage = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { configured, loading, signIn, signUp, user } = useAuth();

  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, []);

  if (!loading && user) {
    return <Navigate to="/profile" replace />;
  }

  const switchMode = (nextMode: "login" | "signup") => {
    setMode(nextMode);
    window.setTimeout(() => {
      if (nextMode === "signup") {
        nameInputRef.current?.focus();
        return;
      }

      emailInputRef.current?.focus();
    }, 0);
  };

  const focusOnEnter = (event: KeyboardEvent<HTMLInputElement>, nextInput?: HTMLInputElement | null) => {
    if (event.key !== "Enter" || !nextInput) return;
    event.preventDefault();
    nextInput.focus();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (mode === "login") {
        await signIn(email, password);
        toast.success("Login realizado com sucesso.");
      } else {
        await signUp(email, password, displayName.trim());
        toast.success("Conta criada com sucesso.");
      }

      navigate("/profile");
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
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
            Organize sua lista e continue assistindo com seu perfil.
          </p>

          {!configured && (
            <div className="mt-6 rounded-[1.3rem] border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-6 text-amber-50">
              Configure o Supabase para ativar contas reais.
            </div>
          )}

          <div className="mt-6 flex gap-2 rounded-full border border-white/10 bg-white/[0.04] p-1">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 rounded-full px-4 py-2.5 text-sm transition-colors ${
                mode === "login" ? "bg-white text-black" : "text-white/68 hover:text-white"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
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
                  ref={nameInputRef}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  onKeyDown={(e) => focusOnEnter(e, emailInputRef.current)}
                  required
                  className="h-12 rounded-2xl border-white/10 bg-white/[0.04] text-white"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm text-white/70">E-mail</label>
              <Input
                ref={emailInputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => focusOnEnter(e, passwordInputRef.current)}
                required
                className="h-12 rounded-2xl border-white/10 bg-white/[0.04] text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/70">Senha</label>
              <Input
                ref={passwordInputRef}
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
