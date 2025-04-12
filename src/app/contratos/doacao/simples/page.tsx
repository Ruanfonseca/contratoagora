import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';

export default function ModeloDoacaoSimples() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Contrato de Doação</h1>
                </div>

                <div className="text">
                    <p>
                        O contrato de doação é o instrumento utilizado para uma pessoa doar, e outra, por sua vez, receber, um ou mais bens de forma gratuita, ou seja, sem recebimento de valores ou bens em troca.

                        Este documento define os direitos e deveres de ambas as partes, estabelecendo as condições da doação, forma de entrega dos bens e quaisquer outras condições específicas acordadas entre as partes.

                        Além disso, o contrato pode incluir cláusulas adicionais sobre condições para a doação, como, por exemplo, a obrigação do donatário cumprir uma tarefa, de manter o bem doado em boas condições ou utilizá-lo para determinados fins.
                    </p>
                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Como fazer um contrato de doação?</h1>
                    <p>
                        Criar um contrato de doação pode ser simples, prático e seguro com nosso modelo personalizado.
                        Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas para atender às suas necessidades, incluindo a descrição
                        dos bens ou valores doados, as datas para a entrega do bem e as responsabilidades das partes.
                        Além disso, para maior segurança, você poderá adicionar cláusulas sobre condições ou obrigações para o recebimento da doação, adiantamento da legítima e
                        penalidades por descumprimento contratual, reduzindo riscos de conflitos futuros.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="simples/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}