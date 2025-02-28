import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function geradorNutricaoPago(dados: any) {
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
    doc.text("CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE NUTRICIONISTA", 105, posY, { align: "center" });
    posY += 15;

    // Seção 1: Identificação das Partes
    addSection("1. IDENTIFICAÇÃO DAS PARTES", [
        `Código Civil - Art. 104
             A validade do negócio jurídico requer: I - agente capaz; II - objeto lícito, possível, determinado ou determinável; III - forma prescrita ou não defesa em lei.`,
        `Código Civil - Art. 107
             A validade da declaração de vontade não dependerá de forma especial, senão quando a lei expressamente a exigir.`,
        "CONTRATANTE:",
        `Nome completo: ${verificarValor(dados.contratante_nome)}`,
        `Estado civil: ${verificarValor(dados.contratante_estado_civil)}`,
        `Nacionalidade: ${verificarValor(dados.contratante_nacionalidade)}`,
        `Documento de identificação (RG/CPF): ${verificarValor(dados.contratante_documento)}`,
        `Órgão expedidor: ${verificarValor(dados.contratante_cpf_cnpj)}`,
        `Endereço completo: ${verificarValor(dados.contratante_endereco)}`,
        `Telefone: ${verificarValor(dados.contratante_telefone)}`,
        "",
        "CONTRATADO (NUTRICIONISTA):",
        `Nome completo: ${verificarValor(dados.contratado_nome)}`,
        `Estado civil: ${verificarValor(dados.contratado_estado_civil)}`,
        `Nacionalidade: ${verificarValor(dados.contratado_nacionalidade)}`,
        `Documento de identificação (RG/CPF): ${verificarValor(dados.contratado_documento)}`,
        `Órgão expedidor: ${verificarValor(dados.contratado_cpf_cnpj)}`,
        `Endereço completo: ${verificarValor(dados.contratado_endereco)}`,
        `Telefone: ${verificarValor(dados.contratado_telefone)}`,
        `Registro no Conselho Regional de Nutrição: ${verificarValor(dados.contratado_rcrn)}`,
    ]);

    // Seção 2: Do Objeto
    addSection("2. DO OBJETO", [
        `Código Civil - Art. 421
            A liberdade contratual será exercida nos limites da função social do contrato.
            Código Civil - Art. 425
            É lícito às partes estipular contratos atípicos, observadas as normas gerais fixadas neste Código.`,
        "O presente contrato tem como objeto a prestação de serviços de nutrição, incluindo, mas não se limitando a:",
        "- Consultas individuais;",
        "- Avaliação nutricional;",
        "- Elaboração de planos alimentares personalizados;",
        "- Acompanhamento e reavaliação periódica;",
        "- Orientação sobre hábitos alimentares saudáveis;",
        "- Atendimento presencial ou online, conforme acordado.",
        "",
        `Os serviços serão prestados por prazo ${verificarValor(dados.prazoPrestacao)} e terão início em ${verificarValor(dados.dataInicial)}.`,
    ]);

    // Seção 3: Dos Honorários e Formas de Pagamento
    addSection("3. DOS HONORÁRIOS E FORMAS DE PAGAMENTO", [
        `Código Civil - Art. 481
             Pelo contrato de compra e venda, um dos contratantes se obriga a transferir o domínio de certa coisa, e o outro, a pagar-lhe certo preço em dinheiro.
             Código Civil - Art. 317
             Quando, por motivos imprevisíveis, sobrevier desproporção manifesta entre o valor da prestação devida e o do momento de sua execução, poderá o juiz corrigi-lo, a pedido da parte, de modo que assegure, quanto possível, o valor real da prestação.`,
        `Taxa inicial (se houver): R$ ${verificarValor(dados.taxaInicial)} (finalidade da taxa: ${verificarValor(dados.finalidadeTaxa)}).`,
        `Valor por consulta/pacote de consultas: R$ ${verificarValor(dados.valorConsulta)}.`,
        `Forma de pagamento: ${verificarValor(dados.formaPagamento)}.`,
        `Vencimento do pagamento: Todo dia ${verificarValor(dados.vencimentoData)} do mês.`,
        `Multa por atraso: ${verificarValor(dados.multaAtraso)} % ao dia.`,
    ]);

    // Seção 4: Política de Cancelamento e Reembolso
    addSection("4. POLÍTICA DE CANCELAMENTO E REEMBOLSO", [
        `Código Civil - Art. 396
            O inadimplemento da obrigação, positiva e líquida, no seu termo, constitui de pleno direito em mora o devedor.
            Código Civil - Art. 395
            Responde o devedor pelos prejuízos a que sua mora der causa, mais juros, atualização dos valores monetários e honorários de advogado.`,
        `Cancelamentos devem ser comunicados com ${verificarValor(dados.horasAntecedencia)} horas de antecedência.`,
        `Em caso de cancelamento sem aviso prévio, poderá ser cobrado ${verificarValor(dados.cancelamentoAvisoPrevio)} % do valor da consulta.`,
        `Reembolso de valores pagos antecipadamente: ${verificarValor(dados.reembolso)}.`,
    ]);

    // Seção 5: Responsabilidades do Cliente
    addSection("5. RESPONSABILIDADES DO CLIENTE", [
        `Código Civil - Art. 113
             Os negócios jurídicos devem ser interpretados conforme a boa-fé e os usos do lugar de sua celebração.`,
        "O contratante se compromete a:",
        "- Fornecer informações precisas e completas sobre sua saúde;",
        "- Seguir as orientações do nutricionista;",
        "- Comparecer aos atendimentos agendados;",
        "- Informar sobre quaisquer mudanças em sua condição de saúde;",
        "- Respeitar os prazos e condições estabelecidos neste contrato.",
    ]);

    // Seção 6: Das Limitações de Responsabilidade
    addSection("6. DAS LIMITAÇÕES DE RESPONSABILIDADE", [
        `Código Civil - Art. 14 do Código de Defesa do Consumidor (CDC)
             O fornecedor de serviços responde, independentemente da existência de culpa, pela reparação dos danos causados aos consumidores por defeitos relativos à prestação dos serviços, bem como por informações insuficientes ou inadequadas sobre sua fruição e riscos.`,
        "O nutricionista não se responsabiliza por resultados específicos, visto que estes podem variar de acordo com a resposta individual do cliente. As recomendações fornecidas são baseadas em evidências científicas e boas práticas, não garantindo cura ou resultados exatos.",
    ]);

    // Seção 7: Duração e Rescisão do Contrato
    addSection("7. DURAÇÃO E RESCISÃO DO CONTRATO", [
        `Código Civil - Art. 473
             A resilição unilateral, nos casos em que a lei expressa ou implicitamente o permita, opera mediante denúncia notificada à outra parte.
             Código Civil - Art. 474
             A rescisão do contrato pode ser invocada por qualquer das partes, desde que cumpridos os prazos estabelecidos.`,
        `O contrato terá duração de ${verificarValor(dados.duracaoMesesAnosDias)}.`,
        `Poderá ser rescindido por qualquer das partes mediante aviso prévio de ${verificarValor(dados.rescisaoAvisoPrevio)} dias.`,
        `Em caso de descumprimento, será aplicada multa de R$ ${verificarValor(dados.multaDescumprimento)}.`,
    ]);

    // Seção 8: Jurisdição e Lei Aplicável
    addSection("8. JURISDIÇÃO E LEI APLICÁVEL", [
        `Constituição Federal - Art. 5º, inciso XXXV
             A lei não excluirá da apreciação do Poder Judiciário lesão ou ameaça a direito.
             Código Civil - Art. 112
             Nas declarações de vontade se atenderá mais à intenção nelas consubstanciada do que ao sentido literal da linguagem.`,
        `Fica eleito o foro da Comarca de ${verificarValor(dados.comarca)}, Estado de ${verificarValor(dados.estado)}, para dirimir quaisquer dúvidas ou conflitos decorrentes do presente contrato, sendo aplicável a legislação vigente no Brasil.`,
    ]);

    // Seção 9: Das Assinaturas
    addSection("9. DAS ASSINATURAS", [
        `Código Civil - Art. 129
            Os atos jurídicos válidos se provam por todos os meios admitidos em direito.
            Código Civil - Art. 215
            O instrumento particular, feito e assinado ou somente assinado por quem esteja na livre disposição e administração de seus bens, prova as obrigações convencionadas.`,
        "Por estarem de pleno acordo, as partes assinam o presente contrato na presença de duas testemunhas.",
        "",
        `Data: ${verificarValor(dados.dataAssinatura)}`,
        "",
        "Contratante: _________________________________",
        "",
        "Contratado (Nutricionista): _________________________________",
        "",
        `1ª Testemunha: Nome: ${verificarValor(dados.nomeTest1)} CPF: ${verificarValor(dados.cpfTest1)}`,
        "",
        `2ª Testemunha: Nome: ${verificarValor(dados.nomeTest2)} CPF: ${verificarValor(dados.cpfTest2)}`,
    ]);

    doc.save(`contrato_nutricionista_${verificarValor(dados.contratante_nome)}.pdf`);

};