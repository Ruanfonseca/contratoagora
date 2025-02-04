"use client"
import emailjs from "@emailjs/browser";
import Image from 'next/image';
import { useState } from 'react';
import image2 from '../../../../assets/gmail-contratoagora.png';
import image1 from '../../../../assets/instagramcontratoagora.png';
import './contact.css';


const Contact: React.FC = () => {
  const [result, setResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [nome, setNome] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [assunto, setAssunto] = useState('');



  const sendEmail = async () => {
    if (!nome || !email || !mensagem || !!assunto || !!telefone) {
      alert('Por favor, preencha todos os campos antes de enviar.');
      return;
    }

    setIsLoading(true);

    const templateParams = {
      nome: nome,
      mensagem: mensagem,
      email: email,
      assunto: assunto,
      telefone: telefone
    };

    const clearInputs = () => {
      setNome('');
      setEmail('');
      setMensagem('');
      setTelefone('');
      setAssunto('');
    };

    try {
      const response = await emailjs.send(
        "service_usk7pz5",
        "template_9j8kc0h",
        templateParams,
        "WwknFyzpsEMdh7pUA"
      );
      if (response.status != 200 || 201) {

        alert(`Perfeito ${nome}, em breve retornaremos seu contato !`);
        clearInputs();
      } else {
        alert(`Erro no processo de envio: ${response.text}`);
        clearInputs();
      }

    } catch (err) {
      console.error("ERRO: ", err);
      alert('Ocorreu um erro ao enviar o email. Por favor, tente novamente.');

    } finally {
      setIsLoading(false);
      clearInputs();
    }
  };

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
        <form>
          <label>Nome</label>
          <input
            type="text"
            name="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder='Digite seu nome'
            required
          />

          <label>Email </label>
          <input
            type="email"
            name='email'
            placeholder='Digite seu email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Telefone</label>
          <input
            type="tel"
            name='telefone'
            placeholder='Digite seu telefone'
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />

          <label>Assunto</label>
          <input
            type="text"
            name='assunto'
            placeholder='Digite seu assunto'
            value={assunto}
            onChange={(e) => setAssunto(e.target.value)}
          />

          <label>Mensagem</label>
          <textarea
            name='mensagem'
            id='mensagem'
            rows={6}
            placeholder='Digite sua demanda'
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
          >

          </textarea>

          <button
            className='btn dark-btn'
            disabled={isLoading}
            onClick={sendEmail}
          >
            {isLoading ? (
              <span style={{ color: 'white' }}>Enviando...</span>
            ) : (
              <span style={{ color: 'white' }}>Enviar Mensagem</span>
            )}
            {isLoading && <span style={{ color: 'white' }}>Aguarde..</span>}
          </button>
        </form>
        <span>{result}</span>
      </div>
    </div>
  )
}

export default Contact;
