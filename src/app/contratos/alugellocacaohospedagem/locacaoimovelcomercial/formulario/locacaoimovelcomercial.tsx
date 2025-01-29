'use client'
import { verificarValor, verificarValorEspecial } from '@/lib/utils';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';
import geradorDeContratoImovelComercialPago from '../util/pdf';


const locacaoimovelcomercialschema = z.object({
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


    /**DESCRIÇÃO DO IMÓVEL */
    enderecoImovel: z.string(),
    descImovel: z.string(),
    destcomercial: z.string(),
    condicoesImovel: z.string(),
    /** */

    /**PRAZO DA LOCAÇÃO */
    dataInicioLocacao: z.string(),
    duracaoContrato: z.string(),
    possibilidadeRenovacao: z.enum(['S', 'N']),

    //se sim
    quaisCondicoes: z.string(),
    /** */

    /**VALOR DO ALUGUEL E CONDIÇÕES DE PAGAMENTO */
    valorMensalAluguel: z.string(),
    dataVenc: z.string(),
    formaPagamento: z.enum(['Pix', 'Dinheiro', 'Cartão', 'Boleto']),

    reajusteAnual: z.enum(['S', 'N']),
    //se sim
    qualIndice: z.string(),

    multaPorAtrasoPagamento: z.string(),
    jurosporatraso: z.string(),
    /** */

    /** Garantias */
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

    /**OBRIGAÇÕES DO LOCADOR */
    locadorManuRep: z.enum(['S', 'N']),
    locadorServAdicional: z.enum(['S', 'N']),
    /** */

    /**OBRIAGAÇÕES DO LOCATARIO */
    locatarioRealiza: z.enum(['S', 'N']),
    //sesim
    quaisLocatarioCondicoes: z.string(),

    locatarioManu: z.string(),
    restricoes: z.string(),
    /** */

    /**DESPESAS E TRIBUTOS */
    despesasLocatario: z.string(),
    despesasLocador: z.string(),
    /** */

    /**RESCISÃO DO CONTRATO */
    condicoesRescisao: z.string(),
    multasPenalidades: z.string(),
    prazo: z.string(),
    /** */

    /**DIREITO DE PREFERÊNCIA */
    direitoPreferencia: z.enum(['S', 'N']),
    condicoesExec: z.string(),
    /** */


    /**DISPOSIÇÕES GERAIS */
    foroResolucaoConflitos: z.string(), // Foro eleito para resolução de conflitos
    testemunhasNecessarias: z.enum(['S', 'N']), // Necessidade de testemunhas para assinatura do contrato
    //se sim 
    nomeTest1: z.string(),
    cpfTest1: z.string(),
    nomeTest2: z.string(),
    cpfTest2: z.string(),

    registroCartorio: z.enum(['S', 'N']), // Indicação se o contrato será registrado em cartório 
    /** */




});

type FormData = z.infer<typeof locacaoimovelcomercialschema>;



