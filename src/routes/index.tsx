import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileSearch, ShieldCheck, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MatchCV — Currículo ATS-friendly para cada vaga" },
      { name: "description", content: "Compare seu currículo com a vaga, veja o match com o ATS e exporte uma versão ajustada — sem inventar nada." },
      { property: "og:title", content: "MatchCV — Currículo ATS-friendly para cada vaga" },
      { property: "og:description", content: "Compare seu currículo com a vaga, veja o match com o ATS e exporte uma versão ajustada." },
    ],
  }),
  component: Index,
});

const steps = [
  { icon: FileSearch, title: "Cole a vaga e o currículo", text: "Sem cadastro. Tudo acontece no seu navegador." },
  { icon: Target, title: "Veja o seu match", text: "Palavras-chave encontradas e as que faltam, com percentual." },
  { icon: ShieldCheck, title: "Exporte a versão ajustada", text: "Reorganizada com os termos da vaga. Nada inventado." },
];

function Index() {
  return (
    <main className="bg-hero">
      <section className="mx-auto max-w-3xl px-6 pb-16 pt-20 text-center md:pt-28">
        <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
          Gerador de currículos ATS-friendly
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-balance md:text-6xl">
          Seu currículo é bom. O robô é que não deixa ele chegar no RH.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground text-pretty">
          Os sistemas ATS barram currículos que não usam as palavras da vaga. O MatchCV mostra o que está faltando e
          reorganiza o que você já tem para passar pela triagem.
        </p>
        <Button asChild size="lg" className="mt-10 rounded-xl px-7">
          <Link to="/analise">
            Analisar meu currículo <ArrowRight className="ml-1 size-4" />
          </Link>
        </Button>
      </section>
      <section className="mx-auto grid max-w-5xl gap-4 px-6 pb-24 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.title} className="rounded-xl border bg-card p-6 shadow-card">
            <s.icon className="size-5 text-primary" />
            <h3 className="mt-4 font-semibold">{s.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
