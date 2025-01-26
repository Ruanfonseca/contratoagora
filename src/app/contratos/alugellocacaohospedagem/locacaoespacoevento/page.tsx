import Footer from "@/app/pages/components/footer/Footer";
import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Link from "next/link";
import './css/index.css';



export default function LocacaoEspacoEvento() {

    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Modelo de Contrato de locação de Espaço para Evento</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de locação de espaço para evento?
                        O contrato de locação de espaço para eventos é um instrumento legal utilizado por aqueles que desejam alugar um espaço específico, seja ele um imóvel, um terreno, uma casa ou outro tipo de espaço, para outra pessoa realizar um evento ou uma festa.

                        Este contrato apresenta as condições para o aluguel do espaço, tais como o valor e a forma de pagamento, tipos de eventos permitidos e suas respectivas regras, prazo da locação, direitos e obrigações das partes envolvidas, entre outras.
                    </p>

                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Como fazer um contrato de locação de espaço para eventos?</h1>
                    <p>
                        Criar um contrato de locação de espaço para eventos pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas às suas necessidades específicas, como valor do aluguel, prazo e duração do evento, multas e responsabilidades.

                        Nossos contratos seguem rigorosamente as normas do Código Civil Brasileiro, garantindo proteção para ambas as partes. Cláusulas importantes, como as de rescisão, entrega do espaço, limpeza e responsabilidade, podem ser adicionadas para evitar conflitos e assegurar transparência em toda a relação contratual.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="locacaoespacoevento/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}