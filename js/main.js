/* =====================================================================
   Comportamento geral da página
   • Seletor de perfil (Casa / Comércio / Indústria e agro), também pela URL (?perfil=)
   • Textos e números vindos do config.js
   • Título com o verbo que cai (ou sobe)
   • Faixa "Projeto conceitual" com botão Entendi
   • Topo (foto) ocupando a primeira tela inteira
   • Menu do celular, mapa do rodapé, cliques no WhatsApp
   • Botão flutuante do WhatsApp some enquanto o formulário está na tela
   ===================================================================== */

(function () {
  const raiz = document.documentElement;
  const PERFIS = Object.keys(CONFIG.perfis);
  raiz.classList.add("js");

  /* ---------- Dados do config.js na página ----------
     O HTML já traz os valores como reserva; aqui eles são trocados pelos do config. */
  function preencherConfig() {
    raiz.dataset.conceitual = String(CONFIG.conceitual);
    document.querySelectorAll("[data-config]").forEach(function (el) {
      const v = Utils.lerConfig(el.dataset.config);
      if (v !== undefined) el.textContent = (typeof v === "number" && v >= 10000) ? v.toLocaleString("pt-BR") : v; // anos ficam sem ponto (2023)
    });
    document.querySelectorAll("[data-config-contar]").forEach(function (el) {
      el.textContent = Utils.lerConfig(el.dataset.configContar).length;
    });
    document.querySelectorAll("[data-config-lista]").forEach(function (el) {
      const lista = Utils.lerConfig(el.dataset.configLista);
      el.textContent = lista.slice(0, -1).join(", ") + " e " + lista[lista.length - 1];
    });
    document.querySelectorAll("[data-config-percentual]").forEach(function (el) {
      el.textContent = Utils.decimal(Utils.lerConfig(el.dataset.configPercentual) * 100, 2) + "%";
    });
    document.querySelectorAll("[data-config-href]").forEach(function (el) {
      const v = Utils.lerConfig(el.dataset.configHref);
      if (v) el.href = v;
    });
    document.querySelectorAll("[data-ano-atual]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ---------- Título: o verbo entra na linha e depois cai (ou sobe) ---------- */
  const titulo = document.querySelector("[data-titulo-perfil]");
  function montarTitulo(p) {
    titulo.textContent = "";
    titulo.append(p.titulo1, document.createElement("br"), p.titulo2 + " ");
    const verbo = document.createElement("span");
    verbo.className = "verbo is-reiniciando";
    verbo.textContent = p.verbo;
    titulo.appendChild(verbo);
    // dois quadros depois, tira o "reinício" e aplica o movimento (a transição acontece no CSS)
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        verbo.classList.remove("is-reiniciando");
        verbo.classList.add(p.movimento === "sobe" ? "verbo--sobe" : "verbo--cai");
      });
    });
  }

  /* ---------- Seletor de perfil ---------- */
  function definirPerfil(perfil, origem) {
    if (PERFIS.indexOf(perfil) === -1) perfil = CONFIG.perfilPadrao;
    const p = CONFIG.perfis[perfil];
    raiz.dataset.perfil = perfil;

    document.querySelectorAll("[data-perfil-botao]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.perfilBotao === perfil));
    });
    montarTitulo(p);
    document.querySelectorAll("[data-texto-perfil]").forEach(function (el) {
      el.textContent = p[el.dataset.textoPerfil];
    });
    document.querySelectorAll("[data-whatsapp]").forEach(function (a) {
      a.href = Utils.linkWhatsapp(p.mensagemWhatsapp);
    });

    Utils.sessao.gravar("ew_perfil", perfil);
    if (origem !== "inicio") {
      const url = new URL(location.href);
      url.searchParams.set("perfil", perfil);
      history.replaceState(null, "", url);
    }
    document.dispatchEvent(new CustomEvent("perfil:mudou", { detail: { perfil: perfil, origem: origem } }));
  }

  function perfilInicial() {
    const daUrl = new URLSearchParams(location.search).get("perfil");
    if (daUrl && CONFIG.perfis[daUrl]) return daUrl;
    const salvo = Utils.sessao.ler("ew_perfil");
    return CONFIG.perfis[salvo] ? salvo : CONFIG.perfilPadrao;
  }

  document.querySelectorAll("[data-perfil-botao]").forEach(function (b) {
    b.addEventListener("click", function () { definirPerfil(b.dataset.perfilBotao, "seletor"); });
  });

  /* ---------- Botões "Ver quanto economizo": rolam e põem o foco no simulador ---------- */
  const simulador = document.getElementById("simulador");
  document.querySelectorAll("[data-ir-simulador]").forEach(function (a) {
    a.addEventListener("click", function () {
      Tracking.evento("ViewContent", { origem: "botao-simular" });
      setTimeout(function () { simulador.focus({ preventScroll: true }); }, 50);
    });
  });

  /* ---------- Menu do celular ---------- */
  const botaoMenu = document.querySelector(".menu-botao");
  const menu = document.getElementById("menu-principal");
  function abrirMenu(abrir) {
    botaoMenu.setAttribute("aria-expanded", String(abrir));
    menu.classList.toggle("is-aberto", abrir);
  }
  botaoMenu.addEventListener("click", function () {
    abrirMenu(botaoMenu.getAttribute("aria-expanded") !== "true");
  });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) abrirMenu(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && botaoMenu.getAttribute("aria-expanded") === "true") { abrirMenu(false); botaoMenu.focus(); }
  });
  matchMedia("(min-width: 62em)").addEventListener("change", function () { abrirMenu(false); });

  /* ---------- Faixa "Projeto conceitual": some ao clicar em Entendi ----------
     A escolha fica guardada só neste navegador (localStorage), por conveniência. */
  const faixa = document.getElementById("faixa-conceitual");
  function lerFaixa() { try { return localStorage.getItem("ew_faixa_fechada") === "1"; } catch (e) { return false; } }
  if (faixa) {
    if (lerFaixa()) faixa.hidden = true;
    faixa.querySelector("[data-fechar-faixa]").addEventListener("click", function () {
      faixa.hidden = true;
      try { localStorage.setItem("ew_faixa_fechada", "1"); } catch (e) { /* sem storage */ }
      ajustarTopo();
      document.getElementById("conteudo").focus({ preventScroll: true });
    });
  }

  /* ---------- Topo com foto ocupando a primeira tela ----------
     O CSS usa 100svh menos a altura da faixa + menu (medida aqui, porque a faixa
     pode quebrar em duas linhas no celular ou ser fechada). */
  const cabecalho = document.querySelector(".topo");
  function ajustarTopo() {
    const alturaFaixa = faixa && !faixa.hidden && getComputedStyle(faixa).display !== "none" ? faixa.offsetHeight : 0;
    raiz.style.setProperty("--topo-total", (alturaFaixa + cabecalho.offsetHeight) + "px");
  }
  addEventListener("resize", ajustarTopo, { passive: true });

  /* ---------- Mapa do rodapé: carrega o Google Maps só ao clicar ---------- */
  const botaoMapa = document.querySelector("[data-ver-mapa]");
  if (botaoMapa) botaoMapa.addEventListener("click", function () {
    const caixa = document.getElementById("mapa");
    const iframe = document.createElement("iframe");
    iframe.src = "https://www.google.com/maps?q=" + encodeURIComponent(CONFIG.empresa.mapaBusca) + "&output=embed";
    iframe.title = "Mapa: localização da EconoWatt em Franca";
    iframe.loading = "lazy";
    iframe.referrerPolicy = "no-referrer-when-downgrade";
    caixa.replaceChildren(iframe);
    caixa.classList.add("rodape__mapa--carregado");
    iframe.focus();
  });

  /* ---------- Botão flutuante some enquanto o formulário está na tela ----------
     No celular ele cobria o botão "Quero minha proposta". */
  const flutuante = document.querySelector(".whats-flutuante");
  const formLead = document.getElementById("form-lead");
  if (flutuante && formLead && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entradas) {
      flutuante.classList.toggle("is-oculto", entradas[0].isIntersecting);
    }).observe(formLead);
  }

  /* ---------- Cliques no WhatsApp contam como contato ---------- */
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-whatsapp]")) Tracking.evento("Contact", { origem: "botao-whatsapp", perfil: raiz.dataset.perfil });
  });

  /* ---------- Início ---------- */
  Utils.capturarOrigem();
  preencherConfig();
  ajustarTopo();
  definirPerfil(perfilInicial(), "inicio");
})();
