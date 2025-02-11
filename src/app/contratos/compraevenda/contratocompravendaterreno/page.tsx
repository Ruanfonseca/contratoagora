import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';


export default function FormularioCompraVendaTerreno() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Modelo de Contrato de Compra e Venda de Terreno</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de compra e venda de terreno?
                        O contrato de compra e venda de terreno é o instrumento utilizado para que uma pessoa (vendedora) possa vender com segurança um terreno para outra pessoa (compradora) que, por sua vez, se compromete a recebê-lo mediante um determinado pagamento.

                        Ele descreve as condições da negociação, como o valor e forma de pagamento, direitos e obrigações, datas para a posse e transferência de propriedade, dentre outras.

                    </p>

                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Como fazer um contrato de compra e venda de terreno?</h1>
                    <p>
                        Criar um contrato de compra e venda de terreno pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas às suas necessidades específicas, como prazos, valores e responsabilidades.

                        Nossos contratos seguem rigorosamente as normas do Código Civil Brasileiro, garantindo proteção para ambas as partes. Cláusulas importantes, como as de rescisão, prazo de entrega, vistoria e multas, podem ser adicionadas para evitar conflitos e assegurar transparência em toda a relação contratual.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="compraevenda/contratocompraevendaterreno/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}