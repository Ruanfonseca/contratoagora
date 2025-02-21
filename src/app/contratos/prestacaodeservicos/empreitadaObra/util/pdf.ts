import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function geradorEmpreitadaObraPago(dados: any) {
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
    doc.text("CONTRATO DE EMPREITADA PARA EXECUÇÃO DE OBRA", 105, posY, { align: "center" });
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
        "Art. 113 do Código Civil: Os negócios jurídicos devem ser interpretados conforme a boa-fé e os usos do lugar de sua celebração."
    ]);

    // Seção DO OBJETO
    addSection("1. DO OBJETO", [
        `A CONTRATANTE contrata os serviços profissionais da CONTRATADA, que se compromete a executar a seguinte obra: ${verificarValor(dados.descricao_obra)}.`,
        `Os materiais necessários para a execução da obra serão fornecidos por: ${verificarValor(dados.materialCompra)}.`,
        `A obra terá início em ${verificarValor(dados.data_inicio)}.`,
        "Art. 421 do Código Civil: A liberdade de contratar será exercida em razão e nos limites da função social do contrato."
    ]);

    // Seção DA ENTREGA DA OBRA
    addSection("2. DA ENTREGA DA OBRA", [
        "A CONTRATANTE realizará a validação da obra no momento da entrega para avaliar sua conformidade. Poderá recusar o recebimento caso:",
        "- A obra não esteja de acordo com as especificações;",
        "- A execução não tenha seguido as normas técnicas;",
        "- Apresente defeitos impeditivos de uso.",
        "Caso a CONTRATANTE aceite a obra com ressalvas, poderá ser acordado um abatimento no valor.",
        "Art. 441 do Código Civil: O adquirente pode rejeitar a coisa se apresentar vícios que a tornem imprópria para o uso."
    ]);

    // Seção DA RETRIBUIÇÃO
    addSection("3. DA RETRIBUIÇÃO", [
        `A CONTRATANTE pagará à CONTRATADA a quantia de R$ ${verificarValor(dados.valor_total)}, da seguinte forma:`,
        `- ${verificarValor(dados.formaPagamento) === 'Avista' ? 'Pagamento à vista' : `Pagamento parcelado em ${verificarValor(dados.num_parcelas)} parcelas de R$ ${verificarValor(dados.valor_parcela)}, vencendo todo dia ${verificarValor(dados.dia_vencimento)} do mês`}.`,
        "Art. 315 do Código Civil: As dívidas em dinheiro devem ser pagas no vencimento estabelecido."
    ]);

    // Seção DAS OBRIGAÇÕES
    addSection("4. DAS OBRIGAÇÕES", [
        "A CONTRATADA se compromete a:",
        "- Executar a obra conforme normas técnicas;",
        "- Garantir a segurança no ambiente de trabalho;",
        "- Utilizar materiais adequados, caso seja sua responsabilidade fornecê-los;",
        "- Responder por eventuais danos a terceiros.",
        "A CONTRATANTE se compromete a:",
        "- Fornecer os documentos e liberações necessárias;",
        "- Realizar os pagamentos conforme o estipulado.",
        "Art. 422 do Código Civil: Os contratantes são obrigados a guardar, assim na conclusão do contrato como em sua execução, os princípios da probidade e boa-fé."
    ]);

    // Seção DOS RISCOS DA OBRA
    addSection("5. DOS RISCOS DA OBRA", [
        "Os riscos da obra, salvo dolo ou culpa da CONTRATADA, correrão por conta da CONTRATANTE. As partes responderão solidariamente por danos causados a propriedades vizinhas.",
        "Art. 927 do Código Civil: Haverá obrigação de reparar o dano, independentemente de culpa, nos casos especificados em lei."
    ]);

    // Seção DA RESCISÃO
    addSection("6. DA RESCISÃO", [
        "Este contrato poderá ser rescindido nos seguintes casos:",
        "- Por inadimplência de qualquer das partes;",
        "- Por impossibilidade de continuidade da obra por força maior;",
        "- Pela falência ou insolvência de qualquer uma das partes;",
        "- Caso a CONTRATANTE não realize os pagamentos devidos.",
        "Art. 478 do Código Civil: Nos contratos de execução continuada, se a prestação de uma das partes se tornar excessivamente onerosa, pode-se pedir a resolução do contrato."
    ]);

    // Seção DO DESCUMPRIMENTO E MULTA
    addSection("7. DO DESCUMPRIMENTO E MULTA", [
        `O descumprimento de quaisquer cláusulas sujeitará a parte infratora ao pagamento de uma multa de R$ ${verificarValor(dados.valor_multa)}, além de eventuais perdas e danos.`,
        "Art. 389 do Código Civil: O devedor responde por perdas e danos, juros e atualização monetária em caso de inadimplemento."
    ]);

    // Seção 10: Disposições Gerais
    addSection("10. DISPOSIÇÕES GERAIS", [
        "Art. 5º, inciso XXXV da Constituição Federal: A lei não excluirá da apreciação do Poder Judiciário lesão ou ameaça a direito.",
        `Foro eleito para resolução de conflitos: ${verificarValor(dados.foroResolucaoConflitos)}`,
        `Testemunhas necessárias: ${verificarValor(dados.testemunhasNecessarias) === 'S' ? `Testemunha 1: ${verificarValor(dados.nomeTest1)}, CPF: ${verificarValor(dados.cpfTest1)}. Testemunha 2: ${verificarValor(dados.nomeTest2)}, CPF: ${verificarValor(dados.cpfTest2)}` : 'Não são necessárias testemunhas.'}`,
        `Local de assinatura: ${verificarValor(dados.local)}`,
        `Data de assinatura: ${verificarValor(dados.dataAssinatura)}`,
        `Registro em cartório: ${verificarValor(dados.registroCartorioTest) === 'S' ? 'Sim' : 'Não'}`
    ]);


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


    doc.save(`contrato_empreitadaObra_${verificarValor(dados.contratante_nome)}.pdf`);

};