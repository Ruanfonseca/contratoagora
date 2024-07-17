import Link from 'next/link';
import './Hero.css';

const Hero = () => {
  return (
    <div className="header containerProject" id="HOME">
      <div className="header-text">
        <h1>Contrato Agora</h1>
        <p>Sua solução ideal para contratos personalizados</p>
        <Link id="CONTRATO" className="btn" href={''}>
          Criar Contrato
        </Link>
      </div>
    </div>
  );
};

export default Hero;
