import { formatarData } from "@/lib/utils";
import jsPDF from "jspdf";


export default function gerarContratoHospedagem(data: any) {
    const doc = new jsPDF();

    const obterValorOuVazio = (valor: any) =>
        valor === undefined || valor === null || valor === "" ? "   " : valor;

    // Título
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("CONTRATO DE LOCAÇÃO DE IMÓVEL PARA HOSPEDAGEM", 105, 20, { align: "center" });

    // Introdução
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);
    doc.text(
        "Pelo presente instrumento particular, as partes abaixo qualificadas ajustam o presente Contrato de Locação de Imóvel, " +
        "que será regido pelas cláusulas e condições descritas a seguir, em conformidade com a legislação brasileira.",
        10,
        30,
        { maxWidth: 190 }
    );

    // Identificação das Partes
    doc.text("IDENTIFICAÇÃO DAS PARTES", 10, 50);
    if (data.locador === 'pf') {
        doc.text(`Locador: ${obterValorOuVazio(data.nomeLocador)}, ${obterValorOuVazio(data.estadoCivilLocador)},
                 ${obterValorOuVazio(data.nacionalidadeLocador)}, ${obterValorOuVazio(data.profissaoLocador)}, portador do(a) ${obterValorOuVazio(data.docidentLocador)} 
                 nº ${obterValorOuVazio(data.numeroDocLocador)}, CPF nº ${obterValorOuVazio(data.cpfLocador)}, residente em ${obterValorOuVazio(data.enderecoLocador)}.`, 10, 60, { maxWidth: 190 });
    } else {
        doc.text(`Locador: ${obterValorOuVazio(data.razaoSocialLocador)}, CNPJ nº ${obterValorOuVazio(data.cnpjLocador)}, com sede em ${obterValorOuVazio(data.enderecoLocadora)}.`, 10, 60, { maxWidth: 190 });
    }

    if (data.hospede === 'pf') {
        doc.text(`Hóspede: ${obterValorOuVazio(data.nomeHospede)}, ${obterValorOuVazio(data.estadoCivilHospede)}, ${obterValorOuVazio(data.nacionalidadeHospede)},
                     ${obterValorOuVazio(data.profissaoHospede)}, portador do(a) ${obterValorOuVazio(data.docidentHospede)} nº ${obterValorOuVazio(data.numeroDocHospede)}, 
                     CPF nº ${obterValorOuVazio(data.cpfHospede)}, residente em ${obterValorOuVazio(data.enderecoHospede)}.`, 10, 80, { maxWidth: 190 });
    } else {
        doc.text(`Hóspede: ${obterValorOuVazio(data.razaoSocialHospede)}, CNPJ nº ${obterValorOuVazio(data.cnpjHospede)}, com sede em ${obterValorOuVazio(data.enderecoHospedeiro)}.`, 10, 80, { maxWidth: 190 });
    }

    // Objeto do Contrato
    doc.text("OBJETO DO CONTRATO", 10, 100);
    doc.text(
        `O presente contrato tem como objeto a locação do imóvel 
                ${obterValorOuVazio(data.tipoDeImovel) === 'cs' ? 'Casa' : obterValorOuVazio(data.tipoDeImovel) === 'flat' ? 'Flat' : 'Outro'}, 
                localizado em ${obterValorOuVazio(data.enderecoImovel)}, conforme descrito: ${obterValorOuVazio(data.descImovel)}.`,
        10,
        110,
        { maxWidth: 190 }
    );

    // Vedação à Sublocação e Empréstimo
    doc.text("VEDAÇÃO À SUBLOCAÇÃO E EMPRÉSTIMO", 10, 130);
    doc.text(
        `Fica expressamente vedada a sublocação ou empréstimo do imóvel, salvo com autorização expressa e por escrito do Locador.`,
        10,
        140,
        { maxWidth: 190 }
    );

    // Valor e Condições de Pagamento
    doc.text("VALOR E CONDIÇÕES DE PAGAMENTO", 10, 160);
    doc.text(
        `O valor da hospedagem será de R$ ${obterValorOuVazio(data.valordahospedagem)} 
                por ${obterValorOuVazio(data.cobrancaHospedagem) === 'd' ? 'dia' : obterValorOuVazio(data.cobrancaHospedagem) === 'mes' ? 'mês' : 'outra frequência'}.`,
        10,
        170,
        { maxWidth: 190 }
    );
    if (data.antecipaPagReserva === 'S') {
        doc.text(`Foi paga uma antecipação de R$ ${obterValorOuVazio(data.valorAntecipa)} como reserva.`, 10, 180, { maxWidth: 190 });
    }

    // Regras de Ocupação
    doc.text("REGRAS DE OCUPAÇÃO", 10, 200);
    doc.text(
        `O imóvel será ocupado por até ${obterValorOuVazio(data.qtdPessoasAutorizadas)} pessoa(s). 
                O descumprimento dessa regra acarretará multa de R$ ${obterValorOuVazio(data.valorMultaPesExcendente)}.`,
        10,
        210,
        { maxWidth: 190 }
    );
    if (data.regrasExpeHospedes === 'S') {
        doc.text(`Regras adicionais para hóspedes: ${obterValorOuVazio(data.descRegrasHospedes)}.`, 10, 220, { maxWidth: 190 });
    }

    // Garantia e Benfeitorias
    doc.text("GARANTIA E BENFEITORIAS", 10, 240);
    doc.text(
        `Será exigida garantia do tipo ${obterValorOuVazio(data.garantidorHosp)}. Caso o Locador autorize benfeitorias, as mesmas 
                deverão ser custeadas por ${obterValorOuVazio(data.pagadorBemFeitorias)}.`,
        10,
        250,
        { maxWidth: 190 }
    );

    // Rescisão, Descumprimento e Multas
    doc.addPage();
    doc.text("RESCISÃO, DESCUMPRIMENTO E MULTAS", 10, 20);
    doc.text(
        `Em caso de rescisão antecipada sem justa causa, será aplicada multa de R$ ${obterValorOuVazio(data.valorMultaRompimento)}. 
                Caso o Hóspede descumpra quaisquer cláusulas deste contrato, será aplicada multa de R$ ${obterValorOuVazio(data.valorMultaDesc)}.`,
        10,
        30,
        { maxWidth: 190 }
    );

    // Foro
    doc.text("FORO", 10, 60);
    doc.text(
        `As partes elegem o foro da cidade de ${obterValorOuVazio(data.cidadeAssinatura)} 
                para dirimir quaisquer questões oriundas deste contrato, renunciando a qualquer outro, por mais privilegiado que seja.`,
        10,
        70,
        { maxWidth: 190 }
    );

    // Data de Assinatura
    doc.text("DATA DE ASSINATURA", 10, 90);
    doc.text(`Este contrato foi firmado na cidade de ${obterValorOuVazio(data.cidadeAssinatura)}, em ${formatarData(data.dataAssinatura)}.`, 10, 100, { maxWidth: 190 });

    // Assinaturas
    doc.text("ASSINATURAS", 10, 120);
    doc.text("_________________________", 10, 130);
    doc.text("Locador", 10, 135);
    doc.text("_________________________", 100, 130);
    doc.text("Hóspede", 100, 135);

    if (data.duastestemunhas === 'S') {
        doc.text("_________________________", 10, 150);
        doc.text(`Testemunha 1: ${data.nomeTest1}, CPF: ${data.cpfTest1}`, 10, 155);
        doc.text("_________________________", 100, 150);
        doc.text(`Testemunha 2: ${data.nomeTest2}, CPF: ${data.cpfTest2}`, 100, 155);
    }


    // Salvar o PDF
    doc.save(`contrato_hospedagem_${data.nomeHospede || data.razaoSocialHospede}.pdf`);
}
