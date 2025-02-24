'use client'

import Pilha from '@/lib/pilha';
import { verificarValor } from '@/lib/utils';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';
import geradorServicoSalaoPago from '../util/pdf';



const servicosalaoschema = z.object({
    /**SALÃO PARCEIRO */
    razaoSocial: z.string(),
    cnpjsalao: z.string(),
    enderecosalao: z.string(),
    telefonesalao: z.string(),
    emailsalao: z.string(),
    represetanteNome: z.string(),
    represetanteFuncao: z.string(),
    represetanteCpf: z.string(),
    /** */

    /**Empresa ou Profissional Parceiro */
    razaoSocialouNome: z.string(),
    cnpjsalaooucpf: z.string(),
    endereco: z.string(),
    telefone: z.string(),
    email: z.string(),

    umrepresetanteNome: z.string(),
    umrepresetanteFuncao: z.string(),
    umrepresetanteCpf: z.string(),

    doisrepresetanteNome: z.string(),
    doisrepresetanteFuncao: z.string(),
    doisrepresetanteCpf: z.string(),
    /** */

    /**OBJETO */
    descricaoServico: z.string(),
    /** */

    /**PRAZO */
    dataPrazo: z.string(),
    prazoConclusao: z.string(),
    /** */

    /**RETRIBUIÇÃO */
    percentual: z.string(),
    formaPagamento: z.enum(['diariamente', 'semanalmente', 'mensamente']),

    //se for mensalmente
    valorParcela: z.string(),
    dataVenc: z.string(),

    //senão
    modalidade: z.enum(['Pix', 'CartaoDebito', 'CartaoCredito', 'Boleto']),

    sinal: z.enum(['S', 'N']),
    //se sim
    valorSinal: z.string(),
    dataPag: z.string(),

    multaAtraso: z.string(),
    contaBancaria: z.string(),
    /** */


    /**FREQUÊNCIA E HORÁRIOS PARA ATENDIMENTO*/
    horarioFunc: z.string(),
    recepcao: z.enum(['S', 'N']),
    fornecerMaterial: z.string(),
    /** */

    /**DESCUMPRIMENTO */
    percentualDescumprimento: z.string(),
    /** */


    clausulaEspecifica: z.enum(['S', 'N']),
    extras: z.record(z.string(), z.any()),


    /**FORO */
    cidade: z.string(),
    estado: z.string(),
    /** */

    /**PROPRIEDADE INTELCTUAL */
    direitos: z.string(),
    /** */

    /**DISPOSIÇÕES GERAIS */
    testemunhasNecessarias: z.enum(['S', 'N']), // Necessidade de testemunhas para assinatura do contrato
    //se sim 
    nomeTest1: z.string(),
    cpfTest1: z.string(),
    nomeTest2: z.string(),
    cpfTest2: z.string(),
    local: z.string(),
    dataAssinatura: z.string(),
    registroCartorioTest: z.enum(['S', 'N']), // Indicação se o contrato será registrado em cartório 
    /** */

});

type FormData = z.infer<typeof servicosalaoschema>;


