'use client'
import Pilha from '@/lib/pilha';
import { verificarValor } from '@/lib/utils';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';
import geradorServicoEnsinoPago from '../util/pdf';



const servicoensinoschema = z.object({
    /**ALUNO */
    nomeCompleto: z.string(),
    estadoCivil: z.string(),
    nacionalidade: z.string(),
    profissao: z.string(),
    rgAluno: z.string(),
    cpfAluno: z.string(),
    enderecoAluno: z.string(),
    telefone: z.string(),
    email: z.string(),
    /** */

    /**Profissional Contratado */
    nomeCompletoContratado: z.string(),
    estadoCivilContratado: z.string(),
    nacionalidadeContratado: z.string(),
    profissaoContratado: z.string(),
    rgContratado: z.string(),
    cpfContratado: z.string(),
    enderecoContratado: z.string(),
    telefoneContratado: z.string(),
    emailContratado: z.string(),
    /** */

    /**OBJETO DO CONTRATO */
    disciplinaMinistrada: z.string(),
    duracao: z.string(),
    frequencia: z.string(),
    horarios: z.string(),
    diasAcordados: z.string(),
    taxaMatricula: z.enum(['S', 'N']),
    //se sim
    valorMatricula: z.string(),
    /** */

    /**Honorários e Forma de Pagamento */
    pagamentoAula: z.enum(['poraula', 'mensal']),

    //se for por aula
    valorAula: z.string(),

    //se for mensal
    valorAulaMensal: z.string(),

    modalidade: z.enum(['Pix', 'dinheiro', 'CartaoDebito', 'CartaoCredito', 'Boleto']),
    vencimento: z.string(),
    multaPorAtraso: z.string(),
    juros: z.string(),
    /** */

    /**Política de Cancelamento e Reagendamento */
    horasCancelamento: z.string(),
    horasReagendamento: z.string(),
    /** */

    /** Recisão*/
    avisoPrevio: z.string(),
    multaRescisao: z.string(),
    /** */

    /**Penalidade */
    multaPenalidade: z.string(),
    /** */

    /**DISPOSIÇÕES GERAIS */
    foroResolucaoConflitos: z.string(), // Foro eleito para resolução de conflitos
    estado: z.string(),
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

type FormData = z.infer<typeof servicoensinoschema>;


export default function ServicoEnsino() {
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
    const valor = 14.90;
    const [pdfDataUrl, setPdfDataUrl] = useState<string>("");
    const [modalPagamento, setModalPagamento] = useState<Boolean>(false);
    const [isLoading, setIsLoading] = useState(false);
    /** */

    //VARIAVEIS DE CONTROLE DE FLUXO
    const [Testemunhas, setTestemunhas] = useState(false);
    const [taxaMatricula, setTaxaMatricula] = useState(false);
    const [poraula, setPoraula] = useState(false);
    const [mensal, setMensal] = useState(false);
    const [sinal, setSinal] = useState(false);
    const [aplicaReajuste, setAplicaReajuste] = useState(false);
    const [clausulaEspecifica, setClausulaEspecifica] = useState(false);
    const [extras, setExtras] = useState<ClausulasExtras[]>([]);
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


        if (currentStepData.taxaMatricula === 'S') {
            setTaxaMatricula(true);
            nextStep = 24;
        } else if (currentStepData.taxaMatricula === 'N') {
            nextStep = 25;
        }

        if (currentStepData.pagamentoAula === 'poraula') {
            setPoraula(true);
            nextStep = 26;
        } else if (currentStepData.pagamentoAula === 'mensal') {
            setMensal(true);
            nextStep = 27;
        }

        if (nextStep === 26) {
            nextStep = 28;
        }


        if (currentStepData.testemunhasNecessarias === 'S') {
            setTestemunhas(true);
            nextStep = 40;
        } else if (currentStepData.testemunhasNecessarias === 'N') {
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

    const geradorServicoEnsino = (dados: any) => {
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
        doc.text("CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS - AULAS PARTICULARES", 105, posY, { align: "center" });
        posY += 15;

        // Seção 1 - Aluno Contratante
        addSection("Aluno Contratante", [
            "Art. 104 do Código Civil – Trata sobre os requisitos de validade dos negócios jurídicos, incluindo a capacidade das partes envolvidas.",
            "Art. 166 e 171 do Código Civil – Definem hipóteses de nulidade e anulabilidade do contrato.",
            `Nome completo: ${verificarValor(dados.nomeCompleto)}`,
            `Estado civil: ${verificarValor(dados.estadoCivil)}`,
            `Nacionalidade: ${verificarValor(dados.nacionalidade)}`,
            `Profissão: ${verificarValor(dados.profissao)}`,
            `Carteira de identidade (RG): ${verificarValor(dados.rgAluno)}`,
            `CPF: ${verificarValor(dados.cpfAluno)}`,
            `Endereço completo: ${verificarValor(dados.enderecoAluno)}`,
            `Contato (telefone/e-mail): ${verificarValor(dados.telefone)} / ${verificarValor(dados.email)}`
        ]);

        // Seção 2 - Profissional Contratado
        addSection("Profissional Contratado", [
            `Nome completo: ${verificarValor(dados.nomeCompletoContratado)}`,
            `Estado civil: ${verificarValor(dados.estadoCivilContratado)}`,
            `Nacionalidade: ${verificarValor(dados.nacionalidadeContratado)}`,
            `Profissão: ${verificarValor(dados.profissaoContratado)}`,
            `Carteira de identidade (RG): ${verificarValor(dados.rgContratado)}`,
            `CPF: ${verificarValor(dados.cpfContratado)}`,
            `Endereço completo: ${verificarValor(dados.enderecoContratado)}`,
            `Contato (telefone/e-mail): ${verificarValor(dados.telefoneContratado)} / ${verificarValor(dados.emailContratado)}`
        ]);

        // Seção 3 - Objeto do Contrato
        addSection("Objeto do Contrato", [
            "Art. 421 do Código Civil – Trata da liberdade contratual e seus limites pela função social do contrato.",
            "Art. 422 do Código Civil – Determina que os contratantes devem agir com boa-fé e lealdade.",
            "O presente contrato tem por objeto a prestação de serviços educacionais por parte do Profissional Contratado ao Aluno Contratante, por meio de aulas particulares.",
            `Disciplina/Matéria a ser ministrada: ${verificarValor(dados.disciplinaMinistrada)}`,
            `Duração de cada aula: ${verificarValor(dados.duracao)} minutos.`,
            `Frequência: ${verificarValor(dados.frequencia)} vezes por semana.`,
            `Horários e dias acordados: ${verificarValor(dados.horarios)} / ${verificarValor(dados.diasAcordados)}`,
            `Haverá taxa de matrícula? ${verificarValor(dados.taxaMatricula) === 'S' ? 'Sim' : 'Não'}. Caso afirmativo, valor: R$ ${verificarValor(dados.valorMatricula)}`
        ]);

        // Seção 4 - Honorários e Forma de Pagamento
        addSection("Honorários e Forma de Pagamento", [
            "Art. 481 do Código Civil – Dispõe sobre contratos onerosos e a obrigação de pagamento.",
            " Art. 315 do Código Civil – Determina que o pagamento deve ser feito em moeda corrente e nos termos estipulados.",
            "Art. 316 do Código Civil – Permite a correção do valor quando houver desproporção manifesta.",
            `Valor: O valor de cada aula será de R$ ${verificarValor(dados.valorAula)} ou um pacote mensal de R$ ${verificarValor(dados.valorAulaMensal)}.`,
            `Forma de Pagamento: O pagamento será realizado via ${verificarValor(dados.modalidade)}.`,
            `Vencimento: O pagamento deverá ser efetuado até o dia ${verificarValor(dados.vencimento)} de cada mês.`,
            `Multa por Atraso: Em caso de atraso, incidirá uma multa de ${verificarValor(dados.multaPorAtraso)}% sobre o valor devido, além de juros de ${verificarValor(dados.juros)}% ao dia.`
        ]);

        // Seção 5 - Política de Cancelamento e Reagendamento
        addSection("Política de Cancelamento e Reagendamento", [
            "Art. 475 do Código Civil – Define que a parte lesada por inadimplemento pode pedir rescisão do contrato e exigir indenização.",
            "Art. 476 do Código Civil – Trata da exceção do contrato não cumprido, permitindo que uma parte não cumpra sua obrigação caso a outra também não o faça.",
            `Cancelamento de Aulas: O Aluno Contratante deverá notificar o cancelamento com antecedência mínima de ${verificarValor(dados.horasCancelamento)} horas. Caso contrário, a aula será considerada ministrada e cobrada integralmente.`,
            `Reagendamento: O reagendamento está sujeito à disponibilidade do Profissional Contratado e deve ser solicitado com ${verificarValor(dados.horasReagendamento)} horas de antecedência.`,
            "Reembolso: Em caso de pagamento antecipado, se houver cancelamento do contrato, será reembolsado apenas o valor das aulas ainda não ministradas, descontando eventuais taxas administrativas."
        ]);

        // Seção 6 - Responsabilidades das Partes
        addSection("Responsabilidades das Partes", [
            "Art. 599 do Código Civil – Estabelece as obrigações do prestador de serviços quanto à diligência e competência.",
            "Art. 607 do Código Civil – Trata da rescisão do contrato de prestação de serviços por qualquer uma das partes.",
            "Responsabilidades do Professor:",
            "- Ministrar as aulas conforme o cronograma acordado;",
            "- Fornecer materiais didáticos adicionais, se aplicável;",
            "- Informar previamente sobre eventuais cancelamentos.",
            "",
            "Responsabilidades do Aluno:",
            "- Comparecer pontualmente às aulas agendadas;",
            "- Informar previamente sobre cancelamentos ou impossibilidades;",
            "- Realizar os pagamentos conforme estipulado neste contrato."
        ]);

        // Seção 7 - Rescisão do Contrato
        addSection("Rescisão do Contrato", [
            "Art. 603 do Código Civil – Prevê que, caso uma das partes deseje rescindir o contrato, deve haver um aviso prévio razoável.",
            "Art. 608 do Código Civil – Prevê que a rescisão sem justa causa pode acarretar indenização à parte prejudicada.",
            `O presente contrato poderá ser rescindido pelas partes mediante aviso prévio de ${verificarValor(dados.avisoPrevio)} dias. Caso a rescisão ocorra sem aviso prévio, a parte que rescindir deverá pagar multa correspondente a ${verificarValor(dados.multaRescisao)}% do valor restante do contrato.`
        ]);

        // Seção 8 - Penalidades por Descumprimento
        addSection("Penalidades por Descumprimento", [
            "Art. 389 do Código Civil – Determina que o devedor responde por perdas e danos quando não cumpre a obrigação.",
            "Art. 395 do Código Civil – Trata da responsabilidade do devedor por mora.",
            "Art. 416 do Código Civil – Permite a estipulação de cláusula penal nos contratos.",
            `Em caso de descumprimento de qualquer cláusula deste contrato, a parte infratora estará sujeita ao pagamento de multa de R$ ${verificarValor(dados.multaPenalidade)}, além das demais penalidades previstas em lei.`
        ]);

        // Seção 9 - Foro
        addSection("Foro", [
            "Art. 112 do Código Civil – Estabelece que a interpretação dos contratos deve levar em conta a intenção das partes.",
            " Art. 53 do Código de Processo Civil – Permite a escolha do foro para resolução de conflitos.",
            `Fica eleito o foro da comarca de ${verificarValor(dados.foroResolucaoConflitos)}, Estado de ${verificarValor(dados.estado)}, para dirimir quaisquer dúvidas ou litígios oriundos deste contrato.`
        ]);

        // Espaço para assinatura do vendedor
        checkPageBreak(30);
        doc.text("__________________________________________", marginX, posY);
        posY += 10;
        doc.text("Assinatura do Aluno", marginX, posY);
        posY += 15;

        // Espaço para assinatura do comprador
        checkPageBreak(30);
        doc.text("__________________________________________", marginX, posY);
        posY += 10;
        doc.text("Assinatura do Professor/tutor", marginX, posY);
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
        geradorServicoEnsino({ ...formData });
    }, [formData]);

    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title"> CONTRATO PARA AULAS PARTICULARES </h1>
            </div>
            <div className="container">
                <div className="left-panel">
                    <div className="scrollable-card">
                        <div className="progress-bar">
                            <div
                                className="progress-bar-inner"
                                style={{ width: `${(step / 49) * 100}%` }}
                            ></div>
                        </div>
                        <div className="form-wizard">
                            {step === 1 && (
                                <>
                                    <h2>Aluno Contratante </h2>                                    <div>
                                        <label>Nome completo</label>
                                        <input
                                            type='text'
                                            placeholder='Nome do Aluno'
                                            name="nomeCompleto"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <h2>Aluno Contratante </h2>                                    <div>
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

                            {step === 3 && (
                                <>
                                    <h2>Aluno Contratante </h2>                                    <div>
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

                            {step === 4 && (
                                <>
                                    <h2>Aluno Contratante </h2>                                    <div>
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

                            {step === 5 && (
                                <>
                                    <h2>Aluno Contratante </h2>                                    <div>
                                        <label>Carteira de Identidade</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="rgAluno"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 6 && (
                                <>
                                    <h2>Aluno Contratante </h2>                                    <div>
                                        <label>CPF</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="cpfAluno"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 7 && (
                                <>
                                    <h2>Aluno Contratante </h2>                                    <div>
                                        <label>Endereço do Aluno</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="enderecoAluno"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 8 && (
                                <>
                                    <h2>Aluno Contratante </h2>                                    <div>
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

                            {step === 9 && (
                                <>
                                    <h2>Aluno Contratante </h2>                                    <div>
                                        <label>E-mail</label>
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

                            {step === 10 && (
                                <>
                                    <h2>Profissional Contratado (Professor/Tutor) </h2>                                    <div>
                                        <label>Nome completo</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="nomeCompletoContratado"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 11 && (
                                <>
                                    <h2>Profissional Contratado (Professor/Tutor) </h2>                                    <div>
                                        <label>Estado Civil</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="estadoCivilContratado"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 12 && (
                                <>
                                    <h2>Profissional Contratado (Professor/Tutor) </h2>                                    <div>
                                        <label>Nacionalidade</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="nacionalidadeContratado"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 13 && (
                                <>
                                    <h2>Profissional Contratado (Professor/Tutor) </h2>                                    <div>
                                        <label>Profissão</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="profissaoContratado"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 14 && (
                                <>
                                    <h2>Profissional Contratado (Professor/Tutor) </h2>                                    <div>
                                        <label>Carteira de Identidade</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="rgContratado"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 15 && (
                                <>
                                    <h2>Profissional Contratado (Professor/Tutor) </h2>                                    <div>
                                        <label>CPF</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="cpfContratado"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 16 && (
                                <>
                                    <h2>Profissional Contratado (Professor/Tutor) </h2>                                    <div>
                                        <label>Endereço do Aluno</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="enderecoContratado"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 17 && (
                                <>
                                    <h2>Profissional Contratado (Professor/Tutor) </h2>                                    <div>
                                        <label>Telefone</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="telefoneContratado"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 18 && (
                                <>
                                    <h2>Profissional Contratado (Professor/Tutor) </h2>                                    <div>
                                        <label>E-mail</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="emailContratado"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 19 && (
                                <>
                                    <h2>Objeto do Contrato </h2>                                    <div>
                                        <label>Disciplina/Matéria a ser ministrada</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="disciplinaMinistrada"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 20 && (
                                <>
                                    <h2>Objeto do Contrato </h2>                                    <div>
                                        <label>Duração de cada aula</label>
                                        <input
                                            type='text'
                                            placeholder='minutos'
                                            name="duracao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 21 && (
                                <>
                                    <h2>Objeto do Contrato </h2>                                    <div>
                                        <label>Frequência</label>
                                        <input
                                            type='text'
                                            placeholder='vezes por semana'
                                            name="frequencia"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 22 && (
                                <>
                                    <h2>Objeto do Contrato </h2>                                    <div>
                                        <label>Horários e dias acordados</label>
                                        <input
                                            type='text'
                                            placeholder='horarios'
                                            name="horarios"
                                            onChange={handleChange}
                                        />

                                        <input
                                            type='text'
                                            placeholder='dias'
                                            name="diasAcordados"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 23 && (
                                <>
                                    <div>
                                        <h2>Objeto do Contrato </h2>
                                        <label>Haverá taxa de matrícula?</label>
                                        <select name='taxaMatricula' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {taxaMatricula && (
                                <>
                                    {step === 24 && (
                                        <>
                                            <h2>Objeto do Contrato </h2>                                    <div>
                                                <label>Valor</label>
                                                <input
                                                    type='text'
                                                    placeholder='R$'
                                                    name="valorMatricula"
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
                                    <h2>Honorários e Forma de Pagamento </h2>                                    <div>
                                        <label>Frequência</label>
                                        <select name='pagamentoAula' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="poraula">Por Aula ministrada</option>
                                            <option value="mensal">Mensal</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {poraula && (
                                <>
                                    {step === 26 && (
                                        <>
                                            <h2>Honorários e Forma de Pagamento </h2>                                    <div>
                                                <label>Valor por aula</label>
                                                <input
                                                    type='text'
                                                    placeholder='R$'
                                                    name="valorAula"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {mensal && (
                                <>
                                    {step === 27 && (
                                        <>
                                            <h2>Honorários e Forma de Pagamento </h2>                                    <div>
                                                <label>Valor por Mês</label>
                                                <input
                                                    type='text'
                                                    placeholder='R$'
                                                    name="valorAulaMensal"
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
                                    <h2>Honorários e Forma de Pagamento </h2>                                    <div>
                                        <label>O pagamento será realizado via</label>
                                        <select name='modalidade' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="Pix">Pix</option>
                                            <option value="dinheiro">Dinheiro</option>
                                            <option value="CartaoDebito">Cartão de Débito</option>
                                            <option value="CartaoCredito">Cartão de Crédito</option>
                                            <option value="Boleto">Boleto</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 29 && (
                                <>
                                    <h2>Honorários e Forma de Pagamento </h2>                                    <div>
                                        <label>Data de Vencimento</label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="vencimento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 30 && (
                                <>
                                    <h2>Honorários e Forma de Pagamento </h2>                                    <div>
                                        <label>Em caso de atraso, incidirá uma multa de _____% sobre o valor devido</label>
                                        <input
                                            type='text'
                                            placeholder='ex.:1%,2%...'
                                            name="multaPorAtraso"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 31 && (
                                <>
                                    <h2>Honorários e Forma de Pagamento </h2>                                    <div>
                                        <label>além de juros de ____ ao dia</label>
                                        <input
                                            type='text'
                                            placeholder='ex.:1%,2%...'
                                            name="juros"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 32 && (
                                <>
                                    <h2>Política de Cancelamento e Reagendamento </h2>                                    <div>
                                        <label>O Aluno Contratante deverá notificar o cancelamento com antecedência mínima de ______ horas.</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="horasCancelamento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 33 && (
                                <>
                                    <h2>Política de Cancelamento e Reagendamento </h2>                                    <div>
                                        <label>O reagendamento está sujeito à disponibilidade do Profissional Contratado e deve ser solicitado com ______ horas de antecedência. </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="horasReagendamento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 34 && (
                                <>
                                    <h2>Rescisão do Contrato </h2>                                    <div>
                                        <label>O presente contrato poderá ser rescindido pelas partes mediante aviso prévio de ______ dias.</label>
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

                            {step === 35 && (
                                <>
                                    <h2>Rescisão do Contrato </h2>                                    <div>
                                        <label>Caso a rescisão ocorra sem aviso prévio, a parte que rescindir deverá pagar multa correspondente a ______% do valor restante do contrato. </label>
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

                            {step === 36 && (
                                <>
                                    <h2>Rescisão do Contrato </h2>                                    <div>
                                        <label>Em caso de descumprimento de qualquer cláusula deste contrato, a parte infratora estará sujeita ao pagamento de multa de R$ ________, além das demais penalidades previstas em lei.  </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="multaPenalidade"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 37 && (
                                <>
                                    <h2>Disposições Gerais</h2>
                                    <div>
                                        <label>Cidade do Foro eleito para resolução de conflitos</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="foroResolucaoConflitos"
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
                                        <label>No estado que tem por nome </label>
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

                            {step === 39 && (
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
                                    {step === 40 && (
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

                                    {step === 41 && (
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

                                    {step === 42 && (
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

                                    {step === 43 && (
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

                            {step === 44 && (
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

                            {step === 45 && (
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
                            {step === 46 && (
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

                            {step === 47 && (
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
                    <button className='btnBaixarPdf' onClick={() => { geradorServicoEnsinoPago(formData) }}>
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