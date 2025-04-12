'use client'
import Pilha from '@/lib/pilha';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';



const doacaoterrenoschema = z.object({
    doador: z.enum(['fisica', 'juridico']),

    /****  Doador pf ****** */
    nomeDoador: z.string(),
    sexo: z.enum(['M', 'F']),
    estadoCivil: z.string(),
    nacionalidade: z.string(),
    profissao: z.string(),
    Rg: z.string(),
    orgaoEmissor: z.string(),
    uf: z.string(),
    cpf: z.string(),
    endereco: z.string(),
    /** */

    /**Doador pj */
    razaoSocial: z.string(),
    cnpj: z.string(),
    enderecoSede: z.string(),
    nomeRepresentante: z.string(),
    cargoRepresentante: z.string(),
    cpfRepresentante: z.string(),
    enderecoRepresentante: z.string(),
    /** */

    donatario: z.enum(['fisica', 'juridico']),

    /****  Doador pf ****** */
    nomeDona: z.string(),
    sexoDona: z.enum(['M', 'F']),
    estadoCivilDona: z.string(),
    nacionalidadeDona: z.string(),
    profissaoDona: z.string(),
    RgDona: z.string(),
    orgaoEmissorDona: z.string(),
    ufDona: z.string(),
    cpfDona: z.string(),
    enderecoDona: z.string(),
    /** */

    /**Doador pj */
    razaoSocialDona: z.string(),
    cnpjDona: z.string(),
    enderecoSedeDona: z.string(),
    nomeRepresentanteDona: z.string(),
    cargoRepresentanteDona: z.string(),
    cpfRepresentanteDona: z.string(),
    enderecoRepresentanteDona: z.string(),
    /** */

    /**Objeto */
    enderecoDetalhadoTerreno: z.string(),
    descricaoDetelhada: z.string(),
    numeroMatricula: z.string(),
    cartorioRegistro: z.string(),
    valorEstimado: z.string(),
    situacao: z.enum(['realizada', 'asrealizada']),
    /*** */

    /**Encargos */
    encargos: z.enum(['puraSimples', 'seguinteEncargo']),
    //se seguinteEncargo
    obrigacoesDonatario: z.string(),
    /** */

    /**Despesas */
    despesas: z.enum(['despesaDoador', 'despesaDonatario', 'despesaDoadorAmbos']),
    /** */

    /**Efetivacao */
    dataEfetivacao: z.string(),
    /** */

    /**Foro */
    ciadadeComarca: z.string(),
    estado: z.string(),
    /** */

    /**Assinatura */
    localAssinatura: z.string(),
    dataAssinatura: z.string(),
    /** */


});

type FormData = z.infer<typeof doacaoterrenoschema>;



