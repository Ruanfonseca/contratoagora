'use client'
import Pilha from '@/lib/pilha';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';
import geradorImovelResidencialPDF from '../util/pdf';

const locacaoimovelresidencialschema = z.object({
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
    tipoImóvel: z.string(),
    areaTotal: z.string(),
    numeroComodos: z.string(),
    vagaGaragem: z.enum(['S', 'N']),
    mobilia: z.enum(['S', 'N']),
    /** */

    /**DESTINAÇÃO DO IMÓVEL**/
    finsResidenciais: z.enum(['S', 'N']),

    //se sim
    qualFim: z.string(),
    /** */

    /** PRAZO DA LOCAÇÃO **/
    dataInicioLocacao: z.string(),
    duracaoContrato: z.string(),
    possibilidadeRenovacao: z.enum(['S', 'N']),
    quaisCondicoes: z.string(),
    /**********/


    /**VALOR DO ALUGUEL E FORMA DE PAGAMENTO */
    valorMensal: z.string(),
    dataVencMensal: z.string(),
    formaPagamento: z.string(),
    multaAtraso: z.string(),
    jurosAplicaveis: z.string(),
    /** */

    /** REAJUSTE DO ALUGUEL **/
    teraReajuste: z.enum(['S', 'N']),
    periodoReajuste: z.string(),
    indiceReajuste: z.string(),
    /******* */

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


    /** OBRIGAÇÕES DO LOCADOR **/
    locadorManuRep: z.string(),
    locadorServAdicional: z.string(),
    /******/

    /**OBRIGAÇÕES DO LOCATÁRIO */
    locatarioReforma: z.enum(['S', 'N']),

    //se sim
    quaiCondicoes: z.string(),

    locatarioManu: z.string(),
    restricoesUso: z.string(),
    /** */


    /**DESPESAS E TRIBUTOS */
    despesasLocatario: z.string(),
    despesasLocador: z.string(),
    /*** */

    /**RESCISÃO DO CONTRATO */
    condicoes: z.string(),
    multasEpenalidades: z.string(),
    prazo: z.string(),
    /** */


    /**DIREITO E PREFERENCIA */
    preferenciaLocatario: z.enum(['S', 'N']),
    //se sim
    condicoesPrefe: z.string(),
    /*** */


    /**DISPOSIÇÃO GERAL */
    foroeleito: z.string(),
    testemunhas: z.enum(['S', 'N']),
    nomeTest1: z.string(),
    nomeTest2: z.string(),
    cpfTest1: z.string(),
    cpfTest2: z.string(),

    registroCartorio: z.enum(['S', 'N']),
});

type FormData = z.infer<typeof locacaoimovelresidencialschema>


