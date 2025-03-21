'use client'
import Pilha from '@/lib/pilha';
import { verificarValor } from '@/lib/utils';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';
import GeracaodeComodatoResidencialPAGO from '../util/pdf';



const contratoimovelresidencial = z.object({
    pessoaComodante: z.enum(['fisica', 'juridico']),

    /**COMODANTE PF */
    nomeCompletoComodante: z.string(),
    cpfComodante: z.string(),
    enderecoComodante: z.string(),
    telefoneComodante: z.string(),
    documentoIdentificacaoComodante: z.string(),
    numeroDocComodante: z.string(),
    estadoCivilComodante: z.string(),
    nacionalidadeComodante: z.string(),
    profissaoComodante: z.string(),
    /** */

    /**COMODANTE PJ */
    razaoSocial: z.string(),
    cnpj: z.string(),
    endereco: z.string(),
    telefone: z.string(),
    representanteNome: z.string(),
    cargoRepresentante: z.string(),
    documentoIdentifica: z.string(),
    cpfRepresentante: z.string(),
    /** */


    pessoaComodatario: z.enum(['fisica', 'juridico']),

    /**Comodatario PF */
    nomeCompletoComodatario: z.string(),
    cpfComodatario: z.string(),
    enderecoComodatario: z.string(),
    telefoneComodatario: z.string(),
    documentoIdentificacaoComodatario: z.string(),
    estadoCivilComodatario: z.string(),
    nacionalidadeComodatario: z.string(),
    profissaoComodatario: z.string(),
    /** */

    /**Comodatario PJ */
    razaoSocialComodatario: z.string(),
    cnpjComodatario: z.string(),
    enderecoComodatarioPj: z.string(),
    telefoneComodatarioPj: z.string(),
    representanteNomeComodatario: z.string(),
    cargoRepresentanteComodatario: z.string(),
    documentoIdentificaComodatario: z.string(),
    numeroDocComodatarioPj: z.string(),
    cpfRepresentanteComodatarioPj: z.string(),
    /** */

    /**OBJETO DO CONTRATO */
    enderecoImovel: z.string(),
    descricaoDetalhada: z.string(),
    /** */

    /**DESTINAÇÃO DO IMÓVEL */
    utilizacaoImovel: z.enum(['livre', 'especifico']),
    //se for especifico
    finalidade: z.string(),
    /** */

    /**TAXAS,TRIBUTOS E DESPESAS */
    pagamentoImpostos: z.enum(['comodante', 'comodatario']),
    imoveltxcondominio: z.enum(['S', 'N']),
    //se sim 
    responsavelPag: z.enum(['comodante', 'comodatario']),

    despesas: z.enum(['comodante', 'comodatario']),
    /** */

    /**PRAZO VIGÊNCIA */
    dataInicio: z.string(),
    contratoPrazo: z.enum(['S', 'N']),
    //se sim
    quantosMeses: z.string(),
    /** */

    /**DA VEDAÇÃO À SUBLOCAÇÃO E EMPRÉSTIMO DO IMÓVEL */
    emprestimo: z.enum(['S', 'N']),
    /** */

    /**BENFEITORIAS E OBRAS */
    benfeitoriasNecessarias: z.enum(['comodato', 'comodatario']),
    benfeitoriasUteis: z.enum(['comodato', 'comodatario']),
    /** */

    /**RESCISÃO E PENALIDADES */
    descumprimento: z.enum(['S', 'N']),
    //se sim
    multaDescumprimento: z.string(),
    /** */

    /**DA ARBITRAGEM E RESOLUÇÃO DE CONFLITOS */
    comarcaEleita: z.string(),
    /** */

    /**DISPOSIÇÕES GERAIS */
    cidade: z.string(),
    estado: z.string(),
    testemunhasNecessarias: z.enum(['S', 'N']), // Necessidade de testemunhas para assinatura do contrato
    //se sim 
    nomeTest1: z.string(),
    cpfTest1: z.string(),
    nomeTest2: z.string(),
    cpfTest2: z.string(),
    dataAssinatura: z.string(),
    registroCartorioTest: z.enum(['S', 'N']), // Indicação se o contrato será registrado em cartório 
    /** */

});

type FormData = z.infer<typeof contratoimovelresidencial>;

