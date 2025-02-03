'use client'
import { verificarValor } from '@/lib/utils';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';

const locacaoquartoimovelresidencialschema = z.object({
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
    descQuarto: z.string(),
    areaComum: z.string(),
    condicoesAtuais: z.string(),
    /** */

    /** PRAZO DA LOCAÇÃO **/
    dataInicioLocacao: z.string(),
    duracaoContrato: z.string(),
    possibilidadeRenovacao: z.enum(['S', 'N']),
    quaisCondicoes: z.string(),
    /**********/

    /**VALOR DO ALUGUEL E FORMA DE PAGAMENTO */
    valorMensal: z.string(),
    dataVencMensal: z.string(),
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

    /** OBRIGAÇÕES DO LOCADOR **/
    locadorManuRep: z.string(),
    locadorServAdicional: z.string(),
    /******/

    /**OBRIGAÇÕES DO LOCATÁRIO */
    locatarioModifica: z.enum(['S', 'N']),

    //se sim
    quaiCondicoes: z.string(),

    locatarioManu: z.string(),
    restricoesUso: z.string(),
    permiteFumar: z.string(),
    animais: z.string(),
    /** */

    /**DESPESAS E TRIBUTOS */
    despesasLocatario: z.string(),
    despesasLocador: z.string(),
    /*** */

    /*REGRAS DE CONVIVÊNCIA */
    horaSilencio: z.string(),
    politicaVisita: z.string(),
    regrasLimpeza: z.string(),
    /** */

    /**RESCISÃO DO CONTRATO */
    condicoesRescisao: z.string(),
    multasPenalidades: z.string(),
    prazo: z.string(),
    /** */

    /**DISPOSIÇÕES GERAIS */
    foroeleito: z.string(),
    testemunhas: z.enum(['S', 'N']),
    nomeTest1: z.string(),
    nomeTest2: z.string(),
    cpfTest1: z.string(),
    cpfTest2: z.string(),

    registroCartorio: z.enum(['S', 'N']),
    /** */


});

type FormData = z.infer<typeof locacaoquartoimovelresidencialschema>

