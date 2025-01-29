import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';


export default function LocacaoImovelResidencialPorTemporada() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Modelo de Contrato de Locação para Temporada</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de locação para temporada?
                        O contrato de locação para temporada é o instrumento utilizado por aqueles que desejam alugar um imóvel residencial por um curto período, atendendo tanto ao locador quanto ao locatário.

                        Neste documento estarão estabelecidas as regras da locação do imóvel, como o valor do aluguel acordado e sua forma de pagamento, o prazo da locação, possíveis reajustes, indenizações, responsabilidades e obrigações dos envolvidos, entre outros termos relevantes.
                    </p>

                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Qual é a legislação aplicável ao contrato de locação para temporada?</h1>
                    <p>
                        <a href="https://www.planalto.gov.br/ccivil_03/leis/l8245.htm" target="blank">Lei nº 8.245 / 1990
                            Fonte: Planalto - Governo Federal - lei federal nº 8.245

                            Também conhecida como Lei do Inquilinato.</a>
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="locacaoimovelresidencialtemporada/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}