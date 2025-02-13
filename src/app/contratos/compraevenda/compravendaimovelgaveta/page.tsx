import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';


export default function CompraEvendaImoveisGaveta() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Modelo de Contrato de Gaveta de Compra e Venda de Imóvel</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de gaveta de compra e venda?
                        O contrato de gaveta de compra e venda de imóvel é o instrumento que formaliza a venda de um imóvel sem que depois seja efetuado o registro ou a atualização de sua matrícula no Cartório de Registro de Imóveis.

                        Este documento define as condições da negociação, como o valor acordado e a sua forma de pagamento, as responsabilidades, obrigações e direitos das partes, entre outras.


                    </p>

                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Como fazer um contrato de gaveta de compra e venda?</h1>
                    <p>
                        Criar um contrato de gaveta de compra e venda pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas às suas necessidades específicas, como prazos, valores e responsabilidades.

                        Nossos contratos seguem rigorosamente as normas do Código Civil Brasileiro, garantindo proteção para ambas as partes. Cláusulas importantes, como as de pagamento, entrega, rescisão e responsabilidade, podem ser adicionadas para evitar conflitos e assegurar transparência em toda a relação contratual.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="compraevenda/compravendaimovelgaveta/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}