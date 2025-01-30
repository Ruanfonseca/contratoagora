import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';


const Locacaoveiculoschema = z.object({
    locador: z.enum(['pf', 'pj']).default('pf'),

    /**
     * Dados Locador pj
     */
    razaoSocial: z.string(),
    cnpj: z.string(),
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
    cnpjLocatario: z.string(),
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

    /**DESCRIÇÃO DO VEICULO */
    marca: z.string(),
    modelo: z.string(),
    anoFabricacao: z.string(),
    cor: z.string(),
    placa: z.string(),
    renavam: z.string(),
    quilometragem: z.string(),
    estadoGeral: z.string(),
    /** */

    /**PRAZO DA LOCAÇÃO */
    dataInicioLoc: z.string(),
    dataFimLoc: z.string(),

    possibilidadeRenov: z.enum(['S', 'N']),

    //se sim
    quaisCondicoes: z.string(),
    /** */

    /**VALOR DO ALUGUEL E CONDIÇÕES DE PAGAMENTO */
    valor: z.string(),
    comoSeraCobrado: z.enum(['dia', 'semana', 'mês']),
    formaPagamento: z.string(),
    dataPag: z.string(),
    sinal: z.enum(['S', 'N']),

    //se sim
    qualValor: z.string(),
    dataPagSinal: z.string(),

    multaPagamento: z.string(),
    juros: z.string(),
    /** */

    /** GARANTIAS */
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

    procedimentoDevolucao: z.string(),
    /** */

    /**OBRIGAÇÕES DO LOCADOR */
    locadorResponsaManu: z.string(),
    locadorServicoAdicional: z.string(),
    /** */

    /**OBRIGAÇÃO DO LOCATÁRIO */
    locatarioSublocar: z.string(),
    locatarioManu: z.string(),
    locatarioLeis: z.string(),
    locatarioMultas: z.string(),
    locatarioComuni: z.string(),
    locatarioDesgaste: z.string(),
    /** */

    /**DESPESAS E TRIBUTOS */
    despesasLocatario: z.string(),
    despesaLocador: z.string(),
    /** */

    /**RESCISÃO DO CONTRATO */
    condicoesAntecipada: z.string(),
    multasRescisao: z.string(),
    prazoNoti: z.string(),
    /** */




    /**DISPOSICOES GERAIS */
    foroeleito: z.string(),
    testemunhas: z.enum(['S', 'N']),

    //se sim 
    nomeTest1: z.string(),
    cpfTest1: z.string(),
    nomeTest2: z.string(),
    cpfTest2: z.string(),

    registroCartorio: z.enum(['S', 'N']),
    /** */
});

type FormData = z.infer<typeof Locacaoveiculoschema>;


