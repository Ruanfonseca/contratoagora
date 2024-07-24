"use client"
import Image from 'next/image';
import image2 from '../../../../assets/formcontrato.png';
import image1 from '../../../../assets/image1.png';
import image3 from '../../../../assets/modelo.png';
import './Info.css';

const Info = () => {

  const handleClick = ()=>{

  }

  return (
    <>
      <div className="title-text" >
        <h1>Criando seus contratos com rapidez, praticidade e segurança</h1>
        <br/>
        <p>Na Contrato Agora, você encontra a solução perfeita para 
          criar contratos personalizados de forma ágil e segura. 
          Nossa plataforma oferece uma experiência simplificada para gerar
          documentos que atendem exatamente às suas necessidades.
          Para criar o seu contrato ideal, basta selecionar um modelo e 
          responder a algumas perguntas simples. O processo é rápido e 
          intuitivo, garantindo que seu contrato seja elaborado de maneira
          eficiente e personalizada.</p>
        <br />
        
      </div>
         
         <div className='instructions-title' id='AJUDA'>
            <h1>Como Criar seu Contrato</h1>
         </div>
      <div className='instructions'>
      
        <div className='card section-1'>
          <h2>1. Passo Escolha o modelo que deseja elaborar</h2>
          <p>
            O primeiro passo é escolher o modelo de contrato que deseja elaborar.
            A Contrato Agora oferece uma variedade de modelos de contratos que são elaborados de acordo com a legislação brasileira.
            Escolha o modelo que melhor atenda às suas necessidades.
          </p>
          <Image src={image1} className='imgstyle' alt='' />
        </div>

        <div className='card section-2'>
          <h2>2. Passo Responda as perguntas</h2>
          <Image src={image2} className='imgstyle' alt='' />
          <p>
            Depois de escolher o modelo, responda a algumas perguntas simples.
            Isso nos ajuda a personalizar o contrato de acordo com as suas necessidades específicas.
          </p>
        </div>

        <div className='card section-3'>
          <h2>3. Pronto, seu contrato está preenchido</h2>
          <p>
            Após responder às perguntas, seu contrato será gerado automaticamente.
            Você pode revisar, editar e finalizar o documento com facilidade.
          </p>
          <Image src={image3} className='imgstyle' alt='' />
        </div>
      </div>
      
      <div className='botao-center' id='CONTRATOS'>
        <button className='btn' onClick={handleClick}>Escolher Contrato</button>
      </div>
    </>
  )
}

export default Info;
