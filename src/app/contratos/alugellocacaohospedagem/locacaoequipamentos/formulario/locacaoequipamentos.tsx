'use client'
import { verificarValor } from '@/lib/utils';
import api from '@/services';
import axios from 'axios';
import jsPDF from "jspdf";
import { useEffect, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';
import gerarContratoLocacaoEquipamentoPDF from '../util/pdf';


const locacaoEquipamentosSchema = z.object({
    locador: z.enum(['pf', 'pj']).default('pf'),

    /**
     * Dados Locador pj
     */
    razaoSocial: z.string(),
    cnpjlocador: z.string(),
    cpfLocador: z.string(),
    enderecoCNPJ: z.string(),
    telefoneCNPJ: z.string(),
    emailCNPJ: z.string(),
    nomeRepresentanteCNPJ: z.string(),
    CPFRepresentanteCNPJ: z.string(),
    /** */

    /** Dados Locador pf */
    nomeLocador: z.string(),
    CPFLocador: z.string(),
    enderecoLocador: z.string(),
    telefoneLocador: z.string(),
    emailLocador: z.string(),
    /** */

    locatario: z.enum(['pf', 'pj']).default('pf'),

    /**
     * Dados Locatario pj
     */
    razaoSociallocatario: z.string(),
    cpflocatario: z.string(),
    cnpj: z.string(),
    enderecolocatarioCNPJ: z.string(),
    telefonelocatarioCNPJ: z.string(),
    emaillocatarioCNPJ: z.string(),
    nomeRepresentantelocatarioCNPJ: z.string(),
    CPFRepresentantelocatarioCNPJ: z.string(),
    /** */

    /** Dados Locatario pf */
    nomelocatario: z.string(),
    CPFlocatario: z.string(),
    enderecolocatario: z.string(),
    telefonelocatario: z.string(),
    emaillocatario: z.string(),
    /** */

    /** Descrição do Equipamento */
    tipodeequipamento: z.string(),
    marcaemodelo: z.string(),
    numerodeserie: z.string(),
    estadoconservacao: z.string(),
    acessorioscomponentes: z.string(),
    /** */

    /** Prazo da Locação */
    dataInicioLocacao: z.string(),
    dataTerminoLocacao: z.string(),
    possibilidadeRenovacao: z.enum(['S', 'N']),
    condicao: z.string(),
    /** */

    /** Valor e Condições de Pagamento */
    valorTotalLocacao: z.string(),
    formaPagamento: z.enum(['Pix', 'Dinheiro', 'Cartão', 'Boleto', 'Parcelado']),
    dataVencimentoParcela: z.string(),
    multaPorAtrasoPagamento: z.string(),
    jurosporatraso: z.string(),
    /** */

    /** Garantias */
    garantia: z.enum(['S', 'N']),
    qualgarantidor: z.enum(['fi', 'caudep', 'caubem', 'ti', 'segfianca']),

    // Se for fiador
    sexoFiador: z.enum(['F', 'M']),
    nomeFiador: z.string(),
    estadoCivilFiador: z.enum(['casado', 'solteiro', 'divorciado', 'viuvo']),
    nacionalidadeFiador: z.string(),
    profissaoFiador: z.string(),
    docIdentificacao: z.enum(['Rg', 'Identidade funcional', 'Ctps', 'CNH', 'Passaporte']),
    numeroDocFiador: z.string(),
    cpfFiador: z.string(),
    enderecoFiador: z.string(),
    //---------------------------------------

    // Se for título de caução
    valorTitCaucao: z.string(),

    // Se for caução em imóvel
    descBemCaucao: z.string(),

    // Se for título de crédito utilizado
    descCredUtili: z.string(),

    // Se for seguro-fiança
    segFianca: z.string(),
    /** */

    /** Obrigações do Locador */
    entregaEquipLocador: z.enum(['Sim', 'Não']),
    garantiaManutencao: z.enum(['Sim', 'Não']),
    forneceraSuporte: z.enum(['Sim', 'Não']),
    quaisCondicoes: z.string(),
    /** */

    /** Obrigações do Locatario */
    compromeUso: z.enum(['Sim', 'Não']),
    danosUso: z.enum(['Sim', 'Não']),
    restricoesLocal: z.enum(['Sim', 'Não']),
    arcarCustos: z.enum(['Sim', 'Não']),
    /** */

    /** Devolução do Equipamento */
    local: z.string(),
    condicoesDevolucao: z.string(),
    procedimentoInspec: z.string(),
    penalidades: z.string(),
    /** */

    /** Rescisão do Contrato */
    condicoesRescisao: z.string(), // Condições para rescisão antecipada
    multasRescisao: z.string(), // Multas ou penalidades aplicáveis
    prazoNotificacaoRescisao: z.string(), // Prazo para notificação prévia de rescisão
    /** */

    /**Disposições Gerais */
    foroResolucaoConflitos: z.string(), // Foro eleito para resolução de conflitos
    testemunhasNecessarias: z.enum(['Sim', 'Não']), // Necessidade de testemunhas para assinatura do contrato
    //se sim 
    nomeTest1: z.string(),
    cpfTest1: z.string(),
    nomeTest2: z.string(),
    cpfTest2: z.string(),

    registroCartorio: z.enum(['Sim', 'Não']), // Indicação se o contrato será registrado em cartório 
    /** */
});

type FormData = z.infer<typeof locacaoEquipamentosSchema>;


export default function LocacaoEquipamentos() {
    const [formData, setFormData] = useState<Partial<FormData>>({});
    const [currentStepData, setCurrentStepData] = useState<Partial<FormData>>({});
    const [step, setStep] = useState(1);

    const [locadorJuri, setLocadorJuri] = useState(false);
    const [locadorioJuri, setLocadorioJuri] = useState(false);
    const [possibilidadeRenovacao, setPossibilidadeRenovacao] = useState(false);
    const [Parcelado, setParcelado] = useState(false);
    const [garantia, setGarantia] = useState(false);
    const [fiador, setFiador] = useState(false);
    const [caucaoDep, setCaucaoDep] = useState(false);
    const [caucaoBemIM, setCaucaoBemIM] = useState(false);
    const [titulos, setTitulos] = useState(false);
    const [seguroFi, setSeguroFi] = useState(false);
    const [garantiaManutencao, setGarantiaManutencao] = useState(false);
    const [testemunhas, setTestemunhas] = useState(false);


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


    const handleNext = () => {
        setFormData((prev) => ({ ...prev, ...currentStepData }));

        let nextStep = step;

        if (currentStepData.locador === 'pj') {
            setLocadorJuri(true);
            nextStep = 7
        } else if (!locadorJuri && nextStep === 6) {
            nextStep = 13;
        }

        if (currentStepData.locatario === 'pj') {
            setLocadorioJuri(true);
            nextStep = 19
        } else if (!locadorioJuri && nextStep === 18) {
            nextStep = 25;
        }


        if (currentStepData.possibilidadeRenovacao === 'S') {
            setPossibilidadeRenovacao(true)
        } else if (currentStepData.possibilidadeRenovacao === 'N') {
            nextStep = 34;
        }


        if (currentStepData.formaPagamento === 'Parcelado') {
            setParcelado(true);
        } else if (currentStepData.formaPagamento === 'Pix') {
            nextStep = 39;
        } else if (currentStepData.formaPagamento === 'Dinheiro') {
            nextStep = 39;
        } else if (currentStepData.formaPagamento === 'Cartão') {
            nextStep = 39;
        } else if (currentStepData.formaPagamento === 'Boleto') {
            nextStep = 39;
        }

        if (currentStepData.garantia === 'S') {
            setGarantia(true);
        } else if (currentStepData.garantia === 'N') {
            nextStep = 54;
        }


        if (nextStep === 49) {
            nextStep = 54
        } else if (nextStep === 51) {
            nextStep = 54
        } else if (nextStep === 52) {
            nextStep = 54
        } else if (nextStep === 53) {
            nextStep = 54
        }


        switch (currentStepData.qualgarantidor) {
            case "fi":
                setFiador(true);
                break;
            case "caudep":
                setCaucaoDep(true);
                nextStep = 50;
                break;
            case "caubem":
                setCaucaoBemIM(true);
                nextStep = 51;
                break;
            case "ti":
                setTitulos(true);
                nextStep = 52;
                break;
            case "segfianca":
                setSeguroFi(true);
                nextStep = 53;
                break;
            default:
                break;
        }





        if (currentStepData.forneceraSuporte === 'Sim') {
            setGarantiaManutencao(true);
        } else if (currentStepData.forneceraSuporte === 'Não') {
            nextStep = 58;
        }




        if (currentStepData.testemunhasNecessarias === 'Sim') {
            setTestemunhas(true);
        } else if (currentStepData.testemunhasNecessarias === 'Não') {
            nextStep = 75
        }


        if (nextStep === step) {
            nextStep += 1;
        }

        setStep(nextStep);

        // Logs para depuração
        console.log(`qtd step depois do ajuste: ${nextStep}`);

        // Limpar os dados do passo atual.
        setCurrentStepData({});
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCurrentStepData((prev) => ({ ...prev, [name]: value }));
    };


    const handleBack = () => setStep((prev) => prev - 1);



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


    const gerarContratoLocacaoEquipamento = (dados: any) => {
        const doc = new jsPDF();

        // Configuração inicial de fonte e margens
        const marginX = 10;
        let posY = 20;

        // Função auxiliar para adicionar seções e ajustar a posição Y
        const addSection = (title: any, content: any) => {
            if (posY + 10 >= 280) {
                doc.addPage();
                posY = 20;
            }
            doc.setFontSize(12);
            doc.text(title, 105, posY, { align: "center" }); // Centralizado
            posY += 10;
            doc.setFontSize(10);
            content.forEach((line: any) => {
                if (posY + 7 >= 280) {
                    doc.addPage();
                    posY = 20;
                }
                doc.text(line, marginX, posY);
                posY += 7;
            });
        };

        // Cabeçalho
        doc.setFontSize(14);
        doc.text("CONTRATO DE LOCAÇÃO DE EQUIPAMENTOS", 105, posY, { align: "center" });
        posY += 15;

        // Seções do contrato com títulos formatados como cláusulas contratuais
        addSection("CLÁUSULA PRIMEIRA – DA IDENTIFICAÇÃO DAS PARTES", [
            "Conforme o Código Civil Brasileiro (Art. 104 e Art. 566):",
            "- As partes devem ser plenamente capazes e identificadas de forma clara.",
            `Locador: ${verificarValor(dados.locador) === "pf" ? "Pessoa Física" : "Pessoa Jurídica"}`,
            verificarValor(dados.locador) === "pf"
                ? `Nome: ${verificarValor(dados.nomeLocador)}, CPF: ${verificarValor(dados.CPFLocador)}`
                : `Razão Social: ${verificarValor(dados.razaoSocial)}, CNPJ: ${verificarValor(dados.cnpjlocador)}`,
            `Endereço: ${verificarValor(dados.enderecoLocador)}`,
            `Telefone: ${verificarValor(dados.telefoneLocador)}`,
            `E-mail: ${verificarValor(dados.emailLocador)}`,
            "",
            `Locatário: ${verificarValor(dados.locatario) === "pf" ? "Pessoa Física" : "Pessoa Jurídica"}`,
            verificarValor(dados.locatario) === "pf"
                ? `Nome: ${verificarValor(dados.nomelocatario)}, CPF: ${verificarValor(dados.CPFlocatario)}`
                : `Razão Social: ${verificarValor(dados.razaoSociallocatario)}, CNPJ: ${verificarValor(dados.cnpj)}`,
            `Endereço: ${verificarValor(dados.enderecolocatario)}`,
            `Telefone: ${verificarValor(dados.telefonelocatario)}`,
            `E-mail: ${verificarValor(dados.emaillocatario)}`,
        ]);

        addSection("CLÁUSULA SEGUNDA – DA DESCRIÇÃO DO EQUIPAMENTO", [
            "Conforme o Código Civil Brasileiro (Art. 566):",
            "- O locador é obrigado a entregar o equipamento em bom estado de uso.",
            `Tipo de Equipamento: ${verificarValor(dados.tipodeequipamento)}`,
            `Marca e Modelo: ${verificarValor(dados.marcaemodelo)}`,
            `Número de Série: ${verificarValor(dados.numerodeserie)}`,
            `Estado de Conservação: ${verificarValor(dados.estadoconservacao)}`,
            `Acessórios e Componentes: ${verificarValor(dados.acessorioscomponentes)}`,
        ]);

        addSection("CLÁUSULA TERCEIRA – DO PRAZO DA LOCAÇÃO", [
            "Conforme o Código Civil Brasileiro (Art. 565 e Art. 578):",
            "- A locação deve ter prazo determinado ou indeterminado conforme as partes acordarem.",
            `Data de Início: ${verificarValor(dados.dataInicioLocacao)}`,
            `Data de Término: ${verificarValor(dados.dataTerminoLocacao)}`,
            `Renovação: ${verificarValor(dados.possibilidadeRenovacao) === "S" ? "Sim" : "Não"}`,
            `Condições: ${verificarValor(dados.condicao)}`,
        ]);

        addSection("CLÁUSULA QUARTA – DO VALOR E CONDIÇÕES DE PAGAMENTO", [
            "Conforme o Código Civil Brasileiro (Art. 567 e Art. 578):",
            "- O valor do aluguel e a forma de pagamento devem ser especificados claramente.",
            `Valor Total: R$ ${verificarValor(dados.valorTotalLocacao)}`,
            `Forma de Pagamento: ${verificarValor(dados.formaPagamento)}`,
            `Data de Vencimento: ${verificarValor(dados.dataVencimentoParcela)}`,
            `Multa por Atraso: ${verificarValor(dados.multaPorAtrasoPagamento)}%`,
            `Juros por Atraso: ${verificarValor(dados.jurosporatraso)}% ao mês`,
        ]);

        addSection("CLÁUSULA QUINTA – DAS GARANTIAS", [
            "Conforme o Código Civil Brasileiro (Art. 578 e Art. 585):",
            "- As garantias contratuais devem ser claramente definidas e respeitadas.",
            `Garantia Exigida: ${verificarValor(dados.garantia) === "S" ? "Sim" : "Não"}`,
            `Tipo de Garantia: ${verificarValor(dados.qualgarantidor) === "fi"
                ? `Fiador: ${verificarValor(dados.nomeFiador)}, CPF: ${verificarValor(dados.cpfFiador)}`
                : verificarValor(dados.qualgarantidor) === "caudep"
                    ? `Caução em Dinheiro: R$ ${verificarValor(dados.valorTitCaucao)}`
                    : verificarValor(dados.qualgarantidor) === "caubem"
                        ? `Caução em Bem: ${verificarValor(dados.descBemCaucao)}`
                        : verificarValor(dados.qualgarantidor) === "ti"
                            ? `Título de Crédito: ${verificarValor(dados.descCredUtili)}`
                            : `Seguro Fiança: ${verificarValor(dados.segFianca)}`
            }`,
        ]);

        addSection("CLÁUSULA SEXTA – DAS OBRIGAÇÕES DO LOCADOR", [
            "Conforme o Código Civil Brasileiro (Art. 566):",
            "- O locador é obrigado a entregar o equipamento em estado de servir ao uso a que se destina.",
            `Entrega em Perfeito Estado: ${verificarValor(dados.entregaEquipLocador)}`,
            `Garantia de Manutenção: ${verificarValor(dados.garantiaManutencao)}`,
            `Fornecimento de Suporte: ${verificarValor(dados.forneceraSuporte)}`,
        ]);

        addSection("CLÁUSULA SÉTIMA – DAS OBRIGAÇÕES DO LOCATÁRIO", [
            "Conforme o Código Civil Brasileiro (Art. 569):",
            "- O locatário é obrigado a usar o equipamento conforme o destino ajustado e a devolvê-lo no estado em que o recebeu, salvo deteriorações naturais.",
            `Uso Adequado: ${verificarValor(dados.usoAdequadoEquip)}`,
            `Responsabilidade por Danos: ${verificarValor(dados.responsabilidadeDanos)}`,
            `Devolução em Perfeito Estado: ${verificarValor(dados.devolucaoEquipLocatario)}`,
            `Reparo por Danos: ${verificarValor(dados.obrigacaoReparoDanos)}`,
        ]);

        addSection("CLÁUSULA OITAVA – DA RESCISÃO CONTRATUAL", [
            "Conforme o Código Civil Brasileiro (Art. 572 e Art. 573):",
            "- O contrato pode ser rescindido por qualquer das partes em caso de descumprimento das obrigações contratuais.",
            `Rescisão Antecipada: ${verificarValor(dados.rescisaoAntecipada)}`,
            `Multa Rescisória: R$ ${verificarValor(dados.multaRescisoria)}`,
            `Prazo para Aviso Prévio: ${verificarValor(dados.prazoAvisoPrevio)} dias`,
        ]);

        addSection("CLÁUSULA NONA – DAS DISPOSIÇÕES GERAIS", [
            "Conforme o Código Civil Brasileiro:",
            "- As disposições gerais devem respeitar os princípios contratuais de boa-fé e equidade.",
            `Alterações Contratuais: ${verificarValor(dados.alteracoesContratuais)}`,
            `Foro de Eleição: ${verificarValor(dados.foroEleito)}`,
            "Outros acordos entre as partes devem ser formalizados por escrito.",
        ]);

        // Assinaturas das testemunhas (se aplicável)
        if (verificarValor(dados.testemunhas) === "S") {
            posY += 20;
            doc.text("__________________________", 60, posY);
            doc.text("Assinatura da Testemunha 1", 60, posY + 5);
            doc.text(`Nome: ${verificarValor(dados.nomeTestemunha1)}, CPF: ${verificarValor(dados.cpfTestemunha1)}`, 60, posY + 15);

            posY += 30;
            doc.text("__________________________", 60, posY);
            doc.text("Assinatura da Testemunha 2", 60, posY + 5);
            doc.text(`Nome: ${verificarValor(dados.nomeTestemunha2)}, CPF: ${verificarValor(dados.cpfTestemunha2)}`, 60, posY + 15);
        }

        // Finalização do documento
        posY += 40;
        doc.setFontSize(10);
        doc.text("Este contrato é firmado em duas vias de igual teor e forma, que as partes assinam para que produza seus efeitos legais.", marginX, posY);

        // Salvar o PDF
        const pdfDataUri = doc.output("datauristring");
        setPdfDataUrl(pdfDataUri);
    };






    useEffect(() => {
        gerarContratoLocacaoEquipamento({ ...formData });
    }, [formData]);


    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title">Contrato de Locação de Equipamentos</h1>

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
                                    <h2>Dados do Responsável pelo Equipamento</h2>
                                    <div>
                                        <label>O Responsavel é pessoa?</label>
                                        <select name='locador' onChange={handleChange}>
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
                                    <h2>Dados do Responsável pelo Equipamento</h2>
                                    <div>
                                        <label>Nome do Locador</label>
                                        <input
                                            type='text'
                                            placeholder='Nome do Locador'
                                            name="nomeLocador"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 3 && (
                                <>
                                    <h2>Dados do Responsável pelo Equipamento</h2>
                                    <div>
                                        <label>CPF</label>
                                        <input
                                            type='text'
                                            placeholder='CPF do Locador'
                                            name="CPFLocador"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 4 && (
                                <>
                                    <h2>Dados do Responsável pelo Equipamento</h2>
                                    <div>
                                        <label>Endereço do Locador</label>
                                        <input
                                            type='text'
                                            placeholder='Onde o locador mora'
                                            name="enderecoLocador"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 5 && (
                                <>
                                    <h2>Dados do Responsável pelo Equipamento</h2>
                                    <div>
                                        <label>Telefone do Locador</label>
                                        <input
                                            type='text'
                                            placeholder='(DDD)número-número'
                                            name="telefoneLocador"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 6 && (
                                <>
                                    <h2>Dados do Responsável pelo Equipamento</h2>
                                    <div>
                                        <label>Email do Locador</label>
                                        <input
                                            type='text'
                                            placeholder='email@email.com'
                                            name="emailLocador"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {/**Pessoa Juridica */}

                            {locadorJuri && (
                                <>
                                    {step === 7 && (
                                        <>
                                            <h2>Dados do Responsável pelo Equipamento</h2>
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
                                                    name="cnpjlocador"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 8 && (
                                        <>
                                            <h2>Dados do Responsável pelo Equipamento</h2>
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
                                    {step === 9 && (
                                        <>
                                            <h2>Dados do Responsável pelo Equipamento</h2>
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
                                    {step === 10 && (
                                        <>
                                            <h2>Dados do Responsável pelo Equipamento</h2>
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
                                    {step === 11 && (
                                        <>
                                            <h2>Dados do Responsável pelo Equipamento</h2>
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
                                    {step === 12 && (
                                        <>
                                            <h2>Dados do Responsável pelo Equipamento</h2>
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

                            {/**Locatário */}

                            {step === 13 && (
                                <>
                                    <h2>Dados do Locatário do Equipamento</h2>
                                    <div>
                                        <label>O Responsavel é pessoa?</label>
                                        <select name='locatario' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="pj">Jurídica</option>
                                            <option value="pf">Física</option>
                                        </select>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {/**Pessoa Fisica */}
                            {step === 14 && (
                                <>
                                    <h2>Dados do Locatário do Equipamento</h2>
                                    <div>
                                        <label>Nome do Locatário</label>
                                        <input
                                            type='text'
                                            placeholder='Nome do Locatário'
                                            name="nomelocatario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 15 && (
                                <>
                                    <h2>Dados do Locatário do Equipamento</h2>
                                    <div>
                                        <label>CPF</label>
                                        <input
                                            type='text'
                                            placeholder='CPF do Locatário'
                                            name="CPFlocatario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 16 && (
                                <>
                                    <h2>Dados do Locatário do Equipamento</h2>
                                    <div>
                                        <label>Endereço do Locatário</label>
                                        <input
                                            type='text'
                                            placeholder='Onde o locatário mora'
                                            name="enderecolocatario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 17 && (
                                <>
                                    <h2>Dados do Locatário do Equipamento</h2>
                                    <div>
                                        <label>Telefone do Locatário</label>
                                        <input
                                            type='text'
                                            placeholder='(DDD)número-número'
                                            name="telefonelocatario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 18 && (
                                <>
                                    <h2>Dados do Locatário do Equipamento</h2>
                                    <div>
                                        <label>Email do Locatário</label>
                                        <input
                                            type='text'
                                            placeholder='email@email.com'
                                            name="emaillocatario"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {/**Pessoa Juridica */}

                            {locadorioJuri && (
                                <>
                                    {step === 19 && (
                                        <>
                                            <h2>Dados do Locatário do Equipamento</h2>
                                            <div>
                                                <label>Razão Social</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="razaoSociallocatario"
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

                                    {step === 20 && (
                                        <>
                                            <h2>Dados do Locatário do Equipamento</h2>
                                            <div>
                                                <label>Endereço do onde o CNPJ esta cadastrado</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="enderecolocatarioCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 21 && (
                                        <>
                                            <h2>Dados do Locatário do Equipamento</h2>
                                            <div>
                                                <label>Telefone</label>
                                                <input
                                                    type='text'
                                                    placeholder='(DDD)número-número'
                                                    name="telefonelocatarioCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 22 && (
                                        <>
                                            <h2>Dados do Locatário do Equipamento</h2>
                                            <div>
                                                <label>Email</label>
                                                <input
                                                    type='text'
                                                    placeholder='email@email.com'
                                                    name="emaillocatarioCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 23 && (
                                        <>
                                            <h2>Dados do Locatário do Equipamento</h2>
                                            <div>
                                                <label>Nome do representante do CNPJ</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="nomeRepresentantelocatarioCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 24 && (
                                        <>
                                            <h2>Dados do Locatário do Equipamento</h2>
                                            <div>
                                                <label>CPF do representante do CNPJ</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="CPFRepresentantelocatarioCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                </>
                            )}
                            {step === 25 && (
                                <>
                                    <h2>Descrição do Equipamento</h2>
                                    <div>
                                        <label>Qual é o tipo do Equipamento ?</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="tipodeequipamento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 26 && (
                                <>
                                    <h2>Descrição do Equipamento</h2>
                                    <div>
                                        <label>Qual é a Marca ou Modelo?</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="marcaemodelo"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 27 && (
                                <>
                                    <h2>Descrição do Equipamento</h2>
                                    <div>
                                        <label>Qual é o numero de série?</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="numerodeserie"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 28 && (
                                <>
                                    <h2>Descrição do Equipamento</h2>
                                    <div>
                                        <label>Estado de Conservação</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="estadoconservacao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 29 && (
                                <>
                                    <h2>Descrição do Equipamento</h2>
                                    <div>
                                        <label>Acessórios ou componentes adicionais incluídos</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="acessorioscomponentes"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 30 && (
                                <>
                                    <h2>Prazo da Locação</h2>
                                    <div>
                                        <label>Data de início da locação</label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="dataInicioLocacao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 31 && (
                                <>
                                    <h2>Prazo da Locação</h2>
                                    <div>
                                        <label>Data de término da locação</label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="dataTerminoLocacao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 32 && (
                                <>
                                    <h2>Prazo da Locação</h2>
                                    <div>
                                        <label>Há possibilidade de renovação?</label>
                                        <select name='possibilidadeRenovacao' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {possibilidadeRenovacao && (
                                <>
                                    {step === 33 && (
                                        <>
                                            <h2>Prazo da Locação</h2>
                                            <div>
                                                <label>Quais são as condições?</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="condicao"
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
                                    <h2>Valor e Condições de Pagamento</h2>
                                    <div>
                                        <label>Valor total da locação</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="valorTotalLocacao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 35 && (
                                <>
                                    <h2>Valor e Condições de Pagamento</h2>
                                    <div>
                                        <label>Forma de pagamento (à vista, parcelado, etc.)</label>
                                        <select name='formaPagamento' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="Pix">Pix</option>
                                            <option value="Dinheiro">Dinheiro</option>
                                            <option value="Cartão">Cartão</option>
                                            <option value="Boleto">Dinheiro</option>
                                            <option value="Parcelado">Parcelado</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {Parcelado && (
                                <>
                                    {step === 36 && (
                                        <>
                                            <h2>Valor e Condições de Pagamento</h2>
                                            <div>
                                                <label>Datas de vencimento das parcelas</label>
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

                                    {step === 37 && (
                                        <>
                                            <h2>Valor e Condições de Pagamento</h2>
                                            <div>
                                                <label>Multa por atraso no pagamento</label>
                                                <input
                                                    type='text'
                                                    placeholder='Porcentagem .ex.:2% mês , ano ou dia'
                                                    name="multaPorAtrasoPagamento"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 38 && (
                                        <>
                                            <h2>Valor e Condições de Pagamento</h2>
                                            <div>
                                                <label>Juros aplicáveis em caso de atraso</label>
                                                <input
                                                    type='text'
                                                    placeholder='porcentagem.ex.: 1% mês'
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

                            {step === 39 && (
                                <>
                                    <h2>Garantias</h2>
                                    <div>
                                        <label>Será exigida alguma garantia?</label>
                                        <select name='garantia' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {garantia && (
                                <>
                                    {step === 40 && (
                                        <>
                                            <h2>Garantias</h2>
                                            <div>
                                                <label>Qual?</label>
                                                <select name='qualgarantidor' onChange={handleChange}>
                                                    <option value="">Selecione</option>
                                                    <option value="fi">Fiador</option>
                                                    <option value="caudep">Caução em Depósito</option>
                                                    <option value="caubem">Caução em Bem Móvel</option>
                                                    <option value="ti">Titulos</option>
                                                    <option value="segfianca">Seguro fiança</option>
                                                </select>
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {fiador && (
                                <>
                                    {step === 41 && (
                                        <>
                                            <h2>Dados do Fiador</h2>
                                            <div>
                                                <label>Qual é o sexo do fiador?</label>
                                                <div>
                                                    <select name='sexoFiador' onChange={handleChange}>
                                                        <option value="">Selecione</option>
                                                        <option value="F">Feminino</option>
                                                        <option value="M">Masculino</option>
                                                    </select>
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>                                                        </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 42 && (
                                        <>
                                            <h2>Dados do Fiador</h2>
                                            <div>
                                                <label>Qual é o nome do fiador ?</label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="nomeFiador1"
                                                        onChange={handleChange}
                                                    />
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>                                                        </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 43 && (
                                        <>
                                            <h2>Dados do Fiador</h2>
                                            <div>
                                                <label>Estado Cívil</label>
                                                <div>
                                                    <select name='sexoFiador' onChange={handleChange}>
                                                        <option value="">Selecione</option>
                                                        <option value="casado">Casado(a)</option>
                                                        <option value="solteiro">Solteiro(a)</option>
                                                        <option value="divorciado">Divorciado(a)</option>
                                                        <option value="viuvo">Viuvo(a)</option>
                                                    </select>
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>                                                        </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 44 && (
                                        <>
                                            <h2>Dados do Fiador</h2>
                                            <div>
                                                <label>Nacionalidade</label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="nacionalidadeFiador"
                                                        onChange={handleChange}
                                                    />
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>                                                        </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 45 && (
                                        <>
                                            <h2>Dados do Fiador</h2>
                                            <div>
                                                <label>Profissão</label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="profissaoFiador"
                                                        onChange={handleChange}
                                                    />
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>                                                        </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 46 && (
                                        <>
                                            <h2>Dados do Fiador</h2>
                                            <div>
                                                <label>Documento do Representante:</label>
                                                <select name='docIdentificacao' onChange={handleChange}>
                                                    <option value="">Selecione</option>

                                                    <option value="Rg">Rg</option>
                                                    <option value="Identidade funcional">Identificação funcional</option>
                                                    <option value="Ctps">Carteira de trabalho</option>
                                                    <option value="CNH">CNH</option>
                                                    <option value="Passaporte">Passaporte</option>
                                                </select>
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>                                                    </div>
                                        </>
                                    )}

                                    {step === 47 && (
                                        <>
                                            <h2>Dados do Fiador</h2>
                                            <div>
                                                <label>Número de identificação</label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="numeroDocFiador"
                                                        onChange={handleChange}
                                                    />
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>                                                        </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 48 && (
                                        <>
                                            <h2>Dados do Fiador</h2>
                                            <div>
                                                <label>CPF do fiador</label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="cpfFiador"
                                                        onChange={handleChange}
                                                    />
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>                                                        </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 49 && (
                                        <>
                                            <h2>Dados do Fiador</h2>
                                            <div>
                                                <label>Endereço do fiador</label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="enderecoFiador"
                                                        onChange={handleChange}
                                                    />
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>                                                        </div>
                                            </div>
                                        </>
                                    )}

                                </>
                            )}

                            {caucaoDep && (
                                <>
                                    {step === 50 && (
                                        <>
                                            <h2>Dados do Titulo do Caução</h2>
                                            <div>
                                                <label>Valor </label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="valorTitCaucao"
                                                        onChange={handleChange}
                                                    />
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>                                                        </div>
                                            </div>
                                        </>
                                    )}



                                </>
                            )}

                            {caucaoBemIM && (
                                <>
                                    {step === 51 && (
                                        <>
                                            <h2>Dados do Caução de imóvel</h2>
                                            <div>
                                                <label>Descrição do bem</label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="descBemCaucao"
                                                        onChange={handleChange}
                                                    />
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>                                                        </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {titulos && (
                                <>
                                    {step === 52 && (
                                        <>
                                            <h2>Dados do Título de Credito</h2>
                                            <div>
                                                <label>Descrição </label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="descCredUtili"
                                                        onChange={handleChange}
                                                    />
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>                                                        </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {seguroFi && (
                                <>
                                    {step === 53 && (
                                        <>
                                            <h2>Dados do Seguro Fiança</h2>
                                            <div>
                                                <label>Valor </label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="segFianca"
                                                        onChange={handleChange}
                                                    />
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>                                                        </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 54 && (
                                <>
                                    <h2>Obrigações do Locador</h2>
                                    <div>
                                        <label>O locador se responsabiliza pela entrega do equipamento em perfeito estado de funcionamento?  </label>
                                        <select name='entregaEquipLocador' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="Sim">Sim</option>
                                            <option value="Não">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>                                                        </div>

                                </>
                            )}

                            {step === 55 && (
                                <>
                                    <h2>Obrigações do Locador</h2>
                                    <div>
                                        <label>Há garantia para manutenção ou reparos durante o período de locação?</label>
                                        <select name='garantiaManutencao' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="Sim">Sim</option>
                                            <option value="Não">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>                                                        </div>

                                </>
                            )}


                            {step === 56 && (
                                <>
                                    <h2>Obrigações do Locador</h2>
                                    <div>
                                        <label>O locador fornecerá suporte técnico?</label>
                                        <select name='forneceraSuporte' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="Sim">Sim</option>
                                            <option value="Não">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>                                                        </div>

                                </>
                            )}

                            {garantiaManutencao && (
                                <>
                                    {step === 57 && (
                                        <>
                                            <h2>Obrigações do Locador</h2>
                                            <div>
                                                <label>Em quais condições? </label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="quaisCondicoes"
                                                        onChange={handleChange}
                                                    />
                                                    <button onClick={handleBack}>Voltar</button>
                                                    <button onClick={handleNext}>Próximo</button>                                                        </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 58 && (
                                <>
                                    <h2>Obrigações do Locatário</h2>
                                    <div>
                                        <label>O locatário se compromete a utilizar o equipamento conforme as instruções fornecidas? </label>
                                        <div>
                                            <select name='compromeUso' onChange={handleChange}>
                                                <option value="">Selecione</option>
                                                <option value="Sim">Sim</option>
                                                <option value="Não">Não</option>
                                            </select>
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                                        </div>
                                    </div>
                                </>
                            )}
                            {step === 59 && (
                                <>
                                    <h2>Obrigações do Locatário</h2>
                                    <div>
                                        <label>O locatário é responsável por danos causados por uso inadequado? </label>
                                        <div>
                                            <select name='danosUso' onChange={handleChange}>
                                                <option value="">Selecione</option>
                                                <option value="Sim">Sim</option>
                                                <option value="Não">Não</option>
                                            </select>
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 60 && (
                                <>
                                    <h2>Obrigações do Locatário</h2>
                                    <div>
                                        <label>Há restrições quanto ao local de uso do equipamento? </label>
                                        <div>
                                            <select name='restricoesLocal' onChange={handleChange}>
                                                <option value="">Selecione</option>
                                                <option value="Sim">Sim</option>
                                                <option value="Não">Não</option>
                                            </select>
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 61 && (
                                <>
                                    <h2>Obrigações do Locatário</h2>
                                    <div>
                                        <label>O locatário deve arcar com custos de manutenção preventiva ou corretiva durante a locação?  </label>
                                        <div>
                                            <select name='arcarCustos' onChange={handleChange}>
                                                <option value="">Selecione</option>
                                                <option value="Sim">Sim</option>
                                                <option value="Não">Não</option>
                                            </select>
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 62 && (
                                <>
                                    <h2>Devolução do Equipamento</h2>
                                    <div>
                                        <label>Local para devolução do equipamento </label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="local"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 63 && (
                                <>
                                    <h2>Devolução do Equipamento</h2>
                                    <div>
                                        <label>Condições para devolução do equipamento</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="condicoesDevolucao"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 64 && (
                                <>
                                    <h2>Devolução do Equipamento</h2>
                                    <div>
                                        <label>Qual será o procedimento para inspeção do equipamento na devolução ?</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="procedimentoInspec"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 65 && (
                                <>
                                    <h2>Devolução do Equipamento</h2>
                                    <div>
                                        <label>Qual será as penalidades em caso de danos ou avarias identificadas ?</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="penalidades"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 66 && (
                                <>
                                    <h2>Rescisão do Contrato</h2>
                                    <div>
                                        <label>Qual será as condições para rescisão antecipada por ambas as partes ?</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="condicoesRescisao"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 67 && (
                                <>
                                    <h2>Rescisão do Contrato</h2>
                                    <div>
                                        <label>Qual será a Multa aplicável em caso de rescisão antecipada ?</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="multasRescisao"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 68 && (
                                <>
                                    <h2>Rescisão do Contrato</h2>
                                    <div>
                                        <label>Qual será o prazo para notificação prévia de rescisão ?</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="prazoNotificacaoRescisao"
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
                                    <h2>Disposições Gerais</h2>
                                    <div>
                                        <label>Foro eleito para resolução de conflitos </label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="foroResolucaoConflitos"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}
                            {step === 70 && (
                                <>
                                    <h2>Disposições Gerais</h2>
                                    <div>
                                        <label>Gostaria de adicionar testemunhas?</label>
                                        <div>
                                            <select name='testemunhasNecessarias' onChange={handleChange}>
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

                            {testemunhas && (
                                <>
                                    {step === 71 && (
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

                                    {step === 72 && (
                                        <>
                                            <h2>Dados das Testemunhas</h2>
                                            <div>
                                                <label>CPF da 1° testemunha </label>
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

                                    {step === 73 && (
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

                                    {step === 74 && (
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

                            {step === 75 && (
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


                            {step === 76 && (
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
                                src={pdfDataUrl}
                                title="Pré-visualização do PDF"
                                frameBorder="0"
                                width="100%"
                                height="100%"
                            // style={{
                            //     pointerEvents: 'none',
                            //     userSelect: 'none',
                            // }}
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
                    <button className='btnBaixarPdf' onClick={() => { gerarContratoLocacaoEquipamentoPDF(formData) }}>
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