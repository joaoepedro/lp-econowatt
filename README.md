# EconoWatt · Landing page de energia solar

Landing page para a **EconoWatt Energia Solar** (Franca/SP): projeto e instalação de sistemas fotovoltaicos para casas, comércios e indústrias. O objetivo único é levar o visitante a **simular a economia e pedir o orçamento no WhatsApp**.

> **Projeto conceitual.** Números da empresa, condições de financiamento e depoimentos são ilustrativos e estão sinalizados na página.

## Funcionalidades

- **Seletor Casa / Comércio / Indústria e agro**: título, textos, valor inicial do simulador e mensagem do WhatsApp mudam conforme o perfil. Também funciona por link: `?perfil=industria`.
- **Título que "cai"**: a palavra "CAI." desce da linha (em Comércio, "CRESCE." sobe), sem movimento para quem desativa animações.
- **Simulador logo abaixo do topo**: a pessoa arrasta ou digita o valor da conta e vê, ao vivo, quanto ela cai e quanto sobra (taxa mínima, iluminação pública e Fio B da Lei 14.300). Cidade, ligação e local das placas são opcionais.
- **Formulário de 2 campos** na mesma faixa: validação acessível, máscara de telefone, honeypot anti-spam e consentimento LGPD. Envia para o Google Sheets com as UTMs e leva à página de obrigado, com a mensagem pronta para o WhatsApp.
- **Rastreamento com consentimento** (Pixel da Meta, Google Tag e Microsoft Clarity): só carregam depois que a pessoa aceita os cookies. Eventos PageView, ViewContent, Contact e Lead (uma vez por inscrição). Sem ID, nada carrega e os eventos aparecem no console.

## Tecnologias

HTML, CSS e JavaScript puros, sem frameworks e sem etapa de build. As fontes (Bebas Neue e Inter, licença OFL) ficam hospedadas no próprio site. Fotos de banco de imagens (Unsplash, uso comercial livre e sem atribuição obrigatória) em WebP.

## Estrutura

```
index.html · obrigado.html · politica-de-privacidade.html · 404.html
css/      style.css (começa pelos tokens de cor, fonte e espaço; depois o reset e o visual)
js/       config.js (painel de controle) · utils.js · tracking.js · simulador.js · form.js · main.js · obrigado.js
assets/   fonts/ · img/ (fotos WebP, favicon, ícone e imagem de compartilhamento; a logo fica embutida no HTML)
integracoes/google-apps-script.js
robots.txt · sitemap.xml · vercel.json · .vercelignore
```

## Como editar

Números, telefone, textos de cada perfil, premissas do simulador e IDs ficam em **`js/config.js`**. Os textos fixos ficam no `index.html`, entre as marcações `<!-- ✏️ EDITÁVEL -->` e `<!-- ✏️ FIM -->`.

## Como rodar no computador

Abra a pasta no VS Code e use a extensão **Live Server** (botão "Go Live"). Não abra o `index.html` com dois cliques: nesse modo o navegador bloqueia as fontes e a logo.

## Planilha de leads

O código fica em `integracoes/google-apps-script.js`. Depois de publicar o Apps Script, cole a URL em `CONFIG.integracoes.planilhaUrl`.

## Publicação

No ar em **https://econowattt.vercel.app/** (Vercel, publicado a partir deste repositório a cada envio). Se o endereço mudar (domínio próprio, por exemplo), troque-o em: `index.html` (canonical, og:url, og:image, JSON-LD), `robots.txt` e `sitemap.xml`.

O `.vercelignore` impede que `docs/`, `integracoes/`, arquivos `.md` e `.bat` sejam publicados. O `404.html` é usado automaticamente pela Vercel e pela Cloudflare para endereços que não existem.

**Ao migrar para a Cloudflare:** a Cloudflare não lê o `vercel.json` nem o `.vercelignore`. Os cabeçalhos de segurança e de cache vão para um arquivo `_headers`, e as pastas que não devem ir para o ar precisam ficar fora da pasta publicada (ou ser removidas num comando de build).

## Qualidade (metas)

Lighthouse 90+ em desempenho e 100 em acessibilidade, boas práticas e SEO; zero erros no axe; sem rolagem lateral de 320 a 1920 px; navegação completa por teclado; respeito a `prefers-reduced-motion`.

---
Projeto conceitual desenvolvido por João Pedro Morais.
