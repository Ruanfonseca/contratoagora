'use client'
import Pilha from '@/lib/pilha';
import { verificarValor } from '@/lib/utils';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';
import geradordoacaosimplespago from '../util/pdf';


const doacaosimplesschema = z.object({
    doador: z.enum(['fisica', 'juridico']),

    /****  Doador pf ****** */
    nomeDoador: z.string(),
    sexo: z.enum(['M', 'F']),
    estadoCivil: z.string(),
    nacionalidade: z.string(),
    profissao: z.string(),
    Rg: z.string(),
    orgaoEmissor: z.string(),
    uf: z.string(),
    cpf: z.string(),
    endereco: z.string(),
    /** */

    /**Doador pj */
    razaoSocial: z.string(),
    cnpj: z.string(),
    enderecoSede: z.string(),
    nomeRepresentante: z.string(),
    cargoRepresentante: z.string(),
    cpfRepresentante: z.string(),
    enderecoRepresentante: z.string(),
    /** */

    donatario: z.enum(['fisica', 'juridico']),

    /****  Doador pf ****** */
    nomeDona: z.string(),
    sexoDona: z.enum(['M', 'F']),
    estadoCivilDona: z.string(),
    nacionalidadeDona: z.string(),
    profissaoDona: z.string(),
    RgDona: z.string(),
    orgaoEmissorDona: z.string(),
    ufDona: z.string(),
    cpfDona: z.string(),
    enderecoDona: z.string(),
    /** */

    /**Doador pj */
    razaoSocialDona: z.string(),
    cnpjDona: z.string(),
    enderecoSedeDona: z.string(),
    nomeRepresentanteDona: z.string(),
    cargoRepresentanteDona: z.string(),
    cpfRepresentanteDona: z.string(),
    enderecoRepresentanteDona: z.string(),
    /** */



    /**Objeto */
    descricaoDetalhada: z.string(),
    qtd: z.string(),
    marcaModelo: z.string(),
    numeroRegistro: z.string(),
    localizacao: z.string(),
    realizacaoAnterior: z.enum(['anterior', 'nadata']),
    contempla: z.enum(['unico', 'multiplos']),
    /** */

    /**Transferencia */
    transferProp: z.enum(['dataAssinatura', 'dataEspecifica']),
    //se sim
    dataEspec: z.string(),
    /** */

    /**Responsabilidades */
    despesas: z.enum(['despesasDoador', 'despesasDonatario', 'despesasAmbos']),
    //se for despesasAmbos
    porcentagemDoador: z.string(),
    porcentagemDonatario: z.string(),
    /** */

    /**Foro */
    cidadeComarca: z.string(),
    estadoComarca: z.string(),
    /** */

    /**Assinatura */
    vias: z.string(),
    local: z.string(),
    data: z.string(),
    /** */
});

type FormData = z.infer<typeof doacaosimplesschema>;


