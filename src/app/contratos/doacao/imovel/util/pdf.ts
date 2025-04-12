import jsPDF from "jspdf";

export default function geradorDoacaoImovelPago(dados: any) {
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

    // Função para verificar valor e retornar string ou vazio
    const verificarValor = (valor: any) => {
        return valor ? valor.toString() : "";
    };

    // Cabeçalho da primeira página
    doc.setFontSize(14);
    doc.setFont("Times", "bold");
    doc.text("CONTRATO DE DOAÇÃO", pageWidth / 2, posY, { align: "center" });
    posY += 15;

    doc.setFontSize(12);
    doc.setFont("Times", "normal");
    const introText = "Pelo presente instrumento particular de doação, de um lado, como DOADOR(A), e de outro, como DONATÁRIO(A), têm entre si, justa e contratada, a doação do bem descrito neste contrato, mediante as cláusulas e condições seguintes, que mutuamente outorgam e aceitam, na forma da Lei nº 10.406/2002 (Código Civil Brasileiro). ";
    const introLines = doc.splitTextToSize(introText, maxTextWidth);
    introLines.forEach((line: string) => {
        checkPageBreak(lineHeight);
        doc.text(line, marginLeft, posY);
        posY += lineHeight;
    });

    // CLÁUSULA PRIMEIRA - DAS PARTES
    addSection("CLÁUSULA PRIMEIRA - DAS PARTES", [
        "1.1. DOADOR(A):",
        `Natureza Jurídica: ${dados.doador === 'fisica' ? '(X) Pessoa Física' : '( ) Pessoa Física'} ${dados.doador === 'juridico' ? '(X) Pessoa Jurídica' : '( ) Pessoa Jurídica'}`,
        ...(dados.doador === 'fisica' ? [
            `Nome: ${verificarValor(dados.nomeDoador)}`,
            `Sexo: ${verificarValor(dados.sexo)}`,
            `Estado Civil: ${verificarValor(dados.estadoCivil)}`,
            `Nacionalidade: ${verificarValor(dados.nacionalidade)}`,
            `Profissão: ${verificarValor(dados.profissao)}`,
            `RG: ${verificarValor(dados.Rg)}`,
            `Órgão Emissor: ${verificarValor(dados.orgaoEmissor)}`,
            `UF: ${verificarValor(dados.uf)}`,
            `CPF: ${verificarValor(dados.cpf)}`,
            `Endereço Completo (com CEP): ${verificarValor(dados.endereco)}`
        ] : [
            `Razão Social: ${verificarValor(dados.razaoSocial)}`,
            `CNPJ: ${verificarValor(dados.cnpj)}`,
            `Sede: ${verificarValor(dados.enderecoSede)}`,
            "",
            `Nome do Representante Legal: ${verificarValor(dados.nomeRepresentante)}`,
            `Cargo: ${verificarValor(dados.cargoRepresentante)}`,
            `CPF: ${verificarValor(dados.cpfRepresentante)}`,
            `Endereço do Representante: ${verificarValor(dados.enderecoRepresentante)}`
        ]),
        "",
        "1.2. DONATÁRIO(A):",
        `Natureza Jurídica: ${dados.donatario === 'fisica' ? '(X) Pessoa Física' : '( ) Pessoa Física'} ${dados.donatario === 'juridico' ? '(X) Pessoa Jurídica' : '( ) Pessoa Jurídica'}`,
        ...(dados.donatario === 'fisica' ? [
            `Nome: ${verificarValor(dados.nomeDona)}`,
            `Sexo: ${verificarValor(dados.sexoDona)}`,
            `Estado Civil: ${verificarValor(dados.estadoCivilDona)}`,
            `Nacionalidade: ${verificarValor(dados.nacionalidadeDona)}`,
            `Profissão: ${verificarValor(dados.profissaoDona)}`,
            `RG: ${verificarValor(dados.RgDona)}`,
            `Órgão Emissor: ${verificarValor(dados.orgaoEmissorDona)}`,
            `UF: ${verificarValor(dados.ufDona)}`,
            `CPF: ${verificarValor(dados.cpfDona)}`,
            `Endereço Completo (com CEP): ${verificarValor(dados.enderecoDona)}`
        ] : [
            `Razão Social: ${verificarValor(dados.razaoSocialDona)}`,
            `CNPJ: ${verificarValor(dados.cnpjDona)}`,
            `Sede: ${verificarValor(dados.enderecoSedeDona)}`,
            "",
            `Nome do Representante Legal: ${verificarValor(dados.nomeRepresentanteDona)}`,
            `Cargo: ${verificarValor(dados.cargoRepresentanteDona)}`,
            `CPF: ${verificarValor(dados.cpfRepresentanteDona)}`,
            `Endereço do Representante: ${verificarValor(dados.enderecoRepresentanteDona)}`
        ])
    ]);

    // CLÁUSULA SEGUNDA - DO OBJETO DA DOAÇÃO
    addSection("CLÁUSULA SEGUNDA - DO OBJETO DA DOAÇÃO", [
        "O presente contrato tem como objeto a doação do seguinte bem imóvel:",
        `Endereço Completo do Imóvel: ${verificarValor(dados.enderecoImovel)}`,
        `Descrição Detalhada: ${verificarValor(dados.descDetalhe)}`,
        `Matrícula: nº ${verificarValor(dados.matricula)}`,
        `Cartório de Registro de Imóveis: ${verificarValor(dados.cartorioRegistro)}`,
        `Valor Aproximado do Imóvel: R$ ${verificarValor(dados.valorAproximado)}`,
        `Situação da Doação: ${dados.situacao === 'realizada' ? '(X) A doação já foi realizada.' : '( ) A doação já foi realizada.'} ${dados.situacao === 'datarealizacao' ? '(X) A doação será realizada na data indicada na cláusula terceira.' : '( ) A doação será realizada na data indicada na cláusula terceira.'}`
    ]);

    // CLÁUSULA TERCEIRA - DA EFETIVAÇÃO E TRANSFERÊNCIA DA PROPRIEDADE
    addSection("CLÁUSULA TERCEIRA - DA EFETIVAÇÃO E TRANSFERÊNCIA DA PROPRIEDADE", [
        `A doação será efetivada na data de: ${verificarValor(dados.dataEfetivacao)}, mediante lavratura de escritura pública de doação e posterior registro junto ao Cartório de Registro de Imóveis competente, momento no qual se operará a transferência da propriedade do imóvel para o(a) DONATÁRIO(A).`
    ]);

    // CLÁUSULA QUARTA - DECLARAÇÃO DE DOAÇÃO
    addSection("CLÁUSULA QUARTA - DECLARAÇÃO DE DOAÇÃO", [
        "O(A) DOADOR(A) declara que realiza a presente doação de forma livre, espontânea e sem qualquer expectativa de contraprestação, de modo gratuito, transferindo a propriedade plena do imóvel ao(à) DONATÁRIO(A), ressalvadas eventuais cláusulas de usufruto, encargos ou restrições previstas neste instrumento."
    ]);

    // CLÁUSULA QUINTA - ACEITAÇÃO DA DOAÇÃO
    addSection("CLÁUSULA QUINTA - ACEITAÇÃO DA DOAÇÃO", [
        "O(A) DONATÁRIO(A), por sua vez, declara que aceita expressamente a presente doação, comprometendo-se a respeitar todas as disposições legais e contratuais aqui estabelecidas, bem como as obrigações inerentes ao imóvel recebido."
    ]);

    // CLÁUSULA SEXTA - USUFRUTO (SE APLICÁVEL)
    addSection("CLÁUSULA SEXTA - USUFRUTO (SE APLICÁVEL)", [
        `${dados.usufruto === 'semReserva' ? '(X) O imóvel será doado sem reserva de usufruto.' : '( ) O imóvel será doado sem reserva de usufruto.'}`,
        `${dados.usufruto === 'comReserva' ? `(X) O imóvel será doado com reserva de usufruto em favor do(a) DOADOR(A), que permanecerá usufruindo do bem até ${verificarValor(dados.usufrutoPazo)}.` : '( ) O imóvel será doado com reserva de usufruto em favor do(a) DOADOR(A), que permanecerá usufruindo do bem até [prazo ou condição de extinção do usufruto].'}`
    ]);

    // CLÁUSULA SÉTIMA - ENCARGOS E CONDIÇÕES
    addSection("CLÁUSULA SÉTIMA - ENCARGOS E CONDIÇÕES", [
        `${dados.sujeito === 'encargos' ? '(X) A doação não está sujeita a encargos ou condições.' : '( ) A doação não está sujeita a encargos ou condições.'}`,
        `${dados.sujeito === 'encargoEspec' ? `(X) A doação está condicionada ao seguinte encargo ou obrigação por parte do(a) DONATÁRIO(A): ${verificarValor(dados.sujeitoEncargos)}` : '( ) A doação está condicionada ao seguinte encargo ou obrigação por parte do(a) DONATÁRIO(A): [Descrever encargos: preservação do imóvel, utilização específica, manutenção, etc.]'}`
    ]);

    // CLÁUSULA OITAVA - DAS RESPONSABILIDADES E CUSTOS
    addSection("CLÁUSULA OITAVA - DAS RESPONSABILIDADES E CUSTOS", [
        "As partes ajustam que:",
        "",
        "As despesas com escritura pública, registros cartorários, impostos (como ITCMD) e demais taxas e encargos referentes à doação e transferência de propriedade serão de responsabilidade de:",
        `${dados.despesas === 'doador' ? '(X) DOADOR(A)' : '( ) DOADOR(A)'} ${dados.despesas === 'donatario' ? '(X) DONATÁRIO(A)' : '( ) DONATÁRIO(A)'} ${dados.despesas === 'ambos' ? '(X) Ambos, em partes iguais.' : '( ) Ambos, em partes iguais.'}`,
        "",
        "A responsabilidade por tributos futuros, manutenção, conservação e uso do imóvel passará ao(à) DONATÁRIO(A) a partir da data de efetivação da doação."
    ]);

    // CLÁUSULA NONA - DA IRREVOGABILIDADE E IRRETRATABILIDADE
    addSection("CLÁUSULA NONA - DA IRREVOGABILIDADE E IRRETRATABILIDADE", [
        "A doação ora formalizada é feita em caráter irrevogável e irretratável, salvo nas hipóteses expressamente previstas em lei, como nos casos de ingratidão do(a) DONATÁRIO(A), conforme previsto nos artigos 555 a 559 do Código Civil."
    ]);

    // CLÁUSULA DÉCIMA - DO FORO
    addSection("CLÁUSULA DÉCIMA - DO FORO", [
        `Para dirimir quaisquer dúvidas oriundas deste contrato, as partes elegem o foro da comarca de ${verificarValor(dados.cidade)} - ${verificarValor(dados.estado)}, com renúncia expressa a qualquer outro, por mais privilegiado que seja.`
    ]);

    // CLÁUSULA DÉCIMA PRIMEIRA - DAS DISPOSIÇÕES GERAIS
    addSection("CLÁUSULA DÉCIMA PRIMEIRA - DAS DISPOSIÇÕES GERAIS", [
        "Este contrato obriga as partes, seus herdeiros e sucessores;",
        "A assinatura deste instrumento poderá se dar fisicamente ou por meio eletrônico, nos termos da legislação vigente;",
        "O presente contrato será complementado pela lavratura da escritura pública de doação, conforme exigência legal."
    ]);

    // ASSINATURAS
    addSection("ASSINATURAS", [
        `E, por estarem assim justas e contratadas, firmam o presente contrato em 2 (duas) vias de igual teor, juntamente com as testemunhas abaixo identificadas.`,
        "",
        `Local: ${verificarValor(dados.cidade)}/${verificarValor(dados.estado)}  Data: ${verificarValor(dados.dataAssinatura)}`,
        "",
        "DOADOR(A):",
        `Nome/Razão Social: ${dados.doador === 'fisica' ? verificarValor(dados.nomeDoador) : verificarValor(dados.razaoSocial)}`,
        "Assinatura: ___________________________________",
        "",
        "",
        "DONATÁRIO(A):",
        `Nome/Razão Social: ${dados.donatario === 'fisica' ? verificarValor(dados.nomeDona) : verificarValor(dados.razaoSocialDona)}`,
        "Assinatura: ___________________________________",
        "",
        "",
        "1ª TESTEMUNHA:",
        "Nome Completo: ",
        "CPF: ",
        "Assinatura: ___________________________________",
        "",
        "",
        "2ª TESTEMUNHA:",
        "Nome Completo: ",
        "CPF: ",
        "Assinatura: ___________________________________"
    ]);

    doc.save("contrato_doacao_imovel.pdf");

};