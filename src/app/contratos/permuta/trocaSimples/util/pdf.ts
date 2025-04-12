import jsPDF from "jspdf";

export default function geradorTrocaSimplesPago(dados: any) {
    const doc = new jsPDF();
    doc.setFont("Times"); // Fonte padrão ABNT

    // Margens conforme ABNT
    const marginLeft = 30;
    const marginRight = 20;
    const marginTop = 20;
    const marginBottom = 20;

    let posY = marginTop;
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxTextWidth = doc.internal.pageSize.getWidth() - marginLeft - marginRight;

    const checkPageBreak = (additionalHeight: number) => {
        if (posY + additionalHeight >= pageHeight - marginBottom) {
            doc.addPage();
            posY = marginTop;
        }
    };

    const verificarValor = (valor: any, textoPadrao = "Não informado") => {
        return valor && valor !== "" ? valor : textoPadrao;
    };

    const addClause = (title: string, content: string[]) => {
        const titleHeight = 10;
        const lineHeight = 7.5; // Espaçamento de linha 1,5

        // Título da cláusula
        checkPageBreak(titleHeight);
        doc.setFontSize(12);
        doc.setFont("Times", "bold");
        doc.text(title, doc.internal.pageSize.getWidth() / 2, posY, { align: "center" });
        posY += titleHeight;

        // Corpo da cláusula
        doc.setFontSize(12);
        doc.setFont("Times", "normal");
        content.forEach((line) => {
            const splitLines = doc.splitTextToSize(line, maxTextWidth);
            splitLines.forEach((splitLine: string | string[]) => {
                checkPageBreak(lineHeight);
                doc.text(splitLine, marginLeft, posY);
                posY += lineHeight;
            });
        });
    };

    // Página 1 - Título principal
    doc.setFontSize(14);
    doc.setFont("Times", "bold");
    doc.text("CONTRATO DE PERMUTA", doc.internal.pageSize.getWidth() / 2, posY, { align: "center" });
    posY += 20;

    // 1. IDENTIFICAÇÃO DAS PARTES
    addClause("1. IDENTIFICAÇÃO DAS PARTES", [
        "Pelo presente instrumento particular de permuta, as partes abaixo qualificadas têm entre si justo e contratado o seguinte:"
    ]);
    posY += 5;

    // 1.1. Primeiro Permutante
    addClause("1.1. Primeiro Permutante:", []);

    if (dados.pessoaPermutante === "juridico") {
        addClause("Pessoa Jurídica:", [
            `Razão Social: ${verificarValor(dados.razaoSocial)}`,
            `CNPJ: ${verificarValor(dados.cnpj)}`,
            `Endereço: ${verificarValor(dados.enderecoJuridico)}`,
            `Nome do Representante Legal: ${verificarValor(dados.nomeRepresentante)}`,
            `Cargo do Representante: ${verificarValor(dados.cargoRepresentante)}`,
            `CPF do Representante: ${verificarValor(dados.cpfRepresentante)}`,
            `Endereço do Representante: ${verificarValor(dados.enderecoRepresentante)}`,
            `Telefone para contato: ${verificarValor(dados.telefoneRepresentante)}`
        ]);
    } else {
        addClause("Pessoa Física:", [
            `Nome Completo: ${verificarValor(dados.nomePermutante)}`,
            `Sexo: ${verificarValor(dados.sexoPermutante)}`,
            `Estado Civil: ${verificarValor(dados.estadoCivilPermutante)}`,
            `Nacionalidade: ${verificarValor(dados.nacionalidadePermutante)}`,
            `Profissão: ${verificarValor(dados.profissaoPermutante)}`,
            `Documento de Identificação: ${verificarValor(dados.documentoPermutante)}`,
            `Número do Documento: ${verificarValor(dados.numeroPermutante)}`,
            `CPF: ${verificarValor(dados.cpfPermutante)}`,
            `Endereço Completo: ${verificarValor(dados.enderecoPermutante)}`,
            `Contato Telefônico: ${verificarValor(dados.contatoPermuntante)}`
        ]);
    }
    posY += 5;

    // 1.2. Segundo Permutante
    addClause("1.2. Segundo Permutante:", []);

    if (dados.pessoaSegPermutante === "juridico") {
        addClause("Pessoa Jurídica:", [
            `Razão Social: ${verificarValor(dados.razaoSocialSegundo)}`,
            `CNPJ: ${verificarValor(dados.cnpjSegundo)}`,
            `Endereço: ${verificarValor(dados.enderecoJuridicoSegundo)}`,
            `Nome do Representante Legal: ${verificarValor(dados.nomeRepresentanteSegundo)}`,
            `Cargo do Representante: ${verificarValor(dados.cargoRepresentanteSegundo)}`,
            `CPF do Representante: ${verificarValor(dados.cpfRepresentanteSegundo)}`,
            `Endereço do Representante: ${verificarValor(dados.enderecoRepresentanteSegundo)}`,
            `Telefone para contato: ${verificarValor(dados.telefoneRepresentanteSegundo)}`
        ]);
    } else {
        addClause("Pessoa Física:", [
            `Nome Completo: ${verificarValor(dados.nomePermutanteSegundo)}`,
            `Sexo: ${verificarValor(dados.sexoPermutanteSegundo)}`,
            `Estado Civil: ${verificarValor(dados.estadoCivilPermutanteSegundo)}`,
            `Nacionalidade: ${verificarValor(dados.nacionalidadePermutanteSegundo)}`,
            `Profissão: ${verificarValor(dados.profissaoPermutanteSegundo)}`,
            `Documento de Identificação: ${verificarValor(dados.documentoPermutanteSegundo)}`,
            `Número do Documento: ${verificarValor(dados.numeroPermutanteSegundo)}`,
            `CPF: ${verificarValor(dados.cpfPermutanteSegundo)}`,
            `Endereço Completo: ${verificarValor(dados.enderecoPermutanteSegundo)}`,
            `Contato Telefônico: ${verificarValor(dados.contatoPermuntanteSegundo)}`
        ]);
    }

    // 2. DO OBJETO
    addClause("2. DO OBJETO", []);

    // 2.1. Descrição dos Bens e Serviços Trocados
    addClause("2.1. Descrição dos Bens e Serviços Trocados", [
        "Bem/Serviço oferecido pelo 1º Permutante:",
        `Descrição detalhada: ${verificarValor(dados.descricao)}`,
        `Estado de conservação: ${verificarValor(dados.estadoConversa)}`,
        `Quantidade: ${verificarValor(dados.quantidade)}`,
        `Valor estimado: ${verificarValor(dados.valorEstimado)}`,
        `Documentação pertinente: ${verificarValor(dados.documentoPertinente)}`,
        `Possíveis encargos ou tributos envolvidos: ${verificarValor(dados.encargos)}`,
        `Condições de uso e manutenção: ${verificarValor(dados.manutencao)}`,
        "",
        "Bem/Serviço oferecido pelo 2º Permutante:",
        `Descrição detalhada: ${verificarValor(dados.descricaoSegundo)}`,
        `Estado de conservação: ${verificarValor(dados.estadoConversaSegundo)}`,
        `Quantidade: ${verificarValor(dados.quantidadeSegundo)}`,
        `Valor estimado: ${verificarValor(dados.valorEstimadoSegundo)}`,
        `Documentação pertinente: ${verificarValor(dados.documentoPertinenteSegundo)}`,
        `Possíveis encargos ou tributos envolvidos: ${verificarValor(dados.encargosSegundo)}`,
        `Condições de uso e manutenção: ${verificarValor(dados.manutencaoSegundo)}`
    ]);

    // 3. DA TORNA (Se Aplicável)
    addClause("3. DA TORNA (Se Aplicável)", [
        "Caso haja diferença de valores entre os bens ou serviços permutados, as partes acordam quanto ao pagamento da torna:",
        `Necessidade de pagamento de complemento? ${verificarValor(dados.complemento)}`,
        `Parte responsável pelo pagamento: ${verificarValor(dados.parteResponsavel)}`,
        `Valor do complemento (torna): ${verificarValor(dados.valorComplemento)}`,
        `Data e forma de pagamento: ${verificarValor(dados.dataPagamento)} - ${verificarValor(dados.formaPagamento)}`,
        `Encargos ou juros em caso de atraso: ${verificarValor(dados.encargosJuros)}`,
        `Penalidades por inadimplência: ${verificarValor(dados.penalidades)}`
    ]);

    // 4. DA ENTREGA E POSSE
    addClause("4. DA ENTREGA E POSSE", [
        `Data de troca dos bens ou execução dos serviços: ${verificarValor(dados.dataTroca)}`,
        `Local e condições de entrega: ${verificarValor(dados.localCondicoes)}`,
        `Eventuais custos de transporte e responsabilidade sobre os mesmos: ${verificarValor(dados.eventuaisResponsabilidade)}`,
        `Procedimentos para inspeção e aceitação dos bens ou serviços: ${verificarValor(dados.procedimentos)}`,
        `Transferência de titularidade e documentos necessários: ${verificarValor(dados.tranferTitularidade)}`
    ]);

    // 5. DAS RESPONSABILIDADES E OBRIGAÇÕES
    addClause("5. DAS RESPONSABILIDADES E OBRIGAÇÕES", [
        "Cada permutante assume as seguintes responsabilidades e obrigações:",
        "- Garantia da autenticidade e legalidade dos bens ou serviços trocados;",
        "- Compromisso de entrega dos bens ou execução dos serviços nas condições acordadas;",
        "- Qualidade e funcionamento adequado dos bens permutados;",
        "- Obrigação de arcar com eventuais encargos fiscais e tributários decorrentes da permuta;",
        "- Responsabilidade por vícios ocultos ou defeitos nos bens trocados;",
        "- Manutenção e conservação dos bens até a data da troca;",
        "- Assunção de eventuais débitos ou ônus vinculados aos bens antes da troca;"
    ]);

    // 6. PENALIDADES
    addClause("6. PENALIDADES", [
        `Multa em caso de descumprimento das cláusulas contratuais: ${verificarValor(dados.multaContratuais)}`,
        `Juros e correções aplicáveis em caso de inadimplência: ${verificarValor(dados.jurosCorrecao)}`,
        `Responsabilidade por danos decorrentes de não cumprimento do contrato: ${verificarValor(dados.responsabilidade)}`,
        `Direito da parte prejudicada de rescindir o contrato sem ônus adicionais: ${verificarValor(dados.direito)}`,
        `Indenização por eventuais prejuízos financeiros comprovados: ${verificarValor(dados.indenizacao)}`
    ]);

    // 7. RESCISÃO
    addClause("7. RESCISÃO", [
        "O presente contrato poderá ser rescindido nos seguintes casos:",
        "- Descumprimento de qualquer cláusula por uma das partes;",
        "- Caso fortuito ou força maior que impeça a execução da permuta;",
        "- Acordo mútuo entre as partes;",
        "- Comprovação de irregularidades nos bens ou serviços permutados.",
        "",
        `Multa aplicável em caso de desistência imotivada: ${verificarValor(dados.multaRescisao)}`,
        `Valor e condições de pagamento: ${verificarValor(dados.valorCondicao)}`
    ]);

    // 8. FORO
    addClause("8. FORO", [
        `Fica eleito o foro da Comarca de ${verificarValor(dados.cidade)}/${verificarValor(dados.estado)} para dirimir quaisquer controvérsias decorrentes deste contrato.`
    ]);

    // 9. DISPOSIÇÕES FINAIS
    addClause("9. DISPOSIÇÕES FINAIS", [
        "Este contrato é firmado em caráter irrevogável e irretratável, obrigando as partes e seus sucessores legais.",
        "Caso qualquer cláusula seja considerada inválida, tal invalidade não afetará as demais cláusulas do contrato.",
        "As partes declaram estar cientes e de acordo com todas as disposições deste contrato, tendo discutido e ajustado todas as cláusulas.",
        "Todas as comunicações entre as partes referentes a este contrato deverão ser feitas por escrito e enviadas para os endereços ou e-mails informados.",
        "As partes se comprometem a cumprir integralmente todas as obrigações previstas neste contrato, sob pena das penalidades aqui estipuladas.",
        "Todas as taxas, impostos e custos associados à transferência dos bens permutados serão de responsabilidade da parte que os originou, salvo acordo em contrário."
    ]);

    // 10. ASSINATURAS E TESTEMUNHAS
    addClause("10. ASSINATURAS E TESTEMUNHAS", [
        `Local e Data de Assinatura: ${verificarValor(dados.cidade)}, ${verificarValor(dados.estado)}, ${verificarValor(dados.dataAssinatura)}`,
        "",
        "1º Permutante:",
        "",
        "________________________________________",
        `Nome: ${dados.pessoaPermutante === "juridico" ? verificarValor(dados.razaoSocial) : verificarValor(dados.nomePermutante)}`,
        `CPF/CNPJ: ${dados.pessoaPermutante === "juridico" ? verificarValor(dados.cnpj) : verificarValor(dados.cpfPermutante)}`,
        "",
        "2º Permutante:",
        "",
        "________________________________________",
        `Nome: ${dados.pessoaSegPermutante === "juridico" ? verificarValor(dados.razaoSocialSegundo) : verificarValor(dados.nomePermutanteSegundo)}`,
        `CPF/CNPJ: ${dados.pessoaSegPermutante === "juridico" ? verificarValor(dados.cnpjSegundo) : verificarValor(dados.cpfPermutanteSegundo)}`
    ]);

    // Testemunhas (se necessário)
    if (dados.testemunhasNecessarias === 'S') {
        addClause("", [
            "",
            "TESTEMUNHAS:",
            "",
            "1ª Testemunha:",
            "",
            "________________________________________",
            `Nome: ${verificarValor(dados.nomeTest1)}`,
            `CPF: ${verificarValor(dados.cpfTest1)}`,
            `Endereço: ${verificarValor(dados.enderecoPermutante)}`, // Poderia adicionar campo específico para endereço das testemunhas se necessário
            "",
            "2ª Testemunha:",
            "",
            "________________________________________",
            `Nome: ${verificarValor(dados.nomeTest2)}`,
            `CPF: ${verificarValor(dados.cpfTest2)}`,
            `Endereço: ${verificarValor(dados.enderecoPermutanteSegundo)}` // Poderia adicionar campo específico para endereço das testemunhas se necessário
        ]);
    }

    // Registro em cartório (se necessário)
    if (dados.registroCartorioTest === 'S') {
        addClause("", [
            "",
            "REGISTRO EM CARTÓRIO:",
            "As partes concordam com o registro deste contrato em cartório competente.",
            "",
            "________________________________________",
            "Assinatura do Tabelião",
            `Data do Registro: ${verificarValor(dados.dataAssinatura)}`,
            `Livro: ______________ Folha: ______________ Nº: ______________`
        ]);
    }


    doc.save(`Contrato_PermutaTrocaSimples.pdf`);

};