import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function gerarContratoLocacaoEquipamentoPDF(dados: any) {
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
        doc.text(title, 105, posY, { align: "center" }); // Centralizado
        posY += 10;
        doc.setFontSize(10);
        content.forEach((line: any) => {
            if (posY + 7 >= 280) {
                doc.addPage();
                posY = 20;
            }
            doc.text(line, 105, posY, { align: "center" }); // Centralizado
            posY += 7;
        });
    };

    // Cabeçalho
    doc.setFontSize(14);
    doc.text("CONTRATO DE LOCAÇÃO DE EQUIPAMENTOS", 105, posY, { align: "center" });
    posY += 15;

    // Seções do contrato com artigos do Código Civil
    addSection("1. Identificação das Partes", [
        "Conforme o Código Civil Brasileiro (Art. 104 e Art. 566):",
        "- As partes devem ser plenamente capazes e identificadas de forma clara.",
        "Locador:",
        `Tipo: ${verificarValor(dados.locador) === "pf" ? "Pessoa Física" : "Pessoa Jurídica"}`,
        verificarValor(dados.locador) === "pf"
            ? `Nome: ${verificarValor(dados.nomeLocador)}, CPF: ${verificarValor(dados.CPFLocador)}`
            : `Razão Social: ${verificarValor(dados.razaoSocial)}, CNPJ: ${verificarValor(dados.cnpjlocador)}`,
        `Endereço: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.enderecoLocador) : verificarValor(dados.enderecoCNPJ)}`,
        `Telefone: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.telefoneLocador) : verificarValor(dados.telefoneCNPJ)}`,
        `E-mail: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.emailLocador) : verificarValor(dados.emailCNPJ)}`,
        verificarValor(dados.locador) === "pj"
            ? `Representante Legal: ${verificarValor(dados.nomeRepresentanteCNPJ)}, CPF: ${verificarValor(dados.CPFRepresentanteCNPJ)}`
            : "",
        "",
        "Locatário:",
        `Tipo: ${verificarValor(dados.locatario) === "pf" ? "Pessoa Física" : "Pessoa Jurídica"}`,
        verificarValor(dados.locatario) === "pf"
            ? `Nome: ${verificarValor(dados.nomelocatario)}, CPF: ${verificarValor(dados.CPFlocatario)}`
            : `Razão Social: ${verificarValor(dados.razaoSociallocatario)}, CNPJ: ${verificarValor(dados.cnpj)}`,
        `Endereço: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.enderecolocatario) : verificarValor(dados.enderecolocatarioCNPJ)}`,
        `Telefone: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.telefonelocatario) : verificarValor(dados.telefonelocatarioCNPJ)}`,
        `E-mail: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.emaillocatario) : verificarValor(dados.emaillocatarioCNPJ)}`,
        verificarValor(dados.locatario) === "pj"
            ? `Representante Legal: ${verificarValor(dados.nomeRepresentantelocatarioCNPJ)}, CPF: ${verificarValor(dados.CPFRepresentantelocatarioCNPJ)}`
            : "",
    ]);

    addSection("2. Descrição do Equipamento", [
        "Conforme o Código Civil Brasileiro (Art. 566):",
        "- O locador é obrigado a entregar o equipamento em bom estado de uso.",
        `Tipo de Equipamento: ${verificarValor(dados.tipodeequipamento)}`,
        `Marca e Modelo: ${verificarValor(dados.marcaemodelo)}`,
        `Número de Série: ${verificarValor(dados.numerodeserie)}`,
        `Estado de Conservação: ${verificarValor(dados.estadoconservacao)}`,
        `Acessórios e Componentes: ${verificarValor(dados.acessorioscomponentes)}`,
    ]);

    addSection("3. Prazo da Locação", [
        "Conforme o Código Civil Brasileiro (Art. 565 e Art. 578):",
        "- A locação deve ter prazo determinado ou indeterminado conforme as partes acordarem.",
        `Data de Início: ${verificarValor(dados.dataInicioLocacao)}`,
        `Data de Término: ${verificarValor(dados.dataTerminoLocacao)}`,
        `Renovação: ${verificarValor(dados.possibilidadeRenovacao) === "S" ? "Sim" : "Não"}`,
        `Condições: ${verificarValor(dados.condicao)}`,
    ]);

    addSection("4. Valor e Condições de Pagamento", [
        "Conforme o Código Civil Brasileiro (Art. 567 e Art. 578):",
        "- O valor do aluguel e a forma de pagamento devem ser especificados claramente.",
        `Valor Total: R$ ${verificarValor(dados.valorTotalLocacao)}`,
        `Forma de Pagamento: ${verificarValor(dados.formaPagamento)}`,
        `Data de Vencimento: ${verificarValor(dados.dataVencimentoParcela)}`,
        `Multa por Atraso: ${verificarValor(dados.multaPorAtrasoPagamento)}%`,
        `Juros por Atraso: ${verificarValor(dados.jurosporatraso)}% ao mês`,
    ]);

    addSection("5. Garantias", [
        "Conforme o Código Civil Brasileiro (Art. 578 e Art. 585):",
        "- As garantias contratuais devem ser claramente definidas e respeitadas.",
        `Garantia Exigida: ${verificarValor(dados.garantia) === "S" ? "Sim" : "Não"}`,
        `Tipo de Garantia: ${verificarValor(dados.qualgarantidor) === "fi"
            ? `Fiador: ${verificarValor(dados.nomeFiador)}, CPF: ${verificarValor(dados.cpfFiador)}`
            : verificarValor(dados.qualgarantidor) === "caudep"
                ? `Caução em Dinheiro: R$ ${verificarValor(dados.valorTitCaucao)}`
                : verificarValor(dados.qualgarantidor) === "caubem"
                    ? `Caução em Bem: ${verificarValor(dados.descBemCaucao)}`
                    : verificarValor(dados.qualgarantidor) === "ti"
                        ? `Título de Crédito: ${verificarValor(dados.descCredUtili)}`
                        : `Seguro Fiança: ${verificarValor(dados.segFianca)}`
        }`,
    ]);

    addSection("6. Obrigações do Locador", [
        "Conforme o Código Civil Brasileiro (Art. 566):",
        "- O locador é obrigado a entregar o equipamento em estado de servir ao uso a que se destina.",
        `Entrega em Perfeito Estado: ${verificarValor(dados.entregaEquipLocador)}`,
        `Garantia de Manutenção: ${verificarValor(dados.garantiaManutencao)}`,
        `Fornecimento de Suporte: ${verificarValor(dados.forneceraSuporte)}`,
        `Condições Específicas: ${verificarValor(dados.quaisCondicoes)}`,
    ]);

    addSection("7. Obrigações do Locatário", [
        "Conforme o Código Civil Brasileiro (Art. 567):",
        "- O locatário deve usar o equipamento conforme o destino pactuado e responsabilizar-se por danos.",
        `Uso Adequado: ${verificarValor(dados.compromeUso)}`,
        `Responsabilidade por Danos: ${verificarValor(dados.danosUso)}`,
        `Restrições de Uso: ${verificarValor(dados.restricoesLocal)}`,
        `Custos de Manutenção: ${verificarValor(dados.arcarCustos)}`,
    ]);

    addSection("8. Devolução do Equipamento", [
        "Conforme o Código Civil Brasileiro (Art. 569):",
        "- O locatário deve devolver o equipamento ao final do contrato em condições adequadas.",
        `Local de Devolução: ${verificarValor(dados.local)}`,
        `Condições para Devolução: ${verificarValor(dados.condicoesDevolucao)}`,
        `Penalidades em Caso de Avarias: ${verificarValor(dados.penalidades)}`,
    ]);

    addSection("9. Rescisão do Contrato", [
        "Conforme o Código Civil Brasileiro (Art. 473):",
        "- A rescisão contratual pode ocorrer por descumprimento das obrigações ou acordo mútuo.",
        `Condições: ${verificarValor(dados.condicoesRescisao)}`,
        `Multas: ${verificarValor(dados.multasRescisao)}`,
        `Prazo de Notificação: ${verificarValor(dados.prazoNotificacaoRescisao)} dias`,
    ]);

    addSection("10. Disposições Gerais", [
        "Conforme o Código Civil Brasileiro (Art. 421 e Art. 422):",
        "- O contrato deve respeitar a função social e ser executado com boa-fé e probidade.",
        `Foro: ${verificarValor(dados.foroResolucaoConflitos)}`,
        `Necessidade de Testemunhas: ${verificarValor(dados.testemunhasNecessarias)}`,
        `Registro em Cartório: ${verificarValor(dados.registroCartorio)}`,
    ]);

    addSection("11. Base Legal do Contrato", [
        "Conforme previsto no Código Civil Brasileiro:",
        "Art. 421: Liberdade contratual nos limites da função social do contrato.",
        "Art. 422: Boa-fé e probidade na conclusão e execução do contrato.",
        "Art. 565: O locador cede o uso de coisa não fungível mediante retribuição.",
        "Art. 566: Obrigação do locador em entregar a coisa em estado de servir ao uso.",
        "Art. 567: Responsabilidade do locatário por usar a coisa adequadamente.",
    ]);


    // Assinaturas
    posY += 20;
    doc.text("__________________________", 60, posY);
    doc.text("Assinatura do Locador", 60, posY + 5);

    doc.text("__________________________", 140, posY);
    doc.text("Assinatura do Locatário", 140, posY + 5);

    if (verificarValor(dados.testemunhasNecessarias) === "Sim") {
        posY += 20;
        doc.text("__________________________", 60, posY);
        doc.text(`Testemunha 1: ${verificarValor(dados.nomeTest1)}`, 60, posY + 5);
        doc.text(`CPF: (${verificarValor(dados.cpfTest1)}`, 60, posY + 10);

        doc.text("__________________________", 140, posY);
        doc.text(`Testemunha 2: ${verificarValor(dados.nomeTest2)}`, 140, posY + 5);
        doc.text(`CPF: ${verificarValor(dados.cpfTest2)}`, 140, posY + 10);
    }

    doc.save(`contrato_hospedagem_${dados.nomeLocador || dados.nomelocatario}.pdf`);

}

