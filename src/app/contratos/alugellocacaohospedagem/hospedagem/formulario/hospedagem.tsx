'use client'
import Pilha from '@/lib/pilha';
import { verificarValor } from '@/lib/utils';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';
import gerarContratoHospedagem from '../util/pdf';


const hospedagemschema = z.object({

    locador: z.enum(['pf', 'pj']).default('pf'),

    /**dados locador pf**/
    locadorSexo: z.enum(['F', 'M']).default('M'),
    nomeLocador: z.string().nonempty('Nome é obrigatório'),
    estadoCivilLocador: z.enum(['solteiro', 'casado', 'viuvo']),
    nacionalidadeLocador: z.string(),
    profissaoLocador: z.string(),
    docidentLocador: z.enum(['Rg', 'Identidade funcional', 'Ctps', 'CNH', 'Passaporte']),
    numeroDocLocador: z.string(),
    cpfLocador: z.string(),
    enderecoLocador: z.string(),
    /** */


    /** dados locador pj **/
    razaoSocialLocador: z.string(),
    cnpjLocador: z.string(),
    enderecoLocadora: z.string(),
    pessoasAssinantes: z.enum(['1', '2']),

    //se for uma pessoa
    nomeumlocador: z.string(),
    cargoumlocador: z.string(),
    docidentpessoaHabilitadaLoc: z.enum(['Rg', 'Identidade funcional', 'Ctps', 'CNH', 'Passaporte']),
    numeroDocUmLocador: z.string(),
    cpfDaPessoaHabilitada: z.string(),

    nome2locador: z.string(),
    cargo2locador: z.string(),
    docidentpessoaHabilitadaLoc2: z.enum(['Rg', 'Identidade funcional', 'Ctps', 'CNH', 'Passaporte']),
    numeroDoc2Locador: z.string(),
    cpfDaPessoaHabilitada2: z.string(),
    /** */


    hospede: z.enum(['pf', 'pj']).default('pf'),

    /**dados hospede pf**/
    hospedeSexo: z.enum(['F', 'M']).default('M'),
    nomeHospede: z.string().nonempty('Nome é obrigatório'),
    estadoCivilHospede: z.string(),
    nacionalidadeHospede: z.string(),
    profissaoHospede: z.string(),
    docidentHospede: z.enum(['Rg', 'Identidade funcional', 'Ctps', 'CNH', 'Passaporte']),
    numeroDocHospede: z.string(),
    cpfHospede: z.string(),
    enderecoHospede: z.string(),
    /** */

    /** dados Hospede pj **/
    razaoSocialHospede: z.string(),
    cnpjHospede: z.string(),
    enderecoHospedeiro: z.string(),
    pessoasHospedeAssinantes: z.enum(['1', '2']),

    //se for uma pessoa
    nomeumHospede: z.string(),
    cargoumHospede: z.string(),
    docidentpessoaHabilitadaHos: z.string(),
    numeroDocUmHospede: z.string(),
    cpfDaPessoaHabilitadaHospede: z.string(),


    nomeu2Hospede: z.string(),
    cargo2Hospede: z.string(),
    docidentpessoaHabilitadaHos2: z.string(),
    numeroDoc2Hospede: z.string(),
    cpfDaPessoaHabilitadaHospede2: z.string(),
    /** */

    tipoDeImovel: z.enum(['Casa', 'Apartamento', 'Flat', 'Quarto de Hotel', 'Quarto em República', 'Quarto em Albergue', 'Apartamento de Hotel']),  //casa ,flat,apartHotel,quarto em hotel,quarto em republica,quarto albergue

    enderecoImovel: z.string(),
    descImovel: z.string(),
    qtdPessoasAutorizadas: z.string(),
    valorMultaPesExcendente: z.string(),
    regrasExpeHospedes: z.enum(['S', 'N']),

    //se caso a resposta for sim
    descRegrasHospedes: z.string(),

    imovelMobiliado: z.enum(['S', 'N']),
    //se a resposta for sim



    cobrancaHospedagem: z.enum(['d', 'sem', 'mes', 'qui', 'cobunic']), //dia,semana,mes,quinzena,cobrança única 

    valordahospedagem: z.string(),


    antecipaPagReserva: z.enum(['S', 'N']),
    //se a resposta da antecipação for sim 
    valorAntecipa: z.string(),

    cobrancaMulta: z.enum(['S', 'N']),

    multaDesistencia: z.string(),

    formaDePagamento: z.enum(['pix', 'trans', 'dep', 'din', 'bol']),//pix,transferencia ou depósito,dinheiro,boleto 

    valorPagHospePagAntecipa: z.enum(['S', 'N']),

    contasBasicas: z.enum(['S', 'N']),

    //se a resposta das contas basicas for sim
    tranfDeContaHosp: z.enum(['S', 'N']),


    resgateAnual: z.enum(['S', 'N']),


    //se a resposta do resgate de 12 meses for sim 
    indicador: z.enum(['igp-m', 'igp', 'ivar', 'ipca', 'inpc']),

    duracaoDiasouMeses: z.enum(['dias', 'meses']),
    qtdDiasouMeses: z.string(),
    dataDeInicioHospedagem: z.string(),
    servicosLimpeza: z.enum(['S', 'N']),

    empreousublocacao: z.enum(['S', 'N']),
    garantiaHosp: z.enum(['S', 'N']),

    //se a resposta da garantia for sim
    garantidorHosp: z.enum(['fi', 'caudep', 'caubem', 'ti', 'segfianca']),     //fiador,caução em depósito,caução em bem imóvel,titulos.seguro fiança 

    //se for fiador 
    sexoFiador: z.enum(['F', 'M']),
    nomeFiador1: z.string(),
    estadoCivilFiador: z.enum(['casado', 'solteiro', 'divorciado', 'viuvo']), //casado , solteiro , divorciado ,viúvo 

    nacionalidadeFiador: z.string(),
    profissaoFiador: z.string(),
    docIdentificacao: z.enum(['Rg', 'Identidade funcional', 'Ctps', 'CNH', 'Passaporte']), //qual é o documento 
    numeroDocFiador: z.string(),
    cpfFiador: z.string(),
    enderecoFiador: z.string(),
    //---------------------------------------

    //se for titulo de caução
    valorTitCaucao: z.string(),

    //se for caução em imovel 
    descBemCaucao: z.string(),

    //se for titulo de credito utilizado
    descCredUtili: z.string(),

    //se for seguro fianca
    segFianca: z.string(),



    pagadorBemFeitorias: z.enum(['hospede', 'locador']),

    garagem: z.enum(['S', 'N']),

    multaPorNaoDesocupa: z.string(),

    multaPorRompimento: z.enum(['S', 'N']),

    //se sim ,informe o valor
    valorMultaRompimento: z.string(),

    multaPorDescDeContrato: z.enum(['S', 'N']),
    valorMultaDesc: z.string(),

    cidadeAssinatura: z.string(),
    dataAssinatura: z.string(),

    duastestemunhas: z.enum(['S', 'N']),
    //se sim
    nomeTest1: z.string(),
    cpfTest1: z.string(),
    nomeTest2: z.string(),
    cpfTest2: z.string(),


});

