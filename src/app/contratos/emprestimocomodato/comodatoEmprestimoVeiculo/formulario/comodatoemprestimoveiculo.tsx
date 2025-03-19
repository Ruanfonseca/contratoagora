'use client'
import Pilha from '@/lib/pilha';
import { verificarValor } from '@/lib/utils';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';
import geradorComodatoVeiculoPago from '../util/pdf';


const comodatoempreveiculoschema = z.object({
    /**CEDENTE */
    nomeRazaoSocial: z.string(),
    cpfcnpj: z.string(),
    enderecoCompleto: z.string(),
    documentoIdentifica: z.string(),
    numeroDoc: z.string(),
    profissao: z.string(),
    estadoCivil: z.string(),
    /** */

    /**CESSIONÁRIO */
    nomeRazaoSocialCessionario: z.string(),
    cpfcnpjCessionario: z.string(),
    enderecoCompletoCessionario: z.string(),
    documentoIdentificaCessionario: z.string(),
    numeroDocCessionario: z.string(),
    profissaoCessionario: z.string(),
    estadoCivilCessionario: z.string(),
    /** */

    /**DO OBJETO DO CONTRATO */
    marcaModelo: z.string(),
    anoFabricacao: z.string(),
    placa: z.string(),
    chassi: z.string(),
    cor: z.string(),
    valorMercado: z.string(),
    /** */

    /**DO PRAZO DO EMPRÉSTIMO */
    prazoEmprestimo: z.string(),
    inicio: z.string(),
    termino: z.string(),
    multaAtraso: z.string(),
    UsoMotivacao: z.string(),
    /** */

    /**DAS PENALIDADES   */
    multaDescumprimento: z.string(),
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

type FormData = z.infer<typeof comodatoempreveiculoschema>;


export default function ComodatoEmprestimoVeiculo() {
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
    const [comodatopj, setComodatopj] = useState(false);
    const [comodatariopj, setComodatariopj] = useState(false);
    const [finalidade, setFinalidade] = useState(false);
    const [imoveltxcondominio, setImoveltxcondominio] = useState(false);
    const [contratoPrazo, setContratoPrazo] = useState(false);
    const [rescindido, setRescindido] = useState(false);
    const [poderaRescidir, setPoderaRescidir] = useState(false);
    const [multaDescumprimento, setMultaDescumprimento] = useState(false);
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
            nextStep = 29;
        } else if (currentStepData.testemunhasNecessarias === 'N') {
            nextStep = 34;
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


    const geradorComodatoVeiculo = (dados: any) => {
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
        doc.text("Contrato de Comodato de Veículo", 105, posY, { align: "center" });
        posY += 15;

        // Seção 1: Identificação das Partes
        addSection("IDENTIFICAÇÃO DAS PARTES", [
            "1.1. CEDENTE (Proprietário do Veículo):",
            `Nome/Razão Social: ${verificarValor(dados.nomeRazaoSocial)}`,
            `CPF/CNPJ: ${verificarValor(dados.cpfcnpj)}`,
            `Endereço Completo: ${verificarValor(dados.enderecoCompleto)}`,
            `Documento de Identificação (RG/Outro): ${verificarValor(dados.documentoIdentifica)}`,
            `Número: ${verificarValor(dados.numeroDoc)}`,
            `Profissão: ${verificarValor(dados.profissao)}`,
            `Estado Civil: ${verificarValor(dados.estadoCivil)}`,
            "",
            "1.2. CESSIONÁRIO (Pessoa que receberá o veículo emprestado):",
            `Nome/Razão Social: ${verificarValor(dados.nomeRazaoSocialCessionario)}`,
            `CPF/CNPJ: ${verificarValor(dados.cpfcnpjCessionario)}`,
            `Endereço Completo: ${verificarValor(dados.enderecoCompletoCessionario)}`,
            `Documento de Identificação (RG/Outro): ${verificarValor(dados.documentoIdentificaCessionario)}`,
            `Número: ${verificarValor(dados.numeroDocCessionario)}`,
            `Profissão: ${verificarValor(dados.profissaoCessionario)}`,
            `Estado Civil: ${verificarValor(dados.estadoCivilCessionario)}`,
        ]);

        // Seção 2: Do Objeto do Contrato
        addSection("DO OBJETO DO CONTRATO", [
            "2.1. O presente contrato tem como objeto o empréstimo do seguinte veículo:",
            `Marca/Modelo: ${verificarValor(dados.marcaModelo)}`,
            `Ano de Fabricação: ${verificarValor(dados.anoFabricacao)}`,
            `Placa: ${verificarValor(dados.placa)}`,
            `Chassi: ${verificarValor(dados.chassi)}`,
            `Cor: ${verificarValor(dados.cor)}`,
            `Valor de mercado: ${verificarValor(dados.valorMercado)}`,
        ]);

        // Seção 3: Do Prazo do Empréstimo
        addSection("DO PRAZO DO EMPRÉSTIMO", [
            `3.1. O prazo de empréstimo será de ${verificarValor(dados.prazoEmprestimo)} dias/meses, com início em ${verificarValor(dados.inicio)} e término em ${verificarValor(dados.termino)}.`,
            `3.2. O CESSIONÁRIO deverá devolver o veículo no prazo estipulado, sob pena de multa no valor de R$ ${verificarValor(dados.multaAtraso)} por dia de atraso.`,
        ]);

        // Seção 4: Da Utilização do Veículo
        addSection("DA UTILIZAÇÃO DO VEÍCULO", [
            `4.1. O veículo será utilizado exclusivamente para ${verificarValor(dados.UsoMotivacao)}.`,
            "4.2. O CESSIONÁRIO se compromete a utilizar o veículo de forma adequada e conforme as normas de trânsito vigentes.",
            "4.3. Fica expressamente proibido o uso do veículo para fins ilícitos, corridas, transporte remunerado de pessoas ou cargas sem autorização prévia do CEDENTE.",
        ]);

        // Seção 5: Da Responsabilidade por Multas, Infrações e Danos
        addSection("DA RESPONSABILIDADE POR MULTAS, INFRAÇÕES E DANOS", [
            "5.1. O CESSIONÁRIO será integralmente responsável por quaisquer infrações de trânsito cometidas durante o período de empréstimo do veículo.",
            "5.2. Caso o veículo seja autuado por infração de trânsito, o CESSIONÁRIO deverá efetuar o pagamento da multa correspondente e assumir os pontos na CNH, quando aplicável.",
            "5.3. O CESSIONÁRIO é responsável por qualquer dano causado ao veículo, comprometendo-se a cobrir os custos de reparo ou substituição de peças.",
            "5.4. Em caso de acidente, o CESSIONÁRIO deverá comunicar imediatamente o CEDENTE e arcar com os custos de conserto e eventuais indenizações.",
        ]);

        // Seção 6: Da Transferência dos Direitos de Uso
        addSection("DA TRANSFERÊNCIA DOS DIREITOS DE USO", [
            "6.1. O CESSIONÁRIO não poderá emprestar, ceder ou alugar o veículo a terceiros sem a autorização expressa e por escrito do CEDENTE.",
        ]);

        // Seção 7: Da Manutenção do Veículo
        addSection("DA MANUTENÇÃO DO VEÍCULO", [
            "7.1. O CESSIONÁRIO será responsável por manter o veículo em perfeitas condições de uso, incluindo a reposição de combustível, troca de óleo e outros cuidados necessários.",
            "7.2. Qualquer necessidade de reparo deve ser previamente comunicada ao CEDENTE antes da realização do serviço.",
        ]);

        // Seção 5: Das Penalidades
        addSection("DAS PENALIDADES", [
            `8.1. O descumprimento de qualquer cláusula deste contrato sujeitará a parte infratora ao pagamento de multa de R$ ${verificarValor(dados.multaDescumprimento)}.`,
            "8.2. O inadimplemento de obrigações também poderá ensejar a rescisão imediata do contrato e a retirada do veículo do CESSIONÁRIO.",
        ]);

        // Seção 6: Do Foro
        addSection("DO FORO", [
            `9.1. Para dirimir quaisquer dúvidas ou controvérsias decorrentes deste contrato, fica eleito o foro da Comarca de ${verificarValor(dados.foroResolucaoConflitos)}, com renúncia expressa a qualquer outro, por mais privilegiado que seja.`,
        ]);

        // Seção 7: Assinaturas e Testemunhas
        addSection("ASSINATURAS E TESTEMUNHAS", [
            "E, por estarem justas e acordadas, as partes assinam o presente contrato em duas vias de igual teor, na presença das testemunhas abaixo.",
            `Registro em Cartório: ${dados.registroCartorioTest === 'S' ? 'Sim' : 'Não'}`,
            `Local: ${verificarValor(dados.local)}`,
            `Data: ${verificarValor(dados.dataAssinatura)}`,
            `Estado:${verificarValor(dados.estado)}`,
            "",
            "___________________________",
            "CEDENTE (Nome e Assinatura)",
            "",
            "",
            "___________________________",
            "CESSIONÁRIO (Nome e Assinatura)",
            "",
            "",
            `1ª Testemunha: ${verificarValor(dados.nomeTest1)} - CPF: ${verificarValor(dados.cpfTest1)}`,
            "___________________________",
            "Assinatura da 1ª Testemunha",
            "",
            "",
            `2ª Testemunha: ${verificarValor(dados.nomeTest2)} - CPF: ${verificarValor(dados.cpfTest2)}`,
            "___________________________",
            "Assinatura da 2ª Testemunha",
        ]);

        const pdfDataUri = doc.output("datauristring");
        return pdfDataUri;
    };

    useEffect(() => {
        geradorComodatoVeiculo({ ...formData });
    }, [formData]);

    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title"> Contrato de Comodato de Veículo </h1>
            </div>
            <div className="container">
                <div className="left-panel">
                    <div className="scrollable-card">
                        <div className="progress-bar">
                            <div
                                className="progress-bar-inner"
                                style={{ width: `${(step / 37) * 100}%` }}
                            ></div>
                        </div>
                        <div className="form-wizard">
                            {step === 1 && (
                                <>
                                    <h2>CEDENTE (Proprietário do Veículo)</h2>                                    <div>
                                        <label>Nome/Razão Social</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="nomeRazaoSocial"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <h2>CEDENTE (Proprietário do Veículo)</h2>                                    <div>
                                        <label>CPF/CNPJ</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="cpfcnpj"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 3 && (
                                <>
                                    <h2>CEDENTE (Proprietário do Veículo)</h2>                                    <div>
                                        <label>Endereço Completo</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="enderecoCompleto"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 4 && (
                                <>
                                    <h2>CEDENTE (Proprietário do Veículo)</h2>                                    <div>
                                        <label>Documento de Identificação (RG/Outro)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="documentoIdentifica"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 5 && (
                                <>
                                    <h2>CEDENTE (Proprietário do Veículo)</h2>                                    <div>
                                        <label>Número do documento</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="numeroDoc"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 6 && (
                                <>
                                    <h2>CEDENTE (Proprietário do Veículo)</h2>                                    <div>
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

                            {step === 7 && (
                                <>
                                    <h2>CEDENTE (Proprietário do Veículo)</h2>                                    <div>
                                        <label>Estado Civil</label>
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

                            {step === 8 && (
                                <>
                                    <h2>CESSIONÁRIO (Pessoa que receberá o veículo emprestado)</h2>                                    <div>
                                        <label>Nome/Razão Social</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="nomeRazaoSocialCessionario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 9 && (
                                <>
                                    <h2>CESSIONÁRIO (Pessoa que receberá o veículo emprestado)</h2>                                    <div>
                                        <label>CPF/CNPJ</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="cpfcnpjCessionario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 10 && (
                                <>
                                    <h2>CESSIONÁRIO (Pessoa que receberá o veículo emprestado)</h2>                                    <div>
                                        <label>Endereço Completo</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="enderecoCompletoCessionario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 11 && (
                                <>
                                    <h2>CESSIONÁRIO (Pessoa que receberá o veículo emprestado)</h2>                                    <div>
                                        <label>Documento de Identificação (RG/Outro)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="documentoIdentificaCessionario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 12 && (
                                <>
                                    <h2>CESSIONÁRIO (Pessoa que receberá o veículo emprestado)</h2>                                    <div>
                                        <label>Número de Identificação</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="numeroDocCessionario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}



                            {step === 13 && (
                                <>
                                    <h2>CESSIONÁRIO (Pessoa que receberá o veículo emprestado)</h2>                                    <div>
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

                            {step === 14 && (
                                <>
                                    <h2>CESSIONÁRIO (Pessoa que receberá o veículo emprestado)</h2>                                    <div>
                                        <label>Estado Civil</label>
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


                            {step === 15 && (
                                <>
                                    <h2>Objeto do Contrato</h2>                                    <div>
                                        <label>Marca/Modelo</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="marcaModelo"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 16 && (
                                <>
                                    <h2>Objeto do Contrato</h2>                                    <div>
                                        <label>Ano de Fabricação</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="anoFabricacao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 17 && (
                                <>
                                    <h2>Objeto do Contrato</h2>                                    <div>
                                        <label>Placa</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="placa"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 18 && (
                                <>
                                    <h2>Objeto do Contrato</h2>                                    <div>
                                        <label>Chassi</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="chassi"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 19 && (
                                <>
                                    <h2>Objeto do Contrato</h2>                                    <div>
                                        <label>Cor</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="cor"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 20 && (
                                <>
                                    <h2>Objeto do Contrato</h2>                                    <div>
                                        <label>Valor de Mercado</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="valorMercado"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 21 && (
                                <>
                                    <h2>Prazo do Empréstimo</h2>                                    <div>
                                        <label>O prazo de empréstimo será de _____ dias/meses</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="prazoEmprestimo"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 22 && (
                                <>
                                    <h2>Prazo do Empréstimo</h2>                                    <div>
                                        <label>Inicio em</label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="inicio"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 23 && (
                                <>
                                    <h2>Prazo do Empréstimo</h2>                                    <div>
                                        <label>Termino em</label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="termino"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 24 && (
                                <>
                                    <h2>Prazo do Empréstimo</h2>                                    <div>
                                        <label>O CESSIONÁRIO deverá devolver o veículo no prazo estipulado, sob pena de multa no valor de R$ _____ por dia de atraso.</label>
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

                            {step === 25 && (
                                <>
                                    <h2>Utilização do Veículo</h2>                                    <div>
                                        <label>O veículo será utilizado exclusivamente para _________________________.</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="UsoMotivacao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 26 && (
                                <>
                                    <h2>Penalidades</h2>                                    <div>
                                        <label>O descumprimento de qualquer cláusula deste contrato sujeitará a parte infratora ao pagamento de multa de R$ _____.</label>
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



                            {step === 27 && (
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

                            {step === 28 && (
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
                                    {step === 29 && (
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

                                    {step === 30 && (
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

                                    {step === 31 && (
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

                                    {step === 32 && (
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

                            {step === 34 && (
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

                            {step === 35 && (
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
                            {step === 36 && (
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

                            {step === 37 && (
                                <>
                                    <h2>Disposições Gerais</h2>
                                    <div>
                                        <label>Estado de Assinatura</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="estado"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 38 && (
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
                    <button className='btnBaixarPdf' onClick={() => { geradorComodatoVeiculoPago(formData) }}>
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