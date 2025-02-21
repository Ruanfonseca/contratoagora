import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';


export default function EmpreitadaObra() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Modelo de Contrato de Empreitada</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de empreitada?
                        O contrato de empreitada, ou contrato de obra, é o instrumento firmado entre o dono da obra (contratante) e o profissional ou empresa que irá executá-la (contratado).
                        Este documento define as regras da prestação de serviço, incluindo a descrição da obra,
                        o prazo de execução e a remuneração acordada. Além disso, o contrato pode incluir cláusulas sobre indenizações,
                        responsabilidades, obrigações e direitos das partes envolvidas.
                    </p>

                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Como fazer um contrato de empreitada?</h1>
                    <p>
                        Criar um contrato de empreitada pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas às suas necessidades específicas, como prazos, valores e responsabilidades.

                        Nossos contratos seguem rigorosamente as normas do Código Civil Brasileiro, garantindo proteção para ambas as partes. Cláusulas importantes, como as de rescisão, garantia e responsabilidade, podem ser adicionadas para evitar conflitos e assegurar transparência em toda a relação contratual.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="/contratos/prestacaodeservicos/empreitadaObra/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}