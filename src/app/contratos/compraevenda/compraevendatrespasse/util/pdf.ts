import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function geradorCompraVendaTrespassePago(dados: any) {
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
    doc.text("CONTRATO DE COMPRA E VENDA DE ESTABELECIMENTO COMERCIAL (TRESPASSE)", 105, posY, { align: "center" });
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

    // Seção 2: Descrição do Estabelecimento Comercial
    addSection("2. Descrição do Estabelecimento Comercial", [
        "Art. 1.142 do Código Civil: Considera-se estabelecimento o complexo de bens organizados para o exercício da empresa, por empresário ou sociedade empresária.",
        `Nome fantasia e Razão Social: ${verificarValor(dados.nomeFantasia)}, ${verificarValor(dados.razaoSocialComercial)}`,
        `Endereço completo: ${verificarValor(dados.endereco)}`,
        `Atividade principal exercida: ${verificarValor(dados.atividadePrincipal)}`,
        `Registro na Junta Comercial: ${verificarValor(dados.registroJuntaComercial)}`,
        `Licenças e alvarás necessários para operação: ${verificarValor(dados.licenca)}, ${verificarValor(dados.alvara)}`
    ]);

    // Seção 3: Componentes do Estabelecimento Incluídos na Venda
    addSection("3. Componentes do Estabelecimento Incluídos na Venda", [
        "Art. 1.144 do Código Civil: Salvo disposição em contrário, a alienação do estabelecimento importa a transferência de todos os seus elementos essenciais para a exploração da empresa.",
        "Bens materiais:",
        `Móveis, utensílios e equipamentos: ${verificarValor(dados.moveis)}, ${verificarValor(dados.utensilios)}, ${verificarValor(dados.equipamentos)}`,
        `Estoque de mercadorias: ${verificarValor(dados.estoque)}`,
        `Veículos: ${verificarValor(dados.veiculos)}`,
        "",
        "Bens imateriais:",
        `Marcas e patentes: ${verificarValor(dados.marcas)}, ${verificarValor(dados.patentes)}`,
        `Nome comercial: ${verificarValor(dados.nomeComercial)}`,
        `Carteira de clientes: ${verificarValor(dados.carteiras)}`,
        `Contratos vigentes (ex.: fornecedores, locação): ${verificarValor(dados.contratosVigentes)}`
    ]);

    // Seção 4: Situação Legal e Financeira do Estabelecimento
    addSection("4. Situação Legal e Financeira do Estabelecimento", [
        "Art. 1.146 do Código Civil: O adquirente do estabelecimento responde pelo pagamento dos débitos anteriores à transferência, desde que regularmente contabilizados.",
        `O estabelecimento possui dívidas ou ônus? ${verificarValor(dados.onus) === 'S' ? 'Sim' : 'Não'}`,
        dados.onus === 'S' ? `Detalhes das dívidas ou ônus: ${verificarValor(dados.detalhesDivida)}` : '',
        `Existem ações judiciais em andamento relacionadas ao estabelecimento? ${verificarValor(dados.acoesJudiciais) === 'S' ? 'Sim' : 'Não'}`,
        dados.acoesJudiciais === 'S' ? `Detalhes das ações judiciais: ${verificarValor(dados.detalhesAcao)}` : '',
        `Os tributos estão regularizados? ${verificarValor(dados.tributos) === 'S' ? 'Sim' : 'Não'}`,
        `Os funcionários possuem direitos trabalhistas pendentes? ${verificarValor(dados.direitosTrabalhistas) === 'S' ? 'Sim' : 'Não'}`
    ]);

    // Seção 5: Preço e Condições de Pagamento
    addSection("5. Preço e Condições de Pagamento", [
        "Art. 481 – Pelo contrato de compra e venda, um dos contratantes se obriga a transferir o domínio de certa coisa, e o outro, a pagar - lhe certo preço em dinheiro.",
        "Art. 489 – Salvo cláusula em contrário, os riscos da coisa vendida passam ao comprador desde a tradição.",
        "Art. 507 – A penalidade deve ser reduzida equitativamente pelo juiz se a obrigação principal tiver sido cumprida em parte, ou se o montante da penalidade for manifestamente excessivo.",
        `Valor total da venda: R$ ${verificarValor(dados.valorTotalVenda)}`,
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

    // Seção 6: Prazos e Transferência
    addSection("6. Prazos e Transferência", [
        "Art. 132, §3º – Os prazos de meses e anos expiram no dia de igual número do mês ou do ano do vencimento.",
        "Art. 1.145 – Aquele que adquirir estabelecimento comercial responde pelo pagamento dos débitos anteriores à transferência, se essa não tiver sido notificada aos credores.",
        "Art. 1.146 – O adquirente do estabelecimento responde pelo cumprimento das obrigações do alienante, salvo se houver acordo em contrário registrado.",
        `Data prevista para a assinatura do contrato: ${verificarValor(dados.dataPrevista)}`,
        `Data de transferência efetiva do estabelecimento ao comprador: ${verificarValor(dados.dataTransfer)}`,
        `Procedimentos para transferência de propriedade junto aos órgãos competentes: ${verificarValor(dados.procedimentos)}`
    ]);

    // Seção 7: Obrigações das Partes
    addSection("7. Obrigações das Partes", [
        "Art. 422 – Os contratantes são obrigados a guardar, assim na conclusão do contrato, como em sua execução, os princípios de probidade e boa - fé.",
        "Art. 475 – A parte lesada pelo inadimplemento pode pedir a resolução do contrato, se não preferir exigir-lhe o cumprimento, cabendo, em qualquer dos casos, indenização por perdas e danos.",
        "Art. 1.147 – Não havendo autorização expressa, o alienante do estabelecimento não pode fazer concorrência ao adquirente.",
        "Vendedor:",
        "Garantir a legitimidade e propriedade do estabelecimento.",
        "Assegurar que o estabelecimento está livre de quaisquer ônus ou dívidas, salvo as informadas.",
        "Fornecer todos os documentos necessários para a transferência de propriedade.",
        "Notificar os credores sobre a transferência, conforme exigido pelo Art. 1.145 do Código Civil Brasileiro.",
        "",
        "Comprador:",
        "Efetuar os pagamentos conforme acordado.",
        "Providenciar a transferência de titularidade junto aos órgãos competentes.",
        "Assumir as operações do estabelecimento a partir da data acordada."
    ]);

    // Seção 8: Responsabilidade por Dívidas Anteriores
    addSection("8. Responsabilidade por Dívidas Anteriores", [
        "Art. 1.145 – O adquirente responde pelos débitos do estabelecimento se não houver notificação aos credores.",
        "Art. 1.146 – Salvo acordo em contrário, registrado, o adquirente responde pelo cumprimento das obrigações do alienante.",
        "Art. 391 – Pelo inadimplemento das obrigações respondem todos os bens do devedor.",
        `As partes acordam sobre a responsabilidade por dívidas anteriores à transferência? ${verificarValor(dados.dividasAnteriores) === 'S' ? 'Sim' : 'Não'}`,
        dados.dividasAnteriores === 'S' ? `O comprador assumirá as dívidas existentes? ${verificarValor(dados.compradorAssume) === 'S' ? 'Sim' : 'Não'}` : '',
        dados.dividasAnteriores === 'S' ? `Haverá responsabilidade solidária entre vendedor e comprador? ${verificarValor(dados.responsaSolidaria) === 'S' ? 'Sim' : 'Não'}` : ''
    ]);

    // Seção 9: Cláusula de Não Concorrência
    addSection("9. Cláusula de Não Concorrência", [
        "Art. 1.147 – Não havendo autorização expressa, o alienante do estabelecimento não pode fazer concorrência ao adquirente nos cinco anos subsequentes à transferência.",
        "Art. 114 – Os negócios jurídicos devem ser interpretados conforme a boa-fé e os usos do lugar de sua celebração.",
        `O vendedor se compromete a não exercer atividade concorrente em determinada área geográfica e por um período específico? ${verificarValor(dados.vendedorCompromete) === 'S' ? 'Sim' : 'Não'}`,
        dados.vendedorCompromete === 'S' ? `Área de restrição: ${verificarValor(dados.area)}` : '',
        dados.vendedorCompromete === 'S' ? `Período de restrição: ${verificarValor(dados.periodo)}` : ''
    ]);

    // Seção 10: Rescisão e Penalidades
    addSection("10. Rescisão e Penalidades", [
        "Art. 474 – A cláusula resolutiva expressa opera de pleno direito; a tácita depende de interpelação judicial.",
        "Art. 476 – Nos contratos bilaterais, nenhum dos contratantes pode exigir o cumprimento da obrigação do outro antes de cumprir a sua.",
        "Art. 418 – Se a cláusula penal for estipulada para o caso de inadimplemento total da obrigação, o credor pode exigir a pena, ou o cumprimento da obrigação, nos termos do disposto no capítulo das obrigações.",
        `Condições para rescisão do contrato por qualquer das partes: ${verificarValor(dados.condicoesRescisao)}`,
        `Multas ou penalidades em caso de descumprimento de cláusulas contratuais: ${verificarValor(dados.multasPenalidades)}`,
        `Prazo para notificação prévia em caso de rescisão: ${verificarValor(dados.prazo)}`
    ]);

    // Seção 11: Disposições Gerais
    addSection("11. Disposições Gerais", [
        "Art. 53 – Nos contratos de venda com reserva de domínio, considera - se rescindido de pleno direito o contrato se o comprador não pagar as prestações devidas.",
        "Art. 585 – Os contratos assinados por duas testemunhas são títulos executivos extrajudiciais.",
        "Art. 215 – O instrumento particular, feito e assinado por todos os que nele intervêm, prova as obrigações convencionadas.",
        `Foro eleito para resolução de conflitos: ${verificarValor(dados.foroResolucaoConflitos)}`,
        `Necessidade de testemunhas para assinatura do contrato: ${verificarValor(dados.testemunhasNecessarias) === 'S' ? 'Sim' : 'Não'}`,
        dados.testemunhasNecessarias === 'S' ? `Nome da primeira testemunha: ${verificarValor(dados.nomeTest1)}` : '',
        dados.testemunhasNecessarias === 'S' ? `CPF da primeira testemunha: ${verificarValor(dados.cpfTest1)}` : '',
        dados.testemunhasNecessarias === 'S' ? `Nome da segunda testemunha: ${verificarValor(dados.nomeTest2)}` : '',
        dados.testemunhasNecessarias === 'S' ? `CPF da segunda testemunha: ${verificarValor(dados.cpfTest2)}` : '',
        `Local de assinatura do contrato: ${verificarValor(dados.local)}`,
        `Data de assinatura do contrato: ${verificarValor(dados.dataAssinatura)}`,
        `O contrato será registrado em cartório? ${verificarValor(dados.registroCartorioTest) === 'S' ? 'Sim' : 'Não'}`
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