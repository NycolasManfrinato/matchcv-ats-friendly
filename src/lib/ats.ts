// Motor de análise ATS — roda 100% no navegador, sem inventar conteúdo.

const STOPWORDS = new Set(
  `a o as os um uma uns umas de do da dos das em no na nos nas por pelo pela pelos pelas para pra com sem sob sobre entre ate apos e ou mas que se como mais menos muito muita muitos muitas ja nao sim seu sua seus suas nosso nossa nossos nossas voce voces ele ela eles elas isso isto esse essa este esta aquele aquela ser estar ter haver sera sao foi era sera tem temos terao possuir possui buscamos procuramos vaga vagas empresa time equipe area cargo candidato candidata pessoa pessoas profissional oportunidade requisitos requisito desejavel desejaveis diferencial diferenciais responsabilidades atividades beneficios beneficio conhecimento conhecimentos experiencia experiencias anos ano nivel bom boa otimo otima forte fortes capacidade habilidade habilidades etc pleno senior junior estagio estagiario desenvolvedor desenvolvedora analista dia dias trabalho trabalhar atuar atuacao junto junto parte todo toda todos todas cada qualquer onde quando qual quais tambem bem assim ainda so sempre the and or of to in for with on at by an be is are as we you our your will from this that have has it its us who can all any more work team role job years year experience knowledge skills strong good ability plus nice using use including within across other such well new`.split(
    /\s+/,
  ),
);

// Termos técnicos comuns (normalizados) — ajudam a identificar ferramentas/certificações.
const KNOWN_TERMS = [
  "javascript", "typescript", "python", "java", "c#", "c++", "go", "golang", "rust", "php", "ruby", "kotlin", "swift",
  "react", "angular", "vue", "next.js", "node.js", "nodejs", "express", "django", "flask", "spring", "laravel", ".net",
  "html", "css", "tailwind", "sass", "sql", "nosql", "postgresql", "mysql", "mongodb", "redis", "oracle",
  "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "terraform", "linux", "git", "github", "gitlab", "ci/cd",
  "jenkins", "rest", "api", "apis", "graphql", "microsservicos", "microservices", "scrum", "kanban", "agile", "agil",
  "jira", "confluence", "figma", "excel", "power bi", "powerbi", "tableau", "sap", "salesforce", "crm", "erp",
  "machine learning", "data science", "pandas", "spark", "hadoop", "etl", "bi", "seo", "sem", "google ads", "analytics",
  "ux", "ui", "pmp", "itil", "cobit", "six sigma", "lean", "okr", "kpi", "kpis", "b2b", "b2c", "saas",
  "ingles", "espanhol", "english", "lideranca", "comunicacao", "negociacao", "gestao de projetos", "testes", "qa",
  "selenium", "cypress", "jest", "devops", "scrum master", "product owner", "photoshop", "illustrator", "autocad",
];

// Equivalências: se a vaga usa a chave e o currículo usa uma das variações, trocamos pelo termo da vaga.
const EQUIVALENTS: Record<string, string[]> = {
  javascript: ["js"],
  typescript: ["ts"],
  "node.js": ["node", "nodejs"],
  postgresql: ["postgres"],
  kubernetes: ["k8s"],
  "google cloud": ["gcp"],
  "power bi": ["powerbi"],
  "machine learning": ["aprendizado de maquina", "ml"],
  "metodologias ageis": ["scrum", "agile", "agil"],
  lideranca: ["lider", "liderei", "liderou", "gestao de equipe", "coordenei"],
  comunicacao: ["comunicativo", "comunicativa"],
  "trabalho em equipe": ["colaboracao", "colaborativo", "colaborativa"],
  ingles: ["english", "lingua inglesa"],
  "gestao de projetos": ["gerenciamento de projetos", "project management"],
  microsservicos: ["microservices", "microservicos"],
  "atendimento ao cliente": ["atendimento", "suporte ao cliente", "customer success"],
};

export function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function stem(word: string) {
  let w = word;
  if (w.length > 4 && w.endsWith("oes")) w = w.slice(0, -3) + "ao";
  else if (w.length > 4 && w.endsWith("aes")) w = w.slice(0, -3) + "ao";
  else if (w.length > 4 && w.endsWith("ies")) w = w.slice(0, -3) + "y";
  else if (w.length > 4 && w.endsWith("res")) w = w.slice(0, -2);
  else if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) w = w.slice(0, -1);
  return w;
}

