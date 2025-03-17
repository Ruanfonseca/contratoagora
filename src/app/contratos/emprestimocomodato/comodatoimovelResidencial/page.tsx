import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';

export default function ModeloComodadtoImovelResidencial() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Modelo de Contrato de Comodato de Imóvel Residencial</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de comodato de imóvel residencial?
                        O contrato de comodato de imóvel é o instrumento utilizado para formalizar o empréstimo gratuito de um imóvel entre duas partes: o comodante, que empresta, e o comodatário, que toma emprestado, se comprometendo a mantê-lo em perfeito estado.

                        Neste documento estarão definidas as condições do comodato, como o prazo de vigência, responsabilidade por taxas e impostos, restrições de uso e outras regras.
                    </p>
                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Como fazer um contrato de comodato de imóvel residencial</h1>
                    <p>
                        Criar um contrato de comodato pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas às suas necessidades específicas, como prazo, obrigações do comodatário e responsabilidades.

                        Nossos contratos seguem rigorosamente as normas do Código Civil Brasileiro, garantindo proteção para ambas as partes. Cláusulas importantes, como as de rescisão e vistoria podem ser adicionadas para evitar conflitos e assegurar transparência em toda a relação contratual.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="comodatoimovelResidencial/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>
            <Footer />
        </>
    )
}
