'use client'
import Pilha from '@/lib/pilha';
import { verificarValor } from '@/lib/utils';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';
import geradorPermutaImoveisPago from '../util/pdf';


const permutaimoveisschema = z.object({

    pessoaPermutante: z.enum(['fisica', 'juridico']),


    /**1 permutante */
    nomeCompleto: z.string(),
    sexo: z.enum(['M', 'F']),
    nacionalidade: z.string(),
    estadoCivil: z.string(),
    profissao: z.string(),
    rg: z.string(),
    cpf: z.string(),
    enderecoResi: z.string(),
    email: z.string(),
    telefone: z.string(),
    /** */

    /**Pessoa Juridica 1 permutante */
    razaoSocial: z.string(),
    cnpj: z.string(),
    inscricaoEstadual: z.string(),
    sede: z.string(),
    nomeRepresentante: z.string(),
    cargoRepresentante: z.string(),
    rgRepresentante: z.string(),
    cpfRepresentante: z.string(),
    /** */


    pessoaSegPermutante: z.enum(['fisica', 'juridico']),


    /**2 permutante */
    nomeCompletoSeg: z.string(),
    sexoSeg: z.enum(['M', 'F']),
    nacionalidadeSeg: z.string(),
    estadoCivilSeg: z.string(),
    profissaoSeg: z.string(),
    rgSeg: z.string(),
    cpfSeg: z.string(),
    enderecoResiSeg: z.string(),
    emailSeg: z.string(),
    telefoneSeg: z.string(),
    /** */

    /**Pessoa Juridica 2 permutante */
    razaoSocialSeg: z.string(),
    cnpjSeg: z.string(),
    inscricaoEstadualSeg: z.string(),
    sedeSeg: z.string(),
    nomeRepresentanteSeg: z.string(),
    cargoRepresentanteSeg: z.string(),
    rgRepresentanteSeg: z.string(),
    cpfRepresentanteSeg: z.string(),
    /** */

    /**Imovel do 1 Permutante */
    endereco1permutante: z.string(),
    descricaoDetalhe: z.string(),
    matricula: z.string(),
    cartorioRegistro: z.string(),
    valorAtribuido: z.string(),
    mobilia: z.enum(['S', 'N']),
    //se sim 
    descricaoMobilia: z.string(),
    /** */

    /**Imovel do 2 Permutante */
    endereco2permutante: z.string(),
    descricaoSegDetalhe: z.string(),
    matriculaSeg: z.string(),
    cartorioSegRegistro: z.string(),
    valorSegAtribuido: z.string(),
    mobiliaSeg: z.enum(['S', 'N']),
    //se sim 
    descricaoMobiliaSeg: z.string(),
    /** */

    /**equivalencia de valores e torna */
    valorTorna: z.string(),
    formaPagamento: z.string(),
    prazoPagamento: z.string(),
    multaInadimplemento: z.string(),
    localPagamento: z.string(),
    jurosMora: z.string(),
    /** */

    /**Da entrega,posse e tranferência */
    dataEntrega: z.string(),
    prazo: z.string(),
    /** */

    /**Rescisão Contratual */
    multaRescisoria: z.string(),
    /** */

    /**Multa por Inadimplemento */
    valorInadimplente: z.string(),
    jurosMoratorios: z.string(),
    indice: z.string(),
    /** */

    /**foro */
    cidade: z.string(),
    estado: z.string(),
    /** */
});

type FormData = z.infer<typeof permutaimoveisschema>;

