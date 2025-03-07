import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function geradorTransportePdfPago(dados: any) {
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
    doc.text("CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE TRANSPORTE ESCOLAR", 105, posY, { align: "center" });
    posY += 15;

    // Seção 1: Identificação das Partes Envolvidas
    addSection("IDENTIFICAÇÃO DAS PARTES ENVOLVIDAS", [
        "1.1. CONTRATANTE:",
        `Nome: ${verificarValor(dados.contratante_nome)}`,
        `Sexo: ${verificarValor(dados.contratante_sexo)}`,
        `Estado civil: ${verificarValor(dados.contratante_estado_civil)}`,
        `Nacionalidade: ${verificarValor(dados.contratante_nacionalidade)}`,
        `Profissão: ${verificarValor(dados.contratante_profissao)}`,
        `Documento de identificação (Rg ou CNH): ${verificarValor(dados.contratante_documento)}`,
        `Número: ${verificarValor(dados.contratante_numero)}`,
        `CPF: ${verificarValor(dados.contratante_cpf_cnpj)}`,
        `Endereço completo: ${verificarValor(dados.contratante_endereco)}`,
        `Contato (telefone): ${verificarValor(dados.contratante_telefone)}`,
        "",
        "1.2. CONTRATADO:",
        `Nome: ${verificarValor(dados.contratado_nome)}`,
        `Sexo: ${verificarValor(dados.contratado_sexo)}`,
        `Estado civil: ${verificarValor(dados.contratado_estado_civil)}`,
        `Nacionalidade: ${verificarValor(dados.contratado_nacionalidade)}`,
        `CNH: ${verificarValor(dados.contratado_documento)}`,
        `CPF: ${verificarValor(dados.contratado_cpf_cnpj)}`,
        `Endereço completo: ${verificarValor(dados.contratado_endereco)}`,
        `Contato (telefone): ${verificarValor(dados.contratado_telefone)}`,
    ]);

    // Seção 2: Descrição dos Serviços
    addSection("DESCRIÇÃO DOS SERVIÇOS", [
        "2.1. O contratado se compromete a prestar serviço de transporte escolar ao aluno abaixo identificado:",
        `Nome do aluno: ${verificarValor(dados.nomeDoAluno)}`,
        `Local de busca: ${verificarValor(dados.localBusca)}`,
        `Local de entrega: ${verificarValor(dados.localEntrega)}`,
        `Horário de partida: ${verificarValor(dados.horarioPartida)}`,
        `Horário de chegada: ${verificarValor(dados.horarioChegada)}`,
        `Dias da semana em que o serviço será prestado: ${verificarValor(dados.diasSemana)}`,
    ]);

    // Seção 3: Período de Validade
    addSection("PERÍODO DE VALIDADE", [
        `3.1. O presente contrato terá início em ${verificarValor(dados.inicioContrato)} e término em ${verificarValor(dados.fimContrato)}, podendo ser prorrogado por acordo entre as partes.`,
        `3.2. Caso seja de duração indeterminada, qualquer das partes poderá rescindi-lo mediante aviso prévio de ${verificarValor(dados.avisoPrevio)} dias.`,
    ]);

    // Seção 4: Tarifas e Pagamentos
    addSection("TARIFAS E PAGAMENTOS", [
        `4.1. O valor mensal do serviço será de R$ ${verificarValor(dados.valorMensal)}, a ser pago até o dia ${verificarValor(dados.dataVenc)} de cada mês.`,
        `4.2. Em caso de atraso no pagamento, será aplicada uma multa de ${verificarValor(dados.multa)}% sobre o valor devido.`,
    ]);

    // Seção 5: Responsabilidades do Contratante
    addSection("RESPONSABILIDADES DO CONTRATANTE", [
        `6.1. O contratante se compromete a comunicar alterações no trajeto ou na programação com antecedência mínima de ${verificarValor(dados.horasAntecedencia)} horas.`,
    ]);

    // Seção 6: Condições de Rescisão
    addSection("CONDIÇÕES DE RESCISÃO", [
        `7.1. O contrato pode ser rescindido por qualquer das partes mediante aviso prévio de ${verificarValor(dados.avisoPrevioRescisao)} dias.`,
        `7.2. O contrato será rescindido imediatamente em caso de falta de pagamento superior a ${verificarValor(dados.faltaPagamento)} dias.`,
    ]);

    // Seção 7: Jurisdição e Lei Aplicável
    addSection("JURISDIÇÃO E LEI APLICÁVEL", [
        `9.1. O presente contrato é regido pelas leis brasileiras.`,
        `10.1. Fica eleito o foro da comarca de ${verificarValor(dados.comarca)} para dirimir quaisquer dúvidas ou conflitos decorrentes deste contrato.`,
    ]);

    // Seção 8: Assinaturas e Testemunhas
    addSection("ASSINATURAS E TESTEMUNHAS", [
        `Estado de Assinatura: ${verificarValor(dados.estado)}`,
        `Comarca: ${verificarValor(dados.comarca)}`,
        `Local: ${verificarValor(dados.local)}`,
        `Data de Assinatura: ${verificarValor(dados.dataAssinatura)}`,
        `Registro em Cartório: ${verificarValor(dados.registroCartorioTest)}`,
        "",
        "Contratante: ___________________________",
        "Contratado: ___________________________",
        "",
        // Adiciona as testemunhas e suas assinaturas, se necessário
        dados.testemunhasNecessarias === 'S' ? `1ª Testemunha: ${verificarValor(dados.nomeTest1)} - CPF: ${verificarValor(dados.cpfTest1)}` : "",
        dados.testemunhasNecessarias === 'S' ? "Assinatura da 1ª Testemunha: ___________________________" : "",
        "",
        dados.testemunhasNecessarias === 'S' ? `2ª Testemunha: ${verificarValor(dados.nomeTest2)} - CPF: ${verificarValor(dados.cpfTest2)}` : "",
        dados.testemunhasNecessarias === 'S' ? "Assinatura da 2ª Testemunha: ___________________________" : "",
    ]);

    doc.save(`contrato_transporteescolar_${verificarValor(dados.contratante_nome)}.pdf`);

};
