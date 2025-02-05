import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function geradorPdfImovelComercialPago(dados: any) {
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
    doc.text("CONTRATO DE SUBLOCAÇÃO DE IMÓVEL COMERCIAL", 105, posY, { align: "center" });
    posY += 15;

    // 1. Identificação das Partes
    addSection("1. Identificação das Partes", [
        "Art. 11 da Lei do Inquilinato: O locador é obrigado a entregar ao locatário o imóvel alugado em estado de servir ao uso a que se destina.",
        `Locador (Proprietário do Imóvel):`,
        `Nome completo ou Razão Social: ${verificarValor(dados.locador === 'pf' ? dados.nomeLocador : dados.razaoSocial)}`,
        `CPF ou CNPJ: ${verificarValor(dados.locador === 'pf' ? dados.CPFLocador : dados.cnpjlocador)}`,
        `Endereço completo: ${verificarValor(dados.locador === 'pf' ? dados.enderecoLocador : dados.enderecoCNPJ)}`,
        `Telefone e e-mail para contato: ${verificarValor(dados.locador === 'pf' ? dados.telefoneLocador : dados.telefoneCNPJ)}, ${verificarValor(dados.locador === 'pf' ? dados.emailLocador : dados.emailCNPJ)}`,
        ``,
        `Locatário (Inquilino Original):`,
        `Nome completo ou Razão Social: ${verificarValor(dados.locatario === 'pf' ? dados.nomelocatario : dados.razaoSociallocatario)}`,
        `CPF ou CNPJ: ${verificarValor(dados.locatario === 'pf' ? dados.CPFlocatario : dados.cnpj)}`,
        `Endereço completo: ${verificarValor(dados.locatario === 'pf' ? dados.enderecolocatario : dados.enderecolocatarioCNPJ)}`,
        `Telefone e e-mail para contato: ${verificarValor(dados.locatario === 'pf' ? dados.telefonelocatario : dados.telefonelocatarioCNPJ)}, ${verificarValor(dados.locatario === 'pf' ? dados.emaillocatario : dados.emaillocatarioCNPJ)}`,
        ``,
        `Sublocador (Pessoa que irá sublocar o imóvel):`,
        `Nome completo ou Razão Social: ${verificarValor(dados.sublocador === 'pf' ? dados.nomeSublocador : dados.razaoSocialsublocador)}`,
        `CPF ou CNPJ: ${verificarValor(dados.sublocador === 'pf' ? dados.CPFSublocador : dados.cnpjsublocador)}`,
        `Endereço completo: ${verificarValor(dados.sublocador === 'pf' ? dados.enderecoSublocador : dados.enderecoCNPJsublocador)}`,
        `Telefone e e-mail para contato: ${verificarValor(dados.sublocador === 'pf' ? dados.telefoneSublocador : dados.telefoneCNPJsublocador)}, ${verificarValor(dados.sublocador === 'pf' ? dados.emailSublocador : dados.emailCNPJsublocador)}`,
        ``,
        `Sublocatário (Pessoa que irá sublocar o imóvel):`,
        `Nome completo ou Razão Social: ${verificarValor(dados.sublocatario === 'pf' ? dados.nomeSublocatario : dados.razaoSocialsublocatario)}`,
        `CPF ou CNPJ: ${verificarValor(dados.sublocatario === 'pf' ? dados.CPFSublocatario : dados.cnpjsublocatario)}`,
        `Endereço completo: ${verificarValor(dados.sublocatario === 'pf' ? dados.enderecoSublocatario : dados.enderecosublocatarioCNPJ)}`,
        `Telefone e e-mail para contato: ${verificarValor(dados.sublocatario === 'pf' ? dados.telefoneSublocatario : dados.telefonesublocatarioCNPJ)}, ${verificarValor(dados.sublocatario === 'pf' ? dados.emailSublocatario : dados.emailsublocatarioCNPJ)}`,
    ]);

    // 2. Descrição do Imóvel
    addSection("2. Descrição do Imóvel", [
        "Art. 22, I da Lei do Inquilinato: O locador deve entregar ao locatário o imóvel alugado em estado de servir ao uso a que se destina.",
        `Endereço completo do imóvel: ${verificarValor(dados.enderecoImovel)}`,
        `Descrição detalhada do imóvel: ${verificarValor(dados.descDetalhada)}`,
        `Finalidade da sublocação: ${verificarValor(dados.finalidade)}`,
        `Estado atual do imóvel: ${verificarValor(dados.estadoAtual)}`,
    ]);

    // 3. Prazo da Sublocação
    addSection("3. Prazo da Sublocação", [
        "Art. 4º da Lei do Inquilinato: Durante o prazo estipulado para a duração do contrato, não poderá o locador reaver o imóvel alugado.",
        `Data de início da sublocação: ${verificarValor(dados.dataInicio)}`,
        `Data de término da sublocação: ${verificarValor(dados.dataFim)}`,
        `Possibilidade de renovação: ${verificarValor(dados.possibilidadeRenovacao === 'S' ? 'Sim' : 'Não')}`,
        `Condições de renovação: ${verificarValor(dados.quaisCondicoes)}`,
    ]);

    // 4. Valor do Aluguel e Condições de Pagamento
    addSection("4. Valor do Aluguel e Condições de Pagamento", [
        "Art. 17 da Lei do Inquilinato: É livre a convenção do aluguel, vedada a estipulação em moeda estrangeira.",
        `Valor mensal do aluguel: ${verificarValor(dados.valorMensal)}`,
        `Data de vencimento mensal: ${verificarValor(dados.dataVenci)}`,
        `Forma de pagamento: ${verificarValor(dados.formaPagamento)}`,
        `Multa por atraso no pagamento: ${verificarValor(dados.multaAtraso)}`,
        `Juros aplicáveis em caso de atraso: ${verificarValor(dados.jurosAplicaveis)}`,
    ]);

    // 5. Garantias Locatícias
    addSection("5. Garantias Locatícias", [
        "Art. 37 da Lei do Inquilinato: No contrato de locação, pode o locador exigir do locatário as seguintes modalidades de garantia: caução, fiança, seguro de fiança locatícia e cessão fiduciária de quotas de fundo de investimento.",
        `Tipo de garantia exigida: ${verificarValor(dados.garantia === 'S' ? 'Sim' : 'Não')}`,
        `Detalhes da garantia: ${verificarValor(dados.qualgarantidor)}`,
        `Procedimento para devolução da garantia: ${verificarValor(dados.procedimentoDevolucao)}`,
    ]);

    // 6. Obrigações do Sublocador
    addSection("6. Obrigações do Sublocador", [
        "Art. 23 da Lei do Inquilinato: O locatário é obrigado a pagar pontualmente o aluguel e os encargos da locação, bem como utilizar o imóvel conforme estipulado.",
        `O sublocador se responsabiliza por: ${verificarValor(dados.sublocadorResponsa)}`,
        `Serviços adicionais fornecidos: ${verificarValor(dados.sublocadorAdicional)}`,
    ]);

    // 7. Obrigações do Sublocatário
    addSection("7. Obrigações do Sublocatário", [
        "Art. 24 da Lei do Inquilinato: O sublocatário responde perante o locador pela inobservância dos deveres impostos ao locatário.",
        `O sublocatário pode sublocar ou ceder o imóvel a terceiros: ${verificarValor(dados.sublocatarioCeder)}`,
        `O sublocatário é responsável por: ${verificarValor(dados.sublocatarioManu)}`,
        `O sublocatário deve respeitar as leis e regulamentos: ${verificarValor(dados.sublocatarioRespeita)}`,
        `O sublocatário é responsável por multas e infrações: ${verificarValor(dados.sublocatarioMulta)}`,
        `O sublocatário deve comunicar acidentes ou danos: ${verificarValor(dados.sublocatarioComunica)}`,
        `O sublocatário deve devolver o imóvel no mesmo estado: ${verificarValor(dados.sublocatarioDevolve)}`,
    ]);

    // 8. Despesas e Tributos
    addSection("8. Despesas e Tributos", [
        "Art. 22, VIII da Lei do Inquilinato: Compete ao locador pagar os impostos e taxas que incidam sobre o imóvel, salvo disposição contratual em contrário.",
        `Despesas do sublocatário: ${verificarValor(dados.despesasSublocatario)}`,
        `Despesas do sublocador: ${verificarValor(dados.despesasSublocador)}`,
    ]);

    // 9. Rescisão do Contrato
    addSection("9. Rescisão do Contrato", [
        "Art. 9º da Lei do Inquilinato: A locação poderá ser desfeita por mútuo acordo, infração contratual ou falta de pagamento.",
        `Condições para rescisão antecipada: ${verificarValor(dados.condicoesRescisao)}`,
        `Multas ou penalidades aplicáveis: ${verificarValor(dados.multasPenalidades)}`,
        `Prazo para notificação prévia: ${verificarValor(dados.prazo)}`,
    ]);

    // 10. Disposições Gerais
    addSection("10. Disposições Gerais", [
        "Art. 68 da Lei do Inquilinato: Nos litígios entre locador e locatário, é competente o foro da situação do imóvel.",
        `Foro eleito para resolução de conflitos: ${verificarValor(dados.foroResolucaoConflitos)}`,
        `Necessidade de testemunhas: ${verificarValor(dados.testemunhasNecessarias === 'S' ? 'Sim' : 'Não')}`,
        `Testemunha 1: ${verificarValor(dados.nomeTest1)}, CPF: ${verificarValor(dados.cpfTest1)}`,
        `Testemunha 2: ${verificarValor(dados.nomeTest2)}, CPF: ${verificarValor(dados.cpfTest2)}`,
        `Registro em cartório: ${verificarValor(dados.registroCartorio === 'S' ? 'Sim' : 'Não')}`,
        `Local: ${verificarValor(dados.local)}`,
        `Data de Assinatura: ${verificarValor(dados.dataAssinatura)}`,
    ]);

    checkPageBreak(60);
    posY += 20;
    doc.setFontSize(12);
    doc.text("Assinaturas:", 105, posY, { align: "center" });
    posY += 20;

    doc.text("Locador: ___________________________", marginX, posY);
    posY += 15;
    doc.text("Locatário: ___________________________", marginX, posY);
    posY += 15;
    doc.text("Sublocador: ___________________________", marginX, posY);
    posY += 15;
    doc.text("Sublocatário: ___________________________", marginX, posY);

    doc.save(`contrato_sublocacao_${dados.nomeLocador || dados.nomelocatario}.pdf`);

};