import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';


export default function CorretagemI() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Modelo de Contrato de Corretagem Imobiliária</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de corretagem imobiliária?
                        O contrato de prestação de serviços de corretagem imobiliária é o instrumento que regula a prestação de serviços entre um corretor ou uma imobiliária e um proprietário para a negociação de um imóvel específico.
                        No contrato estarão descritas as condições para a execução do serviço, incluindo o valor da comissão a ser paga em caso de venda do imóvel,
                        a forma de pagamento, as obrigações e direitos do contratante e do contratado,
                        além de especificar se a corretagem será exclusiva e outras regras; também é possível incluir
                        cláusulas de confidencialidade e personalizar o documento conforme suas necessidades.                    </p>

                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Como fazer um contrato de prestação de serviços de corretagem imobiliária?</h1>
                    <p>
                        Criar um contrato de corretagem imobiliária pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas às suas necessidades específicas, como valores, comissão, forma de pagamento e responsabilidades.

                        Nossos contratos seguem rigorosamente as normas do Código Civil Brasileiro, garantindo proteção para ambas as partes. Cláusulas importantes, como as de rescisão, prazos e exclusividade, podem ser adicionadas para evitar conflitos e assegurar transparência em toda a relação contratual.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="/contratos/prestacaodeservicos/corretagemImobiliaria/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}