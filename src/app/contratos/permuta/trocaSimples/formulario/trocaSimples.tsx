'use client'
import Pilha from '@/lib/pilha';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';
import geradorTrocaSimplesPago from '../util/pdf';



const contratotrocasimplesschema = z.object({
    pessoaPermutante: z.enum(['fisica', 'juridico']).default('fisica'),

    /**Primeiro Permutante Jurídico*/
    razaoSocial: z.string(),
    cnpj: z.string(),
    enderecoJuridico: z.string(),
    nomeRepresentante: z.string(),
    cargoRepresentante: z.string(),
    cpfRepresentante: z.string(),
    enderecoRepresentante: z.string(),
    telefoneRepresentante: z.string(),
    /** */

    /**Primeiro Permutante Físico */
    nomePermutante: z.string(),
    sexoPermutante: z.enum(['F', 'M']),
    estadoCivilPermutante: z.string(),
    nacionalidadePermutante: z.string(),
    profissaoPermutante: z.string(),
    documentoPermutante: z.string(),
    numeroPermutante: z.string(),
    cpfPermutante: z.string(),
    enderecoPermutante: z.string(),
    contatoPermuntante: z.string(),
    /** */


    pessoaSegPermutante: z.enum(['fisica', 'juridico']).default('fisica'),


    /**Segundo Permutante Jurídico*/
    razaoSocialSegundo: z.string(),
    cnpjSegundo: z.string(),
    enderecoJuridicoSegundo: z.string(),
    nomeRepresentanteSegundo: z.string(),
    cargoRepresentanteSegundo: z.string(),
    cpfRepresentanteSegundo: z.string(),
    enderecoRepresentanteSegundo: z.string(),
    telefoneRepresentanteSegundo: z.string(),
    /** */

    /**Segundo Permutante Físico */
    nomePermutanteSegundo: z.string(),
    sexoPermutanteSegundo: z.enum(['F', 'M']),
    estadoCivilPermutanteSegundo: z.string(),
    nacionalidadePermutanteSegundo: z.string(),
    profissaoPermutanteSegundo: z.string(),
    documentoPermutanteSegundo: z.string(),
    numeroPermutanteSegundo: z.string(),
    cpfPermutanteSegundo: z.string(),
    enderecoPermutanteSegundo: z.string(),
    contatoPermuntanteSegundo: z.string(),
    /** */


    /*Bem/Serviço oferecido pelo 1º Permutante: **/
    descricao: z.string(),
    estadoConversa: z.string(),
    quantidade: z.string(),
    valorEstimado: z.string(),
    documentoPertinente: z.string(),
    encargos: z.string(),
    manutencao: z.string(),
    /*** */


    /*Bem/Serviço oferecido pelo  2º Permutante: **/
    descricaoSegundo: z.string(),
    estadoConversaSegundo: z.string(),
    quantidadeSegundo: z.string(),
    valorEstimadoSegundo: z.string(),
    documentoPertinenteSegundo: z.string(),
    encargosSegundo: z.string(),
    manutencaoSegundo: z.string(),
    /*** */


    /**Torna */
    complemento: z.string(),
    parteResponsavel: z.string(),
    valorComplemento: z.string(),
    dataPagamento: z.string(),
    encargosJuros: z.string(),
    formaPagamento: z.string(),
    penalidades: z.string(),
    /*** */

    /**Entrega e Posse */
    dataTroca: z.string(),
    localCondicoes: z.string(),
    eventuaisResponsabilidade: z.string(),
    procedimentos: z.string(),
    tranferTitularidade: z.string(),
    /** */

    /**Penalidades */
    multaContratuais: z.string(),
    jurosCorrecao: z.string(),
    responsabilidade: z.string(),
    direito: z.string(),
    indenizacao: z.string(),
    /** */

    /**Rescisão */
    multaRescisao: z.string(),
    valorCondicao: z.string(),
    /** */

    /**DISPOSIÇÕES GERAIS */
    cidade: z.string(),
    estado: z.string(),
    testemunhasNecessarias: z.enum(['S', 'N']), // Necessidade de testemunhas para assinatura do contrato
    //se sim 
    nomeTest1: z.string(),
    cpfTest1: z.string(),
    nomeTest2: z.string(),
    cpfTest2: z.string(),
    dataAssinatura: z.string(),
    registroCartorioTest: z.enum(['S', 'N']), // Indicação se o contrato será registrado em cartório 
    /** */
});


