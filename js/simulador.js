/* =====================================================================
   Simulador de economia (faixa marinho logo abaixo do topo)
   1) calcular(): a conta em si, sem mexer na página (fácil de testar)
   2) tela: barra + campo de valor, resultado ao vivo, "refinar" opcional
   As premissas ficam em CONFIG.simulador (js/config.js).
   ===================================================================== */

const Simulador = (function () {
  const P = CONFIG.simulador;

  /* ---------- 1. Cálculo ---------- */

  /** Custo por kWp conforme o tamanho do sistema */
  function custoPorKwp(kwp) {
    for (let i = 0; i < P.custoPorKwp.length; i++) {
      if (kwp <= P.custoPorKwp[i].ate) return P.custoPorKwp[i].valor;
    }
    return P.custoPorKwp[P.custoPorKwp.length - 1].valor;
  }

  /**
   * conta: valor médio da conta (R$) · perfil: casa|comercio|industria
   * ligacao: mono|bi|tri|auto  → devolve os números da simulação
   *
   * O que continua na conta depois do sistema (por isso a conta nunca zera):
   *   taxa mínima da distribuidora + iluminação pública + parte do Fio B (Lei 14.300)
   */
  function calcular(conta, perfil, ligacao) {
    if (!ligacao || ligacao === "auto") ligacao = CONFIG.perfis[perfil].ligacaoPadrao;

    const minimoReais = P.minimoKwh[ligacao] * P.tarifaKwh;
    const energiaReais = Math.max(conta - P.iluminacaoPublica, 0);       // parte da conta que é energia
    const compensavelKwh = Math.max(energiaReais / P.tarifaKwh - P.minimoKwh[ligacao], 0);
    const geracaoPorKwp = P.irradiacao * 30 * P.desempenho;               // kWh/mês por kWp

    const placas = Math.max(1, Math.ceil((compensavelKwh / geracaoPorKwp) * 1000 / P.painelW));
    const kwp = placas * P.painelW / 1000;

    // Fio B: R$ 0,12/kWh (valor de 2026) sobre a energia que passa pela rede
    const perdaFioB = compensavelKwh * P.fioB.fracaoInjetada * P.fioB.valorKwh;
    const economia = Math.max(compensavelKwh * P.tarifaKwh - perdaFioB, 0);

    // Teto: a economia nunca passa de "conta − mínimo − iluminação pública"
    const teto = Math.max(conta - minimoReais - P.iluminacaoPublica, 0);
    const econMin = economia * (1 - P.margemEstimativa);
    const econMax = Math.min(economia * (1 + P.margemEstimativa), teto);

    return {
      conta: conta, perfil: perfil, ligacao: ligacao,
      placas: placas, kwp: kwp,
      economia: economia, econMin: econMin, econMax: econMax,
      contaDepois: Math.max(conta - economia, minimoReais + P.iluminacaoPublica),
      investimento: kwp * custoPorKwp(kwp)
    };
  }

  /** Textos prontos para a tela e para a mensagem do WhatsApp */
  function textos(r) {
    const passo = r.conta > 5000 ? 100 : 10;
    return {
      conta: Utils.reais(r.conta),
      depois: Utils.reais(Utils.arredondar(r.contaDepois, passo)),
      eco: Utils.reais(Utils.arredondar(r.econMin, passo)) + " a " + Utils.reais(Utils.arredondar(r.econMax, passo)),
      placas: r.placas.toLocaleString("pt-BR") + (r.placas === 1 ? " placa" : " placas")
    };
  }

  /* ---------- 2. Tela ---------- */
  const campo = document.getElementById("sim-conta");
  const faixa = document.getElementById("sim-faixa");
  const erro = document.getElementById("sim-conta-erro");
  const selLigacao = document.getElementById("sim-ligacao");
  const selCidade = document.getElementById("sim-cidade");
  const selLocal = document.getElementById("sim-local");
  const saidas = document.querySelectorAll("[data-r]");
  let perfilAtual = CONFIG.perfilPadrao;
  let ultimo = null;

  function validar(conta) {
    if (isNaN(conta)) return "Informe o valor médio da sua conta de luz.";
    if (conta < P.contaMinima) return "A simulação começa em contas a partir de " + Utils.reais(P.contaMinima) + ".";
    return "";
  }

  function mostrarErro(msg) {
    erro.textContent = msg;
    campo.setAttribute("aria-invalid", msg ? "true" : "false");
  }

  function atualizar() {
    const conta = Utils.lerValor(campo.value);
    if (validar(conta)) return; // mantém o último resultado válido na tela
    const r = calcular(conta, perfilAtual, selLigacao.value);
    const t = textos(r);
    saidas.forEach(function (el) { el.textContent = t[el.dataset.r]; });
    faixa.setAttribute("aria-valuetext", t.conta + " por mês");
    ultimo = Object.assign({}, r, {
      textos: t,
      ligacaoInformada: selLigacao.value,
      cidade: selCidade.value,
      local: selLocal.value
    });
  }

  function configurarFaixa(perfil) {
    const p = CONFIG.perfis[perfil];
    faixa.min = P.contaMinima;
    faixa.max = p.contaMaxBarra;
    faixa.step = p.contaMaxBarra > 5000 ? 100 : 10;
    faixa.value = p.contaInicial;
    campo.value = p.contaInicial.toLocaleString("pt-BR");
  }

  // Arrastar a barra: atualiza o campo e o resultado ao vivo
  faixa.addEventListener("input", function () {
    campo.value = Number(faixa.value).toLocaleString("pt-BR");
    mostrarErro("");
    atualizar();
  });

  // Digitar no campo: formata, move a barra e recalcula.
  // O erro só some no evento "input" (nunca no blur) para não deslocar o layout no toque.
  campo.addEventListener("input", function () {
    const conta = Utils.lerValor(campo.value);
    if (!isNaN(conta)) {
      campo.value = conta.toLocaleString("pt-BR");
      faixa.value = Math.min(Math.max(conta, Number(faixa.min)), Number(faixa.max));
    }
    if (erro.textContent && !validar(conta)) mostrarErro("");
    atualizar();
  });
  // Ao sair do campo, avisa se o valor não serve (sem apagar nada)
  campo.addEventListener("change", function () { mostrarErro(validar(Utils.lerValor(campo.value))); });

  [selLigacao, selCidade, selLocal].forEach(function (s) { s.addEventListener("change", atualizar); });

  // Cidades a partir do config.js
  selCidade.innerHTML = "";
  CONFIG.empresa.cidadesAtendidas.concat(["Outra cidade da região"]).forEach(function (c) {
    const o = document.createElement("option"); o.textContent = c; selCidade.appendChild(o);
  });

  // Troca de perfil (seletor do topo): novo valor inicial e nova faixa da barra
  document.addEventListener("perfil:mudou", function (e) {
    perfilAtual = e.detail.perfil;
    configurarFaixa(perfilAtual);
    selLigacao.value = "auto";
    mostrarErro("");
    atualizar();
  });

  configurarFaixa(perfilAtual);
  atualizar();

  return {
    validarAtual: function () { const m = validar(Utils.lerValor(campo.value)); mostrarErro(m); if (m) campo.focus(); return !m; },
    ultimoResultado: function () { return ultimo; }
  };
})();
