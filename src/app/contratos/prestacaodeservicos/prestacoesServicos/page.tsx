import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';


export default function PrestacaoServicos() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Modelo de Contrato de Prestação de Serviços</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de prestação de serviços?
                        O contrato de prestação de serviços é o documento legal que formaliza a relação em que uma pessoa física ou jurídica (prestadora) se compromete a realizar determinados serviços para outra pessoa ou empresa (tomadora).

                        Além das informações essenciais, como a descrição dos serviços, o prazo de execução e a remuneração, o contrato pode incluir cláusulas adicionais sobre garantia dos serviços prestados, se aplicável, e a forma de resolução de eventuais conflitos.
                    </p>

                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Como criar um contratro de prestação de serviços?</h1>
                    <p>
                        Criar um contrato de prestação de serviços pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas às suas necessidades específicas, como prazos, valores e responsabilidades.

                        Nossos contratos seguem rigorosamente as normas do Código Civil Brasileiro, garantindo proteção para ambas as partes. Cláusulas importantes, como as de rescisão, confidencialidade e responsabilidade, podem ser adicionadas para evitar conflitos e assegurar transparência em toda a relação contratual.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="/contratos/prestacaodeservicos/prestacoesServicos/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}