/* =====================================================================
   PAINEL DE CONTROLE DA PÁGINA — EconoWatt
   ---------------------------------------------------------------------
   Números, telefone, textos de cada perfil, premissas do simulador e
   IDs de rastreamento ficam AQUI. Os outros scripts só LEEM daqui.
   Textos fixos da página ficam no index.html, entre as marcações ✏️.

   Regras para editar sem quebrar:
   • Textos ficam entre aspas "assim". Se o texto tiver aspas, use 'assim'.
   • Números usam PONTO como decimal (1.49, não 1,49) e sem "R$".
   • Não apague vírgulas no fim das linhas.
   • Depois de salvar, recarregue a página com Ctrl + F5.
   ===================================================================== */

const CONFIG = deepFreeze({

  /* ---------- Projeto conceitual ----------
     true  = mostra a faixa "Projeto conceitual" e as etiquetas "Exemplo ilustrativo"
     false = versão oficial (só depois de trocar números e depoimentos por dados reais) */
  conceitual: true,

  /* ---------- Empresa ---------- */
  empresa: {
    nome: "EconoWatt Energia Solar",
    cidade: "Franca/SP",
    desde: 2023,
    instalacoes: 210,                    // aparece como "+210"
    potenciaInstalada: "1,6 MWp",
    // Vazio = modo demonstração: os botões do WhatsApp abrem um aviso de projeto conceitual.
    // Para ativar: só números, 55 + DDD + número (ex.: "5516999999999").
    whatsapp: "",
    whatsappExibicao: "(16) 90000-0000",   // fictício de propósito; trocar pelo real junto com o de cima
    horario: "seg. a sex., 8h às 18h · sáb., 9h às 15h",   // conforme o Google (02/11/2026)
    endereco: "R. Maria Martins de Araújo, 730 - Jardim Lima, Franca - SP, 14403-265",
    // Mapa do rodapé (carrega só ao clicar em "Ver no mapa")
    mapaBusca: "Econowatt, R. Maria Martins de Araújo, 730 - Jardim Lima, Franca - SP",
    avaliacaoGoogle: {                   // dados reais do Google Maps em 02/11/2026; atualizar de tempos em tempos
      nota: "5,0",
      total: 9,
      link: "https://www.google.com/maps/place/Econowatt/@-20.5578418,-47.4026338,17z"
    },
    cidadesAtendidas: [
      "Franca", "Batatais", "Patrocínio Paulista", "Cristais Paulista", "Restinga",
      "Pedregulho", "Itirapuã", "Ribeirão Corrente", "Jeriquara", "São José da Bela Vista"
    ],
    desenvolvedor: "João Pedro Morais"
  },

  /* ---------- Integrações ----------
     Deixe "" (vazio) enquanto não existir. Sem ID, os eventos aparecem só no console.
     Com qualquer ID preenchido, o aviso de cookies aparece e as ferramentas
     só carregam depois que a pessoa aceita (LGPD). */
  integracoes: {
    planilhaUrl: "",      // URL do App da Web do Google Apps Script (termina em /exec)
    metaPixelId: "",      // ex.: "123456789012345"
    googleTagId: "",      // ex.: "G-XXXXXXX" ou "AW-XXXXXXX"
    googleAdsConversao: "", // ex.: "AW-XXXXXXX/abcDEF" (rótulo da conversão de lead)
    clarityId: ""         // Microsoft Clarity (mapa de calor), ex.: "abcd1234ef"
  },

  /* ---------- Premissas do simulador ----------
     Fontes e justificativas em docs/pesquisa.md (valores fictícios até a pesquisa real) */
  simulador: {
    contaMinima: 200,                     // R$ — abaixo disso o simulador pede outro valor
    tarifaKwh: 1.00,                      // R$ por kWh com impostos (conferir na conta da CPFL)
    iluminacaoPublica: 15,                // R$ por mês, estimativa (conferir tabela da prefeitura)
    irradiacao: 5.4,                      // kWh/m²/dia (média de Franca, CRESESB)
    desempenho: 0.75,                     // perdas de calor, cabos, inversor e sujeira
    minimoKwh: { mono: 30, bi: 50, tri: 100 },   // taxa mínima da distribuidora
    fioB: { valorKwh: 0.12, fracaoInjetada: 0.70 }, // Lei 14.300: R$ 0,12/kWh já é o valor de 2026 (60% do Fio B)
    painelW: 610,                         // potência de cada placa
    custoPorKwp: [                        // R$ por kWp conforme o tamanho do sistema
      { ate: 3, valor: 5800 },
      { ate: 10, valor: 4900 },
      { ate: 75, valor: 4200 },
      { ate: Infinity, valor: 3600 }
    ],
    margemEstimativa: 0.10,               // ± 10% na faixa de economia
    financiamento: { taxaMes: 0.0149, parcelas: 96, carenciaDias: 120 }
  },

  /* ---------- Textos de cada perfil (seletor Casa / Comércio / Indústria e agro) ----------
     titulo1 = primeira linha · titulo2 = começo da segunda · verbo = palavra que cai (ou sobe)
     movimento: "cai" (desce) ou "sobe" */
  perfis: {
    casa: {
      rotulo: "Casa",
      titulo1: "Sua casa gera.",
      titulo2: "Sua conta",
      verbo: "cai.",
      movimento: "cai",
      subtitulo: "Veja em segundos quanto a sua conta cai com energia solar, e quanto ainda sobra.",
      dor: "Você já desligou o ar, cortou o banho longo, brigou por luz acesa. E a fatura de verão continua chegando com susto.",
      contaInicial: 400,
      contaMaxBarra: 3000,
      ligacaoPadrao: "bi",
      mensagemWhatsapp: "Olá, EconoWatt! Quero um orçamento de energia solar para minha casa."
    },
    comercio: {
      rotulo: "Comércio",
      titulo1: "Seu negócio gera.",
      titulo2: "Sua margem",
      verbo: "cresce.",
      movimento: "sobe",
      subtitulo: "Veja quanto da conta de luz volta para o caixa do seu negócio.",
      dor: "Geladeira, forno e ar não podem parar. Cada reajuste da CPFL sai direto da sua margem, e não dá para repassar tudo no preço.",
      contaInicial: 3000,
      contaMaxBarra: 30000,
      ligacaoPadrao: "tri",
      mensagemWhatsapp: "Olá, EconoWatt! Quero um orçamento de energia solar para meu comércio."
    },
    industria: {
      rotulo: "Indústria e agro",
      titulo1: "Sua produção gera.",
      titulo2: "Seu custo",
      verbo: "cai.",
      movimento: "cai",
      subtitulo: "Para fábricas, galpões e propriedades rurais. Veja quanto sai do custo de produção.",
      dor: "Máquina, secador e irrigação funcionam quando precisam, não quando a tarifa está boa. E a energia pesa justo no pico da produção.",
      contaInicial: 12000,
      contaMaxBarra: 200000,
      ligacaoPadrao: "tri",
      mensagemWhatsapp: "Olá, EconoWatt! Quero um orçamento de energia solar para minha indústria/propriedade rural."
    }
  },

  perfilPadrao: "casa"
});

/* Congela o objeto inteiro (inclusive os níveis de dentro) para que
   nenhum outro script altere a configuração por engano. */
function deepFreeze(obj) {
  Object.values(obj).forEach(function (valor) {
    if (valor && typeof valor === "object") deepFreeze(valor);
  });
  return Object.freeze(obj);
}
