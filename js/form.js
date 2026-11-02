/* =====================================================================
   Formulário de proposta (dentro da faixa do simulador)
   Valida → envia para a planilha (Google Sheets) com as UTMs → guarda os
   dados na sessão → abre a página de obrigado, que leva ao WhatsApp.
   ===================================================================== */

const FormularioLead = (function () {
  const form = document.getElementById("form-lead");
  if (!form) return {};

  const campos = {
    nome: document.getElementById("lead-nome"),
    whatsapp: document.getElementById("lead-whats"),
    consentimento: document.getElementById("lead-consentimento"),
    isca: document.getElementById("lead-site")
  };
  const status = document.getElementById("lead-status");
  const botao = form.querySelector('button[type="submit"]');
  const textoBotao = botao.textContent;
  const ORDEM = ["nome", "whatsapp", "consentimento"];

  /* ---------- Validação ---------- */
  const regras = {
    nome: function (v) { return v.trim().length >= 2 ? "" : "Digite seu nome."; },
    whatsapp: function (v) {
      const d = v.replace(/\D/g, "");
      return (d.length === 10 || d.length === 11) ? "" : "Digite um WhatsApp com DDD, por exemplo (16) 99999-9999.";
    },
    consentimento: function (_, el) { return el.checked ? "" : "Marque a caixa para a gente poder te chamar."; }
  };

  function erroDe(nome) { return document.getElementById(campos[nome].getAttribute("aria-describedby")); }

  function validar(nome) {
    const el = campos[nome];
    const msg = regras[nome](el.value, el);
    erroDe(nome).textContent = msg;
    el.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }

  // O erro some enquanto a pessoa corrige (evento input), nunca ao sair do campo
  ORDEM.forEach(function (nome) {
    const el = campos[nome];
    el.addEventListener(nome === "consentimento" ? "change" : "input", function () {
      if (el.getAttribute("aria-invalid") === "true") validar(nome);
    });
  });

  campos.whatsapp.addEventListener("input", function () {
    campos.whatsapp.value = Utils.mascaraTelefone(campos.whatsapp.value);
  });

  /* ---------- Mensagem que vai pronta para o WhatsApp ---------- */
  function mensagemWhatsapp(nome, s) {
    const rotulosLigacao = { auto: "Não sei", mono: "Monofásica", bi: "Bifásica", tri: "Trifásica" };
    const linhas = [
      "Olá, EconoWatt! Fiz a simulação no site e quero a proposta.",
      "",
      "Nome: " + nome,
      "Perfil: " + CONFIG.perfis[s.perfil].rotulo,
      "Conta média: " + s.textos.conta,
      "Economia estimada: " + s.textos.eco + "/mês",
      "Sistema estimado: " + s.textos.placas
    ];
    // Os campos do "refinar" só entram se a pessoa mexeu neles
    const extras = [];
    if (s.cidade && s.cidade !== CONFIG.empresa.cidadesAtendidas[0]) extras.push("Cidade: " + s.cidade);
    if (s.ligacaoInformada !== "auto") extras.push("Ligação: " + rotulosLigacao[s.ligacaoInformada]);
    if (s.local && s.local.indexOf("Não sei") !== 0) extras.push("Placas em: " + s.local);
    if (extras.length) linhas.push(extras.join(" · "));
    return linhas.join("\n");
  }

  /* ---------- Envio para a planilha ----------
     mode "no-cors": o Google Apps Script não devolve resposta legível ao navegador,
     então consideramos sucesso se a requisição saiu sem erro de rede. */
  function enviarPlanilha(dados) {
    const url = CONFIG.integracoes.planilhaUrl;
    if (!url) {
      console.info("[planilha] Sem URL no config.js. Dados que seriam enviados:", dados);
      return Promise.resolve();
    }
    const controle = new AbortController();
    const tempo = setTimeout(function () { controle.abort(); }, 8000);
    return fetch(url, { method: "POST", mode: "no-cors", body: new URLSearchParams(dados), signal: controle.signal })
      .finally(function () { clearTimeout(tempo); });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.textContent = "";

    // Honeypot: robôs preenchem o campo escondido; pessoas não.
    if (campos.isca.value) return;
    if (!Simulador.validarAtual()) return;

    const ok = ORDEM.map(validar);
    if (ok.indexOf(false) !== -1) { campos[ORDEM[ok.indexOf(false)]].focus(); return; }

    const s = Simulador.ultimoResultado();
    if (!s) return;
    const nome = campos.nome.value.trim();
    const mensagem = mensagemWhatsapp(nome, s);
    const idLead = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

    const dados = Object.assign({
      id: idLead,
      data: new Date().toISOString(),
      nome: nome,
      whatsapp: campos.whatsapp.value,
      perfil: CONFIG.perfis[s.perfil].rotulo,
      cidade: s.cidade,
      conta: Math.round(s.conta),
      ligacao: s.ligacaoInformada === "auto" ? "Não sei" : s.ligacaoInformada,
      telhado: s.local,
      paineis: s.placas,
      kwp: s.kwp.toFixed(2),
      economia_mes: Math.round(s.economia),
      investimento: Math.round(s.investimento),
      consentimento: "sim",
      pagina: location.href.split("#")[0]
    }, Utils.capturarOrigem());

    botao.setAttribute("aria-busy", "true");
    botao.textContent = "Enviando…";

    function seguir() {
      Utils.sessao.gravar("ew_lead", { id: idLead, nome: nome.split(" ")[0], mensagem: mensagem, perfil: s.perfil });
      location.href = "obrigado.html";
    }

    enviarPlanilha(dados).then(seguir).catch(function () {
      // Falhou o registro, mas a pessoa não perde o contato: segue direto para o WhatsApp
      botao.removeAttribute("aria-busy");
      botao.textContent = textoBotao;
      const a = document.createElement("a");
      a.href = Utils.linkWhatsapp(mensagem); a.target = "_blank"; a.rel = "noopener"; a.textContent = "Abrir WhatsApp";
      a.addEventListener("click", function () { Tracking.evento("Contact", { origem: "falha-planilha" }); });
      status.textContent = "Não conseguimos registrar agora, mas você pode continuar pelo WhatsApp. ";
      status.appendChild(a);
    });
  });

  return {};
})();