export default function DoacaoTerreno() {
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
    const [Testemunhas, setTestemunhas] = useState(false);
    const [despesas, setDespesas] = useState(false);
    const [encargos, setEncargos] = useState(false);
    const [doadorpj, setDoadorpj] = useState(false);
    const [donatariopj, setDonatariopj] = useState(false);
    const pilha = useRef(new Pilha());


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurrentStepData((prev) => ({ ...prev, [name]: value }));
    };

    const handleNext = () => {

        setFormData((prev) => ({ ...prev, ...currentStepData }));
        let nextStep = step;

        if (currentStepData.doador === 'fisica') {
            nextStep = 2;
        } else if (currentStepData.doador === 'juridico') {
            setDoadorpj(true);
            nextStep = 11;
        }

        if (nextStep === 10) {
            nextStep = 18;
        }



        if (currentStepData.donatario === 'fisica') {
            nextStep = 19;
        } else if (currentStepData.donatario === 'juridico') {
            setDonatariopj(true);
            nextStep = 28;
        }

        if (nextStep === 27) {
            nextStep = 35;
        }

        if (currentStepData.encargos === 'puraSimples') {
            nextStep = 42;
        } else if (currentStepData.encargos === 'seguinteEncargo') {
            setEncargos(true);
            nextStep = 41;
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

    const gerarDoacaoTerrenoPdf = (dados: any) => {
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

        // Função para verificar e formatar valores
        const verificarValor = (valor: any, prefixo = "", sufixo = "") => {
            return valor ? `${prefixo}${valor}${sufixo}` : "____________________________________________";
        };

        // Cabeçalho da primeira página
        doc.setFontSize(14);
        doc.setFont("Times", "bold");
        doc.text("CONTRATO DE DOAÇÃO DE TERRENO", pageWidth / 2, posY, { align: "center" });
        posY += 5;
        doc.setFontSize(10);
        doc.text("(Conforme o Código Civil - Lei Federal nº 10.406/2002)", pageWidth / 2, posY, { align: "center" });
        posY += 15;

        doc.setFontSize(12);
        doc.setFont("Times", "normal");
        const introText = "Pelo presente instrumento particular de doação, de um lado, como DOADOR(A), e de outro, como DONATÁRIO(A), têm entre si justo e contratado o que segue, em conformidade com os artigos 538 a 564 do Código Civil Brasileiro, mediante as cláusulas e condições abaixo expostas:";
        const introLines = doc.splitTextToSize(introText, maxTextWidth);
        introLines.forEach((line: string) => {
            checkPageBreak(lineHeight);
            doc.text(line, marginLeft, posY);
            posY += lineHeight;
        });
        posY += lineHeight;

        // CLÁUSULA PRIMEIRA – DAS PARTES
        const partesContent = [
            "DOADOR(A):",
            `Nome: ${verificarValor(dados.doador === 'fisica' ? dados.nomeDoador : dados.nomeRepresentante)}`,
            `Sexo: ${verificarValor(dados.doador === 'fisica' ? (dados.sexo === 'M' ? 'Masculino' : 'Feminino') : '')}`,
            `Nacionalidade: ${verificarValor(dados.doador === 'fisica' ? dados.nacionalidade : '')}`,
            `Estado Civil: ${verificarValor(dados.doador === 'fisica' ? dados.estadoCivil : '')}`,
            `Profissão: ${verificarValor(dados.doador === 'fisica' ? dados.profissao : dados.cargoRepresentante)}`,
            `RG: ${verificarValor(dados.doador === 'fisica' ? dados.Rg : '')}`,
            `Órgão Emissor: ${verificarValor(dados.doador === 'fisica' ? dados.orgaoEmissor : '')}`,
            `UF: ${verificarValor(dados.doador === 'fisica' ? dados.uf : '')}`,
            `CPF: ${verificarValor(dados.doador === 'fisica' ? dados.cpf : dados.cpfRepresentante)}`,
            `Endereço Completo: ${verificarValor(dados.doador === 'fisica' ? dados.endereco : dados.enderecoRepresentante)}`,
            "",
            dados.doador === 'juridico' ? "Caso pessoa jurídica:" : "",
            dados.doador === 'juridico' ? `CNPJ: ${verificarValor(dados.cnpj)}` : "",
            dados.doador === 'juridico' ? `Razão Social: ${verificarValor(dados.razaoSocial)}` : "",
            dados.doador === 'juridico' ? `Sede: ${verificarValor(dados.enderecoSede)}` : "",
            dados.doador === 'juridico' ? `Nome do Representante Legal: ${verificarValor(dados.nomeRepresentante)}` : "",
            dados.doador === 'juridico' ? `Cargo: ${verificarValor(dados.cargoRepresentante)}` : "",
            dados.doador === 'juridico' ? `CPF do Representante: ${verificarValor(dados.cpfRepresentante)}` : "",
            dados.doador === 'juridico' ? `Endereço do Representante: ${verificarValor(dados.enderecoRepresentante)}` : "",
            "",
            "DONATÁRIO(A):",
            `Nome: ${verificarValor(dados.donatario === 'fisica' ? dados.nomeDona : dados.nomeRepresentanteDona)}`,
            `Sexo: ${verificarValor(dados.donatario === 'fisica' ? (dados.sexoDona === 'M' ? 'Masculino' : 'Feminino') : '')}`,
            `Nacionalidade: ${verificarValor(dados.donatario === 'fisica' ? dados.nacionalidadeDona : '')}`,
            `Estado Civil: ${verificarValor(dados.donatario === 'fisica' ? dados.estadoCivilDona : '')}`,
            `Profissão: ${verificarValor(dados.donatario === 'fisica' ? dados.profissaoDona : dados.cargoRepresentanteDona)}`,
            `RG: ${verificarValor(dados.donatario === 'fisica' ? dados.RgDona : '')}`,
            `Órgão Emissor: ${verificarValor(dados.donatario === 'fisica' ? dados.orgaoEmissorDona : '')}`,
            `UF: ${verificarValor(dados.donatario === 'fisica' ? dados.ufDona : '')}`,
            `CPF: ${verificarValor(dados.donatario === 'fisica' ? dados.cpfDona : dados.cpfRepresentanteDona)}`,
            `Endereço Completo: ${verificarValor(dados.donatario === 'fisica' ? dados.enderecoDona : dados.enderecoRepresentanteDona)}`,
            "",
            dados.donatario === 'juridico' ? "Caso pessoa jurídica:" : "",
            dados.donatario === 'juridico' ? `Razão Social: ${verificarValor(dados.razaoSocialDona)}` : "",
            dados.donatario === 'juridico' ? `CNPJ: ${verificarValor(dados.cnpjDona)}` : "",
            dados.donatario === 'juridico' ? `Sede: ${verificarValor(dados.enderecoSedeDona)}` : "",
            dados.donatario === 'juridico' ? `Nome do Representante Legal: ${verificarValor(dados.nomeRepresentanteDona)}` : "",
            dados.donatario === 'juridico' ? `Cargo: ${verificarValor(dados.cargoRepresentanteDona)}` : "",
            dados.donatario === 'juridico' ? `CPF do Representante: ${verificarValor(dados.cpfRepresentanteDona)}` : "",
            dados.donatario === 'juridico' ? `Endereço do Representante: ${verificarValor(dados.enderecoRepresentanteDona)}` : ""
        ].filter(line => line !== "");

        addSection("CLÁUSULA PRIMEIRA – DAS PARTES", partesContent);

        // CLÁUSULA SEGUNDA – DO OBJETO
        const objetoContent = [
            "O presente contrato tem como objeto a doação do seguinte bem imóvel:",
            "",
            "Descrição Detalhada do Terreno:",
            verificarValor(dados.descricaoDetelhada),
            "",
            "Endereço Completo do Terreno:",
            verificarValor(dados.enderecoDetalhadoTerreno),
            "",
            `Número da Matrícula do Imóvel: ${verificarValor(dados.numeroMatricula)}`,
            `Cartório de Registro de Imóveis: ${verificarValor(dados.cartorioRegistro)}`,
            `Valor Estimado do Terreno: R$ ${verificarValor(dados.valorEstimado)}`,
            "",
            "Situação da Doação:",
            `( ${dados.situacao === 'realizada' ? 'X' : ' '} ) Já realizada`,
            `( ${dados.situacao === 'asrealizada' ? 'X' : ' '} ) A ser realizada`
        ];

        addSection("CLÁUSULA SEGUNDA – DO OBJETO", objetoContent);

        // CLÁUSULA TERCEIRA – DA DECLARAÇÃO DE DOAÇÃO
        const declaracaoContent = [
            "O(A) DOADOR(A) declara, de livre e espontânea vontade, que doa o imóvel acima descrito ao(à) DONATÁRIO(A), sem qualquer tipo de remuneração, contraprestação ou encargo, salvo o disposto na cláusula seguinte, se houver."
        ];

        addSection("CLÁUSULA TERCEIRA – DA DECLARAÇÃO DE DOAÇÃO", declaracaoContent);

        // CLÁUSULA QUARTA – DA ACEITAÇÃO
        const aceitacaoContent = [
            "O(A) DONATÁRIO(A) declara, de maneira expressa, que aceita a presente doação nos termos ora pactuados, comprometendo-se a cumprir todas as disposições legais e contratuais relativas à posse e propriedade do terreno."
        ];

        addSection("CLÁUSULA QUARTA – DA ACEITAÇÃO", aceitacaoContent);

        // CLÁUSULA QUINTA – DA TRANSFERÊNCIA DE PROPRIEDADE
        const transferenciaContent = [
            "A transferência da propriedade do terreno objeto deste contrato dar-se-á na data de efetivação da doação, mediante a lavratura da escritura pública e posterior registro no Cartório de Registro de Imóveis competente."
        ];

        addSection("CLÁUSULA QUINTA – DA TRANSFERÊNCIA DE PROPRIEDADE", transferenciaContent);

        // CLÁUSULA SEXTA – DOS ENCARGOS E CONDIÇÕES (SE HOUVER)
        const encargosContent = [
            `( ${dados.encargos === 'puraSimples' ? 'X' : ' '} ) A doação é feita de forma pura e simples, sem encargos.`,
            `( ${dados.encargos === 'seguinteEncargo' ? 'X' : ' '} ) A doação está condicionada aos seguintes encargos ou obrigações por parte do(a) DONATÁRIO(A):`,
            dados.encargos === 'seguinteEncargo' ? verificarValor(dados.obrigacoesDonatario) : ""
        ];

        addSection("CLÁUSULA SEXTA – DOS ENCARGOS E CONDIÇÕES (SE HOUVER)", encargosContent);

        // CLÁUSULA SÉTIMA – DAS DESPESAS E CUSTOS
        const despesasContent = [
            "As partes convencionam que as despesas oriundas da lavratura da escritura, registro do imóvel, pagamento de tributos e demais encargos legais decorrentes da doação serão de responsabilidade:",
            `( ${dados.despesas === 'despesaDoador' ? 'X' : ' '} ) do DOADOR(A)`,
            `( ${dados.despesas === 'despesaDonatario' ? 'X' : ' '} ) do DONATÁRIO(A)`,
            `( ${dados.despesas === 'despesaDoadorAmbos' ? 'X' : ' '} ) divididas igualmente entre DOADOR(A) e DONATÁRIO(A)`
        ];

        addSection("CLÁUSULA SÉTIMA – DAS DESPESAS E CUSTOS", despesasContent);

        // CLÁUSULA OITAVA – DA EFETIVAÇÃO DA DOAÇÃO
        const efetivacaoContent = [
            `A doação será efetivada na seguinte data: ${verificarValor(dados.dataEfetivacao, "//")}.`,
            "A transferência da propriedade será considerada válida a partir da lavratura e registro da escritura de doação."
        ];

        addSection("CLÁUSULA OITAVA – DA EFETIVAÇÃO DA DOAÇÃO", efetivacaoContent);

        // CLÁUSULA NONA – DA RESCISÃO
        const rescisaoContent = [
            "O descumprimento de quaisquer obrigações assumidas neste contrato poderá ensejar a sua rescisão, sem prejuízo de eventuais perdas e danos e demais sanções cabíveis previstas na legislação vigente."
        ];

        addSection("CLÁUSULA NONA – DA RESCISÃO", rescisaoContent);

        // CLÁUSULA DÉCIMA – DO FORO
        const foroContent = [
            `Para dirimir quaisquer dúvidas ou litígios oriundos deste contrato, as partes elegem o foro da Comarca de ${verificarValor(dados.ciadadeComarca)}, Estado de ${verificarValor(dados.estado)}, com exclusão de qualquer outro, por mais privilegiado que seja.`
        ];

        addSection("CLÁUSULA DÉCIMA – DO FORO", foroContent);

        // ASSINATURAS
        const assinaturasContent = [
            "E, por estarem assim justas e contratadas, firmam o presente instrumento em duas vias de igual teor e forma, juntamente com as testemunhas abaixo identificadas.",
            "",
            `Local: ${verificarValor(dados.localAssinatura)}`,
            `Data: ${verificarValor(dados.dataAssinatura, "//")}`,
            "",
            "",
            "ASSINATURAS",
            "",
            "DOADOR(A):",
            "",
            "",
            "Assinatura",
            `Nome completo: ${verificarValor(dados.doador === 'fisica' ? dados.nomeDoador : dados.razaoSocial)}`,
            `CPF/CNPJ: ${verificarValor(dados.doador === 'fisica' ? dados.cpf : dados.cnpj)}`,
            "",
            "",
            "DONATÁRIO(A):",
            "",
            "",
            "Assinatura",
            `Nome completo: ${verificarValor(dados.donatario === 'fisica' ? dados.nomeDona : dados.razaoSocialDona)}`,
            `CPF/CNPJ: ${verificarValor(dados.donatario === 'fisica' ? dados.cpfDona : dados.cnpjDona)}`,
            "",
            "",
            "TESTEMUNHAS:",
            "",
            "1ª TESTEMUNHA:",
            "",
            "",
            "Assinatura",
            "Nome completo: ____________________________________________",
            "CPF: ___________________________________",
            "",
            "",
            "2ª TESTEMUNHA:",
            "",
            "",
            "Assinatura",
            "Nome completo: ____________________________________________",
            "CPF: ___________________________________"
        ];

        const pdfDataUri = doc.output("datauristring");
        setPdfDataUrl(pdfDataUri);
    };


    useEffect(() => {
        gerarDoacaoTerrenoPdf({ ...formData });
    }, [formData]);


    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title">Contrato de Doação Terreno </h1>
            </div>
            <div className="container">
                <div className="left-panel">
                    <div className="scrollable-card">
                        <div className="progress-bar">
                            <div
                                className="progress-bar-inner"
                                style={{ width: `${(step / 45) * 100}%` }}
                            ></div>
                        </div>
                        <div className="form-wizard">
                            {step === 1 && (
                                <>
                                    <h2>Doador</h2>                                    <div>
                                        <label>É pessoa </label>
                                        <select name='doador' onChange={handleChange}>
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
                                    <h2>Doador </h2>                                    <div>
                                        <label>Nome completo</label>
                                        <input
                                            type='text'
                                            placeholder='Nome do Doador'
                                            name="nomeDoador"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 3 && (
                                <>
                                    <h2>Doador </h2>                                    <div>
                                        <label>Sexo</label>
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
                                    <h2>Doador </h2>                                    <div>
                                        <label>Estado Cívil</label>
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

                            {step === 5 && (
                                <>
                                    <h2>Doador </h2>                                    <div>
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

                            {step === 6 && (
                                <>
                                    <h2>Doador </h2>                                    <div>
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
                                    <h2>Doador </h2>                                    <div>
                                        <label>Rg</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="Rg"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 8 && (
                                <>
                                    <h2>Doador </h2>                                    <div>
                                        <label>Órgão Emissor</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="orgaoEmissor"
                                            onChange={handleChange}
                                        />

                                        <label>UF</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="uf"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 9 && (
                                <>
                                    <h2>Doador </h2>                                    <div>
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

                            {step === 10 && (
                                <>
                                    <h2>Doador </h2>                                    <div>
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

                            {doadorpj && (
                                <>
                                    {step === 11 && (
                                        <>
                                            <h2>Doador </h2>                                    <div>
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

                                    {step === 12 && (
                                        <>
                                            <h2>Doador </h2>                                    <div>
                                                <label>Cnpj</label>
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

                                    {step === 13 && (
                                        <>
                                            <h2>Doador </h2>                                    <div>
                                                <label>Endereço da Sede</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="enderecoSede"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 14 && (
                                        <>
                                            <h2>Doador </h2>                                    <div>
                                                <label>Nome do Representante Legal</label>
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

                                    {step === 15 && (
                                        <>
                                            <h2>Doador </h2>                                    <div>
                                                <label>Cargo do Representante Legal</label>
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

                                    {step === 16 && (
                                        <>
                                            <h2>Doador </h2>                                    <div>
                                                <label>Cpf do Representante Legal</label>
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

                                    {step === 17 && (
                                        <>
                                            <h2>Doador </h2>                                    <div>
                                                <label>Endereço do Representante Legal</label>
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



                            {step === 18 && (
                                <>
                                    <h2>Donatario</h2>                                    <div>
                                        <label>É pessoa </label>
                                        <select name='donatario' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="fisica">Física</option>
                                            <option value="juridico">Jurídico</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 19 && (
                                <>
                                    <h2>Donatario </h2>                                    <div>
                                        <label>Nome completo</label>
                                        <input
                                            type='text'
                                            placeholder='Nome do Donatario'
                                            name="nomeDona"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 20 && (
                                <>
                                    <h2>Donatario </h2>                                    <div>
                                        <label>Sexo</label>
                                        <select name='sexoDona' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="M">Masculino</option>
                                            <option value="F">Feminino</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 21 && (
                                <>
                                    <h2>Donatario </h2>                                    <div>
                                        <label>Estado Cívil</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="estadoCivilDona"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 22 && (
                                <>
                                    <h2>Donatario </h2>                                    <div>
                                        <label>Nacionalidade</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="nacionalidadeDona"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 23 && (
                                <>
                                    <h2>Donatario </h2>                                    <div>
                                        <label>Profissão</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="profissaoDona"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 24 && (
                                <>
                                    <h2>Donatario </h2>                                    <div>
                                        <label>Rg</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="RgDona"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 25 && (
                                <>
                                    <h2>Donatario </h2>                                    <div>
                                        <label>Órgão Emissor</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="orgaoEmissorDona"
                                            onChange={handleChange}
                                        />

                                        <label>UF</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="ufDona"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 26 && (
                                <>
                                    <h2>Donatario </h2>                                    <div>
                                        <label>CPF</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="cpfDona"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 27 && (
                                <>
                                    <h2>Donatario </h2>                                    <div>
                                        <label>Endereço completo</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="enderecoDona"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {donatariopj && (
                                <>
                                    {step === 28 && (
                                        <>
                                            <h2>Donatario </h2>                                    <div>
                                                <label>Razão Social</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="razaoSocialDona"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 29 && (
                                        <>
                                            <h2>Donatario </h2>                                    <div>
                                                <label>Cnpj</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cnpjDona"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 30 && (
                                        <>
                                            <h2>Donatario </h2>                                    <div>
                                                <label>Endereço da Sede</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="enderecoSedeDona"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 31 && (
                                        <>
                                            <h2>Donatario </h2>                                    <div>
                                                <label>Nome do Representante Legal</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="nomeRepresentanteDona"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 32 && (
                                        <>
                                            <h2>Donatario </h2>                                    <div>
                                                <label>Cargo do Representante Legal</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cargoRepresentanteDona"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 33 && (
                                        <>
                                            <h2>Donatario </h2>                                    <div>
                                                <label>Cpf do Representante Legal</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cpfRepresentanteDona"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 34 && (
                                        <>
                                            <h2>Donatario </h2>                                    <div>
                                                <label>Endereço do Representante Legal</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="enderecoRepresentanteDona"
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
                                    <h2>Objeto </h2>                                    <div>
                                        <label>Descrição Detalhada do Terreno</label>
                                        <textarea
                                            id="enderecoDetalhadoTerreno"
                                            name="enderecoDetalhadoTerreno"
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

                            {step === 36 && (
                                <>
                                    <h2>Objeto </h2>                                    <div>
                                        <label>Endereço Completo do Terreno</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="descricaoDetelhada"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 37 && (
                                <>
                                    <h2>Objeto </h2>                                    <div>
                                        <label>Cartório de Registro de Imóveis</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="cartorioRegistro"
                                            onChange={handleChange}
                                        />

                                        <label>Número da Matrícula do Imóvel</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="numeroMatricula"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 38 && (
                                <>
                                    <h2>Objeto </h2>                                    <div>
                                        <label>Valor Estimado do Terreno: R$</label>
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

                            {step === 39 && (
                                <>
                                    <h2>Objeto </h2>                                    <div>
                                        <label>Situação da Doação</label>
                                        <select name='situacao' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="realizada">Já realizada</option>
                                            <option value="asrealizada">A ser realizada</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 40 && (
                                <>
                                    <h2>Encargos </h2>                                    <div>
                                        <label>Situação da Doação</label>
                                        <select name='encargos' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="puraSimples">A doação é feita de forma pura e simples, sem encargos.</option>
                                            <option value="seguinteEncargo">A doação está condicionada aos seguintes encargos ou obrigações por parte do(a) DONATÁRIO(A)</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {encargos && (
                                <>
                                    {step === 41 && (
                                        <>
                                            <h2>Encargos </h2>                                    <div>
                                                <label>Descreva os Encargos e Obrigações por parte do(a) DONATÁRIO(A)</label>
                                                <textarea
                                                    id="obrigacoesDonatario"
                                                    name="obrigacoesDonatario"
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

                            {step === 42 && (
                                <>
                                    <h2>Despesas e Custos </h2>                                    <div>
                                        <label>Situação da Doação</label>
                                        <select name='despesas' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="despesaDoador">do DOADOR(A)</option>
                                            <option value="despesaDonatario">do DONATÁRIO(A)</option>
                                            <option value="despesaDoadorAmbos">divididas igualmente entre DOADOR(A) e DONATÁRIO(A)</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 43 && (
                                <>
                                    <h2>Efetivação </h2>                                    <div>
                                        <label>A doação será efetivada na seguinte data: //________.</label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="dataEfetivacao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 44 && (
                                <>
                                    <h2>Foro </h2>                                    <div>
                                        <label>Para dirimir quaisquer dúvidas ou litígios oriundos deste contrato, as partes elegem o foro da Comarca de _______________________________, Estado de ________________, com exclusão de qualquer outro, por mais privilegiado que seja. </label>
                                        <input
                                            type='text'
                                            placeholder='Cidade'
                                            name="ciadadeComarca"
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


                            {step === 45 && (
                                <>
                                    <h2>Foro </h2>                                    <div>
                                        <label>Local de Assinatura </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="localAssinatura"
                                            onChange={handleChange}
                                        />

                                        <label>Data de Assinatura </label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="dataAssinatura"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 46 && (
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