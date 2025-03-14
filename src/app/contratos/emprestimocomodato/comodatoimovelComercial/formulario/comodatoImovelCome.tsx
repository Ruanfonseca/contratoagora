'use client'
import Pilha from '@/lib/pilha';
import { verificarValor } from '@/lib/utils';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';
import geradorComodatoImovelCPAGO from '../util/pdf';


const contratoimovelcomercial = z.object({
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
    numeroDoc: z.string(),
    /** */






    pessoaComodatario: z.enum(['fisica', 'juridico']),

    /**Comodatario PF */
    nomeCompletoComodatario: z.string(),
    cpfComodatario: z.string(),
    enderecoComodatario: z.string(),
    telefoneComodatario: z.string(),
    documentoIdentificacaoComodatario: z.string(),
    numeroDocComodatario: z.string(),
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
    responsavelPag: z.string(),

    despesas: z.enum(['comodante', 'comodatario']),
    /** */

    /**PRAZO VIGÊNCIA */
    dataInicio: z.string(),
    contratoPrazo: z.enum(['S', 'N']),
    //se sim
    quantosMeses: z.string(),

    rescindido: z.enum(['S', 'N']),
    //se sim
    avisoPrevio: z.string(),
    /** */

    /**PROIBIÇÃO DE SUBLOCAÇÃO E CESSÃO */
    emprestimo: z.enum(['S', 'N']),
    /** */

    /**BENFEITORIAS E OBRAS */
    benfeitorias: z.enum(['S', 'N']),

    responsaNecessarias: z.string(),
    responsaUteis: z.string(),
    responsaVoluptuarias: z.string(),
    /** */

    /**RESCISÃO E PENALIDADES */
    poderaRescidir: z.enum(['qualquer', 'somente']),
    //se for somente
    avisoPrevioDias: z.string(),

    multaDescumprimento: z.enum(['S', 'N']),
    //se sim
    valorDescumprimento: z.string(),
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

type FormData = z.infer<typeof contratoimovelcomercial>;

export default function ComodatoImovelComercial() {

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
            nextStep = 29;
        }


        if (nextStep === 28) {
            nextStep = 37;
        }



        if (currentStepData.utilizacaoImovel === 'especifico') {
            setFinalidade(true);
            nextStep = 40;
        } else if (currentStepData.utilizacaoImovel === 'livre') {
            nextStep = 41;
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

        if (currentStepData.rescindido === 'S') {
            setRescindido(true);
            nextStep = 49;
        } else if (currentStepData.rescindido === 'N') {
            nextStep = 50;
        }


        if (currentStepData.poderaRescidir === 'qualquer') {
            setPoderaRescidir(true);
            nextStep = 56;
        } else if (currentStepData.poderaRescidir === 'somente') {
            nextStep = 57;
        }


        if (currentStepData.multaDescumprimento === 'S') {
            setMultaDescumprimento(true);
            nextStep = 58;
        } else if (currentStepData.multaDescumprimento === 'N') {
            nextStep = 59;
        }

        if (currentStepData.testemunhasNecessarias === 'S') {
            setTestemunhas(true);
            nextStep = 61;
        } else if (currentStepData.testemunhasNecessarias === 'N') {
            nextStep = 65;
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



    const geradorComodatoImovelC = (dados: any) => {
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
        doc.text("Contrato de Comodato de Imóvel Comercial", 105, posY, { align: "center" });
        posY += 15;

        // 1. Identificação das Partes
        addSection("1. Identificação das Partes", [
            "Comodante (Pessoa que empresta o imóvel)",
            dados.pessoaComodante === 'fisica' ? "Pessoa Física:" : "Pessoa Jurídica:",
            ...(dados.pessoaComodante === 'fisica' ? [
                `Nome completo: ${verificarValor(dados.nomeCompletoComodante)}`,
                `CPF: ${verificarValor(dados.cpfComodante)}`,
                `Endereço: ${verificarValor(dados.enderecoComodante)}`,
                `Telefone: ${verificarValor(dados.telefoneComodante)}`,
                `Documento de identificação: ${verificarValor(dados.documentoIdentificacaoComodante)}`,
                `Número do documento: ${verificarValor(dados.numeroDocComodante)}`,
                `Estado civil: ${verificarValor(dados.estadoCivilComodante)}`,
                `Profissão: ${verificarValor(dados.profissaoComodante)}`
            ] : [
                `Razão Social: ${verificarValor(dados.razaoSocial)}`,
                `CNPJ: ${verificarValor(dados.cnpj)}`,
                `Endereço: ${verificarValor(dados.endereco)}`,
                `Telefone: ${verificarValor(dados.telefone)}`,
                `Nome do Representante legal: ${verificarValor(dados.representanteNome)}`,
                `Cargo do representante: ${verificarValor(dados.cargoRepresentante)}`,
                `Documento de identificação do representante: ${verificarValor(dados.documentoIdentifica)}`,
                `Número do documento: ${verificarValor(dados.numeroDoc)}`
            ]),
            "Comodatário (Pessoa que recebe o imóvel emprestado)",
            dados.pessoaComodatario === 'fisica' ? "Pessoa Física:" : "Pessoa Jurídica:",
            ...(dados.pessoaComodatario === 'fisica' ? [
                `Nome completo: ${verificarValor(dados.nomeCompletoComodatario)}`,
                `CPF: ${verificarValor(dados.cpfComodatario)}`,
                `Endereço: ${verificarValor(dados.enderecoComodatario)}`,
                `Telefone: ${verificarValor(dados.telefoneComodatario)}`,
                `Documento de identificação: ${verificarValor(dados.documentoIdentificacaoComodatario)}`,
                `Estado civil: ${verificarValor(dados.estadoCivilComodatario)}`,
                `Nacionalidade: ${verificarValor(dados.nacionalidadeComodatario)}`,
                `Profissão: ${verificarValor(dados.profissaoComodatario)}`
            ] : [
                `Razão Social: ${verificarValor(dados.razaoSocialComodatario)}`,
                `CNPJ: ${verificarValor(dados.cnpjComodatario)}`,
                `Endereço: ${verificarValor(dados.enderecoComodatarioPj)}`,
                `Telefone: ${verificarValor(dados.telefoneComodatarioPj)}`,
                `Representante legal: ${verificarValor(dados.representanteNomeComodatario)}`,
                `Cargo do representante: ${verificarValor(dados.cargoRepresentanteComodatario)}`,
                `Documento de identificação do representante: ${verificarValor(dados.documentoIdentificaComodatario)}`
            ])
        ]);

        // 2. Objeto do Contrato
        addSection("2. Objeto do Contrato", [
            `Endereço completo do imóvel cedido: ${verificarValor(dados.enderecoImovel)}`,
            `Descrição detalhada do imóvel: ${verificarValor(dados.descricaoDetalhada)}`
        ]);

        // 3. Destinação do Imóvel
        addSection("3. Destinação do Imóvel", [
            `O imóvel poderá ser utilizado: ${dados.utilizacaoImovel === 'livre' ? 'Livremente' : `Apenas para a finalidade específica: ${verificarValor(dados.finalidade)}`}`,
            "O comodatário compromete-se a utilizar o imóvel de forma adequada, preservando sua integridade e manutenção."
        ]);

        // 4. Direitos e Deveres das Partes
        addSection("4. Direitos e Deveres das Partes", [
            "4.1 Direitos e Deveres do Comodante",
            "Direitos:",
            "- Receber o imóvel de volta ao término do contrato, nas condições acordadas.",
            "- Exigir o cumprimento das obrigações estabelecidas no contrato.",
            "- Fiscalizar o uso do imóvel pelo comodatário para garantir que esteja de acordo com as cláusulas contratuais.",
            "- Requerer a restituição antecipada do imóvel em caso de descumprimento das cláusulas acordadas.",
            "Deveres:",
            "- Entregar o imóvel em boas condições de uso, salvo estipulação diversa.",
            "- Fornecer ao comodatário a posse tranquila do imóvel durante o prazo do contrato.",
            "- Respeitar os direitos do comodatário, desde que este cumpra suas obrigações contratuais.",
            "4.2 Direitos e Deveres do Comodatário",
            "Direitos:",
            "- Utilizar o imóvel conforme acordado durante o período de vigência do contrato.",
            "- Permanecer no imóvel durante o prazo estipulado, salvo em caso de rescisão justificada.",
            "- Ser previamente comunicado sobre qualquer mudança nas condições do comodato.",
            "Deveres:",
            "- Utilizar o imóvel exclusivamente para os fins estabelecidos no contrato.",
            "- Preservar e manter o imóvel em boas condições, arcando com reparos e manutenções necessárias.",
            "- Não realizar modificações estruturais sem autorização prévia do comodante.",
            "- Não ceder, sublocar ou emprestar o imóvel sem a permissão expressa do comodante.",
            "- Restituir o imóvel ao término do contrato, nas mesmas condições em que o recebeu, salvo desgaste natural pelo uso.",
            "- Cumprir com todas as obrigações financeiras assumidas no contrato."
        ]);

        // 5. Taxas, Tributos e Despesas
        addSection("5. Taxas, Tributos e Despesas", [
            `O pagamento dos impostos, taxas e tributos incidentes sobre o imóvel será de responsabilidade de: ${dados.pagamentoImpostos === 'comodante' ? 'Comodante' : 'Comodatário'}`,
            `O imóvel possui taxa de condomínio? ${dados.imoveltxcondominio === 'S' ? `Sim (Quem será responsável pelo pagamento?): ${verificarValor(dados.responsavelPag)}` : 'Não'}`,
            `As despesas com manutenção, energia elétrica, água e outras contas serão arcadas por: ${dados.despesas === 'comodante' ? 'Comodante' : 'Comodatário'}`
        ]);

        // 6. Prazo e Vigência
        addSection("6. Prazo e Vigência", [
            `Data de início do comodato: ${verificarValor(dados.dataInicio)}`,
            `O contrato terá prazo determinado? ${dados.contratoPrazo === 'S' ? `Sim, por ${verificarValor(dados.quantosMeses)} meses.` : 'Não, sendo por prazo indeterminado.'}`,
            `O contrato poderá ser rescindido antes do prazo? ${dados.rescindido === 'S' ? `Sim, mediante aviso prévio de ${verificarValor(dados.avisoPrevio)} dias.` : 'Não'}`
        ]);

        // 7. Proibição de Sublocação e Cessão
        addSection("7. Proibição de Sublocação e Cessão", [
            `O comodatário poderá emprestar, ceder ou alugar o imóvel para terceiros? ${dados.emprestimo === 'S' ? 'Sim' : 'Não'}`
        ]);

        // 8. Benfeitorias e Obras
        addSection("8. Benfeitorias e Obras", [
            `O comodatário poderá realizar benfeitorias no imóvel? ${dados.benfeitorias === 'S' ? 'Sim, desde que previamente autorizadas pelo comodante.' : 'Não'}`,
            `Responsabilidades:`,
            `Necessárias: ${verificarValor(dados.responsaNecessarias)}`,
            `Úteis: ${verificarValor(dados.responsaUteis)}`,
            `Voluptuárias: ${verificarValor(dados.responsaVoluptuarias)}`
        ]);

        // 9. Rescisão e Penalidades
        addSection("9. Rescisão e Penalidades", [
            `O contrato poderá ser rescindido: ${dados.poderaRescidir === 'qualquer' ? 'A qualquer momento, por qualquer uma das partes, mediante aviso prévio de ${verificarValor(dados.avisoPrevioDias)} dias.' : 'Somente em casos de descumprimento contratual.'}`,
            `Em caso de descumprimento, haverá multa? ${dados.multaDescumprimento === 'S' ? `Sim, no valor de R$ ${verificarValor(dados.valorDescumprimento)}` : 'Não'}`,
            "O imóvel deverá ser devolvido nas mesmas condições em que foi recebido, salvo desgaste natural pelo uso."
        ]);

        // 10. Confidencialidade e Sigilo
        addSection("10. Confidencialidade e Sigilo", [
            "As partes comprometem-se a manter confidenciais quaisquer informações obtidas em razão deste contrato, salvo em casos exigidos por lei."
        ]);

        // 11. Foro e Resolução de Disputas
        addSection("11. Foro e Resolução de Disputas", [
            `Registro em Cartório: ${dados.registroCartorioTest === 'S' ? 'Sim' : 'Não'}`,
            `Data de Assinatura: ${verificarValor(dados.dataAssinatura)}`,
            `Necessidade de Testemunhas: ${dados.testemunhasNecessarias === 'S' ? 'Sim' : 'Não'}`,
            ...(dados.testemunhasNecessarias === 'S' ? [
                `1ª Testemunha: ${verificarValor(dados.nomeTest1)}`,
                `CPF: ${verificarValor(dados.cpfTest1)}`,
                `2ª Testemunha: ${verificarValor(dados.nomeTest2)}`,
                `CPF: ${verificarValor(dados.cpfTest2)}`
            ] : []),
            `Local de Assinatura: ${verificarValor(dados.local)}`,
            `Foro e Resolução de Disputas: O foro eleito para resolver quaisquer questões relativas a este contrato será o da Comarca de ${verificarValor(dados.foroResolucaoConflitos)}, Estado de ${verificarValor(dados.estado)}.`,
            "Em caso de litígio, as partes poderão optar pela mediação ou arbitragem antes de recorrer ao Poder Judiciário."
        ]);

        // 12. Assinaturas e Testemunhas
        addSection("12. Assinaturas e Testemunhas", [
            "Comodante:",
            `Nome: ${verificarValor(dados.pessoaComodante === 'fisica' ? dados.nomeCompletoComodante : dados.razaoSocial)}`,
            `CPF/CNPJ: ${verificarValor(dados.pessoaComodante === 'fisica' ? dados.cpfComodante : dados.cnpj)}`,
            "Assinatura: _________________________",
            "",
            "Comodatário:",
            `Nome: ${verificarValor(dados.pessoaComodatario === 'fisica' ? dados.nomeCompletoComodatario : dados.razaoSocialComodatario)}`,
            `CPF/CNPJ: ${verificarValor(dados.pessoaComodatario === 'fisica' ? dados.cpfComodatario : dados.cnpjComodatario)}`,
            "Assinatura: _________________________",
            ...(dados.testemunhasNecessarias === 'S' ? [
                "",
                "Testemunhas:",
                `1ª Testemunha: ${verificarValor(dados.nomeTest1)}`,
                `CPF: ${verificarValor(dados.cpfTest1)}`,
                "Assinatura: _________________________",
                "",
                `2ª Testemunha: ${verificarValor(dados.nomeTest2)}`,
                `CPF: ${verificarValor(dados.cpfTest2)}`,
                "Assinatura: _________________________"
            ] : [])
        ]);
        const pdfDataUri = doc.output("datauristring");
        return pdfDataUri;
    };

    useEffect(() => {
        geradorComodatoImovelC({ ...formData });
    }, [formData]);

    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title"> Contrato de Comodato de Imóvel Comercial </h1>
            </div>
            <div className="container">
                <div className="left-panel">
                    <div className="scrollable-card">
                        <div className="progress-bar">
                            <div
                                className="progress-bar-inner"
                                style={{ width: `${(step / 68) * 100}%` }}
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
                                                <label>Documento de Identificação do Representante</label>
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
                                                <label>Número do Documento</label>
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
                                        <label>Documento de identificação</label>
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
                                        <label>Número do documento</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="numeroDocComodatario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 26 && (
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

                            {step === 27 && (
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

                            {step === 28 && (
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
                                    {step === 29 && (
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

                                    {step === 30 && (
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

                                    {step === 31 && (
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

                                    {step === 32 && (
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

                                    {step === 33 && (
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

                                    {step === 34 && (
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

                                    {step === 35 && (
                                        <>
                                            <h2>Comodatário (Pessoa que recebe o imóvel emprestado)</h2>                                    <div>
                                                <label>Documento de Identificação do Representante</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="documentoIdentificaComodatario"
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
                                </>
                            )}


                            {step === 37 && (
                                <>
                                    <h2>Objeto do Contrato</h2>                                    <div>
                                        <label>Endereço completo do imóvel cedido</label>
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
                                        <label>Descrição detalhada do imóvel (incluindo dimensões, matrícula, número de IPTU e outras informações relevantes)</label>
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
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="responsavelPag"
                                                    onChange={handleChange}
                                                />
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
                                            <option value="comodante">Sim</option>
                                            <option value="comodatario">Não</option>
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
                                    <h2>Prazo e Vigência</h2>                                    <div>
                                        <label>O contrato poderá ser rescindido antes do prazo?</label>
                                        <select name='rescindido' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}



                            {rescindido && (
                                <>
                                    {step === 49 && (
                                        <>
                                            <h2>Prazo e Vigência</h2>                                    <div>
                                                <label>Mediante aviso previo de ______ dias</label>
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
                                </>
                            )}

                            {step === 50 && (
                                <>
                                    <h2>Proibição de Sublocação e Cessão</h2>                                    <div>
                                        <label>O comodatário poderá emprestar, ceder ou alugar o imóvel para terceiros?  </label>
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


                            {step === 51 && (
                                <>
                                    <h2>Benfeitorias e Obras</h2>                                    <div>
                                        <label>OO comodatário poderá realizar benfeitorias no imóvel?   </label>
                                        <select name='emprestimo' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim, desde que previamente autorizadas pelo comodante.</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 52 && (
                                <>
                                    <h2>Benfeitorias e Obras</h2>                                    <div>
                                        <label>Benfeitorias e Obras Necessárias</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="responsaNecessarias"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 53 && (
                                <>
                                    <h2>Benfeitorias e Obras</h2>                                    <div>
                                        <label>Benfeitorias e Obras Úteis</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="responsaUteis"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 54 && (
                                <>
                                    <h2>Benfeitorias e Obras</h2>                                    <div>
                                        <label>Benfeitorias e Obras Voluptuárias</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="responsaVoluptuarias"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 55 && (
                                <>
                                    <h2>Rescisão e Penalidades</h2>                                    <div>
                                        <label>O contrato poderá ser rescindido   </label>
                                        <select name='poderaRescidir' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="qualquer">A qualquer momento, por qualquer uma das partes.</option>
                                            <option value="somente">Somente em casos de descumprimento contratual</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {poderaRescidir && (
                                <>
                                    {step === 56 && (
                                        <>
                                            <h2>Benfeitorias e Obras</h2>                                    <div>
                                                <label>Mediante aviso prévio de ______ dias.</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="avisoPrevioDias"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}


                            {step === 57 && (
                                <>
                                    <h2>Rescisão e Penalidades</h2>                                    <div>
                                        <label>Em caso de descumprimento, haverá multa?    </label>
                                        <select name='multaDescumprimento' onChange={handleChange}>
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
                                    {step === 58 && (
                                        <>
                                            <h2>Rescisão e Penalidades</h2>                                    <div>
                                                <label>No valor de R$ _______________</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="valorDescumprimento"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}


                            {step === 59 && (
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

                            {step === 60 && (
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
                                    {step === 61 && (
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

                                    {step === 62 && (
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

                                    {step === 63 && (
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

                                    {step === 64 && (
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

                            {step === 65 && (
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

                            {step === 66 && (
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
                            {step === 67 && (
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

                            {step === 68 && (
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

                            {step === 69 && (
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
                    <button className='btnBaixarPdf' onClick={() => { geradorComodatoImovelCPAGO(formData) }}>
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