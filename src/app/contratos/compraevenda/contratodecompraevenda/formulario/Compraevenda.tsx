import { formatarData } from '@/lib/utils';
import api from '@/services';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useEffect, useState } from 'react';
import InputMask from 'react-input-mask';
import { z } from 'zod';
import geradorPdfFinalizado from '../util/pdf';
import './form.css';


const cvschema = z.object({
    isimovel: z.enum(['S', 'N']).default('N'),
    isveiculo: z.enum(['S', 'N']).default('N'),

    // Dados do comprador
    comprador: z.enum(['pf', 'pj']).default('pf'),
    compradorSexo: z.enum(['F', 'M']).default('M'),
    compradorNome: z.string().nonempty('Nome do comprador é obrigatório'),
    compradorEstadoCivil: z.enum(['S', 'CS', 'DV', 'Vi']),
    compradorProfissao: z.string().nonempty('Profissão é obrigatória'),
    compradorDoc: z.enum(['Rg', 'Ifunc', 'ctps', 'cnh', 'passaporte']),
    compradorNumDoc: z.string().nonempty('Número do documento é obrigatório'),
    compradorCpf: z.string().nonempty('CPF é obrigatório'),
    compradorEndereco: z.string().nonempty('Endereço é obrigatório'),

    // Dados do vendedor
    vendedor: z.enum(['pf', 'pj']).default('pf'),
    vendedorSexo: z.enum(['F', 'M']).default('M'),
    vendedorNome: z.string().nonempty('Nome do vendedor é obrigatório'),
    vendedorEstadoCivil: z.enum(['S', 'CS', 'DV', 'Vi']),
    vendedorProfissao: z.string().nonempty('Profissão é obrigatória'),
    vendedorDoc: z.enum(['Rg', 'Ifunc', 'ctps', 'cnh', 'passaporte']),
    vendedorNumDoc: z.string().nonempty('Número do documento é obrigatório'),
    vendedorCpf: z.string().nonempty('CPF é obrigatório'),
    vendedorEndereco: z.string().nonempty('Endereço é obrigatório'),

    // Informações sobre o bem
    descDobemVendido: z.string().nonempty('Coloque uma descrição do bem que será vendido'),
    detalhesBemVendido: z.string().nonempty('Detalhamento completo do bem (marca, modelo, ano, cor, etc.)'),

    // Informações de entrega
    entregaDobem: z.enum(['hj', 'outrodia']).default('hj'),
    dataDaEntrega: z.date().optional(),
    formaDeEntrega: z.enum(['compradorBusca', 'vendedorEntrega']),
    enderecoDeEntrega: z.string().nonempty('Endereço de entrega obrigatório'),

    // Condições do bem
    isbemVistoriado: z.enum(['S', 'N']).default('S'),

    // Pagamento
    valorDoBem: z.string().nonempty('Informe o valor do bem (R$)'),
    formaDePagamento: z.enum(['avista', 'parcelado']),
    valorDeEntrada: z.string().optional(),
    numeroDeParcelas: z.number().optional(),
    pagamentoDocomprador: z.enum(['S', 'N']),

    // Garantia e desistência
    hasGarantia: z.enum(['S', 'N']),
    validadeGarantia: z.string().optional(),
    desistenciaCompra: z.enum(['S', 'N']),
    aplicacaoMulta: z.enum(['S', 'N']),
    valorMulta: z.string().optional(),

    // Assinatura e local de assinatura
    cidadeDeassinaturadocv: z.string().nonempty('Informe a cidade de assinatura'),
    dataDaAssinatura: z.date(),
    testemunha1Nome: z.string().nonempty('Informe o nome da 1ª testemunha'),
    testemunha1CPF: z.string().nonempty('Informe o CPF da 1ª testemunha'),
    testemunha2Nome: z.string().nonempty('Informe o nome da 2ª testemunha'),
    testemunha2CPF: z.string().nonempty('Informe o CPF da 2ª testemunha'),

    // Cláusula de foro
    foroDeResolucao: z.string().nonempty('Informe o foro de resolução de conflitos (cidade)'),
});

type FormData = z.infer<typeof cvschema>;


