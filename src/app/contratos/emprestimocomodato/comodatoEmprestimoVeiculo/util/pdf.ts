import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function geradorComodatoVeiculoPago(dados: any) {
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
    doc.text("Contrato de Comodato de Veículo", 105, posY, { align: "center" });
    posY += 15;

    // Seção 1: Identificação das Partes
    addSection("IDENTIFICAÇÃO DAS PARTES", [
        "1.1. CEDENTE (Proprietário do Veículo):",
        `Nome/Razão Social: ${verificarValor(dados.nomeRazaoSocial)}`,
        `CPF/CNPJ: ${verificarValor(dados.cpfcnpj)}`,
        `Endereço Completo: ${verificarValor(dados.enderecoCompleto)}`,
        `Documento de Identificação (RG/Outro): ${verificarValor(dados.documentoIdentifica)}`,
        `Número: ${verificarValor(dados.numeroDoc)}`,
        `Profissão: ${verificarValor(dados.profissao)}`,
        `Estado Civil: ${verificarValor(dados.estadoCivil)}`,
        "",
        "1.2. CESSIONÁRIO (Pessoa que receberá o veículo emprestado):",
        `Nome/Razão Social: ${verificarValor(dados.nomeRazaoSocialCessionario)}`,
        `CPF/CNPJ: ${verificarValor(dados.cpfcnpjCessionario)}`,
        `Endereço Completo: ${verificarValor(dados.enderecoCompletoCessionario)}`,
        `Documento de Identificação (RG/Outro): ${verificarValor(dados.documentoIdentificaCessionario)}`,
        `Número: ${verificarValor(dados.numeroDocCessionario)}`,
        `Profissão: ${verificarValor(dados.profissaoCessionario)}`,
        `Estado Civil: ${verificarValor(dados.estadoCivilCessionario)}`,
    ]);

    // Seção 2: Do Objeto do Contrato
    addSection("DO OBJETO DO CONTRATO", [
        "2.1. O presente contrato tem como objeto o empréstimo do seguinte veículo:",
        `Marca/Modelo: ${verificarValor(dados.marcaModelo)}`,
        `Ano de Fabricação: ${verificarValor(dados.anoFabricacao)}`,
        `Placa: ${verificarValor(dados.placa)}`,
        `Chassi: ${verificarValor(dados.chassi)}`,
        `Cor: ${verificarValor(dados.cor)}`,
        `Valor de mercado: ${verificarValor(dados.valorMercado)}`,
    ]);

    // Seção 3: Do Prazo do Empréstimo
    addSection("DO PRAZO DO EMPRÉSTIMO", [
        `3.1. O prazo de empréstimo será de ${verificarValor(dados.prazoEmprestimo)} dias/meses, com início em ${verificarValor(dados.inicio)} e término em ${verificarValor(dados.termino)}.`,
        `3.2. O CESSIONÁRIO deverá devolver o veículo no prazo estipulado, sob pena de multa no valor de R$ ${verificarValor(dados.multaAtraso)} por dia de atraso.`,
    ]);

    // Seção 4: Da Utilização do Veículo
    addSection("DA UTILIZAÇÃO DO VEÍCULO", [
        `4.1. O veículo será utilizado exclusivamente para ${verificarValor(dados.UsoMotivacao)}.`,
        "4.2. O CESSIONÁRIO se compromete a utilizar o veículo de forma adequada e conforme as normas de trânsito vigentes.",
        "4.3. Fica expressamente proibido o uso do veículo para fins ilícitos, corridas, transporte remunerado de pessoas ou cargas sem autorização prévia do CEDENTE.",
    ]);

    // Seção 5: Da Responsabilidade por Multas, Infrações e Danos
    addSection("DA RESPONSABILIDADE POR MULTAS, INFRAÇÕES E DANOS", [
        "5.1. O CESSIONÁRIO será integralmente responsável por quaisquer infrações de trânsito cometidas durante o período de empréstimo do veículo.",
        "5.2. Caso o veículo seja autuado por infração de trânsito, o CESSIONÁRIO deverá efetuar o pagamento da multa correspondente e assumir os pontos na CNH, quando aplicável.",
        "5.3. O CESSIONÁRIO é responsável por qualquer dano causado ao veículo, comprometendo-se a cobrir os custos de reparo ou substituição de peças.",
        "5.4. Em caso de acidente, o CESSIONÁRIO deverá comunicar imediatamente o CEDENTE e arcar com os custos de conserto e eventuais indenizações.",
    ]);

    // Seção 6: Da Transferência dos Direitos de Uso
    addSection("DA TRANSFERÊNCIA DOS DIREITOS DE USO", [
        "6.1. O CESSIONÁRIO não poderá emprestar, ceder ou alugar o veículo a terceiros sem a autorização expressa e por escrito do CEDENTE.",
    ]);

    // Seção 7: Da Manutenção do Veículo
    addSection("DA MANUTENÇÃO DO VEÍCULO", [
        "7.1. O CESSIONÁRIO será responsável por manter o veículo em perfeitas condições de uso, incluindo a reposição de combustível, troca de óleo e outros cuidados necessários.",
        "7.2. Qualquer necessidade de reparo deve ser previamente comunicada ao CEDENTE antes da realização do serviço.",
    ]);

    // Seção 5: Das Penalidades
    addSection("DAS PENALIDADES", [
        `8.1. O descumprimento de qualquer cláusula deste contrato sujeitará a parte infratora ao pagamento de multa de R$ ${verificarValor(dados.multaDescumprimento)}.`,
        "8.2. O inadimplemento de obrigações também poderá ensejar a rescisão imediata do contrato e a retirada do veículo do CESSIONÁRIO.",
    ]);

    // Seção 6: Do Foro
    addSection("DO FORO", [
        `9.1. Para dirimir quaisquer dúvidas ou controvérsias decorrentes deste contrato, fica eleito o foro da Comarca de ${verificarValor(dados.foroResolucaoConflitos)}, com renúncia expressa a qualquer outro, por mais privilegiado que seja.`,
    ]);

    // Seção 7: Assinaturas e Testemunhas
    addSection("ASSINATURAS E TESTEMUNHAS", [
        "E, por estarem justas e acordadas, as partes assinam o presente contrato em duas vias de igual teor, na presença das testemunhas abaixo.",
        `Registro em Cartório: ${dados.registroCartorioTest === 'S' ? 'Sim' : 'Não'}`,
        `Local: ${verificarValor(dados.local)}`,
        `Data: ${verificarValor(dados.dataAssinatura)}`,
        `Estado:${verificarValor(dados.estado)}`,
        "",
        "___________________________",
        "CEDENTE (Nome e Assinatura)",
        "",
        "",
        "___________________________",
        "CESSIONÁRIO (Nome e Assinatura)",
        "",
        "",
        `1ª Testemunha: ${verificarValor(dados.nomeTest1)} - CPF: ${verificarValor(dados.cpfTest1)}`,
        "___________________________",
        "Assinatura da 1ª Testemunha",
        "",
        "",
        `2ª Testemunha: ${verificarValor(dados.nomeTest2)} - CPF: ${verificarValor(dados.cpfTest2)}`,
        "___________________________",
        "Assinatura da 2ª Testemunha",
    ]);

    doc.save(`contrato_ComodatoVeiculo.pdf`);

};