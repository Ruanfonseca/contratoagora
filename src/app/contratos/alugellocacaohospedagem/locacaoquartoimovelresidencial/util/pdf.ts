import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function gerandorLocacaoQuartoPago(dados: any) {
    const doc = new jsPDF();

    // Configuração inicial de fonte e margens
    const marginX = 10;
    let posY = 20;

    const maxPageHeight = 280;
    const maxTextWidth = 190;

    const checkPageBreak = (additionalHeight: number) => {
        if (posY + additionalHeight >= maxPageHeight) {
            doc.addPage();
            posY = 20;
        }
    };

    const addSection = (title: string, content: string[]) => {
        const titleHeight = 15;
        const lineHeight = 10;

        checkPageBreak(titleHeight);
        doc.setFontSize(12);
        doc.text(title, 105, posY, { align: "center" });
        posY += titleHeight;

        doc.setFontSize(10);
        content.forEach((line: string) => {
            const splitLines = doc.splitTextToSize(line, maxTextWidth);
            splitLines.forEach((splitLine: string) => {
                checkPageBreak(lineHeight);
                doc.text(splitLine, marginX, posY);
                posY += lineHeight;
            });
        });
    };

    // Página 1 - Cabeçalho
    doc.setFontSize(14);
    doc.text("CONTRATO DE LOCAÇÃO DE QUARTO EM IMÓVEL RESIDENCIAL ", 105, posY, { align: "center" });
    posY += 15;

    // Seções do contrato
    addSection("CLÁUSULA 1 - IDENTIFICAÇÃO DAS PARTES", [
        "(Artigos 104, 421 e 425 do Código Civil Brasileiro)",
        "Nesta seção, é feita a descrição detalhada do imóvel objeto do contrato, incluindo seu endereço completo, características e condições.\n Também são especificadas a destinação (residencial ou comercial) e o estado de conservação, conforme o que foi verificado pelas partes.",
        "Locador:",
        `Nome ou Razão Social: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.nomeLocador) : verificarValor(dados.razaoSocial)}`,
        `CPF ou CNPJ: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.CPFLocador) : verificarValor(dados.cnpjlocador)}`,
        `Endereço: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.enderecoLocador) : verificarValor(dados.enderecoCNPJ)}`,
        `Telefone: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.telefoneLocador) : verificarValor(dados.telefoneCNPJ)}`,
        `E-mail: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.emailLocador) : verificarValor(dados.emailCNPJ)}`,
        verificarValor(dados.locador) === "pj" ? `Representante Legal: ${verificarValor(dados.nomeRepresentanteCNPJ)}, CPF: ${verificarValor(dados.CPFRepresentanteCNPJ)}` : "",
        "",
        "Locatário:",
        `Nome ou Razão Social: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.nomelocatario) : verificarValor(dados.razaoSociallocatario)}`,
        `CPF ou CNPJ: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.CPFlocatario) : verificarValor(dados.cpflocatario)}`,
        `Endereço: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.enderecolocatario) : verificarValor(dados.enderecolocatarioCNPJ)}`,
        `Telefone: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.telefonelocatario) : verificarValor(dados.telefonelocatarioCNPJ)}`,
        `E-mail: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.emaillocatario) : verificarValor(dados.emaillocatarioCNPJ)}`,
        verificarValor(dados.locatario) === "pj" ? `Representante Legal: ${verificarValor(dados.nomeRepresentantelocatarioCNPJ)}, CPF: ${verificarValor(dados.CPFRepresentantelocatarioCNPJ)}` : "",
    ]);

    addSection("CLÁUSULA 2 - DESCRIÇÃO DO QUARTO E DO IMÓVEL", [
        "(Lei 8.245/1991, artigo 22: determina que o locador deve entregar o imóvel em estado de servir ao uso a que se destina.)",
        `Endereço completo do imóvel: ${verificarValor(dados.enderecoImovel)}`,
        `Descrição do quarto a ser locado: ${verificarValor(dados.descQuarto)}`,
        `Áreas comuns do imóvel que o locatário terá direito de usar: ${verificarValor(dados.areaComum)}`,
        `Condições atuais do quarto e das áreas comuns: ${verificarValor(dados.condicoesAtuais)}`,
    ]);

    addSection("CLÁUSULA 3 - PRAZO DA LOCAÇÃO", [
        "(Lei 8.245/1991, artigo 46: trata da renovação automática do contrato por prazo indeterminado.)",
        `Data de início da locação: ${verificarValor(dados.dataInicioLocacao)}`,
        `Duração do contrato: ${verificarValor(dados.duracaoContrato)}`,
        `Há possibilidade de renovação? ${verificarValor(dados.possibilidadeRenovacao) === 'S' ? 'Sim' : 'Não'}`,
        verificarValor(dados.possibilidadeRenovacao) === 'S' ? `Quais são as condições? ${verificarValor(dados.quaisCondicoes)}` : "",
    ]);

    addSection("CLÁUSULA 4 - VALOR DO ALUGUEL E CONDIÇÕES DE PAGAMENTO", [
        "(Lei 8.245/1991, artigo 23: o locatário deve pagar pontualmente o aluguel e demais encargos.)",
        `Valor mensal do aluguel: ${verificarValor(dados.valorMensal)}`,
        `Data de vencimento mensal: ${verificarValor(dados.dataVencMensal)}`,
        `Forma de pagamento: ${verificarValor(dados.formaPagamento)}`,
        `Multa por atraso no pagamento: ${verificarValor(dados.multaAtraso)}`,
        `Juros aplicáveis em caso de atraso: ${verificarValor(dados.jurosAplicaveis)}`,
    ]);

    addSection("CLÁUSULA 5 - GARANTIAS LOCATÍCIAS", [
        "(Lei 8.245/1991, artigo 37: regulação sobre as garantias locatícias, como caução, fiança, seguro-fiança ou cessão fiduciária.)",
        `Tipo de garantia exigida: ${verificarValor(dados.garantia) === 'S' ? 'Sim' : 'Não'}`,
        verificarValor(dados.garantia) === 'S' ? `Detalhes da garantia: ${verificarValor(dados.qualgarantidor)}` : "",
        verificarValor(dados.qualgarantidor) === 'fi' ? `Nome do fiador: ${verificarValor(dados.nomeFiador)}, CPF: ${verificarValor(dados.cpfFiador)}, Endereço: ${verificarValor(dados.enderecoFiador)}` : "",
        verificarValor(dados.qualgarantidor) === 'caudep' ? `Valor do título de caução: ${verificarValor(dados.valorTitCaucao)}` : "",
        verificarValor(dados.qualgarantidor) === 'caubem' ? `Descrição do bem de caução: ${verificarValor(dados.descBemCaucao)}` : "",
        verificarValor(dados.qualgarantidor) === 'ti' ? `Descrição do título de crédito utilizado: ${verificarValor(dados.descCredUtili)}` : "",
        verificarValor(dados.qualgarantidor) === 'segfianca' ? `Seguro-fiança: ${verificarValor(dados.segFianca)}` : "",
        `Procedimento para devolução da garantia ao término do contrato: ${verificarValor(dados.procedimentoDevolucao)}`,
    ]);

    addSection("CLÁUSULA 6 - OBRIGAÇÕES DO LOCADOR", [
        "(Lei 8.245/1991, artigo 22, inciso IV: o locador é responsável pelas despesas extraordinárias do condomínio e por manter o imóvel em condições de habitabilidade.)",
        `O locador se responsabiliza por quais manutenções ou reparos no quarto e nas áreas comuns? ${verificarValor(dados.locadorManuRep)}`,
        `O locador fornecerá algum serviço adicional? ${verificarValor(dados.locadorServAdicional)}`,
    ]);

    addSection("CLÁUSULA 7 - OBRIGAÇÕES DO LOCATÁRIO", [
        "(Lei 8.245/1991, artigo 23, inciso I: o locatário deve conservar o imóvel e não pode realizar modificações sem consentimento.)",
        `O locatário pode realizar modificações no quarto? ${verificarValor(dados.locatarioModifica) === 'S' ? 'Sim' : 'Não'}`,
        verificarValor(dados.locatarioModifica) === 'S' ? `Quais são as condições? ${verificarValor(dados.quaiCondicoes)}` : "",
        `O locatário é responsável por quais manutenções no quarto? ${verificarValor(dados.locatarioManu)}`,
        `Há restrições quanto ao uso das áreas comuns? ${verificarValor(dados.restricoesUso)}`,
        `É permitido fumar no interior do imóvel? ${verificarValor(dados.permiteFumar)}`,
        `São permitidos animais de estimação? ${verificarValor(dados.animais)}`,
    ]);

    addSection("CLÁUSULA 8 - DESPESAS E TRIBUTOS", [
        "(Lei 8.245/1991, artigo 22 e 23: o locador é responsável por impostos e taxas extraordinárias, e o locatário pelas despesas ordinárias.)",
        `Quais despesas são de responsabilidade do locatário? ${verificarValor(dados.despesasLocatario)}`,
        `Quais despesas são de responsabilidade do locador? ${verificarValor(dados.despesasLocador)}`,
    ]);

    addSection("CLÁUSULA 9 - REGRAS DE CONVIVÊNCIA", [
        "(Lei 8.245/1991, artigo 23, inciso IV: o locatário deve respeitar regras de convivência do imóvel.)",
        `Horários de silêncio ou restrições de horário para uso das áreas comuns: ${verificarValor(dados.horaSilencio)}`,
        `Política de visitas: ${verificarValor(dados.politicaVisita)}`,
        `Regras sobre limpeza e organização das áreas comuns: ${verificarValor(dados.regrasLimpeza)}`,
    ]);

    addSection("CLÁUSULA 10 - RESCISÃO DO CONTRATO", [
        "(Lei 12.112/2009: alteração na Lei do Inquilinato, permitindo retomada do imóvel com menor prazo de notificação.)",
        `Condições para rescisão antecipada por ambas as partes: ${verificarValor(dados.condicoesRescisao)}`,
        `Multas ou penalidades aplicáveis em caso de rescisão antecipada: ${verificarValor(dados.multasPenalidades)}`,
        `Prazo para notificação prévia de rescisão: ${verificarValor(dados.prazo)}`,
    ]);

    addSection("CLÁUSULA 11 - DISPOSIÇÕES GERAIS", [
        "(Lei 8.245/1991, artigo 8º: necessidade de registro para valer contra terceiros.)",
        `Foro eleito para resolução de conflitos: ${verificarValor(dados.foroeleito)}`,
        `Necessidade de testemunhas para assinatura do contrato: ${verificarValor(dados.testemunhas) === 'S' ? 'Sim' : 'Não'}`,
        verificarValor(dados.testemunhas) === 'S' ? `Nome da primeira testemunha: ${verificarValor(dados.nomeTest1)}, CPF: ${verificarValor(dados.cpfTest1)}` : "",
        verificarValor(dados.testemunhas) === 'S' ? `Nome da segunda testemunha: ${verificarValor(dados.nomeTest2)}, CPF: ${verificarValor(dados.cpfTest2)}` : "",
        `O contrato será registrado em cartório? ${verificarValor(dados.registroCartorio) === 'S' ? 'Sim' : 'Não'}`,
    ]);

    doc.save(`contrato_hospedagem_${dados.nomeLocador || dados.nomelocatario}.pdf`);
};