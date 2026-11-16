import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import SiteFooter from "./SiteFooter";
import { LEGAL_CONTACT_EMAIL, LEGAL_UPDATED_LABEL } from "@/lib/legal";

export default function LegalLayout({ title, children }: { title: string; children: ReactNode }) {
  return <div className="min-h-screen bg-background">
    <main className="mx-auto max-w-3xl px-4 pb-12 pt-28 sm:px-6 md:pb-20 md:pt-32">
      <header className="text-center"><h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">{title}</h1><p className="mt-3 text-xs text-white/45">Atualizado em {LEGAL_UPDATED_LABEL}</p></header>
      <article className="mt-9 space-y-5 text-sm leading-7 text-white/80 [&_h2]:pt-5 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-white [&_a]:text-red-300 [&_a]:underline [&_a]:underline-offset-4 [&_strong]:font-semibold [&_strong]:text-white">{children}</article>
      <div className="mt-9 rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-sm leading-7 text-white/70"><p>Contato da equipe Foice & Filme:</p><a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="break-all text-red-300 underline underline-offset-4">{LEGAL_CONTACT_EMAIL}</a><p className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs"><Link to="/quem-somos" className="underline underline-offset-4">Quem somos?</Link><Link to="/termos" className="underline underline-offset-4">Termos de Serviço</Link><Link to="/privacidade" className="underline underline-offset-4">Privacidade e cookies</Link></p></div>
    </main>
    <SiteFooter />
  </div>;
}
