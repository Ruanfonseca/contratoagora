import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';


export default function LocacaoImovelComercial() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Modelo de Contrato de Locação de Imóvel Comercial</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de locação comercial?
                        O contrato de locação comercial é o instrumento utilizado por quem deseja alugar um imóvel para uso comercial, seja locador ou locatário.

                        Ele descreve as condições da locação, incluindo o valor do aluguel, a forma de pagamento e seu reajuste, o prazo, a existência de garantia,
                        além de estabelecer responsabilidades pelo pagamento de impostos e tributos,
                        possibilidade de locação com mobília e outras cláusulas importantes.
                    </p>

                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Locação de Imóvel Comercial</h1>
                    <p>
                        Qual é a importância de um contrato de locação comercial?
                        contrato de locação comercial é o instrumento legal utilizado na organização do aluguel de um imóvel para fins comerciais, visando à boa convivência entre o proprietário e o locatário.

                        Ele ajuda a evitar possíveis conflitos e disputas judiciais, ajudando no entendimento dos direitos e responsabilidades de todos, economizando, portanto, tempo e evitando prejuízos.

                        Neste documento estarão descritos os pontos utilizados para esclarecer as principais dúvidas da locação, como:

                        A qualificação das partes envolvidas.
                        A descrição do imóvel alugado e a sua finalidade.
                        O prazo da locação.
                        O valor do aluguel e sua forma de pagamento.
                        A garantia utilizada (opcional).
                        As obrigações e direitos de todos os envolvidos;
                        O procedimento no caso de uma rescisão antecipada.
                        Este instrumento não deve ser visto como uma formalidade,
                        mas sim como uma ferramenta importante para proteger as partes e
                        garantir a harmonia na locação comercial.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="locacaoimovelcomercial/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}