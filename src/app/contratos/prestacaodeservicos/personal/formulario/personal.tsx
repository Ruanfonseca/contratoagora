'use client'
import Pilha from '@/lib/pilha';
import { verificarValor } from '@/lib/utils';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';
import geradorPersonalPdfPago from '../util/pdf';


const personalschema = z.object({
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
    condicao: z.enum(['S', 'N']),
    //se sim
    especifique: z.string(),
    /** */

    /**CONTRATADO */
    contratado_nome: z.string(),
    contratado_sexo: z.enum(['F', 'M']),
    contratado_estado_civil: z.string(),
    contratado_nacionalidade: z.string(),
    contratado_documento: z.string(),
    contratado_numero: z.string(),
    contratado_cpf_cnpj: z.string(),
    contratado_cref: z.string(),
    contratado_endereco: z.string(),
    contratado_telefone: z.string(),
    /** */

    /**OBJETO */
    servicoPrestado: z.string(),
    objetivo: z.enum(['emagrecimento', 'hipertofia', 'condicionamentofisico', 'outros']),
    //se for outros
    especifiqueOutros: z.string(),

    localAulas: z.string(),
    atividadeLocal: z.enum(['S', 'N']),
    deslocamentoLocal: z.enum(['S', 'N']),
    //se sim
    quaisLocais: z.string(),
    /** */

    /**RETRIBUIÇÃO */
    txMatricula: z.enum(['S', 'N']),
    //se sim 
    valorMatricula: z.string(),

    frequenciaPagamento: z.enum(['mensal', 'pacote', 'outro']),
    //se for outro
    outraFrequencia: z.string(),

    valorMensal: z.string(),
    diaVencimento: z.string(),
    multaAtraso: z.enum(['S', 'N']),
    //se sim
    porcetagemMulta: z.string(),

    modalidade: z.enum(['dinheiro', 'cartao', 'transfer', 'pix', 'outro']),
    //se sim
    outraModalidade: z.string(),
    /** */


    /**AULAS */
    duracaoAula: z.string(),
    frequenciaAula: z.string(),
    escalaPrevista: z.string(),
    avisoCancelamento: z.string(),
    haveraReposicao: z.enum(['S', 'N']),
    //se sim 
    quaisCondicoes: z.string(),
    /** */

    /**RESCISÃO */
    avisoRescisao: z.string(),
    reembolsoAntecipado: z.enum(['S', 'N']),
    //se sim
    quaisCondicoesReembolso: z.string(),
    /** */

    /**DESCUMPRIMENTO */
    multaDescumprimento: z.string(),
    quaisSituacoes: z.string(),
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


type FormData = z.infer<typeof personalschema>;


export default function Personal() {

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
    const [reembolsoAntecipado, setReembolsoAntecipado] = useState(false);
    const [quaisLocais, setQuaisLocais] = useState(false);
    const [outrosObjetivo, setOutrosObjetivo] = useState(false);
    const [condicao, setCondicao] = useState(false);
    const [txMatricula, setTxMatricula] = useState(false);
    const [modalidade, setModalidade] = useState(false);
    const [quaisCondicoes, setQuaisCondicoes] = useState(false);
    const [multaAtraso, setMultaAtraso] = useState(false);
    const [testemunhasNecessarias, setTestemunhasNecessarias] = useState(false);

    const [outraFrequencia, setOutraFrequencia] = useState(false);
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


        if (currentStepData.condicao === 'S') {
            setCondicao(true);
            nextStep = 12;
        } else if (currentStepData.condicao === 'N') {
            nextStep = 13;
        }


        if (currentStepData.objetivo === 'outros') {
            setOutrosObjetivo(true);
            nextStep = 25;
        } else if (currentStepData.objetivo === 'emagrecimento') {
            nextStep = 26;
        } else if (currentStepData.objetivo === 'hipertofia') {
            nextStep = 26;
        } else if (currentStepData.objetivo === 'condicionamentofisico') {
            nextStep = 26;
        }

        if (currentStepData.deslocamentoLocal === 'S') {
            setQuaisLocais(true);
            nextStep = 29;
        } else if (currentStepData.deslocamentoLocal === 'N') {
            nextStep = 30;
        }

        if (currentStepData.txMatricula === 'S') {
            setTxMatricula(true);
            nextStep = 31;
        } else if (currentStepData.txMatricula === 'N') {
            nextStep = 32;
        }

        if (currentStepData.frequenciaPagamento === 'outro') {
            setOutraFrequencia(true);
            nextStep = 33;
        } else if (currentStepData.frequenciaPagamento === 'pacote') {
            nextStep = 34;
        } else if (currentStepData.frequenciaPagamento === 'mensal') {
            nextStep = 34;
        }

        if (currentStepData.multaAtraso === 'S') {
            setMultaAtraso(true);
            nextStep = 37;
        } else if (currentStepData.multaAtraso === 'N') {
            nextStep = 38;
        }




        if (currentStepData.modalidade === 'outro') {
            setModalidade(true);
            nextStep = 39;
        } else if (currentStepData.modalidade === 'dinheiro') {
            nextStep = 40;
        } else if (currentStepData.modalidade === 'cartao') {
            nextStep = 40;
        } else if (currentStepData.modalidade === 'transfer') {
            nextStep = 40;
        } else if (currentStepData.modalidade === 'pix') {
            nextStep = 40;
        }



        if (currentStepData.haveraReposicao === 'S') {
            setQuaisCondicoes(true);
            nextStep = 45;
        } else if (currentStepData.haveraReposicao === 'N') {
            nextStep = 46;
        }


        if (currentStepData.reembolsoAntecipado === 'S') {
            setReembolsoAntecipado(true);
            nextStep = 48;
        } else if (currentStepData.reembolsoAntecipado === 'N') {
            nextStep = 49;
        }

        if (currentStepData.testemunhasNecessarias === 'S') {
            setTestemunhasNecessarias(true);
            nextStep = 54;
        } else if (currentStepData.testemunhasNecessarias === 'N') {
            nextStep = 58;
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


    const geradorPersonalPdf = (dados: any) => {
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
        doc.text("CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE PERSONAL TRAINER", 105, posY, { align: "center" });
        posY += 15;
        doc.setFontSize(10);
        doc.text("(Código Civil - Lei Federal nº 10.406)", 105, posY, { align: "center" });
        posY += 10;
        doc.text("Este contrato tem por objetivo regulamentar a prestação de serviços de personal trainer, estabelecendo os direitos e deveres das partes envolvidas, a fim de garantir transparência e segurança na relação contratual.", marginX, posY, { maxWidth: maxTextWidth });
        posY += 20;

        // Seção 1 - Identificação das Partes
        addSection("1. Identificação das Partes", [
            `Código Civil
            "Art. 104 – A validade do negócio jurídico requer: I - agente capaz; II - objeto lícito, possível, determinado ou determinável; III - forma prescrita ou não defesa em lei."
            "Art. 113 – Os negócios jurídicos devem ser interpretados conforme a boa-fé e os usos do lugar de sua celebração."\n`,

            "Contratante (Aluno)",
            `Nome completo: ${verificarValor(dados.contratante_nome)}`,
            `Sexo: ${verificarValor(dados.contratante_sexo)}`,
            `Estado civil: ${verificarValor(dados.contratante_estado_civil)}`,
            `Nacionalidade: ${verificarValor(dados.contratante_nacionalidade)}`,
            `Profissão: ${verificarValor(dados.contratante_profissao)}`,
            `Documento de identificação (RG ou CNH): ${verificarValor(dados.contratante_documento)}`,
            `Número do documento: ${verificarValor(dados.contratante_numero)}`,
            `CPF: ${verificarValor(dados.contratante_cpf_cnpj)}`,
            `Endereço completo: ${verificarValor(dados.contratante_endereco)}`,
            `Telefone: ${verificarValor(dados.contratante_telefone)}`,
            `Possui alguma condição médica que possa interferir no treinamento? (${verificarValor(dados.condicao) === 'S' ? 'Sim' : 'Não'})`,
            verificarValor(dados.condicao) === 'S' ? `Se sim, especifique: ${verificarValor(dados.especifique)}` : "",
            "",
            "Contratado (Personal Trainer)",
            `Nome completo: ${verificarValor(dados.contratado_nome)}`,
            `Sexo: ${verificarValor(dados.contratado_sexo)}`,
            `Estado civil: ${verificarValor(dados.contratado_estado_civil)}`,
            `Nacionalidade: ${verificarValor(dados.contratado_nacionalidade)}`,
            `Documento de identificação (RG ou CNH): ${verificarValor(dados.contratado_documento)}`,
            `Número do documento: ${verificarValor(dados.contratado_numero)}`,
            `CPF: ${verificarValor(dados.contratado_cpf_cnpj)}`,
            `Registro profissional (CREF): ${verificarValor(dados.contratado_cref)}`,
            `Endereço completo: ${verificarValor(dados.contratado_endereco)}`,
            `Telefone: ${verificarValor(dados.contratado_telefone)}`
        ]);

        // Seção 2 - Do Objeto
        addSection("2. Do Objeto", [
            `Código Civil
             Art. 421 – "A liberdade contratual será exercida nos limites da função social do contrato."
             Art. 422 – "Os contratantes são obrigados a guardar, assim na conclusão do contrato, como em sua execução, os princípios de probidade e boa-fé."\n`,
            `Serviço de personal trainer a ser prestado: ${verificarValor(dados.servicoPrestado)}`,
            `Objetivo do treinamento: ${verificarValor(dados.objetivo) === 'outros' ? `Outros: ${verificarValor(dados.especifiqueOutros)}` : verificarValor(dados.objetivo)}`,
            `Local das aulas: ${verificarValor(dados.localAulas)}`,
            `As atividades serão efetuadas sempre no mesmo local? (${verificarValor(dados.atividadeLocal) === 'S' ? 'Sim' : 'Não'})`,
            `Haverá deslocamento para diferentes locais? (${verificarValor(dados.deslocamentoLocal) === 'S' ? 'Sim' : 'Não'})`,
            verificarValor(dados.deslocamentoLocal) === 'S' ? `Se sim, quais locais?: ${verificarValor(dados.quaisLocais)}` : ""
        ]);

        // Seção 3 - Da Retribuição
        addSection("3. Da Retribuição", [
            `Código Civil
             Art. 318 – "É nula a convenção que estipular pagamento em ouro ou em moeda estrangeira, ressalvados os casos previstos em lei."
             Art. 320 – "O pagamento deve ser feito no tempo e lugar determinados pelo contrato."\n`,
            `Haverá taxa de matrícula? (${verificarValor(dados.txMatricula) === 'S' ? `Sim, valor: R$ ${verificarValor(dados.valorMatricula)}` : 'Não'})`,
            `Frequência do pagamento: ${verificarValor(dados.frequenciaPagamento) === 'outro' ? `Outro: ${verificarValor(dados.outraFrequencia)}` : verificarValor(dados.frequenciaPagamento)}`,
            `Valor mensal: R$ ${verificarValor(dados.valorMensal)}`,
            `Dia do vencimento: ${verificarValor(dados.diaVencimento)}`,
            `Multa por atraso: (${verificarValor(dados.multaAtraso) === 'S' ? `Sim, ${verificarValor(dados.porcetagemMulta)}%` : 'Não'})`,
            `Forma de pagamento: ${verificarValor(dados.modalidade) === 'outro' ? `Outro: ${verificarValor(dados.outraModalidade)}` : verificarValor(dados.modalidade)}`
        ]);

        // Seção 4 - Das Aulas
        addSection("4. Das Aulas", [
            `Código Civil
             Art. 593 – "A prestação de serviço, que não estiver sujeita às leis trabalhistas ou a legislação especial, reger-se-á pelas disposições deste Capítulo."
             Art. 599 – "O prestador do serviço é obrigado a agir com diligência e prudência." \n`,
            `Duração de cada aula: ${verificarValor(dados.duracaoAula)} minutos`,
            `Frequência das aulas: ${verificarValor(dados.frequenciaAula)} por semana`,
            `Escala prevista para atividades: ${verificarValor(dados.escalaPrevista)}`,
            `Aviso de cancelamento necessário com antecedência de: ${verificarValor(dados.avisoCancelamento)} horas`,
            `Haverá reposição de aulas canceladas? (${verificarValor(dados.haveraReposicao) === 'S' ? 'Sim' : 'Não'})`,
            verificarValor(dados.haveraReposicao) === 'S' ? `Se sim, em quais condições?: ${verificarValor(dados.quaisCondicoes)}` : ""
        ]);

        // Seção 5 - Responsabilidades das Partes
        addSection("5. Responsabilidades das Partes", [
            `Código Civil
            Art. 186 – "Aquele que, por ação ou omissão voluntária, negligência ou imprudência, violar direito e causar dano a outrem, ainda que exclusivamente moral, comete ato ilícito."
            Art. 927 – "Aquele que, por ato ilícito, causar dano a outrem, fica obrigado a repará-lo." \n`,
            "Do Personal Trainer:",
            "Elaborar e conduzir treinamentos adequados ao perfil e objetivo do contratante.",
            "Prezar pela segurança e bem-estar do contratante durante as sessões.",
            "Estar presente no local e horário previamente combinados.",
            "Fornecer informações e orientações sobre os exercícios de forma clara e objetiva.",
            "",
            "Do Contratante:",
            "Informar o personal trainer sobre quaisquer condições médicas que possam afetar a prática de exercícios.",
            "Seguir as orientações fornecidas pelo personal trainer.",
            "Comparecer pontualmente às aulas agendadas.",
            "Avisar com antecedência em caso de cancelamento de sessões."
        ]);

        // Seção 6 - Da Rescisão
        addSection("6. Da Rescisão", [
            `Código Civil
             Art. 472 – "O contrato bilateral extingue-se, desde que uma das partes não cumpra sua obrigação."
             Art. 473 – "A resilição unilateral, nos casos em que a lei expressa ou implicitamente a admite, opera mediante denúncia notificada à outra parte." \n`,
            `Aviso prévio para rescisão do contrato: ${verificarValor(dados.avisoRescisao)} dias`,
            `Haverá reembolso em caso de rescisão antecipada? (${verificarValor(dados.reembolsoAntecipado) === 'S' ? 'Sim' : 'Não'})`,
            verificarValor(dados.reembolsoAntecipado) === 'S' ? `Se sim, em quais condições?: ${verificarValor(dados.quaisCondicoesReembolso)}` : ""
        ]);

        // Seção 7 - Do Descumprimento
        addSection("7. Do Descumprimento", [
            `Código Civil
             Art. 389 – "Não cumprida a obrigação, responde o devedor por perdas e danos, mais juros e atualização monetária."
             Art. 396 – "Não cumprida a obrigação, considera-se em mora o devedor." \n`,
            `Multa por descumprimento do contrato: R$ ${verificarValor(dados.multaDescumprimento)}`,
            `Quais situações caracterizam descumprimento?: ${verificarValor(dados.quaisSituacoes)}`
        ]);

        // Seção 8 - Limitações de Responsabilidade
        addSection("8. Limitações de Responsabilidade", [
            `Código Civil
             Art. 393 – "O devedor não responde pelos prejuízos resultantes de caso fortuito ou força maior, se expressamente não se houver por eles responsabilizado."
             Art. 927, Parágrafo Único – "Haverá obrigação de reparar o dano, independentemente de culpa, nos casos especificados em lei." \n`,
            "O personal trainer não será responsável por eventuais lesões ou danos decorrentes de:",
            "Prática inadequada dos exercícios sem orientação.",
            "Omissão de informações relevantes sobre condições médicas.",
            "Uso inadequado de equipamentos.",
            "Acidentes ocorridos fora das sessões supervisionadas."
        ]);

        // Seção 9 - Do Foro
        addSection("9. Do Foro", [
            `Código Civil
             Art. 78 – "É competente o foro do domicílio do réu para ação em que seja demandado."
             Art. 112 – "Prorroga-se a competência determinada em razão do valor e do território, se o réu não alegar a incompetência em exceção." \n`,
            `Foro da Comarca de: ${verificarValor(dados.comarca)}`
        ]);

        // Seção 10 - Assinaturas
        addSection("10. Assinaturas", [
            `Constituição Federal
             Art. 5º, II – "Ninguém será obrigado a fazer ou deixar de fazer alguma coisa senão em virtude de lei."
             Art. 5º, XXXV – "A lei não excluirá da apreciação do Poder Judiciário lesão ou ameaça a direito." \n`,
            `Data de assinatura: ${verificarValor(dados.dataAssinatura)}`,
            "",
            "Contratante:",
            `Assinatura: ____________________________________`,
            `Nome completo: ${verificarValor(dados.contratante_nome)}`,
            "",
            "Contratado (Personal Trainer):",
            `Assinatura: ____________________________________`,
            `Nome completo: ${verificarValor(dados.contratado_nome)}`,
            "",
            "Testemunhas:",
            "1ª Testemunha:",
            `Nome: ${verificarValor(dados.nomeTest1)}`,
            `CPF: ${verificarValor(dados.cpfTest1)}`,
            "Assinatura: ____________________________________",
            "",
            "2ª Testemunha:",
            `Nome: ${verificarValor(dados.nomeTest2)}`,
            `CPF: ${verificarValor(dados.cpfTest2)}`,
            "Assinatura: ____________________________________"
        ]);

        const pdfDataUri = doc.output("datauristring");
        setPdfDataUrl(pdfDataUri);
    };

    useEffect(() => {
        geradorPersonalPdf({ ...formData });
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
                                style={{ width: `${(step / 60) * 100}%` }}
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
                                        <label>Documento de identificação (RG ou CNH)</label>
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
                                        <label>Número do documento</label>
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
                                        <label>Endereço</label>
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
                                    <h2>Contratante </h2>                                    <div>
                                        <label>Possui alguma condição médica que possa interferir no treinamento?</label>
                                        <select name='condicao' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {condicao && (
                                <>
                                    {step === 12 && (
                                        <>
                                            <h2>Contratante </h2>                                    <div>
                                                <label>Se sim, especifique</label>
                                                <textarea
                                                    id="especifique"
                                                    name="especifique"
                                                    onChange={handleChange}
                                                    rows={10}
                                                    cols={50}
                                                    placeholder=""
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}


                            {step === 13 && (
                                <>
                                    <h2>Contratado </h2>                                    <div>
                                        <label>Nome completo</label>
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

                            {step === 14 && (
                                <>
                                    <h2>Contratado </h2>                                    <div>
                                        <label>Sexo</label>
                                        <select name='contratado_sexo' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="F">Feminino</option>
                                            <option value="M">Masculino</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 15 && (
                                <>
                                    <h2>Contratado </h2>                                    <div>
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

                            {step === 16 && (
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



                            {step === 17 && (
                                <>
                                    <h2>Contratado </h2>                                    <div>
                                        <label>Documento de identificação (RG ou CNH)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="contratado_documento"
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
                                        <label>Número do documento</label>
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

                            {step === 19 && (
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

                            {step === 20 && (
                                <>
                                    <h2>Contratado </h2>                                    <div>
                                        <label>CREF</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="contratado_cref"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 21 && (
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


                            {step === 22 && (
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

                            {step === 23 && (
                                <>
                                    <h2>Objeto</h2>                                    <div>
                                        <label>Serviço de personal trainer a ser prestado</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="servicoPrestado"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 24 && (
                                <>
                                    <h2>Objeto </h2>                                    <div>
                                        <label>Objetivo do treinamento</label>
                                        <select name='objetivo' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="emagrecimento">Emagrecimento </option>
                                            <option value="hipertofia">Hipertrofia </option>
                                            <option value="condicionamentofisico">Condicionamento físico</option>
                                            <option value="outros">Outros</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {outrosObjetivo && (
                                <>
                                    {step === 25 && (
                                        <>
                                            <h2>Objeto</h2>                                    <div>
                                                <label>Serviço de personal trainer a ser prestado</label>
                                                <textarea
                                                    id="especifiqueOutros"
                                                    name="especifiqueOutros"
                                                    onChange={handleChange}
                                                    rows={10}
                                                    cols={50}
                                                    placeholder=""
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 26 && (
                                <>
                                    <h2>Objeto</h2>                                    <div>
                                        <label>Local das aulas</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="localAulas"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 27 && (
                                <>
                                    <h2>Objeto </h2>                                    <div>
                                        <label>As atividades serão efetuadas sempre no mesmo local?</label>
                                        <select name='atividadeLocal' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 28 && (
                                <>
                                    <h2>Objeto </h2>                                    <div>
                                        <label>Haverá deslocamento para diferentes locais?</label>
                                        <select name='deslocamentoLocal' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {quaisLocais && (
                                <>
                                    {step === 29 && (
                                        <>
                                            <h2>Objeto</h2>                                    <div>
                                                <label>Se sim, quais locais?</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="quaisLocais"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 30 && (
                                <>
                                    <h2>Retribuição </h2>                                    <div>
                                        <label> Haverá taxa de matrícula?</label>
                                        <select name='txMatricula' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {txMatricula && (
                                <>
                                    {step === 31 && (
                                        <>
                                            <h2>Retribuição</h2>                                    <div>
                                                <label>Valor da Matrícula</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
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

                            {step === 32 && (
                                <>
                                    <h2>Retribuição </h2>                                    <div>
                                        <label> Frequência do pagamento</label>
                                        <select name='frequenciaPagamento' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="mensal">Mensal </option>
                                            <option value="pacote">Pacote de Sessões</option>
                                            <option value="outro">Outro</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {outraFrequencia && (
                                <>
                                    {step === 33 && (
                                        <>
                                            <h2>Retribuição</h2>                                    <div>
                                                <label>Descreva a frenquência de pagamento</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="outraFrequencia"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 34 && (
                                <>
                                    <h2>Retribuição</h2>                                    <div>
                                        <label>Valor mensal</label>
                                        <input
                                            type='text'
                                            placeholder='R$'
                                            name="valorMensal"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 35 && (
                                <>
                                    <h2>Retribuição</h2>                                    <div>
                                        <label>Dia do vencimento</label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="diaVencimento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 36 && (
                                <>
                                    <h2>Retribuição </h2>                                    <div>
                                        <label>Multa por atraso</label>
                                        <select name='multaAtraso' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {multaAtraso && (
                                <>
                                    {step === 37 && (
                                        <>
                                            <h2>Retribuição</h2>                                    <div>
                                                <label>Quantos % serão aplicados por conta do atraso?</label>
                                                <input
                                                    type='text'
                                                    placeholder='ex.:1%,2%...'
                                                    name="porcetagemMulta"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}


                            {step === 38 && (
                                <>
                                    <h2>Retribuição </h2>                                    <div>
                                        <label>Multa por atraso</label>
                                        <select name='modalidade' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="dinheiro">Dinheiro </option>
                                            <option value="cartao">Cartão </option>
                                            <option value="transfer">Transferência bancária</option>
                                            <option value="pix">Pix </option>
                                            <option value="outro">Outros(as)</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {modalidade && (
                                <>
                                    {step === 39 && (
                                        <>
                                            <h2>Retribuição</h2>                                    <div>
                                                <label>Qual será a forma de pagamento?</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="outraModalidade"
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
                                    <h2>Aulas</h2>                                    <div>
                                        <label>Duração de cada aula: __________ minutos</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="duracaoAula"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 41 && (
                                <>
                                    <h2>Aulas</h2>                                    <div>
                                        <label> Frequência das aulas: __________ por semana </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="frequenciaAula"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 42 && (
                                <>
                                    <h2>Aulas</h2>                                    <div>
                                        <label> Escala prevista para atividades: ____________________________________  </label>
                                        <textarea
                                            id="escalaPrevista"
                                            name="escalaPrevista"
                                            onChange={handleChange}
                                            rows={10}
                                            cols={50}
                                            placeholder=""
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 43 && (
                                <>
                                    <h2>Aulas</h2>                                    <div>
                                        <label> Aviso de cancelamento necessário com antecedência de: __________ horas </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="avisoCancelamento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 44 && (
                                <>
                                    <h2>Retribuição </h2>                                    <div>
                                        <label>Haverá reposição de aulas canceladas?</label>
                                        <select name='haveraReposicao' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {quaisCondicoes && (
                                <>
                                    {step === 45 && (
                                        <>
                                            <h2>Aulas</h2>                                    <div>
                                                <label> Quais Condições </label>
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

                            {step === 46 && (
                                <>
                                    <h2>Rescisão</h2>                                    <div>
                                        <label>Aviso prévio para rescisão do contrato: __________ dias </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="avisoRescisao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 47 && (
                                <>
                                    <h2>Rescisão</h2>                                    <div>
                                        <label>Haverá reembolso em caso de rescisão antecipada? </label>
                                        <select name='reembolsoAntecipado' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {reembolsoAntecipado && (
                                <>
                                    {step === 48 && (
                                        <>
                                            <h2>Rescisão</h2>                                    <div>
                                                <label> Se sim, em quais condições? </label>
                                                <textarea
                                                    id="quaisCondicoesReembolso"
                                                    name="quaisCondicoesReembolso"
                                                    onChange={handleChange}
                                                    rows={10}
                                                    cols={50}
                                                    placeholder=""
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 49 && (
                                <>
                                    <h2>Descumprimento</h2>                                    <div>
                                        <label>Multa por descumprimento do contrato: R$ ____________ </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="multaDescumprimento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 50 && (
                                <>
                                    <h2>Descumprimento</h2>                                    <div>
                                        <label>Quais situações caracterizam descumprimento?</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="quaisSituacoes"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 51 && (
                                <>
                                    <h2>Jurisdição e Lei Aplicável </h2>                                    <div>
                                        <label>Fica eleito o foro da Comarca de _______.</label>
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

                            {step === 52 && (
                                <>
                                    <h2>Jurisdição e Lei Aplicável </h2>                                    <div>
                                        <label>Estado de _______, para dirimir quaisquer dúvidas ou conflitos decorrentes do presente contrato.</label>
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

                            {step === 53 && (
                                <>
                                    <div>
                                        <h2>Jurisdição e Lei Aplicável </h2>
                                        <label>Necessidade de testemunhas</label>
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
                                    {step === 54 && (
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

                                    {step === 55 && (
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


                                    {step === 56 && (
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

                                    {step === 57 && (
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


                            {step === 58 && (
                                <>
                                    <h2>Jurisdição e Lei Aplicável </h2>                                    <div>
                                        <label>Local de Assinatura</label>
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

                            {step === 59 && (
                                <>
                                    <h2>Jurisdição e Lei Aplicável </h2>                                    <div>
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

                            {step === 60 && (
                                <>
                                    <h2>Jurisdição e Lei Aplicável </h2>                                    <div>
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

                            {step === 61 && (
                                <>
                                    <div>
                                        <h2>Jurisdição e Lei Aplicável </h2>
                                        <label>Será registrado em cartório?</label>
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


                            {step === 62 && (
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
                    <button className='btnBaixarPdf' onClick={() => { geradorPersonalPdfPago(formData) }}>
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