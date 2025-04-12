'use client'
import Pilha from '@/lib/pilha';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';
import geradorDoacaoDinheiroPago from '../util/pdf';


const doacaodinheiroschema = z.object({
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

    /**Objeto*/
    valorDoacao: z.string(),
    moeda: z.string(),
    formaTransfer: z.enum(['transferBank', 'pix', 'dinheiro', 'outro']),

    //se for transferBank
    agencia: z.string(),
    contaCorrente: z.string(),


    //se for outro
    descOutro: z.string(),


    dataEfetivacao: z.string(),
    comprovante: z.enum(['anex', 'nanex']),
    /*********/


    /**Finalidade***/
    finalidade: z.enum(['semVinc', 'vinc']),
    //se for vinc
    descVinc: z.string(),

    /*******/


    /**Condicoes e encargos***/
    condicoes: z.enum(['semEncargo', 'encargo']),
    //se for encargo
    descEncargo: z.string(),
    /*******/

    /**Foro**/
    cidade: z.string(),
    estado: z.string(),
    dataAssinatura: z.string(),
    /*****/

});



type FormData = z.infer<typeof doacaodinheiroschema>;

export default function DoacaoDinheiro() {
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
    const [transferenciaBanc, setTransferenciaBanc] = useState(false);
    const [outraForma, setOutraForma] = useState(false);
    const [finalidadeEspe, setFinalidadeEspe] = useState(false);
    const [condicoes, setCondicoes] = useState(false);


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


        if (currentStepData.formaTransfer === 'transferBank') {
            nextStep = 38;
            setTransferenciaBanc(true);
        } else if (currentStepData.formaTransfer === 'outro') {
            setOutraForma(true);
            nextStep = 40;
        } else if (currentStepData.formaTransfer === 'pix') {
            nextStep = 40;
        } else if (currentStepData.formaTransfer === 'dinheiro') {
            nextStep = 40;
        }

        if (nextStep === 38) {
            nextStep = 40;
        }


        if (currentStepData.finalidade === 'semVinc') {
            nextStep = 44;
        } else if (currentStepData.finalidade === 'vinc') {
            setFinalidadeEspe(true);
            nextStep = 43;
        }


        if (currentStepData.condicoes === 'semEncargo') {
            nextStep = 46;
        } else if (currentStepData.condicoes === 'encargo') {
            setCondicoes(true);
            nextStep = 45;
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

    const geradorDoacaoDinheiroPDF = (dados: any) => {
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
        const clausulaPrimeira = [
            "1.1. DOADOR(A):",
            "",
            `Natureza Jurídica: ${dados.doador === 'fisica' ? '(X) Pessoa Física' : '( ) Pessoa Física'} ${dados.doador === 'juridico' ? '(X) Pessoa Jurídica' : '( ) Pessoa Jurídica'}`,
            "",
            ...(dados.doador === 'fisica' ? [
                `Nome: ${verificarValor(dados.nomeDoador)}`,
                `Sexo: ${verificarValor(dados.sexo === 'M' ? 'Masculino' : 'Feminino')}`,
                `Nacionalidade: ${verificarValor(dados.nacionalidade)}`,
                `Estado Civil: ${verificarValor(dados.estadoCivil)}`,
                `Profissão: ${verificarValor(dados.profissao)}`,
                `RG: ${verificarValor(dados.Rg)}`,
                `Órgão Emissor: ${verificarValor(dados.orgaoEmissor)}`,
                `UF: ${verificarValor(dados.uf)}`,
                `CPF: ${verificarValor(dados.cpf)}`,
                `Endereço Completo: ${verificarValor(dados.endereco)}`,
                ""
            ] : [
                `Razão Social: ${verificarValor(dados.razaoSocial)}`,
                `CNPJ: ${verificarValor(dados.cnpj)}`,
                `Endereço da Sede: ${verificarValor(dados.enderecoSede)}`,
                `Nome do Representante Legal: ${verificarValor(dados.nomeRepresentante)}`,
                `Cargo: ${verificarValor(dados.cargoRepresentante)}`,
                `CPF: ${verificarValor(dados.cpfRepresentante)}`,
                `Endereço Completo do Representante: ${verificarValor(dados.enderecoRepresentante)}`,
                ""
            ]),
            "1.2. DONATÁRIO(A):",
            "",
            `Natureza Jurídica: ${dados.donatario === 'fisica' ? '(X) Pessoa Física' : '( ) Pessoa Física'} ${dados.donatario === 'juridico' ? '(X) Pessoa Jurídica' : '( ) Pessoa Jurídica'}`,
            "",
            ...(dados.donatario === 'fisica' ? [
                `Nome: ${verificarValor(dados.nomeDona)}`,
                `Sexo: ${verificarValor(dados.sexoDona === 'M' ? 'Masculino' : 'Feminino')}`,
                `Nacionalidade: ${verificarValor(dados.nacionalidadeDona)}`,
                `Estado Civil: ${verificarValor(dados.estadoCivilDona)}`,
                `Profissão: ${verificarValor(dados.profissaoDona)}`,
                `RG: ${verificarValor(dados.RgDona)}`,
                `Órgão Emissor: ${verificarValor(dados.orgaoEmissorDona)}`,
                `UF: ${verificarValor(dados.ufDona)}`,
                `CPF: ${verificarValor(dados.cpfDona)}`,
                `Endereço Completo: ${verificarValor(dados.enderecoDona)}`,
                ""
            ] : [
                `Razão Social: ${verificarValor(dados.razaoSocialDona)}`,
                `CNPJ: ${verificarValor(dados.cnpjDona)}`,
                `Endereço da Sede: ${verificarValor(dados.enderecoSedeDona)}`,
                `Nome do Representante Legal: ${verificarValor(dados.nomeRepresentanteDona)}`,
                `Cargo: ${verificarValor(dados.cargoRepresentanteDona)}`,
                `CPF: ${verificarValor(dados.cpfRepresentanteDona)}`,
                `Endereço Completo do Representante: ${verificarValor(dados.enderecoRepresentanteDona)}`,
                ""
            ])
        ];
        addSection("CLÁUSULA PRIMEIRA – DAS PARTES", clausulaPrimeira);

        // CLÁUSULA SEGUNDA - DO OBJETO
        const valorPorExtenso = ""; // Aqui você pode implementar uma função para converter o valor para extenso
        const formaTransferencia =
            dados.formaTransfer === 'transferBank' ? '(X) Transferência bancária' : '( ) Transferência bancária' +
                dados.formaTransfer === 'pix' ? '(X) Pix' : '( ) Pix' +
                    dados.formaTransfer === 'dinheiro' ? '(X) Dinheiro' : '( ) Dinheiro' +
                        dados.formaTransfer === 'outro' ? `(X) Outro: ${verificarValor(dados.descOutro)}` : '( ) Outro: ________';

        const clausulaSegunda = [
            "O presente contrato tem como objeto a doação voluntária, gratuita, sem contraprestação e sem expectativa de reembolso da seguinte quantia:",
            "",
            `Valor da Doação: ${verificarValor(dados.moeda)} ${verificarValor(dados.valorDoacao)} (${valorPorExtenso})`,
            `Moeda: ${verificarValor(dados.moeda)}`,
            `Forma de Transferência: ${formaTransferencia}`,
            ...(dados.formaTransfer === 'transferBank' ? [
                `Agência: ${verificarValor(dados.agencia)}`,
                `Conta Corrente: ${verificarValor(dados.contaCorrente)}`,
                ""
            ] : []),
            `Data da Efetivação: ${verificarValor(dados.dataEfetivacao)}`,
            `Comprovante de Transferência: ${dados.comprovante === 'anex' ? '(X) Será anexado' : '( ) Será anexado'} ${dados.comprovante === 'nanex' ? '(X) Não será anexado' : '( ) Não será anexado'}`,
        ];
        addSection("CLÁUSULA SEGUNDA – DO OBJETO", clausulaSegunda);

        // CLÁUSULA TERCEIRA - DA FINALIDADE
        const clausulaTerceira = [
            `${dados.finalidade === 'semVinc' ? '(X) A doação é realizada sem vinculação a qualquer finalidade específica.' : '( ) A doação é realizada sem vinculação a qualquer finalidade específica.'}`,
            `${dados.finalidade === 'vinc' ? `(X) A doação destina-se ao seguinte fim específico: ${verificarValor(dados.descVinc)}` : '( ) A doação destina-se ao seguinte fim específico: ________'}`,
        ];
        addSection("CLÁUSULA TERCEIRA – DA FINALIDADE (SE HOUVER)", clausulaTerceira);

        // CLÁUSULA QUARTA - DAS CONDIÇÕES E ENCARGOS
        const clausulaQuarta = [
            `${dados.condicoes === 'semEncargo' ? '(X) A doação não possui qualquer encargo ou condição.' : '( ) A doação não possui qualquer encargo ou condição.'}`,
            `${dados.condicoes === 'encargo' ? `(X) A doação está condicionada aos seguintes encargos: ${verificarValor(dados.descEncargo)}` : '( ) A doação está condicionada aos seguintes encargos: ________'}`,
        ];
        addSection("CLÁUSULA QUARTA – DAS CONDIÇÕES E ENCARGOS (SE HOUVER)", clausulaQuarta);

        // CLÁUSULA QUINTA - DA ACEITAÇÃO
        const clausulaQuinta = [
            "O(A) DONATÁRIO(A) declara, por este instrumento, que aceita de forma irrevogável e irretratável a presente doação, comprometendo-se a cumprir as condições eventualmente estipuladas, e responsabilizando-se integralmente pelo uso da quantia recebida."
        ];
        addSection("CLÁUSULA QUINTA – DA ACEITAÇÃO", clausulaQuinta);

        // CLÁUSULA SEXTA - DA IRREVOGABILIDADE E IRRETRATABILIDADE
        const clausulaSexta = [
            "Nos termos do art. 548 do Código Civil, a presente doação é feita de forma irrevogável e irretratável, exceto nos casos legais de revogação por ingratidão ou descumprimento de encargo."
        ];
        addSection("CLÁUSULA SEXTA – DA IRREVOGABILIDADE E IRRETRATABILIDADE", clausulaSexta);

        // CLÁUSULA SÉTIMA - DAS RESPONSABILIDADES FISCAIS
        const clausulaSetima = [
            "As partes declaram ciência de que a doação poderá estar sujeita à incidência do Imposto sobre Transmissão Causa Mortis e Doação (ITCMD), conforme legislação do estado competente, obrigando-se a efetuar os recolhimentos e declarações necessários junto aos órgãos fiscais competentes."
        ];
        addSection("CLÁUSULA SÉTIMA – DAS RESPONSABILIDADES FISCAIS", clausulaSetima);

        // CLÁUSULA OITAVA - DA RESCISÃO
        const clausulaOitava = [
            "Este contrato poderá ser rescindido nas seguintes hipóteses:",
            "",
            "- Descumprimento das condições ou encargos estipulados;",
            "- Por mútuo acordo entre as partes;",
            "- Revogação nos termos da lei.",
            "",
            "Em caso de rescisão por motivo legal, poderá o(a) DOADOR(A) requerer judicialmente a restituição da quantia doada."
        ];
        addSection("CLÁUSULA OITAVA – DA RESCISÃO", clausulaOitava);

        // CLÁUSULA NONA - DA PROTEÇÃO DE DADOS
        const clausulaNona = [
            "As partes se comprometem a proteger os dados pessoais aqui informados, não os divulgando a terceiros, exceto quando necessário para cumprimento de obrigações legais ou contratuais."
        ];
        addSection("CLÁUSULA NONA – DA PROTEÇÃO DE DADOS", clausulaNona);

        // CLÁUSULA DÉCIMA - DO FORO
        const clausulaDecima = [
            `Para dirimir quaisquer controvérsias oriundas do presente contrato, as partes elegem o foro da Comarca de ${verificarValor(dados.cidade)} - ${verificarValor(dados.estado)}, com renúncia expressa a qualquer outro, por mais privilegiado que seja.`
        ];
        addSection("CLÁUSULA DÉCIMA – DO FORO", clausulaDecima);

        // CLÁUSULA DÉCIMA PRIMEIRA - DAS DISPOSIÇÕES GERAIS
        const clausulaDecimaPrimeira = [
            "- Este contrato obriga as partes e seus sucessores, a qualquer título;",
            "- A assinatura das partes poderá ser física ou eletrônica, com igual validade jurídica;",
            "- Este contrato é celebrado em 2 (duas) vias de igual teor e forma;",
            "- As partes declaram ter lido, compreendido e concordado com todas as cláusulas."
        ];
        addSection("CLÁUSULA DÉCIMA PRIMEIRA – DAS DISPOSIÇÕES GERAIS", clausulaDecimaPrimeira);

        // ASSINATURAS
        const assinaturas = [
            "",
            `Local: ${verificarValor(dados.cidade)}/${verificarValor(dados.estado)}  Data: ${verificarValor(dados.dataAssinatura)}`,
            "",
            "DOADOR(A):",
            "",
            `Nome/Razão Social: ${dados.doador === 'fisica' ? verificarValor(dados.nomeDoador) : verificarValor(dados.razaoSocial)}`,
            "Assinatura: ___________________________________",
            "",
            "",
            "DONATÁRIO(A):",
            "",
            `Nome/Razão Social: ${dados.donatario === 'fisica' ? verificarValor(dados.nomeDona) : verificarValor(dados.razaoSocialDona)}`,
            "Assinatura: ___________________________________",
            "",
            "",
            "1ª TESTEMUNHA:",
            "",
            "Nome Completo: _______________________________",
            "CPF: _______________________________",
            "Assinatura: ___________________________________",
            "",
            "",
            "2ª TESTEMUNHA:",
            "",
            "Nome Completo: _______________________________",
            "CPF: _______________________________",
            "Assinatura: ___________________________________"
        ];
        addSection("", assinaturas);

        const pdfDataUri = doc.output("datauristring");
        setPdfDataUrl(pdfDataUri);
    };

    useEffect(() => {
        geradorDoacaoDinheiroPDF({ ...formData });
    }, [formData]);



    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title">Contrato de Doação de Dinheiro </h1>
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
                                        <label>O presente contrato tem como objeto a doação voluntária, gratuita, sem contraprestação e sem expectativa de reembolso da seguinte quantia:

                                            Valor da Doação: R$ [valor numérico] ([valor por extenso]) </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="valorDoacao"
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
                                        <label>Moeda</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="Real (BRL)"
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
                                        <label>Forma de Transferência </label>
                                        <select name='formaTransfer' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="transferBank">Transferência Bancária</option>
                                            <option value="pix">Pix</option>
                                            <option value="dinheiro">Dinheiro</option>
                                            <option value="outro">Outro</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {transferenciaBanc && (
                                <>
                                    {step === 38 && (
                                        <>
                                            <h2>Objeto </h2>                                    <div>
                                                <label>Agência</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="agencia"
                                                    onChange={handleChange}
                                                />


                                                <label>Conta Corrente</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="contaCorrente"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {outraForma && (
                                <>
                                    {step === 39 && (
                                        <>
                                            <h2>Objeto </h2>                                    <div>
                                                <label>Descreva a Forma de Pagamento</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="descOutro"
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
                                    <h2>Objeto </h2>                                    <div>
                                        <label>Data da Efetivação</label>
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

                            {step === 41 && (
                                <>
                                    <h2>Objeto </h2>                                    <div>
                                        <label>Comprovante de Transferência </label>
                                        <select name='comprovante' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="anex">Será anexado</option>
                                            <option value="nanex">Não será anexado</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 42 && (
                                <>
                                    <h2>Finalidade </h2>                                    <div>
                                        <label>Destino da Doação </label>
                                        <select name='finalidade' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="semVinc">A doação é realizada sem vinculação a qualquer finalidade específica</option>
                                            <option value="vinc">A doação destina-se ao seguinte fim específico</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {finalidadeEspe && (
                                <>
                                    {step === 43 && (
                                        <>
                                            <h2>Finalidade </h2>                                    <div>
                                                <label>Descrever finalidade – Ex: auxílio em tratamento médico, projeto social, pagamento de dívidas, etc.</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="descVinc"
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
                                    <h2>Condições e Encargos</h2>                                    <div>
                                        <label>Condições </label>
                                        <select name='condicoes' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="semEncargo">A doação não possui qualquer encargo ou condição</option>
                                            <option value="encargo">A doação está condicionada aos seguintes encargos</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {condicoes && (
                                <>
                                    {step === 45 && (
                                        <>
                                            <h2>Condições e Encargos </h2>                                    <div>
                                                <label>Descrever os encargos ou obrigações assumidas pela parte donatária, como prestação de contas, destinação específica, prazos, etc.</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="descEncargo"
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
                                    <h2>Foro </h2>                                    <div>
                                        <label>Para dirimir quaisquer controvérsias oriundas do presente contrato, as partes elegem o foro da Comarca de [Cidade] - [Estado], com renúncia expressa a qualquer outro, por mais privilegiado que seja</label>
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
                                    <h2>Assinatura </h2>                                    <div>
                                        <label>Data de Assinatura</label>
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
                    <button className='btnBaixarPdf' onClick={() => { geradorDoacaoDinheiroPago(formData) }}>
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