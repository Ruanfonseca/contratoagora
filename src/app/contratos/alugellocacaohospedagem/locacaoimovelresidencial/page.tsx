import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';


export default function LocacaoImovelResidencial() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Modelo de Contrato de Locação de Imóvel Residencial</h1>
                </div>

                <div className="text">
                    <p>
                        Qual é a importância de um contrato de locação residencial?
                        O contrato de locação residencial, ou contrato de aluguel, é um instrumento legal que ajuda a organizar o aluguel de um imóvel, facilitando a relação entre todas as partes envolvidas.

                        Ele ajuda a evitar possíveis conflitos e disputas judiciais, ajudando no entendimento dos direitos e responsabilidades de todos, economizando, portanto, tempo e evitando prejuízos.
                    </p>

                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Como fazer um contrato de aluguel de imóvel?</h1>
                    <p>
                        Criar um contrato de locação pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas às suas necessidades específicas, como prazos, valores e responsabilidades.

                        Nossos contratos seguem rigorosamente as normas do Código Civil Brasileiro e a Lei do Inquilinato, garantindo proteção para ambas as partes. Cláusulas importantes, como as de rescisão, garantia e benfeitorias, podem ser adicionadas para evitar conflitos e assegurar transparência em toda a relação contratual.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="locacaoimovelresidencial/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}