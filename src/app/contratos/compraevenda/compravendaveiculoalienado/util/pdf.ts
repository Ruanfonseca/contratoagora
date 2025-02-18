import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function geradorCompraEVendaVeiculoAlienadoPago(dados: any) {
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
    doc.text("CONTRATO DE COMPRA E VENDA DE VEÍCULO ALIENADO", 105, posY, { align: "center" });
    posY += 15;

    // Seção 1: Identificação das Partes
    addSection("1. Identificação das Partes", [
        "Art. 104 do Código Civil: Para que um contrato seja válido, é necessário que as partes sejam capazes, que o objeto do contrato seja lícito, possível e determinado, e que haja forma prescrita ou não proibida por lei.\n",
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

    // Seção 2: Identificação do Veículo
    addSection("2. Identificação do Veículo", [
        "Art. 481 do Código Civil: Pelo contrato de compra e venda, um dos contratantes se obriga a transferir o domínio de certa coisa, e o outro, a pagar-lhe certo preço em dinheiro.",
        `Tipo de veículo (carro, moto, caminhão, etc.): ${verificarValor(dados.tipoveiculo)}`,
        `Marca, modelo e ano de fabricação: ${verificarValor(dados.marca)}, ${verificarValor(dados.modelo)}, ${verificarValor(dados.anoFabricacao)}`,
        `Ano do modelo: ${verificarValor(dados.anoModelo)}`,
        `Cor: ${verificarValor(dados.cor)}`,
        `Placa: ${verificarValor(dados.placa)}`,
        `Chassi: ${verificarValor(dados.chassi)}`,
        `Renavam: ${verificarValor(dados.renavam)}`,
        `Quilometragem atual: ${verificarValor(dados.quilometragemAtual)}`,
        `Combustível (gasolina, diesel, flex, etc.): ${verificarValor(dados.combustivel)}`,
        `Número de portas (se aplicável): ${verificarValor(dados.numeroPorta)}`,
        `O veículo possui acessórios ou itens adicionais? (Ex.: som, películas, rodas especiais) ${verificarValor(dados.possuiAdicional) === 'S' ? 'Sim' : 'Não'}`,
        dados.possuiAdicional === 'S' ? `Descrição dos acessórios: ${verificarValor(dados.descrevaAcessorio)}` : ''
    ]);

    // Seção 3: Situação de Alienação e Financiamento
    addSection("3. Situação de Alienação e Financiamento", [
        "Art. 286 do Código Civil: O credor pode ceder seu crédito, se a isso não se opuser a natureza da obrigação, a lei ou a convenção com o devedor.",

        `O veículo está alienado a uma instituição financeira? ${verificarValor(dados.veiculoAlienado) === 'S' ? 'Sim' : 'Não'}`,
        dados.veiculoAlienado === 'S' ? `Nome da instituição financeira: ${verificarValor(dados.nomeInstuicao)}` : '',
        dados.veiculoAlienado === 'S' ? `Valor total do financiamento: R$ ${verificarValor(dados.valorTotalFinanciamento)}` : '',
        dados.veiculoAlienado === 'S' ? `Saldo devedor atual: R$ ${verificarValor(dados.saldoDevedor)}` : '',
        dados.veiculoAlienado === 'S' ? `Número de parcelas restantes: ${verificarValor(dados.numeroDeParcelas)}` : '',
        dados.veiculoAlienado === 'S' ? `Valor de cada parcela: R$ ${verificarValor(dados.valorParcela)}` : '',
        dados.veiculoAlienado === 'S' ? `Data de vencimento das parcelas: ${verificarValor(dados.dataVencParcela)}` : '',
        `Como será realizado o pagamento do saldo devedor? ${verificarValor(dados.pagamentoSaldoDevedor)}`,
        `O comprador assumirá o financiamento? ${verificarValor(dados.compradorAssumi) === 'S' ? 'Sim' : 'Não'}`,
        `O saldo devedor será quitado pelo vendedor antes da transferência? ${verificarValor(dados.saldoquitadovendedor) === 'S' ? 'Sim' : 'Não'}`,
        `O saldo será quitado pelo comprador no ato da compra? ${verificarValor(dados.saldoquitadocomprador) === 'S' ? 'Sim' : 'Não'}`,
        `O veículo possui débitos pendentes? ${verificarValor(dados.veiculoDebito) === 'S' ? 'Sim' : 'Não'}`,
        dados.veiculoDebito === 'S' ? `Descrição dos débitos: ${verificarValor(dados.descrevaDebito)}` : '',
        `Certidão de regularidade junto ao Detran foi emitida? ${verificarValor(dados.certidaoDetran) === 'S' ? 'Sim' : 'Não'}`
    ]);

    // Seção 4: Preço e Condições de Pagamento
    addSection("4. Preço e Condições de Pagamento", [
        "Art. 315 do Código Civil: As dívidas em dinheiro devem ser pagas no vencimento, em moeda corrente e pelo valor nominal.",

        `Valor total da venda (considerando o valor do veículo mais o saldo devedor, se o comprador for assumir o financiamento): R$ ${verificarValor(dados.valorTotalVenda)}`,
        `Forma de pagamento: ${verificarValor(dados.formaPagamento)}`,
        dados.formaPagamento === 'Parcelado' ? `Número de parcelas: ${verificarValor(dados.numeroDeParcela)}` : '',
        dados.formaPagamento === 'Parcelado' ? `Valor de cada parcela: R$ ${verificarValor(dados.valorParcelaVenda)}` : '',
        dados.formaPagamento === 'Parcelado' ? `Data de vencimento das parcelas: ${verificarValor(dados.dataVenc)}` : '',
        dados.formaPagamento === 'Avista' ? `Modalidade de pagamento: ${verificarValor(dados.modalidade)}` : '',
        `Foi pago sinal? ${verificarValor(dados.sinal) === 'S' ? 'Sim' : 'Não'}`,
        dados.sinal === 'S' ? `Valor do sinal: R$ ${verificarValor(dados.valorSinal)}` : '',
        dados.sinal === 'S' ? `Data de pagamento do sinal: ${verificarValor(dados.dataPag)}` : '',
        `Conta bancária para depósito (se aplicável): ${verificarValor(dados.contaBancaria)}`
    ]);

    // Seção 5: Prazos e Transferência
    addSection("5. Prazos e Transferência", [
        "Art. 476 do Código Civil: Nos contratos bilaterais, nenhum dos contratantes pode exigir o implemento da obrigação do outro, antes de cumprir a sua.",

        `Data de entrega do veículo ao comprador: ${verificarValor(dados.dataParaEntrega)}`,
        `Data prevista para transferência de titularidade junto ao Detran: ${verificarValor(dados.dataTitularidade)}`,
        `Responsabilidade pelas despesas de transferência e quitação de débitos (custas, taxas do Detran, etc.): ${verificarValor(dados.responsabilidade)}`,
        `Procedimentos para transferência do financiamento (se aplicável): ${verificarValor(dados.procedimentos)}`
    ]);

    // Seção 6: Garantias
    addSection("6. Garantias", [
        "Art. 441 do Código Civil: A coisa recebida em virtude de contrato pode ser rejeitada por vícios que a tornem imprópria ao uso a que se destina.",

        `O vendedor oferece alguma garantia sobre o estado e funcionamento do veículo? ${verificarValor(dados.garantia) === 'S' ? 'Sim' : 'Não'}`,
        dados.garantia === 'S' ? `Qual o tipo de garantia? ${verificarValor(dados.qualgarantidor)}` : '',
        dados.qualgarantidor === 'fi' ? `Nome do fiador: ${verificarValor(dados.nomeFiador)}` : '',
        dados.qualgarantidor === 'fi' ? `CPF do fiador: ${verificarValor(dados.cpfFiador)}` : '',
        dados.qualgarantidor === 'fi' ? `Endereço do fiador: ${verificarValor(dados.enderecoFiador)}` : '',
        dados.qualgarantidor === 'caudep' ? `Valor do título de caução: R$ ${verificarValor(dados.valorTitCaucao)}` : '',
        dados.qualgarantidor === 'caubem' ? `Descrição do bem de caução: ${verificarValor(dados.descBemCaucao)}` : '',
        dados.qualgarantidor === 'ti' ? `Descrição do título de crédito utilizado: ${verificarValor(dados.descCredUtili)}` : '',
        dados.qualgarantidor === 'segfianca' ? `Descrição do seguro-fiança: ${verificarValor(dados.segFianca)}` : '',
        `Procedimentos de devolução em caso de rescisão: ${verificarValor(dados.procedimentoDevolucao)}`
    ]);

    // Seção 7: Rescisão e Penalidades
    addSection("7. Rescisão e Penalidades", [
        "Art. 389 do Código Civil: O devedor que não cumprir a obrigação responde por perdas e danos, mais juros e atualização monetária.",

        `Condições para rescisão do contrato por qualquer das partes: ${verificarValor(dados.condicoesRescisao)}`,
        `Multas ou penalidades em caso de descumprimento das cláusulas contratuais: ${verificarValor(dados.multasPenalidades)}`,
        `Prazo para notificação prévia em caso de rescisão: ${verificarValor(dados.prazo)}`,
        `Método de resolução de conflitos: ${verificarValor(dados.metodoResolucao)}`
    ]);

    addSection("8. Obrigações das Partes", [
        "Art. 422 do Código Civil: Os contratantes são obrigados a guardar, assim na conclusão do contrato como em sua execução, os princípios de probidade e boa-fé.",

        "Vendedor:",
        "Fornecer todos os documentos necessários para a transferência do veículo e do financiamento:",
        "- CRV/CRLV (Certificado de Registro de Veículo)",
        "- Comprovante de quitação ou saldo devedor do financiamento",
        "Declarar todas as pendências financeiras ou legais relacionadas ao veículo.",
        "Garantir que o veículo encontra-se em condições normais de uso, salvo avarias informadas previamente.",
        "Comprador:",
        "Efetuar os pagamentos conforme o acordado no contrato.",
        "Realizar a transferência de titularidade junto ao Detran no prazo estipulado.",
        "Assumir o financiamento (se aplicável), mediante concordância da instituição financeira."
    ]);

    addSection("9. Declarações das Partes", [
        "Vendedor:",
        "Declara ser o legítimo proprietário do veículo, ainda que esteja alienado.",
        "Confirma que as informações relacionadas à alienação, saldo devedor e condições do veículo foram apresentadas ao comprador.",
        "Comprador:",
        "Declara ciência da alienação do veículo e de todas as condições do financiamento.",
        "Concorda com as condições de pagamento e transferência estabelecidas no contrato."
    ]);


    // Seção 8: Disposições Gerais
    addSection("10. Disposições Gerais", [
        "Art. 112 do Código Civil: Nas declarações de vontade se atenderá mais à intenção nelas consubstanciada do que ao sentido literal da linguagem.",

        `Foro eleito para resolução de conflitos: ${verificarValor(dados.foroResolucaoConflitos)}`,
        `Necessidade de testemunhas para assinatura do contrato? ${verificarValor(dados.testemunhasNecessarias) === 'S' ? 'Sim' : 'Não'}`,
        dados.testemunhasNecessarias === 'S' ? `Nome da primeira testemunha: ${verificarValor(dados.nomeTest1)}` : '',
        dados.testemunhasNecessarias === 'S' ? `CPF da primeira testemunha: ${verificarValor(dados.cpfTest1)}` : '',
        dados.testemunhasNecessarias === 'S' ? `Nome da segunda testemunha: ${verificarValor(dados.nomeTest2)}` : '',
        dados.testemunhasNecessarias === 'S' ? `CPF da segunda testemunha: ${verificarValor(dados.cpfTest2)}` : '',
        `Local de assinatura do contrato: ${verificarValor(dados.local)}`,
        `Data de assinatura do contrato: ${verificarValor(dados.dataAssinatura)}`,
        `O contrato será registrado em cartório? ${verificarValor(dados.registroCartorio) === 'S' ? 'Sim' : 'Não'}`
    ]);

    // Espaço para assinatura do vendedor
    checkPageBreak(30);
    doc.text("__________________________________________", marginX, posY);
    posY += 10;
    doc.text("Assinatura do Vendedor", marginX, posY);
    posY += 15;

    // Espaço para assinatura do comprador
    checkPageBreak(10);
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