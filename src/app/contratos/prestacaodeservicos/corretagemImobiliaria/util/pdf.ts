import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function geradorCorretagemImobiliariaPago(dados: any) {
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
    doc.text("CONTRATO DE CORRETAGEM IMOBILIÁRIA", 105, posY, { align: "center" });
    posY += 15;

    // Seção 1: Identificação das Partes
    addSection("IDENTIFICAÇÃO DAS PARTES", [
        "Pelo presente instrumento particular, as partes abaixo qualificadas firmam o presente contrato de corretagem imobiliária, nos termos da Lei Federal nº 10.406 e da Lei Federal nº 6.530."
    ]);

    // Seção 2: Do Contratante (Cliente)
    addSection("DO CONTRATANTE (CLIENTE)", [
        `Nome Completo: ${dados.nome_cliente}`,
        `Estado Civil: ${dados.estado_civil_cliente}`,
        `Nacionalidade: ${dados.nacionalidade_cliente}`,
        `Profissão: ${dados.profissao_cliente}`,
        `Carteira de Identidade (RG): ${dados.rg_cliente}`,
        `CPF: ${dados.cpf_cliente}`,
        `Endereço Residencial: ${dados.endereco_cliente}`,
        `Telefone: ${dados.telefone_cliente}`,
        `E-mail: ${dados.email_cliente}`
    ]);

    // Seção 3: Do Contratado (Corretor/Imobiliária)
    addSection("DO CONTRATADO (CORRETOR/IMOBILIÁRIA)", [
        `Nome Completo: ${dados.nome_corretor}`,
        `Estado Civil: ${dados.estado_civil_corretor}`,
        `Nacionalidade: ${dados.nacionalidade_corretor}`,
        `Profissão: ${dados.profissao_corretor}`,
        `Carteira de Identidade (RG): ${dados.rg_corretor}`,
        `CPF: ${dados.cpf_corretor}`,
        `Creci: ${dados.creci_corretor}`,
        `Endereço Comercial: ${dados.endereco_comercial_corretor}`,
        `Telefone: ${dados.telefone_corretor}`,
        `E-mail: ${dados.email_corretor}`,
        `Razão Social (se aplicável): ${dados.razao_social}`,
        `CNPJ (se aplicável): ${dados.cnpj}`
    ]);

    // Seção 4: Do Objeto (Serviço Prestado de Corretagem)
    addSection("DO OBJETO (SERVIÇO PRESTADO DE CORRETAGEM)", [
        "Nos termos do artigo 722 do Código Civil, o corretor se obriga a obter para o cliente um ou mais negócios imobiliários, com diligência e lealdade.",
        `Endereço do imóvel a ser negociado: ${dados.endereco_imovel}`,
        `Tipo do imóvel: ${dados.tipo_imovel}`,
        `Características do imóvel: ${dados.caracteristicas_imovel}`,
        `Documentação do imóvel: ${dados.documentacao_imovel}`,
        `Finalidade da corretagem: ${dados.finalidade_corretagem}`,
        `Condições especiais para negociação: ${dados.condicoes_negociacao}`
    ]);

    // Seção 5: Do Prazo
    addSection("DO PRAZO", [
        "Nos termos do artigo 725 do Código Civil, o contrato de corretagem pode ser ajustado com ou sem exclusividade e ter prazo determinado ou indeterminado.",
        `Início do serviço: ${dados.inicio_servico}`,
        `Prazo para conclusão do serviço: ${dados.prazo_conclusao}`,
        `Possibilidade de prorrogação: ${dados.prorrogacao}`,
        `Condições para rescisão antecipada: ${dados.rescisao_antecipada}`
    ]);

    // Seção 6: Do Valor do Imóvel
    addSection("DO VALOR DO IMÓVEL", [
        `Valor estimado do imóvel: ${dados.valor_imovel}`,
        `Valor mínimo aceitável: ${dados.valor_minimo}`,
        `Condições de pagamento: ${dados.condicoes_pagamento}`
    ]);

    // Seção 7: Da Comissão
    addSection("DA COMISSÃO", [
        "Nos termos do artigo 724 do Código Civil, a remuneração do corretor é devida sempre que o negócio se aperfeiçoar, ainda que as partes se arrependam.",
        `Porcentagem sobre o valor da venda: ${dados.porcentagem_comissao}`,
        `Forma de pagamento da comissão: ${dados.forma_pagamento_comissao}`,
        `Momento do pagamento: ${dados.momento_pagamento}`,
        `Penalidades por inadimplência no pagamento da comissão: ${dados.penalidades_comissao}`
    ]);

    // Seção 8: Das Obrigações das Partes
    addSection("DAS OBRIGAÇÕES DAS PARTES", [
        "Do Contratante:",
        `${dados.obrigacoes_contratante}`,
        "Nos termos da Lei Federal nº 10.406/2002 (Código Civil), o contratante se compromete a fornecer informações verdadeiras e colaborar com o corretor no processo de intermediação, conforme estipulado nos artigos 722 a 729.",
        "Do Contratado:",
        `${dados.obrigacoes_contratado}`,
        "O corretor imobiliário tem suas atividades regulamentadas pela Lei Federal nº 6.530/1978 e pelo Código Civil nos artigos 722 a 729, devendo prestar serviços com lealdade, diligência e transparência, buscando sempre a melhor negociação para as partes envolvidas."
    ]);

    // Seção 9: Da Rescisão do Contrato
    addSection("DA RESCISÃO DO CONTRATO", [
        "Nos termos do artigo 727 do Código Civil, se o negócio for desfeito por arrependimento de uma das partes, a remuneração do corretor pode ser exigida.",
        `Condições para rescisão: ${dados.condicoesRescisao}`,
        `Multas e penalidades: ${dados.multasPenalidades}`,
        `Prazo para rescisão: ${dados.prazo}`,
        `Método de resolução de conflitos: ${dados.metodoResolucao === 'Med' ? 'Mediação' : dados.metodoResolucao === 'Arb' ? 'Arbitragem' : 'Litígio'}`
    ]);

    // Seção 10: Do Foro
    addSection("DO FORO", [
        `Comarca onde o contrato será assinado: ${dados.comarca}`,
        `Definição de arbitragem (se aplicável): ${dados.arbitragem}`
    ]);

    // Seção 10: Disposições Gerais
    addSection("DISPOSIÇÃO GERAL", [
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
    doc.text("Assinatura do CONTRATANTE ", marginX, posY);
    posY += 15;

    // Espaço para assinatura do comprador
    checkPageBreak(30);
    doc.text("__________________________________________", marginX, posY);
    posY += 10;
    doc.text("Assinatura do CONTRATADO", marginX, posY);
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


    doc.save(`contrato_corretagemImobiliaria_${verificarValor(dados.nome_cliente)}.pdf`);

};