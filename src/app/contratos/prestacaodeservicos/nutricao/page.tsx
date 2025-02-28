import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';


export default function ModeloNutricao() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Contrato de Prestação de Serviços de Nutricionista</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato prestação de serviços de nutricionista?
                        Um contrato de prestação de serviços de nutricionista é um documento utilizado para formalizar a relação entre o profissional de nutrição e o cliente que contrata seus serviços.

                        Esse tipo de contrato define as principais condições da prestação de serviços, a descrição dos serviços oferecidos, valores e formas de pagamento responsabilidades e obrigações das parte. Além disso, o contrato pode incluir cláusulas específicas, como políticas de cancelamento, reagendamento de consultas e confidencialidade dos dados do cliente, dentre outras
                    </p>

                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Como fazer um contrato para nutricionista?</h1>
                    <p>
                        Criar um contrato de prestação de serviços de nutricionista pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas às suas necessidades específicas, como valores, forma de pagamento e responsabilidades.

                        Nossos contratos seguem rigorosamente as normas do Código Civil Brasileiro, garantindo proteção para ambas as partes. Cláusulas importantes, como as de rescisão, prazos e jornadas, podem ser adicionadas para evitar conflitos e assegurar transparência em toda a relação contratual
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="/contratos/prestacaodeservicos/nutricao/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}