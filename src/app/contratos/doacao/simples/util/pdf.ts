import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function geradordoacaosimplespago(dados: any) {
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

    // CLÁUSULA PRIMEIRA – DAS PARTES
    const clausulaPrimeira = [
        "1.1. DOADOR(A):",
        `Natureza: (${dados.doador === 'fisica' ? 'X' : ' '}) Pessoa Física  (${dados.doador === 'juridico' ? 'X' : ' '}) Pessoa Jurídica`,
        "",
        "Se Pessoa Física:",
        `Nome completo: ${verificarValor(dados.nomeDoador)}`,
        `Sexo: ${verificarValor(dados.sexo)} Estado Civil: ${verificarValor(dados.estadoCivil)} Nacionalidade: ${verificarValor(dados.nacionalidade)}`,
        `Profissão: ${verificarValor(dados.profissao)}`,
        `Documento de Identificação: ${verificarValor(dados.Rg)} Órgão Emissor/UF: ${verificarValor(dados.orgaoEmissor)}/${verificarValor(dados.uf)}`,
        `CPF nº: ${verificarValor(dados.cpf)}`,
        `Endereço completo: ${verificarValor(dados.endereco)}`,
        "",
        "Se Pessoa Jurídica:",
        `Razão Social: ${verificarValor(dados.razaoSocial)}`,
        `CNPJ nº: ${verificarValor(dados.cnpj)}`,
        `Endereço da sede: ${verificarValor(dados.enderecoSede)}`,
        `Representante Legal: ${verificarValor(dados.nomeRepresentante)}`,
        `Cargo: ${verificarValor(dados.cargoRepresentante)}`,
        `CPF nº: ${verificarValor(dados.cpfRepresentante)}`,
        `Endereço do Representante: ${verificarValor(dados.enderecoRepresentante)}`,
        "",
        "1.2. DONATÁRIO(A):",
        `Natureza: (${dados.donatario === 'fisica' ? 'X' : ' '}) Pessoa Física  (${dados.donatario === 'juridico' ? 'X' : ' '}) Pessoa Jurídica`,
        "",
        "Se Pessoa Física:",
        `Nome completo: ${verificarValor(dados.nomeDona)}`,
        `Sexo: ${verificarValor(dados.sexoDona)} Estado Civil: ${verificarValor(dados.estadoCivilDona)} Nacionalidade: ${verificarValor(dados.nacionalidadeDona)}`,
        `Profissão: ${verificarValor(dados.profissaoDona)}`,
        `Documento de Identificação: ${verificarValor(dados.RgDona)} Nº: ___________ Órgão Emissor/UF: ${verificarValor(dados.orgaoEmissorDona)}/${verificarValor(dados.ufDona)}`,
        `CPF nº: ${verificarValor(dados.cpfDona)}`,
        `Endereço completo: ${verificarValor(dados.enderecoDona)}`,
        "",
        "Se Pessoa Jurídica:",
        `Razão Social: ${verificarValor(dados.razaoSocialDona)}`,
        `CNPJ nº: ${verificarValor(dados.cnpjDona)}`,
        `Endereço da sede: ${verificarValor(dados.enderecoSedeDona)}`,
        `Representante Legal: ${verificarValor(dados.nomeRepresentanteDona)}`,
        `Cargo: ${verificarValor(dados.cargoRepresentanteDona)}`,
        `CPF nº: ${verificarValor(dados.cpfRepresentanteDona)}`,
        `Endereço do Representante: ${verificarValor(dados.enderecoRepresentanteDona)}`
    ];
    addSection("CLÁUSULA PRIMEIRA – DAS PARTES", clausulaPrimeira);

    // CLÁUSULA SEGUNDA – DO OBJETO DA DOAÇÃO
    const clausulaSegunda = [
        "2.1 O(a) DOADOR(A) doa, a título gratuito, ao(à) DONATÁRIO(A), que aceita, os seguintes bens:",
        "",
        `Descrição detalhada: ${verificarValor(dados.descricaoDetalhada)}`,
        `Quantidade: ${verificarValor(dados.qtd)} Marca/modelo: ${verificarValor(dados.marcaModelo)}`,
        `Número de série ou registro (se aplicável): ${verificarValor(dados.numeroRegistro)}`,
        `Localização: ${verificarValor(dados.localizacao)}`,
        "",
        "2.2 A doação:",
        ` (${dados.realizacaoAnterior === 'anterior' ? 'X' : ' '}) Já foi realizada anteriormente à assinatura deste contrato`,
        ` (${dados.realizacaoAnterior === 'nadata' ? 'X' : ' '}) Será realizada na data especificada na Cláusula Quarta`,
        "",
        "2.3 Esta doação contempla:",
        ` (${dados.contempla === 'unico' ? 'X' : ' '}) Um único bem`,
        ` (${dados.contempla === 'multiplos' ? 'X' : ' '}) Múltiplos bens listados acima ou em anexo (Anexo I)`
    ];
    addSection("CLÁUSULA SEGUNDA – DO OBJETO DA DOAÇÃO", clausulaSegunda);

    // CLÁUSULA TERCEIRA – DA MANIFESTAÇÃO DE VONTADE
    const clausulaTerceira = [
        "3.1 O(a) DOADOR(A) declara, de forma livre, consciente e espontânea, sua inequívoca vontade de doar os bens mencionados à parte DONATÁRIA, sem qualquer exigência de contraprestação, encargos ou ônus, salvo os expressamente previstos neste instrumento.",
        "",
        "3.2 O(a) DONATÁRIO(A) manifesta sua total e irrestrita aceitação à doação, comprometendo-se a cumprir eventuais condições e encargos aqui estipulados."
    ];
    addSection("CLÁUSULA TERCEIRA – DA MANIFESTAÇÃO DE VONTADE", clausulaTerceira);

    // CLÁUSULA QUARTA – DA TRANSFERÊNCIA DA PROPRIEDADE
    const clausulaQuarta = [
        "4.1 A transferência da propriedade dos bens se dará:",
        ` (${dados.transferProp === 'dataAssinatura' ? 'X' : ' '}) Na data de assinatura do presente contrato`,
        ` (${dados.transferProp === 'dataEspecifica' ? 'X' : ' '}) Em uma data específica, salvo disposição em contrário ou impedimento legal.`,
        "",
        `Data de Transferência: ${dados.transferProp === 'dataEspecifica' ? verificarValor(dados.dataEspec) : "________"}`,
        "",
        "4.2 A posse e todos os direitos inerentes aos bens ora doados serão imediatamente transferidos ao(à) DONATÁRIO(A), com pleno direito de uso, gozo e disposição, observadas eventuais condições."
    ];
    addSection("CLÁUSULA QUARTA – DA TRANSFERÊNCIA DA PROPRIEDADE", clausulaQuarta);

    // CLÁUSULA QUINTA – DAS CONDIÇÕES E ENCARGOS (SE HOUVER)
    const clausulaQuinta = [
        "5.1 A presente doação está condicionada às seguintes obrigações, encargos ou restrições:",
        "",
        "(Ex: manutenção do bem doado, utilização para fins sociais/educacionais, proibição de alienação por prazo determinado, etc.)",
        "",
        "",
        "5.2 O descumprimento das condições poderá acarretar a revogação da doação, conforme disposto nos artigos 555 a 559 do Código Civil."
    ];
    addSection("CLÁUSULA QUINTA – DAS CONDIÇÕES E ENCARGOS (SE HOUVER)", clausulaQuinta);

    // CLÁUSULA SEXTA – DAS RESPONSABILIDADES E CUSTOS
    const clausulaSexta = [
        "6.1 As partes acordam que:",
        "",
        `(${dados.despesas === 'despesasDoador' ? 'X' : ' '}) Todas as despesas relativas à doação, tais como impostos, taxas, emolumentos, seguros, transportes, registros e demais encargos, correrão por conta do(a) DOADOR(A).`,
        `(${dados.despesas === 'despesasDonatario' ? 'X' : ' '}) Correrão por conta do(a) DONATÁRIO(A).`,
        `(${dados.despesas === 'despesasAmbos' ? 'X' : ' '}) Serão rateadas entre as partes, conforme acordado:`,
        "",
        dados.despesas === 'despesasAmbos' ?
            ` DOADOR(A): ${verificarValor(dados.porcentagemDoador)}% DONATÁRIO(A): ${verificarValor(dados.porcentagemDonatario)}%` :
            " DOADOR(A): ________% DONATÁRIO(A): ________%",
        "",
        "6.2 Eventuais débitos vinculados ao bem até a data da efetiva transferência serão de responsabilidade exclusiva do(a) DOADOR(A), salvo se expressamente pactuado o contrário."
    ];
    addSection("CLÁUSULA SEXTA – DAS RESPONSABILIDADES E CUSTOS", clausulaSexta);

    // CLÁUSULA SÉTIMA – DA RESCISÃO
    const clausulaSetima = [
        "7.1 Este contrato poderá ser rescindido nas seguintes hipóteses:",
        "",
        "a) Descumprimento de qualquer cláusula ou condição aqui estabelecida;",
        "b) Inexistência ou nulidade do objeto da doação;",
        "c) Superveniência de ingratidão do(a) DONATÁRIO(A), nos termos da lei."
    ];
    addSection("CLÁUSULA SÉTIMA – DA RESCISÃO", clausulaSetima);

    // CLÁUSULA OITAVA – DO FORO
    const clausulaOitava = [
        `8.1 Para dirimir quaisquer controvérsias oriundas deste contrato, as partes elegem o foro da Comarca de ${verificarValor(dados.cidadeComarca)}, Estado de ${verificarValor(dados.estadoComarca)}, com renúncia a qualquer outro, por mais privilegiado que seja.`
    ];
    addSection("CLÁUSULA OITAVA – DO FORO", clausulaOitava);

    // CLÁUSULA NONA – DAS DISPOSIÇÕES FINAIS
    const clausulaNona = [
        "9.1 Este contrato é celebrado em caráter irrevogável e irretratável, obrigando as partes, seus herdeiros e sucessores.",
        "",
        "9.2 As partes reconhecem que leram, compreenderam e concordam com todos os termos aqui estipulados."
    ];
    addSection("CLÁUSULA NONA – DAS DISPOSIÇÕES FINAIS", clausulaNona);

    // CLÁUSULA DÉCIMA – DA ASSINATURA
    const clausulaDecima = [
        `E por estarem justas e contratadas, firmam o presente contrato em ${verificarValor(dados.vias)} vias de igual teor, juntamente com duas testemunhas abaixo assinadas.`,
        "",
        `Local: ${verificarValor(dados.local)}`,
        `Data: ${verificarValor(dados.data)}`,
        "",
        "",
        "ASSINATURAS:",
        "",
        "DOADOR(A):",
        `Nome: ${verificarValor(dados.doador === 'fisica' ? dados.nomeDoador : dados.razaoSocial)}`,
        "Assinatura: __________________________________",
        "",
        "DONATÁRIO(A):",
        `Nome: ${verificarValor(dados.donatario === 'fisica' ? dados.nomeDona : dados.razaoSocialDona)}`,
        "Assinatura: __________________________________",
        "",
        "",
        "TESTEMUNHAS:",
        "",
        "1ª TESTEMUNHA:",
        "Nome: ______________________________________",
        "CPF: ________________________________________",
        "Assinatura: ___________________________________",
        "",
        "2ª TESTEMUNHA:",
        "Nome: ______________________________________",
        "CPF: ________________________________________",
        "Assinatura: ___________________________________"
    ];
    addSection("CLÁUSULA DÉCIMA – DA ASSINATURA", clausulaDecima);

    // Salva o PDF
    doc.save("contrato_doacao_simples.pdf");
};