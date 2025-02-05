'use client'
import Pilha from '@/lib/pilha';
import { verificarValor } from '@/lib/utils';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import geradorPdfImovelComercialPago from '../util/pdf';

const imovelcomercialschema = z.object({
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



    sublocador: z.enum(['pf', 'pj']).default('pf'),

    /**
     * Dados sublocador pj
     */
    razaoSocialsublocador: z.string(),
    cnpjsublocador: z.string(),
    cpfsublocador: z.string(),
    enderecoCNPJsublocador: z.string(),
    telefoneCNPJsublocador: z.string(),
    emailCNPJsublocador: z.string(),
    nomeRepresentanteCNPJsublocador: z.string(),
    CPFRepresentanteCNPJsublocador: z.string(),
    /** */

    /** Dados sublocador pf */
    nomeSublocador: z.string(),
    CPFSublocador: z.string(),
    enderecoSublocador: z.string(),
    telefoneSublocador: z.string(),
    emailSublocador: z.string(),
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

    /**DESCRIÇÃO DO IMÓVEL */
    enderecoImovel: z.string(),
    descDetalhada: z.string(),
    finalidade: z.string(),
    estadoAtual: z.string(),
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

type FormData = z.infer<typeof imovelcomercialschema>;




export default function ImovelComercial() {
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
    const valor = 29.90;
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

        if (currentStepData.sublocador === 'pj') {
            setSublocadorJuri(true);
            nextStep = 31
        } else if (!sublocadorJuri && nextStep === 30) {
            nextStep = 37;
        }

        if (currentStepData.sublocatario === 'pj') {
            setSublocatarioJuri(true);
            nextStep = 43
        } else if (!sublocatarioJuri && nextStep === 42) {
            nextStep = 49;
        }


        if (currentStepData.possibilidadeRenovacao === 'S') {
            setRenovacao(true);
            nextStep = 55;
        } else if (currentStepData.possibilidadeRenovacao === 'N') {
            nextStep = 56;
        }


        if (currentStepData.garantia === 'S') {
            setGarantia(true);
            nextStep = 62;
        } else if (currentStepData.garantia === 'N') {
            nextStep = 76;
        }

        //para verificar se o próximo é o ultimo de step de algum garantidor
        if (nextStep === 71) {
            nextStep = 76
        } else if (nextStep === 72) {
            nextStep = 76
        } else if (nextStep === 73) {
            nextStep = 76
        } else if (nextStep === 74) {
            nextStep = 76
        } else if (nextStep === 75) {
            nextStep = 76
        }


        switch (currentStepData.qualgarantidor) {
            case "fi":
                setFiador(true);
                break;
            case "caudep":
                setCaucaoDep(true);
                nextStep = 72;
                break;
            case "caubem":
                setCaucaoBemIM(true);
                nextStep = 73;
                break;
            case "ti":
                setTitulos(true);
                nextStep = 74;
                break;
            case "segfianca":
                setSeguroFi(true);
                nextStep = 75;
                break;
            default:
                break;
        }

        if (currentStepData.sublocadorAdicional === 'S') {
            setSublocadorAdicional(true);
            nextStep = 78;
        } else if (currentStepData.sublocadorAdicional === 'N') {
            nextStep = 79;
        }

        if (currentStepData.testemunhasNecessarias === 'S') {
            setTestemunhas(true);
            nextStep = 92;
        } else if (currentStepData.testemunhasNecessarias === 'N') {
            nextStep = 96;
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





    const geradorPdfImovelComercial = (dados: any) => {
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
        doc.text("CONTRATO DE SUBLOCAÇÃO DE IMÓVEL COMERCIAL", 105, posY, { align: "center" });
        posY += 15;

        // 1. Identificação das Partes
        addSection("1. Identificação das Partes", [
            "Art. 11 da Lei do Inquilinato: O locador é obrigado a entregar ao locatário o imóvel alugado em estado de servir ao uso a que se destina.",
            `Locador (Proprietário do Imóvel):`,
            `Nome completo ou Razão Social: ${verificarValor(dados.locador === 'pf' ? dados.nomeLocador : dados.razaoSocial)}`,
            `CPF ou CNPJ: ${verificarValor(dados.locador === 'pf' ? dados.CPFLocador : dados.cnpjlocador)}`,
            `Endereço completo: ${verificarValor(dados.locador === 'pf' ? dados.enderecoLocador : dados.enderecoCNPJ)}`,
            `Telefone e e-mail para contato: ${verificarValor(dados.locador === 'pf' ? dados.telefoneLocador : dados.telefoneCNPJ)}, ${verificarValor(dados.locador === 'pf' ? dados.emailLocador : dados.emailCNPJ)}`,
            ``,
            `Locatário (Inquilino Original):`,
            `Nome completo ou Razão Social: ${verificarValor(dados.locatario === 'pf' ? dados.nomelocatario : dados.razaoSociallocatario)}`,
            `CPF ou CNPJ: ${verificarValor(dados.locatario === 'pf' ? dados.CPFlocatario : dados.cnpj)}`,
            `Endereço completo: ${verificarValor(dados.locatario === 'pf' ? dados.enderecolocatario : dados.enderecolocatarioCNPJ)}`,
            `Telefone e e-mail para contato: ${verificarValor(dados.locatario === 'pf' ? dados.telefonelocatario : dados.telefonelocatarioCNPJ)}, ${verificarValor(dados.locatario === 'pf' ? dados.emaillocatario : dados.emaillocatarioCNPJ)}`,
            ``,
            `Sublocador (Pessoa que irá sublocar o imóvel):`,
            `Nome completo ou Razão Social: ${verificarValor(dados.sublocador === 'pf' ? dados.nomeSublocador : dados.razaoSocialsublocador)}`,
            `CPF ou CNPJ: ${verificarValor(dados.sublocador === 'pf' ? dados.CPFSublocador : dados.cnpjsublocador)}`,
            `Endereço completo: ${verificarValor(dados.sublocador === 'pf' ? dados.enderecoSublocador : dados.enderecoCNPJsublocador)}`,
            `Telefone e e-mail para contato: ${verificarValor(dados.sublocador === 'pf' ? dados.telefoneSublocador : dados.telefoneCNPJsublocador)}, ${verificarValor(dados.sublocador === 'pf' ? dados.emailSublocador : dados.emailCNPJsublocador)}`,
            ``,
            `Sublocatário (Pessoa que irá sublocar o imóvel):`,
            `Nome completo ou Razão Social: ${verificarValor(dados.sublocatario === 'pf' ? dados.nomeSublocatario : dados.razaoSocialsublocatario)}`,
            `CPF ou CNPJ: ${verificarValor(dados.sublocatario === 'pf' ? dados.CPFSublocatario : dados.cnpjsublocatario)}`,
            `Endereço completo: ${verificarValor(dados.sublocatario === 'pf' ? dados.enderecoSublocatario : dados.enderecosublocatarioCNPJ)}`,
            `Telefone e e-mail para contato: ${verificarValor(dados.sublocatario === 'pf' ? dados.telefoneSublocatario : dados.telefonesublocatarioCNPJ)}, ${verificarValor(dados.sublocatario === 'pf' ? dados.emailSublocatario : dados.emailsublocatarioCNPJ)}`,
        ]);

        // 2. Descrição do Imóvel
        addSection("2. Descrição do Imóvel", [
            "Art. 22, I da Lei do Inquilinato: O locador deve entregar ao locatário o imóvel alugado em estado de servir ao uso a que se destina.",
            `Endereço completo do imóvel: ${verificarValor(dados.enderecoImovel)}`,
            `Descrição detalhada do imóvel: ${verificarValor(dados.descDetalhada)}`,
            `Finalidade da sublocação: ${verificarValor(dados.finalidade)}`,
            `Estado atual do imóvel: ${verificarValor(dados.estadoAtual)}`,
        ]);

        // 3. Prazo da Sublocação
        addSection("3. Prazo da Sublocação", [
            "Art. 4º da Lei do Inquilinato: Durante o prazo estipulado para a duração do contrato, não poderá o locador reaver o imóvel alugado.",
            `Data de início da sublocação: ${verificarValor(dados.dataInicio)}`,
            `Data de término da sublocação: ${verificarValor(dados.dataFim)}`,
            `Possibilidade de renovação: ${verificarValor(dados.possibilidadeRenovacao === 'S' ? 'Sim' : 'Não')}`,
            `Condições de renovação: ${verificarValor(dados.quaisCondicoes)}`,
        ]);

        // 4. Valor do Aluguel e Condições de Pagamento
        addSection("4. Valor do Aluguel e Condições de Pagamento", [
            "Art. 17 da Lei do Inquilinato: É livre a convenção do aluguel, vedada a estipulação em moeda estrangeira.",
            `Valor mensal do aluguel: ${verificarValor(dados.valorMensal)}`,
            `Data de vencimento mensal: ${verificarValor(dados.dataVenci)}`,
            `Forma de pagamento: ${verificarValor(dados.formaPagamento)}`,
            `Multa por atraso no pagamento: ${verificarValor(dados.multaAtraso)}`,
            `Juros aplicáveis em caso de atraso: ${verificarValor(dados.jurosAplicaveis)}`,
        ]);

        // 5. Garantias Locatícias
        addSection("5. Garantias Locatícias", [
            "Art. 37 da Lei do Inquilinato: No contrato de locação, pode o locador exigir do locatário as seguintes modalidades de garantia: caução, fiança, seguro de fiança locatícia e cessão fiduciária de quotas de fundo de investimento.",
            `Tipo de garantia exigida: ${verificarValor(dados.garantia === 'S' ? 'Sim' : 'Não')}`,
            `Detalhes da garantia: ${verificarValor(dados.qualgarantidor)}`,
            `Procedimento para devolução da garantia: ${verificarValor(dados.procedimentoDevolucao)}`,
        ]);

        // 6. Obrigações do Sublocador
        addSection("6. Obrigações do Sublocador", [
            "Art. 23 da Lei do Inquilinato: O locatário é obrigado a pagar pontualmente o aluguel e os encargos da locação, bem como utilizar o imóvel conforme estipulado.",
            `O sublocador se responsabiliza por: ${verificarValor(dados.sublocadorResponsa)}`,
            `Serviços adicionais fornecidos: ${verificarValor(dados.sublocadorAdicional)}`,
        ]);

        // 7. Obrigações do Sublocatário
        addSection("7. Obrigações do Sublocatário", [
            "Art. 24 da Lei do Inquilinato: O sublocatário responde perante o locador pela inobservância dos deveres impostos ao locatário.",
            `O sublocatário pode sublocar ou ceder o imóvel a terceiros: ${verificarValor(dados.sublocatarioCeder)}`,
            `O sublocatário é responsável por: ${verificarValor(dados.sublocatarioManu)}`,
            `O sublocatário deve respeitar as leis e regulamentos: ${verificarValor(dados.sublocatarioRespeita)}`,
            `O sublocatário é responsável por multas e infrações: ${verificarValor(dados.sublocatarioMulta)}`,
            `O sublocatário deve comunicar acidentes ou danos: ${verificarValor(dados.sublocatarioComunica)}`,
            `O sublocatário deve devolver o imóvel no mesmo estado: ${verificarValor(dados.sublocatarioDevolve)}`,
        ]);

        // 8. Despesas e Tributos
        addSection("8. Despesas e Tributos", [
            "Art. 22, VIII da Lei do Inquilinato: Compete ao locador pagar os impostos e taxas que incidam sobre o imóvel, salvo disposição contratual em contrário.",
            `Despesas do sublocatário: ${verificarValor(dados.despesasSublocatario)}`,
            `Despesas do sublocador: ${verificarValor(dados.despesasSublocador)}`,
        ]);

        // 9. Rescisão do Contrato
        addSection("9. Rescisão do Contrato", [
            "Art. 9º da Lei do Inquilinato: A locação poderá ser desfeita por mútuo acordo, infração contratual ou falta de pagamento.",
            `Condições para rescisão antecipada: ${verificarValor(dados.condicoesRescisao)}`,
            `Multas ou penalidades aplicáveis: ${verificarValor(dados.multasPenalidades)}`,
            `Prazo para notificação prévia: ${verificarValor(dados.prazo)}`,
        ]);

        // 10. Disposições Gerais
        addSection("10. Disposições Gerais", [
            "Art. 68 da Lei do Inquilinato: Nos litígios entre locador e locatário, é competente o foro da situação do imóvel.",
            `Foro eleito para resolução de conflitos: ${verificarValor(dados.foroResolucaoConflitos)}`,
            `Necessidade de testemunhas: ${verificarValor(dados.testemunhasNecessarias === 'S' ? 'Sim' : 'Não')}`,
            `Testemunha 1: ${verificarValor(dados.nomeTest1)}, CPF: ${verificarValor(dados.cpfTest1)}`,
            `Testemunha 2: ${verificarValor(dados.nomeTest2)}, CPF: ${verificarValor(dados.cpfTest2)}`,
            `Registro em cartório: ${verificarValor(dados.registroCartorio === 'S' ? 'Sim' : 'Não')}`,
            `Local: ${verificarValor(dados.local)}`,
            `Data de Assinatura: ${verificarValor(dados.dataAssinatura)}`,
        ]);

        checkPageBreak(60);
        posY += 20;
        doc.setFontSize(12);
        doc.text("Assinaturas:", 105, posY, { align: "center" });
        posY += 20;

        doc.text("Locador: ___________________________", marginX, posY);
        posY += 15;
        doc.text("Locatário: ___________________________", marginX, posY);
        posY += 15;
        doc.text("Sublocador: ___________________________", marginX, posY);
        posY += 15;
        doc.text("Sublocatário: ___________________________", marginX, posY);

        const pdfDataUri = doc.output("datauristring");
        setPdfDataUrl(pdfDataUri);
    };

    useEffect(() => {
        geradorPdfImovelComercial({ ...formData });
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
                                style={{ width: `${(step / 96) * 100}%` }}
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
                                    <h2>Dados do Sublocador (Pessoa que irá sublocar o imóvel) </h2>
                                    <div>
                                        <label>O Sublocador é pessoa?</label>
                                        <select name='sublocador' onChange={handleChange}>
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
                                    <h2>Dados do Sublocador (Pessoa que irá sublocar o imóvel) </h2>
                                    <div>
                                        <label>Nome do Sublocador</label>
                                        <input
                                            type='text'
                                            placeholder='Nome do Locador'
                                            name="nomeSublocador"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 27 && (
                                <>
                                    <h2>Dados do Sublocador (Pessoa que irá sublocar o imóvel) </h2>
                                    <div>
                                        <label>CPF</label>
                                        <input
                                            type='text'
                                            placeholder='CPF do Locador'
                                            name="CPFSublocador"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 28 && (
                                <>
                                    <h2>Dados do Sublocador (Pessoa que irá sublocar o imóvel) </h2>
                                    <div>
                                        <label>Endereço do Sublocador</label>
                                        <input
                                            type='text'
                                            placeholder='Onde o locador mora'
                                            name="enderecoSublocador"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 29 && (
                                <>
                                    <h2>Dados do Sublocador (Pessoa que irá sublocar o imóvel) </h2>
                                    <div>
                                        <label>Telefone do Sublocador</label>
                                        <input
                                            type='text'
                                            placeholder='(DDD)número-número'
                                            name="telefoneSublocador"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 30 && (
                                <>
                                    <h2>Dados do Sublocador (Pessoa que irá sublocar o imóvel) </h2>
                                    <div>
                                        <label>Email do Sublocador</label>
                                        <input
                                            type='text'
                                            placeholder='email@email.com'
                                            name="emailSublocador"
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
                                            <h2>Dados do Sublocador (Pessoa que irá sublocar o imóvel) </h2>
                                            <div>
                                                <label>Razão Social</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="razaoSocialsublocador"
                                                    onChange={handleChange}
                                                />
                                                <label>CNPJ</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cnpjsublocador"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 32 && (
                                        <>
                                            <h2>Dados do Sublocador (Pessoa que irá sublocar o imóvel) </h2>
                                            <div>
                                                <label>Endereço de onde o CNPJ esta cadastrado</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="enderecoCNPJsublocador"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 33 && (
                                        <>
                                            <h2>Dados do Sublocador (Pessoa que irá sublocar o imóvel) </h2>
                                            <div>
                                                <label>Telefone</label>
                                                <input
                                                    type='text'
                                                    placeholder='(DDD)número-número'
                                                    name="telefoneCNPJsublocador"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 34 && (
                                        <>
                                            <h2>Dados do Sublocador (Pessoa que irá sublocar o imóvel) </h2>
                                            <div>
                                                <label>Email</label>
                                                <input
                                                    type='text'
                                                    placeholder='(DDD)número-número'
                                                    name="emailCNPJsublocador"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 35 && (
                                        <>
                                            <h2>Dados do Sublocador (Pessoa que irá sublocar o imóvel) </h2>
                                            <div>
                                                <label>Nome do representante do CNPJ</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="nomeRepresentanteCNPJsublocador"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 36 && (
                                        <>
                                            <h2>Dados do Sublocador (Pessoa que irá sublocar o imóvel) </h2>
                                            <div>
                                                <label>CPF do representante do CNPJ</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="CPFRepresentanteCNPJsublocador"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                </>
                            )}

                            {/**Sublocatário */}
                            {step === 37 && (
                                <>
                                    <h2>Dados do Sublocatário </h2>
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
                            {step === 38 && (
                                <>
                                    <h2>Dados do Sublocatário </h2>
                                    <div>
                                        <label>Nome do Sublocatário</label>
                                        <input
                                            type='text'
                                            placeholder='Nome do Locatário'
                                            name="nomeSublocatario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 39 && (
                                <>
                                    <h2>Dados do Sublocatário </h2>
                                    <div>
                                        <label>CPF</label>
                                        <input
                                            type='text'
                                            placeholder='CPF do Locatário'
                                            name="CPFSublocatario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 40 && (
                                <>
                                    <h2>Dados do Sublocatário </h2>
                                    <div>
                                        <label>Endereço do Sublocatário</label>
                                        <input
                                            type='text'
                                            placeholder='Onde o locatário mora'
                                            name="enderecoSublocatario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 41 && (
                                <>
                                    <h2>Dados do Sublocatário </h2>
                                    <div>
                                        <label>Telefone do Sublocatário</label>
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
                            {step === 42 && (
                                <>
                                    <h2>Dados do Sublocatário </h2>
                                    <div>
                                        <label>Email do Sublocatário</label>
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

                            {sublocatarioJuri && (
                                <>
                                    {step === 43 && (
                                        <>
                                            <h2>Dados do Sublocatário </h2>
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

                                    {step === 44 && (
                                        <>
                                            <h2>Dados do Sublocatário </h2>
                                            <div>
                                                <label>Endereço do onde o CNPJ esta cadastrado</label>
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
                                    {step === 45 && (
                                        <>
                                            <h2>Dados do Sublocatário </h2>
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
                                    {step === 46 && (
                                        <>
                                            <h2>Dados do Sublocatário </h2>
                                            <div>
                                                <label>Email</label>
                                                <input
                                                    type='text'
                                                    placeholder='email@email.com'
                                                    name="emailsublocatarioCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 47 && (
                                        <>
                                            <h2>Dados do Sublocatário </h2>
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
                                    {step === 48 && (
                                        <>
                                            <h2>Dados do Sublocatário </h2>
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

                            {step === 49 && (
                                <>
                                    <h2>Descrição do Imóvel</h2>
                                    <div>
                                        <label>Endereço completo do imóvel </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="enderecoImovel"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 50 && (
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

                            {step === 51 && (
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

                            {step === 51 && (
                                <>
                                    <h2>Descrição do Imóvel</h2>
                                    <div>
                                        <label>Estado atual do imóvel (anexar laudo de vistoria, se necessário)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="estadoAtual"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 52 && (
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
                            {step === 53 && (
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

                            {step === 54 && (
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
                                    {step === 55 && (
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

                            {step === 56 && (
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

                            {step === 57 && (
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

                            {step === 58 && (
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

                            {step === 59 && (
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


                            {step === 60 && (
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
                            {step === 61 && (
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
                                    {step === 62 && (
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
                                    {step === 63 && (
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

                                    {step === 64 && (
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

                                    {step === 65 && (
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

                                    {step === 66 && (
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

                                    {step === 67 && (
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

                                    {step === 68 && (
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

                                    {step === 69 && (
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

                                    {step === 70 && (
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

                                    {step === 71 && (
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
                                    {step === 72 && (
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
                                    {step === 73 && (
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
                                    {step === 74 && (
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
                                    {step === 75 && (
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

                            {step === 76 && (
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

                            {step === 77 && (
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
                                    {step === 78 && (
                                        <>
                                            <h2>Dados do Seguro Fiança</h2>
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

                            {step === 79 && (
                                <>
                                    <h2>Obrigações do Sublocatário</h2>
                                    <div>
                                        <label>O sublocatário pode sublocar ou ceder o imóvel a terceiros? </label>
                                        <div>
                                            <select name='sublocatarioCeder' onChange={handleChange}>
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

                            {step === 80 && (
                                <>
                                    <h2>Obrigações do Sublocatário</h2>
                                    <div>
                                        <label>O sublocatário é responsável por quais manutenções no imóvel? </label>
                                        <div>
                                            <select name='sublocatarioManu' onChange={handleChange}>
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

                            {step === 81 && (
                                <>
                                    <h2>Obrigações do Sublocatário</h2>
                                    <div>
                                        <label>O sublocatário deve respeitar as leis e regulamentos aplicáveis ao uso do imóvel?</label>
                                        <div>
                                            <select name='sublocatarioRespeita' onChange={handleChange}>
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

                            {step === 82 && (
                                <>
                                    <h2>Obrigações do Sublocatário</h2>
                                    <div>
                                        <label>O sublocatário é responsável por multas e infrações ocorridas durante o período de sublocação?</label>
                                        <div>
                                            <select name='sublocatarioMulta' onChange={handleChange}>
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

                            {step === 83 && (
                                <>
                                    <h2>Obrigações do Sublocatário</h2>
                                    <div>
                                        <label>O sublocatário deve comunicar imediatamente ao sublocador sobre qualquer acidente ou dano ao imóvel?</label>
                                        <div>
                                            <select name='sublocatarioComunica' onChange={handleChange}>
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

                            {step === 84 && (
                                <>
                                    <h2>Obrigações do Sublocatário</h2>
                                    <div>
                                        <label>O sublocatário deve devolver o imóvel no mesmo estado em que o recebeu, salvo desgaste natural?</label>
                                        <div>
                                            <select name='sublocatarioDevolve' onChange={handleChange}>
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

                            {step === 85 && (
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

                            {step === 86 && (
                                <>
                                    <h2>Despesas e Tributos</h2>
                                    <div>
                                        <label>Quais despesas são de responsabilidade do sublocador?</label>
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

                            {step === 87 && (
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

                            {step === 88 && (
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

                            {step === 89 && (
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

                            {step === 90 && (
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

                            {step === 91 && (
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
                                    {step === 92 && (
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

                                    {step === 93 && (
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

                                    {step === 94 && (
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

                                    {step === 95 && (
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

                            {step === 96 && (
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

                            {step === 96 && (
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
                            {step === 97 && (
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

                            {step === 98 && (
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
                    <button className='btnBaixarPdf' onClick={() => { geradorPdfImovelComercialPago(formData) }}>
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