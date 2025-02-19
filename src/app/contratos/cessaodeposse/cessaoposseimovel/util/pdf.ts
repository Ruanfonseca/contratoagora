import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function geradorPossePago(dados: any) {
    const doc = new jsPDF();

    const marginX = 10;
    const pageWidth = 190;
    let posY = 20;

    const addSection = (title: string, content: any) => {
        if (posY + 10 >= 280) {
            doc.addPage();
            posY = 20;
        }
        doc.setFontSize(12);
        doc.text(title, 105, posY, { align: "center" });
        posY += 10;

        doc.setFontSize(10);
        content.forEach((text: any) => {
            const lines = doc.splitTextToSize(text, pageWidth - 2 * marginX);
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

    doc.setFontSize(14);
    doc.text("CONTRATO DE CESSÃO DE POSSE DE IMÓVEL", 105, posY, { align: "center" });
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

    // Seção 2: Descrição do Imóvel
    addSection("2. Descrição do Imóvel", [
        `Tipo: ${verificarValor(dados.tipodoImovel)}`,
        `Endereço: ${verificarValor(dados.endereco)}`,
        `Área Total: ${verificarValor(dados.areaTotal)} m²`,
        `Matrícula: ${verificarValor(dados.matriculaCartorio)}`,
        `Número de Registro: ${verificarValor(dados.numeroRegistro)}`,
        `Descrição Detalhada: ${verificarValor(dados.descDetalhada)}`,
        "Conforme o artigo 1.227 do Código Civil, os direitos sobre imóveis devem ser registrados para produzir efeitos contra terceiros."
    ]);

    // Seção 3: Título da Posse e Situação Legal do Imóvel
    addSection("3. Título da Posse e Situação Legal do Imóvel", [
        `Origem da Posse: ${verificarValor(dados.origemDaPosseCedente)}`,
        `Posse Adquirida por: ${verificarValor(dados.posseAdquirida)}`,
        `Regularização: ${verificarValor(dados.regularizacao) === 'S' ? 'Sim' : 'Não'}`,
        `Pendências: ${verificarValor(dados.existePendencias) === 'S' ? verificarValor(dados.debitos) : 'Nenhuma'}`,
        `Ônus ou Restrições: ${verificarValor(dados.restricaoOnus)}`,
        `Litígios: ${verificarValor(dados.litigios)}`,
        `Terceiros Envolvidos: ${verificarValor(dados.terceiros) === 'S' ? verificarValor(dados.comoAlocados) : 'Não'}`,
        "Nos termos do artigo 1.196 do Código Civil, possuidor é aquele que tem de fato o exercício, pleno ou não, de algum dos poderes inerentes à propriedade."
    ]);

    // Seção 4: Objeto da Cessão
    addSection("4. Objeto da Cessão", [
        `Posse ${verificarValor(dados.posseTotalParcial)}`,
        `Direitos do Cessionário: ${verificarValor(dados.direitosCessionario)}`,
        "A cessão de direitos possessórios deve observar o disposto no artigo 1.225, inciso XIII, do Código Civil, que trata dos direitos reais sobre coisa alheia."
    ]);

    // Seção 5: Valor e Condições de Pagamento
    addSection("5. Valor e Condições de Pagamento", [
        `Receberá Valor: ${verificarValor(dados.receberaValor) === 'S' ? 'Sim' : 'Não'}`,
        `Valor: ${verificarValor(dados.qualValorCessao)}`,
        `Forma de Pagamento: ${verificarValor(dados.formaPagamento)}`,
        `Conta para Recebimento: ${verificarValor(dados.contaBancariaRecebimento)}`,
        `Parcelamento: ${verificarValor(dados.formaPagamento) === 'Parcelado' ? `${verificarValor(dados.quantasParcelas)} parcelas, vencendo em ${verificarValor(dados.dataVencimentoParcela)}` : 'Não Aplicável'}`,
        `Multa por Atraso: ${verificarValor(dados.multaPorAtrasoPagamento)}`,
        `Juros por Atraso: ${verificarValor(dados.jurosporatraso)}`,
        "Nos termos do artigo 481 do Código Civil, pelo contrato de compra e venda, um dos contratantes se obriga a transferir o domínio de certa coisa e o outro a pagar-lhe certo preço em dinheiro."
    ]);

    // Seção 6: Prazos
    addSection("6. Prazos", [
        `Prazo: ${verificarValor(dados.prazoDeterminado) === 'determinado' ? 'Determinado' : 'Indeterminado'}`,
        `Data de Início: ${verificarValor(dados.dataInicio)}`,
        `Data de Término: ${verificarValor(dados.prazoDeterminado) === 'determinado' ? verificarValor(dados.dataTermino) : 'Não Aplicável'}`,
        "O artigo 476 do Código Civil dispõe que, nos contratos bilaterais, nenhum dos contratantes pode exigir o cumprimento da obrigação do outro antes de cumprir a sua."
    ]);

    // Seção 7: Benfeitorias e Modificações
    addSection("7. Benfeitorias e Modificações", [
        `Cessionário Autorizado a Realizar Benfeitorias: ${verificarValor(dados.cessionarioAutorizado) === 'S' ? 'Sim' : 'Não'}`,
        `Benfeitorias Indenizáveis: ${verificarValor(dados.benfeitoriasIndenizaveis) === 'S' ? 'Sim' : 'Não'}`,
        `Restrições às Modificações: ${verificarValor(dados.restricaoMod)}`,
        "Conforme o artigo 1.225 do Código Civil, o proprietário tem a faculdade de usar, gozar e dispor da coisa, e o direito de reavê-la do poder de quem quer que injustamente a possua ou detenha."
    ]);

    // Seção 8: Rescisão e Penalidades
    addSection("8. Rescisão e Penalidades", [
        `Multas e Penalidades: ${verificarValor(dados.multasPenalidades)}`,
        `Prazos para Rescisão: ${verificarValor(dados.prazos)}`,
        "O artigo 473 do Código Civil estabelece que a rescisão do contrato pode ocorrer por mútuo consentimento ou por causas previstas em lei."
    ]);


    addSection("9.Obrigações das Partes", [`
            Cedente: 
            Garantir que o imóvel está livre de pendências ou ônus não informados no contrato. 
            Entregar o imóvel em condições de uso, salvo acordo contrário. 
            Fornecer todos os documentos relacionados à posse (ex.: contrato anterior, comprovantes de pagamentos de IPTU, etc.). 

            Cessionário: 
            Utilizar o imóvel de acordo com a finalidade prevista no contrato. 
            Assumir a responsabilidade por débitos futuros relacionados ao imóvel (ex.: IPTU, taxas, contas de consumo). 
            Restituir o imóvel, caso aplicável, nas mesmas condições de recebimento, salvo benfeitorias autorizadas. 
            `])
    // Seção 9: Disposições Gerais
    addSection("10. Disposições Gerais", [
        `Foro: ${verificarValor(dados.foroResolucaoConflitos)}`,
        `Testemunhas Necessárias: ${verificarValor(dados.testemunhasNecessarias) === 'S' ? `${verificarValor(dados.nomeTest1)} (CPF: ${verificarValor(dados.cpfTest1)}), ${verificarValor(dados.nomeTest2)} (CPF: ${verificarValor(dados.cpfTest2)})` : 'Não'}`,
        `Registro em Cartório: ${verificarValor(dados.registroCartorio) === 'S' ? 'Sim' : 'Não'}`,
        "Conforme o artigo 75 do Código Civil, pessoas jurídicas são representadas ativa e passivamente, em juízo e fora dele, por quem os atos constitutivos designarem."
    ]);

    doc.save(`contrato_cessaoimovel_${verificarValor(dados.Cedente) === 'pf' ? verificarValor(dados.nomeCedente) : verificarValor(dados.razaoSocial)}.pdf`);

};