'use client'
import Pilha from '@/lib/pilha';
import { verificarValor } from '@/lib/utils';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';


const jogadorfutebolschema = z.object({

    /**JOGADOR(A) */
    nomeJogador: z.string(),
    enderecoJogador: z.string(),
    documentoJogador: z.enum(['RG', 'PASSAPORTE', 'CNH']),
    numeroJogador: z.string(),
    cpfJogador: z.string(),
    dataNascimento: z.string(),
    menor: z.enum(['S', 'N']),
    //se sim
    responsavelNome: z.string(),
    responsavelNacionalidade: z.string(),
    responsabilidadeProfissao: z.string(),
    responsabilidadeRG: z.string(),
    responsabilidadeCPF: z.string(),
    responsabilidadeEndereco: z.string(),
    /** */

    /**REPRESENTANTE/AGENTE INTERMEDIÁRIO */

    pessoa: z.enum(['Juridico', 'fisica']),

    //pessoa fisica
    nomeRepre: z.string(),
    enderecoRepre: z.string(),
    documentoRepre: z.enum(['RG', 'PASSAPORTE', 'CNH']),
    cpfRepre: z.string(),
    //--------------

    //pessoa juridica
    razaoSocial: z.string(),
    cnpj: z.string(),
    representanteNome: z.string(),
    representanteCargo: z.string(),
    representanteIdentidade: z.string(),
    representanteCpf: z.string(),
    representanteEndereco: z.string(),
    //------

    /** */

    /**TERMO DE REPRESENTAÇÃO*/
    vigencia: z.string(),
    iniciando: z.string(),
    fechando: z.string(),
    /** */

    /**COMISSÃO E REMUNERAÇÃO */
    comissao: z.string(),
    multa: z.string(),
    /** */

    /**Representação Exclusiva */
    concedeExclusividade: z.enum(['concede', 'naoconcede']),
    /** */

    /**Rescisão do Contrato */
    avisoPrevio: z.string(),
    multaRescisao: z.string(),
    /** */

    /**JURISDIÇÃO E LEI APLICÁVEL */
    comarca: z.string(),
    estado: z.string(),
    testemunhasNecessarias: z.enum(['S', 'N']),
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

type FormData = z.infer<typeof jogadorfutebolschema>;

export default function JogadorFutebol() {
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
    const [testemunhasNecessarias, setTestemunhasNecessarias] = useState(false);
    const [menor, setMenor] = useState(false);
    const [Juridico, setJuridico] = useState(false);
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



        if (currentStepData.menor === 'S') {
            setMenor(true);
            nextStep = 8;
        } else if (currentStepData.menor === 'N') {
            nextStep = 14;
        }


        if (currentStepData.pessoa === 'Juridico') {
            setJuridico(true);
            nextStep = 15;
        } else if (currentStepData.pessoa === 'fisica') {
            nextStep = 22;
        }


        if (currentStepData.testemunhasNecessarias === 'S') {
            setTestemunhasNecessarias(true);
            nextStep = 37;
        } else if (currentStepData.testemunhasNecessarias === 'N') {
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

    const geradorJogadorFutebolPDF = (dados: any) => {
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


        // Página 1 - Cabeçalho
        doc.setFontSize(14);
        doc.text("CONTRATO DE REPRESENTAÇÃO DE JOGADOR DE FUTEBOL", 105, posY, { align: "center" });
        posY += 15;

        // Seção 1: Identificação das Partes
        addSection("1. Identificação das Partes", [
            "JOGADOR REPRESENTADO:",
            `Nome completo: ${verificarValor(dados.nomeJogador)}`,
            `Endereço completo: ${verificarValor(dados.enderecoJogador)}`,
            `Documento de identificação (RG ou passaporte): ${verificarValor(dados.documentoJogador)}`,
            `Número do documento: ${verificarValor(dados.numeroJogador)}`,
            `CPF: ${verificarValor(dados.cpfJogador)}`,
            `Data de nascimento: ${verificarValor(dados.dataNascimento)}`,
            `(O jogador é menor de idade? (${dados.menor === 'S' ? 'Sim' : 'Não'})`,
            dados.menor === 'S' ? `Se sim, informar dados do responsável legal: Nome: ${verificarValor(dados.responsavelNome)}, Nacionalidade: ${verificarValor(dados.responsavelNacionalidade)}, Profissão: ${verificarValor(dados.responsabilidadeProfissao)}, RG: ${verificarValor(dados.responsabilidadeRG)}, CPF: ${verificarValor(dados.responsabilidadeCPF)}, Endereço: ${verificarValor(dados.responsabilidadeEndereco)}` : ""
        ]);

        addSection("REPRESENTANTE/AGENTE INTERMEDIÁRIO:", [
            `(${dados.pessoa === 'fisica' ? 'X' : ' '}) Pessoa física`,
            dados.pessoa === 'fisica' ? `Nome completo: ${verificarValor(dados.nomeRepre)}` : "",
            dados.pessoa === 'fisica' ? `Endereço completo: ${verificarValor(dados.enderecoRepre)}` : "",
            dados.pessoa === 'fisica' ? `Documento de identificação (RG ou passaporte): ${verificarValor(dados.documentoRepre)}` : "",
            dados.pessoa === 'fisica' ? `CPF: ${verificarValor(dados.cpfRepre)}` : "",
            `(${dados.pessoa === 'Juridico' ? 'X' : ' '}) Pessoa jurídica`,
            dados.pessoa === 'Juridico' ? `Razão social: ${verificarValor(dados.razaoSocial)}` : "",
            dados.pessoa === 'Juridico' ? `CNPJ: ${verificarValor(dados.cnpj)}` : "",
            dados.pessoa === 'Juridico' ? `Representante legal: Nome: ${verificarValor(dados.representanteNome)}, Cargo: ${verificarValor(dados.representanteCargo)}, Identidade: ${verificarValor(dados.representanteIdentidade)}, CPF: ${verificarValor(dados.representanteCpf)}` : "",
            dados.pessoa === 'Juridico' ? `Endereço completo: ${verificarValor(dados.representanteEndereco)}` : ""
        ]);

        // Seção 2: Termo de Representação
        addSection("2. Termo de Representação", [
            `2.1. O presente contrato terá vigência de ${verificarValor(dados.vigencia)}, iniciando-se em ${verificarValor(dados.iniciando)} e encerrando-se em ${verificarValor(dados.fechando)}.`
        ]);

        // Seção 3: Responsabilidades do Representante
        addSection("3. Responsabilidades do Representante", [
            "3.1. Representar o jogador em negociações contratuais, transferências e acordos comerciais.",
            "3.2. Buscar oportunidades de carreira, incluindo contratos publicitários e participações em eventos.",
            "3.3. Assessorar o jogador na tomada de decisões relacionadas à sua carreira.",
            "3.4. Garantir a transparência e boas práticas na intermediação de contratos."
        ]);

        // Seção 4: Poderes do Representante
        addSection("4. Poderes do Representante", [
            "4.1. Assinar contratos e negociar termos financeiros em nome do jogador, quando autorizado por procuração específica.",
            "4.2. Representar o jogador em reuniões e tratativas relacionadas à sua carreira.",
            "4.3. Buscar oportunidades de marketing, imagem e patrocínio para o jogador."
        ]);

        // Seção 5: Comissões e Remuneração
        addSection("5. Comissões e Remuneração", [
            `5.1. O representante receberá como comissão ${verificarValor(dados.comissao)}% sobre os rendimentos obtidos pelo jogador nos contratos intermediados.`,
            "5.2. Os pagamentos serão realizados conforme periodicidade e condições acordadas entre as partes.",
            `5.3. Em caso de atraso, será aplicada multa de ${verificarValor(dados.multa)}% ao mês sobre o valor devido.`
        ]);

        // Seção 6: Representação Exclusiva
        addSection("6. Representação Exclusiva", [
            `6.1. O presente contrato (${dados.concedeExclusividade === 'concede' ? '✓' : ' '}) concede (${dados.concedeExclusividade === 'naoconcede' ? '✓' : ' '}) não concede exclusividade ao representante.`,
            "6.2. Caso conceda exclusividade, o jogador não poderá firmar contratos com outros agentes durante a vigência deste contrato."
        ]);

        // Seção 7: Deveres e Obrigações do Jogador
        addSection("7. Deveres e Obrigações do Jogador", [
            "7.1. Fornecer informações verdadeiras e precisas sobre sua carreira e interesses profissionais.",
            "7.2. Cumprir todas as obrigações contratuais assumidas por meio da intermediação do representante.",
            "7.3. Notificar previamente o representante sobre quaisquer negociações paralelas."
        ]);

        // Seção 8: Rescisão do Contrato
        addSection("8. Rescisão do Contrato", [
            `8.1. O contrato poderá ser rescindido por qualquer das partes mediante aviso prévio de ${verificarValor(dados.avisoPrevio)} dias.`,
            "8.2. Em caso de violação de obrigações contratuais, a parte prejudicada poderá rescindir o contrato imediatamente.",
            `8.3. Caso ocorra rescisão sem justa causa, a parte infratora deverá pagar multa de R$ ${verificarValor(dados.multaRescisao)}.`
        ]);

        // Seção 9: Foro para Resolução de Disputas
        addSection("9. Foro para Resolução de Disputas", [
            `9.1. As partes elegem o foro da Comarca de ${verificarValor(dados.comarca)}, para dirimir quaisquer dúvidas ou questões oriundas deste contrato.`
        ]);

        // Assinaturas
        addSection("Assinaturas", [
            `E por estarem assim justas e contratadas, as partes assinam o presente instrumento em duas vias de igual teor e forma.`,
            `Data: ${verificarValor(dados.dataAssinatura)}`,
            "Assinaturas:",
            "_____________________________ (JOGADOR)",
            "_____________________________ (REPRESENTANTE)"
        ]);

        if (dados.testemunhasNecessarias === 'S') {
            addSection("Testemunhas:", [
                `Nome: ${verificarValor(dados.nomeTest1)} CPF: ${verificarValor(dados.cpfTest1)}`,
                "Assinatura: _____________________________",
                `Nome: ${verificarValor(dados.nomeTest2)} CPF: ${verificarValor(dados.cpfTest2)}`,
                "Assinatura: _____________________________"
            ]);
        }

        // Registro em Cartório
        if (dados.registroCartorioTest === 'S') {
            addSection("Registro em Cartório", [
                "O presente contrato será registrado em cartório."
            ]);
        }

        const pdfDataUri = doc.output("datauristring");
        setPdfDataUrl(pdfDataUri);
    };

    useEffect(() => {
        geradorJogadorFutebolPDF({ ...formData });
    }, [formData]);


    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title">Modelo de Contrato de Representação de Jogador de Futebol</h1>
            </div>
            <div className="container">
                <div className="left-panel">
                    <div className="scrollable-card">
                        <div className="progress-bar">
                            <div
                                className="progress-bar-inner"
                                style={{ width: `${(step / 42) * 100}%` }}
                            ></div>
                        </div>
                        <div className="form-wizard">

                            {step === 1 && (
                                <>
                                    <h2>Jogador(a) </h2>                                    <div>
                                        <label>Nome completo</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="nomeJogador"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <h2>Jogador(a) </h2>                                    <div>
                                        <label> Endereço completo</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="enderecoJogador"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 3 && (
                                <>
                                    <h2>Jogador(a) </h2>                                    <div>
                                        <label>Documento de identificação</label>
                                        <select name='documentoJogador' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="RG">RG</option>
                                            <option value="PASSAPORTE">Passaporte</option>
                                            <option value="CNH">CNH</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 4 && (
                                <>
                                    <h2>Jogador(a) </h2>                                    <div>
                                        <label>Número do Documento</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="numeroJogador"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 5 && (
                                <>
                                    <h2>Jogador(a) </h2>                                    <div>
                                        <label>CPF</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="cpfJogador"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 6 && (
                                <>
                                    <h2>Jogador(a) </h2>                                    <div>
                                        <label>Data de Nascimento</label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="dataNascimento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 7 && (
                                <>
                                    <h2>Jogador(a) </h2>                                    <div>
                                        <label>O jogador é menor de idade?</label>
                                        <select name='menor' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {menor && (
                                <>
                                    {step === 8 && (
                                        <>
                                            <h2>Dados do Responsável legal </h2>                                    <div>
                                                <label>Nome do Responsável</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="responsavelNome"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 9 && (
                                        <>
                                            <h2>Dados do Responsável legal </h2>                                    <div>
                                                <label>Nacionalidade do Responsável</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="responsavelNacionalidade"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 10 && (
                                        <>
                                            <h2>Dados do Responsável legal </h2>                                    <div>
                                                <label>Profissão do Responsável</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="responsabilidadeProfissao"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 11 && (
                                        <>
                                            <h2>Dados do Responsável legal </h2>                                    <div>
                                                <label>RG do Responsável</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="responsabilidadeRG"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 12 && (
                                        <>
                                            <h2>Dados do Responsável legal </h2>                                    <div>
                                                <label>CPF do Responsável</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="responsabilidadeCPF"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 13 && (
                                        <>
                                            <h2>Dados do Responsável legal </h2>                                    <div>
                                                <label>Endereço do Responsável</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="responsabilidadeEndereco"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 14 && (
                                <>
                                    <h2>Representante / Agente Intermediário </h2>                                    <div>
                                        <label>O Representante é </label>
                                        <select name='pessoa' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="Juridico">Jurídico</option>
                                            <option value="fisica">Fisíca</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {Juridico && (
                                <>
                                    {step === 15 && (
                                        <>
                                            <h2>Representante / Agente Intermediário </h2>                                    <div>
                                                <label>Razão social</label>
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

                                    {step === 16 && (
                                        <>
                                            <h2>Representante / Agente Intermediário </h2>                                    <div>
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

                                    {step === 17 && (
                                        <>
                                            <h2>Representante / Agente Intermediário </h2>                                    <div>
                                                <label>Nome do Representante legal</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="representanteNome"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 18 && (
                                        <>
                                            <h2>Representante / Agente Intermediário </h2>                                    <div>
                                                <label>Cargo do Representante legal</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="representanteCargo"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 19 && (
                                        <>
                                            <h2>Representante / Agente Intermediário </h2>                                    <div>
                                                <label>Identidade do Representante legal</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="representanteIdentidade"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 20 && (
                                        <>
                                            <h2>Representante / Agente Intermediário </h2>                                    <div>
                                                <label>CPF do Representante legal</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="representanteCpf"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 21 && (
                                        <>
                                            <h2>Representante / Agente Intermediário </h2>                                    <div>
                                                <label>Endereço do Representante legal</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="representanteEndereco"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}



                            {step === 22 && (
                                <>
                                    <h2>Representante / Agente Intermediário </h2>                                    <div>
                                        <label>Nome </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="nomeRepre"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 23 && (
                                <>
                                    <h2>Representante / Agente Intermediário </h2>                                    <div>
                                        <label>Endereço </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="enderecoRepre"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 24 && (
                                <>
                                    <h2>Representante / Agente Intermediário </h2>                                    <div>
                                        <label>Tipo de Documento</label>
                                        <select name='documentoRepre' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="RG">Rg</option>
                                            <option value="PASSAPORTE">Passaporte</option>
                                            <option value="CNH">CNH</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 25 && (
                                <>
                                    <h2>Representante / Agente Intermediário </h2>                                    <div>
                                        <label>CPF </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="cpfRepre"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 26 && (
                                <>
                                    <h2>Termo de Representação </h2>                                    <div>
                                        <label>O presente contrato terá vigência de ______ (meses/anos)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="vigencia"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 27 && (
                                <>
                                    <h2>Termo de Representação </h2>                                    <div>
                                        <label>Iniciando-se em //______ </label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="iniciando"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 28 && (
                                <>
                                    <h2>Termo de Representação </h2>                                    <div>
                                        <label>Encerrando-se em //______</label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="fechando"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 29 && (
                                <>
                                    <h2>Comissão e Remuneração </h2>                                    <div>
                                        <label>O representante receberá como comissão ______% sobre os rendimentos obtidos pelo jogador nos contratos intermediados</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="comissao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 30 && (
                                <>
                                    <h2>Comissão e Remuneração </h2>                                    <div>
                                        <label>Em caso de atraso, será aplicada multa de _____% ao mês sobre o valor devido.</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="multa"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 31 && (
                                <>
                                    <h2>Rescisão do Contrato </h2>                                    <div>
                                        <label>O contrato poderá ser rescindido por qualquer das partes mediante aviso prévio de _______ dias.</label>
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

                            {step === 32 && (
                                <>
                                    <h2>Rescisão do Contrato </h2>                                    <div>
                                        <label>Caso ocorra rescisão sem justa causa, a parte infratora deverá pagar multa de R$ ___________. </label>
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

                            {step === 33 && (
                                <>
                                    <h2>Representação Exclusiva </h2>                                    <div>
                                        <label>O presente contrato () concede () não concede exclusividade ao representante. </label>
                                        <select name='concedeExclusividade' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="concede">Concede</option>
                                            <option value="naoconcede">Não Concede</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 34 && (
                                <>
                                    <h2>Jurisdição e Lei Aplicável </h2>                                    <div>
                                        <label>As partes elegem o foro da Comarca de ___________________________, para dirimir quaisquer dúvidas ou questões oriundas deste contrato.</label>
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

                            {step === 35 && (
                                <>
                                    <h2>Jurisdição e Lei Aplicável </h2>                                    <div>
                                        <label>Estado de Assinatura: __________________ </label>
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

                            {step === 36 && (
                                <>
                                    <h2>Jurisdição e Lei Aplicável </h2>                                    <div>
                                        <label>Necessidade de Testemunha</label>
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
                            {testemunhasNecessarias && (
                                <>
                                    {step === 37 && (
                                        <>
                                            <h2>Jurisdição e Lei Aplicável </h2>                                    <div>
                                                <label>Nome da 1° Testemunha</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="nomeTest1"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 38 && (
                                        <>
                                            <h2>Jurisdição e Lei Aplicável </h2>                                    <div>
                                                <label>CPF da 1° Testemunha</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cpfTest1"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}


                                    {step === 39 && (
                                        <>
                                            <h2>Jurisdição e Lei Aplicável </h2>                                    <div>
                                                <label>Nome da 2° Testemunha</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="nomeTest2"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 40 && (
                                        <>
                                            <h2>Jurisdição e Lei Aplicável </h2>                                    <div>
                                                <label>CPF da 2° Testemunha</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cpfTest2"
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
                                    <h2>Jurisdição e Lei Aplicável </h2>                                    <div>
                                        <label>Local: __________________</label>
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

                            {step === 42 && (
                                <>
                                    <h2>Jurisdição e Lei Aplicável </h2>                                    <div>
                                        <label>Data de Assinatura: //____</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="dataAssinatura"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 43 && (
                                <>
                                    <h2>Jurisdição e Lei Aplicável </h2>                                    <div>
                                        <label>Registro em Cartório</label>
                                        <select name='registroCartorioTest' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 44 && (
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