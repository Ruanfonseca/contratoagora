'use client'
import Pilha from '@/lib/pilha';
import { verificarValor } from '@/lib/utils';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';
import geradorManicurePago from '../util/pdf';



const manicureschema = z.object({
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
    /** */

    /**PRAZO */
    prazo: z.enum(['determinado', 'indeterminado']),

    // se for determinado
    duracao: z.string(),
    dataInicio: z.string(),
    dataFinal: z.string(),

    //se for indeterminado
    avisoPrevio: z.string(),
    /** */

    /**REMUNERAÇÃO E FORMA DE PAGAMENTO */
    pagamentoRealizado: z.enum(['servicoRealizado', 'horaTrabalhada', 'mesTrabalhado']),
    valorPagoServico: z.string(),
    modalidade: z.enum(['dinheiro', 'pix', 'cartao', 'transferBanc']),
    multaAtraso: z.string(),
    taxaAdicional: z.string(),
    horasAntecedencia: z.string(),
    taxaCancelamento: z.string(),
    /** */

    /**RESPONSABILIDADES DAS PARTES */
    horasReagendamento: z.string(),
    /** */

    /*MATERIAS E EQUIPAMENTOS*/
    fornecimento: z.enum(['Contratado', 'Contratante']),
    /**/

    /**CANCELAMENTO E MULTAS */
    multaCancelamento: z.string(),
    dataAntecedenciaCance: z.string(),
    /** */

    /**DISPOSIÇÕES GERAIS */
    foroResolucaoConflitos: z.string(), // Foro eleito para resolução de conflitos
    testemunhasNecessarias: z.enum(['S', 'N']), // Necessidade de testemunhas para assinatura do contrato
    estado: z.string(),
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
type FormData = z.infer<typeof manicureschema>;


export default function Manicure() {

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
    const [Parcelado, setParcelado] = useState(false);
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


    const geradorManicurePdf = (dados: any) => {
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
        doc.text("CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE MANICURE", 105, posY, { align: "center" });
        posY += 15;

        // 1. IDENTIFICAÇÃO DAS PARTES
        addSection("1. IDENTIFICAÇÃO DAS PARTES", [
            "Código Civil (CC): Art. 104 – Para a validade do negócio jurídico, é necessário agente capaz, objeto lícito e forma prescrita ou não defesa em lei.",
            "Art. 107 – A validade da declaração de vontade não dependerá de forma especial, salvo quando a lei expressamente exigir.\n",
            "Contratante:",
            `Nome/Razão Social: ${verificarValor(dados.contratante_nome)}`,
            `Estado Civil (se pessoa física): ${verificarValor(dados.contratante_estado_civil)}`,
            `Nacionalidade: ${verificarValor(dados.contratante_nacionalidade)}`,
            `Profissão: ${verificarValor(dados.contratante_profissao)}`,
            `Documento de Identificação (RG/CPF ou CNPJ): ${verificarValor(dados.contratante_documento)}`,
            `Endereço Completo: ${verificarValor(dados.contratante_endereco)}`,
            `Telefone/Contato: ${verificarValor(dados.contratante_telefone)}`,
            "",
            "Contratado (Manicure):",
            `Nome/Razão Social: ${verificarValor(dados.contratado_nome)}`,
            `Estado Civil (se pessoa física): ${verificarValor(dados.contratado_estado_civil)}`,
            `Nacionalidade: ${verificarValor(dados.contratado_nacionalidade)}`,
            `Profissão: Manicure`,
            `Documento de Identificação (RG/CPF ou CNPJ): ${verificarValor(dados.contratado_documento)}`,
            `Endereço Completo: ${verificarValor(dados.contratado_endereco)}`,
            `Telefone/Contato: ${verificarValor(dados.contratado_telefone)}`,
        ]);

        // 2. OBJETO DO CONTRATO
        addSection("2. OBJETO DO CONTRATO", [
            "Código Civil (CC): Art. 593 – Considera-se prestação de serviço o contrato em que uma das partes se obriga a realizar um serviço mediante retribuição.",
            "Art. 594 – Toda espécie de serviço ou trabalho lícito pode ser contratada.\n",
            "O presente contrato tem por objeto a prestação de serviços de manicure pelo(a) contratado(a) ao(à) contratante, incluindo, mas não se limitando a:",
            "Corte e limpeza das unhas;",
            "Esmaltação;",
            "Aplicação de unhas postiças;",
            "Decoração de unhas;",
            "Manutenção de alongamentos;",
            "Outros serviços acordados entre as partes.",
        ]);

        // 3. PRAZO DO CONTRATO
        addSection("3. PRAZO DO CONTRATO", [
            "Código Civil (CC):Art. 598 – O contrato de prestação de serviço não pode ultrapassar quatro anos, salvo disposição em contrário.",
            "Art. 599 – Se o contrato for por prazo determinado, extinguir-se-á com o término do período acordado.",
            "Art. 600 – Nos contratos por prazo indeterminado, qualquer das partes pode resilir o contrato, mediante aviso prévio.\n",
            "O presente contrato terá:",
            dados.prazo === 'determinado'
                ? `(X) Prazo determinado, com duração de ${verificarValor(dados.duracao)} meses, iniciando-se em ${verificarValor(dados.dataInicio)} e encerrando-se em ${verificarValor(dados.dataFinal)}.`
                : `(X) Prazo indeterminado, podendo ser rescindido por qualquer uma das partes mediante aviso prévio de ${verificarValor(dados.avisoPrevio)} dias.`,
        ]);

        // 4. REMUNERAÇÃO E FORMA DE PAGAMENTO
        addSection("4. REMUNERAÇÃO E FORMA DE PAGAMENTO", [
            "Código Civil (CC): Art. 596 – A retribuição pelo serviço prestado será ajustada pelas partes e, na falta de ajuste, regulada pelos usos do local.",
            "Art. 397 – O inadimplemento da obrigação pelo devedor sujeita-o à mora, cabendo-lhe pagar os encargos decorrentes do atraso.\n",
            `O pagamento será realizado com base em: (${dados.pagamentoRealizado === 'servicoRealizado' ? 'X' : '_'}) Serviço realizado (${dados.pagamentoRealizado === 'horaTrabalhada' ? 'X' : '_'}) Hora trabalhada (${dados.pagamentoRealizado === 'mesTrabalhado' ? 'X' : '_'}) Mês trabalhado.`,
            `O valor a ser pago pelos serviços será de R$ ${verificarValor(dados.valorPagoServico)}.`,
            `O pagamento será efetuado por (${dados.modalidade === 'dinheiro' ? 'X' : '_'}) Dinheiro (${dados.modalidade === 'pix' ? 'X' : '_'}) Pix (${dados.modalidade === 'cartao' ? 'X' : '_'}) Cartão (${dados.modalidade === 'transferBanc' ? 'X' : '_'}) Transferência bancária.`,
            `Em caso de atraso no pagamento, será aplicada multa de ${verificarValor(dados.multaAtraso)}% sobre o valor devido.`,
            `Caso haja necessidade de deslocamento do(a) contratado(a), poderá ser cobrada uma taxa adicional de R$ ${verificarValor(dados.taxaAdicional)}.`,
            `Cancelamentos realizados com menos de ${verificarValor(dados.horasAntecedencia)} horas de antecedência estarão sujeitos a uma taxa de cancelamento de R$ ${verificarValor(dados.taxaCancelamento)}.`,
        ]);

        // 5. RESPONSABILIDADES DAS PARTES
        addSection("5. RESPONSABILIDADES DAS PARTES", [
            "Código Civil (CC): Art. 422 – Os contratantes são obrigados a guardar, assim na conclusão do contrato como em sua execução, os princípios da probidade e boa-fé.",
            "Art. 927 – Aquele que, por ato ilícito, causar dano a outrem, fica obrigado a repará-lo.\n",
            "Do(a) contratado(a):",
            "Utilizar produtos de qualidade e manter os materiais devidamente higienizados.",
            "Cumprir os horários e datas estabelecidas para a prestação dos serviços.",
            `Informar previamente sobre eventuais reagendamentos ou impossibilidades de atendimento com antecedência de ${verificarValor(dados.horasReagendamento)} horas.`,
            "Garantir a esterilização adequada de materiais reutilizáveis.",
            "",
            "Do(a) contratante:",
            "Comparecer ao local e no horário agendado para a realização do serviço.",
            `Informar com antecedência de pelo menos ${verificarValor(dados.horasReagendamento)} horas caso deseje reagendar ou cancelar o serviço.`,
            "Arcar com os custos dos serviços conforme estipulado neste contrato.",
            "Zelar pelos cuidados recomendados após a prestação do serviço.",
        ]);

        // 6. CANCELAMENTO E MULTAS
        addSection("6. CANCELAMENTO E MULTAS", [
            "Código Civil (CC): Art. 408 – A cláusula penal estipulada no contrato serve para garantir o cumprimento da obrigação e pode ser exigida no caso de inadimplência.",
            "Art. 416 – Para exigir a multa, não se faz necessária a prova do prejuízo.\n",
            `Caso uma das partes deseje rescindir este contrato antes do prazo acordado, deverá comunicar a outra parte com antecedência de ${verificarValor(dados.dataAntecedenciaCance)} dias.`,
            `Em caso de descumprimento de qualquer cláusula, a parte infratora poderá ser penalizada com multa de R$ ${verificarValor(dados.multaCancelamento)}.`,
        ]);


        addSection("7. MATERIAIS E EQUIPAMENTOS", [
            `Os materiais e equipamentos necessários para a execução dos serviços serão fornecidos por
    (${dados.fornecimento === 'Contratado' ? 'X' : '_'}) Contratado (${dados.fornecimento === 'Contratante' ? 'X' : '_'}) Contratante.
    Caso o contratante forneça os materiais, este se responsabiliza pela qualidade e adequação dos mesmos.`
        ]);

        // 7. FORO E RESOLUÇÃO DE CONFLITOS
        addSection("8. FORO E RESOLUÇÃO DE CONFLITOS", [
            "Código Civil (CC): Art. 75, Inciso IV – Trata da representação judicial de pessoas físicas e jurídicas.",
            "Art. 112 – Quando houver cláusula de eleição de foro, prevalecerá o foro eleito, salvo nos casos legais.\n",
            `As partes elegem o foro da Comarca de ${verificarValor(dados.foroResolucaoConflitos)}, para dirimir quaisquer dúvidas ou controvérsias oriundas deste contrato.`,
        ]);

        // 8. DISPOSIÇÕES FINAIS
        addSection("9. DISPOSIÇÕES FINAIS", [
            "Constituição Federal (CF): Art. 5º, Inciso XXXVI – A lei não prejudicará o direito adquirido, o ato jurídico perfeito e a coisa julgada.",
            "Art. 170 – A ordem econômica tem por base a valorização do trabalho humano e a livre iniciativa.\n",
            `Este contrato passa a vigorar a partir da data de assinatura pelas partes: ${verificarValor(dados.dataAssinatura)}.`,
            "Qualquer alteração ou acréscimo ao presente contrato deverá ser feito por escrito e assinado por ambas as partes.",
            "O presente contrato obriga não apenas as partes contratantes, mas também seus herdeiros e sucessores.",
            "",
            "Local e Data: ____________________, _____ de ______________ de ______.",
            "",
            "Assinaturas:",
            "Contratante: __________________________________________",
            "Contratado(a): ________________________________________",
            "",
            dados.testemunhasNecessarias === 'S'
                ? `Testemunhas: 
               Nome: ${verificarValor(dados.nomeTest1)} CPF: ${verificarValor(dados.cpfTest1)}
               Nome: ${verificarValor(dados.nomeTest2)} CPF: ${verificarValor(dados.cpfTest2)}`
                : "Testemunhas: Não necessárias.",
        ]);


        const pdfDataUri = doc.output("datauristring");
        setPdfDataUrl(pdfDataUri);
    };


    useEffect(() => {
        geradorManicurePdf({ ...formData });
    }, [formData]);


    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title">Contrato de Prestação de Serviços de Manicure </h1>
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
                                    <div>
                                        <h2>Prazo do Contrato </h2>
                                        <label>Duração do contrato: (Especificar se será por prazo determinado ou indeterminado)</label>
                                        <select name='prazo' onChange={handleChange}>
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
                                    {step === 18 && (
                                        <>
                                            <h2>Prazo do Contrato</h2>                                    <div>
                                                <label>Prazo determinado, com duração de ___ meses</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="duracao"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 19 && (
                                        <>
                                            <h2>Prazo do Contrato</h2>                                    <div>
                                                <label>iniciando-se em //____</label>
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

                                    {step === 20 && (
                                        <>
                                            <h2>Prazo do Contrato</h2>                                    <div>
                                                <label>e encerrando-se em //____</label>
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

                            {indeterminado && (
                                <>
                                    {step === 21 && (
                                        <>
                                            <h2>Prazo do Contrato</h2>                                    <div>
                                                <label>Prazo indeterminado, podendo ser rescindido por qualquer uma das partes mediante aviso prévio de ___ dias.</label>
                                                <input
                                                    type='date'
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

                            {step === 22 && (
                                <>
                                    <h2>Remuneração e Forma de Pagamento</h2>                                    <div>
                                        <label>Prazo indeterminado, podendo ser rescindido por qualquer uma das partes mediante aviso prévio de ___ dias.</label>
                                        <select name='pagamentoRealizado' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="servicoRealizado">Serviço realizado</option>
                                            <option value="horaTrabalhada">Hora trabalhada</option>
                                            <option value="mesTrabalhado">Mês trabalhado</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 23 && (
                                <>
                                    <h2>Remuneração e Forma de Pagamento</h2>                                    <div>
                                        <label>O valor a ser pago pelos serviços será de R$ ________.</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="valorPagoServico"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 24 && (
                                <>
                                    <h2>Remuneração e Forma de Pagamento</h2>                                    <div>
                                        <label>O pagamento será efetuado por</label>
                                        <select name='modalidade' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="dinheiro">Dinheiro </option>
                                            <option value="pix">Pix </option>
                                            <option value="cartao">Cartão </option>
                                            <option value="transferBanc">Transferência bancária</option>

                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 25 && (
                                <>
                                    <h2>Remuneração e Forma de Pagamento</h2>                                    <div>
                                        <label>Em caso de atraso no pagamento, será aplicada multa de ___% sobre o valor devido. </label>
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

                            {step === 26 && (
                                <>
                                    <h2>Remuneração e Forma de Pagamento</h2>                                    <div>
                                        <label>Em caso de atraso no pagamento, será aplicada multa de ___% sobre o valor devido. </label>
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
                                    <h2>Remuneração e Forma de Pagamento</h2>                                    <div>
                                        <label>Caso haja necessidade de deslocamento do(a) contratado(a), poderá ser cobrada uma taxa adicional de R$ _______.  </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="taxaAdicional"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 28 && (
                                <>
                                    <h2>Remuneração e Forma de Pagamento</h2>                                    <div>
                                        <label>Cancelamentos realizados com menos de ___ horas de antecedência </label>
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

                            {step === 29 && (
                                <>
                                    <h2>Remuneração e Forma de Pagamento</h2>                                    <div>
                                        <label>Estarão sujeitos a uma taxa de cancelamento de R$ _______. </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="taxaCancelamento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 30 && (
                                <>
                                    <div>
                                        <h2>Responsabilidade das Partes</h2>
                                        <i>Do(a) contratante:</i>
                                        <label>Informar com antecedência de pelo menos ___ horas caso deseje reagendar ou cancelar o serviço.  </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="horasReagendamento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 31 && (
                                <>
                                    <h2>Materias e Equipamentos</h2>                                    <div>
                                        <label>Os materiais e equipamentos necessários para a execução dos serviços serão fornecidos por (__) Contratado (__) Contratante. </label>
                                        <select name='fornecimento' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="Contratado">Contratado</option>
                                            <option value="Contratante">Contratante</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 32 && (
                                <>
                                    <div>
                                        <h2>Cancelamento e Multas</h2>
                                        <label>Caso uma das partes deseje rescindir este contrato antes do prazo acordado, deverá comunicar a outra parte com antecedência de ___ dias.</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="multaCancelamento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 33 && (
                                <>
                                    <div>
                                        <h2>Cancelamento e Multas</h2>
                                        <label>Em caso de descumprimento de qualquer cláusula, a parte infratora poderá ser penalizada com multa de R$ ______.</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="dataAntecedenciaCance"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 34 && (
                                <>
                                    <h2>Disposições Gerais</h2>
                                    <div>
                                        <label>As partes elegem o foro da Comarca de __________/__, para dirimir quaisquer dúvidas ou controvérsias oriundas deste contrato. </label>
                                        <input
                                            type='text'
                                            placeholder='Cidade'
                                            name="foroResolucaoConflitos"
                                            onChange={handleChange}
                                        />
                                        <input
                                            type='text'
                                            placeholder='Estado'
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
                                    {step === 36 && (
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

                                    {step === 37 && (
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

                                    {step === 38 && (
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

                                    {step === 39 && (
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

                            {step === 40 && (
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

                            {step === 41 && (
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
                            {step === 42 && (
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
                    <button className='btnBaixarPdf' onClick={() => { geradorManicurePago(formData) }}>
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