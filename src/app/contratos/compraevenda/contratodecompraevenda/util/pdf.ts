import jsPDF from "jspdf";

export default function geradorPdfFinalizado(data: any) {
    const doc = new jsPDF();

    // Adicionar marca d'água
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(50);
    doc.setTextColor(150, 150, 150); // Cinza claro
    doc.text("Visualização Exemplo", 120, 150, { align: "center", angle: 45 });

    // Título do documento
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0); // Preto
    doc.text("CONTRATO DE COMPRA E VENDA", 105, 20, { align: "center" });

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);

    // Preâmbulo legal
    doc.text(
        "Este contrato é celebrado nos termos dos artigos 481 e seguintes do Código Civil Brasileiro, " +
        "regendo-se pelas cláusulas e condições descritas abaixo.",
        10,
        30,
        { maxWidth: 190 }
    );

    // Identificação das partes
    doc.text("IDENTIFICAÇÃO DAS PARTES", 10, 50);
    doc.text(
        `Comprador: ${data.compradorNome}, ${data.compradorEstadoCivil === "S"
            ? "solteiro(a)"
            : data.compradorEstadoCivil === "CS"
                ? "casado(a)"
                : data.compradorEstadoCivil === "DV"
                    ? "divorciado(a)"
                    : "viúvo(a)"
        }, ${data.compradorProfissao}, portador do ${data.compradorDoc
        } nº ${data.compradorNumDoc}, CPF nº ${data.compradorCpf}, residente em ${data.compradorEndereco
        }.`,
        10,
        60,
        { maxWidth: 190 }
    );
    doc.text(
        `Vendedor: ${data.vendedorNome}, ${data.vendedorEstadoCivil === "S"
            ? "solteiro(a)"
            : data.vendedorEstadoCivil === "CS"
                ? "casado(a)"
                : data.vendedorEstadoCivil === "DV"
                    ? "divorciado(a)"
                    : "viúvo(a)"
        }, ${data.vendedorProfissao}, portador do ${data.vendedorDoc
        } nº ${data.vendedorNumDoc}, CPF nº ${data.vendedorCpf}, residente em ${data.vendedorEndereco
        }.`,
        10,
        80,
        { maxWidth: 190 }
    );

    // Descrição do bem
    doc.text("DESCRIÇÃO DO BEM", 10, 100);
    doc.text(
        `Bem objeto da venda: ${data.descDobemVendido}. Detalhes específicos: ${data.detalhesBemVendido}.`,
        10,
        110,
        { maxWidth: 190 }
    );

    // Condições de entrega
    doc.text("CONDIÇÕES DE ENTREGA", 10, 130);
    doc.text(
        `O bem será entregue ${data.entregaDobem === "hj"
            ? "na data da assinatura deste contrato"
            : `em ${data.dataDaEntrega?.toLocaleDateString("pt-BR")}`
        }, no endereço: ${data.enderecoDeEntrega}. A entrega será realizada ${data.formaDeEntrega === "compradorBusca"
            ? "pelo comprador, que buscará o bem."
            : "pelo vendedor, que se compromete a entregá-lo no local indicado."
        }`,
        10,
        140,
        { maxWidth: 190 }
    );

    // Cláusulas legais
    doc.text("CLÁUSULAS LEGAIS", 10, 160);
    doc.text(
        "1. O vendedor declara que o bem objeto deste contrato está livre de quaisquer ônus, dívidas, ou defeitos ocultos, conforme disposto no artigo 492 do Código Civil.",
        10,
        170,
        { maxWidth: 190 }
    );
    doc.text(
        "2. As partes obrigam-se a cumprir fielmente todas as disposições deste contrato, sob pena de rescisão nos termos do artigo 475 do Código Civil.",
        10,
        180,
        { maxWidth: 190 }
    );
    doc.text(
        "3. O comprador declara estar ciente das condições do bem adquirido e que realizou vistoria prévia, conforme artigo 427 do Código Civil.",
        10,
        190,
        { maxWidth: 190 }
    );
    doc.text(
        "4. Em caso de inadimplência por parte do comprador no pagamento das parcelas, será aplicada multa de 2% sobre o valor devido, além de juros de mora de 1% ao mês, conforme legislação vigente.",
        10,
        200,
        { maxWidth: 190 }
    );

    // Cláusula de foro
    doc.text("CLÁUSULA DE FORO", 10, 220);
    doc.text(
        `Fica eleito o foro da comarca de ${data.foroDeResolucao} para resolver eventuais controvérsias, renunciando a qualquer outro, por mais privilegiado que seja.`,
        10,
        230,
        { maxWidth: 190 }
    );
    // Download do PDF
    doc.save(`contrato_compra_venda_${data.compradorNome}.pdf`);
}