export default function Locacaoquartoimovelresidencial() {
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
    const [locadorJuri, setLocadorJuri] = useState(false);
    const [locadorioJuri, setLocadorioJuri] = useState(false);
    const [finsResidenciais, setFinsResidenciais] = useState(false);
    const [renovacao, setRenovacao] = useState(false);
    const [reajuste, setReajuste] = useState(false);
    const [garantia, setGarantia] = useState(false);
    const [fiador, setFiador] = useState(false);
    const [caucaoDep, setCaucaoDep] = useState(false);
    const [caucaoBemIM, setCaucaoBemIM] = useState(false);
    const [titulos, setTitulos] = useState(false);
    const [seguroFi, setSeguroFi] = useState(false);
    const [locatarioModifica, setLocatarioModifica] = useState(false);
    const [preferenciaLocatario, setPreferenciaLocatario] = useState(false);
    const [Testemunhas, setTestemunhas] = useState(false);
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

    const handleBack = () => setStep((prev) => prev - 1);

    const handleNext = () => {

        setFormData((prev) => ({ ...prev, ...currentStepData }));

        let nextStep = step;




        if (nextStep === step) {
            nextStep += 1;
        }

        setStep(nextStep);

        // Logs para depuração
        console.log(`qtd step depois do ajuste: ${nextStep}`);

        // Limpar os dados do passo atual.
        setCurrentStepData({});

    }

    const gerandorLocacaoQuartoPDF = (dados: any) => {
        const doc = new jsPDF();

        // Configuração inicial de fonte e margens
        const marginX = 10;
        let posY = 20;

        const maxPageHeight = 280;
        const maxTextWidth = 190;

        const checkPageBreak = (additionalHeight: number) => {
            if (posY + additionalHeight >= maxPageHeight) {
                doc.addPage();
                posY = 20;
            }
        };

        const addSection = (title: string, content: string[]) => {
            const titleHeight = 15;
            const lineHeight = 10;

            checkPageBreak(titleHeight);
            doc.setFontSize(12);
            doc.text(title, 105, posY, { align: "center" });
            posY += titleHeight;

            doc.setFontSize(10);
            content.forEach((line: string) => {
                const splitLines = doc.splitTextToSize(line, maxTextWidth);
                splitLines.forEach((splitLine: string) => {
                    checkPageBreak(lineHeight);
                    doc.text(splitLine, marginX, posY);
                    posY += lineHeight;
                });
            });
        };

        // Página 1 - Cabeçalho
        doc.setFontSize(14);
        doc.text("CONTRATO DE LOCAÇÃO DE QUARTO EM IMÓVEL RESIDENCIAL ", 105, posY, { align: "center" });
        posY += 15;

        // Seções do contrato
        addSection("CLÁUSULA 1 - IDENTIFICAÇÃO DAS PARTES", [
            "(Artigos 104, 421 e 425 do Código Civil Brasileiro)",
            "Nesta seção, é feita a descrição detalhada do imóvel objeto do contrato, incluindo seu endereço completo, características e condições.\n Também são especificadas a destinação (residencial ou comercial) e o estado de conservação, conforme o que foi verificado pelas partes.",
            "Locador:",
            `Nome ou Razão Social: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.nomeLocador) : verificarValor(dados.razaoSocial)}`,
            `CPF ou CNPJ: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.CPFLocador) : verificarValor(dados.cnpjlocador)}`,
            `Endereço: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.enderecoLocador) : verificarValor(dados.enderecoCNPJ)}`,
            `Telefone: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.telefoneLocador) : verificarValor(dados.telefoneCNPJ)}`,
            `E-mail: ${verificarValor(dados.locador) === "pf" ? verificarValor(dados.emailLocador) : verificarValor(dados.emailCNPJ)}`,
            verificarValor(dados.locador) === "pj" ? `Representante Legal: ${verificarValor(dados.nomeRepresentanteCNPJ)}, CPF: ${verificarValor(dados.CPFRepresentanteCNPJ)}` : "",
            "",
            "Locatário:",
            `Nome ou Razão Social: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.nomelocatario) : verificarValor(dados.razaoSociallocatario)}`,
            `CPF ou CNPJ: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.CPFlocatario) : verificarValor(dados.cpflocatario)}`,
            `Endereço: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.enderecolocatario) : verificarValor(dados.enderecolocatarioCNPJ)}`,
            `Telefone: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.telefonelocatario) : verificarValor(dados.telefonelocatarioCNPJ)}`,
            `E-mail: ${verificarValor(dados.locatario) === "pf" ? verificarValor(dados.emaillocatario) : verificarValor(dados.emaillocatarioCNPJ)}`,
            verificarValor(dados.locatario) === "pj" ? `Representante Legal: ${verificarValor(dados.nomeRepresentantelocatarioCNPJ)}, CPF: ${verificarValor(dados.CPFRepresentantelocatarioCNPJ)}` : "",
        ]);

        addSection("CLÁUSULA 2 - DESCRIÇÃO DO QUARTO E DO IMÓVEL", [
            "(Lei 8.245/1991, artigo 22: determina que o locador deve entregar o imóvel em estado de servir ao uso a que se destina.)",
            `Endereço completo do imóvel: ${verificarValor(dados.enderecoImovel)}`,
            `Descrição do quarto a ser locado: ${verificarValor(dados.descQuarto)}`,
            `Áreas comuns do imóvel que o locatário terá direito de usar: ${verificarValor(dados.areaComum)}`,
            `Condições atuais do quarto e das áreas comuns: ${verificarValor(dados.condicoesAtuais)}`,
        ]);

        addSection("CLÁUSULA 3 - PRAZO DA LOCAÇÃO", [
            "(Lei 8.245/1991, artigo 46: trata da renovação automática do contrato por prazo indeterminado.)",
            `Data de início da locação: ${verificarValor(dados.dataInicioLocacao)}`,
            `Duração do contrato: ${verificarValor(dados.duracaoContrato)}`,
            `Há possibilidade de renovação? ${verificarValor(dados.possibilidadeRenovacao) === 'S' ? 'Sim' : 'Não'}`,
            verificarValor(dados.possibilidadeRenovacao) === 'S' ? `Quais são as condições? ${verificarValor(dados.quaisCondicoes)}` : "",
        ]);

        addSection("CLÁUSULA 4 - VALOR DO ALUGUEL E CONDIÇÕES DE PAGAMENTO", [
            "(Lei 8.245/1991, artigo 23: o locatário deve pagar pontualmente o aluguel e demais encargos.)",
            `Valor mensal do aluguel: ${verificarValor(dados.valorMensal)}`,
            `Data de vencimento mensal: ${verificarValor(dados.dataVencMensal)}`,
            `Forma de pagamento: ${verificarValor(dados.formaPagamento)}`,
            `Multa por atraso no pagamento: ${verificarValor(dados.multaAtraso)}`,
            `Juros aplicáveis em caso de atraso: ${verificarValor(dados.jurosAplicaveis)}`,
        ]);

        addSection("CLÁUSULA 5 - GARANTIAS LOCATÍCIAS", [
            "(Lei 8.245/1991, artigo 37: regulação sobre as garantias locatícias, como caução, fiança, seguro-fiança ou cessão fiduciária.)",
            `Tipo de garantia exigida: ${verificarValor(dados.garantia) === 'S' ? 'Sim' : 'Não'}`,
            verificarValor(dados.garantia) === 'S' ? `Detalhes da garantia: ${verificarValor(dados.qualgarantidor)}` : "",
            verificarValor(dados.qualgarantidor) === 'fi' ? `Nome do fiador: ${verificarValor(dados.nomeFiador)}, CPF: ${verificarValor(dados.cpfFiador)}, Endereço: ${verificarValor(dados.enderecoFiador)}` : "",
            verificarValor(dados.qualgarantidor) === 'caudep' ? `Valor do título de caução: ${verificarValor(dados.valorTitCaucao)}` : "",
            verificarValor(dados.qualgarantidor) === 'caubem' ? `Descrição do bem de caução: ${verificarValor(dados.descBemCaucao)}` : "",
            verificarValor(dados.qualgarantidor) === 'ti' ? `Descrição do título de crédito utilizado: ${verificarValor(dados.descCredUtili)}` : "",
            verificarValor(dados.qualgarantidor) === 'segfianca' ? `Seguro-fiança: ${verificarValor(dados.segFianca)}` : "",
            `Procedimento para devolução da garantia ao término do contrato: ${verificarValor(dados.procedimentoDevolucao)}`,
        ]);

        addSection("CLÁUSULA 6 - OBRIGAÇÕES DO LOCADOR", [
            "(Lei 8.245/1991, artigo 22, inciso IV: o locador é responsável pelas despesas extraordinárias do condomínio e por manter o imóvel em condições de habitabilidade.)",
            `O locador se responsabiliza por quais manutenções ou reparos no quarto e nas áreas comuns? ${verificarValor(dados.locadorManuRep)}`,
            `O locador fornecerá algum serviço adicional? ${verificarValor(dados.locadorServAdicional)}`,
        ]);

        addSection("CLÁUSULA 7 - OBRIGAÇÕES DO LOCATÁRIO", [
            "(Lei 8.245/1991, artigo 23, inciso I: o locatário deve conservar o imóvel e não pode realizar modificações sem consentimento.)",
            `O locatário pode realizar modificações no quarto? ${verificarValor(dados.locatarioModifica) === 'S' ? 'Sim' : 'Não'}`,
            verificarValor(dados.locatarioModifica) === 'S' ? `Quais são as condições? ${verificarValor(dados.quaiCondicoes)}` : "",
            `O locatário é responsável por quais manutenções no quarto? ${verificarValor(dados.locatarioManu)}`,
            `Há restrições quanto ao uso das áreas comuns? ${verificarValor(dados.restricoesUso)}`,
            `É permitido fumar no interior do imóvel? ${verificarValor(dados.permiteFumar)}`,
            `São permitidos animais de estimação? ${verificarValor(dados.animais)}`,
        ]);

        addSection("CLÁUSULA 8 - DESPESAS E TRIBUTOS", [
            "(Lei 8.245/1991, artigo 22 e 23: o locador é responsável por impostos e taxas extraordinárias, e o locatário pelas despesas ordinárias.)",
            `Quais despesas são de responsabilidade do locatário? ${verificarValor(dados.despesasLocatario)}`,
            `Quais despesas são de responsabilidade do locador? ${verificarValor(dados.despesasLocador)}`,
        ]);

        addSection("CLÁUSULA 9 - REGRAS DE CONVIVÊNCIA", [
            "(Lei 8.245/1991, artigo 23, inciso IV: o locatário deve respeitar regras de convivência do imóvel.)",
            `Horários de silêncio ou restrições de horário para uso das áreas comuns: ${verificarValor(dados.horaSilencio)}`,
            `Política de visitas: ${verificarValor(dados.politicaVisita)}`,
            `Regras sobre limpeza e organização das áreas comuns: ${verificarValor(dados.regrasLimpeza)}`,
        ]);

        addSection("CLÁUSULA 10 - RESCISÃO DO CONTRATO", [
            "(Lei 12.112/2009: alteração na Lei do Inquilinato, permitindo retomada do imóvel com menor prazo de notificação.)",
            `Condições para rescisão antecipada por ambas as partes: ${verificarValor(dados.condicoesRescisao)}`,
            `Multas ou penalidades aplicáveis em caso de rescisão antecipada: ${verificarValor(dados.multasPenalidades)}`,
            `Prazo para notificação prévia de rescisão: ${verificarValor(dados.prazo)}`,
        ]);

        addSection("CLÁUSULA 11 - DISPOSIÇÕES GERAIS", [
            "(Lei 8.245/1991, artigo 8º: necessidade de registro para valer contra terceiros.)",
            `Foro eleito para resolução de conflitos: ${verificarValor(dados.foroeleito)}`,
            `Necessidade de testemunhas para assinatura do contrato: ${verificarValor(dados.testemunhas) === 'S' ? 'Sim' : 'Não'}`,
            verificarValor(dados.testemunhas) === 'S' ? `Nome da primeira testemunha: ${verificarValor(dados.nomeTest1)}, CPF: ${verificarValor(dados.cpfTest1)}` : "",
            verificarValor(dados.testemunhas) === 'S' ? `Nome da segunda testemunha: ${verificarValor(dados.nomeTest2)}, CPF: ${verificarValor(dados.cpfTest2)}` : "",
            `O contrato será registrado em cartório? ${verificarValor(dados.registroCartorio) === 'S' ? 'Sim' : 'Não'}`,
        ]);

        const pdfDataUri = doc.output("datauristring");
        setPdfDataUrl(pdfDataUri);
    };

    useEffect(() => {
        gerandorLocacaoQuartoPDF({ ...formData })
    }, [formData])


    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title">Contrato de Locação de Imóvel Residencial</h1>
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
                                        <label>Descrição do quarto a ser locado (ex.: tamanho, mobiliário incluído)</label>
                                        <textarea
                                            id="descQuarto"
                                            name="descQuarto"
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

                            {step === 27 && (
                                <>
                                    <h2>Descrição do Imóvel</h2>
                                    <div>
                                        <label>Áreas comuns do imóvel que o locatário terá direito de usar (ex.: cozinha, banheiro, sala de estar)</label>
                                        <textarea
                                            id="areaComum"
                                            name="areaComum"
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

                            {step === 28 && (
                                <>
                                    <h2>Descrição do Imóvel</h2>
                                    <div>
                                        <label>Áreas comuns do imóvel que o locatário terá direito de usar (ex.: cozinha, banheiro, sala de estar)</label>
                                        <textarea
                                            id="condicoesAtuais"
                                            name="condicoesAtuais"
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


                            {step === 29 && (
                                <>
                                    <h2>Prazo da Locação</h2>
                                    <div>
                                        <label>Data de início da locação</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="dataInicioLocacao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 30 && (
                                <>
                                    <h2>Prazo da Locação</h2>
                                    <div>
                                        <label>Duração do contrato (em meses)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="duracaoContrato"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 31 && (
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
                                    {step === 32 && (
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

                            {step === 33 && (
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

                            {step === 34 && (
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


                            {step === 35 && (
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

                            {step === 36 && (
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

                            {step === 37 && (
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

                            {step === 38 && (
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
                                    {step === 39 && (
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
                                    {step === 40 && (
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

                                    {step === 41 && (
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

                                    {step === 42 && (
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

                                    {step === 43 && (
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

                                    {step === 44 && (
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

                                    {step === 45 && (
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

                                    {step === 46 && (
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

                                    {step === 47 && (
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

                                    {step === 48 && (
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
                                    {step === 49 && (
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
                                    {step === 50 && (
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
                                    {step === 51 && (
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
                                    {step === 52 && (
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

                            {step === 53 && (
                                <>
                                    <h2>Obrigações do Locador</h2>
                                    <div>
                                        <label>O locador se responsabiliza por quais manutenções ou reparos no quarto e nas áreas comuns? </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="locadorManuRep"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 54 && (
                                <>
                                    <h2>Obrigações do Locador</h2>
                                    <div>
                                        <label>O locador fornecerá algum serviço adicional (ex.: limpeza das áreas comuns, internet)? </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="locadorServAdicional"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 55 && (
                                <>
                                    <h2>Obrigações do Locatário</h2>
                                    <div>
                                        <label>O locatário pode realizar modificações no quarto? </label>
                                        <select name='locatarioModifica' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {locatarioModifica && (
                                <>
                                    {step === 56 && (
                                        <>
                                            <h2>Obrigações do Locatário</h2>
                                            <div>
                                                <label>Quais Condições ?</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="quaiCondicoes"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}


                            {step === 57 && (
                                <>
                                    <h2>Obrigações do Locatário</h2>
                                    <div>
                                        <label>O locatário é responsável por quais manutenções no quarto? </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="locatarioManu"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 58 && (
                                <>
                                    <h2>Obrigações do Locatário</h2>
                                    <div>
                                        <label>O locatário é responsável por quais manutenções no quarto? </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="locatarioManu"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 59 && (
                                <>
                                    <h2>Obrigações do Locatário</h2>
                                    <div>
                                        <label>Há restrições quanto ao uso das áreas comuns?</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="restricoesUso"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 60 && (
                                <>
                                    <h2>Obrigações do Locatário</h2>
                                    <div>
                                        <label>É permitido fumar no interior do imóvel?</label>
                                        <select name='permiteFumar' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 61 && (
                                <>
                                    <h2>Obrigações do Locatário</h2>
                                    <div>
                                        <label>São permitidos animais de estimação? </label>
                                        <select name='animais' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 62 && (
                                <>
                                    <h2>Despesas e Tributos</h2>
                                    <div>
                                        <label>Quais despesas são de responsabilidade do locatário? (ex.: contas de água, luz, internet) </label>
                                        <textarea
                                            id="despesasLocatario"
                                            name="despesasLocatario"
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

                            {step === 63 && (
                                <>
                                    <h2>Despesas e Tributos</h2>
                                    <div>
                                        <label>Quais despesas são de responsabilidade do locador? </label>
                                        <textarea
                                            id="despesasLocador"
                                            name="despesasLocador"
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


                            {step === 64 && (
                                <>
                                    <h2>Regras de Convivência</h2>
                                    <div>
                                        <label>Há restrições quanto ao uso das áreas comuns?</label>
                                        <textarea
                                            id="horaSilencio"
                                            name="horaSilencio"
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

                            {step === 65 && (
                                <>
                                    <h2>Regras de Convivência</h2>
                                    <div>
                                        <label>Política de visitas (ex.: número máximo de visitantes, horários permitidos)</label>
                                        <textarea
                                            id="politicaVisita"
                                            name="politicaVisita"
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

                            {step === 66 && (
                                <>
                                    <h2>Regras de Convivência</h2>
                                    <div>
                                        <label>Regras sobre limpeza e organização das áreas comuns</label>
                                        <textarea
                                            id="regrasLimpeza"
                                            name="regrasLimpeza"
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

                            {step === 67 && (
                                <>
                                    <h2>Rescisão do Contrato</h2>
                                    <div>
                                        <label>Condições para rescisão antecipada por ambas as partes</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="condicoesRescisao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 68 && (
                                <>
                                    <h2>Rescisão do Contrato</h2>
                                    <div>
                                        <label>Multas ou penalidades aplicáveis em caso de rescisão antecipada</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="multasPenalidades"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 69 && (
                                <>
                                    <h2>Rescisão do Contrato</h2>
                                    <div>
                                        <label>Prazo para notificação prévia de rescisão</label>
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

                            {step === 70 && (
                                <>
                                    <h2>Disposição Gerais</h2>
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

                            {step === 71 && (
                                <>
                                    <h2>Disposição Gerais</h2>
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
                                                        name="cpfTest1"
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