import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function geradorServicoEnsinoPago(dados: any) {
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
    doc.text("CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS - AULAS PARTICULARES", 105, posY, { align: "center" });
    posY += 15;

    // Seção 1 - Aluno Contratante
    addSection("Aluno Contratante", [
        "Art. 104 do Código Civil – Trata sobre os requisitos de validade dos negócios jurídicos, incluindo a capacidade das partes envolvidas.",
        "Art. 166 e 171 do Código Civil – Definem hipóteses de nulidade e anulabilidade do contrato.",
        `Nome completo: ${verificarValor(dados.nomeCompleto)}`,
        `Estado civil: ${verificarValor(dados.estadoCivil)}`,
        `Nacionalidade: ${verificarValor(dados.nacionalidade)}`,
        `Profissão: ${verificarValor(dados.profissao)}`,
        `Carteira de identidade (RG): ${verificarValor(dados.rgAluno)}`,
        `CPF: ${verificarValor(dados.cpfAluno)}`,
        `Endereço completo: ${verificarValor(dados.enderecoAluno)}`,
        `Contato (telefone/e-mail): ${verificarValor(dados.telefone)} / ${verificarValor(dados.email)}`
    ]);

    // Seção 2 - Profissional Contratado
    addSection("Profissional Contratado", [
        `Nome completo: ${verificarValor(dados.nomeCompletoContratado)}`,
        `Estado civil: ${verificarValor(dados.estadoCivilContratado)}`,
        `Nacionalidade: ${verificarValor(dados.nacionalidadeContratado)}`,
        `Profissão: ${verificarValor(dados.profissaoContratado)}`,
        `Carteira de identidade (RG): ${verificarValor(dados.rgContratado)}`,
        `CPF: ${verificarValor(dados.cpfContratado)}`,
        `Endereço completo: ${verificarValor(dados.enderecoContratado)}`,
        `Contato (telefone/e-mail): ${verificarValor(dados.telefoneContratado)} / ${verificarValor(dados.emailContratado)}`
    ]);

    // Seção 3 - Objeto do Contrato
    addSection("Objeto do Contrato", [
        "Art. 421 do Código Civil – Trata da liberdade contratual e seus limites pela função social do contrato.",
        "Art. 422 do Código Civil – Determina que os contratantes devem agir com boa-fé e lealdade.",
        "O presente contrato tem por objeto a prestação de serviços educacionais por parte do Profissional Contratado ao Aluno Contratante, por meio de aulas particulares.",
        `Disciplina/Matéria a ser ministrada: ${verificarValor(dados.disciplinaMinistrada)}`,
        `Duração de cada aula: ${verificarValor(dados.duracao)} minutos.`,
        `Frequência: ${verificarValor(dados.frequencia)} vezes por semana.`,
        `Horários e dias acordados: ${verificarValor(dados.horarios)} / ${verificarValor(dados.diasAcordados)}`,
        `Haverá taxa de matrícula? ${verificarValor(dados.taxaMatricula) === 'S' ? 'Sim' : 'Não'}. Caso afirmativo, valor: R$ ${verificarValor(dados.valorMatricula)}`
    ]);

    // Seção 4 - Honorários e Forma de Pagamento
    addSection("Honorários e Forma de Pagamento", [
        "Art. 481 do Código Civil – Dispõe sobre contratos onerosos e a obrigação de pagamento.",
        " Art. 315 do Código Civil – Determina que o pagamento deve ser feito em moeda corrente e nos termos estipulados.",
        "Art. 316 do Código Civil – Permite a correção do valor quando houver desproporção manifesta.",
        `Valor: O valor de cada aula será de R$ ${verificarValor(dados.valorAula)} ou um pacote mensal de R$ ${verificarValor(dados.valorAulaMensal)}.`,
        `Forma de Pagamento: O pagamento será realizado via ${verificarValor(dados.modalidade)}.`,
        `Vencimento: O pagamento deverá ser efetuado até o dia ${verificarValor(dados.vencimento)} de cada mês.`,
        `Multa por Atraso: Em caso de atraso, incidirá uma multa de ${verificarValor(dados.multaPorAtraso)}% sobre o valor devido, além de juros de ${verificarValor(dados.juros)}% ao dia.`
    ]);

    // Seção 5 - Política de Cancelamento e Reagendamento
    addSection("Política de Cancelamento e Reagendamento", [
        "Art. 475 do Código Civil – Define que a parte lesada por inadimplemento pode pedir rescisão do contrato e exigir indenização.",
        "Art. 476 do Código Civil – Trata da exceção do contrato não cumprido, permitindo que uma parte não cumpra sua obrigação caso a outra também não o faça.",
        `Cancelamento de Aulas: O Aluno Contratante deverá notificar o cancelamento com antecedência mínima de ${verificarValor(dados.horasCancelamento)} horas. Caso contrário, a aula será considerada ministrada e cobrada integralmente.`,
        `Reagendamento: O reagendamento está sujeito à disponibilidade do Profissional Contratado e deve ser solicitado com ${verificarValor(dados.horasReagendamento)} horas de antecedência.`,
        "Reembolso: Em caso de pagamento antecipado, se houver cancelamento do contrato, será reembolsado apenas o valor das aulas ainda não ministradas, descontando eventuais taxas administrativas."
    ]);

    // Seção 6 - Responsabilidades das Partes
    addSection("Responsabilidades das Partes", [
        "Art. 599 do Código Civil – Estabelece as obrigações do prestador de serviços quanto à diligência e competência.",
        "Art. 607 do Código Civil – Trata da rescisão do contrato de prestação de serviços por qualquer uma das partes.",
        "Responsabilidades do Professor:",
        "- Ministrar as aulas conforme o cronograma acordado;",
        "- Fornecer materiais didáticos adicionais, se aplicável;",
        "- Informar previamente sobre eventuais cancelamentos.",
        "",
        "Responsabilidades do Aluno:",
        "- Comparecer pontualmente às aulas agendadas;",
        "- Informar previamente sobre cancelamentos ou impossibilidades;",
        "- Realizar os pagamentos conforme estipulado neste contrato."
    ]);

    // Seção 7 - Rescisão do Contrato
    addSection("Rescisão do Contrato", [
        "Art. 603 do Código Civil – Prevê que, caso uma das partes deseje rescindir o contrato, deve haver um aviso prévio razoável.",
        "Art. 608 do Código Civil – Prevê que a rescisão sem justa causa pode acarretar indenização à parte prejudicada.",
        `O presente contrato poderá ser rescindido pelas partes mediante aviso prévio de ${verificarValor(dados.avisoPrevio)} dias. Caso a rescisão ocorra sem aviso prévio, a parte que rescindir deverá pagar multa correspondente a ${verificarValor(dados.multaRescisao)}% do valor restante do contrato.`
    ]);

    // Seção 8 - Penalidades por Descumprimento
    addSection("Penalidades por Descumprimento", [
        "Art. 389 do Código Civil – Determina que o devedor responde por perdas e danos quando não cumpre a obrigação.",
        "Art. 395 do Código Civil – Trata da responsabilidade do devedor por mora.",
        "Art. 416 do Código Civil – Permite a estipulação de cláusula penal nos contratos.",
        `Em caso de descumprimento de qualquer cláusula deste contrato, a parte infratora estará sujeita ao pagamento de multa de R$ ${verificarValor(dados.multaPenalidade)}, além das demais penalidades previstas em lei.`
    ]);

    // Seção 9 - Foro
    addSection("Foro", [
        "Art. 112 do Código Civil – Estabelece que a interpretação dos contratos deve levar em conta a intenção das partes.",
        " Art. 53 do Código de Processo Civil – Permite a escolha do foro para resolução de conflitos.",
        `Fica eleito o foro da comarca de ${verificarValor(dados.foroResolucaoConflitos)}, Estado de ${verificarValor(dados.estado)}, para dirimir quaisquer dúvidas ou litígios oriundos deste contrato.`
    ]);

    // Espaço para assinatura do vendedor
    checkPageBreak(30);
    doc.text("__________________________________________", marginX, posY);
    posY += 10;
    doc.text("Assinatura do Aluno", marginX, posY);
    posY += 15;

    // Espaço para assinatura do comprador
    checkPageBreak(30);
    doc.text("__________________________________________", marginX, posY);
    posY += 10;
    doc.text("Assinatura do Professor/tutor", marginX, posY);
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


    doc.save(`contrato_servicoensino.pdf`);

};
