import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function geradorCompraVendaImoveisPdfPago(dados: any) {
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
    doc.text("CONTRATO DE COMPRA E VENDA DE IMÓVEL", 105, posY, { align: "center" });
    posY += 15;

    // Seção 1: Identificação das Partes
    addSection("1. Identificação das Partes", [
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

    // Seção 2: Descrição do Imóvel
    addSection("2. Descrição do Imóvel", [
        "Art. 1.245. Transfere-se entre vivos a propriedade mediante o registro do título translativo no Registro de Imóveis.",
        "Art. 1.227. Os direitos reais sobre imóveis constituídos, transferidos ou extintos por atos inter vivos só se adquirem com o registro no Cartório de Registro de Imóveis.",
        `Tipo de imóvel (casa, apartamento, terreno, etc.): ${verificarValor(dados.tipoDeImovel)}`,
        `Endereço completo: ${verificarValor(dados.endereco)}`,
        `Área total e construída (se aplicável): ${verificarValor(dados.areaTotal)}`,
        `Número da matrícula e registro no Cartório de Registro de Imóveis competente; ${verificarValor(dados.matricula)}`,
        `Descrição detalhada das características do imóvel,`,
        `Número de quartos, banheiros, vagas de garagem, `,
        `Informações sobre áreas comuns (se aplicável), `,
        `Benfeitorias ou reformas realizadas,
             ${verificarValor(dados.descri)}`
    ]);

    // Seção 3: Situação Legal do Imóvel
    addSection("3. Situação Legal do Imóvel", [
        "Art. 1.267. A propriedade adquire-se pela tradição, quando se trata de bens móveis, e pelo registro do título translativo no Registro de Imóveis, quando se trata de bens imóveis.",
        `Art. 1.275. Extingue-se o direito de propriedade, entre outras formas:
                I - pela alienação;
                II - pela renúncia;
                III - pelo abandono;
                IV - pela perecimento da coisa;
                V - por desapropriação.`,
        `O imóvel está livre de ônus, dívidas ou pendências legais? ${verificarValor(dados.imovelDivida)}`,
        `Existem ações judiciais ou disputas relacionadas ao imóvel? ${verificarValor(dados.acoesJudiciais)}`,
        `O imóvel possui habite-se e demais licenças necessárias? ${verificarValor(dados.imovelLicensa)}`,
        `Há débitos de IPTU, condomínio ou outras taxas? ${verificarValor(dados.debitoIptu)}`
    ]);

    // Seção 4: Preço e Condições de Pagamento
    addSection("4. Preço e Condições de Pagamento", [
        `Art. 481. Pelo contrato de compra e venda, um dos contratantes se obriga a transferir o domínio de certa coisa, e o outro, a pagar-lhe certo preço em dinheiro.
             Art. 489. Salvo cláusula em contrário, os riscos da coisa vendida correm por conta do comprador desde a tradição.
             Art. 505. Se a venda se realizar a crédito, poderá o vendedor exigir garantia real ou fidejussória`,
        `Valor total da venda: ${verificarValor(dados.valorTotal)}`,
        `Forma de pagamento: ${verificarValor(dados.formaPagamento)}`,
        `Pagamento à vista ou parcelado? ${verificarValor(dados.formaPagamento)}`,
        `Em caso de parcelamento, número de parcelas, valores e datas de vencimento: ${verificarValor(dados.numeroDeParcela)}, ${verificarValor(dados.valorParcela)}, ${verificarValor(dados.dataVenc)}`,
        `Existência de sinal ou entrada? Se sim, qual valor e data de pagamento? ${verificarValor(dados.sinal) === 'S' ? `Sim, ${verificarValor(dados.valorSinal)}, ${verificarValor(dados.dataPag)}` : 'Não'}`,
        `Índice de reajuste das parcelas (se aplicável): ${verificarValor(dados.aplicaReajuste) === 'S' ? verificarValor(dados.qualReajuste) : 'Não aplicável'}`
    ]);

    // Seção 5: Prazos e Transferência
    addSection("5. Prazos e Transferência", [
        `Art. 1.245, § 1º. Enquanto não se registrar o título translativo, o alienante continua a ser havido como dono do imóvel.
             Art. 500. Se a área real do imóvel vendido for inferior à mencionada no contrato, poderá o comprador exigir o complemento da área, o abatimento proporcional do preço ou a resolução do contrato.`,
        `Data prevista para a assinatura do contrato: ${verificarValor(dados.dataPrevista)}`,
        `Data de entrega das chaves e posse do imóvel: ${verificarValor(dados.dataParaEntrega)}`,
        `Prazo para lavratura da escritura pública de compra e venda: ${verificarValor(dados.PrazoLavratura)}`,
        `Responsabilidade pelas despesas de transferência (custas cartorárias, ITBI, etc.): ${verificarValor(dados.ResponsaCartorio)}`,
        `Vistoria e entrega: Estipulação de prazos para a realização da vistoria do imóvel pelo comprador, bem como a data de entrega efetiva do imóvel e as condições em que o mesmo deve ser entregue (desocupado, livre de móveis ou entulhos, etc.): ${verificarValor(dados.condicoesEntrega)}`
    ]);

    // Seção 6: Obrigações das Partes
    addSection("6. Obrigações das Partes", [
        `Art. 422. Os contratantes são obrigados a guardar, assim na conclusão do contrato, como em sua execução, os princípios da probidade e boa-fé.`,
        `Art. 475. A parte lesada pelo inadimplemento pode pedir a resolução do contrato ou o cumprimento da obrigação, além de perdas e danos.`,
        "Vendedor:",
        "Garantir a legitimidade e propriedade do imóvel.",
        "Assegurar que o imóvel está livre de quaisquer ônus ou dívidas, salvo as informadas.",
        "Fornecer todos os documentos necessários para a transferência de propriedade.",
        "Entregar o imóvel nas condições acordadas.",
        "",
        "Comprador:",
        "Efetuar os pagamentos conforme acordado.",
        "Providenciar a transferência de titularidade junto aos órgãos competentes.",
        "Assumir as despesas e responsabilidades a partir da data de posse."
    ]);

    // Seção 7: Garantias
    addSection("7. Garantias", [
        `Art. 441. O adquirente tem direito a exigir a substituição da coisa, o abatimento do preço ou a resolução do contrato se houver defeito oculto que a torne imprópria para o uso ou lhe diminua o valor.`,
        `Art. 445. O prazo para reclamar pelos vícios ocultos é de um ano para bens móveis e de um ano para bens imóveis, contados da entrega efetiva.`,
        `O vendedor oferece alguma garantia sobre o estado do imóvel? Se sim, especificar o prazo e condições: ${verificarValor(dados.garantia) === 'S' ? `Sim, ${verificarValor(dados.qualgarantidor)}` : 'Não'}`,
        `Existem garantias legais aplicáveis ao tipo de imóvel negociado? ${verificarValor(dados.garantia) === 'S' ? 'Sim' : 'Não'}`
    ]);

    // Seção 8: Rescisão e Penalidades
    addSection("8. Rescisão e Penalidades", [
        ` Art. 474. A cláusula resolutiva expressa opera de pleno direito; a tácita depende de interpelação judicial.`,
        `Art. 476. Nos contratos bilaterais, nenhum dos contratantes pode exigir o cumprimento da obrigação do outro, se não tiver cumprido a sua parte.`,
        `Condições para rescisão do contrato por qualquer das partes: ${verificarValor(dados.condicoesRescisao)}`,
        `Multas ou penalidades em caso de descumprimento de cláusulas contratuais: ${verificarValor(dados.multasPenalidades)}`,
        `Prazo para notificação prévia em caso de rescisão: ${verificarValor(dados.prazo)}`
    ]);


    addSection("9. Disposições Gerais", [
        `Art. 53. Nos contratos de alienação de bens imóveis com pagamento em prestações, se o comprador deixar de pagar três ou mais prestações, poderá o vendedor considerar resolvido o contrato, restituindo as quantias pagas, retidas as despesas e perdas.`,
        `Art. 784. A obrigação de pagar quantia certa é exigível por meio de execução forçada se houver um título executivo, como um contrato com assinatura das partes e de duas testemunhas.`,
        `Foro eleito para resolução de conflitos: ${verificarValor(dados.foroResolucaoConflitos)}`,
        `Necessidade de testemunhas para assinatura do contrato: ${verificarValor(dados.testemunhasNecessarias) === 'S' ? `Sim, ${verificarValor(dados.nomeTest1)}, ${verificarValor(dados.cpfTest1)}, ${verificarValor(dados.nomeTest2)}, ${verificarValor(dados.cpfTest2)}` : 'Não'}`,
        `O contrato será registrado em cartório? (sim/não): ${verificarValor(dados.registroCartorio)}`,
        "",
        "Assinaturas:",
        `Vendedor: ______________________________________   CPF/CNPJ: ${dados.vendedor === 'pf' ? dados.CPFvendedor : dados.cnpjvendedor}`,
        `Comprador: _____________________________________   CPF/CNPJ: ${dados.comprador === 'pf' ? dados.CPFComprador : dados.cnpj}`,
        dados.testemunhasNecessarias === 'S' ? `Testemunha 1: _________________________________   CPF: ${dados.cpfTest1}` : '',
        dados.testemunhasNecessarias === 'S' ? `Testemunha 2: _________________________________   CPF: ${dados.cpfTest2}` : ''
    ]);


    doc.save(`contrato_compraevenda_${verificarValor(dados.comprador) === 'pf' ? verificarValor(dados.nomeComprador) : verificarValor(dados.razaoSocialcomprador)}.pdf`);

};