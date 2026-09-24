# 🎯 MatchCV — Gerador de Currículos ATS-friendly (Vibe Coding)

> Projeto do desafio da DIO **"Criando um Gerador de Currículos ATS-friendly com Lovable"**, construído do zero com o [Lovable](https://lovable.dev) a partir de um prompt estruturado (mega prompt), com evolução do prompt e um refinamento real pedido depois da primeira geração — tudo documentado abaixo.

## 🔗 Aplicação publicada

**https://matchcv-ats-friendly.lovable.app/**

Rodando 100% no navegador — nada é enviado para servidores. Cole a vaga, cole o currículo, veja o match e exporte o currículo ajustado em PDF.

## 🧩 O problema que o app resolve

Currículo bom não é garantia de chegar ao RH. Antes de um humano ler qualquer coisa, boa parte das empresas passa os currículos por um **ATS (Applicant Tracking System)** — um robô que filtra candidaturas comparando o texto do currículo com as palavras-chave da vaga. Um candidato pode ter a experiência certa, mas descrita com termos diferentes dos que a vaga usa ("bases de dados" em vez de "banco de dados", por exemplo) e ser descartado antes da triagem humana.

O **MatchCV** ataca esse problema específico: a pessoa cola a descrição da vaga e o próprio currículo, e a aplicação mostra exatamente **o que já bate**, **o que falta** e devolve uma versão do currículo **reorganizada e com os termos certos** — sem nunca inventar experiência que a pessoa não tem.

## 📝 O mega prompt e como ele evoluiu

### Tentativa 1 — um acidente que virou o pontapé inicial

Na hora de colar a especificação completa no chat do Lovable, o campo de mensagem é um editor rico (ProseMirror) onde a tecla **Enter envia a mensagem** em vez de quebrar linha. Ao digitar o título do prompt, o primeiro `Enter` disparou o envio prematuro de uma única linha:

```
# MatchCV - Gerador de Curriculos ATS-friendly
```

O Lovable já criou o projeto e começou a construir a partir só desse título. Em vez de descartar, usei isso como a primeira mensagem do projeto e segui com a especificação completa na mensagem seguinte — o que, aliás, virou um aprendizado real sobre como interagir com o chat do Lovable (ver seção de reflexão).

### Tentativa 2 — o mega prompt completo

Reescrevi a especificação inteira, sem depender de quebras de linha (para não disparar envios acidentais), cobrindo problema, regra inegociável, fluxo, telas e design system:

```markdown
# MatchCV — Gerador de Currículos ATS-friendly

## O que é
Uma aplicação web (React + Tailwind + shadcn/ui) que compara a descrição de uma vaga com o currículo de uma pessoa, mostra o quanto o currículo está alinhado com o que o ATS (Applicant Tracking System) procura, e devolve uma versão ajustada do currículo, mais fácil de passar pela triagem automática.

## Regra inegociável
A aplicação melhora **como a pessoa se apresenta**. Ela nunca inventa experiência, curso, ferramenta ou habilidade que a pessoa não descreveu no currículo original. Todo o ajuste é reorganização, reescrita e destaque do que já existe no texto — nunca invenção. Essa frase precisa aparecer de forma visível na interface (por exemplo, como um aviso fixo próximo ao botão de gerar o currículo ajustado).

## Fluxo principal (precisa funcionar de ponta a ponta)
1. A pessoa cola a descrição da vaga em um campo de texto.
2. A pessoa cola o próprio currículo (texto puro) em outro campo de texto.
3. Ao clicar em "Analisar", a aplicação:
   - Extrai as palavras-chave relevantes da descrição da vaga (competências técnicas, ferramentas, certificações, palavras que se repetem ou aparecem em destaque).
   - Compara essas palavras-chave com o texto do currículo (comparação tolerante a maiúsculas/minúsculas, singular/plural e pequenas variações).
   - Calcula um percentual de compatibilidade (nº de palavras-chave encontradas / total de palavras-chave da vaga).
4. A tela de resultado mostra:
   - Um indicador visual do percentual de match (ex: anel de progresso ou barra, com cor que muda conforme a faixa: vermelho <40%, amarelo 40–70%, verde >70%).
   - As palavras-chave encontradas, como badges verdes.
   - As palavras-chave que faltam, como badges âmbar/vermelhas.
   - Uma versão ajustada do currículo: o mesmo conteúdo do currículo original, reorganizado para colocar as experiências mais relevantes para a vaga em destaque e usando exatamente os termos que aparecem na vaga quando o currículo já descreve aquilo com outras palavras.
   - Ao lado de cada palavra-chave que falta, um texto claro tipo "Você não mencionou isso no currículo — só adicione se realmente tiver essa experiência."
5. Botão para exportar o currículo ajustado em PDF.
6. Botão "Nova análise" para recomeçar.

## Telas
1. **Home**: hero curto explicando o problema e a solução, com botão "Analisar meu currículo".
2. **Análise**: duas áreas de texto grandes lado a lado — "Descrição da vaga" e "Seu currículo" — e o botão "Analisar".
3. **Resultado**: indicador de match, badges de palavras-chave encontradas/faltando, currículo ajustado em um card com opção de copiar o texto e exportar em PDF, e o aviso fixo da regra de não inventar experiência.

## Design system
shadcn/ui (Button, Card, Textarea, Badge, Progress, Tabs, Tooltip) + Tailwind.
Paleta: indigo #6366f1 (primária), emerald #10b981 (sucesso), amber #f59e0b (atenção),
fundo slate claro/escuro, texto slate. Cantos arredondados, espaçamento generoso, suporte a modo claro e escuro.

## Idioma
Toda a interface em português do Brasil.

## Fora de escopo por enquanto
Sem login, sem dashboard, sem banco de dados.
```

## 🤖 Como funciona a análise (o que o Lovable construiu)

- **Tudo roda no navegador**: nenhum texto é enviado ou salvo em servidor — a análise é 100% client-side.
- **Extração de palavras-chave**: a aplicação identifica termos técnicos, ferramentas e competências no texto da vaga.
- **Comparação tolerante**: o cruzamento com o currículo ignora maiúsculas/minúsculas e pequenas variações.
- **Troca de termos, não de fatos**: quando o currículo já descreve algo que a vaga chama de outro jeito (ex.: "bases de dados" → "banco de dados"), a versão ajustada troca o termo — nunca o conteúdo. Isso vale para uma lista de sinônimos comuns, então nem todo sinônimo é reconhecido.
- **Reorganização**: as linhas de experiência mais ligadas à vaga sobem, e uma seção "Competências alinhadas à vaga" aparece no topo do currículo ajustado, só com termos que já existem no currículo da pessoa.
- **Aviso fixo da regra**: "O MatchCV melhora como você se apresenta. Ele nunca inventa experiência, curso, ferramenta ou habilidade que você não descreveu no currículo original — só reorganiza, reescreve e destaca o que já existe" aparece sempre acima do currículo ajustado.

## 🔄 Ajuste que pedi depois da primeira geração (e por quê)

Depois de testar o fluxo de ponta a ponta (colei uma vaga fictícia de "Analista de Suporte Técnico Júnior" e um currículo com match parcial), o app funcionava, mas o botão **"Analisar" ficava clicável mesmo com os campos vazios** — a pessoa podia clicar sem perceber que faltava colar a vaga ou o currículo, sem nenhum retorno visual do porquê nada acontecia.

Pedi ao Lovable:

> "Peco um ajuste: desabilite o botao Analisar quando a descricao da vaga ou o curriculo estiverem vazios, e mostre um aviso curto tipo 'Cole os dois textos para analisar' logo abaixo do botao nesse caso. Isso evita cliques em branco e deixa claro o que falta preencher."

O Lovable implementou exatamente isso: o botão fica desabilitado enquanto falta preencher algo, e o aviso abaixo dele muda dinamicamente ("Cole os dois textos...", "Cole a descrição da vaga..." ou "Cole o seu currículo...", dependendo do que falta). Foi um ajuste pequeno, mas resolve um problema real de usabilidade que só apareceu depois de testar o app de verdade — exatamente o tipo de refinamento que o vibe coding permite fazer rápido, em linguagem natural, sem mexer em código na mão.

## 📱 Telas do app

### Home
<img width="1568" height="688" alt="print-home" src="https://github.com/user-attachments/assets/6a693ff1-ff5d-4322-8422-54e744749932" />

### Análise — validação de campos vazios (depois do ajuste pedido)
<img width="1568" height="688" alt="print-analise-vazia" src="https://github.com/user-attachments/assets/374dc7df-10d0-477f-aa90-8b78c4055c15" />


### Análise — vaga e currículo preenchidos
<img width="1568" height="688" alt="print-analise-preenchida" src="https://github.com/user-attachments/assets/4a0351ed-cb07-4ad1-a0a5-523eb860a222" />


### Resultado da análise
<img width="1568" height="688" alt="print-resultado" src="https://github.com/user-attachments/assets/73b0fdc0-c04e-44e4-93b8-5ebe097deb19" />

## 💭 Reflexão

**O que funcionou bem:** o Lovable entregou, já na primeira geração completa, um app com as três telas, a lógica de match, os badges de palavras-chave e o currículo ajustado — tudo em português e seguindo a paleta de cores pedida. Pedir um ajuste pontual depois de testar (o botão desabilitado) mostrou como o fluxo de "descrever em português o que está errado" é rápido comparado a abrir o código e mexer manualmente.

**O que não saiu de primeira:** o próprio processo de escrever o prompt teve percalços — o chat do Lovable trata `Enter` como "enviar mensagem", não como quebra de linha, então uma mensagem longa digitada com quebras de linha literais dispara envios parciais. Tive que reescrever a especificação evitando depender de `Enter` no meio do texto. Foi um lembrete de que "vibe coding" também exige entender as particularidades da ferramenta, não só saber o que pedir.

**O que aprendi:** um prompt bem estruturado (problema, regra inegociável, fluxo passo a passo, telas, design system) reduz muito a distância entre a primeira geração e um app utilizável. E o valor de testar de verdade antes de considerar pronto: só ao usar o app com dados de exemplo percebi a falta de validação nos campos — algo que não estava no prompt original e só apareceu com o uso real.

---

Desafio da trilha **"Riachuelo: Criando produtos com IA"** — Digital Innovation One (DIO).
