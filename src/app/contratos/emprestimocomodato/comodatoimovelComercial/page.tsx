import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';

export default function ModeloComodadtoImovelComercial() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Modelo de Contrato de Comodato de Imóvel Comercial</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de comodato de imóvel comercial?
                        O contrato de comodato de imóvel comercial é o documento utilizado para formalizar o empréstimo gratuito de um imóvel comercial, permitindo que outra pessoa o utilize para seu comércio. Nesse instrumento, o comodante (quem empresta) e o comodatário (quem recebe) estabelecem as condições, como prazo do comodato, restrições ao tipo de comércio, responsabilidades por taxas e impostos, entre outras regras.

                        Embora o comodato seja gratuito, o comodante pode exigir do comodatário obrigações como contrapartida, como, por exemplo, realização de melhorias no imóvel.
                    </p>
                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Contrato de Comodato de Imóvel Comercial</h1>
                    <p>
                        Criar um contrato de comodato pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas às suas necessidades específicas, como prazo, obrigações do comodatário e responsabilidades.

                        Nossos contratos seguem rigorosamente as normas do Código Civil Brasileiro, garantindo proteção para ambas as partes. Cláusulas importantes, como as de rescisão e vistoria podem ser adicionadas para evitar conflitos e assegurar transparência em toda a relação contratual.

                        Ao final, você poderá baixar, imprimir e receber no seu e-mail o seu documento personalizado nos formatos Word e PDF.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="comodatoimovelComercial/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>
            <Footer />
        </>
    )
}
