import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function geradorPrestacoesServicosPago(dados: any) {
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
    doc.text("CONTRATO DE PRESTAÇÃO DE SERVIÇO", 105, posY, { align: "center" });
    posY += 15;

    // Seção CONTRATANTE
    addSection("CONTRATANTE", [
        `Nome completo ou Razão Social: ${verificarValor(dados.contratante_nome)}`,
        `Estado Civil: ${verificarValor(dados.contratante_estado_civil)}`,
        `Nacionalidade: ${verificarValor(dados.contratante_nacionalidade)}`,
        `Profissão: ${verificarValor(dados.contratante_profissao)}`,
        `Carteira de Identidade: ${verificarValor(dados.contratante_rg)}`,
        `CPF/CNPJ: ${verificarValor(dados.contratante_cpf_cnpj)}`,
        `Residência: ${verificarValor(dados.contratante_endereco)}`,
        `Email: ${verificarValor(dados.contratante_email)}`,
        "Art. 104 do Código Civil: A validade do negócio jurídico requer agente capaz, objeto lícito e forma prescrita em lei."
    ]);

    // Seção CONTRATADO
    addSection("CONTRATADO", [
        `Nome completo ou Razão Social: ${verificarValor(dados.contratado_nome)}`,
        `Estado Civil: ${verificarValor(dados.contratado_estado_civil)}`,
        `Nacionalidade: ${verificarValor(dados.contratado_nacionalidade)}`,
        `Profissão: ${verificarValor(dados.contratado_profissao)}`,
        `Carteira de Identidade: ${verificarValor(dados.contratado_rg)}`,
        `CPF/CNPJ: ${verificarValor(dados.contratado_cpf_cnpj)}`,
        `Residência: ${verificarValor(dados.contratado_endereco)}`,
        `Email: ${verificarValor(dados.contratado_email)}`,
        "Art. 113 do Código Civil: Os negócios jurídicos devem ser interpretados conforme a boa-fé e os usos do lugar de sua celebração."
    ]);

    // Seção OBJETO
    addSection("OBJETO", [
        `Descrição do Serviço: ${verificarValor(dados.descricaoServico)}`,
        `Escopo do Serviço: ${verificarValor(dados.escopoServico)}`,
        `Critério de Avaliação do Serviço: ${verificarValor(dados.criterioServico)}`,
        "Art. 482 da CLT: Definição de justa causa e critérios de avaliação de desempenho."
    ]);

    // Seção PRAZO E VIGÊNCIA
    addSection("PRAZO E VIGÊNCIA", [
        `Duração do Contrato: ${verificarValor(dados.duracaoDoContrato)}`,
        `Data de Início: ${verificarValor(dados.dataInicio)}`,
        `Condições de Renovação: ${verificarValor(dados.condicoesRenovacao)}`,
        `Prazos de Revisão: ${verificarValor(dados.prazosRevisao)}`,
        "Art. 598 do Código Civil: O contrato de prestação de serviço não pode ser convencionado por mais de quatro anos."
    ]);

    // Seção PREÇO E CONDIÇÕES DE PAGAMENTO
    const pagamentoContent = [
        `Valor Total: ${verificarValor(dados.valorTotal)}`,
        `Forma de Pagamento: ${verificarValor(dados.formaPagamento)}`
    ];

    if (dados.formaPagamento === "Parcelado") {
        pagamentoContent.push(
            `Número de Parcelas: ${verificarValor(dados.numeroDeParcela)}`,
            `Valor da Parcela: ${verificarValor(dados.valorParcela)}`,
            `Data de Vencimento: ${verificarValor(dados.dataVenc)}`
        );
    } else {
        pagamentoContent.push(`Modalidade de Pagamento: ${verificarValor(dados.modalidade)}`);
    }

    if (dados.sinal === "S") {
        pagamentoContent.push(
            `Valor do Sinal: ${verificarValor(dados.valorSinal)}`,
            `Data de Pagamento do Sinal: ${verificarValor(dados.dataPag)}`
        );
    }

    if (dados.aplicaReajuste === "S") {
        pagamentoContent.push(
            `Reajuste Aplicado: ${verificarValor(dados.qualReajuste)}`
        );
    }

    pagamentoContent.push(`Conta Bancária: ${verificarValor(dados.contaBancaria)}`,
        "Art. 315 do Código Civil: As dívidas em dinheiro devem ser pagas em moeda corrente e pelo valor nominal.");

    addSection("PREÇO E CONDIÇÕES DE PAGAMENTO", pagamentoContent);

    // Seção OUTRAS CLAUSULAS
    const outrasClausulasContent = [
        `Cláusula Específica: ${verificarValor(dados.clausulaEspecifica)}`,
        "Art. 421 do Código Civil: A liberdade contratual será exercida nos limites da função social do contrato."
    ];

    if (dados.clausulaEspecifica === "S") {
        Object.entries(dados.extras).forEach(([key, value]) => {
            outrasClausulasContent.push(`${key}: ${verificarValor(value as string)}`);
        });
    }

    addSection("OUTRAS CLAUSULAS", outrasClausulasContent);

    // Seção RESCISÃO DO CONTRATO
    addSection("RESCISÃO DO CONTRATO", [
        `Condições de Rescisão: ${verificarValor(dados.condicoesRescisao)}`,
        `Multas e Penalidades: ${verificarValor(dados.multasPenalidades)}`,
        `Prazo: ${verificarValor(dados.prazo)}`,
        `Método de Resolução de Disputas: ${verificarValor(dados.metodoResolucao)}`,
        "Art. 478 do Código Civil: Nos contratos de execução continuada, se a prestação de uma das partes se tornar excessivamente onerosa, poderá ser resolvido ou revisto."
    ]);

    // Seção DISPOSIÇÕES GERAIS
    const disposicoesGeraisContent = [
        `Foro de Resolução de Conflitos: ${verificarValor(dados.foroResolucaoConflitos)}`,
        `Necessidade de Testemunhas: ${verificarValor(dados.testemunhasNecessarias)}`
    ];

    if (dados.testemunhasNecessarias === "S") {
        disposicoesGeraisContent.push(
            `Nome da Testemunha 1: ${verificarValor(dados.nomeTest1)}`,
            `CPF da Testemunha 1: ${verificarValor(dados.cpfTest1)}`,
            `Nome da Testemunha 2: ${verificarValor(dados.nomeTest2)}`,
            `CPF da Testemunha 2: ${verificarValor(dados.cpfTest2)}`
        );
    }

    disposicoesGeraisContent.push(
        `Local de Assinatura: ${verificarValor(dados.local)}`,
        `Data de Assinatura: ${verificarValor(dados.dataAssinatura)}`,
        `Registro em Cartório: ${verificarValor(dados.registroCartorioTest)}`,
        "Art. 129 da Lei de Registros Públicos: Alguns contratos podem exigir registro para maior segurança jurídica."
    );

    addSection("DISPOSIÇÕES GERAIS", disposicoesGeraisContent);


    // Espaço para assinatura do vendedor
    checkPageBreak(30);
    doc.text("__________________________________________", marginX, posY);
    posY += 10;
    doc.text("Assinatura do Contratante", marginX, posY);
    posY += 15;

    // Espaço para assinatura do comprador
    checkPageBreak(30);
    doc.text("__________________________________________", marginX, posY);
    posY += 10;
    doc.text("Assinatura do Contratado", marginX, posY);
    posY += 15;

    // Verifica se há testemunhas e adiciona os espaços para assinatura
    if (dados.testemunhasNecessarias === 'S') {
        checkPageBreak(30);
        doc.text("__________________________________________", marginX, posY);
        posY += 10;
        doc.text(`Assinatura da Testemunha 1: ${verificarValor(dados.nomeTest1)}`, marginX, posY);
        posY += 15;

        checkPageBreak(30);
        doc.text("__________________________________________", marginX, posY);
        posY += 10;
        doc.text(`Assinatura da Testemunha 2: ${verificarValor(dados.nomeTest2)}`, marginX, posY);
        posY += 15;
    }


    doc.save(`contrato_PrestacaoServico_${verificarValor(dados.contratante_nome)}.pdf`);

};