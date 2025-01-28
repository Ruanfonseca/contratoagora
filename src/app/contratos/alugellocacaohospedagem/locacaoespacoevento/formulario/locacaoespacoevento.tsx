'use client'

import { verificarValor } from '@/lib/utils';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';
import gerarContratoPago from '../util/pdf';


const LocacaoEspacoEventoschema = z.object({
    locador: z.enum(['pf', 'pj']).default('pf'),

    /**
     * Dados Locador pj
     */
    razaoSocial: z.string(),
    cnpjlocador: z.string(),
    cpfLocador: z.string(),
    enderecoCNPJ: z.string(),
    telefoneCNPJ: z.string(),
    emailCNPJ: z.string(),
    nomeRepresentanteCNPJ: z.string(),
    CPFRepresentanteCNPJ: z.string(),
    /** */

    /** Dados Locador pf */
    nomeLocador: z.string(),
    CPFLocador: z.string(),
    enderecoLocador: z.string(),
    telefoneLocador: z.string(),
    emailLocador: z.string(),
    /** */

    locatario: z.enum(['pf', 'pj']).default('pf'),

    /**
     * Dados Locatario pj
     */
    razaoSociallocatario: z.string(),
    cpflocatario: z.string(),
    cnpj: z.string(),
    enderecolocatarioCNPJ: z.string(),
    telefonelocatarioCNPJ: z.string(),
    emaillocatarioCNPJ: z.string(),
    nomeRepresentantelocatarioCNPJ: z.string(),
    CPFRepresentantelocatarioCNPJ: z.string(),
    /** */

    /** Dados Locatario pf */
    nomelocatario: z.string(),
    CPFlocatario: z.string(),
    enderecolocatario: z.string(),
    telefonelocatario: z.string(),
    emaillocatario: z.string(),
    /** */




    /**DESCRIÇÃO DO ESPAÇO */
    nomeEstabelecimento: z.string(),
    enderecoEstabelecimento: z.string(),
    descricaoAreaLocacao: z.string(),
    capacidadeMaxima: z.string(),
    equipamentoEmobiliadisp: z.string(),
    condicoesAtuais: z.string(),
    /** */





    /**FINALIDADE DO EVENTO */
    tipoDeEvento: z.string(),
    atividadesNoEvento: z.string(),
    horariodeinicio: z.string(),
    horariodetermino: z.string(),

    necessidadeDesmontagem: z.enum(['S', 'N']),

    //se sim
    quaisHorariosPrevistos: z.string(),
    /** */



    /**PRAZO DA LOCAÇÃO */
    dataInicioDaLocacao: z.string(),
    dataFimDaLocacao: z.string(),
    horarioInicioUsoEspaco: z.string(),
    horarioTerminoUsoEspaco: z.string(),
    tempoAdicional: z.enum(['S', 'N']),

    //se caso S
    horarioInicioPrepOuMont: z.string(),
    horarioFimPrepOuMont: z.string(),
    condicoes: z.string(),
    /** */




    /**VALOR E CONDIÇÕES DE PAGAMENTO */
    valorTotalLocacao: z.string(),
    formaPagamento: z.enum(['Pix', 'Dinheiro', 'Cartão', 'Boleto', 'Parcelado']),
    dataVencimentoParcela: z.string(),
    multaPorAtrasoPagamento: z.string(),
    jurosporatraso: z.string(),
    valorSinal: z.string(),

    //politica de reembolso em caso de canceamento
    condicoesCancelamento: z.string(),
    prazoPagamento: z.string(),
    /** */




    /** GARANTIAS */
    garantia: z.enum(['S', 'N']),
    qualgarantidor: z.enum(['fi', 'caudep', 'caubem', 'ti', 'segfianca']),

    // Se for fiador
    sexoFiador: z.enum(['F', 'M']),
    nomeFiador: z.string(),
    estadoCivilFiador: z.enum(['casado', 'solteiro', 'divorciado', 'viuvo']),
    nacionalidadeFiador: z.string(),
    profissaoFiador: z.string(),
    docIdentificacao: z.enum(['Rg', 'Identidade funcional', 'Ctps', 'CNH', 'Passaporte']),
    numeroDocFiador: z.string(),
    cpfFiador: z.string(),
    enderecoFiador: z.string(),
    //---------------------------------------

    // Se for título de caução
    valorTitCaucao: z.string(),

    // Se for caução em imóvel
    descBemCaucao: z.string(),

    // Se for título de crédito utilizado
    descCredUtili: z.string(),

    // Se for seguro-fiança
    segFianca: z.string(),
    /** */


    /**OBRICACOES DO LOCADOR */
    entregaPerfeita: z.enum(['S', 'N']),
    servicosAdicionais: z.enum(['limpeza', 'seguranca', 'recepcao', 'manutencao', 'naooferecera']),
    disponibilidadeTecnica: z.enum(['S', 'N']),
    /** */

    /**OBRIGACOES DO LOCATÁRIO */
    comprometimento: z.enum(['S', 'N']),
    danosLocatario: z.enum(['S', 'N']),
    restricoes: z.enum(['S', 'N']),
    arca: z.enum(['S', 'N']),
    /*** */


    /**REGRAS DE USO */
    regraSom: z.string(),
    regraBebida: z.string(),
    proibicaoAtividade: z.string(),
    responsabilidade: z.string(),
    /** */



    /**DEVOLUÇÃO DO ESPAÇO */
    localDevolucao: z.string(),
    condicoesDevolucao: z.string(),
    inspecao: z.string(),
    penalidadesAvaria: z.string(),
    /** */




    /**RESCISÃO DO CONTRATO */
    condicoesAntecipada: z.string(),
    multasRescisao: z.string(),
    prazoNoti: z.string(),
    /** */




    /**DISPOSICOES GERAIS */
    foroeleito: z.string(),
    testemunhas: z.enum(['S', 'N']),

    //se sim 
    nomeTest1: z.string(),
    cpfTest1: z.string(),
    nomeTest2: z.string(),
    cpfTest2: z.string(),

    registroCartorio: z.enum(['S', 'N']),
    /** */


});

