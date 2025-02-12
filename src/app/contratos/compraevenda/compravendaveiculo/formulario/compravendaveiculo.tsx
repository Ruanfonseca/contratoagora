'use client'
import Pilha from '@/lib/pilha';
import { verificarValor } from '@/lib/utils';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import '../css/form.css';
import geradorCompraEVendaVeiculoPago from '../util/pdf';

const compravendaveiculosschema = z.object({
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

    /**IDENTIFICAÇÃO DO VEÍCULO */
    tipoveiculo: z.string(),
    marca: z.string(),
    modelo: z.string(),
    anoFabricacao: z.string(),
    anoModelo: z.string(),
    cor: z.string(),
    placa: z.string(),
    chassi: z.string(),
    renavam: z.string(),
    quilometragemAtual: z.string(),
    combustivel: z.string(),
    numeroPorta: z.string(),
    possuiAdicional: z.enum(['S', 'N']),
    //se sim 
    descrevaAcessorio: z.string(),
    /** */

    /**SITUAÇÃO LEGAL DO VEÍCULO */

    debitoPendente: z.enum(['S', 'N']),
    //se sim
    descrevaPendencia: z.string(),

    veiculoAlienado: z.enum(['alienado', 'financiado']),
    //se sim
    informarInst: z.string(),
    statusdofinan: z.string(),

    objetoSinistro: z.enum(['S', 'N']),
    certidaoDetran: z.enum(['S', 'N']),
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
    /** */

    /**PRAZOS E TRANSFERÊNCIA */
    dataParaEntrega: z.string(),
    tanque: z.enum(['S', 'N']),
    dataTitularidade: z.string(),
    responsabilidade: z.string(),
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


    /**DECLARAÇÃO DAS PARTES */
    vendedorDeclaracao: z.enum(['concordo', 'discordo']),
    compradorDeclaracao: z.enum(['concordo', 'discordo']),
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
    registroCartorio: z.enum(['S', 'N']), // Indicação se o contrato será registrado em cartório 
    /** */

});

type FormData = z.infer<typeof compravendaveiculosschema>;