export default function LocacaoImovelResidencial() {
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
    const valor = 24.90;
    const [pdfDataUrl, setPdfDataUrl] = useState<string>("");
    const [modalPagamento, setModalPagamento] = useState<Boolean>(false);
    const [isLoading, setIsLoading] = useState(false);
    /** */

    //VARIAVEIS DE CONTROLE DE FLUXO
    const [locadorJuri, setLocadorJuri] = useState(false);
    const [locadorioJuri, setLocadorioJuri] = useState(false);
    const [finsResidenciais, setFinsResidenciais] = useState(false);
    const [renovacao, setRenovacao] = useState(false);
    const [reajuste, setReajuste] = useState(false);
    const [garantia, setGarantia] = useState(false);
    const [fiador, setFiador] = useState(false);
    const [caucaoDep, setCaucaoDep] = useState(false);
    const [caucaoBemIM, setCaucaoBemIM] = useState(false);
    const [titulos, setTitulos] = useState(false);
    const [seguroFi, setSeguroFi] = useState(false);
    const [locatarioReforma, setLocatarioReforma] = useState(false);
    const [preferenciaLocatario, setPreferenciaLocatario] = useState(false);
    const [Testemunhas, setTestemunhas] = useState(false);
    const pilha = useRef(new Pilha());
    /** */



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
                description: `Contrato de Locação de Imóvel Residencial`,
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


        if (currentStepData.finsResidenciais === 'S') {
            setFinsResidenciais(true);
            nextStep = 32
        } else if (currentStepData.finsResidenciais === 'N') {
            nextStep = 33;
        }

        if (currentStepData.possibilidadeRenovacao === 'S') {
            setRenovacao(true);
            nextStep = 36;
        } else if (currentStepData.possibilidadeRenovacao === 'N') {
            nextStep = 37;
        }

        if (currentStepData.teraReajuste === 'S') {
            setReajuste(true);
            nextStep = 43;
        } else if (currentStepData.teraReajuste === 'N') {
            nextStep = 44;
        }

        if (currentStepData.garantia === 'S') {
            setGarantia(true);
            nextStep = 46;
        } else if (currentStepData.garantia === 'N') {
            nextStep = 60;
        }

        //para verificar se o próximo é o ultimo de step de algum garantidor
        if (nextStep === 55) {
            nextStep = 60
        } else if (nextStep === 56) {
            nextStep = 60
        } else if (nextStep === 57) {
            nextStep = 60
        } else if (nextStep === 58) {
            nextStep = 60
        } else if (nextStep === 59) {
            nextStep = 60
        }


        switch (currentStepData.qualgarantidor) {
            case "fi":
                setFiador(true);
                nextStep = 47;
                break;
            case "caudep":
                setCaucaoDep(true);
                nextStep = 56;
                break;
            case "caubem":
                setCaucaoBemIM(true);
                nextStep = 57;
                break;
            case "ti":
                setTitulos(true);
                nextStep = 58;
                break;
            case "segfianca":
                setSeguroFi(true);
                nextStep = 59;
                break;
            default:
                break;
        }




        if (currentStepData.locatarioReforma === 'S') {
            setLocatarioReforma(true);
            nextStep = 63;
        } else if (currentStepData.locatarioReforma === 'N') {
            nextStep = 64;
        }

        if (currentStepData.preferenciaLocatario === 'S') {
            setPreferenciaLocatario(true);
            nextStep = 72;
        } else if (currentStepData.preferenciaLocatario === 'N') {
            nextStep = 73;
        }

        if (currentStepData.testemunhas === 'S') {
            setTestemunhas(true);
            nextStep = 75;
        } else if (currentStepData.testemunhas === 'N') {
            nextStep = 79;
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



    function geradorImovelResidencial(dados: any) {
        const doc = new jsPDF();

        // Configuração inicial de fonte e margens
        const marginX = 10;
        let posY = 20;

        const maxPageHeight = 280;
        const maxTextWidth = 190;

        const checkPageBreak = (additionalHeight: number) => {
            if (posY + additionalHeight >= maxPageHeight) {
                doc.addPage();
                posY = 20;
            }
        };

        const addSection = (title: string, content: string[]) => {
            const titleHeight = 15;
            const lineHeight = 10;

            checkPageBreak(titleHeight);
            doc.setFontSize(12);
            doc.text(title, 105, posY, { align: "center" });
            posY += titleHeight;

            doc.setFontSize(10);
            content.forEach((line: string) => {
                const splitLines = doc.splitTextToSize(line, maxTextWidth);
                splitLines.forEach((splitLine: string) => {
                    checkPageBreak(lineHeight);
                    doc.text(splitLine, marginX, posY);
                    posY += lineHeight;
                });
            });
        };


        // Página 1 - Cabeçalho
        doc.setFontSize(14);
        doc.text("CONTRATO DE LOCAÇÃO DE IMÓVEL RESIDENCIAL", 105, posY, { align: "center" });
        posY += 15;

        // Seções do contrato
        addSection("CLÁUSULA 1 - IDENTIFICAÇÃO DAS PARTES", [
            "(Artigos 104, 421 e 425 do Código Civil Brasileiro)",
            "Nesta seção, é feita a descrição detalhada do imóvel objeto do contrato, incluindo seu endereço completo, características e condições.\n Também são especificadas a destinação (residencial ou comercial) e o estado de conservação, conforme o que foi verificado pelas partes.",
            "Locador:",
            `Nome ou Razão Social: ${dados.locador === "pf" ? dados.nomeLocador : dados.razaoSocial}`,
            `CPF ou CNPJ: ${dados.locador === "pf" ? dados.CPFLocador : dados.cnpjlocador}`,
            `Endereço: ${dados.locador === "pf" ? dados.enderecoLocador : dados.enderecoCNPJ}`,
            `Telefone: ${dados.locador === "pf" ? dados.telefoneLocador : dados.telefoneCNPJ}`,
            `E-mail: ${dados.locador === "pf" ? dados.emailLocador : dados.emailCNPJ}`,
            dados.locador === "pj" ? `Representante Legal: ${dados.nomeRepresentanteCNPJ}, CPF: ${dados.CPFRepresentanteCNPJ}` : "",
            "",
            "Locatário:",
            `Nome ou Razão Social: ${dados.locatario === "pf" ? dados.nomelocatario : dados.razaoSociallocatario}`,
            `CPF ou CNPJ: ${dados.locatario === "pf" ? dados.CPFlocatario : dados.cpflocatario}`,
            `Endereço: ${dados.locatario === "pf" ? dados.enderecolocatario : dados.enderecolocatarioCNPJ}`,
            `Telefone: ${dados.locatario === "pf" ? dados.telefonelocatario : dados.telefonelocatarioCNPJ}`,
            `E-mail: ${dados.locatario === "pf" ? dados.emaillocatario : dados.emaillocatarioCNPJ}`,
            dados.locatario === "pj" ? `Representante Legal: ${dados.nomeRepresentantelocatarioCNPJ}, CPF: ${dados.CPFRepresentantelocatarioCNPJ}` : "",
        ]);

        addSection("CLÁUSULA 2 - DESCRIÇÃO DO IMÓVEL", [
            "(Artigo 482 do Código Civil Brasileiro)",
            "O imóvel objeto deste contrato está descrito de forma clara e completa, conforme segue:",
            `Endereço completo: ${dados.enderecoImovel}`,
            `Tipo de imóvel: ${dados.tipoImóvel}`,
            `Área total: ${dados.areaTotal} m²`,
            `Número de cômodos: ${dados.numeroComodos}`,
            `Vaga de garagem: ${dados.vagaGaragem === "S" ? "Sim" : "Não"}`,
            `Mobília inclusa: ${dados.mobilia === "S" ? "Sim" : "Não"}`,
        ]);

        addSection("CLÁUSULA 3 - DESTINAÇÃO DO IMÓVEL", [
            "(Artigo 565 do Código Civil Brasileiro)",
            "O locatário se compromete a utilizar o imóvel exclusivamente para a finalidade contratada:",
            `Uso residencial: ${dados.finsResidenciais === 'S' ? 'Sim' : 'Não'}`,
            dados.finsResidenciais === 'N' ? `Finalidade específica: ${dados.qualFim}` : "",
        ]);

        addSection("CLÁUSULA 4 - PRAZO DA LOCAÇÃO", ["(Artigo 573 do Código Civil Brasileiro)",
            "O prazo da locação foi acordado entre as partes, respeitando o direito de rescisão previsto em lei:",
            `Data de início: ${dados.dataInicioLocacao}`,
            `Duração do contrato: ${dados.duracaoContrato} meses`,
            `Possibilidade de renovação: ${dados.possibilidadeRenovacao === 'S' ? 'Sim' : 'Não'}`,
            dados.possibilidadeRenovacao === 'S' ? `Condições: ${dados.quaisCondicoes}` : "",
        ]);

        addSection("CLÁUSULA 5 - VALOR DO ALUGUEL E FORMA DE PAGAMENTO", [
            "(Artigos 565 e 566 do Código Civil Brasileiro)",
            "O valor do aluguel e sua forma de pagamento foram definidos de forma justa e transparente:",
            `Valor mensal: R$ ${dados.valorMensal}`,
            `Data de vencimento: ${dados.dataVencMensal}`,
            `Forma de pagamento: ${dados.formaPagamento}`,
            `Multa por atraso: R$ ${dados.multaAtraso}`,
            `Juros aplicáveis: ${dados.jurosAplicaveis}%`,
        ]);

        addSection("CLÁUSULA 6 - REAJUSTE DO ALUGUEL", [
            "(Artigo 18 da Lei do Inquilinato - Lei 8.245/91)",
            "O reajuste do aluguel será realizado conforme índice e periodicidade acordados:",
            `Reajuste previsto: ${dados.teraReajuste === "S" ? "Sim" : "Não"}`,
            dados.teraReajuste === "S" ? `Periodicidade: ${dados.periodoReajuste}` : "",
            dados.teraReajuste === "S" ? `Índice: ${dados.indiceReajuste}` : "",
        ]);

        addSection("CLÁUSULA 7 - GARANTIAS LOCATÍCIAS", [
            "(Artigos 37 e 38 da Lei do Inquilinato - Lei 8.245/91)",
            "As garantias locatícias oferecidas neste contrato são as seguintes:",
            `Garantia exigida: ${dados.qualgarantidor}`,
            dados.qualgarantidor === "fi" ? `Fiador: ${dados.nomeFiador}, CPF: ${dados.cpfFiador}` : "",
            dados.qualgarantidor === "caudep" ? `Caução em dinheiro: R$ ${dados.valorTitCaucao}` : "",
            dados.qualgarantidor === "caubem" ? `Bem caucionado: ${dados.descBemCaucao}` : "",
            dados.qualgarantidor === "ti" ? `Título de crédito: ${dados.descCredUtili}` : "",
            dados.qualgarantidor === "segfianca" ? `Seguro-fiança: ${dados.segFianca}` : "",
        ]);

        addSection("CLÁUSULA 8 - OBRIGAÇÕES DO LOCADOR", [
            "(Artigos 22 e 23 da Lei do Inquilinato - Lei 8.245/91 e Artigo 565 do Código Civil Brasileiro)",
            `Manutenções e reparos estruturais: ${dados.locadorManuRep}`,
            `Serviços adicionais fornecidos: ${dados.locadorServAdicional}`,
        ]);

        addSection("CLÁUSULA 9 - OBRIGAÇÕES DO LOCATÁRIO", [
            "(Artigos 23 e 26 da Lei do Inquilinato - Lei 8.245/91 e Artigo 566 do Código Civil Brasileiro)",
            `Permitido realizar reformas: ${dados.locatarioReforma === "S" ? "Sim" : "Não"}`,
            dados.locatarioReforma === "S" ? `Condições: ${dados.quaiCondicoes}` : "",
            `Manutenções obrigatórias: ${dados.locatarioManu}`,
            `Restrições de uso: ${dados.restricoesUso}`,
        ]);

        addSection("CLÁUSULA 10 - DESPESAS E TRIBUTOS", [
            "(Artigos 22 e 23 da Lei do Inquilinato - Lei 8.245/91 e Artigos 567 e 568 do Código Civil Brasileiro)",
            `Despesas do locatário: ${dados.despesasLocatario}`,
            `Despesas do locador: ${dados.despesasLocador}`,
        ]);

        addSection("CLÁUSULA 11 - RESCISÃO DO CONTRATO", [
            "(Artigos 4, 9 e 46 da Lei do Inquilinato - Lei 8.245/91 e Artigos 571 e 574 do Código Civil Brasileiro)",
            `Condições para rescisão: ${dados.condicoes}`,
            `Multas e penalidades: ${dados.multasEpenalidades}`,
            `Prazo para notificação: ${dados.prazo} dias`,
        ]);

        addSection("CLÁUSULA 12 - DISPOSIÇÕES GERAIS", [
            "(Artigos 421 e 425 do Código Civil Brasileiro)",
            `Foro eleito: ${dados.foroeleito}`,
            `Testemunhas presentes: ${dados.testemunhas === "S" ? "Sim" : "Não"}`,
            dados.testemunhas === "S" ? `Testemunha 1: ${dados.nomeTest1}, CPF: ${dados.cpfTest1}` : "",
            dados.testemunhas === "S" ? `Testemunha 2: ${dados.nomeTest2}, CPF: ${dados.cpfTest2}` : "",
            `Registro em cartório: ${dados.registroCartorio === "S" ? "Sim" : "Não"}`,
        ]);

        // Assinaturas
        addSection("ASSINATURAS", [
            "Local e Data: ______________________________________________",
            "",
            "Locador: _________________________________________________",
            "",
            "Locatário: _______________________________________________",
        ]);

        const pdfDataUri = doc.output("datauristring");
        setPdfDataUrl(pdfDataUri);
    }

    useEffect(() => {
        geradorImovelResidencial({ ...formData })
    }, [formData])


    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title">Contrato de Locação de Imóvel Residencial</h1>
            </div>
            <div className="container">
                <div className="left-panel">
                    <div className="scrollable-card">
                        <div className="progress-bar">
                            <div
                                className="progress-bar-inner"
                                style={{ width: `${(step / 79) * 100}%` }}
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
                                        <label>Tipo de imóvel (apartamento, casa, etc.)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="tipoImóvel"
                                            onChange={handleChange}
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
                                        <label>Área total (em metros quadrados)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="areaTotal"
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
                                        <label>Número de cômodos (quartos, banheiros, salas, cozinha, etc.)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="numeroComodos"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 29 && (
                                <>
                                    <h2>Descrição do Imóvel</h2>
                                    <div>
                                        <label>Vaga de garagem?</label>
                                        <select name='vagaGaragem' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 30 && (
                                <>
                                    <h2>Descrição do Imóvel</h2>
                                    <div>
                                        <label>Mobília inclusa ?</label>
                                        <select name='mobilia' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 31 && (
                                <>
                                    <h2>Destinação do Imóvel</h2>
                                    <div>
                                        <label>O imóvel será utilizado exclusivamente para fins residenciais?</label>
                                        <select name='finsResidenciais' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {finsResidenciais && (
                                <>
                                    {step === 32 && (
                                        <>
                                            <h2>Descrição do Imóvel</h2>
                                            <div>
                                                <label>Número de cômodos (quartos, banheiros, salas, cozinha, etc.)</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="qualFim"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}


                            {step === 33 && (
                                <>
                                    <h2>Prazo da Locação</h2>
                                    <div>
                                        <label>Data de início da locação</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="dataInicioLocacao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 34 && (
                                <>
                                    <h2>Prazo da Locação</h2>
                                    <div>
                                        <label>Duração do contrato (em meses)</label>
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

                            {step === 35 && (
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
                                    {step === 36 && (
                                        <>
                                            <h2>Prazo Da Locação</h2>
                                            <div>
                                                <label>Quais são as condições?</label>
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


                            {step === 37 && (
                                <>
                                    <h2>Valor do Aluguel e Forma de Pagamento</h2>
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

                            {step === 38 && (
                                <>
                                    <h2>Valor do Aluguel e Forma de Pagamento</h2>
                                    <div>
                                        <label>Data de vencimento mensal</label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="dataVencMensal"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 39 && (
                                <>
                                    <h2>Valor do Aluguel e Forma de Pagamento</h2>
                                    <div>
                                        <label>Forma de pagamento (depósito bancário, boleto, Pix, etc.)</label>
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

                            {step === 40 && (
                                <>
                                    <h2>Valor do Aluguel e Forma de Pagamento</h2>
                                    <div>
                                        <label>Multa por atraso no pagamento</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="multaAtraso"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 41 && (
                                <>
                                    <h2>Valor do Aluguel e Forma de Pagamento</h2>
                                    <div>
                                        <label>Juros aplicáveis em caso de atraso</label>
                                        <input
                                            type='text'
                                            placeholder='porcentagem.ex.: 1% mês'
                                            name="jurosAplicaveis"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 42 && (
                                <>
                                    <h2>Valor do Aluguel e Forma de Pagamento</h2>
                                    <div>
                                        <label>O valor do aluguel sofrerá reajuste ao longo do tempo?</label>
                                        <select name='teraReajuste' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {reajuste && (
                                <>
                                    {step === 43 && (
                                        <>
                                            <h2>Valor do Aluguel e Forma de Pagamento</h2>
                                            <div>
                                                <label>Periodicidade do reajuste (anual, bienal, etc.)?</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="periodoReajuste"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}


                            {step === 44 && (
                                <>
                                    <h2>Valor do Aluguel e Forma de Pagamento</h2>
                                    <div>
                                        <label>Índice de reajuste a ser utilizado (IGP-M, IPCA,IVAR etc.)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="indiceReajuste"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 45 && (
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
                                    {step === 46 && (
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
                                    {step === 47 && (
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

                                    {step === 48 && (
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

                                    {step === 49 && (
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

                                    {step === 50 && (
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

                                    {step === 51 && (
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

                                    {step === 52 && (
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

                                    {step === 53 && (
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

                                    {step === 54 && (
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

                                    {step === 55 && (
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
                                    {step === 56 && (
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
                                    {step === 57 && (
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
                                    {step === 58 && (
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
                                    {step === 59 && (
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


                            {step === 60 && (
                                <>
                                    <h2>Obrigações do Locador</h2>
                                    <div>
                                        <label>O locador se responsabiliza por quais manutenções ou reparos? </label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="locadorManuRep"
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
                                    <h2>Obrigações do Locador</h2>
                                    <div>
                                        <label>O locador fornecerá algum serviço adicional (ex.: segurança, limpeza das áreas comuns)? </label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="locadorServAdicional"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 62 && (
                                <>
                                    <h2>Obrigações do Locatário</h2>
                                    <div>
                                        <label>O locatário pode realizar reformas ou modificações no imóvel?</label>
                                        <div>
                                            <select name='locatarioReforma' onChange={handleChange}>
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


                            {locatarioReforma && (
                                <>
                                    {step === 63 && (
                                        <>
                                            <h2>Obrigações do Locatário</h2>
                                            <div>
                                                <label>Quais são as condições?</label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="quaiCondicoes"
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
                                    <h2>Obrigações do Locatário</h2>
                                    <div>
                                        <label>O locatário é responsável por quais manutenções? </label>
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

                            {step === 65 && (
                                <>
                                    <h2>Obrigações do Locatário</h2>
                                    <div>
                                        <label>Há restrições quanto ao uso do imóvel? </label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="restricoesUso"
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
                                    <h2>Despesas e Tributos</h2>
                                    <div>
                                        <label>Quais despesas são de responsabilidade do locatário? (IPTU, contas de água, luz, condomínio, etc.) </label>
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

                            {step === 67 && (
                                <>
                                    <h2>Despesas e Tributos</h2>
                                    <div>
                                        <label>Quais despesas são de responsabilidade do locador? </label>
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


                            {step === 68 && (
                                <>
                                    <h2>Recisão do Contrato</h2>
                                    <div>
                                        <label>Condições para rescisão antecipada por ambas as partes</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="condicoes"
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
                                    <h2>Recisão do Contrato</h2>
                                    <div>
                                        <label>Multas ou penalidades aplicáveis em caso de rescisão antecipada</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="multasEpenalidades"
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
                                    <h2>Recisão do Contrato</h2>
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

                            {step === 71 && (
                                <>
                                    <h2>Direito de Preferência</h2>
                                    <div>
                                        <label>Em caso de venda do imóvel, o locatário terá direito de preferência para compra? </label>
                                        <div>
                                            <select name='preferenciaLocatario' onChange={handleChange}>
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

                            {preferenciaLocatario && (
                                <>
                                    {step === 72 && (
                                        <>
                                            <h2>Direito de Preferência</h2>
                                            <div>
                                                <label>Condições para exercício desse direito</label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="condicoesPrefe"
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
                    <button className='btnBaixarPdf' onClick={() => { geradorImovelResidencialPDF(formData) }}>
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