type FormData = z.infer<typeof contratotrocasimplesschema>;


export default function TrocaSimples() {
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
    const [Testemunhas, setTestemunhas] = useState(false);
    const [juridicoPermutante, setJuridicoPermutante] = useState(false);
    const [juridicoSegPermutante, setJuridicoSegPermutante] = useState(false);

    const pilha = useRef(new Pilha());


    const handleNext = () => {
        setFormData((prev) => ({ ...prev, ...currentStepData }));
        let nextStep = step;



        if (currentStepData.pessoaPermutante === 'fisica') {
            nextStep = 1;
        } else if (currentStepData.pessoaPermutante === 'juridico') {
            setJuridicoPermutante(true);
            nextStep = 12;
        }



        if (nextStep === 11) {
            nextStep = 20;
        }


        if (currentStepData.pessoaSegPermutante === 'fisica') {
            nextStep = 21;
        } else if (currentStepData.pessoaSegPermutante === 'juridico') {
            setJuridicoSegPermutante(true);
            nextStep = 31;
        }



        if (nextStep === 30) {
            nextStep = 39;
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
        pilha.current.empilhar(nextStep);


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

    const handleBack = () => {
        setStep(pilha.current.desempilhar());
    }


    const geradorTrocaSimplesPdf = (dados: any) => {
        const doc = new jsPDF();
        doc.setFont("Times"); // Fonte padrão ABNT

        // Margens conforme ABNT
        const marginLeft = 30;
        const marginRight = 20;
        const marginTop = 20;
        const marginBottom = 20;

        let posY = marginTop;
        const pageHeight = doc.internal.pageSize.getHeight();
        const maxTextWidth = doc.internal.pageSize.getWidth() - marginLeft - marginRight;

        const checkPageBreak = (additionalHeight: number) => {
            if (posY + additionalHeight >= pageHeight - marginBottom) {
                doc.addPage();
                posY = marginTop;
            }
        };

        const verificarValor = (valor: any, textoPadrao = "Não informado") => {
            return valor && valor !== "" ? valor : textoPadrao;
        };

        const addClause = (title: string, content: string[]) => {
            const titleHeight = 10;
            const lineHeight = 7.5; // Espaçamento de linha 1,5

            // Título da cláusula
            checkPageBreak(titleHeight);
            doc.setFontSize(12);
            doc.setFont("Times", "bold");
            doc.text(title, doc.internal.pageSize.getWidth() / 2, posY, { align: "center" });
            posY += titleHeight;

            // Corpo da cláusula
            doc.setFontSize(12);
            doc.setFont("Times", "normal");
            content.forEach((line) => {
                const splitLines = doc.splitTextToSize(line, maxTextWidth);
                splitLines.forEach((splitLine: string | string[]) => {
                    checkPageBreak(lineHeight);
                    doc.text(splitLine, marginLeft, posY);
                    posY += lineHeight;
                });
            });
        };

        // Página 1 - Título principal
        doc.setFontSize(14);
        doc.setFont("Times", "bold");
        doc.text("CONTRATO DE PERMUTA", doc.internal.pageSize.getWidth() / 2, posY, { align: "center" });
        posY += 20;

        // 1. IDENTIFICAÇÃO DAS PARTES
        addClause("1. IDENTIFICAÇÃO DAS PARTES", [
            "Pelo presente instrumento particular de permuta, as partes abaixo qualificadas têm entre si justo e contratado o seguinte:"
        ]);
        posY += 5;

        // 1.1. Primeiro Permutante
        addClause("1.1. Primeiro Permutante:", []);

        if (dados.pessoaPermutante === "juridico") {
            addClause("Pessoa Jurídica:", [
                `Razão Social: ${verificarValor(dados.razaoSocial)}`,
                `CNPJ: ${verificarValor(dados.cnpj)}`,
                `Endereço: ${verificarValor(dados.enderecoJuridico)}`,
                `Nome do Representante Legal: ${verificarValor(dados.nomeRepresentante)}`,
                `Cargo do Representante: ${verificarValor(dados.cargoRepresentante)}`,
                `CPF do Representante: ${verificarValor(dados.cpfRepresentante)}`,
                `Endereço do Representante: ${verificarValor(dados.enderecoRepresentante)}`,
                `Telefone para contato: ${verificarValor(dados.telefoneRepresentante)}`
            ]);
        } else {
            addClause("Pessoa Física:", [
                `Nome Completo: ${verificarValor(dados.nomePermutante)}`,
                `Sexo: ${verificarValor(dados.sexoPermutante)}`,
                `Estado Civil: ${verificarValor(dados.estadoCivilPermutante)}`,
                `Nacionalidade: ${verificarValor(dados.nacionalidadePermutante)}`,
                `Profissão: ${verificarValor(dados.profissaoPermutante)}`,
                `Documento de Identificação: ${verificarValor(dados.documentoPermutante)}`,
                `Número do Documento: ${verificarValor(dados.numeroPermutante)}`,
                `CPF: ${verificarValor(dados.cpfPermutante)}`,
                `Endereço Completo: ${verificarValor(dados.enderecoPermutante)}`,
                `Contato Telefônico: ${verificarValor(dados.contatoPermuntante)}`
            ]);
        }
        posY += 5;

        // 1.2. Segundo Permutante
        addClause("1.2. Segundo Permutante:", []);

        if (dados.pessoaSegPermutante === "juridico") {
            addClause("Pessoa Jurídica:", [
                `Razão Social: ${verificarValor(dados.razaoSocialSegundo)}`,
                `CNPJ: ${verificarValor(dados.cnpjSegundo)}`,
                `Endereço: ${verificarValor(dados.enderecoJuridicoSegundo)}`,
                `Nome do Representante Legal: ${verificarValor(dados.nomeRepresentanteSegundo)}`,
                `Cargo do Representante: ${verificarValor(dados.cargoRepresentanteSegundo)}`,
                `CPF do Representante: ${verificarValor(dados.cpfRepresentanteSegundo)}`,
                `Endereço do Representante: ${verificarValor(dados.enderecoRepresentanteSegundo)}`,
                `Telefone para contato: ${verificarValor(dados.telefoneRepresentanteSegundo)}`
            ]);
        } else {
            addClause("Pessoa Física:", [
                `Nome Completo: ${verificarValor(dados.nomePermutanteSegundo)}`,
                `Sexo: ${verificarValor(dados.sexoPermutanteSegundo)}`,
                `Estado Civil: ${verificarValor(dados.estadoCivilPermutanteSegundo)}`,
                `Nacionalidade: ${verificarValor(dados.nacionalidadePermutanteSegundo)}`,
                `Profissão: ${verificarValor(dados.profissaoPermutanteSegundo)}`,
                `Documento de Identificação: ${verificarValor(dados.documentoPermutanteSegundo)}`,
                `Número do Documento: ${verificarValor(dados.numeroPermutanteSegundo)}`,
                `CPF: ${verificarValor(dados.cpfPermutanteSegundo)}`,
                `Endereço Completo: ${verificarValor(dados.enderecoPermutanteSegundo)}`,
                `Contato Telefônico: ${verificarValor(dados.contatoPermuntanteSegundo)}`
            ]);
        }

        // 2. DO OBJETO
        addClause("2. DO OBJETO", []);

        // 2.1. Descrição dos Bens e Serviços Trocados
        addClause("2.1. Descrição dos Bens e Serviços Trocados", [
            "Bem/Serviço oferecido pelo 1º Permutante:",
            `Descrição detalhada: ${verificarValor(dados.descricao)}`,
            `Estado de conservação: ${verificarValor(dados.estadoConversa)}`,
            `Quantidade: ${verificarValor(dados.quantidade)}`,
            `Valor estimado: ${verificarValor(dados.valorEstimado)}`,
            `Documentação pertinente: ${verificarValor(dados.documentoPertinente)}`,
            `Possíveis encargos ou tributos envolvidos: ${verificarValor(dados.encargos)}`,
            `Condições de uso e manutenção: ${verificarValor(dados.manutencao)}`,
            "",
            "Bem/Serviço oferecido pelo 2º Permutante:",
            `Descrição detalhada: ${verificarValor(dados.descricaoSegundo)}`,
            `Estado de conservação: ${verificarValor(dados.estadoConversaSegundo)}`,
            `Quantidade: ${verificarValor(dados.quantidadeSegundo)}`,
            `Valor estimado: ${verificarValor(dados.valorEstimadoSegundo)}`,
            `Documentação pertinente: ${verificarValor(dados.documentoPertinenteSegundo)}`,
            `Possíveis encargos ou tributos envolvidos: ${verificarValor(dados.encargosSegundo)}`,
            `Condições de uso e manutenção: ${verificarValor(dados.manutencaoSegundo)}`
        ]);

        // 3. DA TORNA (Se Aplicável)
        addClause("3. DA TORNA (Se Aplicável)", [
            "Caso haja diferença de valores entre os bens ou serviços permutados, as partes acordam quanto ao pagamento da torna:",
            `Necessidade de pagamento de complemento? ${verificarValor(dados.complemento)}`,
            `Parte responsável pelo pagamento: ${verificarValor(dados.parteResponsavel)}`,
            `Valor do complemento (torna): ${verificarValor(dados.valorComplemento)}`,
            `Data e forma de pagamento: ${verificarValor(dados.dataPagamento)} - ${verificarValor(dados.formaPagamento)}`,
            `Encargos ou juros em caso de atraso: ${verificarValor(dados.encargosJuros)}`,
            `Penalidades por inadimplência: ${verificarValor(dados.penalidades)}`
        ]);

        // 4. DA ENTREGA E POSSE
        addClause("4. DA ENTREGA E POSSE", [
            `Data de troca dos bens ou execução dos serviços: ${verificarValor(dados.dataTroca)}`,
            `Local e condições de entrega: ${verificarValor(dados.localCondicoes)}`,
            `Eventuais custos de transporte e responsabilidade sobre os mesmos: ${verificarValor(dados.eventuaisResponsabilidade)}`,
            `Procedimentos para inspeção e aceitação dos bens ou serviços: ${verificarValor(dados.procedimentos)}`,
            `Transferência de titularidade e documentos necessários: ${verificarValor(dados.tranferTitularidade)}`
        ]);

        // 5. DAS RESPONSABILIDADES E OBRIGAÇÕES
        addClause("5. DAS RESPONSABILIDADES E OBRIGAÇÕES", [
            "Cada permutante assume as seguintes responsabilidades e obrigações:",
            "- Garantia da autenticidade e legalidade dos bens ou serviços trocados;",
            "- Compromisso de entrega dos bens ou execução dos serviços nas condições acordadas;",
            "- Qualidade e funcionamento adequado dos bens permutados;",
            "- Obrigação de arcar com eventuais encargos fiscais e tributários decorrentes da permuta;",
            "- Responsabilidade por vícios ocultos ou defeitos nos bens trocados;",
            "- Manutenção e conservação dos bens até a data da troca;",
            "- Assunção de eventuais débitos ou ônus vinculados aos bens antes da troca;"
        ]);

        // 6. PENALIDADES
        addClause("6. PENALIDADES", [
            `Multa em caso de descumprimento das cláusulas contratuais: ${verificarValor(dados.multaContratuais)}`,
            `Juros e correções aplicáveis em caso de inadimplência: ${verificarValor(dados.jurosCorrecao)}`,
            `Responsabilidade por danos decorrentes de não cumprimento do contrato: ${verificarValor(dados.responsabilidade)}`,
            `Direito da parte prejudicada de rescindir o contrato sem ônus adicionais: ${verificarValor(dados.direito)}`,
            `Indenização por eventuais prejuízos financeiros comprovados: ${verificarValor(dados.indenizacao)}`
        ]);

        // 7. RESCISÃO
        addClause("7. RESCISÃO", [
            "O presente contrato poderá ser rescindido nos seguintes casos:",
            "- Descumprimento de qualquer cláusula por uma das partes;",
            "- Caso fortuito ou força maior que impeça a execução da permuta;",
            "- Acordo mútuo entre as partes;",
            "- Comprovação de irregularidades nos bens ou serviços permutados.",
            "",
            `Multa aplicável em caso de desistência imotivada: ${verificarValor(dados.multaRescisao)}`,
            `Valor e condições de pagamento: ${verificarValor(dados.valorCondicao)}`
        ]);

        // 8. FORO
        addClause("8. FORO", [
            `Fica eleito o foro da Comarca de ${verificarValor(dados.cidade)}/${verificarValor(dados.estado)} para dirimir quaisquer controvérsias decorrentes deste contrato.`
        ]);

        // 9. DISPOSIÇÕES FINAIS
        addClause("9. DISPOSIÇÕES FINAIS", [
            "Este contrato é firmado em caráter irrevogável e irretratável, obrigando as partes e seus sucessores legais.",
            "Caso qualquer cláusula seja considerada inválida, tal invalidade não afetará as demais cláusulas do contrato.",
            "As partes declaram estar cientes e de acordo com todas as disposições deste contrato, tendo discutido e ajustado todas as cláusulas.",
            "Todas as comunicações entre as partes referentes a este contrato deverão ser feitas por escrito e enviadas para os endereços ou e-mails informados.",
            "As partes se comprometem a cumprir integralmente todas as obrigações previstas neste contrato, sob pena das penalidades aqui estipuladas.",
            "Todas as taxas, impostos e custos associados à transferência dos bens permutados serão de responsabilidade da parte que os originou, salvo acordo em contrário."
        ]);

        // 10. ASSINATURAS E TESTEMUNHAS
        addClause("10. ASSINATURAS E TESTEMUNHAS", [
            `Local e Data de Assinatura: ${verificarValor(dados.cidade)}, ${verificarValor(dados.estado)}, ${verificarValor(dados.dataAssinatura)}`,
            "",
            "1º Permutante:",
            "",
            "________________________________________",
            `Nome: ${dados.pessoaPermutante === "juridico" ? verificarValor(dados.razaoSocial) : verificarValor(dados.nomePermutante)}`,
            `CPF/CNPJ: ${dados.pessoaPermutante === "juridico" ? verificarValor(dados.cnpj) : verificarValor(dados.cpfPermutante)}`,
            "",
            "2º Permutante:",
            "",
            "________________________________________",
            `Nome: ${dados.pessoaSegPermutante === "juridico" ? verificarValor(dados.razaoSocialSegundo) : verificarValor(dados.nomePermutanteSegundo)}`,
            `CPF/CNPJ: ${dados.pessoaSegPermutante === "juridico" ? verificarValor(dados.cnpjSegundo) : verificarValor(dados.cpfPermutanteSegundo)}`
        ]);

        // Testemunhas (se necessário)
        if (dados.testemunhasNecessarias === 'S') {
            addClause("", [
                "",
                "TESTEMUNHAS:",
                "",
                "1ª Testemunha:",
                "",
                "________________________________________",
                `Nome: ${verificarValor(dados.nomeTest1)}`,
                `CPF: ${verificarValor(dados.cpfTest1)}`,
                `Endereço: ${verificarValor(dados.enderecoPermutante)}`, // Poderia adicionar campo específico para endereço das testemunhas se necessário
                "",
                "2ª Testemunha:",
                "",
                "________________________________________",
                `Nome: ${verificarValor(dados.nomeTest2)}`,
                `CPF: ${verificarValor(dados.cpfTest2)}`,
                `Endereço: ${verificarValor(dados.enderecoPermutanteSegundo)}` // Poderia adicionar campo específico para endereço das testemunhas se necessário
            ]);
        }

        // Registro em cartório (se necessário)
        if (dados.registroCartorioTest === 'S') {
            addClause("", [
                "",
                "REGISTRO EM CARTÓRIO:",
                "As partes concordam com o registro deste contrato em cartório competente.",
                "",
                "________________________________________",
                "Assinatura do Tabelião",
                `Data do Registro: ${verificarValor(dados.dataAssinatura)}`,
                `Livro: ______________ Folha: ______________ Nº: ______________`
            ]);
        }
        // Salvar o PDF
        const pdfDataUri = doc.output("datauristring");
        setPdfDataUrl(pdfDataUri);
    };

    useEffect(() => {
        geradorTrocaSimplesPdf({ ...formData });
    }, [formData]);

    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title">Contrato de Permuta (Troca Simples) </h1>
            </div>
            <div className="container">
                <div className="left-panel">
                    <div className="scrollable-card">
                        <div className="progress-bar">
                            <div
                                className="progress-bar-inner"
                                style={{ width: `${(step / 80) * 100}%` }}
                            ></div>
                        </div>
                        <div className="form-wizard">
                            {step === 1 && (
                                <>
                                    <h2>Primeiro Permutante </h2>                                    <div>
                                        <label>É pessoa </label>
                                        <select name='pessoaPermutante' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="fisica">Física</option>
                                            <option value="juridico">Jurídico</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <h2>Primeiro Permutante </h2>                                    <div>
                                        <label>Nome completo</label>
                                        <input
                                            type='text'
                                            placeholder='Nome do Permutante'
                                            name="nomePermutante"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 3 && (
                                <>
                                    <h2>Primeiro Permutante</h2>                                    <div>
                                        <label>Sexo</label>
                                        <select name='sexoPermutante' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="F">Feminino</option>
                                            <option value="M">Masculino</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 4 && (
                                <>
                                    <h2>Primeiro Permutante </h2>                                    <div>
                                        <label>Estado Cívil</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="estadoCivilPermutante"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 5 && (
                                <>
                                    <h2>Primeiro Permutante </h2>                                    <div>
                                        <label>Nacionalidade</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="nacionalidadePermutante"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 6 && (
                                <>
                                    <h2>Primeiro Permutante </h2>                                    <div>
                                        <label>Profissão</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="profissaoPermutante"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 7 && (
                                <>
                                    <h2>Primeiro Permutante </h2>                                    <div>
                                        <label>Documento de Identificação</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="documentoPermutante"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 8 && (
                                <>
                                    <h2>Primeiro Permutante </h2>                                    <div>
                                        <label>Número do Documento</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="numeroPermutante"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 9 && (
                                <>
                                    <h2>Primeiro Permutante </h2>                                    <div>
                                        <label>CPF</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="cpfPermutante"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 10 && (
                                <>
                                    <h2>Primeiro Permutante </h2>                                    <div>
                                        <label>Endereço</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="enderecoPermutante"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 11 && (
                                <>
                                    <h2>Primeiro Permutante </h2>                                    <div>
                                        <label>Contato</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="contatoPermuntante"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}



                            {juridicoPermutante && (
                                <>
                                    {step === 12 && (
                                        <>
                                            <h2>Primeiro Permutante Jurídico</h2>                                    <div>
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

                                    {step === 13 && (
                                        <>
                                            <h2>Primeiro Permutante Jurídico</h2>                                    <div>
                                                <label>Razão Social</label>
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

                                    {step === 14 && (
                                        <>
                                            <h2>Primeiro Permutante Jurídico</h2>                                    <div>
                                                <label>Endereço </label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="enderecoJuridico"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 15 && (
                                        <>
                                            <h2>Primeiro Permutante Jurídico</h2>                                    <div>
                                                <label>Nome do Representante Legal </label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="nomeRepresentante"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 16 && (
                                        <>
                                            <h2>Primeiro Permutante Jurídico</h2>                                    <div>
                                                <label>Cargo do Representante </label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cargoRepresentante"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 17 && (
                                        <>
                                            <h2>Primeiro Permutante Jurídico</h2>                                    <div>
                                                <label>CPF representante</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cpfRepresentante"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 18 && (
                                        <>
                                            <h2>Primeiro Permutante Jurídico</h2>                                    <div>
                                                <label>Endereço representante</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="enderecoRepresentante"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 19 && (
                                        <>
                                            <h2>Primeiro Permutante Jurídico</h2>                                    <div>
                                                <label>Telefone representante</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="telefoneRepresentante"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}


                            {step === 20 && (
                                <>
                                    <h2>Segundo Permutante </h2>                                    <div>
                                        <label>É pessoa </label>
                                        <select name='pessoaSegPermutante' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="fisica">Física</option>
                                            <option value="juridico">Jurídico</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 21 && (
                                <>
                                    <h2>Segundo Permutante </h2>                                    <div>
                                        <label>Nome completo</label>
                                        <input
                                            type='text'
                                            placeholder='Nome do Permutante'
                                            name="nomePermutanteSegundo"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 22 && (
                                <>
                                    <h2>Segundo Permutante</h2>                                    <div>
                                        <label>Sexo</label>
                                        <select name='sexoPermutanteSegundo' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="F">Feminino</option>
                                            <option value="M">Masculino</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 23 && (
                                <>
                                    <h2>Segundo Permutante </h2>                                    <div>
                                        <label>Estado Cívil</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="estadoCivilPermutanteSegundo"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 24 && (
                                <>
                                    <h2>Segundo Permutante </h2>                                    <div>
                                        <label>Nacionalidade</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="nacionalidadePermutanteSegundo"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 25 && (
                                <>
                                    <h2>Segundo Permutante </h2>                                    <div>
                                        <label>Profissão</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="profissaoPermutanteSegundo"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 26 && (
                                <>
                                    <h2>Segundo Permutante </h2>                                    <div>
                                        <label>Documento de Identificação</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="documentoPermutanteSegundo"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 27 && (
                                <>
                                    <h2>Segundo Permutante </h2>                                    <div>
                                        <label>Número do Documento</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="numeroPermutanteSegundo"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 28 && (
                                <>
                                    <h2>Segundo Permutante </h2>                                    <div>
                                        <label>CPF</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="cpfPermutanteSegundo"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 29 && (
                                <>
                                    <h2>Segundo Permutante </h2>                                    <div>
                                        <label>Endereço</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="enderecoPermutanteSegundo"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 30 && (
                                <>
                                    <h2>Segundo Permutante </h2>                                    <div>
                                        <label>Contato</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="contatoPermuntanteSegundo"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}



                            {juridicoSegPermutante && (
                                <>
                                    {step === 31 && (
                                        <>
                                            <h2>Segundo Permutante Jurídico</h2>                                    <div>
                                                <label>Razão Social</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="razaoSocialSegundo"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 32 && (
                                        <>
                                            <h2>Segundo Permutante Jurídico</h2>                                    <div>
                                                <label>CNPJ</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cnpjSegundo"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 33 && (
                                        <>
                                            <h2>Segundo Permutante Jurídico</h2>                                    <div>
                                                <label>Endereço </label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="enderecoJuridicoSegundo"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 34 && (
                                        <>
                                            <h2>Segundo Permutante Jurídico</h2>                                    <div>
                                                <label>Nome do Representante Legal </label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="nomeRepresentanteSegundo"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 35 && (
                                        <>
                                            <h2>Segundo Permutante Jurídico</h2>                                    <div>
                                                <label>Cargo do Representante </label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cargoRepresentanteSegundo"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 36 && (
                                        <>
                                            <h2>Segundo Permutante Jurídico</h2>                                    <div>
                                                <label>CPF representante</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cpfRepresentanteSegundo"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 37 && (
                                        <>
                                            <h2>Segundo Permutante Jurídico</h2>                                    <div>
                                                <label>Endereço representante</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="enderecoRepresentanteSegundo"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 38 && (
                                        <>
                                            <h2>Segundo Permutante Jurídico</h2>                                    <div>
                                                <label>Telefone representante</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="telefoneRepresentanteSegundo"
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
                                    <h2>Bem/Serviço oferecido pelo 1º Permutante </h2>                                    <div>
                                        <label>Descrição detalhada</label>
                                        <textarea
                                            id="descricao"
                                            name="descricao"
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
                                    <h2>Bem/Serviço oferecido pelo 1º Permutante </h2>                                    <div>
                                        <label>Estado de conservação</label>
                                        <textarea
                                            id="estadoConversa"
                                            name="estadoConversa"
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

                            {step === 41 && (
                                <>
                                    <h2>Bem/Serviço oferecido pelo 1º Permutante </h2>                                    <div>
                                        <label>Quantidade</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="quantidade"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 42 && (
                                <>
                                    <h2>Bem/Serviço oferecido pelo 1º Permutante </h2>                                    <div>
                                        <label>Valor estimado</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="valorEstimado"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 43 && (
                                <>
                                    <h2>Bem/Serviço oferecido pelo 1º Permutante </h2>                                    <div>
                                        <label>Documentação pertinente</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="documentoPertinente"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 44 && (
                                <>
                                    <h2>Bem/Serviço oferecido pelo 1º Permutante </h2>                                    <div>
                                        <label>Possíveis encargos ou tributos envolvidos</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="encargos"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 45 && (
                                <>
                                    <h2>Bem/Serviço oferecido pelo 1º Permutante </h2>                                    <div>
                                        <label>Condições de uso e manutenção</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="manutencao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 46 && (
                                <>
                                    <h2>Bem/Serviço oferecido pelo 2º Permutante </h2>                                    <div>
                                        <label>Descrição detalhada</label>
                                        <textarea
                                            id="descricaoSegundo"
                                            name="descricaoSegundo"
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

                            {step === 47 && (
                                <>
                                    <h2>Bem/Serviço oferecido pelo 1º Permutante </h2>                                    <div>
                                        <label>Estado de conservação</label>
                                        <textarea
                                            id="estadoConversaSegundo"
                                            name="estadoConversaSegundo"
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

                            {step === 48 && (
                                <>
                                    <h2>Bem/Serviço oferecido pelo 2º Permutante </h2>                                    <div>
                                        <label>Quantidade</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="quantidadeSegundo"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 49 && (
                                <>
                                    <h2>Bem/Serviço oferecido pelo 2º Permutante </h2>                                    <div>
                                        <label>Valor estimado</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="valorEstimadoSegundo"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 50 && (
                                <>
                                    <h2>Bem/Serviço oferecido pelo 2º Permutante </h2>                                    <div>
                                        <label>Documentação pertinente</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="documentoPertinenteSegundo"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 51 && (
                                <>
                                    <h2>Bem/Serviço oferecido pelo 2º Permutante </h2>                                    <div>
                                        <label>Possíveis encargos ou tributos envolvidos</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="encargosSegundo"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 52 && (
                                <>
                                    <h2>Bem/Serviço oferecido pelo 2º Permutante </h2>                                    <div>
                                        <label>Condições de uso e manutenção</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="manutencaoSegundo"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 53 && (
                                <>
                                    <h2>Da Torna </h2>                                    <div>
                                        <label>Caso haja diferença de valores entre os bens ou serviços permutados,
                                            as partes acordam quanto ao pagamento da torna
                                            Necessidade de pagamento de complemento?
                                        </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="complemento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 54 && (
                                <>
                                    <h2>Da Torna </h2>                                    <div>
                                        <label>Parte responsável pelo pagamento</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="parteResponsavel"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 55 && (
                                <>
                                    <h2>Da Torna </h2>                                    <div>
                                        <label>Valor do complemento (torna)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="valorComplemento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 56 && (
                                <>
                                    <h2>Da Torna </h2>                                    <div>
                                        <label>Data de pagamento</label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="dataPagamento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 57 && (
                                <>
                                    <h2>Da Torna </h2>                                    <div>
                                        <label>Forma de pagamento</label>
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


                            {step === 58 && (
                                <>
                                    <h2>Da Torna </h2>                                    <div>
                                        <label>Encargos ou juros em caso de atraso</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="encargosJuros"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 59 && (
                                <>
                                    <h2>Da Torna </h2>                                    <div>
                                        <label>Penalidades por inadimplência</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="penalidades"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 60 && (
                                <>
                                    <h2>Da Torna </h2>                                    <div>
                                        <label>Data de troca dos bens ou execução dos serviços</label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="dataTroca"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 61 && (
                                <>
                                    <h2>Da Torna </h2>                                    <div>
                                        <label>Local e condições de entrega</label>
                                        <textarea
                                            id="localCondicoes"
                                            name="localCondicoes"
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

                            {step === 62 && (
                                <>
                                    <h2>Da Torna </h2>                                    <div>
                                        <label>Eventuais custos de transporte e responsabilidade sobre os mesmos</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="eventuaisResponsabilidade"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 63 && (
                                <>
                                    <h2>Da Torna </h2>                                    <div>
                                        <label>Procedimentos para inspeção e aceitação dos bens ou serviços</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="procedimentos"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 64 && (
                                <>
                                    <h2>Da Torna </h2>                                    <div>
                                        <label>Transferência de titularidade e documentos necessários</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="tranferTitularidade"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 65 && (
                                <>
                                    <h2>Penalidades </h2>                                    <div>
                                        <label>Multa em caso de descumprimento das cláusulas contratuais</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="multaContratuais"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 66 && (
                                <>
                                    <h2>Penalidades </h2>                                    <div>
                                        <label>Juros e correções aplicáveis em caso de inadimplência</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="jurosCorrecao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 67 && (
                                <>
                                    <h2>Penalidades </h2>                                    <div>
                                        <label>Responsabilidade por danos decorrentes de não cumprimento do contrato</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="responsabilidade"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}



                            {step === 68 && (
                                <>
                                    <h2>Penalidades </h2>                                    <div>
                                        <label>Direito da parte prejudicada de rescindir o contrato sem ônus adicionais</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="direito"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 69 && (
                                <>
                                    <h2>Penalidades </h2>                                    <div>
                                        <label>Indenização por eventuais prejuízos financeiros comprovados</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="indenizacao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 70 && (
                                <>
                                    <h2>Rescisão </h2>                                    <div>
                                        <label>Multa aplicável em caso de desistência imotivada</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="multaRescisao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 71 && (
                                <>
                                    <h2>Rescisão </h2>                                    <div>
                                        <label>Valor e condições de pagamento</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="valorCondicao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 72 && (
                                <>
                                    <h2>Disposições Gerais</h2>                                    <div>
                                        <label>Cidade de Assinatura</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="cidade"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 73 && (
                                <>
                                    <h2>Disposições Gerais</h2>                                    <div>
                                        <label>Estado de Assinatura</label>
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

                            {step === 74 && (
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
                                            <select name='registroCartorioTest' onChange={handleChange}>
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


                            {step === 81 && (
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
                    <button className='btnBaixarPdf' onClick={() => { geradorTrocaSimplesPago(formData) }}>
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