import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function geradorPdfImovelResidencialPago(dados: any) {
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
    doc.text("CONTRATO DE SUBLOCAÇÃO DE IMÓVEL RESIDÊNCIAL", 105, posY, { align: "center" });
    posY += 15;

    // 1. Identificação das Partes
    addSection("1. Identificação das Partes", [
        "Art. 14 - O locatário não poderá sublocar o imóvel no todo ou em parte sem o consentimento prévio e por escrito do locador.",
        "Locador (Proprietário do Imóvel):",
        `Nome completo ou Razão Social: ${verificarValor(dados.locador) === 'pf' ? verificarValor(dados.nomeLocador) : verificarValor(dados.razaoSocial)}`,
        `CPF ou CNPJ: ${verificarValor(dados.locador) === 'pf' ? verificarValor(dados.CPFLocador) : verificarValor(dados.cnpjlocador)}`,
        `Endereço completo: ${verificarValor(dados.locador) === 'pf' ? verificarValor(dados.enderecoLocador) : verificarValor(dados.enderecoCNPJ)}`,
        `Telefone e e-mail para contato: ${verificarValor(dados.locador) === 'pf' ? verificarValor(dados.telefoneLocador) : verificarValor(dados.telefoneCNPJ)}, ${verificarValor(dados.locador) === 'pf' ? verificarValor(dados.emailLocador) : verificarValor(dados.emailCNPJ)}`,
        "",
        "Locatário (Inquilino Original):",
        `Nome completo: ${verificarValor(dados.locatario) === 'pf' ? verificarValor(dados.nomelocatario) : verificarValor(dados.razaoSociallocatario)}`,
        `CPF: ${verificarValor(dados.locatario) === 'pf' ? verificarValor(dados.CPFlocatario) : verificarValor(dados.cpflocatario)}`,
        `Endereço completo: ${verificarValor(dados.locatario) === 'pf' ? verificarValor(dados.enderecolocatario) : verificarValor(dados.enderecolocatarioCNPJ)}`,
        `Telefone e e-mail para contato: ${verificarValor(dados.locatario) === 'pf' ? verificarValor(dados.telefonelocatario) : verificarValor(dados.telefonelocatarioCNPJ)}, ${verificarValor(dados.locatario) === 'pf' ? verificarValor(dados.emaillocatario) : verificarValor(dados.emaillocatarioCNPJ)}`,
        "",
        "Sublocatário (Novo Inquilino):",
        `Nome completo: ${verificarValor(dados.sublocatario) === 'pf' ? verificarValor(dados.nomeSublocatario) : verificarValor(dados.razaoSocialsublocatario)}`,
        `CPF: ${verificarValor(dados.sublocatario) === 'pf' ? verificarValor(dados.CPFSublocatario) : verificarValor(dados.cpfsublocatario)}`,
        `Endereço completo: ${verificarValor(dados.sublocatario) === 'pf' ? verificarValor(dados.enderecoSublocatario) : verificarValor(dados.enderecosublocatarioCNPJ)}`,
        `Telefone e e-mail para contato: ${verificarValor(dados.sublocatario) === 'pf' ? verificarValor(dados.telefoneSublocatario) : verificarValor(dados.telefonesublocatarioCNPJ)}, ${verificarValor(dados.sublocatario) === 'pf' ? verificarValor(dados.emailSublocatario) : verificarValor(dados.emailsublocatarioCNPJ)}`,
    ]);

    // 2. Autorização para Sublocação
    addSection("2. Autorização para Sublocação", [
        `O locador original autorizou formalmente a sublocação ? ${verificarValor(dados.locadorAutoriza) === 'S' ? 'Sim' : 'Não'}`,
        verificarValor(dados.locadorAutoriza) === 'S' ? "Anexar a autorização por escrito ao contrato." : "Obter a autorização por escrito antes de prosseguir."
    ]);

    // 3. Descrição do Imóvel
    addSection("3. Descrição do Imóvel", [
        `Endereço completo do imóvel: ${verificarValor(dados.enderecoCompleto)}`,
        `Descrição detalhada do imóvel: ${verificarValor(dados.descDetalhada)}`,
        `Estado atual do imóvel: ${verificarValor(dados.estado)}`,
        `Finalidade: ${verificarValor(dados.finalidade)}`
    ]);

    // 4. Prazo da Sublocação
    addSection("4. Prazo da Sublocação", [
        `Data de início da sublocação: ${verificarValor(dados.dataInicio)}`,
        `Data de término da sublocação: ${verificarValor(dados.dataFim)}`,
        `Possibilidade de renovação ? ${verificarValor(dados.possibilidadeRenovacao) === 'S' ? 'Sim' : 'Não'}`,
        verificarValor(dados.possibilidadeRenovacao) === 'S' ? `Condições de renovação: ${verificarValor(dados.quaisCondicoes)}` : ""
    ]);

    // 5. Valor do Aluguel e Condições de Pagamento
    addSection("5. Valor do Aluguel e Condições de Pagamento", [
        `Valor mensal do aluguel: ${verificarValor(dados.valorMensal)}`,
        `Data de vencimento mensal: ${verificarValor(dados.dataVenci)}`,
        `Forma de pagamento: ${verificarValor(dados.formaPagamento)}`,
        `Multa por atraso no pagamento: ${verificarValor(dados.multaAtraso)}`,
        `Juros aplicáveis em caso de atraso: ${verificarValor(dados.jurosAplicaveis)}`
    ]);

    // 6. Garantias Locatícias
    addSection("6. Garantias Locatícias", [
        `Art. 37 - No contrato de locação, pode ser exigida pelo locador uma das seguintes modalidades de garantia:
                I - caução;
                II - fiança;
                III - seguro de fiança locatícia;`,
        `Tipo de garantia exigida: ${verificarValor(dados.garantia) === 'S' ? verificarValor(dados.qualgarantidor) : 'Nenhuma'}`,
        verificarValor(dados.garantia) === 'S' ? `Detalhes da garantia: ${verificarValor(dados.qualgarantidor) === 'fi' ? `Fiador: ${verificarValor(dados.nomeFiador)}, CPF: ${verificarValor(dados.cpfFiador)}` : verificarValor(dados.qualgarantidor) === 'caudep' ? `Caução em dinheiro: ${verificarValor(dados.valorTitCaucao)}` : verificarValor(dados.qualgarantidor) === 'caubem' ? `Caução em bem: ${verificarValor(dados.descBemCaucao)}` : verificarValor(dados.qualgarantidor) === 'ti' ? `Título de crédito: ${verificarValor(dados.descCredUtili)}` : `Seguro-fiança: ${verificarValor(dados.segFianca)}`}` : "",
        `Procedimento para devolução da garantia ao término do contrato: ${verificarValor(dados.procedimentoDevolucao)}`
    ]);

    // 7. Obrigações do Sublocador
    addSection("7. Obrigações do Sublocador", [
        `O sublocador se responsabiliza por: ${verificarValor(dados.sublocadorResponsa)}`,
        `O sublocador fornecerá algum serviço adicional? ${verificarValor(dados.sublocadorAdicional)}`
    ]);

    // 8. Obrigações do Sublocatário
    addSection("8. Obrigações do Sublocatário", [
        `Art. 23 - O locatário é obrigado a:
                 I - pagar pontualmente o aluguel e os encargos da locação, nos prazos ajustados;
                 II - utilizar o imóvel conforme foi ajustado e tratá-lo com o mesmo cuidado como se fosse seu;
                 III - restituir o imóvel, ao fim da locação, no estado em que o recebeu, salvo deteriorações decorrentes do uso normal.`,
        `O sublocatário pode sublocar ou ceder o imóvel a terceiros? ${verificarValor(dados.sublocatarioCeder)}`,
        `O sublocatário é responsável por: ${verificarValor(dados.sublocatarioManu)}`,
        `O sublocatário deve respeitar as leis e regulamentos aplicáveis ao uso do imóvel? ${verificarValor(dados.sublocatarioRespeita)}`,
        `O sublocatário é responsável por multas e infrações ocorridas durante o período de sublocação? ${verificarValor(dados.sublocatarioMulta)}`,
        `O sublocatário deve comunicar imediatamente ao sublocador sobre qualquer dano ao imóvel? ${verificarValor(dados.sublocatarioComunica)}`,
        `O sublocatário deve devolver o imóvel no mesmo estado em que o recebeu, salvo desgaste natural? ${verificarValor(dados.sublocatarioDevolve)}`
    ]);

    // 9. Despesas e Tributos
    addSection("9. Despesas e Tributos", [
        `Art. 22, VIII - Cabe ao locador pagar os impostos, taxas e o prêmio de seguro complementar contra incêndio, salvo disposição expressa em contrário no contrato.
                 Art. 25 - O sublocatário responde perante o locatário pelos atos que praticar no imóvel e pelas obrigações previstas no contrato de sublocação.`,
        `Despesas do sublocatário: ${verificarValor(dados.despesasSublocatario)}`,
        `Despesas do sublocador: ${verificarValor(dados.despesasSublocador)}`
    ]);

    // 10. Rescisão do Contrato
    addSection("10. Rescisão do Contrato", [
        `Art. 9º - A locação poderá ser desfeita:
                 I - por mútuo acordo;
                 II - em decorrência da prática de infração legal ou contratual;
                 III - em caso de falta de pagamento do aluguel e encargos;
                 IV - para realização de reparações urgentes determinadas pelo Poder Público.`,
        `Condições para rescisão antecipada: ${verificarValor(dados.condicoesRescisao)}`,
        `Multas ou penalidades aplicáveis: ${verificarValor(dados.multasPenalidades)}`,
        `Prazo para notificação prévia de rescisão: ${verificarValor(dados.prazo)}`
    ]);

    // 11. Disposições Gerais
    addSection("11. Disposições Gerais", [
        `Foro eleito para resolução de conflitos: ${verificarValor(dados.foroResolucaoConflitos)}`,
        `Necessidade de testemunhas para assinatura do contrato: ${verificarValor(dados.testemunhasNecessarias) === 'S' ? 'Sim' : 'Não'}`,
        verificarValor(dados.testemunhasNecessarias) === 'S' ? `Testemunha 1: ${verificarValor(dados.nomeTest1)}, CPF: ${verificarValor(dados.cpfTest1)}` : "",
        verificarValor(dados.testemunhasNecessarias) === 'S' ? `Testemunha 2: ${verificarValor(dados.nomeTest2)}, CPF: ${verificarValor(dados.cpfTest2)}` : "",
        `Local de assinatura: ${verificarValor(dados.local)}`,
        `Data de assinatura: ${verificarValor(dados.dataAssinatura)}`,
        `O contrato será registrado em cartório? ${verificarValor(dados.registroCartorio) === 'S' ? 'Sim' : 'Não'}`
    ]);

    addSection("12. Assinaturas", [
        "___________________________________________",
        `Locador: ${verificarValor(dados.locador) === 'pf' ? verificarValor(dados.nomeLocador) : verificarValor(dados.razaoSocial)}`,
        "",
        "___________________________________________",
        `Locatário: ${verificarValor(dados.locatario) === 'pf' ? verificarValor(dados.nomelocatario) : verificarValor(dados.razaoSociallocatario)}`,
        "",
        "___________________________________________",
        `Sublocatário: ${verificarValor(dados.sublocatario) === 'pf' ? verificarValor(dados.nomeSublocatario) : verificarValor(dados.razaoSocialsublocatario)}`,
        "",
        dados.testemunhasNecessarias === 'S' ? "___________________________________________" : "",
        dados.testemunhasNecessarias === 'S' ? `Testemunha 1: ${verificarValor(dados.nomeTest1)}` : "",
        dados.testemunhasNecessarias === 'S' ? "" : "",
        dados.testemunhasNecessarias === 'S' ? "___________________________________________" : "",
        dados.testemunhasNecessarias === 'S' ? `Testemunha 2: ${verificarValor(dados.nomeTest2)}` : ""
    ]);

    doc.save(`contrato_sublocacao_${dados.nomeLocador || dados.nomelocatario}.pdf`);
}