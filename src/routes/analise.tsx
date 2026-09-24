import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { STORAGE_KEY } from "@/lib/ats";

export const Route = createFileRoute("/analise")({
  head: () => ({
    meta: [
      { title: "Analisar currículo — MatchCV" },
      { name: "description", content: "Cole a descrição da vaga e o seu currículo para calcular a compatibilidade com o ATS." },
      { property: "og:title", content: "Analisar currículo — MatchCV" },
      { property: "og:description", content: "Cole a vaga e o currículo e descubra seu match com o ATS." },
    ],
  }),
  component: Analise,
});

function Analise() {
  const navigate = useNavigate();
  const [job, setJob] = useState("");
  const [resume, setResume] = useState("");
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const d = JSON.parse(saved);
      setJob(d.job ?? "");
      setResume(d.resume ?? "");
    }
  }, []);
  const ready = job.trim().length > 30 && resume.trim().length > 30;

  const submit = () => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ job, resume }));
    navigate({ to: "/resultado" });
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Nova análise</h1>
      <p className="mt-2 text-muted-foreground">Cole os dois textos abaixo. Nada é enviado para servidores.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {[
          { label: "Descrição da vaga", desc: "Cole o anúncio completo, com requisitos.", value: job, set: setJob, ph: "Ex.: Buscamos Desenvolvedor(a) Front-end com React, TypeScript..." },
          { label: "Seu currículo", desc: "Cole o texto do seu currículo atual.", value: resume, set: setResume, ph: "Ex.: Maria Silva\nDesenvolvedora Front-end\n\nEXPERIÊNCIA\n- ..." },
        ].map((f) => (
          <Card key={f.label} className="rounded-xl shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">{f.label}</CardTitle>
              <CardDescription>{f.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                placeholder={f.ph}
                className="min-h-[360px] resize-y rounded-xl text-sm leading-relaxed"
              />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8 flex flex-col items-center gap-2">
        <Button size="lg" className="rounded-xl px-10" disabled={!ready} onClick={submit}>
          <Sparkles className="mr-1 size-4" /> Analisar
        </Button>
        {!ready && <p className="text-xs text-muted-foreground">Preencha os dois campos para continuar.</p>}
      </div>
    </main>
  );
}
