import jsPDF from "jspdf";

export default function geradorDoacaoDinheiroPago(dados: any) {
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
    const clausulaPrimeira = [
        "1.1. DOADOR(A):",
        "",
        `Natureza Jurídica: ${dados.doador === 'fisica' ? '(X) Pessoa Física' : '( ) Pessoa Física'} ${dados.doador === 'juridico' ? '(X) Pessoa Jurídica' : '( ) Pessoa Jurídica'}`,
        "",
        ...(dados.doador === 'fisica' ? [
            `Nome: ${verificarValor(dados.nomeDoador)}`,
            `Sexo: ${verificarValor(dados.sexo === 'M' ? 'Masculino' : 'Feminino')}`,
            `Nacionalidade: ${verificarValor(dados.nacionalidade)}`,
            `Estado Civil: ${verificarValor(dados.estadoCivil)}`,
            `Profissão: ${verificarValor(dados.profissao)}`,
            `RG: ${verificarValor(dados.Rg)}`,
            `Órgão Emissor: ${verificarValor(dados.orgaoEmissor)}`,
            `UF: ${verificarValor(dados.uf)}`,
            `CPF: ${verificarValor(dados.cpf)}`,
            `Endereço Completo: ${verificarValor(dados.endereco)}`,
            ""
        ] : [
            `Razão Social: ${verificarValor(dados.razaoSocial)}`,
            `CNPJ: ${verificarValor(dados.cnpj)}`,
            `Endereço da Sede: ${verificarValor(dados.enderecoSede)}`,
            `Nome do Representante Legal: ${verificarValor(dados.nomeRepresentante)}`,
            `Cargo: ${verificarValor(dados.cargoRepresentante)}`,
            `CPF: ${verificarValor(dados.cpfRepresentante)}`,
            `Endereço Completo do Representante: ${verificarValor(dados.enderecoRepresentante)}`,
            ""
        ]),
        "1.2. DONATÁRIO(A):",
        "",
        `Natureza Jurídica: ${dados.donatario === 'fisica' ? '(X) Pessoa Física' : '( ) Pessoa Física'} ${dados.donatario === 'juridico' ? '(X) Pessoa Jurídica' : '( ) Pessoa Jurídica'}`,
        "",
        ...(dados.donatario === 'fisica' ? [
            `Nome: ${verificarValor(dados.nomeDona)}`,
            `Sexo: ${verificarValor(dados.sexoDona === 'M' ? 'Masculino' : 'Feminino')}`,
            `Nacionalidade: ${verificarValor(dados.nacionalidadeDona)}`,
            `Estado Civil: ${verificarValor(dados.estadoCivilDona)}`,
            `Profissão: ${verificarValor(dados.profissaoDona)}`,
            `RG: ${verificarValor(dados.RgDona)}`,
            `Órgão Emissor: ${verificarValor(dados.orgaoEmissorDona)}`,
            `UF: ${verificarValor(dados.ufDona)}`,
            `CPF: ${verificarValor(dados.cpfDona)}`,
            `Endereço Completo: ${verificarValor(dados.enderecoDona)}`,
            ""
        ] : [
            `Razão Social: ${verificarValor(dados.razaoSocialDona)}`,
            `CNPJ: ${verificarValor(dados.cnpjDona)}`,
            `Endereço da Sede: ${verificarValor(dados.enderecoSedeDona)}`,
            `Nome do Representante Legal: ${verificarValor(dados.nomeRepresentanteDona)}`,
            `Cargo: ${verificarValor(dados.cargoRepresentanteDona)}`,
            `CPF: ${verificarValor(dados.cpfRepresentanteDona)}`,
            `Endereço Completo do Representante: ${verificarValor(dados.enderecoRepresentanteDona)}`,
            ""
        ])
    ];
    addSection("CLÁUSULA PRIMEIRA – DAS PARTES", clausulaPrimeira);

    // CLÁUSULA SEGUNDA - DO OBJETO
    const valorPorExtenso = ""; // Aqui você pode implementar uma função para converter o valor para extenso
    const formaTransferencia =
        dados.formaTransfer === 'transferBank' ? '(X) Transferência bancária' : '( ) Transferência bancária' +
            dados.formaTransfer === 'pix' ? '(X) Pix' : '( ) Pix' +
                dados.formaTransfer === 'dinheiro' ? '(X) Dinheiro' : '( ) Dinheiro' +
                    dados.formaTransfer === 'outro' ? `(X) Outro: ${verificarValor(dados.descOutro)}` : '( ) Outro: ________';

    const clausulaSegunda = [
        "O presente contrato tem como objeto a doação voluntária, gratuita, sem contraprestação e sem expectativa de reembolso da seguinte quantia:",
        "",
        `Valor da Doação: ${verificarValor(dados.moeda)} ${verificarValor(dados.valorDoacao)} (${valorPorExtenso})`,
        `Moeda: ${verificarValor(dados.moeda)}`,
        `Forma de Transferência: ${formaTransferencia}`,
        ...(dados.formaTransfer === 'transferBank' ? [
            `Agência: ${verificarValor(dados.agencia)}`,
            `Conta Corrente: ${verificarValor(dados.contaCorrente)}`,
            ""
        ] : []),
        `Data da Efetivação: ${verificarValor(dados.dataEfetivacao)}`,
        `Comprovante de Transferência: ${dados.comprovante === 'anex' ? '(X) Será anexado' : '( ) Será anexado'} ${dados.comprovante === 'nanex' ? '(X) Não será anexado' : '( ) Não será anexado'}`,
    ];
    addSection("CLÁUSULA SEGUNDA – DO OBJETO", clausulaSegunda);

    // CLÁUSULA TERCEIRA - DA FINALIDADE
    const clausulaTerceira = [
        `${dados.finalidade === 'semVinc' ? '(X) A doação é realizada sem vinculação a qualquer finalidade específica.' : '( ) A doação é realizada sem vinculação a qualquer finalidade específica.'}`,
        `${dados.finalidade === 'vinc' ? `(X) A doação destina-se ao seguinte fim específico: ${verificarValor(dados.descVinc)}` : '( ) A doação destina-se ao seguinte fim específico: ________'}`,
    ];
    addSection("CLÁUSULA TERCEIRA – DA FINALIDADE (SE HOUVER)", clausulaTerceira);

    // CLÁUSULA QUARTA - DAS CONDIÇÕES E ENCARGOS
    const clausulaQuarta = [
        `${dados.condicoes === 'semEncargo' ? '(X) A doação não possui qualquer encargo ou condição.' : '( ) A doação não possui qualquer encargo ou condição.'}`,
        `${dados.condicoes === 'encargo' ? `(X) A doação está condicionada aos seguintes encargos: ${verificarValor(dados.descEncargo)}` : '( ) A doação está condicionada aos seguintes encargos: ________'}`,
    ];
    addSection("CLÁUSULA QUARTA – DAS CONDIÇÕES E ENCARGOS (SE HOUVER)", clausulaQuarta);

    // CLÁUSULA QUINTA - DA ACEITAÇÃO
    const clausulaQuinta = [
        "O(A) DONATÁRIO(A) declara, por este instrumento, que aceita de forma irrevogável e irretratável a presente doação, comprometendo-se a cumprir as condições eventualmente estipuladas, e responsabilizando-se integralmente pelo uso da quantia recebida."
    ];
    addSection("CLÁUSULA QUINTA – DA ACEITAÇÃO", clausulaQuinta);

    // CLÁUSULA SEXTA - DA IRREVOGABILIDADE E IRRETRATABILIDADE
    const clausulaSexta = [
        "Nos termos do art. 548 do Código Civil, a presente doação é feita de forma irrevogável e irretratável, exceto nos casos legais de revogação por ingratidão ou descumprimento de encargo."
    ];
    addSection("CLÁUSULA SEXTA – DA IRREVOGABILIDADE E IRRETRATABILIDADE", clausulaSexta);

    // CLÁUSULA SÉTIMA - DAS RESPONSABILIDADES FISCAIS
    const clausulaSetima = [
        "As partes declaram ciência de que a doação poderá estar sujeita à incidência do Imposto sobre Transmissão Causa Mortis e Doação (ITCMD), conforme legislação do estado competente, obrigando-se a efetuar os recolhimentos e declarações necessários junto aos órgãos fiscais competentes."
    ];
    addSection("CLÁUSULA SÉTIMA – DAS RESPONSABILIDADES FISCAIS", clausulaSetima);

    // CLÁUSULA OITAVA - DA RESCISÃO
    const clausulaOitava = [
        "Este contrato poderá ser rescindido nas seguintes hipóteses:",
        "",
        "- Descumprimento das condições ou encargos estipulados;",
        "- Por mútuo acordo entre as partes;",
        "- Revogação nos termos da lei.",
        "",
        "Em caso de rescisão por motivo legal, poderá o(a) DOADOR(A) requerer judicialmente a restituição da quantia doada."
    ];
    addSection("CLÁUSULA OITAVA – DA RESCISÃO", clausulaOitava);

    // CLÁUSULA NONA - DA PROTEÇÃO DE DADOS
    const clausulaNona = [
        "As partes se comprometem a proteger os dados pessoais aqui informados, não os divulgando a terceiros, exceto quando necessário para cumprimento de obrigações legais ou contratuais."
    ];
    addSection("CLÁUSULA NONA – DA PROTEÇÃO DE DADOS", clausulaNona);

    // CLÁUSULA DÉCIMA - DO FORO
    const clausulaDecima = [
        `Para dirimir quaisquer controvérsias oriundas do presente contrato, as partes elegem o foro da Comarca de ${verificarValor(dados.cidade)} - ${verificarValor(dados.estado)}, com renúncia expressa a qualquer outro, por mais privilegiado que seja.`
    ];
    addSection("CLÁUSULA DÉCIMA – DO FORO", clausulaDecima);

    // CLÁUSULA DÉCIMA PRIMEIRA - DAS DISPOSIÇÕES GERAIS
    const clausulaDecimaPrimeira = [
        "- Este contrato obriga as partes e seus sucessores, a qualquer título;",
        "- A assinatura das partes poderá ser física ou eletrônica, com igual validade jurídica;",
        "- Este contrato é celebrado em 2 (duas) vias de igual teor e forma;",
        "- As partes declaram ter lido, compreendido e concordado com todas as cláusulas."
    ];
    addSection("CLÁUSULA DÉCIMA PRIMEIRA – DAS DISPOSIÇÕES GERAIS", clausulaDecimaPrimeira);

    // ASSINATURAS
    const assinaturas = [
        "",
        `Local: ${verificarValor(dados.cidade)}/${verificarValor(dados.estado)}  Data: ${verificarValor(dados.dataAssinatura)}`,
        "",
        "DOADOR(A):",
        "",
        `Nome/Razão Social: ${dados.doador === 'fisica' ? verificarValor(dados.nomeDoador) : verificarValor(dados.razaoSocial)}`,
        "Assinatura: ___________________________________",
        "",
        "",
        "DONATÁRIO(A):",
        "",
        `Nome/Razão Social: ${dados.donatario === 'fisica' ? verificarValor(dados.nomeDona) : verificarValor(dados.razaoSocialDona)}`,
        "Assinatura: ___________________________________",
        "",
        "",
        "1ª TESTEMUNHA:",
        "",
        "Nome Completo: _______________________________",
        "CPF: _______________________________",
        "Assinatura: ___________________________________",
        "",
        "",
        "2ª TESTEMUNHA:",
        "",
        "Nome Completo: _______________________________",
        "CPF: _______________________________",
        "Assinatura: ___________________________________"
    ];
    addSection("", assinaturas);

    // Salva o PDF
    doc.save("contrato_doacao_dinheiro.pdf");
};