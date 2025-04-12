import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import './css/index.css';

export default function ModeloDoacaoTerreno() {
    return (
        <>
            <Navbar />
            <div className="hospedagem-cv">

                <div className="title">
                    <h1>Contrato de Terreno</h1>
                </div>

                <div className="text">
                    <p>
                        O que é um contrato de doação de terreno?
                        O contrato de doação de terreno é o documento que formaliza a transferência de propriedade de um terreno de uma pessoa (doador) para outra (donatário), sem qualquer exigência de pagamento ou compensação financeira.

                        Nele estarão especificadas a descrição e localização do terreno e as condições da doação, como sua data, as responsabilidades e direitos das partes, se a doação terá alguma restrição, entre outras.

                        Além disso, o contrato pode incluir cláusulas adicionais sobre antecipação ou não da legítima, concordância de terceiros, usufruto e possíveis condições para a doação ser feita, como, por exemplo, a obrigação do donatário de cumprir uma tarefa.
                    </p>
                </div>

                <div className="texto-2">
                    <h1 className="subtitle">Como fazer um contrato de doação de terreno?</h1>
                    <p>
                        Ao criar o seu contrato de doação de terreno, inclua cláusulas e informações essenciais que atendam às necessidades de todas as partes envolvidas. Exemplos importantes incluem data da doação, a descrição do terreno e o seu valor estimado e as responsabilidades das partes.

                        Além disso, para maior segurança, considere adicionar cláusulas sobre usufruto, penalidades por descumprimento contratual e condicionamento para a doação, reduzindo riscos de conflitos futuros.
                    </p>
                </div>

                <div className="preencherContrato">
                    <button className="btn">
                        <Link className='btn' href="terreno/formulario">Preencher Contrato</Link>
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}