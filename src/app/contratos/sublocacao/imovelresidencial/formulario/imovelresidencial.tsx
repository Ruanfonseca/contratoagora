'use client'

import Pilha from '@/lib/pilha';
import { verificarValor } from '@/lib/utils';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';


const imovelresidencialschema = z.object({

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


    sublocatario: z.enum(['pf', 'pj']).default('pf'),

    /**
     * Dados Sublocatario pj
     */
    razaoSocialsublocatario: z.string(),
    cpfsublocatario: z.string(),
    cnpjsublocatario: z.string(),
    enderecosublocatarioCNPJ: z.string(),
    telefonesublocatarioCNPJ: z.string(),
    emailsublocatarioCNPJ: z.string(),
    nomeRepresentantesublocatarioCNPJ: z.string(),
    CPFRepresentantesublocatarioCNPJ: z.string(),
    /** */

    /** Dados Sublocatario pf */
    nomeSublocatario: z.string(),
    CPFSublocatario: z.string(),
    enderecoSublocatario: z.string(),
    telefoneSublocatario: z.string(),
    emailSublocatario: z.string(),
    /** */

    /**AUTORIZAÇÃO PARA SUBLOCAÇÃO */
    locadorAutoriza: z.enum(['S', 'N']),
    /** */

    /**DESCRIÇÃO DO IMÓVEL */
    enderecoCompleto: z.string(),
    descDetalhada: z.string(),
    estado: z.string(),
    finalidade: z.string(),
    /** */

    /**PRAZO DA SUBLOCAÇÃO */
    dataInicio: z.string(),
    dataFim: z.string(),
    possibilidadeRenovacao: z.enum(['S', 'N']),
    //se sim
    quaisCondicoes: z.string(),
    /** */

    /**VALOR DO ALUGUEL  */
    valorMensal: z.string(),
    dataVenci: z.string(),
    formaPagamento: z.enum(['Pix', 'Dinheiro', 'Cartão', 'Boleto']),
    multaAtraso: z.string(),
    jurosAplicaveis: z.string(),
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

    procedimentoDevolucao: z.string(),
    /** */

    /**OBRIGAÇÕES DO SUBLOCADOR */
    sublocadorResponsa: z.string(),
    sublocadorAdicional: z.string(),
    qual: z.string(),
    /** */

    /**OBRIGAÇÕES DO SUBLOCATARIO */
    sublocatarioCeder: z.string(),
    sublocatarioManu: z.string(),
    sublocatarioRespeita: z.string(),
    sublocatarioMulta: z.string(),
    sublocatarioComunica: z.string(),
    sublocatarioDevolve: z.string(),
    /** */

    /**DESPESAS E TRIBUTOS */
    despesasSublocatario: z.string(),
    despesasSublocador: z.string(),
    /** */

    /**RESCISÃO DO CONTRATO */
    condicoesRescisao: z.string(),
    multasPenalidades: z.string(),
    prazo: z.string(),
    /** */

    /**DISPOSIÇÕES GERAIS */
    foroResolucaoConflitos: z.string(), // Foro eleito para resolução de conflitos
    testemunhasNecessarias: z.enum(['S', 'N']), // Necessidade de testemunhas para assinatura do contrato
    //se sim 
    nomeTest1: z.string(),
    cpfTest1: z.string(),
    nomeTest2: z.string(),
    cpfTest2: z.string(),
    local: z.string(),
    dataAssinatura: z.string(),
    registroCartorio: z.enum(['S', 'N']), // Indicação se o contrato será registrado em cartório 
    /** */


});

type FormData = z.infer<typeof imovelresidencialschema>;

