import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';


export default function CompraeVendaVeiculoAlienado() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Modelo de Contrato de Compra e Venda de Veiculo Financiado</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de compra e venda de veículo financiado?
                        O contrato de compra e venda de veículo financiado, ou alienado, formaliza a transação entre uma pessoa física ou jurídica (vendedora) e outra (compradora) envolvendo um veículo ainda financiado.

                        Este documento especifica as condições da negociação, como o valor e a forma de pagamento, parcelas restantes do financiamento, direitos e obrigações dos envolvidos, entre outros detalhes.
                    </p>

                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Como fazer um contrato de compra e venda de veículo alienado?</h1>
                    <p>
                        Criar um contrato de compra e venda de veículo pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas às suas necessidades específicas, como valores, multas e responsabilidades.

                        Nossos contratos seguem rigorosamente as normas do Código Civil Brasileiro, garantindo proteção para ambas as partes. Cláusulas importantes, como as de garantia (opcional), descrição do veículo e condições de venda, podem ser adicionadas para evitar conflitos e assegurar transparência em toda a relação contratual.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="compraevenda/compravendaveiculoalienado/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}