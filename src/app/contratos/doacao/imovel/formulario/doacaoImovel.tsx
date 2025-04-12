'use client'
import Pilha from '@/lib/pilha';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';
import geradorDoacaoImovelPago from '../util/pdf';


const doacaoImovelschema = z.object({
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

    /****  Donatario pf ****** */
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

    /**Donatario pj */
    razaoSocialDona: z.string(),
    cnpjDona: z.string(),
    enderecoSedeDona: z.string(),
    nomeRepresentanteDona: z.string(),
    cargoRepresentanteDona: z.string(),
    cpfRepresentanteDona: z.string(),
    enderecoRepresentanteDona: z.string(),
    /** */

    /**OBJETO */
    enderecoImovel: z.string(),
    descDetalhe: z.string(),
    matricula: z.string(),
    cartorioRegistro: z.string(),
    valorAproximado: z.string(),
    situacao: z.enum(['realizada', 'datarealizacao']),
    /**** */

    /**Efetivacao */
    dataEfetivacao: z.string(),
    /****** */

    /**Usufruto */
    usufruto: z.enum(['semReserva', 'comReserva']),
    //se for com usufrut
    usufrutoPazo: z.string(),

    /***** */

    /**Encargos e Condições */
    sujeito: z.enum(['encargos', 'encargoEspec']),
    //se for com usufruto
    sujeitoEncargos: z.string(),
    /***** */


    /**Responsabilidades e Custos */
    despesas: z.enum(['doador', 'donatario', 'ambos']),
    /***** */

    /**Foro */
    cidade: z.string(),
    estado: z.string(),
    /** */

    /**Assinatura */
    dataAssinatura: z.string(),
    /** */
});

type FormData = z.infer<typeof doacaoImovelschema>;



