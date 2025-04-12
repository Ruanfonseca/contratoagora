import jsPDF from "jspdf";

export default function gerarDoacaoTerrenoPdf(dados: any) {
    const doc = new jsPDF();

    // Configuração inicial de fonte ABNT e margens
    doc.setFont("Times");
    const marginLeft = 30;
    const marginRight = 20;
    const marginTop = 20;
    const marginBottom = 20;
    let posY = marginTop;

    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxTextWidth = pageWidth - marginLeft - marginRight;

    // Espaçamento entre linhas 1,5
    const lineHeight = 7.5;

    // Função auxiliar para verificar espaço restante na página
    const checkPageBreak = (additionalHeight: number) => {
        if (posY + additionalHeight >= pageHeight - marginBottom) {
            doc.addPage();
            posY = marginTop;
        }
    };

    // Função auxiliar para adicionar seções formatadas segundo ABNT
    const addSection = (title: string, content: string[]) => {
        const titleHeight = 10;

        // Título da seção
        checkPageBreak(titleHeight);
        doc.setFontSize(12);
        doc.setFont("Times", "bold");
        doc.text(title, pageWidth / 2, posY, { align: "center" });
        posY += titleHeight;

        // Texto do conteúdo
        doc.setFontSize(12);
        doc.setFont("Times", "normal");
        content.forEach((line: string) => {
            const splitLines = doc.splitTextToSize(line, maxTextWidth);
            splitLines.forEach((splitLine: string) => {
                checkPageBreak(lineHeight);
                doc.text(splitLine, marginLeft, posY);
                posY += lineHeight;
            });
        });
    };

    // Função para verificar e formatar valores
    const verificarValor = (valor: any, prefixo = "", sufixo = "") => {
        return valor ? `${prefixo}${valor}${sufixo}` : "____________________________________________";
    };

    // Cabeçalho da primeira página
    doc.setFontSize(14);
    doc.setFont("Times", "bold");
    doc.text("CONTRATO DE DOAÇÃO DE TERRENO", pageWidth / 2, posY, { align: "center" });
    posY += 5;
    doc.setFontSize(10);
    doc.text("(Conforme o Código Civil - Lei Federal nº 10.406/2002)", pageWidth / 2, posY, { align: "center" });
    posY += 15;

    doc.setFontSize(12);
    doc.setFont("Times", "normal");
    const introText = "Pelo presente instrumento particular de doação, de um lado, como DOADOR(A), e de outro, como DONATÁRIO(A), têm entre si justo e contratado o que segue, em conformidade com os artigos 538 a 564 do Código Civil Brasileiro, mediante as cláusulas e condições abaixo expostas:";
    const introLines = doc.splitTextToSize(introText, maxTextWidth);
    introLines.forEach((line: string) => {
        checkPageBreak(lineHeight);
        doc.text(line, marginLeft, posY);
        posY += lineHeight;
    });
    posY += lineHeight;

    // CLÁUSULA PRIMEIRA – DAS PARTES
    const partesContent = [
        "DOADOR(A):",
        `Nome: ${verificarValor(dados.doador === 'fisica' ? dados.nomeDoador : dados.nomeRepresentante)}`,
        `Sexo: ${verificarValor(dados.doador === 'fisica' ? (dados.sexo === 'M' ? 'Masculino' : 'Feminino') : '')}`,
        `Nacionalidade: ${verificarValor(dados.doador === 'fisica' ? dados.nacionalidade : '')}`,
        `Estado Civil: ${verificarValor(dados.doador === 'fisica' ? dados.estadoCivil : '')}`,
        `Profissão: ${verificarValor(dados.doador === 'fisica' ? dados.profissao : dados.cargoRepresentante)}`,
        `RG: ${verificarValor(dados.doador === 'fisica' ? dados.Rg : '')}`,
        `Órgão Emissor: ${verificarValor(dados.doador === 'fisica' ? dados.orgaoEmissor : '')}`,
        `UF: ${verificarValor(dados.doador === 'fisica' ? dados.uf : '')}`,
        `CPF: ${verificarValor(dados.doador === 'fisica' ? dados.cpf : dados.cpfRepresentante)}`,
        `Endereço Completo: ${verificarValor(dados.doador === 'fisica' ? dados.endereco : dados.enderecoRepresentante)}`,
        "",
        dados.doador === 'juridico' ? "Caso pessoa jurídica:" : "",
        dados.doador === 'juridico' ? `CNPJ: ${verificarValor(dados.cnpj)}` : "",
        dados.doador === 'juridico' ? `Razão Social: ${verificarValor(dados.razaoSocial)}` : "",
        dados.doador === 'juridico' ? `Sede: ${verificarValor(dados.enderecoSede)}` : "",
        dados.doador === 'juridico' ? `Nome do Representante Legal: ${verificarValor(dados.nomeRepresentante)}` : "",
        dados.doador === 'juridico' ? `Cargo: ${verificarValor(dados.cargoRepresentante)}` : "",
        dados.doador === 'juridico' ? `CPF do Representante: ${verificarValor(dados.cpfRepresentante)}` : "",
        dados.doador === 'juridico' ? `Endereço do Representante: ${verificarValor(dados.enderecoRepresentante)}` : "",
        "",
        "DONATÁRIO(A):",
        `Nome: ${verificarValor(dados.donatario === 'fisica' ? dados.nomeDona : dados.nomeRepresentanteDona)}`,
        `Sexo: ${verificarValor(dados.donatario === 'fisica' ? (dados.sexoDona === 'M' ? 'Masculino' : 'Feminino') : '')}`,
        `Nacionalidade: ${verificarValor(dados.donatario === 'fisica' ? dados.nacionalidadeDona : '')}`,
        `Estado Civil: ${verificarValor(dados.donatario === 'fisica' ? dados.estadoCivilDona : '')}`,
        `Profissão: ${verificarValor(dados.donatario === 'fisica' ? dados.profissaoDona : dados.cargoRepresentanteDona)}`,
        `RG: ${verificarValor(dados.donatario === 'fisica' ? dados.RgDona : '')}`,
        `Órgão Emissor: ${verificarValor(dados.donatario === 'fisica' ? dados.orgaoEmissorDona : '')}`,
        `UF: ${verificarValor(dados.donatario === 'fisica' ? dados.ufDona : '')}`,
        `CPF: ${verificarValor(dados.donatario === 'fisica' ? dados.cpfDona : dados.cpfRepresentanteDona)}`,
        `Endereço Completo: ${verificarValor(dados.donatario === 'fisica' ? dados.enderecoDona : dados.enderecoRepresentanteDona)}`,
        "",
        dados.donatario === 'juridico' ? "Caso pessoa jurídica:" : "",
        dados.donatario === 'juridico' ? `Razão Social: ${verificarValor(dados.razaoSocialDona)}` : "",
        dados.donatario === 'juridico' ? `CNPJ: ${verificarValor(dados.cnpjDona)}` : "",
        dados.donatario === 'juridico' ? `Sede: ${verificarValor(dados.enderecoSedeDona)}` : "",
        dados.donatario === 'juridico' ? `Nome do Representante Legal: ${verificarValor(dados.nomeRepresentanteDona)}` : "",
        dados.donatario === 'juridico' ? `Cargo: ${verificarValor(dados.cargoRepresentanteDona)}` : "",
        dados.donatario === 'juridico' ? `CPF do Representante: ${verificarValor(dados.cpfRepresentanteDona)}` : "",
        dados.donatario === 'juridico' ? `Endereço do Representante: ${verificarValor(dados.enderecoRepresentanteDona)}` : ""
    ].filter(line => line !== "");

    addSection("CLÁUSULA PRIMEIRA – DAS PARTES", partesContent);

    // CLÁUSULA SEGUNDA – DO OBJETO
    const objetoContent = [
        "O presente contrato tem como objeto a doação do seguinte bem imóvel:",
        "",
        "Descrição Detalhada do Terreno:",
        verificarValor(dados.descricaoDetelhada),
        "",
        "Endereço Completo do Terreno:",
        verificarValor(dados.enderecoDetalhadoTerreno),
        "",
        `Número da Matrícula do Imóvel: ${verificarValor(dados.numeroMatricula)}`,
        `Cartório de Registro de Imóveis: ${verificarValor(dados.cartorioRegistro)}`,
        `Valor Estimado do Terreno: R$ ${verificarValor(dados.valorEstimado)}`,
        "",
        "Situação da Doação:",
        `( ${dados.situacao === 'realizada' ? 'X' : ' '} ) Já realizada`,
        `( ${dados.situacao === 'asrealizada' ? 'X' : ' '} ) A ser realizada`
    ];

    addSection("CLÁUSULA SEGUNDA – DO OBJETO", objetoContent);

    // CLÁUSULA TERCEIRA – DA DECLARAÇÃO DE DOAÇÃO
    const declaracaoContent = [
        "O(A) DOADOR(A) declara, de livre e espontânea vontade, que doa o imóvel acima descrito ao(à) DONATÁRIO(A), sem qualquer tipo de remuneração, contraprestação ou encargo, salvo o disposto na cláusula seguinte, se houver."
    ];

    addSection("CLÁUSULA TERCEIRA – DA DECLARAÇÃO DE DOAÇÃO", declaracaoContent);

    // CLÁUSULA QUARTA – DA ACEITAÇÃO
    const aceitacaoContent = [
        "O(A) DONATÁRIO(A) declara, de maneira expressa, que aceita a presente doação nos termos ora pactuados, comprometendo-se a cumprir todas as disposições legais e contratuais relativas à posse e propriedade do terreno."
    ];

    addSection("CLÁUSULA QUARTA – DA ACEITAÇÃO", aceitacaoContent);

    // CLÁUSULA QUINTA – DA TRANSFERÊNCIA DE PROPRIEDADE
    const transferenciaContent = [
        "A transferência da propriedade do terreno objeto deste contrato dar-se-á na data de efetivação da doação, mediante a lavratura da escritura pública e posterior registro no Cartório de Registro de Imóveis competente."
    ];

    addSection("CLÁUSULA QUINTA – DA TRANSFERÊNCIA DE PROPRIEDADE", transferenciaContent);

    // CLÁUSULA SEXTA – DOS ENCARGOS E CONDIÇÕES (SE HOUVER)
    const encargosContent = [
        `( ${dados.encargos === 'puraSimples' ? 'X' : ' '} ) A doação é feita de forma pura e simples, sem encargos.`,
        `( ${dados.encargos === 'seguinteEncargo' ? 'X' : ' '} ) A doação está condicionada aos seguintes encargos ou obrigações por parte do(a) DONATÁRIO(A):`,
        dados.encargos === 'seguinteEncargo' ? verificarValor(dados.obrigacoesDonatario) : ""
    ];

    addSection("CLÁUSULA SEXTA – DOS ENCARGOS E CONDIÇÕES (SE HOUVER)", encargosContent);

    // CLÁUSULA SÉTIMA – DAS DESPESAS E CUSTOS
    const despesasContent = [
        "As partes convencionam que as despesas oriundas da lavratura da escritura, registro do imóvel, pagamento de tributos e demais encargos legais decorrentes da doação serão de responsabilidade:",
        `( ${dados.despesas === 'despesaDoador' ? 'X' : ' '} ) do DOADOR(A)`,
        `( ${dados.despesas === 'despesaDonatario' ? 'X' : ' '} ) do DONATÁRIO(A)`,
        `( ${dados.despesas === 'despesaDoadorAmbos' ? 'X' : ' '} ) divididas igualmente entre DOADOR(A) e DONATÁRIO(A)`
    ];

    addSection("CLÁUSULA SÉTIMA – DAS DESPESAS E CUSTOS", despesasContent);

    // CLÁUSULA OITAVA – DA EFETIVAÇÃO DA DOAÇÃO
    const efetivacaoContent = [
        `A doação será efetivada na seguinte data: ${verificarValor(dados.dataEfetivacao, "//")}.`,
        "A transferência da propriedade será considerada válida a partir da lavratura e registro da escritura de doação."
    ];

    addSection("CLÁUSULA OITAVA – DA EFETIVAÇÃO DA DOAÇÃO", efetivacaoContent);

    // CLÁUSULA NONA – DA RESCISÃO
    const rescisaoContent = [
        "O descumprimento de quaisquer obrigações assumidas neste contrato poderá ensejar a sua rescisão, sem prejuízo de eventuais perdas e danos e demais sanções cabíveis previstas na legislação vigente."
    ];

    addSection("CLÁUSULA NONA – DA RESCISÃO", rescisaoContent);

    // CLÁUSULA DÉCIMA – DO FORO
    const foroContent = [
        `Para dirimir quaisquer dúvidas ou litígios oriundos deste contrato, as partes elegem o foro da Comarca de ${verificarValor(dados.ciadadeComarca)}, Estado de ${verificarValor(dados.estado)}, com exclusão de qualquer outro, por mais privilegiado que seja.`
    ];

    addSection("CLÁUSULA DÉCIMA – DO FORO", foroContent);

    // ASSINATURAS
    const assinaturasContent = [
        "E, por estarem assim justas e contratadas, firmam o presente instrumento em duas vias de igual teor e forma, juntamente com as testemunhas abaixo identificadas.",
        "",
        `Local: ${verificarValor(dados.localAssinatura)}`,
        `Data: ${verificarValor(dados.dataAssinatura, "//")}`,
        "",
        "",
        "ASSINATURAS",
        "",
        "DOADOR(A):",
        "",
        "",
        "Assinatura",
        `Nome completo: ${verificarValor(dados.doador === 'fisica' ? dados.nomeDoador : dados.razaoSocial)}`,
        `CPF/CNPJ: ${verificarValor(dados.doador === 'fisica' ? dados.cpf : dados.cnpj)}`,
        "",
        "",
        "DONATÁRIO(A):",
        "",
        "",
        "Assinatura",
        `Nome completo: ${verificarValor(dados.donatario === 'fisica' ? dados.nomeDona : dados.razaoSocialDona)}`,
        `CPF/CNPJ: ${verificarValor(dados.donatario === 'fisica' ? dados.cpfDona : dados.cnpjDona)}`,
        "",
        "",
        "TESTEMUNHAS:",
        "",
        "1ª TESTEMUNHA:",
        "",
        "",
        "Assinatura",
        "Nome completo: ____________________________________________",
        "CPF: ___________________________________",
        "",
        "",
        "2ª TESTEMUNHA:",
        "",
        "",
        "Assinatura",
        "Nome completo: ____________________________________________",
        "CPF: ___________________________________"
    ];

    doc.save("contrato_doacao_terreno.pdf");

};