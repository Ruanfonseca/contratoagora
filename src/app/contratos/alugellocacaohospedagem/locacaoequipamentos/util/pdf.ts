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
            doc.text(line, marginX, posY);
            posY += 7;
        });
    };

    // Cabeçalho
    doc.setFontSize(14);
    doc.text("CONTRATO DE LOCAÇÃO DE EQUIPAMENTOS", 105, posY, { align: "center" });
    posY += 15;

    // Seções do contrato com títulos formatados como cláusulas contratuais
    addSection("CLÁUSULA PRIMEIRA – DA IDENTIFICAÇÃO DAS PARTES", [
        "Conforme o Código Civil Brasileiro (Art. 104 e Art. 566):",
        "- As partes devem ser plenamente capazes e identificadas de forma clara.",
        `Locador: ${verificarValor(dados.locador) === "pf" ? "Pessoa Física" : "Pessoa Jurídica"}`,
        verificarValor(dados.locador) === "pf"
            ? `Nome: ${verificarValor(dados.nomeLocador)}, CPF: ${verificarValor(dados.CPFLocador)}`
            : `Razão Social: ${verificarValor(dados.razaoSocial)}, CNPJ: ${verificarValor(dados.cnpjlocador)}`,
        `Endereço: ${verificarValor(dados.enderecoLocador)}`,
        `Telefone: ${verificarValor(dados.telefoneLocador)}`,
        `E-mail: ${verificarValor(dados.emailLocador)}`,
        "",
        `Locatário: ${verificarValor(dados.locatario) === "pf" ? "Pessoa Física" : "Pessoa Jurídica"}`,
        verificarValor(dados.locatario) === "pf"
            ? `Nome: ${verificarValor(dados.nomelocatario)}, CPF: ${verificarValor(dados.CPFlocatario)}`
            : `Razão Social: ${verificarValor(dados.razaoSociallocatario)}, CNPJ: ${verificarValor(dados.cnpj)}`,
        `Endereço: ${verificarValor(dados.enderecolocatario)}`,
        `Telefone: ${verificarValor(dados.telefonelocatario)}`,
        `E-mail: ${verificarValor(dados.emaillocatario)}`,
    ]);

    addSection("CLÁUSULA SEGUNDA – DA DESCRIÇÃO DO EQUIPAMENTO", [
        "Conforme o Código Civil Brasileiro (Art. 566):",
        "- O locador é obrigado a entregar o equipamento em bom estado de uso.",
        `Tipo de Equipamento: ${verificarValor(dados.tipodeequipamento)}`,
        `Marca e Modelo: ${verificarValor(dados.marcaemodelo)}`,
        `Número de Série: ${verificarValor(dados.numerodeserie)}`,
        `Estado de Conservação: ${verificarValor(dados.estadoconservacao)}`,
        `Acessórios e Componentes: ${verificarValor(dados.acessorioscomponentes)}`,
    ]);

    addSection("CLÁUSULA TERCEIRA – DO PRAZO DA LOCAÇÃO", [
        "Conforme o Código Civil Brasileiro (Art. 565 e Art. 578):",
        "- A locação deve ter prazo determinado ou indeterminado conforme as partes acordarem.",
        `Data de Início: ${verificarValor(dados.dataInicioLocacao)}`,
        `Data de Término: ${verificarValor(dados.dataTerminoLocacao)}`,
        `Renovação: ${verificarValor(dados.possibilidadeRenovacao) === "S" ? "Sim" : "Não"}`,
        `Condições: ${verificarValor(dados.condicao)}`,
    ]);

    addSection("CLÁUSULA QUARTA – DO VALOR E CONDIÇÕES DE PAGAMENTO", [
        "Conforme o Código Civil Brasileiro (Art. 567 e Art. 578):",
        "- O valor do aluguel e a forma de pagamento devem ser especificados claramente.",
        `Valor Total: R$ ${verificarValor(dados.valorTotalLocacao)}`,
        `Forma de Pagamento: ${verificarValor(dados.formaPagamento)}`,
        `Data de Vencimento: ${verificarValor(dados.dataVencimentoParcela)}`,
        `Multa por Atraso: ${verificarValor(dados.multaPorAtrasoPagamento)}%`,
        `Juros por Atraso: ${verificarValor(dados.jurosporatraso)}% ao mês`,
    ]);

    addSection("CLÁUSULA QUINTA – DAS GARANTIAS", [
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

    addSection("CLÁUSULA SEXTA – DAS OBRIGAÇÕES DO LOCADOR", [
        "Conforme o Código Civil Brasileiro (Art. 566):",
        "- O locador é obrigado a entregar o equipamento em estado de servir ao uso a que se destina.",
        `Entrega em Perfeito Estado: ${verificarValor(dados.entregaEquipLocador)}`,
        `Garantia de Manutenção: ${verificarValor(dados.garantiaManutencao)}`,
        `Fornecimento de Suporte: ${verificarValor(dados.forneceraSuporte)}`,
    ]);

    addSection("CLÁUSULA SÉTIMA – DAS OBRIGAÇÕES DO LOCATÁRIO", [
        "Conforme o Código Civil Brasileiro (Art. 569):",
        "- O locatário é obrigado a usar o equipamento conforme o destino ajustado e a devolvê-lo no estado em que o recebeu, salvo deteriorações naturais.",
        `Uso Adequado: ${verificarValor(dados.usoAdequadoEquip)}`,
        `Responsabilidade por Danos: ${verificarValor(dados.responsabilidadeDanos)}`,
        `Devolução em Perfeito Estado: ${verificarValor(dados.devolucaoEquipLocatario)}`,
        `Reparo por Danos: ${verificarValor(dados.obrigacaoReparoDanos)}`,
    ]);

    addSection("CLÁUSULA OITAVA – DA RESCISÃO CONTRATUAL", [
        "Conforme o Código Civil Brasileiro (Art. 572 e Art. 573):",
        "- O contrato pode ser rescindido por qualquer das partes em caso de descumprimento das obrigações contratuais.",
        `Rescisão Antecipada: ${verificarValor(dados.rescisaoAntecipada)}`,
        `Multa Rescisória: R$ ${verificarValor(dados.multaRescisoria)}`,
        `Prazo para Aviso Prévio: ${verificarValor(dados.prazoAvisoPrevio)} dias`,
    ]);

    addSection("CLÁUSULA NONA – DAS DISPOSIÇÕES GERAIS", [
        "Conforme o Código Civil Brasileiro:",
        "- As disposições gerais devem respeitar os princípios contratuais de boa-fé e equidade.",
        `Alterações Contratuais: ${verificarValor(dados.alteracoesContratuais)}`,
        `Foro de Eleição: ${verificarValor(dados.foroEleito)}`,
        "Outros acordos entre as partes devem ser formalizados por escrito.",
    ]);

    // Assinaturas das testemunhas (se aplicável)
    if (verificarValor(dados.testemunhas) === "S") {
        posY += 20;
        doc.text("__________________________", 60, posY);
        doc.text("Assinatura da Testemunha 1", 60, posY + 5);
        doc.text(`Nome: ${verificarValor(dados.nomeTestemunha1)}, CPF: ${verificarValor(dados.cpfTestemunha1)}`, 60, posY + 15);

        posY += 30;
        doc.text("__________________________", 60, posY);
        doc.text("Assinatura da Testemunha 2", 60, posY + 5);
        doc.text(`Nome: ${verificarValor(dados.nomeTestemunha2)}, CPF: ${verificarValor(dados.cpfTestemunha2)}`, 60, posY + 15);
    }

    // Finalização do documento
    posY += 40;
    doc.setFontSize(10);
    doc.text("Este contrato é firmado em duas vias de igual teor e forma, que as partes assinam para que produza seus efeitos legais.", marginX, posY);


    doc.save(`contrato_hospedagem_${dados.nomeLocador || dados.nomelocatario}.pdf`);

}

