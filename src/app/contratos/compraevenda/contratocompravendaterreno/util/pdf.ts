import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function geradorCompraVendaTerrenoPDFPago(dados: any) {
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
    doc.text("CONTRATO DE COMPRA E VENDA DE TERRENO", 105, posY, { align: "center" });
    posY += 15;

    // Seção 1: Identificação das Partes
    addSection("1. Identificação das Partes", [
        " Art. 104 do Código Civil: Para que um contrato seja válido, é necessário que as partes sejam capazes, que o objeto do contrato seja lícito, possível e determinado, e que haja forma prescrita ou não proibida por lei.\n",
        "Vendedor:",
        `Nome completo ou Razão Social: ${verificarValor(dados.vendedor) === 'pf' ? verificarValor(dados.nomevendedor) : verificarValor(dados.razaoSocial)}`,
        `CPF ou CNPJ: ${verificarValor(dados.vendedor) === 'pf' ? verificarValor(dados.CPFvendedor) : verificarValor(dados.cnpjvendedor)}`,
        `Endereço completo: ${verificarValor(dados.vendedor) === 'pf' ? verificarValor(dados.enderecoVendedor) : verificarValor(dados.enderecoCNPJ)}`,
        `Telefone e e-mail para contato: ${verificarValor(dados.vendedor) === 'pf' ? verificarValor(dados.telefoneVendedor) : verificarValor(dados.telefoneCNPJ)}, ${verificarValor(dados.vendedor) === 'pf' ? verificarValor(dados.emailVendedor) : verificarValor(dados.emailCNPJ)}`,
        "",
        "Comprador:",
        `Nome completo ou Razão Social: ${verificarValor(dados.comprador) === 'pf' ? verificarValor(dados.nomeComprador) : verificarValor(dados.razaoSocialcomprador)}`,
        `CPF ou CNPJ: ${verificarValor(dados.comprador) === 'pf' ? verificarValor(dados.CPFComprador) : verificarValor(dados.cnpj)}`,
        `Endereço completo: ${verificarValor(dados.comprador) === 'pf' ? verificarValor(dados.enderecoComprador) : verificarValor(dados.enderecocompradorCNPJ)}`,
        `Telefone e e-mail para contato: ${verificarValor(dados.comprador) === 'pf' ? verificarValor(dados.telefoneComprador) : verificarValor(dados.telefonecompradorCNPJ)}, ${verificarValor(dados.comprador) === 'pf' ? verificarValor(dados.emailComprador) : verificarValor(dados.emailcompradorCNPJ)}`
    ]);

    // Seção 2: Descrição do Terreno
    addSection("2. Descrição do Terreno", [
        "Art. 1.225 do Código Civil: Os direitos reais sobre bens imóveis incluem a propriedade, o usufruto, o uso, a habitação e a superfície.",
        `Endereço completo do terreno: ${verificarValor(dados.enderecoTerreno)}`,
        `Área total do terreno: ${verificarValor(dados.areaTotal)}`,
        `Medidas e confrontações: ${verificarValor(dados.medidas)}`,
        `Matrícula e número de registro no Cartório: ${verificarValor(dados.matriculaCartorioTerreno)}`,
        `Localização: ${verificarValor(dados.localizacao)}`,
        `Benfeitorias: ${verificarValor(dados.benfeitoria) === 'S' ? verificarValor(dados.benfeitoriaDesc) : 'Não há benfeitorias.'}`,
        `Áreas de preservação ou restrições ambientais: ${verificarValor(dados.preservacao) === 'S' ? verificarValor(dados.preservacaoDesc) : 'Não há áreas de preservação ou restrições ambientais.'}`
    ]);

    // Seção 3: Situação Legal do Terreno
    addSection("3. Situação Legal do Terreno", [
        "Art. 1.227 do Código Civil: Os direitos reais sobre imóveis constituem-se, transferem-se e extinguem-se mediante registro no Cartório de Registro de Imóveis.",
        `Ônus ou pendências legais: ${verificarValor(dados.onus) === 'S' ? verificarValor(dados.qualPendencia) : 'Não há ônus ou pendências legais.'}`,
        `Gravames: ${verificarValor(dados.gravames) === 'S' ? verificarValor(dados.quaisSeriam) : 'Não há gravames.'}`,
        `Débitos de IPTU: ${verificarValor(dados.debitosIPTU) === 'S' ? verificarValor(dados.quanto) : 'Não há débitos de IPTU.'}`,
        `Regularização do terreno: ${verificarValor(dados.regulaTerreno)}`,
        `Certidões: ${verificarValor(dados.certidoes) === 'S' ? 'Certidões emitidas.' : 'Certidões não emitidas.'}`
    ]);

    // Seção 4: Preço e Condições de Pagamento
    addSection("4. Preço e Condições de Pagamento", [
        "Art. 481 do Código Civil: Pelo contrato de compra e venda, um dos contratantes se obriga a transferir o domínio de certa coisa, e o outro, a pagar-lhe certo preço em dinheiro.",
        `Valor total da venda: ${verificarValor(dados.valorTotal)}`,
        `Forma de pagamento: ${verificarValor(dados.formaPagamento)}`,
        dados.formaPagamento === 'Parcelado' ? `Número de parcelas: ${verificarValor(dados.numeroDeParcela)}, Valor da parcela: ${verificarValor(dados.valorParcela)}, Data de vencimento: ${verificarValor(dados.dataVenc)}` : `Modalidade de pagamento: ${verificarValor(dados.modalidade)}`,
        `Sinal: ${verificarValor(dados.sinal) === 'S' ? `Valor do sinal: ${verificarValor(dados.valorSinal)}, Data de pagamento: ${verificarValor(dados.dataPag)}` : 'Não há sinal.'}`,
        `Aplica reajuste: ${verificarValor(dados.aplicaReajuste) === 'S' ? `Índice de reajuste: ${verificarValor(dados.qualReajuste)}` : 'Não há reajuste.'}`,
        `Conta bancária para depósito: ${verificarValor(dados.contaBancaria)}`
    ]);

    // Seção 5: Prazos e Transferência
    addSection("5. Prazos e Transferência", [
        "Art. 422 do Código Civil: Os contratantes são obrigados a guardar, assim na conclusão do contrato, como em sua execução, os princípios de probidade e boa-fé.",
        `Data prevista para assinatura do contrato: ${verificarValor(dados.dataPrevista)}`,
        `Data de entrega da posse: ${verificarValor(dados.dataEntrega)}`,
        `Prazo para lavratura da escritura: ${verificarValor(dados.prazoLavratura)}`,
        `Responsabilidade pelas despesas de transferência: ${verificarValor(dados.responsaDespesa)}`
    ]);

    // Seção 6: Obrigações das Partes
    addSection("6. Obrigações das Partes", [
        "Vendedor:",
        "- Garantir a legitimidade e propriedade do terreno.",
        "- Fornecer todos os documentos necessários para a transferência de propriedade.",
        "- Declarar a inexistência de ônus ou pendências, salvo as informadas no contrato.",
        "",
        "Comprador:",
        "- Efetuar os pagamentos conforme acordado.",
        "- Providenciar o registro do contrato no Cartório de Registro de Imóveis.",
        "- Assumir responsabilidades legais e financeiras (ex.: impostos, taxas) a partir da posse."
    ]);

    // Seção 7: Garantias
    addSection("7. Garantias", [
        "Art. 835 do Código de Processo Civil: A penhora observará, preferencialmente, a seguinte ordem: dinheiro, títulos da dívida pública, veículos, bens imóveis, entre outros.",
        `Garantia oferecida pelo vendedor: ${verificarValor(dados.garantia) === 'S' ? `Tipo de garantia: ${verificarValor(dados.qualgarantidor)}` : 'Não há garantias.'}`,
        dados.garantia === 'S' && dados.qualgarantidor === 'fi' ? `Fiador: ${verificarValor(dados.nomeFiador)}, CPF: ${verificarValor(dados.cpfFiador)}, Endereço: ${verificarValor(dados.enderecoFiador)}` : '',
        dados.garantia === 'S' && dados.qualgarantidor === 'caudep' ? `Valor do título de caução: ${verificarValor(dados.valorTitCaucao)}` : '',
        dados.garantia === 'S' && dados.qualgarantidor === 'caubem' ? `Descrição do bem de caução: ${verificarValor(dados.descBemCaucao)}` : '',
        dados.garantia === 'S' && dados.qualgarantidor === 'ti' ? `Descrição do título de crédito utilizado: ${verificarValor(dados.descCredUtili)}` : '',
        dados.garantia === 'S' && dados.qualgarantidor === 'segfianca' ? `Seguro-fiança: ${verificarValor(dados.segFianca)}` : '',
        `Procedimento de devolução: ${verificarValor(dados.procedimentoDevolucao)}`
    ]);

    // Seção 8: Rescisão e Penalidades
    addSection("8. Rescisão e Penalidades", [
        "Art. 389 do Código Civil: Não cumprida a obrigação, responde o devedor por perdas e danos, mais juros e atualização monetária segundo índices oficiais regularmente estabelecidos, e honorários de advogado.",
        `Condições para rescisão: ${verificarValor(dados.condicoesRescisao)}`,
        `Multas ou penalidades: ${verificarValor(dados.multasPenalidades)}`,
        `Prazo para notificação prévia: ${verificarValor(dados.prazo)}`,
        `Método de resolução de conflitos: ${verificarValor(dados.metodoResolucao)}`
    ]);

    // Seção 9: Disposições Específicas
    addSection("9. Disposições Específicas", [
        "Art. 225 da Constituição Federal: Todos têm direito ao meio ambiente ecologicamente equilibrado, bem de uso comum do povo e essencial à sadia qualidade de vida.",
        `Terreno sujeito a plano diretor ou zoneamento municipal: ${verificarValor(dados.terrenoSujeito) === 'S' ? 'Sim' : 'Não'}`,
        `Compromisso firmado com terceiros: ${verificarValor(dados.compromisso) === 'S' ? verificarValor(dados.descricaoCompromisso) : 'Não há compromissos.'}`,
        `Restrições ambientais: ${verificarValor(dados.restricoes) === 'S' ? verificarValor(dados.descRestricoes) : 'Não há restrições.'}`
    ]);

    // Seção 10: Disposições Gerais
    addSection("10. Disposições Gerais", [
        "Art. 5º, inciso XXXV da Constituição Federal: A lei não excluirá da apreciação do Poder Judiciário lesão ou ameaça a direito.",
        `Foro eleito para resolução de conflitos: ${verificarValor(dados.foroResolucaoConflitos)}`,
        `Testemunhas necessárias: ${verificarValor(dados.testemunhasNecessarias) === 'S' ? `Testemunha 1: ${verificarValor(dados.nomeTest1)}, CPF: ${verificarValor(dados.cpfTest1)}. Testemunha 2: ${verificarValor(dados.nomeTest2)}, CPF: ${verificarValor(dados.cpfTest2)}` : 'Não são necessárias testemunhas.'}`,
        `Local de assinatura: ${verificarValor(dados.local)}`,
        `Data de assinatura: ${verificarValor(dados.dataAssinatura)}`,
        `Registro em cartório: ${verificarValor(dados.registroCartorioTest) === 'S' ? 'Sim' : 'Não'}`
    ]);

    // Espaço para assinatura do vendedor
    checkPageBreak(30);
    doc.text("__________________________________________", marginX, posY);
    posY += 10;
    doc.text("Assinatura do Vendedor", marginX, posY);
    posY += 15;

    // Espaço para assinatura do comprador
    checkPageBreak(30);
    doc.text("__________________________________________", marginX, posY);
    posY += 10;
    doc.text("Assinatura do Comprador", marginX, posY);
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


    doc.save(`contrato_compraevenda_${verificarValor(dados.comprador) === 'pf' ? verificarValor(dados.nomeComprador) : verificarValor(dados.razaoSocialcomprador)}.pdf`);

};