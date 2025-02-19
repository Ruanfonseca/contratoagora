'use client'
import Pilha from '@/lib/pilha';
import { verificarValor } from '@/lib/utils';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';

const cessaoTerrenoschema = z.object({
    Cedente: z.enum(['pf', 'pj']).default('pf'),

    /**
    * Dados Cedente pj
    */
    razaoSocial: z.string(),
    cnpj: z.string(),
    enderecoCNPJ: z.string(),
    telefoneCNPJ: z.string(),
    emailCNPJ: z.string(),
    nomeRepresentanteCNPJ: z.string(),
    CPFRepresentanteCNPJ: z.string(),
    /** */

    /** Dados Locador pf */
    nomeCedente: z.string(),
    CPFCedente: z.string(),
    enderecoCedente: z.string(),
    telefoneCedente: z.string(),
    emailCedente: z.string(),
    estadoCivil: z.enum(['solteiro', 'viuva', 'casado', 'divorciado']),
    /** */

    Cessionario: z.enum(['pf', 'pj']).default('pf'),

    /**
     * Dados Locatario pj
     */
    razaoSocialCessionario: z.string(),
    cnpjCessionario: z.string(),
    enderecoCessionarioCNPJ: z.string(),
    telefoneCessionarioCNPJ: z.string(),
    emailCessionarioCNPJ: z.string(),
    nomeRepresentantelCessionarioCNPJ: z.string(),
    CPFRepresentanteCessionarioCNPJ: z.string(),
    /** */

    /** Dados Locatario pf */
    nomeCessionario: z.string(),
    CPFCessionario: z.string(),
    enderecoCessionario: z.string(),
    telefoneCessionario: z.string(),
    emailCessionario: z.string(),
    estadoCivilCessionario: z.enum(['solteiro', 'viuva', 'casado', 'divorciado']),
    /** */

    /**DO OBJETO */
    endereco: z.string(),
    dimensoes: z.string(),
    confrotantesCaracteristicas: z.string(),
    titulodaposse: z.string(),
    situacaoLegal: z.string(),
    /** */

    /**CONDIÇÕES DA CESSÃO */
    dataInicio: z.string(),
    prazoCessao: z.string(),
    cessaoContrapartida: z.enum(['S', 'N']),
    //se sim
    especificarValor: z.string(),
    formaPagamento: z.enum(['Pix', 'Dinheiro', 'Cartao', 'Boleto', 'Parcelado']),
    //se parcelado 
    quantasParcelas: z.string(),
    dataVencimentoParcela: z.string(),
    jurosporatraso: z.string(),

    contaBancariaRecebimento: z.string(),

    /** */

    /**DIREITOS DO CESSIONÁRIO*/
    direitoUtilizacao: z.string(),
    benfeitoriasCessionario: z.enum(['S', 'N']),
    //se caso sim
    benfeitoriasPermitidas: z.string(),

    cessionarioTransfere: z.enum(['S', 'N']),
    //se sim
    quaisCondicoes: z.string(),
    /** */



    /**RESPONSABILIDADES E OBRIGAÇÕES */
    alteracoesEstruturais: z.enum(['S', 'N']),
    //se sim
    tiposAlteracoes: z.string(),
    /** */

    /**RESCISÃO */
    cedentePreviaDias: z.string(),
    cessionarioPreviaDias: z.string(),
    /** */

    /**Multas e penalidades */
    cessionarioDescumpre: z.string(),
    prazoInadimplencia: z.string(),
    /** */

    /**Disposições Gerais */
    foroResolucaoConflitos: z.string(), // Foro eleito para resolução de conflitos
    testemunhasNecessarias: z.enum(['S', 'N']), // Necessidade de testemunhas para assinatura do contrato
    //se sim 
    nomeTest1: z.string(),
    cpfTest1: z.string(),
    nomeTest2: z.string(),
    cpfTest2: z.string(),
    localAssinatura: z.string(),
    dataAssinatura: z.string(),
    registroCartorio: z.enum(['S', 'N']), // Indicação se o contrato será registrado em cartório 
    /** */

});

type FormData = z.infer<typeof cessaoTerrenoschema>;


