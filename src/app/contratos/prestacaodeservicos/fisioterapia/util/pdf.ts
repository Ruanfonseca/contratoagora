import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function geradorFisioterapiaPdfPago(dados: any) {
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
    doc.text("CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE FISIOTERAPEUTA", 105, posY, { align: "center" });
    posY += 15;

    // Seção do Contratante
    addSection("Contratante", [
        "Art. 593: A prestação de serviço, que não estiver sujeita às leis trabalhistas ou a legislação especial, reger - se - á pelas disposições deste Capítulo.",
        "Art. 594: Toda espécie de serviço ou trabalho lícito, material ou imaterial, pode ser contratada mediante retribuição.",
        `Nome completo: ${verificarValor(dados.nomeContratante)}`,
        `Sexo: ${verificarValor(dados.sexoContratante)}`,
        `Estado civil: ${verificarValor(dados.estadoCivilContratante)}`,
        `Nacionalidade: ${verificarValor(dados.nacionalidadeContratante)}`,
        `Documento de identificação (RG ou CNH): ${verificarValor(dados.documentoContratante)}`,
        `Órgão expedidor: ${verificarValor(dados.orgaoContratante)}`,
        `CPF: ${verificarValor(dados.cpfContratante)}`,
        `Endereço completo: ${verificarValor(dados.enderecoContratante)}`
    ]);

    // Seção do Fisioterapeuta
    addSection("Fisioterapeuta", [
        `Nome completo: ${verificarValor(dados.nomeFisioterapeuta)}`,
        `Sexo: ${verificarValor(dados.sexoFisioterapeuta)}`,
        `Estado civil: ${verificarValor(dados.estadoCivilFisioterapeuta)}`,
        `Nacionalidade: ${verificarValor(dados.nacionalidadeFisioterapeuta)}`,
        `Documento de identificação (RG ou CNH): ${verificarValor(dados.documentoFisioterapeuta)}`,
        `Órgão expedidor: ${verificarValor(dados.orgaoFisioterapeuta)}`,
        `CPF: ${verificarValor(dados.cpfFisioterapeuta)}`,
        `Endereço completo: ${verificarValor(dados.enderecoFisioterapeuta)}`,
        `CREFITO: ${verificarValor(dados.crefito)}`
    ]);

    // Seção do Objeto
    addSection("1. DO OBJETO", [
        `O presente contrato tem por objeto a prestação de serviços de fisioterapia pelo profissional acima identificado ao contratante. Os serviços incluem, mas não se limitam a: ${verificarValor(dados.descricao)}.`
    ]);

    // Seção do Prazo
    addSection("2. DO PRAZO", [
        `A prestação dos serviços terá a seguinte duração:`,
        dados.prazo === 'determinado'
            ? `(X) Prazo determinado: ${verificarValor(dados.mesesoudias)}, iniciando em ${verificarValor(dados.dataInicio)} e finalizando em ${verificarValor(dados.dataFinal)}.`
            : `(X) Prazo indeterminado.`
    ]);

    // Seção do Local de Atendimento
    addSection("3. DO LOCAL DE ATENDIMENTO", [
        `Os atendimentos serão realizados no seguinte local: ${verificarValor(dados.localAtendimento)}.`
    ]);

    // Seção da Retribuição
    addSection("4. DA RETRIBUIÇÃO", [
        `(__) Será cobrada taxa inicial para avaliação: R$ ${verificarValor(dados.taxaAvaliacao)}.`,
        `O valor cobrado antecipadamente se destina a: ${verificarValor(dados.destinacaoValor)}.`,
        `A frequência do pagamento pelos serviços será:`,
        dados.frequencia === 'mensalmente'
            ? `(X) Mensalmente: R$ ${verificarValor(dados.valorMensal)}.`
            : `(X) Por sessão: R$ ${verificarValor(dados.valorSessao)}.`,
        `O pagamento deverá ser feito até o dia ${verificarValor(dados.diaPagamento)} de cada mês.`,
        `Caso haja atraso no pagamento, será cobrada multa de ${verificarValor(dados.porcentagemMulta)}% sobre o valor devido.`
    ]);

    // Seção do Atendimento
    addSection("5. DO ATENDIMENTO", [
        `A duração de cada atendimento será de ${verificarValor(dados.duracaoAtendimento)} minutos.`,
        `A frequência dos atendimentos será de ${verificarValor(dados.frequenciaAtentimento)} vezes por semana/mês.`,
        `Para cancelamento ou reagendamento de sessões, o contratante deverá avisar com pelo menos ${verificarValor(dados.horasAntecedencia)} horas de antecedência. Caso contrário, será cobrada uma taxa de ${verificarValor(dados.porcentoSessao)}% do valor da sessão.`
    ]);

    // Seção da Rescisão
    addSection("6. DA RESCISÃO", [
        `O contrato poderá ser rescindido por qualquer das partes mediante aviso prévio de ${verificarValor(dados.avisoPrevio)} dias.`,
        `Em caso de descumprimento das condições aqui estabelecidas, a parte infratora ficará sujeita a uma multa de R$ ${verificarValor(dados.multaDescumprimento)}.`
    ]);


    addSection("7.Das Disposições Legais", [
        `Este contrato está fundamentado nas normas da Constituição Federal e do Código Civil Brasileiro, garantindo direitos e deveres às partes envolvidas.

                8.1. Constituição Federal (CF/1988)
                Direito à Saúde

                Art. 196: "A saúde é direito de todos e dever do Estado, garantido mediante políticas sociais e econômicas que visem à redução do risco de doença e de outros agravos e ao acesso universal e igualitário às ações e serviços para sua promoção, proteção e recuperação."
                Liberdade Profissional

                Art. 5º, XIII: "É livre o exercício de qualquer trabalho, ofício ou profissão, atendidas as qualificações profissionais que a lei estabelecer."
                Direitos do Consumidor

                Art. 5º, XXXII: "O Estado promoverá, na forma da lei, a defesa do consumidor."
                Direito à Livre Iniciativa

                Art. 170, Parágrafo único: "É assegurado a todos o livre exercício de qualquer atividade econômica, independentemente de autorização de órgãos públicos, salvo nos casos previstos em lei."
                8.2. Código Civil Brasileiro (CC/2002)
                Contrato de Prestação de Serviços

                Art. 593: "A prestação de serviço, que não estiver sujeita às leis trabalhistas ou a legislação especial, reger-se-á pelas disposições deste Capítulo."
                Art. 594: "Toda espécie de serviço ou trabalho lícito, material ou imaterial, pode ser contratada mediante retribuição."
                Obrigação das Partes

                Art. 422: "Os contratantes são obrigados a guardar, assim na conclusão do contrato, como em sua execução, os princípios de probidade e boa-fé."
                Responsabilidade Civil

                Art. 186: "Aquele que, por ação ou omissão voluntária, negligência ou imprudência, violar direito e causar dano a outrem, ainda que exclusivamente moral, comete ato ilícito."
                Art. 927: "Aquele que, por ato ilícito, causar dano a outrem, fica obrigado a repará-lo."
                Rescisão Contratual

                Art. 473: "A resilição unilateral, nos casos em que a lei expressamente o permita, opera mediante denúncia notificada à outra parte."
                Art. 475: "A parte lesada pelo inadimplemento pode pedir a resolução do contrato, se não preferir exigir-lhe o cumprimento, cabendo-lhe, em qualquer dos casos, indenização por perdas e danos."
                Multas e Penalidades Contratuais

                Art. 408: "Incorre de pleno direito o devedor na cláusula penal, desde que inadimplente a obrigação."
                Art. 409: "A cláusula penal estipulada conjuntamente com a obrigação tem a função de garantir o seu cumprimento e, cumulativamente, pode ser exigida com o desempenho da obrigação principal, se assim for convencionado."`,

    ]);
    // Seção do Foro
    addSection("8. DO FORO", [
        `Fica eleito o foro da Comarca de ${verificarValor(dados.foroResolucaoConflitos)}, Estado de ${verificarValor(dados.estado)}, para dirimir quaisquer dúvidas ou conflitos oriundos deste contrato.`
    ]);

    // Seção de Assinaturas
    addSection("E, por estarem assim justos e contratados, assinam o presente instrumento em duas vias de igual teor e forma.", [
        `Data de assinatura: ${verificarValor(dados.dataAssinatura)}`,
        `Contratante:`,
        `Nome: ${verificarValor(dados.nomeContratante)}`,
        `Assinatura: ____________________________`,
        `Fisioterapeuta:`,
        `Nome: ${verificarValor(dados.nomeFisioterapeuta)}`,
        `Assinatura: ____________________________`
    ]);

    // Seção de Testemunhas (se necessário)
    if (dados.testemunhasNecessarias === 'S') {
        addSection("Testemunhas:", [
            `Nome: ${verificarValor(dados.nomeTest1)}`,
            `CPF: ${verificarValor(dados.cpfTest1)}`,
            `Assinatura: ____________________________`,
            `Nome: ${verificarValor(dados.nomeTest2)}`,
            `CPF: ${verificarValor(dados.cpfTest2)}`,
            `Assinatura: ____________________________`
        ]);
    }

    // Seção de Registro em Cartório (se necessário)
    if (dados.registroCartorioTest === 'S') {
        addSection("Registro em Cartório:", [
            `O presente contrato será registrado em cartório no local de ${verificarValor(dados.local)}.`
        ]);
    }
    doc.save(`contrato_servicofisioterapia.pdf`);

};