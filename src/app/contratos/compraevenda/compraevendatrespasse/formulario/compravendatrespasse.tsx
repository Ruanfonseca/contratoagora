'use client'
import Pilha from '@/lib/pilha';
import { verificarValor } from '@/lib/utils';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import geradorCompraVendaTrespassePago from '../util/pdf';


const compravendatrespasseschema = z.object({
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

    /**DESCRIÇÃO DO ESTABELECIMENTO COMERCIAL */
    nomeFantasia: z.string(),
    razaoSocialComercial: z.string(),
    endereco: z.string(),
    atividadePrincipal: z.string(),
    registroJuntaComercial: z.string(),
    licenca: z.string(),
    alvara: z.string(),
    /** */

    /**COMPONENTES DO ESTABELECIMENTO INCLUIDOS NA VENDA */
    //Bens materiais
    moveis: z.string(),
    utensilios: z.string(),
    equipamentos: z.string(),
    estoque: z.string(),
    veiculos: z.string(),

    //Bens imateriais
    marcas: z.string(),
    patentes: z.string(),
    nomeComercial: z.string(),
    carteiras: z.string(),
    contratosVigentes: z.string(),
    /** */

    /**Situação legal */
    onus: z.enum(['S', 'N']),
    //se sim
    detalhesDivida: z.string(),

    acoesJudiciais: z.enum(['S', 'N']),
    //se sim
    detalhesAcao: z.string(),

    tributos: z.enum(['S', 'N']),
    direitosTrabalhistas: z.enum(['S', 'N']),
    /** */

    /**DO PREÇO E FORMA DE PAGAMENTO */
    valorTotalVenda: z.string(),
    multaAtraso: z.string(),
    formaPagamento: z.enum(['Avista', 'Parcelado']),

    //se for parcelado
    numeroDeParcela: z.string(),
    valorParcelaVenda: z.string(),
    dataVenc: z.string(),

    //senão
    modalidade: z.enum(['Pix', 'CartaoDebito', 'CartaoCredito', 'Boleto']),

    sinal: z.enum(['S', 'N']),
    //se sim
    valorSinal: z.string(),
    dataPag: z.string(),

    contaBancaria: z.string(),
    /** */

    /**Prazos e Transferências */
    dataPrevista: z.string(),
    dataTransfer: z.string(),
    procedimentos: z.string(),
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


    /**Responsabilidades */
    dividasAnteriores: z.enum(['S', 'N']),
    compradorAssume: z.enum(['S', 'N']),
    responsaSolidaria: z.enum(['S', 'N']),
    /** */

    /**Clausula Não concorrentes */
    vendedorCompromete: z.enum(['S', 'N']),
    //se sim 
    area: z.string(),
    periodo: z.string(),
    /** */

    /**Rescisão e Penalidades */
    condicoesRescisao: z.string(),
    multasPenalidades: z.string(),
    prazo: z.string(),
    metodoResolucao: z.enum(['Med', 'Arb', 'Liti']),
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

type FormData = z.infer<typeof compravendatrespasseschema>;


export default function CompraVendaTrespasse() {
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
    const [vendedorJuri, setVendedorJuri] = useState(false);
    const [compradorJuri, setCompradorJuri] = useState(false);
    const [onus, setOnus] = useState(false);
    const [acoesJudiciais, setAcoesJudiciais] = useState(false);
    const [vendedorCompromete, setVendedorCompromete] = useState(false);
    const [passivoAmbiental, setPassivoAmbiental] = useState(false);
    const [outros, setOutros] = useState(false);
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

        if (currentStepData.onus === 'S') {
            setOnus(true);
            nextStep = 40
        } else if (currentStepData.onus === 'N') {
            nextStep = 41;
        }

        if (currentStepData.acoesJudiciais === 'S') {
            setAcoesJudiciais(true);
            nextStep = 42
        } else if (currentStepData.acoesJudiciais === 'N') {
            nextStep = 43;
        }

        if (currentStepData.formaPagamento === 'Avista') {
            setAvista(true);
            nextStep = 49
        } else if (currentStepData.formaPagamento === 'Parcelado') {
            setParcelado(true)
            nextStep = 46;
        }

        if (nextStep === 48) {
            nextStep = 50
        }

        if (currentStepData.sinal === 'S') {
            setSinal(true);
            nextStep = 51
        } else if (currentStepData.sinal === 'N') {
            nextStep = 53;
        }

        if (currentStepData.garantia === 'S') {
            setGarantia(true);
            nextStep = 58;
        } else if (currentStepData.garantia === 'N') {
            nextStep = 73;
        }


        //para verificar se o próximo é o ultimo de step de algum garantidor
        if (nextStep === 68) {
            nextStep = 73
        } else if (nextStep === 69) {
            nextStep = 73
        } else if (nextStep === 70) {
            nextStep = 73
        } else if (nextStep === 71) {
            nextStep = 73
        } else if (nextStep === 72) {
            nextStep = 73
        }


        switch (currentStepData.qualgarantidor) {
            case "fi":
                setFiador(true);
                break;
            case "caudep":
                setCaucaoDep(true);
                nextStep = 69;
                break;
            case "caubem":
                setCaucaoBemIM(true);
                nextStep = 70;
                break;
            case "ti":
                setTitulos(true);
                nextStep = 71;
                break;
            case "segfianca":
                setSeguroFi(true);
                nextStep = 72;
                break;
            default:
                break;
        }

        if (currentStepData.vendedorCompromete === 'S') {
            setVendedorCompromete(true);
            nextStep = 77
        } else if (currentStepData.vendedorCompromete === 'N') {
            nextStep = 79;
        }

        if (currentStepData.testemunhasNecessarias === 'S') {
            setTestemunhas(true);
            nextStep = 85
        } else if (currentStepData.testemunhasNecessarias === 'N') {
            nextStep = 89;
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


    const geradorCompraVendaTrespassePdf = (dados: any) => {
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
        doc.text("CONTRATO DE COMPRA E VENDA DE ESTABELECIMENTO COMERCIAL (TRESPASSE)", 105, posY, { align: "center" });
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

        // Seção 2: Descrição do Estabelecimento Comercial
        addSection("2. Descrição do Estabelecimento Comercial", [
            "Art. 1.142 do Código Civil: Considera-se estabelecimento o complexo de bens organizados para o exercício da empresa, por empresário ou sociedade empresária.",
            `Nome fantasia e Razão Social: ${verificarValor(dados.nomeFantasia)}, ${verificarValor(dados.razaoSocialComercial)}`,
            `Endereço completo: ${verificarValor(dados.endereco)}`,
            `Atividade principal exercida: ${verificarValor(dados.atividadePrincipal)}`,
            `Registro na Junta Comercial: ${verificarValor(dados.registroJuntaComercial)}`,
            `Licenças e alvarás necessários para operação: ${verificarValor(dados.licenca)}, ${verificarValor(dados.alvara)}`
        ]);

        // Seção 3: Componentes do Estabelecimento Incluídos na Venda
        addSection("3. Componentes do Estabelecimento Incluídos na Venda", [
            "Art. 1.144 do Código Civil: Salvo disposição em contrário, a alienação do estabelecimento importa a transferência de todos os seus elementos essenciais para a exploração da empresa.",
            "Bens materiais:",
            `Móveis, utensílios e equipamentos: ${verificarValor(dados.moveis)}, ${verificarValor(dados.utensilios)}, ${verificarValor(dados.equipamentos)}`,
            `Estoque de mercadorias: ${verificarValor(dados.estoque)}`,
            `Veículos: ${verificarValor(dados.veiculos)}`,
            "",
            "Bens imateriais:",
            `Marcas e patentes: ${verificarValor(dados.marcas)}, ${verificarValor(dados.patentes)}`,
            `Nome comercial: ${verificarValor(dados.nomeComercial)}`,
            `Carteira de clientes: ${verificarValor(dados.carteiras)}`,
            `Contratos vigentes (ex.: fornecedores, locação): ${verificarValor(dados.contratosVigentes)}`
        ]);

        // Seção 4: Situação Legal e Financeira do Estabelecimento
        addSection("4. Situação Legal e Financeira do Estabelecimento", [
            "Art. 1.146 do Código Civil: O adquirente do estabelecimento responde pelo pagamento dos débitos anteriores à transferência, desde que regularmente contabilizados.",
            `O estabelecimento possui dívidas ou ônus? ${verificarValor(dados.onus) === 'S' ? 'Sim' : 'Não'}`,
            dados.onus === 'S' ? `Detalhes das dívidas ou ônus: ${verificarValor(dados.detalhesDivida)}` : '',
            `Existem ações judiciais em andamento relacionadas ao estabelecimento? ${verificarValor(dados.acoesJudiciais) === 'S' ? 'Sim' : 'Não'}`,
            dados.acoesJudiciais === 'S' ? `Detalhes das ações judiciais: ${verificarValor(dados.detalhesAcao)}` : '',
            `Os tributos estão regularizados? ${verificarValor(dados.tributos) === 'S' ? 'Sim' : 'Não'}`,
            `Os funcionários possuem direitos trabalhistas pendentes? ${verificarValor(dados.direitosTrabalhistas) === 'S' ? 'Sim' : 'Não'}`
        ]);

        // Seção 5: Preço e Condições de Pagamento
        addSection("5. Preço e Condições de Pagamento", [
            "Art. 481 – Pelo contrato de compra e venda, um dos contratantes se obriga a transferir o domínio de certa coisa, e o outro, a pagar - lhe certo preço em dinheiro.",
            "Art. 489 – Salvo cláusula em contrário, os riscos da coisa vendida passam ao comprador desde a tradição.",
            "Art. 507 – A penalidade deve ser reduzida equitativamente pelo juiz se a obrigação principal tiver sido cumprida em parte, ou se o montante da penalidade for manifestamente excessivo.",
            `Valor total da venda: R$ ${verificarValor(dados.valorTotalVenda)}`,
            `Forma de pagamento: ${verificarValor(dados.formaPagamento)}`,
            dados.formaPagamento === 'Parcelado' ? `Número de parcelas: ${verificarValor(dados.numeroDeParcela)}` : '',
            dados.formaPagamento === 'Parcelado' ? `Valor de cada parcela: R$ ${verificarValor(dados.valorParcelaVenda)}` : '',
            dados.formaPagamento === 'Parcelado' ? `Data de vencimento das parcelas: ${verificarValor(dados.dataVenc)}` : '',
            dados.formaPagamento === 'Avista' ? `Modalidade de pagamento: ${verificarValor(dados.modalidade)}` : '',
            `Foi pago sinal? ${verificarValor(dados.sinal) === 'S' ? 'Sim' : 'Não'}`,
            dados.sinal === 'S' ? `Valor do sinal: R$ ${verificarValor(dados.valorSinal)}` : '',
            dados.sinal === 'S' ? `Data de pagamento do sinal: ${verificarValor(dados.dataPag)}` : '',
            `Conta bancária para depósito (se aplicável): ${verificarValor(dados.contaBancaria)}`
        ]);

        // Seção 6: Prazos e Transferência
        addSection("6. Prazos e Transferência", [
            "Art. 132, §3º – Os prazos de meses e anos expiram no dia de igual número do mês ou do ano do vencimento.",
            "Art. 1.145 – Aquele que adquirir estabelecimento comercial responde pelo pagamento dos débitos anteriores à transferência, se essa não tiver sido notificada aos credores.",
            "Art. 1.146 – O adquirente do estabelecimento responde pelo cumprimento das obrigações do alienante, salvo se houver acordo em contrário registrado.",
            `Data prevista para a assinatura do contrato: ${verificarValor(dados.dataPrevista)}`,
            `Data de transferência efetiva do estabelecimento ao comprador: ${verificarValor(dados.dataTransfer)}`,
            `Procedimentos para transferência de propriedade junto aos órgãos competentes: ${verificarValor(dados.procedimentos)}`
        ]);

        // Seção 7: Obrigações das Partes
        addSection("7. Obrigações das Partes", [
            "Art. 422 – Os contratantes são obrigados a guardar, assim na conclusão do contrato, como em sua execução, os princípios de probidade e boa - fé.",
            "Art. 475 – A parte lesada pelo inadimplemento pode pedir a resolução do contrato, se não preferir exigir-lhe o cumprimento, cabendo, em qualquer dos casos, indenização por perdas e danos.",
            "Art. 1.147 – Não havendo autorização expressa, o alienante do estabelecimento não pode fazer concorrência ao adquirente.",
            "Vendedor:",
            "Garantir a legitimidade e propriedade do estabelecimento.",
            "Assegurar que o estabelecimento está livre de quaisquer ônus ou dívidas, salvo as informadas.",
            "Fornecer todos os documentos necessários para a transferência de propriedade.",
            "Notificar os credores sobre a transferência, conforme exigido pelo Art. 1.145 do Código Civil Brasileiro.",
            "",
            "Comprador:",
            "Efetuar os pagamentos conforme acordado.",
            "Providenciar a transferência de titularidade junto aos órgãos competentes.",
            "Assumir as operações do estabelecimento a partir da data acordada."
        ]);

        // Seção 8: Responsabilidade por Dívidas Anteriores
        addSection("8. Responsabilidade por Dívidas Anteriores", [
            "Art. 1.145 – O adquirente responde pelos débitos do estabelecimento se não houver notificação aos credores.",
            "Art. 1.146 – Salvo acordo em contrário, registrado, o adquirente responde pelo cumprimento das obrigações do alienante.",
            "Art. 391 – Pelo inadimplemento das obrigações respondem todos os bens do devedor.",
            `As partes acordam sobre a responsabilidade por dívidas anteriores à transferência? ${verificarValor(dados.dividasAnteriores) === 'S' ? 'Sim' : 'Não'}`,
            dados.dividasAnteriores === 'S' ? `O comprador assumirá as dívidas existentes? ${verificarValor(dados.compradorAssume) === 'S' ? 'Sim' : 'Não'}` : '',
            dados.dividasAnteriores === 'S' ? `Haverá responsabilidade solidária entre vendedor e comprador? ${verificarValor(dados.responsaSolidaria) === 'S' ? 'Sim' : 'Não'}` : ''
        ]);

        // Seção 9: Cláusula de Não Concorrência
        addSection("9. Cláusula de Não Concorrência", [
            "Art. 1.147 – Não havendo autorização expressa, o alienante do estabelecimento não pode fazer concorrência ao adquirente nos cinco anos subsequentes à transferência.",
            "Art. 114 – Os negócios jurídicos devem ser interpretados conforme a boa-fé e os usos do lugar de sua celebração.",
            `O vendedor se compromete a não exercer atividade concorrente em determinada área geográfica e por um período específico? ${verificarValor(dados.vendedorCompromete) === 'S' ? 'Sim' : 'Não'}`,
            dados.vendedorCompromete === 'S' ? `Área de restrição: ${verificarValor(dados.area)}` : '',
            dados.vendedorCompromete === 'S' ? `Período de restrição: ${verificarValor(dados.periodo)}` : ''
        ]);

        // Seção 10: Rescisão e Penalidades
        addSection("10. Rescisão e Penalidades", [
            "Art. 474 – A cláusula resolutiva expressa opera de pleno direito; a tácita depende de interpelação judicial.",
            "Art. 476 – Nos contratos bilaterais, nenhum dos contratantes pode exigir o cumprimento da obrigação do outro antes de cumprir a sua.",
            "Art. 418 – Se a cláusula penal for estipulada para o caso de inadimplemento total da obrigação, o credor pode exigir a pena, ou o cumprimento da obrigação, nos termos do disposto no capítulo das obrigações.",
            `Condições para rescisão do contrato por qualquer das partes: ${verificarValor(dados.condicoesRescisao)}`,
            `Multas ou penalidades em caso de descumprimento de cláusulas contratuais: ${verificarValor(dados.multasPenalidades)}`,
            `Prazo para notificação prévia em caso de rescisão: ${verificarValor(dados.prazo)}`
        ]);

        // Seção 11: Disposições Gerais
        addSection("11. Disposições Gerais", [
            "Art. 53 – Nos contratos de venda com reserva de domínio, considera - se rescindido de pleno direito o contrato se o comprador não pagar as prestações devidas.",
            "Art. 585 – Os contratos assinados por duas testemunhas são títulos executivos extrajudiciais.",
            "Art. 215 – O instrumento particular, feito e assinado por todos os que nele intervêm, prova as obrigações convencionadas.",
            `Foro eleito para resolução de conflitos: ${verificarValor(dados.foroResolucaoConflitos)}`,
            `Necessidade de testemunhas para assinatura do contrato: ${verificarValor(dados.testemunhasNecessarias) === 'S' ? 'Sim' : 'Não'}`,
            dados.testemunhasNecessarias === 'S' ? `Nome da primeira testemunha: ${verificarValor(dados.nomeTest1)}` : '',
            dados.testemunhasNecessarias === 'S' ? `CPF da primeira testemunha: ${verificarValor(dados.cpfTest1)}` : '',
            dados.testemunhasNecessarias === 'S' ? `Nome da segunda testemunha: ${verificarValor(dados.nomeTest2)}` : '',
            dados.testemunhasNecessarias === 'S' ? `CPF da segunda testemunha: ${verificarValor(dados.cpfTest2)}` : '',
            `Local de assinatura do contrato: ${verificarValor(dados.local)}`,
            `Data de assinatura do contrato: ${verificarValor(dados.dataAssinatura)}`,
            `O contrato será registrado em cartório? ${verificarValor(dados.registroCartorioTest) === 'S' ? 'Sim' : 'Não'}`
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
        geradorCompraVendaTrespassePdf({ ...formData });
    }, [formData]);

    return (
        <>
            <div className="caixa-titulo-subtitulo">
                <h1 className="title">Contrato de Compra e Venda de Estabelecimento Comercial (Trespasse)</h1>
            </div>
            <div className="container">
                <div className="left-panel">
                    <div className="scrollable-card">
                        <div className="progress-bar">
                            <div
                                className="progress-bar-inner"
                                style={{ width: `${(step / 91) * 100}%` }}
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
                                    <h2>Descrição do Estabelecimento Comercial</h2>
                                    <div>
                                        <label>Nome fantasia</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="nomeFantasia"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 26 && (
                                <>
                                    <h2>Descrição do Estabelecimento Comercial</h2>
                                    <div>
                                        <label>Razão Social</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="razaoSocialComercial"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 27 && (
                                <>
                                    <h2>Descrição do Estabelecimento Comercial</h2>
                                    <div>
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

                            {step === 28 && (
                                <>
                                    <h2>Descrição do Estabelecimento Comercial</h2>
                                    <div>
                                        <label>Atividade principal exercida</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="atividadePrincipal"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 29 && (
                                <>
                                    <h2>Descrição do Estabelecimento Comercial</h2>
                                    <div>
                                        <label>Registro na Junta Comercial</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="registroJuntaComercial"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 30 && (
                                <>
                                    <h2>Descrição do Estabelecimento Comercial</h2>
                                    <div>
                                        <label>Licenças e alvarás necessários para operação</label>
                                        <input
                                            type='text'
                                            placeholder='Licença'
                                            name="licenca"
                                            onChange={handleChange}
                                        />
                                        <input
                                            type='text'
                                            placeholder='Alvará'
                                            name="alvara"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 31 && (
                                <>
                                    <h2>Componentes do Estabelecimento Incluídos na Venda</h2>
                                    <i>Bens materiais</i>
                                    <div>
                                        <label>Móveis</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="moveis"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 32 && (
                                <>
                                    <h2>Componentes do Estabelecimento Incluídos na Venda</h2>
                                    <i>Bens materiais</i>
                                    <div>
                                        <label>Utensílios e Equipamentos</label>
                                        <input
                                            type='text'
                                            placeholder='utensilios'
                                            name="utensilios"
                                            onChange={handleChange}
                                        />
                                        <input
                                            type='text'
                                            placeholder='equipamentos'
                                            name="equipamentos"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 33 && (
                                <>
                                    <h2>Componentes do Estabelecimento Incluídos na Venda</h2>
                                    <i>Bens materiais</i>
                                    <div>
                                        <label>Estoque de mercadorias</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="estoque"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 34 && (
                                <>
                                    <h2>Componentes do Estabelecimento Incluídos na Venda</h2>
                                    <i>Bens materiais</i>
                                    <div>
                                        <label>Veículos</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="veiculos"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 35 && (
                                <>
                                    <h2>Componentes do Estabelecimento Incluídos na Venda</h2>
                                    <i>Bens imateriais</i>
                                    <div>
                                        <label>Marcas e patentes</label>
                                        <input
                                            type='text'
                                            placeholder='Marcas'
                                            name="marcas"
                                            onChange={handleChange}
                                        />
                                        <input
                                            type='text'
                                            placeholder='Patentes'
                                            name="patentes"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 36 && (
                                <>
                                    <h2>Componentes do Estabelecimento Incluídos na Venda</h2>
                                    <i>Bens imateriais</i>
                                    <div>
                                        <label>Nome comercial</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="nomeComercial"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 37 && (
                                <>
                                    <h2>Componentes do Estabelecimento Incluídos na Venda</h2>
                                    <i>Bens imateriais</i>
                                    <div>
                                        <label>Carteira de clientes</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="carteiras"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 38 && (
                                <>
                                    <h2>Componentes do Estabelecimento Incluídos na Venda</h2>
                                    <i>Bens imateriais</i>
                                    <div>
                                        <label>Contratos vigentes (ex.: fornecedores, locação)</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="contratosVigentes"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 39 && (
                                <>
                                    <h2>Situação Legal e Financeira do Estabelecimento</h2>
                                    <div>
                                        <label>O estabelecimento possui dívidas ou ônus?</label>
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
                                    {step === 40 && (
                                        <>
                                            <h2>Situação Legal e Financeira do Estabelecimento</h2>
                                            <div>
                                                <label>Descreva essa dívida</label>
                                                <textarea
                                                    id="detalhesDivida"
                                                    name="detalhesDivida"
                                                    onChange={handleChange}
                                                    rows={10}
                                                    cols={50}
                                                    placeholder=""
                                                />
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 41 && (
                                <>
                                    <h2>Situação Legal e Financeira do Estabelecimento</h2>
                                    <div>
                                        <label>Existem ações judiciais em andamento relacionadas ao estabelecimento? </label>
                                        <select name='acoesJudiciais' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {acoesJudiciais && (
                                <>
                                    {step === 42 && (
                                        <>
                                            <h2>Situação Legal e Financeira do Estabelecimento</h2>
                                            <div>
                                                <label>Descreva essa ações judiciais</label>
                                                <textarea
                                                    id="detalhesAcao"
                                                    name="detalhesAcao"
                                                    onChange={handleChange}
                                                    rows={10}
                                                    cols={50}
                                                    placeholder=""
                                                />
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {step === 43 && (
                                <>
                                    <h2>Situação Legal e Financeira do Estabelecimento</h2>
                                    <div>
                                        <label>Os tributos estão regularizados? </label>
                                        <select name='tributos' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 44 && (
                                <>
                                    <h2>Situação Legal e Financeira do Estabelecimento</h2>
                                    <div>
                                        <label>Os funcionários possuem direitos trabalhistas pendentes? </label>
                                        <select name='direitosTrabalhistas' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 45 && (
                                <>
                                    <h2> Preço e Condições de Pagamento</h2>
                                    <div>
                                        <label>Valor total da venda</label>
                                        <input
                                            type='text'
                                            placeholder=''
                                            name="valorTotalVenda"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 46 && (
                                <>
                                    <h2> Preço e Condições de Pagamento</h2>
                                    <div>
                                        <label>Multa por atraso de pagamento</label>
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

                            {step === 47 && (
                                <>
                                    <h2> Preço e Condições de Pagamento</h2>
                                    <div>
                                        <label>Forma de Pagamento</label>
                                        <select name='formaPagamento' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="Avista">À vista</option>
                                            <option value="Parcelado">Parcelado</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {Parcelado && (
                                <>
                                    {step === 46 && (
                                        <>
                                            <h2> Preço e Condições de Pagamento</h2>
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

                                    {step === 47 && (
                                        <>
                                            <h2> Preço e Condições de Pagamento</h2>
                                            <div>
                                                <label>Valor de parcelas</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="valorParcelaVenda"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleBack}>Voltar</button>
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}

                                    {step === 48 && (
                                        <>
                                            <h2> Preço e Condições de Pagamento</h2>
                                            <div>
                                                <label>Data de pagamento das parcelas</label>
                                                <input
                                                    type='text'
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
                                    {step === 49 && (
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

                            {step === 50 && (
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
                                    {step === 51 && (
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

                                    {step === 52 && (
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

                            {step === 53 && (
                                <>
                                    <h2>Preço e Condições de Pagamento</h2>
                                    <div>
                                        <label>Conta bancária para recebimento dos valores</label>
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

                            {step === 54 && (
                                <>
                                    <h2>Prazo e Transferências</h2>
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

                            {step === 55 && (
                                <>
                                    <h2>Prazo e Transferências</h2>
                                    <div>
                                        <label>Data de transferência efetiva do estabelecimento ao comprador</label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="dataTransfer"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 56 && (
                                <>
                                    <h2>Prazo e Transferências</h2>
                                    <div>
                                        <label>Procedimentos para transferência de propriedade junto aos órgãos competentes</label>
                                        <input
                                            type='date'
                                            placeholder=''
                                            name="procedimentos"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 57 && (
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
                                    {step === 58 && (
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
                                    {step === 59 && (
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
                                    {step === 60 && (
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

                                    {step === 61 && (
                                        <>
                                            <h2>Dados do Fiador</h2>
                                            <div>
                                                <label>Qual é o nome do fiador ?</label>
                                                <div>
                                                    <input
                                                        type='text'
                                                        placeholder=''
                                                        name="nomeFiador"
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
                                            <h2>Dados do Fiador</h2>
                                            <div>
                                                <label>Estado Cívil</label>
                                                <div>
                                                    <select name='estadoCivilFiador' onChange={handleChange}>
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

                                    {step === 63 && (
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

                                    {step === 64 && (
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

                                    {step === 65 && (
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

                                    {step === 66 && (
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

                                    {step === 67 && (
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

                                    {step === 68 && (
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
                                    {step === 69 && (
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
                                    {step === 70 && (
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
                                    {step === 71 && (
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
                                    {step === 72 && (
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


                            {step === 73 && (
                                <>
                                    <h2>Responsabilidade por Dívidas Anteriores </h2>
                                    <div>
                                        <label>As partes acordam sobre a responsabilidade por dívidas anteriores à transferência? </label>
                                        <select name='dividasAnteriores' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 74 && (
                                <>
                                    <h2>Responsabilidade por Dívidas Anteriores </h2>
                                    <div>
                                        <label>O comprador assumirá as dívidas existentes?</label>
                                        <select name='compradorAssume' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 75 && (
                                <>
                                    <h2>Responsabilidade por Dívidas Anteriores </h2>
                                    <div>
                                        <label>Haverá responsabilidade solidária entre vendedor e comprador? </label>
                                        <select name='responsaSolidaria' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 76 && (
                                <>
                                    <h2>Cláusula de Não Concorrência </h2>
                                    <div>
                                        <label>O vendedor se compromete a não exercer atividade concorrente em determinada área geográfica e por um período específico? </label>
                                        <select name='vendedorCompromete' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {vendedorCompromete && (
                                <>
                                    {step === 77 && (
                                        <>
                                            <h2>Situação Legal e Financeira do Estabelecimento</h2>
                                            <div>
                                                <label>Especificar área</label>
                                                <textarea
                                                    id="area"
                                                    name="area"
                                                    onChange={handleChange}
                                                    rows={10}
                                                    cols={50}
                                                    placeholder=""
                                                />
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                    {step === 78 && (
                                        <>
                                            <h2>Situação Legal e Financeira do Estabelecimento</h2>
                                            <div>
                                                <label>Especificar período</label>
                                                <input
                                                    type='text'
                                                    placeholder=''
                                                    name="periodo"
                                                    onChange={handleChange}
                                                />
                                                <button onClick={handleNext}>Próximo</button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}


                            {step === 79 && (
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

                            {step === 80 && (
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

                            {step === 81 && (
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

                            {step === 82 && (
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

                            {step === 83 && (
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

                            {step === 84 && (
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
                                    {step === 85 && (
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

                                    {step === 86 && (
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

                                    {step === 87 && (
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

                                    {step === 88 && (
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

                            {step === 89 && (
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

                            {step === 90 && (
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
                            {step === 91 && (
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

                            {step === 92 && (
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
                    <button className='btnBaixarPdf' onClick={() => { geradorCompraVendaTrespassePago(formData) }}>
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