
import Image from 'next/image';
import image1 from '../../../../assets/contrato.jpg';
import './About.css';

const About = () => {
  return (
    <div className="sobre" id='SOBRE'>
        <div className="sobre-direita">
          <h3 className='about-title'>Sobre</h3>
          <p className='about-text'>A Contrato Agora, fundada em 2024, simplifica a elaboração de documentos legais para todos, mantendo a segurança jurídica 
            e uma visão social.
             Como uma plataforma digital 100% nacional, nosso compromisso é melhorar constantemente nossos serviços para impactar
              positivamente a sociedade. Acreditamos que a lei pode ser simples e prática, fortalecendo a cidadania e promovendo a 
              justiça social. Democratizar o conhecimento jurídico permite que todos compreendam seus direitos, capacitando-os a tomar decisões 
              informadas e protegidas legalmente. Nosso objetivo é alcançar e capacitar comunidades, promovendo um futuro mais seguro e 
              igualitário.</p>
        </div>
        <div className="sobre-esquerda">
            <Image src={image1} className='imgsobre' alt='' />
        </div>

    </div>
  )
}

export default About