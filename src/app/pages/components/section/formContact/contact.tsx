"use client"
import Image from 'next/image';
import { useState } from 'react';
import image2 from '../../../../assets/gmail-contratoagora.png';
import image1 from '../../../../assets/instagramcontratoagora.png';

import './contact.css';

const Contact: React.FC = () => {
  const [result, setResult] = useState<string>("");

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResult("Enviando..");
    const formData = new FormData(event.currentTarget);
    formData.append("access_key", "01d30909-5687-4c88-9ef7-12e97a94aff7");

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      setResult("Enviado com sucesso!");
      event.currentTarget.reset();
    } else {
      console.log("Error", data);
      setResult(data.message);
    }
  }

  return (
    <div className='contato' id='CONTATO'>
      <div className='contato-col'>
        <h3>Envie-nos uma Mensagem</h3>
        <p>
          Utilize os campos abaixo para falar com a gente.
          Importante: Nosso atendimento não está autorizado a 
          prestar assessoria ou consultoria jurídica.
        </p>

        <ul>
          <li><Image src={image1} alt="" /><a href="#">Instagram</a></li>
          <li><Image src={image2} alt="" /><a href="#">E-mail</a></li>
        </ul>
      </div>
      
      <div className="contato-col">
        <form onSubmit={onSubmit}>
          <label>Nome</label>
          <input type="text" name="nome" placeholder='Digite seu nome' required />

          <label>Email </label>
          <input type="email" name='email' placeholder='Digite seu email' />

          <label>Telefone</label>
          <input type="tel" name='telefone' placeholder='Digite seu telefone' />

          <label>Assunto</label>
          <input type="text" name='assunto' placeholder='Digite seu assunto' />

          <label>Mensagem</label>
          <textarea name='mensagem' id='mensagem' rows={6} placeholder='Digite sua demanda'></textarea>

          <button type='submit' className='btn dark-btn'>Enviar</button>
        </form>
        <span>{result}</span>
      </div>
    </div>
  )
}

export default Contact;
