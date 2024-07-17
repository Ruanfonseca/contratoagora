import Image from 'next/image';
import image1 from '../../../../assets/image1.png';
import './Info.css';
const Info = () => {
  return (
    <>
        <div className="title-text">
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
            <h1>Como Criar seu Contrato</h1>
        </div>
         
        
        <div className='instructions'>
        
  <div className='card section-1'>
    
    <h2>1. Passo Escolha o modelo que deseja elaborar</h2>
    <p>
      O primeiro passo é escolher o modelo de contrato que deseja elaborar.
      A 99Contratos oferece uma variedade de modelos de contratos que são elaborados de acordo com a legislação brasileira.
      Escolha o modelo que melhor atenda às suas necessidades.
    </p>
    <Image src={image1} alt='' />
  </div>

  <div className='card section-2'>
    <h2>2. Passo Responda as perguntas</h2>
    <Image src={image1} alt='' />
    <p>
      O primeiro passo é escolher o modelo de contrato que deseja elaborar.
      A 99Contratos oferece uma variedade de modelos de contratos que são elaborados de acordo com a legislação brasileira.
      Escolha o modelo que melhor atenda às suas necessidades.
    </p>
  </div>

  <div className='card section-3'>
    <h2>3. Pronto, seu contrato está preenchido</h2>
    <p>
      O primeiro passo é escolher o modelo de contrato que deseja elaborar.
      A 99Contratos oferece uma variedade de modelos de contratos que são elaborados de acordo com a legislação brasileira.
      Escolha o modelo que melhor atenda às suas necessidades.
    </p>
    <Image src={image1} alt='' />
  </div>
  
</div>
<div className='botao-center'>
  <button className='btn'>Escolher Contrato</button>
</div>

    </>
  )
}

export default Info