import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';


export default function ImovelComercial() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Modelo de Contrato de Sublocação Comercial</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de sublocação de imóvel comercial?
                        O contrato de sublocação comercial é o instrumento utilizado por aqueles que desejam subalugar um imóvel para uso comercial, como uma sala ou loja, por exemplo.

                        Nele serão estabelecidas as regras da sublocação, incluindo o valor do aluguel praticado, o prazo da sublocação, possíveis reajustes, indenizações, responsabilidades e obrigações dos envolvidos, entre outras cláusulas importantes.
                    </p>

                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Como fazer um contrato de sublocação comercial?</h1>
                    <p>
                        Criar um contrato de sublocação comercial pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas às suas necessidades específicas, como valor do aluguel, forma de pagamento e responsabilidades.

                        Nossos contratos seguem rigorosamente as normas do Código Civil Brasileiro, garantindo proteção para ambas as partes. Cláusulas importantes, como as de rescisão, se a sublocação e parcial ou total do bem e vistoria, podem ser adicionadas para evitar conflitos e assegurar transparência em toda a relação contratual.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="imovelcomercial/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}