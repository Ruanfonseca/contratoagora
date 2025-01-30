import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';


export default function LocacaoVeiculo() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Modelo de Contrato de Locação de Veículos</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de locação de veículo?


                        O contrato de locação de veículo, ou aluguel, é o documento recomendado para formalizar o acordo entre locador e locatário, garantindo segurança e tranquilidade aos envolvidos.

                        O contrato define as condições da locação, incluindo o tipo de veículo (carro, moto, trailer ou caminhão), valor do aluguel, prazo, garantias (se houver), responsabilidades das partes envolvidas, termos para renovação ou rescisão, além de cláusulas sobre o uso do veículo, condições de devolução e responsabilidade em caso de acidentes,
                        danos ou multas, entre outras possíveis disposições
                    </p>
                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Contrato de Locação de Veículos</h1>
                    <p>
                        Como fazer um contrato de locação de veículo?

                        Elaborar um contrato de locação de equipamentos é fácil, rápido e seguro com nosso modelo customizado. Basta fornecer as informações solicitadas, respondendo às perguntas apresentadas, e o documento será ajustado automaticamente em tempo real. As cláusulas serão personalizadas conforme suas necessidades, incluindo detalhes como prazos, valores e responsabilidades.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="locacaodeveiculo/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}