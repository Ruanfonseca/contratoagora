import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';

export default function ModeloTrocaSimples() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Modelo de Contrato de Permuta (Troca)</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de permuta?
                        O contrato de permuta, também conhecido como troca ou escambo, é o instrumento que formaliza a troca entre duas pessoas (física ou jurídica) de uma coisa pela outra (bens ou serviços).

                        Além das informações essenciais, como a descrição dos bens que serão trocados, a data da troca da posse e a torna (compensação financeira, caso aplicável), o contrato pode incluir cláusulas adicionais sobre responsabilidades, transferência de propriedades, se necessária, e a forma de resolução de eventuais conflitos.
                    </p>
                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Como fazer um contrato de permuta?</h1>
                    <p>
                        Ao criar o seu contrato, inclua cláusulas e informações essenciais que atendam às necessidades de todas as partes envolvidas. Exemplos importantes incluem a descrição dos bens trocados, o valor da torna (caso aplicável), a data para a transferência dos bens e as responsabilidades das partes.

                        Além disso, para maior segurança, considere adicionar cláusulas sobre penalidades por descumprimento, possibilidade de desistência e vistoria dos bens, reduzindo riscos de conflitos futuros.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="trocaSimples/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>
            <Footer />
        </>
    )
}
