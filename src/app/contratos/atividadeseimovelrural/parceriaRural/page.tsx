import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';

export default function ModeloParceriaRural() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Contrato de Parceria Rural</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de parceria rural?
                        O contrato de parceria rural é o documento recomendado para formalizar um acordo entre um proprietário, que cede o uso de seu imóvel rural, animais, benfeitorias ou maquinários, e um parceiro para explorar uma atividades pecuária, agrícola, agro-industrial, extrativa ou mista.

                        Nele estarão definidas as condições do acordo, como tipo de atividade, descrição da área rural, divisão dos lucros (percentiais) e riscos, prazo de vigência, penalidades em caso de descumprimento e deveres e obrigações das partes, dentre outras.

                    </p>
                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Como fazer um contrato de parceria rural?</h1>
                    <p>
                        Criar um contrato de parceria rural pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas para atender às suas necessidades, incluindo o tipo de explocação rural, o que cada parceiro irá contribuir, o prazo de vigência, a forma de partilha dos lucros e despesas e as responsabilidades das partes.

                        Além disso, para maior segurança, você poderá adicionar cláusulas sobre penalidades por descumprimento, motivos para rescisão antecipada e subparceria, reduzindo riscos de conflitos futuros
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="parceriaRural/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}