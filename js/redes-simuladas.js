/* =====================================================================
   Redes simuladas (versão portfólio)
   ---------------------------------------------------------------------
   Qualquer link para o WhatsApp (wa.me) ou para o Instagram abre um card
   que imita a rede, sem sair da página e sem contatar ninguém de verdade.
   Os dados mostrados são FICTÍCIOS.

   Para voltar a abrir as redes reais: remova a linha
   <script src="js/redes-simuladas.js" defer></script> das páginas.
   ===================================================================== */

(function () {
  "use strict";

  const cfg = (typeof CONFIG !== "undefined" && CONFIG.empresa) ? CONFIG.empresa : {};

  /* ---------- Dados fictícios ---------- */
  const DADOS = {
    nome: "EconoWatt Energia Solar",
    telefone: cfg.whatsappExibicao || "(16) 99000-0000",
    usuario: "econowatt.solar.demo",
    cidade: cfg.cidade || "Franca/SP",
    publicacoes: 48,
    seguidores: "2.315",
    seguindo: 180
  };

  // Pasta das imagens, calculada a partir deste arquivo (funciona em qualquer página)
  const script = document.currentScript;
  const IMG = script ? new URL("../assets/img/", script.src).href : "assets/img/";

  /* ---------- Utilidades ---------- */
  function el(tag, classe, texto) {
    const e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto != null) e.textContent = texto;
    return e;
  }
  function hora() {
    const d = new Date();
    return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  }
  const ICONE_FECHAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>';

  /* ---------- Camada (modal) ---------- */
  let camada = null;
  let focoAnterior = null;

  function abrirCamada(card, rotulo) {
    fechar();
    focoAnterior = document.activeElement;
    camada = el("div", "rs-camada");
    camada.setAttribute("role", "dialog");
    camada.setAttribute("aria-modal", "true");
    camada.setAttribute("aria-label", rotulo);
    camada.appendChild(card);
    camada.addEventListener("click", function (e) { if (e.target === camada) fechar(); });
    document.body.appendChild(camada);
    document.documentElement.classList.add("rs-aberto");
    requestAnimationFrame(function () { camada.classList.add("is-visivel"); });
    const alvo = card.querySelector("[data-rs-foco]") || card.querySelector("button");
    if (alvo) alvo.focus();
  }

  function fechar() {
    if (!camada) return;
    camada.remove();
    camada = null;
    document.documentElement.classList.remove("rs-aberto");
    if (focoAnterior && focoAnterior.focus) focoAnterior.focus();
  }

  document.addEventListener("keydown", function (e) {
    if (!camada) return;
    if (e.key === "Escape") { fechar(); return; }
    if (e.key === "Tab") {   // mantém o foco dentro do card
      const focaveis = camada.querySelectorAll("button, textarea, a[href]");
      if (!focaveis.length) return;
      const primeiro = focaveis[0], ultimo = focaveis[focaveis.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
    }
  });

  function botaoFechar(classeExtra) {
    const b = el("button", "rs-fechar " + (classeExtra || ""));
    b.type = "button";
    b.setAttribute("aria-label", "Fechar");
    b.innerHTML = ICONE_FECHAR;
    b.addEventListener("click", fechar);
    return b;
  }

  function avatar(classe) {
    const a = el("span", classe);
    const img = el("img");
    img.src = IMG + "favicon.svg";
    img.alt = "";
    a.appendChild(img);
    return a;
  }

  /* =====================================================================
     WhatsApp
     ===================================================================== */
  function abrirWhatsapp(mensagem) {
    const card = el("div", "rs-card rs-wa");

    // Cabeçalho
    const topo = el("header", "rs-wa__topo");
    topo.appendChild(avatar("rs-wa__avatar"));
    const info = el("div", "rs-wa__info");
    const nome = el("strong", null, DADOS.nome);
    nome.appendChild(el("span", "rs-selo", "✓"));
    const status = el("span", "rs-wa__status", "online");
    info.append(nome, status);
    topo.append(info, botaoFechar());

    // Conversa
    const conversa = el("div", "rs-wa__conversa");
    conversa.setAttribute("aria-live", "polite");
    conversa.appendChild(el("p", "rs-wa__aviso", "🔒 Demonstração de portfólio: esta conversa é simulada e nenhuma mensagem é enviada de verdade."));
    conversa.appendChild(el("p", "rs-wa__dia", "HOJE"));

    function bolha(texto, minha) {
      const b = el("div", "rs-wa__bolha " + (minha ? "rs-wa__bolha--minha" : "rs-wa__bolha--deles"));
      b.appendChild(el("span", "rs-wa__texto", texto));
      const meta = el("span", "rs-wa__meta", hora());
      if (minha) meta.appendChild(el("span", "rs-wa__checks", " ✓✓"));
      b.appendChild(meta);
      conversa.appendChild(b);
      conversa.scrollTop = conversa.scrollHeight;
      return b;
    }

    bolha("Olá! 👋 Aqui é a EconoWatt, de " + DADOS.cidade + ". Como podemos ajudar com a sua energia solar?", false);

    // Campo de mensagem
    const rodape = el("form", "rs-wa__rodape");
    const campo = el("textarea", "rs-wa__campo");
    campo.rows = 1;
    campo.placeholder = "Mensagem";
    campo.setAttribute("aria-label", "Mensagem");
    campo.setAttribute("data-rs-foco", "");
    campo.value = mensagem || "";
    const enviar = el("button", "rs-wa__enviar");
    enviar.type = "submit";
    enviar.setAttribute("aria-label", "Enviar");
    enviar.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3.4 20.4l17.5-7.5c.8-.4.8-1.5 0-1.8L3.4 3.6c-.7-.3-1.4.2-1.4.9l0 4.6c0 .5.4.9.9 1l12.1 1.9-12.1 1.9c-.5.1-.9.5-.9 1l0 4.6c0 .7.7 1.2 1.4.9z"/></svg>';
    rodape.append(campo, enviar);

    let respostas = 0;
    const RESPOSTAS = [
      "Recebemos sua mensagem! ☀️ Num atendimento real, o engenheiro responderia aqui em até 1 dia útil com a proposta.",
      "Lembrando: esta é só uma simulação para o portfólio. Nenhum dado foi enviado. 😉"
    ];

    function ajustarAltura() {
      campo.style.height = "auto";
      campo.style.height = Math.min(campo.scrollHeight, 120) + "px";
    }
    campo.addEventListener("input", ajustarAltura);
    campo.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); rodape.requestSubmit(); }
    });

    rodape.addEventListener("submit", function (e) {
      e.preventDefault();
      const texto = campo.value.trim();
      if (!texto) return;
      bolha(texto, true);
      campo.value = "";
      ajustarAltura();
      status.textContent = "digitando…";
      setTimeout(function () {
        if (!conversa.isConnected) return;
        status.textContent = "online";
        bolha(RESPOSTAS[Math.min(respostas, RESPOSTAS.length - 1)], false);
        respostas++;
      }, 1500);
    });

    card.append(topo, conversa, rodape);
    abrirCamada(card, "Conversa simulada no WhatsApp com a EconoWatt");
    setTimeout(ajustarAltura, 0);
  }

  /* =====================================================================
     Instagram
     ===================================================================== */
  function abrirInstagram() {
    const card = el("div", "rs-card rs-ig");

    const topo = el("header", "rs-ig__topo");
    const usuario = el("strong", null, DADOS.usuario);
    usuario.appendChild(el("span", "rs-selo rs-selo--ig", "✓"));
    topo.append(usuario, botaoFechar());

    const corpo = el("div", "rs-ig__corpo");

    // Perfil
    const perfil = el("div", "rs-ig__perfil");
    const anel = el("span", "rs-ig__anel");
    anel.appendChild(avatar("rs-ig__avatar"));
    const numeros = el("ul", "rs-ig__numeros");
    [[DADOS.publicacoes, "publicações"], [DADOS.seguidores, "seguidores"], [DADOS.seguindo, "seguindo"]].forEach(function (n) {
      const li = el("li");
      li.append(el("strong", null, String(n[0])), el("span", null, n[1]));
      numeros.appendChild(li);
    });
    perfil.append(anel, numeros);

    const bio = el("div", "rs-ig__bio");
    bio.append(
      el("strong", null, DADOS.nome),
      el("span", "rs-ig__categoria", "Empresa de energia solar"),
      el("span", null, "☀️ Projeto e instalação de placas solares"),
      el("span", null, "🏠 Casa · comércio · indústria e agro"),
      el("span", null, "📍 " + DADOS.cidade + " e região"),
      el("span", "rs-ig__link", "🔗 econowatt-demo.com.br")
    );

    // Botões
    const acoes = el("div", "rs-ig__acoes");
    const seguir = el("button", "rs-ig__botao rs-ig__botao--azul", "Seguir");
    seguir.type = "button";
    seguir.setAttribute("data-rs-foco", "");
    seguir.setAttribute("aria-pressed", "false");
    seguir.addEventListener("click", function () {
      const segue = seguir.getAttribute("aria-pressed") !== "true";
      seguir.setAttribute("aria-pressed", String(segue));
      seguir.textContent = segue ? "Seguindo" : "Seguir";
      seguir.classList.toggle("rs-ig__botao--azul", !segue);
    });
    const msg = el("button", "rs-ig__botao", "Mensagem");
    msg.type = "button";
    msg.addEventListener("click", function () { abrirWhatsapp(""); });
    acoes.append(seguir, msg);

    // Destaques
    const destaques = el("ul", "rs-ig__destaques");
    ["Obras", "Clientes", "Economia", "Dúvidas"].forEach(function (d, i) {
      const li = el("li");
      const bola = el("span", "rs-ig__destaque rs-ig__destaque--" + i);
      li.append(bola, el("span", null, d));
      destaques.appendChild(li);
    });

    // Grade de publicações (fotos do próprio site + artes de texto)
    const grade = el("ul", "rs-ig__grade");
    const posts = [
      { foto: "foto-placa-telha-720.webp" },
      { arte: "-90%\nna conta" },
      { foto: "foto-equipe-telhado-720.webp" },
      { arte: "+210\nsistemas", escuro: true },
      { foto: "foto-casa-telha-640.webp" },
      { foto: "foto-placa-telha-720.webp", pos: "70% 30%" },
      { foto: "foto-casa-telha-640.webp", pos: "20% 80%" },
      { arte: "Simule\nsua conta", escuro: true },
      { foto: "foto-equipe-telhado-720.webp", pos: "80% 50%" }
    ];
    posts.forEach(function (p) {
      const li = el("li", "rs-ig__post");
      if (p.foto) {
        const img = el("img");
        img.src = IMG + p.foto;
        img.alt = "";
        img.loading = "lazy";
        if (p.pos) img.style.objectPosition = p.pos;
        li.appendChild(img);
      } else {
        li.classList.add("rs-ig__post--arte");
        if (p.escuro) li.classList.add("rs-ig__post--escuro");
        li.textContent = p.arte;
      }
      grade.appendChild(li);
    });

    const aviso = el("p", "rs-ig__aviso", "Perfil simulado para portfólio · dados fictícios");

    corpo.append(perfil, bio, acoes, destaques, grade, aviso);
    card.append(topo, corpo);
    abrirCamada(card, "Perfil simulado da EconoWatt no Instagram");
  }

  /* ---------- Intercepta os cliques nos links das redes ---------- */
  document.addEventListener("click", function (e) {
    const a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    let url;
    try { url = new URL(a.href, location.href); } catch (_) { return; }
    const host = url.hostname.replace(/^www\./, "");

    if (host === "wa.me" || host === "api.whatsapp.com") {
      e.preventDefault();
      abrirWhatsapp(url.searchParams.get("text") || "");
    } else if (host === "instagram.com") {
      e.preventDefault();
      abrirInstagram();
    }
  });
})();
