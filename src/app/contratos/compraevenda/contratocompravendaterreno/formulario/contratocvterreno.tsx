'use client'
import Pilha from '@/lib/pilha';
import { verificarValor } from '@/lib/utils';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';
import geradorCompraVendaTerrenoPDFPago from '../util/pdf';


const compravendaterrenoschema = z.object({
    vendedor: z.enum(['pf', 'pj']).default('pf'),

    /**
     * Dados Vendedor pj
     */
    razaoSocial: z.string(),
    cnpjvendedor: z.string(),
    cpfvendedor: z.string(),
    enderecoCNPJ: z.string(),
    telefoneCNPJ: z.string(),
    emailCNPJ: z.string(),
    nomeRepresentanteCNPJ: z.string(),
    CPFRepresentanteCNPJ: z.string(),
    /** */

    /** Dados Vendedor pf */
    nomevendedor: z.string(),
    CPFvendedor: z.string(),
    enderecoVendedor: z.string(),
    telefoneVendedor: z.string(),
    emailVendedor: z.string(),
    /** */

    comprador: z.enum(['pf', 'pj']).default('pf'),

    /**
     * Dados comprador pj
     */
    razaoSocialcomprador: z.string(),
    cpfcomprador: z.string(),
    cnpj: z.string(),
    enderecocompradorCNPJ: z.string(),
    telefonecompradorCNPJ: z.string(),
    emailcompradorCNPJ: z.string(),
    nomeRepresentantecompradorCNPJ: z.string(),
    CPFRepresentantecompradorCNPJ: z.string(),
    /** */

    /** Dados comprador pf */
    nomeComprador: z.string(),
    CPFComprador: z.string(),
    enderecoComprador: z.string(),
    telefoneComprador: z.string(),
    emailComprador: z.string(),
    /** */

    /**DESCRIÇÃO DO TERREMO */
    enderecoTerreno: z.string(),
    areaTotal: z.string(),
    medidas: z.string(),
    matriculaCartorioTerreno: z.string(),
    registroCartorioTerreno: z.string(),
    localizacao: z.string(),

    benfeitoria: z.enum(['S', 'N']),
    //se sim
    benfeitoriaDesc: z.string(),

    preservacao: z.enum(['S', 'N']),
    //se sim
    preservacaoDesc: z.string(),
    /** */



    /**SITUAÇÃO LEGAL DO BEM */
    onus: z.enum(['S', 'N']),
    //se sim
    qualPendencia: z.string(),

    gravames: z.enum(['S', 'N']),
    //se sim
    quaisSeriam: z.string(),

    debitosIPTU: z.enum(['S', 'N']),
    //se sim 
    quanto: z.string(),

    regulaTerreno: z.string(),

    certidoes: z.enum(['S', 'N']),
    /** */


    /**PRECO E CONDICOES DE PAGAMENTO */
    valorTotal: z.string(),
    formaPagamento: z.enum(['Avista', 'Parcelado']),

    //se for parcelado
    numeroDeParcela: z.string(),
    valorParcela: z.string(),
    dataVenc: z.string(),

    //senão
    modalidade: z.enum(['Pix', 'CartaoDebito', 'CartaoCredito', 'Boleto']),

    sinal: z.enum(['S', 'N']),
    //se sim
    valorSinal: z.string(),
    dataPag: z.string(),

    aplicaReajuste: z.enum(['S', 'N']),

    //se sim
    qualReajuste: z.enum(['INCC', 'IGPM', 'IPCA', 'TR']),
    // Índice Nacional de Custo da Construção
    // Índice Geral de Preços de Mercado
    // Índice Nacional de Preços ao Consumidor Amplo
    // Taxa Referencial (não é um índice de correção monetária, mas pode ser utilizada em conjunto)
    contaBancaria: z.string(),
    /** */

    /**PRAZOS E ENTREGA */
    dataPrevista: z.string(),
    dataEntrega: z.string(),
    prazoLavratura: z.string(),
    responsaDespesa: z.string(),
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

    /**RESCISÃO DO CONTRATO */
    condicoesRescisao: z.string(),
    multasPenalidades: z.string(),
    prazo: z.string(),
    metodoResolucao: z.enum(['Med', 'Arb', 'Liti']),
    /** */

    /**DISPOSIÇÕES ESPECIFICAS */
    terrenoSujeito: z.enum(['S', 'N']),
    compromisso: z.enum(['S', 'N']),
    //se sim
    descricaoCompromisso: z.string(),
    restricoes: z.enum(['S', 'N']),
    //se sim
    descRestricoes: z.string(),
    /** */

    /**DISPOSIÇÕES GERAIS */
    foroResolucaoConflitos: z.string(), // Foro eleito para resolução de conflitos
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

type FormData = z.infer<typeof compravendaterrenoschema>;

export default function CompraVendaTerreno() {
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
    const valor = 24.90;
    const [pdfDataUrl, setPdfDataUrl] = useState<string>("");
    const [modalPagamento, setModalPagamento] = useState<Boolean>(false);
    const [isLoading, setIsLoading] = useState(false);
    /** */

    //VARIAVEIS DE CONTROLE DE FLUXO
    const [vendedorJuri, setVendedorJuri] = useState(false);
    const [compradorJuri, setCompradorJuri] = useState(false);
    const [compromisso, setCompromisso] = useState(false);
    const [terrenoSujeito, setTerrenoSujeito] = useState(false);
    const [terreno, setTerreno] = useState(false);
    const [restricoes, setRestricoes] = useState(false);
    const [onus, setOnus] = useState(false);
    const [benfeitoria, setBenfeitoria] = useState(false);
    const [preservacao, setPreservacao] = useState(false);
    const [gravames, setGravames] = useState(false);
    const [debitosIPTU, setDebitosIPTU] = useState(false);
    const [Avista, setAvista] = useState(false);
    const [sinal, setSinal] = useState(false);
    const [Parcelado, setParcelado] = useState(false);
    const [aplicaReajuste, setAplicaReajuste] = useState(false);
    const [garantia, setGarantia] = useState(false);
    const [fiador, setFiador] = useState(false);
    const [caucaoDep, setCaucaoDep] = useState(false);
    const [caucaoBemIM, setCaucaoBemIM] = useState(false);
    const [titulos, setTitulos] = useState(false);
    const [seguroFi, setSeguroFi] = useState(false);
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


        if (currentStepData.vendedor === 'pj') {
            setVendedorJuri(true);
            nextStep = 7
        } else if (!vendedorJuri && nextStep === 6) {
            nextStep = 13;
        }

        if (currentStepData.comprador === 'pj') {
            setCompradorJuri(true);
            nextStep = 19
        } else if (!compradorJuri && nextStep === 18) {
            nextStep = 25;
        }


        if (currentStepData.benfeitoria === 'S') {
            setBenfeitoria(true);
            nextStep = 31;
        } else if (currentStepData.benfeitoria === 'N') {
            nextStep = 32;
        }

        if (currentStepData.preservacao === 'S') {
            setPreservacao(true);
            nextStep = 33;
        } else if (currentStepData.preservacao === 'N') {
            nextStep = 34;
        }

        if (currentStepData.onus === 'S') {
            setOnus(true);
            nextStep = 35;
        } else if (currentStepData.onus === 'N') {
            nextStep = 36;
        }

        if (currentStepData.gravames === 'S') {
            setGravames(true);
            nextStep = 37;
        } else if (currentStepData.gravames === 'N') {
            nextStep = 38;
        }

        if (currentStepData.debitosIPTU === 'S') {
            setDebitosIPTU(true);
            nextStep = 40;
        } else if (currentStepData.debitosIPTU === 'N') {
            nextStep = 41;
        }

        if (currentStepData.formaPagamento === 'Avista') {
            setAvista(true);
            nextStep = 48;
        } else if (currentStepData.formaPagamento === 'Parcelado') {
            setParcelado(true)
            nextStep = 45;
        }

        if (currentStepData.sinal === 'S') {
            setSinal(true);
            nextStep = 50;
        } else if (currentStepData.sinal === 'N') {
            nextStep = 52;
        }

        if (currentStepData.aplicaReajuste === 'S') {
            setAplicaReajuste(true);
            nextStep = 53;
        } else if (currentStepData.aplicaReajuste === 'N') {
            nextStep = 54;
        }



        if (currentStepData.garantia === 'S') {
            setGarantia(true);
            nextStep = 60;
        } else if (currentStepData.garantia === 'N') {
            nextStep = 75;
        }

        //para verificar se o próximo é o ultimo de step de algum garantidor
        if (nextStep === 70) {
            nextStep = 75
        } else if (nextStep === 71) {
            nextStep = 75
        } else if (nextStep === 72) {
            nextStep = 75
        } else if (nextStep === 73) {
            nextStep = 75
        } else if (nextStep === 74) {
            nextStep = 75
        }


        switch (currentStepData.qualgarantidor) {
            case "fi":
                setFiador(true);
                break;
            case "caudep":
                setCaucaoDep(true);
                nextStep = 71;
                break;
            case "caubem":
                setCaucaoBemIM(true);
                nextStep = 72;
                break;
            case "ti":
                setTitulos(true);
                nextStep = 73;
                break;
            case "segfianca":
                setSeguroFi(true);
                nextStep = 74;
                break;
            default:
                break;
        }


        if (currentStepData.terrenoSujeito === 'S') {
            setTerrenoSujeito(true);
            nextStep = 80;
        } else if (currentStepData.terrenoSujeito === 'N') {
            nextStep = 81;
        }

        if (currentStepData.compromisso === 'S') {
            setCompromisso(true);
            nextStep = 82;
        } else if (currentStepData.compromisso === 'N') {
            nextStep = 83;
        }

        if (currentStepData.restricoes === 'S') {
            setRestricoes(true);
            nextStep = 84;
        } else if (currentStepData.restricoes === 'N') {
            nextStep = 85;
        }




        if (currentStepData.testemunhasNecessarias === 'S') {
            setTestemunhas(true);
            nextStep = 87;
        } else if (currentStepData.testemunhasNecessarias === 'N') {
            nextStep = 91;
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


    const geradorCompraVendaTerrenoPDF = (dados: any) => {
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
        doc.text("CONTRATO DE COMPRA E VENDA DE TERRENO", 105, posY, { align: "center" });
        posY += 15;

        // Seção 1: Identificação das Partes
        addSection("1. Identificação das Partes", [
            " Art. 104 do Código Civil: Para que um contrato seja válido, é necessário que as partes sejam capazes, que o objeto do contrato seja lícito, possível e determinado, e que haja forma prescrita ou não proibida por lei.\n",
            "Vendedor:",
            `Nome completo ou Razão Social: ${verificarValor(dados.vendedor) === 'pf' ? verificarValor(dados.nomevendedor) : verificarValor(dados.razaoSocial)}`,
            `CPF ou CNPJ: ${verificarValor(dados.vendedor) === 'pf' ? verificarValor(dados.CPFvendedor) : verificarValor(dados.cnpjvendedor)}`,
            `Endereço completo: ${verificarValor(dados.vendedor) === 'pf' ? verificarValor(dados.enderecoVendedor) : verificarValor(dados.enderecoCNPJ)}`,
            `Telefone e e-mail para contato: ${verificarValor(dados.vendedor) === 'pf' ? verificarValor(dados.telefoneVendedor) : verificarValor(dados.telefoneCNPJ)}, ${verificarValor(dados.vendedor) === 'pf' ? verificarValor(dados.emailVendedor) : verificarValor(dados.emailCNPJ)}`,
            "",
            "Comprador:",
            `Nome completo ou Razão Social: ${verificarValor(dados.comprador) === 'pf' ? verificarValor(dados.nomeComprador) : verificarValor(dados.razaoSocialcomprador)}`,
            `CPF ou CNPJ: ${verificarValor(dados.comprador) === 'pf' ? verificarValor(dados.CPFComprador) : verificarValor(dados.cnpj)}`,
            `Endereço completo: ${verificarValor(dados.comprador) === 'pf' ? verificarValor(dados.enderecoComprador) : verificarValor(dados.enderecocompradorCNPJ)}`,
            `Telefone e e-mail para contato: ${verificarValor(dados.comprador) === 'pf' ? verificarValor(dados.telefoneComprador) : verificarValor(dados.telefonecompradorCNPJ)}, ${verificarValor(dados.comprador) === 'pf' ? verificarValor(dados.emailComprador) : verificarValor(dados.emailcompradorCNPJ)}`
        ]);

        // Seção 2: Descrição do Terreno
        addSection("2. Descrição do Terreno", [
            "Art. 1.225 do Código Civil: Os direitos reais sobre bens imóveis incluem a propriedade, o usufruto, o uso, a habitação e a superfície.",
            `Endereço completo do terreno: ${verificarValor(dados.enderecoTerreno)}`,
            `Área total do terreno: ${verificarValor(dados.areaTotal)}`,
            `Medidas e confrontações: ${verificarValor(dados.medidas)}`,
            `Matrícula e número de registro no Cartório: ${verificarValor(dados.matriculaCartorioTerreno)}`,
            `Localização: ${verificarValor(dados.localizacao)}`,
            `Benfeitorias: ${verificarValor(dados.benfeitoria) === 'S' ? verificarValor(dados.benfeitoriaDesc) : 'Não há benfeitorias.'}`,
            `Áreas de preservação ou restrições ambientais: ${verificarValor(dados.preservacao) === 'S' ? verificarValor(dados.preservacaoDesc) : 'Não há áreas de preservação ou restrições ambientais.'}`
        ]);

        // Seção 3: Situação Legal do Terreno
        addSection("3. Situação Legal do Terreno", [
            "Art. 1.227 do Código Civil: Os direitos reais sobre imóveis constituem-se, transferem-se e extinguem-se mediante registro no Cartório de Registro de Imóveis.",
            `Ônus ou pendências legais: ${verificarValor(dados.onus) === 'S' ? verificarValor(dados.qualPendencia) : 'Não há ônus ou pendências legais.'}`,
            `Gravames: ${verificarValor(dados.gravames) === 'S' ? verificarValor(dados.quaisSeriam) : 'Não há gravames.'}`,
            `Débitos de IPTU: ${verificarValor(dados.debitosIPTU) === 'S' ? verificarValor(dados.quanto) : 'Não há débitos de IPTU.'}`,
            `Regularização do terreno: ${verificarValor(dados.regulaTerreno)}`,
            `Certidões: ${verificarValor(dados.certidoes) === 'S' ? 'Certidões emitidas.' : 'Certidões não emitidas.'}`
        ]);

        // Seção 4: Preço e Condições de Pagamento
        addSection("4. Preço e Condições de Pagamento", [
            "Art. 481 do Código Civil: Pelo contrato de compra e venda, um dos contratantes se obriga a transferir o domínio de certa coisa, e o outro, a pagar-lhe certo preço em dinheiro.",
            `Valor total da venda: ${verificarValor(dados.valorTotal)}`,
            `Forma de pagamento: ${verificarValor(dados.formaPagamento)}`,
            dados.formaPagamento === 'Parcelado' ? `Número de parcelas: ${verificarValor(dados.numeroDeParcela)}, Valor da parcela: ${verificarValor(dados.valorParcela)}, Data de vencimento: ${verificarValor(dados.dataVenc)}` : `Modalidade de pagamento: ${verificarValor(dados.modalidade)}`,
            `Sinal: ${verificarValor(dados.sinal) === 'S' ? `Valor do sinal: ${verificarValor(dados.valorSinal)}, Data de pagamento: ${verificarValor(dados.dataPag)}` : 'Não há sinal.'}`,
            `Aplica reajuste: ${verificarValor(dados.aplicaReajuste) === 'S' ? `Índice de reajuste: ${verificarValor(dados.qualReajuste)}` : 'Não há reajuste.'}`,
            `Conta bancária para depósito: ${verificarValor(dados.contaBancaria)}`
        ]);

        // Seção 5: Prazos e Transferência
        addSection("5. Prazos e Transferência", [
            "Art. 422 do Código Civil: Os contratantes são obrigados a guardar, assim na conclusão do contrato, como em sua execução, os princípios de probidade e boa-fé.",
            `Data prevista para assinatura do contrato: ${verificarValor(dados.dataPrevista)}`,
            `Data de entrega da posse: ${verificarValor(dados.dataEntrega)}`,
            `Prazo para lavratura da escritura: ${verificarValor(dados.prazoLavratura)}`,
            `Responsabilidade pelas despesas de transferência: ${verificarValor(dados.responsaDespesa)}`
        ]);

        // Seção 6: Obrigações das Partes
        addSection("6. Obrigações das Partes", [
            "Vendedor:",
            "- Garantir a legitimidade e propriedade do terreno.",
            "- Fornecer todos os documentos necessários para a transferência de propriedade.",
            "- Declarar a inexistência de ônus ou pendências, salvo as informadas no contrato.",
            "",
            "Comprador:",
            "- Efetuar os pagamentos conforme acordado.",
            "- Providenciar o registro do contrato no Cartório de Registro de Imóveis.",
            "- Assumir responsabilidades legais e financeiras (ex.: impostos, taxas) a partir da posse."
        ]);

        // Seção 7: Garantias
        addSection("7. Garantias", [
            "Art. 835 do Código de Processo Civil: A penhora observará, preferencialmente, a seguinte ordem: dinheiro, títulos da dívida pública, veículos, bens imóveis, entre outros.",
            `Garantia oferecida pelo vendedor: ${verificarValor(dados.garantia) === 'S' ? `Tipo de garantia: ${verificarValor(dados.qualgarantidor)}` : 'Não há garantias.'}`,
            dados.garantia === 'S' && dados.qualgarantidor === 'fi' ? `Fiador: ${verificarValor(dados.nomeFiador)}, CPF: ${verificarValor(dados.cpfFiador)}, Endereço: ${verificarValor(dados.enderecoFiador)}` : '',
            dados.garantia === 'S' && dados.qualgarantidor === 'caudep' ? `Valor do título de caução: ${verificarValor(dados.valorTitCaucao)}` : '',
            dados.garantia === 'S' && dados.qualgarantidor === 'caubem' ? `Descrição do bem de caução: ${verificarValor(dados.descBemCaucao)}` : '',
            dados.garantia === 'S' && dados.qualgarantidor === 'ti' ? `Descrição do título de crédito utilizado: ${verificarValor(dados.descCredUtili)}` : '',
            dados.garantia === 'S' && dados.qualgarantidor === 'segfianca' ? `Seguro-fiança: ${verificarValor(dados.segFianca)}` : '',
            `Procedimento de devolução: ${verificarValor(dados.procedimentoDevolucao)}`
        ]);

        // Seção 8: Rescisão e Penalidades
        addSection("8. Rescisão e Penalidades", [
            "Art. 389 do Código Civil: Não cumprida a obrigação, responde o devedor por perdas e danos, mais juros e atualização monetária segundo índices oficiais regularmente estabelecidos, e honorários de advogado.",
            `Condições para rescisão: ${verificarValor(dados.condicoesRescisao)}`,
            `Multas ou penalidades: ${verificarValor(dados.multasPenalidades)}`,
            `Prazo para notificação prévia: ${verificarValor(dados.prazo)}`,
            `Método de resolução de conflitos: ${verificarValor(dados.metodoResolucao)}`
        ]);

        // Seção 9: Disposições Específicas
        addSection("9. Disposições Específicas", [
            "Art. 225 da Constituição Federal: Todos têm direito ao meio ambiente ecologicamente equilibrado, bem de uso comum do povo e essencial à sadia qualidade de vida.",
            `Terreno sujeito a plano diretor ou zoneamento municipal: ${verificarValor(dados.terrenoSujeito) === 'S' ? 'Sim' : 'Não'}`,
            `Compromisso firmado com terceiros: ${verificarValor(dados.compromisso) === 'S' ? verificarValor(dados.descricaoCompromisso) : 'Não há compromissos.'}`,
            `Restrições ambientais: ${verificarValor(dados.restricoes) === 'S' ? verificarValor(dados.descRestricoes) : 'Não há restrições.'}`
        ]);

        // Seção 10: Disposições Gerais
        addSection("10. Disposições Gerais", [
            "Art. 5º, inciso XXXV da Constituição Federal: A lei não excluirá da apreciação do Poder Judiciário lesão ou ameaça a direito.",
            `Foro eleito para resolução de conflitos: ${verificarValor(dados.foroResolucaoConflitos)}`,
            `Testemunhas necessárias: ${verificarValor(dados.testemunhasNecessarias) === 'S' ? `Testemunha 1: ${verificarValor(dados.nomeTest1)}, CPF: ${verificarValor(dados.cpfTest1)}. Testemunha 2: ${verificarValor(dados.nomeTest2)}, CPF: ${verificarValor(dados.cpfTest2)}` : 'Não são necessárias testemunhas.'}`,
            `Local de assinatura: ${verificarValor(dados.local)}`,
            `Data de assinatura: ${verificarValor(dados.dataAssinatura)}`,
            `Registro em cartório: ${verificarValor(dados.registroCartorioTest) === 'S' ? 'Sim' : 'Não'}`
        ]);

        // Espaço para assinatura do vendedor
        checkPageBreak(30);
        doc.text("__________________________________________", marginX, posY);
        posY += 10;
        doc.text("Assinatura do Vendedor", marginX, posY);
        posY += 15;

        // Espaço para assinatura do comprador
        checkPageBreak(30);
        doc.text("__________________________________________", marginX, posY);
        posY += 10;
        doc.text("Assinatura do Comprador", marginX, posY);
        posY += 15;

        // Verifica se há testemunhas e adiciona os espaços para assinatura
        if (dados.testemunhasNecessarias === 'S') {
            checkPageBreak(30);
            doc.text("__________________________________________", marginX, posY);
            posY += 10;
            doc.text(`Assinatura da Testemunha 1: ${verificarValor(dados.nomeTest1)}`, marginX, posY);
            posY += 15;

            checkPageBreak(30);
            doc.text("__________________________________________", marginX, posY);
            posY += 10;
            doc.text(`Assinatura da Testemunha 2: ${verificarValor(dados.nomeTest2)}`, marginX, posY);
            posY += 15;
        }


        const pdfDataUri = doc.output("datauristring");
        setPdfDataUrl(pdfDataUri);
    };


    useEffect(() => {
        geradorCompraVendaTerrenoPDF({ ...formData });
    }, [formData]);


    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title">Contrato de Compra e Venda de Terreno</h1>
            </div>
            <div className="container">
                <div className="left-panel">
                    <div className="scrollable-card">
                        <div className="progress-bar">
                            <div
                                className="progress-bar-inner"
                                style={{ width: `${(step / 93) * 100}%` }}
                            ></div>
                        </div>
                        <div className="form-wizard">
                            {step === 1 && (
                                <>
                                    <h2>Dados do Vendedor do Imóvel</h2>
                                    <div>
                                        <label>O Responsavel é pessoa?</label>
                                        <select name='vendedor' onChange={handleChange}>
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
                                    <h2>Dados do Vendedor do Imóvel</h2>                                    <div>
                                        <label>Nome do Vendedor</label>
                                        <input
                                            type='text'
                                            placeholder='Nome do Vendedor'
                                            name="nomevendedor"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 3 && (
                                <>
                                    <h2>Dados do Vendedor do Imóvel</h2>                                    <div>
                                        <label>CPF</label>
                                        <input
                                            type='text'
                                            placeholder='CPF do Vendedor'
                                            name="CPFvendedor"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 4 && (
                                <>
                                    <h2>Dados do Vendedor do Imóvel</h2>                                    <div>
                                        <label>Endereço do Vendedor</label>
                                        <input
                                            type='text'
                                            placeholder='Onde o vendedor mora'
                                            name="enderecoVendedor"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 5 && (
                                <>
                                    <h2>Dados do Vendedor do Imóvel</h2>                                    <div>
                                        <label>Telefone do Vendedor</label>
                                        <input
                                            type='text'
                                            placeholder='(DDD)número-número'
                                            name="telefoneVendedor"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 6 && (
                                <>
                                    <h2>Dados do Vendedor do Imóvel</h2>                                    <div>
                                        <label>Email do Vendedor</label>
                                        <input
                                            type='text'
                                            placeholder='email@email.com'
                                            name="emailVendedor"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {/**Pessoa Juridica */}

                            {vendedorJuri && (
                                <>
                                    {step === 7 && (
                                        <>
                                            <h2>Dados do Vendedor do Imóvel</h2>                                            <div>
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
                                                    name="cnpjvendedor"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 8 && (
                                        <>
                                            <h2>Dados do Vendedor do Imóvel</h2>                                            <div>
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
                                            <h2>Dados do Vendedor do Imóvel</h2>                                            <div>
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
                                            <h2>Dados do Vendedor do Imóvel</h2>                                            <div>
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
                                            <h2>Dados do Proprietário do Imóvel</h2>
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
                                            <h2>Dados do Vendedor do Imóvel</h2>                                            <div>
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

                            {/**Vendedor */}
                            {step === 13 && (
                                <>
                                    <h2>Dados do Comprador do Imóvel</h2>
                                    <div>
                                        <label>O Responsavel é pessoa?</label>
                                        <select name='comprador' onChange={handleChange}>
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
                                    <h2>Dados do Comprador do Imóvel</h2>
                                    <div>
                                        <label>Nome do Comprador</label>
                                        <input
                                            type='text'
                                            placeholder='Nome do Comprador'
                                            name="nomeComprador"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 15 && (
                                <>
                                    <h2>Dados do Comprador do Imóvel</h2>
                                    <div>
                                        <label>CPF</label>
                                        <input
                                            type='text'
                                            placeholder='CPF do Comprador'
                                            name="CPFComprador"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 16 && (
                                <>
                                    <h2>Dados do Comprador do Imóvel</h2>
                                    <div>
                                        <label>Endereço do Comprador</label>
                                        <input
                                            type='text'
                                            placeholder='Onde o comprador mora'
                                            name="enderecoComprador"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 17 && (
                                <>
                                    <h2>Dados do Comprador do Imóvel</h2>
                                    <div>
                                        <label>Telefone do Comprador</label>
                                        <input
                                            type='text'
                                            placeholder='(DDD)número-número'
                                            name="telefoneComprador"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {step === 18 && (
                                <>
                                    <h2>Dados do Comprador do Imóvel</h2>
                                    <div>
                                        <label>Email do Comprador</label>
                                        <input
                                            type='text'
                                            placeholder='email@email.com'
                                            name="emailComprador"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {/**Pessoa Juridica */}

                            {compradorJuri && (
                                <>
                                    {step === 19 && (
                                        <>
                                            <h2>Dados do Comprador do Imóvel</h2>
                                            <div>
                                                <label>Razão Social</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="razaoSocialcomprador"
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
                                            <h2>Dados do Comprador do Imóvel</h2>
                                            <div>
                                                <label>Endereço do onde o CNPJ esta cadastrado</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="enderecocompradorCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 21 && (
                                        <>
                                            <h2>Dados do Comprador do Imóvel</h2>
                                            <div>
                                                <label>Telefone</label>
                                                <input
                                                    type='text'
                                                    placeholder='(DDD)número-número'
                                                    name="telefonecompradorCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 22 && (
                                        <>
                                            <h2>Dados do Comprador do Imóvel</h2>
                                            <div>
                                                <label>Email</label>
                                                <input
                                                    type='text'
                                                    placeholder='email@email.com'
                                                    name="emailcompradorCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 23 && (
                                        <>
                                            <h2>Dados do Comprador do Imóvel</h2>
                                            <div>
                                                <label>Nome do representante do CNPJ</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="nomeRepresentantecompradorCNPJ"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 24 && (
                                        <>
                                            <h2>Dados do Comprador do Imóvel</h2>
                                            <div>
                                                <label>CPF do representante do CNPJ</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="CPFRepresentantecompradorCNPJ"
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
                                    <h2>Descrição do Terreno</h2>
                                    <div>
                                        <label>Endereço completo do terreno (incluindo município e estado)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="enderecoTerreno"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 26 && (
                                <>
                                    <h2>Descrição do Terreno</h2>
                                    <div>
                                        <label>Área total do terreno (em metros quadrados ou hectares)</label>
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


                            {step === 27 && (
                                <>
                                    <h2>Descrição do Terreno</h2>
                                    <div>
                                        <label>Medidas e confrontações (ex.: lado norte com X metros, vizinho a Y)</label>
                                        <textarea
                                            id="medidas"
                                            name="medidas"
                                            onChange={handleChange}
                                            rows={10}
                                            cols={50}
                                            placeholder=""
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 28 && (
                                <>
                                    <h2>Descrição do Terreno</h2>
                                    <div>
                                        <label>Matrícula e número de registro no Cartório de Registro de Imóveis competente</label>
                                        <input
                                            type='text'
                                            placeholder='Matrícula'
                                            name="matriculaCartorioTerreno"
                                            onChange={handleChange}
                                        />
                                        <input
                                            type='text'
                                            placeholder='Registro'
                                            name="registroCartorioTerreno"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 29 && (
                                <>
                                    <h2>Descrição do Terreno</h2>
                                    <div>
                                        <label>Zona de localização (urbana, rural, industrial, etc.)</label>
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

                            {step === 30 && (
                                <>
                                    <h2>Descrição do Terreno</h2>
                                    <div>
                                        <label>Existe alguma benfeitoria (ex.: cercas, galpões)?  </label>
                                        <select name='benfeitoria' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {benfeitoria && (
                                <>
                                    {step === 31 && (
                                        <>
                                            <h2>Descrição do Terreno</h2>
                                            <div>
                                                <label>Descreva em detalhe(s) a(s) benfeitoria(as)</label>
                                                <textarea
                                                    id="benfeitoriaDesc"
                                                    name="benfeitoriaDesc"
                                                    onChange={handleChange}
                                                    rows={10}
                                                    cols={50}
                                                    placeholder=""
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 32 && (
                                <>
                                    <h2>Descrição do Terreno</h2>
                                    <div>
                                        <label>Existem áreas de preservação ou restrições ambientais no terreno? </label>
                                        <select name='preservacao' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {preservacao && (
                                <>
                                    {step === 33 && (
                                        <>
                                            <h2>Descrição do Terreno</h2>
                                            <div>
                                                <label>Descreva em detalhe(s) essa(s) área(s)</label>
                                                <textarea
                                                    id="preservacaoDesc"
                                                    name="preservacaoDesc"
                                                    onChange={handleChange}
                                                    rows={10}
                                                    cols={50}
                                                    placeholder=""
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
                                    <h2>Situação legal do bem</h2>
                                    <div>
                                        <label>O bem está livre de ônus, dívidas ou pendências legais? </label>
                                        <select name='onus' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {onus && (
                                <>
                                    {step === 35 && (
                                        <>
                                            <h2>Situação legal do bem</h2>
                                            <div>
                                                <label>Descreva a pendência</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="qualPendencia"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}


                            {step === 36 && (
                                <>
                                    <h2>Situação legal do bem</h2>
                                    <div>
                                        <label>Existem garantias ou gravames registrados sobre o bem? </label>
                                        <select name='gravames' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}
                            {gravames && (
                                <>
                                    {step === 37 && (
                                        <>
                                            <h2>Situação legal do bem</h2>
                                            <div>
                                                <label>Descreva </label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="quaisSeriam"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 38 && (
                                <>
                                    <h2>Situação legal do bem</h2>
                                    <div>
                                        <label>Certidão negativa do imóvel foi emitida?  </label>
                                        <select name='certidoes' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 39 && (
                                <>
                                    <h2>Situação legal do bem</h2>
                                    <div>
                                        <label>Há débitos de IPTU, taxas municipais ou contribuições pendentes? </label>
                                        <select name='debitosIPTU' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {debitosIPTU && (
                                <>
                                    {step === 40 && (
                                        <>
                                            <h2>Situação legal do bem</h2>
                                            <div>
                                                <label>Descreva os débitos inerentes ao terreno</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="quanto"
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
                                    <h2>Situação legal do bem</h2>
                                    <div>
                                        <label>O terreno está regularizado no Cadastro Ambiental Rural (CAR), se aplicável? </label>
                                        <select name='regulaTerreno' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 42 && (
                                <>
                                    <h2>Situação legal do bem</h2>
                                    <div>
                                        <label>O terreno está regularizado no Cadastro Ambiental Rural (CAR), se aplicável? </label>
                                        <select name='regulaTerreno' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 43 && (
                                <>
                                    <h2>Preço e Condições de Pagamento</h2>
                                    <div>
                                        <label>Valor total da venda </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="valorTotal"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 44 && (
                                <>
                                    <h2>Preço e Condições de Pagamento</h2>
                                    <div>
                                        <label>Pagamento à vista ou parcelado? </label>
                                        <select name='formaPagamento' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="Avista">A vista</option>
                                            <option value="Parcelado">Parcelado</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {Parcelado && (
                                <>
                                    {step === 45 && (
                                        <>
                                            <h2>Preço e Condições de Pagamento</h2>
                                            <div>
                                                <label>Número de parcelas</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="numeroDeParcela"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 46 && (
                                        <>
                                            <h2>Preço e Condições de Pagamento</h2>
                                            <div>
                                                <label>Valor das parcelas</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="valorParcela"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 47 && (
                                        <>
                                            <h2>Preço e Condições de Pagamento</h2>
                                            <div>
                                                <label>Data de Vencimento</label>
                                                <input
                                                    type='date'
                                                    placeholder=''
                                                    name="dataVenc"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {Avista && (
                                <>
                                    {step === 48 && (
                                        <>
                                            <h2>Preço e Condições de Pagamento</h2>
                                            <div>
                                                <label>Forma de Pagamento</label>
                                                <select name='modalidade' onChange={handleChange}>
                                                    <option value="">Selecione</option>
                                                    <option value="Pix">Pix</option>
                                                    <option value="CartaoDebito">Cartão de Débito</option>
                                                    <option value="CartaoCredito">Cartão de Crédito</option>
                                                    <option value="Boleto">Boleto</option>
                                                </select>
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}


                            {step === 49 && (
                                <>
                                    <h2>Preço e Condições de Pagamento</h2>
                                    <div>
                                        <label>Existência de sinal ou entrada? </label>
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
                                    {step === 50 && (
                                        <>
                                            <h2>Preço e Condições de Pagamento</h2>
                                            <div>
                                                <label>Valor do sinal ou entrada </label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="valorSinal"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 51 && (
                                        <>
                                            <h2>Preço e Condições de Pagamento</h2>
                                            <div>
                                                <label>Data de Pagamento</label>
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
                                </>
                            )}

                            {step === 52 && (
                                <>
                                    <h2>Preço e Condições de Pagamento</h2>
                                    <div>
                                        <label>Ocorrerá rejuste nas parcelas?</label>
                                        <select name='aplicaReajuste' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {aplicaReajuste && (
                                <>
                                    {step === 53 && (
                                        <>
                                            <h2>Preço e Condições de Pagamento</h2>
                                            <div>
                                                <label>Qual índice será aplicado ?</label>
                                                <select name='qualReajuste' onChange={handleChange}>
                                                    <option value="">Selecione</option>
                                                    <option value="INCC">Índice Nacional de Custo da Construção</option>
                                                    <option value="IGPM">Índice Geral de Preços de Mercado</option>
                                                    <option value="IPCA">Índice Nacional de Preços ao Consumidor Amplo</option>
                                                    <option value="TR">Taxa Referencial (não é um índice de correção monetária, mas pode ser utilizada em conjunto)</option>
                                                </select>
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 54 && (
                                <>
                                    <h2>Preço e Condições de Pagamento</h2>
                                    <div>
                                        <label>Conta bancária para depósito (se aplicável)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="contaBancaria"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 55 && (
                                <>
                                    <h2>Prazo e Entrega</h2>
                                    <div>
                                        <label>Data prevista para a assinatura do contrato</label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="dataPrevista"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 56 && (
                                <>
                                    <h2>Prazo e Entrega</h2>
                                    <div>
                                        <label>Data de entrega do bem ao comprador</label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="dataEntrega"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 57 && (
                                <>
                                    <h2>Prazo e Entrega</h2>
                                    <div>
                                        <label>Prazo para lavratura da escritura pública de compra e venda</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="prazoLavratura"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 58 && (
                                <>
                                    <h2>Prazo e Entrega</h2>
                                    <div>
                                        <label>Responsabilidade pelas despesas de transferência (custas cartorárias, ITBI, etc.)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="responsaDespesa"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 59 && (
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
                                    {step === 60 && (
                                        <>
                                            <h2>Garantias</h2>
                                            <div>
                                                <label>Qual será o processo de devolução da garantia?</label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="procedimentoDevolucao"
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
                                    {step === 62 && (
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

                                    {step === 63 && (
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

                                    {step === 64 && (
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

                                    {step === 65 && (
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

                                    {step === 66 && (
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

                                    {step === 67 && (
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

                                    {step === 68 && (
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

                                    {step === 69 && (
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

                                    {step === 70 && (
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
                                    {step === 71 && (
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
                                    {step === 72 && (
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
                                    {step === 73 && (
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
                                    {step === 74 && (
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


                            {step === 75 && (
                                <>
                                    <h2>Rescisão do Contrato</h2>
                                    <div>
                                        <label>Condições para rescisão do contrato por qualquer das partes</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="condicoesRescisao"
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
                                    <h2>Rescisão do Contrato</h2>
                                    <div>
                                        <label>Multas ou penalidades em caso de descumprimento de cláusulas contratuais</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="multasPenalidades"
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
                                    <h2>Rescisão do Contrato</h2>
                                    <div>
                                        <label>Prazo para notificação prévia em caso de rescisão</label>
                                        <div>
                                            <input
                                                type='text'
                                                placeholder=''
                                                name="prazo"
                                                onChange={handleChange}
                                            />
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 78 && (
                                <>
                                    <h2>Rescisão do Contrato</h2>
                                    <div>
                                        <label>Qual será o método para resolver conflitos?</label>
                                        <i>
                                            Mediação:
                                            A mediação é um método consensual de resolução de conflitos, no qual um terceiro neutro (mediador) auxilia as partes a dialogarem e encontrarem uma solução mutuamente satisfatória.
                                            A mediação é um processo mais rápido e menos custoso do que o litígio judicial, e preserva o relacionamento entre as partes.

                                            Arbitragem:
                                            A arbitragem é um método alternativo de resolução de conflitos, no qual as partes elegem um ou mais árbitros para julgar a disputa.
                                            A decisão arbitral é vinculante e tem força de título executivo judicial, ou seja, pode ser executada judicialmente caso não seja cumprida espontaneamente.

                                            Litígio Judicial:
                                            O litígio judicial é a forma tradicional de resolução de conflitos, na qual a disputa é levada ao Poder Judiciário para ser julgada por um juiz.
                                            O litígio judicial pode ser um processo mais longo e custoso do que a mediação ou a arbitragem.
                                        </i>
                                        <div>
                                            <select name='metodoResolucao' onChange={handleChange}>
                                                <option value="">Selecione</option>
                                                <option value="Med">Mediação</option>
                                                <option value="Arb">Arbitragem</option>
                                                <option value="Liti">Litígio Judicial</option>
                                            </select>
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 79 && (
                                <>
                                    <h2>Disposição Específica</h2>
                                    <div>
                                        <label>O terreno está sujeito a algum plano diretor ou zoneamento municipal que afete seu uso? </label>
                                        <select name='terrenoSujeito' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {terrenoSujeito && (
                                <>
                                    {step === 80 && (
                                        <>
                                            <h2>Disposição Específica</h2>
                                            <div>
                                                <label>Descreva em detalhes essas pendências</label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="descSujeito"
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

                            {step === 81 && (
                                <>
                                    <h2>Disposição Específica</h2>
                                    <div>
                                        <label>Existe algum compromisso firmado com terceiros relacionado ao terreno (ex.: contratos de arrendamento ou servidões)? </label>
                                        <select name='compromisso' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {compromisso && (
                                <>
                                    {step === 82 && (
                                        <>
                                            <h2>Disposição Específica</h2>
                                            <div>
                                                <label>Descreva em detalhes essas pendências</label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="descricaoCompromisso"
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


                            {step === 83 && (
                                <>
                                    <h2>Disposição Específica</h2>
                                    <div>
                                        <label>Há restrições ambientais ou áreas de preservação permanente no terreno?  </label>
                                        <select name='restricoes' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {restricoes && (
                                <>
                                    {step === 84 && (
                                        <>
                                            <h2>Disposição Específica</h2>
                                            <div>
                                                <label>Descreva em detalhes essas pendências</label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="descRestricoes"
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

                            {step === 85 && (
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

                            {step === 86 && (
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
                                    {step === 87 && (
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

                                    {step === 88 && (
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

                                    {step === 89 && (
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

                                    {step === 90 && (
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

                            {step === 91 && (
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

                            {step === 92 && (
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
                            {step === 93 && (
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

                            {step === 94 && (
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
                    <button className='btnBaixarPdf' onClick={() => { geradorCompraVendaTerrenoPDFPago(formData) }}>
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