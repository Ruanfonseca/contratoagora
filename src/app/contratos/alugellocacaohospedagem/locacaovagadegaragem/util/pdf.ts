import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function LocacaoGaragemPdfPago(dados: any) {
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
    doc.text("CONTRATO DE LOCAÇÃO DE VAGA DE GARAGEM", 105, posY, { align: "center" });
    posY += 15;

    // Seções do contrato
    addSection("CLÁUSULA 1 - IDENTIFICAÇÃO DAS PARTES", [
        "(Artigos 104, 421 e 425 do Código Civil Brasileiro)",
        "Locador (Proprietário da Vaga de Garagem):",
        `Nome completo ou Razão Social: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.nomeLocador) : verificarValor(dados.razaoSocial)}`,
        `CPF ou CNPJ: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.CPFLocador) : verificarValor(dados.cnpjlocador)}`,
        `Endereço completo: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.enderecoLocador) : verificarValor(dados.enderecoCNPJ)}`,
        `Telefone e e-mail para contato: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.telefoneLocador) : verificarValor(dados.telefoneCNPJ)}, ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.emailLocador) : verificarValor(dados.emailCNPJ)}`,
        verificarValor(dados.locador) === "pj" ? `Representante Legal: ${verificarValor(dados.nomeRepresentanteCNPJ)}, CPF: ${verificarValor(dados.CPFRepresentanteCNPJ)}` : "",
        "",
        "Locatário (Inquilino da Vaga de Garagem):",
        `Nome completo: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.nomelocatario) : verificarValor(dados.razaoSociallocatario)}`,
        `CPF ou CNPJ: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.CPFlocatario) : verificarValor(dados.cpflocatario)}`,
        `Endereço completo: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.enderecolocatario) : verificarValor(dados.enderecolocatarioCNPJ)}`,
        `Telefone e e-mail para contato: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.telefonelocatario) : verificarValor(dados.telefonelocatarioCNPJ)}, ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.emaillocatario) : verificarValor(dados.emaillocatarioCNPJ)}`,
        verificarValor(dados.locatario) === "pj" ? `Representante Legal: ${verificarValor(dados.nomeRepresentantelocatarioCNPJ)}, CPF: ${verificarValor(dados.CPFRepresentantelocatarioCNPJ)}` : "",
    ]);

    addSection("CLÁUSULA 2 - DESCRIÇÃO DA VAGA DE GARAGEM", [
        `Endereço completo onde a vaga está localizada: ${verificarValor(dados.enderecoVaga)}`,
        `Número ou identificação da vaga: ${verificarValor(dados.numeroDavaga)}`,
        `A vaga está situada em condomínio residencial, comercial ou estacionamento particular? ${verificarValor(dados.vagaSituada)}`,
        `Há restrições quanto ao tamanho ou tipo de veículo permitido na vaga? ${verificarValor(dados.restricoesTipo) === "S" ? `Sim, ${verificarValor(dados.tipoVeiculo)}` : "Não"}`,
    ]);

    addSection("CLÁUSULA 3 - PRAZO DA LOCAÇÃO", [
        `Data de início da locação: ${verificarValor(dados.dataInicioLocacao)}`,
        `Duração do contrato: ${verificarValor(dados.duracaoContrato)}`,
        `Há possibilidade de renovação? ${verificarValor(dados.possibilidadeRenovacao) === "S" ? `Sim, ${verificarValor(dados.quaisCondicoes)}` : "Não"}`,
    ]);

    addSection("CLÁUSULA 4 - VALOR DO ALUGUEL E CONDIÇÕES DE PAGAMENTO", [
        "Art. 39, V: É vedado ao fornecedor de produtos ou serviços, dentre outras práticas abusivas: Exigir do consumidor vantagem manifestamente excessiva.\nArt. 52, § 1º: As multas de mora decorrentes do inadimplemento de obrigações no seu termo não poderão ser superiores a dois por cento do valor da prestação.",
        `Valor mensal do aluguel: ${verificarValor(dados.valorMensal)}`,
        `Data de vencimento mensal: ${verificarValor(dados.dataVencMensal)}`,
        `Forma de pagamento: ${verificarValor(dados.formaPagamento)}`,
        `Multa por atraso no pagamento: ${verificarValor(dados.multaAtraso)}`,
        `Juros aplicáveis em caso de atraso: ${verificarValor(dados.jurosAplicaveis)}`,

    ]);

    addSection("CLÁUSULA 5 - GARANTIAS LOCATÍCIAS", [
        `Tipo de garantia exigida: ${verificarValor(dados.garantia) === "S" ? verificarValor(dados.qualgarantidor) : "Não há garantia"}`,
        verificarValor(dados.garantia) === "S" ? `Detalhes da garantia: ${verificarValor(dados.qualgarantidor) === "fi" ? `Fiador: ${verificarValor(dados.nomeFiador)}, CPF: ${verificarValor(dados.cpfFiador)}` : verificarValor(dados.qualgarantidor) === "caudep" ? `Caução em dinheiro: ${verificarValor(dados.valorTitCaucao)}` : verificarValor(dados.qualgarantidor) === "caubem" ? `Caução em bem: ${verificarValor(dados.descBemCaucao)}` : verificarValor(dados.qualgarantidor) === "ti" ? `Título de crédito: ${verificarValor(dados.descCredUtili)}` : `Seguro-fiança: ${verificarValor(dados.segFianca)}`}` : "",
        `Procedimento para devolução da garantia ao término do contrato: ${verificarValor(dados.procedimentoDevolucao)}`,
    ]);

    addSection("CLÁUSULA 6 - OBRIGAÇÕES DO LOCADOR", [
        "Art. 566: O locador é obrigado a entregar ao locatário a coisa alugada, com todas as suas pertenças, em estado de servir ao uso a que se destina.",
        `O locador se responsabiliza por quais manutenções ou reparos na vaga de garagem? ${verificarValor(dados.locadorResponsa)}`,
        `A vaga possui algum dispositivo de segurança fornecido pelo locador? ${verificarValor(dados.vagaSeguranca) === "S" ? `Sim, ${verificarValor(dados.qualSeguranca)}` : "Não"}`,
    ]);

    addSection("CLÁUSULA 7 - OBRIGAÇÕES DO LOCATÁRIO", [
        "Art. 569: O locatário é obrigado: \nI - a servir - se da coisa alugada para os usos convencionados ou presumidos;\n II - a pagar pontualmente o aluguel nos prazos ajustados.",
        `O locatário pode sublocar ou ceder a vaga a terceiros? ${verificarValor(dados.cederVaga) === "S" ? "Sim" : "Não"}`,
        `Há restrições quanto aos horários de uso da vaga? ${verificarValor(dados.restricoesVaga) === "S" ? `Sim, ${verificarValor(dados.diaDaSemana)} das ${verificarValor(dados.horarioInicio)} às ${verificarValor(dados.horarioFim)}` : "Não"}`,
        `O locatário é responsável por danos causados à vaga ou às áreas comuns associadas? ${verificarValor(dados.responsavelDano) === "S" ? "Sim" : "Não"}`,
    ]);

    addSection("CLÁUSULA 8 - DESPESAS E TRIBUTOS", [
        "Art. 567: Se, durante a locação, se deteriorar a coisa alugada sem culpa do locatário, pode este resolver o contrato, pedindo a devolução das quantias já pagas proporcionalmente ao tempo de fruição da coisa, ou exigir abatimento do aluguel.",
        `Quais despesas são de responsabilidade do locatário? ${verificarValor(dados.quaisDespesasLocatario)}`,
        `Quais despesas são de responsabilidade do locador? ${verificarValor(dados.quaisDespesasLocador)}`,
    ]);

    addSection("CLÁUSULA 9 - RESCISÃO DO CONTRATO", [
        "Art. 571: Morrendo o locador ou o locatário, transfere - se aos seus herdeiros a locação, salvo se tratar de aluguel por temporada ou por natureza pesso",
        `Condições para rescisão antecipada por ambas as partes: ${verificarValor(dados.condicoesRescisao)}`,
        `Multas ou penalidades aplicáveis em caso de rescisão antecipada: ${verificarValor(dados.multasPenalidades)}`,
        `Prazo para notificação prévia de rescisão: ${verificarValor(dados.prazo)}`,
    ]);

    addSection("CLÁUSULA 10 - DISPOSIÇÕES GERAIS", [
        `Foro eleito para resolução de conflitos: ${verificarValor(dados.foroeleito)}`,
        `Necessidade de testemunhas para assinatura do contrato: ${verificarValor(dados.testemunhas) === "S" ? `Sim, Testemunha 1: ${verificarValor(dados.nomeTest1)}, CPF: ${verificarValor(dados.cpfTest1)}; Testemunha 2: ${verificarValor(dados.nomeTest2)}, CPF: ${verificarValor(dados.cpfTest2)}` : "Não"}`,
        `O contrato será registrado em cartório? ${verificarValor(dados.registroCartorio) === "S" ? "Sim" : "Não"}`,
        `Local: ${verificarValor(dados.local)} `,
        `Data de Assinatura: ${verificarValor(dados.dataAssinatura)}`,
        ``,
        `_________________________________________`,
        `Assinatura do Locador`,
        ``,
        `_________________________________________`,
        `Assinatura do Locatário`,
        ``,
        verificarValor(dados.testemunhas) === "S" ? `_________________________________________` : "",
        verificarValor(dados.testemunhas) === "S" ? `Assinatura Testemunha 1` : "",
        ``,
        verificarValor(dados.testemunhas) === "S" ? `_________________________________________` : "",
        verificarValor(dados.testemunhas) === "S" ? `Assinatura Testemunha 2` : ""
    ]);

    doc.save(`contrato_hospedagem_${dados.nomeLocador || dados.nomelocatario}.pdf`);


}