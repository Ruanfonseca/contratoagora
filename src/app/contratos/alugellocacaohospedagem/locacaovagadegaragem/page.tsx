import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';


export default function LocacaoVagaDeGaragem() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Modelo de Contrato de Aluguel de Vaga de Garagem</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de locação de vaga de garagem?
                        O contrato de locação de vaga de garagem, também conhecido como aluguel de garagem, é o instrumento utilizado por quem deseja alugar um determinado espaço em um estacionamento ou garagem, seja em uma casa, em um condomínio ou em imóvel comercial.

                        Nele estarão as condições da locação, entre elas podemos citar o valor que será praticado como aluguel e o seu reajuste, se a locação contará com uma garantia, qual será o prazo, e os direitos e as obrigações das partes envolvidas.
                    </p>

                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Como fazer um contrato de locação de vaga de garagem?</h1>
                    <p>
                        Criar um contrato de locação de vaga de garagem pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas às suas necessidades específicas, como valor, forma de pagamento e responsabilidades.

                        Nossos contratos seguem rigorosamente as normas do Código Civil Brasileiro, garantindo proteção para ambas as partes. Cláusulas importantes, como as de rescisão, renovação e prazos, podem ser adicionadas para evitar conflitos e assegurar transparência em toda a relação contratual.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="locacaovagadegaragem/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}