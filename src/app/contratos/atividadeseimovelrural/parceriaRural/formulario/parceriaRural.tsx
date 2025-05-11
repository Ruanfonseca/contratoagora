'use client'
import Pilha from "@/lib/pilha";
import api from "@/services";
import axios from "axios";
import jsPDF from "jspdf";
import { useEffect, useRef, useState } from "react";
import { z } from 'zod';
import '../css/form.css';


const parceriaruralschema = z.object({

    outorgante: z.enum(['fisica', 'juridico']),

    /**OUTORGANTE (PARCEIRO CEDENTE) */
    nome: z.string(),
    cpf: z.string(),
    estadoCivil: z.string(),
    nacionalidade: z.string(),
    profissao: z.string(),
    documento: z.string(),
    endereco: z.string(),
    /** */

    /**OUTORGANTE PESSOA JURIDICA(PARCEIRO CEDENTE) */
    razaosocial: z.string(),
    cnpj: z.string(),
    sede: z.string(),
    nomeRepresentante: z.string(),
    cpfRepresentante: z.string(),
    cargoRepresentante: z.string(),
    documentoRepresentante: z.string(),
    enderecoRepresentante: z.string(),
    /** */

    outorgado: z.enum(['fisica', 'juridico']),

    /**OUTORGADO (PARCEIRO EXPLORADOR) */
    nomeOutorgado: z.string(),
    cpfOutorgado: z.string(),
    estadoCivilOutorgado: z.string(),
    nacionalidadeOutorgado: z.string(),
    profissaoOutorgado: z.string(),
    documentoOutorgado: z.string(),
    enderecoOutorgado: z.string(),
    /** */

    /**OUTORGADO (PARCEIRO EXPLORADOR) */
    razaosocialOutorgado: z.string(),
    cnpjOutorgado: z.string(),
    sedeOutorgado: z.string(),
    nomeRepresentanteOutorgado: z.string(),
    cpfRepresentanteOutorgado: z.string(),
    cargoRepresentanteOutorgado: z.string(),
    documentoRepresentanteOutorgado: z.string(),
    enderecoRepresentanteOutorgado: z.string(),
    /** */


    /**Objeto */
    atividade: z.enum(['agricola', 'pecuaria', 'agroindustrial', 'extrativa', 'mista']),
    //se for mista 
    descMista: z.string(),


    localizacao: z.string(),
    tamanho: z.string(),
    ccir: z.enum(['S', 'N']),
    //se sim 
    numeroCCIR: z.string(),
    registroCartorio: z.string(),
    matricula: z.string(),
    descBens: z.enum(['maquinas', 'ferramentas', 'animais', 'insumos', 'outros']),
    //se for outros 
    benfeitorias: z.string(),

    /** */

    /**Atividades Rurais */
    atividadeRural: z.enum(['imovel', 'parteImovel']),
    //se for parteImovel
    descPartImovel: z.string(),

    contribuicaoOutorgado: z.enum(['maoObra', 'equipMaquina', 'insumos', 'outrasFormas']),
    //se for outrasFormas
    descOutrasFormas: z.string(),
    /** */

    /*Partilha de Resultados*/
    resultOutorgante: z.string(),
    resultOutorgado: z.string(),

    qtdDias: z.string(),
    /**/


    /*Despesas e Encargos*/
    cuidados: z.enum(['Outorgado', 'Outorgante']),
    manutencao: z.enum(['Outorgado', 'Outorgante']),
    insumos: z.enum(['Outorgado', 'Outorgante']),
    animais: z.enum(['Outorgado', 'Outorgante']),
    impostos: z.enum(['Outorgado', 'Outorgante']),
    /**/

    /*SubParceria*/
    subparceria: z.enum(['S', 'N']),
    /**/

    /*Prazo */
    prazoDeterminado: z.string(),
    diaInicio: z.string(),
    diaFim: z.string(),
    /**/

    /*Rescisão*/
    multaDescumprimento: z.string(),
    avisoPrevio: z.string(),
    /**/

    /*Foro*/
    comarca: z.string(),
    estado: z.string(),
    local: z.string(),
    data: z.string(),
    /**/

});

type FormData = z.infer<typeof parceriaruralschema>;


