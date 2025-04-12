import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';

export default function ModeloPermutaImoveis() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Contrato de Permuta de Imóveis</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de permuta de imóveis?
                        O contrato de permuta imóveis é um acordo legal utilizado para formalizar a troca de duas propriedades entre seus respectivos proprietários, estabelecendo as regras e condições do acordo.

                        Nele estarão definidas as condições da permuta, como a descrição dos imóveis a serem trocados, a data da troca da posse, valores estimados e o pagamento da diferença torna, caso aplicável, as condições acordadas, cláusulas sobre ônus e tributos e direitos e obrigações das partes, dentre outras.
                    </p>
                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Como fazer um contrato de permuta de imóveis?</h1>
                    <p>
                        Criar um contrato de permuta de imóveis pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas para atender às suas necessidades, incluindo a descrição completa dos imóveis permutados, o valor da torna, caso aplicável, e sua forma de pagamento, as datas para a troca das chaves e as responsabilidades das partes.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="deImoveis/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}