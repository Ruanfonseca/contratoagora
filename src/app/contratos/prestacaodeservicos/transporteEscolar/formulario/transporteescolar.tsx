'use client'
import Pilha from '@/lib/pilha';
import { verificarValor } from '@/lib/utils';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';
import geradorTransportePdfPago from '../util/pdf';

const transporteEscolarschema = z.object({
    /**CONTRATANTE */
    contratante_nome: z.string(),
    contratante_sexo: z.enum(['F', 'M']),
    contratante_estado_civil: z.string(),
    contratante_nacionalidade: z.string(),
    contratante_profissao: z.string(),
    contratante_documento: z.string(),
    contratante_numero: z.string(),
    contratante_cpf_cnpj: z.string(),
    contratante_endereco: z.string(),
    contratante_telefone: z.string(),
    /** */

    /**CONTRATADO */
    contratado_nome: z.string(),
    contratado_sexo: z.enum(['F', 'M']),
    contratado_estado_civil: z.string(),
    contratado_nacionalidade: z.string(),
    contratado_documento: z.string(),
    contratado_numero: z.string(),
    contratado_cpf_cnpj: z.string(),
    contratado_endereco: z.string(),
    contratado_telefone: z.string(),
    /** */

    /**DESCRIÇÃO DOS SERVIÇOS */
    nomeDoAluno: z.string(),
    localBusca: z.string(),
    localEntrega: z.string(),
    horarioPartida: z.string(),
    horarioChegada: z.string(),
    diasSemana: z.string(),
    /** */

    /**PERIODO DE VALIDADE */
    inicioContrato: z.string(),
    fimContrato: z.string(),
    avisoPrevio: z.string(),
    /** */

    /**TARIFA E PAGAMENTOS */
    valorMensal: z.string(),
    dataVenc: z.string(),
    multa: z.string(),
    /** */

    /**RESPONSABILIDADE DO CONTRATANTE */
    horasAntecedencia: z.string(),
    /** */

    /**CONDIÇÕES DE RESCISÃO */
    avisoPrevioRescisao: z.string(),
    faltaPagamento: z.string(),
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

type FormData = z.infer<typeof transporteEscolarschema>;

export default function TransporteEscolar() {
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

    const [testemunhasNecessarias, setTestemunhasNecessarias] = useState(false);

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

        if (currentStepData.testemunhasNecessarias === 'S') {
            setTestemunhasNecessarias(true);
            nextStep = 36;
        } else if (currentStepData.testemunhasNecessarias === 'N') {
            nextStep = 40;
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



    const geradorTransportePdf = (dados: any) => {
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
        doc.text("CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE TRANSPORTE ESCOLAR", 105, posY, { align: "center" });
        posY += 15;

        // Seção 1: Identificação das Partes Envolvidas
        addSection("IDENTIFICAÇÃO DAS PARTES ENVOLVIDAS", [
            "1.1. CONTRATANTE:",
            `Nome: ${verificarValor(dados.contratante_nome)}`,
            `Sexo: ${verificarValor(dados.contratante_sexo)}`,
            `Estado civil: ${verificarValor(dados.contratante_estado_civil)}`,
            `Nacionalidade: ${verificarValor(dados.contratante_nacionalidade)}`,
            `Profissão: ${verificarValor(dados.contratante_profissao)}`,
            `Documento de identificação (Rg ou CNH): ${verificarValor(dados.contratante_documento)}`,
            `Número: ${verificarValor(dados.contratante_numero)}`,
            `CPF: ${verificarValor(dados.contratante_cpf_cnpj)}`,
            `Endereço completo: ${verificarValor(dados.contratante_endereco)}`,
            `Contato (telefone): ${verificarValor(dados.contratante_telefone)}`,
            "",
            "1.2. CONTRATADO:",
            `Nome: ${verificarValor(dados.contratado_nome)}`,
            `Sexo: ${verificarValor(dados.contratado_sexo)}`,
            `Estado civil: ${verificarValor(dados.contratado_estado_civil)}`,
            `Nacionalidade: ${verificarValor(dados.contratado_nacionalidade)}`,
            `CNH: ${verificarValor(dados.contratado_documento)}`,
            `CPF: ${verificarValor(dados.contratado_cpf_cnpj)}`,
            `Endereço completo: ${verificarValor(dados.contratado_endereco)}`,
            `Contato (telefone): ${verificarValor(dados.contratado_telefone)}`,
        ]);

        // Seção 2: Descrição dos Serviços
        addSection("DESCRIÇÃO DOS SERVIÇOS", [
            "2.1. O contratado se compromete a prestar serviço de transporte escolar ao aluno abaixo identificado:",
            `Nome do aluno: ${verificarValor(dados.nomeDoAluno)}`,
            `Local de busca: ${verificarValor(dados.localBusca)}`,
            `Local de entrega: ${verificarValor(dados.localEntrega)}`,
            `Horário de partida: ${verificarValor(dados.horarioPartida)}`,
            `Horário de chegada: ${verificarValor(dados.horarioChegada)}`,
            `Dias da semana em que o serviço será prestado: ${verificarValor(dados.diasSemana)}`,
        ]);

        // Seção 3: Período de Validade
        addSection("PERÍODO DE VALIDADE", [
            `3.1. O presente contrato terá início em ${verificarValor(dados.inicioContrato)} e término em ${verificarValor(dados.fimContrato)}, podendo ser prorrogado por acordo entre as partes.`,
            `3.2. Caso seja de duração indeterminada, qualquer das partes poderá rescindi-lo mediante aviso prévio de ${verificarValor(dados.avisoPrevio)} dias.`,
        ]);

        // Seção 4: Tarifas e Pagamentos
        addSection("TARIFAS E PAGAMENTOS", [
            `4.1. O valor mensal do serviço será de R$ ${verificarValor(dados.valorMensal)}, a ser pago até o dia ${verificarValor(dados.dataVenc)} de cada mês.`,
            `4.2. Em caso de atraso no pagamento, será aplicada uma multa de ${verificarValor(dados.multa)}% sobre o valor devido.`,
        ]);

        // Seção 5: Responsabilidades do Contratante
        addSection("RESPONSABILIDADES DO CONTRATANTE", [
            `6.1. O contratante se compromete a comunicar alterações no trajeto ou na programação com antecedência mínima de ${verificarValor(dados.horasAntecedencia)} horas.`,
        ]);

        // Seção 6: Condições de Rescisão
        addSection("CONDIÇÕES DE RESCISÃO", [
            `7.1. O contrato pode ser rescindido por qualquer das partes mediante aviso prévio de ${verificarValor(dados.avisoPrevioRescisao)} dias.`,
            `7.2. O contrato será rescindido imediatamente em caso de falta de pagamento superior a ${verificarValor(dados.faltaPagamento)} dias.`,
        ]);

        // Seção 7: Jurisdição e Lei Aplicável
        addSection("JURISDIÇÃO E LEI APLICÁVEL", [
            `9.1. O presente contrato é regido pelas leis brasileiras.`,
            `10.1. Fica eleito o foro da comarca de ${verificarValor(dados.comarca)} para dirimir quaisquer dúvidas ou conflitos decorrentes deste contrato.`,
        ]);

        // Seção 8: Assinaturas e Testemunhas
        addSection("ASSINATURAS E TESTEMUNHAS", [
            `Estado de Assinatura: ${verificarValor(dados.estado)}`,
            `Comarca: ${verificarValor(dados.comarca)}`,
            `Local: ${verificarValor(dados.local)}`,
            `Data de Assinatura: ${verificarValor(dados.dataAssinatura)}`,
            `Registro em Cartório: ${verificarValor(dados.registroCartorioTest)}`,
            "",
            "Contratante: ___________________________",
            "Contratado: ___________________________",
            "",
            // Adiciona as testemunhas e suas assinaturas, se necessário
            dados.testemunhasNecessarias === 'S' ? `1ª Testemunha: ${verificarValor(dados.nomeTest1)} - CPF: ${verificarValor(dados.cpfTest1)}` : "",
            dados.testemunhasNecessarias === 'S' ? "Assinatura da 1ª Testemunha: ___________________________" : "",
            "",
            dados.testemunhasNecessarias === 'S' ? `2ª Testemunha: ${verificarValor(dados.nomeTest2)} - CPF: ${verificarValor(dados.cpfTest2)}` : "",
            dados.testemunhasNecessarias === 'S' ? "Assinatura da 2ª Testemunha: ___________________________" : "",
        ]);

        const pdfDataUri = doc.output("datauristring");
        setPdfDataUrl(pdfDataUri);
    };




    useEffect(() => {
        geradorTransportePdf({ ...formData });
    }, [formData]);


    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title">Contrato de Prestação de Serviços de Personal Trainer</h1>
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
                                    <h2>Contratante </h2>                                    <div>
                                        <label>Nome completo</label>
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
                                    <h2>Contratante </h2>                                    <div>
                                        <label>Sexo</label>
                                        <select name='contratante_sexo' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="F">Feminino</option>
                                            <option value="M">Masculino</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 3 && (
                                <>
                                    <h2>Contratante </h2>                                    <div>
                                        <label>Estado Cívil</label>
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

                            {step === 4 && (
                                <>
                                    <h2>Contratante </h2>                                    <div>
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

                            {step === 5 && (
                                <>
                                    <h2>Contratante </h2>                                    <div>
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

                            {step === 6 && (
                                <>
                                    <h2>Contratante </h2>                                    <div>
                                        <label>Documento de identificação (Rg ou CNH)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="contratante_documento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 7 && (
                                <>
                                    <h2>Contratante </h2>                                    <div>
                                        <label>Número do Documento</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="contratante_numero"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 8 && (
                                <>
                                    <h2>Contratante </h2>                                    <div>
                                        <label>CPF</label>
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

                            {step === 9 && (
                                <>
                                    <h2>Contratante </h2>                                    <div>
                                        <label>Endereço completo</label>
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

                            {step === 10 && (
                                <>
                                    <h2>Contratante </h2>                                    <div>
                                        <label>Telefone</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="contratante_telefone"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 11 && (
                                <>
                                    <h2>Contratado </h2>                                    <div>
                                        <label>Nome do Contratado</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="contratado_nome"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 12 && (
                                <>
                                    <h2>Contratado </h2>                                    <div>
                                        <label>Sexo</label>
                                        <select name='contratante_sexo' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="F">Feminino</option>
                                            <option value="M">Masculino</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 13 && (
                                <>
                                    <h2>Contratado </h2>                                    <div>
                                        <label>Estado Cívil</label>
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

                            {step === 14 && (
                                <>
                                    <h2>Contratado </h2>                                    <div>
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

                            {step === 15 && (
                                <>
                                    <h2>Contratado </h2>                                    <div>
                                        <label>CNH</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="contratado_numero"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 16 && (
                                <>
                                    <h2>Contratado </h2>                                    <div>
                                        <label>CPF</label>
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

                            {step === 17 && (
                                <>
                                    <h2>Contratado </h2>                                    <div>
                                        <label>Endereço</label>
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

                            {step === 18 && (
                                <>
                                    <h2>Contratado </h2>                                    <div>
                                        <label>Telefone</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="contratado_telefone"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 19 && (
                                <>
                                    <h2>Descrição dos Servicos </h2>                                    <div>
                                        <label>Nome do aluno</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="nomeDoAluno"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 20 && (
                                <>
                                    <h2>Descrição dos Servicos </h2>                                    <div>
                                        <label>Local de busca</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="localBusca"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 21 && (
                                <>
                                    <h2>Descrição dos Servicos </h2>                                    <div>
                                        <label>Local de entrega</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="localEntrega"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 22 && (
                                <>
                                    <h2>Descrição dos Servicos </h2>                                    <div>
                                        <label>Horário de partida</label>
                                        <input
                                            type='time'
                                            placeholder=''
                                            name="horarioPartida"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 23 && (
                                <>
                                    <h2>Descrição dos Servicos </h2>                                    <div>
                                        <label>Horário de chegada</label>
                                        <input
                                            type='time'
                                            placeholder=''
                                            name="horarioChegada"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 23 && (
                                <>
                                    <h2>Descrição dos Servicos </h2>                                    <div>
                                        <label>Dias da semana em que o serviço será prestado</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="diasSemana"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 24 && (
                                <>
                                    <h2>Periodo de Validade </h2>                                    <div>
                                        <label> O presente contrato terá início em //____ </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="inicioContrato"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 25 && (
                                <>
                                    <h2>Periodo de Validade </h2>                                    <div>
                                        <label>e término em //____ </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="fimContrato"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 26 && (
                                <>
                                    <h2>Periodo de Validade </h2>                                    <div>
                                        <label>Qualquer das partes poderá rescindi-lo mediante aviso prévio de ___ dias</label>
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

                            {step === 27 && (
                                <>
                                    <h2>Tarifas e Pagamentos </h2>                                    <div>
                                        <label>O valor mensal do serviço será de R$ ________</label>
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


                            {step === 28 && (
                                <>
                                    <h2>Tarifas e Pagamentos </h2>                                    <div>
                                        <label>A ser pago até o dia ___ de cada mês</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="dataVenc"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 29 && (
                                <>
                                    <h2>Tarifas e Pagamentos </h2>                                    <div>
                                        <label>Em caso de atraso no pagamento, será aplicada uma multa de ___% sobre o valor devido</label>
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

                            {step === 30 && (
                                <>
                                    <h2>Responsabilidade do Contratante </h2>                                    <div>
                                        <label>Comunicar alterações no trajeto ou na programação com antecedência mínima de ___ horas</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="horasAntecedencia"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 31 && (
                                <>
                                    <h2>Condições de Rescisão </h2>                                    <div>
                                        <label> O contrato pode ser rescindido por qualquer das partes mediante aviso prévio de ___ dias</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="avisoPrevioRescisao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 32 && (
                                <>
                                    <h2>Condições de Rescisão </h2>                                    <div>
                                        <label>Falta de pagamento superior a ___ dias</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="faltaPagamento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 33 && (
                                <>
                                    <h2>Foro </h2>                                    <div>
                                        <label>Fica eleito o foro da comarca de ________________ para dirimir quaisquer dúvidas ou conflitos decorrentes deste contrato</label>
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

                            {step === 34 && (
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

                            {step === 35 && (
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
                                    {step === 36 && (
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

                                    {step === 37 && (
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


                                    {step === 38 && (
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

                                    {step === 39 && (
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

                            {step === 40 && (
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

                            {step === 41 && (
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

                            {step === 42 && (
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

                            {step === 43 && (
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
                    <button className='btnBaixarPdf' onClick={() => { geradorTransportePdfPago(formData) }}>
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