export default function ImovelResidencial() {
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
    const [sublocadorJuri, setSublocadorJuri] = useState(false);
    const [sublocatarioJuri, setSublocatarioJuri] = useState(false);
    const [sublocadorAdicional, setSublocadorAdicional] = useState(false);
    const [tempoAdicional, setTempoAdicional] = useState(false);
    const [Parcelado, setParcelado] = useState(false);
    const [garantia, setGarantia] = useState(false);
    const [fiador, setFiador] = useState(false);
    const [caucaoDep, setCaucaoDep] = useState(false);
    const [caucaoBemIM, setCaucaoBemIM] = useState(false);
    const [titulos, setTitulos] = useState(false);
    const [seguroFi, setSeguroFi] = useState(false);
    const [renovacao, setRenovacao] = useState(false);
    const [restricoes, setRestricoes] = useState(false);
    const [reajusteAnual, setReajusteAnual] = useState(false);
    const [servicoAdicional, setServicoAdicional] = useState(false);
    const [locatarioRealiza, setLocatarioRealiza] = useState(false);
    const [direitoPreferencia, setDireitoPreferencia] = useState(false);
    const [Testemunhas, setTestemunhas] = useState(false);
    const pilha = useRef(new Pilha());


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

    const handleBack = () => {
        setStep(pilha.current.desempilhar());
    }


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
        } else if (!locadorioJuri && nextStep === 18) {
            nextStep = 25;
        }

        if (currentStepData.sublocatario === 'pj') {
            setSublocadorJuri(true);
            nextStep = 31
        } else if (!sublocadorJuri && nextStep === 30) {
            nextStep = 37;
        }

        if (currentStepData.sublocatario === 'pj') {
            setSublocadorJuri(true);
            nextStep = 31
        } else if (!sublocadorJuri && nextStep === 30) {
            nextStep = 37;
        }


        if (currentStepData.locadorAutoriza === 'N') {
            nextStep = 0
            alert(`Obter a autorização por escrito antes de prosseguir !`);
            return;
        }


        if (currentStepData.possibilidadeRenovacao === 'S') {
            setRenovacao(true);
            nextStep = 45
        } else if (currentStepData.possibilidadeRenovacao === 'N') {
            nextStep = 46;
        }



        if (currentStepData.garantia === 'S') {
            setGarantia(true);
            nextStep = 52;
        } else if (currentStepData.garantia === 'N') {
            nextStep = 66;
        }

        //para verificar se o próximo é o ultimo de step de algum garantidor
        if (nextStep === 61) {
            nextStep = 66
        } else if (nextStep === 62) {
            nextStep = 66
        } else if (nextStep === 63) {
            nextStep = 66
        } else if (nextStep === 64) {
            nextStep = 66
        } else if (nextStep === 65) {
            nextStep = 66
        }


        switch (currentStepData.qualgarantidor) {
            case "fi":
                setFiador(true);
                break;
            case "caudep":
                setCaucaoDep(true);
                nextStep = 62;
                break;
            case "caubem":
                setCaucaoBemIM(true);
                nextStep = 63;
                break;
            case "ti":
                setTitulos(true);
                nextStep = 64;
                break;
            case "segfianca":
                setSeguroFi(true);
                nextStep = 65;
                break;
            default:
                break;
        }



        if (currentStepData.sublocadorAdicional === 'S') {
            setSublocadorAdicional(true);
            nextStep = 69;
        } else if (currentStepData.sublocadorAdicional === 'N') {
            nextStep = 70;
        }

        if (currentStepData.testemunhasNecessarias === 'S') {
            setTestemunhas(true);
            nextStep = 83;
        } else if (currentStepData.testemunhasNecessarias === 'N') {
            nextStep = 87;
        }



        if (nextStep === step) {
            nextStep += 1;
        }

        setStep(nextStep);
        pilha.current.empilhar(nextStep);


        // Logs para depuração
        console.log(`qtd step depois do ajuste: ${nextStep}`);

        // Limpar os dados do passo atual.
        setCurrentStepData({});
    }


    const geradorPdfImovelResidencial = (dados: any) => {
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
        doc.text("CONTRATO DE SUBLOCAÇÃO DE IMÓVEL RESIDÊNCIAL", 105, posY, { align: "center" });
        posY += 15;

        // 1. Identificação das Partes
        addSection("1. Identificação das Partes", [
            "Art. 14 - O locatário não poderá sublocar o imóvel no todo ou em parte sem o consentimento prévio e por escrito do locador.",
            "Locador (Proprietário do Imóvel):",
            `Nome completo ou Razão Social: ${verificarValor(dados.locador) === 'pf' ? verificarValor(dados.nomeLocador) : verificarValor(dados.razaoSocial)}`,
            `CPF ou CNPJ: ${verificarValor(dados.locador) === 'pf' ? verificarValor(dados.CPFLocador) : verificarValor(dados.cnpjlocador)}`,
            `Endereço completo: ${verificarValor(dados.locador) === 'pf' ? verificarValor(dados.enderecoLocador) : verificarValor(dados.enderecoCNPJ)}`,
            `Telefone e e-mail para contato: ${verificarValor(dados.locador) === 'pf' ? verificarValor(dados.telefoneLocador) : verificarValor(dados.telefoneCNPJ)}, ${verificarValor(dados.locador) === 'pf' ? verificarValor(dados.emailLocador) : verificarValor(dados.emailCNPJ)}`,
            "",
            "Locatário (Inquilino Original):",
            `Nome completo: ${verificarValor(dados.locatario) === 'pf' ? verificarValor(dados.nomelocatario) : verificarValor(dados.razaoSociallocatario)}`,
            `CPF: ${verificarValor(dados.locatario) === 'pf' ? verificarValor(dados.CPFlocatario) : verificarValor(dados.cpflocatario)}`,
            `Endereço completo: ${verificarValor(dados.locatario) === 'pf' ? verificarValor(dados.enderecolocatario) : verificarValor(dados.enderecolocatarioCNPJ)}`,
            `Telefone e e-mail para contato: ${verificarValor(dados.locatario) === 'pf' ? verificarValor(dados.telefonelocatario) : verificarValor(dados.telefonelocatarioCNPJ)}, ${verificarValor(dados.locatario) === 'pf' ? verificarValor(dados.emaillocatario) : verificarValor(dados.emaillocatarioCNPJ)}`,
            "",
            "Sublocatário (Novo Inquilino):",
            `Nome completo: ${verificarValor(dados.sublocatario) === 'pf' ? verificarValor(dados.nomeSublocatario) : verificarValor(dados.razaoSocialsublocatario)}`,
            `CPF: ${verificarValor(dados.sublocatario) === 'pf' ? verificarValor(dados.CPFSublocatario) : verificarValor(dados.cpfsublocatario)}`,
            `Endereço completo: ${verificarValor(dados.sublocatario) === 'pf' ? verificarValor(dados.enderecoSublocatario) : verificarValor(dados.enderecosublocatarioCNPJ)}`,
            `Telefone e e-mail para contato: ${verificarValor(dados.sublocatario) === 'pf' ? verificarValor(dados.telefoneSublocatario) : verificarValor(dados.telefonesublocatarioCNPJ)}, ${verificarValor(dados.sublocatario) === 'pf' ? verificarValor(dados.emailSublocatario) : verificarValor(dados.emailsublocatarioCNPJ)}`,
        ]);

        // 2. Autorização para Sublocação
        addSection("2. Autorização para Sublocação", [
            `O locador original autorizou formalmente a sublocação ? ${verificarValor(dados.locadorAutoriza) === 'S' ? 'Sim' : 'Não'}`,
            verificarValor(dados.locadorAutoriza) === 'S' ? "Anexar a autorização por escrito ao contrato." : "Obter a autorização por escrito antes de prosseguir."
        ]);

        // 3. Descrição do Imóvel
        addSection("3. Descrição do Imóvel", [
            `Endereço completo do imóvel: ${verificarValor(dados.enderecoCompleto)}`,
            `Descrição detalhada do imóvel: ${verificarValor(dados.descDetalhada)}`,
            `Estado atual do imóvel: ${verificarValor(dados.estado)}`,
            `Finalidade: ${verificarValor(dados.finalidade)}`
        ]);

        // 4. Prazo da Sublocação
        addSection("4. Prazo da Sublocação", [
            `Data de início da sublocação: ${verificarValor(dados.dataInicio)}`,
            `Data de término da sublocação: ${verificarValor(dados.dataFim)}`,
            `Possibilidade de renovação ? ${verificarValor(dados.possibilidadeRenovacao) === 'S' ? 'Sim' : 'Não'}`,
            verificarValor(dados.possibilidadeRenovacao) === 'S' ? `Condições de renovação: ${verificarValor(dados.quaisCondicoes)}` : ""
        ]);

        // 5. Valor do Aluguel e Condições de Pagamento
        addSection("5. Valor do Aluguel e Condições de Pagamento", [
            `Valor mensal do aluguel: ${verificarValor(dados.valorMensal)}`,
            `Data de vencimento mensal: ${verificarValor(dados.dataVenci)}`,
            `Forma de pagamento: ${verificarValor(dados.formaPagamento)}`,
            `Multa por atraso no pagamento: ${verificarValor(dados.multaAtraso)}`,
            `Juros aplicáveis em caso de atraso: ${verificarValor(dados.jurosAplicaveis)}`
        ]);

        // 6. Garantias Locatícias
        addSection("6. Garantias Locatícias", [
            `Art. 37 - No contrato de locação, pode ser exigida pelo locador uma das seguintes modalidades de garantia:
            I - caução;
            II - fiança;
            III - seguro de fiança locatícia;`,
            `Tipo de garantia exigida: ${verificarValor(dados.garantia) === 'S' ? verificarValor(dados.qualgarantidor) : 'Nenhuma'}`,
            verificarValor(dados.garantia) === 'S' ? `Detalhes da garantia: ${verificarValor(dados.qualgarantidor) === 'fi' ? `Fiador: ${verificarValor(dados.nomeFiador)}, CPF: ${verificarValor(dados.cpfFiador)}` : verificarValor(dados.qualgarantidor) === 'caudep' ? `Caução em dinheiro: ${verificarValor(dados.valorTitCaucao)}` : verificarValor(dados.qualgarantidor) === 'caubem' ? `Caução em bem: ${verificarValor(dados.descBemCaucao)}` : verificarValor(dados.qualgarantidor) === 'ti' ? `Título de crédito: ${verificarValor(dados.descCredUtili)}` : `Seguro-fiança: ${verificarValor(dados.segFianca)}`}` : "",
            `Procedimento para devolução da garantia ao término do contrato: ${verificarValor(dados.procedimentoDevolucao)}`
        ]);

        // 7. Obrigações do Sublocador
        addSection("7. Obrigações do Sublocador", [
            `O sublocador se responsabiliza por: ${verificarValor(dados.sublocadorResponsa)}`,
            `O sublocador fornecerá algum serviço adicional? ${verificarValor(dados.sublocadorAdicional)}`
        ]);

        // 8. Obrigações do Sublocatário
        addSection("8. Obrigações do Sublocatário", [
            `Art. 23 - O locatário é obrigado a:
             I - pagar pontualmente o aluguel e os encargos da locação, nos prazos ajustados;
             II - utilizar o imóvel conforme foi ajustado e tratá-lo com o mesmo cuidado como se fosse seu;
             III - restituir o imóvel, ao fim da locação, no estado em que o recebeu, salvo deteriorações decorrentes do uso normal.`,
            `O sublocatário pode sublocar ou ceder o imóvel a terceiros? ${verificarValor(dados.sublocatarioCeder)}`,
            `O sublocatário é responsável por: ${verificarValor(dados.sublocatarioManu)}`,
            `O sublocatário deve respeitar as leis e regulamentos aplicáveis ao uso do imóvel? ${verificarValor(dados.sublocatarioRespeita)}`,
            `O sublocatário é responsável por multas e infrações ocorridas durante o período de sublocação? ${verificarValor(dados.sublocatarioMulta)}`,
            `O sublocatário deve comunicar imediatamente ao sublocador sobre qualquer dano ao imóvel? ${verificarValor(dados.sublocatarioComunica)}`,
            `O sublocatário deve devolver o imóvel no mesmo estado em que o recebeu, salvo desgaste natural? ${verificarValor(dados.sublocatarioDevolve)}`
        ]);

        // 9. Despesas e Tributos
        addSection("9. Despesas e Tributos", [
            `Art. 22, VIII - Cabe ao locador pagar os impostos, taxas e o prêmio de seguro complementar contra incêndio, salvo disposição expressa em contrário no contrato.
             Art. 25 - O sublocatário responde perante o locatário pelos atos que praticar no imóvel e pelas obrigações previstas no contrato de sublocação.`,
            `Despesas do sublocatário: ${verificarValor(dados.despesasSublocatario)}`,
            `Despesas do sublocador: ${verificarValor(dados.despesasSublocador)}`
        ]);

        // 10. Rescisão do Contrato
        addSection("10. Rescisão do Contrato", [
            `Art. 9º - A locação poderá ser desfeita:
             I - por mútuo acordo;
             II - em decorrência da prática de infração legal ou contratual;
             III - em caso de falta de pagamento do aluguel e encargos;
             IV - para realização de reparações urgentes determinadas pelo Poder Público.`,
            `Condições para rescisão antecipada: ${verificarValor(dados.condicoesRescisao)}`,
            `Multas ou penalidades aplicáveis: ${verificarValor(dados.multasPenalidades)}`,
            `Prazo para notificação prévia de rescisão: ${verificarValor(dados.prazo)}`
        ]);

        // 11. Disposições Gerais
        addSection("11. Disposições Gerais", [
            `Foro eleito para resolução de conflitos: ${verificarValor(dados.foroResolucaoConflitos)}`,
            `Necessidade de testemunhas para assinatura do contrato: ${verificarValor(dados.testemunhasNecessarias) === 'S' ? 'Sim' : 'Não'}`,
            verificarValor(dados.testemunhasNecessarias) === 'S' ? `Testemunha 1: ${verificarValor(dados.nomeTest1)}, CPF: ${verificarValor(dados.cpfTest1)}` : "",
            verificarValor(dados.testemunhasNecessarias) === 'S' ? `Testemunha 2: ${verificarValor(dados.nomeTest2)}, CPF: ${verificarValor(dados.cpfTest2)}` : "",
            `Local de assinatura: ${verificarValor(dados.local)}`,
            `Data de assinatura: ${verificarValor(dados.dataAssinatura)}`,
            `O contrato será registrado em cartório? ${verificarValor(dados.registroCartorio) === 'S' ? 'Sim' : 'Não'}`
        ]);

        addSection("12. Assinaturas", [
            "___________________________________________",
            `Locador: ${verificarValor(dados.locador) === 'pf' ? verificarValor(dados.nomeLocador) : verificarValor(dados.razaoSocial)}`,
            "",
            "___________________________________________",
            `Locatário: ${verificarValor(dados.locatario) === 'pf' ? verificarValor(dados.nomelocatario) : verificarValor(dados.razaoSociallocatario)}`,
            "",
            "___________________________________________",
            `Sublocatário: ${verificarValor(dados.sublocatario) === 'pf' ? verificarValor(dados.nomeSublocatario) : verificarValor(dados.razaoSocialsublocatario)}`,
            "",
            dados.testemunhasNecessarias === 'S' ? "___________________________________________" : "",
            dados.testemunhasNecessarias === 'S' ? `Testemunha 1: ${verificarValor(dados.nomeTest1)}` : "",
            dados.testemunhasNecessarias === 'S' ? "" : "",
            dados.testemunhasNecessarias === 'S' ? "___________________________________________" : "",
            dados.testemunhasNecessarias === 'S' ? `Testemunha 2: ${verificarValor(dados.nomeTest2)}` : ""
        ]);

        const pdfDataUri = doc.output("datauristring");
        setPdfDataUrl(pdfDataUri);
    };

    useEffect(() => {
        geradorPdfImovelResidencial({ ...formData });
    }, [formData]);

    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title">Contrato de Sublocação de Imóvel Comercial</h1>
            </div>
            <div className="container">
                <div className="left-panel">
                    <div className="scrollable-card">
                        <div className="progress-bar">
                            <div
                                className="progress-bar-inner"
                                style={{ width: `${(step / 97) * 100}%` }}
                            ></div>
                        </div>
                        <div className="form-wizard">
                            {step === 1 && (
                                <>
                                    <h2>Dados do Proprietário do Imóvel</h2>
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
                                    <h2>Dados do Proprietário do Imóvel</h2>
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
                                    <h2>Dados do Proprietário do Imóvel</h2>
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
                                    <h2>Dados do Proprietário do Imóvel</h2>
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
                                    <h2>Dados do Proprietário do Imóvel</h2>
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
                                    <h2>Dados do Proprietário do Imóvel</h2>
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
                                            <h2>Dados do Proprietário do Imóvel</h2>
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
                                            <h2>Dados do Proprietário do Imóvel</h2>
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
                                            <h2>Dados do Proprietário do Imóvel</h2>
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
                                            <h2>Dados do Proprietário do Imóvel</h2>
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
                                            <h2>Dados do Proprietário do Imóvel</h2>
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
                                            <h2>Dados do Proprietário do Imóvel</h2>
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
                                    <h2>Dados do Inquilino do Imóvel</h2>
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
                                    <h2>Dados do Inquilino do Imóvel</h2>
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
                                    <h2>Dados do Inquilino do Imóvel</h2>
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
                                    <h2>Dados do Inquilino do Imóvel</h2>
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
                                    <h2>Dados do Inquilino do Imóvel</h2>
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
                                    <h2>Dados do Inquilino do Imóvel</h2>
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
                                            <h2>Dados do Inquilino do Imóvel</h2>
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
                                            <h2>Dados do Inquilino do Imóvel</h2>
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
                                            <h2>Dados do Inquilino do Imóvel</h2>
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
                                            <h2>Dados do Inquilino do Imóvel</h2>
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
                                            <h2>Dados do Inquilino do Imóvel</h2>
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
                                            <h2>Dados do Inquilino do Imóvel</h2>
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

                            {step === 25 && (
                                <>
                                    <h2>Dados do Sublocatário (Pessoa que irá sublocar o imóvel) </h2>
                                    <div>
                                        <label>O Sublocatário é pessoa?</label>
                                        <select name='sublocatario' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="pj">Jurídica</option>
                                            <option value="pf">Física</option>
                                        </select>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {/**Pessoa Fisica */}
                            {step === 26 && (
                                <>
                                    <h2>Dados do Sublocatário (Pessoa que irá sublocar o imóvel) </h2>
                                    <div>
                                        <label>Nome do Sublocador</label>
                                        <input
                                            type='text'
                                            placeholder='Nome do Locador'
                                            name="nomeSublocatario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 27 && (
                                <>
                                    <h2>Dados do Sublocatário (Pessoa que irá sublocar o imóvel) </h2>
                                    <div>
                                        <label>CPF</label>
                                        <input
                                            type='text'
                                            placeholder='CPF do Locador'
                                            name="CPFSublocatario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 28 && (
                                <>
                                    <h2>Dados do Sublocatário (Pessoa que irá sublocar o imóvel) </h2>
                                    <div>
                                        <label>Endereço do Sublocador</label>
                                        <input
                                            type='text'
                                            placeholder='Onde o locador mora'
                                            name="enderecoSublocatario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 29 && (
                                <>
                                    <h2>Dados do Sublocatário (Pessoa que irá sublocar o imóvel) </h2>
                                    <div>
                                        <label>Telefone do Sublocador</label>
                                        <input
                                            type='text'
                                            placeholder='(DDD)número-número'
                                            name="telefoneSublocatario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 30 && (
                                <>
                                    <h2>Dados do Sublocatário (Pessoa que irá sublocar o imóvel) </h2>
                                    <div>
                                        <label>Email do Sublocador</label>
                                        <input
                                            type='text'
                                            placeholder='email@email.com'
                                            name="emailSublocatario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {/**Pessoa Juridica */}

                            {sublocadorJuri && (
                                <>
                                    {step === 31 && (
                                        <>
                                            <h2>Dados do Sublocatário (Pessoa que irá sublocar o imóvel) </h2>
                                            <div>
                                                <label>Razão Social</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="razaoSocialsublocatario"
                                                    onChange={handleChange}
                                                />
                                                <label>CNPJ</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cnpjsublocatario"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 32 && (
                                        <>
                                            <h2>Dados do Sublocatário (Pessoa que irá sublocar o imóvel) </h2>
                                            <div>
                                                <label>Endereço de onde o CNPJ esta cadastrado</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="enderecosublocatarioCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 33 && (
                                        <>
                                            <h2>Dados do Sublocatário (Pessoa que irá sublocar o imóvel) </h2>
                                            <div>
                                                <label>Telefone</label>
                                                <input
                                                    type='text'
                                                    placeholder='(DDD)número-número'
                                                    name="telefonesublocatarioCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 34 && (
                                        <>
                                            <h2>Dados do Sublocatário (Pessoa que irá sublocar o imóvel) </h2>
                                            <div>
                                                <label>Email</label>
                                                <input
                                                    type='text'
                                                    placeholder='(DDD)número-número'
                                                    name="emailsublocatarioCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 35 && (
                                        <>
                                            <h2>Dados do Sublocatário (Pessoa que irá sublocar o imóvel) </h2>
                                            <div>
                                                <label>Nome do representante do CNPJ</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="nomeRepresentantesublocatarioCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 36 && (
                                        <>
                                            <h2>Dados do Sublocatário (Pessoa que irá sublocar o imóvel) </h2>
                                            <div>
                                                <label>CPF do representante do CNPJ</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="CPFRepresentantesublocatarioCNPJ"
                                                    onChange={handleChange}
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
                                    <h2>Autorização para Sublocação</h2>
                                    <div>
                                        <label>O locador original autorizou formalmente a sublocação? </label>
                                        <i>
                                            Se sim, anexar a autorização por escrito ao contrato.
                                            Caso contrário, obter a autorização por escrito antes de prosseguir
                                        </i>
                                        <select name='locadorAutoriza' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 38 && (
                                <>
                                    <h2>Descrição do Imóvel</h2>
                                    <div>
                                        <label>Endereço completo do imóvel </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="enderecoCompleto"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 39 && (
                                <>
                                    <h2>Descrição do Imóvel</h2>
                                    <div>
                                        <label>Descrição detalhada do imóvel (ex.: número de salas, banheiros, área total) </label>
                                        <textarea
                                            id="descDetalhada"
                                            name="descDetalhada"
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

                            {step === 40 && (
                                <>
                                    <h2>Descrição do Imóvel</h2>
                                    <div>
                                        <label>Finalidade da sublocação (ex.: comércio de roupas, restaurante, escritório) </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="finalidade"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 41 && (
                                <>
                                    <h2>Descrição do Imóvel</h2>
                                    <div>
                                        <label>Estado atual do imóvel (anexar laudo de vistoria, se necessário)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="estado"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 42 && (
                                <>
                                    <h2>Prazo da Sublocação</h2>
                                    <div>
                                        <label>Data de início da sublocação</label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="dataInicio"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 43 && (
                                <>
                                    <h2>Prazo da Sublocação</h2>
                                    <div>
                                        <label>Data de término da sublocação</label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="dataFim"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 44 && (
                                <>
                                    <h2>Prazo da Sublocação</h2>
                                    <div>
                                        <label>Possibilidade de renovação?</label>
                                        <div>
                                            <select name='possibilidadeRenovacao' onChange={handleChange}>
                                                <option value="">Selecione</option>
                                                <option value="S">Sim</option>
                                                <option value="N">Não</option>
                                            </select>
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {renovacao && (
                                <>
                                    {step === 45 && (
                                        <>
                                            <h2>Descrição do Imóvel</h2>
                                            <div>
                                                <label>Sob quais condições ?</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="quaisCondicoes"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 46 && (
                                <>
                                    <h2>Valor do Aluguel e Condições de Pagamento</h2>
                                    <div>
                                        <label>Valor mensal do aluguel</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="valorMensal"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 47 && (
                                <>
                                    <h2>Valor do Aluguel e Condições de Pagamento</h2>
                                    <div>
                                        <label>Data de vencimento mensal</label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="dataVenci"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 48 && (
                                <>
                                    <h2>Valor do Aluguel e Condições de Pagamento</h2>
                                    <div>
                                        <label>Forma de pagamento (ex.: depósito bancário, boleto, Pix)</label>
                                        <div>
                                            <select name='formaPagamento' onChange={handleChange}>
                                                <option value="">Selecione</option>
                                                <option value="Pix">Pix</option>
                                                <option value="Dinheiro">Dinheiro</option>
                                                <option value="Cartao">Cartão</option>
                                                <option value="Boleto">Boleto</option>
                                            </select>
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 49 && (
                                <>
                                    <h2>Valor do Aluguel e Condições de Pagamento</h2>
                                    <div>
                                        <label>Multa por atraso no pagamento</label>
                                        <input
                                            type='text'
                                            placeholder='ex.: 3.25 , 1.00 ...'
                                            name="multaAtraso"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 50 && (
                                <>
                                    <h2>Valor do Aluguel e Condições de Pagamento</h2>
                                    <div>
                                        <label>Juros aplicáveis em caso de atraso</label>
                                        <input
                                            type='text'
                                            placeholder='porcentagem ex.: %2 mm , 1%aa'
                                            name="jurosAplicaveis"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 51 && (
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
                                    {step === 52 && (
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
                                    {step === 53 && (
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
                                                    <button onClick={handleNext}>Próximo</button>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 54 && (
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
                                                    <button onClick={handleNext}>Próximo</button>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 55 && (
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
                                                    <button onClick={handleNext}>Próximo</button>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 56 && (
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
                                                    <button onClick={handleNext}>Próximo</button>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 57 && (
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
                                                    <button onClick={handleNext}>Próximo</button>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 58 && (
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
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 59 && (
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
                                                    <button onClick={handleNext}>Próximo</button>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 60 && (
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
                                                    <button onClick={handleNext}>Próximo</button>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 61 && (
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
                                                    <button onClick={handleNext}>Próximo</button>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                </>
                            )}

                            {caucaoDep && (
                                <>
                                    {step === 62 && (
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
                                                    <button onClick={handleNext}>Próximo</button>
                                                </div>
                                            </div>
                                        </>
                                    )}



                                </>
                            )}

                            {caucaoBemIM && (
                                <>
                                    {step === 63 && (
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
                                                    <button onClick={handleNext}>Próximo</button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {titulos && (
                                <>
                                    {step === 64 && (
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
                                                    <button onClick={handleNext}>Próximo</button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {seguroFi && (
                                <>
                                    {step === 65 && (
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
                                                    <button onClick={handleNext}>Próximo</button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 66 && (
                                <>
                                    <h2>Garantias</h2>
                                    <div>
                                        <label>Procedimento para devolução da garantia ao término do contrato </label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="procedimentoDevolucao"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 67 && (
                                <>
                                    <h2>Obrigações do Sublocador</h2>
                                    <div>
                                        <label>O sublocador se responsabiliza por quais manutenções ou reparos no imóvel? </label>
                                        <div>
                                            <select name='sublocadorResponsa' onChange={handleChange}>
                                                <option value="">Selecione</option>
                                                <option value="S">Sim</option>
                                                <option value="N">Não</option>
                                            </select>
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 68 && (
                                <>
                                    <h2>Obrigações do Sublocador</h2>
                                    <div>
                                        <label>O sublocador fornecerá algum serviço adicional (ex.: limpeza, segurança)? </label>
                                        <div>
                                            <select name='sublocadorAdicional' onChange={handleChange}>
                                                <option value="">Selecione</option>
                                                <option value="S">Sim</option>
                                                <option value="N">Não</option>
                                            </select>
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {sublocadorAdicional && (
                                <>
                                    {step === 69 && (
                                        <>
                                            <h2>Obrigações do Sublocador</h2>
                                            <div>
                                                <label>Qual serviço em específico? </label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="qual"
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

                            {step === 70 && (
                                <>
                                    <h2>Obrigações do Sublocatário</h2>
                                    <div>
                                        <label>O sublocatário pode sublocar ou ceder o imóvel a terceiros?</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="sublocatarioCeder"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 71 && (
                                <>
                                    <h2>Obrigações do Sublocatário</h2>
                                    <div>
                                        <label>O sublocatário é responsável por quais manutenções no imóvel?</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="sublocatarioManu"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 72 && (
                                <>
                                    <h2>Obrigações do Sublocatário</h2>
                                    <div>
                                        <label>O sublocatário deve respeitar as leis e regulamentos aplicáveis ao uso do imóvel?</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="sublocatarioRespeita"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 73 && (
                                <>
                                    <h2>Obrigações do Sublocatário</h2>
                                    <div>
                                        <label>O sublocatário é responsável por multas e infrações ocorridas durante o período de sublocação?</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="sublocatarioMulta"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 74 && (
                                <>
                                    <h2>Obrigações do Sublocatário</h2>
                                    <div>
                                        <label>O sublocatário deve comunicar imediatamente ao sublocador sobre qualquer dano ao imóvel?</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="sublocatarioComunica"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 75 && (
                                <>
                                    <h2>Obrigações do Sublocatário</h2>
                                    <div>
                                        <label>O sublocatário deve devolver o imóvel no mesmo estado em que o recebeu, salvo desgaste natural? </label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="sublocatarioDevolve"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 76 && (
                                <>
                                    <h2>Despesas e Tributos</h2>
                                    <div>
                                        <label>Quais despesas são de responsabilidade do sublocatário? (ex.: contas de água, luz, internet, IPTU) </label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="despesasSublocatario"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 77 && (
                                <>
                                    <h2>Despesas e Tributos</h2>
                                    <div>
                                        <label>Quais despesas são de responsabilidade do sublocador? </label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="despesasSublocador"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 78 && (
                                <>
                                    <h2>Rescisão do Contrato</h2>
                                    <div>
                                        <label>Condições para rescisão antecipada por ambas as partes</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="condicoesRescisao"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 79 && (
                                <>
                                    <h2>Rescisão do Contrato</h2>
                                    <div>
                                        <label>Multas ou penalidades aplicáveis em caso de rescisão antecipada</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="multasPenalidades"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 80 && (
                                <>
                                    <h2>Rescisão do Contrato</h2>
                                    <div>
                                        <label>Prazo para notificação prévia de rescisão</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="prazo"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 81 && (
                                <>
                                    <h2>Disposições Gerais</h2>
                                    <div>
                                        <label>Foro eleito para resolução de conflitos</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="foroResolucaoConflitos"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 82 && (
                                <>
                                    <h2>Disposições Gerais</h2>
                                    <div>
                                        <label>Necessidade de testemunhas para assinatura do contrato</label>
                                        <select name='testemunhasNecessarias' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {Testemunhas && (
                                <>
                                    {step === 83 && (
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

                                    {step === 84 && (
                                        <>
                                            <h2>Dados das Testemunhas</h2>
                                            <div>
                                                <label>CPF da 1° testemunha </label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="cpfTest1"
                                                        onChange={handleChange}
                                                    />
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 85 && (
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

                                    {step === 86 && (
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

                            {step === 87 && (
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

                            {step === 88 && (
                                <>
                                    <h2>Disposições Gerais</h2>
                                    <div>
                                        <label>Local de Assinatura</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="local"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}
                            {step === 89 && (
                                <>
                                    <h2>Disposições Gerais</h2>
                                    <div>
                                        <label>Data da Assinatura</label>
                                        <div>
                                            <input
                                                type='date'
                                                placeholder=''
                                                name="dataAssinatura"
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
                                src={`${pdfDataUrl}#toolbar=0&navpanes=0`} // Desativa a barra de ferramentas e o painel de navegação
                                title="Pré-visualização do PDF"
                                frameBorder="0"
                                width="100%"
                                height="100%"
                                style={{
                                    pointerEvents: 'none', // Impede interações (como cliques)
                                    overflow: 'auto',      // Permite apenas a rolagem
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
                    <button className='btnBaixarPdf' onClick={() => { }}>
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