export default function PermutaImoveis() {
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
    const [Testemunhas, setTestemunhas] = useState(false);
    const [juridicoPermutante, setJuridicoPermutante] = useState(false);
    const [juridicoSegPermutante, setJuridicoSegPermutante] = useState(false);
    const [mobilia, setMobilia] = useState(false);
    const [mobiliaSeg, setMobiliaSeg] = useState(false);
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

        if (currentStepData.pessoaPermutante === 'fisica') {
            nextStep = 2;
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

        if (currentStepData.mobilia === 'S') {
            setMobilia(true);
            nextStep = 45;
        } else if (currentStepData.mobilia === 'N') {
            nextStep = 46;
        }


        if (currentStepData.mobiliaSeg === 'S') {
            setMobiliaSeg(true);
            nextStep = 52;
        } else if (currentStepData.mobiliaSeg === 'N') {
            nextStep = 53;
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



    const geradorPermutaImoveisPdf = (dados: any) => {
        const doc = new jsPDF();

        // Configuração inicial de fonte ABNT e margens
        doc.setFont("Times");
        const marginLeft = 30;
        const marginRight = 20;
        const marginTop = 20;
        const marginBottom = 20;
        let posY = marginTop;

        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        const maxTextWidth = pageWidth - marginLeft - marginRight;

        // Espaçamento entre linhas 1,5
        const lineHeight = 7.5;

        // Função auxiliar para verificar espaço restante na página
        const checkPageBreak = (additionalHeight: number) => {
            if (posY + additionalHeight >= pageHeight - marginBottom) {
                doc.addPage();
                posY = marginTop;
            }
        };

        // Função auxiliar para adicionar seções formatadas segundo ABNT
        const addSection = (title: string, content: string[]) => {
            const titleHeight = 10;

            // Título da seção
            checkPageBreak(titleHeight);
            doc.setFontSize(12);
            doc.setFont("Times", "bold");
            doc.text(title, pageWidth / 2, posY, { align: "center" });
            posY += titleHeight;

            // Texto do conteúdo
            doc.setFontSize(12);
            doc.setFont("Times", "normal");
            content.forEach((line: string) => {
                const splitLines = doc.splitTextToSize(line, maxTextWidth);
                splitLines.forEach((splitLine: string) => {
                    checkPageBreak(lineHeight);
                    doc.text(splitLine, marginLeft, posY);
                    posY += lineHeight;
                });
            });
        };

        // Cabeçalho da primeira página
        doc.setFontSize(14);
        doc.setFont("Times", "bold");
        doc.text("CONTRATO PARTICULAR DE PERMUTA DE IMÓVEIS", pageWidth / 2, posY, { align: "center" });
        posY += 15;

        doc.setFontSize(12);
        doc.setFont("Times", "normal");
        const introText = "Pelo presente instrumento particular de permuta de imóveis, de um lado:";
        const introLines = doc.splitTextToSize(introText, maxTextWidth);
        introLines.forEach((line: string | string[]) => {
            checkPageBreak(lineHeight);
            doc.text(line, marginLeft, posY);
            posY += lineHeight;
        });


        // Seção 1 - Identificação das Partes
        addSection("1. IDENTIFICAÇÃO DAS PARTES", [
            "1.1. PRIMEIRO PERMUTANTE",
            `Pessoa ${dados.pessoaPermutante === 'fisica' ? 'Física' : 'Jurídica'}`,
            ...(dados.pessoaPermutante === 'fisica' ? [
                `Nome completo: ${verificarValor(dados.nomeCompleto)}`,
                `Sexo: ${verificarValor(dados.sexo)}`,
                `Nacionalidade: ${verificarValor(dados.nacionalidade)}`,
                `Estado Civil: ${verificarValor(dados.estadoCivil)}`,
                `Profissão: ${verificarValor(dados.profissao)}`,
                `RG: ${verificarValor(dados.rg)}`,
                `CPF nº: ${verificarValor(dados.cpf)}`,
                `Endereço residencial: ${verificarValor(dados.enderecoResi)}`,
                `E-mail: ${verificarValor(dados.email)}`,
                `Telefone: ${verificarValor(dados.telefone)}`
            ] : [
                `Razão Social: ${verificarValor(dados.razaoSocial)}`,
                `CNPJ nº: ${verificarValor(dados.cnpj)}`,
                `Inscrição Estadual: ${verificarValor(dados.inscricaoEstadual)}`,
                `Sede: ${verificarValor(dados.sede)}`,
                "Representada neste ato por seu(s) representante(s) legal(is):",
                `Nome do representante: ${verificarValor(dados.nomeRepresentante)}`,
                `Cargo: ${verificarValor(dados.cargoRepresentante)}`,
                `RG: ${verificarValor(dados.rgRepresentante)}`,
                `CPF: ${verificarValor(dados.cpfRepresentante)}`
            ]),
            "",
            "1.2. SEGUNDO PERMUTANTE",
            `Pessoa ${dados.pessoaSegPermutante === 'fisica' ? 'Física' : 'Jurídica'}`,
            ...(dados.pessoaSegPermutante === 'fisica' ? [
                `Nome completo: ${verificarValor(dados.nomeCompletoSeg)}`,
                `Sexo: ${verificarValor(dados.sexoSeg)}`,
                `Nacionalidade: ${verificarValor(dados.nacionalidadeSeg)}`,
                `Estado Civil: ${verificarValor(dados.estadoCivilSeg)}`,
                `Profissão: ${verificarValor(dados.profissaoSeg)}`,
                `RG: ${verificarValor(dados.rgSeg)}`,
                `CPF nº: ${verificarValor(dados.cpfSeg)}`,
                `Endereço residencial: ${verificarValor(dados.enderecoResiSeg)}`,
                `E-mail: ${verificarValor(dados.emailSeg)}`,
                `Telefone: ${verificarValor(dados.telefoneSeg)}`
            ] : [
                `Razão Social: ${verificarValor(dados.razaoSocialSeg)}`,
                `CNPJ nº: ${verificarValor(dados.cnpjSeg)}`,
                `Inscrição Estadual: ${verificarValor(dados.inscricaoEstadualSeg)}`,
                `Sede: ${verificarValor(dados.sedeSeg)}`,
                "Representada neste ato por seu(s) representante(s) legal(is):",
                `Nome do representante: ${verificarValor(dados.nomeRepresentanteSeg)}`,
                `Cargo: ${verificarValor(dados.cargoRepresentanteSeg)}`,
                `RG: ${verificarValor(dados.rgRepresentanteSeg)}`,
                `CPF: ${verificarValor(dados.cpfRepresentanteSeg)}`
            ])
        ]);

        // Seção 2 - Do Objeto do Contrato
        addSection("2. DO OBJETO DO CONTRATO", [
            "As partes acima identificadas têm, entre si, justo e contratado a permuta de bens imóveis, mediante as seguintes condições:",
            "",
            "2.1. Imóvel do 1º Permutante",
            `Endereço completo: ${verificarValor(dados.endereco1permutante)}`,
            `Descrição detalhada: ${verificarValor(dados.descricaoDetalhe)}`,
            `Matrícula nº: ${verificarValor(dados.matricula)}`,
            `Cartório de Registro de Imóveis: ${verificarValor(dados.cartorioRegistro)}`,
            `Valor atribuído: R$ ${verificarValor(dados.valorAtribuido)}`,
            `Mobília inclusa: ${dados.mobilia === 'S' ? 'Sim' : 'Não'}`,
            ...(dados.mobilia === 'S' ? [`Descrição da mobília: ${verificarValor(dados.descricaoMobilia)}`] : []),
            "",
            "2.2. Imóvel do 2º Permutante",
            `Endereço completo: ${verificarValor(dados.endereco2permutante)}`,
            `Descrição detalhada: ${verificarValor(dados.descricaoSegDetalhe)}`,
            `Matrícula nº: ${verificarValor(dados.matriculaSeg)}`,
            `Cartório de Registro de Imóveis: ${verificarValor(dados.cartorioSegRegistro)}`,
            `Valor atribuído: R$ ${verificarValor(dados.valorSegAtribuido)}`,
            `Mobília inclusa: ${dados.mobiliaSeg === 'S' ? 'Sim' : 'Não'}`,
            ...(dados.mobiliaSeg === 'S' ? [`Descrição da mobília: ${verificarValor(dados.descricaoMobiliaSeg)}`] : [])
        ]);

        // Seção 3 - Da Equivalência de Valores e Torna
        addSection("3. DA EQUIVALÊNCIA DE VALORES E TORNA", [
            "Caso haja diferença de valor entre os imóveis, a parte cujo imóvel tem valor inferior se compromete a pagar à outra a quantia equivalente a:",
            `Valor da torna: R$ ${verificarValor(dados.valorTorna)}`,
            `Forma de pagamento: ${verificarValor(dados.formaPagamento)}`,
            `Prazo para pagamento: ${verificarValor(dados.prazoPagamento)}`,
            `Local de pagamento: ${verificarValor(dados.localPagamento)}`,
            `Multa por inadimplemento: ${verificarValor(dados.multaInadimplemento)}%`,
            `Juros de mora: ${verificarValor(dados.jurosMora)}% ao mês`,
            "A torna será quitada mediante recibo particular, com valor de título executivo, integrando o presente contrato."
        ]);

        // Seção 4 - Da Entrega, Posse e Transferência
        addSection("4. DA ENTREGA, POSSE E TRANSFERÊNCIA", [
            `A entrega da posse dos imóveis será efetuada na data de ${verificarValor(dados.dataEntrega)}`,
            `As partes se comprometem a realizar, no prazo máximo de ${verificarValor(dados.prazo)} dias úteis, as providências legais para a transferência definitiva dos bens nos respectivos Cartórios de Registro de Imóveis.`,
            "As despesas cartorárias e tributárias referentes à transferência serão custeadas pelas partes em partes iguais (50/50)."
        ]);

        // Seção 5 - Das Obrigações e Responsabilidades das Partes
        addSection("5. DAS OBRIGAÇÕES E RESPONSABILIDADES DAS PARTES", [
            "5.1. As partes declaram:",
            "- Que são legítimas proprietárias dos imóveis ora permutados;",
            "- Que os bens estão livres e desembaraçados de quaisquer ônus reais, ações judiciais, débitos tributários, locações, penhoras, arrestos ou quaisquer outras restrições;",
            "- Que assumem plena responsabilidade por eventuais ônus ocultos, inclusive ambientais, perante o Poder Público ou terceiros.",
            "",
            "5.2. Garantias:",
            "- Cada permutante garante à outra parte a evicção de direito e responsabilidade civil e criminal por vícios ocultos ou defeitos preexistentes ao presente instrumento."
        ]);

        // Seção 6 - Condições Especiais
        addSection("6. CONDIÇÕES ESPECIAIS", [
            "- As partes declaram que tiveram ciência prévia de todas as características dos imóveis, tendo realizado vistorias e inspeções técnicas;",
            "- Eventuais ajustes quanto a reformas, demolições, autorizações, ou regularizações junto a órgãos públicos serão de responsabilidade da parte acordada;",
            "- Não há reserva de usufruto ou outras condições especiais neste contrato."
        ]);

        // Seção 7 - Da Rescisão Contratual
        addSection("7. DA RESCISÃO CONTRATUAL", [
            "O descumprimento injustificado das obrigações assumidas neste contrato por qualquer das partes, sem justificativa legal ou contratual, ensejará a rescisão, sujeitando o infrator às penalidades abaixo:",
            `Multa rescisória: R$ ${verificarValor(dados.multaRescisoria)}`,
            "- Perdas e danos: conforme apurados judicial ou extrajudicialmente",
            "- Retorno das partes ao status quo ante, com eventuais compensações monetárias"
        ]);

        // Seção 8 - Da Multa por Inadimplemento
        addSection("8. DA MULTA POR INADIMPLEMENTO", [
            "Em caso de descumprimento de qualquer cláusula contratual, será aplicada multa de:",
            `Valor: R$ ${verificarValor(dados.valorInadimplente)}`,
            `Cumulável com juros moratórios de ${verificarValor(dados.jurosMoratorios)}% ao mês e correção monetária pelo índice ${verificarValor(dados.indice)}, além de demais cominações legais.`
        ]);

        // Seção 9 - Da Resolução de Conflitos
        addSection("9. DA RESOLUÇÃO DE CONFLITOS", [
            "As partes elegem a mediação e arbitragem como meio preferencial de resolução de controvérsias. Não sendo possível, elegem o foro da comarca abaixo indicada, com exclusão de qualquer outro, por mais privilegiado que seja."
        ]);

        // Seção 10 - Do Foro
        addSection("10. DO FORO", [
            `Para dirimir eventuais dúvidas oriundas deste contrato, as partes elegem o foro da comarca de ${verificarValor(dados.cidade)}/${verificarValor(dados.estado)}.`
        ]);

        // Seção 11 - Disposições Finais
        addSection("11. DISPOSIÇÕES FINAIS", [
            "- Este contrato obriga as partes, seus herdeiros e sucessores;",
            "- Eventuais alterações deverão ser feitas por aditivo contratual escrito, firmado pelas partes;",
            "- Declaram ainda as partes que receberam vias originais e assinadas deste instrumento, com igual teor e forma, juntamente com eventuais anexos e recibos."
        ]);

        // Assinaturas
        checkPageBreak(60);
        doc.setFontSize(12);
        doc.text("Local e data: ___ de ______________ de ________.", marginLeft, posY);
        posY += 20;

        doc.text("ASSINATURAS", 105, posY, { align: "center" });
        posY += 15;

        doc.text("1º Permutante:", marginLeft, posY);
        posY += 10;
        doc.text("Nome: ______________________________", marginLeft, posY);
        posY += 10;
        doc.text("Assinatura: _________________________", marginLeft, posY);
        posY += 20;

        doc.text("2º Permutante:", marginLeft, posY);
        posY += 10;
        doc.text("Nome: ______________________________", marginLeft, posY);
        posY += 10;
        doc.text("Assinatura: _________________________", marginLeft, posY);
        posY += 20;

        doc.text("TESTEMUNHAS", 105, posY, { align: "center" });
        posY += 15;

        doc.text("Nome: ___________________________", marginLeft, posY);
        posY += 10;
        doc.text("CPF: ____________________________", marginLeft, posY);
        posY += 10;
        doc.text("Assinatura: ______________________", marginLeft, posY);
        posY += 15;

        doc.text("Nome: ___________________________", marginLeft, posY);
        posY += 10;
        doc.text("CPF: ____________________________", marginLeft, posY);
        posY += 10;
        doc.text("Assinatura: ______________________", marginLeft, posY);

        // Salvar o PDF
        const pdfDataUri = doc.output("datauristring");
        setPdfDataUrl(pdfDataUri);
    };

    useEffect(() => {
        geradorPermutaImoveisPdf({ ...formData });
    }, [formData]);

    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title">Contrato de Permuta (Troca) Imóveis </h1>
            </div>
            <div className="container">
                <div className="left-panel">
                    <div className="scrollable-card">
                        <div className="progress-bar">
                            <div
                                className="progress-bar-inner"
                                style={{ width: `${(step / 65) * 100}%` }}
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
                                    <h2>Primeiro Permutante </h2>                                    <div>
                                        <label>Sexo </label>
                                        <select name='sexo' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="M">Masculino</option>
                                            <option value="F">Feminino</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 4 && (
                                <>
                                    <h2>Primeiro Permutante </h2>                                    <div>
                                        <label>Nacionalidade</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="nacionalidade"
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
                                        <label>Estado Civil</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="estadoCivil"
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
                                            name="profissao"
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
                                        <label>Rg</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="rg"
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
                                        <label>CPF</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="cpf"
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
                                        <label>Endereço</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="enderecoResi"
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
                                        <label>Email</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="email"
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
                                        <label>Telefone</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="telefone"
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
                                            <h2>Primeiro Permutante </h2>                                    <div>
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
                                            <h2>Primeiro Permutante </h2>                                    <div>
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

                                    {step === 14 && (
                                        <>
                                            <h2>Primeiro Permutante </h2>                                    <div>
                                                <label>Inscrição Estadual(se aplicável)</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="inscricaoEstadual"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 15 && (
                                        <>
                                            <h2>Primeiro Permutante </h2>                                    <div>
                                                <label>Sede (endereço completo) </label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="sede"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}


                                    {step === 16 && (
                                        <>
                                            <h2>Primeiro Permutante </h2>                                    <div>
                                                <label>Nome do representante </label>
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

                                    {step === 17 && (
                                        <>
                                            <h2>Primeiro Permutante </h2>                                    <div>
                                                <label>Cargo do representante </label>
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

                                    {step === 18 && (
                                        <>
                                            <h2>Primeiro Permutante </h2>                                    <div>
                                                <label>Rg do representante </label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="rgRepresentante"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 19 && (
                                        <>
                                            <h2>Primeiro Permutante </h2>                                    <div>
                                                <label>Cpf do representante </label>
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
                                            name="nomeCompletoSeg"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 22 && (
                                <>
                                    <h2>Segundo Permutante </h2>                                    <div>
                                        <label>Sexo </label>
                                        <select name='sexoSeg' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="M">Masculino</option>
                                            <option value="F">Feminino</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 23 && (
                                <>
                                    <h2>Segundo Permutante </h2>                                    <div>
                                        <label>Nacionalidade</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="nacionalidadeSeg"
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
                                        <label>Estado Civil</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="estadoCivilSeg"
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
                                            name="profissaoSeg"
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
                                        <label>Rg</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="rgSeg"
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
                                        <label>CPF</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="cpfSeg"
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
                                        <label>Endereço</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="enderecoResiSeg"
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
                                        <label>Email</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="emailSeg"
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
                                        <label>Telefone</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="telefoneSeg"
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
                                            <h2>Segundo Permutante </h2>                                    <div>
                                                <label>Razão Social</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="razaoSocialSeg"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 32 && (
                                        <>
                                            <h2>Segundo Permutante </h2>                                    <div>
                                                <label>CNPJ</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cnpjSeg"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 33 && (
                                        <>
                                            <h2>Segundo Permutante </h2>                                    <div>
                                                <label>Inscrição Estadual(se aplicável)</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="inscricaoEstadualSeg"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 34 && (
                                        <>
                                            <h2>Segundo Permutante </h2>                                    <div>
                                                <label>Sede (endereço completo) </label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="sedeSeg"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}


                                    {step === 35 && (
                                        <>
                                            <h2>Segundo Permutante </h2>                                    <div>
                                                <label>Nome do representante </label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="nomeRepresentanteSeg"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 36 && (
                                        <>
                                            <h2>Segundo Permutante </h2>                                    <div>
                                                <label>Cargo do representante </label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cargoRepresentanteSeg"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 37 && (
                                        <>
                                            <h2>Segundo Permutante </h2>                                    <div>
                                                <label>Rg do representante </label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="rgRepresentanteSeg"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 38 && (
                                        <>
                                            <h2>Segundo Permutante </h2>                                    <div>
                                                <label>Cpf do representante </label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cpfRepresentanteSeg"
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
                                    <h2>Imóvel do Primeiro Permutante </h2>                                    <div>
                                        <label>Endereço completo </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="endereco1permutante"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 40 && (
                                <>
                                    <h2>Imóvel do Primeiro Permutante </h2>                                    <div>
                                        <label>Descrição detalhada: (área total, área construída, número de cômodos, pavimentos, benfeitorias, confrontações, estado de conservação)  </label>
                                        <textarea
                                            id="descricaoDetalhe"
                                            name="descricaoDetalhe"
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
                                    <h2>Imóvel do Primeiro Permutante </h2>                                    <div>
                                        <label>Matrícula nº </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="matricula"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 42 && (
                                <>
                                    <h2>Imóvel do Primeiro Permutante </h2>                                    <div>
                                        <label>Cartório de Registro de Imóveis </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="cartorioRegistro"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 43 && (
                                <>
                                    <h2>Imóvel do Primeiro Permutante </h2>                                    <div>
                                        <label>Valor atribuído </label>
                                        <input
                                            type='text'
                                            placeholder='R$'
                                            name="valorAtribuido"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 44 && (
                                <>
                                    <h2>Imóvel do Primeiro Permutante </h2>                                    <div>
                                        <label>Mobília inclusa </label>
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

                            {mobilia && (
                                <>
                                    {step === 45 && (
                                        <>
                                            <h2>Imóvel do Primeiro Permutante </h2>                                    <div>
                                                <label>Descrição detalhada: (área total, área construída, número de cômodos, pavimentos, benfeitorias, confrontações, estado de conservação)  </label>
                                                <textarea
                                                    id="descricaoMobilia"
                                                    name="descricaoMobilia"
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


                            {step === 46 && (
                                <>
                                    <h2>Imóvel do Segundo Permutante </h2>                                    <div>
                                        <label>Endereço completo </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="endereco2permutante"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 47 && (
                                <>
                                    <h2>Imóvel do Segundo Permutante </h2>                                    <div>
                                        <label>Descrição detalhada: (área total, área construída, número de cômodos, pavimentos, benfeitorias, confrontações, estado de conservação)  </label>
                                        <textarea
                                            id="descricaoSegDetalhe"
                                            name="descricaoSegDetalhe"
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
                                    <h2>Imóvel do Segundo Permutante </h2>                                    <div>
                                        <label>Matrícula nº </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="matriculaSeg"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 49 && (
                                <>
                                    <h2>Imóvel do Segundo Permutante </h2>                                    <div>
                                        <label>Cartório de Registro de Imóveis </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="cartorioSegRegistro"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 50 && (
                                <>
                                    <h2>Imóvel do Segundo Permutante </h2>                                    <div>
                                        <label>Valor atribuído </label>
                                        <input
                                            type='text'
                                            placeholder='R$'
                                            name="valorSegAtribuido"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 51 && (
                                <>
                                    <h2>Imóvel do Segundo Permutante </h2>                                    <div>
                                        <label>Mobília inclusa </label>
                                        <select name='mobiliaSeg' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {mobiliaSeg && (
                                <>
                                    {step === 52 && (
                                        <>
                                            <h2>Imóvel do Segundo Permutante </h2>                                    <div>
                                                <label>Descrição detalhada: (área total, área construída, número de cômodos, pavimentos, benfeitorias, confrontações, estado de conservação)  </label>
                                                <textarea
                                                    id="descricaoMobiliaSeg"
                                                    name="descricaoMobiliaSeg"
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

                            {step === 53 && (
                                <>
                                    <h2>Equivalência de Valores e Torna </h2>                                    <div>
                                        <label>Valor da torna </label>
                                        <input
                                            type='text'
                                            placeholder='R$'
                                            name="valorTorna"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 54 && (
                                <>
                                    <h2>Equivalência de Valores e Torna </h2>                                    <div>
                                        <label>Forma de pagamento </label>
                                        <input
                                            type='text'
                                            placeholder='R$'
                                            name="formaPagamento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 55 && (
                                <>
                                    <h2>Equivalência de Valores e Torna </h2>                                    <div>
                                        <label>Prazo para pagamento </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="prazoPagamento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 56 && (
                                <>
                                    <h2>Equivalência de Valores e Torna </h2>                                    <div>
                                        <label>Multa por inadimplemento </label>
                                        <input
                                            type='text'
                                            placeholder='%'
                                            name="multaInadimplemento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 57 && (
                                <>
                                    <h2>Equivalência de Valores e Torna </h2>                                    <div>
                                        <label>Local de pagamento </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="localPagamento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 58 && (
                                <>
                                    <h2>Equivalência de Valores e Torna </h2>                                    <div>
                                        <label>Juros de mora </label>
                                        <input
                                            type='text'
                                            placeholder='%'
                                            name="jurosMora"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 59 && (
                                <>
                                    <h2>Entrega,Posse e Transferência</h2>                                    <div>
                                        <label>A entrega da posse dos imóveis será efetuada na data de //____, simultaneamente pelas partes.  </label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="dataEntrega"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 60 && (
                                <>
                                    <h2>Entrega,Posse e Transferência </h2>                                    <div>
                                        <label>As partes se comprometem a realizar, no prazo máximo de ___ dias úteis, as providências legais para a transferência definitiva dos bens nos respectivos Cartórios de Registro de Imóveis.  </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="prazo"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 61 && (
                                <>
                                    <h2>Rescisão Contratual </h2>                                    <div>
                                        <label>Multa rescisória  </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="multaRescisoria"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 62 && (
                                <>
                                    <h2>Multa por Inadimplemento </h2>                                    <div>
                                        <label>Valor  </label>
                                        <input
                                            type='text'
                                            placeholder='R$'
                                            name="valorInadimplente"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 63 && (
                                <>
                                    <h2>Multa por Inadimplemento </h2>                                    <div>
                                        <label>Cumulável com juros moratórios de ___% ao mês e correção monetária..  </label>
                                        <input
                                            type='text'
                                            placeholder='%'
                                            name="jurosMoratorios"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 64 && (
                                <>
                                    <h2>Multa por Inadimplemento </h2>                                    <div>
                                        <label>..pelo índice ___, além de demais cominações legais.  </label>
                                        <input
                                            type='text'
                                            placeholder='%'
                                            name="indice"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 65 && (
                                <>
                                    <h2>Foro </h2>                                    <div>
                                        <label>Para dirimir eventuais dúvidas oriundas deste contrato, as partes elegem o foro da comarca de  </label>
                                        <input
                                            type='text'
                                            placeholder='Cidade'
                                            name="cidade"
                                            onChange={handleChange}
                                        />
                                        <input
                                            type='text'
                                            placeholder='Estado'
                                            name="estado"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 66 && (
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
                    <button className='btnBaixarPdf' onClick={() => { geradorPermutaImoveisPago(formData) }}>
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