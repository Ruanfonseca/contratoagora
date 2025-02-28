'use client'
import Pilha from '@/lib/pilha';
import { verificarValor } from '@/lib/utils';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';
import geradorNutricaoPago from '../util/pdf';


const mutricaoschema = z.object({
    /**CONTRATANTE */
    contratante_nome: z.string(),
    contratante_estado_civil: z.string(),
    contratante_nacionalidade: z.string(),
    contratante_profissao: z.string(),
    contratante_documento: z.string(),
    contratante_cpf_cnpj: z.string(),
    contratante_endereco: z.string(),
    contratante_telefone: z.string(),
    /** */

    /**CONTRATADO */
    contratado_nome: z.string(),
    contratado_estado_civil: z.string(),
    contratado_nacionalidade: z.string(),
    contratado_profissao: z.string(),
    contratado_documento: z.string(),
    contratado_cpf_cnpj: z.string(),
    contratado_endereco: z.string(),
    contratado_telefone: z.string(),
    contratado_rcrn: z.string(),
    /** */

    /**OBJETO */
    prazoPrestacao: z.enum(['determinado', 'indeterminado']),

    //se for determinado
    dataInicial: z.string(),
    dataFinal: z.string(),
    /** */

    /**HONORÁRIOS E FORMAS DE PAGAMENTO */
    taxaInicial: z.string(),
    finalidadeTaxa: z.string(),
    valorConsulta: z.string(),
    formaPagamento: z.enum(['dinheiro', 'cartao', 'transfer', 'pix']),
    vencimentoData: z.string(),
    multaAtraso: z.string(),
    /** */

    /**POLÍTICA DE CANCELAMENTO E REEMBOLSO */
    horasAntecedencia: z.string(),
    cancelamentoAvisoPrevio: z.string(),
    reembolso: z.string(),
    /** */

    /**DURAÇÃO E RESCISÃO DO CONTRATO */
    duracaoMesesAnosDias: z.string(),
    rescisaoAvisoPrevio: z.string(),
    multaDescumprimento: z.string(),
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

type FormData = z.infer<typeof mutricaoschema>;

export default function Nutricao() {
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
    const [Testemunhas, setTestemunhas] = useState(false);
    const [testemunhasNecessarias, setTestemunhasNecessarias] = useState(false);
    const [determinado, setDeterminado] = useState(false);
    const [indeterminado, setIndeterminado] = useState(false);
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

        if (currentStepData.prazoPrestacao === 'determinado') {
            setDeterminado(true);
            nextStep = 19;
        } else if (currentStepData.prazoPrestacao === 'indeterminado') {
            nextStep = 21;
        }

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


    const geradorNutricaoPdf = (dados: any) => {
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
        doc.text("CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE NUTRICIONISTA", 105, posY, { align: "center" });
        posY += 15;

        // Seção 1: Identificação das Partes
        addSection("1. IDENTIFICAÇÃO DAS PARTES", [
            `Código Civil - Art. 104
             A validade do negócio jurídico requer: I - agente capaz; II - objeto lícito, possível, determinado ou determinável; III - forma prescrita ou não defesa em lei.`,
            `Código Civil - Art. 107
             A validade da declaração de vontade não dependerá de forma especial, senão quando a lei expressamente a exigir.`,
            "CONTRATANTE:",
            `Nome completo: ${verificarValor(dados.contratante_nome)}`,
            `Estado civil: ${verificarValor(dados.contratante_estado_civil)}`,
            `Nacionalidade: ${verificarValor(dados.contratante_nacionalidade)}`,
            `Documento de identificação (RG/CPF): ${verificarValor(dados.contratante_documento)}`,
            `Órgão expedidor: ${verificarValor(dados.contratante_cpf_cnpj)}`,
            `Endereço completo: ${verificarValor(dados.contratante_endereco)}`,
            `Telefone: ${verificarValor(dados.contratante_telefone)}`,
            "",
            "CONTRATADO (NUTRICIONISTA):",
            `Nome completo: ${verificarValor(dados.contratado_nome)}`,
            `Estado civil: ${verificarValor(dados.contratado_estado_civil)}`,
            `Nacionalidade: ${verificarValor(dados.contratado_nacionalidade)}`,
            `Documento de identificação (RG/CPF): ${verificarValor(dados.contratado_documento)}`,
            `Órgão expedidor: ${verificarValor(dados.contratado_cpf_cnpj)}`,
            `Endereço completo: ${verificarValor(dados.contratado_endereco)}`,
            `Telefone: ${verificarValor(dados.contratado_telefone)}`,
            `Registro no Conselho Regional de Nutrição: ${verificarValor(dados.contratado_rcrn)}`,
        ]);

        // Seção 2: Do Objeto
        addSection("2. DO OBJETO", [
            `Código Civil - Art. 421
            A liberdade contratual será exercida nos limites da função social do contrato.
            Código Civil - Art. 425
            É lícito às partes estipular contratos atípicos, observadas as normas gerais fixadas neste Código.`,
            "O presente contrato tem como objeto a prestação de serviços de nutrição, incluindo, mas não se limitando a:",
            "- Consultas individuais;",
            "- Avaliação nutricional;",
            "- Elaboração de planos alimentares personalizados;",
            "- Acompanhamento e reavaliação periódica;",
            "- Orientação sobre hábitos alimentares saudáveis;",
            "- Atendimento presencial ou online, conforme acordado.",
            "",
            `Os serviços serão prestados por prazo ${verificarValor(dados.prazoPrestacao)} e terão início em ${verificarValor(dados.dataInicial)}.`,
        ]);

        // Seção 3: Dos Honorários e Formas de Pagamento
        addSection("3. DOS HONORÁRIOS E FORMAS DE PAGAMENTO", [
            `Código Civil - Art. 481
             Pelo contrato de compra e venda, um dos contratantes se obriga a transferir o domínio de certa coisa, e o outro, a pagar-lhe certo preço em dinheiro.
             Código Civil - Art. 317
             Quando, por motivos imprevisíveis, sobrevier desproporção manifesta entre o valor da prestação devida e o do momento de sua execução, poderá o juiz corrigi-lo, a pedido da parte, de modo que assegure, quanto possível, o valor real da prestação.`,
            `Taxa inicial (se houver): R$ ${verificarValor(dados.taxaInicial)} (finalidade da taxa: ${verificarValor(dados.finalidadeTaxa)}).`,
            `Valor por consulta/pacote de consultas: R$ ${verificarValor(dados.valorConsulta)}.`,
            `Forma de pagamento: ${verificarValor(dados.formaPagamento)}.`,
            `Vencimento do pagamento: Todo dia ${verificarValor(dados.vencimentoData)} do mês.`,
            `Multa por atraso: ${verificarValor(dados.multaAtraso)} % ao dia.`,
        ]);

        // Seção 4: Política de Cancelamento e Reembolso
        addSection("4. POLÍTICA DE CANCELAMENTO E REEMBOLSO", [
            `Código Civil - Art. 396
            O inadimplemento da obrigação, positiva e líquida, no seu termo, constitui de pleno direito em mora o devedor.
            Código Civil - Art. 395
            Responde o devedor pelos prejuízos a que sua mora der causa, mais juros, atualização dos valores monetários e honorários de advogado.`,
            `Cancelamentos devem ser comunicados com ${verificarValor(dados.horasAntecedencia)} horas de antecedência.`,
            `Em caso de cancelamento sem aviso prévio, poderá ser cobrado ${verificarValor(dados.cancelamentoAvisoPrevio)} % do valor da consulta.`,
            `Reembolso de valores pagos antecipadamente: ${verificarValor(dados.reembolso)}.`,
        ]);

        // Seção 5: Responsabilidades do Cliente
        addSection("5. RESPONSABILIDADES DO CLIENTE", [
            `Código Civil - Art. 113
             Os negócios jurídicos devem ser interpretados conforme a boa-fé e os usos do lugar de sua celebração.`,
            "O contratante se compromete a:",
            "- Fornecer informações precisas e completas sobre sua saúde;",
            "- Seguir as orientações do nutricionista;",
            "- Comparecer aos atendimentos agendados;",
            "- Informar sobre quaisquer mudanças em sua condição de saúde;",
            "- Respeitar os prazos e condições estabelecidos neste contrato.",
        ]);

        // Seção 6: Das Limitações de Responsabilidade
        addSection("6. DAS LIMITAÇÕES DE RESPONSABILIDADE", [
            `Código Civil - Art. 14 do Código de Defesa do Consumidor (CDC)
             O fornecedor de serviços responde, independentemente da existência de culpa, pela reparação dos danos causados aos consumidores por defeitos relativos à prestação dos serviços, bem como por informações insuficientes ou inadequadas sobre sua fruição e riscos.`,
            "O nutricionista não se responsabiliza por resultados específicos, visto que estes podem variar de acordo com a resposta individual do cliente. As recomendações fornecidas são baseadas em evidências científicas e boas práticas, não garantindo cura ou resultados exatos.",
        ]);

        // Seção 7: Duração e Rescisão do Contrato
        addSection("7. DURAÇÃO E RESCISÃO DO CONTRATO", [
            `Código Civil - Art. 473
             A resilição unilateral, nos casos em que a lei expressa ou implicitamente o permita, opera mediante denúncia notificada à outra parte.
             Código Civil - Art. 474
             A rescisão do contrato pode ser invocada por qualquer das partes, desde que cumpridos os prazos estabelecidos.`,
            `O contrato terá duração de ${verificarValor(dados.duracaoMesesAnosDias)}.`,
            `Poderá ser rescindido por qualquer das partes mediante aviso prévio de ${verificarValor(dados.rescisaoAvisoPrevio)} dias.`,
            `Em caso de descumprimento, será aplicada multa de R$ ${verificarValor(dados.multaDescumprimento)}.`,
        ]);

        // Seção 8: Jurisdição e Lei Aplicável
        addSection("8. JURISDIÇÃO E LEI APLICÁVEL", [
            `Constituição Federal - Art. 5º, inciso XXXV
             A lei não excluirá da apreciação do Poder Judiciário lesão ou ameaça a direito.
             Código Civil - Art. 112
             Nas declarações de vontade se atenderá mais à intenção nelas consubstanciada do que ao sentido literal da linguagem.`,
            `Fica eleito o foro da Comarca de ${verificarValor(dados.comarca)}, Estado de ${verificarValor(dados.estado)}, para dirimir quaisquer dúvidas ou conflitos decorrentes do presente contrato, sendo aplicável a legislação vigente no Brasil.`,
        ]);

        // Seção 9: Das Assinaturas
        addSection("9. DAS ASSINATURAS", [
            `Código Civil - Art. 129
            Os atos jurídicos válidos se provam por todos os meios admitidos em direito.
            Código Civil - Art. 215
            O instrumento particular, feito e assinado ou somente assinado por quem esteja na livre disposição e administração de seus bens, prova as obrigações convencionadas.`,
            "Por estarem de pleno acordo, as partes assinam o presente contrato na presença de duas testemunhas.",
            "",
            `Data: ${verificarValor(dados.dataAssinatura)}`,
            "",
            "Contratante: _________________________________",
            "",
            "Contratado (Nutricionista): _________________________________",
            "",
            `1ª Testemunha: Nome: ${verificarValor(dados.nomeTest1)} CPF: ${verificarValor(dados.cpfTest1)}`,
            "",
            `2ª Testemunha: Nome: ${verificarValor(dados.nomeTest2)} CPF: ${verificarValor(dados.cpfTest2)}`,
        ]);

        const pdfDataUri = doc.output("datauristring");
        setPdfDataUrl(pdfDataUri);
    };


    useEffect(() => {
        geradorNutricaoPdf({ ...formData });
    }, [formData]);


    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title">Contrato de Prestação de Serviços de Nutricionista</h1>
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
                                    <h2>Contratante </h2>                                    <div>
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

                            {step === 3 && (
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

                            {step === 4 && (
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

                            {step === 5 && (
                                <>
                                    <h2>Contratante </h2>                                    <div>
                                        <label>Carteira de Identidade(Rg) sendo pessoa física</label>
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

                            {step === 6 && (
                                <>
                                    <h2>Contratante </h2>                                    <div>
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
                                    <h2>Contratante </h2>                                    <div>
                                        <label> Endereço </label>
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


                            {step === 9 && (
                                <>
                                    <h2>Contratado </h2>                                    <div>
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

                            {step === 11 && (
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

                            {step === 12 && (
                                <>
                                    <h2>Contratado </h2>                                    <div>
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
                                    <h2>Contratado </h2>                                    <div>
                                        <label>Carteira de Identidade(Rg) sendo pessoa física</label>
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

                            {step === 14 && (
                                <>
                                    <h2>Contratado </h2>                                    <div>
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

                            {step === 16 && (
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

                            {step === 17 && (
                                <>
                                    <h2>Contratado </h2>                                    <div>
                                        <label>Registro no Conselho Regional de Nutrição</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="contratado_rcrn"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 18 && (
                                <>
                                    <div>
                                        <h2>Objeto </h2>
                                        <label>Duração do contrato: (Especificar se será por prazo determinado ou indeterminado)</label>
                                        <select name='prazoPrestacao' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="indeterminado">Indeterminado</option>
                                            <option value="determinado">Determinado</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {determinado && (
                                <>
                                    {step === 19 && (
                                        <>
                                            <h2>Objeto </h2>                                    <div>
                                                <label>Data de inicio da prestação</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="dataInicial"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 20 && (
                                        <>
                                            <h2>Objeto </h2>                                    <div>
                                                <label>Data de final da prestação</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="dataFinal"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 21 && (
                                <>
                                    <h2>Honorários e Formas de Pagamento </h2>                                    <div>
                                        <label>Taxa inicial (se houver): R$ _______</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="taxaInicial"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 22 && (
                                <>
                                    <h2>Honorários e Formas de Pagamento </h2>                                    <div>
                                        <label>finalidade da taxa: _______</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="finalidadeTaxa"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 23 && (
                                <>
                                    <h2>Honorários e Formas de Pagamento </h2>                                    <div>
                                        <label>Valor por consulta/pacote de consultas: R$ _______</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="valorConsulta"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 24 && (
                                <>
                                    <div>
                                        <h2>Honorários e Formas de Pagamento </h2>
                                        <label>Duração do contrato: (Especificar se será por prazo determinado ou indeterminado)</label>
                                        <select name='formaPagamento' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="dinheiro">Dinheiro</option>
                                            <option value="cartao">Cartão</option>
                                            <option value="transfer">Transferência Bancária</option>
                                            <option value="pix">Pix</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 25 && (
                                <>
                                    <h2>Honorários e Formas de Pagamento </h2>                                    <div>
                                        <label>Vencimento do pagamento: Todo dia _______ do mês</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="vencimentoData"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 26 && (
                                <>
                                    <h2>Honorários e Formas de Pagamento </h2>                                    <div>
                                        <label>Multa por atraso: _______ % ao dia</label>
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


                            {step === 27 && (
                                <>
                                    <h2>Política de Cancelamento e Reembolso </h2>                                    <div>
                                        <label>Cancelamentos devem ser comunicados com _______ horas de antecedência. </label>
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

                            {step === 28 && (
                                <>
                                    <h2>Política de Cancelamento e Reembolso </h2>                                    <div>
                                        <label>Em caso de cancelamento sem aviso prévio, poderá ser cobrado _______ % do valor da consulta.  </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="cancelamentoAvisoPrevio"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 29 && (
                                <>
                                    <h2>Política de Cancelamento e Reembolso </h2>                                    <div>
                                        <label>Reembolso de valores pagos antecipadamente: _______.</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="reembolso"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 30 && (
                                <>
                                    <h2>Duração e Rescisão do Contrato </h2>                                    <div>
                                        <label>O contrato terá duração de _______ meses/anos/dias. </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="duracaoMesesAnosDias"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 31 && (
                                <>
                                    <h2>Duração e Rescisão do Contrato </h2>                                    <div>
                                        <label>Poderá ser rescindido por qualquer das partes mediante aviso prévio de _______ dias. </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="rescisaoAvisoPrevio"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 32 && (
                                <>
                                    <h2>Duração e Rescisão do Contrato </h2>                                    <div>
                                        <label>Em caso de descumprimento, será aplicada multa de R$ _______.  </label>
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


                            {step === 33 && (
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

                            {step === 34 && (
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

                            {step === 35 && (
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

                            {step === 41 && (
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

                            {step === 41 && (
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

                            {step === 42 && (
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
                    <button className='btnBaixarPdf' onClick={() => { geradorNutricaoPago(formData) }}>
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