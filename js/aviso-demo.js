/* =========================================================
   Prévia do WhatsApp e do Instagram (só no protótipo)
   Com CONFIG.modoDemonstracao = true, qualquer link para o WhatsApp
   abre uma tela de conversa simulada com a mensagem que o site enviaria,
   e qualquer link para o Instagram abre um perfil simulado.
   Com false, este arquivo não faz nada e os links abrem as redes de verdade.
   O visual das prévias fica em css/demo.css (carregado só aqui).
   ========================================================= */
(function () {
    "use strict";
    // Aqui o CONFIG é declarado com const, então não fica em window.CONFIG
    const C = typeof CONFIG !== "undefined" ? CONFIG : window.CONFIG;
    if (!C || !C.modoDemonstracao) return;

    // Caminhos a partir da raiz do site, em qualquer página (inclusive a 404)
    const raiz = new URL("../", document.currentScript.src);
    const caminho = (c) => (/^https?:/.test(c) ? c : new URL(c.replace(/^\//, ""), raiz).href);

    /* ---------- ✏️ Dados da prévia (fictícios) ---------- */
    const E = C.empresa;
    const DADOS = {
        nome: E.nome,
        logo: E.logoPrevia ? caminho(E.logoPrevia) : "",
        mensagemPadrao: C.perfis[C.perfilPadrao].mensagemWhatsapp,
        insta: {
            usuario: E.instagramUsuario || "econowatt.solar.demo",
            categoria: "Empresa de energia solar",
            bio: [
                "☀️ Projeto e instalação de placas solares",
                "🏠 Casa · comércio · indústria e agro",
                "📍 " + E.cidade + " e região",
            ],
            link: "econowatt.solar.demo",
            numeros: [["48", "publicações"], ["2.315", "seguidores"], ["180", "seguindo"]],
            destaques: [
                ["Obras", caminho("assets/img/foto-placa-telha-720.webp")],
                ["Equipe", caminho("assets/img/foto-equipe-telhado-720.webp")],
                ["Clientes", caminho("assets/img/foto-casa-telha-640.webp")],
                ["Economia", caminho("assets/img/og-image.jpg")],
            ],
            fotos: [
                caminho("assets/img/foto-placa-telha-720.webp"),
                caminho("assets/img/foto-equipe-telhado-720.webp"),
                caminho("assets/img/foto-casa-telha-640.webp"),
                caminho("assets/img/og-image.jpg"),
                caminho("assets/img/foto-casa-telha-960.webp"),
                caminho("assets/img/foto-equipe-telhado-960.webp"),
            ],
        },
    };

    /* =========================================================
       Daqui para baixo é igual em todos os projetos
       ========================================================= */

    // Carrega o estilo da prévia só no modo demonstração
    const estilo = document.createElement("link");
    estilo.rel = "stylesheet";
    estilo.href = new URL("css/demo.css", raiz).href;
    document.head.appendChild(estilo);

    const nome = DADOS.nome;
    const letra = nome.trim().charAt(0).toUpperCase();
    const avatarHtml = (classe) =>
        DADOS.logo
            ? '<img class="' + classe + '" src="' + DADOS.logo + '" alt="" width="40" height="40">'
            : '<span class="' + classe + '" aria-hidden="true"></span>';

    // Sem logo (ou logo que não carregou): mostra a inicial do nome
    function prepararAvatar(tela, classe) {
        const inicial = tela.querySelector("span." + classe);
        if (inicial) inicial.textContent = letra;
        const img = tela.querySelector("img." + classe);
        if (img)
            img.addEventListener("error", () => {
                const s = document.createElement("span");
                s.className = classe;
                s.setAttribute("aria-hidden", "true");
                s.textContent = letra;
                img.replaceWith(s);
            });
    }

    let origem = null;
    function prepararDialogo(tela) {
        const fechar = () => tela.close();
        tela.querySelectorAll("[data-demo-fechar]").forEach((b) => b.addEventListener("click", fechar));
        tela.addEventListener("click", (e) => {
            if (e.target === tela) fechar();
        }); // clique fora
        tela.addEventListener("close", () => {
            if (origem && origem.focus && !document.querySelector("dialog[open]")) origem.focus();
        });
    }

    /* ---------- WhatsApp ---------- */
    const whats = document.createElement("dialog");
    whats.className = "demo-whats";
    whats.setAttribute("aria-labelledby", "demo-whats-nome");
    whats.innerHTML =
        '<div class="demo-whats__topo">' +
        '<button type="button" class="demo-whats__voltar" data-demo-fechar aria-label="Fechar prévia">‹</button>' +
        avatarHtml("demo-whats__avatar") +
        '<div class="demo-whats__quem"><strong id="demo-whats-nome"></strong><small>online</small></div>' +
        "</div>" +
        '<div class="demo-whats__conversa">' +
        '<p class="demo-whats__digitando" aria-hidden="true"><span></span><span></span><span></span></p>' +
        '<p class="demo-whats__balao"><span class="demo-whats__texto"></span><span class="demo-whats__hora"></span></p>' +
        "</div>" +
        '<div class="demo-whats__rodape">' +
        '<p class="demo-whats__aviso">Prévia do site: depois de publicado, este botão abre o WhatsApp de <strong></strong> com esta mensagem já escrita.</p>' +
        '<button type="button" class="demo-whats__ok" data-demo-fechar>Entendi</button>' +
        "</div>";
    document.body.appendChild(whats);
    whats.querySelector("#demo-whats-nome").textContent = nome;
    whats.querySelector(".demo-whats__aviso strong").textContent = nome;
    prepararAvatar(whats, "demo-whats__avatar");
    prepararDialogo(whats);

    const balao = whats.querySelector(".demo-whats__balao");
    const digitando = whats.querySelector(".demo-whats__digitando");
    let espera = null;
    whats.addEventListener("close", () => clearTimeout(espera));

    function abrirWhats(mensagem) {
        whats.querySelector(".demo-whats__texto").textContent = mensagem || DADOS.mensagemPadrao;
        whats.querySelector(".demo-whats__hora").textContent =
            new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) + " ✓✓";
        // "digitando..." e depois a mensagem aparece (fica bonito no vídeo)
        balao.hidden = true;
        digitando.hidden = false;
        whats.showModal();
        whats.querySelector(".demo-whats__ok").focus();
        clearTimeout(espera);
        const pressa = matchMedia("(prefers-reduced-motion: reduce)").matches;
        espera = setTimeout(
            () => {
                digitando.hidden = true;
                balao.hidden = false;
            },
            pressa ? 0 : 900,
        );
    }

    /* ---------- Instagram ---------- */
    const I = DADOS.insta;
    const insta = document.createElement("dialog");
    insta.className = "demo-insta";
    insta.setAttribute("aria-labelledby", "demo-insta-usuario");
    insta.innerHTML =
        '<div class="demo-insta__topo">' +
        '<button type="button" class="demo-insta__voltar" data-demo-fechar aria-label="Fechar prévia">‹</button>' +
        '<strong id="demo-insta-usuario"></strong><span class="demo-insta__selo" aria-label="verificado">✓</span>' +
        "</div>" +
        '<div class="demo-insta__corpo">' +
        '<div class="demo-insta__perfil">' +
        '<span class="demo-insta__anel">' + avatarHtml("demo-insta__avatar") + "</span>" +
        '<ul class="demo-insta__numeros" role="list"></ul>' +
        "</div>" +
        '<div class="demo-insta__bio"><strong></strong><span class="demo-insta__categoria"></span></div>' +
        '<div class="demo-insta__acoes">' +
        '<button type="button" class="demo-insta__botao demo-insta__botao--azul" aria-pressed="false">Seguir</button>' +
        '<button type="button" class="demo-insta__botao" data-demo-mensagem>Mensagem</button>' +
        "</div>" +
        '<ul class="demo-insta__destaques" role="list"></ul>' +
        '<ul class="demo-insta__grade" role="list"></ul>' +
        "</div>" +
        '<div class="demo-whats__rodape demo-insta__rodape">' +
        '<p class="demo-whats__aviso">Prévia do site: depois de publicado, este botão abre o Instagram de <strong></strong>.</p>' +
        '<button type="button" class="demo-whats__ok demo-insta__ok" data-demo-fechar>Entendi</button>' +
        "</div>";
    document.body.appendChild(insta);

    const texto = (tag, valor, classe) => {
        const e = document.createElement(tag);
        if (classe) e.className = classe;
        e.textContent = valor;
        return e;
    };
    const foto = (src) => {
        const img = document.createElement("img");
        img.src = src;
        img.alt = "";
        img.loading = "lazy";
        img.decoding = "async";
        return img;
    };

    insta.querySelector("#demo-insta-usuario").textContent = I.usuario;
    insta.querySelector(".demo-insta__rodape strong").textContent = nome;
    I.numeros.forEach(([n, rotulo]) => {
        const li = document.createElement("li");
        li.append(texto("strong", n), texto("span", rotulo));
        insta.querySelector(".demo-insta__numeros").appendChild(li);
    });
    const bio = insta.querySelector(".demo-insta__bio");
    bio.querySelector("strong").textContent = nome;
    bio.querySelector(".demo-insta__categoria").textContent = I.categoria;
    I.bio.forEach((linha) => bio.appendChild(texto("span", linha)));
    if (I.link) bio.appendChild(texto("span", "🔗 " + I.link, "demo-insta__link"));
    I.destaques.forEach(([rotulo, src]) => {
        const li = document.createElement("li");
        const bola = document.createElement("span");
        bola.className = "demo-insta__destaque";
        bola.appendChild(foto(src));
        li.append(bola, texto("span", rotulo));
        insta.querySelector(".demo-insta__destaques").appendChild(li);
    });
    I.fotos.forEach((src) => {
        const li = document.createElement("li");
        li.appendChild(foto(src));
        insta.querySelector(".demo-insta__grade").appendChild(li);
    });
    prepararAvatar(insta, "demo-insta__avatar");
    prepararDialogo(insta);

    const seguir = insta.querySelector("[aria-pressed]");
    seguir.addEventListener("click", () => {
        const segue = seguir.getAttribute("aria-pressed") !== "true";
        seguir.setAttribute("aria-pressed", String(segue));
        seguir.textContent = segue ? "Seguindo" : "Seguir";
        seguir.classList.toggle("demo-insta__botao--azul", !segue);
    });
    insta.querySelector("[data-demo-mensagem]").addEventListener("click", () => {
        insta.close();
        abrirWhats("");
    });

    function abrirInsta() {
        insta.querySelector(".demo-insta__corpo").scrollTop = 0;
        insta.showModal();
        insta.querySelector(".demo-insta__ok").focus();
    }

    // Um só ouvinte para todos os links das redes, inclusive os criados depois
    document.addEventListener("click", (e) => {
        const link = e.target.closest("a[href]");
        if (!link) return;
        let url;
        try {
            url = new URL(link.href);
        } catch (_) {
            return;
        }
        const host = url.hostname.replace(/^www\./, "");
        if (host === "wa.me" || host === "api.whatsapp.com") {
            e.preventDefault();
            origem = document.activeElement;
            abrirWhats(url.searchParams.get("text") || "");
        } else if (host === "instagram.com") {
            e.preventDefault();
            origem = document.activeElement;
            abrirInsta();
        }
    });
})();
