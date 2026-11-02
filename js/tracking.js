/* =====================================================================
   Rastreamento e consentimento (LGPD)
   • IDs ficam no config.js (integracoes). Sem nenhum ID: nada é carregado,
     não aparece aviso de cookies e os eventos vão só para o console.
   • Com ID: aparece o aviso; Meta, Google e Clarity só carregam depois de "Aceitar".
   • Eventos disparados antes do aceite ficam numa fila e são enviados depois.
   ===================================================================== */

const Tracking = (function () {
  const ids = CONFIG.integracoes;
  const temFerramenta = Boolean(ids.metaPixelId || ids.googleTagId || ids.clarityId);
  const CHAVE = "ew_cookies"; // "aceito" | "recusado" (guardado no navegador da pessoa)
  let carregado = false;
  const fila = [];

  function lerEscolha() { try { return localStorage.getItem(CHAVE); } catch (e) { return null; } }
  function gravarEscolha(v) { try { localStorage.setItem(CHAVE, v); } catch (e) { /* sem storage */ } }

  /* ---------- Carregadores (código oficial, reorganizado) ---------- */
  function carregarMeta(id) {
    if (window.fbq) return;
    const fbq = window.fbq = function () {
      fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
    };
    if (!window._fbq) window._fbq = fbq;
    fbq.push = fbq; fbq.loaded = true; fbq.version = "2.0"; fbq.queue = [];
    const s = document.createElement("script");
    s.async = true; s.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(s);
    fbq("init", id);
  }
  function carregarGoogle(id) {
    const s = document.createElement("script");
    s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", id);
  }
  function carregarClarity(id) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", id);
  }

  function carregarTudo() {
    if (carregado) return;
    carregado = true;
    if (ids.metaPixelId) carregarMeta(ids.metaPixelId);
    if (ids.googleTagId) carregarGoogle(ids.googleTagId);
    if (ids.clarityId) carregarClarity(ids.clarityId);
    fila.splice(0).forEach(function (ev) { enviar(ev[0], ev[1]); });
  }

  /* ---------- Envio de eventos ---------- */
  const PADRAO_META = ["PageView", "ViewContent", "Lead", "Contact"];
  function enviar(nome, dados) {
    if (window.fbq) window.fbq(PADRAO_META.indexOf(nome) !== -1 ? "track" : "trackCustom", nome, dados);
    if (window.gtag) {
      window.gtag("event", nome === "Lead" ? "generate_lead" : nome.toLowerCase(), dados);
      if (nome === "Lead" && ids.googleAdsConversao) window.gtag("event", "conversion", { send_to: ids.googleAdsConversao });
    }
  }

  /** Dispara um evento (ou só registra no console, se não houver ferramenta) */
  function evento(nome, dados) {
    dados = dados || {};
    if (!temFerramenta) { console.info("[tracking] " + nome, dados); return; }
    if (carregado) enviar(nome, dados);
    else if (lerEscolha() !== "recusado") fila.push([nome, dados]);
  }

  /* ---------- Aviso de cookies ---------- */
  function iniciarAviso() {
    const aviso = document.getElementById("cookies");
    const reabrir = document.querySelector("[data-abrir-cookies]");
    if (!temFerramenta || !aviso) return;
    if (reabrir) reabrir.hidden = false;

    const escolha = lerEscolha();
    if (escolha === "aceito") carregarTudo();
    else if (!escolha) aviso.hidden = false;

    aviso.addEventListener("click", function (e) {
      const b = e.target.closest("[data-cookies]");
      if (!b) return;
      const aceitou = b.dataset.cookies === "aceitar";
      gravarEscolha(aceitou ? "aceito" : "recusado");
      aviso.hidden = true;
      if (aceitou) carregarTudo(); else fila.length = 0;
    });
    if (reabrir) reabrir.addEventListener("click", function () {
      aviso.hidden = false;
      aviso.querySelector("button").focus();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciarAviso);
  else iniciarAviso();

  evento("PageView");
  return { evento: evento };
})();
