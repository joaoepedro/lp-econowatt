/* =====================================================================
   Funções de apoio usadas pelos outros scripts.
   Nada aqui depende da página: são ferramentas genéricas.
   ===================================================================== */

const Utils = (function () {

  /** Formata número como dinheiro: 4390 → "R$ 4.390" (sem centavos) */
  function reais(valor) {
    return "R$\u00A0" + Math.round(valor).toLocaleString("pt-BR"); // espaço que não quebra linha
  }

  /** Arredonda para "números redondos" de exibição: 4387 → 4390 */
  function arredondar(valor, passo) {
    return Math.round(valor / passo) * passo;
  }

  /** Número com casas decimais em pt-BR: 3.05 → "3,05" */
  function decimal(valor, casas) {
    return valor.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
  }

  /** Lê "R$ 1.500" ou "1500,50" digitado pelo usuário e devolve 1500 */
  function lerValor(texto) {
    const limpo = String(texto).replace(/[^\d,]/g, "").replace(",", ".");
    const n = parseFloat(limpo);
    return isNaN(n) ? NaN : Math.round(n);
  }

  /** Busca um valor no CONFIG por caminho: "empresa.instalacoes" */
  function lerConfig(caminho) {
    return caminho.split(".").reduce(function (obj, chave) {
      return obj == null ? undefined : obj[chave];
    }, CONFIG);
  }

  /** Máscara simples de telefone: 16999999999 → (16) 99999-9999 */
  function mascaraTelefone(valor) {
    const d = valor.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d.length ? "(" + d : "";
    if (d.length <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length <= 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
    return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
  }

  /** Link do WhatsApp com mensagem codificada */
  function linkWhatsapp(mensagem) {
    return "https://wa.me/" + CONFIG.empresa.whatsapp + "?text=" + encodeURIComponent(mensagem);
  }

  /** Captura UTMs e identificadores de anúncio da URL (e guarda na sessão) */
  function capturarOrigem() {
    const chaves = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"];
    const params = new URLSearchParams(location.search);
    let salvo = {};
    try { salvo = JSON.parse(sessionStorage.getItem("ew_origem") || "{}"); } catch (e) { /* sem storage */ }
    chaves.forEach(function (k) { if (params.get(k)) salvo[k] = params.get(k); });
    try { sessionStorage.setItem("ew_origem", JSON.stringify(salvo)); } catch (e) { /* sem storage */ }
    return salvo;
  }

  /** sessionStorage protegido (aba anônima ou bloqueio podem lançar erro) */
  const sessao = {
    ler: function (chave) {
      try { return JSON.parse(sessionStorage.getItem(chave)); } catch (e) { return null; }
    },
    gravar: function (chave, valor) {
      try { sessionStorage.setItem(chave, JSON.stringify(valor)); } catch (e) { /* ignora */ }
    }
  };

  return {
    reais: reais, arredondar: arredondar, decimal: decimal, lerValor: lerValor,
    lerConfig: lerConfig, mascaraTelefone: mascaraTelefone, linkWhatsapp: linkWhatsapp,
    capturarOrigem: capturarOrigem, sessao: sessao
  };
})();
