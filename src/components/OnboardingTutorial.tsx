import { useEffect, useState } from "react";
import { Bookmark, PlayCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserProfile } from "@/contexts/AuthContext";

interface OnboardingTutorialProps {
  userId?: string | null;
  activeProfile: UserProfile | null;
}

const getTutorialKey = (userId: string, profileId: string) => `crisflix-tutorial-${userId}-${profileId}`;

const tutorialItems = [
  {
    icon: Search,
    title: "Pesquise rápido",
    description: "Use a busca no topo ou aperte / para encontrar filmes, séries e gêneros sem sair do fluxo.",
  },
  {
    icon: PlayCircle,
    title: "Continue de onde parou",
    description: "Quando você começar a assistir e sair no meio, o título aparece em Continuar Assistindo.",
  },
  {
    icon: Bookmark,
    title: "Monte sua lista",
    description: "Adicione títulos em Minha Lista para separar o que quer ver depois.",
  },
];

const OnboardingTutorial = ({ userId, activeProfile }: OnboardingTutorialProps) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!userId || !activeProfile?.id) return;

    const key = getTutorialKey(userId, activeProfile.id);
    if (localStorage.getItem(key)) return;

    const timer = window.setTimeout(() => setOpen(true), 700);
    return () => window.clearTimeout(timer);
  }, [activeProfile?.id, userId]);

  const closeTutorial = () => {
    if (userId && activeProfile?.id) {
      localStorage.setItem(getTutorialKey(userId, activeProfile.id), "seen");
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : closeTutorial())}>
      <DialogContent className="max-w-[92vw] rounded-[2rem] border-white/10 bg-black/[0.92] p-5 text-white shadow-[0_30px_100px_rgba(0,0,0,0.65)] sm:max-w-lg sm:p-7">
        <DialogHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">Primeiro acesso</p>
          <DialogTitle className="text-2xl font-bold text-white sm:text-3xl">Seu painel está pronto</DialogTitle>
          <DialogDescription className="text-sm leading-6 text-white/62">
            Um guia rápido para você navegar melhor pelo FOICE & FILME.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 grid gap-3">
          {tutorialItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex gap-3 rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/16 text-primary">
                  <Icon size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-white/56">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <Button
          type="button"
          onClick={closeTutorial}
          className="mt-3 h-12 w-full rounded-full border border-white bg-white text-sm font-semibold text-black hover:bg-black hover:text-white"
        >
          Entendi
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingTutorial;
