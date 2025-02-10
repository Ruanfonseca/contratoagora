import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function geradorCompraVendaPDFPago(dados: any) {
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
    doc.text("CONTRATO DE COMPRA E VENDA", 105, posY, { align: "center" });
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

    // Seção 2: Descrição do Bem
    addSection("2. Descrição do Bem", [
        "Art. 481 do Código Civil: O vendedor se obriga a transferir o domínio de um bem ao comprador, mediante o pagamento de um preço em dinheiro.\n",
        "Art. 485 do Código Civil: O vendedor responde pela entrega do bem na forma e condições acordadas.",
        `Tipo de bem a ser negociado: ${verificarValor(dados.tipo)}`,
        "",
        "Descrição detalhada do bem:",
        ...(dados.tipo === 'imovel' ? [
            "Imóvel:",
            `Endereço completo: ${verificarValor(dados.endereco)}`,
            `Área total e construída: ${verificarValor(dados.areaTotal)}`,
            `Matrícula e registro no cartório competente: ${verificarValor(dados.matriculaCartorio)}, ${verificarValor(dados.registroCartorio)}`,
            `Descrição dos cômodos e características adicionais: ${verificarValor(dados.descricao)}`
        ] : dados.tipo === 'veiculo' ? [
            "Veículo:",
            `Marca, modelo e ano de fabricação: ${verificarValor(dados.marca)}`,
            `Placa e Renavam: ${verificarValor(dados.placa)}, ${verificarValor(dados.renavam)}`,
            `Quilometragem atual: ${verificarValor(dados.quilometragem)}`,
            `Cor e características adicionais: ${verificarValor(dados.cor)}, ${verificarValor(dados.caractAdicional)}`
        ] : dados.tipo === 'terreno' ? [
            "Terreno:",
            `Localização e dimensões: ${verificarValor(dados.localizacao)}`,
            `Matrícula e registro no cartório competente: ${verificarValor(dados.matriculaCartorioTerreno)}, ${verificarValor(dados.registroCartorioTerreno)}`,
            `Informações sobre zoneamento e uso permitido: ${verificarValor(dados.info)}`
        ] : dados.tipo === 'estabelecimentoComercial' ? [
            "Estabelecimento Comercial:",
            `Nome fantasia e razão social: ${verificarValor(dados.nomeFantasia)}, ${verificarValor(dados.razaosocialComercial)}`,
            `Atividade principal: ${verificarValor(dados.atividadePrincipal)}`,
            `Endereço: ${verificarValor(dados.enderecoEstaComercial)}`,
            `Bens incluídos na venda: ${verificarValor(dados.bensIncluidos)}`
        ] : [])
    ]);

    // Seção 3: Situação Legal do Bem
    addSection("3. Situação Legal do Bem", [
        "Art. 422 do Código Civil: As partes devem agir com boa-fé e lealdade na execução do contrato.",
        " Art. 492 do Código Civil: O vendedor responde pela evicção, garantindo ao comprador que não perderá o bem adquirido por decisão judicial que reconheça o direito de terceiro sobre ele.",
        `O bem está livre de ônus, dívidas ou pendências legais? ${verificarValor(dados.onus) === 'S' ? 'Sim' : 'Não'}`,
        ...(dados.onus === 'S' ? [
            `Qual pendência: ${verificarValor(dados.qualPendencia)}`
        ] : []),
        `Existem garantias ou gravames registrados sobre o bem? ${verificarValor(dados.gravames) === 'S' ? 'Sim' : 'Não'}`,
        ...(dados.gravames === 'S' ? [
            `Quais seriam: ${verificarValor(dados.quaisSeriam)}`
        ] : []),
        `No caso de imóvel, há certidões negativas de débitos municipais e estaduais? ${verificarValor(dados.certidoes) === 'S' ? 'Sim' : 'Não'}`
    ]);

    // Seção 4: Preço e Condições de Pagamento
    addSection("4. Preço e Condições de Pagamento", [
        "Art. 487 do Código Civil: A venda pode ser feita à vista, a prazo ou sob condição suspensiva ou resolutiva.\n",
        "Art. 313 do Código Civil: O pagamento deve ser feito pelo próprio comprador, salvo acordo em contrário.",
        `Valor total da venda: ${verificarValor(dados.valorTotal)}`,
        `Forma de pagamento: ${verificarValor(dados.formaPagamento)}`,
        `Pagamento à vista ou parcelado? ${verificarValor(dados.formaPagamento)}`,
        ...(dados.formaPagamento === 'Parcelado' ? [
            `Número de parcelas: ${verificarValor(dados.numeroDeParcela)}`,
            `Valor de cada parcela: ${verificarValor(dados.valorParcela)}`,
            `Data de vencimento das parcelas: ${verificarValor(dados.dataVenc)}`
        ] : []),
        `Existência de sinal ou entrada? ${verificarValor(dados.sinal) === 'S' ? 'Sim' : 'Não'}`,
        ...(dados.sinal === 'S' ? [
            `Valor do sinal: ${verificarValor(dados.valorSinal)}`,
            `Data de pagamento do sinal: ${verificarValor(dados.dataPag)}`
        ] : []),
        `Conta bancária para depósito: ${verificarValor(dados.contaBancaria)}`
    ]);

    // Seção 5: Prazos e Entrega
    addSection("5. Prazos e Entrega", [
        "Art. 476 do Código Civil: Nenhuma das partes está obrigada a cumprir sua obrigação antes que a outra cumpra a sua.",
        "Art. 477 do Código Civil: Se uma das partes não cumprir sua obrigação, a outra pode se recusar a cumprir a sua.",
        `Data prevista para a assinatura do contrato: ${verificarValor(dados.dataPrevista)}`,
        `Data de entrega do bem ao comprador: ${verificarValor(dados.dataEntrega)}`,
        `No caso de imóvel ou estabelecimento comercial, o bem será entregue com os móveis e equipamentos existentes? ${verificarValor(dados.equipamentoExistente)}`
    ]);

    // Seção 6: Obrigações das Partes
    addSection("6. Obrigações das Partes", [
        "Art. 492 do Código Civil: O vendedor deve entregar o bem livre de ônus e pendências, salvo acordo contrário.\n",
        "Vendedor:",
        "Garantir a legitimidade e propriedade do bem.",
        "Assegurar que o bem está livre de quaisquer ônus ou dívidas.",
        "Fornecer todos os documentos necessários para a transferência de propriedade.",
        "",
        "Art. 476 do Código Civil: O comprador deve pagar o preço conforme estabelecido no contrato.\n",
        "Comprador:",
        "Efetuar os pagamentos conforme acordado.",
        "Providenciar a transferência de titularidade junto aos órgãos competentes."
    ]);

    // Seção 7: Garantias
    addSection("7. Garantias", [
        "Art. 441 do Código Civil: O comprador pode rejeitar o bem caso este apresente defeitos ocultos que o tornem impróprio ao uso ou diminuam seu valor.\n",
        "Art. 443 do Código Civil: Caso o defeito do bem seja grave, o comprador pode pedir a substituição ou abatimento no preço.\n",
        `O vendedor oferece alguma garantia sobre o bem? ${verificarValor(dados.garantia) === 'S' ? 'Sim' : 'Não'}`,
        ...(dados.garantia === 'S' ? [
            `Qual garantia: ${verificarValor(dados.qualgarantidor)}`,
            ...(dados.qualgarantidor === 'fi' ? [
                "Fiador:",
                `Nome do fiador: ${verificarValor(dados.nomeFiador)}`,
                `CPF do fiador: ${verificarValor(dados.cpfFiador)}`,
                `Endereço do fiador: ${verificarValor(dados.enderecoFiador)}`
            ] : dados.qualgarantidor === 'caudep' ? [
                `Valor do título de caução: ${verificarValor(dados.valorTitCaucao)}`
            ] : dados.qualgarantidor === 'caubem' ? [
                `Descrição do bem dado em caução: ${verificarValor(dados.descBemCaucao)}`
            ] : dados.qualgarantidor === 'ti' ? [
                `Descrição do título de crédito utilizado: ${verificarValor(dados.descCredUtili)}`
            ] : dados.qualgarantidor === 'segfianca' ? [
                `Seguro-fiança: ${verificarValor(dados.segFianca)}`
            ] : [])
        ] : [])
    ]);

    // Seção 8: Rescisão e Penalidades
    addSection("8. Rescisão e Penalidades", [
        "Art. 389 do Código Civil: O inadimplemento das obrigações contratuais sujeita a parte inadimplente a perdas e danos.",
        "Art. 475 do Código Civil: Se uma das partes não cumprir sua obrigação, a outra pode pedir a rescisão do contrato e exigir indenização.",
        `Condições para rescisão do contrato por qualquer das partes: ${verificarValor(dados.condicoesRescisao)}`,
        `Multas ou penalidades em caso de descumprimento de cláusulas contratuais: ${verificarValor(dados.multasPenalidades)}`,
        `Prazo para notificação prévia em caso de rescisão: ${verificarValor(dados.prazo)}`
    ]);

    // Seção 9: Disposições Gerais
    addSection("9. Disposições Gerais", [
        "Art. 784 do Código Civil: O contrato de compra e venda pode ser registrado em cartório para maior segurança jurídica.",
        " Art. 53 da Lei 8.245/1991: Nos casos de compra e venda de imóveis, o contrato pode prever cláusulas específicas para garantir o cumprimento das obrigações.",
        `Foro eleito para resolução de conflitos: ${verificarValor(dados.foroResolucaoConflitos)}`,
        `Necessidade de testemunhas para assinatura do contrato: ${verificarValor(dados.testemunhasNecessarias) === 'S' ? 'Sim' : 'Não'}`,
        ...(dados.testemunhasNecessarias === 'S' ? [
            `Nome da primeira testemunha: ${verificarValor(dados.nomeTest1)}`,
            `CPF da primeira testemunha: ${verificarValor(dados.cpfTest1)}`,
            `Nome da segunda testemunha: ${verificarValor(dados.nomeTest2)}`,
            `CPF da segunda testemunha: ${verificarValor(dados.cpfTest2)}`
        ] : []),
        `O contrato será registrado em cartório? ${verificarValor(dados.registroCartorioTest) === 'S' ? 'Sim' : 'Não'}`,
        `Local de assinatura: ${verificarValor(dados.local)}`,
        `Data de assinatura: ${verificarValor(dados.dataAssinatura)}`
    ]);

    addSection("10. Assinaturas", [
        "Declaro estar de acordo com todas as cláusulas deste contrato e assino o presente documento para que produza seus efeitos legais."
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
