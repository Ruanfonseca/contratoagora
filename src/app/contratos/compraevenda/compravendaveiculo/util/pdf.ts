import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function geradorCompraEVendaVeiculoPago(dados: any) {
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
    doc.text("CONTRATO DE COMPRA E VENDA DE VEÍCULO", 105, posY, { align: "center" });
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
        "Art. 481 do Código Civil: Pelo contrato de compra e venda, um vendedor se obriga a transferir o domínio de uma coisa a um comprador, mediante pagamento de preço em dinheiro.",
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
        `Veículo possui acessórios ou itens adicionais (ex.: som, películas, rodas especiais)? ${verificarValor(dados.possuiAdicional)}`,
        `Descrição dos acessórios: ${verificarValor(dados.descrevaAcessorio)}`
    ]);

    // Seção 3: Situação Legal do Veículo
    addSection("3. Situação Legal do Veículo", [
        "Art. 422 do Código Civil: Os contratantes são obrigados a guardar, assim na conclusão do contrato como em sua execução, os princípios de probidade e boa-fé.",
        `O veículo possui débitos pendentes? ${verificarValor(dados.debitoPendente)}`,
        `Descrição das pendências: ${verificarValor(dados.descrevaPendencia)}`,
        `O veículo está alienado ou financiado? ${verificarValor(dados.veiculoAlienado)}`,
        `Instituição financeira: ${verificarValor(dados.informarInst)}`,
        `Status do financiamento: ${verificarValor(dados.statusdofinan)}`,
        `O veículo já foi objeto de sinistro, leilão ou recuperação estrutural? ${verificarValor(dados.objetoSinistro)}`,
        `Certidão de regularidade junto ao Detran foi emitida? ${verificarValor(dados.certidaoDetran)}`
    ]);

    // Seção 4: Preço e Condições de Pagamento
    addSection("4. Preço e Condições de Pagamento", [
        "Art. 489 do Código Civil: Salvo disposição em contrário, os riscos da coisa vendida correm por conta do comprador, desde o momento em que se efetivar a tradição.\n",

        `Valor total da venda: ${verificarValor(dados.valorTotal)}`,
        `Forma de pagamento: ${verificarValor(dados.formaPagamento)}`,
        `Pagamento à vista ou parcelado? ${verificarValor(dados.formaPagamento)}`,
        `Número de parcelas: ${verificarValor(dados.numeroDeParcela)}`,
        `Valor de cada parcela: ${verificarValor(dados.valorParcela)}`,
        `Data de vencimento das parcelas: ${verificarValor(dados.dataVenc)}`,
        `Existência de sinal ou entrada? ${verificarValor(dados.sinal)}`,
        `Valor do sinal: ${verificarValor(dados.valorSinal)}`,
        `Data de pagamento do sinal: ${verificarValor(dados.dataPag)}`
    ]);

    // Seção 5: Prazos e Entrega
    addSection("5. Prazos e Entrega", [
        "Art. 475 do Código Civil: A parte lesada pelo inadimplemento pode pedir a resolução do contrato, se não preferir exigir-lhe o cumprimento, cabendo-lhe, em qualquer caso, indenização por perdas e danos.",
        `Data de entrega do veículo ao comprador: ${verificarValor(dados.dataParaEntrega)}`,
        `O veículo será entregue com o tanque cheio? ${verificarValor(dados.tanque)}`,
        `Data para transferência de titularidade no Detran: ${verificarValor(dados.dataTitularidade)}`,
        `Responsabilidade pelas despesas de transferência (custas, taxas do Detran): ${verificarValor(dados.responsabilidade)}`
    ]);

    // Seção 6: Obrigações das Partes
    addSection("6. Obrigações das Partes", [
        "Art. 421 do Código Civil: A liberdade de contratar será exercida em razão e nos limites da função social do contrato.",
        "Vendedor:",
        "Garantir que o veículo está livre de quaisquer ônus ou pendências legais, salvo as informadas no contrato.",
        "Fornecer todos os documentos necessários para a transferência do veículo (CRV/CRLV, comprovante de pagamento de débitos, etc.).",
        "Garantir que o veículo encontra-se em condições normais de uso, salvo avarias previamente informadas.",
        "",
        "Comprador:",
        "Efetuar os pagamentos conforme acordado.",
        "Realizar a transferência de titularidade no Detran no prazo estipulado.",
        "Assumir a responsabilidade pelas taxas e impostos após a data de entrega."
    ]);

    // Seção 7: Garantias
    addSection("7. Garantias", [
        "Art. 445 do Código Civil: O adquirente deve denunciar o vício oculto ao vendedor em até trinta dias, se o bem for móvel, e um ano, se for imóvel, contados da entrega efetiva.",
        `O vendedor oferece garantia sobre o veículo? ${verificarValor(dados.garantia)}`,
        `Tipo de garantia: ${verificarValor(dados.qualgarantidor)}`,
        `Descrição da garantia: ${verificarValor(dados.procedimentoDevolucao)}`
    ]);

    // Seção 8: Rescisão e Penalidades
    addSection("8. Rescisão e Penalidades", [
        "Art. 408 do Código Civil: Incorre na cláusula penal quem deixa de cumprir a obrigação ou se constitui em mora.",
        `Condições para rescisão do contrato por qualquer das partes: ${verificarValor(dados.condicoesRescisao)}`,
        `Multas ou penalidades em caso de descumprimento de cláusulas contratuais: ${verificarValor(dados.multasPenalidades)}`,
        `Prazo para notificação prévia em caso de rescisão: ${verificarValor(dados.prazo)}`
    ]);

    // Seção 9: Declarações das Partes
    addSection("9. Declarações das Partes", [
        "Art. 112 do Código Civil: Nas declarações de vontade se atenderá mais à intenção nelas consubstanciada do que ao sentido literal da linguagem.",
        `O vendedor declara ser o legítimo proprietário do veículo e que este não possui pendências não informadas no contrato: ${verificarValor(dados.vendedorDeclaracao)}`,
        `O comprador declara ter ciência do estado de conservação e funcionamento do veículo, assumindo a compra em caráter "como está", salvo garantias especificadas: ${verificarValor(dados.compradorDeclaracao)}`
    ]);

    // Seção 10: Cláusula Especial para Veículo Alienado (Financiado)
    addSection("10. Cláusula Especial para Veículo Alienado (Financiado)", [
        "Art. 1361 do Código Civil: Considera-se fiduciária a propriedade resolúvel de coisa móvel infungível que o devedor, com a posse direta, transfere ao credor, como garantia de dívida.",
        "Notificação da Alienação: O vendedor deve informar explicitamente ao comprador sobre a existência da alienação fiduciária ou reserva de propriedade sobre o veículo.",
        "Transferência de Propriedade Condicional: A propriedade do veículo é transferida ao comprador, mas condicionada ao cumprimento das obrigações financeiras acordadas com a instituição financeira.",
        "Direitos e Obrigações: O comprador deve cumprir todas as obrigações relacionadas ao financiamento, incluindo pagamento das parcelas, manutenção do veículo e obtenção de seguro adequado.",
        "Responsabilidade pela Quitação do Financiamento: O comprador é o responsável por quitar o financiamento junto à instituição financeira, e até que isso ocorra, a credora tem o direito de reaver o veículo.",
        "Transferência de Propriedade Definitiva: A transferência definitiva ocorrerá somente após a quitação integral do financiamento e a emissão do Termo de Quitação de Financiamento (TQF)."
    ]);

    // Seção 11: Disposições Gerais
    addSection("11. Disposições Gerais", [
        "Art. 233 do Código Civil: A obrigação será cumprida no local onde foi estipulada, se nele estiver o credor, e, se em outro, quando aí o devedor tiver domicílio.",
        `Foro eleito para resolução de conflitos: ${verificarValor(dados.foroResolucaoConflitos)}`,
        `Necessidade de testemunhas para assinatura do contrato: ${verificarValor(dados.testemunhasNecessarias)}`,
        `Nome da primeira testemunha: ${verificarValor(dados.nomeTest1)}`,
        `CPF da primeira testemunha: ${verificarValor(dados.cpfTest1)}`,
        `Nome da segunda testemunha: ${verificarValor(dados.nomeTest2)}`,
        `CPF da segunda testemunha: ${verificarValor(dados.cpfTest2)}`,
        `Local de assinatura do contrato: ${verificarValor(dados.local)}`,
        `Data de assinatura do contrato: ${verificarValor(dados.dataAssinatura)}`,
        `O contrato será registrado em cartório como instrumento particular? ${verificarValor(dados.registroCartorio)}`
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