export default function DoacaoImovel() {
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
    const [reserva, setReserva] = useState(false);
    const [encargos, setEncargos] = useState(false);
    const [data, setData] = useState(false);


    const [doadorpj, setDoadorpj] = useState(false);
    const [donatariopj, setDonatariopj] = useState(false);


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

        if (currentStepData.situacao === 'realizada') {
            nextStep = 41;
        } else if (currentStepData.situacao === 'datarealizacao') {
            setData(true);
            nextStep = 40;

            if (currentStepData.usufruto === 'semReserva') {
                nextStep = 43;
            } else if (currentStepData.usufruto === 'comReserva') {
                setReserva(true);
                nextStep = 42;
            }


        }

        if (currentStepData.sujeito === 'encargos') {
            nextStep = 45;
        } else if (currentStepData.sujeito === 'encargoEspec') {
            setEncargos(true);
            nextStep = 44;
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

    const geradorDoacaoImovel = (dados: any) => {
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

        // Função para verificar valor e retornar string ou vazio
        const verificarValor = (valor: any) => {
            return valor ? valor.toString() : "";
        };

        // Cabeçalho da primeira página
        doc.setFontSize(14);
        doc.setFont("Times", "bold");
        doc.text("CONTRATO DE DOAÇÃO", pageWidth / 2, posY, { align: "center" });
        posY += 15;

        doc.setFontSize(12);
        doc.setFont("Times", "normal");
        const introText = "Pelo presente instrumento particular de doação, de um lado, como DOADOR(A), e de outro, como DONATÁRIO(A), têm entre si, justa e contratada, a doação do bem descrito neste contrato, mediante as cláusulas e condições seguintes, que mutuamente outorgam e aceitam, na forma da Lei nº 10.406/2002 (Código Civil Brasileiro). ";
        const introLines = doc.splitTextToSize(introText, maxTextWidth);
        introLines.forEach((line: string) => {
            checkPageBreak(lineHeight);
            doc.text(line, marginLeft, posY);
            posY += lineHeight;
        });

        // CLÁUSULA PRIMEIRA - DAS PARTES
        addSection("CLÁUSULA PRIMEIRA - DAS PARTES", [
            "1.1. DOADOR(A):",
            `Natureza Jurídica: ${dados.doador === 'fisica' ? '(X) Pessoa Física' : '( ) Pessoa Física'} ${dados.doador === 'juridico' ? '(X) Pessoa Jurídica' : '( ) Pessoa Jurídica'}`,
            ...(dados.doador === 'fisica' ? [
                `Nome: ${verificarValor(dados.nomeDoador)}`,
                `Sexo: ${verificarValor(dados.sexo)}`,
                `Estado Civil: ${verificarValor(dados.estadoCivil)}`,
                `Nacionalidade: ${verificarValor(dados.nacionalidade)}`,
                `Profissão: ${verificarValor(dados.profissao)}`,
                `RG: ${verificarValor(dados.Rg)}`,
                `Órgão Emissor: ${verificarValor(dados.orgaoEmissor)}`,
                `UF: ${verificarValor(dados.uf)}`,
                `CPF: ${verificarValor(dados.cpf)}`,
                `Endereço Completo (com CEP): ${verificarValor(dados.endereco)}`
            ] : [
                `Razão Social: ${verificarValor(dados.razaoSocial)}`,
                `CNPJ: ${verificarValor(dados.cnpj)}`,
                `Sede: ${verificarValor(dados.enderecoSede)}`,
                "",
                `Nome do Representante Legal: ${verificarValor(dados.nomeRepresentante)}`,
                `Cargo: ${verificarValor(dados.cargoRepresentante)}`,
                `CPF: ${verificarValor(dados.cpfRepresentante)}`,
                `Endereço do Representante: ${verificarValor(dados.enderecoRepresentante)}`
            ]),
            "",
            "1.2. DONATÁRIO(A):",
            `Natureza Jurídica: ${dados.donatario === 'fisica' ? '(X) Pessoa Física' : '( ) Pessoa Física'} ${dados.donatario === 'juridico' ? '(X) Pessoa Jurídica' : '( ) Pessoa Jurídica'}`,
            ...(dados.donatario === 'fisica' ? [
                `Nome: ${verificarValor(dados.nomeDona)}`,
                `Sexo: ${verificarValor(dados.sexoDona)}`,
                `Estado Civil: ${verificarValor(dados.estadoCivilDona)}`,
                `Nacionalidade: ${verificarValor(dados.nacionalidadeDona)}`,
                `Profissão: ${verificarValor(dados.profissaoDona)}`,
                `RG: ${verificarValor(dados.RgDona)}`,
                `Órgão Emissor: ${verificarValor(dados.orgaoEmissorDona)}`,
                `UF: ${verificarValor(dados.ufDona)}`,
                `CPF: ${verificarValor(dados.cpfDona)}`,
                `Endereço Completo (com CEP): ${verificarValor(dados.enderecoDona)}`
            ] : [
                `Razão Social: ${verificarValor(dados.razaoSocialDona)}`,
                `CNPJ: ${verificarValor(dados.cnpjDona)}`,
                `Sede: ${verificarValor(dados.enderecoSedeDona)}`,
                "",
                `Nome do Representante Legal: ${verificarValor(dados.nomeRepresentanteDona)}`,
                `Cargo: ${verificarValor(dados.cargoRepresentanteDona)}`,
                `CPF: ${verificarValor(dados.cpfRepresentanteDona)}`,
                `Endereço do Representante: ${verificarValor(dados.enderecoRepresentanteDona)}`
            ])
        ]);

        // CLÁUSULA SEGUNDA - DO OBJETO DA DOAÇÃO
        addSection("CLÁUSULA SEGUNDA - DO OBJETO DA DOAÇÃO", [
            "O presente contrato tem como objeto a doação do seguinte bem imóvel:",
            `Endereço Completo do Imóvel: ${verificarValor(dados.enderecoImovel)}`,
            `Descrição Detalhada: ${verificarValor(dados.descDetalhe)}`,
            `Matrícula: nº ${verificarValor(dados.matricula)}`,
            `Cartório de Registro de Imóveis: ${verificarValor(dados.cartorioRegistro)}`,
            `Valor Aproximado do Imóvel: R$ ${verificarValor(dados.valorAproximado)}`,
            `Situação da Doação: ${dados.situacao === 'realizada' ? '(X) A doação já foi realizada.' : '( ) A doação já foi realizada.'} ${dados.situacao === 'datarealizacao' ? '(X) A doação será realizada na data indicada na cláusula terceira.' : '( ) A doação será realizada na data indicada na cláusula terceira.'}`
        ]);

        // CLÁUSULA TERCEIRA - DA EFETIVAÇÃO E TRANSFERÊNCIA DA PROPRIEDADE
        addSection("CLÁUSULA TERCEIRA - DA EFETIVAÇÃO E TRANSFERÊNCIA DA PROPRIEDADE", [
            `A doação será efetivada na data de: ${verificarValor(dados.dataEfetivacao)}, mediante lavratura de escritura pública de doação e posterior registro junto ao Cartório de Registro de Imóveis competente, momento no qual se operará a transferência da propriedade do imóvel para o(a) DONATÁRIO(A).`
        ]);

        // CLÁUSULA QUARTA - DECLARAÇÃO DE DOAÇÃO
        addSection("CLÁUSULA QUARTA - DECLARAÇÃO DE DOAÇÃO", [
            "O(A) DOADOR(A) declara que realiza a presente doação de forma livre, espontânea e sem qualquer expectativa de contraprestação, de modo gratuito, transferindo a propriedade plena do imóvel ao(à) DONATÁRIO(A), ressalvadas eventuais cláusulas de usufruto, encargos ou restrições previstas neste instrumento."
        ]);

        // CLÁUSULA QUINTA - ACEITAÇÃO DA DOAÇÃO
        addSection("CLÁUSULA QUINTA - ACEITAÇÃO DA DOAÇÃO", [
            "O(A) DONATÁRIO(A), por sua vez, declara que aceita expressamente a presente doação, comprometendo-se a respeitar todas as disposições legais e contratuais aqui estabelecidas, bem como as obrigações inerentes ao imóvel recebido."
        ]);

        // CLÁUSULA SEXTA - USUFRUTO (SE APLICÁVEL)
        addSection("CLÁUSULA SEXTA - USUFRUTO (SE APLICÁVEL)", [
            `${dados.usufruto === 'semReserva' ? '(X) O imóvel será doado sem reserva de usufruto.' : '( ) O imóvel será doado sem reserva de usufruto.'}`,
            `${dados.usufruto === 'comReserva' ? `(X) O imóvel será doado com reserva de usufruto em favor do(a) DOADOR(A), que permanecerá usufruindo do bem até ${verificarValor(dados.usufrutoPazo)}.` : '( ) O imóvel será doado com reserva de usufruto em favor do(a) DOADOR(A), que permanecerá usufruindo do bem até [prazo ou condição de extinção do usufruto].'}`
        ]);

        // CLÁUSULA SÉTIMA - ENCARGOS E CONDIÇÕES
        addSection("CLÁUSULA SÉTIMA - ENCARGOS E CONDIÇÕES", [
            `${dados.sujeito === 'encargos' ? '(X) A doação não está sujeita a encargos ou condições.' : '( ) A doação não está sujeita a encargos ou condições.'}`,
            `${dados.sujeito === 'encargoEspec' ? `(X) A doação está condicionada ao seguinte encargo ou obrigação por parte do(a) DONATÁRIO(A): ${verificarValor(dados.sujeitoEncargos)}` : '( ) A doação está condicionada ao seguinte encargo ou obrigação por parte do(a) DONATÁRIO(A): [Descrever encargos: preservação do imóvel, utilização específica, manutenção, etc.]'}`
        ]);

        // CLÁUSULA OITAVA - DAS RESPONSABILIDADES E CUSTOS
        addSection("CLÁUSULA OITAVA - DAS RESPONSABILIDADES E CUSTOS", [
            "As partes ajustam que:",
            "",
            "As despesas com escritura pública, registros cartorários, impostos (como ITCMD) e demais taxas e encargos referentes à doação e transferência de propriedade serão de responsabilidade de:",
            `${dados.despesas === 'doador' ? '(X) DOADOR(A)' : '( ) DOADOR(A)'} ${dados.despesas === 'donatario' ? '(X) DONATÁRIO(A)' : '( ) DONATÁRIO(A)'} ${dados.despesas === 'ambos' ? '(X) Ambos, em partes iguais.' : '( ) Ambos, em partes iguais.'}`,
            "",
            "A responsabilidade por tributos futuros, manutenção, conservação e uso do imóvel passará ao(à) DONATÁRIO(A) a partir da data de efetivação da doação."
        ]);

        // CLÁUSULA NONA - DA IRREVOGABILIDADE E IRRETRATABILIDADE
        addSection("CLÁUSULA NONA - DA IRREVOGABILIDADE E IRRETRATABILIDADE", [
            "A doação ora formalizada é feita em caráter irrevogável e irretratável, salvo nas hipóteses expressamente previstas em lei, como nos casos de ingratidão do(a) DONATÁRIO(A), conforme previsto nos artigos 555 a 559 do Código Civil."
        ]);

        // CLÁUSULA DÉCIMA - DO FORO
        addSection("CLÁUSULA DÉCIMA - DO FORO", [
            `Para dirimir quaisquer dúvidas oriundas deste contrato, as partes elegem o foro da comarca de ${verificarValor(dados.cidade)} - ${verificarValor(dados.estado)}, com renúncia expressa a qualquer outro, por mais privilegiado que seja.`
        ]);

        // CLÁUSULA DÉCIMA PRIMEIRA - DAS DISPOSIÇÕES GERAIS
        addSection("CLÁUSULA DÉCIMA PRIMEIRA - DAS DISPOSIÇÕES GERAIS", [
            "Este contrato obriga as partes, seus herdeiros e sucessores;",
            "A assinatura deste instrumento poderá se dar fisicamente ou por meio eletrônico, nos termos da legislação vigente;",
            "O presente contrato será complementado pela lavratura da escritura pública de doação, conforme exigência legal."
        ]);

        // ASSINATURAS
        addSection("ASSINATURAS", [
            `E, por estarem assim justas e contratadas, firmam o presente contrato em 2 (duas) vias de igual teor, juntamente com as testemunhas abaixo identificadas.`,
            "",
            `Local: ${verificarValor(dados.cidade)}/${verificarValor(dados.estado)}  Data: ${verificarValor(dados.dataAssinatura)}`,
            "",
            "DOADOR(A):",
            `Nome/Razão Social: ${dados.doador === 'fisica' ? verificarValor(dados.nomeDoador) : verificarValor(dados.razaoSocial)}`,
            "Assinatura: ___________________________________",
            "",
            "",
            "DONATÁRIO(A):",
            `Nome/Razão Social: ${dados.donatario === 'fisica' ? verificarValor(dados.nomeDona) : verificarValor(dados.razaoSocialDona)}`,
            "Assinatura: ___________________________________",
            "",
            "",
            "1ª TESTEMUNHA:",
            "Nome Completo: ",
            "CPF: ",
            "Assinatura: ___________________________________",
            "",
            "",
            "2ª TESTEMUNHA:",
            "Nome Completo: ",
            "CPF: ",
            "Assinatura: ___________________________________"
        ]);

        const pdfDataUri = doc.output("datauristring");
        setPdfDataUrl(pdfDataUri);
    };

    useEffect(() => {
        geradorDoacaoImovel({ ...formData });
    }, [formData]);


    return (
        <>

            <div className="caixa-titulo-subtitulo">
                <h1 className="title">Contrato de Doação de Imóvel </h1>
            </div>
            <div className="container">
                <div className="left-panel">
                    <div className="scrollable-card">
                        <div className="progress-bar">
                            <div
                                className="progress-bar-inner"
                                style={{ width: `${(step / 47) * 100}%` }}
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
                                        <label>Endereço Completo do Imóvel</label>
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

                            {step === 36 && (
                                <>
                                    <h2>Objeto </h2>                                    <div>
                                        <label>Descrição Detalhada: (área construída, área do terreno, número de cômodos, tipo de imóvel, benfeitorias, confrontações, características físicas, etc.) </label>
                                        <textarea
                                            id="descDetalhe"
                                            name="descDetalhe"
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

                            {step === 37 && (
                                <>
                                    <h2>Objeto </h2>                                    <div>
                                        <label>Cartório de Registro de Imóveis: [nome e cidade do cartório]</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="cartorioRegistro"
                                            onChange={handleChange}
                                        />


                                        <label>Matrícula: nº [número] </label>
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


                            {step === 38 && (
                                <>
                                    <h2>Objeto </h2>                                    <div>
                                        <label>Valor Aproximado do Imóvel: R$ [valor numérico] ([valor por extenso]) </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="valorAproximado"
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
                                            <option value="realizada">A doação já foi realizada.</option>
                                            <option value="datarealizacao">A doação será realizada na data indicada na cláusula terceira.</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {data && (<>

                                {step === 40 && (
                                    <>
                                        <h2>Efetivação </h2>                                    <div>
                                            <label>A doação será efetivada na data de: [dd/mm/aaaa], mediante lavratura de escritura pública de doação e posterior registro junto ao Cartório de Registro de Imóveis competente, momento no qual se operará a transferência da propriedade do imóvel para o(a) DONATÁRIO(A).  </label>
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
                            </>)}


                            {step === 41 && (
                                <>
                                    <h2>Usufruto </h2>                                    <div>
                                        <label>Usufruto do Donatário</label>
                                        <select name='usufruto' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="semReserva">O imóvel será doado sem reserva de usufruto.</option>
                                            <option value="comReserva">O imóvel será doado com reserva de usufruto em favor do(a) DOADOR(A)...</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {reserva && (
                                <>
                                    {step === 42 && (
                                        <>
                                            <h2>Usufruto </h2>                                    <div>
                                                <label>...que permanecerá usufruindo do bem até [prazo ou condição de extinção do usufruto].   </label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="usufrutoPazo"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}


                            {step === 43 && (
                                <>
                                    <h2>Encargos </h2>                                    <div>
                                        <label>Encargos da doação </label>
                                        <select name='sujeito' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="encargos">A doação não está sujeita a encargos ou condições.</option>
                                            <option value="encargoEspec">A doação não está sujeita a encargos ou condições.</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {encargos && (
                                <>
                                    {step === 44 && (
                                        <>
                                            <h2>Encargos </h2>                                    <div>
                                                <label>Descrever encargos: preservação do imóvel, utilização específica, manutenção, etc.   </label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="sujeitoEncargos"
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
                                    <h2>Encargos </h2>                                    <div>
                                        <label>Encargos da doação </label>
                                        <select name='despesas' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="doador">DOADOR(A)</option>
                                            <option value="donatario">DONATÁRIO(A)</option>
                                            <option value="ambos">Ambos, em partes iguais.</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 46 && (
                                <>
                                    <h2>Foro </h2>                                    <div>
                                        <label>Para dirimir quaisquer dúvidas oriundas deste contrato, as partes elegem o foro da comarca de [Cidade] – [Estado], com renúncia expressa a qualquer outro, por mais privilegiado que seja.    </label>
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

                            {step === 47 && (
                                <>
                                    <h2>Encargos </h2>                                    <div>
                                        <label>Data de Assinatura   </label>
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

                            {step === 48 && (
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
                    <button className='btnBaixarPdf' onClick={() => { geradorDoacaoImovelPago(formData) }}>
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