export default function LocacaoImovelComercial() {
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
    const [desmontagem, setDesmontagem] = useState(false);
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


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurrentStepData((prev) => ({ ...prev, [name]: value }));
    };

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

        if (currentStepData.possibilidadeRenovacao === 'S') {
            setRenovacao(true);
            nextStep = 33
        } else if (currentStepData.possibilidadeRenovacao === 'N') {
            nextStep = 34;
        }

        if (currentStepData.reajusteAnual === 'S') {
            setReajusteAnual(true);
            nextStep = 38
        } else if (currentStepData.reajusteAnual === 'N') {
            nextStep = 39;
        }



        if (currentStepData.garantia === 'S') {
            setGarantia(true);
            nextStep = 42;
        } else if (currentStepData.garantia === 'N') {
            nextStep = 56;
        }

        //para verificar se o próximo é o ultimo de step de algum garantidor
        if (nextStep === 51) {
            nextStep = 56
        } else if (nextStep === 52) {
            nextStep = 56
        } else if (nextStep === 53) {
            nextStep = 56
        } else if (nextStep === 54) {
            nextStep = 56
        } else if (nextStep === 55) {
            nextStep = 56
        }


        switch (currentStepData.qualgarantidor) {
            case "fi":
                setFiador(true);
                break;
            case "caudep":
                setCaucaoDep(true);
                nextStep = 52;
                break;
            case "caubem":
                setCaucaoBemIM(true);
                nextStep = 53;
                break;
            case "ti":
                setTitulos(true);
                nextStep = 54;
                break;
            case "segfianca":
                setSeguroFi(true);
                nextStep = 55;
                break;
            default:
                break;
        }


        if (currentStepData.locadorServAdicional === 'S') {
            setServicoAdicional(true);
            nextStep = 58;
        } else if (currentStepData.locadorServAdicional === 'N') {
            nextStep = 59;
        }


        if (currentStepData.locatarioRealiza === 'S') {
            setLocatarioRealiza(true);
            nextStep = 60;
        } else if (currentStepData.locatarioRealiza === 'N') {
            nextStep = 62;
        }


        if (currentStepData.restricoes === 'S') {
            setRestricoes(true);
            nextStep = 63;
        } else if (currentStepData.restricoes === 'N') {
            nextStep = 64;
        }

        if (currentStepData.direitoPreferencia === 'S') {
            setDireitoPreferencia(true);
            nextStep = 70;
        } else if (currentStepData.direitoPreferencia === 'N') {
            nextStep = 71;
        }

        if (currentStepData.testemunhasNecessarias === 'S') {
            setTestemunhas(true);
            nextStep = 75;
        } else if (currentStepData.testemunhasNecessarias === 'N') {
            nextStep = 79;
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



    const geradorDeContratoImovelComercial = (dados: any) => {

        const doc = new jsPDF();

        // Configuração inicial de fonte e margens
        const marginX = 10;
        let posY = 20;

        // Altura máxima permitida antes de criar uma nova página
        const maxPageHeight = 280;

        // Largura do texto permitida dentro das margens
        const maxTextWidth = 190; // 210 (largura total) - 10 (margem esquerda) - 10 (margem direita)

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
        doc.text("CONTRATO DE LOCAÇÃO DE IMÓVEL COMERCIAL", 105, posY, { align: "center" });
        posY += 15;

        // Seções do contrato
        addSection("CLÁUSULA 1 - IDENTIFICAÇÃO DAS PARTES", [
            "(Artigos 104, 421 e 425 do Código Civil Brasileiro)",
            "Nesta seção, é feita a descrição detalhada do imóvel objeto do contrato, incluindo seu endereço completo, características e condições.\n Também são especificadas a destinação (residencial ou comercial) e o estado de conservação, conforme o que foi verificado pelas partes.",
            "\nLocador (Proprietário do Imóvel):",
            `\nNome ou Razão Social: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.nomeLocador) : verificarValor(dados.razaoSocial)}`,
            `\nCPF ou CNPJ: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.CPFLocador) : verificarValor(dados.cnpjlocador)}`,
            `\nEndereço: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.enderecoLocador) : verificarValor(dados.enderecoCNPJ)}`,
            `\nTelefone: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.telefoneLocador) : verificarValor(dados.telefoneCNPJ)}`,
            `\nE-mail: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.emailLocador) : verificarValor(dados.emailCNPJ)}`,
            verificarValor(dados.locador) === "pj" ? `\nRepresentante Legal: ${verificarValor(dados.nomeRepresentanteCNPJ)},\n CPF: ${verificarValor(dados.CPFRepresentanteCNPJ)}` : "",
            "",
            "\nLocatário (Inquilino do Imóvel):",
            `\nNome ou Razão Social: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.nomelocatario) : verificarValor(dados.razaoSociallocatario)}`,
            `\nCPF ou CNPJ: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.CPFlocatario) : verificarValor(dados.cpflocatario)}`,
            `\nEndereço: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.enderecolocatario) : verificarValor(dados.enderecolocatarioCNPJ)}`,
            `\nTelefone: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.telefonelocatario) : verificarValor(dados.telefonelocatarioCNPJ)}`,
            `\nE-mail: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.emaillocatario) : verificarValor(dados.emaillocatarioCNPJ)}`,
            verificarValor(dados.locatario) === "pj" ? `\nRepresentante Legal: ${verificarValor(dados.nomeRepresentantelocatarioCNPJ)},\n CPF: ${verificarValor(dados.CPFRepresentantelocatarioCNPJ)}` : "",
        ]);


        addSection("\nCLÁUSULA 2 - DESCRIÇÃO DO IMÓVEL", [
            "\n(Artigos 47 e 54 da Lei do Inquilinato - Lei nº 8.245/91)",
            `\nEndereço do Imóvel: ${verificarValor(dados.enderecoImovel)}`,
            `\nDescrição: ${verificarValor(dados.descImovel)}`,
            `\nDestinação Comercial: ${verificarValor(dados.destcomercial)}`,
            `\nCondições do Imóvel: ${verificarValor(dados.condicoesImovel)}`,
        ]);

        addSection("CLÁUSULA 3 - PRAZO DA LOCAÇÃO", [
            "(Artigo 565 do Código Civil Brasileiro e Artigo 3º da Lei do Inquilinato)",
            "O prazo do contrato é definido de forma clara, seja por tempo determinado ou indeterminado, conforme acordado entre as partes. São descritos a data de início, a duração do contrato e a possibilidade de renovação,\n respeitando a legislação aplicável, como o Art. 565 do Código Civil.",
            `\nData de Início: ${verificarValor(dados.dataInicioLocacao)}`,
            `\nDuração do Contrato: ${verificarValor(dados.duracaoContrato)}`,
            `Possibilidade de Renovação: ${verificarValor(dados.possibilidadeRenovacao) === "S" ? "Sim" : "Não"}`,
            verificarValor(dados.possibilidadeRenovacao) === "S" ? `Condições: ${verificarValor(dados.quaisCondicoes)}` : "",
        ]);


        addSection("CLÁUSULA 4 - VALOR DO ALUGUEL E CONDIÇÕES DE PAGAMENTO", [
            "(Artigos 565 e 578 do Código Civil Brasileiro)",
            "Conforme o Art. 578 do Código Civil: 'Os aluguéis de prédios urbanos, ou de qualquer outra coisa,\n pagam-se nos prazos ajustados, e, na falta de ajuste, até o sexto dia subsequente ao vencido.'",
            `Valor Mensal: R$ ${verificarValor(dados.valorMensalAluguel)}`,
            `Data de Vencimento: ${verificarValor(dados.dataVenc)}`,
            `Forma de Pagamento: ${verificarValor(dados.formaPagamento)}`,
            `Reajuste Anual: ${verificarValor(dados.reajusteAnual) === "S" ? "Sim" : "Não"}`,
            dados.reajusteAnual === "S" ? `Índice: ${verificarValor(dados.qualIndice)}` : "",
            `Multa por Atraso: ${verificarValor(dados.multaPorAtrasoPagamento)}%`,
            `Juros por Atraso: ${verificarValor(dados.jurosporatraso)}% ao mês`,
        ]);


        addSection("CLÁUSULA 5 - GARANTIAS LOCATÍCIAS", [
            "(Artigo 37 da Lei do Inquilinato e Artigos 827 a 838 do Código Civil Brasileiro)",
            "De acordo com o Art. 37 da Lei do Inquilinato: 'No contrato de locação, pode o locador exigir do locatário\n as seguintes modalidades de garantia: caução, fiança, seguro de fiança locatícia ou cessão fiduciária de quotas de fundo de investimento.'",
            `Garantia Exigida: ${verificarValor(dados.garantia) === "S" ? "Sim" : "Não"}`,
            `Detalhes: ${verificarValor(dados.qualgarantidor) === "fi"
                ? `Fiador: ${verificarValor(dados.nomeFiador)}, CPF: ${verificarValor(dados.cpfFiador)}`
                : verificarValor(dados.qualgarantidor) === "caudep"
                    ? `Caução em Dinheiro: R$ ${verificarValor(dados.valorTitCaucao)}`
                    : verificarValor(dados.qualgarantidor) === "caubem"
                        ? `Caução em Bem: ${verificarValor(dados.descBemCaucao)}`
                        : verificarValor(dados.qualgarantidor) === "ti"
                            ? `Título de Crédito: ${verificarValor(dados.descCredUtili)}`
                            : `Seguro Fiança: ${verificarValor(dados.segFianca)}`
            }`,
            `Procedimento para Devolução: ${verificarValor(dados.procedimentoDevolucao)}`,
        ]);


        addSection("CLÁUSULA 6 - OBRIGAÇÕES DO LOCADOR", [
            "(Artigo 22 da Lei do Inquilinato)",
            `Responsabilidade por Manutenções/Reparos: ${verificarValor(dados.locadorManuRep) === "S" ? "Sim" : "Não"}`,
            `Serviços Adicionais: ${verificarValor(dados.locadorServAdicional) === "S" ? "Sim" : "Não"}`,
        ]);

        addSection("CLÁUSULA 7 - OBRIGAÇÕES DO LOCATÁRIO", [
            "(Artigos 23 e 24 da Lei do Inquilinato)",
            `Reformas ou Modificações Permitidas: ${verificarValor(dados.locatarioRealiza) === "S" ? "Sim" : "Não"}`,
            verificarValor(dados.locatarioRealiza) === "S" ? `Condições: ${verificarValor(dados.quaisLocatarioCondicoes)}` : "",
            `Responsabilidade por Manutenções: ${verificarValor(dados.locatarioManu)}`,
            `Restrições de Uso: ${verificarValor(dados.restricoes)}`,
        ]);

        addSection("CLÁUSULA 8 - DESPESAS E TRIBUTOS", [
            "(Artigos 22 e 23 da Lei do Inquilinato)",
            `Despesas do Locatário: ${verificarValor(dados.despesasLocatario)}`,
            `Despesas do Locador: ${verificarValor(dados.despesasLocador)}`,
        ]);

        addSection("CLÁUSULA 9 - RESCISÃO DO CONTRATO", [
            "(Artigo 4º da Lei do Inquilinato e Artigo 475 do Código Civil Brasileiro)",
            `Condições: ${verificarValor(dados.condicoesRescisao)}`,
            `Multas/Penalidades: ${verificarValor(dados.multasPenalidades)}`,
            `Prazo para Notificação: ${verificarValor(dados.prazo)} dias`,
        ]);

        addSection("CLÁUSULA 10 - DIREITO DE PREFERÊNCIA", [
            "(Artigo 27 da Lei do Inquilinato)",
            `Preferência para Compra: ${verificarValor(dados.direitoPreferencia) === "S" ? "Sim" : "Não"}`,
            verificarValor(dados.direitoPreferencia) === "S" ? `Condições: ${verificarValor(dados.condicoesExec)}` : "",
        ]);

        addSection("CLÁUSULA 11 - DISPOSIÇÕES GERAIS", [
            "(Artigos 421 e 422 do Código Civil Brasileiro)",
            `Foro: ${verificarValor(dados.foroResolucaoConflitos)}`,
            `Testemunhas Necessárias: ${verificarValor(dados.testemunhasNecessarias) === "S" ? "Sim" : "Não"}`,
            `Registro em Cartório: ${verificarValor(dados.registroCartorio) === "S" ? "Sim" : "Não"}`,
        ]);

        if (dados.testemunhasNecessarias === "S") {
            posY += 20;
            doc.text("__________________________", 60, posY);
            doc.text(`Testemunha 1: ${verificarValorEspecial(dados.nomeTest1)}`, 60, posY + 5);
            doc.text(`CPF: ${verificarValorEspecial(dados.cpfTest1)}`, 60, posY + 10);

            doc.text("__________________________", 140, posY);
            doc.text(`Testemunha 2: ${verificarValorEspecial(dados.nomeTest2)}`, 140, posY + 5);
            doc.text(`CPF: ${verificarValorEspecial(dados.cpfTest2)}`, 140, posY + 10);
        }

        posY += 20;
        doc.text("__________________________", 60, posY);
        doc.text("Assinatura do Locador", 60, posY + 5);

        doc.text("__________________________", 140, posY);
        doc.text("Assinatura do Locatário", 140, posY + 5);

        const pdfDataUri = doc.output("datauristring");
        setPdfDataUrl(pdfDataUri);
    };


    useEffect(() => {
        geradorDeContratoImovelComercial({ ...formData });
    }, [formData]);

    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title">Contrato de Locação de Imóvel Comercial</h1>
            </div>
            <div className="container">
                <div className="left-panel">
                    <div className="scrollable-card">
                        <div className="progress-bar">
                            <div
                                className="progress-bar-inner"
                                style={{ width: `${(step / 78) * 100}%` }}
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
                                    <h2>Descrição do Imóvel</h2>
                                    <div>
                                        <label>Endereço completo do imóvel</label>
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


                            {step === 26 && (
                                <>
                                    <h2>Descrição do Imóvel</h2>
                                    <div>
                                        <label>Descrição detalhada do imóvel (ex.: área total, número de salas, banheiros, estacionamento, etc.)</label>
                                        <textarea
                                            id="descImovel"
                                            name="descImovel"
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

                            {step === 27 && (
                                <>
                                    <h2>Descrição do Imóvel</h2>
                                    <div>
                                        <label>Destinação comercial específica (ex.: escritório, loja, restaurante, etc.)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="destcomercial"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 28 && (
                                <>
                                    <h2>Descrição do Imóvel</h2>
                                    <div>
                                        <label>Condições atuais do imóvel (se necessário, incluir um relatório ou fotos)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="condicoesImovel"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 29 && (
                                <>
                                    <h2>Prazo Da Locação</h2>
                                    <div>
                                        <label>Condições atuais do imóvel (se necessário, incluir um relatório ou fotos)</label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="dataInicioLocacao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 30 && (
                                <>
                                    <h2>Prazo Da Locação</h2>
                                    <div>
                                        <label>Data de início da locação</label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="dataInicioLocacao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 31 && (
                                <>
                                    <h2>Prazo Da Locação</h2>
                                    <div>
                                        <label>Duração do contrato (ex.: 12 meses, 24 meses)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="duracaoContrato"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 32 && (
                                <>
                                    <h2>Prazo Da Locação</h2>
                                    <div>
                                        <label>Há possibilidade de renovação?</label>
                                        <select name='possibilidadeRenovacao' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {renovacao && (
                                <>
                                    {step === 33 && (
                                        <>
                                            <h2>Prazo Da Locação</h2>
                                            <div>
                                                <label>Sob quais condições?</label>
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

                            {step === 34 && (
                                <>
                                    <h2>Valor do Aluguel e Condições de Pagamento</h2>
                                    <div>
                                        <label>Valor mensal do aluguel</label>

                                        <input
                                            type='text'
                                            placeholder=''
                                            name="valorMensalAluguel"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 35 && (
                                <>
                                    <h2>Valor do Aluguel e Condições de Pagamento</h2>
                                    <div>
                                        <label>Data de vencimento mensal</label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="dataVenc"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 36 && (
                                <>
                                    <h2>Valor do Aluguel e Condições de Pagamento</h2>
                                    <div>
                                        <label>Forma de pagamento (ex.: depósito bancário, boleto, Pix)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="formaPagamento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 37 && (
                                <>
                                    <h2>Valor do Aluguel e Condições de Pagamento</h2>
                                    <div>
                                        <label>Reajuste anual do aluguel?</label>
                                        <select name='reajusteAnual' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {reajusteAnual && (
                                <>
                                    {step === 38 && (
                                        <>
                                            <h2>Valor do Aluguel e Condições de Pagamento</h2>
                                            <div>
                                                <label>Qual índice será utilizado (ex.: IGPM, IPCA)?</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="qualIndice"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}



                            {step === 39 && (
                                <>
                                    <h2>Valor do Aluguel e Condições de Pagamento</h2>
                                    <div>
                                        <label>Multa por atraso no pagamento</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="multaPorAtrasoPagamento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 40 && (
                                <>
                                    <h2>Valor do Aluguel e Condições de Pagamento</h2>
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



                            {step === 41 && (
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
                                    {step === 42 && (
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
                                    {step === 43 && (
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

                                    {step === 44 && (
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

                                    {step === 45 && (
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

                                    {step === 46 && (
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

                                    {step === 47 && (
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

                                    {step === 48 && (
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

                                    {step === 49 && (
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

                                    {step === 50 && (
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

                                    {step === 51 && (
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
                                    {step === 52 && (
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
                                    {step === 53 && (
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
                                    {step === 54 && (
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
                                    {step === 55 && (
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


                            {step === 56 && (
                                <>
                                    <h2>Obrigações do Locador(Proprietário do Imóvel)</h2>
                                    <div>
                                        <label>O locador se responsabiliza por quais manutenções ou reparos?</label>
                                        <div>
                                            <select name='locadorManuRep' onChange={handleChange}>
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

                            {step === 57 && (
                                <>
                                    <h2>Obrigações do Locador(Proprietário do Imóvel)</h2>
                                    <div>
                                        <label>O locador fornecerá algum serviço adicional (ex.: segurança, limpeza das áreas comuns)?</label>
                                        <div>
                                            <select name='locadorServAdicional' onChange={handleChange}>
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


                            {servicoAdicional && (
                                <>
                                    {step === 58 && (
                                        <>
                                            <h2>Obrigações do Locador(Proprietário do Imóvel)</h2>
                                            <div>
                                                <label>Qual serviço fornecerá ?</label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="qualServico"
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

                            {step === 59 && (
                                <>
                                    <h2>Obrigações do locatário(Inquilino do imóvel)</h2>
                                    <div>
                                        <label>O locatário pode realizar reformas ou modificações no imóvel?</label>
                                        <div>
                                            <select name='locatarioRealiza' onChange={handleChange}>
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

                            {locatarioRealiza && (
                                <>
                                    {step === 60 && (
                                        <>
                                            <h2>Obrigações do locatário(Inquilino do imóvel)</h2>
                                            <div>
                                                <label>Quais são as condições?</label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="quaisLocatarioCondicoes"
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
                                            <h2>Obrigações do locatário(Inquilino do imóvel)</h2>
                                            <div>
                                                <label>O locatário é responsável por quais manutenções?</label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="locatarioManu"
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


                            {step === 62 && (
                                <>
                                    <h2>Obrigações do locatário(Inquilino do imóvel)</h2>
                                    <div>
                                        <label>Há restrições quanto ao tipo de atividades comerciais permitidas no imóvel?</label>
                                        <div>
                                            <select name='restricoes' onChange={handleChange}>
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

                            {restricoes && (
                                <>
                                    {step === 63 && (
                                        <>
                                            <h2>Obrigações do locatário(Inquilino do imóvel)</h2>
                                            <div>
                                                <label>Quais restrições?</label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="quaisRestricoes"
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


                            {step === 64 && (
                                <>
                                    <h2>Despesas e Tributos</h2>
                                    <div>
                                        <label>Quais despesas são de responsabilidade do locatário (Inquilino do imóvel)? (ex.: IPTU, contas de água, luz, condomínio)</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="despesasLocatario"
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
                                    <h2>Despesas e Tributos</h2>
                                    <div>
                                        <label>Quais despesas são de responsabilidade do locador?</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="despesasLocador"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 66 && (
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

                            {step === 67 && (
                                <>
                                    <h2>Rescisão do Contrato</h2>
                                    <div>
                                        <label>Multas ou penalidades aplicáveis em caso de rescisão antecipada</label>
                                        <div>

                                            <textarea
                                                id="multasPenalidades"
                                                name="multasPenalidades"
                                                onChange={handleChange}
                                                rows={10}
                                                cols={50}
                                                placeholder="Descrição"
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 68 && (
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

                            {step === 69 && (
                                <>
                                    <h2>Direito de Preferência</h2>
                                    <div>
                                        <label>Em caso de venda do imóvel, o locatário terá direito de preferência para compra?</label>
                                        <div>
                                            <select name='direitoPreferencia' onChange={handleChange}>
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


                            {direitoPreferencia && (
                                <>
                                    {step === 70 && (
                                        <>
                                            <h2>Direito de Preferência</h2>
                                            <div>
                                                <label>Condições para exercício desse direito</label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="condicoesExec"
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

                            {step === 71 && (
                                <>
                                    <h2>Direito de Preferência</h2>
                                    <div>
                                        <label>Condições para exercício desse direito</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="condicoesExec"
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
                                    <h2>Disposição Gerais</h2>
                                    <div>
                                        <label>Condições para exercício desse direito</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="foroResolucaoConflitos"
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

                            {step === 74 && (
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


                            {Testemunhas && (
                                <>
                                    {step === 75 && (
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

                                    {step === 76 && (
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

                                    {step === 77 && (
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

                                    {step === 78 && (
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

                            {step === 79 && (
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

                            {step === 80 && (
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
                    <button className='btnBaixarPdf' onClick={() => { geradorDeContratoImovelComercialPago(formData) }}>
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
