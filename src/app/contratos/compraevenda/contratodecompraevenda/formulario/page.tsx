import Footer from '@/app/pages/components/footer/Footer';
import Navbar from '@/app/pages/components/Navbar-outside/Navbar';
import { useState } from 'react';

const Formulario = () => {
  const[etapa,setEtapa] = useState(1);
  
  const [valores,setValores]=useState({
    ImovelouTerreno:false,
    veiculo:false,
    pessoaJuridicaComprador:false,
    pessoaFisicaComprador:false,
    sexoComprador:'',
    nomeComprador:'',
    estadoCivilComprador:'',
    nacionalidadeComprador:'',
    profissaoComprador:'',
    TipoDocumentoComprador:'',
    numeroIdentidocumentoComprador:'',
    cpfComprador:'',
    enderecoComprador:'',
    
    pessoaJuridicaVendedor:false,
    pessoaFisicaVendedor:false,
    sexoVendedor:'',
    nomeVendedor:'',
    estadoCivilVendedor:'',
    nacionalidadeVendedor:'',
    profissaoVendedor:'',
    TipoDocumentoVendedor:'',
    numeroIdentidocumentoVendedor:'',
    cpfVendedor:'',
    enderecoVendedor:'',
    

    bemaservendido:'',
    periododeentrega:'',
    vistoria:false,
    pago:false,

  });
  
    return (
    <>
     <Navbar/>
            
     <Footer/>
    </>
  )
}

export default Formulario;