export default function ServicoSalao() {

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
    const [Mensalmente, setMensalmente] = useState(false);
    const [sinal, setSinal] = useState(false);
    const [Testemunhas, setTestemunhas] = useState(false);
    const [clausulaEspecifica, setClausulaEspecifica] = useState(false);
    const [extras, setExtras] = useState<ClausulasExtras[]>([]);
    const pilha = useRef(new Pilha());

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurrentStepData((prev) => ({ ...prev, [name]: value }));
    };

    const handleChangeExtra = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const { name, value } = e.target;

        setExtras((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, [name]: value } : item
            )
        );
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



        if (currentStepData.formaPagamento === 'mensamente') {
            setMensalmente(true);
            nextStep = 22;
        } else if (currentStepData.formaPagamento === 'semanalmente') {
            nextStep = 24;
        } else if (currentStepData.formaPagamento === 'diariamente') {
            nextStep = 24;
        }

        if (currentStepData.sinal === 'S') {
            setSinal(true);
            nextStep = 26;
        } else if (currentStepData.sinal === 'N') {
            nextStep = 28;
        }


        if (currentStepData.clausulaEspecifica === 'S') {
            setClausulaEspecifica(true);
            nextStep = 35;
        } else if (currentStepData.clausulaEspecifica === 'N') {
            nextStep = 36;
        }

        if (currentStepData.testemunhasNecessarias === 'S') {
            setTestemunhas(true);
            nextStep = 39;
        } else if (currentStepData.testemunhasNecessarias === 'N') {
            nextStep = 43;
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

    const adicionarClausula = () => {
        setExtras([...extras, { Titulo: "", Conteudo: "" }]);
    };


    // Remove uma cláusula pelo índice
    const removerClausula = (index: number) => {
        setExtras((prev) => prev.filter((_, i) => i !== index));
    };

    const geradorServicoSalaoPdf = (dados: any): void => {
        const doc = new jsPDF();
        const marginX: number = 10;
        let posY: number = 20;
        const maxPageHeight: number = 280;
        const maxTextWidth: number = 190;

        const checkPageBreak = (additionalHeight: number): void => {
            if (posY + additionalHeight >= maxPageHeight) {
                doc.addPage();
                posY = 20;
            }
        };

        const addSection = (title: string, content: string[]): void => {
            checkPageBreak(15);
            doc.setFontSize(12);
            doc.text(title, 105, posY, { align: "center" });
            posY += 15;
            doc.setFontSize(10);

            content.forEach((line: string) => {
                const splitLines: string[] = doc.splitTextToSize(line, maxTextWidth);
                splitLines.forEach((splitLine: string) => {
                    checkPageBreak(10);
                    doc.text(splitLine, marginX, posY);
                    posY += 10;
                });
            });
        };

        // Página 1 - Cabeçalho
        doc.setFontSize(14);
        doc.text("CONTRATO DE PARCERIA SALÃO PARCEIRO", 105, posY, { align: "center" });
        posY += 15;


        addSection("1. IDENTIFICAÇÃO DAS PARTES", [
            `Salão Parceiro:`,
            `Razão Social: ${verificarValor(dados.razaoSocial)}`,
            `CNPJ: ${verificarValor(dados.cnpjsalao)}`,
            `Endereço: ${verificarValor(dados.enderecosalao)}`,
            `Telefone: ${verificarValor(dados.telefonesalao)}`,
            `E-mail: ${verificarValor(dados.emailsalao)}`,
            `1º Representante: ${verificarValor(dados.represetanteNome)}, ${verificarValor(dados.represetanteFuncao)}, ${verificarValor(dados.represetanteCpf)}`,
            `2º Representante: ${verificarValor(dados.doisrepresetanteNome)}, ${verificarValor(dados.doisrepresetanteFuncao)}, ${verificarValor(dados.doisrepresetanteCpf)}`,
            "",
            `Empresa ou Profissional Parceiro:`,
            `Nome/Razão Social: ${verificarValor(dados.razaoSocialouNome)}`,
            `CPF/CNPJ: ${verificarValor(dados.cnpjsalaooucpf)}`,
            `Endereço: ${verificarValor(dados.endereco)}`,
            `Telefone: ${verificarValor(dados.telefone)}`,
            `E-mail: ${verificarValor(dados.email)}`,
            "Conforme disposto no Art. 1º da Lei nº 13.352/2016, este contrato visa regulamentar a relação entre salão parceiro e profissional parceiro."

        ]);

        addSection("2. DO OBJETO", [
            "O presente contrato tem como objeto a prestação de serviços de beleza pelo(a) profissional parceiro(a) dentro do estabelecimento do Salão Parceiro.",
            `Descrição: ${verificarValor(dados.descricaoServico)}`,
            "De acordo com o Art. 1º, § 1º da Lei nº 13.352/2016, este contrato deve estabelecer direitos e deveres de ambas as partes."

        ]);

        addSection("3. DO PRAZO", [
            `Data de início: ${verificarValor(dados.dataPrazo)}`,
            `Prazo para conclusão: ${verificarValor(dados.prazoConclusao)}`,
            "Conforme o Código Civil, contratos devem ter prazo determinado ou indeterminado, respeitando o acordo entre as partes."

        ]);

        addSection("4. DA RETRIBUIÇÃO", [
            `Percentual repassado: ${verificarValor(dados.percentual)}`,
            `Frequência do pagamento: ${verificarValor(dados.formaPagamento)}`,
            dados.formaPagamento === "mensalmente" ? `Valor da parcela: ${verificarValor(dados.valorParcela)}` : `Forma de pagamento: ${verificarValor(dados.modalidade)}`,
            dados.formaPagamento === "mensalmente" ? `Data de vencimento: ${verificarValor(dados.dataVenc)}` : "",
            dados.sinal === "S" ? `Sinal: Sim, Valor: ${verificarValor(dados.valorSinal)}, Data de pagamento: ${verificarValor(dados.dataPag)}` : "Sinal: Não",
            `Multa por atraso: ${verificarValor(dados.multaAtraso)}`,
            `Conta bancária: ${verificarValor(dados.contaBancaria)}`,
            "De acordo com o Art. 1º, § 6º da Lei nº 13.352/2016, a remuneração do profissional parceiro será acordada entre as partes e não configurará vínculo empregatício."

        ]);

        addSection("5. DA FREQUÊNCIA E HORÁRIOS PARA ATENDIMENTO", [
            `Horários de funcionamento: ${verificarValor(dados.horarioFunc)}`,
            `Recepção disponível: ${verificarValor(dados.recepcao)}`,
            `Fornecimento de materiais: ${verificarValor(dados.fornecerMaterial)}`,
            "Nos termos do Art. 1º, § 5º da Lei nº 13.352/2016, o profissional parceiro tem autonomia para definir seus horários de trabalho."

        ]);

        addSection("6. DO DESCUMPRIMENTO", [
            `Em caso de descumprimento, multa de ${verificarValor(dados.percentualDescumprimento)} será aplicada.`,
            "Nos termos do Código Civil, cláusulas de penalidade devem ser proporcionais ao dano causado."

        ]);

        addSection("7. DO FORO", [
            `Foro eleito: Comarca de ${verificarValor(dados.cidade)}/${verificarValor(dados.estado)}`,
            "Nos termos do Art. 63 do Código de Processo Civil, as partes podem eleger foro para dirimir eventuais litígios."

        ]);

        addSection("8. PROPRIEDADE INTELECTUAL E CONFIDENCIALIDADE", [
            "Informações sigilosas sobre clientes e estratégias de negócios não poderão ser compartilhadas sem autorização.",
            `Propriedade intelectual: ${verificarValor(dados.direitos)}`,
            "Conforme a Lei nº 9.279/96 (Lei de Propriedade Industrial), informações confidenciais devem ser protegidas entre as partes."

        ]);

        // Seção OUTRAS CLAUSULAS
        const outrasClausulasContent = [
            `Cláusula Específica: ${verificarValor(dados.clausulaEspecifica)}`,
            "Art. 421 do Código Civil: A liberdade contratual será exercida nos limites da função social do contrato."
        ];

        if (dados.clausulaEspecifica === "S" && extras.length > 0) {
            extras.forEach(({ Titulo, Conteudo }) => {
                outrasClausulasContent.push(`${Titulo}: ${Conteudo}`);
            });
        }

        addSection("9. CLÁUSULAS ADICIONAIS", [
            `${outrasClausulasContent}`,
            "Disposições adicionais relevantes para ambas as partes, respeitando as normas da Lei nº 13.352/2016."
        ]);

        addSection("10. ASSINATURA E TESTEMUNHAS", [
            "Nos termos do Código Civil, testemunhas são recomendadas para garantir validade jurídica ao contrato.",
            `[${verificarValor(dados.razaoSocial)}]`,
            "Assinatura: ___________________________________________",
            `Nome do Representante: ${verificarValor(dados.represetanteNome)}`,
            `CPF: ${verificarValor(dados.represetanteCpf)}`,
            "",
            `[${verificarValor(dados.razaoSocialouNome)}]`,
            "Assinatura: ___________________________________________",
            `Nome do Representante: ${verificarValor(dados.umrepresetanteNome)}`,
            `CPF: ${verificarValor(dados.umrepresetanteCpf)}`,
            "",
            dados.testemunhasNecessarias === "S" ? `Testemunhas:
        Nome: ${verificarValor(dados.nomeTest1)}
        CPF: ${verificarValor(dados.cpfTest1)}
        Assinatura: ________________________________________
        Nome: ${verificarValor(dados.nomeTest2)}
        CPF: ${verificarValor(dados.cpfTest2)}
        Assinatura: ________________________________________` : "",
            `Local: ${verificarValor(dados.local)}`,
            `Data de assinatura: ${verificarValor(dados.dataAssinatura)}`,
            `Registro em cartório: ${verificarValor(dados.registroCartorioTest)}`
        ]);

        const pdfDataUri: string = doc.output("datauristring");
        setPdfDataUrl(pdfDataUri);
    };


    useEffect(() => {
        geradorServicoSalaoPdf({ ...formData });
    }, [formData]);


    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title">Contrato de Parceria Salão Parceiro</h1>
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
                                    <div>
                                        <h2>Salão Parceiro</h2>
                                        <label>Razão Social</label>
                                        <input
                                            type='text'
                                            placeholder='Nome da Empresa'
                                            name="razaoSocial"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <h2>Salão Parceiro</h2>                                    <div>
                                        <label>CNPJ</label>
                                        <input
                                            type='text'
                                            placeholder='Número do CNPJ'
                                            name="cnpjsalao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 3 && (
                                <>
                                    <h2>Salão Parceiro</h2>                                    <div>
                                        <label>Endereço</label>
                                        <input
                                            type='text'
                                            placeholder='Endereço Completo'
                                            name="enderecosalao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 4 && (
                                <>
                                    <h2>Salão Parceiro</h2>                                    <div>
                                        <label>Telefone</label>
                                        <input
                                            type='text'
                                            placeholder='Número de Contato'
                                            name="telefonesalao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 5 && (
                                <>
                                    <h2>Salão Parceiro</h2>                                    <div>
                                        <label>E-mail</label>
                                        <input
                                            type='text'
                                            placeholder='Endereço de E-mail'
                                            name="emailsalao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 6 && (
                                <>
                                    <h2>Salão Parceiro</h2>                                    <div>
                                        <label>Nome do Representante</label>
                                        <input
                                            type='text'
                                            placeholder='Nome Completo'
                                            name="represetanteNome"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 7 && (
                                <>
                                    <h2>Salão Parceiro</h2>                                    <div>
                                        <label>Função do Representante</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="represetanteFuncao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 8 && (
                                <>
                                    <h2>Salão Parceiro</h2>                                    <div>
                                        <label>CPF do Representante</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="represetanteCpf"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 9 && (
                                <>
                                    <h2>Empresa ou Profissional Parceiro</h2>                                    <div>
                                        <label>Nome Completo ou Razão Social</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="razaoSocialouNome"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 10 && (
                                <>
                                    <h2>Empresa ou Profissional Parceiro</h2>                                    <div>
                                        <label>CPF ou CNPJ</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="cnpjsalaooucpf"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 11 && (
                                <>
                                    <h2>Empresa ou Profissional Parceiro</h2>                                    <div>
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

                            {step === 12 && (
                                <>
                                    <h2>Empresa ou Profissional Parceiro</h2>                                    <div>
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

                            {step === 13 && (
                                <>
                                    <h2>Empresa ou Profissional Parceiro</h2>                                    <div>
                                        <label>Telefone</label>
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

                            {step === 14 && (
                                <>
                                    <h2>Empresa ou Profissional Parceiro</h2>                                    <div>
                                        <label>Nome do 1° Representante</label>
                                        <input
                                            type='text'
                                            placeholder='Nome Completo'
                                            name="umrepresetanteNome"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 15 && (
                                <>
                                    <h2>Empresa ou Profissional Parceiro</h2>                                    <div>
                                        <label>Função do 1° Representante</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="umrepresetanteFuncao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 16 && (
                                <>
                                    <h2>Empresa ou Profissional Parceiro</h2>                                    <div>
                                        <label>CPF do 1° Representante</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="umrepresetanteCpf"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 17 && (
                                <>
                                    <h2>Empresa ou Profissional Parceiro</h2>                                    <div>
                                        <label>Nome do 2° Representante</label>
                                        <input
                                            type='text'
                                            placeholder='Nome Completo'
                                            name="doisrepresetanteNome"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 15 && (
                                <>
                                    <h2>Empresa ou Profissional Parceiro</h2>                                    <div>
                                        <label>Função do 2° Representante</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="doisrepresetanteFuncao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 16 && (
                                <>
                                    <h2>Empresa ou Profissional Parceiro</h2>                                    <div>
                                        <label>CPF do 2° Representante</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="doisrepresetanteCpf"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 17 && (
                                <>
                                    <h2>Objeto</h2>                                    <div>
                                        <label>O presente contrato tem como objeto a
                                            prestação de serviços de beleza pelo(a) profissional parceiro(a) dentro do estabelecimento do Salão Parceiro. Os serviços incluem, mas não se limitam a</label>
                                        <textarea
                                            id="descricaoServico"
                                            name="descricaoServico"
                                            onChange={handleChange}
                                            rows={10}
                                            cols={50}
                                            placeholder="Descrever os serviços a serem prestados, como cortes de cabelo, coloração, tratamentos estéticos"
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 18 && (
                                <>
                                    <h2>Prazo</h2>                                    <div>
                                        <label>Data de início</label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="dataPrazo"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 19 && (
                                <>
                                    <h2>Prazo</h2>                                    <div>
                                        <label>Prazo para conclusão</label>
                                        <input
                                            type='text'
                                            placeholder='Especificar se é por tempo indeterminado ou um período definido'
                                            name="prazoConclusao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 20 && (
                                <>
                                    <h2>Retribuição</h2>                                    <div>
                                        <label>Percentual a ser repassado ao(a) parceiro(a) pela prestação do serviço</label>
                                        <input
                                            type='text'
                                            placeholder='Exemplo: 50% sobre o valor de cada serviço'
                                            name="percentual"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 21 && (
                                <>
                                    <h2>Retribuição</h2>                                    <div>
                                        <label>Frequência do pagamento</label>
                                        <select name='formaPagamento' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="diariamente">Diariamente</option>
                                            <option value="semanalmente">Semanalmente</option>
                                            <option value="mensamente">Mensalmente</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {Mensalmente && (
                                <>
                                    {step === 22 && (
                                        <>
                                            <h2>Retribuição</h2>                                    <div>
                                                <label>Valor de cada parcela</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="valorParcela"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}


                                    {step === 23 && (
                                        <>
                                            <h2>Retribuição</h2>                                    <div>
                                                <label>Data de pagamento cada parcela</label>
                                                <input
                                                    type='date'
                                                    placeholder=''
                                                    name="dataVenc"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 24 && (
                                <>
                                    <h2>Retribuição</h2>                                    <div>
                                        <label>Modalidade de pagamento</label>
                                        <select name='modalidade' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="Pix">Pix</option>
                                            <option value="CartaoDebito">Cartão de Débito</option>
                                            <option value="CartaoCredito">Cartão de Crédito</option>
                                            <option value="Boleto">Boleto</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 25 && (
                                <>
                                    <h2>Retribuição</h2>                                    <div>
                                        <label>Existência de sinal ou entrada? </label>
                                        <select name='sinal' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {sinal && (
                                <>
                                    {step === 26 && (
                                        <>
                                            <h2>Preço e Condições de Pagamento</h2>
                                            <div>
                                                <label>Valor do sinal ou entrada </label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="valorSinal"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 27 && (
                                        <>
                                            <h2>Preço e Condições de Pagamento</h2>
                                            <div>
                                                <label>Data de Pagamento</label>
                                                <input
                                                    type='date'
                                                    placeholder=''
                                                    name="dataPag"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}


                            {step === 28 && (
                                <>
                                    <h2>Retribuição</h2>                                    <div>
                                        <label>Multa por atraso de pagamento</label>
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


                            {step === 29 && (
                                <>
                                    <h2>Retribuição</h2>                                    <div>
                                        <label>Conta bancária para depósito (se aplicável)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="contaBancaria"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 30 && (
                                <>
                                    <h2>Frequência e Horários para Atendimento</h2>                                    <div>
                                        <label>Horários de funcionamento do salão parceiro</label>
                                        <input
                                            type='text'
                                            placeholder='Exemplo: Segunda a sábado, das 9h às 19h'
                                            name="horarioFunc"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}



                            {step === 31 && (
                                <>
                                    <h2>Frequência e Horários para Atendimento</h2>
                                    <div>
                                        <label>O salão conta com recepção para atender os clientes?</label>
                                        <select name='recepcao' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 32 && (
                                <>
                                    <h2>Frequência e Horários para Atendimento</h2>                                    <div>
                                        <label>Quem fornecerá os materiais e equipamentos para execução dos serviços?</label>
                                        <input
                                            type='text'
                                            placeholder='Especificar: salão, profissional ou ambos'
                                            name="fornecerMaterial"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 33 && (
                                <>
                                    <h2>Frequência e Horários para Atendimento</h2>                                    <div>
                                        <label>Em caso de descumprimento contratual, a parte infratora estará sujeita ao pagamento de uma multa no valor de</label>
                                        <input
                                            type='text'
                                            placeholder='Especificar o valor ou percentual'
                                            name="percentualDescumprimento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 34 && (
                                <>
                                    <h2>OUTRAS CLÁUSULAS</h2>
                                    <div>
                                        <label>Deseja Adicionar Cláusula específica?</label>
                                        <i style={{ color: '#000' }}>
                                            Caso necessário, poderão ser incluídas cláusulas específicas relacionadas a:

                                            Lei Geral de Proteção de Dados (LGPD): Tratamento de dados pessoais conforme a legislação vigente.

                                            Sigilo e Confidencialidade: As partes se comprometem a manter sigilo sobre todas as informações trocadas.
                                            <br />
                                            Garantia dos Serviços: Definição de prazos e condições para garantia do serviço prestado.
                                            <br />
                                            Propriedade Intelectual: Caso os serviços envolvam criação intelectual, definir quem detém os direitos sobre os produtos gerados.
                                        </i>
                                        <select name="clausulaEspecifica" onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {clausulaEspecifica && (
                                <>
                                    {step === 35 && (
                                        <>
                                            <h2>OUTRAS CLÁUSULAS</h2>

                                            {extras.map((_, index) => (
                                                <div
                                                    key={index}
                                                    style={{
                                                        marginBottom: "15px",
                                                        borderBottom: "1px solid #000",
                                                        paddingBottom: "10px",
                                                    }}
                                                >
                                                    <label>Título da Cláusula</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Digite o título"
                                                        name="Titulo"
                                                        value={extras[index]?.Titulo || ""}
                                                        onChange={(e) => handleChangeExtra(e, index)}
                                                    />

                                                    <label>Conteúdo</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Digite o conteúdo"
                                                        name="Conteudo"
                                                        value={extras[index]?.Conteudo || ""}
                                                        onChange={(e) => handleChangeExtra(e, index)}
                                                    />

                                                    <button onClick={() => removerClausula(index)}>Remover</button>
                                                </div>
                                            ))}

                                            <button onClick={adicionarClausula}>Adicionar Nova Cláusula</button>
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </>
                                    )}
                                </>
                            )}


                            {step === 36 && (
                                <>
                                    <h2>Foro</h2>                                    <div>
                                        <label>Fica eleito o foro da comarca de [Cidade/Estado] para dirimir quaisquer dúvidas ou conflitos decorrentes deste contrato</label>
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

                            {step === 37 && (
                                <>
                                    <h2>Propriedade intelectual e confidencialidade</h2>                                    <div>
                                        <label>A propriedade intelectual de materiais criados durante a parceria pertencerá a</label>
                                        <input
                                            type='text'
                                            placeholder='Especificar quem detém os direitos'
                                            name="direitos"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 38 && (
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
                                    {step === 39 && (
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

                                    {step === 40 && (
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

                                    {step === 41 && (
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

                                    {step === 42 && (
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

                            {step === 43 && (
                                <>
                                    <h2>Disposições Gerais</h2>
                                    <div>
                                        <label>O contrato será registrado em cartório?</label>
                                        <div>
                                            <select name='registroCartorioTest' onChange={handleChange}>
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

                            {step === 44 && (
                                <>
                                    <h2>Disposições Gerais</h2>
                                    <div>
                                        <label>Local de Assinatura</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="local"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}
                            {step === 45 && (
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
                    <button className='btnBaixarPdf' onClick={() => { geradorServicoSalaoPago(formData, extras) }}>
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