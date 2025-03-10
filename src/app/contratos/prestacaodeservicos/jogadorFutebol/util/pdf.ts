import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function geradorJogadorFutebolPDF(dados: any) {
    const doc = new jsPDF();

    // Configuração inicial de fonte e margens
    const marginX = 10;
    let posY = 20;

    // Altura máxima permitida antes de criar uma nova página
    const maxPageHeight = 280;

    // Largura do texto permitida dentro das margens
    const maxTextWidth = 190;

    // Função auxiliar para verificar espaço restante na página
    const checkPageBreak = (additionalHeight: number) => {
        if (posY + additionalHeight >= maxPageHeight) {
            doc.addPage();
            posY = 20; // Reinicia a posição no topo da nova página
        }
    };

    // Função auxiliar para adicionar seções e ajustar a posição Y
    const addSection = (title: string, content: string[]) => {
        const titleHeight = 15; // Altura do título
        const lineHeight = 10; // Altura de cada linha de texto

        // Verifica espaço antes de adicionar o título
        checkPageBreak(titleHeight);
        doc.setFontSize(12);
        doc.text(title, 105, posY, { align: "center" });
        posY += titleHeight;

        // Adiciona o conteúdo, verificando quebra de páginas
        doc.setFontSize(10);
        content.forEach((line: string) => {
            // Divide o texto em linhas com base na largura permitida
            const splitLines = doc.splitTextToSize(line, maxTextWidth); // Quebra automática
            splitLines.forEach((splitLine: string) => {
                checkPageBreak(lineHeight); // Verifica quebra de página para cada linha
                doc.text(splitLine, marginX, posY);
                posY += lineHeight;
            });
        });
    };


    // Página 1 - Cabeçalho
    doc.setFontSize(14);
    doc.text("CONTRATO DE REPRESENTAÇÃO DE JOGADOR DE FUTEBOL", 105, posY, { align: "center" });
    posY += 15;

    // Seção 1: Identificação das Partes
    addSection("1. Identificação das Partes", [
        "JOGADOR REPRESENTADO:",
        `Nome completo: ${verificarValor(dados.nomeJogador)}`,
        `Endereço completo: ${verificarValor(dados.enderecoJogador)}`,
        `Documento de identificação (RG ou passaporte): ${verificarValor(dados.documentoJogador)}`,
        `Número do documento: ${verificarValor(dados.numeroJogador)}`,
        `CPF: ${verificarValor(dados.cpfJogador)}`,
        `Data de nascimento: ${verificarValor(dados.dataNascimento)}`,
        `(O jogador é menor de idade? (${dados.menor === 'S' ? 'Sim' : 'Não'})`,
        dados.menor === 'S' ? `Se sim, informar dados do responsável legal: Nome: ${verificarValor(dados.responsavelNome)}, Nacionalidade: ${verificarValor(dados.responsavelNacionalidade)}, Profissão: ${verificarValor(dados.responsabilidadeProfissao)}, RG: ${verificarValor(dados.responsabilidadeRG)}, CPF: ${verificarValor(dados.responsabilidadeCPF)}, Endereço: ${verificarValor(dados.responsabilidadeEndereco)}` : ""
    ]);

    addSection("REPRESENTANTE/AGENTE INTERMEDIÁRIO:", [
        `(${dados.pessoa === 'fisica' ? 'X' : ' '}) Pessoa física`,
        dados.pessoa === 'fisica' ? `Nome completo: ${verificarValor(dados.nomeRepre)}` : "",
        dados.pessoa === 'fisica' ? `Endereço completo: ${verificarValor(dados.enderecoRepre)}` : "",
        dados.pessoa === 'fisica' ? `Documento de identificação (RG ou passaporte): ${verificarValor(dados.documentoRepre)}` : "",
        dados.pessoa === 'fisica' ? `CPF: ${verificarValor(dados.cpfRepre)}` : "",
        `(${dados.pessoa === 'Juridico' ? 'X' : ' '}) Pessoa jurídica`,
        dados.pessoa === 'Juridico' ? `Razão social: ${verificarValor(dados.razaoSocial)}` : "",
        dados.pessoa === 'Juridico' ? `CNPJ: ${verificarValor(dados.cnpj)}` : "",
        dados.pessoa === 'Juridico' ? `Representante legal: Nome: ${verificarValor(dados.representanteNome)}, Cargo: ${verificarValor(dados.representanteCargo)}, Identidade: ${verificarValor(dados.representanteIdentidade)}, CPF: ${verificarValor(dados.representanteCpf)}` : "",
        dados.pessoa === 'Juridico' ? `Endereço completo: ${verificarValor(dados.representanteEndereco)}` : ""
    ]);

    // Seção 2: Termo de Representação
    addSection("2. Termo de Representação", [
        `2.1. O presente contrato terá vigência de ${verificarValor(dados.vigencia)}, iniciando-se em ${verificarValor(dados.iniciando)} e encerrando-se em ${verificarValor(dados.fechando)}.`
    ]);

    // Seção 3: Responsabilidades do Representante
    addSection("3. Responsabilidades do Representante", [
        "3.1. Representar o jogador em negociações contratuais, transferências e acordos comerciais.",
        "3.2. Buscar oportunidades de carreira, incluindo contratos publicitários e participações em eventos.",
        "3.3. Assessorar o jogador na tomada de decisões relacionadas à sua carreira.",
        "3.4. Garantir a transparência e boas práticas na intermediação de contratos."
    ]);

    // Seção 4: Poderes do Representante
    addSection("4. Poderes do Representante", [
        "4.1. Assinar contratos e negociar termos financeiros em nome do jogador, quando autorizado por procuração específica.",
        "4.2. Representar o jogador em reuniões e tratativas relacionadas à sua carreira.",
        "4.3. Buscar oportunidades de marketing, imagem e patrocínio para o jogador."
    ]);

    // Seção 5: Comissões e Remuneração
    addSection("5. Comissões e Remuneração", [
        `5.1. O representante receberá como comissão ${verificarValor(dados.comissao)}% sobre os rendimentos obtidos pelo jogador nos contratos intermediados.`,
        "5.2. Os pagamentos serão realizados conforme periodicidade e condições acordadas entre as partes.",
        `5.3. Em caso de atraso, será aplicada multa de ${verificarValor(dados.multa)}% ao mês sobre o valor devido.`
    ]);

    // Seção 6: Representação Exclusiva
    addSection("6. Representação Exclusiva", [
        `6.1. O presente contrato (${dados.concedeExclusividade === 'concede' ? '✓' : ' '}) concede (${dados.concedeExclusividade === 'naoconcede' ? '✓' : ' '}) não concede exclusividade ao representante.`,
        "6.2. Caso conceda exclusividade, o jogador não poderá firmar contratos com outros agentes durante a vigência deste contrato."
    ]);

    // Seção 7: Deveres e Obrigações do Jogador
    addSection("7. Deveres e Obrigações do Jogador", [
        "7.1. Fornecer informações verdadeiras e precisas sobre sua carreira e interesses profissionais.",
        "7.2. Cumprir todas as obrigações contratuais assumidas por meio da intermediação do representante.",
        "7.3. Notificar previamente o representante sobre quaisquer negociações paralelas."
    ]);

    // Seção 8: Rescisão do Contrato
    addSection("8. Rescisão do Contrato", [
        `8.1. O contrato poderá ser rescindido por qualquer das partes mediante aviso prévio de ${verificarValor(dados.avisoPrevio)} dias.`,
        "8.2. Em caso de violação de obrigações contratuais, a parte prejudicada poderá rescindir o contrato imediatamente.",
        `8.3. Caso ocorra rescisão sem justa causa, a parte infratora deverá pagar multa de R$ ${verificarValor(dados.multaRescisao)}.`
    ]);

    // Seção 9: Foro para Resolução de Disputas
    addSection("9. Foro para Resolução de Disputas", [
        `9.1. As partes elegem o foro da Comarca de ${verificarValor(dados.comarca)}, para dirimir quaisquer dúvidas ou questões oriundas deste contrato.`
    ]);

    // Assinaturas
    addSection("E por estarem assim justas e contratadas, as partes assinam o presente instrumento em duas vias de igual teor e forma.", [
        `Data: ${verificarValor(dados.dataAssinatura)}`,
        "Assinaturas:",
        "_____________________________ (JOGADOR)",
        "_____________________________ (REPRESENTANTE)"
    ]);

    if (dados.testemunhasNecessarias === 'S') {
        addSection("Testemunhas:", [
            `Nome: ${verificarValor(dados.nomeTest1)} CPF: ${verificarValor(dados.cpfTest1)}`,
            "Assinatura: _____________________________",
            `Nome: ${verificarValor(dados.nomeTest2)} CPF: ${verificarValor(dados.cpfTest2)}`,
            "Assinatura: _____________________________"
        ]);
    }

    // Registro em Cartório
    if (dados.registroCartorioTest === 'S') {
        addSection("Registro em Cartório", [
            "O presente contrato será registrado em cartório."
        ]);
    }

    doc.save(`contrato_jogador_${verificarValor(dados.nomeJogador)}.pdf`);
};