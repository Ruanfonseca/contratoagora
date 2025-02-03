import { verificarValor, verificarValorEspecial } from "@/lib/utils";
import jsPDF from "jspdf";

export default function geradorpdflocacaoveiculopago(dados: any) {
    const doc = new jsPDF();

    // Configuração inicial de fonte e margens
    const marginX = 10;
    const pageWidth = 190; // Largura da página útil (A4 menos margens)
    let posY = 20;

    // Função auxiliar para adicionar seções e ajustar a posição Y
    const addSection = (title: string, content: string[]) => {
        if (posY + 10 >= 280) {
            doc.addPage();
            posY = 20;
        }
        doc.setFontSize(12);
        doc.text(title, 105, posY, { align: "center" }); // Centralizado
        posY += 10;

        doc.setFontSize(10);
        content.forEach((text) => {
            const lines = doc.splitTextToSize(text, pageWidth - 2 * marginX); // Divide o texto automaticamente
            lines.forEach((line: any) => {
                if (posY + 7 >= 280) {
                    doc.addPage();
                    posY = 20;
                }
                doc.text(line, marginX, posY);
                posY += 7;
            });
        });
    };

    // Cabeçalho
    doc.setFontSize(14);
    doc.text("CONTRATO DE LOCAÇÃO DE VEÍCULOS", 105, posY, { align: "center" });
    posY += 15;

    // CLÁUSULA PRIMEIRA – DA IDENTIFICAÇÃO DAS PARTES
    addSection("\nCLÁUSULA PRIMEIRA – DA IDENTIFICAÇÃO DAS PARTES", [
        "Conforme o Código Civil Brasileiro (Art. 104 e Art. 566), as partes devem ser plenamente capazes e identificadas de forma clara. O locador e o locatário declaram estar aptos para firmar o presente contrato.",
        "- As partes devem ser plenamente capazes e identificadas de forma clara.",
        `Locador: ${verificarValor(dados.locador) === "pf" ? "Pessoa Física" : "Pessoa Jurídica"}`,
        verificarValor(dados.locador) === "pf"
            ? `Nome: ${verificarValor(dados.nomeLocador)}, CPF: ${verificarValor(dados.CPFLocador)}`
            : `Razão Social: ${verificarValor(dados.razaoSocial)}, CNPJ: ${verificarValor(dados.cnpj)}`,
        `Endereço: ${verificarValor(dados.enderecoLocador)}`,
        `Telefone: ${verificarValor(dados.telefoneLocador)}`,
        `E-mail: ${verificarValor(dados.emailLocador)}`,
        verificarValor(dados.locador) === "pj" ? `Representante Legal: ${verificarValor(dados.nomeRepresentanteCNPJ)}, CPF: ${verificarValor(dados.CPFRepresentanteCNPJ)}` : "",
        "",
        `Locatário: ${verificarValor(dados.locatario) === "pf" ? "Pessoa Física" : "Pessoa Jurídica"}`,
        verificarValor(dados.locatario) === "pf"
            ? `Nome: ${verificarValor(dados.nomelocatario)}, CPF: ${verificarValor(dados.CPFlocatario)}`
            : `Razão Social: ${verificarValor(dados.razaoSociallocatario)}, CNPJ: ${verificarValor(dados.cnpjLocatario)}`,
        `Endereço: ${verificarValor(dados.enderecolocatario)}`,
        `Telefone: ${verificarValor(dados.telefonelocatario)}`,
        `E-mail: ${verificarValor(dados.emaillocatario)}`,
        verificarValor(dados.locatario) === "pj" ? `Representante Legal: ${verificarValor(dados.nomeRepresentantelocatarioCNPJ)}, CPF: ${verificarValor(dados.CPFRepresentantelocatarioCNPJ)}` : "",
    ]);

    // CLÁUSULA SEGUNDA – DESCRIÇÃO DO VEÍCULO
    addSection("\nCLÁUSULA SEGUNDA – DESCRIÇÃO DO VEÍCULO", [

        `Marca: ${verificarValor(dados.marca)}`,
        `Modelo: ${verificarValor(dados.modelo)}`,
        `Ano de Fabricação: ${verificarValor(dados.anoFabricacao)}`,
        `Cor: ${verificarValor(dados.cor)}`,
        `Placa: ${verificarValor(dados.placa)}`,
        `Renavam: ${verificarValor(dados.renavam)}`,
        `Quilometragem Atual: ${verificarValor(dados.quilometragem)}`,
        `Estado Geral do Veículo: ${verificarValor(dados.estadoGeral)}`,
    ]);

    // CLÁUSULA TERCEIRA – PRAZO DA LOCAÇÃO
    addSection("\nCLÁUSULA TERCEIRA – PRAZO DA LOCAÇÃO", [
        "Nos termos do Art. 565 do Código Civil, o locador se obriga a ceder o uso do veículo ao locatário pelo período e condições estabelecidos neste contrato.",
        `Data de Início da Locação: ${verificarValor(dados.dataInicioLoc)}`,
        `Data de Término da Locação: ${verificarValor(dados.dataFimLoc)}`,
        `Possibilidade de Renovação: ${verificarValor(dados.possibilidadeRenov) === "S" ? "Sim" : "Não"}`,
        verificarValor(dados.possibilidadeRenov) === "S" ? `Condições de Renovação: ${verificarValor(dados.quaisCondicoes)}` : "",
    ]);

    // CLÁUSULA QUARTA – VALOR DO ALUGUEL E CONDIÇÕES DE PAGAMENTO
    addSection("\nCLÁUSULA QUARTA – VALOR DO ALUGUEL E CONDIÇÕES DE PAGAMENTO", [
        "O pagamento do aluguel deverá seguir as disposições do Art. 565 do Código Civil, sendo que qualquer atraso poderá acarretar penalidades previstas em lei.",

        `Valor do Aluguel: ${verificarValor(dados.valor)} (${verificarValor(dados.comoSeraCobrado)})`,
        `Forma de Pagamento: ${verificarValor(dados.formaPagamento)}`,
        `Data(s) de Pagamento: ${verificarValor(dados.dataPag)}`,
        `Exigência de Sinal ou Adiantamento: ${verificarValor(dados.sinal) === "S" ? "Sim" : "Não"}`,
        verificarValor(dados.sinal) === "S" ? `Valor do Sinal: ${verificarValor(dados.qualValor)}, Data de Pagamento: ${verificarValor(dados.dataPagSinal)}` : "",
        `Multa por Atraso no Pagamento: ${verificarValor(dados.multaPagamento)}`,
        `Juros Aplicáveis em Caso de Atraso: ${verificarValor(dados.juros)}`,
    ]);

    // CLÁUSULA QUINTA – GARANTIAS LOCATÍCIAS
    addSection("\nCLÁUSULA QUINTA – GARANTIAS LOCATÍCIAS", [
        "Nos termos do Art. 602 do Código Civil, poderá ser exigida garantia para assegurar o cumprimento do contrato, conforme acordado entre as partes.",

        `Tipo de Garantia Exigida: ${verificarValor(verificarValor(dados.garantia) === "S" ? "Sim" : "Não")}`,
        verificarValor(dados.garantia) === "S" ? `Detalhes da Garantia: ${verificarValor(dados.qualgarantidor)}` : "",
        verificarValor(dados.qualgarantidor) === "fi"
            ? `Fiador: ${verificarValor(dados.nomeFiador)}, CPF: ${verificarValor(dados.cpfFiador)}, Endereço: ${verificarValor(dados.enderecoFiador)}`
            : "",
        verificarValor(dados.qualgarantidor) === "caudep" ? `Valor da Caução em Dinheiro: ${verificarValor(dados.valorTitCaucao)}` : "",
        verificarValor(dados.qualgarantidor) === "caubem" ? `Descrição do Bem em Caução: ${verificarValor(dados.descBemCaucao)}` : "",
        verificarValor(dados.qualgarantidor) === "ti" ? `Título de Crédito Utilizado: ${verificarValor(dados.descCredUtili)}` : "",
        verificarValor(dados.qualgarantidor) === "segfianca" ? `Seguro-Fiança: ${verificarValor(dados.segFianca)}` : "",
        `Procedimento para Devolução da Garantia: ${verificarValor(dados.procedimentoDevolucao)}`,
    ]);

    // CLÁUSULA SEXTA – OBRIGAÇÕES DO LOCADOR
    addSection("\nCLÁUSULA SEXTA – OBRIGAÇÕES DO LOCADOR", [
        "O locador deverá garantir ao locatário o uso pacífico do bem locado, nos termos do Art. 569 do Código Civil, sendo responsável por manutenções essenciais ao funcionamento do veículo.",

        `O locador se responsabiliza por: ${verificarValor(dados.locadorResponsaManu)}`,
        `Serviços Adicionais Fornecidos: ${verificarValor(dados.locadorServicoAdicional)}`,
    ]);

    // CLÁUSULA SÉTIMA – OBRIGAÇÕES DO LOCATÁRIO
    addSection("\nCLÁUSULA SÉTIMA – OBRIGAÇÕES DO LOCATÁRIO", [
        "Conforme o Art. 570 do Código Civil, o locatário deverá utilizar o veículo de forma adequada e devolver o bem no estado em que o recebeu, salvo o desgaste natural.",

        `O locatário pode sublocar ou ceder o veículo a terceiros? ${verificarValor(dados.locatarioSublocar)}`,
        `O locatário é responsável por: ${verificarValor(dados.locatarioManu)}`,
        `O locatário deve respeitar as leis de trânsito? ${verificarValor(dados.locatarioLeis)}`,
        `O locatário é responsável por multas e infrações? ${verificarValor(dados.locatarioMultas)}`,
        `O locatário deve comunicar acidentes ou danos? ${verificarValor(dados.locatarioComuni)}`,
        `O locatário deve devolver o veículo no mesmo estado? ${verificarValor(dados.locatarioDesgaste)}`,
    ]);

    // CLÁUSULA OITAVA – DESPESAS E TRIBUTOS
    addSection("\nCLÁUSULA OITAVA – DESPESAS E TRIBUTOS", [
        "Nos termos do Código Civil, despesas ordinárias decorrentes do uso do veículo são de responsabilidade do locatário, enquanto despesas extraordinárias ficam a cargo do locador.",

        `Despesas do Locatário: ${verificarValor(dados.despesasLocatario)}`,
        `Despesas do Locador: ${verificarValor(dados.despesaLocador)}`,
    ]);

    // CLÁUSULA NONA – RESCISÃO DO CONTRATO
    addSection("\nCLÁUSULA NONA – RESCISÃO DO CONTRATO", [
        "A rescisão do contrato poderá ocorrer conforme as regras do Art. 474 do Código Civil, sendo aplicáveis penalidades em caso de descumprimento.",

        `Condições para Rescisão Antecipada: ${verificarValor(dados.condicoesAntecipada)}`,
        `Multas ou Penalidades: ${verificarValor(dados.multasRescisao)}`,
        `Prazo para Notificação Prévia: ${verificarValor(dados.prazoNoti)}`,
    ]);

    // CLÁUSULA DÉCIMA – DISPOSIÇÕES GERAIS
    addSection("\nCLÁUSULA DÉCIMA – DISPOSIÇÕES GERAIS", [
        "Nos termos do Art. 585 do Código Civil, este contrato constitui título executivo extrajudicial, podendo ser levado a juízo para cobrança de valores inadimplidos.",

        `Foro Eleito para Resolução de Conflitos: ${verificarValor(dados.foroeleito)}`,
        `Necessidade de Testemunhas: ${verificarValor(dados.testemunhas) === "S" ? "Sim" : "Não"}`,
        dados.testemunhas === "S"
            ? `Testemunha 1: ${verificarValor(dados.nomeTest1)}, CPF: ${verificarValor(dados.cpfTest1)}`
            : "",
        dados.testemunhas === "S"
            ? `Testemunha 2: ${verificarValor(dados.nomeTest2)}, CPF: ${verificarValor(dados.cpfTest2)}`
            : "",
        `O contrato será registrado em cartório? ${verificarValor(dados.registroCartorio) === "S" ? "Sim" : "Não"}`,
    ]);

    addSection("\nCLÁUSULA DÉCIMA PRIMEIRA – ASSINATURAS", [
        "As partes contratantes, após leitura e entendimento das condições estabelecidas neste contrato, assinam o presente em duas vias de igual teor e forma.",
        "",
        `Locador: _____________________________  (Assinatura)`,
        `Locatário: _____________________________  (Assinatura)`,
        verificarValorEspecial(dados.testemunhas) === "S" ? `Testemunha 1: _____________________________  (Assinatura)` : "",
        verificarValorEspecial(dados.testemunhas) === "S" ? `Testemunha 2: _____________________________  (Assinatura)` : "",
    ]);


    doc.save(`contrato_locacaoveiculo_${dados.nomeLocador || dados.nomelocatario}.pdf`);

}