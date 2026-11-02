/* =====================================================================
   Página de obrigado
   • Personaliza com o primeiro nome e leva a mensagem pronta ao WhatsApp.
   • Dispara o evento Lead UMA vez por inscrição (recarregar não duplica).
   ===================================================================== */

(function () {
  const lead = Utils.sessao.ler("ew_lead");
  const botao = document.getElementById("obrigado-whatsapp");
  const numero = document.getElementById("obrigado-numero");

  numero.textContent = CONFIG.empresa.whatsappExibicao;
  numero.href = "https://wa.me/" + CONFIG.empresa.whatsapp;

  if (!lead) {
    // Chegou sem simular (link direto): oferece o WhatsApp com mensagem simples
    document.getElementById("obrigado-titulo").textContent = "Fale com a EconoWatt";
    botao.href = Utils.linkWhatsapp(CONFIG.perfis[CONFIG.perfilPadrao].mensagemWhatsapp);
    return;
  }

  document.getElementById("obrigado-titulo").textContent = "Pronto, " + lead.nome + "! Falta só um toque.";
  botao.href = Utils.linkWhatsapp(lead.mensagem);

  const chave = "ew_lead_registrado_" + lead.id;
  if (!Utils.sessao.ler(chave)) {
    Tracking.evento("Lead", { perfil: lead.perfil });
    Utils.sessao.gravar(chave, true);
  }

  botao.addEventListener("click", function () {
    Tracking.evento("Contact", { origem: "obrigado", perfil: lead.perfil });
  });
})();
