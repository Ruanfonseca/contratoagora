import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';


export default function CompraeVendaImovelRural() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Modelo de Contrato de Compra e Venda de Imóvel Rural</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de compra e venda de imóvel rural?
                        O contrato de compra e venda de imóvel rural é o instrumento utilizado para formalizar o compromisso do proprietário em vender um determinado imóvel rural e, por sua vez, do comprador em o adquirir.

                        O contrato estabelece as condições e termos da transação, incluindo preço da venda, forma de pagamento, direitos e obrigações das partes, além de datas e prazos a serem cumpridos. Além disso, o contrato deve especificar detalhes sobre o imóvel rural, como localização, área total, benfeitorias existentes e eventuais ônus ou restrições que possam impactar sua utilização.
                    </p>

                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Como fazer um contrato de compra e venda de imóvel rural?</h1>
                    <p>
                        Criar um contrato de compra e venda de imóvel rural pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas às suas necessidades específicas, como valor, forma de pagamento e responsabilidades.

                        Nossos contratos seguem rigorosamente as normas da legislação brasileira, garantindo proteção para ambas as partes. Cláusulas importantes, como as de transferência do bem, descrição do imóvel e vistoria, podem ser adicionadas para evitar conflitos e assegurar transparência em toda a relação contratual.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="compraevenda/compraevendaimovelrural/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}