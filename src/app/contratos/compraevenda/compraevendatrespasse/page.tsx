import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';


export default function CompraeVendaTresPasse() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Modelo de Contrato de Compra e Venda de Estabelecimento Comercial (Trespasse)</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de compra e venda de estabelecimento comercial?
                        O contrato de compra e venda de estabelecimento comercial, ou trespasse, é usado para transferir um comércio de uma pessoa para outra.

                        Ele define as condições da negociação, como valor e forma de pagamento, dívidas existentes e responsabilidades, bens incluídos na transação e outras regras essenciais.
                    </p>

                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Como fazer um contrato de compra e venda de estabelecimento comercial?</h1>
                    <p>
                        Criar um contrato de compra e venda de estabelecimento comercial pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas às suas necessidades específicas, como valor, forma de pagamento e responsabilidades.

                        Nossos contratos seguem rigorosamente as normas do Código Civil Brasileiro, garantindo proteção para ambas as partes. Cláusulas importantes, como as de rescisão, transferência do estabelecimento e vistoria, podem ser adicionadas para evitar conflitos e assegurar transparência em toda a relação contratual.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="compraevenda/compraevendatrespasse/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}