'use client'
import Pilha from '@/lib/pilha';
import { verificarValor } from '@/lib/utils';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';
import geradorPossePago from '../util/pdf';


const cessaodeposseschema = z.object({
    Cedente: z.enum(['pf', 'pj']).default('pf'),

    /**
    * Dados Cedente pj
    */
    razaoSocial: z.string(),
    cnpj: z.string(),
    enderecoCNPJ: z.string(),
    telefoneCNPJ: z.string(),
    emailCNPJ: z.string(),
    nomeRepresentanteCNPJ: z.string(),
    CPFRepresentanteCNPJ: z.string(),
    /** */

    /** Dados Locador pf */
    nomeCedente: z.string(),
    CPFCedente: z.string(),
    enderecoCedente: z.string(),
    telefoneCedente: z.string(),
    emailCedente: z.string(),
    estadoCivil: z.enum(['solteiro', 'viuva', 'casado', 'divorciado']),
    /** */

    Cessionario: z.enum(['pf', 'pj']).default('pf'),

    /**
     * Dados Locatario pj
     */
    razaoSocialCessionario: z.string(),
    cnpjCessionario: z.string(),
    enderecoCessionarioCNPJ: z.string(),
    telefoneCessionarioCNPJ: z.string(),
    emailCessionarioCNPJ: z.string(),
    nomeRepresentantelCessionarioCNPJ: z.string(),
    CPFRepresentanteCessionarioCNPJ: z.string(),
    /** */

    /** Dados Locatario pf */
    nomeCessionario: z.string(),
    CPFCessionario: z.string(),
    enderecoCessionario: z.string(),
    telefoneCessionario: z.string(),
    emailCessionario: z.string(),
    estadoCivilCessionario: z.enum(['solteiro', 'viuva', 'casado', 'divorciado']),
    /** */

    /**DESCRIÇÃO DO IMÓVEL */
    tipodoImovel: z.string(),
    endereco: z.string(),
    areaTotal: z.string(),
    matriculaCartorio: z.string(),
    numeroRegistro: z.string(),
    descDetalhada: z.string(),
    /** */


    /**TITULO DA POSSE E SITUAÇÃO LEGAL DO IMÓVEL */
    origemDaPosseCedente: z.string(),
    posseAdquirida: z.string(),
    regularizacao: z.enum(['S', 'N']),

    existePendencias: z.enum(['S', 'N']),
    //se sim , qual?
    debitos: z.string(),
    restricaoOnus: z.string(),
    litigios: z.string(),
    terceiros: z.enum(['S', 'N']),
    //se sim 
    comoAlocados: z.string(),
    /** */

    /**Objeto da Cessão */
    posseTotalParcial: z.string(),
    direitosCessionario: z.enum(['gozo', 'benfeitorias', 'subcessao']),
    /** */

    /** Valor e Condições de Pagamento*/
    receberaValor: z.enum(['S', 'N']),
    //se sim
    qualValorCessao: z.string(),
    formaPagamento: z.enum(['Pix', 'Dinheiro', 'Cartao', 'Boleto', 'Parcelado']),
    contaBancariaRecebimento: z.string(),
    //se parcelado 
    quantasParcelas: z.string(),
    dataVencimentoParcela: z.string(),
    multaPorAtrasoPagamento: z.string(),
    jurosporatraso: z.string(),

    /** */

    /**PRAZOS */
    prazoDeterminado: z.enum(['determinado', 'indeterminado']),
    //se sim
    dataInicio: z.string(),
    dataTermino: z.string(),
    /** */


    /**BENFEITORIAS E MODIFICAÇÕES */
    cessionarioAutorizado: z.enum(['S', 'N']),

    //se sim
    benfeitoriasIndenizaveis: z.enum(['S', 'N']),
    restricaoMod: z.string(),
    /** */

    /**RESCISÃO E PENALIDADES */
    multasPenalidades: z.string(),
    prazos: z.string(),
    /** */

    /**Disposições Gerais */
    foroResolucaoConflitos: z.string(), // Foro eleito para resolução de conflitos
    testemunhasNecessarias: z.enum(['S', 'N']), // Necessidade de testemunhas para assinatura do contrato
    //se sim 
    nomeTest1: z.string(),
    cpfTest1: z.string(),
    nomeTest2: z.string(),
    cpfTest2: z.string(),

    registroCartorio: z.enum(['S', 'N']), // Indicação se o contrato será registrado em cartório 
    /** */
});

type FormData = z.infer<typeof cessaodeposseschema>;


