import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';


export default function ModeloManicure() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Contrato de Prestação de Serviços de Manicure</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de prestação de serviços de manicure?
                        O contrato de prestação de serviços de manicure é o instrumento utilizado para formalizar a relação entre a profissional autônoma e a pessoa que vai contratar os seus serviços, garantindo a segurança e clareza nas condições da prestação do serviço.

                        Ele estabelece as condições da prestação do serviço, como a sua descrição, o valor a ser pago e a forma de pagamento, as responsabildiade, obrigações e direitos das partes envolvidas, dentre outras regras.
                    </p>

                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Como fazer um contrato de prestação de serviços de manicure?</h1>
                    <p>
                        Para elaborar o seu contrato de forma segura e eficiente, siga o passo a passo abaixo:

                        1. Crie o seu contrato
                        Criar um contrato de prestação de serviços de manicure pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas às suas necessidades específicas, como valores, forma de pagamento e responsabilidades.

                        Nossos contratos seguem rigorosamente as normas do Código Civil Brasileiro, garantindo proteção para ambas as partes. Cláusulas importantes, como as de rescisão, prazos e horários, podem ser adicionadas para evitar conflitos e assegurar transparência em toda a relação contratual.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="/contratos/prestacaodeservicos/manicure/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}