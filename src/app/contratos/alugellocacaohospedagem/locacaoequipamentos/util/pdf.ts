import jsPDF from "jspdf";

export default function gerarContratoLocacaoEquipamentoPDF(dados: any) {
    const doc = new jsPDF();

    // Configuração inicial de fonte e margens
    const marginX = 10;
    let posY = 20;

    // Função auxiliar para adicionar seções e ajustar a posição Y
    const addSection = (title: string, content: string[]) => {
        if (posY + 10 >= 280) {
            doc.addPage();
            posY = 20;
        }
        doc.setFontSize(12);
        doc.text(title, 105, posY, { align: "center" });
        posY += 10;
        doc.setFontSize(10);
        content.forEach((line: string) => {
            if (posY + 7 >= 280) {
                doc.addPage();
                posY = 20;
            }
            doc.text(line, marginX, posY);
            posY += 7;
        });
    };

    // Página 1 - Cabeçalho
    doc.setFontSize(14);
    doc.text("CONTRATO DE LOCAÇÃO DE EQUIPAMENTOS", 105, posY, { align: "center" });
    posY += 15;

    // Seções do contrato
    addSection("1. Identificação das Partes", [
        "Locador:",
        `Tipo: ${dados.locador === "pf" ? "Pessoa Física" : "Pessoa Jurídica"}`,
        dados.locador === "pf"
            ? `Nome: ${dados.nomeLocador}, CPF: ${dados.CPFLocador}`
            : `Razão Social: ${dados.razaoSocial}, CNPJ: ${dados.cpfLocador}`,
        `Endereço: ${dados.locador === "pf" ? dados.enderecoLocador : dados.enderecoCNPJ}`,
        `Telefone: ${dados.locador === "pf" ? dados.telefoneLocador : dados.telefoneCNPJ}`,
        `E-mail: ${dados.locador === "pf" ? dados.emailLocador : dados.emailCNPJ}`,
        dados.locador === "pj"
            ? `Representante Legal: ${dados.nomeRepresentanteCNPJ}, CPF: ${dados.CPFRepresentanteCNPJ}`
            : "",
        "",
        "Locatário:",
        `Tipo: ${dados.locatario === "pf" ? "Pessoa Física" : "Pessoa Jurídica"}`,
        dados.locatario === "pf"
            ? `Nome: ${dados.nomelocatario}, CPF: ${dados.CPFlocatario}`
            : `Razão Social: ${dados.razaoSociallocatario}, CNPJ: ${dados.cpflocatario}`,
        `Endereço: ${dados.locatario === "pf" ? dados.enderecolocatario : dados.enderecolocatarioCNPJ}`,
        `Telefone: ${dados.locatario === "pf" ? dados.telefonelocatario : dados.telefonelocatarioCNPJ}`,
        `E-mail: ${dados.locatario === "pf" ? dados.emaillocatario : dados.emaillocatarioCNPJ}`,
        dados.locatario === "pj"
            ? `Representante Legal: ${dados.nomeRepresentantelocatarioCNPJ}, CPF: ${dados.CPFRepresentantelocatarioCNPJ}`
            : "",
    ]);

    addSection("2. Descrição do Equipamento", [
        `Tipo de Equipamento: ${dados.tipodeequipamento}`,
        `Marca e Modelo: ${dados.marcaemodelo}`,
        `Número de Série: ${dados.numerodeserie}`,
        `Estado de Conservação: ${dados.estadoconservacao}`,
        `Acessórios e Componentes: ${dados.acessorioscomponentes}`,
    ]);

    addSection("3. Prazo da Locação", [
        `Data de Início: ${dados.dataInicioLocacao}`,
        `Data de Término: ${dados.dataTerminoLocacao}`,
        `Renovação: ${dados.possibilidadeRenovacao === "S" ? "Sim" : "Não"}`,
        `Condições: ${dados.condicao}`,
    ]);

    addSection("4. Valor e Condições de Pagamento", [
        `Valor Total: R$ ${dados.valorTotalLocacao}`,
        `Forma de Pagamento: ${dados.formaPagamento}`,
        `Data de Vencimento: ${dados.dataVencimentoParcela}`,
        `Multa por Atraso: ${dados.multaPorAtrasoPagamento}%`,
        `Juros por Atraso: ${dados.jurosporatraso}% ao mês`,
    ]);

    addSection("5. Garantias", [
        `Garantia Exigida: ${dados.garantia === "S" ? "Sim" : "Não"}`,
        `Tipo de Garantia: ${dados.qualgarantidor === "fi"
            ? `Fiador: ${dados.nomeFiador}, CPF: ${dados.cpfFiador}`
            : dados.qualgarantidor === "caudep"
                ? `Caução em Dinheiro: R$ ${dados.valorTitCaucao}`
                : dados.qualgarantidor === "caubem"
                    ? `Caução em Bem: ${dados.descBemCaucao}`
                    : dados.qualgarantidor === "ti"
                        ? `Título de Crédito: ${dados.descCredUtili}`
                        : `Seguro Fiança: ${dados.segFianca}`
        }`,
    ]);

    addSection("6. Obrigações do Locador", [
        `Entrega em Perfeito Estado: ${dados.entregaEquipLocador}`,
        `Garantia de Manutenção: ${dados.garantiaManutencao}`,
        `Fornecimento de Suporte: ${dados.forneceraSuporte}`,
        `Condições Específicas: ${dados.quaisCondicoes}`,
    ]);

    addSection("7. Obrigações do Locatário", [
        `Uso Adequado: ${dados.compromeUso}`,
        `Responsabilidade por Danos: ${dados.danosUso}`,
        `Restrições de Uso: ${dados.restricoesLocal}`,
        `Custos de Manutenção: ${dados.arcarCustos}`,
    ]);

    addSection("8. Devolução do Equipamento", [
        `Local de Devolução: ${dados.local}`,
        `Condições para Devolução: ${dados.condicoesDevolucao}`,
        `Penalidades em Caso de Avarias: ${dados.penalidades}`,
    ]);

    addSection("9. Rescisão do Contrato", [
        `Condições: ${dados.condicoesRescisao}`,
        `Multas: ${dados.multasRescisao}`,
        `Prazo de Notificação: ${dados.prazoNotificacaoRescisao} dias`,
    ]);

    addSection("10. Disposições Gerais", [
        `Foro: ${dados.foroResolucaoConflitos}`,
        `Necessidade de Testemunhas: ${dados.testemunhasNecessarias}`,
        `Registro em Cartório: ${dados.registroCartorio}`,
    ]);

    addSection("11. Base Legal do Contrato", [
        "Conforme previsto no Código Civil Brasileiro:",
        "Art. 421: Liberdade contratual nos limites da função social do contrato.",
        "Art. 422: Boa-fé e probidade na conclusão e execução do contrato.",
        "Art. 565: O locador cede o uso de coisa não fungível mediante retribuição.",
        "Art. 566: Obrigação do locador em entregar a coisa em estado de servir ao uso.",
        "Art. 567: Responsabilidade do locatário por usar a coisa adequadamente.",
    ]);

    // Área de assinaturas
    posY += 20;
    doc.text("__________________________", 60, posY);
    doc.text("Assinatura do Locador", 60, posY + 5);

    doc.text("__________________________", 140, posY);
    doc.text("Assinatura do Locatário", 140, posY + 5);

    if (dados.testemunhasNecessarias === "Sim") {
        posY += 20;
        doc.text("__________________________", 60, posY);
        doc.text(`Testemunha 1: ${dados.nomeTest1}`, 60, posY + 5);
        doc.text(`CPF: ${dados.cpfTest1}`, 60, posY + 10);

        doc.text("__________________________", 140, posY);
        doc.text(`Testemunha 2: ${dados.nomeTest2}`, 140, posY + 5);
        doc.text(`CPF: ${dados.cpfTest2}`, 140, posY + 10);
    }
    // Salvar o PDF
    doc.save(`contrato_hospedagem_${dados.nomeLocador || dados.nomelocatario}.pdf`);

}