export default function DoacaoSimples() {
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
    const [despesas, setDespesas] = useState(false);
    const [dataEspecifica, setDataEspecifica] = useState(false);
    const [doadorpj, setDoadorpj] = useState(false);
    const [donatariopj, setDonatariopj] = useState(false);
    const pilha = useRef(new Pilha());


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurrentStepData((prev) => ({ ...prev, [name]: value }));
    };

    const handleNext = () => {
        setFormData((prev) => ({ ...prev, ...currentStepData }));
        let nextStep = step;

        if (currentStepData.doador === 'fisica') {
            nextStep = 2;
        } else if (currentStepData.doador === 'juridico') {
            setDoadorpj(true);
            nextStep = 11;
        }

        if (nextStep === 10) {
            nextStep = 18;
        }



        if (currentStepData.donatario === 'fisica') {
            nextStep = 19;
        } else if (currentStepData.donatario === 'juridico') {
            setDonatariopj(true);
            nextStep = 28;
        }

        if (nextStep === 27) {
            nextStep = 35;
        }


        if (currentStepData.transferProp === 'dataAssinatura') {
            nextStep = 44;
        } else if (currentStepData.transferProp === 'dataEspecifica') {
            setDataEspecifica(true);
            nextStep = 43;
        }

        if (currentStepData.despesas === 'despesasDoador') {
            nextStep = 46;
        } if (currentStepData.despesas === 'despesasDonatario') {
            nextStep = 46;
        } else if (currentStepData.despesas === 'despesasAmbos') {
            setDespesas(true);
            nextStep = 45;
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


    const geradordoacaosimplespdf = (dados: any) => {
        const doc = new jsPDF();

        // Configuração inicial de fonte ABNT e margens
        doc.setFont("Times");
        const marginLeft = 30;
        const marginRight = 20;
        const marginTop = 20;
        const marginBottom = 20;
        let posY = marginTop;

        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        const maxTextWidth = pageWidth - marginLeft - marginRight;

        // Espaçamento entre linhas 1,5
        const lineHeight = 7.5;

        // Função auxiliar para verificar espaço restante na página
        const checkPageBreak = (additionalHeight: number) => {
            if (posY + additionalHeight >= pageHeight - marginBottom) {
                doc.addPage();
                posY = marginTop;
            }
        };

        // Função auxiliar para adicionar seções formatadas segundo ABNT
        const addSection = (title: string, content: string[]) => {
            const titleHeight = 10;

            // Título da seção
            checkPageBreak(titleHeight);
            doc.setFontSize(12);
            doc.setFont("Times", "bold");
            doc.text(title, pageWidth / 2, posY, { align: "center" });
            posY += titleHeight;

            // Texto do conteúdo
            doc.setFontSize(12);
            doc.setFont("Times", "normal");
            content.forEach((line: string) => {
                const splitLines = doc.splitTextToSize(line, maxTextWidth);
                splitLines.forEach((splitLine: string) => {
                    checkPageBreak(lineHeight);
                    doc.text(splitLine, marginLeft, posY);
                    posY += lineHeight;
                });
            });
        };


        // Cabeçalho da primeira página
        doc.setFontSize(14);
        doc.setFont("Times", "bold");
        doc.text("CONTRATO DE DOAÇÃO", pageWidth / 2, posY, { align: "center" });
        posY += 15;

        doc.setFontSize(12);
        doc.setFont("Times", "normal");
        const introText = "Pelo presente instrumento particular de doação, de um lado, como DOADOR(A), e de outro, como DONATÁRIO(A), têm entre si, justa e contratada, a doação do bem descrito neste contrato, mediante as cláusulas e condições seguintes, que mutuamente outorgam e aceitam, na forma da Lei nº 10.406/2002 (Código Civil Brasileiro). ";
        const introLines = doc.splitTextToSize(introText, maxTextWidth);
        introLines.forEach((line: string) => {
            checkPageBreak(lineHeight);
            doc.text(line, marginLeft, posY);
            posY += lineHeight;
        });

        // CLÁUSULA PRIMEIRA – DAS PARTES
        const clausulaPrimeira = [
            "1.1. DOADOR(A):",
            `Natureza: (${dados.doador === 'fisica' ? 'X' : ' '}) Pessoa Física  (${dados.doador === 'juridico' ? 'X' : ' '}) Pessoa Jurídica`,
            "",
            "Se Pessoa Física:",
            `Nome completo: ${verificarValor(dados.nomeDoador)}`,
            `Sexo: ${verificarValor(dados.sexo)} Estado Civil: ${verificarValor(dados.estadoCivil)} Nacionalidade: ${verificarValor(dados.nacionalidade)}`,
            `Profissão: ${verificarValor(dados.profissao)}`,
            `Documento de Identificação: ${verificarValor(dados.Rg)} Órgão Emissor/UF: ${verificarValor(dados.orgaoEmissor)}/${verificarValor(dados.uf)}`,
            `CPF nº: ${verificarValor(dados.cpf)}`,
            `Endereço completo: ${verificarValor(dados.endereco)}`,
            "",
            "Se Pessoa Jurídica:",
            `Razão Social: ${verificarValor(dados.razaoSocial)}`,
            `CNPJ nº: ${verificarValor(dados.cnpj)}`,
            `Endereço da sede: ${verificarValor(dados.enderecoSede)}`,
            `Representante Legal: ${verificarValor(dados.nomeRepresentante)}`,
            `Cargo: ${verificarValor(dados.cargoRepresentante)}`,
            `CPF nº: ${verificarValor(dados.cpfRepresentante)}`,
            `Endereço do Representante: ${verificarValor(dados.enderecoRepresentante)}`,
            "",
            "1.2. DONATÁRIO(A):",
            `Natureza: (${dados.donatario === 'fisica' ? 'X' : ' '}) Pessoa Física  (${dados.donatario === 'juridico' ? 'X' : ' '}) Pessoa Jurídica`,
            "",
            "Se Pessoa Física:",
            `Nome completo: ${verificarValor(dados.nomeDona)}`,
            `Sexo: ${verificarValor(dados.sexoDona)} Estado Civil: ${verificarValor(dados.estadoCivilDona)} Nacionalidade: ${verificarValor(dados.nacionalidadeDona)}`,
            `Profissão: ${verificarValor(dados.profissaoDona)}`,
            `Documento de Identificação: ${verificarValor(dados.RgDona)} Nº: ___________ Órgão Emissor/UF: ${verificarValor(dados.orgaoEmissorDona)}/${verificarValor(dados.ufDona)}`,
            `CPF nº: ${verificarValor(dados.cpfDona)}`,
            `Endereço completo: ${verificarValor(dados.enderecoDona)}`,
            "",
            "Se Pessoa Jurídica:",
            `Razão Social: ${verificarValor(dados.razaoSocialDona)}`,
            `CNPJ nº: ${verificarValor(dados.cnpjDona)}`,
            `Endereço da sede: ${verificarValor(dados.enderecoSedeDona)}`,
            `Representante Legal: ${verificarValor(dados.nomeRepresentanteDona)}`,
            `Cargo: ${verificarValor(dados.cargoRepresentanteDona)}`,
            `CPF nº: ${verificarValor(dados.cpfRepresentanteDona)}`,
            `Endereço do Representante: ${verificarValor(dados.enderecoRepresentanteDona)}`
        ];
        addSection("CLÁUSULA PRIMEIRA – DAS PARTES", clausulaPrimeira);

        // CLÁUSULA SEGUNDA – DO OBJETO DA DOAÇÃO
        const clausulaSegunda = [
            "2.1 O(a) DOADOR(A) doa, a título gratuito, ao(à) DONATÁRIO(A), que aceita, os seguintes bens:",
            "",
            `Descrição detalhada: ${verificarValor(dados.descricaoDetalhada)}`,
            `Quantidade: ${verificarValor(dados.qtd)} Marca/modelo: ${verificarValor(dados.marcaModelo)}`,
            `Número de série ou registro (se aplicável): ${verificarValor(dados.numeroRegistro)}`,
            `Localização: ${verificarValor(dados.localizacao)}`,
            "",
            "2.2 A doação:",
            ` (${dados.realizacaoAnterior === 'anterior' ? 'X' : ' '}) Já foi realizada anteriormente à assinatura deste contrato`,
            ` (${dados.realizacaoAnterior === 'nadata' ? 'X' : ' '}) Será realizada na data especificada na Cláusula Quarta`,
            "",
            "2.3 Esta doação contempla:",
            ` (${dados.contempla === 'unico' ? 'X' : ' '}) Um único bem`,
            ` (${dados.contempla === 'multiplos' ? 'X' : ' '}) Múltiplos bens listados acima ou em anexo (Anexo I)`
        ];
        addSection("CLÁUSULA SEGUNDA – DO OBJETO DA DOAÇÃO", clausulaSegunda);

        // CLÁUSULA TERCEIRA – DA MANIFESTAÇÃO DE VONTADE
        const clausulaTerceira = [
            "3.1 O(a) DOADOR(A) declara, de forma livre, consciente e espontânea, sua inequívoca vontade de doar os bens mencionados à parte DONATÁRIA, sem qualquer exigência de contraprestação, encargos ou ônus, salvo os expressamente previstos neste instrumento.",
            "",
            "3.2 O(a) DONATÁRIO(A) manifesta sua total e irrestrita aceitação à doação, comprometendo-se a cumprir eventuais condições e encargos aqui estipulados."
        ];
        addSection("CLÁUSULA TERCEIRA – DA MANIFESTAÇÃO DE VONTADE", clausulaTerceira);

        // CLÁUSULA QUARTA – DA TRANSFERÊNCIA DA PROPRIEDADE
        const clausulaQuarta = [
            "4.1 A transferência da propriedade dos bens se dará:",
            ` (${dados.transferProp === 'dataAssinatura' ? 'X' : ' '}) Na data de assinatura do presente contrato`,
            ` (${dados.transferProp === 'dataEspecifica' ? 'X' : ' '}) Em uma data específica, salvo disposição em contrário ou impedimento legal.`,
            "",
            `Data de Transferência: ${dados.transferProp === 'dataEspecifica' ? verificarValor(dados.dataEspec) : "________"}`,
            "",
            "4.2 A posse e todos os direitos inerentes aos bens ora doados serão imediatamente transferidos ao(à) DONATÁRIO(A), com pleno direito de uso, gozo e disposição, observadas eventuais condições."
        ];
        addSection("CLÁUSULA QUARTA – DA TRANSFERÊNCIA DA PROPRIEDADE", clausulaQuarta);

        // CLÁUSULA QUINTA – DAS CONDIÇÕES E ENCARGOS (SE HOUVER)
        const clausulaQuinta = [
            "5.1 A presente doação está condicionada às seguintes obrigações, encargos ou restrições:",
            "",
            "(Ex: manutenção do bem doado, utilização para fins sociais/educacionais, proibição de alienação por prazo determinado, etc.)",
            "",
            "",
            "5.2 O descumprimento das condições poderá acarretar a revogação da doação, conforme disposto nos artigos 555 a 559 do Código Civil."
        ];
        addSection("CLÁUSULA QUINTA – DAS CONDIÇÕES E ENCARGOS (SE HOUVER)", clausulaQuinta);

        // CLÁUSULA SEXTA – DAS RESPONSABILIDADES E CUSTOS
        const clausulaSexta = [
            "6.1 As partes acordam que:",
            "",
            `(${dados.despesas === 'despesasDoador' ? 'X' : ' '}) Todas as despesas relativas à doação, tais como impostos, taxas, emolumentos, seguros, transportes, registros e demais encargos, correrão por conta do(a) DOADOR(A).`,
            `(${dados.despesas === 'despesasDonatario' ? 'X' : ' '}) Correrão por conta do(a) DONATÁRIO(A).`,
            `(${dados.despesas === 'despesasAmbos' ? 'X' : ' '}) Serão rateadas entre as partes, conforme acordado:`,
            "",
            dados.despesas === 'despesasAmbos' ?
                ` DOADOR(A): ${verificarValor(dados.porcentagemDoador)}% DONATÁRIO(A): ${verificarValor(dados.porcentagemDonatario)}%` :
                " DOADOR(A): ________% DONATÁRIO(A): ________%",
            "",
            "6.2 Eventuais débitos vinculados ao bem até a data da efetiva transferência serão de responsabilidade exclusiva do(a) DOADOR(A), salvo se expressamente pactuado o contrário."
        ];
        addSection("CLÁUSULA SEXTA – DAS RESPONSABILIDADES E CUSTOS", clausulaSexta);

        // CLÁUSULA SÉTIMA – DA RESCISÃO
        const clausulaSetima = [
            "7.1 Este contrato poderá ser rescindido nas seguintes hipóteses:",
            "",
            "a) Descumprimento de qualquer cláusula ou condição aqui estabelecida;",
            "b) Inexistência ou nulidade do objeto da doação;",
            "c) Superveniência de ingratidão do(a) DONATÁRIO(A), nos termos da lei."
        ];
        addSection("CLÁUSULA SÉTIMA – DA RESCISÃO", clausulaSetima);

        // CLÁUSULA OITAVA – DO FORO
        const clausulaOitava = [
            `8.1 Para dirimir quaisquer controvérsias oriundas deste contrato, as partes elegem o foro da Comarca de ${verificarValor(dados.cidadeComarca)}, Estado de ${verificarValor(dados.estadoComarca)}, com renúncia a qualquer outro, por mais privilegiado que seja.`
        ];
        addSection("CLÁUSULA OITAVA – DO FORO", clausulaOitava);

        // CLÁUSULA NONA – DAS DISPOSIÇÕES FINAIS
        const clausulaNona = [
            "9.1 Este contrato é celebrado em caráter irrevogável e irretratável, obrigando as partes, seus herdeiros e sucessores.",
            "",
            "9.2 As partes reconhecem que leram, compreenderam e concordam com todos os termos aqui estipulados."
        ];
        addSection("CLÁUSULA NONA – DAS DISPOSIÇÕES FINAIS", clausulaNona);

        // CLÁUSULA DÉCIMA – DA ASSINATURA
        const clausulaDecima = [
            `E por estarem justas e contratadas, firmam o presente contrato em ${verificarValor(dados.vias)} vias de igual teor, juntamente com duas testemunhas abaixo assinadas.`,
            "",
            `Local: ${verificarValor(dados.local)}`,
            `Data: ${verificarValor(dados.data)}`,
            "",
            "",
            "ASSINATURAS:",
            "",
            "DOADOR(A):",
            `Nome: ${verificarValor(dados.doador === 'fisica' ? dados.nomeDoador : dados.razaoSocial)}`,
            "Assinatura: __________________________________",
            "",
            "DONATÁRIO(A):",
            `Nome: ${verificarValor(dados.donatario === 'fisica' ? dados.nomeDona : dados.razaoSocialDona)}`,
            "Assinatura: __________________________________",
            "",
            "",
            "TESTEMUNHAS:",
            "",
            "1ª TESTEMUNHA:",
            "Nome: ______________________________________",
            "CPF: ________________________________________",
            "Assinatura: ___________________________________",
            "",
            "2ª TESTEMUNHA:",
            "Nome: ______________________________________",
            "CPF: ________________________________________",
            "Assinatura: ___________________________________"
        ];
        addSection("CLÁUSULA DÉCIMA – DA ASSINATURA", clausulaDecima);

        const pdfDataUri = doc.output("datauristring");
        setPdfDataUrl(pdfDataUri);
    };


    useEffect(() => {
        geradordoacaosimplespdf({ ...formData });
    }, [formData]);

    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title">Contrato de Doação Simples </h1>
            </div>
            <div className="container">
                <div className="left-panel">
                    <div className="scrollable-card">
                        <div className="progress-bar">
                            <div
                                className="progress-bar-inner"
                                style={{ width: `${(step / 50) * 100}%` }}
                            ></div>
                        </div>
                        <div className="form-wizard">
                            {step === 1 && (
                                <>
                                    <h2>Doador</h2>                                    <div>
                                        <label>É pessoa </label>
                                        <select name='doador' onChange={handleChange}>
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
                                    <h2>Doador </h2>                                    <div>
                                        <label>Nome completo</label>
                                        <input
                                            type='text'
                                            placeholder='Nome do Doador'
                                            name="nomeDoador"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 3 && (
                                <>
                                    <h2>Doador </h2>                                    <div>
                                        <label>Sexo</label>
                                        <select name='sexo' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="M">Masculino</option>
                                            <option value="F">Feminino</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 4 && (
                                <>
                                    <h2>Doador </h2>                                    <div>
                                        <label>Estado Cívil</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="estadoCivil"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 5 && (
                                <>
                                    <h2>Doador </h2>                                    <div>
                                        <label>Nacionalidade</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="nacionalidade"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 6 && (
                                <>
                                    <h2>Doador </h2>                                    <div>
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
                                    <h2>Doador </h2>                                    <div>
                                        <label>Rg</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="Rg"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 8 && (
                                <>
                                    <h2>Doador </h2>                                    <div>
                                        <label>Órgão Emissor</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="orgaoEmissor"
                                            onChange={handleChange}
                                        />

                                        <label>UF</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="uf"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 9 && (
                                <>
                                    <h2>Doador </h2>                                    <div>
                                        <label>CPF</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="cpf"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 10 && (
                                <>
                                    <h2>Doador </h2>                                    <div>
                                        <label>Endereço completo</label>
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

                            {doadorpj && (
                                <>
                                    {step === 11 && (
                                        <>
                                            <h2>Doador </h2>                                    <div>
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
                                            <h2>Doador </h2>                                    <div>
                                                <label>Cnpj</label>
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
                                            <h2>Doador </h2>                                    <div>
                                                <label>Endereço da Sede</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="enderecoSede"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 14 && (
                                        <>
                                            <h2>Doador </h2>                                    <div>
                                                <label>Nome do Representante Legal</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="nomeRepresentante"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 15 && (
                                        <>
                                            <h2>Doador </h2>                                    <div>
                                                <label>Cargo do Representante Legal</label>
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

                                    {step === 16 && (
                                        <>
                                            <h2>Doador </h2>                                    <div>
                                                <label>Cpf do Representante Legal</label>
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

                                    {step === 17 && (
                                        <>
                                            <h2>Doador </h2>                                    <div>
                                                <label>Endereço do Representante Legal</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="enderecoRepresentante"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}



                            {step === 18 && (
                                <>
                                    <h2>Donatario</h2>                                    <div>
                                        <label>É pessoa </label>
                                        <select name='donatario' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="fisica">Física</option>
                                            <option value="juridico">Jurídico</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 19 && (
                                <>
                                    <h2>Donatario </h2>                                    <div>
                                        <label>Nome completo</label>
                                        <input
                                            type='text'
                                            placeholder='Nome do Donatario'
                                            name="nomeDona"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 20 && (
                                <>
                                    <h2>Donatario </h2>                                    <div>
                                        <label>Sexo</label>
                                        <select name='sexoDona' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="M">Masculino</option>
                                            <option value="F">Feminino</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 21 && (
                                <>
                                    <h2>Donatario </h2>                                    <div>
                                        <label>Estado Cívil</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="estadoCivilDona"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 22 && (
                                <>
                                    <h2>Donatario </h2>                                    <div>
                                        <label>Nacionalidade</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="nacionalidadeDona"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 23 && (
                                <>
                                    <h2>Donatario </h2>                                    <div>
                                        <label>Profissão</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="profissaoDona"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 24 && (
                                <>
                                    <h2>Donatario </h2>                                    <div>
                                        <label>Rg</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="RgDona"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 25 && (
                                <>
                                    <h2>Donatario </h2>                                    <div>
                                        <label>Órgão Emissor</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="orgaoEmissorDona"
                                            onChange={handleChange}
                                        />

                                        <label>UF</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="ufDona"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 26 && (
                                <>
                                    <h2>Donatario </h2>                                    <div>
                                        <label>CPF</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="cpfDona"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 27 && (
                                <>
                                    <h2>Donatario </h2>                                    <div>
                                        <label>Endereço completo</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="enderecoDona"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {donatariopj && (
                                <>
                                    {step === 28 && (
                                        <>
                                            <h2>Donatario </h2>                                    <div>
                                                <label>Razão Social</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="razaoSocialDona"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 29 && (
                                        <>
                                            <h2>Donatario </h2>                                    <div>
                                                <label>Cnpj</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cnpjDona"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 30 && (
                                        <>
                                            <h2>Donatario </h2>                                    <div>
                                                <label>Endereço da Sede</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="enderecoSedeDona"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 31 && (
                                        <>
                                            <h2>Donatario </h2>                                    <div>
                                                <label>Nome do Representante Legal</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="nomeRepresentanteDona"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 32 && (
                                        <>
                                            <h2>Donatario </h2>                                    <div>
                                                <label>Cargo do Representante Legal</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cargoRepresentanteDona"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 33 && (
                                        <>
                                            <h2>Donatario </h2>                                    <div>
                                                <label>Cpf do Representante Legal</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="cpfRepresentanteDona"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 34 && (
                                        <>
                                            <h2>Donatario </h2>                                    <div>
                                                <label>Endereço do Representante Legal</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="enderecoRepresentanteDona"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}


                            {step === 35 && (
                                <>
                                    <h2>Objeto da Doação </h2>                                    <div>
                                        <label>Descrição detalhada</label>
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

                            {step === 36 && (
                                <>
                                    <h2>Objeto da Doação </h2>                                    <div>
                                        <label>Quantidade</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="qtd"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 37 && (
                                <>
                                    <h2>Objeto da Doação </h2>                                    <div>
                                        <label>Marca/modelo</label>
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

                            {step === 38 && (
                                <>
                                    <h2>Objeto da Doação </h2>                                    <div>
                                        <label>Número de série ou registro (se aplicável)</label>
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

                            {step === 39 && (
                                <>
                                    <h2>Objeto da Doação </h2>                                    <div>
                                        <label>Localização</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="localizacao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 40 && (
                                <>
                                    <h2>Objeto da Doação </h2>                                    <div>
                                        <label>A doação</label>
                                        <select name='realizacaoAnterior' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="anterior">Já foi realizada anteriormente à assinatura deste contrato</option>
                                            <option value="nadata">Será realizada na data especificada na Cláusula Quarta</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 41 && (
                                <>
                                    <h2>Objeto da Doação </h2>                                    <div>
                                        <label>Esta doação contempla</label>
                                        <select name='contempla' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="unico">Um único bem</option>
                                            <option value="multiplos"> Múltiplos bens listados acima ou em anexo</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 42 && (
                                <>
                                    <h2>Transferência da Propriedade  </h2>                                    <div>
                                        <label>A transferência da propriedade dos bens se dará</label>
                                        <select name='transferProp' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="dataAssinatura">Na data de assinatura do presente contrato</option>
                                            <option value="dataEspecifica"> Em uma data específica, salvo disposição em contrário ou impedimento legal.</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {dataEspecifica && (
                                <>
                                    {step === 43 && (
                                        <>
                                            <h2>Transferência da Propriedade  </h2>                                    <div>
                                                <label>Data Específica</label>
                                                <input
                                                    type='date'
                                                    placeholder=''
                                                    name="dataEspec"
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
                                    <h2>Responsabilidades </h2>                                    <div>
                                        <label>As partes acordam que</label>
                                        <select name='despesas' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="despesasDoador">Todas as despesas relativas à doação, tais como impostos, taxas, emolumentos, seguros, transportes, registros e demais encargos, correrão por conta do(a) DOADOR(A)</option>
                                            <option value="despesasDonatario">Correrão por conta do(a) DONATÁRIO(A)</option>
                                            <option value="despesasAmbos">Serão rateadas entre as partes, conforme acordado</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {despesas && (
                                <>
                                    {step === 45 && (
                                        <>
                                            <h2>Responsabilidades  </h2>                                    <div>
                                                <label>Porcentagem do DOADOR(A): ________%</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="porcentagemDoador"
                                                    onChange={handleChange}
                                                />

                                                <label>Porcentagem do DONATÁRIO(A): ________%</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="porcentagemDonatario"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 46 && (
                                <>
                                    <h2>Foro </h2>                                    <div>
                                        <label>Cidade</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="cidadeComarca"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 47 && (
                                <>
                                    <h2>Foro </h2>                                    <div>
                                        <label>Estado</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="estadoComarca"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 48 && (
                                <>
                                    <h2> Assinatura </h2>                                    <div>
                                        <label>E por estarem justas e contratadas, firmam o presente contrato em ___ vias de igual teor, juntamente com duas testemunhas abaixo assinadas. </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="vias"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 49 && (
                                <>
                                    <h2> Assinatura </h2>                                    <div>
                                        <label>Local de Assinatura </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="local"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 50 && (
                                <>
                                    <h2> Assinatura </h2>                                    <div>
                                        <label>Data de Assinatura </label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="data"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 51 && (
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
                    <button className='btnBaixarPdf' onClick={() => { geradordoacaosimplespago(formData) }}>
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