export default function ParceriaRural() {
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
    const [Testemunhas, setTestemunhas] = useState(false);
    const [juridico, setJuridico] = useState(false);
    const [juridicoSeg, setjuridicoSeg] = useState(false);
    const [mista, setMista] = useState(false);
    const [ccir, setCcir] = useState(false);
    const [benfeitorias, setBenfeitorias] = useState(false);
    const [descPartImovel, setDescPartImovel] = useState(false);
    const [outrasFormas, setOutrasFormas] = useState(false);

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



    const geradorParceriaRuralPdf = (dados: any) => {
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

        // Função auxiliar para verificar e formatar valores
        const verificarValor = (valor: any, padrao: string = "Não informado") => {
            return valor !== undefined && valor !== null && valor !== "" ? valor : padrao;
        };

        // Cabeçalho da primeira página
        doc.setFontSize(14);
        doc.setFont("Times", "bold");
        doc.text("CONTRATO DE PARCERIA RURAL", pageWidth / 2, posY, { align: "center" });
        posY += 15;

        doc.setFontSize(12);
        doc.setFont("Times", "normal");
        const introText = "Pelo presente instrumento particular de Contrato de Parceria Rural, as partes abaixo identificadas:";
        const introLines = doc.splitTextToSize(introText, maxTextWidth);
        introLines.forEach((line: string) => {
            checkPageBreak(lineHeight);
            doc.text(line, marginLeft, posY);
            posY += lineHeight;
        });

        posY += lineHeight;

        // 1. IDENTIFICAÇÃO DAS PARTES
        const identificacaoPartes = [
            "1. IDENTIFICAÇÃO DAS PARTES",
            "",
            "OUTORGANTE (PARCEIRO CEDENTE)",
            "",
            dados.outorgante === 'fisica' ? "Se pessoa física:" : "Se pessoa jurídica:",
            ""
        ];

        if (dados.outorgante === 'fisica') {
            identificacaoPartes.push(
                `Nome completo: ${verificarValor(dados.nome)}`,
                `CPF: ${verificarValor(dados.cpf)}`,
                `Estado Civil: ${verificarValor(dados.estadoCivil)}`,
                `Nacionalidade: ${verificarValor(dados.nacionalidade)}`,
                `Profissão: ${verificarValor(dados.profissao)}`,
                `Documento de Identificação (RG ou CNH): ${verificarValor(dados.documento)}`,
                `Endereço completo: ${verificarValor(dados.endereco)}`
            );
        } else {
            identificacaoPartes.push(
                `Razão Social: ${verificarValor(dados.razaosocial)}`,
                `CNPJ: ${verificarValor(dados.cnpj)}`,
                `Endereço da sede: ${verificarValor(dados.sede)}`,
                `Representante legal: ${verificarValor(dados.nomeRepresentante)}`,
                `CPF do representante: ${verificarValor(dados.cpfRepresentante)}`,
                `Cargo do representante: ${verificarValor(dados.cargoRepresentante)}`,
                `Documento de Identificação do representante: ${verificarValor(dados.documentoRepresentante)}`,
                `Endereço do representante: ${verificarValor(dados.enderecoRepresentante)}`
            );
        }

        identificacaoPartes.push(
            "",
            "OUTORGADO (PARCEIRO EXPLORADOR)",
            "",
            dados.outorgado === 'fisica' ? "Se pessoa física:" : "Se pessoa jurídica:",
            ""
        );

        if (dados.outorgado === 'fisica') {
            identificacaoPartes.push(
                `Nome completo: ${verificarValor(dados.nomeOutorgado)}`,
                `CPF: ${verificarValor(dados.cpfOutorgado)}`,
                `Estado Civil: ${verificarValor(dados.estadoCivilOutorgado)}`,
                `Nacionalidade: ${verificarValor(dados.nacionalidadeOutorgado)}`,
                `Profissão: ${verificarValor(dados.profissaoOutorgado)}`,
                `Documento de Identificação (RG ou CNH): ${verificarValor(dados.documentoOutorgado)}`,
                `Endereço completo: ${verificarValor(dados.enderecoOutorgado)}`
            );
        } else {
            identificacaoPartes.push(
                `Razão Social: ${verificarValor(dados.razaosocialOutorgado)}`,
                `CNPJ: ${verificarValor(dados.cnpjOutorgado)}`,
                `Endereço da sede: ${verificarValor(dados.sedeOutorgado)}`,
                `Representante legal: ${verificarValor(dados.nomeRepresentanteOutorgado)}`,
                `CPF do representante: ${verificarValor(dados.cpfRepresentanteOutorgado)}`,
                `Cargo do representante: ${verificarValor(dados.cargoRepresentanteOutorgado)}`,
                `Documento de Identificação do representante: ${verificarValor(dados.documentoRepresentanteOutorgado)}`,
                `Endereço do representante: ${verificarValor(dados.enderecoRepresentanteOutorgado)}`
            );
        }

        addSection("", identificacaoPartes);

        // 2. DO OBJETO
        const objetoText = [
            "2. DO OBJETO",
            "",
            "O presente contrato tem por objeto a exploração em parceria do imóvel rural de propriedade do OUTORGANTE, mediante o compartilhamento dos resultados da atividade desenvolvida, nos termos do Estatuto da Terra.",
            "",
            "Atividade principal a ser desenvolvida:",
            dados.atividade === 'mista'
                ? `( ) Agrícola\n( ) Pecuária\n( ) Agroindustrial\n( ) Extrativa\n(X) Mista (especificar): ${verificarValor(dados.descMista)}`
                : `(${dados.atividade === 'agricola' ? 'X' : ' '}) Agrícola\n(${dados.atividade === 'pecuaria' ? 'X' : ' '}) Pecuária\n(${dados.atividade === 'agroindustrial' ? 'X' : ' '}) Agroindustrial\n(${dados.atividade === 'extrativa' ? 'X' : ' '}) Extrativa\n( ) Mista (especificar):`,
            "",
            "Descrição detalhada do imóvel rural:",
            "",
            `Localização: ${verificarValor(dados.localizacao)}`,
            `Tamanho (em hectares): ${verificarValor(dados.tamanho)} ha`,
            `Certificado de Cadastro de Imóvel Rural (CCIR): ${dados.ccir === 'S' ? 'Sim' : 'Não'}`,
            dados.ccir === 'S' ? `Nº do CCIR: ${verificarValor(dados.numeroCCIR)}` : "",
            `Registro de Imóveis: Cartório: ${verificarValor(dados.registroCartorio)}`,
            `Matrícula nº: ${verificarValor(dados.matricula)}`,
            "",
            "Descrição dos bens cedidos:",
            dados.descBens === 'outros'
                ? `( ) Máquinas\n( ) Ferramentas\n( ) Animais\n( ) Insumos\n(X) Outras benfeitorias: ${verificarValor(dados.benfeitorias)}`
                : `(${dados.descBens === 'maquinas' ? 'X' : ' '}) Máquinas\n(${dados.descBens === 'ferramentas' ? 'X' : ' '}) Ferramentas\n(${dados.descBens === 'animais' ? 'X' : ' '}) Animais\n(${dados.descBens === 'insumos' ? 'X' : ' '}) Insumos\n( ) Outras benfeitorias:`
        ];

        addSection("", objetoText);

        // 3. DAS ATIVIDADES RURAIS
        const atividadesRurais = [
            "3. DAS ATIVIDADES RURAIS",
            "",
            "O OUTORGADO poderá utilizar:",
            dados.atividadeRural === 'parteImovel'
                ? `( ) Todo o imóvel\n(X) Parte do imóvel - especificar área: ${verificarValor(dados.descPartImovel)}`
                : `(X) Todo o imóvel\n( ) Parte do imóvel - especificar área:`,
            "",
            "Atividades a serem realizadas:",
            "",
            "O OUTORGADO contribuirá com:",
            dados.contribuicaoOutorgado === 'outrasFormas'
                ? `( ) Somente com mão de obra\n( ) Mão de obra + equipamentos/máquinas\n( ) Insumos (sementes, fertilizantes etc.)\n(X) Outras formas de contribuição: ${verificarValor(dados.descOutrasFormas)}`
                : `(${dados.contribuicaoOutorgado === 'maoObra' ? 'X' : ' '}) Somente com mão de obra\n(${dados.contribuicaoOutorgado === 'equipMaquina' ? 'X' : ' '}) Mão de obra + equipamentos/máquinas\n(${dados.contribuicaoOutorgado === 'insumos' ? 'X' : ' '}) Insumos (sementes, fertilizantes etc.)\n( ) Outras formas de contribuição:`
        ];

        addSection("", atividadesRurais);

        // 4. DA PARTILHA DOS RESULTADOS
        const partilhaResultados = [
            "4. DA PARTILHA DOS RESULTADOS",
            "",
            "As partes acordam que os frutos da produção rural serão partilhados da seguinte forma:",
            "",
            `OUTORGANTE: ${verificarValor(dados.resultOutorgante)}%`,
            `OUTORGADO: ${verificarValor(dados.resultOutorgado)}%`,
            "",
            `O OUTORGANTE deverá ser informado com antecedência mínima de ${verificarValor(dados.qtdDias)} dias sobre a data de início da colheita ou da partilha da produção.`
        ];

        addSection("", partilhaResultados);

        // 5. DAS DESPESAS E ENCARGOS
        const despesasEncargos = [
            "5. DAS DESPESAS E ENCARGOS",
            "",
            "Responsabilidade pelas despesas:",
            "",
            `Cuidados da terra: ${verificarValor(dados.cuidados)}`,
            `Manutenção de máquinas e equipamentos: ${verificarValor(dados.manutencao)}`,
            `Insumos e materiais de produção: ${verificarValor(dados.insumos)}`,
            `Animais: ${verificarValor(dados.animais)}`,
            `Impostos, taxas e tributos: ${verificarValor(dados.impostos)}`
        ];

        addSection("", despesasEncargos);

        // 6. DA SUBPARCERIA
        const subparceria = [
            "6. DA SUBPARCERIA",
            "",
            "Será permitida a subparceria ou contratação de terceiros pelo OUTORGADO?",
            dados.subparceria === 'S'
                ? "(X) Sim, com autorização expressa do OUTORGANTE\n( ) Não, é vedada a subparceria"
                : "( ) Sim, com autorização expressa do OUTORGANTE\n(X) Não, é vedada a subparceria"
        ];

        addSection("", subparceria);

        // 7. DO PRAZO
        const prazo = [
            "7. DO PRAZO",
            "",
            `Este contrato vigorará por prazo determinado de ${verificarValor(dados.prazoDeterminado)} anos, iniciando-se em ${verificarValor(dados.diaInicio)} e encerrando-se em ${verificarValor(dados.diaFim)}.`,
            "",
            "Prorrogável automaticamente por igual período, salvo manifestação em contrário."
        ];

        addSection("", prazo);

        // 8. DA RESCISÃO
        const rescisao = [
            "8. DA RESCISÃO",
            "",
            "O presente contrato poderá ser rescindido:",
            "",
            "- Por mútuo acordo entre as partes;",
            "- Por descumprimento de cláusulas contratuais;",
            "- Por caso fortuito ou força maior, devidamente comprovado.",
            "",
            `Multa por descumprimento: ${verificarValor(dados.multaDescumprimento)}`,
            `Prazo de aviso prévio: ${verificarValor(dados.avisoPrevio)} dias.`
        ];

        addSection("", rescisao);

        // 9. DO DIREITO DE PREFERÊNCIA
        const preferencia = [
            "9. DO DIREITO DE PREFERÊNCIA",
            "",
            "Em caso de alienação do imóvel objeto desta parceria, o OUTORGADO terá direito de preferência na aquisição, nos termos da legislação aplicável, devendo ser notificado por escrito sobre as condições da venda, com prazo de 30 dias para manifestação."
        ];

        addSection("", preferencia);

        // 10. DAS OBRIGAÇÕES DAS PARTES
        const obrigacoes = [
            "10. DAS OBRIGAÇÕES DAS PARTES",
            "",
            "Obrigações do OUTORGANTE:",
            "",
            "- Garantir o uso pacífico do imóvel;",
            "- Entregar o imóvel e bens em condições adequadas;",
            "- Fornecer suporte técnico (se pactuado).",
            "",
            "Obrigações do OUTORGADO:",
            "",
            "- Utilizar o imóvel conforme sua destinação;",
            "- Zelar pela conservação do imóvel e dos bens;",
            "- Cumprir as obrigações legais e ambientais."
        ];

        addSection("", obrigacoes);

        // 11. DO FORO
        const foro = [
            "11. DO FORO",
            "",
            `Fica eleito o foro da Comarca de ${verificarValor(dados.comarca)}, Estado de ${verificarValor(dados.estado)}, para dirimir quaisquer dúvidas oriundas deste contrato, com renúncia expressa de qualquer outro, por mais privilegiado que seja.`
        ];

        addSection("", foro);

        // Rodapé com assinaturas
        const assinaturas = [
            "",
            "E por estarem de pleno acordo, firmam o presente contrato em duas vias de igual teor e forma, juntamente com as testemunhas abaixo.",
            "",
            `Local: ${verificarValor(dados.local)}`,
            `Data: ${verificarValor(dados.data)}`,
            "",
            "",
            "OUTORGANTE",
            "Assinatura: __________________________",
            "",
            "",
            "OUTORGADO",
            "Assinatura: __________________________",
            "",
            "",
            "1ª Testemunha",
            "Nome: ___________________________________",
            "CPF: ____________________________________",
            "Assinatura: _______________________________",
            "",
            "2ª Testemunha",
            "Nome: ___________________________________",
            "CPF: ____________________________________",
            "Assinatura: _______________________________"
        ];

        // Salvar o PDF
        const pdfDataUri = doc.output("datauristring");
        setPdfDataUrl(pdfDataUri);
    };

    const handleNext = () => {
        setFormData((prev) => ({ ...prev, ...currentStepData }));
        let nextStep = step;


        if (currentStepData.outorgante === 'fisica') {
            nextStep = 2;
        } else if (currentStepData.outorgante === 'juridico') {
            setJuridico(true);
            nextStep = 9;
        }

        if (nextStep === 8) {
            nextStep = 17;
        }


        if (currentStepData.outorgado === 'fisica') {
            nextStep = 18;
        } else if (currentStepData.outorgado === 'juridico') {
            setjuridicoSeg(true);
            nextStep = 25;
        }

        if (nextStep === 24) {
            nextStep = 33;
        }


        if (currentStepData.atividade === 'mista') {
            setMista(true);
            nextStep = 34;
        } else if (currentStepData.atividade === 'agricola') {
            nextStep = 35;
        } else if (currentStepData.atividade === 'pecuaria') {
            setMista(true);
            nextStep = 35;
        } else if (currentStepData.atividade === 'agroindustrial') {
            setMista(true);
            nextStep = 35;
        } else if (currentStepData.atividade === 'extrativa') {
            nextStep = 35;
        }



        if (currentStepData.ccir === 'S') {
            nextStep = 38;
            setCcir(true);
        } else if (currentStepData.ccir === 'N') {

            nextStep = 39;
        }


        if (currentStepData.descBens === 'maquinas') {
            nextStep = 42;

        } else if (currentStepData.descBens === 'ferramentas') {
            nextStep = 42;

        } else if (currentStepData.descBens === 'animais') {
            nextStep = 42;

        } else if (currentStepData.descBens === 'insumos') {
            nextStep = 42;

        } else if (currentStepData.descBens === 'outros') {
            setBenfeitorias(true);
            nextStep = 41;
        }



        if (currentStepData.contribuicaoOutorgado === 'maoObra') {
            nextStep = 46;

        } else if (currentStepData.contribuicaoOutorgado === 'equipMaquina') {
            nextStep = 46;

        } else if (currentStepData.contribuicaoOutorgado === 'insumos') {
            nextStep = 46;

        } else if (currentStepData.contribuicaoOutorgado === 'outrasFormas') {
            nextStep = 45;
            setOutrasFormas(true)
        }



        setStep(nextStep);
        pilha.current.empilhar(nextStep);


        // Logs para depuração
        console.log(`qtd step depois do ajuste: ${nextStep}`);

        // Limpar os dados do passo atual.
        setCurrentStepData({});
    }


    useEffect(() => {
        geradorParceriaRuralPdf({ ...formData });
    }, [formData]);

    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title">Contrato de Arrendamento Rural </h1>
            </div>
            <div className="container">
                <div className="left-panel">
                    <div className="scrollable-card">
                        <div className="progress-bar">
                            <div
                                className="progress-bar-inner"
                                style={{ width: `${(step / 62) * 100}%` }}
                            ></div>
                        </div>
                        <div className="form-wizard">
                            {step === 1 && (
                                <>
                                    <h2>Outorgante(Parceiro Cedente)</h2>                                    <div>
                                        <label>É pessoa </label>
                                        <select name='outorgante' onChange={handleChange}>
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
                                    <h2>Outorgante(Parceiro Cedente)</h2>                                    <div>
                                        <label>Nome completo</label>
                                        <input
                                            type='text'
                                            placeholder='Nome do Outorgante'
                                            name="nome"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 3 && (
                                <>
                                    <h2>Outorgante(Parceiro Cedente)</h2>                                    <div>
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

                            {step === 4 && (
                                <>
                                    <h2>Outorgante(Parceiro Cedente)</h2>                                    <div>
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
                                    <h2>Outorgante(Parceiro Cedente)</h2>                                    <div>
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

                            {step === 6 && (
                                <>
                                    <h2>Outorgante(Parceiro Cedente)</h2>                                    <div>
                                        <label>Carteira de Identidade n.º</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="documento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 7 && (
                                <>
                                    <h2>Outorgante(Parceiro Cedente)</h2>                                    <div>
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

                            {step === 8 && (
                                <>
                                    <h2>Outorgante(Parceiro Cedente)</h2>                                    <div>
                                        <label>Endereço</label>
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


                            {juridico && (
                                <>
                                    {step === 9 && (
                                        <>
                                            <h2>Outorgante(Parceiro Cedente)</h2>                                    <div>
                                                <label>Razão Social</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="razaosocial"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 10 && (
                                        <>
                                            <h2>Outorgante(Parceiro Cedente)</h2>                                    <div>
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

                                    {step === 11 && (
                                        <>
                                            <h2>Outorgante(Parceiro Cedente)</h2>                                    <div>
                                                <label>Sede</label>
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

                                    {step === 12 && (
                                        <>
                                            <h2>Outorgante(Parceiro Cedente)</h2>                                    <div>
                                                <label>Nome do Representante</label>
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

                                    {step === 13 && (
                                        <>
                                            <h2>Outorgante(Parceiro Cedente)</h2>                                    <div>
                                                <label>Cpf do Representante</label>
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

                                    {step === 14 && (
                                        <>
                                            <h2>Outorgante(Parceiro Cedente)</h2>                                    <div>
                                                <label>Cargo do Representante</label>
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


                                    {step === 15 && (
                                        <>
                                            <h2>Outorgante(Parceiro Cedente)</h2>                                    <div>
                                                <label>N° do RG do Representante</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="documentoRepresentante"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}


                                    {step === 16 && (
                                        <>
                                            <h2>Outorgante(Parceiro Cedente)</h2>                                    <div>
                                                <label>Endereço do Representante</label>
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
                                </>
                            )}







                            {step === 17 && (
                                <>
                                    <h2>Outorgado(Parceiro Explorador)</h2>                                    <div>
                                        <label>É pessoa </label>
                                        <select name='outorgado' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="fisica">Física</option>
                                            <option value="juridico">Jurídico</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 18 && (
                                <>
                                    <div>
                                        <h2>Outorgado(Parceiro Explorador)</h2>                                        <label>Nome completo</label>
                                        <input
                                            type='text'
                                            placeholder='Nome do Outorgado'
                                            name="nomeOutorgado"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 19 && (
                                <>
                                    <div>
                                        <h2>Outorgado(Parceiro Explorador)</h2>                                        <label>Estado Civil</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="estadoCivilOutorgado"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 20 && (
                                <>
                                    <h2>Outorgado(Parceiro Explorador)</h2>                                    <div>
                                        <label>Nacionalidade</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="nacionalidadeOutorgado"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 21 && (
                                <>
                                    <h2>Outorgado(Parceiro Explorador)</h2>                                    <div>
                                        <label>Profissão</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="profissaoOutorgado"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 22 && (
                                <>
                                    <h2>Outorgado(Parceiro Explorador)</h2>                                    <div>
                                        <label>Carteira de Identidade n.º</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="documentoOutorgado"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 23 && (
                                <>
                                    <h2>Outorgado(Parceiro Explorador)</h2>                                    <div>
                                        <label>CPF</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="cpfOutorgado"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 24 && (
                                <>
                                    <h2>Outorgado(Parceiro Explorador)</h2>                                    <div>
                                        <label>Endereço</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="enderecoOutorgado"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {juridicoSeg && (
                                <>
                                    {step === 25 && (
                                        <>
                                            <h2>Outorgado(Parceiro Explorador)</h2>                                    <div>
                                                <label>Razão Social</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="razaosocialOutorgado"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 26 && (
                                        <>
                                            <h2>Outorgado(Parceiro Explorador)</h2>                                    <div>
                                                <label>CNPJ</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cnpjOutorgado"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 27 && (
                                        <>
                                            <h2>Outorgado(Parceiro Explorador)</h2>                                    <div>
                                                <label>Sede</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="sedeOutorgado"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 28 && (
                                        <>
                                            <h2>Outorgado(Parceiro Explorador)</h2>                                    <div>
                                                <label>Nome do Representante</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="nomeRepresentanteOutorgado"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 29 && (
                                        <>
                                            <h2>Outorgado(Parceiro Explorador)</h2>                                    <div>
                                                <label>Cpf do Representante</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cpfRepresentanteOutorgado"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 30 && (
                                        <>
                                            <h2>Outorgado(Parceiro Explorador)</h2>                                    <div>
                                                <label>Cargo do Representante</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cargoRepresentanteOutorgado"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}


                                    {step === 31 && (
                                        <>
                                            <h2>Outorgado(Parceiro Explorador)</h2>                                    <div>
                                                <label>N° do RG do Representante</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="documentoRepresentanteOutorgado"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}


                                    {step === 32 && (
                                        <>
                                            <h2>Outorgado(Parceiro Explorador)</h2>                                    <div>
                                                <label>Endereço do Representante</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="enderecoRepresentanteOutorgado"
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
                                    <h2>Objeto</h2>                                    <div>
                                        <label>O presente contrato tem por objeto a exploração em parceria do imóvel rural de propriedade do OUTORGANTE, mediante o compartilhamento dos resultados da atividade desenvolvida, nos termos do Estatuto da Terra.  </label>
                                        <select name='atividade' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="agricola">Agrícola</option>
                                            <option value="pecuaria">Pecuária</option>
                                            <option value="agroindustrial">Agro-Industrial</option>
                                            <option value="extrativa">Extrativa</option>
                                            <option value="mista">Mista</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {mista && (
                                <>

                                    {step === 34 && (
                                        <>
                                            <h2>Objeto</h2>                                    <div>
                                                <label>Especificar Atividade Mista</label>
                                                <textarea
                                                    id="descMista"
                                                    name="descMista"
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


                            {step === 35 && (
                                <>
                                    <h2>Descrição detalhada do imóvel rural</h2>                                    <div>
                                        <label>Localização</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="localizacao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 36 && (
                                <>
                                    <h2>Descrição detalhada do imóvel rural</h2>                                    <div>
                                        <label>Tamanho (em hectares): __________ ha </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="tamanho"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 37 && (
                                <>
                                    <h2>Descrição detalhada do imóvel rural</h2>                                    <div>
                                        <label>Certificado de Cadastro de Imóvel Rural (CCIR) </label>
                                        <select name='ccir' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {ccir && (
                                <>
                                    {step === 38 && (
                                        <>
                                            <h2>Objeto</h2>                                    <div>
                                                <label>Nº do CCIR: </label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="numeroCCIR"
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
                                    <h2>Objeto</h2>                                    <div>
                                        <label>Registro de Imóveis Cartório </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="registroCartorio"
                                            onChange={handleChange}
                                        />

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


                            {step === 40 && (
                                <>
                                    <h2>Objeto</h2>                                    <div>
                                        <label>Descrição dos bens cedidos</label>
                                        <select name='descBens' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="maquinas">Máquinas</option>
                                            <option value="ferramentas">Ferramentas</option>
                                            <option value="animais">Animais</option>
                                            <option value="insumos">Insumos</option>
                                            <option value="outros">Outras benfeitorias</option>

                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {benfeitorias && (
                                <>
                                    {step === 41 && (
                                        <>
                                            <h2>Objeto</h2>                                    <div>
                                                <label>Outras benfeitorias</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="benfeitorias"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}


                            {step === 42 && (
                                <>
                                    <h2>Atividades Rurais</h2>                                    <div>
                                        <label>O OUTORGADO poderá utilizar</label>
                                        <select name='atividadeRural' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="imovel">Todo o imóvel</option>
                                            <option value="parteImovel">Parte do imóvel </option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {descPartImovel && (
                                <>
                                    {step === 43 && (
                                        <>
                                            <h2>Atividades Rurais</h2>                                    <div>
                                                <label>Especificar área</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="descPartImovel"
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
                                    <h2>Atividades Rurais</h2>                                    <div>
                                        <label>O OUTORGADO contribuirá com</label>
                                        <select name='atividadeRural' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="maoObra">Somente com mão de obra</option>
                                            <option value="equipMaquina">Mão de obra + equipamentos/máquinas </option>
                                            <option value="insumos">Insumos (sementes, fertilizantes etc.) </option>
                                            <option value="outrasFormas">Outras formas de contribuição </option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {outrasFormas && (
                                <>
                                    {step === 45 && (
                                        <>
                                            <h2>Atividades Rurais</h2>                                    <div>
                                                <label>Especificar outras formas de contribuição</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="descOutrasFormas"
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
                                    <h2>Partilha de Resultados</h2>                                    <div>
                                        <label>As partes acordam que os frutos da produção rural serão partilhados da seguinte forma:OUTORGANTE: _______%</label>
                                        <input
                                            type='text'
                                            placeholder=' '
                                            name="resultOutorgante"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 47 && (
                                <>
                                    <h2>Partilha de Resultados</h2>                                    <div>
                                        <label>OUTORGADO: _______% </label>
                                        <input
                                            type='text'
                                            placeholder='OUTORGANTE: _______% '
                                            name="resultOutorgado"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 48 && (
                                <>
                                    <h2>Partilha de Resultados</h2>                                    <div>
                                        <label>O OUTORGANTE deverá ser informado com antecedência mínima de _______ dias sobre a data de início da colheita ou da partilha da produção. </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="qtdDias"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 49 && (
                                <>
                                    <h2>Despesas e Encargos</h2>                                    <div>
                                        <label>Responsabilidade pelas despesas: Cuidados da terra</label>
                                        <select name='cuidados' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="Outorgado">Outorgado</option>
                                            <option value="Outorgante">Outorgante</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 50 && (
                                <>
                                    <h2>Despesas e Encargos</h2>                                    <div>
                                        <label>Responsabilidade pelas despesas: Manutenção de máquinas e equipamentos</label>
                                        <select name='manutencao' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="Outorgado">Outorgado</option>
                                            <option value="Outorgante">Outorgante</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 51 && (
                                <>
                                    <h2>Despesas e Encargos</h2>                                    <div>
                                        <label>Responsabilidade pelas despesas: Insumos e materiais de produção</label>
                                        <select name='insumos' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="Outorgado">Outorgado</option>
                                            <option value="Outorgante">Outorgante</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 52 && (
                                <>
                                    <h2>Despesas e Encargos</h2>                                    <div>
                                        <label>Responsabilidade pelas despesas: Animais</label>
                                        <select name='animais' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="Outorgado">Outorgado</option>
                                            <option value="Outorgante">Outorgante</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 53 && (
                                <>
                                    <h2>Despesas e Encargos</h2>                                    <div>
                                        <label>Responsabilidade pelas despesas: Impostos, taxas e tributos</label>
                                        <select name='impostos' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="Outorgado">Outorgado</option>
                                            <option value="Outorgante">Outorgante</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 54 && (
                                <>
                                    <h2>SubParceria</h2>                                    <div>
                                        <label>Será permitida a subparceria ou contratação de terceiros pelo OUTORGADO?</label>
                                        <select name='subparceria' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 55 && (
                                <>
                                    <h2>SubParceria</h2>                                    <div>
                                        <label>Este contrato vigorará por prazo determinado de ______ anos, iniciando-se em //____ e encerrando-se em //____. </label>
                                        <input
                                            type='text'
                                            placeholder='anos'
                                            name="prazoDeterminado"
                                            onChange={handleChange}
                                        />

                                        <input
                                            type='date'
                                            placeholder='Data de inicio'
                                            name="diaInicio"
                                            onChange={handleChange}
                                        />
                                        <input
                                            type='date'
                                            placeholder='Data de inicio'
                                            name="diaFim"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 56 && (
                                <>
                                    <h2>Rescisão</h2>                                    <div>
                                        <label>Multa por descumprimento: R$ ___________________ (ou percentual sobre produção)  </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="multaDescumprimento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 57 && (
                                <>
                                    <h2>Rescisão</h2>                                    <div>
                                        <label>Prazo de aviso prévio: _______ dias</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="avisoPrevio"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 58 && (
                                <>
                                    <h2>Foro</h2>                                    <div>
                                        <label>Fica eleito o foro da Comarca de _____________________________</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="comarca"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 59 && (
                                <>
                                    <h2>Foro</h2>                                    <div>
                                        <label>Estado de ___________, para dirimir quaisquer dúvidas oriundas deste contrato, com renúncia expressa de qualquer outro, por mais privilegiado que seja.</label>
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

                            {step === 60 && (
                                <>
                                    <h2>Assinatura</h2>                                    <div>
                                        <label>Local de Assinatura</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="local"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 61 && (
                                <>
                                    <h2>Assinatura</h2>                                    <div>
                                        <label>Data de Assinatura</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="data"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 62 && (
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