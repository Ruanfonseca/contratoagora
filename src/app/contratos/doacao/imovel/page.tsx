import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';

export default function ModeloDoacaoImovel() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Contrato de Doação de Imóvel</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de doação de imóvel?
                        O contrato de doação de imóvel, também conhecido como termo de doação, é o documento que formaliza a transferência de propriedade de um imóvel de uma pessoa (doador) para outra (donatário), sem qualquer exigência de pagamento ou compensação financeira.

                        Este contrato deve incluir informações detalhadas sobre o imóvel, como sua localização, descrição, área e possíveis limitações ou restrições sobre a propriedade.

                        Além disso, o contrato pode incluir cláusulas adicionais sobre antecipação ou não da legítima, concordância de terceiros, usufruto (determinado ou vitalício) e possíveis condições para a doação ser feita, como, por exemplo, a obrigação do donatário de cumprir uma tarefa.
                    </p>
                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Como fazer um contrato de doação de imóvel?</h1>
                    <p>
                        Criar um contrato de doação de imóvel pode ser simples, prático e seguro com nosso modelo personalizado. Preencha as informações respondendo as perguntas apresentadas e veja o documento sendo ajustado em tempo real, com cláusulas adaptadas para atender às suas necessidades, incluindo a data da doação, a descrição do imóvel e o seu valor estimado e as responsabilidades das partes.

                        Além disso, para maior segurança, você poderá adicionar cláusulas sobre usufruto, penalidades por descumprimento contratual e condicionamento para a doação, reduzindo riscos de conflitos futuros.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="imovel/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}