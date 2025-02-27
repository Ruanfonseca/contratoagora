import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function geradorManicurePago(dados: any) {
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
    doc.text("CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE MANICURE", 105, posY, { align: "center" });
    posY += 15;

    // 1. IDENTIFICAÇÃO DAS PARTES
    addSection("1. IDENTIFICAÇÃO DAS PARTES", [
        "Código Civil (CC): Art. 104 – Para a validade do negócio jurídico, é necessário agente capaz, objeto lícito e forma prescrita ou não defesa em lei.",
        "Art. 107 – A validade da declaração de vontade não dependerá de forma especial, salvo quando a lei expressamente exigir.\n",
        "Contratante:",
        `Nome/Razão Social: ${verificarValor(dados.contratante_nome)}`,
        `Estado Civil (se pessoa física): ${verificarValor(dados.contratante_estado_civil)}`,
        `Nacionalidade: ${verificarValor(dados.contratante_nacionalidade)}`,
        `Profissão: ${verificarValor(dados.contratante_profissao)}`,
        `Documento de Identificação (RG/CPF ou CNPJ): ${verificarValor(dados.contratante_documento)}`,
        `Endereço Completo: ${verificarValor(dados.contratante_endereco)}`,
        `Telefone/Contato: ${verificarValor(dados.contratante_telefone)}`,
        "",
        "Contratado (Manicure):",
        `Nome/Razão Social: ${verificarValor(dados.contratado_nome)}`,
        `Estado Civil (se pessoa física): ${verificarValor(dados.contratado_estado_civil)}`,
        `Nacionalidade: ${verificarValor(dados.contratado_nacionalidade)}`,
        `Profissão: Manicure`,
        `Documento de Identificação (RG/CPF ou CNPJ): ${verificarValor(dados.contratado_documento)}`,
        `Endereço Completo: ${verificarValor(dados.contratado_endereco)}`,
        `Telefone/Contato: ${verificarValor(dados.contratado_telefone)}`,
    ]);

    // 2. OBJETO DO CONTRATO
    addSection("2. OBJETO DO CONTRATO", [
        "Código Civil (CC): Art. 593 – Considera-se prestação de serviço o contrato em que uma das partes se obriga a realizar um serviço mediante retribuição.",
        "Art. 594 – Toda espécie de serviço ou trabalho lícito pode ser contratada.\n",
        "O presente contrato tem por objeto a prestação de serviços de manicure pelo(a) contratado(a) ao(à) contratante, incluindo, mas não se limitando a:",
        "Corte e limpeza das unhas;",
        "Esmaltação;",
        "Aplicação de unhas postiças;",
        "Decoração de unhas;",
        "Manutenção de alongamentos;",
        "Outros serviços acordados entre as partes.",
    ]);

    // 3. PRAZO DO CONTRATO
    addSection("3. PRAZO DO CONTRATO", [
        "Código Civil (CC):Art. 598 – O contrato de prestação de serviço não pode ultrapassar quatro anos, salvo disposição em contrário.",
        "Art. 599 – Se o contrato for por prazo determinado, extinguir-se-á com o término do período acordado.",
        "Art. 600 – Nos contratos por prazo indeterminado, qualquer das partes pode resilir o contrato, mediante aviso prévio.\n",
        "O presente contrato terá:",
        dados.prazo === 'determinado'
            ? `(X) Prazo determinado, com duração de ${verificarValor(dados.duracao)} meses, iniciando-se em ${verificarValor(dados.dataInicio)} e encerrando-se em ${verificarValor(dados.dataFinal)}.`
            : `(X) Prazo indeterminado, podendo ser rescindido por qualquer uma das partes mediante aviso prévio de ${verificarValor(dados.avisoPrevio)} dias.`,
    ]);

    // 4. REMUNERAÇÃO E FORMA DE PAGAMENTO
    addSection("4. REMUNERAÇÃO E FORMA DE PAGAMENTO", [
        "Código Civil (CC): Art. 596 – A retribuição pelo serviço prestado será ajustada pelas partes e, na falta de ajuste, regulada pelos usos do local.",
        "Art. 397 – O inadimplemento da obrigação pelo devedor sujeita-o à mora, cabendo-lhe pagar os encargos decorrentes do atraso.\n",
        `O pagamento será realizado com base em: (${dados.pagamentoRealizado === 'servicoRealizado' ? 'X' : '_'}) Serviço realizado (${dados.pagamentoRealizado === 'horaTrabalhada' ? 'X' : '_'}) Hora trabalhada (${dados.pagamentoRealizado === 'mesTrabalhado' ? 'X' : '_'}) Mês trabalhado.`,
        `O valor a ser pago pelos serviços será de R$ ${verificarValor(dados.valorPagoServico)}.`,
        `O pagamento será efetuado por (${dados.modalidade === 'dinheiro' ? 'X' : '_'}) Dinheiro (${dados.modalidade === 'pix' ? 'X' : '_'}) Pix (${dados.modalidade === 'cartao' ? 'X' : '_'}) Cartão (${dados.modalidade === 'transferBanc' ? 'X' : '_'}) Transferência bancária.`,
        `Em caso de atraso no pagamento, será aplicada multa de ${verificarValor(dados.multaAtraso)}% sobre o valor devido.`,
        `Caso haja necessidade de deslocamento do(a) contratado(a), poderá ser cobrada uma taxa adicional de R$ ${verificarValor(dados.taxaAdicional)}.`,
        `Cancelamentos realizados com menos de ${verificarValor(dados.horasAntecedencia)} horas de antecedência estarão sujeitos a uma taxa de cancelamento de R$ ${verificarValor(dados.taxaCancelamento)}.`,
    ]);

    // 5. RESPONSABILIDADES DAS PARTES
    addSection("5. RESPONSABILIDADES DAS PARTES", [
        "Código Civil (CC): Art. 422 – Os contratantes são obrigados a guardar, assim na conclusão do contrato como em sua execução, os princípios da probidade e boa-fé.",
        "Art. 927 – Aquele que, por ato ilícito, causar dano a outrem, fica obrigado a repará-lo.\n",
        "Do(a) contratado(a):",
        "Utilizar produtos de qualidade e manter os materiais devidamente higienizados.",
        "Cumprir os horários e datas estabelecidas para a prestação dos serviços.",
        `Informar previamente sobre eventuais reagendamentos ou impossibilidades de atendimento com antecedência de ${verificarValor(dados.horasReagendamento)} horas.`,
        "Garantir a esterilização adequada de materiais reutilizáveis.",
        "",
        "Do(a) contratante:",
        "Comparecer ao local e no horário agendado para a realização do serviço.",
        `Informar com antecedência de pelo menos ${verificarValor(dados.horasReagendamento)} horas caso deseje reagendar ou cancelar o serviço.`,
        "Arcar com os custos dos serviços conforme estipulado neste contrato.",
        "Zelar pelos cuidados recomendados após a prestação do serviço.",
    ]);

    // 6. CANCELAMENTO E MULTAS
    addSection("6. CANCELAMENTO E MULTAS", [
        "Código Civil (CC): Art. 408 – A cláusula penal estipulada no contrato serve para garantir o cumprimento da obrigação e pode ser exigida no caso de inadimplência.",
        "Art. 416 – Para exigir a multa, não se faz necessária a prova do prejuízo.\n",
        `Caso uma das partes deseje rescindir este contrato antes do prazo acordado, deverá comunicar a outra parte com antecedência de ${verificarValor(dados.dataAntecedenciaCance)} dias.`,
        `Em caso de descumprimento de qualquer cláusula, a parte infratora poderá ser penalizada com multa de R$ ${verificarValor(dados.multaCancelamento)}.`,
    ]);

    // 7. FORO E RESOLUÇÃO DE CONFLITOS
    addSection("7. FORO E RESOLUÇÃO DE CONFLITOS", [
        "Código Civil (CC): Art. 75, Inciso IV – Trata da representação judicial de pessoas físicas e jurídicas.",
        "Art. 112 – Quando houver cláusula de eleição de foro, prevalecerá o foro eleito, salvo nos casos legais.\n",
        `As partes elegem o foro da Comarca de ${verificarValor(dados.foroResolucaoConflitos)}, para dirimir quaisquer dúvidas ou controvérsias oriundas deste contrato.`,
    ]);

    // 8. DISPOSIÇÕES FINAIS
    addSection("8. DISPOSIÇÕES FINAIS", [
        "Constituição Federal (CF): Art. 5º, Inciso XXXVI – A lei não prejudicará o direito adquirido, o ato jurídico perfeito e a coisa julgada.",
        "Art. 170 – A ordem econômica tem por base a valorização do trabalho humano e a livre iniciativa.\n",
        `Este contrato passa a vigorar a partir da data de assinatura pelas partes: ${verificarValor(dados.dataAssinatura)}.`,
        "Qualquer alteração ou acréscimo ao presente contrato deverá ser feito por escrito e assinado por ambas as partes.",
        "O presente contrato obriga não apenas as partes contratantes, mas também seus herdeiros e sucessores.",
        "",
        "Local e Data: ____________________, _____ de ______________ de ______.",
        "",
        "Assinaturas:",
        "Contratante: __________________________________________",
        "Contratado(a): ________________________________________",
        "",
        dados.testemunhasNecessarias === 'S'
            ? `Testemunhas: 
               Nome: ${verificarValor(dados.nomeTest1)} CPF: ${verificarValor(dados.cpfTest1)}
               Nome: ${verificarValor(dados.nomeTest2)} CPF: ${verificarValor(dados.cpfTest2)}`
            : "Testemunhas: Não necessárias.",
    ]);


    doc.save(`contrato_Manicure_${verificarValor(dados.contratante_nome)}.pdf`);

};