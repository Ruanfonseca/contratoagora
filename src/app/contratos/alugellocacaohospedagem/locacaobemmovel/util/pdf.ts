import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function gerarContratoLocacaoBemMovelPago(dados: any) {
    const doc = new jsPDF();

    const marginX = 10;
    let posY = 20;
    const maxPageHeight = 280;
    const maxTextWidth = 190;

    const checkPageBreak = (additionalHeight: any) => {
        if (posY + additionalHeight >= maxPageHeight) {
            doc.addPage();
            posY = 20;
        }
    };

    const addClause = (title: any, content: any) => {
        const titleHeight = 15;
        const lineHeight = 10;

        checkPageBreak(titleHeight);
        doc.setFontSize(12);
        doc.text(title, 105, posY, { align: "center" });
        posY += titleHeight;

        doc.setFontSize(10);
        content.forEach((line: any) => {
            const splitLines = doc.splitTextToSize(line, maxTextWidth);
            splitLines.forEach((splitLine: any) => {
                checkPageBreak(lineHeight);
                doc.text(splitLine, marginX, posY);
                posY += lineHeight;
            });
        });
    };


    // Página 1 - Título
    doc.setFontSize(14);
    doc.text("CONTRATO DE LOCAÇÃO DE BENS MÓVEIS", 105, posY, { align: "center" });
    posY += 20;

    // Cláusula 1 - Identificação das Partes
    addClause("CLÁUSULA PRIMEIRA - IDENTIFICAÇÃO DAS PARTES", [
        "As partes abaixo qualificadas celebram o presente contrato de locação de bens móveis,\n conforme disposto no Código Civil Brasileiro (art. 104, que estabelece os requisitos de validade dos negócios jurídicos).",
        "O presente contrato segue os princípios de autonomia das partes e boa-fé, previstos nos arts. 421 e 422 do Código Civil.",
        dados.locador === "pj"
            ? `LOCADOR: Razão Social: ${verificarValor(dados.razaoSocial)}, CNPJ: ${verificarValor(dados.cnpj)}, \nEndereço: ${verificarValor(dados.enderecoCNPJ)}, Telefone: ${verificarValor(dados.telefoneCNPJ)}, E-mail: ${verificarValor(dados.emailCNPJ)}. Representante Legal: ${verificarValor(dados.nomeRepresentanteCNPJ)}, CPF: ${verificarValor(dados.CPFRepresentanteCNPJ)}.`
            : `LOCADOR: Nome: ${verificarValor(dados.nomeLocador)}, CPF: ${verificarValor(dados.CPFLocador)}, \nEndereço: ${verificarValor(dados.enderecoLocador)}, Telefone: ${verificarValor(dados.telefoneLocador)}, E-mail: ${verificarValor(dados.emailLocador)}.`,
        dados.locatario === "pj"
            ? `LOCATÁRIO: Razão Social: ${verificarValor(dados.razaoSociallocatario)}, CNPJ: ${verificarValor(dados.cnpjLocatario)}, \nEndereço: ${verificarValor(dados.enderecolocatarioCNPJ)}, Telefone: ${verificarValor(dados.telefonelocatarioCNPJ)}, E-mail: ${verificarValor(dados.emaillocatarioCNPJ)}. Representante Legal: ${verificarValor(dados.nomeRepresentantelocatarioCNPJ)}, CPF: ${verificarValor(dados.CPFRepresentantelocatarioCNPJ)}.`
            : `LOCATÁRIO: Nome: ${verificarValor(dados.nomelocatario)}, CPF: ${verificarValor(dados.CPFlocatario)}, \nEndereço: ${verificarValor(dados.enderecolocatario)}, Telefone: ${verificarValor(dados.telefonelocatario)}, E-mail: ${verificarValor(dados.emaillocatario)}.`,
    ]);
    posY += 20;

    // Cláusula 2 - Descrição do Equipamento
    addClause("CLÁUSULA SEGUNDA - DESCRIÇÃO DO EQUIPAMENTO", [
        "Os bens móveis objeto do presente contrato possuem as características descritas a seguir. \nAs partes concordam com a obrigação de conservar o bem conforme disposto no art. 566 do Código Civil:",
        "Art. 566: O locatário é obrigado a conservar o bem no estado em que foi entregue,\n salvo deterioração decorrente do uso legítimo.",
        `Tipo de Equipamento: ${verificarValor(dados.tipodeequipamento)}.`,
        `Marca/Modelo: ${verificarValor(dados.marcaemodelo)}.`,
        `Número de Série: ${verificarValor(dados.numerodeserie)}.`,
        `Estado de Conservação: ${verificarValor(dados.estadoconservacao)}.`,
        `Acessórios/Componentes: ${verificarValor(dados.acessorioscomponentes)}.`,
    ]);

    // Cláusula 3 - Vigência do Contrato
    addClause("CLÁUSULA TERCEIRA - VIGÊNCIA DO CONTRATO", [
        "O prazo de vigência do presente contrato será conforme especificado abaixo, em conformidade com\n o art. 565 do Código Civil Brasileiro, que regulamenta os contratos de locação:",
        "Art. 565: Na locação de coisa, uma das partes se obriga a ceder à outra, por tempo determinado ou não,\n o uso e gozo de coisa não fungível, mediante certa retribuição.",
        `Data de Início: ${verificarValor(dados.dataInicioLocacao)}.`,
        `Data de Término: ${verificarValor(dados.dataTerminoLocacao)}.`,
        `Renovação Automática: ${verificarValor(dados.possibilidadeRenovacao) === "S" ? "Sim" : "Não"}.`,
        `Condições para Renovação: ${verificarValor(dados.condicao)}.`,
    ]);
    posY += 20;

    // Cláusula 4 - Valor e Condições de Pagamento
    addClause("CLÁUSULA QUARTA - VALOR E CONDIÇÕES DE PAGAMENTO", [
        "As condições financeiras do contrato seguem os arts. 566 e 575 do Código Civil Brasileiro:",
        "Art. 566: O locatário é obrigado a conservar a coisa e a devolvê-la, finda a locação, \nno estado em que a recebeu, salvo deterioração pelo uso legítimo.",
        "Art. 575: Aplicável aos contratos de locação de bens móveis, estabelecendo a \npossibilidade de rescisão por falta de pagamento.",
        `Valor Total: R$ ${verificarValor(dados.valorTotalLocacao)}.`,
        `Forma de Pagamento: ${verificarValor(dados.formaPagamento)}.`,
        `Data de Vencimento das Parcelas: ${verificarValor(dados.dataVencimentoParcela)}.`,
        `Multa por Atraso: ${verificarValor(dados.multaPorAtrasoPagamento)}%.`,
        `Juros por Atraso: ${verificarValor(dados.jurosporatraso)}%.`,
    ]);

    // Cláusula 5 - Garantias
    addClause("CLÁUSULA QUINTA - GARANTIAS", [
        "As garantias para cumprimento das obrigações previstas neste contrato seguem as\n diretrizes do art. 566 e art. 578 do Código Civil Brasileiro:",
        "Art. 566: Obriga o locatário a devolver o bem no estado em que foi entregue.",
        "Art. 578: Permite às partes incluir garantias adicionais para proteger os direitos do locador.",
        verificarValor(dados.garantia) === "S"
            ? `As garantias do presente contrato são: ${verificarValor(dados.qualgarantidor)}.`
            : "Não foram exigidas garantias para este contrato.",
    ]);

    // Cláusula 6 - Obrigações do Locador
    addClause("CLÁUSULA SEXTA - OBRIGAÇÕES DO LOCADOR", [
        "O LOCADOR se compromete a cumprir as seguintes obrigações, em conformidade com o art. 569 do Código Civil Brasileiro:",
        "Art. 569: O locador é obrigado a entregar a coisa locada em estado de servir ao uso a que se destina, \nmantê-la nesse estado durante a locação e assegurar ao locatário o uso pacífico.",
        `a) Entregar o equipamento nas condições especificadas: ${verificarValor(dados.entregaEquipLocador)}.`,
        `b) Garantir a manutenção do equipamento, quando aplicável: ${verificarValor(dados.garantiaManutencao)}.`,
        `c) Fornecer suporte técnico ao LOCATÁRIO, quando necessário: ${verificarValor(dados.forneceraSuporte)}.`,
        `d) Outras condições estabelecidas no presente contrato: ${verificarValor(dados.quaisCondicoes)}.`,
    ]);
    // Cláusula 7 - Obrigações do Locatário
    addClause("CLÁUSULA SÉTIMA - OBRIGAÇÕES DO LOCATÁRIO", [
        "O LOCATÁRIO se compromete a cumprir as seguintes obrigações, em conformidade \ncom os arts. 566 e 575 do Código Civil Brasileiro:",
        "Art. 566: O locatário é obrigado a conservar o bem no estado em que foi entregue,\n salvo deterioração decorrente do uso legítimo.",
        "Art. 575: O locatário pode ser responsabilizado pela rescisão contratual em \ncaso de descumprimento de obrigações.",
        `a) Utilizar o equipamento exclusivamente para os fins contratados: ${verificarValor(dados.finalidadeUso)}.`,
        `b) Zelar pela conservação do equipamento durante a vigência do contrato.`,
        `c) Comunicar ao LOCADOR qualquer defeito ou problema técnico no equipamento.`,
        `d) Restituir o equipamento no estado em que foi recebido, salvo desgaste natural pelo uso.`,
    ]);

    // Cláusula 8 - Rescisão Contratual
    addClause("CLÁUSULA OITAVA - RESCISÃO CONTRATUAL", [
        "A rescisão do presente contrato observará as condições previstas nos arts.\n 472 e 475 do Código Civil Brasileiro:",
        "Art. 472: O distrato deve observar a mesma forma exigida para o contrato.",
        "Art. 475: Permite a resolução do contrato por inadimplemento de uma das partes.",
        `a) O contrato poderá ser rescindido por inadimplemento de qualquer das partes.`,
        `b) O LOCADOR poderá rescindir o contrato em caso de uso inadequado do equipamento pelo LOCATÁRIO.`,
        `c) O LOCATÁRIO poderá rescindir o contrato caso o equipamento apresente defeitos\n que impeçam seu uso e o LOCADOR não realize os reparos necessários.`,
        `d) Condições adicionais de rescisão: ${verificarValor(dados.condicoesRescisao)}.`,
    ]);

    // Cláusula 9 - Penalidades
    addClause("CLÁUSULA NONA - PENALIDADES", [
        "As partes estão sujeitas às penalidades previstas neste contrato e \nno Código Civil Brasileiro, em especial no art. 389 e seguintes:",
        "Art. 389: O devedor que não cumprir a obrigação será responsável por\n perdas e danos, mais juros e atualização monetária.",
        `a) Multa por rescisão antecipada: ${verificarValor(dados.multaRescisao)}%.`,
        `b) Multa por uso inadequado do equipamento: ${verificarValor(dados.multaUsoInadequado)}%.`,
        `c) Outras penalidades previstas: ${verificarValor(dados.outrasPenalidades)}.`,
    ]);

    // Cláusula 10 - Disposições Gerais
    addClause("CLÁUSULA DÉCIMA - DISPOSIÇÕES GERAIS", [
        "As disposições gerais seguem os princípios de boa-fé e autonomia da vontade das partes, \nconforme disposto nos arts. 421 e 422 do Código Civil Brasileiro:",
        "Art. 421: O contrato deve respeitar a função social e os princípios de liberdade contratual.",
        "Art. 422: Os contratantes são obrigados a guardar, assim na conclusão do contrato,\n como em sua execução, os princípios de probidade e boa-fé.",
        `a) Quaisquer alterações neste contrato deverão ser realizadas por escrito e assinadas pelas partes.`,
        `b) As partes declaram que leram e concordam com todas as cláusulas deste contrato.`,
        `c) Fica eleito o foro da comarca de ${verificarValor(dados.foroComarca)} para dirimir eventuais controvérsias decorrentes deste contrato.`,
    ]);

    posY += 40; // Espaço antes da área de assinatura

    // Cláusula 11 - Assinatura e Data
    addClause("CLÁUSULA DÉCIMA PRIMEIRA - ASSINATURA E DATA", [
        "Por estarem de acordo, as partes assinam o presente contrato em duas vias de igual teor e forma,\n na presença de duas testemunhas, conforme disposto no art. 219 do Código Civil Brasileiro:",
        "Art. 219: O instrumento particular, feito e assinado ou somente assinado por quem esteja obrigado, \nfaz prova contra o seu signatário.",
    ]);

    // Espaço para assinatura do vendedor
    checkPageBreak(30);
    doc.text("__________________________________________", marginX, posY);
    posY += 10;
    doc.text("Assinatura do Locador", marginX, posY);
    posY += 15;

    // Espaço para assinatura do comprador
    checkPageBreak(10);
    doc.text("__________________________________________", marginX, posY);
    posY += 10;
    doc.text("Assinatura do Locatário", marginX, posY);
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

    // Salvar o PDF
    doc.save(`contrato_hospedagem_${dados.nomeLocador || dados.nomelocatario}.pdf`);
};