export default function CompraVendaVeiculo() {

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
    const [possuiAdicional, setPossuiAdicional] = useState(false);
    const [debitoPendente, setDebitoPendente] = useState(false);
    const [veiculoAlienado, setVeiculoAlienado] = useState(false);
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

        if (currentStepData.possuiAdicional === 'S') {
            setPossuiAdicional(true);
            nextStep = 38;
        } else if (currentStepData.possuiAdicional === 'N') {
            nextStep = 39;
        }

        if (currentStepData.debitoPendente === 'S') {
            setDebitoPendente(true);
            nextStep = 40;
        } else if (currentStepData.debitoPendente === 'N') {
            nextStep = 41;
        }

        if (currentStepData.veiculoAlienado === 'alienado') {
            setVeiculoAlienado(true);
            nextStep = 42;
        } else if (currentStepData.veiculoAlienado === 'financiado') {
            nextStep = 44;
        }


        if (currentStepData.formaPagamento === 'Avista') {
            setAvista(true);
            nextStep = 51;
        } else if (currentStepData.formaPagamento === 'Parcelado') {
            setParcelado(true)
            nextStep = 48;
        }

        if (nextStep === 50) {
            nextStep = 52
        }

        if (currentStepData.sinal === 'S') {
            setSinal(true);
            nextStep = 53;
        } else if (currentStepData.sinal === 'N') {
            nextStep = 55;
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



        if (currentStepData.testemunhasNecessarias === 'S') {
            setTestemunhas(true);
            nextStep = 83;
        } else if (currentStepData.testemunhasNecessarias === 'N') {
            nextStep = 87;
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


    const geradorCompraEVendaVeiculo = (dados: any) => {
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
        doc.text("CONTRATO DE COMPRA E VENDA DE VEÍCULO", 105, posY, { align: "center" });
        posY += 15;

        // Seção 1: Identificação das Partes
        addSection("1. Identificação das Partes", [
            "Art. 104 do Código Civil: Para que um contrato seja válido, é necessário que as partes sejam capazes, que o objeto do contrato seja lícito, possível e determinado, e que haja forma prescrita ou não proibida por lei.\n",
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

        // Seção 2: Identificação do Veículo
        addSection("2. Identificação do Veículo", [
            "Art. 481 do Código Civil: Pelo contrato de compra e venda, um vendedor se obriga a transferir o domínio de uma coisa a um comprador, mediante pagamento de preço em dinheiro.",
            `Tipo de veículo (carro, moto, caminhão, etc.): ${verificarValor(dados.tipoveiculo)}`,
            `Marca, modelo e ano de fabricação: ${verificarValor(dados.marca)}, ${verificarValor(dados.modelo)}, ${verificarValor(dados.anoFabricacao)}`,
            `Ano do modelo: ${verificarValor(dados.anoModelo)}`,
            `Cor: ${verificarValor(dados.cor)}`,
            `Placa: ${verificarValor(dados.placa)}`,
            `Chassi: ${verificarValor(dados.chassi)}`,
            `Renavam: ${verificarValor(dados.renavam)}`,
            `Quilometragem atual: ${verificarValor(dados.quilometragemAtual)}`,
            `Combustível (gasolina, diesel, flex, etc.): ${verificarValor(dados.combustivel)}`,
            `Número de portas (se aplicável): ${verificarValor(dados.numeroPorta)}`,
            `Veículo possui acessórios ou itens adicionais (ex.: som, películas, rodas especiais)? ${verificarValor(dados.possuiAdicional)}`,
            `Descrição dos acessórios: ${verificarValor(dados.descrevaAcessorio)}`
        ]);

        // Seção 3: Situação Legal do Veículo
        addSection("3. Situação Legal do Veículo", [
            "Art. 422 do Código Civil: Os contratantes são obrigados a guardar, assim na conclusão do contrato como em sua execução, os princípios de probidade e boa-fé.",
            `O veículo possui débitos pendentes? ${verificarValor(dados.debitoPendente)}`,
            `Descrição das pendências: ${verificarValor(dados.descrevaPendencia)}`,
            `O veículo está alienado ou financiado? ${verificarValor(dados.veiculoAlienado)}`,
            `Instituição financeira: ${verificarValor(dados.informarInst)}`,
            `Status do financiamento: ${verificarValor(dados.statusdofinan)}`,
            `O veículo já foi objeto de sinistro, leilão ou recuperação estrutural? ${verificarValor(dados.objetoSinistro)}`,
            `Certidão de regularidade junto ao Detran foi emitida? ${verificarValor(dados.certidaoDetran)}`
        ]);

        // Seção 4: Preço e Condições de Pagamento
        addSection("4. Preço e Condições de Pagamento", [
            "Art. 489 do Código Civil: Salvo disposição em contrário, os riscos da coisa vendida correm por conta do comprador, desde o momento em que se efetivar a tradição.\n",

            `Valor total da venda: ${verificarValor(dados.valorTotal)}`,
            `Forma de pagamento: ${verificarValor(dados.formaPagamento)}`,
            `Pagamento à vista ou parcelado? ${verificarValor(dados.formaPagamento)}`,
            `Número de parcelas: ${verificarValor(dados.numeroDeParcela)}`,
            `Valor de cada parcela: ${verificarValor(dados.valorParcela)}`,
            `Data de vencimento das parcelas: ${verificarValor(dados.dataVenc)}`,
            `Existência de sinal ou entrada? ${verificarValor(dados.sinal)}`,
            `Valor do sinal: ${verificarValor(dados.valorSinal)}`,
            `Data de pagamento do sinal: ${verificarValor(dados.dataPag)}`
        ]);

        // Seção 5: Prazos e Entrega
        addSection("5. Prazos e Entrega", [
            "Art. 475 do Código Civil: A parte lesada pelo inadimplemento pode pedir a resolução do contrato, se não preferir exigir-lhe o cumprimento, cabendo-lhe, em qualquer caso, indenização por perdas e danos.",
            `Data de entrega do veículo ao comprador: ${verificarValor(dados.dataParaEntrega)}`,
            `O veículo será entregue com o tanque cheio? ${verificarValor(dados.tanque)}`,
            `Data para transferência de titularidade no Detran: ${verificarValor(dados.dataTitularidade)}`,
            `Responsabilidade pelas despesas de transferência (custas, taxas do Detran): ${verificarValor(dados.responsabilidade)}`
        ]);

        // Seção 6: Obrigações das Partes
        addSection("6. Obrigações das Partes", [
            "Art. 421 do Código Civil: A liberdade de contratar será exercida em razão e nos limites da função social do contrato.",
            "Vendedor:",
            "Garantir que o veículo está livre de quaisquer ônus ou pendências legais, salvo as informadas no contrato.",
            "Fornecer todos os documentos necessários para a transferência do veículo (CRV/CRLV, comprovante de pagamento de débitos, etc.).",
            "Garantir que o veículo encontra-se em condições normais de uso, salvo avarias previamente informadas.",
            "",
            "Comprador:",
            "Efetuar os pagamentos conforme acordado.",
            "Realizar a transferência de titularidade no Detran no prazo estipulado.",
            "Assumir a responsabilidade pelas taxas e impostos após a data de entrega."
        ]);

        // Seção 7: Garantias
        addSection("7. Garantias", [
            "Art. 445 do Código Civil: O adquirente deve denunciar o vício oculto ao vendedor em até trinta dias, se o bem for móvel, e um ano, se for imóvel, contados da entrega efetiva.",
            `O vendedor oferece garantia sobre o veículo? ${verificarValor(dados.garantia)}`,
            `Tipo de garantia: ${verificarValor(dados.qualgarantidor)}`,
            `Descrição da garantia: ${verificarValor(dados.procedimentoDevolucao)}`
        ]);

        // Seção 8: Rescisão e Penalidades
        addSection("8. Rescisão e Penalidades", [
            "Art. 408 do Código Civil: Incorre na cláusula penal quem deixa de cumprir a obrigação ou se constitui em mora.",
            `Condições para rescisão do contrato por qualquer das partes: ${verificarValor(dados.condicoesRescisao)}`,
            `Multas ou penalidades em caso de descumprimento de cláusulas contratuais: ${verificarValor(dados.multasPenalidades)}`,
            `Prazo para notificação prévia em caso de rescisão: ${verificarValor(dados.prazo)}`
        ]);

        // Seção 9: Declarações das Partes
        addSection("9. Declarações das Partes", [
            "Art. 112 do Código Civil: Nas declarações de vontade se atenderá mais à intenção nelas consubstanciada do que ao sentido literal da linguagem.",
            `O vendedor declara ser o legítimo proprietário do veículo e que este não possui pendências não informadas no contrato: ${verificarValor(dados.vendedorDeclaracao)}`,
            `O comprador declara ter ciência do estado de conservação e funcionamento do veículo, assumindo a compra em caráter "como está", salvo garantias especificadas: ${verificarValor(dados.compradorDeclaracao)}`
        ]);

        // Seção 10: Cláusula Especial para Veículo Alienado (Financiado)
        addSection("10. Cláusula Especial para Veículo Alienado (Financiado)", [
            "Art. 1361 do Código Civil: Considera-se fiduciária a propriedade resolúvel de coisa móvel infungível que o devedor, com a posse direta, transfere ao credor, como garantia de dívida.",
            "Notificação da Alienação: O vendedor deve informar explicitamente ao comprador sobre a existência da alienação fiduciária ou reserva de propriedade sobre o veículo.",
            "Transferência de Propriedade Condicional: A propriedade do veículo é transferida ao comprador, mas condicionada ao cumprimento das obrigações financeiras acordadas com a instituição financeira.",
            "Direitos e Obrigações: O comprador deve cumprir todas as obrigações relacionadas ao financiamento, incluindo pagamento das parcelas, manutenção do veículo e obtenção de seguro adequado.",
            "Responsabilidade pela Quitação do Financiamento: O comprador é o responsável por quitar o financiamento junto à instituição financeira, e até que isso ocorra, a credora tem o direito de reaver o veículo.",
            "Transferência de Propriedade Definitiva: A transferência definitiva ocorrerá somente após a quitação integral do financiamento e a emissão do Termo de Quitação de Financiamento (TQF)."
        ]);

        // Seção 11: Disposições Gerais
        addSection("11. Disposições Gerais", [
            "Art. 233 do Código Civil: A obrigação será cumprida no local onde foi estipulada, se nele estiver o credor, e, se em outro, quando aí o devedor tiver domicílio.",
            `Foro eleito para resolução de conflitos: ${verificarValor(dados.foroResolucaoConflitos)}`,
            `Necessidade de testemunhas para assinatura do contrato: ${verificarValor(dados.testemunhasNecessarias)}`,
            `Nome da primeira testemunha: ${verificarValor(dados.nomeTest1)}`,
            `CPF da primeira testemunha: ${verificarValor(dados.cpfTest1)}`,
            `Nome da segunda testemunha: ${verificarValor(dados.nomeTest2)}`,
            `CPF da segunda testemunha: ${verificarValor(dados.cpfTest2)}`,
            `Local de assinatura do contrato: ${verificarValor(dados.local)}`,
            `Data de assinatura do contrato: ${verificarValor(dados.dataAssinatura)}`,
            `O contrato será registrado em cartório como instrumento particular? ${verificarValor(dados.registroCartorio)}`
        ]);
        // Espaço para assinatura do vendedor
        checkPageBreak(30);
        doc.text("__________________________________________", marginX, posY);
        posY += 10;
        doc.text("Assinatura do Vendedor", marginX, posY);
        posY += 15;

        // Espaço para assinatura do comprador
        checkPageBreak(10);
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
        geradorCompraEVendaVeiculo({ ...formData });
    }, [formData]);
    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title">Contrato de Compra e Venda de Veículo</h1>
            </div>
            <div className="container">
                <div className="left-panel">
                    <div className="scrollable-card">
                        <div className="progress-bar">
                            <div
                                className="progress-bar-inner"
                                style={{ width: `${(step / 89) * 100}%` }}
                            ></div>
                        </div>
                        <div className="form-wizard">
                            {step === 1 && (
                                <>
                                    <h2>Dados do Vendedor do Automóvel</h2>
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
                                    <h2>Dados do Vendedor do Automóvel</h2>                                    <div>
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
                                    <h2>Dados do Vendedor do Automóvel</h2>                                    <div>
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
                                    <h2>Dados do Vendedor do Automóvel</h2>                                    <div>
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
                                    <h2>Dados do Vendedor do Automóvel</h2>                                    <div>
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
                                    <h2>Dados do Vendedor do Automóvel</h2>                                    <div>
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
                                            <h2>Dados do Vendedor do Automóvel</h2>                                            <div>
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
                                            <h2>Dados do Vendedor do Automóvel</h2>                                            <div>
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
                                            <h2>Dados do Vendedor do Automóvel</h2>                                            <div>
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
                                            <h2>Dados do Vendedor do Automóvel</h2>                                            <div>
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
                                            <h2>Dados do Proprietário do Automóvel</h2>
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
                                            <h2>Dados do Vendedor do Automóvel</h2>                                            <div>
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
                                    <h2>Dados do Comprador do Automóvel</h2>
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
                                    <h2>Dados do Comprador do Automóvel</h2>
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
                                    <h2>Dados do Comprador do Automóvel</h2>
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
                                    <h2>Dados do Comprador do Automóvel</h2>
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
                                    <h2>Dados do Comprador do Automóvel</h2>
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
                                    <h2>Dados do Comprador do Automóvel</h2>
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
                                            <h2>Dados do Comprador do Automóvel</h2>
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
                                            <h2>Dados do Comprador do Automóvel</h2>
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
                                            <h2>Dados do Comprador do Automóvel</h2>
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
                                            <h2>Dados do Comprador do Automóvel</h2>
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
                                            <h2>Dados do Comprador do Automóvel</h2>
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
                                            <h2>Dados do Comprador do Automóvel</h2>
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
                                    <h2>Identificação do Veículo</h2>
                                    <div>
                                        <label>Tipo de veículo (carro, moto, caminhão, etc.)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="tipoveiculo"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 26 && (
                                <>
                                    <h2>Identificação do Veículo</h2>
                                    <div>
                                        <label>Marca do veículo</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="marca"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 27 && (
                                <>
                                    <h2>Identificação do Veículo</h2>
                                    <div>
                                        <label>Modelo do veículo</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="modelo"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 28 && (
                                <>
                                    <h2>Identificação do Veículo</h2>
                                    <div>
                                        <label>Ano de fabricação do veículo</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="anoFabricacao"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 29 && (
                                <>
                                    <h2>Identificação do Veículo</h2>
                                    <div>
                                        <label>Ano do modelo do veículo</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="anoModelo"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 30 && (
                                <>
                                    <h2>Identificação do Veículo</h2>
                                    <div>
                                        <label>Cor do veículo</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="cor"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 31 && (
                                <>
                                    <h2>Identificação do Veículo</h2>
                                    <div>
                                        <label>Placa do veículo</label>
                                        <input
                                            type='text'
                                            placeholder=''
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
                                    <h2>Identificação do Veículo</h2>
                                    <div>
                                        <label>Chassi do veículo</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="chassi"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 33 && (
                                <>
                                    <h2>Identificação do Veículo</h2>
                                    <div>
                                        <label>Renavam </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="renavam"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 34 && (
                                <>
                                    <h2>Identificação do Veículo</h2>
                                    <div>
                                        <label>Quilometragem atual </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="quilometragemAtual"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 35 && (
                                <>
                                    <h2>Identificação do Veículo</h2>
                                    <div>
                                        <label>Combustível (gasolina, diesel, flex, etc.) </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="combustivel"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 36 && (
                                <>
                                    <h2>Identificação do Veículo</h2>
                                    <div>
                                        <label>Número de portas (se aplicável) </label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="numeroPorta"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 37 && (
                                <>
                                    <h2>Identificação do Veículo</h2>
                                    <div>
                                        <label>Veículo possui acessórios ou itens adicionais (ex.: som, películas, rodas especiais)? </label>
                                        <select name='possuiAdicional' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {possuiAdicional && (
                                <>
                                    {step === 38 && (
                                        <>
                                            <h2>Identificação do Veículo</h2>
                                            <div>
                                                <label>Descreva em detalhes esses acessórios e itens adicionais</label>
                                                <textarea
                                                    id="descrevaAcessorio"
                                                    name="descrevaAcessorio"
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

                            {step === 39 && (
                                <>
                                    <h2>Situação Legal do Veículo</h2>
                                    <div>
                                        <label>O veículo possui débitos pendentes? </label>
                                        <select name='debitoPendente' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {debitoPendente && (
                                <>
                                    {step === 40 && (
                                        <>
                                            <h2>Identificação do Veículo</h2>
                                            <div>
                                                <label>Descreva em detalhes essas pendências</label>
                                                <textarea
                                                    id="descrevaPendencia"
                                                    name="descrevaPendencia"
                                                    onChange={handleChange}
                                                    rows={10}
                                                    cols={50}
                                                    placeholder="ex.:IPVA,Multas,Taxa de licenciamento"
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
                                    <h2>Situação Legal do Veículo</h2>
                                    <div>
                                        <label>O veículo está alienado ou financiado? </label>
                                        <select name='veiculoAlienado' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="alienado">Alienado</option>
                                            <option value="financiado">Financiado</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {veiculoAlienado && (
                                <>
                                    {step === 42 && (
                                        <>
                                            <h2>Situação Legal do Veículo</h2>
                                            <div>
                                                <label>informar a instituição financeira</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="informarInst"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 43 && (
                                        <>
                                            <h2>Situação Legal do Veículo</h2>
                                            <div>
                                                <label>Status do contrato de financiamento</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="statusdofinan"
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
                                    <h2>Situação Legal do Veículo</h2>
                                    <div>
                                        <label>O veículo já foi objeto de sinistro, leilão ou recuperação estrutural? </label>
                                        <select name='objetoSinistro' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 45 && (
                                <>
                                    <h2>Situação Legal do Veículo</h2>
                                    <div>
                                        <label>Certidão de regularidade junto ao Detran foi emitida?</label>
                                        <i>Apresentação do laudo cautelar (se aplicável)</i>
                                        <select name='certidaoDetran' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 46 && (
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


                            {step === 47 && (
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
                                    {step === 48 && (
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
                                    {step === 49 && (
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

                                    {step === 50 && (
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
                                    {step === 51 && (
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


                            {step === 52 && (
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
                                    {step === 53 && (
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

                                    {step === 54 && (
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

                            {step === 55 && (
                                <>
                                    <h2>Prazos e Entrega</h2>
                                    <div>
                                        <label>Data de entrega do veículo ao comprador</label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="dataParaEntrega"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 56 && (
                                <>
                                    <h2>Prazos e Entrega</h2>
                                    <div>
                                        <label>O veículo será entregue com o tanque cheio?  </label>
                                        <select name='tanque' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 57 && (
                                <>
                                    <h2>Prazos e Entrega</h2>
                                    <div>
                                        <label>Data para transferência de titularidade no Detran</label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="dataTitularidade"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 58 && (
                                <>
                                    <h2>Prazos e Entrega</h2>
                                    <div>
                                        <label>Responsabilidade pelas despesas de transferência (custas, taxas do Detran)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="responsabilidade"
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
                                    {step === 61 && (
                                        <>
                                            <h2>Garantias</h2>
                                            <div>
                                                <label>Procedimento para devolução da garantia</label>
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
                                            <br />
                                            Arbitragem:
                                            A arbitragem é um método alternativo de resolução de conflitos, no qual as partes elegem um ou mais árbitros para julgar a disputa.
                                            A decisão arbitral é vinculante e tem força de título executivo judicial, ou seja, pode ser executada judicialmente caso não seja cumprida espontaneamente.
                                            <br />
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
                                    <h2>Declarações das Partes</h2>
                                    <div>
                                        <label>O vendedor declara ser o legítimo proprietário do veículo e que este não possui pendências não informadas no contrato</label>
                                        <div>
                                            <select name='vendedorDeclaracao' onChange={handleChange}>
                                                <option value="">Selecione</option>
                                                <option value="concordo">Sim, o vendedor concorda.</option>
                                                <option value="discordo">Não, o vendedor discorda</option>
                                            </select>
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 80 && (
                                <>
                                    <h2>Declarações das Partes</h2>
                                    <div>
                                        <label>O comprador declara ter ciência do estado de conservação e funcionamento do veículo, assumindo a compra em caráter `como está`, salvo garantias especificadas</label>
                                        <div>
                                            <select name='compradorDeclaracao' onChange={handleChange}>
                                                <option value="">Selecione</option>
                                                <option value="concordo">Sim, o comprador concorda.</option>
                                                <option value="discordo">Não, o comprador discorda</option>
                                            </select>
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </div>
                                </>
                            )}


                            {step === 81 && (
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

                            {step === 82 && (
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
                                    {step === 83 && (
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

                                    {step === 84 && (
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

                                    {step === 85 && (
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

                                    {step === 86 && (
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

                            {step === 87 && (
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

                            {step === 88 && (
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
                            {step === 89 && (
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

                            {step === 90 && (
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
                    <button className='btnBaixarPdf' onClick={() => { geradorCompraEVendaVeiculoPago(formData) }}>
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