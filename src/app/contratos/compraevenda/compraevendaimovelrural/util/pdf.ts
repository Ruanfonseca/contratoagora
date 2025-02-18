import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function geradorCompraVendaImoveisRuralPago(dados: any) {
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
    doc.text("CONTRATO DE COMPRA E VENDA DE IMÓVEL RURAL", 105, posY, { align: "center" });
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

    // Seção 2: Do Objeto
    addSection("2. Do Objeto", [
        "Art. 482 do Código Civil: O contrato de compra e venda é aquele em que uma das partes se obriga a transferir o domínio de uma coisa móvel ou imóvel a outra, mediante o pagamento de determinado preço.",
        "O presente contrato tem como objeto a compra e venda do seguinte imóvel rural:",
        `Localizado em: ${verificarValor(dados.endereco)}`,
        `Cadastro no INCRA: ${verificarValor(dados.cadastroIncra) === 'S' ? 'Sim' : 'Não'}`,
        `Número do Cadastro no INCRA: ${verificarValor(dados.numeroIncra)}`,
        `Matrícula registrada no Cartório de Imóveis: ${verificarValor(dados.matriculaRegistrada) === 'S' ? 'Sim' : 'Não'}`,
        `Número da Matrícula: ${verificarValor(dados.numeroMatricula)}`,
        `Cartório de Registro: ${verificarValor(dados.registroCartorio)}`,
        "O vendedor declara que o imóvel está livre e desembaraçado de quaisquer ônus, hipotecas, penhoras, ações judiciais ou débitos tributários.",
        `O imóvel rural está devidamente inscrito no Cadastro Ambiental Rural (CAR): ${verificarValor(dados.inscritoCAR) === 'S' ? 'Sim' : 'Não'}`,
        `Código do CAR: ${verificarValor(dados.codigo)}`,
        `O imóvel está sujeito a algum passivo ambiental? ${verificarValor(dados.passivoAmbiental) === 'S' ? 'Sim' : 'Não'}. Caso positivo, detalhar: ${verificarValor(dados.detalhesPassivo)}.`
    ]);

    // Seção 3: Do Preço e Forma de Pagamento
    addSection("3. Do Preço e Forma de Pagamento", [
        "Art. 481 do Código Civil: Pelo contrato de compra e venda, um dos contratantes se obriga a transferir o domínio de certa coisa, e o outro, a pagar-lhe certo preço em dinheiro.",
        `O valor acordado entre as partes para a compra e venda do imóvel é de R$ ${verificarValor(dados.valorTotalVenda)} (Valor por extenso), a ser pago da seguinte forma: ${verificarValor(dados.formaPagamento)}.`,
        `Haverá multa em caso de atraso no pagamento no percentual de ${verificarValor(dados.multaAtraso)}% sobre o valor devido.`
    ]);

    // Seção 4: Da Posse e Uso do Imóvel
    addSection("4. Da Posse e Uso do Imóvel", [
        "Art. 1.228 do Código Civil: O proprietário tem a faculdade de usar, gozar e dispor da coisa, e o direito de reavê-la do poder de quem quer que injustamente a possua ou detenha.",
        `O comprador poderá ocupar o imóvel rural em qual data: ${verificarValor(dados.ocupacaoComprador)}`,
        `O uso do imóvel será destinado a: ${verificarValor(dados.destinacao)}`,
        `Outros: ${verificarValor(dados.Outros)}`
    ]);

    // Seção 5: Da Transferência Definitiva do Imóvel
    addSection("5. Da Transferência Definitiva do Imóvel", [
        "Art. 1.245 do Código Civil: Transfere-se entre vivos a propriedade mediante o registro do título translativo no Registro de Imóveis.",
        `As partes acordam que: ${verificarValor(dados.partesConcordam) === 'compradorResponsa' ?
            'O comprador será responsável pelas taxas de registro e escritura' :
            verificarValor(dados.partesConcordam) === 'vendedorResponsa' ?
                'O vendedor será responsável pelas taxas de registro e escritura' :
                verificarValor(dados.partesConcordam) === 'taxasDividas' ?
                    'As taxas serão divididas igualmente entre as partes' : 'Não especificado'
        }`,
        `Data de entrega do imóvel: ${verificarValor(dados.dataEntrega)}`,
        "As partes comprometem-se a entregar os seguintes documentos:",
        "Certidão de Ônus Reais.",
        "Certidão Negativa de Débitos Tributários (ITR e CCIR).",
        "Certidão Negativa de Débitos Trabalhistas e Previdenciários (se aplicável).",
        "Comprovante de Inscrição no CAR.",
        "Declaração de que não há impedimentos legais para a venda."
    ]);

    // Seção 6: Das Responsabilidades Fiscais e Ambientais
    addSection("6. Das Responsabilidades Fiscais e Ambientais", [
        "O vendedor se compromete a quitar quaisquer débitos fiscais incidentes sobre o imóvel até a data da transferência.",
        "O comprador assume a responsabilidade por tributos futuros incidentes sobre a propriedade.",
        "O vendedor declara que todas as obrigações ambientais do imóvel foram cumpridas, incluindo passivos ambientais, se aplicável."
    ]);

    // Seção 7: Garantias
    addSection("7. Garantias", [
        "Art. 441 do Código Civil: A coisa recebida em virtude de contrato pode ser rejeitada por vício redibitório, se torná-la imprópria ao uso a que é destinada, ou lhe diminuir o valor.",
        `O vendedor oferece alguma garantia sobre o estado e funcionamento do imóvel ? ${verificarValor(dados.garantia) === 'S' ? 'Sim' : 'Não'}`,
        `Em caso afirmativo, especificar condições da garantia: ${verificarValor(dados.qualgarantidor)}`,
        `Procedimento para devolução da garantia: ${verificarValor(dados.procedimentoDevolucao) || 'Não especificado'}`,
        dados.fiador ? `Dados do Fiador:
            - Nome: ${verificarValor(dados.nomeFiador)}
            - Sexo: ${verificarValor(dados.sexoFiador)}
            - Estado Civil: ${verificarValor(dados.estadoCivilFiador)}
            - Nacionalidade: ${verificarValor(dados.nacionalidadeFiador)}
            - Profissão: ${verificarValor(dados.profissaoFiador)}
            - Documento: ${verificarValor(dados.docIdentificacao)}
            - Número do Documento: ${verificarValor(dados.numeroDocFiador)}
            - CPF: ${verificarValor(dados.cpfFiador)}
            - Endereço: ${verificarValor(dados.enderecoFiador)}` : '',
        dados.caucaoDep ? `Dados do Título do Caução:
            - Valor: ${verificarValor(dados.valorTitCaucao)}` : '',
        dados.caucaoBemIM ? `Dados do Caução de imóvel:
            - Descrição do bem: ${verificarValor(dados.descBemCaucao)}` : '',
        dados.titulos ? `Dados do Título de Crédito:
            - Descrição: ${verificarValor(dados.descCredUtili)}` : '',
        dados.seguroFi ? `Dados do Seguro Fiança:
            - Valor: ${verificarValor(dados.segFianca)}` : ''
    ].filter(Boolean));


    // Seção 8: Da Penalidade
    addSection("8. Da Penalidade", [
        "Art. 408 do Código Civil: Incorre na pena convencionada aquele que faltar ao cumprimento da obrigação.",
        `Em caso de descumprimento de qualquer cláusula do presente contrato, será aplicada multa no valor de R$ ${verificarValor(dados.valorPenalidade)} (Valor por extenso).`
    ]);

    // Seção 9: Rescisão e Penalidades
    addSection("9. Rescisão e Penalidades", [
        "Art. 474 do Código Civil: A resolução do contrato pode ocorrer em caso de inadimplemento por qualquer das partes.",
        `Condições para rescisão do contrato por qualquer das partes: ${verificarValor(dados.condicoesRescisao)}`,
        `Método de resolução de conflitos escolhido: ${verificarValor(dados.metodoResolucao)}`,
        dados.metodoResolucao === 'Med' ? `A mediação será conduzida por um mediador neutro, ajudando as partes a chegarem a um acordo amigável, de forma rápida e com menor custo.` : '',
        dados.metodoResolucao === 'Arb' ? `As partes concordam em resolver eventuais disputas por meio da arbitragem, sendo nomeado um ou mais árbitros para decidir a questão, cuja decisão será definitiva e com força executória.` : '',
        dados.metodoResolucao === 'Liti' ? `Em caso de litígio judicial, a disputa será levada ao Poder Judiciário para julgamento por um juiz, podendo resultar em um processo mais longo e custoso.` : '',
        `Multas ou penalidades aplicáveis em caso de descumprimento das cláusulas contratuais: ${verificarValor(dados.multasPenalidades)}`,
        `Prazo para notificação prévia em caso de rescisão do contrato: ${verificarValor(dados.prazo)}`
    ].filter(Boolean));

    // Seção 10: Do Foro
    addSection("10. Do Foro", [
        "Art. 63 do Código de Processo Civil: As partes podem modificar a competência territorial elegendo um foro para dirimir questões relativas ao contrato.",
        `Para dirimir quaisquer questões oriundas do presente contrato, as partes elegem o foro da Comarca de ${verificarValor(dados.foroResolucaoConflitos)}, com renúncia expressa a qualquer outro, por mais privilegiado que seja.`
    ]);

    addSection("11. Disposições Gerais", [
        "Art. 112 do Código Civil: Nas declarações de vontade se atenderá mais à intenção nelas consubstanciada do que ao sentido literal da linguagem.",
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

}