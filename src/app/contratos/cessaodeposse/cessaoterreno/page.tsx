import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';

export default function CessaoPosseTerreno() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Modelo de Contrato de Cessão de Posse de Terreno</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de cessão de posse de terreno?
                        O contrato de cessão de posse de terreno é o documento no qual uma pessoa (cedente) formaliza a transferência de um determinado terreno para outra pessoa (cessionário) ter o direito de o ocupar e usufruir.

                        Ele define as condições da cessão, como o valor que será pago (caso a cessão seja onerosa) e sua forma de pagamento, os prazos para a entrega e transferência do terreno e os direitos e deveres das partes envolvidas, dentre outras regras.
                    </p>
                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Contrato de Cessão de Posse de Terreno</h1>
                    <p>
                        Como fazer um contrato de cessão de posse de terreno?
                        Criar um contrato de cessão de posse de terreno pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas às suas necessidades específicas, como valor, forma de pagamento e responsabilidades.

                        Nossos contratos seguem rigorosamente as normas do Código Civil Brasileiro, garantindo proteção para ambas as partes. Cláusulas importantes, como as de rescisão, transferência do terreno e vistoria, podem ser adicionadas para evitar conflitos e assegurar transparência em toda a relação contratual.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="cessaoterreno/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>
            <Footer />
        </>
    )
}
