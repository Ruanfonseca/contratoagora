'use client'
import Pilha from '@/lib/pilha';
import { verificarValor } from '@/lib/utils';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';
import geradorCorretagemImobiliariaPago from '../util/pdf';

const corretagemImobiliariaschema = z.object({
    /**CLIENTE */
    nome_cliente: z.string(),
    estado_civil_cliente: z.string(),
    nacionalidade_cliente: z.string(),
    profissao_cliente: z.string(),
    rg_cliente: z.string(),
    cpf_cliente: z.string(),
    endereco_cliente: z.string(),
    telefone_cliente: z.string(),
    email_cliente: z.string(),
    /** */

    /**CONTRATADO */
    nome_corretor: z.string(),
    estado_civil_corretor: z.string(),
    nacionalidade_corretor: z.string(),
    profissao_corretor: z.string(),
    rg_corretor: z.string(),
    cpf_corretor: z.string(),
    creci_corretor: z.string(),
    endereco_comercial_corretor: z.string(),
    telefone_corretor: z.string(),
    email_corretor: z.string(),
    razao_social: z.string(),
    cnpj: z.string(),
    /** */

    /**OBJETO */
    endereco_imovel: z.string(),
    tipo_imovel: z.string(),
    caracteristicas_imovel: z.string(),
    documentacao_imovel: z.string(),
    finalidade_corretagem: z.string(),
    condicoes_negociacao: z.string(),
    /** */

    /**PRAZO */
    inicio_servico: z.string(),
    prazo_conclusao: z.string(),
    prorrogacao: z.string(),
    rescisao_antecipada: z.string(),
    /** */

    /**VALOR DO IMÓVEL */
    valor_imovel: z.string(),
    valor_minimo: z.string(),
    condicoes_pagamento: z.string(),
    /** */

    /**COMISSÃO */
    porcentagem_comissao: z.string(),
    forma_pagamento_comissao: z.string(),
    momento_pagamento: z.string(),
    penalidades_comissao: z.string(),
    /** */

    /**OBRIGAÇÕES DAS PARTES */
    obrigacoes_contratante: z.string(),
    obrigacoes_contratado: z.string(),
    /** /

    /**FORO */
    comarca: z.string(),
    arbitragem: z.string(),
    /** */

    /*RECISÃO DO CONTRATO*/
    condicoesRescisao: z.string(),
    multasPenalidades: z.string(),
    prazo: z.string(),
    metodoResolucao: z.enum(['Med', 'Arb', 'Liti']),
    /**/

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


type FormData = z.infer<typeof corretagemImobiliariaschema>;


export default function CorretagemImobiliaria() {

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
    const [Testemunhas, setTestemunhas] = useState(false);
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
            setTestemunhas(true);
            nextStep = 48;
        } else if (currentStepData.testemunhasNecessarias === 'N') {
            nextStep = 52;
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

    const geradorCorretagemImobiliariaPDF = (dados: any) => {
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
        doc.text("CONTRATO DE CORRETAGEM IMOBILIÁRIA", 105, posY, { align: "center" });
        posY += 15;

        // Seção 1: Identificação das Partes
        addSection("IDENTIFICAÇÃO DAS PARTES", [
            "Pelo presente instrumento particular, as partes abaixo qualificadas firmam o presente contrato de corretagem imobiliária, nos termos da Lei Federal nº 10.406 e da Lei Federal nº 6.530."
        ]);

        // Seção 2: Do Contratante (Cliente)
        addSection("DO CONTRATANTE (CLIENTE)", [
            `Nome Completo: ${dados.nome_cliente}`,
            `Estado Civil: ${dados.estado_civil_cliente}`,
            `Nacionalidade: ${dados.nacionalidade_cliente}`,
            `Profissão: ${dados.profissao_cliente}`,
            `Carteira de Identidade (RG): ${dados.rg_cliente}`,
            `CPF: ${dados.cpf_cliente}`,
            `Endereço Residencial: ${dados.endereco_cliente}`,
            `Telefone: ${dados.telefone_cliente}`,
            `E-mail: ${dados.email_cliente}`
        ]);

        // Seção 3: Do Contratado (Corretor/Imobiliária)
        addSection("DO CONTRATADO (CORRETOR/IMOBILIÁRIA)", [
            `Nome Completo: ${dados.nome_corretor}`,
            `Estado Civil: ${dados.estado_civil_corretor}`,
            `Nacionalidade: ${dados.nacionalidade_corretor}`,
            `Profissão: ${dados.profissao_corretor}`,
            `Carteira de Identidade (RG): ${dados.rg_corretor}`,
            `CPF: ${dados.cpf_corretor}`,
            `Creci: ${dados.creci_corretor}`,
            `Endereço Comercial: ${dados.endereco_comercial_corretor}`,
            `Telefone: ${dados.telefone_corretor}`,
            `E-mail: ${dados.email_corretor}`,
            `Razão Social (se aplicável): ${dados.razao_social}`,
            `CNPJ (se aplicável): ${dados.cnpj}`
        ]);

        // Seção 4: Do Objeto (Serviço Prestado de Corretagem)
        addSection("DO OBJETO (SERVIÇO PRESTADO DE CORRETAGEM)", [
            "Nos termos do artigo 722 do Código Civil, o corretor se obriga a obter para o cliente um ou mais negócios imobiliários, com diligência e lealdade.",
            `Endereço do imóvel a ser negociado: ${dados.endereco_imovel}`,
            `Tipo do imóvel: ${dados.tipo_imovel}`,
            `Características do imóvel: ${dados.caracteristicas_imovel}`,
            `Documentação do imóvel: ${dados.documentacao_imovel}`,
            `Finalidade da corretagem: ${dados.finalidade_corretagem}`,
            `Condições especiais para negociação: ${dados.condicoes_negociacao}`
        ]);

        // Seção 5: Do Prazo
        addSection("DO PRAZO", [
            "Nos termos do artigo 725 do Código Civil, o contrato de corretagem pode ser ajustado com ou sem exclusividade e ter prazo determinado ou indeterminado.",
            `Início do serviço: ${dados.inicio_servico}`,
            `Prazo para conclusão do serviço: ${dados.prazo_conclusao}`,
            `Possibilidade de prorrogação: ${dados.prorrogacao}`,
            `Condições para rescisão antecipada: ${dados.rescisao_antecipada}`
        ]);

        // Seção 6: Do Valor do Imóvel
        addSection("DO VALOR DO IMÓVEL", [
            `Valor estimado do imóvel: ${dados.valor_imovel}`,
            `Valor mínimo aceitável: ${dados.valor_minimo}`,
            `Condições de pagamento: ${dados.condicoes_pagamento}`
        ]);

        // Seção 7: Da Comissão
        addSection("DA COMISSÃO", [
            "Nos termos do artigo 724 do Código Civil, a remuneração do corretor é devida sempre que o negócio se aperfeiçoar, ainda que as partes se arrependam.",
            `Porcentagem sobre o valor da venda: ${dados.porcentagem_comissao}`,
            `Forma de pagamento da comissão: ${dados.forma_pagamento_comissao}`,
            `Momento do pagamento: ${dados.momento_pagamento}`,
            `Penalidades por inadimplência no pagamento da comissão: ${dados.penalidades_comissao}`
        ]);

        // Seção 8: Das Obrigações das Partes
        addSection("DAS OBRIGAÇÕES DAS PARTES", [
            "Do Contratante:",
            `${dados.obrigacoes_contratante}`,
            "Nos termos da Lei Federal nº 10.406/2002 (Código Civil), o contratante se compromete a fornecer informações verdadeiras e colaborar com o corretor no processo de intermediação, conforme estipulado nos artigos 722 a 729.",
            "Do Contratado:",
            `${dados.obrigacoes_contratado}`,
            "O corretor imobiliário tem suas atividades regulamentadas pela Lei Federal nº 6.530/1978 e pelo Código Civil nos artigos 722 a 729, devendo prestar serviços com lealdade, diligência e transparência, buscando sempre a melhor negociação para as partes envolvidas."
        ]);

        // Seção 9: Da Rescisão do Contrato
        addSection("DA RESCISÃO DO CONTRATO", [
            "Nos termos do artigo 727 do Código Civil, se o negócio for desfeito por arrependimento de uma das partes, a remuneração do corretor pode ser exigida.",
            `Condições para rescisão: ${dados.condicoesRescisao}`,
            `Multas e penalidades: ${dados.multasPenalidades}`,
            `Prazo para rescisão: ${dados.prazo}`,
            `Método de resolução de conflitos: ${dados.metodoResolucao === 'Med' ? 'Mediação' : dados.metodoResolucao === 'Arb' ? 'Arbitragem' : 'Litígio'}`
        ]);

        // Seção 10: Do Foro
        addSection("DO FORO", [
            `Comarca onde o contrato será assinado: ${dados.comarca}`,
            `Definição de arbitragem (se aplicável): ${dados.arbitragem}`
        ]);

        // Seção 10: Disposições Gerais
        addSection("DISPOSIÇÃO GERAL", [
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
        doc.text("Assinatura do CONTRATANTE ", marginX, posY);
        posY += 15;

        // Espaço para assinatura do comprador
        checkPageBreak(30);
        doc.text("__________________________________________", marginX, posY);
        posY += 10;
        doc.text("Assinatura do CONTRATADO", marginX, posY);
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
        geradorCorretagemImobiliariaPDF({ ...formData });
    }, [formData])

    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title">Contrato de Corretagem Imobiliária</h1>
            </div>
            <div className="container">
                <div className="left-panel">
                    <div className="scrollable-card">
                        <div className="progress-bar">
                            <div
                                className="progress-bar-inner"
                                style={{ width: `${(step / 54) * 100}%` }}
                            ></div>
                        </div>
                        <div className="form-wizard">
                            {step === 1 && (
                                <>
                                    <h2>DO CONTRATANTE (CLIENTE) </h2>                                    <div>
                                        <label>Nome Completo</label>
                                        <input
                                            type='text'
                                            placeholder='Nome do Contratante'
                                            name="nome_cliente"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <h2>DO CONTRATANTE (CLIENTE) </h2>                                    <div>
                                        <label>Estado Civil</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="estado_civil_cliente"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 3 && (
                                <>
                                    <h2>DO CONTRATANTE (CLIENTE) </h2>                                    <div>
                                        <label>Nacionalidade</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="nacionalidade_cliente"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 4 && (
                                <>
                                    <h2>DO CONTRATANTE (CLIENTE) </h2>                                    <div>
                                        <label>Profissão</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="profissao_cliente"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 5 && (
                                <>
                                    <h2>DO CONTRATANTE (CLIENTE) </h2>                                    <div>
                                        <label>Carteira de Identidade (RG)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="rg_cliente"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 6 && (
                                <>
                                    <h2>DO CONTRATANTE (CLIENTE) </h2>                                    <div>
                                        <label>CPF</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="cpf_cliente"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 7 && (
                                <>
                                    <h2>DO CONTRATANTE (CLIENTE) </h2>                                    <div>
                                        <label>Endereço Residencial</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="endereco_cliente"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 8 && (
                                <>
                                    <h2>DO CONTRATANTE (CLIENTE) </h2>                                    <div>
                                        <label>Telefone</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="telefone_cliente"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 9 && (
                                <>
                                    <h2>DO CONTRATANTE (CLIENTE) </h2>                                    <div>
                                        <label>E-mail</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="email_cliente"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 10 && (
                                <>
                                    <h2>DO CONTRATADO (CORRETOR/IMOBILIÁRIA)</h2>                                    <div>
                                        <label>Nome Completo</label>
                                        <input
                                            type='text'
                                            placeholder='Nome do Contratado'
                                            name="nome_corretor"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 11 && (
                                <>
                                    <h2>DO CONTRATADO (CORRETOR/IMOBILIÁRIA)</h2>                                    <div>
                                        <label>Estado Civil</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="estado_civil_corretor"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 12 && (
                                <>
                                    <h2>DO CONTRATADO (CORRETOR/IMOBILIÁRIA)</h2>                                    <div>
                                        <label>Nacionalidade</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="nacionalidade_corretor"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 13 && (
                                <>
                                    <h2>DO CONTRATADO (CORRETOR/IMOBILIÁRIA)</h2>                                    <div>
                                        <label>Profissão</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="profissao_corretor"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 14 && (
                                <>
                                    <h2>DO CONTRATADO (CORRETOR/IMOBILIÁRIA)</h2>                                    <div>
                                        <label>Carteira de Identidade (RG)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="rg_corretor"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 15 && (
                                <>
                                    <h2>DO CONTRATADO (CORRETOR/IMOBILIÁRIA)</h2>                                    <div>
                                        <label>CPF</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="cpf_corretor"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 16 && (
                                <>
                                    <h2>DO CONTRATADO (CORRETOR/IMOBILIÁRIA)</h2>                                    <div>
                                        <label>Creci</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="creci_corretor"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 17 && (
                                <>
                                    <h2>DO CONTRATADO (CORRETOR/IMOBILIÁRIA)</h2>                                    <div>
                                        <label>Endereço Comercial</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="endereco_comercial_corretor"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 18 && (
                                <>
                                    <h2>DO CONTRATADO (CORRETOR/IMOBILIÁRIA)</h2>                                    <div>
                                        <label>Telefone</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="telefone_corretor"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 19 && (
                                <>
                                    <h2>DO CONTRATADO (CORRETOR/IMOBILIÁRIA)</h2>                                    <div>
                                        <label>E-mail</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="email_corretor"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 20 && (
                                <>
                                    <h2>DO CONTRATADO (CORRETOR/IMOBILIÁRIA)</h2>                                    <div>
                                        <label>Razão Social</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="razao_social"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 21 && (
                                <>
                                    <h2>DO CONTRATADO (CORRETOR/IMOBILIÁRIA)</h2>                                    <div>
                                        <label>CNPJ (se aplicável)</label>
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

                            {step === 22 && (
                                <>
                                    <h2>DO OBJETO (SERVIÇO PRESTADO DE CORRETAGEM)</h2>                                    <div>
                                        <label>Endereço do imóvel a ser negociado</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="endereco_imovel"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 23 && (
                                <>
                                    <h2>DO OBJETO (SERVIÇO PRESTADO DE CORRETAGEM)</h2>                                    <div>
                                        <label>Tipo do imóvel</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="tipo_imovel"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 24 && (
                                <>
                                    <h2>DO OBJETO (SERVIÇO PRESTADO DE CORRETAGEM)</h2>                                    <div>
                                        <label>Características do imóvel</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="caracteristicas_imovel"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 25 && (
                                <>
                                    <h2>DO OBJETO (SERVIÇO PRESTADO DE CORRETAGEM)</h2>                                    <div>
                                        <label>Documentação do imóvel</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="documentacao_imovel"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 26 && (
                                <>
                                    <h2>DO OBJETO (SERVIÇO PRESTADO DE CORRETAGEM)</h2>                                    <div>
                                        <label>Finalidade da corretagem</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="finalidade_corretagem"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 27 && (
                                <>
                                    <h2>DO OBJETO (SERVIÇO PRESTADO DE CORRETAGEM)</h2>                                    <div>
                                        <label>Condições especiais para negociação</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="condicoes_negociacao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 28 && (
                                <>
                                    <h2>DO PRAZO </h2>                                    <div>
                                        <label>Início do serviço</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="inicio_servico"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 29 && (
                                <>
                                    <h2>DO PRAZO </h2>                                    <div>
                                        <label>Prazo para conclusão do serviço</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="prazo_conclusao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 30 && (
                                <>
                                    <h2>DO PRAZO </h2>                                    <div>
                                        <label>Possibilidade de prorrogação</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="prorrogacao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 31 && (
                                <>
                                    <h2>DO PRAZO </h2>                                    <div>
                                        <label>Condições para rescisão antecipada</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="rescisao_antecipada"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 32 && (
                                <>
                                    <h2>DO VALOR DO IMÓVEL </h2>                                    <div>
                                        <label>Valor estimado do imóvel</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="valor_imovel"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 33 && (
                                <>
                                    <h2>DO VALOR DO IMÓVEL </h2>                                    <div>
                                        <label>Valor mínimo aceitável</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="valor_minimo"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 34 && (
                                <>
                                    <h2>DO VALOR DO IMÓVEL </h2>                                    <div>
                                        <label>Condições de pagamento</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="condicoes_pagamento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 35 && (
                                <>
                                    <h2>DO VALOR DO IMÓVEL </h2>                                    <div>
                                        <label>Possibilidade de negociação</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="negociacao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 36 && (
                                <>
                                    <h2>COMISSÃO </h2>                                    <div>
                                        <label>Porcentagem sobre o valor da venda</label>
                                        <input
                                            type='text'
                                            placeholder='ex.:2%'
                                            name="porcentagem_comissao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 37 && (
                                <>
                                    <h2>COMISSÃO </h2>                                    <div>
                                        <label>Forma de pagamento da comissão</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="forma_pagamento_comissao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 38 && (
                                <>
                                    <h2>COMISSÃO </h2>                                    <div>
                                        <label>Momento do pagamento</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="momento_pagamento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 39 && (
                                <>
                                    <h2>COMISSÃO </h2>                                    <div>
                                        <label>Penalidades por inadimplência no pagamento da comissão</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="penalidades_comissao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 40 && (
                                <>
                                    <h2>OBRIGAÇÕES DAS PARTES </h2>                                    <div>
                                        <label>Obrigações do Contrante</label>
                                        <textarea
                                            id="obrigacoes_contratante"
                                            name="obrigacoes_contratante"
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

                            {step === 41 && (
                                <>
                                    <h2>OBRIGAÇÕES DAS PARTES </h2>                                    <div>
                                        <label>Obrigações do Contratado</label>
                                        <textarea
                                            id="obrigacoes_contratado"
                                            name="obrigacoes_contratado"
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


                            {step === 42 && (
                                <>
                                    <h2>RECISÃO DO CONTRATO</h2>
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

                            {step === 43 && (
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

                            {step === 44 && (
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

                            {step === 45 && (
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
                            {step === 46 && (
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

                            {step === 47 && (
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
                                    {step === 48 && (
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

                                    {step === 49 && (
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

                                    {step === 50 && (
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

                                    {step === 51 && (
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

                            {step === 52 && (
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

                            {step === 53 && (
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
                            {step === 54 && (
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

                            {step === 55 && (
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
                    <button className='btnBaixarPdf' onClick={() => { geradorCorretagemImobiliariaPago(formData) }}>
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