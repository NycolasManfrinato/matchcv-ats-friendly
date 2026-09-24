import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Copy, Download, RotateCcw, ShieldAlert, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { analyze, matchLevel, STORAGE_KEY, type Analysis } from "@/lib/ats";
import { exportResumePdf } from "@/lib/pdf";

export const Route = createFileRoute("/resultado")({
  head: () => ({
    meta: [
      { title: "Resultado do match — MatchCV" },
      { name: "description", content: "Veja seu percentual de compatibilidade com a vaga e baixe o currículo ajustado em PDF." },
      { property: "og:title", content: "Resultado do match — MatchCV" },
      { property: "og:description", content: "Percentual de match, palavras-chave e currículo ajustado." },
    ],
  }),
  component: Resultado,
});

const RULE =
  "O MatchCV melhora como você se apresenta. Ele nunca inventa experiência, curso, ferramenta ou habilidade que você não descreveu no currículo original — só reorganiza, reescreve e destaca o que já existe.";

const levelStyle = {
  low: { bar: "bg-destructive", text: "text-destructive", label: "Match baixo" },
  mid: { bar: "bg-warning", text: "text-warning", label: "Match médio" },
  high: { bar: "bg-success", text: "text-success", label: "Match alto" },
};

function Resultado() {
  const navigate = useNavigate();
  const [data, setData] = useState<{ result: Analysis; original: string } | null>(null);
  const [empty, setEmpty] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return setEmpty(true);
    const { job, resume } = JSON.parse(saved);
    setData({ result: analyze(job, resume), original: resume });
  }, []);

  const reset = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    navigate({ to: "/analise" });
  };

  if (empty)
    return (
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">Nenhuma análise encontrada</h1>
        <p className="mt-2 text-muted-foreground">Comece colando a vaga e o seu currículo.</p>
        <Button asChild className="mt-6 rounded-xl">
          <Link to="/analise">Analisar meu currículo</Link>
        </Button>
      </main>
    );
  if (!data) return <main className="min-h-[60vh]" />;

  const { result, original } = data;
  const lvl = levelStyle[matchLevel(result.score)];

  const copy = async () => {
    await navigator.clipboard.writeText(result.adjusted);
    setCopied(true);
    toast.success("Currículo copiado");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TooltipProvider>
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Resultado da análise</h1>
          <Button variant="outline" className="rounded-xl" onClick={reset}>
            <RotateCcw className="mr-1 size-4" /> Nova análise
          </Button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="space-y-6">
            <Card className="rounded-xl shadow-card">
              <CardHeader className="pb-2">
                <CardDescription>Compatibilidade com a vaga</CardDescription>
                <CardTitle className={`text-5xl font-bold ${lvl.text}`}>{result.score}%</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={result.score} className="h-3 bg-muted" indicatorClassName={lvl.bar} />
                <p className={`mt-3 text-sm font-medium ${lvl.text}`}>{lvl.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {result.found.length} de {result.found.length + result.missing.length} palavras-chave encontradas
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Encontradas no currículo</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {result.found.length ? (
                  result.found.map((k) => (
                    <Badge key={k} variant="success" className="rounded-lg">
                      <Check className="mr-1 size-3" /> {k}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma palavra-chave encontrada ainda.</p>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Faltando no currículo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.missing.length ? (
                  result.missing.map((k) => (
                    <div key={k} className="flex flex-col gap-1">
                      <Badge variant="warning" className="w-fit rounded-lg">{k}</Badge>
                      <p className="text-xs text-muted-foreground">
                        Você não mencionou isso no currículo, só adicione se realmente tiver essa experiência.
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Seu currículo cobre todas as palavras-chave.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-xl shadow-card">
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
              <div>
                <CardTitle className="text-lg">Currículo ajustado</CardTitle>
                <CardDescription>Mesmo conteúdo, reorganizado com os termos da vaga.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-xl" onClick={copy} aria-label="Copiar texto">
                      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copiar texto</TooltipContent>
                </Tooltip>
                <Button className="rounded-xl" onClick={() => exportResumePdf(result.adjusted)}>
                  <Download className="mr-1 size-4" /> Exportar PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-3 rounded-xl border border-primary/30 bg-accent p-4 text-sm text-accent-foreground">
                <ShieldAlert className="mt-0.5 size-4 shrink-0" />
                <p>{RULE}</p>
              </div>
              <Tabs defaultValue="ajustado">
                <TabsList className="rounded-xl">
                  <TabsTrigger value="ajustado">Ajustado</TabsTrigger>
                  <TabsTrigger value="original">Original</TabsTrigger>
                </TabsList>
                <TabsContent value="ajustado">
                  <pre className="max-h-[640px] overflow-auto whitespace-pre-wrap rounded-xl bg-muted/50 p-5 font-sans text-sm leading-relaxed">
                    {result.adjusted}
                  </pre>
                </TabsContent>
                <TabsContent value="original">
                  <pre className="max-h-[640px] overflow-auto whitespace-pre-wrap rounded-xl bg-muted/50 p-5 font-sans text-sm leading-relaxed">
                    {original}
                  </pre>
                </TabsContent>
              </Tabs>
              <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="size-3.5" /> Revise o texto antes de enviar. Você é quem conhece sua trajetória.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </TooltipProvider>
  );
}
