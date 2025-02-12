import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';


export default function CompraEvendaVeiculos() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Modelo de Contrato de Compra e Venda de Veículo</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de compra e venda de veículo?
                        O contrato de compra e venda de veículo é o documento que formaliza a transação entre uma pessoa física ou jurídica (vendedora) e outra (compradora) para a venda de um carro, moto ou outro veículo.

                        Este contrato define os direitos e deveres de ambas as partes, estabelecendo as condições da negociação, como valor, forma de pagamento, prazos para entrega do veículo e documentação, entre outras regras.
                    </p>

                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Como fazer um contrato de compra e venda de veículo?</h1>
                    <p>
                        Criar um contrato de compra e venda de veículo pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas às suas necessidades específicas, como valores, multas e responsabilidades.

                        Nossos contratos seguem rigorosamente as normas do Código Civil Brasileiro, garantindo proteção para ambas as partes. Cláusulas importantes, como as de garantia (opcional), descrição do veículo e condições de venda podem ser adicionadas para evitar conflitos e assegurar transparência em toda a relação contratual.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="compraevenda/compravendaveiculo/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}