'use client'
import Pilha from '@/lib/pilha';
import { verificarValor } from '@/lib/utils';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';
import geradorComodatoDinheiroPago from '../util/pdf';


const comodatoempredinheirochema = z.object({
    /**CREDOR */
    nomeCredor: z.string(),
    enderecoCredor: z.string(),
    cpfcnpj: z.string(),
    /** */

    /**DEVEDOR */
    nomeDevedor: z.string(),
    cpfcnpjDevedor: z.string(),
    enderecoDevedor: z.string(),
    /** */

    /**OBJETO */
    valorNumeral: z.string(),
    valorExtenso: z.string(),
    /** */

    /**PRAZO E FORMA DE PAGAMENTO */
    prazo: z.string(),
    vencimento: z.string(),
    formaPagamento: z.string(),
    /** */

    /**USO DO EMPRÉSTIMO */
    usoEmprestimo: z.string(),
    /** */

    /**PENALIDADES POR ATRASO */
    indice: z.string(),
    /** */

    /**DISPOSIÇÕES GERAIS */
    foroResolucaoConflitos: z.string(), // Foro eleito para resolução de conflitos
    cidade: z.string(),
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

type FormData = z.infer<typeof comodatoempredinheirochema>;


export default function ComodatoEmprestimoDinheiro() {

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
            nextStep = 18;
        } else if (currentStepData.testemunhasNecessarias === 'N') {
            nextStep = 22;
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


    const geradorComodatoDinheiro = (dados: any) => {
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
        doc.text("Contrato de Comodato de Dinheiro", 105, posY, { align: "center" });
        posY += 15;

        // Seção 1 - Credor e Devedor
        addSection("CREDOR", [
            `Nome: ${verificarValor(dados.nomeCredor)}`,
            `Endereço: ${verificarValor(dados.enderecoCredor)}`,
            `CPF/CNPJ: ${verificarValor(dados.cpfcnpj)}`
        ]);

        addSection("DEVEDOR", [
            `Nome: ${verificarValor(dados.nomeDevedor)}`,
            `Endereço: ${verificarValor(dados.enderecoDevedor)}`,
            `CPF/CNPJ: ${verificarValor(dados.cpfcnpjDevedor)}`
        ]);

        // Seção 2 - Objeto do Contrato
        addSection("CLÁUSULA 1ª - DO OBJETO", [
            `O presente contrato tem por objeto o empréstimo da quantia de R$ ${verificarValor(dados.valorNumeral)} (${verificarValor(dados.valorExtenso)} reais), concedida pelo CREDOR ao DEVEDOR, que se compromete a restituí-la nos termos estabelecidos neste instrumento.`
        ]);

        // Seção 3 - Prazo e Forma de Pagamento
        addSection("CLÁUSULA 2ª - DO PRAZO E FORMA DE PAGAMENTO", [
            `O valor emprestado deverá ser restituído pelo DEVEDOR no prazo de ${verificarValor(dados.prazo)} meses, com vencimento da primeira parcela em ${verificarValor(dados.vencimento)} e as demais nas mesmas datas dos meses subsequentes.`,
            `Forma de pagamento: ${verificarValor(dados.formaPagamento)}.`
        ]);

        // Seção 4 - Garantias
        addSection("CLÁUSULA 3ª - DAS GARANTIAS", [
            `Para assegurar o cumprimento deste contrato, o DEVEDOR oferece a seguinte garantia, podendo ser de natureza real ou pessoal:`,
            `I - Garantia real: Caso a garantia seja um bem imóvel, o DEVEDOR compromete-se a apresentar matrícula atualizada do imóvel, devidamente registrada em cartório, com averbação da alienação fiduciária ou hipoteca em favor do CREDOR. Se a garantia for um veículo, deverá ser apresentado o Certificado de Registro de Veículo (CRV) devidamente alienado ao CREDOR junto ao órgão competente.`,
            `II - Garantia pessoal: Caso a garantia seja prestada por terceiros, o(s) fiador(es) ou avalista(s) deverá(ão) assinar o presente contrato, fornecendo seus dados completos e se comprometendo solidariamente ao pagamento da dívida em caso de inadimplência do DEVEDOR.`,
            `III - Outras garantias: Poderão ser aceitas outras garantias previamente acordadas entre as partes, como penhor de bens móveis, aplicações financeiras ou títulos de crédito, devendo todas as condições ser formalizadas em instrumento próprio e anexadas a este contrato.`,
            `O CREDOR poderá exigir a substituição da garantia caso esta perca seu valor ou liquidez ao longo do prazo do contrato.`
        ]);

        // Seção 5 - Uso do Empréstimo
        addSection("CLÁUSULA 4ª - DO USO DO EMPRÉSTIMO", [
            `O valor do empréstimo será utilizado para: ${verificarValor(dados.usoEmprestimo)}.`
        ]);

        // Seção 6 - Encargos Adicionais
        addSection("CLÁUSULA 5ª - DOS ENCARGOS ADICIONAIS", [
            `Serão de responsabilidade do DEVEDOR todas as despesas relacionadas ao presente contrato, incluindo tarifas bancárias, taxas de cartório e honorários advocatícios, caso sejam necessários para cobrança judicial ou extrajudicial.`
        ]);

        // Seção 7 - Penalidades por Atraso
        addSection("CLÁUSULA 6ª - DAS PENALIDADES POR ATRASO", [
            `Em caso de atraso no pagamento, será aplicado o índice de ${verificarValor(dados.indice)} sobre o valor devido.`
        ]);

        // Seção 8 - Rescisão
        addSection("CLÁUSULA 7ª - DA RESCISÃO", [
            `O presente contrato poderá ser rescindido nas seguintes situações:`,
            `I - Descumprimento de qualquer cláusula contratual;`,
            `II - Pedido de falência ou insolvência do DEVEDOR;`,
            `III - Protesto de títulos ou outras medidas que comprometam a capacidade financeira do DEVEDOR.`,
            `Ocorrendo rescisão, o saldo devedor será considerado vencido antecipadamente e deverá ser quitado integralmente no prazo de 10 (dez) dias.`
        ]);

        // Seção 9 - Tolerância
        addSection("CLÁUSULA 8ª - DA TOLERÂNCIA", [
            `Qualquer concessão ou tolerância entre as partes não implicará novação ou renúncia a direitos estabelecidos neste contrato.`
        ]);

        // Seção 10 - Foro
        addSection("CLÁUSULA 9ª - DO FORO", [
            `Fica eleito o foro da comarca de ${verificarValor(dados.foroResolucaoConflitos)}, estado de ${verificarValor(dados.estado)}, para dirimir quaisquer dúvidas ou controvérsias decorrentes deste contrato, renunciando as partes a qualquer outro, por mais privilegiado que seja.`
        ]);

        // Seção 11 - Local e Data de Assinatura
        addSection("LOCAL E DATA DE ASSINATURA", [
            `Por estarem justos e acordados, firmam o presente instrumento em duas vias de igual teor e forma, na cidade de ${verificarValor(dados.local)}, estado de ${verificarValor(dados.estado)}, no endereço ${verificarValor(dados.enderecoCredor)}, na data de ${verificarValor(dados.dataAssinatura)}.`
        ]);

        // Seção 12 - Testemunhas (se necessário)
        if (dados.testemunhasNecessarias === 'S') {
            addSection("TESTEMUNHAS", [
                `Nome: ${verificarValor(dados.nomeTest1)}, CPF: ${verificarValor(dados.cpfTest1)}`,
                `Nome: ${verificarValor(dados.nomeTest2)}, CPF: ${verificarValor(dados.cpfTest2)}`
            ]);
        }

        // Seção 13 - Registro em Cartório (se necessário)
        if (dados.registroCartorioTest === 'S') {
            addSection("REGISTRO EM CARTÓRIO", [
                `O presente contrato será registrado em cartório.`
            ]);
        }

        const pdfDataUri = doc.output("datauristring");
        return pdfDataUri;
    };

    useEffect(() => {
        geradorComodatoDinheiro({ ...formData });
    }, [formData]);


    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title"> Contrato de Comodato de Dinheiro </h1>
            </div>
            <div className="container">
                <div className="left-panel">
                    <div className="scrollable-card">
                        <div className="progress-bar">
                            <div
                                className="progress-bar-inner"
                                style={{ width: `${(step / 23) * 100}%` }}
                            ></div>
                        </div>
                        <div className="form-wizard">
                            {step === 1 && (
                                <>
                                    <h2>CREDOR</h2>                                    <div>
                                        <label>Nome/Razão Social</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="nomeCredor"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <h2>CREDOR</h2>                                    <div>
                                        <label>Endereço</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="enderecoCredor"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 3 && (
                                <>
                                    <h2>CREDOR</h2>                                    <div>
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


                            {step === 4 && (
                                <>
                                    <h2>DEVEDOR</h2>                                    <div>
                                        <label>Nome/Razão Social</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="nomeDevedor"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 5 && (
                                <>
                                    <h2>DEVEDOR</h2>                                    <div>
                                        <label>Endereço</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="enderecoDevedor"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 6 && (
                                <>
                                    <h2>DEVEDOR</h2>                                    <div>
                                        <label>CPF/CNPJ</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="cpfcnpjDevedor"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 7 && (
                                <>
                                    <h2>OBJETO</h2>                                    <div>
                                        <label>O presente contrato tem por objeto o empréstimo da quantia de R$ ____________ </label>
                                        <input
                                            type='text'
                                            placeholder='ex.:1.000,2.000..'
                                            name="valorNumeral"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 8 && (
                                <>
                                    <h2>OBJETO</h2>                                    <div>
                                        <label>O presente contrato tem por objeto o empréstimo da quantia de R$ ____________ </label>
                                        <input
                                            type='text'
                                            placeholder='ex.:1.000,2.000..'
                                            name="valorNumeral"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 9 && (
                                <>
                                    <h2>OBJETO</h2>                                    <div>
                                        <label>Valor por extenso (____________ reais) </label>
                                        <input
                                            type='text'
                                            placeholder='ex.:Mil e duzentos..'
                                            name="valorExtenso"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 10 && (
                                <>
                                    <h2>PRAZO E FORMA DE PAGAMENTO</h2>                                    <div>
                                        <label>O valor emprestado deverá ser restituído pelo DEVEDOR no prazo de ______ meses </label>
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

                            {step === 11 && (
                                <>
                                    <h2>PRAZO E FORMA DE PAGAMENTO</h2>                                    <div>
                                        <label>Com vencimento da primeira parcela em //____ e as demais nas mesmas datas dos meses subsequentes. </label>
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

                            {step === 12 && (
                                <>
                                    <h2>PRAZO E FORMA DE PAGAMENTO</h2>                                    <div>
                                        <label>Forma de pagamento: ___________________________ </label>
                                        <input
                                            type='text'
                                            placeholder='especificar: transferência bancária, cheque, débito automático, etc'
                                            name="formaPagamento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 13 && (
                                <>
                                    <h2>USO DO EMPRÉSTIMO</h2>                                    <div>
                                        <label>O valor do empréstimo será utilizado para: ____________________________________________________________ </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="usoEmprestimo"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 14 && (
                                <>
                                    <h2>PENALIDADES POR ATRASO</h2>                                    <div>
                                        <label>Em caso de atraso no pagamento de qualquer parcela, incidirá multa de % ( por cento) sobre o valor em atraso, além de juros de mora de % ( por cento) ao mês e correção monetária com base no índice ________________.  </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="indice"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 15 && (
                                <>
                                    <div>
                                        <h2>DISPOSIÇÕES GERAIS</h2>
                                        <label>Fica eleito o foro da comarca de ___________________.  </label>
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

                            {step === 16 && (
                                <>
                                    <div>
                                        <h2>DISPOSIÇÕES GERAIS</h2>
                                        <label>Assinando n(a)o Cidade  ___________________.  </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="cidade"
                                            onChange={handleChange}
                                        />

                                        <label>Assinando no Estado  ___________________.  </label>
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

                            {step === 17 && (
                                <>
                                    <h2>DISPOSIÇÕES GERAIS</h2>
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
                                    {step === 18 && (
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

                                    {step === 19 && (
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

                                    {step === 20 && (
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

                                    {step === 21 && (
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

                            {step === 22 && (
                                <>
                                    <h2>DISPOSIÇÕES GERAIS</h2>
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

                            {step === 23 && (
                                <>
                                    <h2>DISPOSIÇÕES GERAIS</h2>
                                    <div>
                                        <label>Endereço de Assinatura</label>
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
                            {step === 24 && (
                                <>
                                    <h2>DISPOSIÇÕES GERAIS</h2>
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


                            {step === 25 && (
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
                    <button className='btnBaixarPdf' onClick={() => { geradorComodatoDinheiroPago(formData) }}>
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