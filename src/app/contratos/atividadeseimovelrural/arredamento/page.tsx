import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';

export default function ModeloArredamento() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Contrato de Arrendamento Rural</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de arrendamento rural?
                        O contrato de arrendamento rural é o documento que formaliza o acordo entre o proprietário (arrendador) e um arrendatário, onde o primeiro cede o uso de um imóvel rural para que o segundo exerça atividades pecuárias, agrícolas, agro-industriais, extrativas ou mistas.

                        Este contrato define as condições do arrendamento, como o valor do aluguel e o seu reajuste, o prazo de vigência, os direitos e responsabilidades das partes, dentre outras especificações. Nele também será permitido, se você desejar, incluir uma garantia, como fiança, seguro ou caução.

                    </p>
                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Como fazer um contrato de arrendamento rural?</h1>
                    <p>
                        Criar um contrato de arrendamento rural pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas para atender às suas necessidades, incluindo o tipo de explocação rural, o prazo de vigência, o valor que será cobrado de aluguel e as responsabilidades das partes.

                        Além disso, para maior segurança, você poderá adicionar cláusulas sobre penalidades por descumprimento, motivos para rescisão antecipada e reajuste periódico, reduzindo riscos de conflitos futuros.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="arredamento/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}