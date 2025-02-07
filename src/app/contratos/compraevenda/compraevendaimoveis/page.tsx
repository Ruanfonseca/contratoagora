import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';


export default function CompraEvendaImoveis() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Modelo de Contrato de Compra e Venda de Imóvel</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de compra e venda de imóvel?
                        O contrato de compra e venda de imóvel é o instrumento utilizado para formalizar o compromisso de uma pessoa em vender um imóvel com segurança para outra, que se compromete a comprá-lo mediante pagamento definido. Nele constam as condições da transação, como o valor do imóvel, forma de pagamento, data de transferência da propriedade, obrigações das partes, entre outras.
                    </p>

                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Como fazer um contrato de compra e venda de imóvel?</h1>
                    <p>
                        Criar um contrato de compra e venda de imóvel pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas às suas necessidades específicas, como valores, multas, prazos e responsabilidades.

                        Nossos contratos seguem rigorosamente as normas do Código Civil Brasileiro, garantindo proteção para ambas as partes. Cláusulas importantes, como as de rescisão, vistoria e descumprimento, podem ser adicionadas para evitar conflitos e assegurar transparência em toda a relação contratual.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="compraevenda/compraevendaimoveis/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}