export default function LocacaoVeiculo() {
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
    const [locadorJuri, setLocadorJuri] = useState(false);
    const [locadorioJuri, setLocadorioJuri] = useState(false);
    const [possibilidadeRenov, setPossibilidadeRenov] = useState(false);
    const [tempoAdicional, setTempoAdicional] = useState(false);
    const [Parcelado, setParcelado] = useState(false);
    const [garantia, setGarantia] = useState(false);
    const [fiador, setFiador] = useState(false);
    const [caucaoDep, setCaucaoDep] = useState(false);
    const [caucaoBemIM, setCaucaoBemIM] = useState(false);
    const [titulos, setTitulos] = useState(false);
    const [seguroFi, setSeguroFi] = useState(false);
    const [garantiaManutencao, setGarantiaManutencao] = useState(false);
    const [testemunhas, setTestemunhas] = useState(false);
    const [sinal, setSinal] = useState(false);




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

        if (currentStepData.possibilidadeRenov === 'S') {
            setPossibilidadeRenov(true)
            nextStep = 36;
        } else if (currentStepData.possibilidadeRenov === 'N') {
            nextStep = 37;
        }

        if (currentStepData.sinal === 'S') {
            setSinal(true)
            nextStep = 40;
        } else if (currentStepData.sinal === 'N') {
            nextStep = 42;
        }



        if (currentStepData.garantia === 'S') {
            setGarantia(true);
            nextStep = 45;
        } else if (currentStepData.garantia === 'N') {
            nextStep = 59;
        }


        if (nextStep === 54) {
            nextStep = 59
        } else if (nextStep === 55) {
            nextStep = 59
        } else if (nextStep === 56) {
            nextStep = 59
        } else if (nextStep === 57) {
            nextStep = 59
        }


        switch (currentStepData.qualgarantidor) {
            case "fi":
                setFiador(true);
                break;
            case "caudep":
                setCaucaoDep(true);
                nextStep = 55;
                break;
            case "caubem":
                setCaucaoBemIM(true);
                nextStep = 56;
                break;
            case "ti":
                setTitulos(true);
                nextStep = 57;
                break;
            case "segfianca":
                setSeguroFi(true);
                nextStep = 58;
                break;
            default:
                break;
        }




        if (currentStepData.testemunhas === 'S') {
            setTestemunhas(true);
            nextStep = 74
        } else if (currentStepData.testemunhas === 'N') {
            nextStep = 78
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



    const handleBack = () => setStep((prev) => prev - 1);

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


    const geradorlocacaoVeiculoPdf = (dados: any) => {
        const doc = new jsPDF();

        // Configuração inicial de fonte e margens
        const marginX = 10;
        const pageWidth = 190; // Largura da página útil (A4 menos margens)
        let posY = 20;

        // Função auxiliar para adicionar seções e ajustar a posição Y
        const addSection = (title: string, content: string[]) => {
            if (posY + 10 >= 280) {
                doc.addPage();
                posY = 20;
            }
            doc.setFontSize(12);
            doc.text(title, 105, posY, { align: "center" }); // Centralizado
            posY += 10;

            doc.setFontSize(10);
            content.forEach((text) => {
                const lines = doc.splitTextToSize(text, pageWidth - 2 * marginX); // Divide o texto automaticamente
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

        // Cabeçalho
        doc.setFontSize(14);
        doc.text("CONTRATO DE LOCAÇÃO DE VEÍCULOS", 105, posY, { align: "center" });
        posY += 15;

        // CLÁUSULA PRIMEIRA – DA IDENTIFICAÇÃO DAS PARTES
        addSection("CLÁUSULA PRIMEIRA – DA IDENTIFICAÇÃO DAS PARTES", [
            "Conforme o Código Civil Brasileiro (Art. 104 e Art. 566), as partes devem ser plenamente capazes e identificadas de forma clara. O locador e o locatário declaram estar aptos para firmar o presente contrato.",
            "- As partes devem ser plenamente capazes e identificadas de forma clara.",
            `Locador: ${dados.locador === "pf" ? "Pessoa Física" : "Pessoa Jurídica"}`,
            dados.locador === "pf"
                ? `Nome: ${dados.nomeLocador}, CPF: ${dados.CPFLocador}`
                : `Razão Social: ${dados.razaoSocial}, CNPJ: ${dados.cnpj}`,
            `Endereço: ${dados.enderecoLocador}`,
            `Telefone: ${dados.telefoneLocador}`,
            `E-mail: ${dados.emailLocador}`,
            dados.locador === "pj" ? `Representante Legal: ${dados.nomeRepresentanteCNPJ}, CPF: ${dados.CPFRepresentanteCNPJ}` : "",
            "",
            `Locatário: ${dados.locatario === "pf" ? "Pessoa Física" : "Pessoa Jurídica"}`,
            dados.locatario === "pf"
                ? `Nome: ${dados.nomelocatario}, CPF: ${dados.CPFlocatario}`
                : `Razão Social: ${dados.razaoSociallocatario}, CNPJ: ${dados.cnpjLocatario}`,
            `Endereço: ${dados.enderecolocatario}`,
            `Telefone: ${dados.telefonelocatario}`,
            `E-mail: ${dados.emaillocatario}`,
            dados.locatario === "pj" ? `Representante Legal: ${dados.nomeRepresentantelocatarioCNPJ}, CPF: ${dados.CPFRepresentantelocatarioCNPJ}` : "",
        ]);

        // CLÁUSULA SEGUNDA – DESCRIÇÃO DO VEÍCULO
        addSection("CLÁUSULA SEGUNDA – DESCRIÇÃO DO VEÍCULO", [

            `Marca: ${dados.marca}`,
            `Modelo: ${dados.modelo}`,
            `Ano de Fabricação: ${dados.anoFabricacao}`,
            `Cor: ${dados.cor}`,
            `Placa: ${dados.placa}`,
            `Renavam: ${dados.renavam}`,
            `Quilometragem Atual: ${dados.quilometragem}`,
            `Estado Geral do Veículo: ${dados.estadoGeral}`,
        ]);

        // CLÁUSULA TERCEIRA – PRAZO DA LOCAÇÃO
        addSection("CLÁUSULA TERCEIRA – PRAZO DA LOCAÇÃO", [
            "Nos termos do Art. 565 do Código Civil, o locador se obriga a ceder o uso do veículo ao locatário pelo período e condições estabelecidos neste contrato.",
            `Data de Início da Locação: ${dados.dataInicioLoc}`,
            `Data de Término da Locação: ${dados.dataFimLoc}`,
            `Possibilidade de Renovação: ${dados.possibilidadeRenov === "S" ? "Sim" : "Não"}`,
            dados.possibilidadeRenov === "S" ? `Condições de Renovação: ${dados.quaisCondicoes}` : "",
        ]);

        // CLÁUSULA QUARTA – VALOR DO ALUGUEL E CONDIÇÕES DE PAGAMENTO
        addSection("CLÁUSULA QUARTA – VALOR DO ALUGUEL E CONDIÇÕES DE PAGAMENTO", [
            "O pagamento do aluguel deverá seguir as disposições do Art. 565 do Código Civil, sendo que qualquer atraso poderá acarretar penalidades previstas em lei.",

            `Valor do Aluguel: ${dados.valor} (${dados.comoSeraCobrado})`,
            `Forma de Pagamento: ${dados.formaPagamento}`,
            `Data(s) de Pagamento: ${dados.dataPag}`,
            `Exigência de Sinal ou Adiantamento: ${dados.sinal === "S" ? "Sim" : "Não"}`,
            dados.sinal === "S" ? `Valor do Sinal: ${dados.qualValor}, Data de Pagamento: ${dados.dataPagSinal}` : "",
            `Multa por Atraso no Pagamento: ${dados.multaPagamento}`,
            `Juros Aplicáveis em Caso de Atraso: ${dados.juros}`,
        ]);

        // CLÁUSULA QUINTA – GARANTIAS LOCATÍCIAS
        addSection("CLÁUSULA QUINTA – GARANTIAS LOCATÍCIAS", [
            "Nos termos do Art. 602 do Código Civil, poderá ser exigida garantia para assegurar o cumprimento do contrato, conforme acordado entre as partes.",

            `Tipo de Garantia Exigida: ${dados.garantia === "S" ? "Sim" : "Não"}`,
            dados.garantia === "S" ? `Detalhes da Garantia: ${dados.qualgarantidor}` : "",
            dados.qualgarantidor === "fi"
                ? `Fiador: ${dados.nomeFiador}, CPF: ${dados.cpfFiador}, Endereço: ${dados.enderecoFiador}`
                : "",
            dados.qualgarantidor === "caudep" ? `Valor da Caução em Dinheiro: ${dados.valorTitCaucao}` : "",
            dados.qualgarantidor === "caubem" ? `Descrição do Bem em Caução: ${dados.descBemCaucao}` : "",
            dados.qualgarantidor === "ti" ? `Título de Crédito Utilizado: ${dados.descCredUtili}` : "",
            dados.qualgarantidor === "segfianca" ? `Seguro-Fiança: ${dados.segFianca}` : "",
            `Procedimento para Devolução da Garantia: ${dados.procedimentoDevolucao}`,
        ]);

        // CLÁUSULA SEXTA – OBRIGAÇÕES DO LOCADOR
        addSection("CLÁUSULA SEXTA – OBRIGAÇÕES DO LOCADOR", [
            "O locador deverá garantir ao locatário o uso pacífico do bem locado, nos termos do Art. 569 do Código Civil, sendo responsável por manutenções essenciais ao funcionamento do veículo.",

            `O locador se responsabiliza por: ${dados.locadorResponsaManu}`,
            `Serviços Adicionais Fornecidos: ${dados.locadorServicoAdicional}`,
        ]);

        // CLÁUSULA SÉTIMA – OBRIGAÇÕES DO LOCATÁRIO
        addSection("CLÁUSULA SÉTIMA – OBRIGAÇÕES DO LOCATÁRIO", [
            "Conforme o Art. 570 do Código Civil, o locatário deverá utilizar o veículo de forma adequada e devolver o bem no estado em que o recebeu, salvo o desgaste natural.",

            `O locatário pode sublocar ou ceder o veículo a terceiros? ${dados.locatarioSublocar}`,
            `O locatário é responsável por: ${dados.locatarioManu}`,
            `O locatário deve respeitar as leis de trânsito? ${dados.locatarioLeis}`,
            `O locatário é responsável por multas e infrações? ${dados.locatarioMultas}`,
            `O locatário deve comunicar acidentes ou danos? ${dados.locatarioComuni}`,
            `O locatário deve devolver o veículo no mesmo estado? ${dados.locatarioDesgaste}`,
        ]);

        // CLÁUSULA OITAVA – DESPESAS E TRIBUTOS
        addSection("CLÁUSULA OITAVA – DESPESAS E TRIBUTOS", [
            "Nos termos do Código Civil, despesas ordinárias decorrentes do uso do veículo são de responsabilidade do locatário, enquanto despesas extraordinárias ficam a cargo do locador.",

            `Despesas do Locatário: ${dados.despesasLocatario}`,
            `Despesas do Locador: ${dados.despesaLocador}`,
        ]);

        // CLÁUSULA NONA – RESCISÃO DO CONTRATO
        addSection("CLÁUSULA NONA – RESCISÃO DO CONTRATO", [
            "A rescisão do contrato poderá ocorrer conforme as regras do Art. 474 do Código Civil, sendo aplicáveis penalidades em caso de descumprimento.",

            `Condições para Rescisão Antecipada: ${dados.condicoesAntecipada}`,
            `Multas ou Penalidades: ${dados.multasRescisao}`,
            `Prazo para Notificação Prévia: ${dados.prazoNoti}`,
        ]);

        // CLÁUSULA DÉCIMA – DISPOSIÇÕES GERAIS
        addSection("CLÁUSULA DÉCIMA – DISPOSIÇÕES GERAIS", [
            "Nos termos do Art. 585 do Código Civil, este contrato constitui título executivo extrajudicial, podendo ser levado a juízo para cobrança de valores inadimplidos.",

            `Foro Eleito para Resolução de Conflitos: ${dados.foroeleito}`,
            `Necessidade de Testemunhas: ${dados.testemunhas === "S" ? "Sim" : "Não"}`,
            dados.testemunhas === "S"
                ? `Testemunha 1: ${dados.nomeTest1}, CPF: ${dados.cpfTest1}`
                : "",
            dados.testemunhas === "S"
                ? `Testemunha 2: ${dados.nomeTest2}, CPF: ${dados.cpfTest2}`
                : "",
            `O contrato será registrado em cartório? ${dados.registroCartorio === "S" ? "Sim" : "Não"}`,
        ]);

        addSection("CLÁUSULA DÉCIMA PRIMEIRA – ASSINATURAS", [
            "As partes contratantes, após leitura e entendimento das condições estabelecidas neste contrato, assinam o presente em duas vias de igual teor e forma.",
            "",
            `Locador: _____________________________  (Assinatura)`,
            `Locatário: _____________________________  (Assinatura)`,
            dados.testemunhas === "S" ? `Testemunha 1: _____________________________  (Assinatura)` : "",
            dados.testemunhas === "S" ? `Testemunha 2: _____________________________  (Assinatura)` : "",
        ]);

        // Salvar o PDF
        const pdfDataUri = doc.output("datauristring");
        setPdfDataUrl(pdfDataUri);
    };

    useEffect(() => {
        geradorlocacaoVeiculoPdf({ ...formData });
    }, [formData]);

    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title">Contrato de Locação de Veículo</h1>

            </div>
            <div className="container">
                <div className="left-panel">
                    <div className="scrollable-card">

                        <div className="progress-bar">
                            <div
                                className="progress-bar-inner"
                                style={{ width: `${(step / 78) * 100}%` }}
                            ></div>
                        </div>
                        <div className="form-wizard">
                            {step === 1 && (
                                <>
                                    <h2>Dados do Responsável pelo Veículo</h2>
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
                                    <h2> Dados do Responsável pelo Veículo </h2>
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
                                    <h2> Dados do Responsável pelo Veículo</h2>
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
                                    <h2>Dados do Responsável pelo Veículo</h2>
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
                                    <h2>Dados do Responsável pelo Veículo</h2>
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
                                    <h2>Dados do Responsável pelo Veículo</h2>
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
                                            <h2>Dados do Responsável pelo Veículo</h2>
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
                                            <h2>Dados do Responsável pelo Veículo</h2>
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
                                            <h2>Dados do Responsável pelo Veículo</h2>
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
                                            <h2>Dados do Responsável pelo Veículo</h2>
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
                                            <h2>Dados do Responsável pelo Veículo</h2>
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
                                            <h2>Dados do Responsável pelo Veículo</h2>
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
                                    <h2>Dados do Locatário do Veículo</h2>
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
                                    <h2>Dados do Locatário do Veículo</h2>
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
                                    <h2>Dados do Locatário do Veículo</h2>
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
                                    <h2>Dados do Locatário do Veículo</h2>
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
                                    <h2>Dados do Locatário do Veículo</h2>
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
                                    <h2>Dados do Locatário do Veículo</h2>
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
                                            <h2>Dados do Locatário do Veículo</h2>
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
                                            <h2>Dados do Locatário do Veículo</h2>
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
                                            <h2>Dados do Locatário do Veículo</h2>
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
                                            <h2>Dados do Locatário do Veículo</h2>
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
                                            <h2>Dados do Locatário do Veículo</h2>
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
                                            <h2>Dados do Locatário do Veículo</h2>
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
                                    <h2>Descrição do Veículo</h2>
                                    <div>
                                        <label>Marca</label>
                                        <input
                                            type='text'
                                            placeholder='Marca do veiculo'
                                            name="marca"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 26 && (
                                <>
                                    <h2>Descrição do Veículo</h2>
                                    <div>
                                        <label>Modelo</label>
                                        <input
                                            type='text'
                                            placeholder='Modelo do veiculo'
                                            name="modelo"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 27 && (
                                <>
                                    <h2>Descrição do Veículo</h2>
                                    <div>
                                        <label>Ano de Fabricação</label>
                                        <input
                                            type='text'
                                            placeholder='Ano de fabricação'
                                            name="anoFabricacao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 28 && (
                                <>
                                    <h2>Descrição do Veículo</h2>
                                    <div>
                                        <label>Cor</label>
                                        <input
                                            type='text'
                                            placeholder='cor do veiculo'
                                            name="cor"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 29 && (
                                <>
                                    <h2>Descrição do Veículo</h2>
                                    <div>
                                        <label>Cor</label>
                                        <input
                                            type='text'
                                            placeholder='cor do veiculo'
                                            name="cor"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 30 && (
                                <>
                                    <h2>Descrição do Veículo</h2>
                                    <div>
                                        <label>Placa</label>
                                        <input
                                            type='text'
                                            placeholder='placa do veiculo'
                                            name="placa"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 31 && (
                                <>
                                    <h2>Descrição do Veículo</h2>
                                    <div>
                                        <label>Renavam</label>
                                        <input
                                            type='renavam'
                                            placeholder='renavam'
                                            name="placa"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 32 && (
                                <>
                                    <h2>Descrição do Veículo</h2>
                                    <div>
                                        <label>Quilometragem atual</label>
                                        <input
                                            type='text'
                                            placeholder='quilometragem do veiculo'
                                            name="quilometragem"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 33 && (
                                <>
                                    <h2>Descrição do Veículo</h2>
                                    <div>
                                        <label>Estado geral do veículo (incluir laudo de vistoria, se necessário)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="estadoGeral"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 34 && (
                                <>
                                    <h2>Prazo da Locação </h2>
                                    <div>
                                        <label>Data de início da locação</label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="dataInicioLoc"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 35 && (
                                <>
                                    <h2>Prazo da Locação </h2>
                                    <div>
                                        <label>Data de término da locação</label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="dataFimLoc"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 36 && (
                                <>
                                    <h2>Prazo da Locação</h2>
                                    <div>
                                        <label>Possibilidade de renovação?</label>
                                        <select name='possibilidadeRenov' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {possibilidadeRenov && (
                                <>
                                    {step === 36 && (
                                        <>
                                            <h2>Prazo da Locação </h2>
                                            <div>
                                                <label>Quais são as condições?</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="quaisCondicoes"
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
                                    <h2>Valor do Aluguel e Condições de Pagamento</h2>
                                    <div>
                                        <label>Será cobrado por dia,semana ou mês ?</label>
                                        <select name='comoSeraCobrado' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="dia">Dia</option>
                                            <option value="semana">Semana</option>
                                            <option value="mês">Mês</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 36 && (
                                <>
                                    <h2>Valor do Aluguel e Condições de Pagamento </h2>
                                    <div>
                                        <label>Valor da Locação </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="valor"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 37 && (
                                <>
                                    <h2>Valor do Aluguel e Condições de Pagamento</h2>
                                    <div>
                                        <label>Forma de pagamento (ex.: depósito bancário, boleto, Pix) </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="formaPagamento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 38 && (
                                <>
                                    <h2>Valor do Aluguel e Condições de Pagamento</h2>
                                    <div>
                                        <label>Data(s) de pagamento</label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="dataPag"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 39 && (
                                <>
                                    <h2>Valor do Aluguel e Condições de Pagamento </h2>
                                    <div>
                                        <label>Exigência de sinal ou adiantamento</label>
                                        <select name='sinal' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {sinal && (
                                <>
                                    {step === 40 && (
                                        <>
                                            <h2>Valor do Aluguel e Condições de Pagamento</h2>
                                            <div>
                                                <label>Qual valor</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="qualValor"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 41 && (
                                        <>
                                            <h2>Valor do Aluguel e Condições de Pagamento</h2>
                                            <div>
                                                <label>Qual é data de pagamento ?</label>
                                                <input
                                                    type='date'
                                                    placeholder=''
                                                    name="dataPagSinal"
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
                                    <h2>Valor do Aluguel e Condições de Pagamento</h2>
                                    <div>
                                        <label>Multa por atraso no pagamento</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="multaPagamento"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 43 && (
                                <>
                                    <h2>Valor do Aluguel e Condições de Pagamento</h2>
                                    <div>
                                        <label>Juros aplicáveis em caso de atraso</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="juros"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 44 && (
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
                                    {step === 45 && (
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
                                    {step === 46 && (
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
                                                    <button onClick={handleNext}>Próximo</button>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 47 && (
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
                                                    <button onClick={handleNext}>Próximo</button>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 48 && (
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
                                                    <button onClick={handleNext}>Próximo</button>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 49 && (
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
                                                    <button onClick={handleNext}>Próximo</button>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 50 && (
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
                                                    <button onClick={handleNext}>Próximo</button>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 51 && (
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
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 52 && (
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
                                                    <button onClick={handleNext}>Próximo</button>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 53 && (
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
                                                    <button onClick={handleNext}>Próximo</button>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {step === 54 && (
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
                                                    <button onClick={handleNext}>Próximo</button>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                </>
                            )}

                            {caucaoDep && (
                                <>
                                    {step === 55 && (
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
                                                    <button onClick={handleNext}>Próximo</button>
                                                </div>
                                            </div>
                                        </>
                                    )}



                                </>
                            )}

                            {caucaoBemIM && (
                                <>
                                    {step === 56 && (
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
                                                    <button onClick={handleNext}>Próximo</button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {titulos && (
                                <>
                                    {step === 57 && (
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
                                                    <button onClick={handleNext}>Próximo</button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {seguroFi && (
                                <>
                                    {step === 58 && (
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
                                                    <button onClick={handleNext}>Próximo</button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 59 && (
                                <>
                                    <h2>Obrigações do Locador</h2>
                                    <div>
                                        <label>O locador se responsabiliza por quais manutenções ou reparos no veículo?</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="locadorResponsaManu"
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
                                    <h2>Obrigações do Locador</h2>
                                    <div>
                                        <label>O locador fornecerá algum serviço adicional (ex.: seguro, assistência 24h)?</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="locadorServicoAdicional"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 61 && (
                                <>
                                    <h2>Obrigações do Locatário</h2>
                                    <div>
                                        <label>O locatário pode sublocar ou ceder o veículo a terceiros? </label>
                                        <div>
                                            <select name='locatarioSublocar' onChange={handleChange}>
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
                                    <h2>Obrigações do Locatário</h2>
                                    <div>
                                        <label>O locatário é responsável por quais manutenções no veículo?</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="locatarioManu"
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
                                    <h2>Obrigações do Locatário</h2>
                                    <div>
                                        <label>O locatário deve respeitar as leis de trânsito e utilizar o veículo de forma adequada?</label>
                                        <div>
                                            <select name='locatarioLeis' onChange={handleChange}>
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

                            {step === 64 && (
                                <>
                                    <h2>Obrigações do Locatário</h2>
                                    <div>
                                        <label>O locatário é responsável por multas e infrações de trânsito ocorridas durante o período de locação? </label>
                                        <div>
                                            <select name='locatarioMultas' onChange={handleChange}>
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

                            {step === 65 && (
                                <>
                                    <h2>Obrigações do Locatário</h2>
                                    <div>
                                        <label>O locatário deve comunicar imediatamente ao locador sobre qualquer acidente ou dano ao veículo? </label>
                                        <div>
                                            <select name='locatarioComuni' onChange={handleChange}>
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
                                    <h2>Obrigações do Locatário</h2>
                                    <div>
                                        <label>O locatário deve devolver o veículo no mesmo estado em que o recebeu, salvo desgaste natural? </label>
                                        <div>
                                            <select name='locatarioDesgaste' onChange={handleChange}>
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


                            {step === 67 && (
                                <>
                                    <h2>Despesas e Tributos</h2>
                                    <div>
                                        <label>Quais despesas são de responsabilidade do locatário? (ex.: combustível, pedágios, multas)  </label>
                                        <div>
                                            <textarea
                                                id="despesasLocatario"
                                                name="despesasLocatario"
                                                onChange={handleChange}
                                                rows={10}
                                                cols={50}
                                                placeholder="Descrição"
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 68 && (
                                <>
                                    <h2>Despesas e Tributos</h2>
                                    <div>
                                        <label>Quais despesas são de responsabilidade do locador? (ex.: manutenção preventiva, seguro) </label>
                                        <div>
                                            <textarea
                                                id="despesaLocador"
                                                name="despesaLocador"
                                                onChange={handleChange}
                                                rows={10}
                                                cols={50}
                                                placeholder="Descrição"
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 69 && (
                                <>
                                    <h2>Recisão de Contrato</h2>
                                    <div>
                                        <label>Condições para rescisão antecipada por ambas as partes</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="condicoesAntecipada"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}



                            {step === 70 && (
                                <>
                                    <h2>Recisão de Contrato</h2>
                                    <div>
                                        <label>Multas ou penalidades aplicáveis em caso de rescisão antecipada</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="multasRescisao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 71 && (
                                <>
                                    <h2>Recisão de Contrato</h2>
                                    <div>
                                        <label>Prazo para notificação prévia de rescisão</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="prazoNoti"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 72 && (
                                <>
                                    <h2>Disposições Gerais</h2>
                                    <div>
                                        <label>Foro eleito para resolução de conflitos</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="foroeleito"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 73 && (
                                <>
                                    <h2>Disposições Gerais</h2>
                                    <div>
                                        <label>Necessidade de testemunhas para assinatura do contrato</label>
                                        <select name='testemunhas' onChange={handleChange}>
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
                                    {step === 74 && (
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

                                    {step === 75 && (
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

                                    {step === 76 && (
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

                                    {step === 77 && (
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

                            {step === 78 && (
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


                            {step === 79 && (
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
                    <button className='btnBaixarPdf' onClick={() => { }}>
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