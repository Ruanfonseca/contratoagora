'use client'
import Pilha from '@/lib/pilha';
import { verificarValor } from '@/lib/utils';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';
import geradorEmpreitadaObraPago from '../util/pdf';

const empreitadaobraschema = z.object({
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
    descricao_obra: z.string(),
    data_inicio: z.string(),
    materialCompra: z.enum(['CONTRATANTE', 'CONTRATADO']),
    /** */

    /**RETRIBUIÇÃO */
    valor_total: z.string(),
    formaPagamento: z.enum(['Avista', 'Parcelado']),
    //se for parcelado
    num_parcelas: z.string(),
    dia_vencimento: z.string(),
    valor_parcela: z.string(),
    /** */

    /**DESCUMPRIMENTO E MULTA */
    valor_multa: z.string(),
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

type FormData = z.infer<typeof empreitadaobraschema>;


export default function EmpreitadaObra() {
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




        if (currentStepData.formaPagamento === 'Parcelado') {
            setParcelado(true);
            nextStep = 22;
        } else if (currentStepData.formaPagamento === 'Avista') {
            nextStep = 25;
        }


        if (currentStepData.testemunhasNecessarias === 'S') {
            setTestemunhas(true);
            nextStep = 28;
        } else if (currentStepData.testemunhasNecessarias === 'N') {
            nextStep = 32;
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

    const geradorEmpreitadaObra = (dados: any) => {
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
        doc.text("CONTRATO DE EMPREITADA PARA EXECUÇÃO DE OBRA", 105, posY, { align: "center" });
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
            "Art. 113 do Código Civil: Os negócios jurídicos devem ser interpretados conforme a boa-fé e os usos do lugar de sua celebração."
        ]);

        // Seção DO OBJETO
        addSection("1. DO OBJETO", [
            `A CONTRATANTE contrata os serviços profissionais da CONTRATADA, que se compromete a executar a seguinte obra: ${verificarValor(dados.descricao_obra)}.`,
            `Os materiais necessários para a execução da obra serão fornecidos por: ${verificarValor(dados.materialCompra)}.`,
            `A obra terá início em ${verificarValor(dados.data_inicio)}.`,
            "Art. 421 do Código Civil: A liberdade de contratar será exercida em razão e nos limites da função social do contrato."
        ]);

        // Seção DA ENTREGA DA OBRA
        addSection("2. DA ENTREGA DA OBRA", [
            "A CONTRATANTE realizará a validação da obra no momento da entrega para avaliar sua conformidade. Poderá recusar o recebimento caso:",
            "- A obra não esteja de acordo com as especificações;",
            "- A execução não tenha seguido as normas técnicas;",
            "- Apresente defeitos impeditivos de uso.",
            "Caso a CONTRATANTE aceite a obra com ressalvas, poderá ser acordado um abatimento no valor.",
            "Art. 441 do Código Civil: O adquirente pode rejeitar a coisa se apresentar vícios que a tornem imprópria para o uso."
        ]);

        // Seção DA RETRIBUIÇÃO
        addSection("3. DA RETRIBUIÇÃO", [
            `A CONTRATANTE pagará à CONTRATADA a quantia de R$ ${verificarValor(dados.valor_total)}, da seguinte forma:`,
            `- ${verificarValor(dados.formaPagamento) === 'Avista' ? 'Pagamento à vista' : `Pagamento parcelado em ${verificarValor(dados.num_parcelas)} parcelas de R$ ${verificarValor(dados.valor_parcela)}, vencendo todo dia ${verificarValor(dados.dia_vencimento)} do mês`}.`,
            "Art. 315 do Código Civil: As dívidas em dinheiro devem ser pagas no vencimento estabelecido."
        ]);

        // Seção DAS OBRIGAÇÕES
        addSection("4. DAS OBRIGAÇÕES", [
            "A CONTRATADA se compromete a:",
            "- Executar a obra conforme normas técnicas;",
            "- Garantir a segurança no ambiente de trabalho;",
            "- Utilizar materiais adequados, caso seja sua responsabilidade fornecê-los;",
            "- Responder por eventuais danos a terceiros.",
            "A CONTRATANTE se compromete a:",
            "- Fornecer os documentos e liberações necessárias;",
            "- Realizar os pagamentos conforme o estipulado.",
            "Art. 422 do Código Civil: Os contratantes são obrigados a guardar, assim na conclusão do contrato como em sua execução, os princípios da probidade e boa-fé."
        ]);

        // Seção DOS RISCOS DA OBRA
        addSection("5. DOS RISCOS DA OBRA", [
            "Os riscos da obra, salvo dolo ou culpa da CONTRATADA, correrão por conta da CONTRATANTE. As partes responderão solidariamente por danos causados a propriedades vizinhas.",
            "Art. 927 do Código Civil: Haverá obrigação de reparar o dano, independentemente de culpa, nos casos especificados em lei."
        ]);

        // Seção DA RESCISÃO
        addSection("6. DA RESCISÃO", [
            "Este contrato poderá ser rescindido nos seguintes casos:",
            "- Por inadimplência de qualquer das partes;",
            "- Por impossibilidade de continuidade da obra por força maior;",
            "- Pela falência ou insolvência de qualquer uma das partes;",
            "- Caso a CONTRATANTE não realize os pagamentos devidos.",
            "Art. 478 do Código Civil: Nos contratos de execução continuada, se a prestação de uma das partes se tornar excessivamente onerosa, pode-se pedir a resolução do contrato."
        ]);

        // Seção DO DESCUMPRIMENTO E MULTA
        addSection("7. DO DESCUMPRIMENTO E MULTA", [
            `O descumprimento de quaisquer cláusulas sujeitará a parte infratora ao pagamento de uma multa de R$ ${verificarValor(dados.valor_multa)}, além de eventuais perdas e danos.`,
            "Art. 389 do Código Civil: O devedor responde por perdas e danos, juros e atualização monetária em caso de inadimplemento."
        ]);

        // Seção 10: Disposições Gerais
        addSection("10. DISPOSIÇÕES GERAIS", [
            "Art. 5º, inciso XXXV da Constituição Federal: A lei não excluirá da apreciação do Poder Judiciário lesão ou ameaça a direito.",
            `Foro eleito para resolução de conflitos: ${verificarValor(dados.foroResolucaoConflitos)}`,
            `Testemunhas necessárias: ${verificarValor(dados.testemunhasNecessarias) === 'S' ? `Testemunha 1: ${verificarValor(dados.nomeTest1)}, CPF: ${verificarValor(dados.cpfTest1)}. Testemunha 2: ${verificarValor(dados.nomeTest2)}, CPF: ${verificarValor(dados.cpfTest2)}` : 'Não são necessárias testemunhas.'}`,
            `Local de assinatura: ${verificarValor(dados.local)}`,
            `Data de assinatura: ${verificarValor(dados.dataAssinatura)}`,
            `Registro em cartório: ${verificarValor(dados.registroCartorioTest) === 'S' ? 'Sim' : 'Não'}`
        ]);


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
        geradorEmpreitadaObra({ ...formData });
    }, [formData]);


    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title">CONTRATO DE EMPREITADA PARA EXECUÇÃO DE OBRA</h1>
            </div>
            <div className="container">
                <div className="left-panel">
                    <div className="scrollable-card">
                        <div className="progress-bar">
                            <div
                                className="progress-bar-inner"
                                style={{ width: `${(step / 34) * 100}%` }}
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
                                            name="contratado_rg"
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
                                            name="contratante_rg"
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
                                    <div>
                                        <h2>OBJETO </h2>
                                        <label> A CONTRATANTE contrata os serviços profissionais da CONTRATADA, que se compromete a executar a seguinte obra</label>
                                        <textarea
                                            id="descricao_obra"
                                            name="descricao_obra"
                                            onChange={handleChange}
                                            rows={10}
                                            cols={50}
                                            placeholder="descreva a obra"
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 18 && (
                                <>
                                    <div>
                                        <h2>OBJETO </h2>
                                        <label>Os materiais necessários para a execução da obra serão fornecidos por</label>
                                        <select name='materialCompra' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="CONTRATANTE">CONTRATANTE</option>
                                            <option value="CONTRATADO">CONTRATADO</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 19 && (
                                <>
                                    <h2>OBJETO </h2>                                    <div>
                                        <label>A obra terá início em</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="data_inicio"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 20 && (
                                <>
                                    <h2>RETRIBUIÇÃO </h2>                                    <div>
                                        <label>A CONTRATANTE pagará à CONTRATADA a quantia de</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="valor_total"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 21 && (
                                <>
                                    <div>
                                        <h2>RETRIBUIÇÃO </h2>
                                        <label>Os materiais necessários para a execução da obra serão fornecidos por</label>
                                        <select name='materialCompra' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="Avista">À vista</option>
                                            <option value="Parcelado">Parcelado</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {Parcelado && (
                                <>
                                    {step === 22 && (
                                        <>
                                            <h2>RETRIBUIÇÃO </h2>                                    <div>
                                                <label>Número de Parcelas</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="num_parcelas"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 23 && (
                                        <>
                                            <h2>RETRIBUIÇÃO </h2>                                    <div>
                                                <label>Data de vencimento das parcelas</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="dia_vencimento"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 24 && (
                                        <>
                                            <h2>RETRIBUIÇÃO </h2>                                    <div>
                                                <label>Valor das Parcelas</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="valor_parcela"
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
                                    <h2>DESCUMPRIMENTO E MULTA </h2>                                    <div>
                                        <label> O descumprimento de quaisquer cláusulas sujeitará a parte infratora ao pagamento de uma multa de</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="valor_multa"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}



                            {step === 26 && (
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

                            {step === 27 && (
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
                                    {step === 28 && (
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

                                    {step === 29 && (
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

                                    {step === 30 && (
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

                                    {step === 31 && (
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

                            {step === 32 && (
                                <>
                                    <h2>Disposições Gerais</h2>
                                    <div>
                                        <label>O contrato será registrado em cartório?</label>
                                        <div>
                                            <select name='registroCartorioTest' onChange={handleChange}>
                                                <option value="">Selecione</option>
                                                <option value="S">Sim</option>
                                                <option value="N">Não</option>
                                            </select>
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 33 && (
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
                            {step === 34 && (
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

                            {step === 35 && (
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
                    <button className='btnBaixarPdf' onClick={() => { geradorEmpreitadaObraPago(formData) }}>
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