export default function CessaoTerreno() {

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
    const [cedenteJuri, setCedenteJuri] = useState(false);
    const [cessionarioJuri, setCessionarioJuri] = useState(false);
    const [benfeitoriasCessionario, setBenfeitoriasCessionario] = useState(false);
    const [cessionarioTransfere, setCessionarioTransfere] = useState(false);
    const [alteracoesEstruturais, setAlteracoesEstruturais] = useState(false);
    const [Parcelado, setParcelado] = useState(false);
    const [cessaoContrapartida, setCessaoContrapartida] = useState(false);
    const [testemunhas, setTestemunhas] = useState(false);
    const [existePendencias, setExistePendencias] = useState(false);
    const [terceiros, setTerceiros] = useState(false);
    const [receberaValor, setReceberaValor] = useState(false);
    const pilhaSteps = useRef(new Pilha());


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurrentStepData((prev) => ({ ...prev, [name]: value }));
    };


    const handleBack = () => {
        setStep(pilhaSteps.current.desempilhar());
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

    const handleNext = () => {
        setFormData((prev) => ({ ...prev, ...currentStepData }));

        let nextStep = step;

        if (currentStepData.Cedente === 'pj') {
            setCedenteJuri(true);
            nextStep = 8
        } else if (!cedenteJuri && nextStep === 7) {
            nextStep = 14;
        }

        if (currentStepData.Cessionario === 'pj') {
            setCessionarioJuri(true);
            nextStep = 21
        } else if (!cessionarioJuri && nextStep === 20) {
            nextStep = 27;
        }


        if (currentStepData.cessaoContrapartida === 'S') {
            setCessaoContrapartida(true);
            nextStep = 35
        } else if (currentStepData.cessaoContrapartida === 'N') {
            nextStep = 41;
        }


        if (currentStepData.formaPagamento === 'Parcelado') {
            setParcelado(true);
            nextStep = 37
        } else if (currentStepData.formaPagamento === 'Boleto' || currentStepData.formaPagamento === 'Cartao' ||
            currentStepData.formaPagamento === 'Dinheiro' ||
            currentStepData.formaPagamento === 'Pix') {
            nextStep = 40;
        }


        if (currentStepData.benfeitoriasCessionario === 'S') {
            setBenfeitoriasCessionario(true);
            nextStep = 43
        } else if (currentStepData.benfeitoriasCessionario === 'N') {
            nextStep = 44;
        }

        if (currentStepData.cessionarioTransfere === 'S') {
            setCessionarioTransfere(true);
            nextStep = 45
        } else if (currentStepData.cessionarioTransfere === 'N') {
            nextStep = 46;
        }

        if (currentStepData.alteracoesEstruturais === 'S') {
            setAlteracoesEstruturais(true);
            nextStep = 47
        } else if (currentStepData.alteracoesEstruturais === 'N') {
            nextStep = 48;
        }

        if (currentStepData.testemunhasNecessarias === 'S') {
            setTestemunhas(true);
            nextStep = 54
        } else if (currentStepData.testemunhasNecessarias === 'N') {
            nextStep = 58;
        }





        if (nextStep === step) {
            nextStep += 1;
        }

        setStep(nextStep);

        pilhaSteps.current.empilhar(nextStep);
        // Logs para depuração
        console.log(`qtd step depois do ajuste: ${nextStep}`);

        // Limpar os dados do passo atual.
        setCurrentStepData({});
    }

    const geradorPosseTerrenoPdf = (dados: any) => {
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

        // Título do Contrato
        doc.setFontSize(14);
        doc.text("CONTRATO DE CESSÃO DE POSSE DE TERRENO", 105, posY, { align: "center" });
        posY += 15;

        // Seção 1: Identificação das Partes
        addSection("1. Identificação das Partes", [
            "Nos termos do artigo 104 do Código Civil, para validade do negócio jurídico, exige-se agente capaz, objeto lícito e forma prescrita ou não defesa em lei.",
            `Cedente: ${verificarValor(dados.Cedente) === 'pj' ? verificarValor(dados.razaoSocial) : verificarValor(dados.nomeCedente)}`,
            `CPF/CNPJ: ${verificarValor(dados.Cedente) === 'pj' ? verificarValor(dados.cnpj) : verificarValor(dados.CPFCedente)}`,
            `Endereço: ${verificarValor(dados.Cedente) === 'pj' ? verificarValor(dados.enderecoCNPJ) : verificarValor(dados.enderecoCedente)}`,
            `Telefone: ${verificarValor(dados.Cedente) === 'pj' ? verificarValor(dados.telefoneCNPJ) : verificarValor(dados.telefoneCedente)}`,
            `Email: ${verificarValor(dados.Cedente) === 'pj' ? verificarValor(dados.emailCNPJ) : verificarValor(dados.emailCedente)}`,
            `Estado Civil: ${verificarValor(dados.Cedente) === 'pj' ? 'Não Aplicável' : verificarValor(dados.estadoCivil)}`,
            `Representante (PJ): ${verificarValor(dados.Cedente) === 'pj' ? verificarValor(dados.nomeRepresentanteCNPJ) : 'Não Aplicável'}`,
            `CPF Representante (PJ): ${verificarValor(dados.Cedente) === 'pj' ? verificarValor(dados.CPFRepresentanteCNPJ) : 'Não Aplicável'}`,
            `Cessionário: ${verificarValor(dados.Cessionario) === 'pj' ? verificarValor(dados.razaoSocialCessionario) : verificarValor(dados.nomeCessionario)}`,
            `CPF/CNPJ Cessionário: ${verificarValor(dados.Cessionario) === 'pj' ? verificarValor(dados.cnpjCessionario) : verificarValor(dados.CPFCessionario)}`,
            `Endereço Cessionário: ${verificarValor(dados.Cessionario) === 'pj' ? verificarValor(dados.enderecoCessionarioCNPJ) : verificarValor(dados.enderecoCessionario)}`,
            `Telefone Cessionário: ${verificarValor(dados.Cessionario) === 'pj' ? verificarValor(dados.telefoneCessionarioCNPJ) : verificarValor(dados.telefoneCessionario)}`,
            `Email Cessionário: ${verificarValor(dados.Cessionario) === 'pj' ? verificarValor(dados.emailCessionarioCNPJ) : verificarValor(dados.emailCessionario)}`,
            `Estado Civil Cessionário: ${verificarValor(dados.Cessionario) === 'pj' ? 'Não Aplicável' : verificarValor(dados.estadoCivilCessionario)}`,
            `Representante Cessionário (PJ): ${verificarValor(dados.Cessionario) === 'pj' ? verificarValor(dados.nomeRepresentantelCessionarioCNPJ) : 'Não Aplicável'}`,
            `CPF Representante Cessionário (PJ): ${verificarValor(dados.Cessionario) === 'pj' ? verificarValor(dados.CPFRepresentanteCessionarioCNPJ) : 'Não Aplicável'}`,
        ]);

        // Seção 2: Do Objeto
        addSection("2. Do Objeto", [
            "O presente contrato tem como objeto a cessão da posse do terreno, conforme estabelecido no artigo 1.196 do Código Civil, onde se define posse como o exercício de fato de algum dos poderes inerentes à propriedade.",
            `O presente contrato tem como objeto a cessão da posse do terreno localizado em: ${verificarValor(dados.endereco)}`,
            `Dimensões do terreno (metros quadrados): ${verificarValor(dados.dimensoes)}`,
            `Confrontantes e características físicas pertinentes: ${verificarValor(dados.confrotantesCaracteristicas)}`,
            `Título da posse (se houver): ${verificarValor(dados.titulodaposse)}`,
            `Situação legal do imóvel: ${verificarValor(dados.situacaoLegal)}`,
        ]);

        // Seção 3: Da Natureza da Cessão
        addSection("3. Da Natureza da Cessão", [
            "Nos termos do artigo 1.225 do Código Civil, a posse é um direito real passível de cessão, desde que não contrarie norma expressa.",
            "O CEDENTE cede ao CESSIONÁRIO a posse do terreno descrito na Cláusula 1ª, sem transferência de propriedade, permanecendo o CEDENTE como titular do direito de propriedade sobre o imóvel.",
        ]);

        // Seção 4: Das Condições da Cessão
        addSection("4. Das Condições da Cessão", [
            "A cessão da posse deve observar os princípios gerais dos contratos, conforme artigo 421 do Código Civil, respeitando a função social do contrato.",

            `Data de início da posse: ${verificarValor(dados.dataInicio)}`,
            `Prazo da cessão: ${verificarValor(dados.prazoCessao)}`,
            `A cessão envolve contrapartida financeira? ${verificarValor(dados.cessaoContrapartida) === 'S' ? 'Sim' : 'Não'}`,
            `Caso sim, especificar o valor: R$ ${verificarValor(dados.especificarValor)}`,
            `Condições de pagamento: ${verificarValor(dados.formaPagamento)}`,
            `Quantas parcelas: ${verificarValor(dados.quantasParcelas)}`,
            `Data de vencimento da parcela: ${verificarValor(dados.dataVencimentoParcela)}`,
            `Juros por atraso: ${verificarValor(dados.jurosporatraso)}`,
            `Conta bancária para recebimento: ${verificarValor(dados.contaBancariaRecebimento)}`,
        ]);

        // Seção 5: Dos Direitos do Cessionário
        addSection("5. Dos Direitos do Cessionário", [
            "O CESSIONÁRIO poderá exercer a posse do imóvel nos termos do artigo 1.210 do Código Civil, sendo-lhe permitido defender sua posse por meio dos interditos possessórios.",
            `O CESSIONÁRIO terá direito a utilizar o terreno para os seguintes fins: ${verificarValor(dados.direitoUtilizacao)}`,
            `O CESSIONÁRIO poderá realizar benfeitorias no terreno? ${verificarValor(dados.benfeitoriasCessionario) === 'S' ? 'Sim' : 'Não'}`,
            `Caso sim, especificar quais tipos de benfeitorias são permitidas: ${verificarValor(dados.benfeitoriasPermitidas)}`,
            `O CESSIONÁRIO poderá transferir a posse para terceiros? ${verificarValor(dados.cessionarioTransfere) === 'S' ? 'Sim' : 'Não'}`,
            `Caso sim, com quais condições? ${verificarValor(dados.quaisCondicoes)}`,
        ]);

        // Seção 6: Das Responsabilidades e Obrigações
        addSection("6. Das Responsabilidades e Obrigações", [
            "O CESSIONÁRIO assume a responsabilidade pelo uso e conservação do terreno, conforme artigo 1.228 do Código Civil, respeitando as normas ambientais e urbanísticas aplicáveis.",
            "O CESSIONÁRIO assume a responsabilidade pelo uso e conservação do terreno.",
            "O CESSIONÁRIO será responsável pelo pagamento de eventuais despesas relacionadas ao terreno, incluindo impostos, taxas e demais encargos.",
            `O CESSIONÁRIO poderá realizar alterações estruturais? ${verificarValor(dados.alteracoesEstruturais) === 'S' ? 'Sim' : 'Não'}`,
            `Caso sim, especificar quais tipos de alterações são permitidas: ${verificarValor(dados.tiposAlteracoes)}`,
        ]);

        // Seção 7: Da Rescisão
        addSection("7. Da Rescisão", [
            "O contrato poderá ser rescindido por descumprimento de cláusulas contratuais, conforme artigo 474 do Código Civil, que trata da resolução dos contratos bilaterais em caso de inadimplência.",

            "O presente contrato poderá ser rescindido nas seguintes hipóteses:",
            "Pelo descumprimento de quaisquer cláusulas;",
            "Por comum acordo entre as partes;",
            `Pela necessidade do CEDENTE em retomar a posse do terreno, com notificação prévia de ${verificarValor(dados.cedentePreviaDias)} dias.`,
            `Em caso de rescisão, o CESSIONÁRIO deverá desocupar o terreno no prazo máximo de ${verificarValor(dados.cessionarioPreviaDias)} dias.`,
        ]);

        // Seção 8: Das Multas e Penalidades
        addSection("8. Das Multas e Penalidades", [
            "O descumprimento de cláusulas contratuais poderá gerar multas, conforme artigo 408 do Código Civil, que dispõe sobre a cláusula penal em caso de inadimplência.",

            `Caso o CESSIONÁRIO descumpra qualquer cláusula do presente contrato, ficará sujeito a uma multa no valor de R$ ${verificarValor(dados.cessionarioDescumpre)}.`,
            `Em caso de inadimplência nos pagamentos acordados, o CESSIONÁRIO terá um prazo de ${verificarValor(dados.prazoInadimplencia)} dias para regularização, sob pena de rescisão automática do contrato.`,
            "Quaisquer danos causados ao terreno pelo CESSIONÁRIO deverão ser reparados às suas próprias custas.",
        ]);

        // Seção 9: Da Jurisdição
        addSection("9. Da Jurisdição", [
            `Fica eleito o foro da Comarca de ${verificarValor(dados.foroResolucaoConflitos)} para dirimir quaisquer dúvidas ou controvérsias oriundas do presente contrato.`,
        ]);

        // Seção 10: Do Usucapião
        addSection("10. Do Usucapião", [
            "O CESSIONÁRIO declara estar ciente de que a posse do terreno não gera direito automático à propriedade por usucapião, conforme artigo 1.238 e seguintes do Código Civil.",
            "O CESSIONÁRIO declara estar ciente de que a posse do terreno objeto deste contrato não gera, por si só, direito à aquisição da propriedade por usucapião, salvo nos casos previstos na legislação vigente.",
            "Caso o CESSIONÁRIO preencha os requisitos legais para requerer usucapião, deverá comunicar formalmente ao CEDENTE.",
        ]);

        // Seção 11: Disposições Gerais
        addSection("11. Disposições Gerais", [
            "Nos termos do artigo 219 do Código Civil, as partes declaram que este contrato reflete integralmente sua vontade, obrigando-se a cumpri-lo de boa-fé.",
            `Testemunhas necessárias? ${verificarValor(dados.testemunhasNecessarias) === 'S' ? 'Sim' : 'Não'}`,
            `Nome da Testemunha 1: ${verificarValor(dados.nomeTest1)}`,
            `CPF da Testemunha 1: ${verificarValor(dados.cpfTest1)}`,
            `Nome da Testemunha 2: ${verificarValor(dados.nomeTest2)}`,
            `CPF da Testemunha 2: ${verificarValor(dados.cpfTest2)}`,
            `Local de assinatura: ${verificarValor(dados.localAssinatura)}`,
            `Data de assinatura: ${verificarValor(dados.dataAssinatura)}`,
            `Registro em cartório? ${verificarValor(dados.registroCartorio) === 'S' ? 'Sim' : 'Não'}`,
        ]);

        // Finalização do documento
        // Espaço para assinatura do vendedor
        checkPageBreak(30);
        doc.text("__________________________________________", marginX, posY);
        posY += 10;
        doc.text("Assinatura do Cedente", marginX, posY);
        posY += 15;

        // Espaço para assinatura do comprador
        checkPageBreak(10);
        doc.text("__________________________________________", marginX, posY);
        posY += 10;
        doc.text("Assinatura do Cessionário", marginX, posY);
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
    };

    useEffect(() => {
        geradorPosseTerrenoPdf({ ...formData });
    }, [formData]);

    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title">Contrato de Cessão de Posse de Terreno</h1>

            </div>
            <div className="container">
                <div className="left-panel">
                    <div className="scrollable-card">

                        <div className="progress-bar">
                            <div
                                className="progress-bar-inner"
                                style={{ width: `${(step / 60) * 100}%` }}
                            ></div>
                        </div>
                        <div className="form-wizard">
                            {step === 1 && (
                                <>
                                    <h2>Dados do Cedente</h2>
                                    <div>
                                        <label>O Cedente é pessoa?</label>
                                        <select name='Cedente' onChange={handleChange}>
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
                                    <h2>Dados do Cedente</h2>
                                    <div>
                                        <label>Nome do Cedente</label>
                                        <input
                                            type='text'
                                            placeholder='Nome do Cedente'
                                            name="nomeCedente"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 3 && (
                                <>
                                    <h2>Dados do Cedente</h2>
                                    <div>
                                        <label>CPF</label>
                                        <input
                                            type='text'
                                            placeholder='CPF do Cedente'
                                            name="CPFCedente"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 4 && (
                                <>
                                    <h2>Dados do Cedente</h2>
                                    <div>
                                        <label>Endereço do Locador</label>
                                        <input
                                            type='text'
                                            placeholder='Onde o cedente mora'
                                            name="enderecoCedente"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 5 && (
                                <>
                                    <h2>Dados do Cedente</h2>
                                    <div>
                                        <label>Telefone do Cedente</label>
                                        <input
                                            type='text'
                                            placeholder='(DDD)número-número'
                                            name="telefoneCedente"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 6 && (
                                <>
                                    <h2>Dados do Cedente</h2>
                                    <div>
                                        <label>Email do Cedente</label>
                                        <input
                                            type='text'
                                            placeholder='email@email.com'
                                            name="emailCedente"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 7 && (
                                <>
                                    <h2>Dados do Cedente</h2>
                                    <div>
                                        <label>Estado Cívil do Cedente</label>
                                        <select name='locatario' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="solteiro">Solteiro(a)</option>
                                            <option value="viuva">Viuva(o)</option>
                                            <option value="casado">Casado(a)</option>
                                            <option value="divorciado">Divorciado(a)</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {/**Pessoa Juridica */}

                            {cedenteJuri && (
                                <>
                                    {step === 8 && (
                                        <>
                                            <h2>Dados do Cedente</h2>
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
                                            <h2>Dados do Cedente</h2>
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
                                            <h2>Dados do Cedente</h2>
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
                                            <h2>Dados do Cedente</h2>
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
                                    {step === 12 && (
                                        <>
                                            <h2>Dados do Cedente</h2>
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
                                            <h2>Dados do Cedente</h2>
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

                            {/**Cessionario */}

                            {step === 14 && (
                                <>
                                    <h2>Dados do Cessionário</h2>
                                    <div>
                                        <label>O Cessionário é pessoa?</label>
                                        <select name='Cessionario' onChange={handleChange}>
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
                                    <h2>Dados do Cessionário</h2>
                                    <div>
                                        <label>Nome do Cessionário</label>
                                        <input
                                            type='text'
                                            placeholder='Nome do Cessionário'
                                            name="nomeCessionario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 16 && (
                                <>
                                    <h2>Dados do Cessionário</h2>
                                    <div>
                                        <label>CPF</label>
                                        <input
                                            type='text'
                                            placeholder='CPF do Cessionário'
                                            name="CPFCessionario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 17 && (
                                <>
                                    <h2>Dados do Cessionário</h2>
                                    <div>
                                        <label>Endereço do Cessionário</label>
                                        <input
                                            type='text'
                                            placeholder='Onde o cessionário mora'
                                            name="enderecoCessionario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 18 && (
                                <>
                                    <h2>Dados do Cessionário</h2>
                                    <div>
                                        <label>Telefone do Cessionário</label>
                                        <input
                                            type='text'
                                            placeholder='(DDD)número-número'
                                            name="telefoneCessionario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 19 && (
                                <>
                                    <h2>Dados do Cessionário</h2>
                                    <div>
                                        <label>Email do Cessionário</label>
                                        <input
                                            type='text'
                                            placeholder='email@email.com'
                                            name="emailCessionario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 20 && (
                                <>
                                    <h2>Dados do Cessionário</h2>
                                    <div>
                                        <label>Estado Cívil</label>
                                        <select name='estadoCivilCessionario' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="solteiro">Solteiro(a)</option>
                                            <option value="viuva">Viuva(o)</option>
                                            <option value="casado">Casado(a)</option>
                                            <option value="divorciado">Divorciado(a)</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {/**Pessoa Juridica */}

                            {cessionarioJuri && (
                                <>
                                    {step === 21 && (
                                        <>
                                            <h2>Dados do Cessionário</h2>
                                            <div>
                                                <label>Razão Social</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="razaoSocialCessionario"
                                                    onChange={handleChange}
                                                />
                                                <label>CNPJ</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cnpjCessionario"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 22 && (
                                        <>
                                            <h2>Dados do Cessionário</h2>
                                            <div>
                                                <label>Endereço do onde o CNPJ esta cadastrado</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="enderecoCessionarioCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 23 && (
                                        <>
                                            <h2>Dados do Cessionário</h2>
                                            <div>
                                                <label>Telefone</label>
                                                <input
                                                    type='text'
                                                    placeholder='(DDD)número-número'
                                                    name="telefoneCessionarioCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 24 && (
                                        <>
                                            <h2>Dados do Cessionário</h2>
                                            <div>
                                                <label>Email</label>
                                                <input
                                                    type='text'
                                                    placeholder='email@email.com'
                                                    name="emailCessionarioCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 25 && (
                                        <>
                                            <h2>Dados do Cessionário</h2>
                                            <div>
                                                <label>Nome do representante do CNPJ</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="nomeRepresentantelCessionarioCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 26 && (
                                        <>
                                            <h2>Dados do Cessionário</h2>
                                            <div>
                                                <label>CPF do representante do CNPJ</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="CPFRepresentanteCessionarioCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}


                            {step === 27 && (
                                <>
                                    <h2>Dados do Terreno</h2>
                                    <div>
                                        <label>Endereço completo</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="endereco"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 28 && (
                                <>
                                    <h2>Dados do Terreno</h2>
                                    <div>
                                        <label>Dimensões do terreno (metros quadrados)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="dimensoes"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 29 && (
                                <>
                                    <h2>Dados do Terreno</h2>
                                    <div>
                                        <label>Confrontantes e características físicas pertinentes</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="confrotantesCaracteristicas"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 30 && (
                                <>
                                    <h2>Dados do Terreno</h2>
                                    <div>
                                        <label>Título da posse (se houver)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="titulodaposse"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 31 && (
                                <>
                                    <h2>Dados do Terreno</h2>
                                    <div>
                                        <label>Situação legal do imóvel</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="situacaoLegal"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 32 && (
                                <>
                                    <h2>Condições da Cessão</h2>
                                    <div>
                                        <label>Data de início da posse</label>
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

                            {step === 33 && (
                                <>
                                    <h2>Condições da Cessão</h2>
                                    <div>
                                        <label>Prazo da cessão</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="prazoCessao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 34 && (
                                <>
                                    <h2>Condições da Cessão</h2>
                                    <div>
                                        <label>A cessão envolve contrapartida financeira?</label>
                                        <select name='cessaoContrapartida' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {cessaoContrapartida && (
                                <>
                                    {step === 35 && (
                                        <>
                                            <h2>Condições da Cessão</h2>
                                            <div>
                                                <label>Valor</label>
                                                <input
                                                    type='text'
                                                    placeholder='R$'
                                                    name="especificarValor"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 36 && (
                                        <>
                                            <h2>Condições da Cessão</h2>
                                            <div>
                                                <label>Como será feito o pagamento?</label>
                                                <select name='formaPagamento' onChange={handleChange}>
                                                    <option value="">Selecione</option>
                                                    <option value="Pix">Pix</option>
                                                    <option value="Dinheiro">Dinheiro</option>
                                                    <option value="Cartao">Cartao</option>
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
                                                    <h2>Condições da Cessão</h2>
                                                    <div>
                                                        <label>Quantas Parcelas?</label>
                                                        <input
                                                            type='text'
                                                            placeholder=''
                                                            name="quantasParcelas"
                                                            onChange={handleChange}
                                                        />
                                                        <button onClick={handleBack}>Voltar</button>
                                                        <button onClick={handleNext}>Próximo</button>
                                                    </div>
                                                </>
                                            )}
                                            {step === 38 && (
                                                <>
                                                    <h2>Condições da Cessão</h2>
                                                    <div>
                                                        <label>Data de vencimento das parcelas?</label>
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
                                            {step === 39 && (
                                                <>
                                                    <h2>Condições da Cessão</h2>
                                                    <div>
                                                        <label>Percentual de juros por atraso de pagamento das parcelas</label>
                                                        <input
                                                            type='text'
                                                            placeholder='ex.:1%,0.5%'
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
                                            <h2>Condições da Cessão</h2>
                                            <div>
                                                <label>Conta Bancária para recebimento do valor</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="contaBancariaRecebimento"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                </>
                            )}

                            {step === 41 && (
                                <>
                                    <h2>Direitos do Cessionário</h2>
                                    <div>
                                        <label>O CESSIONÁRIO terá direito a utilizar o terreno para os seguintes fins</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="direitoUtilizacao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 42 && (
                                <>
                                    <h2>Direitos do Cessionário</h2>
                                    <div>
                                        <label>O CESSIONÁRIO poderá realizar benfeitorias no terreno? </label>
                                        <select name='benfeitoriasCessionario' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {benfeitoriasCessionario && (
                                <>
                                    {step === 43 && (
                                        <>
                                            <h2>Direitos do Cessionário</h2>
                                            <div>
                                                <label>Especificar quais tipos de benfeitorias são permitidas</label>
                                                <textarea
                                                    id="benfeitoriasPermitidas"
                                                    name="benfeitoriasPermitidas"
                                                    onChange={handleChange}
                                                    rows={10}
                                                    cols={50}
                                                    placeholder=" "
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
                                    <h2>Direitos do Cessionário</h2>
                                    <div>
                                        <label>O CESSIONÁRIO poderá transferir a posse para terceiros? </label>
                                        <select name='cessionarioTransfere' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {cessionarioTransfere && (
                                <>
                                    {step === 45 && (
                                        <>
                                            <h2>Direitos do Cessionário</h2>
                                            <div>
                                                <label>Sob quais condições</label>
                                                <textarea
                                                    id="quaisCondicoes"
                                                    name="quaisCondicoes"
                                                    onChange={handleChange}
                                                    rows={10}
                                                    cols={50}
                                                    placeholder=" "
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
                                    <h2>Responsabilidades e Obrigações</h2>
                                    <div>
                                        <label>O CESSIONÁRIO poderá realizar alterações estruturais? </label>
                                        <select name='alteracoesEstruturais' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {alteracoesEstruturais && (
                                <>
                                    {step === 47 && (
                                        <>
                                            <h2>Responsabilidades e Obrigações</h2>
                                            <div>
                                                <label>Especificar quais tipos de alterações são permitidas</label>
                                                <textarea
                                                    id="tiposAlteracoes"
                                                    name="tiposAlteracoes"
                                                    onChange={handleChange}
                                                    rows={10}
                                                    cols={50}
                                                    placeholder=" "
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 48 && (
                                <>
                                    <h2>Direitos do Cessionário</h2>
                                    <div>
                                        <label>Pela necessidade do CEDENTE em retomar a posse do terreno, com notificação prévia de</label>
                                        <input
                                            type='text'
                                            placeholder='ex.: 3 dias'
                                            name="cedentePreviaDias"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 49 && (
                                <>
                                    <h2>Direitos do Cessionário</h2>
                                    <div>
                                        <label>Em caso de rescisão, o CESSIONÁRIO deverá desocupar o terreno no prazo máximo de</label>
                                        <input
                                            type='text'
                                            placeholder='ex.: 3 dias'
                                            name="cessionarioPreviaDias"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 50 && (
                                <>
                                    <h2>Das Multas e Penalidades</h2>
                                    <div>
                                        <label>Caso o CESSIONÁRIO descumpra qualquer cláusula do presente contrato, ficará sujeito a uma multa no valor de</label>
                                        <input
                                            type='text'
                                            placeholder='ex.: 3 dias'
                                            name="cessionarioDescumpre"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 51 && (
                                <>
                                    <h2>Das Multas e Penalidades</h2>
                                    <div>
                                        <label>Em caso de inadimplência nos pagamentos acordados, o CESSIONÁRIO terá um prazo de</label>
                                        <input
                                            type='text'
                                            placeholder='ex.: 3 dias'
                                            name="prazoInadimplencia"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 52 && (
                                <>
                                    <h2>Disposições Gerais</h2>
                                    <div>
                                        <label>Eleição do foro competente para resolução de conflitos</label>
                                        <input
                                            type='text'
                                            placeholder='qual será foro?'
                                            name="foroResolucaoConflitos"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 53 && (
                                <>
                                    <h2>Disposições Gerais</h2>
                                    <div>
                                        <label>Necessidade de assinatura de testemunhas? </label>
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

                            {testemunhas && (
                                <>

                                    {step === 54 && (
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

                                    {step === 55 && (
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

                                    {step === 56 && (
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

                                    {step === 57 && (
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

                            {step === 58 && (
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

                            {step === 59 && (
                                <>
                                    <h2>Disposições Gerais</h2>
                                    <div>
                                        <label>Local de assinatura do contrato </label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="localAssinatura"
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
                                    <h2>Dados das Testemunhas</h2>
                                    <div>
                                        <label>Data de assinatura </label>
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

                            {step === 61 && (
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