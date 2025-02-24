import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';


export default function Servicosalao() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Modelo de Contrato de Parceria Salão Parceiro</h1>
                </div>

                <div className="text">
                    <p>
                        O contrato de parceria salão parceiro é um documento que formaliza a relação entre o(a) profissional parceiro(a) e o salão de beleza, estabelecendo uma prestação de serviços sem vínculo empregatício.

                        Esse contrato detalha pontos necessários da parceria, como o valor da cota-parte, a forma de pagamento, os horários de atendimento, além dos direitos e responsabilidades de cada parte.

                        Sua principal função é atuar como um guia claro para evitar conflitos e prejuízos futuros. Ao definir as regras e obrigações de forma objetiva, o contrato garante que a parceria seja conduzida com eficiência e profissionalismo.
                    </p>

                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Como fazer um contrato de parceria salão parceiro?</h1>
                    <p>
                        Criar um contrato de parceria salão parceiro pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas às suas necessidades específicas, como cota parte e sua forma de pagamento, prazos e responsabilidades.

                        Nossos contratos seguem rigorosamente as normas do Código Civil Brasileiro, garantindo proteção para ambas as partes. Cláusulas importantes, como as de rescisão, vendas de produtos no estabelecimento e clientela, podem ser adicionadas para evitar conflitos e assegurar transparência em toda a relação contratual.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="/contratos/prestacaodeservicos/servicoSalao/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}