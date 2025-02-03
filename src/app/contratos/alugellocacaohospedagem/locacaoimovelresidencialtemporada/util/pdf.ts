import { verificarValor, verificarValorEspecial } from "@/lib/utils";
import jsPDF from "jspdf";

export default function geradorLocacaoResiPago(dados: any) {
    const doc = new jsPDF();

    const marginX = 10;
    let posY = 20;
    const maxPageHeight = 280;
    const maxTextWidth = 190;

    const checkPageBreak = (additionalHeight: any) => {
        if (posY + additionalHeight >= maxPageHeight) {
            doc.addPage();
            posY = 20;
        }
    };

    const addSection = (title: any, content: any) => {
        const titleHeight = 15;
        const lineHeight = 10;

        checkPageBreak(titleHeight);
        doc.setFontSize(12);
        doc.text(title, 105, posY, { align: "center" });
        posY += titleHeight;

        doc.setFontSize(10);
        content.forEach((line: any) => {
            const splitLines = doc.splitTextToSize(line, maxTextWidth);
            splitLines.forEach((splitLine: any) => {
                checkPageBreak(lineHeight);
                doc.text(splitLine, marginX, posY);
                posY += lineHeight;
            });
        });
    };

    doc.setFontSize(14);
    doc.text("CONTRATO DE LOCAÇÃO DE IMÓVEL RESIDENCIAL POR TEMPORADA", 105, posY, { align: "center" });
    posY += 15;

    addSection("CLÁUSULA 1 - IDENTIFICAÇÃO DAS PARTES", [
        "Conforme o artigo 2º da Lei 8.245/1990, o locador é aquele que cede o uso do imóvel mediante remuneração e o locatário é aquele que recebe o imóvel para uso, sendo necessário constar seus dados de identificação no contrato.",
        `Locador: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.nomeLocador) : verificarValor(dados.razaoSocial)}`,
        `CPF/CNPJ: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.CPFLocador) : verificarValor(dados.cnpjlocador)}`,
        `Endereço: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.enderecoLocador) : verificarValor(dados.enderecoCNPJ)}`,
        `Telefone: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.telefoneLocador) : verificarValor(dados.telefoneCNPJ)}`,
        `E-mail: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.emailLocador) : verificarValor(dados.emailCNPJ)}`,
        verificarValor(dados.locador) === "pj" ? `Representante Legal: ${verificarValor(dados.nomeRepresentanteCNPJ)}, CPF: ${verificarValor(dados.CPFRepresentanteCNPJ)}` : "",
        "",
        `Locatário: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.nomelocatario) : verificarValor(dados.razaoSociallocatario)}`,
        `CPF/CNPJ: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.CPFlocatario) : verificarValor(dados.cpflocatario)}`,
        `Endereço: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.enderecolocatario) : verificarValor(dados.enderecolocatarioCNPJ)}`,
        `Telefone: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.telefonelocatario) : verificarValor(dados.telefonelocatarioCNPJ)}`,
        `E-mail: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.emaillocatario) : verificarValor(dados.emaillocatarioCNPJ)}`,
        verificarValor(dados.locatario) === "pj" ? `Representante Legal: ${verificarValor(dados.nomeRepresentantelocatarioCNPJ)}, CPF: ${verificarValor(dados.CPFRepresentantelocatarioCNPJ)}` : "",
    ]);

    addSection("CLÁUSULA 2 - DESCRIÇÃO DO IMÓVEL", [
        `Conforme o artigo 48 da Lei nº 8.245/1991, esta locação é destinada à residência temporária por prazo não superior a 90 dias.`,
        `Endereço: ${verificarValor(dados.enderecoImovel)}`,
        `Tipo de Imóvel: ${verificarValor(dados.tipoImóvel)}`,
        `Área Total: ${verificarValor(dados.areaTotal)} m²`,
        `Número de Cômodos: ${verificarValor(dados.numeroComodos)}`,
        `Vaga de Garagem: ${verificarValor(dados.vagaGaragem) === "S" ? "Sim" : "Não"}`,
        `Mobília: ${verificarValor(dados.mobilia) === "S" ? "Sim" : "Não"}`
    ]);

    addSection("CLÁUSULA 3 - PRAZO DA LOCAÇÃO", [
        `O aluguel será pago conforme estipulado entre as partes, respeitando o artigo 49 da Lei nº 8.245/1991.`,
        `Início: ${verificarValor(dados.dataInicioLocacao)} às ${verificarValor(dados.horaInicial)}`,
        `Término: ${verificarValor(dados.dataTerminoLocacao)} às ${verificarValor(dados.horaFinal)}`,
        `Possibilidade de Renovação: ${verificarValor(dados.possibilidadeRenovacao) === "S" ? "Sim" : "Não"}`,
        `Condições de Renovação: ${verificarValor(dados.quaisCondicoes)}`
    ]);

    addSection("CLÁUSULA 4 - VALOR DO ALUGUEL E FORMA DE PAGAMENTO", [
        `Conforme o artigo 50 da Lei nº 8.245/1991, findo o prazo da locação, o locatário deve restituir o imóvel imediatamente, sob pena de despejo.`,
        `Valor Mensal: R$ ${verificarValor(dados.valorMensal)}`,
        `Vencimento Mensal: ${verificarValor(dados.dataVencMensal)}`,
        `Sinal/Adiantamento: ${verificarValor(dados.sinalAdiantamento) === "S" ? `Sim, valor: R$ ${verificarValor(dados.valorSinal)}, pago em: ${verificarValor(dados.dataPagSinal)}` : "Não"}`,
        `Forma de Pagamento: ${verificarValor(dados.formaPagamento)}`,
        `Multa por Atraso: ${verificarValor(dados.multaAtraso)}%`,
        `Juros Aplicáveis: ${verificarValor(dados.jurosAplicaveis)}%`
    ]);

    addSection("CLÁUSULA 5 - GARANTIAS", [
        "Conforme o artigo 37 da Lei 8.245/1990, qualquer das garantias exigidas para a locação deve constar no contrato, sendo vedada a exigência de mais de uma modalidade para o mesmo contrato.",
        `Garantia: ${verificarValor(dados.garantia) === "S" ? "Sim" : "Não"}`,
        verificarValor(dados.garantia) === "S" ? `Tipo de Garantia: ${verificarValor(dados.qualgarantidor)}` : "",
        verificarValor(dados.qualgarantidor) === "fi" ? `Fiador: ${verificarValor(dados.nomeFiador)}, CPF: ${verificarValor(dados.cpfFiador)}, Endereço: ${verificarValor(dados.enderecoFiador)}` : "",
        verificarValor(dados.qualgarantidor) === "caudep" ? `Valor Título de Caução: R$ ${verificarValor(dados.valorTitCaucao)}` : "",
        verificarValor(dados.qualgarantidor) === "caubem" ? `Descrição do Bem em Caução: ${verificarValor(dados.descBemCaucao)}` : "",
        verificarValor(dados.qualgarantidor) === "ti" ? `Título de Crédito Utilizado: ${verificarValor(dados.descCredUtili)}` : "",
        verificarValor(dados.qualgarantidor) === "segfianca" ? `Seguro-Fiança: ${verificarValor(dados.segFianca)}` : ""
    ]);

    addSection("CLÁUSULA 6 - OBRIGAÇÕES DO LOCADOR", [
        `Garantir o uso pacífico do imóvel conforme o artigo 22 da Lei nº 8.245/1991.`,
        `Realizar reparos estruturais que não sejam de responsabilidade do locatário.`,
        `Uso e Limpeza: ${verificarValor(dados.locadorUsoELimpeza)}`,
        `Fornecimento de Roupas de Cama: ${verificarValor(dados.locadorRoupaCama)}`,
        `Manutenção: ${verificarValor(dados.locadorManu)}`,
        `Limite de Pessoas: $verificarValor({dados.limitePessoas)}, Multa por Excedente: R$ ${verificarValor(dados.multaPorPessoa)}`
    ]);

    addSection("CLÁUSULA 7 - OBRIGAÇÕES DO LOCATÁRIO", [
        `Zelar pelo imóvel e devolvê-lo no estado em que recebeu, conforme artigo 23 da Lei nº 8.245/1991.`,
        `Não realizar modificações sem consentimento prévio do locador.`,
        `Uso apenas para fins residenciais: ${verificarValor(dados.finsResidenciais) === "S" ? "Sim" : "Não"}`,
        `Outros fins especificados: ${verificarValor(dados.qualFim)}`,
        `Responsabilidade por danos: ${verificarValor(dados.responsaLocatario) === "S" ? "Sim" : "Não"}`,
        `Permite Fumar: ${verificarValor(dados.permiteFumar) === "S" ? "Sim" : "Não"}`,
        `Animais Permitidos: ${verificarValor(dados.animais) === "S" ? "Sim" : "Não"}`
    ]);

    addSection("CLÁUSULA 8 - RESCISÃO DO CONTRATO", [
        "De acordo com o artigo 4º da Lei 8.245/1990, o locatário poderá devolver o imóvel antes do prazo contratual, desde que pague a multa estipulada, salvo nos casos previstos por lei.",
        `Condições para cancelamento: ${verificarValor(dados.condicoes)}`,
        `Política de reembolso: ${verificarValor(dados.reembolso)}`,
        `Multas/Penalidades: ${verificarValor(dados.multasEpenalidades)}`,
        `Prazo para notificação: ${verificarValor(dados.prazo)}`
    ]);

    addSection("CLÁUSULA 9 - DISPOSIÇÕES GERAIS", [
        "Nos termos do artigo 41 da Lei 8.245/1990, qualquer alteração no contrato deve ser feita por escrito e assinada por ambas as partes.",
        `Foro eleito: ${verificarValor(dados.foroeleito)}`,
        `Registro em cartório: ${verificarValor(dados.registroCartorio) === "S" ? "Sim" : "Não"}`
    ]);

    addSection("CLÁUSULA 10 - ASSINATURAS", [
        "Assinam o presente contrato as partes envolvidas, em duas vias de igual teor e forma.",
        "Conforme o artigo 5º da Lei 8.245/1990, o contrato de locação pode ser firmado por escrito e conter cláusulas específicas que protejam os direitos de ambas as partes."
    ]);

    doc.text("Locador:", marginX, posY);
    posY += 10;
    doc.text("_______________________________", marginX, posY);
    posY += 5;
    doc.text(`${verificarValorEspecial(dados.locador) === "pf" ? verificarValorEspecial(dados.nomeLocador) : verificarValorEspecial(dados.razaoSocial)}`, marginX, posY);
    posY += 15;

    doc.text("Locatário:", marginX, posY);
    posY += 10;
    doc.text("_______________________________", marginX, posY);
    posY += 5;
    doc.text(`${verificarValorEspecial(dados.locatario) === "pf" ? verificarValorEspecial(dados.nomelocatario) : verificarValorEspecial(dados.razaoSociallocatario)}`, marginX, posY);
    posY += 15;

    if (dados.testemunhas === "S") {
        addSection("TESTEMUNHAS", [
            "As testemunhas abaixo assinam para validar este contrato."
        ]);

        doc.text("Testemunha 1:", marginX, posY);
        posY += 10;
        doc.text("_______________________________", marginX, posY);
        posY += 5;
        doc.text(`${verificarValorEspecial(dados.nomeTest1)} - CPF: ${verificarValorEspecial(dados.cpfTest1)}`, marginX, posY);
        posY += 15;

        doc.text("Testemunha 2:", marginX, posY);
        posY += 10;
        doc.text("_______________________________", marginX, posY);
        posY += 5;
        doc.text(`${verificarValorEspecial(dados.nomeTest2)} - CPF: ${verificarValorEspecial(dados.cpfTest2)}`, marginX, posY);
    }


    doc.save(`contrato_hospedagem_${dados.nomeLocador || dados.nomelocatario}.pdf`);
}