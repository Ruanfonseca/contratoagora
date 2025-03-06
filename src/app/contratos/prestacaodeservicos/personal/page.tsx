import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';


export default function ModeloPersonal() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Contrato de Prestação de Serviços de Personal Trainer</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de prestação de serviços de personal trainer?
                        O contrato de personal trainer é o instrumento utilizado para formalizar a relação em que um profissional autônomo (contratado) que se compromete a realizar determinados serviços para outra pessoa (contratante).

                        Além das informações essenciais, como a descrição dos serviços, o prazo ou frequência de execução e o valor a ser pago como retribuição, o contrato pode incluir cláusulas sobre obrigações e direitos, política de cancelamento, sigilo e a forma de resolução de eventuais conflitos.
                    </p>

                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Como fazer um contrato de personal trainer?</h1>
                    <p>
                        Criar um contrato de personal trainer pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas às suas necessidades específicas, como valores, forma de pagamento e responsabilidades.

                        Nossos contratos seguem rigorosamente as normas do Código Civil Brasileiro, garantindo proteção para ambas as partes. Cláusulas importantes, como as de rescisão, prazos e frequência, podem ser adicionadas para evitar conflitos e assegurar transparência em toda a relação contratual.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="/contratos/prestacaodeservicos/personal/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}