'use client'
import Footer from "@/app/pages/components/footer/Footer";
import Navbar from "@/app/pages/components/Navbar-outside/Navbar";
import './index.css';

const ContratoCV = () => {
  return (
    <>

   <Navbar/>

    <div className="container-cv">
        <div className="title">
           <h1>Modelo de Contrato de Compra e Venda</h1>
        </div>
        <div className="text">
            <p>
            O contrato de compra e venda é o documento utilizado para que uma pessoa possa vender um bem de forma
             segura e transparente para outra pessoa, que se compromete a recebê-lo mediante um pagamento acordado.

            Este documento garante os direitos e deveres tanto do comprador quanto do vendedor, definindo as condições da negociação, 
            como o valor a ser pago, a forma de pagamento, prazos, responsabilidades e obrigações de ambas as partes.

           O objetivo deste contrato é proporcionar maior segurança à transação, formalizando o que foi acordado e evitando desistências após a sua assinatura.
            No entanto, é possível incluir uma cláusula de arrependimento, que permite a desistência da transação mediante o pagamento de uma multa.

           O seu contrato será gerado de acordo com as suas respostas, de maneira simples e personalizada, sendo disponibilizado nos formatos Word e 
           PDF, em conformidade com as normas da ABNT.

             Nosso modelo de contrato de compra e venda é revisado mensalmente, conforme o Código Civil (Lei Federal nº 10.406).

           Ao utilizar nosso contrato, você pode ter certeza de que estará realizando uma negociação transparente e em conformidade com a legislação brasileira.
            </p>
        </div>
       
       <div className="texto-2">
           <h1 className="subtitle">Contrato de Compra e Venda</h1>
           <p>
           O contrato de compra e venda deve ser utilizado para formalizar a negociação de um bem específico, facilitando a relação entre as partes envolvidas.

            Nesse documento, o proprietário se compromete a vender e o comprador, por sua vez, a adquirir o bem mediante o pagamento de um valor estipulado.

            Além disso, o contrato esclarece questões importantes sobre a transação, como:

            A identificação e qualificação das partes;
            A descrição do bem negociado;
            O valor acordado para a venda, os prazos de pagamento, e se será à vista ou parcelado;
            Como e quando o bem será transferido para o comprador;
            As obrigações, deveres e direitos das partes envolvidas;
            Como proceder em caso de rescisão.
            Este documento assegura que ambas as partes cumpram os termos acordados durante a negociação.

            Com este contrato, é possível evitar conflitos e disputas judiciais futuras, prevenindo prejuízos e perda de tempo.
             Portanto, o contrato não deve ser encarado apenas como uma formalidade, mas sim como uma ferramenta essencial para proteger os envolvidos na 
             transação.
          </p>
       </div>
       <div className="texto-3">
           <h1 className="subtitle">DIFERENÇAS ENTRE O CONTRATO DE COMPRA E VENDA E A SUA PROMESSA</h1>
           <p>
           A negociação pode ser realizada por meio de um contrato simples de compra e venda, também conhecido como compromisso de compra e venda, ou por meio de uma promessa de compra e venda.

            No compromisso de compra e venda, o contrato é irrevogável, ou seja, as partes não têm a possibilidade de arrependimento.
             Isso significa que, se uma das partes desistir da negociação, o contrato pode ser utilizado judicialmente para exigir o cumprimento dos termos 
             acordados.

            Por outro lado, a promessa de compra e venda é considerada um contrato preliminar, que permite o arrependimento por uma das partes.
             Se o contrato permite a desistência do negócio, mesmo com a aplicação de uma multa (que é opcional), ele será classificado como uma promessa de 
             compra e venda.
           </p>
       </div>

       <div className="preencherContrato">
         <button className="btn">Preencher Contrato</button>
       </div>
    </div>

    <Footer/>
   </>
  )
}

export default ContratoCV;