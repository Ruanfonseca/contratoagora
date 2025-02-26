'use client'
import Pilha from '@/lib/pilha';
import { verificarValor } from '@/lib/utils';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';
import geradorFisioterapiaPdfPago from '../util/pdf';




const fisioterapeutaschema = z.object({
    /**CONTRATANTE */
    nomeContratante: z.string(),
    sexoContratante: z.enum(['F', 'M']),
    estadoCivilContratante: z.string(),
    nacionalidadeContratante: z.string(),
    documentoContratante: z.string(),
    orgaoContratante: z.string(),
    cpfContratante: z.string(),
    enderecoContratante: z.string(),
    /** */

    /**FISIOTERAPEUTA */
    nomeFisioterapeuta: z.string(),
    sexoFisioterapeuta: z.enum(['F', 'M']),
    estadoCivilFisioterapeuta: z.string(),
    nacionalidadeFisioterapeuta: z.string(),
    documentoFisioterapeuta: z.string(),
    orgaoFisioterapeuta: z.string(),
    cpfFisioterapeuta: z.string(),
    enderecoFisioterapeuta: z.string(),
    crefito: z.string(),
    /** */

    /**OBJETO */
    descricao: z.string(),
    /** */

    /**PRAZO */
    prazo: z.enum(['determinado', 'indeterminado']),

    //se for determinado
    mesesoudias: z.string(),
    dataInicio: z.string(),
    dataFinal: z.string(),
    /** */


    /**LOCAL DE ATENDIMENTO */
    localAtendimento: z.string(),
    /** */

    /**RETRIBUIÇÃO */
    taxaAvaliacao: z.string(),
    destinacaoValor: z.string(),

    frequencia: z.enum(['mensalmente', 'sessao']),

    //se for por mês
    valorMensal: z.string(),

    //se for por sessão
    valorSessao: z.string(),


    diaPagamento: z.string(),
    porcentagemMulta: z.string(),
    /** */


    /**ATENDIMENTO */
    duracaoAtendimento: z.string(),
    frequenciaAtentimento: z.string(),
    horasAntecedencia: z.string(),
    porcentoSessao: z.string(),
    /** */

    /**RESCISÃO */
    avisoPrevio: z.string(),
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

type FormData = z.infer<typeof fisioterapeutaschema>;


export default function Fisioterapia() {
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
    const [determinado, setDeterminado] = useState(false);
    const [mensalmente, setMensalmente] = useState(false);
    const [sessao, setSessao] = useState(false);
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


        if (currentStepData.prazo === 'determinado') {
            setDeterminado(true);
            nextStep = 19;
        } else if (currentStepData.prazo === 'indeterminado') {
            nextStep = 22;
        }


        if (currentStepData.frequencia === 'mensalmente') {
            setMensalmente(true);
            nextStep = 26;
        } else if (currentStepData.frequencia === 'sessao') {
            setSessao(true);
            nextStep = 27;
        }

        if (nextStep === 26) {
            nextStep = 28;
        }


        if (currentStepData.testemunhasNecessarias === 'S') {
            setTestemunhas(true);
            nextStep = 39;
        } else if (currentStepData.testemunhasNecessarias === 'N') {
            nextStep = 43;
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

    const geradorFisioterapiaPdf = (dados: any) => {
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
        doc.text("CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE FISIOTERAPEUTA", 105, posY, { align: "center" });
        posY += 15;

        // Seção do Contratante
        addSection("Contratante", [
            "Art. 593: A prestação de serviço, que não estiver sujeita às leis trabalhistas ou a legislação especial, reger - se - á pelas disposições deste Capítulo.",
            "Art. 594: Toda espécie de serviço ou trabalho lícito, material ou imaterial, pode ser contratada mediante retribuição.",
            `Nome completo: ${verificarValor(dados.nomeContratante)}`,
            `Sexo: ${verificarValor(dados.sexoContratante)}`,
            `Estado civil: ${verificarValor(dados.estadoCivilContratante)}`,
            `Nacionalidade: ${verificarValor(dados.nacionalidadeContratante)}`,
            `Documento de identificação (RG ou CNH): ${verificarValor(dados.documentoContratante)}`,
            `Órgão expedidor: ${verificarValor(dados.orgaoContratante)}`,
            `CPF: ${verificarValor(dados.cpfContratante)}`,
            `Endereço completo: ${verificarValor(dados.enderecoContratante)}`
        ]);

        // Seção do Fisioterapeuta
        addSection("Fisioterapeuta", [
            `Nome completo: ${verificarValor(dados.nomeFisioterapeuta)}`,
            `Sexo: ${verificarValor(dados.sexoFisioterapeuta)}`,
            `Estado civil: ${verificarValor(dados.estadoCivilFisioterapeuta)}`,
            `Nacionalidade: ${verificarValor(dados.nacionalidadeFisioterapeuta)}`,
            `Documento de identificação (RG ou CNH): ${verificarValor(dados.documentoFisioterapeuta)}`,
            `Órgão expedidor: ${verificarValor(dados.orgaoFisioterapeuta)}`,
            `CPF: ${verificarValor(dados.cpfFisioterapeuta)}`,
            `Endereço completo: ${verificarValor(dados.enderecoFisioterapeuta)}`,
            `CREFITO: ${verificarValor(dados.crefito)}`
        ]);

        // Seção do Objeto
        addSection("1. DO OBJETO", [
            `O presente contrato tem por objeto a prestação de serviços de fisioterapia pelo profissional acima identificado ao contratante. Os serviços incluem, mas não se limitam a: ${verificarValor(dados.descricao)}.`
        ]);

        // Seção do Prazo
        addSection("2. DO PRAZO", [
            `A prestação dos serviços terá a seguinte duração:`,
            dados.prazo === 'determinado'
                ? `(X) Prazo determinado: ${verificarValor(dados.mesesoudias)}, iniciando em ${verificarValor(dados.dataInicio)} e finalizando em ${verificarValor(dados.dataFinal)}.`
                : `(X) Prazo indeterminado.`
        ]);

        // Seção do Local de Atendimento
        addSection("3. DO LOCAL DE ATENDIMENTO", [
            `Os atendimentos serão realizados no seguinte local: ${verificarValor(dados.localAtendimento)}.`
        ]);

        // Seção da Retribuição
        addSection("4. DA RETRIBUIÇÃO", [
            `(__) Será cobrada taxa inicial para avaliação: R$ ${verificarValor(dados.taxaAvaliacao)}.`,
            `O valor cobrado antecipadamente se destina a: ${verificarValor(dados.destinacaoValor)}.`,
            `A frequência do pagamento pelos serviços será:`,
            dados.frequencia === 'mensalmente'
                ? `(X) Mensalmente: R$ ${verificarValor(dados.valorMensal)}.`
                : `(X) Por sessão: R$ ${verificarValor(dados.valorSessao)}.`,
            `O pagamento deverá ser feito até o dia ${verificarValor(dados.diaPagamento)} de cada mês.`,
            `Caso haja atraso no pagamento, será cobrada multa de ${verificarValor(dados.porcentagemMulta)}% sobre o valor devido.`
        ]);

        // Seção do Atendimento
        addSection("5. DO ATENDIMENTO", [
            `A duração de cada atendimento será de ${verificarValor(dados.duracaoAtendimento)} minutos.`,
            `A frequência dos atendimentos será de ${verificarValor(dados.frequenciaAtentimento)} vezes por semana/mês.`,
            `Para cancelamento ou reagendamento de sessões, o contratante deverá avisar com pelo menos ${verificarValor(dados.horasAntecedencia)} horas de antecedência. Caso contrário, será cobrada uma taxa de ${verificarValor(dados.porcentoSessao)}% do valor da sessão.`
        ]);

        // Seção da Rescisão
        addSection("6. DA RESCISÃO", [
            `O contrato poderá ser rescindido por qualquer das partes mediante aviso prévio de ${verificarValor(dados.avisoPrevio)} dias.`,
            `Em caso de descumprimento das condições aqui estabelecidas, a parte infratora ficará sujeita a uma multa de R$ ${verificarValor(dados.multaDescumprimento)}.`
        ]);


        addSection("7.Das Disposições Legais", [
            `Este contrato está fundamentado nas normas da Constituição Federal e do Código Civil Brasileiro, garantindo direitos e deveres às partes envolvidas.

                8.1. Constituição Federal (CF/1988)
                Direito à Saúde

                Art. 196: "A saúde é direito de todos e dever do Estado, garantido mediante políticas sociais e econômicas que visem à redução do risco de doença e de outros agravos e ao acesso universal e igualitário às ações e serviços para sua promoção, proteção e recuperação."
                Liberdade Profissional

                Art. 5º, XIII: "É livre o exercício de qualquer trabalho, ofício ou profissão, atendidas as qualificações profissionais que a lei estabelecer."
                Direitos do Consumidor

                Art. 5º, XXXII: "O Estado promoverá, na forma da lei, a defesa do consumidor."
                Direito à Livre Iniciativa

                Art. 170, Parágrafo único: "É assegurado a todos o livre exercício de qualquer atividade econômica, independentemente de autorização de órgãos públicos, salvo nos casos previstos em lei."
                8.2. Código Civil Brasileiro (CC/2002)
                Contrato de Prestação de Serviços

                Art. 593: "A prestação de serviço, que não estiver sujeita às leis trabalhistas ou a legislação especial, reger-se-á pelas disposições deste Capítulo."
                Art. 594: "Toda espécie de serviço ou trabalho lícito, material ou imaterial, pode ser contratada mediante retribuição."
                Obrigação das Partes

                Art. 422: "Os contratantes são obrigados a guardar, assim na conclusão do contrato, como em sua execução, os princípios de probidade e boa-fé."
                Responsabilidade Civil

                Art. 186: "Aquele que, por ação ou omissão voluntária, negligência ou imprudência, violar direito e causar dano a outrem, ainda que exclusivamente moral, comete ato ilícito."
                Art. 927: "Aquele que, por ato ilícito, causar dano a outrem, fica obrigado a repará-lo."
                Rescisão Contratual

                Art. 473: "A resilição unilateral, nos casos em que a lei expressamente o permita, opera mediante denúncia notificada à outra parte."
                Art. 475: "A parte lesada pelo inadimplemento pode pedir a resolução do contrato, se não preferir exigir-lhe o cumprimento, cabendo-lhe, em qualquer dos casos, indenização por perdas e danos."
                Multas e Penalidades Contratuais

                Art. 408: "Incorre de pleno direito o devedor na cláusula penal, desde que inadimplente a obrigação."
                Art. 409: "A cláusula penal estipulada conjuntamente com a obrigação tem a função de garantir o seu cumprimento e, cumulativamente, pode ser exigida com o desempenho da obrigação principal, se assim for convencionado."`,

        ]);
        // Seção do Foro
        addSection("8. DO FORO", [
            `Fica eleito o foro da Comarca de ${verificarValor(dados.foroResolucaoConflitos)}, Estado de ${verificarValor(dados.estado)}, para dirimir quaisquer dúvidas ou conflitos oriundos deste contrato.`
        ]);

        // Seção de Assinaturas
        addSection("E, por estarem assim justos e contratados, assinam o presente instrumento em duas vias de igual teor e forma.", [
            `Data de assinatura: ${verificarValor(dados.dataAssinatura)}`,
            `Contratante:`,
            `Nome: ${verificarValor(dados.nomeContratante)}`,
            `Assinatura: ____________________________`,
            `Fisioterapeuta:`,
            `Nome: ${verificarValor(dados.nomeFisioterapeuta)}`,
            `Assinatura: ____________________________`
        ]);

        // Seção de Testemunhas (se necessário)
        if (dados.testemunhasNecessarias === 'S') {
            addSection("Testemunhas:", [
                `Nome: ${verificarValor(dados.nomeTest1)}`,
                `CPF: ${verificarValor(dados.cpfTest1)}`,
                `Assinatura: ____________________________`,
                `Nome: ${verificarValor(dados.nomeTest2)}`,
                `CPF: ${verificarValor(dados.cpfTest2)}`,
                `Assinatura: ____________________________`
            ]);
        }

        // Seção de Registro em Cartório (se necessário)
        if (dados.registroCartorioTest === 'S') {
            addSection("Registro em Cartório:", [
                `O presente contrato será registrado em cartório no local de ${verificarValor(dados.local)}.`
            ]);
        }
        const pdfDataUri = doc.output("datauristring");
        setPdfDataUrl(pdfDataUri);
    };


    useEffect(() => {
        geradorFisioterapiaPdf({ ...formData });
    }, [formData]);
    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title"> Contrato de Prestação de Serviços de Fisioterapeuta </h1>
            </div>
            <div className="container">
                <div className="left-panel">
                    <div className="scrollable-card">
                        <div className="progress-bar">
                            <div
                                className="progress-bar-inner"
                                style={{ width: `${(step / 45) * 100}%` }}
                            ></div>
                        </div>
                        <div className="form-wizard">
                            {step === 1 && (
                                <>
                                    <h2>Contratante </h2>                                    <div>
                                        <label>Nome completo</label>
                                        <input
                                            type='text'
                                            placeholder='Nome do Aluno'
                                            name="nomeContratante"
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
                                        <select name='sexoContratante' onChange={handleChange}>
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
                                            name="estadoCivilContratante"
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
                                            name="nacionalidadeContratante"
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
                                        <label>Documento de identificação (RG ou CNH)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="documentoContratante"
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
                                        <label>Órgão expedidor</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="orgaoContratante"
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
                                        <label>CPF</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="cpfContratante"
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
                                        <label>Endereço completo</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="enderecoContratante"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 9 && (
                                <>
                                    <h2>Fisioterapeuta </h2>                                    <div>
                                        <label>Nome completo</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="nomeFisioterapeuta"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 10 && (
                                <>
                                    <h2>Fisioterapeuta </h2>                                    <div>
                                        <label>Sexo</label>
                                        <select name='sexoFisioterapeuta' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="F">Feminino</option>
                                            <option value="M">Masculino</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 11 && (
                                <>
                                    <h2>Fisioterapeuta </h2>                                    <div>
                                        <label>Estado Civil</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="estadoCivilFisioterapeuta"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 12 && (
                                <>
                                    <h2>Fisioterapeuta </h2>                                    <div>
                                        <label>Nacionalidade</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="nacionalidadeFisioterapeuta"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 13 && (
                                <>
                                    <h2>Fisioterapeuta </h2>                                    <div>
                                        <label>Documento de identificação (RG ou CNH)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="documentoFisioterapeuta"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 14 && (
                                <>
                                    <h2>Fisioterapeuta </h2>                                    <div>
                                        <label>Órgão expedidor</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="orgaoFisioterapeuta"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 15 && (
                                <>
                                    <h2>Fisioterapeuta </h2>                                    <div>
                                        <label>CPF</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="cpfFisioterapeuta"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}



                            {step === 16 && (
                                <>
                                    <h2>Fisioterapeuta </h2>                                    <div>
                                        <label>Endereço completo</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="enderecoFisioterapeuta"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 17 && (
                                <>
                                    <h2>Fisioterapeuta </h2>                                    <div>
                                        <label>Crefito(Conselho Regional de Fisioterapia e Terapia Ocupacional)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="crefito"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 18 && (
                                <>
                                    <h2>Objeto </h2>                                    <div>
                                        <label> O presente contrato tem por objeto a prestação de serviços de fisioterapia pelo profissional acima identificado ao contratante. Os serviços incluem, mas não se limitam a</label>
                                        <select name='prazo' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="determinado">Determinado</option>
                                            <option value="indeterminado">Indeterminado</option>
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
                                            <h2>Prazo </h2>                                    <div>
                                                <label> Prazo determinado: ______ meses/dias</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="mesesoudias"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 20 && (
                                        <>
                                            <h2>Prazo </h2>                                    <div>
                                                <label> iniciando em //____</label>
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

                                    {step === 21 && (
                                        <>
                                            <h2>Prazo </h2>                                    <div>
                                                <label> finalizando em //____</label>
                                                <input
                                                    type='date'
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

                            {step === 22 && (
                                <>
                                    <h2>Local de Atendimento </h2>                                    <div>
                                        <label> Os atendimentos serão realizados no seguinte local</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="localAtendimento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 23 && (
                                <>
                                    <h2>Retribuição </h2>                                    <div>
                                        <label>Será cobrada taxa inicial para avaliação</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="taxaAvaliacao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 24 && (
                                <>
                                    <h2>Retribuição </h2>                                    <div>
                                        <label>O valor cobrado antecipadamente se destina a</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="destinacaoValor"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 25 && (
                                <>
                                    <h2>Retribuição </h2>                                    <div>
                                        <label> A frequência do pagamento pelos serviços será</label>
                                        <select name='frequencia' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="mensalmente">Mensalmente</option>
                                            <option value="sessao">Por sessão</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {mensalmente && (
                                <>
                                    {step === 26 && (
                                        <>
                                            <h2>Retribuição </h2>                                    <div>
                                                <label>O valor da Mensalidade</label>
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
                                </>
                            )}


                            {sessao && (
                                <>
                                    {step === 27 && (
                                        <>
                                            <h2>Retribuição </h2>                                    <div>
                                                <label>O valor da Sessão</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="valorSessao"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 28 && (
                                <>
                                    <h2>Retribuição </h2>                                    <div>
                                        <label>O pagamento deverá ser feito até o dia ____ de cada mês</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="diaPagamento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 29 && (
                                <>
                                    <h2>Retribuição </h2>                                    <div>
                                        <label>Caso haja atraso no pagamento, será cobrada multa de ____% sobre o valor devido</label>
                                        <input
                                            type='text'
                                            placeholder='ex.: 1%,2%'
                                            name="porcentagemMulta"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 30 && (
                                <>
                                    <h2>Atendimento </h2>                                    <div>
                                        <label>A duração de cada atendimento será de ______ minutos</label>
                                        <input
                                            type='text'
                                            placeholder='ex.: 3,2,6...'
                                            name="duracaoAtendimento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 31 && (
                                <>
                                    <h2>Atendimento </h2>                                    <div>
                                        <label>A frequência dos atendimentos será de ______ vezes por semana/mês</label>
                                        <input
                                            type='text'
                                            placeholder='ex.: 3,2,6...'
                                            name="frequenciaAtentimento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 32 && (
                                <>
                                    <h2>Atendimento </h2>                                    <div>
                                        <label>Caso contrário, será cobrada uma taxa de ____% do valor da sessão </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="porcentoSessao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 33 && (
                                <>
                                    <h2>Atendimento </h2>                                    <div>
                                        <label>Para cancelamento ou reagendamento de sessões, o contratante deverá avisar com pelo menos ____ horas de antecedência</label>
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

                            {step === 34 && (
                                <>
                                    <h2>Rescisão </h2>                                    <div>
                                        <label>O contrato poderá ser rescindido por qualquer das partes mediante aviso prévio de ____ dias</label>
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

                            {step === 35 && (
                                <>
                                    <h2>Rescisão </h2>                                    <div>
                                        <label> Em caso de descumprimento das condições aqui estabelecidas, a parte infratora ficará sujeita a uma multa de R$ _______</label>
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

                            {step === 36 && (
                                <>
                                    <h2>Disposições Gerais</h2>
                                    <div>
                                        <label>Cidade do Foro eleito para resolução de conflitos</label>
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


                            {step === 37 && (
                                <>
                                    <h2>Disposições Gerais</h2>
                                    <div>
                                        <label>No estado que tem por nome </label>
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

                            {step === 38 && (
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
                                    {step === 39 && (
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

                                    {step === 40 && (
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

                                    {step === 41 && (
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

                                    {step === 42 && (
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

                            {step === 43 && (
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

                            {step === 44 && (
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
                            {step === 45 && (
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

                            {step === 46 && (
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
                    <button className='btnBaixarPdf' onClick={() => { geradorFisioterapiaPdfPago(formData) }}>
                        Baixar PDF
                    </button>
                ) : (
                    <button className='btnBaixarPdf' onClick={handleVerifyPayment}>
                        Verificar Pagamento
                    </button>
                )}
            </div>
        </>
    )
}