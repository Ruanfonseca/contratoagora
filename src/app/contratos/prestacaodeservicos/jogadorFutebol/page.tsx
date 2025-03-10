import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';


export default function ModeloJogadorFutebol() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Contrato de Representação</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de representação de jogador de futebol?
                        O contrato de representação de jogador de futebol, também conhecido como agente de atleta, é o instrumento utilizado para regularizar a relação entre o empresário representante (pessoa física ou jurídica) e o atleta representado.

                        Além das informações essenciais, como o prazo de duração da representação e o valor a ser pago como retribuição, o contrato pode incluir cláusulas sobre obrigações e direitos, sigilo e a forma de resolução de eventuais conflitos.
                    </p>

                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Como fazer um contrato de representação de jogador de futebol?</h1>
                    <p>
                        Criar um contrato de agenciamento de jogador pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas às suas necessidades específicas, como comissão ou remuneração, prazo, forma de pagamento e responsabilidades.

                        Nossos contratos seguem rigorosamente as normas da legislação brasileira, garantindo proteção para ambas as partes. Cláusulas importantes, como as de rescisão, exclusividade e atuações, podem ser adicionadas para evitar conflitos e assegurar transparência em toda a relação contratual.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="/contratos/prestacaodeservicos/jogadorFutebol/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}