import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';

export default function ModeloDoacaoDinheiro() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Contrato de Doação de Dinheiro</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de doação de dinheiro?
                        O contrato de doação de dinheiro é o instrumento utilizado para uma pessoa doar, e outra, por sua vez, receber, uma determinada quantia em dinheiro, estabelecendo os termos da transação.

                        Nele estarão estipuladas as condições da doação, como a data e forma de entrega do valor, as responsabilidades e direitos das partes, se a doação terá alguma restrição, entre outras.

                        Além disso, o contrato pode incluir cláusulas adicionais sobre antecipação ou não da legítima, concordância de terceiros e possíveis condições para a doação ser feita, como, por exemplo, a obrigação do donatário de cumprir uma tarefa.
                    </p>
                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Como fazer um contrato de doação de dinheiro?</h1>
                    <p>
                        Criar um contrato de doação de dinheiro pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas para atender às suas necessidades, incluindo o valor que será doado e sua forma de entrega ao cessionário, a data da doação e as responsabilidades das partes.

                        Além disso, para maior segurança, você poderá adicionar cláusulas sobre penalidades por descumprimento, obrigações para recebimento da doação (opcional) e adiantamento da legítima, reduzindo riscos de conflitos futuros.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="dinheiro/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}