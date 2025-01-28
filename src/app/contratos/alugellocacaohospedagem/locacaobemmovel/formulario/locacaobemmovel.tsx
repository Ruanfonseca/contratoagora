'use client'
import { verificarValor } from '@/lib/utils';
import api from '@/services';
import axios from 'axios';
import jsPDF from "jspdf";
import { useEffect, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';
import gerarContratoLocacaoBemMovelPago from '../util/pdf';


const locacaobemMovelschema = z.object({
    locador: z.enum(['pf', 'pj']).default('pf'),

    /**
     * Dados Locador pj
     */
    razaoSocial: z.string(),
    cnpj: z.string(),
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
    cnpjLocatario: z.string(),
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

    /** Descrição do Equipamento */
    tipodeequipamento: z.string(),
    marcaemodelo: z.string(),
    numerodeserie: z.string(),
    estadoconservacao: z.string(),
    acessorioscomponentes: z.string(),
    /** */

    /** Prazo da Locação */
    dataInicioLocacao: z.string(),
    dataTerminoLocacao: z.string(),
    possibilidadeRenovacao: z.enum(['S', 'N']),
    condicao: z.string(),
    /** */

    /** Valor e Condições de Pagamento */
    valorTotalLocacao: z.string(),
    formaPagamento: z.enum(['Pix', 'Dinheiro', 'Cartão', 'Boleto', 'Parcelado']),
    dataVencimentoParcela: z.string(),
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
    /** */

    /** Obrigações do Locador */
    entregaEquipLocador: z.enum(['Sim', 'Não']),
    garantiaManutencao: z.enum(['Sim', 'Não']),
    forneceraSuporte: z.enum(['Sim', 'Não']),
    quaisCondicoes: z.string(),
    /** */

    /** Obrigações do Locatario */
    compromeUso: z.enum(['Sim', 'Não']),
    danosUso: z.enum(['Sim', 'Não']),
    restricoesLocal: z.enum(['Sim', 'Não']),
    arcarCustos: z.enum(['Sim', 'Não']),
    /** */

    /** Devolução do Equipamento */
    local: z.string(),
    condicoesDevolucao: z.string(),
    procedimentoInspec: z.string(),
    penalidades: z.string(),
    /** */

    /** Rescisão do Contrato */
    condicoesRescisao: z.string(), // Condições para rescisão antecipada
    multasRescisao: z.string(), // Multas ou penalidades aplicáveis
    prazoNotificacaoRescisao: z.string(), // Prazo para notificação prévia de rescisão
    /** */

    /**Disposições Gerais */
    foroResolucaoConflitos: z.string(), // Foro eleito para resolução de conflitos
    testemunhasNecessarias: z.enum(['Sim', 'Não']), // Necessidade de testemunhas para assinatura do contrato
    //se sim 
    nomeTest1: z.string(),
    cpfTest1: z.string(),
    nomeTest2: z.string(),
    cpfTest2: z.string(),

    registroCartorio: z.enum(['Sim', 'Não']), // Indicação se o contrato será registrado em cartório 
    /** */
});

type FormData = z.infer<typeof locacaobemMovelschema>;

export default function LocacaobemMovel() {
    const [formData, setFormData] = useState<Partial<FormData>>({});
    const [currentStepData, setCurrentStepData] = useState<Partial<FormData>>({});
    const [step, setStep] = useState(1);

    const [locadorJuri, setLocadorJuri] = useState(false);
    const [locadorioJuri, setLocadorioJuri] = useState(false);
    const [possibilidadeRenovacao, setPossibilidadeRenovacao] = useState(false);
    const [Parcelado, setParcelado] = useState(false);
    const [garantia, setGarantia] = useState(false);
    const [fiador, setFiador] = useState(false);
    const [caucaoDep, setCaucaoDep] = useState(false);
    const [caucaoBemIM, setCaucaoBemIM] = useState(false);
    const [titulos, setTitulos] = useState(false);
    const [seguroFi, setSeguroFi] = useState(false);
    const [garantiaManutencao, setGarantiaManutencao] = useState(false);
    const [testemunhas, setTestemunhas] = useState(false);


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

    const handleNext = () => {
        setFormData((prev) => ({ ...prev, ...currentStepData }));

        let nextStep = step;

        if (currentStepData.locador === 'pj') {
            setLocadorJuri(true);
            nextStep = 7
        } else if (!locadorJuri && nextStep === 6) {
            nextStep = 14;
        }

        if (currentStepData.locatario === 'pj') {
            setLocadorioJuri(true);
            nextStep = 20
        } else if (!locadorioJuri && nextStep === 19) {
            nextStep = 26;
        }


        if (currentStepData.possibilidadeRenovacao === 'S') {
            setPossibilidadeRenovacao(true)
        } else if (currentStepData.possibilidadeRenovacao === 'N') {
            nextStep = 35;
        }


        if (currentStepData.formaPagamento === 'Parcelado') {
            setParcelado(true);
        } else if (currentStepData.formaPagamento === 'Pix') {
            nextStep = 40;
        } else if (currentStepData.formaPagamento === 'Dinheiro') {
            nextStep = 40;
        } else if (currentStepData.formaPagamento === 'Cartão') {
            nextStep = 40;
        } else if (currentStepData.formaPagamento === 'Boleto') {
            nextStep = 40;
        }

        if (currentStepData.garantia === 'S') {
            setGarantia(true);
        } else if (currentStepData.garantia === 'N') {
            nextStep = 55;
        }
        if (nextStep === 50) {
            nextStep = 55
        } else if (nextStep === 51) {
            nextStep = 55
        } else if (nextStep === 52) {
            nextStep = 55
        } else if (nextStep === 53) {
            nextStep = 55
        }

        switch (currentStepData.qualgarantidor) {
            case "fi":
                setFiador(true);
                break;
            case "caudep":
                setCaucaoDep(true);
                nextStep = 51;
                break;
            case "caubem":
                setCaucaoBemIM(true);
                nextStep = 52;
                break;
            case "ti":
                setTitulos(true);
                nextStep = 53;
                break;
            case "segfianca":
                setSeguroFi(true);
                nextStep = 54;
                break;
            default:
                break;
        }





        if (currentStepData.forneceraSuporte === 'Sim') {
            setGarantiaManutencao(true);
        } else if (currentStepData.forneceraSuporte === 'Não') {
            nextStep = 60;
        }




        if (currentStepData.testemunhasNecessarias === 'Sim') {
            setTestemunhas(true);
        } else if (currentStepData.testemunhasNecessarias === 'Não') {
            nextStep = 77
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCurrentStepData((prev) => ({ ...prev, [name]: value }));
    };


    const handleBack = () => setStep((prev) => prev - 1);



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





    const gerarContratoLocacaoBemMovel = (dados: any) => {
        const doc = new jsPDF();

        // Configuração inicial de fonte e margens
        const marginX = 10;
        const pageWidth = 190; // Largura máxima da área de texto
        let posY = 20;

        // Função auxiliar para adicionar cláusulas e ajustar a posição Y
        const addClause = (title: string, content: string[]) => {
            if (posY + 10 >= 280) {
                doc.addPage();
                posY = 20;
            }
            doc.setFontSize(12);
            doc.text(title, 105, posY, { align: "center" });
            posY += 10;
            doc.setFontSize(10);
            content.forEach((line) => {
                const wrappedText = doc.splitTextToSize(line, pageWidth);
                wrappedText.forEach((textLine: string) => {
                    if (posY + 10 >= 280) {
                        doc.addPage();
                        posY = 20;
                    }
                    doc.text(textLine, marginX, posY);
                    posY += 10; // Espaçamento entre as linhas
                });
            });
        };
        // Página 1 - Título
        doc.setFontSize(14);
        doc.text("CONTRATO DE LOCAÇÃO DE BENS MÓVEIS", 105, posY, { align: "center" });
        posY += 20;

        // Cláusula 1 - Identificação das Partes
        addClause("CLÁUSULA PRIMEIRA - IDENTIFICAÇÃO DAS PARTES", [
            "As partes abaixo qualificadas celebram o presente contrato de locação de bens móveis,\n conforme disposto no Código Civil Brasileiro (art. 104, que estabelece os requisitos de validade dos negócios jurídicos).",
            "O presente contrato segue os princípios de autonomia das partes e boa-fé, previstos nos arts. 421 e 422 do Código Civil.",
            dados.locador === "pj"
                ? `LOCADOR: Razão Social: ${verificarValor(dados.razaoSocial)}, CNPJ: ${verificarValor(dados.cnpj)}, \nEndereço: ${verificarValor(dados.enderecoCNPJ)}, Telefone: ${verificarValor(dados.telefoneCNPJ)}, E-mail: ${verificarValor(dados.emailCNPJ)}. Representante Legal: ${verificarValor(dados.nomeRepresentanteCNPJ)}, CPF: ${verificarValor(dados.CPFRepresentanteCNPJ)}.`
                : `LOCADOR: Nome: ${verificarValor(dados.nomeLocador)}, CPF: ${verificarValor(dados.CPFLocador)}, \nEndereço: ${verificarValor(dados.enderecoLocador)}, Telefone: ${verificarValor(dados.telefoneLocador)}, E-mail: ${verificarValor(dados.emailLocador)}.`,
            dados.locatario === "pj"
                ? `LOCATÁRIO: Razão Social: ${verificarValor(dados.razaoSociallocatario)}, CNPJ: ${verificarValor(dados.cnpjLocatario)}, \nEndereço: ${verificarValor(dados.enderecolocatarioCNPJ)}, Telefone: ${verificarValor(dados.telefonelocatarioCNPJ)}, E-mail: ${verificarValor(dados.emaillocatarioCNPJ)}. Representante Legal: ${verificarValor(dados.nomeRepresentantelocatarioCNPJ)}, CPF: ${verificarValor(dados.CPFRepresentantelocatarioCNPJ)}.`
                : `LOCATÁRIO: Nome: ${verificarValor(dados.nomelocatario)}, CPF: ${verificarValor(dados.CPFlocatario)}, \nEndereço: ${verificarValor(dados.enderecolocatario)}, Telefone: ${verificarValor(dados.telefonelocatario)}, E-mail: ${verificarValor(dados.emaillocatario)}.`,
        ]);
        posY += 20;

        // Cláusula 2 - Descrição do Equipamento
        addClause("CLÁUSULA SEGUNDA - DESCRIÇÃO DO EQUIPAMENTO", [
            "Os bens móveis objeto do presente contrato possuem as características descritas a seguir. \nAs partes concordam com a obrigação de conservar o bem conforme disposto no art. 566 do Código Civil:",
            "Art. 566: O locatário é obrigado a conservar o bem no estado em que foi entregue,\n salvo deterioração decorrente do uso legítimo.",
            `Tipo de Equipamento: ${verificarValor(dados.tipodeequipamento)}.`,
            `Marca/Modelo: ${verificarValor(dados.marcaemodelo)}.`,
            `Número de Série: ${verificarValor(dados.numerodeserie)}.`,
            `Estado de Conservação: ${verificarValor(dados.estadoconservacao)}.`,
            `Acessórios/Componentes: ${verificarValor(dados.acessorioscomponentes)}.`,
        ]);

        // Cláusula 3 - Vigência do Contrato
        addClause("CLÁUSULA TERCEIRA - VIGÊNCIA DO CONTRATO", [
            "O prazo de vigência do presente contrato será conforme especificado abaixo, em conformidade com\n o art. 565 do Código Civil Brasileiro, que regulamenta os contratos de locação:",
            "Art. 565: Na locação de coisa, uma das partes se obriga a ceder à outra, por tempo determinado ou não,\n o uso e gozo de coisa não fungível, mediante certa retribuição.",
            `Data de Início: ${verificarValor(dados.dataInicioLocacao)}.`,
            `Data de Término: ${verificarValor(dados.dataTerminoLocacao)}.`,
            `Renovação Automática: ${verificarValor(dados.possibilidadeRenovacao) === "S" ? "Sim" : "Não"}.`,
            `Condições para Renovação: ${verificarValor(dados.condicao)}.`,
        ]);
        posY += 20;

        // Cláusula 4 - Valor e Condições de Pagamento
        addClause("CLÁUSULA QUARTA - VALOR E CONDIÇÕES DE PAGAMENTO", [
            "As condições financeiras do contrato seguem os arts. 566 e 575 do Código Civil Brasileiro:",
            "Art. 566: O locatário é obrigado a conservar a coisa e a devolvê-la, finda a locação, \nno estado em que a recebeu, salvo deterioração pelo uso legítimo.",
            "Art. 575: Aplicável aos contratos de locação de bens móveis, estabelecendo a \npossibilidade de rescisão por falta de pagamento.",
            `Valor Total: R$ ${verificarValor(dados.valorTotalLocacao)}.`,
            `Forma de Pagamento: ${verificarValor(dados.formaPagamento)}.`,
            `Data de Vencimento das Parcelas: ${verificarValor(dados.dataVencimentoParcela)}.`,
            `Multa por Atraso: ${verificarValor(dados.multaPorAtrasoPagamento)}%.`,
            `Juros por Atraso: ${verificarValor(dados.jurosporatraso)}%.`,
        ]);

        // Cláusula 5 - Garantias
        addClause("CLÁUSULA QUINTA - GARANTIAS", [
            "As garantias para cumprimento das obrigações previstas neste contrato seguem as\n diretrizes do art. 566 e art. 578 do Código Civil Brasileiro:",
            "Art. 566: Obriga o locatário a devolver o bem no estado em que foi entregue.",
            "Art. 578: Permite às partes incluir garantias adicionais para proteger os direitos do locador.",
            verificarValor(dados.garantia) === "S"
                ? `As garantias do presente contrato são: ${verificarValor(dados.qualgarantidor)}.`
                : "Não foram exigidas garantias para este contrato.",
        ]);

        // Cláusula 6 - Obrigações do Locador
        addClause("CLÁUSULA SEXTA - OBRIGAÇÕES DO LOCADOR", [
            "O LOCADOR se compromete a cumprir as seguintes obrigações, em conformidade com o art. 569 do Código Civil Brasileiro:",
            "Art. 569: O locador é obrigado a entregar a coisa locada em estado de servir ao uso a que se destina, \nmantê-la nesse estado durante a locação e assegurar ao locatário o uso pacífico.",
            `a) Entregar o equipamento nas condições especificadas: ${verificarValor(dados.entregaEquipLocador)}.`,
            `b) Garantir a manutenção do equipamento, quando aplicável: ${verificarValor(dados.garantiaManutencao)}.`,
            `c) Fornecer suporte técnico ao LOCATÁRIO, quando necessário: ${verificarValor(dados.forneceraSuporte)}.`,
            `d) Outras condições estabelecidas no presente contrato: ${verificarValor(dados.quaisCondicoes)}.`,
        ]);
        // Cláusula 7 - Obrigações do Locatário
        addClause("CLÁUSULA SÉTIMA - OBRIGAÇÕES DO LOCATÁRIO", [
            "O LOCATÁRIO se compromete a cumprir as seguintes obrigações, em conformidade \ncom os arts. 566 e 575 do Código Civil Brasileiro:",
            "Art. 566: O locatário é obrigado a conservar o bem no estado em que foi entregue,\n salvo deterioração decorrente do uso legítimo.",
            "Art. 575: O locatário pode ser responsabilizado pela rescisão contratual em \ncaso de descumprimento de obrigações.",
            `a) Utilizar o equipamento exclusivamente para os fins contratados: ${verificarValor(dados.finalidadeUso)}.`,
            `b) Zelar pela conservação do equipamento durante a vigência do contrato.`,
            `c) Comunicar ao LOCADOR qualquer defeito ou problema técnico no equipamento.`,
            `d) Restituir o equipamento no estado em que foi recebido, salvo desgaste natural pelo uso.`,
        ]);

        // Cláusula 8 - Rescisão Contratual
        addClause("CLÁUSULA OITAVA - RESCISÃO CONTRATUAL", [
            "A rescisão do presente contrato observará as condições previstas nos arts.\n 472 e 475 do Código Civil Brasileiro:",
            "Art. 472: O distrato deve observar a mesma forma exigida para o contrato.",
            "Art. 475: Permite a resolução do contrato por inadimplemento de uma das partes.",
            `a) O contrato poderá ser rescindido por inadimplemento de qualquer das partes.`,
            `b) O LOCADOR poderá rescindir o contrato em caso de uso inadequado do equipamento pelo LOCATÁRIO.`,
            `c) O LOCATÁRIO poderá rescindir o contrato caso o equipamento apresente defeitos\n que impeçam seu uso e o LOCADOR não realize os reparos necessários.`,
            `d) Condições adicionais de rescisão: ${verificarValor(dados.condicoesRescisao)}.`,
        ]);

        // Cláusula 9 - Penalidades
        addClause("CLÁUSULA NONA - PENALIDADES", [
            "As partes estão sujeitas às penalidades previstas neste contrato e \nno Código Civil Brasileiro, em especial no art. 389 e seguintes:",
            "Art. 389: O devedor que não cumprir a obrigação será responsável por\n perdas e danos, mais juros e atualização monetária.",
            `a) Multa por rescisão antecipada: ${verificarValor(dados.multaRescisao)}%.`,
            `b) Multa por uso inadequado do equipamento: ${verificarValor(dados.multaUsoInadequado)}%.`,
            `c) Outras penalidades previstas: ${verificarValor(dados.outrasPenalidades)}.`,
        ]);

        // Cláusula 10 - Disposições Gerais
        addClause("CLÁUSULA DÉCIMA - DISPOSIÇÕES GERAIS", [
            "As disposições gerais seguem os princípios de boa-fé e autonomia da vontade das partes, \nconforme disposto nos arts. 421 e 422 do Código Civil Brasileiro:",
            "Art. 421: O contrato deve respeitar a função social e os princípios de liberdade contratual.",
            "Art. 422: Os contratantes são obrigados a guardar, assim na conclusão do contrato,\n como em sua execução, os princípios de probidade e boa-fé.",
            `a) Quaisquer alterações neste contrato deverão ser realizadas por escrito e assinadas pelas partes.`,
            `b) As partes declaram que leram e concordam com todas as cláusulas deste contrato.`,
            `c) Fica eleito o foro da comarca de ${verificarValor(dados.foroComarca)} para dirimir eventuais controvérsias decorrentes deste contrato.`,
        ]);

        posY += 40; // Espaço antes da área de assinatura

        // Cláusula 11 - Assinatura e Data
        addClause("CLÁUSULA DÉCIMA PRIMEIRA - ASSINATURA E DATA", [
            "Por estarem de acordo, as partes assinam o presente contrato em duas vias de igual teor e forma,\n na presença de duas testemunhas, conforme disposto no art. 219 do Código Civil Brasileiro:",
            "Art. 219: O instrumento particular, feito e assinado ou somente assinado por quem esteja obrigado, \nfaz prova contra o seu signatário.",
        ]);

        // Assinaturas
        if (posY + 40 >= 280) {
            doc.addPage();
            posY = 20;
        }
        posY += 20; // Espaço antes da área de assinatura

        // Espaço para assinatura do Locador
        doc.setFontSize(10);
        doc.text("__________________________", 60, posY);
        doc.text("Assinatura do LOCADOR", 60, posY + 5);

        // Espaço para assinatura do Locatário
        doc.text("__________________________", 140, posY);
        doc.text("Assinatura do LOCATÁRIO", 140, posY + 5);

        posY += 30; // Espaço para testemunhas, se existirem

        // Espaços para testemunhas, caso necessário
        if (verificarValor(dados.testemunhasNecessarias) === "Sim") {
            // Testemunha 1
            doc.text("__________________________", 60, posY);
            doc.text(`Testemunha 1: ${verificarValor(dados.nomeTest1)}`, 60, posY + 5);
            doc.text(`CPF: ${verificarValor(dados.cpfTest1)}`, 60, posY + 10);

            // Testemunha 2
            doc.text("__________________________", 140, posY);
            doc.text(`Testemunha 2: ${verificarValor(dados.nomeTest2)}`, 140, posY + 5);
            doc.text(`CPF: ${verificarValor(dados.cpfTest2)}`, 140, posY + 10);
        }

        // Salvar o PDF
        const pdfDataUri = doc.output("datauristring");
        setPdfDataUrl(pdfDataUri);
    };



    useEffect(() => {
        gerarContratoLocacaoBemMovel({ ...formData });
    }, [formData]);

    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title">Contrato de Locação de Bens Móveis</h1>

            </div>
            <div className="container">
                <div className="left-panel">
                    <div className="scrollable-card">

                        <div className="progress-bar">
                            <div
                                className="progress-bar-inner"
                                style={{ width: `${(step / 76) * 100}%` }}
                            ></div>
                        </div>
                        <div className="form-wizard">
                            {step === 1 && (
                                <>
                                    <h2>Dados do Responsável pelo Bem</h2>
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
                                    <h2>Dados do Responsável pelo Bem</h2>
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
                                    <h2>Dados do Responsável pelo Bem</h2>
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
                                    <h2>Dados do Responsável pelo Bem</h2>
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
                                    <h2>Dados do Responsável pelo Bem</h2>
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
                                    <h2>Dados do Responsável pelo Bem</h2>
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
                                            <h2>Dados do Responsável pelo Bem</h2>
                                            <div>
                                                <label>Razão Social</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="razaoSocial"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 8 && (
                                        <>
                                            <h2>Dados do Responsável pelo Bem</h2>
                                            <div>
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
                                    {step === 9 && (
                                        <>
                                            <h2>Dados do Responsável pelo Bem</h2>
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
                                    {step === 10 && (
                                        <>
                                            <h2>Dados do Responsável pelo Bem</h2>
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
                                    {step === 11 && (
                                        <>
                                            <h2>Dados do Responsável pelo Bem</h2>
                                            <div>
                                                <label>Email</label>
                                                <input
                                                    type='text'
                                                    placeholder='email@email.com'
                                                    name="emailCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 12 && (
                                        <>
                                            <h2>Dados do Responsável pelo Bem</h2>
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
                                    {step === 13 && (
                                        <>
                                            <h2>Dados do Responsável pelo Bem</h2>
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

                            {step === 14 && (
                                <>
                                    <h2>Dados do Locatário do Bem</h2>
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
                            {step === 15 && (
                                <>
                                    <h2>Dados do Locatário do Bem</h2>
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
                            {step === 16 && (
                                <>
                                    <h2>Dados do Locatário do Bem</h2>
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
                            {step === 17 && (
                                <>
                                    <h2>Dados do Locatário do Bem</h2>
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
                            {step === 18 && (
                                <>
                                    <h2>Dados do Locatário do Bem</h2>
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
                            {step === 19 && (
                                <>
                                    <h2>Dados do Locatário do Bem</h2>
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
                                    {step === 20 && (
                                        <>
                                            <h2>Dados do Locatário do Bem</h2>
                                            <div>
                                                <label>Razão Social</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="razaoSociallocatario"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 21 && (
                                        <>
                                            <h2>Dados do Locatário do Bem</h2>
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
                                    {step === 22 && (
                                        <>
                                            <h2>Dados do Locatário do Bem</h2>
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
                                    {step === 23 && (
                                        <>
                                            <h2>Dados do Locatário do Bem</h2>
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
                                    {step === 24 && (
                                        <>
                                            <h2>Dados do Locatário do Bem</h2>
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
                                    {step === 25 && (
                                        <>
                                            <h2>Dados do Locatário do Bem</h2>
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
                            {step === 26 && (
                                <>
                                    <h2>Descrição do Bem</h2>
                                    <div>
                                        <label>Qual é o tipo do Bem ?</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="tipodeequipamento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 27 && (
                                <>
                                    <h2>Descrição do Bem</h2>
                                    <div>
                                        <label>Qual é a Marca ou Modelo?</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="marcaemodelo"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 28 && (
                                <>
                                    <h2>Descrição do Bem</h2>
                                    <div>
                                        <label>Qual é o numero de série?</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="numerodeserie"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 29 && (
                                <>
                                    <h2>Descrição do Bem</h2>
                                    <div>
                                        <label>Estado de Conservação</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="estadoconservacao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 30 && (
                                <>
                                    <h2>Descrição do Bem</h2>
                                    <div>
                                        <label>Acessórios ou componentes adicionais incluídos</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="acessorioscomponentes"
                                            onChange={handleChange}
                                        />
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


                            {possibilidadeRenovacao && (
                                <>
                                    {step === 34 && (
                                        <>
                                            <h2>Prazo da Locação</h2>
                                            <div>
                                                <label>Quais são as condições?</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="condicao"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 35 && (
                                <>
                                    <h2>Valor e Condições de Pagamento</h2>
                                    <div>
                                        <label>Valor total da locação</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="valorTotalLocacao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 36 && (
                                <>
                                    <h2>Valor e Condições de Pagamento</h2>
                                    <div>
                                        <label>Forma de pagamento (à vista, parcelado, etc.)</label>
                                        <select name='formaPagamento' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="Pix">Pix</option>
                                            <option value="Dinheiro">Dinheiro</option>
                                            <option value="Cartão">Cartão</option>
                                            <option value="Boleto">Boleto</option>
                                            <option value="Parcelado">Parcelado</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {Parcelado && (
                                <>
                                    {step === 37 && (
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

                                    {step === 38 && (
                                        <>
                                            <h2>Valor e Condições de Pagamento</h2>
                                            <div>
                                                <label>Multa por atraso no pagamento</label>
                                                <input
                                                    type='text'
                                                    placeholder='Ex.: 2% mês , 1% ano , 2% dia'
                                                    name="dataVencimentoParcela"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 39 && (
                                        <>
                                            <h2>Valor e Condições de Pagamento</h2>
                                            <div>
                                                <label>Juros aplicáveis em caso de atraso</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
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

                            {step === 40 && (
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
                                    {step === 41 && (
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
                                    {step === 42 && (
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

                                    {step === 43 && (
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

                                    {step === 44 && (
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

                                    {step === 45 && (
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

                                    {step === 46 && (
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

                                    {step === 47 && (
                                        <>
                                            <h2>Dados do Fiador</h2>
                                            <div>
                                                <label>Documento do  Representante:</label>
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

                                    {step === 48 && (
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

                                    {step === 49 && (
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

                                    {step === 50 && (
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
                                    {step === 51 && (
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
                                    {step === 52 && (
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
                                    {step === 53 && (
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
                                    {step === 54 && (
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

                            {step === 55 && (
                                <>
                                    <h2>Obrigações do Locador</h2>
                                    <div>
                                        <label>O locador se responsabiliza pela entrega do equipamento em perfeito estado de funcionamento?  </label>
                                        <select name='entregaEquipLocador' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="Sim">Sim</option>
                                            <option value="Não">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>                                                        </div>

                                </>
                            )}

                            {step === 56 && (
                                <>
                                    <h2>Obrigações do Locador</h2>
                                    <div>
                                        <label>Há garantia para manutenção ou reparos durante o período de locação?</label>
                                        <select name='garantiaManutencao' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="Sim">Sim</option>
                                            <option value="Não">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>                                                        </div>

                                </>
                            )}


                            {step === 57 && (
                                <>
                                    <h2>Obrigações do Locador</h2>
                                    <div>
                                        <label>O locador fornecerá suporte técnico?</label>
                                        <select name='forneceraSuporte' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="Sim">Sim</option>
                                            <option value="Não">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>                                                        </div>

                                </>
                            )}

                            {garantiaManutencao && (
                                <>
                                    {step === 58 && (
                                        <>
                                            <h2>Obrigações do Locador</h2>
                                            <div>
                                                <label>Em quais condições? </label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="quaisCondicoes"
                                                        onChange={handleChange}
                                                    />
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>                                                        </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 59 && (
                                <>
                                    <h2>Obrigações do Locatário</h2>
                                    <div>
                                        <label>O locatário se compromete a utilizar o equipamento conforme as instruções fornecidas? </label>
                                        <div>
                                            <select name='compromeUso' onChange={handleChange}>
                                                <option value="">Selecione</option>
                                                <option value="Sim">Sim</option>
                                                <option value="Não">Não</option>
                                            </select>
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                                        </div>
                                    </div>
                                </>
                            )}
                            {step === 60 && (
                                <>
                                    <h2>Obrigações do Locatário</h2>
                                    <div>
                                        <label>O locatário é responsável por danos causados por uso inadequado? </label>
                                        <div>
                                            <select name='danosUso' onChange={handleChange}>
                                                <option value="">Selecione</option>
                                                <option value="Sim">Sim</option>
                                                <option value="Não">Não</option>
                                            </select>
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 61 && (
                                <>
                                    <h2>Obrigações do Locatário</h2>
                                    <div>
                                        <label>Há restrições quanto ao local de uso do equipamento? </label>
                                        <div>
                                            <select name='restricoesLocal' onChange={handleChange}>
                                                <option value="">Selecione</option>
                                                <option value="Sim">Sim</option>
                                                <option value="Não">Não</option>
                                            </select>
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 62 && (
                                <>
                                    <h2>Obrigações do Locatário</h2>
                                    <div>
                                        <label>O locatário deve arcar com custos de manutenção preventiva ou corretiva durante a locação?  </label>
                                        <div>
                                            <select name='arcarCustos' onChange={handleChange}>
                                                <option value="">Selecione</option>
                                                <option value="Sim">Sim</option>
                                                <option value="Não">Não</option>
                                            </select>
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 63 && (
                                <>
                                    <h2>Devolução do Equipamento</h2>
                                    <div>
                                        <label>Local para devolução do equipamento </label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="local"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 64 && (
                                <>
                                    <h2>Devolução do Equipamento</h2>
                                    <div>
                                        <label>Condições para devolução do equipamento</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="condicoesDevolucao"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 65 && (
                                <>
                                    <h2>Devolução do Equipamento</h2>
                                    <div>
                                        <label>Qual será o procedimento para inspeção do equipamento na devolução ?</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="procedimentoInspec"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 66 && (
                                <>
                                    <h2>Devolução do Equipamento</h2>
                                    <div>
                                        <label>Qual será as penalidades em caso de danos ou avarias identificadas ?</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="penalidades"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 67 && (
                                <>
                                    <h2>Rescisão do Contrato</h2>
                                    <div>
                                        <label>Qual será as condições para rescisão antecipada por ambas as partes ?</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="condicoesRescisao"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 68 && (
                                <>
                                    <h2>Rescisão do Contrato</h2>
                                    <div>
                                        <label>Qual será a Multa aplicável em caso de rescisão antecipada ?</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="multasRescisao"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 69 && (
                                <>
                                    <h2>Rescisão do Contrato</h2>
                                    <div>
                                        <label>Qual será o prazo para notificação prévia de rescisão ?</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="prazoNotificacaoRescisao"
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
                                    <h2>Disposições Gerais</h2>
                                    <div>
                                        <label>Foro eleito para resolução de conflitos </label>
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
                            {step === 71 && (
                                <>
                                    <h2>Disposições Gerais</h2>
                                    <div>
                                        <label>Gostaria de adicionar testemunhas?</label>
                                        <div>
                                            <select name='testemunhasNecessarias' onChange={handleChange}>
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

                            {testemunhas && (
                                <>
                                    {step === 72 && (
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

                                    {step === 73 && (
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

                                    {step === 74 && (
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

                                    {step === 75 && (
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

                            {step === 76 && (
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


                            {step === 77 && (
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
                    <button className='btnBaixarPdf' onClick={() => { gerarContratoLocacaoBemMovelPago(formData) }}>
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