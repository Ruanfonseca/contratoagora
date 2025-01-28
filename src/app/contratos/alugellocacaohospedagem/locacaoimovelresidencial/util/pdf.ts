import jsPDF from "jspdf";

export default function geradorImovelResidencialPDF(dados: any) {
    const doc = new jsPDF();

    // Configuração inicial de fonte e margens
    const marginX = 10;
    let posY = 20;

    const maxPageHeight = 280;
    const maxTextWidth = 190;

    const checkPageBreak = (additionalHeight: number) => {
        if (posY + additionalHeight >= maxPageHeight) {
            doc.addPage();
            posY = 20;
        }
    };

    const addSection = (title: string, content: string[]) => {
        const titleHeight = 15;
        const lineHeight = 10;

        checkPageBreak(titleHeight);
        doc.setFontSize(12);
        doc.text(title, 105, posY, { align: "center" });
        posY += titleHeight;

        doc.setFontSize(10);
        content.forEach((line: string) => {
            const splitLines = doc.splitTextToSize(line, maxTextWidth);
            splitLines.forEach((splitLine: string) => {
                checkPageBreak(lineHeight);
                doc.text(splitLine, marginX, posY);
                posY += lineHeight;
            });
        });
    };


    // Página 1 - Cabeçalho
    doc.setFontSize(14);
    doc.text("CONTRATO DE LOCAÇÃO DE IMÓVEL RESIDENCIAL", 105, posY, { align: "center" });
    posY += 15;

    // Seções do contrato
    addSection("CLÁUSULA 1 - IDENTIFICAÇÃO DAS PARTES", [
        "(Artigos 104, 421 e 425 do Código Civil Brasileiro)",
        "Nesta seção, é feita a descrição detalhada do imóvel objeto do contrato, incluindo seu endereço completo, características e condições.\n Também são especificadas a destinação (residencial ou comercial) e o estado de conservação, conforme o que foi verificado pelas partes.",
        "Locador:",
        `Nome ou Razão Social: ${dados.locador === "pf" ? dados.nomeLocador : dados.razaoSocial}`,
        `CPF ou CNPJ: ${dados.locador === "pf" ? dados.CPFLocador : dados.cnpjlocador}`,
        `Endereço: ${dados.locador === "pf" ? dados.enderecoLocador : dados.enderecoCNPJ}`,
        `Telefone: ${dados.locador === "pf" ? dados.telefoneLocador : dados.telefoneCNPJ}`,
        `E-mail: ${dados.locador === "pf" ? dados.emailLocador : dados.emailCNPJ}`,
        dados.locador === "pj" ? `Representante Legal: ${dados.nomeRepresentanteCNPJ}, CPF: ${dados.CPFRepresentanteCNPJ}` : "",
        "",
        "Locatário:",
        `Nome ou Razão Social: ${dados.locatario === "pf" ? dados.nomelocatario : dados.razaoSociallocatario}`,
        `CPF ou CNPJ: ${dados.locatario === "pf" ? dados.CPFlocatario : dados.cpflocatario}`,
        `Endereço: ${dados.locatario === "pf" ? dados.enderecolocatario : dados.enderecolocatarioCNPJ}`,
        `Telefone: ${dados.locatario === "pf" ? dados.telefonelocatario : dados.telefonelocatarioCNPJ}`,
        `E-mail: ${dados.locatario === "pf" ? dados.emaillocatario : dados.emaillocatarioCNPJ}`,
        dados.locatario === "pj" ? `Representante Legal: ${dados.nomeRepresentantelocatarioCNPJ}, CPF: ${dados.CPFRepresentantelocatarioCNPJ}` : "",
    ]);

    addSection("CLÁUSULA 2 - DESCRIÇÃO DO IMÓVEL", [
        "(Artigo 482 do Código Civil Brasileiro)",
        "O imóvel objeto deste contrato está descrito de forma clara e completa, conforme segue:",
        `Endereço completo: ${dados.enderecoImovel}`,
        `Tipo de imóvel: ${dados.tipoImóvel}`,
        `Área total: ${dados.areaTotal} m²`,
        `Número de cômodos: ${dados.numeroComodos}`,
        `Vaga de garagem: ${dados.vagaGaragem === "S" ? "Sim" : "Não"}`,
        `Mobília inclusa: ${dados.mobilia === "S" ? "Sim" : "Não"}`,
    ]);

    addSection("CLÁUSULA 3 - DESTINAÇÃO DO IMÓVEL", [
        "(Artigo 565 do Código Civil Brasileiro)",
        "O locatário se compromete a utilizar o imóvel exclusivamente para a finalidade contratada:",
        `Uso residencial: ${dados.finsResidenciais === 'S' ? 'Sim' : 'Não'}`,
        dados.finsResidenciais === 'N' ? `Finalidade específica: ${dados.qualFim}` : "",
    ]);

    addSection("CLÁUSULA 4 - PRAZO DA LOCAÇÃO", ["(Artigo 573 do Código Civil Brasileiro)",
        "O prazo da locação foi acordado entre as partes, respeitando o direito de rescisão previsto em lei:",
        `Data de início: ${dados.dataInicioLocacao}`,
        `Duração do contrato: ${dados.duracaoContrato} meses`,
        `Possibilidade de renovação: ${dados.possibilidadeRenovacao === 'S' ? 'Sim' : 'Não'}`,
        dados.possibilidadeRenovacao === 'S' ? `Condições: ${dados.quaisCondicoes}` : "",
    ]);

    addSection("CLÁUSULA 5 - VALOR DO ALUGUEL E FORMA DE PAGAMENTO", [
        "(Artigos 565 e 566 do Código Civil Brasileiro)",
        "O valor do aluguel e sua forma de pagamento foram definidos de forma justa e transparente:",
        `Valor mensal: R$ ${dados.valorMensal}`,
        `Data de vencimento: ${dados.dataVencMensal}`,
        `Forma de pagamento: ${dados.formaPagamento}`,
        `Multa por atraso: R$ ${dados.multaAtraso}`,
        `Juros aplicáveis: ${dados.jurosAplicaveis}%`,
    ]);

    addSection("CLÁUSULA 6 - REAJUSTE DO ALUGUEL", [
        "(Artigo 18 da Lei do Inquilinato - Lei 8.245/91)",
        "O reajuste do aluguel será realizado conforme índice e periodicidade acordados:",
        `Reajuste previsto: ${dados.teraReajuste === "S" ? "Sim" : "Não"}`,
        dados.teraReajuste === "S" ? `Periodicidade: ${dados.periodoReajuste}` : "",
        dados.teraReajuste === "S" ? `Índice: ${dados.indiceReajuste}` : "",
    ]);

    addSection("CLÁUSULA 7 - GARANTIAS LOCATÍCIAS", [
        "(Artigos 37 e 38 da Lei do Inquilinato - Lei 8.245/91)",
        "As garantias locatícias oferecidas neste contrato são as seguintes:",
        `Garantia exigida: ${dados.qualgarantidor}`,
        dados.qualgarantidor === "fi" ? `Fiador: ${dados.nomeFiador}, CPF: ${dados.cpfFiador}` : "",
        dados.qualgarantidor === "caudep" ? `Caução em dinheiro: R$ ${dados.valorTitCaucao}` : "",
        dados.qualgarantidor === "caubem" ? `Bem caucionado: ${dados.descBemCaucao}` : "",
        dados.qualgarantidor === "ti" ? `Título de crédito: ${dados.descCredUtili}` : "",
        dados.qualgarantidor === "segfianca" ? `Seguro-fiança: ${dados.segFianca}` : "",
    ]);

    addSection("CLÁUSULA 8 - OBRIGAÇÕES DO LOCADOR", [
        "(Artigos 22 e 23 da Lei do Inquilinato - Lei 8.245/91 e Artigo 565 do Código Civil Brasileiro)",
        `Manutenções e reparos estruturais: ${dados.locadorManuRep}`,
        `Serviços adicionais fornecidos: ${dados.locadorServAdicional}`,
    ]);

    addSection("CLÁUSULA 9 - OBRIGAÇÕES DO LOCATÁRIO", [
        "(Artigos 23 e 26 da Lei do Inquilinato - Lei 8.245/91 e Artigo 566 do Código Civil Brasileiro)",
        `Permitido realizar reformas: ${dados.locatarioReforma === "S" ? "Sim" : "Não"}`,
        dados.locatarioReforma === "S" ? `Condições: ${dados.quaiCondicoes}` : "",
        `Manutenções obrigatórias: ${dados.locatarioManu}`,
        `Restrições de uso: ${dados.restricoesUso}`,
    ]);

    addSection("CLÁUSULA 10 - DESPESAS E TRIBUTOS", [
        "(Artigos 22 e 23 da Lei do Inquilinato - Lei 8.245/91 e Artigos 567 e 568 do Código Civil Brasileiro)",
        `Despesas do locatário: ${dados.despesasLocatario}`,
        `Despesas do locador: ${dados.despesasLocador}`,
    ]);

    addSection("CLÁUSULA 11 - RESCISÃO DO CONTRATO", [
        "(Artigos 4, 9 e 46 da Lei do Inquilinato - Lei 8.245/91 e Artigos 571 e 574 do Código Civil Brasileiro)",
        `Condições para rescisão: ${dados.condicoes}`,
        `Multas e penalidades: ${dados.multasEpenalidades}`,
        `Prazo para notificação: ${dados.prazo} dias`,
    ]);

    addSection("CLÁUSULA 12 - DISPOSIÇÕES GERAIS", [
        "(Artigos 421 e 425 do Código Civil Brasileiro)",
        `Foro eleito: ${dados.foroeleito}`,
        `Testemunhas presentes: ${dados.testemunhas === "S" ? "Sim" : "Não"}`,
        dados.testemunhas === "S" ? `Testemunha 1: ${dados.nomeTest1}, CPF: ${dados.cpfTest1}` : "",
        dados.testemunhas === "S" ? `Testemunha 2: ${dados.nomeTest2}, CPF: ${dados.cpfTest2}` : "",
        `Registro em cartório: ${dados.registroCartorio === "S" ? "Sim" : "Não"}`,
    ]);

    // Assinaturas
    addSection("ASSINATURAS", [
        "Local e Data: ______________________________________________",
        "",
        "Locador: _________________________________________________",
        "",
        "Locatário: _______________________________________________",
    ]);


    // Exportar o PDF
    doc.save("Contrato_Locacao_Imovel_Residencial.pdf");
}
