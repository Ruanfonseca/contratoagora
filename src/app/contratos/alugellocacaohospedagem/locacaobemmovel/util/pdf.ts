import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function gerarContratoLocacaoBemMovelPago(dados: any) {
    const doc = new jsPDF();

    // Configuração inicial de fonte e margens
    const marginX = 10;
    let posY = 20;

    // Função auxiliar para adicionar seções e ajustar a posição Y
    const addSection = (title: any, content: any) => {
        if (posY + 10 >= 280) {
            doc.addPage();
            posY = 20;
        }
        doc.setFontSize(12);
        doc.text(title, 105, posY, { align: "center" });
        posY += 10;
        doc.setFontSize(10);
        content.forEach((line: any) => {
            if (posY + 10 >= 280) { // Adiciona margem extra
                doc.addPage();
                posY = 20;
            }
            doc.text(line, marginX, posY);
            posY += 10; // Espaço entre linhas aumentado
        });
    };


    // Página 1 - Cabeçalho
    doc.setFontSize(14);
    doc.text("CONTRATO DE LOCAÇÃO DE BENS MÓVEIS", 105, posY, { align: "center" });
    posY += 20;

    // Seção 1 - Identificação das Partes
    addSection("1. Identificação das Partes", [
        "As partes celebram o presente contrato de locação de bens móveis, com base no Código Civil Brasileiro:",

        dados.locador === "pj"
            ? `Locador:Razão Social: ${verificarValor(dados.razaoSocial)}, CNPJ: ${verificarValor(dados.cnpj)}, Endereço: ${verificarValor(dados.enderecoCNPJ)},\n Telefone: ${verificarValor(dados.telefoneCNPJ)}, E-mail: ${verificarValor(dados.emailCNPJ)}\nRepresentante Legal: ${verificarValor(dados.nomeRepresentanteCNPJ)}, CPF: ${verificarValor(dados.CPFRepresentanteCNPJ)}.`
            : `Locador:Nome: ${verificarValor(dados.nomeLocador)}, CPF: ${verificarValor(dados.CPFLocador)}, Endereço: ${verificarValor(dados.enderecoLocador)},\n Telefone: ${verificarValor(dados.telefoneLocador)}, E-mail: ${verificarValor(dados.emailLocador)}.`,

        dados.locatario === "pj"
            ? `\nLocatário:Razão Social: ${verificarValor(dados.razaoSociallocatario)}, CNPJ: ${verificarValor(dados.cnpjLocatario)}, Endereço: ${verificarValor(dados.enderecolocatarioCNPJ)},\n Telefone: ${verificarValor(dados.telefonelocatarioCNPJ)}, E-mail: ${verificarValor(dados.emaillocatarioCNPJ)}\nRepresentante Legal: ${verificarValor(dados.nomeRepresentantelocatarioCNPJ)}, CPF: ${verificarValor(dados.CPFRepresentantelocatarioCNPJ)}.`
            : `\nLocatário:Nome: ${verificarValor(dados.nomelocatario)}, CPF: ${verificarValor(dados.CPFlocatario)}, Endereço: ${verificarValor(dados.enderecolocatario)},\n Telefone: ${verificarValor(dados.telefonelocatario)}, E-mail: ${verificarValor(dados.emaillocatario)}.`,
    ]);


    // Seção 2 - Descrição do Equipamento
    addSection("\n\n2. Descrição do Equipamento", [
        ...doc.splitTextToSize(
            "\nOs bens móveis objeto deste contrato são descritos abaixo, considerando suas características,\n estado de conservação e acessórios:",
            180
        ),
        `Tipo de Equipamento: ${verificarValor(dados.tipodeequipamento)}.`,
        `Marca/Modelo: ${verificarValor(dados.marcaemodelo)}.`,
        `Número de Série: ${verificarValor(dados.numerodeserie)}.`,
        `Estado de Conservação: ${verificarValor(dados.estadoconservacao)}.`,
        `Acessórios/Componentes: ${verificarValor(dados.acessorioscomponentes)}.`,
    ]);

    // Seção 3 - Informações sobre o Código Civil Brasileiro
    addSection("3. Informações sobre o Código Civil Brasileiro", [
        "O Código Civil Brasileiro, instituído pela Lei nº 10.406 de 10 de janeiro de 2002, regula as relações \nprivadas no Brasil.",
        "No contexto deste contrato de locação de bens móveis, aplicam-se os seguintes princípios:",
        "1. Princípio da liberdade contratual: As partes podem definir livremente as cláusulas \ncontratuais, desde que respeitem os limites da lei (Art. 421).",
        "2. Boa-fé objetiva: As partes devem agir com lealdade e confiança mútua na execução do \ncontrato (Art. 422).",
        "3. Direitos e deveres decorrentes do contrato: As obrigações do locador e locatário devem\n ser claramente definidas e respeitadas.",
    ]);

    // Seção 4 - Prazo da Locação
    addSection("4. Prazo da Locação", [
        "Este contrato de locação terá vigência conforme acordado entre as partes:",
        `Data de Início: ${verificarValor(dados.dataInicioLocacao)}.`,
        `Data de Término: ${verificarValor(dados.dataTerminoLocacao)}.`,
        `Renovação Automática: ${verificarValor(dados.possibilidadeRenovacao) === "S" ? "Sim" : "Não"}.`,
        `Condições para Renovação: ${verificarValor(dados.condicao)}.`,
    ]);

    // Seção 5 - Valor e Condições de Pagamento
    addSection("5. Valor e Condições de Pagamento", [
        "As condições financeiras do contrato são detalhadas abaixo:",
        `Valor Total: R$ ${verificarValor(dados.valorTotalLocacao)}.`,
        `Forma de Pagamento: ${verificarValor(dados.formaPagamento)}.`,
        `Data de Vencimento das Parcelas: ${verificarValor(dados.dataVencimentoParcela)}.`,
        `Multa por Atraso: ${verificarValor(dados.multaPorAtrasoPagamento)}%.`,
        `Juros por Atraso: ${verificarValor(dados.jurosporatraso)}%.`,
    ]);

    // Seção 6 - Garantias
    addSection("6. Garantias", [
        "As garantias para cumprimento do contrato são as seguintes:",
        verificarValor(dados.garantia) === "S"
            ? `Garantia: ${verificarValor(dados.qualgarantidor) === "fi" ? "Fiador: " + verificarValor(dados.nomeFiador) + ", CPF: " + verificarValor(dados.cpfFiador) : verificarValor(dados.qualgarantidor) === "caudep" ? "Caução em Dinheiro: R$ " + verificarValor(dados.valorTitCaucao) : verificarValor(dados.qualgarantidor) === "caubem" ? "Bem Caução: " + verificarValor(dados.descBemCaucao) : verificarValor(dados.qualgarantidor) === "segfianca" ? "Seguro Fiança: " + verificarValor(dados.segFianca) : "Título de Crédito: " + verificarValor(dados.descCredUtili)}.`
            : "Nenhuma garantia foi exigida.",
    ]);

    // Seção 7 - Obrigações do Locador
    addSection("7. Obrigações do Locador", [
        `Entrega do Equipamento: ${verificarValor(dados.entregaEquipLocador)}.`,
        `Garantia de Manutenção: ${verificarValor(dados.garantiaManutencao)}.`,
        `Fornecimento de Suporte Técnico: ${verificarValor(dados.forneceraSuporte)}.`,
        `Condições de Fornecimento: ${verificarValor(dados.quaisCondicoes)}.`,
    ]);

    // Seção 8 - Obrigações do Locatário
    addSection("8. Obrigações do Locatário", [
        `Compromisso de Uso: ${verificarValor(dados.compromeUso)}.`,
        `Responsabilidade por Danos: ${verificarValor(dados.danosUso)}.`,
        `Restrições de Local: ${verificarValor(dados.restricoesLocal)}.`,
        `Custos Adicionais: ${verificarValor(dados.arcarCustos)}.`,
    ]);

    // Seção 9 - Devolução do Equipamento
    addSection("9. Devolução do Equipamento", [
        `Local de Devolução: ${verificarValor(dados.local)}.`,
        `Condições de Devolução: ${verificarValor(dados.condicoesDevolucao)}.`,
        `Procedimento de Inspeção: ${verificarValor(dados.procedimentoInspec)}.`,
        `Penalidades por Danos: ${verificarValor(dados.penalidades)}.`,
    ]);

    // Seção 10 - Rescisão do Contrato
    addSection("10. Rescisão do Contrato", [
        `Condições de Rescisão Antecipada: ${verificarValor(dados.condicoesRescisao)}.`,
        `Multas Aplicáveis: ${verificarValor(dados.multasRescisao)}.`,
        `Prazo de Notificação Prévia: ${verificarValor(dados.prazoNotificacaoRescisao)}.`,
    ]);

    // Seção 11 - Disposições Gerais
    addSection("11. Disposições Gerais", [
        `Foro Eleito: ${verificarValor(dados.foroResolucaoConflitos)}.`,
        `Testemunhas Necessárias: ${verificarValor(dados.testemunhasNecessarias)}.`,
        verificarValor(dados.testemunhasNecessarias) === "Sim"
            ? `Testemunhas: Nome 1: ${verificarValor(dados.nomeTest1)}, CPF: ${verificarValor(dados.cpfTest1)}; Nome 2: ${verificarValor(dados.nomeTest2)}, CPF: ${verificarValor(dados.cpfTest2)}.`
            : "Sem necessidade de testemunhas.",
        `Registro em Cartório: ${verificarValor(dados.registroCartorio)}.`,
    ]);

    if (posY + 40 >= 280) {
        doc.addPage();
        posY = 20;
    }

    posY += 20; // Espaço antes da área de assinatura

    // Espaço para assinatura do Locador
    doc.setFontSize(10);
    doc.text("__________________________", 60, posY);
    doc.text("Assinatura do Locador", 60, posY + 5);

    // Espaço para assinatura do Locatário
    doc.text("__________________________", 140, posY);
    doc.text("Assinatura do Locatário", 140, posY + 5);

    posY += 30; // Espaço para testemunhas, se existirem

    // Espaços para testemunhas, caso necessário
    if (verificarValor(dados.testemunhasNecessarias) === "Sim") {
        // Testemunha 1
        doc.text("__________________________", 60, posY);
        doc.text(`Testemunha 1: ${verificarValor(dados.nomeTest1)}`, 60, posY + 5);
        doc.text(`CPF: ${verificarValor(dados.cpfTest1)}`, 60, posY + 10);

        // Testemunha 2
        doc.text("__________________________", 140, posY);
        doc.text(`Testemunha 2: ${verificarValor(dados.nomeTest2)}`, 140, posY + 5);
        doc.text(`CPF: ${verificarValor(dados.cpfTest2)}`, 140, posY + 10);
    }


    // Salvar o PDF
    doc.save(`contrato_hospedagem_${dados.nomeLocador || dados.nomelocatario}.pdf`);
};