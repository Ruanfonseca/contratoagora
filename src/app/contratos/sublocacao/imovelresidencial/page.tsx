import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';


export default function ImovelResidencial() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Modelo de Contrato de Sublocação Residencial</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de sublocação de imóvel residencial?
                        O contrato de sublocação residencial é o instrumento recomendado para formalizar a sublocação de um imóvel residencial, descrevendo claramente o valor do aluguel, o prazo, os possíveis reajustes, as indenizações e as responsabilidades das partes envolvidas.

                        Você também terá a opção de escolher se o contrato incluirá ou não uma garantia, como fiança, seguro, caução, além de outras opções de personalização, como pagamento antecipado da sublocação e se o imóvel será subalugado mobiliado, entre outras.
                    </p>

                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Como fazer um contrato de sublocação residencial?</h1>
                    <p>
                        Criar um contrato de sublocação de imóvel residencial pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas às suas necessidades específicas, como valor do aluguel, forma de pagamento e responsabilidades.

                        Nossos contratos seguem rigorosamente as normas do Código Civil Brasileiro, garantindo proteção para ambas as partes. Cláusulas importantes, como as de rescisão, garantia e vistoria, podem ser adicionadas para evitar conflitos e assegurar transparência em toda a relação contratual.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="imovelresidencial/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}