type FormData = z.infer<typeof hospedagemschema>;


export default function Hospedagem() {

    const [maisUmAssinante, setMaisUmAssinante] = useState(false);
    const [maisUmAssinanteHosp, setMaisUmAssinanteHosp] = useState(false);
    const [regrasHospedes, setRegrasHospedes] = useState(false);
    const [pagamentoAntecipado, setPagamentoAntecipado] = useState(false);
    const [multapordesistencia, setMultapordesistencia] = useState(false);
    const [contasBasicas, setContasBasicas] = useState(false);
    const [resgateAnual, setResgateAnual] = useState(false);
    const [fiador, setFiador] = useState(false);
    const [caucaoDep, setCaucaoDep] = useState(false);
    const [caucaoBemIM, setCaucaoBemIM] = useState(false);
    const [titulos, setTitulos] = useState(false);
    const [seguroFi, setSeguroFi] = useState(false);
    const [garantidorHosp, setGarantidorHosp] = useState(false);
    const [multaPorRompimento, setMultaPorRompimento] = useState(false);
    const [multaPorDescDeContrato, setMultaPorDescDeContrato] = useState(false);
    const [duastestemunhas, setDuastestemunhas] = useState(false);
    const [locadorPessoaJuri, setLocadorPessoaJuri] = useState(false);
    const [HospedePessoaJuri, setHospedePessoaJuri] = useState(false);
    const pilha = useRef(new Pilha());

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

    /**Construindo as etapas */
    const [formData, setFormData] = useState<Partial<FormData>>({});
    const [currentStepData, setCurrentStepData] = useState<Partial<FormData>>({});
    const [step, setStep] = useState(1);

    const handleNext = () => {
        setFormData((prev) => ({ ...prev, ...currentStepData }));

        let nextStep = step;

        if (currentStepData.locador === 'pj') {
            setLocadorPessoaJuri(true);
            nextStep = 11
        } else if (!locadorPessoaJuri && nextStep === 10) {

            nextStep = 25;

        } else if (currentStepData.pessoasAssinantes === '2') {

            setMaisUmAssinante(true)
            nextStep = 20;

        } else if (!maisUmAssinante && nextStep === 19) {
            nextStep = 25;
        }


        if (currentStepData.hospede === 'pj') {
            setHospedePessoaJuri(true);
            nextStep = 35
        } else if (!HospedePessoaJuri && nextStep === 34) {
            nextStep = 49;

        } else if (currentStepData.pessoasHospedeAssinantes === '2') {

            setMaisUmAssinanteHosp(true)
            nextStep = 44;

        } else if (!maisUmAssinante && nextStep === 43) {
            nextStep = 49;
        }



        if (currentStepData.regrasExpeHospedes === 'S') {
            setRegrasHospedes(true);
            nextStep = 55;
        } else if (currentStepData.regrasExpeHospedes === 'N') {
            nextStep = 56;
        }

        if (currentStepData.antecipaPagReserva === 'S') {
            setPagamentoAntecipado(true);
            nextStep = 60;
        } else if (currentStepData.antecipaPagReserva === 'N') {
            nextStep = 61;
        }

        if (currentStepData.cobrancaMulta === 'S') {
            setMultapordesistencia(true);
            nextStep = 62;
        } else if (currentStepData.cobrancaMulta === 'N') {
            nextStep = 63;
        }

        if (currentStepData.contasBasicas === 'S') {
            setContasBasicas(true);
            nextStep = 66;
        } else if (currentStepData.contasBasicas === 'N') {
            nextStep = 67;
        }

        if (currentStepData.resgateAnual === 'S') {
            setResgateAnual(true);
            nextStep = 68;
        } else if (currentStepData.resgateAnual === 'N') {
            nextStep = 69;
        }

        if (currentStepData.garantiaHosp === 'S') {
            setResgateAnual(true);
            nextStep = 75;
        } else if (currentStepData.garantiaHosp === 'N') {
            nextStep = 89;
        }

        if (nextStep === 84) {
            nextStep = 89
        } else if (nextStep === 85) {
            nextStep = 89
        } else if (nextStep === 86) {
            nextStep = 89
        } else if (nextStep === 87) {
            nextStep = 89
        }

        switch (currentStepData.garantidorHosp) {
            case "fi":
                setFiador(true);
                break;
            case "caudep":
                setCaucaoDep(true);
                nextStep = 85;
                break;
            case "caubem":
                setCaucaoBemIM(true);
                nextStep = 86;
                break;
            case "ti":
                setTitulos(true);
                nextStep = 87;
                break;
            case "segfianca":
                setSeguroFi(true);
                nextStep = 88;
                break;
            default:
                break;
        }



        if (currentStepData.multaPorRompimento === 'S') {
            setMultaPorRompimento(true);
            nextStep = 93;
        } else if (currentStepData.multaPorRompimento === 'N') {
            nextStep = 94;
        }

        if (currentStepData.multaPorDescDeContrato === 'S') {
            setMultaPorDescDeContrato(true);
            nextStep = 95;
        } else if (currentStepData.multaPorDescDeContrato === 'N') {
            nextStep = 96;
        }

        if (currentStepData.duastestemunhas === 'S') {
            setDuastestemunhas(true);
            nextStep = 99;
        } else if (currentStepData.duastestemunhas === 'N') {
            nextStep = 103;
        }




        if (nextStep === step) {
            nextStep += 1;
        }

        // Atualizar o passo final.
        setStep(nextStep);


        pilha.current.empilhar(nextStep);

        // Logs para depuração
        console.log(`qtd step depois do ajuste: ${nextStep}`);
        // console.log(`currentStepData - enderecoFiador: ${currentStepData.enderecoFiador}`);

        // Limpar os dados do passo atual.
        setCurrentStepData({});
    };


    const handleBack = () => {
        setStep(pilha.current.desempilhar());
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
                description: `Contrato de Hospedagem`,
                paymentMethodId: "pix",
                payer: {
                    name: "Contrato",
                    email: "quedsoft@gmail.com",
                    identification: {
                        type: "CPF",
                        number: "46866790018"
                    },
                    address: {
                        street_name: "Avenida Cesário de Melo, 2869 - Stand 01, Rio de Janeiro",
                        street_number: 2869,
                        zip_code: "23050102"
                    }
                }
            });


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

    const gerandoPdf = (dados: any) => {
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
        doc.text("CONTRATO DE HOSPEDAGEM", 105, posY, { align: "center" });
        posY += 15;

        addSection("CLÁUSULA 1 - IDENTIFICAÇÃO DAS PARTES", [
            "Conforme o artigo 2º da Lei 8.245/1990, o locador é aquele que cede o uso do imóvel mediante remuneração e o locatário é aquele que recebe o imóvel para uso, sendo necessário constar seus dados de identificação no contrato.",
            `Locador: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.nomeLocador) : verificarValor(dados.razaoSocialLocador)}`,
            `CPF/CNPJ: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.cpfLocador) : verificarValor(dados.cnpjLocador)}`,
            `Endereço: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.enderecoLocador) : verificarValor(dados.enderecoLocadora)}`,
            `Telefone: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.telefoneLocador) : verificarValor(dados.telefoneLocadora)}`,
            `E-mail: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.emailLocador) : verificarValor(dados.emailLocadora)}`,
            verificarValor(dados.locador) === "pj" ? `Representante Legal: ${verificarValor(dados.nomeumlocador)}, CPF: ${verificarValor(dados.cpfDaPessoaHabilitada)}` : "",
            "",
            `Locatário: ${verificarValor(dados.hospede) === "pf" ? verificarValor(dados.nomeHospede) : verificarValor(dados.razaoSocialHospede)}`,
            `CPF/CNPJ: ${verificarValor(dados.hospede) === "pf" ? verificarValor(dados.cpfHospede) : verificarValor(dados.cnpjHospede)}`,
            `Endereço: ${verificarValor(dados.hospede) === "pf" ? verificarValor(dados.enderecoHospede) : verificarValor(dados.enderecoHospedeiro)}`,
            `Telefone: ${verificarValor(dados.hospede) === "pf" ? verificarValor(dados.telefoneHospede) : verificarValor(dados.telefoneHospedeiro)}`,
            `E-mail: ${verificarValor(dados.hospede) === "pf" ? verificarValor(dados.emailHospede) : verificarValor(dados.emailHospedeiro)}`,
            verificarValor(dados.hospede) === "pj" ? `Representante Legal: ${verificarValor(dados.nomeumHospede)}, CPF: ${verificarValor(dados.cpfDaPessoaHabilitadaHospede)}` : "",
        ]);

        addSection("CLÁUSULA 2 - DESCRIÇÃO DA HOSPEDAGEM", [
            "Art. 421: Reafirma que os contratos devem ser interpretados conforme a boa-fé e os usos do lugar de sua celebração, o que implica na necessidade de descrição clara e precisa do objeto (no caso, o imóvel/hospedagem)",
            "Art. 104(indiretamente): Ao exigir que o objeto do contrato seja lícito e determinado, reforça a importância de descrever com exatidão as características do imóvel.",
            `Tipo de Imóvel: ${verificarValor(dados.tipoDeImovel)}`,
            `Endereço do Imóvel: ${verificarValor(dados.enderecoImovel)}`,
            `Descrição do Imóvel: ${verificarValor(dados.descImovel)}`,
            `Quantidade de Pessoas Autorizadas: ${verificarValor(dados.qtdPessoasAutorizadas)}`,
            `Valor da Multa por Pessoa Excedente: ${verificarValor(dados.valorMultaPesExcendente)}`,
            `Regras Específicas para Hóspedes: ${verificarValor(dados.regrasExpeHospedes) === "S" ? verificarValor(dados.descRegrasHospedes) : "Não há regras específicas."}`,
            `Imóvel Mobiliado: ${verificarValor(dados.imovelMobiliado) === "S" ? "Sim" : "Não"}`,
        ]);

        addSection("CLÁUSULA 3 - DATA DE CHECK-IN", [
            "Art. 421: Novamente, o princípio da autonomia da vontade e da boa-fé nas relações contratuais assegura que os prazos e condições estabelecidos sejam cumpridos de forma leal",
            "Art. 476: Em contratos bilaterais, nenhuma das partes pode exigir o cumprimento da obrigação da outra sem cumprir a sua própria, destacando a importância de estabelecer datas e prazos claros para o início da hospedagem.",
            `Data de Início da Hospedagem: ${verificarValor(dados.dataDeInicioHospedagem)}`,
            `Duração da Hospedagem: ${verificarValor(dados.qtdDiasouMeses)} ${verificarValor(dados.duracaoDiasouMeses)}`,
        ]);

        addSection("CLÁUSULA 4 - PREÇO E FORMA DE PAGAMENTO", [
            "Art. 421 e Art. 422: Fundamentam a liberdade contratual e o dever de transparência, imprescindíveis na definição de valores e formas de pagamento",
            "Art. 475: Trata das consequências do inadimplemento, permitindo que, em caso de descumprimento das obrigações de pagamento, a parte prejudicada possa buscar a resolução do contrato ou indenização",
            `Valor da Hospedagem: ${verificarValor(dados.valordahospedagem)}`,
            `Forma de Cobrança: ${verificarValor(dados.cobrancaHospedagem)}`,
            `Forma de Pagamento: ${verificarValor(dados.formaDePagamento)}`,
            `Pagamento Antecipado: ${verificarValor(dados.antecipaPagReserva) === "S" ? `Sim, no valor de ${verificarValor(dados.valorAntecipa)}` : "Não"}`,
            `Multa por Desistência: ${verificarValor(dados.cobrancaMulta) === "S" ? verificarValor(dados.multaDesistencia) : "Não há multa por desistência."}`,
        ]);

        addSection("CLÁUSULA 5 - POLÍTICAS DE CANCELAMENTO", [
            "Art. 474: Prevê a eficácia da cláusula resolutiva expressa, ou seja, as condições estipuladas para a rescisão do contrato operam de pleno direito quando configuradas",
            "Art. 475: Permite a resolução contratual em caso de inadimplemento, bem como a cobrança de perdas e danos, embasando a previsão de multas em caso de cancelamento",
            `Multa por Cancelamento: ${verificarValor(dados.multaPorDescDeContrato) === "S" ? verificarValor(dados.valorMultaDesc) : "Não há multa por cancelamento."}`,
            `Multa por Rompimento do Contrato: ${verificarValor(dados.multaPorRompimento) === "S" ? verificarValor(dados.valorMultaRompimento) : "Não há multa por rompimento."}`,
        ]);

        addSection("CLÁUSULA 6 - REGRAS DA PROPRIEDADE", [
            "Art. 421: Estabelece que os contratos devem ser interpretados conforme a boa-fé, o que abrange as regras de uso e conservação do imóvel",
            "Art. 927: Versa sobre a obrigação de reparar o dano, sendo aplicável à eventual violação das regras de uso e responsabilidade pela conservação do imóvel.",
            `Serviços de Limpeza: ${verificarValor(dados.servicosLimpeza) === "S" ? "Incluídos" : "Não incluídos"}`,
            `Garagem: ${verificarValor(dados.garagem) === "S" ? "Disponível" : "Não disponível"}`,
            `Multa por Não Desocupação: ${verificarValor(dados.multaPorNaoDesocupa)}`,
        ]);

        addSection("CLÁUSULA 7 - RESPONSABILIDADES DAS PARTES", [
            "Art. 422: Reforça a necessidade de lealdade e colaboração mútua na execução do contrato, determinando que cada parte cumpra com suas obrigações",
            "Art. 927: Define a responsabilidade civil de reparar danos causados por ação ou omissão, estabelecendo a base para eventual indenização.",
            `Pagador das Benfeitorias: ${verificarValor(dados.pagadorBemFeitorias)}`,
            `Contas Básicas: ${verificarValor(dados.contasBasicas) === "S" ? "Incluídas" : "Não incluídas"}`,
            `Transferência de Contas: ${verificarValor(dados.tranfDeContaHosp) === "S" ? "Sim" : "Não"}`,
        ]);

        addSection("CLÁUSULA 8 - SEGUROS E RESPONSABILIDADE CIVIL", [
            "Art. 186: Dispõe que aquele que, por ação ou omissão, causar dano a outrem, fica obrigado a repará-lo, justificando a inclusão de cláusulas que prevejam seguros e garantias",
            "Art. 927: Complementa ao estabelecer a obrigação de indenizar os prejuízos decorrentes de danos, reforçando a importância de mecanismos de segurança(como seguro - fiança ou caução).",
            `Garantia de Hospedagem: ${verificarValor(dados.garantiaHosp) === "S" ? "Sim" : "Não"}`,
            verificarValor(dados.garantiaHosp) === "S" ? `Tipo de Garantia: ${verificarValor(dados.garantidorHosp)}` : "",
            verificarValor(dados.garantidorHosp) === "fi" ? `Fiador: ${verificarValor(dados.nomeFiador1)}, CPF: ${verificarValor(dados.cpfFiador)}` : "",
            verificarValor(dados.garantidorHosp) === "caudep" ? `Valor do Título de Caução: ${verificarValor(dados.valorTitCaucao)}` : "",
            verificarValor(dados.garantidorHosp) === "caubem" ? `Descrição do Bem de Caução: ${verificarValor(dados.descBemCaucao)}` : "",
            verificarValor(dados.garantidorHosp) === "ti" ? `Descrição do Título de Crédito: ${verificarValor(dados.descCredUtili)}` : "",
            verificarValor(dados.garantidorHosp) === "segfianca" ? `Seguro Fiança: ${verificarValor(dados.segFianca)}` : "",
        ]);

        addSection("CLÁUSULA 9 - RESCISÃO DO CONTRATO", [
            "Art. 474: Confirma a eficácia da cláusula resolutiva expressa, permitindo a extinção do contrato mediante o descumprimento das condições pactuadas",
            "Art. 475: Trata dos efeitos do inadimplemento e da possibilidade de resolução contratual, bem como da compensação por perdas e danos.",
            `Resgate Anual: ${verificarValor(dados.resgateAnual) === "S" ? "Sim" : "Não"}`,
            verificarValor(dados.resgateAnual) === "S" ? `Indicador de Reajuste: ${verificarValor(dados.indicador)}` : "",
        ]);

        addSection("CLÁUSULA 10 - ASSINATURAS E DATA", [
            "Art. 104: Ressalta que a validade do negócio jurídico depende, entre outros requisitos, da forma prescrita ou não defesa em lei, o que inclui a assinatura das partes e testemunhas",
            "Art. 107: Embora de forma subsidiária, reforça a importância dos elementos formais para a eficácia dos contratos, garantindo segurança jurídica à avença",
            `Cidade de Assinatura: ${verificarValor(dados.cidadeAssinatura)}`,
            `Data de Assinatura: ${verificarValor(dados.dataAssinatura)}`,
            `Testemunhas: ${verificarValor(dados.duastestemunhas) === "S" ? `1. ${verificarValor(dados.nomeTest1)}, CPF: ${verificarValor(dados.cpfTest1)}; 2. ${verificarValor(dados.nomeTest2)}, CPF: ${verificarValor(dados.cpfTest2)}` : "Não há testemunhas."}`,
        ]);

        // Espaço para assinatura do vendedor
        checkPageBreak(30);
        doc.text("__________________________________________", marginX, posY);
        posY += 10;
        doc.text("Assinatura do Locador", marginX, posY);
        posY += 15;

        // Espaço para assinatura do comprador
        checkPageBreak(10);
        doc.text("__________________________________________", marginX, posY);
        posY += 10;
        doc.text("Assinatura do Locatário", marginX, posY);
        posY += 15;

        // Verifica se há testemunhas e adiciona os espaços para assinatura
        if (dados.testemunhasNecessarias === 'S') {
            checkPageBreak(30);
            doc.text("__________________________________________", marginX, posY);
            posY += 10;
            doc.text(`Assinatura da Testemunha 1: ${verificarValor(dados.nomeTest1)}`, marginX, posY);
            posY += 15;

            checkPageBreak(30);
            doc.text("__________________________________________", marginX, posY);
            posY += 10;
            doc.text(`Assinatura da Testemunha 2: ${verificarValor(dados.nomeTest2)}`, marginX, posY);
            posY += 15;
        }



        const pdfDataUri = doc.output("datauristring");
        setPdfDataUrl(pdfDataUri);
    }

    useEffect(() => {
        gerandoPdf({ ...formData });
    }, [formData]);


    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title">Contrato de Hospedagem</h1>
                <i className="subtitle">Contrato de hospedagem | Locação de Flat ou Apart Hotel</i>
            </div>

            <div className="container">
                <div className="left-panel">
                    <div className="scrollable-card">

                        <div className="progress-bar">
                            <div
                                className="progress-bar-inner"
                                style={{ width: `${(step / 102) * 100}%` }}
                            ></div>
                        </div>
                        <div className="form-wizard">


                            {step === 1 && (
                                <>
                                    <h2>Dados do Responsável pelo Imóvel</h2>
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

                            {step === 2 && (
                                <>
                                    <h2>Dados do Locador</h2>
                                    <div>
                                        <label>Sexo:</label>
                                        <select name='locadorSexo' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="F">Feminino</option>
                                            <option value="M">Masculino</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 3 && (
                                <>
                                    <h2>Dados do Locador</h2>
                                    <div>
                                        <label>Nome:</label>
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

                            {step === 4 && (
                                <>
                                    <h2>Dados do Locador</h2>
                                    <div>
                                        <label>Estado Cívil:</label>
                                        <select name='estadoCivilLocador' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="solteiro">Solteiro(a)</option>
                                            <option value="casado">Casado(a)</option>
                                            <option value="viuvo">Viuvo(a)</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 5 && (
                                <>
                                    <h2>Dados do Locador</h2>
                                    <div>
                                        <label>Nacionalidade:</label>
                                        <input
                                            type='text'
                                            placeholder='nacionalidade'
                                            name="nacionalidadeLocador"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 6 && (
                                <>
                                    <h2>Dados do Locador</h2>
                                    <div>
                                        <label>Profissão:</label>
                                        <input
                                            type='text'
                                            placeholder='profissão'
                                            name="profissaoLocador"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 7 && (
                                <>
                                    <h2>Dados do Locador</h2>
                                    <div>
                                        <label>Documento de Identificação:</label>
                                        <select name='docidentLocador' onChange={handleChange}>
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

                            {step === 8 && (
                                <>
                                    <h2>Dados do Locador</h2>
                                    <div>
                                        <label>Número do Documento:</label>
                                        <input
                                            type='text'
                                            placeholder='Documento'
                                            name="numeroDocLocador"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 9 && (
                                <>
                                    <h2>Dados do Locador</h2>
                                    <div>
                                        <label>CPF:</label>
                                        <input
                                            type='text'
                                            placeholder='CPF'
                                            name="cpfLocador"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 10 && (
                                <>
                                    <h2>Dados do Locador</h2>
                                    <div>
                                        <label>Endereço do locador:</label>
                                        <input
                                            type='text'
                                            placeholder='Endereço'
                                            name="enderecoLocador"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {/** Se o usuario escolher pessoa juridica */}
                            {locadorPessoaJuri && (
                                <>
                                    {step === 11 && (
                                        <>
                                            <h2>Dados do Locador CNPJ</h2>
                                            <div>
                                                <label>Razão Social:</label>
                                                <input
                                                    type='text'
                                                    placeholder='Razão Social'
                                                    name="razaoSocialLocador"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}


                                    {step === 12 && (
                                        <>
                                            <h2>Dados do Locador CNPJ</h2>
                                            <div>
                                                <label>CNPJ:</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cnpjLocador"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 13 && (
                                        <>
                                            <h2>Dados do Locador CNPJ</h2>
                                            <div>
                                                <label>Endereço:</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="enderecoLocadora"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 14 && (
                                        <>
                                            <h2>Dados do Locador CNPJ</h2>
                                            <div>
                                                <label>Quantas pessoas assinarão no nome da locadora?</label>
                                                <select name='pessoasAssinantes' onChange={handleChange}>
                                                    <option value="">Selecione</option>
                                                    <option value="1">1</option>
                                                    <option value="2">2</option>
                                                </select>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}


                                    {step === 15 && (
                                        <>
                                            <h2>Dados do Locador CNPJ</h2>
                                            <div>
                                                <label>Nome do 1° Representante:</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="nomeumlocador"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 16 && (
                                        <>
                                            <h2>Dados do Locador CNPJ</h2>
                                            <div>
                                                <label>Cargo do 1° Representante:</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cargoumlocador"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 17 && (
                                        <>
                                            <h2>Dados do Locador CNPJ</h2>
                                            <div>
                                                <label>Documento do 1° Representante:</label>
                                                <select name='docidentpessoaHabilitadaLoc' onChange={handleChange}>
                                                    <option value="">Selecione</option>

                                                    <option value="Rg">Rg</option>
                                                    <option value="Identidade funcional">Identificação funcional</option>
                                                    <option value="Ctps">Carteira de trabalho</option>
                                                    <option value="CNH">CNH</option>
                                                    <option value="Passaporte">Passaporte</option>
                                                </select>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 18 && (
                                        <>
                                            <h2>Dados do Locador CNPJ</h2>
                                            <div>
                                                <label>Número do documento do 1° Representante:</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="numeroDocUmLocador"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 19 && (
                                        <>
                                            <h2>Dados do Locador CNPJ</h2>
                                            <div>
                                                <label>CPF do 1° Representante:</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cpfDaPessoaHabilitada"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {maisUmAssinante && (
                                        <>
                                            {step === 20 && (
                                                <>
                                                    <h2>Dados do Locador CNPJ</h2>
                                                    <div>
                                                        <label>Nome do 2° Representante:</label>
                                                        <input
                                                            type='text'
                                                            placeholder=''
                                                            name="nome2locador"
                                                            onChange={handleChange}
                                                        />
                                                        <button onClick={handleNext}>Próximo</button>
                                                    </div>
                                                </>
                                            )}

                                            {step === 21 && (
                                                <>
                                                    <h2>Dados do Locador CNPJ</h2>
                                                    <div>
                                                        <label>Cargo do 2° Representante:</label>
                                                        <input
                                                            type='text'
                                                            placeholder=''
                                                            name="cargo2locador"
                                                            onChange={handleChange}
                                                        />
                                                        <button onClick={handleNext}>Próximo</button>
                                                    </div>
                                                </>
                                            )}

                                            {step === 22 && (
                                                <>
                                                    <h2>Dados do Locador CNPJ</h2>
                                                    <div>
                                                        <label>Documento do 2° Representante:</label>
                                                        <select name='docidentpessoaHabilitadaLoc2' onChange={handleChange}>
                                                            <option value="">Selecione</option>

                                                            <option value="Rg">Rg</option>
                                                            <option value="Identidade funcional">Identificação funcional</option>
                                                            <option value="Ctps">Carteira de trabalho</option>
                                                            <option value="CNH">CNH</option>
                                                            <option value="Passaporte">Passaporte</option>
                                                        </select>
                                                        <button onClick={handleNext}>Próximo</button>
                                                    </div>
                                                </>
                                            )}

                                            {step === 23 && (
                                                <>
                                                    <h2>Dados do Locador CNPJ</h2>
                                                    <div>
                                                        <label>Número do documento do 2° Representante:</label>
                                                        <input
                                                            type='text'
                                                            placeholder=''
                                                            name="numeroDoc2Locador"
                                                            onChange={handleChange}
                                                        />
                                                        <button onClick={handleNext}>Próximo</button>
                                                    </div>
                                                </>
                                            )}

                                            {step === 24 && (
                                                <>
                                                    <h2>Dados do Locador CNPJ</h2>
                                                    <div>
                                                        <label>CPF do 2° Representante:</label>
                                                        <input
                                                            type='text'
                                                            placeholder=''
                                                            name="cpfDaPessoaHabilitada2"
                                                            onChange={handleChange}
                                                        />
                                                        <button onClick={handleNext}>Próximo</button>
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    )}

                                </>
                            )}


                            {step === 25 && (
                                <>
                                    <h2>Dados do Hóspede pelo Imóvel </h2>
                                    <div>
                                        <label>O Hóspede é pessoa?</label>
                                        <select name='hospede' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="pj">Jurídica</option>
                                            <option value="pf">Física</option>
                                        </select>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {/**Se escolher pessoa fisica */}
                            {step === 26 && (
                                <>
                                    <h2>Dados do Hóspede</h2>
                                    <div>
                                        <label>Sexo:</label>
                                        <select name='hospedeSexo' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="F">Feminino</option>
                                            <option value="M">Masculino</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 27 && (
                                <>
                                    <h2>Dados do Hóspede</h2>
                                    <div>
                                        <label>Nome:</label>
                                        <input
                                            type='text'
                                            placeholder='Nome do Hóspede'
                                            name="nomeHospede"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 28 && (
                                <>
                                    <h2>Dados do Hóspede</h2>
                                    <div>
                                        <label>Estado Cívil:</label>
                                        <select name='estadoCivilHospede' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="solteiro">Solteiro(a)</option>
                                            <option value="casado">Casado(a)</option>
                                            <option value="viuvo">Viuvo(a)</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 29 && (
                                <>
                                    <h2>Dados do Hóspede</h2>
                                    <div>
                                        <label>Nacionalidade:</label>
                                        <input
                                            type='text'
                                            placeholder='nacionalidade'
                                            name="nacionalidadeHospede"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 30 && (
                                <>
                                    <h2>Dados do Hóspede</h2>
                                    <div>
                                        <label>Profissão:</label>
                                        <input
                                            type='text'
                                            placeholder='profissão'
                                            name="profissaoHospede"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 31 && (
                                <>
                                    <h2>Dados do Hóspede</h2>
                                    <div>
                                        <label>Documento de Identificação:</label>
                                        <select name='docidentHospede' onChange={handleChange}>
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

                            {step === 32 && (
                                <>
                                    <h2>Dados do Hóspede</h2>
                                    <div>
                                        <label>Número do Documento:</label>
                                        <input
                                            type='text'
                                            placeholder='Documento'
                                            name="numeroDocHospede"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 33 && (
                                <>
                                    <h2>Dados do Hóspede</h2>
                                    <div>
                                        <label>CPF:</label>
                                        <input
                                            type='text'
                                            placeholder='CPF'
                                            name="cpfHospede"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 34 && (
                                <>
                                    <h2>Dados do Hóspede</h2>
                                    <div>
                                        <label>Endereço do Hóspede:</label>
                                        <input
                                            type='text'
                                            placeholder='Endereço'
                                            name="enderecoHospede"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}



                            {/** Se o usuario escolher Hospede pessoa juridica  */}
                            {HospedePessoaJuri && (
                                <>
                                    {step === 35 && (
                                        <>
                                            <h2>Dados do Hóspede CNPJ</h2>
                                            <div>
                                                <label>Razão Social:</label>
                                                <input
                                                    type='text'
                                                    placeholder='Razão Social'
                                                    name="razaoSocialHospede"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}


                                    {step === 36 && (
                                        <>
                                            <h2>Dados do Hóspede CNPJ</h2>
                                            <div>
                                                <label>CNPJ:</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cnpjHospede"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 37 && (
                                        <>
                                            <h2>Dados do Hóspede CNPJ</h2>
                                            <div>
                                                <label>Endereço:</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="enderecoHospedeiro"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 38 && (
                                        <>
                                            <h2>Dados do Hóspede CNPJ</h2>
                                            <div>
                                                <label>Quantas pessoas assinarão no nome do(a) Hóspede?</label>
                                                <select name='pessoasHospedeAssinantes' onChange={handleChange}>
                                                    <option value="">Selecione</option>
                                                    <option value="1">1</option>
                                                    <option value="2">2</option>
                                                </select>
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}


                                    {step === 39 && (
                                        <>
                                            <h2>Dados do Hóspede CNPJ</h2>
                                            <div>
                                                <label>Nome do 1° Representante:</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="nomeumHospede"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 40 && (
                                        <>
                                            <h2>Dados do Hóspede CNPJ</h2>
                                            <div>
                                                <label>Cargo do 1° Representante:</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cargoumHospede"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 41 && (
                                        <>
                                            <h2>Dados do Hóspede CNPJ</h2>
                                            <div>
                                                <label>Documento do 1° Representante:</label>
                                                <select name='docidentpessoaHabilitadaHos' onChange={handleChange}>
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

                                    {step === 42 && (
                                        <>
                                            <h2>Dados do Hóspede CNPJ</h2>
                                            <div>
                                                <label>Número do documento do 1° Representante:</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="numeroDocUmHospede"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 43 && (
                                        <>
                                            <h2>Dados do Hóspede CNPJ</h2>
                                            <div>
                                                <label>CPF do 1° Representante:</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cpfDaPessoaHabilitadaHospede"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {maisUmAssinanteHosp && (
                                        <>
                                            {step === 44 && (
                                                <>
                                                    <h2>Dados do Hóspede CNPJ</h2>
                                                    <div>
                                                        <label>Nome do 2° Representante:</label>
                                                        <input
                                                            type='text'
                                                            placeholder=''
                                                            name="nomeu2Hospede"
                                                            onChange={handleChange}
                                                        />
                                                        <button onClick={handleBack}>Voltar</button>
                                                        <button onClick={handleNext}>Próximo</button>
                                                    </div>
                                                </>
                                            )}

                                            {step === 45 && (
                                                <>
                                                    <h2>Dados do Hóspede CNPJ</h2>
                                                    <div>
                                                        <label>Cargo do 2° Representante:</label>
                                                        <input
                                                            type='text'
                                                            placeholder=''
                                                            name="cargo2Hospede"
                                                            onChange={handleChange}
                                                        />
                                                        <button onClick={handleBack}>Voltar</button>
                                                        <button onClick={handleNext}>Próximo</button>
                                                    </div>
                                                </>
                                            )}

                                            {step === 46 && (
                                                <>
                                                    <h2>Dados do Hóspede CNPJ</h2>
                                                    <div>
                                                        <label>Documento do 2° Representante:</label>
                                                        <select name='docidentpessoaHabilitadaHos2' onChange={handleChange}>
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

                                            {step === 47 && (
                                                <>
                                                    <h2>Dados do Hóspede CNPJ</h2>
                                                    <div>
                                                        <label>Número do documento do 2° Representante:</label>
                                                        <input
                                                            type='text'
                                                            placeholder=''
                                                            name="numeroDoc2Hospede"
                                                            onChange={handleChange}
                                                        />
                                                        <button onClick={handleBack}>Voltar</button>
                                                        <button onClick={handleNext}>Próximo</button>
                                                    </div>
                                                </>
                                            )}

                                            {step === 48 && (
                                                <>
                                                    <h2>Dados do Hóspede CNPJ</h2>
                                                    <div>
                                                        <label>CPF do 2° Representante:</label>
                                                        <input
                                                            type='text'
                                                            placeholder=''
                                                            name="cpfDaPessoaHabilitadaHospede2"
                                                            onChange={handleChange}
                                                        />
                                                        <button onClick={handleBack}>Voltar</button>
                                                        <button onClick={handleNext}>Próximo</button>
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    )}

                                </>
                            )}


                            {step === 49 && (
                                <>
                                    <h2>Dados do Imóvel</h2>
                                    <div>
                                        <label>Qual é o tipo de imóvel que será utilizado na Hospedagem?</label>
                                        <select name='tipoDeImovel' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="Casa">Casa</option>
                                            <option value="Apartamento">Apartamento</option>
                                            <option value="Flat">Flat</option>
                                            <option value="Apartamento de Hotel">Apartamento de Hotel</option>
                                            <option value="Quarto de Hotel">Quarto de Hotel</option>
                                            <option value="Quarto em República">Quarto em República</option>
                                            <option value="Quarto em Albergue">Quarto em Albergue</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 50 && (
                                <>
                                    <h2>Dados do Imóvel</h2>
                                    <div>
                                        <label>Endereço do imóvel que será utilizado na hospedagem</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="enderecoImovel"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 51 && (
                                <>
                                    <h2>Dados do Imóvel</h2>
                                    <div>
                                        <label>Descrição do Imóvel</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="descImovel"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 52 && (
                                <>
                                    <h2>Dados do Imóvel</h2>
                                    <div>
                                        <label>Quantidade de pessoas que poderão se hospedar</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="qtdPessoasAutorizadas"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 53 && (
                                <>
                                    <h2>Dados do Imóvel</h2>
                                    <div>
                                        <label>Valor da multa diária cobrado por pessoa excedente</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="valorMultaPesExcendente"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                        </div>
                                    </div>
                                </>
                            )}


                            {step === 54 && (
                                <>
                                    <h2>Dados do Imóvel</h2>
                                    <div>
                                        <label>Existirá regras específicas para hospedes?</label>
                                        <select name='regrasExpeHospedes' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>                                    </div>
                                </>
                            )}

                            {regrasHospedes && (
                                <>
                                    {step === 55 && (
                                        <>
                                            <h2>Dados do Imóvel</h2>
                                            <div>
                                                <label>Descrição das regras</label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="descRegrasHospedes"
                                                        onChange={handleChange}
                                                    />
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 56 && (
                                <>
                                    <h2>Dados do Imóvel</h2>
                                    <div>
                                        <label>O imóvel será alugado mobiliado?</label>
                                        <select name='imovelMobiliado' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>                                    </div>
                                </>
                            )}

                            {step === 57 && (
                                <>
                                    <h2>Dados do Imóvel</h2>
                                    <div>
                                        <label>Como será a cobrança da hospedagem?</label>
                                        <select name='cobrancaHospedagem' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="d">Dia</option>
                                            <option value="sem">Semana</option>
                                            <option value="mes">Mês</option>
                                            <option value="qui">Quinzena</option>
                                            <option value="cobunic">Cobrança Única</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>                                    </div>
                                </>
                            )}

                            {step === 58 && (
                                <>
                                    <h2>Dados do Imóvel</h2>
                                    <div>
                                        <label>Qual é o valor a ser pago ?</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="valordahospedagem"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 59 && (
                                <>
                                    <h2>Dados do Imóvel</h2>
                                    <div>
                                        <label>Será pago um valor antecipado para reservar a hospedagem?</label>
                                        <select name='antecipaPagReserva' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>                                    </div>
                                </>
                            )}


                            {pagamentoAntecipado && (
                                <>
                                    {step === 60 && (
                                        <>
                                            <h2>Dados do Imóvel</h2>
                                            <div>
                                                <label>Qual é o valor a ser pago ?</label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="valorAntecipa"
                                                        onChange={handleChange}
                                                    />
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 61 && (
                                        <>
                                            <h2>Dados do Imóvel</h2>
                                            <div>
                                                <label>Haverá cobrança de multa caso a hóspede solicite o cancelamento da hospedagem?</label>
                                                <select name='cobrancaMulta' onChange={handleChange}>
                                                    <option value="">Selecione</option>
                                                    <option value="S">Sim</option>
                                                    <option value="N">Não</option>
                                                </select>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {multapordesistencia && (
                                        <>
                                            {step === 62 && (
                                                <>
                                                    <h2>Dados do Imóvel</h2>
                                                    <div>
                                                        <label>Qual é o valor a ser pago ?</label>
                                                        <div>
                                                            <input
                                                                type='text'
                                                                placeholder=''
                                                                name="multaDesistencia"
                                                                onChange={handleChange}
                                                            />
                                                            <button onClick={handleBack}>Voltar</button>
                                                            <button onClick={handleNext}>Próximo</button>                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    )}

                                </>
                            )}


                            {step === 63 && (
                                <>
                                    <h2>Dados do Imóvel</h2>
                                    <div>
                                        <label>Como será a cobrança da hospedagem?</label>
                                        <select name='formaDePagamento' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="pix">Pix</option>
                                            <option value="trans">Transferência Bancária</option>
                                            <option value='dep'>Depósito</option>
                                            <option value="din">Dinheiro</option>
                                            <option value="bol">Boleto</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>                                    </div>
                                </>
                            )}

                            {step === 64 && (
                                <>
                                    <h2>Dados do Imóvel</h2>
                                    <div>
                                        <label>O valor da hospedagem será pago antecipadamente?</label>
                                        <select name='valorPagHospePagAntecipa' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>                                    </div>
                                </>
                            )}


                            {step === 65 && (
                                <>
                                    <h2>Dados do Imóvel</h2>
                                    <div>
                                        <label>As contas básicas serão cobradas à parte do valor da hospedagem?</label>
                                        <select name='contasBasicas' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>                                    </div>
                                </>
                            )}

                            {contasBasicas && (
                                <>
                                    {step === 66 && (
                                        <>
                                            <h2>Dados do Imóvel</h2>
                                            <div>
                                                <label>O hóspede deverá transferir as contas de consumo para seu nome?</label>
                                                <select name='tranfDeContaHosp' onChange={handleChange}>
                                                    <option value="">Selecione</option>
                                                    <option value="S">Sim</option>
                                                    <option value="N">Não</option>
                                                </select>
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 67 && (
                                <>
                                    <h2>Dados do Imóvel</h2>
                                    <div>
                                        <label>Haverá reajuste anual no valor da hospedagem a cada 12 meses?</label>
                                        <select name='resgateAnual' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>                                    </div>
                                </>
                            )}

                            {resgateAnual && (
                                <>
                                    {step === 68 && (
                                        <>
                                            <h2>Dados do Imóvel</h2>
                                            <div>
                                                <label>Qual será o indicador?</label>
                                                <select name='indicador' onChange={handleChange}>
                                                    <option value="">Selecione</option>
                                                    <option value="igp-m">Índice Geral de Preços – Mercado</option>
                                                    <option value="igp">Índice Geral de Preços</option>
                                                    <option value="ivar">Índice de Variação de Aluguéis Residenciais</option>
                                                    <option value="ipca">Índice Nacional de Preços ao Consumidor Amplo</option>
                                                    <option value="inpc">Índice Nacional de Preços ao Consumidor</option>
                                                </select>
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 69 && (
                                <>
                                    <h2>Dados do Imóvel</h2>
                                    <div>
                                        <label>Duração da hospedagem será contada como por dias ou por meses ?</label>
                                        <div>
                                            <select name='duracaoDiasouMeses' onChange={handleChange}>
                                                <option value="">Selecione</option>
                                                <option value="dias">Dias</option>
                                                <option value="meses">Meses</option>
                                            </select>
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 70 && (
                                <>
                                    <h2>Dados do Imóvel</h2>
                                    <div>
                                        <label>O imóvel será alugado por quanto tempo ?</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="qtdDiasouMeses"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 71 && (
                                <>
                                    <h2>Dados do Imóvel</h2>
                                    <div>
                                        <label>Qual a data que iniciará a Hospedagem ?</label>
                                        <div>
                                            <input
                                                type='date'
                                                placeholder=''
                                                name="dataDeInicioHospedagem"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 72 && (
                                <>
                                    <h2>Dados do Imóvel</h2>
                                    <div>
                                        <label>A hospedagem oferece serviços de arrumação e limpeza?</label>
                                        <div>
                                            <select name='servicosLimpeza' onChange={handleChange}>
                                                <option value="">Selecione</option>
                                                <option value="S">Sim</option>
                                                <option value="N">Não</option>
                                            </select>
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 73 && (
                                <>
                                    <h2>Dados do Imóvel</h2>
                                    <div>
                                        <label>Será permitido o empréstimo ou a sublocação do imóvel?</label>
                                        <div>
                                            <select name='empreousublocacao' onChange={handleChange}>
                                                <option value="">Selecione</option>
                                                <option value="S">Sim</option>
                                                <option value="N">Não</option>
                                            </select>
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 74 && (
                                <>
                                    <h2>Dados do Imóvel</h2>
                                    <div>
                                        <label>Será solicitada alguma garantia para a hospedagem?</label>
                                        <div>
                                            <select name='garantiaHosp' onChange={handleChange}>
                                                <option value="">Selecione</option>
                                                <option value="S">Sim</option>
                                                <option value="N">Não</option>
                                            </select>
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                        </div>
                                    </div>
                                </>
                            )}

                            {garantidorHosp && (
                                <>
                                    {step === 75 && (
                                        <>
                                            <h2>Dados do Imóvel</h2>
                                            <div>
                                                <label>Quem será a garantia solicitada para a hospedagem?</label>
                                                <div>
                                                    <select name='garantidorHosp' onChange={handleChange}>
                                                        <option value="">Selecione</option>
                                                        <option value="fi">Fiador</option>
                                                        <option value="caudep">Caução em Depósito</option>
                                                        <option value="caubem">Caução em Bem Móvel</option>
                                                        <option value="ti">Titulos</option>
                                                        <option value="segfianca">Seguro fiança</option>
                                                    </select>
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {fiador && (
                                        <>
                                            {step === 76 && (
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

                                            {step === 77 && (
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

                                            {step === 78 && (
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

                                            {step === 79 && (
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

                                            {step === 80 && (
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

                                            {step === 81 && (
                                                <>
                                                    <h2>Dados do Fiador</h2>
                                                    <div>
                                                        <label>Documento do 2° Representante:</label>
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

                                            {step === 82 && (
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

                                            {step === 83 && (
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

                                            {step === 84 && (
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
                                            {step === 85 && (
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
                                            {step === 86 && (
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
                                            {step === 87 && (
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
                                            {step === 88 && (
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



                                </>
                            )}

                            {step === 89 && (
                                <>
                                    <h2>Dados do Imóvel</h2>
                                    <div>
                                        <label>Quem será o responsável por pagar as benfeitorias?</label>
                                        <div>
                                            <select name='pagadorBemFeitorias' onChange={handleChange}>
                                                <option value="">Selecione</option>
                                                <option value="hospede">Hóspede</option>
                                                <option value="locador">Locador</option>
                                            </select>
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 90 && (
                                <>
                                    <h2>Dados do Imóvel</h2>
                                    <div>
                                        <label>Será oferecida vaga na garagem?</label>
                                        <div>
                                            <select name='garagem' onChange={handleChange}>
                                                <option value="">Selecione</option>
                                                <option value="S">Sim</option>
                                                <option value="N">Não</option>
                                            </select>
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 91 && (
                                <>
                                    <h2>Dados do Imóvel</h2>
                                    <div>
                                        <label>Multa por não desocupação</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="multaPorNaoDesocupa"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 92 && (
                                <>
                                    <h2>Dados do Imóvel</h2>
                                    <div>
                                        <label>Haverá multa se ocorrer o rompimento do contrato antes do seu prazo terminar?</label>
                                        <div>
                                            <select name='multaPorRompimento' onChange={handleChange}>
                                                <option value="">Selecione</option>
                                                <option value="S">Sim</option>
                                                <option value="N">Não</option>
                                            </select>
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                        </div>
                                    </div>
                                </>
                            )}

                            {multaPorRompimento && (
                                <>
                                    {step === 93 && (
                                        <>
                                            <h2>Dados do Imóvel</h2>
                                            <div>
                                                <label>Valor </label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="valorMultaRompimento"
                                                        onChange={handleChange}
                                                    />
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 94 && (
                                <>
                                    <h2>Dados do Imóvel</h2>
                                    <div>
                                        <label>Haverá multa de descumprimento?</label>
                                        <div>
                                            <select name='multaPorDescDeContrato' onChange={handleChange}>
                                                <option value="">Selecione</option>
                                                <option value="S">Sim</option>
                                                <option value="N">Não</option>
                                            </select>
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                        </div>
                                    </div>
                                </>
                            )}

                            {multaPorDescDeContrato && (
                                <>
                                    {step === 95 && (
                                        <>
                                            <h2>Dados do Imóvel</h2>
                                            <div>
                                                <label>Valor </label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="valorMultaDesc"
                                                        onChange={handleChange}
                                                    />
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 96 && (
                                <>
                                    <h2>Dados do Contrato</h2>
                                    <div>
                                        <label>Qual será a cidade junto com estado em que o contrato será assinado? </label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="cidadeAssinatura"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 97 && (
                                <>
                                    <h2>Dados do Contrato</h2>
                                    <div>
                                        <label>Data em que será assinado? </label>
                                        <div>
                                            <input
                                                type='date'
                                                placeholder=''
                                                name="cidadeAssinatura"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 98 && (
                                <>
                                    <h2>Dados do Contrato</h2>
                                    <div>
                                        <label>Gostaria de adicionar testemunhas? </label>
                                        <div>
                                            <select name='duastestemunhas' onChange={handleChange}>
                                                <option value="">Selecione</option>
                                                <option value="S">Sim</option>
                                                <option value="N">Não</option>
                                            </select>
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                        </div>
                                    </div>
                                </>
                            )}

                            {duastestemunhas && (
                                <>
                                    {step === 99 && (
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
                                                    <button onClick={handleNext}>Próximo</button>                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 100 && (
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
                                                    <button onClick={handleNext}>Próximo</button>                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 101 && (
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
                                                    <button onClick={handleNext}>Próximo</button>                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 102 && (
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
                                                    <button onClick={handleNext}>Próximo</button>                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                            {step === 103 && (
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
                    <button className='btnBaixarPdf' onClick={() => { gerarContratoHospedagem(formData) }}>
                        Baixar PDF
                    </button>
                ) : (
                    <button className='btnBaixarPdf' onClick={handleVerifyPayment}>
                        Verificar Pagamento
                    </button>
                )}
            </div>

        </>
    )
}