type FormData = z.infer<typeof LocacaoEspacoEventoschema>;


export default function LocacaoEspacoEvento() {
    //FLUXO
    const [formData, setFormData] = useState<Partial<FormData>>({});
    const [currentStepData, setCurrentStepData] = useState<Partial<FormData>>({});
    const [step, setStep] = useState(1);
    /** */


    //PAGAMENTO
    const [paymentId, setPaymentId] = useState('');
    const [isPaymentApproved, setIsPaymentApproved] = useState(false)
    const [ticketUrl, setTicketUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('pendente');
    const [isModalOpen, setModalOpen] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const valor = 19.90;
    const [pdfDataUrl, setPdfDataUrl] = useState<string>("");
    const [modalPagamento, setModalPagamento] = useState<Boolean>(false);
    const [isLoading, setIsLoading] = useState(false);
    /** */

    //VARIAVEIS DE CONTROLE DE FLUXO
    const [locadorJuri, setLocadorJuri] = useState(false);
    const [locadorioJuri, setLocadorioJuri] = useState(false);
    const [desmontagem, setDesmontagem] = useState(false);
    const [tempoAdicional, setTempoAdicional] = useState(false);
    const [Parcelado, setParcelado] = useState(false);
    const [garantia, setGarantia] = useState(false);
    const [fiador, setFiador] = useState(false);
    const [caucaoDep, setCaucaoDep] = useState(false);
    const [caucaoBemIM, setCaucaoBemIM] = useState(false);
    const [titulos, setTitulos] = useState(false);
    const [seguroFi, setSeguroFi] = useState(false);
    const [garantiaManutencao, setGarantiaManutencao] = useState(false);
    const [testemunhas, setTestemunhas] = useState(false);

    const handleNext = () => {
        setFormData((prev) => ({ ...prev, ...currentStepData }));

        let nextStep = step;


        if (currentStepData.locador === 'pj') {
            setLocadorJuri(true);
            nextStep = 7
        } else if (!locadorJuri && nextStep === 6) {
            nextStep = 13;
        }

        if (currentStepData.locatario === 'pj') {
            setLocadorioJuri(true);
            nextStep = 19
        } else if (!locadorioJuri && nextStep === 19) {
            nextStep = 25;
        }


        if (currentStepData.necessidadeDesmontagem === 'S') {
            setDesmontagem(true);
            nextStep = 36
        } else if (currentStepData.necessidadeDesmontagem === 'N') {
            nextStep = 37;
        }

        if (currentStepData.tempoAdicional === 'S') {
            setDesmontagem(true);
            nextStep = 42
        } else if (currentStepData.tempoAdicional === 'N') {
            nextStep = 45;
        }






        if (currentStepData.formaPagamento === 'Parcelado') {
            setParcelado(true);
        } else if (currentStepData.formaPagamento === 'Pix') {
            nextStep = 50;
        } else if (currentStepData.formaPagamento === 'Dinheiro') {
            nextStep = 50;
        } else if (currentStepData.formaPagamento === 'Cartão') {
            nextStep = 50;
        } else if (currentStepData.formaPagamento === 'Boleto') {
            nextStep = 50;
        }

        if (currentStepData.garantia === 'S') {
            setGarantia(true);
        } else if (currentStepData.garantia === 'N') {
            nextStep = 65;
        }

        //para verificar se o próximo é o ultimo de step de algum garantidor
        if (nextStep === 60) {
            nextStep = 65
        } else if (nextStep === 61) {
            nextStep = 65
        } else if (nextStep === 62) {
            nextStep = 65
        } else if (nextStep === 63) {
            nextStep = 65
        }

        switch (currentStepData.qualgarantidor) {
            case "fi":
                setFiador(true);
                break;
            case "caudep":
                setCaucaoDep(true);
                nextStep = 61;
                break;
            case "caubem":
                setCaucaoBemIM(true);
                nextStep = 62;
                break;
            case "ti":
                setTitulos(true);
                nextStep = 63;
                break;
            case "segfianca":
                setSeguroFi(true);
                nextStep = 64;
                break;
            default:
                break;
        }








        if (currentStepData.testemunhas === 'S') {
            setTestemunhas(true);
            nextStep = 89;
        } else if (currentStepData.testemunhas === 'N') {
            nextStep = 93;
        }









        if (nextStep === step) {
            nextStep += 1;
        }

        setStep(nextStep);

        // Logs para depuração
        console.log(`qtd step depois do ajuste: ${nextStep}`);

        // Limpar os dados do passo atual.
        setCurrentStepData({});
    }


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurrentStepData((prev) => ({ ...prev, [name]: value }));
    };



    const handleFinalize = () => {
        setIsLoading(true)
        handlePayment();
    }


    const handlePayment = async () => {

        try {
            const response = await api.post('/server/pix', {
                transaction_amount: valor,
                description: `Contrato de Compra e Venda`,
                paymentMethodId: "pix",
                payer: {
                    name: "Contrato",
                    email: "quedsoft@gmail.com",
                    identification: {
                        type: "CPF",
                        number: "46866790018"
                    },
                    address: {
                        street_name: "Rua Exemplo",
                        street_number: 123,
                        zip_code: "12345678"
                    }
                }
            });

            //console.log('Resposta do servidor:', response.data);

            if (response.data.success) {
                const pointOfInteraction = response.data.point_of_interaction;
                if (pointOfInteraction?.transaction_data?.ticket_url) {
                    setTicketUrl(pointOfInteraction.transaction_data.ticket_url);

                    setPaymentId(response.data.result.id);
                    setPaymentStatus(response.data.result.status);
                    setModalPagamento(true);

                } else {
                    console.error('Dados do ponto de interação estão incompletos:', pointOfInteraction);
                    alert('Erro ao obter o QR Code do PIX.');
                }
            } else {
                console.error('Erro no pagamento:', response.data);
                alert('Erro ao criar pagamento PIX.');
            }
        } catch (error) {
            console.error('Erro ao criar pagamento PIX:', error);
            alert(`Erro ao criar pagamento PIX: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };


    const handleVerifyPayment = async () => {
        if (!paymentId) {

        }
        try {
            const token = process.env.NEXT_PUBLIC_TOKEN_MERCADO_PAGO;

            const response = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setPaymentStatus(response.data.status);


            if (response.data.status === 'approved') {
                setIsPaymentApproved(true);
                alert('Pagamento Aprovado');
            } else {
                alert('Pagamento Pendente');
            }
        } catch (error) {
            alert(`Não existe transação:${error}`)
        }
    }

    const handleBack = () => setStep((prev) => prev - 1);

    function gerarContratoPDF(dados: any): void {
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

        // Gerar PDF
        const pdfDataUri = doc.output("datauristring");
        setPdfDataUrl(pdfDataUri);
    }


    useEffect(() => {
        gerarContratoPDF({ ...formData });
    }, [formData]);


    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title">Contrato de Locação de Equipamentos</h1>

            </div>
            <div className="container">
                <div className="left-panel">
                    <div className="scrollable-card">

                        <div className="progress-bar">
                            <div
                                className="progress-bar-inner"
                                style={{ width: `${(step / 93) * 100}%` }}
                            ></div>
                        </div>
                        <div className="form-wizard">
                            {step === 1 && (
                                <>
                                    <h2>Dados do Responsável pelo Espaço</h2>
                                    <div>
                                        <label>O Responsavel é pessoa?</label>
                                        <select name='locador' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="pj">Jurídica</option>
                                            <option value="pf">Física</option>
                                        </select>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {/**Pessoa Fisica */}
                            {step === 2 && (
                                <>
                                    <h2> Dados do Responsável pelo Espaço </h2>
                                    <div>
                                        <label>Nome do Locador</label>
                                        <input
                                            type='text'
                                            placeholder='Nome do Locador'
                                            name="nomeLocador"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 3 && (
                                <>
                                    <h2> Dados do Responsável pelo Espaço</h2>
                                    <div>
                                        <label>CPF</label>
                                        <input
                                            type='text'
                                            placeholder='CPF do Locador'
                                            name="CPFLocador"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 4 && (
                                <>
                                    <h2>Dados do Responsável pelo Espaço</h2>
                                    <div>
                                        <label>Endereço do Locador</label>
                                        <input
                                            type='text'
                                            placeholder='Onde o locador mora'
                                            name="enderecoLocador"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 5 && (
                                <>
                                    <h2>Dados do Responsável pelo Espaço</h2>
                                    <div>
                                        <label>Telefone do Locador</label>
                                        <input
                                            type='text'
                                            placeholder='(DDD)número-número'
                                            name="telefoneLocador"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 6 && (
                                <>
                                    <h2>Dados do Responsável pelo Espaço</h2>
                                    <div>
                                        <label>Email do Locador</label>
                                        <input
                                            type='text'
                                            placeholder='email@email.com'
                                            name="emailLocador"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {/**Pessoa Juridica */}

                            {locadorJuri && (
                                <>
                                    {step === 7 && (
                                        <>
                                            <h2>Dados do Responsável pelo Espaço</h2>
                                            <div>
                                                <label>Razão Social</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="razaoSocial"
                                                    onChange={handleChange}
                                                />
                                                <label>CNPJ</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cnpjlocador"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 8 && (
                                        <>
                                            <h2>Dados do Responsável pelo Espaço</h2>
                                            <div>
                                                <label>Endereço do onde o CNPJ esta cadastrado</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="enderecoCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 9 && (
                                        <>
                                            <h2>Dados do Responsável pelo Espaço</h2>
                                            <div>
                                                <label>Telefone</label>
                                                <input
                                                    type='text'
                                                    placeholder='(DDD)número-número'
                                                    name="telefoneCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 10 && (
                                        <>
                                            <h2>Dados do Responsável pelo Espaço</h2>
                                            <div>
                                                <label>Email</label>
                                                <input
                                                    type='text'
                                                    placeholder='(DDD)número-número'
                                                    name="emailCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 11 && (
                                        <>
                                            <h2>Dados do Responsável pelo Espaço</h2>
                                            <div>
                                                <label>Nome do representante do CNPJ</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="nomeRepresentanteCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 12 && (
                                        <>
                                            <h2>Dados do Responsável pelo Espaço</h2>
                                            <div>
                                                <label>CPF do representante do CNPJ</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="CPFRepresentanteCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                </>
                            )}

                            {/**Locatário */}

                            {step === 13 && (
                                <>
                                    <h2>Dados do Locatário do Espaço</h2>
                                    <div>
                                        <label>O Responsavel é pessoa?</label>
                                        <select name='locatario' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="pj">Jurídica</option>
                                            <option value="pf">Física</option>
                                        </select>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {/**Pessoa Fisica */}
                            {step === 14 && (
                                <>
                                    <h2>Dados do Locatário do Espaço</h2>
                                    <div>
                                        <label>Nome do Locatário</label>
                                        <input
                                            type='text'
                                            placeholder='Nome do Locatário'
                                            name="nomelocatario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 15 && (
                                <>
                                    <h2>Dados do Locatário do Espaço</h2>
                                    <div>
                                        <label>CPF</label>
                                        <input
                                            type='text'
                                            placeholder='CPF do Locatário'
                                            name="CPFlocatario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 16 && (
                                <>
                                    <h2>Dados do Locatário do Espaço</h2>
                                    <div>
                                        <label>Endereço do Locatário</label>
                                        <input
                                            type='text'
                                            placeholder='Onde o locatário mora'
                                            name="enderecolocatario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 17 && (
                                <>
                                    <h2>Dados do Locatário do Espaço</h2>
                                    <div>
                                        <label>Telefone do Locatário</label>
                                        <input
                                            type='text'
                                            placeholder='(DDD)número-número'
                                            name="telefonelocatario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 18 && (
                                <>
                                    <h2>Dados do Locatário do Espaço</h2>
                                    <div>
                                        <label>Email do Locatário</label>
                                        <input
                                            type='text'
                                            placeholder='email@email.com'
                                            name="emaillocatario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {/**Pessoa Juridica */}

                            {locadorioJuri && (
                                <>
                                    {step === 19 && (
                                        <>
                                            <h2>Dados do Locatário do Espaço</h2>
                                            <div>
                                                <label>Razão Social</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="razaoSociallocatario"
                                                    onChange={handleChange}
                                                />
                                                <label>CNPJ</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cnpj"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 20 && (
                                        <>
                                            <h2>Dados do Locatário do Espaço</h2>
                                            <div>
                                                <label>Endereço do onde o CNPJ esta cadastrado</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="enderecolocatarioCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 21 && (
                                        <>
                                            <h2>Dados do Locatário do Espaço</h2>
                                            <div>
                                                <label>Telefone</label>
                                                <input
                                                    type='text'
                                                    placeholder='(DDD)número-número'
                                                    name="telefonelocatarioCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 22 && (
                                        <>
                                            <h2>Dados do Locatário do Espaço</h2>
                                            <div>
                                                <label>Email</label>
                                                <input
                                                    type='text'
                                                    placeholder='email@email.com'
                                                    name="emaillocatarioCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 23 && (
                                        <>
                                            <h2>Dados do Locatário do Espaço</h2>
                                            <div>
                                                <label>Nome do representante do CNPJ</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="nomeRepresentantelocatarioCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 24 && (
                                        <>
                                            <h2>Dados do Locatário do Espaço</h2>
                                            <div>
                                                <label>CPF do representante do CNPJ</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="CPFRepresentantelocatarioCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                </>
                            )}

                            {/**DESCRIÇÃO DO ESPAÇO */}
                            {step === 25 && (
                                <>
                                    <h2>Descrição do Espaço</h2>
                                    <div>
                                        <label>Nome do local ou estabelecimento</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="nomeEstabelecimento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 26 && (
                                <>
                                    <h2>Descrição do Espaço</h2>
                                    <div>
                                        <label>Endereço</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="enderecoEstabelecimento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 27 && (
                                <>
                                    <h2>Descrição do Espaço</h2>
                                    <div>
                                        <label>Descrição detalhada das áreas incluídas na locação (ex.: salão principal, áreas externas, estacionamento, cozinha, etc.)</label>

                                        <textarea
                                            id="descricaoAreaLocacao"
                                            name="descricaoAreaLocacao"
                                            onChange={handleChange}
                                            rows={10}
                                            cols={50}
                                            placeholder="Descrição"
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 28 && (
                                <>
                                    <h2>Descrição do Espaço</h2>
                                    <div>
                                        <label>Capacidade máxima de pessoas permitida</label>

                                        <input
                                            type='text'
                                            placeholder=''
                                            name="capacidadeMaxima"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 29 && (
                                <>
                                    <h2>Descrição do Espaço</h2>
                                    <div>
                                        <label>Equipamentos e mobiliário disponíveis (ex.: mesas, cadeiras, sistema de som, iluminação, etc.)</label>

                                        <textarea
                                            id="equipamentoEmobiliadisp"
                                            name="equipamentoEmobiliadisp"
                                            onChange={handleChange}
                                            rows={10}
                                            cols={50}
                                            placeholder="Descrição"
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 30 && (
                                <>
                                    <h2>Descrição do Espaço</h2>
                                    <div>
                                        <label>Condições atuais do espaço (se necessário, incluir um relatório ou fotos)</label>

                                        <textarea
                                            id="condicoesAtuais"
                                            name="condicoesAtuais"
                                            onChange={handleChange}
                                            rows={10}
                                            cols={50}
                                            placeholder="Descrição"
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 31 && (
                                <>
                                    <h2>Finalidade do Evento</h2>
                                    <div>
                                        <label>Tipo de evento (ex.: casamento, aniversário, conferência, feira, etc.)</label>

                                        <input
                                            type='text'
                                            placeholder=''
                                            name="tipoDeEvento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 32 && (
                                <>
                                    <h2>Finalidade do Evento</h2>
                                    <div>
                                        <label>Atividades previstas no evento</label>



                                        <textarea
                                            id="atividadesNoEvento"
                                            name="atividadesNoEvento"
                                            onChange={handleChange}
                                            rows={10}
                                            cols={50}
                                            placeholder="Descrição"
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 33 && (
                                <>
                                    <h2>Finalidade do Evento</h2>
                                    <div>
                                        <label>Horário de início</label>

                                        <input
                                            type='time'
                                            placeholder=''
                                            name="horariodeinicio"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 34 && (
                                <>
                                    <h2>Finalidade do Evento</h2>
                                    <div>
                                        <label>Horário do fim do evento</label>

                                        <input
                                            type='time'
                                            placeholder=''
                                            name="horariodetermino"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 35 && (
                                <>
                                    <h2>Finalidade do Evento</h2>
                                    <div>
                                        <label>Há necessidade de montagem e desmontagem?</label>
                                        <select name='necessidadeDesmontagem' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>

                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {desmontagem && (
                                <>
                                    {step === 36 && (
                                        <>
                                            <h2>Finalidade do Evento</h2>
                                            <div>
                                                <label>Quais os horários previstos?</label>
                                                <textarea
                                                    id="quaisHorariosPrevistos"
                                                    name="quaisHorariosPrevistos"
                                                    onChange={handleChange}
                                                    rows={10}
                                                    cols={50}
                                                    placeholder="Faça uma descrição de como será a operação"
                                                />

                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 37 && (
                                <>
                                    <h2>Prazo da Locação</h2>
                                    <div>
                                        <label>Data do inicio da locação?</label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="dataInicioDaLocacao"
                                            onChange={handleChange}
                                        />

                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 38 && (
                                <>
                                    <h2>Prazo da Locação</h2>
                                    <div>
                                        <label>Data do fim da locação?</label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="dataFimDaLocacao"
                                            onChange={handleChange}
                                        />

                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 39 && (
                                <>
                                    <h2>Prazo da Locação</h2>
                                    <div>
                                        <label>Horário de início do uso do espaço</label>
                                        <input
                                            type='time'
                                            placeholder=''
                                            name="horarioInicioUsoEspaco"
                                            onChange={handleChange}
                                        />

                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 40 && (
                                <>
                                    <h2>Prazo da Locação</h2>
                                    <div>
                                        <label>Horário de término do uso do espaço</label>
                                        <input
                                            type='time'
                                            placeholder=''
                                            name="horarioTerminoUsoEspaco"
                                            onChange={handleChange}
                                        />

                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 41 && (
                                <>
                                    <h2>Prazo da Locação</h2>
                                    <div>
                                        <label>Tempo adicional para preparação e organização externa (escolta policial,manobrista,e etc)?</label>
                                        <select name='tempoAdicional' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>

                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {tempoAdicional && (
                                <>
                                    {step === 42 && (
                                        <>
                                            <h2>Prazo da Locação</h2>
                                            <div>
                                                <label>Horário de Inicio da operação</label>
                                                <input
                                                    type='time'
                                                    placeholder=''
                                                    name="horarioInicioPrepOuMont"
                                                    onChange={handleChange}
                                                />

                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}


                                    {step === 43 && (
                                        <>
                                            <h2>Prazo da Locação</h2>
                                            <div>
                                                <label>Horário de Término da operação</label>
                                                <input
                                                    type='time'
                                                    placeholder=''
                                                    name="horarioFimPrepOuMont"
                                                    onChange={handleChange}
                                                />

                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 44 && (
                                        <>
                                            <h2>Prazo da Locação</h2>
                                            <div>
                                                <label>Condições para que a operação seja realizada</label>
                                                <textarea
                                                    id="condicoes"
                                                    name="condicoes"
                                                    onChange={handleChange}
                                                    rows={10}
                                                    cols={50}
                                                    placeholder="Descrição"
                                                />

                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}



                                </>
                            )}



                            {step === 45 && (
                                <>
                                    <h2>Valor e Condições de Pagamento</h2>
                                    <div>
                                        <label>Valor total da locação</label>
                                        <input
                                            type='text'
                                            placeholder='ex.:1.000,10.000 e etc'
                                            name="valorTotalLocacao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 46 && (
                                <>
                                    <h2>Valor e Condições de Pagamento</h2>
                                    <div>
                                        <label>Forma de pagamento (à vista, parcelado, etc.)</label>
                                        <select name='formaPagamento' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="Pix">Pix</option>
                                            <option value="Dinheiro">Dinheiro</option>
                                            <option value="Cartão">Cartão</option>
                                            <option value="Boleto">Dinheiro</option>
                                            <option value="Parcelado">Parcelado</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {Parcelado && (
                                <>
                                    {step === 47 && (
                                        <>
                                            <h2>Valor e Condições de Pagamento</h2>
                                            <div>
                                                <label>Datas de vencimento das parcelas</label>
                                                <input
                                                    type='date'
                                                    placeholder=''
                                                    name="dataVencimentoParcela"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 48 && (
                                        <>
                                            <h2>Valor e Condições de Pagamento</h2>
                                            <div>
                                                <label>Multa por atraso no pagamento</label>
                                                <input
                                                    type='text'
                                                    placeholder='Porcentagem .ex.:2% mês , ano ou dia'
                                                    name="multaPorAtrasoPagamento"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 49 && (
                                        <>
                                            <h2>Valor e Condições de Pagamento</h2>
                                            <div>
                                                <label>Juros aplicáveis em caso de atraso</label>
                                                <input
                                                    type='text'
                                                    placeholder='porcentagem.ex.: 1% mês'
                                                    name="jurosporatraso"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 50 && (
                                <>
                                    <h2>Garantias</h2>
                                    <div>
                                        <label>Será exigida alguma garantia?</label>
                                        <select name='garantia' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {garantia && (
                                <>
                                    {step === 51 && (
                                        <>
                                            <h2>Garantias</h2>
                                            <div>
                                                <label>Qual?</label>
                                                <select name='qualgarantidor' onChange={handleChange}>
                                                    <option value="">Selecione</option>
                                                    <option value="fi">Fiador</option>
                                                    <option value="caudep">Caução em Depósito</option>
                                                    <option value="caubem">Caução em Bem Móvel</option>
                                                    <option value="ti">Titulos</option>
                                                    <option value="segfianca">Seguro fiança</option>
                                                </select>
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {fiador && (
                                <>
                                    {step === 52 && (
                                        <>
                                            <h2>Dados do Fiador</h2>
                                            <div>
                                                <label>Qual é o sexo do fiador?</label>
                                                <div>
                                                    <select name='sexoFiador' onChange={handleChange}>
                                                        <option value="">Selecione</option>
                                                        <option value="F">Feminino</option>
                                                        <option value="M">Masculino</option>
                                                    </select>
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>                                                        </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 53 && (
                                        <>
                                            <h2>Dados do Fiador</h2>
                                            <div>
                                                <label>Qual é o nome do fiador ?</label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="nomeFiador1"
                                                        onChange={handleChange}
                                                    />
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>                                                        </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 54 && (
                                        <>
                                            <h2>Dados do Fiador</h2>
                                            <div>
                                                <label>Estado Cívil</label>
                                                <div>
                                                    <select name='sexoFiador' onChange={handleChange}>
                                                        <option value="">Selecione</option>
                                                        <option value="casado">Casado(a)</option>
                                                        <option value="solteiro">Solteiro(a)</option>
                                                        <option value="divorciado">Divorciado(a)</option>
                                                        <option value="viuvo">Viuvo(a)</option>
                                                    </select>
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>                                                        </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 55 && (
                                        <>
                                            <h2>Dados do Fiador</h2>
                                            <div>
                                                <label>Nacionalidade</label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="nacionalidadeFiador"
                                                        onChange={handleChange}
                                                    />
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>                                                        </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 56 && (
                                        <>
                                            <h2>Dados do Fiador</h2>
                                            <div>
                                                <label>Profissão</label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="profissaoFiador"
                                                        onChange={handleChange}
                                                    />
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>                                                        </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 57 && (
                                        <>
                                            <h2>Dados do Fiador</h2>
                                            <div>
                                                <label>Documento do Representante:</label>
                                                <select name='docIdentificacao' onChange={handleChange}>
                                                    <option value="">Selecione</option>

                                                    <option value="Rg">Rg</option>
                                                    <option value="Identidade funcional">Identificação funcional</option>
                                                    <option value="Ctps">Carteira de trabalho</option>
                                                    <option value="CNH">CNH</option>
                                                    <option value="Passaporte">Passaporte</option>
                                                </select>
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>                                                    </div>
                                        </>
                                    )}

                                    {step === 58 && (
                                        <>
                                            <h2>Dados do Fiador</h2>
                                            <div>
                                                <label>Número de identificação</label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="numeroDocFiador"
                                                        onChange={handleChange}
                                                    />
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>                                                        </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 59 && (
                                        <>
                                            <h2>Dados do Fiador</h2>
                                            <div>
                                                <label>CPF do fiador</label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="cpfFiador"
                                                        onChange={handleChange}
                                                    />
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>                                                        </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 60 && (
                                        <>
                                            <h2>Dados do Fiador</h2>
                                            <div>
                                                <label>Endereço do fiador</label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="enderecoFiador"
                                                        onChange={handleChange}
                                                    />
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>                                                        </div>
                                            </div>
                                        </>
                                    )}

                                </>
                            )}

                            {caucaoDep && (
                                <>
                                    {step === 61 && (
                                        <>
                                            <h2>Dados do Titulo do Caução</h2>
                                            <div>
                                                <label>Valor </label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="valorTitCaucao"
                                                        onChange={handleChange}
                                                    />
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>                                                        </div>
                                            </div>
                                        </>
                                    )}



                                </>
                            )}

                            {caucaoBemIM && (
                                <>
                                    {step === 62 && (
                                        <>
                                            <h2>Dados do Caução de imóvel</h2>
                                            <div>
                                                <label>Descrição do bem</label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="descBemCaucao"
                                                        onChange={handleChange}
                                                    />
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>                                                        </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {titulos && (
                                <>
                                    {step === 63 && (
                                        <>
                                            <h2>Dados do Título de Credito</h2>
                                            <div>
                                                <label>Descrição </label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="descCredUtili"
                                                        onChange={handleChange}
                                                    />
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>                                                        </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {seguroFi && (
                                <>
                                    {step === 64 && (
                                        <>
                                            <h2>Dados do Seguro Fiança</h2>
                                            <div>
                                                <label>Valor </label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="segFianca"
                                                        onChange={handleChange}
                                                    />
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>                                                        </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 65 && (
                                <>
                                    <h2>Valor e Condições de Pagamento</h2>
                                    <div>
                                        <label>Valor do sinal ou adiantamento</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="valorSinal"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 66 && (
                                <>
                                    <h2>Valor e Condições de Pagamento</h2>
                                    <div>
                                        <label>Política de reembolso em caso de cancelamento,em relação a condições</label>
                                        <textarea
                                            id="condicoesCancelamento"
                                            name="condicoesCancelamento"
                                            onChange={handleChange}
                                            rows={10}
                                            cols={50}
                                            placeholder="Descrição"
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 67 && (
                                <>
                                    <h2>Valor e Condições de Pagamento</h2>
                                    <div>
                                        <label>Política de reembolso em caso de cancelamento,em relação a prazos</label>
                                        <textarea
                                            id="prazoPagamento"
                                            name="prazoPagamento"
                                            onChange={handleChange}
                                            rows={10}
                                            cols={50}
                                            placeholder="Descrição"
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 68 && (
                                <>
                                    <h2>Obrigações do Locador</h2>
                                    <div>
                                        <label>O locador se responsabiliza pela entrega do espaço em perfeitas condições de uso?</label>
                                        <select name='entregaPerfeita' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 69 && (
                                <>
                                    <h2>Obrigações do Locador</h2>
                                    <div>
                                        <label>Serviços adicionais fornecidos pelo locador (ex.: limpeza, segurança, recepção, manutenção, etc.)</label>

                                        <textarea
                                            id="servicosAdicionais"
                                            name="servicosAdicionais"
                                            onChange={handleChange}
                                            rows={10}
                                            cols={50}
                                            placeholder="Descrição"
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 70 && (
                                <>
                                    <h2>Obrigações do Locador</h2>
                                    <div>
                                        <label>Disponibilidade de assistência técnica para equipamentos incluídos? </label>
                                        <select name='disponibilidadeTecnica' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 71 && (
                                <>
                                    <h2>Obrigações do Locador</h2>
                                    <div>
                                        <label>O locatário se compromete a utilizar o espaço conforme as instruções fornecidas?  </label>
                                        <select name='comprometimento' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 72 && (
                                <>
                                    <h2>Obrigações do Locador</h2>
                                    <div>
                                        <label>O locatário é responsável por danos causados por uso inadequado?</label>
                                        <select name='danosLocatario' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 73 && (
                                <>
                                    <h2>Obrigações do Locador</h2>
                                    <div>
                                        <label>Há restrições quanto ao tipo de atividades permitidas no espaço? </label>
                                        <select name='restricoes' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 74 && (
                                <>
                                    <h2>Obrigações do Locador</h2>
                                    <div>
                                        <label>O locatário deve arcar com custos de manutenção preventiva ou corretiva durante a locação? </label>
                                        <select name='arca' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 75 && (
                                <>
                                    <h2>Regras de Uso</h2>
                                    <div>
                                        <label>Regras específicas para som e iluminação (ex.: limite de horário para ruídos)</label>
                                        <textarea
                                            id="regraSom"
                                            name="regraSom"
                                            onChange={handleChange}
                                            rows={10}
                                            cols={50}
                                            placeholder="Descrição"
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 76 && (
                                <>
                                    <h2>Regras de Uso</h2>
                                    <div>
                                        <label>Regras para consumo de bebidas e alimentos no espaço</label>
                                        <textarea
                                            id="regraBebida"
                                            name="regraBebida"
                                            onChange={handleChange}
                                            rows={10}
                                            cols={50}
                                            placeholder="Descrição"
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 77 && (
                                <>
                                    <h2>Regras de Uso</h2>
                                    <div>
                                        <label>Proibição de atividades específicas (ex.: fogos de artifício, decoração que cause danos ao espaço, etc.)</label>

                                        <textarea
                                            id="proibicaoAtividade"
                                            name="proibicaoAtividade"
                                            onChange={handleChange}
                                            rows={10}
                                            cols={50}
                                            placeholder="Descrição"
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 78 && (
                                <>
                                    <h2>Regras de Uso</h2>
                                    <div>
                                        <label>Responsabilidade pela obtenção de licenças ou autorizações, se necessárias (ex.: licença de eventos, pagamento de direitos autorais ao ECAD, etc.)</label>

                                        <textarea
                                            id="responsabilidade"
                                            name="responsabilidade"
                                            onChange={handleChange}
                                            rows={10}
                                            cols={50}
                                            placeholder="Descrição"
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 79 && (
                                <>
                                    <h2>Devolução do Espaço</h2>
                                    <div>
                                        <label>Local para devolução do espaço</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="localDevolucao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 80 && (
                                <>
                                    <h2>Regras de Uso</h2>
                                    <div>
                                        <label>Condições para devolução do espaço</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="condicoesDevolucao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 81 && (
                                <>
                                    <h2>Regras de Uso</h2>
                                    <div>
                                        <label>Procedimento para inspeção do espaço na devolução</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="inspecao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 82 && (
                                <>
                                    <h2>Regras de Uso</h2>
                                    <div>
                                        <label>Penalidades em caso de danos ou avarias identificadas</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="penalidadesAvaria"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 83 && (
                                <>
                                    <h2>Recisão de Contrato</h2>
                                    <div>
                                        <label>Condições para rescisão antecipada por ambas as partes</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="condicoesAntecipada"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 84 && (
                                <>
                                    <h2>Recisão de Contrato</h2>
                                    <div>
                                        <label>Condições para rescisão antecipada por ambas as partes</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="condicoesAntecipada"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 85 && (
                                <>
                                    <h2>Recisão de Contrato</h2>
                                    <div>
                                        <label>Multas ou penalidades aplicáveis em caso de rescisão antecipada</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="multasRescisao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 86 && (
                                <>
                                    <h2>Recisão de Contrato</h2>
                                    <div>
                                        <label>Prazo para notificação prévia de rescisão</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="prazoNoti"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 87 && (
                                <>
                                    <h2>Disposições Gerais</h2>
                                    <div>
                                        <label>Foro eleito para resolução de conflitos</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="foroeleito"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 88 && (
                                <>
                                    <h2>Disposições Gerais</h2>
                                    <div>
                                        <label>Necessidade de testemunhas para assinatura do contrato</label>
                                        <select name='testemunhas' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {testemunhas && (
                                <>
                                    {step === 89 && (
                                        <>
                                            <h2>Dados das Testemunhas</h2>
                                            <div>
                                                <label>Nome da 1° testemunha </label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="nomeTest1"
                                                        onChange={handleChange}
                                                    />
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 90 && (
                                        <>
                                            <h2>Dados das Testemunhas</h2>
                                            <div>
                                                <label>CPF da 1° testemunha </label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="nomeTest1"
                                                        onChange={handleChange}
                                                    />
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 91 && (
                                        <>
                                            <h2>Dados das Testemunhas</h2>
                                            <div>
                                                <label>Nome da 2° testemunha </label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="nomeTest2"
                                                        onChange={handleChange}
                                                    />
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>

                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 92 && (
                                        <>
                                            <h2>Dados das Testemunhas</h2>
                                            <div>
                                                <label>CPF da 2° testemunha </label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="cpfTest2"
                                                        onChange={handleChange}
                                                    />
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 93 && (
                                <>
                                    <h2>Disposições Gerais</h2>
                                    <div>
                                        <label>O contrato será registrado em cartório?</label>
                                        <div>
                                            <select name='registroCartorio' onChange={handleChange}>
                                                <option value="">Selecione</option>
                                                <option value="Sim">Sim</option>
                                                <option value="Não">Não</option>
                                            </select>
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}


                            {step === 94 && (
                                <>
                                    <h2>Dados Preenchidos</h2>
                                    <div>
                                        <label>Efetue o pagamento , para baixar o contrato ! </label>
                                    </div>

                                    <button onClick={handleFinalize} disabled={isLoading}>
                                        {isLoading ? (
                                            <div className="spinner-border spinner-border-sm text-light" role="status">
                                                <span className="visually-hidden">Carregando...</span>
                                            </div>
                                        ) : (
                                            'Finalizar'
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="right-panel">
                    <div className="pdf-preview">
                        {pdfDataUrl && (
                            <iframe
                                src={`${pdfDataUrl}#toolbar=0&navpanes=0&scrollbar=0`} // Desativa a barra de ferramentas do PDF
                                title="Pré-visualização do PDF"
                                frameBorder="0"
                                width="100%"
                                height="100%"
                                style={{
                                    pointerEvents: 'auto',
                                    userSelect: 'none',
                                }}
                            ></iframe>
                        )}
                    </div>
                </div>
            </div>

            {modalPagamento && (
                <>
                    <div className="modalPag">
                        <div className="modalContent">
                            <h2>Pagamento com PIX</h2>
                            <div className="qrcode-container">
                                {ticketUrl ? (
                                    <iframe
                                        src={ticketUrl}
                                        title="QR Code do PIX"
                                        className="qrcode-frame"
                                        frameBorder="0"
                                    />
                                ) : (
                                    <p>Aguardando QR Code...</p>
                                )}
                            </div>
                            <button className="closeModal" onClick={() => setModalPagamento(false)}>Fechar</button>

                        </div>
                    </div>
                </>
            )}



            <div className="BaixarPdf">
                {isPaymentApproved ? (
                    <button className='btnBaixarPdf' onClick={() => { gerarContratoPago(formData) }}>
                        Baixar PDF
                    </button>
                ) : (
                    <button className='btnBaixarPdf' onClick={handleVerifyPayment}>
                        Verificar Pagamento
                    </button>
                )}
            </div>

        </>
    );
}