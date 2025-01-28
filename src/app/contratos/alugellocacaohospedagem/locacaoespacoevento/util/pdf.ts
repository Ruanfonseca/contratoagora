import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function gerarContratoPago(dados: any): void {
    const doc = new jsPDF();

    function configurarDocumento() {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(16);
        doc.text(
            "Contrato de Locação de Espaço para Evento",
            105,
            20,
            { align: "center" }
        );
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(12);
    }

    function addSection(title: string, content: string) {
        // Verificar espaço antes de adicionar título
        if (y + 20 > 280) {
            doc.addPage();
            y = 20;
        }

        // Adicionar título
        doc.setFont("Helvetica", "bold");
        doc.text(title, 105, y, { align: "center" });
        y += 10;

        // Adicionar conteúdo com quebra automática
        doc.setFont("Helvetica", "normal");
        const lines = doc.splitTextToSize(content, 180); // 180 é a largura disponível
        lines.forEach((line: string) => {
            if (y + 10 > 280) {
                doc.addPage();
                y = 20;
            }
            doc.text(line, 10, y);
            y += 6; // Espaçamento entre linhas
        });
        y += 10; // Espaçamento entre seções
    }

    function adicionarAssinaturas() {
        if (y + 30 > 280) {
            doc.addPage();
            y = 20;
        }
        y += 20;
        doc.setFont("Helvetica", "bold");
        doc.text("Assinaturas", 105, y, { align: "center" });
        y += 10;

        doc.setFont("Helvetica", "normal");
        doc.text("_______________________________", 60, y);
        doc.text(`Locador: ${verificarValor(dados.locador)}`, 60, y + 6);
        y += 20;

        doc.text("_______________________________", 60, y);
        doc.text(`Locatário: ${verificarValor(dados.locatario)}`, 60, y + 6);
        y += 20;

        if (verificarValor(dados.testemunhas) === "S") {
            doc.text("_______________________________", 60, y);
            doc.text(`Testemunha 1: ${verificarValor(dados.nomeTest1)}`, 60, y + 6);
            y += 20;

            doc.text("_______________________________", 60, y);
            doc.text(`Testemunha 2: ${verificarValor(dados.nomeTest2)}`, 60, y + 6);
            y += 20;
        }

        doc.text("_______________________________", 60, y);
        doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 60, y + 6);
    }

    // Inicializar PDF
    let y = 30; // Controle da posição vertical
    configurarDocumento();
    // Adicionar conteúdo
    addSection(
        "CLÁUSULA PRIMEIRA – DA IDENTIFICAÇÃO DAS PARTES",
        `Locador: ${verificarValor(dados.locador) === "pj" ? verificarValor(dados.razaoSocial) : verificarValor(dados.nomeLocador)}
                    CPF/CNPJ: ${verificarValor(dados.locador) === "pj" ? verificarValor(dados.cnpjlocador) : verificarValor(dados.CPFLocador)}
                    Endereço: ${verificarValor(dados.locador) === "pj" ? verificarValor(dados.enderecoCNPJ) : verificarValor(dados.enderecoLocador)}
                    Contato: ${verificarValor(dados.locador) === "pj"
            ? `${verificarValor(dados.telefoneCNPJ)}, ${verificarValor(dados.emailCNPJ)}`
            : `${verificarValor(dados.telefoneLocador)}, ${verificarValor(dados.emailLocador)}`}
                    Representante Legal: ${verificarValor(dados.locador) === "pj"
            ? `${verificarValor(dados.nomeRepresentanteCNPJ)}, CPF: ${verificarValor(dados.CPFRepresentanteCNPJ)}`
            : "N/A"}
    
                    Locatário: ${verificarValor(dados.locatario) === "pj"
            ? verificarValor(dados.razaoSociallocatario)
            : verificarValor(dados.nomelocatario)}
                    CPF/CNPJ: ${verificarValor(dados.locatario) === "pj" ? verificarValor(dados.cnpj) : verificarValor(dados.CPFlocatario)}
                    Endereço: ${verificarValor(dados.locatario) === "pj"
            ? verificarValor(dados.enderecolocatarioCNPJ)
            : verificarValor(dados.enderecolocatario)}
                    Contato: ${verificarValor(dados.locatario) === "pj"
            ? `${verificarValor(dados.telefonelocatarioCNPJ)}, ${verificarValor(dados.emaillocatarioCNPJ)}`
            : `${verificarValor(dados.telefonelocatario)}, ${verificarValor(dados.emaillocatario)}`}
                    Representante Legal: ${verificarValor(dados.locatario) === "pj"
            ? `${verificarValor(dados.nomeRepresentantelocatarioCNPJ)}, CPF: ${verificarValor(dados.CPFRepresentantelocatarioCNPJ)}`
            : "N/A"}  
                    
                     Art. 104, 421, 422 e 425 do Código Civil Brasileiro - Regula os contratos e as condições para a sua validade, incluindo a liberdade contratual e os elementos essenciais do contrato.
                    `,

    );

    addSection(
        "CLÁUSULA SEGUNDA – DA DESCRIÇÃO DO ESPAÇO LOCADO",
        `   Nome do local: ${verificarValor(dados.nomeEstabelecimento)}
                        Endereço: ${verificarValor(dados.enderecoEstabelecimento)}
                        Descrição: ${verificarValor(dados.descricaoAreaLocacao)}
                        Capacidade máxima: ${verificarValor(dados.capacidadeMaxima)}
                        Equipamentos disponíveis: ${verificarValor(dados.equipamentoEmobiliadisp)}
                        Condições atuais: ${verificarValor(dados.condicoesAtuais)}
                    
                        Art. 565 e 566 do Código Civil Brasileiro - O contrato de locação de imóvel deve descrever de forma clara e precisa as condições do bem locado, sua destinação e as condições do uso.
                `),

        addSection(
            "CLÁUSULA TERCEIRA – DA FINALIDADE DO EVENTO",
            `   Tipo de evento: ${verificarValor(dados.tipoDeEvento)}
                        Atividades previstas: ${verificarValor(dados.atividadesNoEvento)}
                        Horário: ${verificarValor(dados.horariodeinicio)} às ${verificarValor(dados.horariodetermino)}
                        Necessidade de montagem/desmontagem: ${verificarValor(dados.necessidadeDesmontagem) === "S"
                ? `Sim, horários: ${verificarValor(dados.quaisHorariosPrevistos)}`
                : "Não"}
                        
                        Art. 564 do Código Civil Brasileiro - Define a utilização do espaço conforme o contrato e a finalidade acordada, garantindo o cumprimento da função prevista para o evento.
                        `,
        );

    addSection(
        "CLÁUSULA QUARTA – DO PRAZO DA LOCAÇÃO",
        `   Data de início: ${verificarValor(dados.dataInicioDaLocacao)}
                    Data de término: ${verificarValor(dados.dataFimDaLocacao)}
                    Horário de uso: ${verificarValor(dados.horarioInicioUsoEspaco)} às ${verificarValor(dados.horarioTerminoUsoEspaco)}
                    Tempo adicional: ${verificarValor(dados.tempoAdicional) === "S"
            ? `Sim, horários: ${verificarValor(dados.horarioInicioPrepOuMont)} às ${verificarValor(dados.horarioFimPrepOuMont)}`
            : "Não"}
                    Art. 565 do Código Civil Brasileiro - Estabelece as condições para o prazo de locação, incluindo a possibilidade de prorrogação ou tempo adicional.
                    `,

    );

    addSection(
        "CLÁUSULA QUINTA – DO VALOR E CONDIÇÕES DE PAGAMENTO",
        `   Valor total: ${verificarValor(dados.valorTotalLocacao)}
                    Forma de pagamento: ${verificarValor(dados.formaPagamento)}
                    Vencimento: ${verificarValor(dados.dataVencimentoParcela)}
                    Multa por atraso: ${verificarValor(dados.multaPorAtrasoPagamento)}
                    Juros por atraso: ${verificarValor(dados.jurosporatraso)}
                    Valor do sinal: ${verificarValor(dados.valorSinal)}
                    Política de reembolso: ${verificarValor(dados.condicoesCancelamento)}
                    Art. 396, 397 e 408 do Código Civil Brasileiro - Trata das condições de pagamento, multa por atraso e do direito de reembolso nas situações de cancelamento ou inadimplemento.
                    `,
    );

    addSection(
        "CLÁUSULA SEXTA – DAS GARANTIAS",
        `Garantia exigida: ${verificarValor(dados.garantia) === "S" ? "Sim" : "Não"}
                      Tipo: ${verificarValor(dados.qualgarantidor) === "fi"
            ? ` Fiador - Nome: ${verificarValor(dados.nomeFiador)}, CPF: ${verificarValor(dados.cpfFiador)}`
            : verificarValor(dados.qualgarantidor) === "caudep"
                ? `Caução em dinheiro - Valor: ${verificarValor(dados.valorTitCaucao)}`
                : "Outro tipo"}
                        Art. 565 e 580 do Código Civil Brasileiro - Refere-se à exigência de garantias no contrato de locação, como fiador, caução ou outras garantias legais.
                        `,

    );

    addSection(
        "CLÁUSULA SÉTIMA – DAS OBRIGAÇÕES DO LOCADOR",
        `Entrega em perfeitas condições: ${verificarValor(dados.entregaPerfeita) === "S" ? "Sim" : "Não"}
                    Serviços adicionais: ${verificarValor(dados.servicosAdicionais) === "naooferecera"
            ? "Não oferece serviços adicionais"
            : verificarValor(dados.servicosAdicionais)}
                    Disponibilidade técnica para equipamentos: ${verificarValor(dados.disponibilidadeTecnica) === "S" ? "Sim" : "Não"}
                    Art. 566 e 567 do Código Civil Brasileiro - O locador tem a obrigação de entregar o imóvel em condições adequadas e fornecer suporte técnico, se aplicável.
                 `,

    );

    addSection(
        "CLÁUSULA OITAVA – DAS OBRIGAÇÕES DO LOCATÁRIO",
        `Comprometimento com o uso adequado: ${verificarValor(dados.comprometimento) === "S" ? "Sim" : "Não"}
                    Responsabilidade por danos: ${verificarValor(dados.danosLocatario) === "S" ? "Sim" : "Não"}
                    Restrições de atividades: ${verificarValor(dados.restricoes) === "S" ? "Sim" : "Não"}
                    Arcar com manutenção: ${verificarValor(dados.arca) === "S" ? "Sim" : "Não"}
                    Art. 567 e 568 do Código Civil Brasileiro - O locatário deve garantir o uso adequado do imóvel, responder por danos e cumprir com as responsabilidades assumidas no contrato.
                    `,
    );

    addSection(
        "CLÁUSULA NONA – DAS REGRAS DE USO",
        `Regras para som e iluminação: ${verificarValor(dados.regraSom)}
                    Regras para consumo de bebidas e alimentos: ${verificarValor(dados.regraBebida)}
                    Proibições: ${verificarValor(dados.proibicaoAtividade)}
                    Responsabilidade por licenças: ${verificarValor(dados.responsabilidade)}
                    Art. 569 do Código Civil Brasileiro - O locatário deve respeitar as condições de uso do imóvel conforme estipulado no contrato, incluindo regras para eventos e consumo de alimentos e bebidas.
                    `,
    );

    addSection(
        "CLÁUSULA DÉCIMA – DA DEVOLUÇÃO DO ESPAÇO LOCADO",
        `Local de devolução: ${verificarValor(dados.localDevolucao)}
                    Condições para devolução: ${verificarValor(dados.condicoesDevolucao)}
                    Procedimento de inspeção: ${verificarValor(dados.inspecao)}
                    Penalidades por avarias: ${verificarValor(dados.penalidadesAvaria)}
                    Art. 567 do Código Civil Brasileiro - Define as obrigações do locatário ao devolver o espaço, incluindo as condições e possíveis penalidades por danos ou falta de conservação.
                    `,

    );

    addSection(
        "CLÁUSULA DÉCIMA PRIMEIRA – DA RESCISÃO DO CONTRATO",
        `Condições de rescisão antecipada: ${verificarValor(dados.condicoesAntecipada)}
                    Multas ou penalidades: ${verificarValor(dados.multasRescisao)}
                    Prazo para notificação prévia: ${verificarValor(dados.prazoNoti)}
                    Art. 474 e 475 do Código Civil Brasileiro - Estabelece as condições para rescisão contratual, incluindo multas e a necessidade de notificação prévia.
                    `,

    );

    addSection(
        "CLÁUSULA DÉCIMA SEGUNDA – DAS DISPOSIÇÕES GERAIS",
        `Foro eleito: ${verificarValor(dados.foroeleito)}
                 Testemunhas: ${verificarValor(dados.testemunhas) === "S"
            ? `Sim, Nome Testemunha 1: ${verificarValor(dados.nomeTest1)}, CPF: ${verificarValor(dados.cpfTest1)}; Nome Testemunha 2: ${verificarValor(dados.nomeTest2)}, CPF: ${verificarValor(dados.cpfTest2)}`
            : "Não"}
                      Registro em cartório: ${verificarValor(dados.registroCartorio) === "S" ? "Sim" : "Não"}
                      Art. 1.072 do Código Civil Brasileiro - Disposições gerais sobre o foro eleito, testemunhas e a necessidade de registro em cartório para certos contratos.
    `,
    );

    // Adicionar assinaturas
    adicionarAssinaturas();

    doc.save(`contrato_hospedagem_${dados.nomeLocador || dados.nomelocatario}.pdf`);

}