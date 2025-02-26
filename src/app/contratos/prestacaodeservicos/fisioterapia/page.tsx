import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';


export default function ModeloFisioterapia() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Contrato de Prestação de Serviços de Fisioterapeuta</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de prestação de serviços de fisioterapia?
                        O contrato de prestação de serviços de fisioterapia é o instrumento utilizado para formalizar a relação entre o profissional fisioterapeuta e a pessoa que vai contratar os seus serviços, garantindo a segurança e clareza nas condições da prestação do serviço.

                        Ele estabelece as condições da prestação do serviço, como a sua descrição, o valor a ser pago e a forma de pagamento, as responsabildiade, obrigações e direitos das partes envolvidas, dentre outras regras.
                    </p>

                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Como fazer um contrato para fisioterapia?</h1>
                    <p>
                        Criar um contrato de prestação de serviços de fisioterapia pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas às suas necessidades específicas, como valores, forma de pagamento e responsabilidades.

                        Nossos contratos seguem rigorosamente as normas do Código Civil Brasileiro, garantindo proteção para ambas as partes. Cláusulas importantes, como as de rescisão, prazos e jornadas, podem ser adicionadas para evitar conflitos e assegurar transparência em toda a relação contratual.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="/contratos/prestacaodeservicos/fisioterapia/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}