export default function ComodatoImovelResidencial() {
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


        if (currentStepData.pessoaComodante === 'fisica') {
            nextStep = 1;
        } else if (currentStepData.pessoaComodante === 'juridico') {
            setComodatopj(true);
            nextStep = 11;
        }


        if (nextStep === 10) {
            nextStep = 19;
        }


        if (currentStepData.pessoaComodatario === 'fisica') {
            nextStep = 20;
        } else if (currentStepData.pessoaComodatario === 'juridico') {
            setComodatariopj(true);
            nextStep = 28;
        }


        if (nextStep === 27) {
            nextStep = 37;


            if (currentStepData.utilizacaoImovel === 'livre') {
                nextStep = 41;
            } else if (currentStepData.utilizacaoImovel === 'especifico') {
                setFinalidade(true);
                nextStep = 40;
            }


            if (currentStepData.imoveltxcondominio === 'S') {
                setImoveltxcondominio(true);
                nextStep = 43;
            } else if (currentStepData.imoveltxcondominio === 'N') {
                nextStep = 44;
            }

            if (currentStepData.contratoPrazo === 'S') {
                setContratoPrazo(true);
                nextStep = 47;
            } else if (currentStepData.contratoPrazo === 'N') {
                nextStep = 48;
            }


            if (currentStepData.descumprimento === 'S') {
                setMultaDescumprimento(true);
                nextStep = 52;
            } else if (currentStepData.descumprimento === 'N') {
                nextStep = 53;
            }

            if (currentStepData.testemunhasNecessarias === 'S') {
                setTestemunhas(true);
                nextStep = 57;
            } else if (currentStepData.testemunhasNecessarias === 'N') {
                nextStep = 61;
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
    }
    const geracaodecomodatoresidencialpdf = (dados: any) => {
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
        doc.text("Contrato de Comodato de Imóvel Residencial", 105, posY, { align: "center" });
        posY += 15;

        // Seção 1: Identificação das Partes
        addSection("1. IDENTIFICAÇÃO DAS PARTES", [
            "Comodante (Pessoa que vai emprestar)",
            dados.pessoaComodante === "juridico" ? "Pessoa Jurídica:" : "Pessoa Física:",
            ...(dados.pessoaComodante === "juridico"
                ? [
                    `Razão social: ${verificarValor(dados.razaoSocial)}`,
                    `CNPJ: ${verificarValor(dados.cnpj)}`,
                    `Endereço: ${verificarValor(dados.endereco)}`,
                    `Nome do representante: ${verificarValor(dados.representanteNome)}`,
                    `Cargo do representante: ${verificarValor(dados.cargoRepresentante)}`,
                    `Carteira de identidade do representante: ${verificarValor(dados.documentoIdentifica)}`,
                    `CPF do representante: ${verificarValor(dados.cpfRepresentante)}`
                ]
                : [
                    `Nome: ${verificarValor(dados.nomeCompletoComodante)}`,
                    `Estado civil: ${verificarValor(dados.estadoCivilComodante)}`,
                    `Nacionalidade: ${verificarValor(dados.nacionalidadeComodante)}`,
                    `Profissão: ${verificarValor(dados.profissaoComodante)}`,
                    `Documento de identificação: ${verificarValor(dados.documentoIdentificacaoComodante)}`,
                    `Número do documento: ${verificarValor(dados.numeroDocComodante)}`,
                    `CPF: ${verificarValor(dados.cpfComodante)}`,
                    `Endereço completo: ${verificarValor(dados.enderecoComodante)}`
                ]),
            "Comodatário (Pessoa que vai receber emprestado)",
            dados.pessoaComodatario === "juridico" ? "Pessoa Jurídica:" : "Pessoa Física:",
            ...(dados.pessoaComodatario === "juridico"
                ? [
                    `Razão social: ${verificarValor(dados.razaoSocialComodatario)}`,
                    `CNPJ: ${verificarValor(dados.cnpjComodatario)}`,
                    `Endereço: ${verificarValor(dados.enderecoComodatarioPj)}`,
                    `Nome do representante: ${verificarValor(dados.representanteNomeComodatario)}`,
                    `Cargo do representante: ${verificarValor(dados.cargoRepresentanteComodatario)}`,
                    `Carteira de identidade do representante: ${verificarValor(dados.documentoIdentificaComodatario)}`,
                    `CPF do representante: ${verificarValor(dados.cpfRepresentanteComodatarioPj)}`
                ]
                : [
                    `Nome: ${verificarValor(dados.nomeCompletoComodatario)}`,
                    `Estado civil: ${verificarValor(dados.estadoCivilComodatario)}`,
                    `Nacionalidade: ${verificarValor(dados.nacionalidadeComodatario)}`,
                    `Profissão: ${verificarValor(dados.profissaoComodatario)}`,
                    `Documento de identificação: ${verificarValor(dados.documentoIdentificacaoComodatario)}`,
                    `CPF: ${verificarValor(dados.cpfComodatario)}`,
                    `Endereço completo: ${verificarValor(dados.enderecoComodatario)}`
                ])
        ]);

        // Seção 2: Do Objeto
        addSection("2. DO OBJETO", [
            `Endereço do imóvel cedido: ${verificarValor(dados.enderecoImovel)}`,
            `Descrição do imóvel: ${verificarValor(dados.descricaoDetalhada)}`
        ]);

        // Seção 3: Da Destinação do Imóvel
        addSection("3. DA DESTINAÇÃO DO IMÓVEL", [
            `O comodatário poderá utilizar o imóvel: ${dados.utilizacaoImovel === "livre" ? "Livremente" : `Somente para um fim específico: ${verificarValor(dados.finalidade)}`}`
        ]);

        // Seção 4: Das Taxas e Impostos
        addSection("4. DAS TAXAS E IMPOSTOS", [
            `O responsável pelo pagamento dos impostos e taxas do imóvel será: ${dados.pagamentoImpostos === "comodante" ? "Comodante" : "Comodatário"}`,
            `O imóvel possui condomínio mensal? ${dados.imoveltxcondominio === "S" ? "Sim" : "Não"}`,
            ...(dados.imoveltxcondominio === "S" ? [`O responsável pelo pagamento do condomínio será: ${dados.responsavelPag === "comodante" ? "Comodante" : "Comodatário"}`] : []),
            `As despesas com manutenção, energia elétrica, água e outras contas serão arcadas por? ${dados.despesas === "comodante" ? "Comodante" : "Comodatário"}`
        ]);

        // Seção 5: Do Prazo do Comodato
        addSection("5. DO PRAZO DO COMODATO", [
            `Data de início: ${verificarValor(dados.dataInicio)}`,
            `O empréstimo terá um prazo para encerrar? ${dados.contratoPrazo === "S" ? "Sim" : "Não"}`,
            ...(dados.contratoPrazo === "S" ? [`O imóvel será emprestado por ${verificarValor(dados.quantosMeses)} meses.`] : [])
        ]);

        // Seção 6: Da Vedação à Sublocação e Empréstimo do Imóvel
        addSection("6. DA VEDAÇÃO À SUBLOCAÇÃO E EMPRÉSTIMO DO IMÓVEL", [
            `O comodatário poderá emprestar, ceder ou alugar o imóvel para terceiros? ${dados.emprestimo === "S" ? "Sim" : "Não"}`
        ]);

        // Seção 7: Das Benfeitorias Necessárias, Úteis e Voluptuárias
        addSection("7. DAS BENFEITORIAS NECESSÁRIAS, ÚTEIS E VOLUPTUÁRIAS", [
            `Quem será responsável pelo pagamento das benfeitorias necessárias? ${dados.benfeitoriasNecessarias === "comodato" ? "Comodante" : "Comodatário"}`,
            `Quem será responsável pelo pagamento das benfeitorias úteis? ${dados.benfeitoriasUteis === "comodato" ? "Comodante" : "Comodatário"}`
        ]);

        // Seção 8: Dos Direitos e Deveres das Partes
        addSection("8. DOS DIREITOS E DEVERES DAS PARTES", [
            "Direitos do Comodante:",
            "- Reaver o imóvel ao final do prazo acordado ou mediante aviso prévio de 30 (trinta) dias.",
            "- Exigir a devolução do imóvel em condições semelhantes às que foi entregue, salvo desgaste natural.",
            "- Receber indenização por eventuais danos causados pelo comodatário.",
            "- Fiscalizar o uso do imóvel.",
            "Direitos do Comodatário:",
            "- Utilizar o imóvel de acordo com o que foi estabelecido no contrato.",
            "- Permanecer no imóvel durante o prazo estabelecido, desde que cumpra suas obrigações.",
            "- Ser ressarcido pelo comodante caso realize benfeitorias necessárias previamente autorizadas.",
            "Deveres do Comodatário:",
            "- Utilizar o imóvel unicamente para os fins acordados.",
            "- Zelar pela manutenção e conservação do imóvel.",
            "- Restituir o imóvel nas condições acordadas ao final do prazo.",
            "- Informar imediatamente ao comodante qualquer dano ou problema estrutural."
        ]);

        // Seção 9: Do Descumprimento e Rescisão
        addSection("9. DO DESCUMPRIMENTO E RESCISÃO", [
            `Haverá cobrança de multa em caso de descumprimento do contrato? ${dados.descumprimento === "S" ? "Sim" : "Não"}`,
            ...(dados.descumprimento === "S" ? [`O valor da multa será de R$ ${verificarValor(dados.multaDescumprimento)}.`] : []),
            "O descumprimento de qualquer cláusula poderá resultar na rescisão imediata do contrato, com restituição do imóvel ao comodante.",
            "O contrato também poderá ser rescindido por qualquer das partes mediante aviso prévio de 30 (trinta) dias."
        ]);

        // Seção 10: Da Resolução de Conflitos
        addSection("10. DA RESOLUÇÃO DE CONFLITOS", [
            `As partes comprometem-se a resolver eventuais conflitos decorrentes deste contrato de forma amigável. Caso não seja possível, fica eleito o foro da comarca de ${verificarValor(dados.comarcaEleita)}, com exclusão de qualquer outro, por mais privilegiado que seja.`
        ]);

        // Seção 11: Cláusulas Adicionais
        addSection("11. CLÁUSULAS ADICIONAIS", [
            "Confidencialidade: As partes comprometem-se a não divulgar informações relativas a este contrato a terceiros sem a prévia autorização por escrito da outra parte.",
            "Proibição de obras estruturais: O comodatário não poderá realizar qualquer obra estrutural no imóvel sem o consentimento prévio e expresso do comodante. Caso sejam necessárias intervenções estruturais, estas deverão ser previamente acordadas entre as partes.",
            "Uso exclusivo: O comodatário declara estar ciente de que o imóvel será utilizado exclusivamente para os fins acordados neste contrato, não podendo desvirtuar sua destinação sem autorização do comodante."
        ]);

        // Seção 12: Data e Local da Assinatura
        addSection("DATA E LOCAL DA ASSINATURA", [
            `Cidade: ${verificarValor(dados.cidade)}`,
            `Estado: ${verificarValor(dados.estado)}`,
            `Data: ${verificarValor(dados.dataAssinatura)}`,
            "ASSINATURAS",
            `Comodante: ____________________________ CPF: ${verificarValor(dados.cpfComodante)}`,
            `Comodatário: ___________________________ CPF: ${verificarValor(dados.cpfComodatario)}`,
            ...(dados.testemunhasNecessarias === "S"
                ? [
                    `1ª Testemunha: ${verificarValor(dados.nomeTest1)} CPF: ${verificarValor(dados.cpfTest1)}`,
                    "Assinatura: _________________________",

                    `2ª Testemunha: ${verificarValor(dados.nomeTest2)} CPF: ${verificarValor(dados.cpfTest2)}`,
                    "Assinatura: _________________________",
                ]
                : []),


            `O contrato será registrado em cartório? ${dados.registroCartorioTest === "S" ? "Sim" : "Não"}`
        ]);

        const pdfDataUri = doc.output("datauristring");
        return pdfDataUri;
    };

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        geracaodecomodatoresidencialpdf({ ...formData });
    }, [formData]);

    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title">Contrato de Comodato de Imóvel Residencial </h1>
            </div>
            <div className="container">
                <div className="left-panel">
                    <div className="scrollable-card">
                        <div className="progress-bar">
                            <div
                                className="progress-bar-inner"
                                style={{ width: `${(step / 62) * 100}%` }}
                            ></div>
                        </div>
                        <div className="form-wizard">
                            {step === 1 && (
                                <>
                                    <h2>Comodante  (Pessoa que empresta o imóvel)</h2>                                    <div>
                                        <label>É pessoa </label>
                                        <select name='pessoaComodante' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="fisica">Física</option>
                                            <option value="juridico">Jurídico</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 2 && (
                                <>
                                    <h2>Comodante (Pessoa que empresta o imóvel)</h2>                                    <div>
                                        <label>Nome completo</label>
                                        <input
                                            type='text'
                                            placeholder='Nome do Comodante'
                                            name="nomeCompletoComodante"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 3 && (
                                <>
                                    <h2>Comodante (Pessoa que empresta o imóvel)</h2>                                    <div>
                                        <label>CPF</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="cpfComodante"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 4 && (
                                <>
                                    <h2>Comodante (Pessoa que empresta o imóvel)</h2>                                    <div>
                                        <label>Endereço</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="enderecoComodante"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 5 && (
                                <>
                                    <h2>Comodante (Pessoa que empresta o imóvel)</h2>                                    <div>
                                        <label>Telefone</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="telefoneComodante"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 6 && (
                                <>
                                    <h2>Comodante (Pessoa que empresta o imóvel)</h2>                                    <div>
                                        <label>Documento de identificação</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="documentoIdentificacaoComodante"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 7 && (
                                <>
                                    <h2>Comodante (Pessoa que empresta o imóvel)</h2>                                    <div>
                                        <label>Número do documento</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="numeroDocComodante"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 8 && (
                                <>
                                    <h2>Comodante (Pessoa que empresta o imóvel)</h2>                                    <div>
                                        <label>Estado civil</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="estadoCivilComodante"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 9 && (
                                <>
                                    <h2>Comodante (Pessoa que empresta o imóvel)</h2>                                    <div>
                                        <label>Nacionalidade</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="nacionalidadeComodante"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 10 && (
                                <>
                                    <h2>Comodante (Pessoa que empresta o imóvel)</h2>                                    <div>
                                        <label>Profissão</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="profissaoComodante"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {comodatopj && (
                                <>
                                    {step === 11 && (
                                        <>
                                            <h2>Comodante (Pessoa que empresta o imóvel)</h2>                                    <div>
                                                <label>Razão Social</label>
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

                                    {step === 12 && (
                                        <>
                                            <h2>Comodante (Pessoa que empresta o imóvel)</h2>                                    <div>
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

                                    {step === 13 && (
                                        <>
                                            <h2>Comodante (Pessoa que empresta o imóvel)</h2>                                    <div>
                                                <label>Endereço</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="endereco"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 14 && (
                                        <>
                                            <h2>Comodante (Pessoa que empresta o imóvel)</h2>                                    <div>
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

                                    {step === 15 && (
                                        <>
                                            <h2>Comodante (Pessoa que empresta o imóvel)</h2>                                    <div>
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

                                    {step === 16 && (
                                        <>
                                            <h2>Comodante (Pessoa que empresta o imóvel)</h2>                                    <div>
                                                <label>Cargo do Representante</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cargoRepresentante"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 17 && (
                                        <>
                                            <h2>Comodante (Pessoa que empresta o imóvel)</h2>                                    <div>
                                                <label>Carteira de identidade do representante</label>
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

                                    {step === 18 && (
                                        <>
                                            <h2>Comodante (Pessoa que empresta o imóvel)</h2>                                    <div>
                                                <label>CPF do representante</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cpfRepresentante"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}


                            {step === 19 && (
                                <>
                                    <h2>Comodatário (Pessoa que recebe o imóvel emprestado)</h2>                                    <div>
                                        <label>É pessoa </label>
                                        <select name='pessoaComodatario' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="fisica">Física</option>
                                            <option value="juridico">Jurídico</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 20 && (
                                <>
                                    <h2>Comodatário (Pessoa que recebe o imóvel emprestado)</h2>                                    <div>
                                        <label>Nome completo</label>
                                        <input
                                            type='text'
                                            placeholder='Nome do Comodatário'
                                            name="nomeCompletoComodatario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 21 && (
                                <>
                                    <h2>Comodatário (Pessoa que recebe o imóvel emprestado)</h2>                                    <div>
                                        <label>CPF</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="cpfComodatario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 22 && (
                                <>
                                    <h2>Comodatário (Pessoa que recebe o imóvel emprestado)</h2>                                    <div>
                                        <label>Endereço</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="enderecoComodatario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 23 && (
                                <>
                                    <h2>Comodatário (Pessoa que recebe o imóvel emprestado)</h2>                                    <div>
                                        <label>Telefone</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="telefoneComodatario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 24 && (
                                <>
                                    <h2>Comodatário (Pessoa que recebe o imóvel emprestado)</h2>                                    <div>
                                        <label>Carteira de identidade</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="documentoIdentificacaoComodatario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 25 && (
                                <>
                                    <h2>Comodatário (Pessoa que recebe o imóvel emprestado)</h2>                                    <div>
                                        <label>Estado civil</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="estadoCivilComodatario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 26 && (
                                <>
                                    <h2>Comodatário (Pessoa que recebe o imóvel emprestado)</h2>                                  <div>
                                        <label>Nacionalidade</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="nacionalidadeComodatario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 27 && (
                                <>
                                    <h2>Comodatário (Pessoa que recebe o imóvel emprestado)</h2>                                    <div>
                                        <label>Profissão</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="profissaoComodatario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {comodatariopj && (
                                <>
                                    {step === 28 && (
                                        <>
                                            <h2>Comodatário (Pessoa que recebe o imóvel emprestado)</h2>                                   <div>
                                                <label>Razão Social</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="razaoSocialComodatario"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 29 && (
                                        <>
                                            <h2>Comodatário (Pessoa que recebe o imóvel emprestado)</h2>                                    <div>
                                                <label>CNPJ</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cnpjComodatario"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 30 && (
                                        <>
                                            <h2>Comodatário (Pessoa que recebe o imóvel emprestado)</h2>                                    <div>
                                                <label>Endereço</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="enderecoComodatarioPj"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 31 && (
                                        <>
                                            <h2>Comodatário (Pessoa que recebe o imóvel emprestado)</h2>                                    <div>
                                                <label>Telefone</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="telefoneComodatarioPj"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 32 && (
                                        <>
                                            <h2>Comodatário (Pessoa que recebe o imóvel emprestado)</h2>                                    <div>
                                                <label>Nome do Representante legal</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="representanteNomeComodatario"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 33 && (
                                        <>
                                            <h2>Comodatário (Pessoa que recebe o imóvel emprestado)</h2>                                    <div>
                                                <label>Cargo do Representante</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cargoRepresentanteComodatario"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 34 && (
                                        <>
                                            <h2>Comodatário (Pessoa que recebe o imóvel emprestado)</h2>                                    <div>
                                                <label>Documento de Identificação do Representante</label>
                                                <input
                                                    type='text'
                                                    placeholder='Tipo de documento,ex.:RG,CNH,PASSAPORTE'
                                                    name="documentoIdentificaComodatario"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 35 && (
                                        <>
                                            <h2>Comodatário (Pessoa que recebe o imóvel emprestado)</h2>                                    <div>
                                                <label>Número do Documento</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="numeroDocComodatarioPj"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 36 && (
                                        <>
                                            <h2>Comodatário (Pessoa que recebe o imóvel emprestado)</h2>                                    <div>
                                                <label>CPF</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cpfRepresentanteComodatarioPj"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 37 && (
                                <>
                                    <h2>Objeto do Contrato</h2>                                    <div>
                                        <label>Endereço do imóvel cedido</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="enderecoImovel"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 38 && (
                                <>
                                    <h2>Objeto do Contrato</h2>                                    <div>
                                        <label>Descrição do imóvel</label>
                                        <textarea
                                            id="descricaoDetalhada"
                                            name="descricaoDetalhada"
                                            onChange={handleChange}
                                            rows={10}
                                            cols={50}
                                            placeholder="Descrição"
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 39 && (
                                <>
                                    <h2>Destinatário do Imóvel</h2>                                    <div>
                                        <label>O imóvel poderá ser utilizado </label>
                                        <select name='utilizacaoImovel' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="livre">Livremente</option>
                                            <option value="especifico">Apenas para a finalidade específica</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {finalidade && (
                                <>
                                    {step === 40 && (
                                        <>
                                            <h2>Destinação do Imóvel</h2>                                    <div>
                                                <label>Descreva a finalidade</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="finalidade"
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
                                    <h2>Taxas,Tributos e Despesas</h2>                                    <div>
                                        <label>O pagamento dos impostos, taxas e tributos incidentes sobre o imóvel será de responsabilidade de</label>
                                        <select name='pagamentoImpostos' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="comodante">Comodante</option>
                                            <option value="comodatario">Comodatário</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 42 && (
                                <>
                                    <h2>Taxas,Tributos e Despesas</h2>                                    <div>
                                        <label>O imóvel possui taxa de condomínio?</label>
                                        <select name='imoveltxcondominio' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {imoveltxcondominio && (
                                <>
                                    {step === 43 && (
                                        <>
                                            <h2>Taxas,Tributos e Despesas</h2>                                    <div>
                                                <label>Quem será responsável pelo pagamento?</label>
                                                <select name='responsavelPag' onChange={handleChange}>
                                                    <option value="">Selecione</option>
                                                    <option value="comodante">Comodante</option>
                                                    <option value="comodatario">Comodatario</option>
                                                </select>
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                </>
                            )}

                            {step === 44 && (
                                <>
                                    <h2>Taxas,Tributos e Despesas</h2>                                    <div>
                                        <label>As despesas com manutenção, energia elétrica, água e outras contas serão arcadas por</label>
                                        <select name='despesas' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="comodante">Comodante</option>
                                            <option value="comodatario">Comodatario</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 45 && (
                                <>
                                    <h2>Prazo e Vigência</h2>                                    <div>
                                        <label>Data de início do comodato</label>
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

                            {step === 46 && (
                                <>
                                    <h2>Prazo e Vigência</h2>                                    <div>
                                        <label>O contrato terá prazo determinado?</label>
                                        <select name='contratoPrazo' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não, sendo por prazo indeterminado.</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}



                            {contratoPrazo && (
                                <>
                                    {step === 47 && (
                                        <>
                                            <h2>Prazo e Vigência</h2>                                    <div>
                                                <label>Por quantos Meses?</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="quantosMeses"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 48 && (
                                <>
                                    <h2>Vedação à Sublocação e Empréstimo do Imóvel</h2>                                    <div>
                                        <label>O comodatário poderá emprestar, ceder ou alugar o imóvel para terceiros?</label>
                                        <select name='emprestimo' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 49 && (
                                <>
                                    <h2>Benfeitorias e Obras</h2>                                    <div>
                                        <label>Quem será responsável pelo pagamento das benfeitorias necessárias?</label>
                                        <select name='benfeitoriasNecessarias' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="comodato">Comodato</option>
                                            <option value="comodatario">Comodatario</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 50 && (
                                <>
                                    <h2>Benfeitorias e Obras</h2>                                    <div>
                                        <label>Quem será responsável pelo pagamento das benfeitorias úteis? </label>
                                        <select name='benfeitoriasUteis' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="comodato">Comodato</option>
                                            <option value="comodatario">Comodatario</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 51 && (
                                <>
                                    <h2>Descumprimento e Rescisão</h2>                                    <div>
                                        <label>Haverá cobrança de multa em caso de descumprimento do contrato? </label>
                                        <select name='descumprimento' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {multaDescumprimento && (
                                <>
                                    {step === 52 && (
                                        <>
                                            <h2>Descumprimento e Rescisão</h2>                                    <div>
                                                <label>O valor da multa será de</label>
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
                                </>
                            )}


                            {step === 53 && (
                                <>
                                    <h2>Abritagem e Resolução de Conflitos</h2>                                    <div>
                                        <label>As partes comprometem-se a resolver eventuais conflitos decorrentes deste contrato de forma amigável. Caso não seja possível, fica eleito o foro da comarca de</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="comarcaEleita"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 54 && (
                                <>
                                    <h2>Disposições Gerais</h2>
                                    <div>
                                        <label>Cidade de Assinatura</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="cidade"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 55 && (
                                <>
                                    <h2>Disposições Gerais</h2>
                                    <div>
                                        <label>Estado de Assinatura</label>
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

                            {step === 56 && (
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
                                    {step === 57 && (
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

                                    {step === 58 && (
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

                                    {step === 59 && (
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

                                    {step === 60 && (
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

                            {step === 61 && (
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


                            {step === 62 && (
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


                            {step === 63 && (
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
                    <button className='btnBaixarPdf' onClick={() => { GeracaodeComodatoResidencialPAGO(formData) }}>
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