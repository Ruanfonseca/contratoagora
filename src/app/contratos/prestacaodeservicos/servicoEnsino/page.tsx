import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';


export default function ServicoEnsinoAula() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Modelo de Contrato para Aulas Particulares</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato para aulas particulares?
                        O contrato para aulas particulares é o instrumento utilizado para formalizar a relação entre o professor autônomo e o aluno, garantindo a segurança e clareza nas condições da prestação do serviço.

                        Além de estabelecer a frequência das aulas, o valor a ser pago e a forma de pagamento, o contrato também define as responsabilidades de cada parte, garantindo uma relação transparente e justa.
                    </p>

                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Como fazer um contrato de para aulas particulares?</h1>
                    <p>
                        Criar um contrato para aulas particulares pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas às suas necessidades específicas, como valor da aula, frequência, forma de pagamento e responsabilidades.

                        Nossos contratos seguem rigorosamente as normas do Código Civil Brasileiro, garantindo proteção para ambas as partes. Cláusulas importantes, como as de rescisão, prazos e sigilo, podem ser adicionadas para evitar conflitos e assegurar transparência em toda a relação contratual.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="/contratos/prestacaodeservicos/servicoEnsino/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}