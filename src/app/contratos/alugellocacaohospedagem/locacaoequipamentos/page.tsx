import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';


export default function LocacaoEquipamentos() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Modelo de Contrato de Locação de Equipamentos</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de locação de equipamentos?

                        Um contrato de locação de equipamentos é um documento jurídico utilizado para oficializar o aluguel de um ou mais equipamentos, estabelecendo um pagamento previamente acordado entre as partes envolvidas.

                        Esse contrato especifica as condições da locação, como o valor do aluguel, possibilidades de reajuste, garantias exigidas (se aplicável), prazo de vigência, além dos direitos e obrigações de ambas as partes. Ele também pode ser adaptado conforme as necessidades, como definir se o equipamento pode ou não ser cedido a terceiros.

                        Ao elaborar o contrato, você receberá gratuitamente um modelo de recibo de aluguel, ideal para auxiliar na negociação.

                        O contrato será criado de maneira simples e personalizada, com base nas suas respostas, e estará disponível nos formatos Word e PDF, seguindo as normas da ABNT.              </p>

                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Contrato de Hospedagem</h1>
                    <p>
                        Como fazer um contrato de hospedagem?
                        Elaborar um contrato de locação de equipamentos é fácil, rápido e seguro com nosso modelo customizado. Basta fornecer as informações solicitadas, respondendo às perguntas apresentadas, e o documento será ajustado automaticamente em tempo real. As cláusulas serão personalizadas conforme suas necessidades, incluindo detalhes como prazos, valores e responsabilidades.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="locacaoequipamentos/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}