'use client'
import Pilha from '@/lib/pilha';
import { verificarValor, verificarValorEspecial } from '@/lib/utils';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';
import geradorLocacaoResiPago from '../util/pdf';



const locacaoimovelresidencialtemposchema = z.object({
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


    /** PRAZO DA LOCAÇÃO **/
    dataInicioLocacao: z.string(),
    dataTerminoLocacao: z.string(),
    horaInicial: z.string(),
    horaFinal: z.string(),
    possibilidadeRenovacao: z.enum(['S', 'N']),
    quaisCondicoes: z.string(),
    /**********/

    /**VALOR DO ALUGUEL E FORMA DE PAGAMENTO */
    valorMensal: z.string(),
    dataVencMensal: z.string(),
    sinalAdiantamento: z.enum(['S', 'N']),
    //se sim
    valorSinal: z.string(),
    dataPagSinal: z.string(),

    formaPagamento: z.string(),
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

    /**DESPESAS E TRIBUTOS */
    despesasAluguel: z.string(),
    despesasAdicionais: z.enum(['S', 'N']),
    quaisDespesas: z.string(),
    /*** */

    /** OBRIGAÇÕES DO LOCADOR **/
    locadorUsoELimpeza: z.string(),
    locadorRoupaCama: z.string(),
    locadorManu: z.string(),
    limitePessoas: z.string(),
    multaPorPessoa: z.string(),
    /******/

    /**OBRIGAÇÕES DO LOCATÁRIO */
    finsResidenciais: z.enum(['S', 'N']),

    //se sim
    qualFim: z.string(),

    responsaLocatario: z.enum(['S', 'N']),
    permiteFumar: z.enum(['S', 'N']),
    animais: z.enum(['S', 'N']),
    condominio: z.enum(['S', 'N']),
    /****** */



    /**RESCISÃO DO CONTRATO */
    condicoes: z.string(),
    multasEpenalidades: z.string(),
    reembolso: z.string(),
    prazo: z.string(),
    /** */



    /**DISPOSIÇÃO GERAL */
    foroeleito: z.string(),
    testemunhas: z.enum(['S', 'N']),
    nomeTest1: z.string(),
    nomeTest2: z.string(),
    cpfTest1: z.string(),
    cpfTest2: z.string(),

    registroCartorio: z.enum(['S', 'N']),
    /** */

});

type FormData = z.infer<typeof locacaoimovelresidencialtemposchema>


