import { verificarValor, verificarValorEspecial } from "@/lib/utils";
import jsPDF from "jspdf";

export default function geradorDeContratoImovelComercialPago(dados: any) {

    const doc = new jsPDF();

    // Configuração inicial de fonte e margens
    const marginX = 10;
    let posY = 20;

    // Altura máxima permitida antes de criar uma nova página
    const maxPageHeight = 280;

    // Largura do texto permitida dentro das margens
    const maxTextWidth = 190; // 210 (largura total) - 10 (margem esquerda) - 10 (margem direita)

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
    doc.text("CONTRATO DE LOCAÇÃO DE IMÓVEL COMERCIAL", 105, posY, { align: "center" });
    posY += 15;

    // Seções do contrato
    addSection("CLÁUSULA 1 - IDENTIFICAÇÃO DAS PARTES", [
        "(Artigos 104, 421 e 425 do Código Civil Brasileiro)",
        "Nesta seção, é feita a descrição detalhada do imóvel objeto do contrato, incluindo seu endereço completo, características e condições.\n Também são especificadas a destinação (residencial ou comercial) e o estado de conservação, conforme o que foi verificado pelas partes.",
        "\nLocador (Proprietário do Imóvel):",
        `\nNome ou Razão Social: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.nomeLocador) : verificarValor(dados.razaoSocial)}`,
        `\nCPF ou CNPJ: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.CPFLocador) : verificarValor(dados.cnpjlocador)}`,
        `\nEndereço: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.enderecoLocador) : verificarValor(dados.enderecoCNPJ)}`,
        `\nTelefone: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.telefoneLocador) : verificarValor(dados.telefoneCNPJ)}`,
        `\nE-mail: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.emailLocador) : verificarValor(dados.emailCNPJ)}`,
        verificarValor(dados.locador) === "pj" ? `\nRepresentante Legal: ${verificarValor(dados.nomeRepresentanteCNPJ)},\n CPF: ${verificarValor(dados.CPFRepresentanteCNPJ)}` : "",
        "",
        "\nLocatário (Inquilino do Imóvel):",
        `\nNome ou Razão Social: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.nomelocatario) : verificarValor(dados.razaoSociallocatario)}`,
        `\nCPF ou CNPJ: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.CPFlocatario) : verificarValor(dados.cpflocatario)}`,
        `\nEndereço: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.enderecolocatario) : verificarValor(dados.enderecolocatarioCNPJ)}`,
        `\nTelefone: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.telefonelocatario) : verificarValor(dados.telefonelocatarioCNPJ)}`,
        `\nE-mail: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.emaillocatario) : verificarValor(dados.emaillocatarioCNPJ)}`,
        verificarValor(dados.locatario) === "pj" ? `\nRepresentante Legal: ${verificarValor(dados.nomeRepresentantelocatarioCNPJ)},\n CPF: ${verificarValor(dados.CPFRepresentantelocatarioCNPJ)}` : "",
    ]);


    addSection("\nCLÁUSULA 2 - DESCRIÇÃO DO IMÓVEL", [
        "\n(Artigos 47 e 54 da Lei do Inquilinato - Lei nº 8.245/91)",
        `\nEndereço do Imóvel: ${verificarValor(dados.enderecoImovel)}`,
        `\nDescrição: ${verificarValor(dados.descImovel)}`,
        `\nDestinação Comercial: ${verificarValor(dados.destcomercial)}`,
        `\nCondições do Imóvel: ${verificarValor(dados.condicoesImovel)}`,
    ]);

    addSection("CLÁUSULA 3 - PRAZO DA LOCAÇÃO", [
        "(Artigo 565 do Código Civil Brasileiro e Artigo 3º da Lei do Inquilinato)",
        "O prazo do contrato é definido de forma clara, seja por tempo determinado ou indeterminado, conforme acordado entre as partes. São descritos a data de início, a duração do contrato e a possibilidade de renovação,\n respeitando a legislação aplicável, como o Art. 565 do Código Civil.",
        `\nData de Início: ${verificarValor(dados.dataInicioLocacao)}`,
        `\nDuração do Contrato: ${verificarValor(dados.duracaoContrato)}`,
        `Possibilidade de Renovação: ${verificarValor(dados.possibilidadeRenovacao) === "S" ? "Sim" : "Não"}`,
        verificarValor(dados.possibilidadeRenovacao) === "S" ? `Condições: ${verificarValor(dados.quaisCondicoes)}` : "",
    ]);


    addSection("CLÁUSULA 4 - VALOR DO ALUGUEL E CONDIÇÕES DE PAGAMENTO", [
        "(Artigos 565 e 578 do Código Civil Brasileiro)",
        "Conforme o Art. 578 do Código Civil: 'Os aluguéis de prédios urbanos, ou de qualquer outra coisa,\n pagam-se nos prazos ajustados, e, na falta de ajuste, até o sexto dia subsequente ao vencido.'",
        `Valor Mensal: R$ ${verificarValor(dados.valorMensalAluguel)}`,
        `Data de Vencimento: ${verificarValor(dados.dataVenc)}`,
        `Forma de Pagamento: ${verificarValor(dados.formaPagamento)}`,
        `Reajuste Anual: ${verificarValor(dados.reajusteAnual) === "S" ? "Sim" : "Não"}`,
        dados.reajusteAnual === "S" ? `Índice: ${verificarValor(dados.qualIndice)}` : "",
        `Multa por Atraso: ${verificarValor(dados.multaPorAtrasoPagamento)}%`,
        `Juros por Atraso: ${verificarValor(dados.jurosporatraso)}% ao mês`,
    ]);


    addSection("CLÁUSULA 5 - GARANTIAS LOCATÍCIAS", [
        "(Artigo 37 da Lei do Inquilinato e Artigos 827 a 838 do Código Civil Brasileiro)",
        "De acordo com o Art. 37 da Lei do Inquilinato: 'No contrato de locação, pode o locador exigir do locatário\n as seguintes modalidades de garantia: caução, fiança, seguro de fiança locatícia ou cessão fiduciária de quotas de fundo de investimento.'",
        `Garantia Exigida: ${verificarValor(dados.garantia) === "S" ? "Sim" : "Não"}`,
        `Detalhes: ${verificarValor(dados.qualgarantidor) === "fi"
            ? `Fiador: ${verificarValor(dados.nomeFiador)}, CPF: ${verificarValor(dados.cpfFiador)}`
            : verificarValor(dados.qualgarantidor) === "caudep"
                ? `Caução em Dinheiro: R$ ${verificarValor(dados.valorTitCaucao)}`
                : verificarValor(dados.qualgarantidor) === "caubem"
                    ? `Caução em Bem: ${verificarValor(dados.descBemCaucao)}`
                    : verificarValor(dados.qualgarantidor) === "ti"
                        ? `Título de Crédito: ${verificarValor(dados.descCredUtili)}`
                        : `Seguro Fiança: ${verificarValor(dados.segFianca)}`
        }`,
        `Procedimento para Devolução: ${verificarValor(dados.procedimentoDevolucao)}`,
    ]);


    addSection("CLÁUSULA 6 - OBRIGAÇÕES DO LOCADOR", [
        "(Artigo 22 da Lei do Inquilinato)",
        `Responsabilidade por Manutenções/Reparos: ${verificarValor(dados.locadorManuRep) === "S" ? "Sim" : "Não"}`,
        `Serviços Adicionais: ${verificarValor(dados.locadorServAdicional) === "S" ? "Sim" : "Não"}`,
    ]);

    addSection("CLÁUSULA 7 - OBRIGAÇÕES DO LOCATÁRIO", [
        "(Artigos 23 e 24 da Lei do Inquilinato)",
        `Reformas ou Modificações Permitidas: ${verificarValor(dados.locatarioRealiza) === "S" ? "Sim" : "Não"}`,
        verificarValor(dados.locatarioRealiza) === "S" ? `Condições: ${verificarValor(dados.quaisLocatarioCondicoes)}` : "",
        `Responsabilidade por Manutenções: ${verificarValor(dados.locatarioManu)}`,
        `Restrições de Uso: ${verificarValor(dados.restricoes)}`,
    ]);

    addSection("CLÁUSULA 8 - DESPESAS E TRIBUTOS", [
        "(Artigos 22 e 23 da Lei do Inquilinato)",
        `Despesas do Locatário: ${verificarValor(dados.despesasLocatario)}`,
        `Despesas do Locador: ${verificarValor(dados.despesasLocador)}`,
    ]);

    addSection("CLÁUSULA 9 - RESCISÃO DO CONTRATO", [
        "(Artigo 4º da Lei do Inquilinato e Artigo 475 do Código Civil Brasileiro)",
        `Condições: ${verificarValor(dados.condicoesRescisao)}`,
        `Multas/Penalidades: ${verificarValor(dados.multasPenalidades)}`,
        `Prazo para Notificação: ${verificarValor(dados.prazo)} dias`,
    ]);

    addSection("CLÁUSULA 10 - DIREITO DE PREFERÊNCIA", [
        "(Artigo 27 da Lei do Inquilinato)",
        `Preferência para Compra: ${verificarValor(dados.direitoPreferencia) === "S" ? "Sim" : "Não"}`,
        verificarValor(dados.direitoPreferencia) === "S" ? `Condições: ${verificarValor(dados.condicoesExec)}` : "",
    ]);

    addSection("CLÁUSULA 11 - DISPOSIÇÕES GERAIS", [
        "(Artigos 421 e 422 do Código Civil Brasileiro)",
        `Foro: ${verificarValor(dados.foroResolucaoConflitos)}`,
        `Testemunhas Necessárias: ${verificarValor(dados.testemunhasNecessarias) === "S" ? "Sim" : "Não"}`,
        `Registro em Cartório: ${verificarValor(dados.registroCartorio) === "S" ? "Sim" : "Não"}`,
    ]);

    if (dados.testemunhasNecessarias === "S") {
        posY += 20;
        doc.text("__________________________", 60, posY);
        doc.text(`Testemunha 1: ${verificarValorEspecial(dados.nomeTest1)}`, 60, posY + 5);
        doc.text(`CPF: ${verificarValorEspecial(dados.cpfTest1)}`, 60, posY + 10);

        doc.text("__________________________", 140, posY);
        doc.text(`Testemunha 2: ${verificarValorEspecial(dados.nomeTest2)}`, 140, posY + 5);
        doc.text(`CPF: ${verificarValorEspecial(dados.cpfTest2)}`, 140, posY + 10);
    }

    posY += 20;
    doc.text("__________________________", 60, posY);
    doc.text("Assinatura do Locador", 60, posY + 5);

    doc.text("__________________________", 140, posY);
    doc.text("Assinatura do Locatário", 140, posY + 5);

    doc.save(`contrato_hospedagem_${dados.nomeLocador || dados.nomelocatario}.pdf`);
};