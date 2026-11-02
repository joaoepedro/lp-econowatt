/* =====================================================================
   Google Apps Script — recebe os pedidos de orçamento do site
   e grava na planilha. Passo a passo em docs/guia-planilha.md.

   Abas criadas automaticamente:
   • "Leads"        → dados completos (NUNCA compartilhar)
   • "Demonstracao" → cópia mascarada, para publicar na Web no portfólio
   ===================================================================== */

const ABA_LEADS = "Leads";
const ABA_DEMO = "Demonstracao";

const COLUNAS = [
  "data", "id", "nome", "whatsapp", "perfil", "cidade", "conta", "ligacao", "telhado",
  "paineis", "kwp", "economia_mes", "investimento", "consentimento",
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid", "pagina"
];

function doPost(e) {
  const trava = LockService.getScriptLock();
  trava.waitLock(10000); // evita duas inscrições escrevendo na mesma linha
  try {
    const p = (e && e.parameter) || {};

    // Honeypot e validação mínima também no servidor
    if (p.site) return resposta({ ok: false, motivo: "spam" });
    if (!p.nome || !p.whatsapp || p.consentimento !== "sim") return resposta({ ok: false, motivo: "dados incompletos" });
    const digitos = String(p.whatsapp).replace(/\D/g, "");
    if (digitos.length < 10 || digitos.length > 11) return resposta({ ok: false, motivo: "whatsapp inválido" });

    const planilha = SpreadsheetApp.getActiveSpreadsheet();
    const leads = obterAba(planilha, ABA_LEADS, COLUNAS);
    const linha = COLUNAS.map(function (c) {
      return protegerFormula(c === "data" ? new Date() : (p[c] || "").toString().slice(0, 300));
    });
    leads.appendRow(linha);

    // Versão mascarada para demonstração pública
    const demo = obterAba(planilha, ABA_DEMO, ["data", "nome", "whatsapp", "perfil", "cidade", "conta", "economia_mes"]);
    demo.appendRow([
      new Date(),
      protegerFormula(primeiroNome(p.nome)),
      mascararTelefone(digitos),
      protegerFormula(p.perfil || ""),
      protegerFormula(p.cidade || ""),
      protegerFormula(p.conta || ""),
      protegerFormula(p.economia_mes || "")
    ]);

    return resposta({ ok: true });
  } catch (erro) {
    return resposta({ ok: false, motivo: String(erro) });
  } finally {
    trava.releaseLock();
  }
}

/* Cria a aba com cabeçalho se ainda não existir */
function obterAba(planilha, nome, cabecalho) {
  let aba = planilha.getSheetByName(nome);
  if (!aba) {
    aba = planilha.insertSheet(nome);
    aba.appendRow(cabecalho);
    aba.setFrozenRows(1);
    aba.getRange(1, 1, 1, cabecalho.length).setFontWeight("bold");
  }
  return aba;
}

/* Valores que começam com = + - @ seriam executados como fórmula: prefixa apóstrofo */
function protegerFormula(valor) {
  if (typeof valor === "string" && /^[=+\-@]/.test(valor)) return "'" + valor;
  return valor;
}

function primeiroNome(nome) {
  const partes = String(nome || "").trim().split(/\s+/);
  return partes[0] + (partes[1] ? " " + partes[1].charAt(0) + "." : "");
}

function mascararTelefone(d) {
  return "(" + d.slice(0, 2) + ") *****-" + d.slice(-4);
}

function resposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
