import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';

export default function CessaoPosse() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Modelo de Contrato de Cessão de Posse de Imóvel</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de cessão de posse de imóvel?
                        O contrato de cessão de posse de imóvel, também conhecido como termo de cessão de direitos possessórios de imóvel, é o instrumento no qual uma pessoa (cedente) formaliza a transferência de um determinado imóvel para outra pessoa (cessionário) ter o direito de o ocupar e usufruir.

                        Ele define as condições da cessão, como o valor que será pago (caso a cessão seja onerosa) e sua forma de pagamento, os prazos para a entrega e transferência do imóvel e os direitos e deveres das partes envolvidas, dentre outras regras.
                    </p>
                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Contrato de Cessão de Posse de Imóvel</h1>
                    <p>
                        Como criar um contrato de cessão de posse de imóvel?
                        Criar um contrato de cessão de direitos possessórios de imóvel pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas às suas necessidades específicas, como valor (caso onerosa), data da transferência da posse e responsabilidades.

                        Nossos contratos seguem rigorosamente as normas da legislação brasileira, garantindo proteção para ambas as partes. Cláusulas importantes, como as de desistência, rescisão e obrigações, podem ser adicionadas para evitar conflitos e assegurar transparência em toda a relação contratual.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="cessaodeposse/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>
            <Footer />
        </>
    )
}
