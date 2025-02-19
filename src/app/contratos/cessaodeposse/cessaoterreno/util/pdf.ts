import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function geradorPosseTerrenoPago(dados: any) {
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

    // Título do Contrato
    doc.setFontSize(14);
    doc.text("CONTRATO DE CESSÃO DE POSSE DE TERRENO", 105, posY, { align: "center" });
    posY += 15;

    // Seção 1: Identificação das Partes
    addSection("1. Identificação das Partes", [
        "Nos termos do artigo 104 do Código Civil, para validade do negócio jurídico, exige-se agente capaz, objeto lícito e forma prescrita ou não defesa em lei.",
        `Cedente: ${verificarValor(dados.Cedente) === 'pj' ? verificarValor(dados.razaoSocial) : verificarValor(dados.nomeCedente)}`,
        `CPF/CNPJ: ${verificarValor(dados.Cedente) === 'pj' ? verificarValor(dados.cnpj) : verificarValor(dados.CPFCedente)}`,
        `Endereço: ${verificarValor(dados.Cedente) === 'pj' ? verificarValor(dados.enderecoCNPJ) : verificarValor(dados.enderecoCedente)}`,
        `Telefone: ${verificarValor(dados.Cedente) === 'pj' ? verificarValor(dados.telefoneCNPJ) : verificarValor(dados.telefoneCedente)}`,
        `Email: ${verificarValor(dados.Cedente) === 'pj' ? verificarValor(dados.emailCNPJ) : verificarValor(dados.emailCedente)}`,
        `Estado Civil: ${verificarValor(dados.Cedente) === 'pj' ? 'Não Aplicável' : verificarValor(dados.estadoCivil)}`,
        `Representante (PJ): ${verificarValor(dados.Cedente) === 'pj' ? verificarValor(dados.nomeRepresentanteCNPJ) : 'Não Aplicável'}`,
        `CPF Representante (PJ): ${verificarValor(dados.Cedente) === 'pj' ? verificarValor(dados.CPFRepresentanteCNPJ) : 'Não Aplicável'}`,
        `Cessionário: ${verificarValor(dados.Cessionario) === 'pj' ? verificarValor(dados.razaoSocialCessionario) : verificarValor(dados.nomeCessionario)}`,
        `CPF/CNPJ Cessionário: ${verificarValor(dados.Cessionario) === 'pj' ? verificarValor(dados.cnpjCessionario) : verificarValor(dados.CPFCessionario)}`,
        `Endereço Cessionário: ${verificarValor(dados.Cessionario) === 'pj' ? verificarValor(dados.enderecoCessionarioCNPJ) : verificarValor(dados.enderecoCessionario)}`,
        `Telefone Cessionário: ${verificarValor(dados.Cessionario) === 'pj' ? verificarValor(dados.telefoneCessionarioCNPJ) : verificarValor(dados.telefoneCessionario)}`,
        `Email Cessionário: ${verificarValor(dados.Cessionario) === 'pj' ? verificarValor(dados.emailCessionarioCNPJ) : verificarValor(dados.emailCessionario)}`,
        `Estado Civil Cessionário: ${verificarValor(dados.Cessionario) === 'pj' ? 'Não Aplicável' : verificarValor(dados.estadoCivilCessionario)}`,
        `Representante Cessionário (PJ): ${verificarValor(dados.Cessionario) === 'pj' ? verificarValor(dados.nomeRepresentantelCessionarioCNPJ) : 'Não Aplicável'}`,
        `CPF Representante Cessionário (PJ): ${verificarValor(dados.Cessionario) === 'pj' ? verificarValor(dados.CPFRepresentanteCessionarioCNPJ) : 'Não Aplicável'}`,
    ]);

    // Seção 2: Do Objeto
    addSection("2. Do Objeto", [
        "O presente contrato tem como objeto a cessão da posse do terreno, conforme estabelecido no artigo 1.196 do Código Civil, onde se define posse como o exercício de fato de algum dos poderes inerentes à propriedade.",
        `O presente contrato tem como objeto a cessão da posse do terreno localizado em: ${verificarValor(dados.endereco)}`,
        `Dimensões do terreno (metros quadrados): ${verificarValor(dados.dimensoes)}`,
        `Confrontantes e características físicas pertinentes: ${verificarValor(dados.confrotantesCaracteristicas)}`,
        `Título da posse (se houver): ${verificarValor(dados.titulodaposse)}`,
        `Situação legal do imóvel: ${verificarValor(dados.situacaoLegal)}`,
    ]);

    // Seção 3: Da Natureza da Cessão
    addSection("3. Da Natureza da Cessão", [
        "Nos termos do artigo 1.225 do Código Civil, a posse é um direito real passível de cessão, desde que não contrarie norma expressa.",
        "O CEDENTE cede ao CESSIONÁRIO a posse do terreno descrito na Cláusula 1ª, sem transferência de propriedade, permanecendo o CEDENTE como titular do direito de propriedade sobre o imóvel.",
    ]);

    // Seção 4: Das Condições da Cessão
    addSection("4. Das Condições da Cessão", [
        "A cessão da posse deve observar os princípios gerais dos contratos, conforme artigo 421 do Código Civil, respeitando a função social do contrato.",

        `Data de início da posse: ${verificarValor(dados.dataInicio)}`,
        `Prazo da cessão: ${verificarValor(dados.prazoCessao)}`,
        `A cessão envolve contrapartida financeira? ${verificarValor(dados.cessaoContrapartida) === 'S' ? 'Sim' : 'Não'}`,
        `Caso sim, especificar o valor: R$ ${verificarValor(dados.especificarValor)}`,
        `Condições de pagamento: ${verificarValor(dados.formaPagamento)}`,
        `Quantas parcelas: ${verificarValor(dados.quantasParcelas)}`,
        `Data de vencimento da parcela: ${verificarValor(dados.dataVencimentoParcela)}`,
        `Juros por atraso: ${verificarValor(dados.jurosporatraso)}`,
        `Conta bancária para recebimento: ${verificarValor(dados.contaBancariaRecebimento)}`,
    ]);

    // Seção 5: Dos Direitos do Cessionário
    addSection("5. Dos Direitos do Cessionário", [
        "O CESSIONÁRIO poderá exercer a posse do imóvel nos termos do artigo 1.210 do Código Civil, sendo-lhe permitido defender sua posse por meio dos interditos possessórios.",
        `O CESSIONÁRIO terá direito a utilizar o terreno para os seguintes fins: ${verificarValor(dados.direitoUtilizacao)}`,
        `O CESSIONÁRIO poderá realizar benfeitorias no terreno? ${verificarValor(dados.benfeitoriasCessionario) === 'S' ? 'Sim' : 'Não'}`,
        `Caso sim, especificar quais tipos de benfeitorias são permitidas: ${verificarValor(dados.benfeitoriasPermitidas)}`,
        `O CESSIONÁRIO poderá transferir a posse para terceiros? ${verificarValor(dados.cessionarioTransfere) === 'S' ? 'Sim' : 'Não'}`,
        `Caso sim, com quais condições? ${verificarValor(dados.quaisCondicoes)}`,
    ]);

    // Seção 6: Das Responsabilidades e Obrigações
    addSection("6. Das Responsabilidades e Obrigações", [
        "O CESSIONÁRIO assume a responsabilidade pelo uso e conservação do terreno, conforme artigo 1.228 do Código Civil, respeitando as normas ambientais e urbanísticas aplicáveis.",
        "O CESSIONÁRIO assume a responsabilidade pelo uso e conservação do terreno.",
        "O CESSIONÁRIO será responsável pelo pagamento de eventuais despesas relacionadas ao terreno, incluindo impostos, taxas e demais encargos.",
        `O CESSIONÁRIO poderá realizar alterações estruturais? ${verificarValor(dados.alteracoesEstruturais) === 'S' ? 'Sim' : 'Não'}`,
        `Caso sim, especificar quais tipos de alterações são permitidas: ${verificarValor(dados.tiposAlteracoes)}`,
    ]);

    // Seção 7: Da Rescisão
    addSection("7. Da Rescisão", [
        "O contrato poderá ser rescindido por descumprimento de cláusulas contratuais, conforme artigo 474 do Código Civil, que trata da resolução dos contratos bilaterais em caso de inadimplência.",

        "O presente contrato poderá ser rescindido nas seguintes hipóteses:",
        "Pelo descumprimento de quaisquer cláusulas;",
        "Por comum acordo entre as partes;",
        `Pela necessidade do CEDENTE em retomar a posse do terreno, com notificação prévia de ${verificarValor(dados.cedentePreviaDias)} dias.`,
        `Em caso de rescisão, o CESSIONÁRIO deverá desocupar o terreno no prazo máximo de ${verificarValor(dados.cessionarioPreviaDias)} dias.`,
    ]);

    // Seção 8: Das Multas e Penalidades
    addSection("8. Das Multas e Penalidades", [
        "O descumprimento de cláusulas contratuais poderá gerar multas, conforme artigo 408 do Código Civil, que dispõe sobre a cláusula penal em caso de inadimplência.",

        `Caso o CESSIONÁRIO descumpra qualquer cláusula do presente contrato, ficará sujeito a uma multa no valor de R$ ${verificarValor(dados.cessionarioDescumpre)}.`,
        `Em caso de inadimplência nos pagamentos acordados, o CESSIONÁRIO terá um prazo de ${verificarValor(dados.prazoInadimplencia)} dias para regularização, sob pena de rescisão automática do contrato.`,
        "Quaisquer danos causados ao terreno pelo CESSIONÁRIO deverão ser reparados às suas próprias custas.",
    ]);

    // Seção 9: Da Jurisdição
    addSection("9. Da Jurisdição", [
        `Fica eleito o foro da Comarca de ${verificarValor(dados.foroResolucaoConflitos)} para dirimir quaisquer dúvidas ou controvérsias oriundas do presente contrato.`,
    ]);

    // Seção 10: Do Usucapião
    addSection("10. Do Usucapião", [
        "O CESSIONÁRIO declara estar ciente de que a posse do terreno não gera direito automático à propriedade por usucapião, conforme artigo 1.238 e seguintes do Código Civil.",
        "O CESSIONÁRIO declara estar ciente de que a posse do terreno objeto deste contrato não gera, por si só, direito à aquisição da propriedade por usucapião, salvo nos casos previstos na legislação vigente.",
        "Caso o CESSIONÁRIO preencha os requisitos legais para requerer usucapião, deverá comunicar formalmente ao CEDENTE.",
    ]);

    // Seção 11: Disposições Gerais
    addSection("11. Disposições Gerais", [
        "Nos termos do artigo 219 do Código Civil, as partes declaram que este contrato reflete integralmente sua vontade, obrigando-se a cumpri-lo de boa-fé.",
        `Testemunhas necessárias? ${verificarValor(dados.testemunhasNecessarias) === 'S' ? 'Sim' : 'Não'}`,
        `Nome da Testemunha 1: ${verificarValor(dados.nomeTest1)}`,
        `CPF da Testemunha 1: ${verificarValor(dados.cpfTest1)}`,
        `Nome da Testemunha 2: ${verificarValor(dados.nomeTest2)}`,
        `CPF da Testemunha 2: ${verificarValor(dados.cpfTest2)}`,
        `Local de assinatura: ${verificarValor(dados.localAssinatura)}`,
        `Data de assinatura: ${verificarValor(dados.dataAssinatura)}`,
        `Registro em cartório? ${verificarValor(dados.registroCartorio) === 'S' ? 'Sim' : 'Não'}`,
    ]);

    // Finalização do documento
    // Espaço para assinatura do vendedor
    checkPageBreak(30);
    doc.text("__________________________________________", marginX, posY);
    posY += 10;
    doc.text("Assinatura do Cedente", marginX, posY);
    posY += 15;

    // Espaço para assinatura do comprador
    checkPageBreak(10);
    doc.text("__________________________________________", marginX, posY);
    posY += 10;
    doc.text("Assinatura do Cessionário", marginX, posY);
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


    doc.save(`contrato_cessaoterreno_${verificarValor(dados.Cedente) === 'pf' ? verificarValor(dados.nomeCedente) : verificarValor(dados.razaoSocial)}.pdf`);
};