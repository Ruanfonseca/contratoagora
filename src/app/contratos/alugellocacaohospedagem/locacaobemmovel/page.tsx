'use client'
import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';

export default function LocacaoBemMovel() {

    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Modelo de Contrato de Locação de Bens Móveis</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de locação de bens móveis?
                        O contrato de locação, ou contrato de aluguel, é o instrumento utilizado por quem deseja alugar bens, como equipamentos, maquinários, itens pessoal, entre outros.

                        Nele constam as condições do aluguel, como valor, forma de pagamento, possíveis
                        reajustes, garantia (opcional), prazo da locação, direitos e obrigações
                        das partes, além de opções de personalização, como a possibilidade de
                        sublocação do imóvel, caso seja permitida.
                    </p>

                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Contrato de Locação de Bens Móveis</h1>
                    <p>
                        Como fazer um contrato de locação?
                        Criar um contrato de locação pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas às suas necessidades específicas, como valor, forma de pagamento e responsabilidades.

                        Nossos contratos seguem rigorosamente as normas do Código Civil Brasileiro, garantindo proteção para ambas as partes. Cláusulas importantes, como as de rescisão, prazos e vistoria, podem ser adicionadas para evitar conflitos e assegurar transparência em toda a relação contratual.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="locacaobemmovel/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}