export default function CompraEVenda() {
    const [isPreviewEnabled, setPreviewEnabled] = useState(false);
    const [isPaymentComplete, setPaymentComplete] = useState(false);
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

    /**Construindo as etapas */
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<FormData>>({});
    const handleNext = () => setStep((prev) => prev + 1);
    const handleBack = () => setStep((prev) => prev - 1);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };


    const gerandoPdf = (data: any) => {
        const doc = new jsPDF();

        // Adicionar marca d'água
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(50);
        doc.setTextColor(150, 150, 150); // Cinza claro
        doc.text("Visualização Exemplo", 120, 150, { align: "center", angle: 45 });

        // Título do documento
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0); // Preto
        doc.text("CONTRATO DE COMPRA E VENDA", 105, 20, { align: "center" });

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(12);

        // Preâmbulo legal
        doc.text(
            "Este contrato é celebrado nos termos dos artigos 481 e seguintes do Código Civil Brasileiro, " +
            "regendo-se pelas cláusulas e condições descritas abaixo.",
            10,
            30,
            { maxWidth: 190 }
        );

        // Identificação das partes
        doc.text("IDENTIFICAÇÃO DAS PARTES", 10, 50);
        doc.text(
            `Comprador: ${data.compradorNome}, ${data.compradorEstadoCivil === "S"
                ? "solteiro(a)"
                : data.compradorEstadoCivil === "CS"
                    ? "casado(a)"
                    : data.compradorEstadoCivil === "DV"
                        ? "divorciado(a)"
                        : "viúvo(a)"
            }, ${data.compradorProfissao}, portador do ${data.compradorDoc
            } nº ${data.compradorNumDoc}, CPF nº ${data.compradorCpf}, residente em ${data.compradorEndereco
            }.`,
            10,
            60,
            { maxWidth: 190 }
        );
        doc.text(
            `Vendedor: ${data.vendedorNome}, ${data.vendedorEstadoCivil === "S"
                ? "solteiro(a)"
                : data.vendedorEstadoCivil === "CS"
                    ? "casado(a)"
                    : data.vendedorEstadoCivil === "DV"
                        ? "divorciado(a)"
                        : "viúvo(a)"
            }, ${data.vendedorProfissao}, portador do ${data.vendedorDoc
            } nº ${data.vendedorNumDoc}, CPF nº ${data.vendedorCpf}, residente em ${data.vendedorEndereco
            }.`,
            10,
            80,
            { maxWidth: 190 }
        );

        // Descrição do bem
        doc.text("DESCRIÇÃO DO BEM", 10, 100);
        doc.text(
            `Bem objeto da venda: ${data.descDobemVendido}. Detalhes específicos: ${data.detalhesBemVendido}.`,
            10,
            110,
            { maxWidth: 190 }
        );

        // Condições de entrega
        doc.text("CONDIÇÕES DE ENTREGA", 10, 130);
        doc.text(
            `O bem será entregue ${data.entregaDobem === "hj"
                ? "na data da assinatura deste contrato"
                : `em ${formatarData(data.dataDaEntrega)}`
            }, no endereço: ${data.enderecoDeEntrega}. A entrega será realizada ${data.formaDeEntrega === "compradorBusca"
                ? "pelo comprador, que buscará o bem."
                : "pelo vendedor, que se compromete a entregá-lo no local indicado."
            }`,
            10,
            140,
            { maxWidth: 190 }
        );

        // Cláusulas legais
        doc.text("CLÁUSULAS LEGAIS", 10, 160);
        doc.text(
            "1. O vendedor declara que o bem objeto deste contrato está livre de quaisquer ônus, dívidas, ou defeitos ocultos, conforme disposto no artigo 492 do Código Civil.",
            10,
            170,
            { maxWidth: 190 }
        );
        doc.text(
            "2. As partes obrigam-se a cumprir fielmente todas as disposições deste contrato, sob pena de rescisão nos termos do artigo 475 do Código Civil.",
            10,
            180,
            { maxWidth: 190 }
        );
        doc.text(
            "3. O comprador declara estar ciente das condições do bem adquirido e que realizou vistoria prévia, conforme artigo 427 do Código Civil.",
            10,
            190,
            { maxWidth: 190 }
        );
        doc.text(
            "4. Em caso de inadimplência por parte do comprador no pagamento das parcelas, será aplicada multa de 2% sobre o valor devido, além de juros de mora de 1% ao mês, conforme legislação vigente.",
            10,
            200,
            { maxWidth: 190 }
        );

        // Cláusula de foro
        doc.text("CLÁUSULA DE FORO", 10, 220);
        doc.text(
            `Fica eleito o foro da comarca de ${data.foroDeResolucao} para resolver eventuais controvérsias, renunciando a qualquer outro, por mais privilegiado que seja.`,
            10,
            230,
            { maxWidth: 190 }
        );

        // Assinaturas
        doc.text("ASSINATURAS", 10, 250);
        doc.text("_________________________", 10, 260);
        doc.text("Comprador", 10, 265);
        doc.text("_________________________", 100, 260);
        doc.text("Vendedor", 100, 265);

        // Gerar URL do PDF para visualização
        const pdfDataUri = doc.output("datauristring");
        setPdfDataUrl(pdfDataUri);
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

    useEffect(() => {
        gerandoPdf({ ...formData });
    }, [formData]);


    return (
        <>

            <div className="caixa-titulo-subtitulo">
                <h1 className="title">Contrato de Compra e Venda</h1>
                <i className="subtitle">O modelo abaixo não é válido para compra e venda de imóveis ou veículos</i>
            </div>

            <div className="container">
                <div className="left-panel">
                    <div className="scrollable-card">

                        <div className="progress-bar">
                            <div
                                className="progress-bar-inner"
                                style={{ width: `${(step / 24) * 100}%` }}
                            ></div>
                        </div>
                        <div className="form-wizard">


                            {step === 1 && (
                                <>
                                    <h2>Dados do Comprador</h2>
                                    <div>
                                        <label>O comprador é pessoa?</label>
                                        <select name='comprador' onChange={handleChange}>
                                            <option value="pj">Jurídica</option>
                                            <option value="pf">Física</option>
                                        </select>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <h2>Dados do Comprador</h2>
                                    <div>
                                        <label>Nome:</label>
                                        <input
                                            type='text'
                                            placeholder='Nome do Comprador'
                                            name="compradorNome"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 3 && (
                                <>
                                    <h2>Dados do Comprador</h2>
                                    <div>
                                        <label>Sexo:</label>
                                        <select name='compradorSexo' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="F">Feminino</option>
                                            <option value="M">Masculino</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 4 &&
                                (
                                    <>
                                        <h2>Dados do Comprador</h2>
                                        <div>
                                            <label>Estado Civil:</label>
                                            <select name='compradorEstadoCivil' onChange={handleChange}>
                                                <option value="">Selecione</option>
                                                <option value="S">Solteiro(a)</option>
                                                <option value="CS">Casado(a)</option>
                                                <option value="DV">Divorciado(a)</option>
                                                <option value="Vi">Viúvo(a)</option>
                                            </select>
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </>
                                )}



                            {step === 5 &&
                                (
                                    <>
                                        <h2>Dados do Comprador</h2>
                                        <div>
                                            <label>Profissão:</label>
                                            <input
                                                type='text'
                                                placeholder='Profissão do Comprador'
                                                name='compradorProfissao'
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </>
                                )}
                            {step === 6 && (
                                <>
                                    <h2>Dados do Comprador</h2>
                                    <div>
                                        <label>Documento de Identificação:</label>
                                        <select name='compradorDoc' onChange={handleChange} >
                                            <option value="">Selecione</option>
                                            <option value="Rg">RG</option>
                                            <option value="Ifunc">Identidade Funcional</option>
                                            <option value="ctps">CTPS</option>
                                            <option value="cnh">CNH</option>
                                            <option value="passaporte">Passaporte</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 7 &&
                                (
                                    <>
                                        <h2>Dados do Comprador</h2>

                                        <div>
                                            <label>Número do Documento:</label>
                                            <input
                                                type='text'
                                                placeholder='Número de identificação'
                                                name='compradorNumDoc'
                                                onChange={handleChange} />
                                        </div>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </>
                                )}


                            {step === 8 &&
                                (
                                    <>
                                        <h2>Dados do Comprador</h2>
                                        <div>
                                            <label>CPF:</label>
                                            <InputMask
                                                name='compradorCpf'
                                                mask="999.999.999-99"
                                                maskChar="_"
                                                onChange={handleChange}
                                            >
                                                {(inputProps) => <input {...inputProps} />}
                                            </InputMask>
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                            </div>
                                    </>
                                )}
                            {step === 9 &&
                                (
                                    <>
                                        <h2>Dados do Comprador</h2>
                                        <div>
                                            <label>Endereço:</label>
                                            <input
                                                type='text'
                                                placeholder='Endereço'
                                                name='compradorEndereco'
                                                onChange={handleChange}
                                            />

                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                            </div>
                                    </>
                                )}





                            {step === 10 && (
                                <>
                                    <h2>Dados do Vendedor</h2>
                                    <div>
                                        <label>O vendedor é pessoa?</label>
                                        <select name='vendedor' onChange={handleChange}>
                                            <option value="pj">Jurídica</option>
                                            <option value="pf">Física</option>
                                        </select>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 11 && (
                                <>
                                    <h2>Dados do Vendedor</h2>
                                    <div>
                                        <label>Nome:</label>
                                        <input
                                            type='text'
                                            placeholder='Nome do vendedor'
                                            name="vendedorNome"
                                            onChange={handleChange}
                                        />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 12 && (
                                <>
                                    <h2>Dados do Vendedor</h2>
                                    <div>
                                        <label>Sexo:</label>
                                        <select name='vendedorSexo' onChange={handleChange}>
                                            <option value="">Selecione</option>
                                            <option value="F">Feminino</option>
                                            <option value="M">Masculino</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 13 &&
                                (
                                    <>
                                        <h2>Dados do Vendedor</h2>
                                        <div>
                                            <label>Estado Civil:</label>
                                            <select name='vendedorEstadoCivil' onChange={handleChange}>
                                                <option value="">Selecione</option>
                                                <option value="S">Solteiro(a)</option>
                                                <option value="CS">Casado(a)</option>
                                                <option value="DV">Divorciado(a)</option>
                                                <option value="Vi">Viúvo(a)</option>
                                            </select>
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </>
                                )}



                            {step === 14 &&
                                (
                                    <>
                                        <h2>Dados do Vendedor</h2>
                                        <div>
                                            <label>Profissão:</label>
                                            <input
                                                type='text'
                                                placeholder='Profissão do Comprador'
                                                name='vendedorProfissao'
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </>
                                )}

                            {step === 15 && (
                                <>
                                    <h2>Dados do Vendedor</h2>
                                    <div>
                                        <label>Documento de Identificação:</label>
                                        <select name='vendedorDoc' onChange={handleChange} >
                                            <option value="">Selecione</option>
                                            <option value="Rg">RG</option>
                                            <option value="Ifunc">Identidade Funcional</option>
                                            <option value="ctps">CTPS</option>
                                            <option value="cnh">CNH</option>
                                            <option value="passaporte">Passaporte</option>
                                        </select>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}


                            {step === 16 &&
                                (
                                    <>
                                        <h2>Dados do Vendedor</h2>

                                        <div>
                                            <label>Número do Documento:</label>
                                            <input
                                                type='text'
                                                placeholder='Número de identificação'
                                                name='vendedorNumDoc'
                                                onChange={handleChange} />
                                        </div>
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </>
                                )}


                            {step === 17 &&
                                (
                                    <>
                                        <h2>Dados do Comprador</h2>
                                        <div>
                                            <label>CPF:</label>
                                            <InputMask
                                                name='vendedorCpf'
                                                mask="999.999.999-99"
                                                maskChar="_"
                                                onChange={handleChange}
                                            >
                                                {(inputProps) => <input {...inputProps} />}
                                            </InputMask>
                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>                            </div>
                                    </>
                                )}
                            {step === 18 &&
                                (
                                    <>
                                        <h2>Dados do Vendedor</h2>
                                        <div>
                                            <label>Endereço:</label>
                                            <input
                                                type='text'
                                                placeholder='Endereço'
                                                name='vendedorEndereco'
                                                onChange={handleChange}
                                            />

                                            <button onClick={handleBack}>Voltar</button>
                                            <button onClick={handleNext}>Próximo</button>
                                        </div>
                                    </>
                                )}

                            {step === 19 && (
                                <>
                                    <h2>Informações do Bem</h2>
                                    <div>
                                        <label>Descrição do Bem:</label>
                                        <input type="text" name="descDobemVendido" placeholder='Descrição' onChange={handleChange} />

                                        <label>Detalhes do Bem a serem destacados:</label>
                                        <input type="text" name="detalhesBemVendido" placeholder='Detalhes' onChange={handleChange} />
                                        <button onClick={handleBack}>Voltar</button>
                                        <button onClick={handleNext}>Próximo</button>
                                    </div>
                                </>
                            )}

                            {step === 20 && (
                                <>
                                    <h2>Entrega</h2>
                                    <div>
                                        <label>Entrega do Bem:</label>
                                        <select name='entregaDobem' onChange={handleChange}>
                                            <option value="hj">Hoje</option>
                                            <option value="outrodia">Outro Dia</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label>Data da Entrega:</label>
                                        <input type="date" name='dataDaEntrega' onChange={handleChange} />
                                    </div>

                                    <div>
                                        <label>Forma de Entrega:</label>
                                        <select name='formaDeEntrega' onChange={handleChange}>
                                            <option value="compradorBusca">Comprador Busca</option>
                                            <option value="vendedorEntrega">Vendedor Entrega</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label>Endereço de Entrega:</label>
                                        <input name='enderecoDeEntrega' onChange={handleChange} />
                                    </div>
                                    <button onClick={handleBack}>Voltar</button>
                                    <button onClick={handleNext}>Próximo</button>
                                </>
                            )}

                            {step === 21 && (
                                <>
                                    <h2>Pagamento</h2>
                                    <div>
                                        <label>Valor do Bem (R$):</label>
                                        <input type="text" name='valorDoBem' placeholder='R$' onChange={handleChange} />
                                    </div>

                                    <div>
                                        <label>Forma de Pagamento:</label>
                                        <select name='formaDePagamento' onChange={handleChange}>
                                            <option value="avista">À Vista</option>
                                            <option value="parcelado">Parcelado</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label>Valor de Entrada:</label>
                                        <input type="text" name='valorDeEntrada' placeholder='R$' onChange={handleChange} />
                                    </div>

                                    <div>
                                        <label>Número de Parcelas:</label>
                                        <input type="number" name='numeroDeParcelas' placeholder='N°' />
                                    </div>

                                    <button onClick={handleBack}>Voltar</button>
                                    <button onClick={handleNext}>Próximo</button>
                                </>)}



                            {step === 22 && (
                                <>
                                    <h2>Garantia</h2>
                                    <div>
                                        <label>Garantia:</label>
                                        <select name='hasGarantia' onChange={handleChange}>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label>Validade da Garantia:</label>
                                        <input type="text" name='validadeGarantia' onChange={handleChange} />
                                    </div>

                                    <button onClick={handleBack}>Voltar</button>
                                    <button onClick={handleNext}>Próximo</button>
                                </>)}

                            {step === 23 && (
                                <>
                                    <h2>Assinatura</h2>

                                    <div>
                                        <label>Cidade:</label>
                                        <input type='text' placeholder='Cidade' name='cidadeDeassinaturadocv' onChange={handleChange} />
                                    </div>

                                    <div>
                                        <label>Data:</label>
                                        <input type="date" name='dataDaAssinatura' onChange={handleChange} />
                                    </div>

                                    <div>
                                        <label>Nome da 1ª Testemunha:</label>
                                        <input type='text' placeholder='Nome' name='testemunha1Nome' onChange={handleChange} />
                                    </div>

                                    <div>
                                        <label>CPF da 1ª Testemunha:</label>
                                        <input type='text' name='testemunha1CPF' placeholder='CPF' onChange={handleChange} />
                                    </div>


                                    <div>
                                        <label>Nome da 2ª Testemunha:</label>
                                        <input type='text' name='testemunha2Nome' onChange={handleChange} />
                                    </div>

                                    <div>
                                        <label>CPF da 2ª Testemunha:</label>
                                        <input type='text' name='testemunha2CPF' onChange={handleChange} />
                                    </div>
                                    <button onClick={handleBack}>Voltar</button>
                                    <button onClick={handleFinalize} disabled={isLoading}>
                                        {isLoading ? (
                                            <div className="spinner-border spinner-border-sm text-light" role="status">
                                                <span className="visually-hidden">Carregando...</span>
                                            </div>
                                        ) : (
                                            'Finalizar'
                                        )}
                                    </button>
                                </>)}
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
                                style={{
                                    pointerEvents: 'none',
                                    userSelect: 'none', // Impede a seleção do conteúdo
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
                    <button className='btnBaixarPdf' onClick={() => { geradorPdfFinalizado(formData) }}>
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
