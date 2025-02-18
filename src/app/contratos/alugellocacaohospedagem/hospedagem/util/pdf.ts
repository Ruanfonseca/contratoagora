import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";


export default function gerarContratoHospedagem(dados: any) {
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

    const addSection = (title: any, content: any) => {
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

    doc.setFontSize(14);
    doc.text("CONTRATO DE HOSPEDAGEM", 105, posY, { align: "center" });
    posY += 15;

    addSection("CLÁUSULA 1 - IDENTIFICAÇÃO DAS PARTES", [
        "Conforme o artigo 2º da Lei 8.245/1990, o locador é aquele que cede o uso do imóvel mediante remuneração e o locatário é aquele que recebe o imóvel para uso, sendo necessário constar seus dados de identificação no contrato.",
        `Locador: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.nomeLocador) : verificarValor(dados.razaoSocialLocador)}`,
        `CPF/CNPJ: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.cpfLocador) : verificarValor(dados.cnpjLocador)}`,
        `Endereço: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.enderecoLocador) : verificarValor(dados.enderecoLocadora)}`,
        `Telefone: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.telefoneLocador) : verificarValor(dados.telefoneLocadora)}`,
        `E-mail: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.emailLocador) : verificarValor(dados.emailLocadora)}`,
        verificarValor(dados.locador) === "pj" ? `Representante Legal: ${verificarValor(dados.nomeumlocador)}, CPF: ${verificarValor(dados.cpfDaPessoaHabilitada)}` : "",
        "",
        `Locatário: ${verificarValor(dados.hospede) === "pf" ? verificarValor(dados.nomeHospede) : verificarValor(dados.razaoSocialHospede)}`,
        `CPF/CNPJ: ${verificarValor(dados.hospede) === "pf" ? verificarValor(dados.cpfHospede) : verificarValor(dados.cnpjHospede)}`,
        `Endereço: ${verificarValor(dados.hospede) === "pf" ? verificarValor(dados.enderecoHospede) : verificarValor(dados.enderecoHospedeiro)}`,
        `Telefone: ${verificarValor(dados.hospede) === "pf" ? verificarValor(dados.telefoneHospede) : verificarValor(dados.telefoneHospedeiro)}`,
        `E-mail: ${verificarValor(dados.hospede) === "pf" ? verificarValor(dados.emailHospede) : verificarValor(dados.emailHospedeiro)}`,
        verificarValor(dados.hospede) === "pj" ? `Representante Legal: ${verificarValor(dados.nomeumHospede)}, CPF: ${verificarValor(dados.cpfDaPessoaHabilitadaHospede)}` : "",
    ]);

    addSection("CLÁUSULA 2 - DESCRIÇÃO DA HOSPEDAGEM", [
        "Art. 421: Reafirma que os contratos devem ser interpretados conforme a boa-fé e os usos do lugar de sua celebração, o que implica na necessidade de descrição clara e precisa do objeto (no caso, o imóvel/hospedagem)",
        "Art. 104(indiretamente): Ao exigir que o objeto do contrato seja lícito e determinado, reforça a importância de descrever com exatidão as características do imóvel.",
        `Tipo de Imóvel: ${verificarValor(dados.tipoDeImovel)}`,
        `Endereço do Imóvel: ${verificarValor(dados.enderecoImovel)}`,
        `Descrição do Imóvel: ${verificarValor(dados.descImovel)}`,
        `Quantidade de Pessoas Autorizadas: ${verificarValor(dados.qtdPessoasAutorizadas)}`,
        `Valor da Multa por Pessoa Excedente: ${verificarValor(dados.valorMultaPesExcendente)}`,
        `Regras Específicas para Hóspedes: ${verificarValor(dados.regrasExpeHospedes) === "S" ? verificarValor(dados.descRegrasHospedes) : "Não há regras específicas."}`,
        `Imóvel Mobiliado: ${verificarValor(dados.imovelMobiliado) === "S" ? "Sim" : "Não"}`,
    ]);

    addSection("CLÁUSULA 3 - DATA DE CHECK-IN", [
        "Art. 421: Novamente, o princípio da autonomia da vontade e da boa-fé nas relações contratuais assegura que os prazos e condições estabelecidos sejam cumpridos de forma leal",
        "Art. 476: Em contratos bilaterais, nenhuma das partes pode exigir o cumprimento da obrigação da outra sem cumprir a sua própria, destacando a importância de estabelecer datas e prazos claros para o início da hospedagem.",
        `Data de Início da Hospedagem: ${verificarValor(dados.dataDeInicioHospedagem)}`,
        `Duração da Hospedagem: ${verificarValor(dados.qtdDiasouMeses)} ${verificarValor(dados.duracaoDiasouMeses)}`,
    ]);

    addSection("CLÁUSULA 4 - PREÇO E FORMA DE PAGAMENTO", [
        "Art. 421 e Art. 422: Fundamentam a liberdade contratual e o dever de transparência, imprescindíveis na definição de valores e formas de pagamento",
        "Art. 475: Trata das consequências do inadimplemento, permitindo que, em caso de descumprimento das obrigações de pagamento, a parte prejudicada possa buscar a resolução do contrato ou indenização",
        `Valor da Hospedagem: ${verificarValor(dados.valordahospedagem)}`,
        `Forma de Cobrança: ${verificarValor(dados.cobrancaHospedagem)}`,
        `Forma de Pagamento: ${verificarValor(dados.formaDePagamento)}`,
        `Pagamento Antecipado: ${verificarValor(dados.antecipaPagReserva) === "S" ? `Sim, no valor de ${verificarValor(dados.valorAntecipa)}` : "Não"}`,
        `Multa por Desistência: ${verificarValor(dados.cobrancaMulta) === "S" ? verificarValor(dados.multaDesistencia) : "Não há multa por desistência."}`,
    ]);

    addSection("CLÁUSULA 5 - POLÍTICAS DE CANCELAMENTO", [
        "Art. 474: Prevê a eficácia da cláusula resolutiva expressa, ou seja, as condições estipuladas para a rescisão do contrato operam de pleno direito quando configuradas",
        "Art. 475: Permite a resolução contratual em caso de inadimplemento, bem como a cobrança de perdas e danos, embasando a previsão de multas em caso de cancelamento",
        `Multa por Cancelamento: ${verificarValor(dados.multaPorDescDeContrato) === "S" ? verificarValor(dados.valorMultaDesc) : "Não há multa por cancelamento."}`,
        `Multa por Rompimento do Contrato: ${verificarValor(dados.multaPorRompimento) === "S" ? verificarValor(dados.valorMultaRompimento) : "Não há multa por rompimento."}`,
    ]);

    addSection("CLÁUSULA 6 - REGRAS DA PROPRIEDADE", [
        "Art. 421: Estabelece que os contratos devem ser interpretados conforme a boa-fé, o que abrange as regras de uso e conservação do imóvel",
        "Art. 927: Versa sobre a obrigação de reparar o dano, sendo aplicável à eventual violação das regras de uso e responsabilidade pela conservação do imóvel.",
        `Serviços de Limpeza: ${verificarValor(dados.servicosLimpeza) === "S" ? "Incluídos" : "Não incluídos"}`,
        `Garagem: ${verificarValor(dados.garagem) === "S" ? "Disponível" : "Não disponível"}`,
        `Multa por Não Desocupação: ${verificarValor(dados.multaPorNaoDesocupa)}`,
    ]);

    addSection("CLÁUSULA 7 - RESPONSABILIDADES DAS PARTES", [
        "Art. 422: Reforça a necessidade de lealdade e colaboração mútua na execução do contrato, determinando que cada parte cumpra com suas obrigações",
        "Art. 927: Define a responsabilidade civil de reparar danos causados por ação ou omissão, estabelecendo a base para eventual indenização.",
        `Pagador das Benfeitorias: ${verificarValor(dados.pagadorBemFeitorias)}`,
        `Contas Básicas: ${verificarValor(dados.contasBasicas) === "S" ? "Incluídas" : "Não incluídas"}`,
        `Transferência de Contas: ${verificarValor(dados.tranfDeContaHosp) === "S" ? "Sim" : "Não"}`,
    ]);

    addSection("CLÁUSULA 8 - SEGUROS E RESPONSABILIDADE CIVIL", [
        "Art. 186: Dispõe que aquele que, por ação ou omissão, causar dano a outrem, fica obrigado a repará-lo, justificando a inclusão de cláusulas que prevejam seguros e garantias",
        "Art. 927: Complementa ao estabelecer a obrigação de indenizar os prejuízos decorrentes de danos, reforçando a importância de mecanismos de segurança(como seguro - fiança ou caução).",
        `Garantia de Hospedagem: ${verificarValor(dados.garantiaHosp) === "S" ? "Sim" : "Não"}`,
        verificarValor(dados.garantiaHosp) === "S" ? `Tipo de Garantia: ${verificarValor(dados.garantidorHosp)}` : "",
        verificarValor(dados.garantidorHosp) === "fi" ? `Fiador: ${verificarValor(dados.nomeFiador1)}, CPF: ${verificarValor(dados.cpfFiador)}` : "",
        verificarValor(dados.garantidorHosp) === "caudep" ? `Valor do Título de Caução: ${verificarValor(dados.valorTitCaucao)}` : "",
        verificarValor(dados.garantidorHosp) === "caubem" ? `Descrição do Bem de Caução: ${verificarValor(dados.descBemCaucao)}` : "",
        verificarValor(dados.garantidorHosp) === "ti" ? `Descrição do Título de Crédito: ${verificarValor(dados.descCredUtili)}` : "",
        verificarValor(dados.garantidorHosp) === "segfianca" ? `Seguro Fiança: ${verificarValor(dados.segFianca)}` : "",
    ]);

    addSection("CLÁUSULA 9 - RESCISÃO DO CONTRATO", [
        "Art. 474: Confirma a eficácia da cláusula resolutiva expressa, permitindo a extinção do contrato mediante o descumprimento das condições pactuadas",
        "Art. 475: Trata dos efeitos do inadimplemento e da possibilidade de resolução contratual, bem como da compensação por perdas e danos.",
        `Resgate Anual: ${verificarValor(dados.resgateAnual) === "S" ? "Sim" : "Não"}`,
        verificarValor(dados.resgateAnual) === "S" ? `Indicador de Reajuste: ${verificarValor(dados.indicador)}` : "",
    ]);

    addSection("CLÁUSULA 10 - ASSINATURAS E DATA", [
        "Art. 104: Ressalta que a validade do negócio jurídico depende, entre outros requisitos, da forma prescrita ou não defesa em lei, o que inclui a assinatura das partes e testemunhas",
        "Art. 107: Embora de forma subsidiária, reforça a importância dos elementos formais para a eficácia dos contratos, garantindo segurança jurídica à avença",
        `Cidade de Assinatura: ${verificarValor(dados.cidadeAssinatura)}`,
        `Data de Assinatura: ${verificarValor(dados.dataAssinatura)}`,
        `Testemunhas: ${verificarValor(dados.duastestemunhas) === "S" ? `1. ${verificarValor(dados.nomeTest1)}, CPF: ${verificarValor(dados.cpfTest1)}; 2. ${verificarValor(dados.nomeTest2)}, CPF: ${verificarValor(dados.cpfTest2)}` : "Não há testemunhas."}`,
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
    doc.save(`contrato_hospedagem_${dados.nomeHospede || dados.razaoSocialHospede}.pdf`);
}
