import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function geradorComodatoDinheiroPago(dados: any) {
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
    doc.text("Contrato de Comodato de Dinheiro", 105, posY, { align: "center" });
    posY += 15;

    // Seção 1 - Credor e Devedor
    addSection("CREDOR", [
        `Nome: ${verificarValor(dados.nomeCredor)}`,
        `Endereço: ${verificarValor(dados.enderecoCredor)}`,
        `CPF/CNPJ: ${verificarValor(dados.cpfcnpj)}`
    ]);

    addSection("DEVEDOR", [
        `Nome: ${verificarValor(dados.nomeDevedor)}`,
        `Endereço: ${verificarValor(dados.enderecoDevedor)}`,
        `CPF/CNPJ: ${verificarValor(dados.cpfcnpjDevedor)}`
    ]);

    // Seção 2 - Objeto do Contrato
    addSection("CLÁUSULA 1ª - DO OBJETO", [
        `O presente contrato tem por objeto o empréstimo da quantia de R$ ${verificarValor(dados.valorNumeral)} (${verificarValor(dados.valorExtenso)} reais), concedida pelo CREDOR ao DEVEDOR, que se compromete a restituí-la nos termos estabelecidos neste instrumento.`
    ]);

    // Seção 3 - Prazo e Forma de Pagamento
    addSection("CLÁUSULA 2ª - DO PRAZO E FORMA DE PAGAMENTO", [
        `O valor emprestado deverá ser restituído pelo DEVEDOR no prazo de ${verificarValor(dados.prazo)} meses, com vencimento da primeira parcela em ${verificarValor(dados.vencimento)} e as demais nas mesmas datas dos meses subsequentes.`,
        `Forma de pagamento: ${verificarValor(dados.formaPagamento)}.`
    ]);

    // Seção 4 - Garantias
    addSection("CLÁUSULA 3ª - DAS GARANTIAS", [
        `Para assegurar o cumprimento deste contrato, o DEVEDOR oferece a seguinte garantia, podendo ser de natureza real ou pessoal:`,
        `I - Garantia real: Caso a garantia seja um bem imóvel, o DEVEDOR compromete-se a apresentar matrícula atualizada do imóvel, devidamente registrada em cartório, com averbação da alienação fiduciária ou hipoteca em favor do CREDOR. Se a garantia for um veículo, deverá ser apresentado o Certificado de Registro de Veículo (CRV) devidamente alienado ao CREDOR junto ao órgão competente.`,
        `II - Garantia pessoal: Caso a garantia seja prestada por terceiros, o(s) fiador(es) ou avalista(s) deverá(ão) assinar o presente contrato, fornecendo seus dados completos e se comprometendo solidariamente ao pagamento da dívida em caso de inadimplência do DEVEDOR.`,
        `III - Outras garantias: Poderão ser aceitas outras garantias previamente acordadas entre as partes, como penhor de bens móveis, aplicações financeiras ou títulos de crédito, devendo todas as condições ser formalizadas em instrumento próprio e anexadas a este contrato.`,
        `O CREDOR poderá exigir a substituição da garantia caso esta perca seu valor ou liquidez ao longo do prazo do contrato.`
    ]);

    // Seção 5 - Uso do Empréstimo
    addSection("CLÁUSULA 4ª - DO USO DO EMPRÉSTIMO", [
        `O valor do empréstimo será utilizado para: ${verificarValor(dados.usoEmprestimo)}.`
    ]);

    // Seção 6 - Encargos Adicionais
    addSection("CLÁUSULA 5ª - DOS ENCARGOS ADICIONAIS", [
        `Serão de responsabilidade do DEVEDOR todas as despesas relacionadas ao presente contrato, incluindo tarifas bancárias, taxas de cartório e honorários advocatícios, caso sejam necessários para cobrança judicial ou extrajudicial.`
    ]);

    // Seção 7 - Penalidades por Atraso
    addSection("CLÁUSULA 6ª - DAS PENALIDADES POR ATRASO", [
        `Em caso de atraso no pagamento, será aplicado o índice de ${verificarValor(dados.indice)} sobre o valor devido.`
    ]);

    // Seção 8 - Rescisão
    addSection("CLÁUSULA 7ª - DA RESCISÃO", [
        `O presente contrato poderá ser rescindido nas seguintes situações:`,
        `I - Descumprimento de qualquer cláusula contratual;`,
        `II - Pedido de falência ou insolvência do DEVEDOR;`,
        `III - Protesto de títulos ou outras medidas que comprometam a capacidade financeira do DEVEDOR.`,
        `Ocorrendo rescisão, o saldo devedor será considerado vencido antecipadamente e deverá ser quitado integralmente no prazo de 10 (dez) dias.`
    ]);

    // Seção 9 - Tolerância
    addSection("CLÁUSULA 8ª - DA TOLERÂNCIA", [
        `Qualquer concessão ou tolerância entre as partes não implicará novação ou renúncia a direitos estabelecidos neste contrato.`
    ]);

    // Seção 10 - Foro
    addSection("CLÁUSULA 9ª - DO FORO", [
        `Fica eleito o foro da comarca de ${verificarValor(dados.foroResolucaoConflitos)}, estado de ${verificarValor(dados.estado)}, para dirimir quaisquer dúvidas ou controvérsias decorrentes deste contrato, renunciando as partes a qualquer outro, por mais privilegiado que seja.`
    ]);

    // Seção 11 - Local e Data de Assinatura
    addSection("LOCAL E DATA DE ASSINATURA", [
        `Por estarem justos e acordados, firmam o presente instrumento em duas vias de igual teor e forma, na cidade de ${verificarValor(dados.local)}, estado de ${verificarValor(dados.estado)}, no endereço ${verificarValor(dados.enderecoCredor)}, na data de ${verificarValor(dados.dataAssinatura)}.`
    ]);

    // Seção 12 - Testemunhas (se necessário)
    if (dados.testemunhasNecessarias === 'S') {
        addSection("TESTEMUNHAS", [
            `Nome: ${verificarValor(dados.nomeTest1)}, CPF: ${verificarValor(dados.cpfTest1)}`,
            `Nome: ${verificarValor(dados.nomeTest2)}, CPF: ${verificarValor(dados.cpfTest2)}`
        ]);
    }

    // Seção 13 - Registro em Cartório (se necessário)
    if (dados.registroCartorioTest === 'S') {
        addSection("REGISTRO EM CARTÓRIO", [
            `O presente contrato será registrado em cartório.`
        ]);
    }

    doc.save(`contrato_ComodatoDinheiro.pdf`);
};