function tokens(text: string) {
  return normalize(text)
    .split(/[^a-z0-9#+.\/]+/)
    .map((t) => t.replace(/^[.\/]+|[.\/]+$/g, ""))
    .filter(Boolean);
}

function stemPhrase(p: string) {
  return tokens(p).map(stem).join(" ");
}

export type Keyword = { term: string; key: string; weight: number };

export function extractKeywords(job: string): Keyword[] {
  const norm = normalize(job);
  const toks = tokens(job);
  const found = new Map<string, Keyword>();
  const add = (term: string, weight: number) => {
    const key = stemPhrase(term);
    if (!key || key.length < 2) return;
    const cur = found.get(key);
    if (cur) cur.weight += weight;
    else found.set(key, { term, key, weight });
  };

  // 1) termos técnicos conhecidos
  for (const t of KNOWN_TERMS) {
    const re = new RegExp(`(^|[^a-z0-9])${t.replace(/[.*+?^${}()|[\]\\#]/g, "\\$&")}s?($|[^a-z0-9])`, "g");
    const m = norm.match(re);
    if (m) add(t, 3 + m.length);
  }
  for (const k of Object.keys(EQUIVALENTS)) if (norm.includes(k)) add(k, 3);

  // 2) siglas e palavras em destaque (maiúsculas no original)
  const orig = job.match(/(?<![\p{L}\d])\p{Lu}[\p{L}\d+#.\-]+/gu) ?? [];
  const firstWords = new Set(
    job.split(/[.\n:;!?•\-]\s*/).map((s) => s.trim().split(/\s+/)[0] ?? ""),
  );
  for (const raw of orig) {
    const w = raw.replace(/[.\-]+$/, "");
    const n = normalize(w);
    if (STOPWORDS.has(n) || n.length < 2) continue;
    const isAcronym = /^[A-Z0-9+#.]{2,}$/.test(w) && w.length <= 6;
    if (!isAcronym && firstWords.has(w)) continue;
    add(n, isAcronym ? 3 : 2);
  }

  // 3) palavras e pares repetidos
  const freq = new Map<string, number>();
  toks.forEach((t) => {
    if (STOPWORDS.has(t) || t.length < 4 || /^\d+$/.test(t)) return;
    freq.set(t, (freq.get(t) ?? 0) + 1);
  });
  freq.forEach((c, t) => c >= 2 && add(t, c));
  const bi = new Map<string, number>();
  for (let i = 0; i < toks.length - 1; i++) {
    const a = toks[i]!, b = toks[i + 1]!;
    if (STOPWORDS.has(a) || STOPWORDS.has(b) || a.length < 3 || b.length < 3) continue;
    const p = `${a} ${b}`;
    bi.set(p, (bi.get(p) ?? 0) + 1);
  }
  bi.forEach((c, p) => c >= 2 && add(p, c + 1));

  // remove termos contidos em outros com peso maior e limita
  let list = [...found.values()].sort((a, b) => b.weight - a.weight);
  list = list.filter(
    (k) => !list.some((o) => o !== k && o.weight >= k.weight && o.key.includes(" ") && o.key.split(" ").includes(k.key) && k.weight < 4),
  );
  return list.slice(0, 25);
}

function containsPhrase(stemmedText: string, key: string) {
  return (` ${stemmedText} `).includes(` ${key} `);
}

export type Analysis = {
  score: number;
  found: string[];
  missing: string[];
  adjusted: string;
};

export function analyze(job: string, resume: string): Analysis {
  const keywords = extractKeywords(job);
  const resumeStem = stemPhrase(resume);
  const found: Keyword[] = [];
  const missing: Keyword[] = [];
  const replacements: [string, string][] = [];

  for (const k of keywords) {
    if (containsPhrase(resumeStem, k.key)) {
      found.push(k);
      continue;
    }
    const eq = EQUIVALENTS[normalize(k.term)];
    const variant = eq?.find((v) => containsPhrase(resumeStem, stemPhrase(v)));
    if (variant) {
      found.push(k);
      if (!normalize(job).includes(normalize(variant))) replacements.push([variant, displayTerm(k.term, job)]);
    } else missing.push(k);
  }

  const total = keywords.reduce((s, k) => s + k.weight, 0) || 1;
  const got = found.reduce((s, k) => s + k.weight, 0);
  const score = Math.round((got / total) * 100);

  return {
    score,
    found: found.map((k) => displayTerm(k.term, job)),
    missing: missing.map((k) => displayTerm(k.term, job)),
    adjusted: buildAdjusted(resume, found.map((k) => k.key), replacements, found.map((k) => displayTerm(k.term, job))),
  };
}

// Recupera a grafia original do termo na vaga.
function displayTerm(term: string, job: string) {
  const nj = normalize(job);
  const idx = nj.indexOf(term);
  if (idx >= 0) return job.slice(idx, idx + term.length);
  return term;
}

function buildAdjusted(resume: string, keys: string[], replacements: [string, string][], foundTerms: string[]) {
  let text = resume.replace(/\r/g, "");
  // Usa exatamente o termo da vaga onde o currículo já descreve a mesma coisa.
  for (const [variant, term] of replacements) {
    const re = new RegExp(`\\b${variant.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    text = text.replace(re, (m) => (normalize(m) === normalize(term) ? m : term));
  }

  const hits = (s: string) => {
    const st = stemPhrase(s);
    return keys.reduce((n, k) => n + (containsPhrase(st, k) ? 1 : 0), 0);
  };
  const isBullet = (l: string) => /^\s*([-•*▪·]|\d+[.)])\s+/.test(l);

  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  if (!blocks.length) return text;
  const [header, ...rest] = blocks;

  // Dentro de cada bloco, bullets mais relevantes sobem (preservando o título).
  const sorted = rest.map((block) => {
    const lines = block.split("\n");
    const out: string[] = [];
    let group: string[] = [];
    const flush = () => {
      group.sort((a, b) => hits(b) - hits(a));
      out.push(...group);
      group = [];
    };
    for (const l of lines) {
      if (isBullet(l)) group.push(l);
      else {
        flush();
        out.push(l);
      }
    }
    flush();
    return out.join("\n");
  });

  const summary = foundTerms.length
    ? `COMPETÊNCIAS ALINHADAS À VAGA\n${foundTerms.join(" • ")}`
    : "";

  return [header, summary, ...sorted].filter(Boolean).join("\n\n");
}

export function matchLevel(score: number) {
  if (score < 40) return "low" as const;
  if (score <= 70) return "mid" as const;
  return "high" as const;
}

export const STORAGE_KEY = "matchcv:input";
