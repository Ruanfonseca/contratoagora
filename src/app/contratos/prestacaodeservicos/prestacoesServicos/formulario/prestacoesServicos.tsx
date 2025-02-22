'use client'
import Pilha from '@/lib/pilha';
import { verificarValor } from '@/lib/utils';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';
import geradorPrestacoesServicosPago from '../util/pdf';




const prestacoesservicosschema = z.object({
    /**CONTRATANTE */
    contratante_nome: z.string(),
    contratante_estado_civil: z.string(),
    contratante_nacionalidade: z.string(),
    contratante_profissao: z.string(),
    contratante_rg: z.string(),
    contratante_cpf_cnpj: z.string(),
    contratante_endereco: z.string(),
    contratante_email: z.string(),
    /** */

    /**CONTRATADO */
    contratado_nome: z.string(),
    contratado_estado_civil: z.string(),
    contratado_nacionalidade: z.string(),
    contratado_profissao: z.string(),
    contratado_rg: z.string(),
    contratado_cpf_cnpj: z.string(),
    contratado_endereco: z.string(),
    contratado_email: z.string(),
    /** */

    /**OBJETO */
    descricaoServico: z.string(),
    escopoServico: z.string(),
    criterioServico: z.string(),
    /** */

    /**PRAZO VIGÊNCIA */
    duracaoDoContrato: z.enum(['INDETERMINADO', 'DETERMINADO']),
    //se for determinado
    dataInicio: z.string(),
    condicoesRenovacao: z.string(),
    prazosRevisao: z.string(),
    /** */

    /**PRECO E CONDICOES DE PAGAMENTO */
    valorTotal: z.string(),
    formaPagamento: z.enum(['Avista', 'Parcelado']),

    //se for parcelado
    numeroDeParcela: z.string(),
    valorParcela: z.string(),
    dataVenc: z.string(),

    //senão
    modalidade: z.enum(['Pix', 'CartaoDebito', 'CartaoCredito', 'Boleto']),

    sinal: z.enum(['S', 'N']),
    //se sim
    valorSinal: z.string(),
    dataPag: z.string(),

    aplicaReajuste: z.enum(['S', 'N']),

    //se sim
    qualReajuste: z.enum(['INCC', 'IGPM', 'IPCA', 'TR']),
    // Índice Nacional de Custo da Construção
    // Índice Geral de Preços de Mercado
    // Índice Nacional de Preços ao Consumidor Amplo
    // Taxa Referencial (não é um índice de correção monetária, mas pode ser utilizada em conjunto)
    contaBancaria: z.string(),
    /** */



    /**OUTRAS CLAUSULAS */
    clausulaEspecifica: z.enum(['S', 'N']),
    extras: z.record(z.string(), z.any()),
    /** */

    /**RESCISÃO DO CONTRATO */
    condicoesRescisao: z.string(),
    multasPenalidades: z.string(),
    prazo: z.string(),
    metodoResolucao: z.enum(['Med', 'Arb', 'Liti']),
    /** */

    /**DISPOSIÇÕES GERAIS */
    foroResolucaoConflitos: z.string(), // Foro eleito para resolução de conflitos
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

type ClausulasExtras = {
    Titulo: string,
    Conteudo: string
}


type FormData = z.infer<typeof prestacoesservicosschema>;


export default function PrestacoesServicos() {

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
    const [Parcelado, setParcelado] = useState(false);
    const [DETERMINADO, setDETERMINADO] = useState(false);
    const [Avista, setAvista] = useState(false);
    const [sinal, setSinal] = useState(false);
    const [aplicaReajuste, setAplicaReajuste] = useState(false);
    const [clausulaEspecifica, setClausulaEspecifica] = useState("");
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
        setExtras((prev) => [...prev, { Titulo: "", Conteudo: "" }]);
    };

    // Remove uma cláusula pelo índice
    const removerClausula = (index: number) => {
        setExtras((prev) => prev.filter((_, i) => i !== index));
    };

    const geradorPrestacoesServicos = (dados: any) => {
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
        doc.text("CONTRATO DE PRESTAÇÃO DE SERVIÇO", 105, posY, { align: "center" });
        posY += 15;

        // Seção CONTRATANTE
        addSection("CONTRATANTE", [
            `Nome completo ou Razão Social: ${verificarValor(dados.contratante_nome)}`,
            `Estado Civil: ${verificarValor(dados.contratante_estado_civil)}`,
            `Nacionalidade: ${verificarValor(dados.contratante_nacionalidade)}`,
            `Profissão: ${verificarValor(dados.contratante_profissao)}`,
            `Carteira de Identidade: ${verificarValor(dados.contratante_rg)}`,
            `CPF/CNPJ: ${verificarValor(dados.contratante_cpf_cnpj)}`,
            `Residência: ${verificarValor(dados.contratante_endereco)}`,
            `Email: ${verificarValor(dados.contratante_email)}`,
            "Art. 104 do Código Civil: A validade do negócio jurídico requer agente capaz, objeto lícito e forma prescrita em lei."
        ]);

        // Seção CONTRATADO
        addSection("CONTRATADO", [
            `Nome completo ou Razão Social: ${verificarValor(dados.contratado_nome)}`,
            `Estado Civil: ${verificarValor(dados.contratado_estado_civil)}`,
            `Nacionalidade: ${verificarValor(dados.contratado_nacionalidade)}`,
            `Profissão: ${verificarValor(dados.contratado_profissao)}`,
            `Carteira de Identidade: ${verificarValor(dados.contratado_rg)}`,
            `CPF/CNPJ: ${verificarValor(dados.contratado_cpf_cnpj)}`,
            `Residência: ${verificarValor(dados.contratado_endereco)}`,
            `Email: ${verificarValor(dados.contratado_email)}`,
            "Art. 113 do Código Civil: Os negócios jurídicos devem ser interpretados conforme a boa-fé e os usos do lugar de sua celebração."
        ]);

        // Seção OBJETO
        addSection("OBJETO", [
            `Descrição do Serviço: ${verificarValor(dados.descricaoServico)}`,
            `Escopo do Serviço: ${verificarValor(dados.escopoServico)}`,
            `Critério de Avaliação do Serviço: ${verificarValor(dados.criterioServico)}`,
            "Art. 482 da CLT: Definição de justa causa e critérios de avaliação de desempenho."
        ]);

        // Seção PRAZO E VIGÊNCIA
        addSection("PRAZO E VIGÊNCIA", [
            `Duração do Contrato: ${verificarValor(dados.duracaoDoContrato)}`,
            `Data de Início: ${verificarValor(dados.dataInicio)}`,
            `Condições de Renovação: ${verificarValor(dados.condicoesRenovacao)}`,
            `Prazos de Revisão: ${verificarValor(dados.prazosRevisao)}`,
            "Art. 598 do Código Civil: O contrato de prestação de serviço não pode ser convencionado por mais de quatro anos."
        ]);

        // Seção PREÇO E CONDIÇÕES DE PAGAMENTO
        const pagamentoContent = [
            `Valor Total: ${verificarValor(dados.valorTotal)}`,
            `Forma de Pagamento: ${verificarValor(dados.formaPagamento)}`
        ];

        if (dados.formaPagamento === "Parcelado") {
            pagamentoContent.push(
                `Número de Parcelas: ${verificarValor(dados.numeroDeParcela)}`,
                `Valor da Parcela: ${verificarValor(dados.valorParcela)}`,
                `Data de Vencimento: ${verificarValor(dados.dataVenc)}`
            );
        } else {
            pagamentoContent.push(`Modalidade de Pagamento: ${verificarValor(dados.modalidade)}`);
        }

        if (dados.sinal === "S") {
            pagamentoContent.push(
                `Valor do Sinal: ${verificarValor(dados.valorSinal)}`,
                `Data de Pagamento do Sinal: ${verificarValor(dados.dataPag)}`
            );
        }

        if (dados.aplicaReajuste === "S") {
            pagamentoContent.push(
                `Reajuste Aplicado: ${verificarValor(dados.qualReajuste)}`
            );
        }

        pagamentoContent.push(`Conta Bancária: ${verificarValor(dados.contaBancaria)}`,
            "Art. 315 do Código Civil: As dívidas em dinheiro devem ser pagas em moeda corrente e pelo valor nominal.");

        addSection("PREÇO E CONDIÇÕES DE PAGAMENTO", pagamentoContent);

        // Seção OUTRAS CLAUSULAS
        const outrasClausulasContent = [
            `Cláusula Específica: ${verificarValor(dados.clausulaEspecifica)}`,
            "Art. 421 do Código Civil: A liberdade contratual será exercida nos limites da função social do contrato."
        ];

        if (dados.clausulaEspecifica === "S") {
            Object.entries(dados.extras).forEach(([key, value]) => {
                outrasClausulasContent.push(`${key}: ${verificarValor(value as string)}`);
            });
        }

        addSection("OUTRAS CLAUSULAS", outrasClausulasContent);

        // Seção RESCISÃO DO CONTRATO
        addSection("RESCISÃO DO CONTRATO", [
            `Condições de Rescisão: ${verificarValor(dados.condicoesRescisao)}`,
            `Multas e Penalidades: ${verificarValor(dados.multasPenalidades)}`,
            `Prazo: ${verificarValor(dados.prazo)}`,
            `Método de Resolução de Disputas: ${verificarValor(dados.metodoResolucao)}`,
            "Art. 478 do Código Civil: Nos contratos de execução continuada, se a prestação de uma das partes se tornar excessivamente onerosa, poderá ser resolvido ou revisto."
        ]);

        // Seção DISPOSIÇÕES GERAIS
        const disposicoesGeraisContent = [
            `Foro de Resolução de Conflitos: ${verificarValor(dados.foroResolucaoConflitos)}`,
            `Necessidade de Testemunhas: ${verificarValor(dados.testemunhasNecessarias)}`
        ];

        if (dados.testemunhasNecessarias === "S") {
            disposicoesGeraisContent.push(
                `Nome da Testemunha 1: ${verificarValor(dados.nomeTest1)}`,
                `CPF da Testemunha 1: ${verificarValor(dados.cpfTest1)}`,
                `Nome da Testemunha 2: ${verificarValor(dados.nomeTest2)}`,
                `CPF da Testemunha 2: ${verificarValor(dados.cpfTest2)}`
            );
        }

        disposicoesGeraisContent.push(
            `Local de Assinatura: ${verificarValor(dados.local)}`,
            `Data de Assinatura: ${verificarValor(dados.dataAssinatura)}`,
            `Registro em Cartório: ${verificarValor(dados.registroCartorioTest)}`,
            "Art. 129 da Lei de Registros Públicos: Alguns contratos podem exigir registro para maior segurança jurídica."
        );

        addSection("DISPOSIÇÕES GERAIS", disposicoesGeraisContent);


        // Espaço para assinatura do vendedor
        checkPageBreak(30);
        doc.text("__________________________________________", marginX, posY);
        posY += 10;
        doc.text("Assinatura do Contratante", marginX, posY);
        posY += 15;

        // Espaço para assinatura do comprador
        checkPageBreak(30);
        doc.text("__________________________________________", marginX, posY);
        posY += 10;
        doc.text("Assinatura do Contratado", marginX, posY);
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
        geradorPrestacoesServicos({ ...formData });
    }, [formData]);


    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title">CONTRATO DE PRESTAÇÃO DE SERVIÇOS </h1>
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
                                    <h2>CONTRATANTE </h2>                                    <div>
                                        <label>Nome completo ou Razão Social</label>
                                        <input
                                            type='text'
                                            placeholder='Nome do Contratante'
                                            name="contratante_nome"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <h2>CONTRATANTE </h2>                                    <div>
                                        <label>Estado Civil</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="contratante_estado_civil"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 3 && (
                                <>
                                    <h2>CONTRATANTE </h2>                                    <div>
                                        <label>Nacionalidade</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="contratante_nacionalidade"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 4 && (
                                <>
                                    <h2>CONTRATANTE </h2>                                    <div>
                                        <label>Profissão</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="contratante_profissao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 5 && (
                                <>
                                    <h2>CONTRATANTE </h2>                                    <div>
                                        <label>Carteira de Identidade</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="contratante_rg"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 6 && (
                                <>
                                    <h2>CONTRATANTE </h2>                                    <div>
                                        <label>CPF/CNPJ</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="contratante_cpf_cnpj"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 7 && (
                                <>
                                    <h2>CONTRATANTE </h2>                                    <div>
                                        <label>Residência</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="contratante_endereco"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 8 && (
                                <>
                                    <h2>CONTRATANTE </h2>                                    <div>
                                        <label>Email (se tiver)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="contratante_email"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 9 && (
                                <>
                                    <h2>CONTRATADO </h2>                                    <div>
                                        <label>Nome completo ou Razão Social</label>
                                        <input
                                            type='text'
                                            placeholder='Nome do Contratado'
                                            name="contratado_nome"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 10 && (
                                <>
                                    <h2>CONTRATADO </h2>                                    <div>
                                        <label>Estado Civil</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="contratado_estado_civil"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 11 && (
                                <>
                                    <h2>CONTRATADO </h2>                                    <div>
                                        <label>Nacionalidade</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="contratado_nacionalidade"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 12 && (
                                <>
                                    <h2>CONTRATADO </h2>                                    <div>
                                        <label>Profissão</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="contratado_profissao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 13 && (
                                <>
                                    <h2>CONTRATADO </h2>                                    <div>
                                        <label>Carteira de Identidade</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="contratado_rg"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 14 && (
                                <>
                                    <h2>CONTRATADO </h2>                                    <div>
                                        <label>CPF/CNPJ</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="contratado_cpf_cnpj"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 15 && (
                                <>
                                    <h2>CONTRATADO </h2>                                    <div>
                                        <label>Residência</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="contratado_endereco"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 16 && (
                                <>
                                    <h2>CONTRATANTE </h2>                                    <div>
                                        <label>Email (se tiver)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="contratado_email"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 17 && (
                                <>
                                    <h2>OBJETO </h2>                                    <div>
                                        <label>Descrição detalhada do serviço: (Especificar de maneira clara e objetiva o que será realizado pelo contratado).</label>
                                        <textarea
                                            id="descricaoServico"
                                            name="descricaoServico"
                                            onChange={handleChange}
                                            rows={10}
                                            cols={50}
                                            placeholder="descreva"
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 18 && (
                                <>
                                    <h2>OBJETO </h2>                                    <div>
                                        <label>Escopo dos serviços: Definição clara do que está incluso e o que não está incluso na prestação dos serviços</label>
                                        <textarea
                                            id="escopoServico"
                                            name="escopoServico"
                                            onChange={handleChange}
                                            rows={10}
                                            cols={50}
                                            placeholder="descreva"
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 19 && (
                                <>
                                    <h2>OBJETO </h2>                                    <div>
                                        <label>Critérios de qualidade e padrões exigidos: Garantia de que os serviços serão prestados conforme padrões preestabelecidos. </label>
                                        <textarea
                                            id="criterioServico"
                                            name="criterioServico"
                                            onChange={handleChange}
                                            rows={10}
                                            cols={50}
                                            placeholder="descreva"
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 20 && (
                                <>
                                    <div>
                                        <h2>PRAZO VIGÊNCIA </h2>
                                        <label>Duração do contrato: (Especificar se será por prazo determinado ou indeterminado)</label>
                                        <select name='duracaoDoContrato' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="INDETERMINADO">Indeterminado</option>
                                            <option value="DETERMINADO">Determinado</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {DETERMINADO && (
                                <>
                                    {step === 21 && (
                                        <>
                                            <div>
                                                <h2>PRAZO VIGÊNCIA </h2>
                                                <label>Data de Inicio</label>
                                                <input
                                                    type='date'
                                                    placeholder=''
                                                    name="dataInicio"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 22 && (
                                        <>
                                            <div>
                                                <h2>PRAZO VIGÊNCIA </h2>
                                                <label>Condições de renovação ou rescisão: (Se aplicável)</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="condicoesRenovacao"
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
                                                <h2>PRAZO VIGÊNCIA </h2>
                                                <label>Prazos para revisão e ajustes no contrato: Definição de periódicos para revisão do contrato e ajustes conforme necessidade das partes</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="prazosRevisao"
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
                                    <h2>PREÇOS E CONDIÇÕES DE PAGAMENTO</h2>
                                    <div>
                                        <label>Valor total do Serviço </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="valorTotal"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 25 && (
                                <>
                                    <h2>PREÇOS E CONDIÇÕES DE PAGAMENTO</h2>
                                    <div>
                                        <label>Pagamento à vista ou parcelado? </label>
                                        <select name='formaPagamento' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="Avista">A vista</option>
                                            <option value="Parcelado">Parcelado</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {Parcelado && (
                                <>
                                    {step === 26 && (
                                        <>
                                            <h2>PREÇOS E CONDIÇÕES DE PAGAMENTO</h2>
                                            <div>
                                                <label>Número de parcelas</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="numeroDeParcela"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 27 && (
                                        <>
                                            <h2>PREÇOS E CONDIÇÕES DE PAGAMENTO</h2>
                                            <div>
                                                <label>Valor das parcelas</label>
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

                                    {step === 28 && (
                                        <>
                                            <h2>PREÇOS E CONDIÇÕES DE PAGAMENTO</h2>
                                            <div>
                                                <label>Data de Vencimento</label>
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

                            {Avista && (
                                <>
                                    {step === 29 && (
                                        <>
                                            <h2>PREÇOS E CONDIÇÕES DE PAGAMENTO</h2>
                                            <div>
                                                <label>Forma de Pagamento</label>
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
                                </>
                            )}


                            {step === 30 && (
                                <>
                                    <h2>PREÇOS E CONDIÇÕES DE PAGAMENTO</h2>
                                    <div>
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
                                    {step === 31 && (
                                        <>
                                            <h2>PREÇOS E CONDIÇÕES DE PAGAMENTO</h2>
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

                                    {step === 32 && (
                                        <>
                                            <h2>PREÇOS E CONDIÇÕES DE PAGAMENTO</h2>
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

                            {step === 33 && (
                                <>
                                    <h2>PREÇOS E CONDIÇÕES DE PAGAMENTO</h2>
                                    <div>
                                        <label>Ocorrerá rejuste nas parcelas?</label>
                                        <select name='aplicaReajuste' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {aplicaReajuste && (
                                <>
                                    {step === 34 && (
                                        <>
                                            <h2>PREÇOS E CONDIÇÕES DE PAGAMENTO</h2>
                                            <div>
                                                <label>Qual índice será aplicado ?</label>
                                                <select name='qualReajuste' onChange={handleChange}>
                                                    <option value="">Selecione</option>
                                                    <option value="INCC">Índice Nacional de Custo da Construção</option>
                                                    <option value="IGPM">Índice Geral de Preços de Mercado</option>
                                                    <option value="IPCA">Índice Nacional de Preços ao Consumidor Amplo</option>
                                                    <option value="TR">Taxa Referencial (não é um índice de correção monetária, mas pode ser utilizada em conjunto)</option>
                                                </select>
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 35 && (
                                <>
                                    <h2>PREÇOS E CONDIÇÕES DE PAGAMENTO</h2>
                                    <div>
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

                            {step === 36 && (
                                <>
                                    <h2>OUTRAS CLÁUSULAS</h2>
                                    <div>
                                        <label>Deseja Adicionar Cláusula específica?</label>
                                        <i>
                                            Caso necessário, poderão ser incluídas cláusulas específicas relacionadas a:

                                            Lei Geral de Proteção de Dados (LGPD): Tratamento de dados pessoais conforme a legislação vigente.

                                            Sigilo e Confidencialidade: As partes se comprometem a manter sigilo sobre todas as informações trocadas.

                                            Garantia dos Serviços: Definição de prazos e condições para garantia do serviço prestado.

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
                                    {step === 37 && (
                                        <>
                                            <h2>OUTRAS CLÁUSULAS</h2>

                                            {extras.map((_, index) => (
                                                <div
                                                    key={index}
                                                    style={{
                                                        marginBottom: "15px",
                                                        borderBottom: "1px solid #ccc",
                                                        paddingBottom: "10px",
                                                    }}
                                                >
                                                    <label>Título da Cláusula</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Digite o título"
                                                        name={`extras[${index}].titulo`}
                                                        onChange={handleChange}
                                                    />

                                                    <label>Conteúdo</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Digite o conteúdo"
                                                        name={`extras[${index}].conteudo`}
                                                        onChange={handleChange}
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

                            {step === 38 && (
                                <>
                                    <h2>Rescisão do Contrato</h2>
                                    <div>
                                        <label>Condições para rescisão do contrato por qualquer das partes</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="condicoesRescisao"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 39 && (
                                <>
                                    <h2>Rescisão do Contrato</h2>
                                    <div>
                                        <label>Multas ou penalidades em caso de descumprimento de cláusulas contratuais</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="multasPenalidades"
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
                                    <h2>Rescisão do Contrato</h2>
                                    <div>
                                        <label>Prazo para notificação prévia em caso de rescisão</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="prazo"
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
                                    <h2>Rescisão do Contrato</h2>
                                    <div>
                                        <label>Qual será o método para resolver conflitos?</label>
                                        <i>
                                            Mediação:
                                            A mediação é um método consensual de resolução de conflitos, no qual um terceiro neutro (mediador) auxilia as partes a dialogarem e encontrarem uma solução mutuamente satisfatória.
                                            A mediação é um processo mais rápido e menos custoso do que o litígio judicial, e preserva o relacionamento entre as partes.

                                            Arbitragem:
                                            A arbitragem é um método alternativo de resolução de conflitos, no qual as partes elegem um ou mais árbitros para julgar a disputa.
                                            A decisão arbitral é vinculante e tem força de título executivo judicial, ou seja, pode ser executada judicialmente caso não seja cumprida espontaneamente.

                                            Litígio Judicial:
                                            O litígio judicial é a forma tradicional de resolução de conflitos, na qual a disputa é levada ao Poder Judiciário para ser julgada por um juiz.
                                            O litígio judicial pode ser um processo mais longo e custoso do que a mediação ou a arbitragem.
                                        </i>
                                        <div>
                                            <select name='metodoResolucao' onChange={handleChange}>
                                                <option value="">Selecione</option>
                                                <option value="Med">Mediação</option>
                                                <option value="Arb">Arbitragem</option>
                                                <option value="Liti">Litígio Judicial</option>
                                            </select>
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 42 && (
                                <>
                                    <h2>Disposições Gerais</h2>
                                    <div>
                                        <label>Foro eleito para resolução de conflitos</label>
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

                            {step === 43 && (
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
                                    {step === 44 && (
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

                                    {step === 45 && (
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

                                    {step === 46 && (
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

                                    {step === 47 && (
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

                            {step === 48 && (
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

                            {step === 49 && (
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
                            {step === 50 && (
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

                            {step === 51 && (
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
                    <button className='btnBaixarPdf' onClick={() => { geradorPrestacoesServicosPago(formData) }}>
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