export default function LocacaoImovelResidencialPorTemp() {
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
    const [finsResidenciais, setFinsResidenciais] = useState(false);
    const [renovacao, setRenovacao] = useState(false);

    const [garantia, setGarantia] = useState(false);
    const [fiador, setFiador] = useState(false);
    const [caucaoDep, setCaucaoDep] = useState(false);
    const [caucaoBemIM, setCaucaoBemIM] = useState(false);
    const [titulos, setTitulos] = useState(false);
    const [seguroFi, setSeguroFi] = useState(false);

    const [Testemunhas, setTestemunhas] = useState(false);
    const [sinalAdiantamento, setSinalAdiantamento] = useState(false);
    const [despesasAdicionais, setDespesasAdicionais] = useState(false);
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
                description: `Contrato de Locação de Imóvel Residencial para Temporada`,
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
            nextStep = 36
        } else if (currentStepData.possibilidadeRenovacao === 'N') {
            nextStep = 37;
        }

        if (currentStepData.possibilidadeRenovacao === 'S') {
            setSinalAdiantamento(true);
            nextStep = 43;
        } else if (currentStepData.possibilidadeRenovacao === 'N') {
            nextStep = 44;
        }


        if (currentStepData.garantia === 'S') {
            setGarantia(true);
            nextStep = 45;
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



        if (currentStepData.despesasAdicionais === 'S') {
            setDespesasAdicionais(true);
            nextStep = 62;
        } else if (currentStepData.despesasAdicionais === 'N') {
            nextStep = 63;
        }

        if (currentStepData.finsResidenciais === 'S') {
            setFinsResidenciais(true);
            nextStep = 68;
        } else if (currentStepData.finsResidenciais === 'N') {
            nextStep = 69;
        }


        if (currentStepData.testemunhas === 'S') {
            setTestemunhas(true);
            nextStep = 79;
        } else if (currentStepData.testemunhas === 'N') {
            nextStep = 83;
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

    const handleBack = () => {
        setStep(pilha.current.desempilhar());
    }


    const geradorLocacaoResiPorTemp = (dados: any) => {
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
        doc.text("CONTRATO DE LOCAÇÃO DE IMÓVEL RESIDENCIAL POR TEMPORADA", 105, posY, { align: "center" });
        posY += 15;

        addSection("CLÁUSULA 1 - IDENTIFICAÇÃO DAS PARTES", [
            "Conforme o artigo 2º da Lei 8.245/1990, o locador é aquele que cede o uso do imóvel mediante remuneração e o locatário é aquele que recebe o imóvel para uso, sendo necessário constar seus dados de identificação no contrato.",
            `Locador: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.nomeLocador) : verificarValor(dados.razaoSocial)}`,
            `CPF/CNPJ: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.CPFLocador) : verificarValor(dados.cnpjlocador)}`,
            `Endereço: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.enderecoLocador) : verificarValor(dados.enderecoCNPJ)}`,
            `Telefone: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.telefoneLocador) : verificarValor(dados.telefoneCNPJ)}`,
            `E-mail: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.emailLocador) : verificarValor(dados.emailCNPJ)}`,
            verificarValor(dados.locador) === "pj" ? `Representante Legal: ${verificarValor(dados.nomeRepresentanteCNPJ)}, CPF: ${verificarValor(dados.CPFRepresentanteCNPJ)}` : "",
            "",
            `Locatário: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.nomelocatario) : verificarValor(dados.razaoSociallocatario)}`,
            `CPF/CNPJ: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.CPFlocatario) : verificarValor(dados.cpflocatario)}`,
            `Endereço: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.enderecolocatario) : verificarValor(dados.enderecolocatarioCNPJ)}`,
            `Telefone: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.telefonelocatario) : verificarValor(dados.telefonelocatarioCNPJ)}`,
            `E-mail: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.emaillocatario) : verificarValor(dados.emaillocatarioCNPJ)}`,
            verificarValor(dados.locatario) === "pj" ? `Representante Legal: ${verificarValor(dados.nomeRepresentantelocatarioCNPJ)}, CPF: ${verificarValor(dados.CPFRepresentantelocatarioCNPJ)}` : "",
        ]);

        addSection("CLÁUSULA 2 - DESCRIÇÃO DO IMÓVEL", [
            `Conforme o artigo 48 da Lei nº 8.245/1991, esta locação é destinada à residência temporária por prazo não superior a 90 dias.`,
            `Endereço: ${verificarValor(dados.enderecoImovel)}`,
            `Tipo de Imóvel: ${verificarValor(dados.tipoImóvel)}`,
            `Área Total: ${verificarValor(dados.areaTotal)} m²`,
            `Número de Cômodos: ${verificarValor(dados.numeroComodos)}`,
            `Vaga de Garagem: ${verificarValor(dados.vagaGaragem) === "S" ? "Sim" : "Não"}`,
            `Mobília: ${verificarValor(dados.mobilia) === "S" ? "Sim" : "Não"}`
        ]);

        addSection("CLÁUSULA 3 - PRAZO DA LOCAÇÃO", [
            `O aluguel será pago conforme estipulado entre as partes, respeitando o artigo 49 da Lei nº 8.245/1991.`,
            `Início: ${verificarValor(dados.dataInicioLocacao)} às ${verificarValor(dados.horaInicial)}`,
            `Término: ${verificarValor(dados.dataTerminoLocacao)} às ${verificarValor(dados.horaFinal)}`,
            `Possibilidade de Renovação: ${verificarValor(dados.possibilidadeRenovacao) === "S" ? "Sim" : "Não"}`,
            `Condições de Renovação: ${verificarValor(dados.quaisCondicoes)}`
        ]);

        addSection("CLÁUSULA 4 - VALOR DO ALUGUEL E FORMA DE PAGAMENTO", [
            `Conforme o artigo 50 da Lei nº 8.245/1991, findo o prazo da locação, o locatário deve restituir o imóvel imediatamente, sob pena de despejo.`,
            `Valor Mensal: R$ ${verificarValor(dados.valorMensal)}`,
            `Vencimento Mensal: ${verificarValor(dados.dataVencMensal)}`,
            `Sinal/Adiantamento: ${verificarValor(dados.sinalAdiantamento) === "S" ? `Sim, valor: R$ ${verificarValor(dados.valorSinal)}, pago em: ${verificarValor(dados.dataPagSinal)}` : "Não"}`,
            `Forma de Pagamento: ${verificarValor(dados.formaPagamento)}`,
            `Multa por Atraso: ${verificarValor(dados.multaAtraso)}%`,
            `Juros Aplicáveis: ${verificarValor(dados.jurosAplicaveis)}%`
        ]);

        addSection("CLÁUSULA 5 - GARANTIAS", [
            "Conforme o artigo 37 da Lei 8.245/1990, qualquer das garantias exigidas para a locação deve constar no contrato, sendo vedada a exigência de mais de uma modalidade para o mesmo contrato.",
            `Garantia: ${verificarValor(dados.garantia) === "S" ? "Sim" : "Não"}`,
            verificarValor(dados.garantia) === "S" ? `Tipo de Garantia: ${verificarValor(dados.qualgarantidor)}` : "",
            verificarValor(dados.qualgarantidor) === "fi" ? `Fiador: ${verificarValor(dados.nomeFiador)}, CPF: ${verificarValor(dados.cpfFiador)}, Endereço: ${verificarValor(dados.enderecoFiador)}` : "",
            verificarValor(dados.qualgarantidor) === "caudep" ? `Valor Título de Caução: R$ ${verificarValor(dados.valorTitCaucao)}` : "",
            verificarValor(dados.qualgarantidor) === "caubem" ? `Descrição do Bem em Caução: ${verificarValor(dados.descBemCaucao)}` : "",
            verificarValor(dados.qualgarantidor) === "ti" ? `Título de Crédito Utilizado: ${verificarValor(dados.descCredUtili)}` : "",
            verificarValor(dados.qualgarantidor) === "segfianca" ? `Seguro-Fiança: ${verificarValor(dados.segFianca)}` : ""
        ]);

        addSection("CLÁUSULA 6 - OBRIGAÇÕES DO LOCADOR", [
            `Garantir o uso pacífico do imóvel conforme o artigo 22 da Lei nº 8.245/1991.`,
            `Realizar reparos estruturais que não sejam de responsabilidade do locatário.`,
            `Uso e Limpeza: ${verificarValor(dados.locadorUsoELimpeza)}`,
            `Fornecimento de Roupas de Cama: ${verificarValor(dados.locadorRoupaCama)}`,
            `Manutenção: ${verificarValor(dados.locadorManu)}`,
            `Limite de Pessoas: $verificarValor({dados.limitePessoas)}, Multa por Excedente: R$ ${verificarValor(dados.multaPorPessoa)}`
        ]);

        addSection("CLÁUSULA 7 - OBRIGAÇÕES DO LOCATÁRIO", [
            `Zelar pelo imóvel e devolvê-lo no estado em que recebeu, conforme artigo 23 da Lei nº 8.245/1991.`,
            `Não realizar modificações sem consentimento prévio do locador.`,
            `Uso apenas para fins residenciais: ${verificarValor(dados.finsResidenciais) === "S" ? "Sim" : "Não"}`,
            `Outros fins especificados: ${verificarValor(dados.qualFim)}`,
            `Responsabilidade por danos: ${verificarValor(dados.responsaLocatario) === "S" ? "Sim" : "Não"}`,
            `Permite Fumar: ${verificarValor(dados.permiteFumar) === "S" ? "Sim" : "Não"}`,
            `Animais Permitidos: ${verificarValor(dados.animais) === "S" ? "Sim" : "Não"}`
        ]);

        addSection("CLÁUSULA 8 - RESCISÃO DO CONTRATO", [
            "De acordo com o artigo 4º da Lei 8.245/1990, o locatário poderá devolver o imóvel antes do prazo contratual, desde que pague a multa estipulada, salvo nos casos previstos por lei.",
            `Condições para cancelamento: ${verificarValor(dados.condicoes)}`,
            `Política de reembolso: ${verificarValor(dados.reembolso)}`,
            `Multas/Penalidades: ${verificarValor(dados.multasEpenalidades)}`,
            `Prazo para notificação: ${verificarValor(dados.prazo)}`
        ]);

        addSection("CLÁUSULA 9 - DISPOSIÇÕES GERAIS", [
            "Nos termos do artigo 41 da Lei 8.245/1990, qualquer alteração no contrato deve ser feita por escrito e assinada por ambas as partes.",
            `Foro eleito: ${verificarValor(dados.foroeleito)}`,
            `Registro em cartório: ${verificarValor(dados.registroCartorio) === "S" ? "Sim" : "Não"}`
        ]);

        addSection("CLÁUSULA 10 - ASSINATURAS", [
            "Assinam o presente contrato as partes envolvidas, em duas vias de igual teor e forma.",
            "Conforme o artigo 5º da Lei 8.245/1990, o contrato de locação pode ser firmado por escrito e conter cláusulas específicas que protejam os direitos de ambas as partes."
        ]);

        doc.text("Locador:", marginX, posY);
        posY += 10;
        doc.text("_______________________________", marginX, posY);
        posY += 5;
        doc.text(`${verificarValorEspecial(dados.locador) === "pf" ? verificarValorEspecial(dados.nomeLocador) : verificarValorEspecial(dados.razaoSocial)}`, marginX, posY);
        posY += 15;

        doc.text("Locatário:", marginX, posY);
        posY += 10;
        doc.text("_______________________________", marginX, posY);
        posY += 5;
        doc.text(`${verificarValorEspecial(dados.locatario) === "pf" ? verificarValorEspecial(dados.nomelocatario) : verificarValorEspecial(dados.razaoSociallocatario)}`, marginX, posY);
        posY += 15;

        if (dados.testemunhas === "S") {
            addSection("TESTEMUNHAS", [
                "As testemunhas abaixo assinam para validar este contrato."
            ]);

            doc.text("Testemunha 1:", marginX, posY);
            posY += 10;
            doc.text("_______________________________", marginX, posY);
            posY += 5;
            doc.text(`${verificarValorEspecial(dados.nomeTest1)} - CPF: ${verificarValorEspecial(dados.cpfTest1)}`, marginX, posY);
            posY += 15;

            doc.text("Testemunha 2:", marginX, posY);
            posY += 10;
            doc.text("_______________________________", marginX, posY);
            posY += 5;
            doc.text(`${verificarValorEspecial(dados.nomeTest2)} - CPF: ${verificarValorEspecial(dados.cpfTest2)}`, marginX, posY);
        }


        const pdfDataUri = doc.output("datauristring");
        setPdfDataUrl(pdfDataUri);
    }

    useEffect(() => {
        geradorLocacaoResiPorTemp({ ...formData })
    }, [formData])


    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title">Contrato de Locação de Imóvel Residencial para Temporada</h1>
            </div>
            <div className="container">
                <div className="left-panel">
                    <div className="scrollable-card">
                        <div className="progress-bar">
                            <div
                                className="progress-bar-inner"
                                style={{ width: `${(step / 83) * 100}%` }}
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
                                    <h2>Prazo da Locação</h2>
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

                            {step === 32 && (
                                <>
                                    <h2>Prazo da Locação</h2>
                                    <div>
                                        <label>Data de término da locação</label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="dataTerminoLocacao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 33 && (
                                <>
                                    <h2>Prazo da Locação</h2>
                                    <div>
                                        <label>Horário de entrada (check-in) da locação</label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="horaInicial"
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
                                        <label>Horário de saída (check-out) da locação</label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="horaFinal"
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
                                    <h2>Prazo Da Locação</h2>
                                    <div>
                                        <label>Exigência de sinal ou adiantamento?</label>

                                        <select name='sinalAdiantamento' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {sinalAdiantamento && (
                                <>
                                    {step === 43 && (
                                        <>
                                            <h2>Valor do Aluguel e Forma de Pagamento</h2>
                                            <div>
                                                <label>Valor do Sinal ou adiantamento</label>
                                                <input
                                                    type='text'
                                                    placeholder='ex.:500,00,1.000,10.000...'
                                                    name="valorSinal"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 44 && (
                                        <>
                                            <h2>Valor do Aluguel e Forma de Pagamento</h2>
                                            <div>
                                                <label>Data de pagamento</label>
                                                <input
                                                    type='date'
                                                    placeholder=''
                                                    name="dataPagSinal"
                                                    onChange={handleChange}
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
                                    <h2>Despesas Inclusas</h2>
                                    <div>
                                        <label>Quais despesas estão inclusas no valor do aluguel? (ex.: água, luz, gás, internet)</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="despesasAluguel"
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
                                    <h2>Despesas Inclusas</h2>
                                    <div>
                                        <label>Há despesas adicionais que serão cobradas separadamente?</label>
                                        <div>
                                            <select name='despesasAdicionais' onChange={handleChange}>
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

                            {despesasAdicionais && (
                                <>
                                    {step === 62 && (
                                        <>
                                            <h2>Despesas Inclusas</h2>
                                            <div>
                                                <label>Quais?</label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="quaisDespesas"
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


                            {step === 63 && (
                                <>
                                    <h2>Obrigações do Locador</h2>
                                    <div>
                                        <label>O locador se responsabiliza por entregar o imóvel em boas condições de uso e limpeza?</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="locadorUsoELimpeza"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 64 && (
                                <>
                                    <h2>Obrigações do Locador</h2>
                                    <div>
                                        <label>O locador fornecerá roupas de cama, banho e utensílios domésticos?</label>
                                        <div>
                                            <select name='locadorRoupaCama' onChange={handleChange}>
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

                            {step === 65 && (
                                <>
                                    <h2>Obrigações do Locador</h2>
                                    <div>
                                        <label>O locador se responsabiliza por manutenções emergenciais durante o período de locação?</label>
                                        <div>
                                            <select name='locadorManu' onChange={handleChange}>
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

                            {step === 65 && (
                                <>
                                    <h2>Obrigações do Locador</h2>
                                    <div>
                                        <label>Qual é o limite de pessoas que se hospedarão ?</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="limitePessoas"
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
                                    <h2>Obrigações do Locador</h2>
                                    <div>
                                        <label>Se ultrapassar o limite, qual será o valor da multa por pessoa excendente? </label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="multaPorPessoa"
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
                                    <h2>Obrigações do Locatário</h2>
                                    <div>
                                        <label>O locatário deve utilizar o imóvel apenas para fins residenciais durante o período de locação?</label>
                                        <div>
                                            <select name='finsResidenciais' onChange={handleChange}>
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

                            {finsResidenciais && (
                                <>
                                    {step === 68 && (
                                        <>
                                            <h2>Obrigações do Locatário</h2>
                                            <div>
                                                <label>Utilizará para qual fim ?</label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="qualFim"
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

                            {step === 69 && (
                                <>
                                    <h2>Obrigações do Locatário</h2>
                                    <div>
                                        <label>O locatário é responsável por danos causados ao imóvel ou aos itens fornecidos?</label>
                                        <div>
                                            <select name='responsaLocatario' onChange={handleChange}>
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

                            {step === 70 && (
                                <>
                                    <h2>Obrigações do Locatário</h2>
                                    <div>
                                        <label>É permitido fumar no interior do imóvel?</label>
                                        <div>
                                            <select name='permiteFumar' onChange={handleChange}>
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

                            {step === 71 && (
                                <>
                                    <h2>Obrigações do Locatário</h2>
                                    <div>
                                        <label>São permitidos animais de estimação?</label>
                                        <div>
                                            <select name='animais' onChange={handleChange}>
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

                            {step === 72 && (
                                <>
                                    <h2>Obrigações do Locatário</h2>
                                    <div>
                                        <label>O locatário deve respeitar as regras do condomínio (se aplicável)? </label>
                                        <div>
                                            <select name='condominio' onChange={handleChange}>
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

                            {step === 73 && (
                                <>
                                    <h2>Rescisão do Contrato</h2>
                                    <div>
                                        <label>Condições para cancelamento da reserva por ambas as partes </label>
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
                            {step === 74 && (
                                <>
                                    <h2>Rescisão do Contrato</h2>
                                    <div>
                                        <label>Política de reembolso em caso de cancelamento antecipado </label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="reembolso"
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
                                    <h2>Rescisão do Contrato</h2>
                                    <div>
                                        <label>Multas ou penalidades aplicáveis em caso de descumprimento do contrato </label>
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

                            {step === 76 && (
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

                            {step === 77 && (
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

                            {step === 78 && (
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
                                    {step === 79 && (
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

                                    {step === 80 && (
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

                                    {step === 81 && (
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

                                    {step === 82 && (
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

                            {step === 83 && (
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

                            {step === 84 && (
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
                    <button className='btnBaixarPdf' onClick={() => { geradorLocacaoResiPago(formData) }}>
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