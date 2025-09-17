import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import Footer from "@/app/pages/components/footer/Footer";
import Link from "next/link";
import "./css/index.css";

export default function Hospedagem() {
  return (
    <>
      <Navbar />
      <div className="hospedagem-cv">
        <div>
          <h1 className="title">Modelo de Contrato de Hospedagem</h1>
        </div>

        <div className="text">
          <p>
            O que é um contrato de hospedagem? Um contrato de hospedagem é o
            documento utilizado para formalizar o aluguel de imóveis como flats,
            apart-hotéis ou quartos de hotel. Ele estabelece todas as condições
            relacionadas à estadia, incluindo valores, formas de pagamento,
            normas de convivência, bem como os direitos e deveres de ambas as
            partes envolvidas. Além disso, o contrato pode ser adaptado para
            atender às necessidades específicas do locador e do hóspede,
            abrangendo aspectos como garantia (opcional), duração, cláusulas de
            rescisão, entre outras possibilidades. Ao elaborar o contrato, você
            receberá gratuitamente modelos de laudo de vistoria e recibo de
            aluguel, ferramentas essenciais para garantir transparência e
            segurança na negociação. O contrato será gerado de forma simples e
            personalizada, com base nas suas respostas, e estará disponível nos
            formatos Word e PDF, seguindo as normas da ABNT. Qual é a legislação
            aplicável ao contrato de hospedagem? Nosso modelo de contrato é
            atualizado mensalmente para assegurar conformidade com o Código
            Civil (Lei Federal nº 10.406) e a Lei Federal nº 11.771.
          </p>
        </div>

        <div className="texto-2">
          <h1 className="subtitle">Contrato de Hospedagem</h1>
          <p>
            Como fazer um contrato de hospedagem? Criar um contrato de
            hospedagem pode ser simples, prático e seguro com nosso modelo
            personalizado. Preencha as informações respondendo as perguntas
            apresentadas e veja o documento sendo ajustado em tempo real, com
            cláusulas adaptadas às suas necessidades específicas, como valor,
            prazo e responsabilidades. Nossos contratos seguem rigorosamente as
            normas do Código Civil Brasileiro, garantindo proteção para ambas as
            partes. Cláusulas importantes, como as de rescisão, regras de
            condomínio e multas, podem ser adicionadas para evitar conflitos e
            assegurar transparência em toda a relação contratual. Ao final, você
            poderá baixar, imprimir o seu documento personalizado no formato
            PDF.
          </p>
        </div>

        <div className="preencherContrato">
          <button className="btn">
            <Link className="btn" href="hospedagem/formulario">
              Preencher Contrato
            </Link>
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}
