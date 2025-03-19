import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';

export default function ModeloComodatoEmprestimoVeiculo() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Modelo de Contrato de Empréstimo de Veículo</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de empréstimo de veículo?
                        O contrato de empréstimo de veículo é o documento recomendado para formalizar a relação em que uma pessoa (mutuante) cede um veículo para outra (mutuária) utilizar, prometendo devolvê-lo no mesmo estado em que o recebeu, protegento o cedente em relação as multas geradas durante o período da cessão.

                        Além das informações essenciais como a descrição do veículo, responsabilidades sobre manutenções e prazos para devolução, este instrumento pode incluir cláusulas adicionais sobre contratação de seguro, obrigações e direitos e a forma de resolução de eventuais conflitos.
                    </p>
                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Como fazer um contrato de empréstimo de veículo?</h1>
                    <p>
                        Criar um contrato de empréstimo de veículo pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas às suas necessidades específicas, como a descrição do veículo, prazo para a devolução e responsabilidades.

                        Nossos contratos seguem rigorosamente as normas do Código Civil Brasileiro, garantindo proteção para ambas as partes. Cláusulas importantes, como as de rescisão e descumprimento, podem ser adicionadas para evitar conflitos e assegurar transparência em toda a relação contratual.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="comodatoEmprestimoVeiculo/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>
            <Footer />
        </>
    )
}
