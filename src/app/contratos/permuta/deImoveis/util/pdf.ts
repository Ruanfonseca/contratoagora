import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function geradorPermutaImoveisPago(dados: any) {
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

    // Cabeçalho da primeira página
    doc.setFontSize(14);
    doc.setFont("Times", "bold");
    doc.text("CONTRATO PARTICULAR DE PERMUTA DE IMÓVEIS", pageWidth / 2, posY, { align: "center" });
    posY += 15;

    doc.setFontSize(12);
    doc.setFont("Times", "normal");
    const introText = "Pelo presente instrumento particular de permuta de imóveis, de um lado:";
    const introLines = doc.splitTextToSize(introText, maxTextWidth);
    introLines.forEach((line: string | string[]) => {
        checkPageBreak(lineHeight);
        doc.text(line, marginLeft, posY);
        posY += lineHeight;
    });


    // Seção 1 - Identificação das Partes
    addSection("1. IDENTIFICAÇÃO DAS PARTES", [
        "1.1. PRIMEIRO PERMUTANTE",
        `Pessoa ${dados.pessoaPermutante === 'fisica' ? 'Física' : 'Jurídica'}`,
        ...(dados.pessoaPermutante === 'fisica' ? [
            `Nome completo: ${verificarValor(dados.nomeCompleto)}`,
            `Sexo: ${verificarValor(dados.sexo)}`,
            `Nacionalidade: ${verificarValor(dados.nacionalidade)}`,
            `Estado Civil: ${verificarValor(dados.estadoCivil)}`,
            `Profissão: ${verificarValor(dados.profissao)}`,
            `RG: ${verificarValor(dados.rg)}`,
            `CPF nº: ${verificarValor(dados.cpf)}`,
            `Endereço residencial: ${verificarValor(dados.enderecoResi)}`,
            `E-mail: ${verificarValor(dados.email)}`,
            `Telefone: ${verificarValor(dados.telefone)}`
        ] : [
            `Razão Social: ${verificarValor(dados.razaoSocial)}`,
            `CNPJ nº: ${verificarValor(dados.cnpj)}`,
            `Inscrição Estadual: ${verificarValor(dados.inscricaoEstadual)}`,
            `Sede: ${verificarValor(dados.sede)}`,
            "Representada neste ato por seu(s) representante(s) legal(is):",
            `Nome do representante: ${verificarValor(dados.nomeRepresentante)}`,
            `Cargo: ${verificarValor(dados.cargoRepresentante)}`,
            `RG: ${verificarValor(dados.rgRepresentante)}`,
            `CPF: ${verificarValor(dados.cpfRepresentante)}`
        ]),
        "",
        "1.2. SEGUNDO PERMUTANTE",
        `Pessoa ${dados.pessoaSegPermutante === 'fisica' ? 'Física' : 'Jurídica'}`,
        ...(dados.pessoaSegPermutante === 'fisica' ? [
            `Nome completo: ${verificarValor(dados.nomeCompletoSeg)}`,
            `Sexo: ${verificarValor(dados.sexoSeg)}`,
            `Nacionalidade: ${verificarValor(dados.nacionalidadeSeg)}`,
            `Estado Civil: ${verificarValor(dados.estadoCivilSeg)}`,
            `Profissão: ${verificarValor(dados.profissaoSeg)}`,
            `RG: ${verificarValor(dados.rgSeg)}`,
            `CPF nº: ${verificarValor(dados.cpfSeg)}`,
            `Endereço residencial: ${verificarValor(dados.enderecoResiSeg)}`,
            `E-mail: ${verificarValor(dados.emailSeg)}`,
            `Telefone: ${verificarValor(dados.telefoneSeg)}`
        ] : [
            `Razão Social: ${verificarValor(dados.razaoSocialSeg)}`,
            `CNPJ nº: ${verificarValor(dados.cnpjSeg)}`,
            `Inscrição Estadual: ${verificarValor(dados.inscricaoEstadualSeg)}`,
            `Sede: ${verificarValor(dados.sedeSeg)}`,
            "Representada neste ato por seu(s) representante(s) legal(is):",
            `Nome do representante: ${verificarValor(dados.nomeRepresentanteSeg)}`,
            `Cargo: ${verificarValor(dados.cargoRepresentanteSeg)}`,
            `RG: ${verificarValor(dados.rgRepresentanteSeg)}`,
            `CPF: ${verificarValor(dados.cpfRepresentanteSeg)}`
        ])
    ]);

    // Seção 2 - Do Objeto do Contrato
    addSection("2. DO OBJETO DO CONTRATO", [
        "As partes acima identificadas têm, entre si, justo e contratado a permuta de bens imóveis, mediante as seguintes condições:",
        "",
        "2.1. Imóvel do 1º Permutante",
        `Endereço completo: ${verificarValor(dados.endereco1permutante)}`,
        `Descrição detalhada: ${verificarValor(dados.descricaoDetalhe)}`,
        `Matrícula nº: ${verificarValor(dados.matricula)}`,
        `Cartório de Registro de Imóveis: ${verificarValor(dados.cartorioRegistro)}`,
        `Valor atribuído: R$ ${verificarValor(dados.valorAtribuido)}`,
        `Mobília inclusa: ${dados.mobilia === 'S' ? 'Sim' : 'Não'}`,
        ...(dados.mobilia === 'S' ? [`Descrição da mobília: ${verificarValor(dados.descricaoMobilia)}`] : []),
        "",
        "2.2. Imóvel do 2º Permutante",
        `Endereço completo: ${verificarValor(dados.endereco2permutante)}`,
        `Descrição detalhada: ${verificarValor(dados.descricaoSegDetalhe)}`,
        `Matrícula nº: ${verificarValor(dados.matriculaSeg)}`,
        `Cartório de Registro de Imóveis: ${verificarValor(dados.cartorioSegRegistro)}`,
        `Valor atribuído: R$ ${verificarValor(dados.valorSegAtribuido)}`,
        `Mobília inclusa: ${dados.mobiliaSeg === 'S' ? 'Sim' : 'Não'}`,
        ...(dados.mobiliaSeg === 'S' ? [`Descrição da mobília: ${verificarValor(dados.descricaoMobiliaSeg)}`] : [])
    ]);

    // Seção 3 - Da Equivalência de Valores e Torna
    addSection("3. DA EQUIVALÊNCIA DE VALORES E TORNA", [
        "Caso haja diferença de valor entre os imóveis, a parte cujo imóvel tem valor inferior se compromete a pagar à outra a quantia equivalente a:",
        `Valor da torna: R$ ${verificarValor(dados.valorTorna)}`,
        `Forma de pagamento: ${verificarValor(dados.formaPagamento)}`,
        `Prazo para pagamento: ${verificarValor(dados.prazoPagamento)}`,
        `Local de pagamento: ${verificarValor(dados.localPagamento)}`,
        `Multa por inadimplemento: ${verificarValor(dados.multaInadimplemento)}%`,
        `Juros de mora: ${verificarValor(dados.jurosMora)}% ao mês`,
        "A torna será quitada mediante recibo particular, com valor de título executivo, integrando o presente contrato."
    ]);

    // Seção 4 - Da Entrega, Posse e Transferência
    addSection("4. DA ENTREGA, POSSE E TRANSFERÊNCIA", [
        `A entrega da posse dos imóveis será efetuada na data de ${verificarValor(dados.dataEntrega)}`,
        `As partes se comprometem a realizar, no prazo máximo de ${verificarValor(dados.prazo)} dias úteis, as providências legais para a transferência definitiva dos bens nos respectivos Cartórios de Registro de Imóveis.`,
        "As despesas cartorárias e tributárias referentes à transferência serão custeadas pelas partes em partes iguais (50/50)."
    ]);

    // Seção 5 - Das Obrigações e Responsabilidades das Partes
    addSection("5. DAS OBRIGAÇÕES E RESPONSABILIDADES DAS PARTES", [
        "5.1. As partes declaram:",
        "- Que são legítimas proprietárias dos imóveis ora permutados;",
        "- Que os bens estão livres e desembaraçados de quaisquer ônus reais, ações judiciais, débitos tributários, locações, penhoras, arrestos ou quaisquer outras restrições;",
        "- Que assumem plena responsabilidade por eventuais ônus ocultos, inclusive ambientais, perante o Poder Público ou terceiros.",
        "",
        "5.2. Garantias:",
        "- Cada permutante garante à outra parte a evicção de direito e responsabilidade civil e criminal por vícios ocultos ou defeitos preexistentes ao presente instrumento."
    ]);

    // Seção 6 - Condições Especiais
    addSection("6. CONDIÇÕES ESPECIAIS", [
        "- As partes declaram que tiveram ciência prévia de todas as características dos imóveis, tendo realizado vistorias e inspeções técnicas;",
        "- Eventuais ajustes quanto a reformas, demolições, autorizações, ou regularizações junto a órgãos públicos serão de responsabilidade da parte acordada;",
        "- Não há reserva de usufruto ou outras condições especiais neste contrato."
    ]);

    // Seção 7 - Da Rescisão Contratual
    addSection("7. DA RESCISÃO CONTRATUAL", [
        "O descumprimento injustificado das obrigações assumidas neste contrato por qualquer das partes, sem justificativa legal ou contratual, ensejará a rescisão, sujeitando o infrator às penalidades abaixo:",
        `Multa rescisória: R$ ${verificarValor(dados.multaRescisoria)}`,
        "- Perdas e danos: conforme apurados judicial ou extrajudicialmente",
        "- Retorno das partes ao status quo ante, com eventuais compensações monetárias"
    ]);

    // Seção 8 - Da Multa por Inadimplemento
    addSection("8. DA MULTA POR INADIMPLEMENTO", [
        "Em caso de descumprimento de qualquer cláusula contratual, será aplicada multa de:",
        `Valor: R$ ${verificarValor(dados.valorInadimplente)}`,
        `Cumulável com juros moratórios de ${verificarValor(dados.jurosMoratorios)}% ao mês e correção monetária pelo índice ${verificarValor(dados.indice)}, além de demais cominações legais.`
    ]);

    // Seção 9 - Da Resolução de Conflitos
    addSection("9. DA RESOLUÇÃO DE CONFLITOS", [
        "As partes elegem a mediação e arbitragem como meio preferencial de resolução de controvérsias. Não sendo possível, elegem o foro da comarca abaixo indicada, com exclusão de qualquer outro, por mais privilegiado que seja."
    ]);

    // Seção 10 - Do Foro
    addSection("10. DO FORO", [
        `Para dirimir eventuais dúvidas oriundas deste contrato, as partes elegem o foro da comarca de ${verificarValor(dados.cidade)}/${verificarValor(dados.estado)}.`
    ]);

    // Seção 11 - Disposições Finais
    addSection("11. DISPOSIÇÕES FINAIS", [
        "- Este contrato obriga as partes, seus herdeiros e sucessores;",
        "- Eventuais alterações deverão ser feitas por aditivo contratual escrito, firmado pelas partes;",
        "- Declaram ainda as partes que receberam vias originais e assinadas deste instrumento, com igual teor e forma, juntamente com eventuais anexos e recibos."
    ]);

    // Assinaturas
    checkPageBreak(60);
    doc.setFontSize(12);
    doc.text("Local e data: ___ de ______________ de ________.", marginLeft, posY);
    posY += 20;

    doc.text("ASSINATURAS", 105, posY, { align: "center" });
    posY += 15;

    doc.text("1º Permutante:", marginLeft, posY);
    posY += 10;
    doc.text("Nome: ______________________________", marginLeft, posY);
    posY += 10;
    doc.text("Assinatura: _________________________", marginLeft, posY);
    posY += 20;

    doc.text("2º Permutante:", marginLeft, posY);
    posY += 10;
    doc.text("Nome: ______________________________", marginLeft, posY);
    posY += 10;
    doc.text("Assinatura: _________________________", marginLeft, posY);
    posY += 20;

    doc.text("TESTEMUNHAS", 105, posY, { align: "center" });
    posY += 15;

    doc.text("Nome: ___________________________", marginLeft, posY);
    posY += 10;
    doc.text("CPF: ____________________________", marginLeft, posY);
    posY += 10;
    doc.text("Assinatura: ______________________", marginLeft, posY);
    posY += 15;

    doc.text("Nome: ___________________________", marginLeft, posY);
    posY += 10;
    doc.text("CPF: ____________________________", marginLeft, posY);
    posY += 10;
    doc.text("Assinatura: ______________________", marginLeft, posY);


    doc.save(`Contrato_PermutaImoveis.pdf`);

};