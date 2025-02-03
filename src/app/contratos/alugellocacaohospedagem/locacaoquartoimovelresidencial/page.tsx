import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';


export default function LocacaoQuartoImovelResidencial() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Modelo de Contrato de Locação de Quarto em Imóvel Residencial</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de locação de quarto?
                        O contrato de locação de quarto é o documento que formaliza o aluguel de um quarto em um imóvel, no qual o locador concede ao locatário o direito de uso do quarto especificado.

                        Neste contrato estarão as condições da locação, incluindo valor do aluguel, forma de pagamento, garantia (opcional), prazo, e direitos e obrigações das partes. Além disso, especificará se as contas de consumo estão inclusas no valor do aluguel, se serão permitidos animais de estimação e outras condições relevantes.
                    </p>

                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Como fazer um contrato de aluguel de quarto?</h1>
                    <p>
                        Criar um contrato de aluguel de quarto pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas às suas necessidades específicas, como prazos, valores e responsabilidades.

                        Nossos contratos seguem rigorosamente as normas do Código Civil Brasileiro e a Lei do Inquilinato, garantindo proteção para ambas as partes. Cláusulas importantes, como as de rescisão, devolução e multas, podem ser adicionadas para evitar conflitos e assegurar transparência em toda a relação contratual.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="locacaoquartoimovelresidencial/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}