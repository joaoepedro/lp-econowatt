/* =====================================================================
   Aviso de demonstração do WhatsApp
   Enquanto CONFIG.empresa.whatsapp estiver vazio (projeto conceitual),
   qualquer link para o WhatsApp abre este cartão no centro da tela,
   mostrando a mensagem que iria pronta para a conversa.
   Com o número preenchido, os links abrem o WhatsApp normalmente.
   ===================================================================== */

(function () {
  if (CONFIG.empresa.whatsapp) return;

  const cartao = document.createElement("dialog");
  cartao.className = "aviso-demo";
  cartao.setAttribute("aria-labelledby", "aviso-demo-titulo");
  cartao.setAttribute("aria-describedby", "aviso-demo-texto");
  cartao.innerHTML =
    '<span class="aviso-demo__selo">Modo demonstração</span>' +
    '<h2 class="aviso-demo__titulo" id="aviso-demo-titulo">Aqui abriria o WhatsApp</h2>' +
    '<p class="aviso-demo__texto" id="aviso-demo-texto"></p>' +
    '<p class="aviso-demo__balao"></p>' +
    '<button type="button" class="botao botao--largo">Entendi</button>';
  document.body.appendChild(cartao);

  const texto = cartao.querySelector(".aviso-demo__texto");
  const balao = cartao.querySelector(".aviso-demo__balao");
  let origem = null;

  function abrir(mensagem) {
    origem = document.activeElement;
    texto.textContent = mensagem
      ? "Projeto conceitual. Com o número da EconoWatt cadastrado, o cliente cai direto na conversa com esta mensagem pronta:"
      : "Projeto conceitual. Com o número da EconoWatt cadastrado, este botão abriria a conversa no WhatsApp.";
    balao.textContent = mensagem;
    balao.hidden = !mensagem;
    cartao.showModal();
    cartao.querySelector("button").focus();
  }

  // Fecha no "Entendi", no Esc (nativo do <dialog>) e ao clicar fora do cartão
  cartao.querySelector("button").addEventListener("click", function () { cartao.close(); });
  cartao.addEventListener("click", function (e) { if (e.target === cartao) cartao.close(); });
  cartao.addEventListener("close", function () { if (origem && origem.focus) origem.focus(); });

  // Um só ouvinte para todos os links do WhatsApp, inclusive os criados depois (ex.: falha no envio do formulário)
  document.addEventListener("click", function (e) {
    const link = e.target.closest('a[href^="https://wa.me/"]');
    if (!link) return;
    e.preventDefault();
    abrir(new URL(link.href).searchParams.get("text") || "");
  });
})();