export default function CessaodePossedeImovel() {

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
    const valor = 29.90;
    const [pdfDataUrl, setPdfDataUrl] = useState<string>("");
    const [modalPagamento, setModalPagamento] = useState<Boolean>(false);
    const [isLoading, setIsLoading] = useState(false);
    /** */

    //VARIAVEIS DE CONTROLE DE FLUXO
    const [cedenteJuri, setCedenteJuri] = useState(false);
    const [cessionarioJuri, setCessionarioJuri] = useState(false);
    const [cessionarioAutorizado, setCessionarioAutorizado] = useState(false);
    const [tempoAdicional, setTempoAdicional] = useState(false);
    const [Parcelado, setParcelado] = useState(false);
    const [determinado, setDeterminado] = useState(false);
    const [testemunhas, setTestemunhas] = useState(false);
    const [existePendencias, setExistePendencias] = useState(false);
    const [terceiros, setTerceiros] = useState(false);
    const [receberaValor, setReceberaValor] = useState(false);
    const pilhaSteps = useRef(new Pilha());



    const handleNext = () => {
        setFormData((prev) => ({ ...prev, ...currentStepData }));

        let nextStep = step;


        if (currentStepData.Cedente === 'pj') {
            setCedenteJuri(true);
            nextStep = 8
        } else if (!cedenteJuri && nextStep === 7) {
            nextStep = 14;
        }

        if (currentStepData.Cessionario === 'pj') {
            setCessionarioJuri(true);
            nextStep = 21
        } else if (!cessionarioJuri && nextStep === 20) {
            nextStep = 27;
        }

        if (currentStepData.existePendencias === 'S') {
            setExistePendencias(true);
            nextStep = 37
        } else if (currentStepData.existePendencias === 'N') {
            nextStep = 40;
        }


        if (currentStepData.terceiros === 'S') {
            setTerceiros(true);
            nextStep = 41
        } else if (currentStepData.terceiros === 'N') {
            nextStep = 42;
        }

        if (currentStepData.receberaValor === 'S') {
            setReceberaValor(true);
            nextStep = 44
        } else if (currentStepData.receberaValor === 'N') {
            nextStep = 51;
        }


        if (currentStepData.formaPagamento === 'Parcelado') {
            setParcelado(true);
            nextStep = 47
        } else {
            nextStep = 51
        }

        if (currentStepData.prazoDeterminado === 'determinado') {
            setDeterminado(true);
            nextStep = 52
        } else if (currentStepData.prazoDeterminado === 'indeterminado') {
            nextStep = 54;
        }

        if (currentStepData.cessionarioAutorizado === 'S') {
            setCessionarioAutorizado(true);
            nextStep = 55
        } else if (currentStepData.cessionarioAutorizado === 'N') {
            nextStep = 57;
        }

        if (currentStepData.testemunhasNecessarias === 'S') {
            setTestemunhas(true);
            nextStep = 61
        } else if (currentStepData.testemunhasNecessarias === 'N') {
            nextStep = 65;
        }


        if (nextStep === step) {
            nextStep += 1;
        }

        setStep(nextStep);

        pilhaSteps.current.empilhar(nextStep);
        // Logs para depuração
        console.log(`qtd step depois do ajuste: ${nextStep}`);

        // Limpar os dados do passo atual.
        setCurrentStepData({});
    }


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurrentStepData((prev) => ({ ...prev, [name]: value }));
    };


    const handleBack = () => {
        setStep(pilhaSteps.current.desempilhar());
    }



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

    const geradorPossePDF = (dados: any) => {
        const doc = new jsPDF();

        const marginX = 10;
        const pageWidth = 190;
        let posY = 20;

        const addSection = (title: string, content: any) => {
            if (posY + 10 >= 280) {
                doc.addPage();
                posY = 20;
            }
            doc.setFontSize(12);
            doc.text(title, 105, posY, { align: "center" });
            posY += 10;

            doc.setFontSize(10);
            content.forEach((text: any) => {
                const lines = doc.splitTextToSize(text, pageWidth - 2 * marginX);
                lines.forEach((line: any) => {
                    if (posY + 7 >= 280) {
                        doc.addPage();
                        posY = 20;
                    }
                    doc.text(line, marginX, posY);
                    posY += 7;
                });
            });
        };

        doc.setFontSize(14);
        doc.text("CONTRATO DE CESSÃO DE POSSE DE IMÓVEL", 105, posY, { align: "center" });
        posY += 15;

        // Seção 1: Identificação das Partes
        addSection("1. Identificação das Partes", [
            "Nos termos do artigo 104 do Código Civil, para validade do negócio jurídico, exige-se agente capaz, objeto lícito e forma prescrita ou não defesa em lei.",
            `Cedente: ${verificarValor(dados.Cedente) === 'pj' ? verificarValor(dados.razaoSocial) : verificarValor(dados.nomeCedente)}`,
            `CPF/CNPJ: ${verificarValor(dados.Cedente) === 'pj' ? verificarValor(dados.cnpj) : verificarValor(dados.CPFCedente)}`,
            `Endereço: ${verificarValor(dados.Cedente) === 'pj' ? verificarValor(dados.enderecoCNPJ) : verificarValor(dados.enderecoCedente)}`,
            `Telefone: ${verificarValor(dados.Cedente) === 'pj' ? verificarValor(dados.telefoneCNPJ) : verificarValor(dados.telefoneCedente)}`,
            `Email: ${verificarValor(dados.Cedente) === 'pj' ? verificarValor(dados.emailCNPJ) : verificarValor(dados.emailCedente)}`,
            `Estado Civil: ${verificarValor(dados.Cedente) === 'pj' ? 'Não Aplicável' : verificarValor(dados.estadoCivil)}`,
            `Representante (PJ): ${verificarValor(dados.Cedente) === 'pj' ? verificarValor(dados.nomeRepresentanteCNPJ) : 'Não Aplicável'}`,
            `CPF Representante (PJ): ${verificarValor(dados.Cedente) === 'pj' ? verificarValor(dados.CPFRepresentanteCNPJ) : 'Não Aplicável'}`,
            `Cessionário: ${verificarValor(dados.Cessionario) === 'pj' ? verificarValor(dados.razaoSocialCessionario) : verificarValor(dados.nomeCessionario)}`,
            `CPF/CNPJ Cessionário: ${verificarValor(dados.Cessionario) === 'pj' ? verificarValor(dados.cnpjCessionario) : verificarValor(dados.CPFCessionario)}`,
            `Endereço Cessionário: ${verificarValor(dados.Cessionario) === 'pj' ? verificarValor(dados.enderecoCessionarioCNPJ) : verificarValor(dados.enderecoCessionario)}`,
            `Telefone Cessionário: ${verificarValor(dados.Cessionario) === 'pj' ? verificarValor(dados.telefoneCessionarioCNPJ) : verificarValor(dados.telefoneCessionario)}`,
            `Email Cessionário: ${verificarValor(dados.Cessionario) === 'pj' ? verificarValor(dados.emailCessionarioCNPJ) : verificarValor(dados.emailCessionario)}`,
            `Estado Civil Cessionário: ${verificarValor(dados.Cessionario) === 'pj' ? 'Não Aplicável' : verificarValor(dados.estadoCivilCessionario)}`,
            `Representante Cessionário (PJ): ${verificarValor(dados.Cessionario) === 'pj' ? verificarValor(dados.nomeRepresentantelCessionarioCNPJ) : 'Não Aplicável'}`,
            `CPF Representante Cessionário (PJ): ${verificarValor(dados.Cessionario) === 'pj' ? verificarValor(dados.CPFRepresentanteCessionarioCNPJ) : 'Não Aplicável'}`,
        ]);

        // Seção 2: Descrição do Imóvel
        addSection("2. Descrição do Imóvel", [
            `Tipo: ${verificarValor(dados.tipodoImovel)}`,
            `Endereço: ${verificarValor(dados.endereco)}`,
            `Área Total: ${verificarValor(dados.areaTotal)} m²`,
            `Matrícula: ${verificarValor(dados.matriculaCartorio)}`,
            `Número de Registro: ${verificarValor(dados.numeroRegistro)}`,
            `Descrição Detalhada: ${verificarValor(dados.descDetalhada)}`,
            "Conforme o artigo 1.227 do Código Civil, os direitos sobre imóveis devem ser registrados para produzir efeitos contra terceiros."
        ]);

        // Seção 3: Título da Posse e Situação Legal do Imóvel
        addSection("3. Título da Posse e Situação Legal do Imóvel", [
            `Origem da Posse: ${verificarValor(dados.origemDaPosseCedente)}`,
            `Posse Adquirida por: ${verificarValor(dados.posseAdquirida)}`,
            `Regularização: ${verificarValor(dados.regularizacao) === 'S' ? 'Sim' : 'Não'}`,
            `Pendências: ${verificarValor(dados.existePendencias) === 'S' ? verificarValor(dados.debitos) : 'Nenhuma'}`,
            `Ônus ou Restrições: ${verificarValor(dados.restricaoOnus)}`,
            `Litígios: ${verificarValor(dados.litigios)}`,
            `Terceiros Envolvidos: ${verificarValor(dados.terceiros) === 'S' ? verificarValor(dados.comoAlocados) : 'Não'}`,
            "Nos termos do artigo 1.196 do Código Civil, possuidor é aquele que tem de fato o exercício, pleno ou não, de algum dos poderes inerentes à propriedade."
        ]);

        // Seção 4: Objeto da Cessão
        addSection("4. Objeto da Cessão", [
            `Posse ${verificarValor(dados.posseTotalParcial)}`,
            `Direitos do Cessionário: ${verificarValor(dados.direitosCessionario)}`,
            "A cessão de direitos possessórios deve observar o disposto no artigo 1.225, inciso XIII, do Código Civil, que trata dos direitos reais sobre coisa alheia."
        ]);

        // Seção 5: Valor e Condições de Pagamento
        addSection("5. Valor e Condições de Pagamento", [
            `Receberá Valor: ${verificarValor(dados.receberaValor) === 'S' ? 'Sim' : 'Não'}`,
            `Valor: ${verificarValor(dados.qualValorCessao)}`,
            `Forma de Pagamento: ${verificarValor(dados.formaPagamento)}`,
            `Conta para Recebimento: ${verificarValor(dados.contaBancariaRecebimento)}`,
            `Parcelamento: ${verificarValor(dados.formaPagamento) === 'Parcelado' ? `${verificarValor(dados.quantasParcelas)} parcelas, vencendo em ${verificarValor(dados.dataVencimentoParcela)}` : 'Não Aplicável'}`,
            `Multa por Atraso: ${verificarValor(dados.multaPorAtrasoPagamento)}`,
            `Juros por Atraso: ${verificarValor(dados.jurosporatraso)}`,
            "Nos termos do artigo 481 do Código Civil, pelo contrato de compra e venda, um dos contratantes se obriga a transferir o domínio de certa coisa e o outro a pagar-lhe certo preço em dinheiro."
        ]);

        // Seção 6: Prazos
        addSection("6. Prazos", [
            `Prazo: ${verificarValor(dados.prazoDeterminado) === 'determinado' ? 'Determinado' : 'Indeterminado'}`,
            `Data de Início: ${verificarValor(dados.dataInicio)}`,
            `Data de Término: ${verificarValor(dados.prazoDeterminado) === 'determinado' ? verificarValor(dados.dataTermino) : 'Não Aplicável'}`,
            "O artigo 476 do Código Civil dispõe que, nos contratos bilaterais, nenhum dos contratantes pode exigir o cumprimento da obrigação do outro antes de cumprir a sua."
        ]);

        // Seção 7: Benfeitorias e Modificações
        addSection("7. Benfeitorias e Modificações", [
            `Cessionário Autorizado a Realizar Benfeitorias: ${verificarValor(dados.cessionarioAutorizado) === 'S' ? 'Sim' : 'Não'}`,
            `Benfeitorias Indenizáveis: ${verificarValor(dados.benfeitoriasIndenizaveis) === 'S' ? 'Sim' : 'Não'}`,
            `Restrições às Modificações: ${verificarValor(dados.restricaoMod)}`,
            "Conforme o artigo 1.225 do Código Civil, o proprietário tem a faculdade de usar, gozar e dispor da coisa, e o direito de reavê-la do poder de quem quer que injustamente a possua ou detenha."
        ]);

        // Seção 8: Rescisão e Penalidades
        addSection("8. Rescisão e Penalidades", [
            `Multas e Penalidades: ${verificarValor(dados.multasPenalidades)}`,
            `Prazos para Rescisão: ${verificarValor(dados.prazos)}`,
            "O artigo 473 do Código Civil estabelece que a rescisão do contrato pode ocorrer por mútuo consentimento ou por causas previstas em lei."
        ]);


        addSection("9.Obrigações das Partes", [`
            Cedente: 
            Garantir que o imóvel está livre de pendências ou ônus não informados no contrato. 
            Entregar o imóvel em condições de uso, salvo acordo contrário. 
            Fornecer todos os documentos relacionados à posse (ex.: contrato anterior, comprovantes de pagamentos de IPTU, etc.). 

            Cessionário: 
            Utilizar o imóvel de acordo com a finalidade prevista no contrato. 
            Assumir a responsabilidade por débitos futuros relacionados ao imóvel (ex.: IPTU, taxas, contas de consumo). 
            Restituir o imóvel, caso aplicável, nas mesmas condições de recebimento, salvo benfeitorias autorizadas. 
            `])
        // Seção 9: Disposições Gerais
        addSection("10. Disposições Gerais", [
            `Foro: ${verificarValor(dados.foroResolucaoConflitos)}`,
            `Testemunhas Necessárias: ${verificarValor(dados.testemunhasNecessarias) === 'S' ? `${verificarValor(dados.nomeTest1)} (CPF: ${verificarValor(dados.cpfTest1)}), ${verificarValor(dados.nomeTest2)} (CPF: ${verificarValor(dados.cpfTest2)})` : 'Não'}`,
            `Registro em Cartório: ${verificarValor(dados.registroCartorio) === 'S' ? 'Sim' : 'Não'}`,
            "Conforme o artigo 75 do Código Civil, pessoas jurídicas são representadas ativa e passivamente, em juízo e fora dele, por quem os atos constitutivos designarem."
        ]);


    };


    useEffect(() => {
        geradorPossePDF({ ...formData });
    }, [formData]);
    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title">Contrato de Cessão de Posse de Imóvel </h1>

            </div>
            <div className="container">
                <div className="left-panel">
                    <div className="scrollable-card">

                        <div className="progress-bar">
                            <div
                                className="progress-bar-inner"
                                style={{ width: `${(step / 76) * 100}%` }}
                            ></div>
                        </div>
                        <div className="form-wizard">

                            {step === 1 && (
                                <>
                                    <h2>Dados do Cedente</h2>
                                    <div>
                                        <label>O Cedente é pessoa?</label>
                                        <select name='Cedente' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="pj">Jurídica</option>
                                            <option value="pf">Física</option>
                                        </select>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {/**Pessoa Fisica */}
                            {step === 2 && (
                                <>
                                    <h2>Dados do Cedente</h2>
                                    <div>
                                        <label>Nome do Cedente</label>
                                        <input
                                            type='text'
                                            placeholder='Nome do Cedente'
                                            name="nomeCedente"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 3 && (
                                <>
                                    <h2>Dados do Cedente</h2>
                                    <div>
                                        <label>CPF</label>
                                        <input
                                            type='text'
                                            placeholder='CPF do Cedente'
                                            name="CPFCedente"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 4 && (
                                <>
                                    <h2>Dados do Cedente</h2>
                                    <div>
                                        <label>Endereço do Locador</label>
                                        <input
                                            type='text'
                                            placeholder='Onde o cedente mora'
                                            name="enderecoCedente"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 5 && (
                                <>
                                    <h2>Dados do Cedente</h2>
                                    <div>
                                        <label>Telefone do Cedente</label>
                                        <input
                                            type='text'
                                            placeholder='(DDD)número-número'
                                            name="telefoneCedente"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 6 && (
                                <>
                                    <h2>Dados do Cedente</h2>
                                    <div>
                                        <label>Email do Cedente</label>
                                        <input
                                            type='text'
                                            placeholder='email@email.com'
                                            name="emailCedente"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 7 && (
                                <>
                                    <h2>Dados do Cedente</h2>
                                    <div>
                                        <label>Estado Cívil do Cedente</label>
                                        <select name='locatario' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="solteiro">Solteiro(a)</option>
                                            <option value="viuva">Viuva(o)</option>
                                            <option value="casado">Casado(a)</option>
                                            <option value="divorciado">Divorciado(a)</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {/**Pessoa Juridica */}

                            {cedenteJuri && (
                                <>
                                    {step === 8 && (
                                        <>
                                            <h2>Dados do Cedente</h2>
                                            <div>
                                                <label>Razão Social</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="razaoSocial"
                                                    onChange={handleChange}
                                                />
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

                                    {step === 9 && (
                                        <>
                                            <h2>Dados do Cedente</h2>
                                            <div>
                                                <label>Endereço do onde o CNPJ esta cadastrado</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="enderecoCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 10 && (
                                        <>
                                            <h2>Dados do Cedente</h2>
                                            <div>
                                                <label>Telefone</label>
                                                <input
                                                    type='text'
                                                    placeholder='(DDD)número-número'
                                                    name="telefoneCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 11 && (
                                        <>
                                            <h2>Dados do Cedente</h2>
                                            <div>
                                                <label>Email</label>
                                                <input
                                                    type='text'
                                                    placeholder='(DDD)número-número'
                                                    name="emailCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 12 && (
                                        <>
                                            <h2>Dados do Cedente</h2>
                                            <div>
                                                <label>Nome do representante do CNPJ</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="nomeRepresentanteCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 13 && (
                                        <>
                                            <h2>Dados do Cedente</h2>
                                            <div>
                                                <label>CPF do representante do CNPJ</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="CPFRepresentanteCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                </>
                            )}

                            {/**Cessionario */}

                            {step === 14 && (
                                <>
                                    <h2>Dados do Cessionário</h2>
                                    <div>
                                        <label>O Cessionário é pessoa?</label>
                                        <select name='Cessionario' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="pj">Jurídica</option>
                                            <option value="pf">Física</option>
                                        </select>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {/**Pessoa Fisica */}
                            {step === 15 && (
                                <>
                                    <h2>Dados do Cessionário</h2>
                                    <div>
                                        <label>Nome do Cessionário</label>
                                        <input
                                            type='text'
                                            placeholder='Nome do Cessionário'
                                            name="nomeCessionario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 16 && (
                                <>
                                    <h2>Dados do Cessionário</h2>
                                    <div>
                                        <label>CPF</label>
                                        <input
                                            type='text'
                                            placeholder='CPF do Cessionário'
                                            name="CPFCessionario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 17 && (
                                <>
                                    <h2>Dados do Cessionário</h2>
                                    <div>
                                        <label>Endereço do Cessionário</label>
                                        <input
                                            type='text'
                                            placeholder='Onde o cessionário mora'
                                            name="enderecoCessionario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 18 && (
                                <>
                                    <h2>Dados do Cessionário</h2>
                                    <div>
                                        <label>Telefone do Cessionário</label>
                                        <input
                                            type='text'
                                            placeholder='(DDD)número-número'
                                            name="telefoneCessionario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 19 && (
                                <>
                                    <h2>Dados do Cessionário</h2>
                                    <div>
                                        <label>Email do Cessionário</label>
                                        <input
                                            type='text'
                                            placeholder='email@email.com'
                                            name="emailCessionario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 20 && (
                                <>
                                    <h2>Dados do Cessionário</h2>
                                    <div>
                                        <label>Estado Cívil</label>
                                        <select name='estadoCivilCessionario' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="solteiro">Solteiro(a)</option>
                                            <option value="viuva">Viuva(o)</option>
                                            <option value="casado">Casado(a)</option>
                                            <option value="divorciado">Divorciado(a)</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {/**Pessoa Juridica */}

                            {cessionarioJuri && (
                                <>
                                    {step === 21 && (
                                        <>
                                            <h2>Dados do Cessionário</h2>
                                            <div>
                                                <label>Razão Social</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="razaoSocialCessionario"
                                                    onChange={handleChange}
                                                />
                                                <label>CNPJ</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cnpjCessionario"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 22 && (
                                        <>
                                            <h2>Dados do Cessionário</h2>
                                            <div>
                                                <label>Endereço do onde o CNPJ esta cadastrado</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="enderecoCessionarioCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 23 && (
                                        <>
                                            <h2>Dados do Cessionário</h2>
                                            <div>
                                                <label>Telefone</label>
                                                <input
                                                    type='text'
                                                    placeholder='(DDD)número-número'
                                                    name="telefoneCessionarioCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 24 && (
                                        <>
                                            <h2>Dados do Cessionário</h2>
                                            <div>
                                                <label>Email</label>
                                                <input
                                                    type='text'
                                                    placeholder='email@email.com'
                                                    name="emailCessionarioCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 25 && (
                                        <>
                                            <h2>Dados do Cessionário</h2>
                                            <div>
                                                <label>Nome do representante do CNPJ</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="nomeRepresentantelCessionarioCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 26 && (
                                        <>
                                            <h2>Dados do Cessionário</h2>
                                            <div>
                                                <label>CPF do representante do CNPJ</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="CPFRepresentanteCessionarioCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 27 && (
                                <>
                                    <h2>Descrição do Imóvel</h2>
                                    <div>
                                        <label>Tipo do imóvel (casa, apartamento, terreno, prédio comercial, etc.)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="tipodoImovel"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 28 && (
                                <>
                                    <h2>Descrição do Imóvel</h2>
                                    <div>
                                        <label>Endereço completo do imóvel (incluindo município e estado)</label>
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

                            {step === 29 && (
                                <>
                                    <h2>Descrição do Imóvel</h2>
                                    <div>
                                        <label>Área total do imóvel (em m²)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="areaTotal"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 30 && (
                                <>
                                    <h2>Descrição do Imóvel</h2>
                                    <div>
                                        <label>Matrícula do Cartório de Registro de Imóveis (se aplicável) </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="matriculaCartorio"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 31 && (
                                <>
                                    <h2>Descrição do Imóvel</h2>
                                    <div>
                                        <label>Número de Registro do Cartório de Registro de Imóveis (se aplicável) </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="numeroRegistro"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 32 && (
                                <>
                                    <h2>Descrição do Imóvel</h2>
                                    <div>
                                        <label>Descrição detalhada de características relevantes do imóvel</label>
                                        <i>Construções, benfeitorias ou instalações (se houver) - Condição atual do imóvel (ex.: habitável, em reforma, etc.)</i>
                                        <textarea
                                            id="descDetalhada"
                                            name="descDetalhada"
                                            onChange={handleChange}
                                            rows={10}
                                            cols={50}
                                            placeholder=" "
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 33 && (
                                <>
                                    <h2>Título da Posse e Situação Legal do Imóvel</h2>
                                    <div>
                                        <label>Qual a origem da posse do cedente? </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="origemDaPosseCedente"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 34 && (
                                <>
                                    <h2>Título da Posse e Situação Legal do Imóvel</h2>
                                    <div>
                                        <label>A posse foi adquirida por meio de contrato anterior, herança ou outro meio?  </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="posseAdquirida"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 35 && (
                                <>
                                    <h2>Título da Posse e Situação Legal do Imóvel</h2>
                                    <div>
                                        <label>O imóvel está regularizado junto aos órgãos competentes? </label>
                                        <select name='regularizacao' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 36 && (
                                <>
                                    <h2>Título da Posse e Situação Legal do Imóvel</h2>
                                    <div>
                                        <label>O imóvel possui alguma das seguintes pendências? </label>
                                        <select name='existePendencias' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {existePendencias && (
                                <>
                                    {step === 37 && (
                                        <>
                                            <h2>Título da Posse e Situação Legal do Imóvel</h2>
                                            <div>
                                                <label>Débitos de IPTU ou taxas municipais? </label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="debitos"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}



                                    {step === 38 && (
                                        <>
                                            <h2>Título da Posse e Situação Legal do Imóvel</h2>
                                            <div>
                                                <label>Restrição ou ônus legal? </label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="restricaoOnus"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 39 && (
                                        <>
                                            <h2>Título da Posse e Situação Legal do Imóvel</h2>
                                            <div>
                                                <label>Litígios judiciais relacionados à posse ou propriedade do imóvel? </label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="litigios"
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
                                    <h2>Título da Posse e Situação Legal do Imóvel</h2>
                                    <div>
                                        <label>Existem terceiros ocupando o imóvel atualmente?</label>
                                        <select name='terceiros' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {terceiros && (
                                <>
                                    {step === 41 && (
                                        <>
                                            <h2>Objeto da Cessão</h2>
                                            <div>
                                                <label>A cessão refere-se à posse total ou parcial do imóvel? </label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="posseTotalParcial"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 42 && (
                                <>
                                    <h2>Título da Posse e Situação Legal do Imóvel</h2>
                                    <div>
                                        <label>Quais são os direitos cedidos ao cessionário? </label>
                                        <select name='direitosCessionario' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="gozo">Direito de uso e gozo do imóvel</option>
                                            <option value="benfeitorias">Direito de realizar benfeitorias ou reformas</option>
                                            <option value="subcessao">Direito de transferir a posse a terceiros (subcessão)</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 43 && (
                                <>
                                    <h2>Valor e Condições de Pagamento</h2>
                                    <div>
                                        <label>O cedente receberá algum valor pela cessão de posse?</label>
                                        <select name='receberaValor' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {receberaValor && (
                                <>
                                    {step === 44 && (
                                        <>
                                            <h2>Valor e Condições de Pagamento</h2>
                                            <div>
                                                <label>Valor total da cessão </label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="qualValorCessao"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 45 && (
                                        <>
                                            <h2>Valor e Condições de Pagamento</h2>
                                            <div>
                                                <label>Conta bancária para depósito (se aplicável)</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="contaBancariaRecebimento"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 46 && (
                                        <>
                                            <h2>Valor e Condições de Pagamento</h2>
                                            <div>
                                                <label>Qual será a forma de pagamento?</label>
                                                <select name='formaPagamento' onChange={handleChange}>
                                                    <option value="">Selecione</option>
                                                    <option value="Pix">Pix</option>
                                                    <option value="Dinheiro">Dinheiro</option>
                                                    <option value="Cartao">Cartão</option>
                                                    <option value="Boleto">Boleto</option>
                                                    <option value="Parcelado">Parcelado</option>
                                                </select>
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {Parcelado && (
                                        <>
                                            {step === 47 && (
                                                <>
                                                    <h2>Valor e Condições de Pagamento</h2>
                                                    <div>
                                                        <label>Quantas parcelas ?</label>
                                                        <input
                                                            type='text'
                                                            placeholder=''
                                                            name="quantasParcelas"
                                                            onChange={handleChange}
                                                        />
                                                        <button onClick={handleBack}>Voltar</button>
                                                        <button onClick={handleNext}>Próximo</button>
                                                    </div>
                                                </>
                                            )}

                                            {step === 48 && (
                                                <>
                                                    <h2>Valor e Condições de Pagamento</h2>
                                                    <div>
                                                        <label>Data de vencimento </label>
                                                        <input
                                                            type='date'
                                                            placeholder=''
                                                            name="dataVencimentoParcela"
                                                            onChange={handleChange}
                                                        />
                                                        <button onClick={handleBack}>Voltar</button>
                                                        <button onClick={handleNext}>Próximo</button>
                                                    </div>
                                                </>
                                            )}

                                            {step === 49 && (
                                                <>
                                                    <h2>Valor e Condições de Pagamento</h2>
                                                    <div>
                                                        <label>Multa por atraso de pagamento </label>
                                                        <input
                                                            type='text'
                                                            placeholder=''
                                                            name="multaPorAtrasoPagamento"
                                                            onChange={handleChange}
                                                        />
                                                        <button onClick={handleBack}>Voltar</button>
                                                        <button onClick={handleNext}>Próximo</button>
                                                    </div>
                                                </>
                                            )}

                                            {step === 50 && (
                                                <>
                                                    <h2>Valor e Condições de Pagamento</h2>
                                                    <div>
                                                        <label>Juros por Atraso de Pagamento</label>
                                                        <input
                                                            type='text'
                                                            placeholder='em porcentagem %'
                                                            name="jurosporatraso"
                                                            onChange={handleChange}
                                                        />
                                                        <button onClick={handleBack}>Voltar</button>
                                                        <button onClick={handleNext}>Próximo</button>
                                                    </div>
                                                </>
                                            )}


                                        </>
                                    )}
                                </>
                            )}

                            {step === 51 && (
                                <>
                                    <h2>Prazos</h2>
                                    <div>
                                        <label>Data de início da cessão de posse</label>
                                        <select name='prazoDeterminado' onChange={handleChange}>
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
                                    {step === 52 && (
                                        <>
                                            <h2>Prazos</h2>
                                            <div>
                                                <label>Data de inicio da cessão</label>
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

                                    {step === 53 && (
                                        <>
                                            <h2>Prazos</h2>
                                            <div>
                                                <label>Data de término da cessão</label>
                                                <input
                                                    type='date'
                                                    placeholder=''
                                                    name="dataTermino"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 54 && (
                                <>
                                    <h2>Benfeitorias e Modificações</h2>
                                    <div>
                                        <label>O cessionário está autorizado a realizar benfeitorias ou modificações no imóvel? </label>
                                        <select name='cessionarioAutorizado' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {cessionarioAutorizado && (
                                <>
                                    {step === 55 && (
                                        <>
                                            <h2>Benfeitorias e Modificações</h2>
                                            <div>
                                                <label>Benfeitorias serão indenizáveis ou não? </label>
                                                <select name='cessionarioAutorizado' onChange={handleChange}>
                                                    <option value="">Selecione</option>
                                                    <option value="S">Sim</option>
                                                    <option value="N">Não</option>
                                                </select>
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 56 && (
                                        <>
                                            <h2>Benfeitorias e Modificações</h2>
                                            <div>
                                                <label>Existem restrições específicas quanto às modificações?</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="restricaoMod"
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
                                    <h2>Rescisão e Penalidades</h2>
                                    <div>
                                        <label>Multas ou penalidades em caso de descumprimento do contrato</label>
                                        <textarea
                                            id="multasPenalidades"
                                            name="multasPenalidades"
                                            onChange={handleChange}
                                            rows={10}
                                            cols={50}
                                            placeholder=" "
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 58 && (
                                <>
                                    <h2>Rescisão e Penalidades</h2>
                                    <div>
                                        <label>Prazo para notificação prévia em caso de rescisão (ex.: 30 dias)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="prazos"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 59 && (
                                <>
                                    <h2>Disposições Gerais</h2>
                                    <div>
                                        <label>Eleição do foro competente para resolução de conflitos</label>
                                        <input
                                            type='text'
                                            placeholder='qual será foro?'
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
                                        <label>Necessidade de assinatura de testemunhas? </label>
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

                            {testemunhas && (
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
                                            <select name='registroCartorio' onChange={handleChange}>
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

                            {step === 66 && (
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
                                src={`${pdfDataUrl}#toolbar=0&navpanes=0&scrollbar=0`} // Desativa a barra de ferramentas do PDF
                                title="Pré-visualização do PDF"
                                frameBorder="0"
                                width="100%"
                                height="100%"
                                style={{
                                    pointerEvents: 'auto',
                                    userSelect: 'none',
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
                    <button className='btnBaixarPdf' onClick={() => { geradorPossePago(formData) }}>
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