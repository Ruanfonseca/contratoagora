import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';

export default function ModeloComodatoEmprestimoDinheiro() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Modelo de Contrato de Empréstimo de Dinheiro</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de empréstimo de dinheiro?
                        O contrato de empréstimo de dinheiro, também conhecido como contrato de mútuo, é o documento legal utilizado para formalizar a relação em que uma pessoa (mutuante) cede uma quantia de dinheiro a outra (mutuária), que promete devolvê-lo corrigido e com juros compensatórios (opcional).

                        Além das informações essenciais como o valor cedido, juros compensatórios (opcional) e prazos para devolução, este instrumento pode incluir cláusulas adicionais sobre garantias, obrigações e direitos e a forma de resolução de eventuais conflitos.

                        O principal objetivo do contrato é fornecer ao credor uma maior segurança, assegurando legalmente o retorno do montante cedido em empréstimo, podendo ser utilizado legalmente para cobrança judicial em caso de inadimplência do devedor.
                    </p>
                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Como fazer um contrato de empréstimo de dinheiro?</h1>
                    <p>
                        Criar um contrato de empréstimo de dinheiro pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas às suas necessidades específicas, como valor cedido, forma de devolução, data da entrega do valor e responsabilidades.

                        Nossos contratos seguem rigorosamente as normas do Código Civil Brasileiro, garantindo proteção para ambas as partes. Cláusulas importantes, como as de rescisão, reajustes e descumprimento, podem ser adicionadas para evitar conflitos e assegurar transparência em toda a relação contratual.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="comodatoEmprestimoDinheiro/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>
            <Footer />
        </>
    )
}
