import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function geradorPersonalPdfPago(dados: any) {
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
    doc.text("CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE PERSONAL TRAINER", 105, posY, { align: "center" });
    posY += 15;
    doc.setFontSize(10);
    doc.text("(Código Civil - Lei Federal nº 10.406)", 105, posY, { align: "center" });
    posY += 10;
    doc.text("Este contrato tem por objetivo regulamentar a prestação de serviços de personal trainer, estabelecendo os direitos e deveres das partes envolvidas, a fim de garantir transparência e segurança na relação contratual.", marginX, posY, { maxWidth: maxTextWidth });
    posY += 20;

    // Seção 1 - Identificação das Partes
    addSection("1. Identificação das Partes", [
        `Código Civil
            "Art. 104 – A validade do negócio jurídico requer: I - agente capaz; II - objeto lícito, possível, determinado ou determinável; III - forma prescrita ou não defesa em lei."
            "Art. 113 – Os negócios jurídicos devem ser interpretados conforme a boa-fé e os usos do lugar de sua celebração."\n`,

        "Contratante (Aluno)",
        `Nome completo: ${verificarValor(dados.contratante_nome)}`,
        `Sexo: ${verificarValor(dados.contratante_sexo)}`,
        `Estado civil: ${verificarValor(dados.contratante_estado_civil)}`,
        `Nacionalidade: ${verificarValor(dados.contratante_nacionalidade)}`,
        `Profissão: ${verificarValor(dados.contratante_profissao)}`,
        `Documento de identificação (RG ou CNH): ${verificarValor(dados.contratante_documento)}`,
        `Número do documento: ${verificarValor(dados.contratante_numero)}`,
        `CPF: ${verificarValor(dados.contratante_cpf_cnpj)}`,
        `Endereço completo: ${verificarValor(dados.contratante_endereco)}`,
        `Telefone: ${verificarValor(dados.contratante_telefone)}`,
        `Possui alguma condição médica que possa interferir no treinamento? (${verificarValor(dados.condicao) === 'S' ? 'Sim' : 'Não'})`,
        verificarValor(dados.condicao) === 'S' ? `Se sim, especifique: ${verificarValor(dados.especifique)}` : "",
        "",
        "Contratado (Personal Trainer)",
        `Nome completo: ${verificarValor(dados.contratado_nome)}`,
        `Sexo: ${verificarValor(dados.contratado_sexo)}`,
        `Estado civil: ${verificarValor(dados.contratado_estado_civil)}`,
        `Nacionalidade: ${verificarValor(dados.contratado_nacionalidade)}`,
        `Documento de identificação (RG ou CNH): ${verificarValor(dados.contratado_documento)}`,
        `Número do documento: ${verificarValor(dados.contratado_numero)}`,
        `CPF: ${verificarValor(dados.contratado_cpf_cnpj)}`,
        `Registro profissional (CREF): ${verificarValor(dados.contratado_cref)}`,
        `Endereço completo: ${verificarValor(dados.contratado_endereco)}`,
        `Telefone: ${verificarValor(dados.contratado_telefone)}`
    ]);

    // Seção 2 - Do Objeto
    addSection("2. Do Objeto", [
        `Código Civil
             Art. 421 – "A liberdade contratual será exercida nos limites da função social do contrato."
             Art. 422 – "Os contratantes são obrigados a guardar, assim na conclusão do contrato, como em sua execução, os princípios de probidade e boa-fé."\n`,
        `Serviço de personal trainer a ser prestado: ${verificarValor(dados.servicoPrestado)}`,
        `Objetivo do treinamento: ${verificarValor(dados.objetivo) === 'outros' ? `Outros: ${verificarValor(dados.especifiqueOutros)}` : verificarValor(dados.objetivo)}`,
        `Local das aulas: ${verificarValor(dados.localAulas)}`,
        `As atividades serão efetuadas sempre no mesmo local? (${verificarValor(dados.atividadeLocal) === 'S' ? 'Sim' : 'Não'})`,
        `Haverá deslocamento para diferentes locais? (${verificarValor(dados.deslocamentoLocal) === 'S' ? 'Sim' : 'Não'})`,
        verificarValor(dados.deslocamentoLocal) === 'S' ? `Se sim, quais locais?: ${verificarValor(dados.quaisLocais)}` : ""
    ]);

    // Seção 3 - Da Retribuição
    addSection("3. Da Retribuição", [
        `Código Civil
             Art. 318 – "É nula a convenção que estipular pagamento em ouro ou em moeda estrangeira, ressalvados os casos previstos em lei."
             Art. 320 – "O pagamento deve ser feito no tempo e lugar determinados pelo contrato."\n`,
        `Haverá taxa de matrícula? (${verificarValor(dados.txMatricula) === 'S' ? `Sim, valor: R$ ${verificarValor(dados.valorMatricula)}` : 'Não'})`,
        `Frequência do pagamento: ${verificarValor(dados.frequenciaPagamento) === 'outro' ? `Outro: ${verificarValor(dados.outraFrequencia)}` : verificarValor(dados.frequenciaPagamento)}`,
        `Valor mensal: R$ ${verificarValor(dados.valorMensal)}`,
        `Dia do vencimento: ${verificarValor(dados.diaVencimento)}`,
        `Multa por atraso: (${verificarValor(dados.multaAtraso) === 'S' ? `Sim, ${verificarValor(dados.porcetagemMulta)}%` : 'Não'})`,
        `Forma de pagamento: ${verificarValor(dados.modalidade) === 'outro' ? `Outro: ${verificarValor(dados.outraModalidade)}` : verificarValor(dados.modalidade)}`
    ]);

    // Seção 4 - Das Aulas
    addSection("4. Das Aulas", [
        `Código Civil
             Art. 593 – "A prestação de serviço, que não estiver sujeita às leis trabalhistas ou a legislação especial, reger-se-á pelas disposições deste Capítulo."
             Art. 599 – "O prestador do serviço é obrigado a agir com diligência e prudência." \n`,
        `Duração de cada aula: ${verificarValor(dados.duracaoAula)} minutos`,
        `Frequência das aulas: ${verificarValor(dados.frequenciaAula)} por semana`,
        `Escala prevista para atividades: ${verificarValor(dados.escalaPrevista)}`,
        `Aviso de cancelamento necessário com antecedência de: ${verificarValor(dados.avisoCancelamento)} horas`,
        `Haverá reposição de aulas canceladas? (${verificarValor(dados.haveraReposicao) === 'S' ? 'Sim' : 'Não'})`,
        verificarValor(dados.haveraReposicao) === 'S' ? `Se sim, em quais condições?: ${verificarValor(dados.quaisCondicoes)}` : ""
    ]);

    // Seção 5 - Responsabilidades das Partes
    addSection("5. Responsabilidades das Partes", [
        `Código Civil
            Art. 186 – "Aquele que, por ação ou omissão voluntária, negligência ou imprudência, violar direito e causar dano a outrem, ainda que exclusivamente moral, comete ato ilícito."
            Art. 927 – "Aquele que, por ato ilícito, causar dano a outrem, fica obrigado a repará-lo." \n`,
        "Do Personal Trainer:",
        "Elaborar e conduzir treinamentos adequados ao perfil e objetivo do contratante.",
        "Prezar pela segurança e bem-estar do contratante durante as sessões.",
        "Estar presente no local e horário previamente combinados.",
        "Fornecer informações e orientações sobre os exercícios de forma clara e objetiva.",
        "",
        "Do Contratante:",
        "Informar o personal trainer sobre quaisquer condições médicas que possam afetar a prática de exercícios.",
        "Seguir as orientações fornecidas pelo personal trainer.",
        "Comparecer pontualmente às aulas agendadas.",
        "Avisar com antecedência em caso de cancelamento de sessões."
    ]);

    // Seção 6 - Da Rescisão
    addSection("6. Da Rescisão", [
        `Código Civil
             Art. 472 – "O contrato bilateral extingue-se, desde que uma das partes não cumpra sua obrigação."
             Art. 473 – "A resilição unilateral, nos casos em que a lei expressa ou implicitamente a admite, opera mediante denúncia notificada à outra parte." \n`,
        `Aviso prévio para rescisão do contrato: ${verificarValor(dados.avisoRescisao)} dias`,
        `Haverá reembolso em caso de rescisão antecipada? (${verificarValor(dados.reembolsoAntecipado) === 'S' ? 'Sim' : 'Não'})`,
        verificarValor(dados.reembolsoAntecipado) === 'S' ? `Se sim, em quais condições?: ${verificarValor(dados.quaisCondicoesReembolso)}` : ""
    ]);

    // Seção 7 - Do Descumprimento
    addSection("7. Do Descumprimento", [
        `Código Civil
             Art. 389 – "Não cumprida a obrigação, responde o devedor por perdas e danos, mais juros e atualização monetária."
             Art. 396 – "Não cumprida a obrigação, considera-se em mora o devedor." \n`,
        `Multa por descumprimento do contrato: R$ ${verificarValor(dados.multaDescumprimento)}`,
        `Quais situações caracterizam descumprimento?: ${verificarValor(dados.quaisSituacoes)}`
    ]);

    // Seção 8 - Limitações de Responsabilidade
    addSection("8. Limitações de Responsabilidade", [
        `Código Civil
             Art. 393 – "O devedor não responde pelos prejuízos resultantes de caso fortuito ou força maior, se expressamente não se houver por eles responsabilizado."
             Art. 927, Parágrafo Único – "Haverá obrigação de reparar o dano, independentemente de culpa, nos casos especificados em lei." \n`,
        "O personal trainer não será responsável por eventuais lesões ou danos decorrentes de:",
        "Prática inadequada dos exercícios sem orientação.",
        "Omissão de informações relevantes sobre condições médicas.",
        "Uso inadequado de equipamentos.",
        "Acidentes ocorridos fora das sessões supervisionadas."
    ]);

    // Seção 9 - Do Foro
    addSection("9. Do Foro", [
        `Código Civil
             Art. 78 – "É competente o foro do domicílio do réu para ação em que seja demandado."
             Art. 112 – "Prorroga-se a competência determinada em razão do valor e do território, se o réu não alegar a incompetência em exceção." \n`,
        `Foro da Comarca de: ${verificarValor(dados.comarca)}`
    ]);

    // Seção 10 - Assinaturas
    addSection("10. Assinaturas", [
        `Constituição Federal
             Art. 5º, II – "Ninguém será obrigado a fazer ou deixar de fazer alguma coisa senão em virtude de lei."
             Art. 5º, XXXV – "A lei não excluirá da apreciação do Poder Judiciário lesão ou ameaça a direito." \n`,
        `Data de assinatura: ${verificarValor(dados.dataAssinatura)}`,
        "",
        "Contratante:",
        `Assinatura: ____________________________________`,
        `Nome completo: ${verificarValor(dados.contratante_nome)}`,
        "",
        "Contratado (Personal Trainer):",
        `Assinatura: ____________________________________`,
        `Nome completo: ${verificarValor(dados.contratado_nome)}`,
        "",
        "Testemunhas:",
        "1ª Testemunha:",
        `Nome: ${verificarValor(dados.nomeTest1)}`,
        `CPF: ${verificarValor(dados.cpfTest1)}`,
        "Assinatura: ____________________________________",
        "",
        "2ª Testemunha:",
        `Nome: ${verificarValor(dados.nomeTest2)}`,
        `CPF: ${verificarValor(dados.cpfTest2)}`,
        "Assinatura: ____________________________________"
    ]);

    doc.save(`contrato_personal_${verificarValor(dados.contratante_nome)}.pdf`);

};