"use client";
import Image from "next/image";
import { useState } from "react";
import imageWhatsapp from "@/app/assets/whatswhite.png";
import imageInstagram from "../../../../assets/instagramcontratoagora.png";
import "./contact.css";

const Contact: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [nome, setNome] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [assunto, setAssunto] = useState("");

  const clearInputs = () => {
    setNome("");
    setEmail("");
    setMensagem("");
    setTelefone("");
    setAssunto("");
  };

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !email || !mensagem || !assunto || !telefone) {
      alert("Por favor, preencha todos os campos antes de enviar.");
      return;
    }

    setIsLoading(true);

    try {
      // 👉 aqui você ainda pode manter o envio por emailjs se quiser
      alert(`Perfeito ${nome}, em breve retornaremos seu contato!`);
      clearInputs();
    } catch (err) {
      console.error("ERRO: ", err);
      alert("Ocorreu um erro. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="contato" id="CONTATO">
      <div className="contato-col">
        <h3>Entre em Contato</h3>
        <p>
          Escolha um dos canais abaixo ou preencha o formulário. Estamos prontos
          para falar com você!
        </p>

        <ul>
          <li>
            <Image src={imageWhatsapp} alt="WhatsApp" />
            <a
              href="https://wa.me/5599999999999"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </li>
          <li>
            <Image src={imageInstagram} alt="Instagram" />
            <a
              href="https://instagram.com/seuPerfil"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
          </li>
        </ul>
      </div>

      <div className="contato-col">
        <form onSubmit={sendEmail}>
          <label>Nome</label>
          <input
            type="text"
            name="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Digite seu nome"
            required
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Telefone</label>
          <input
            type="tel"
            name="telefone"
            placeholder="Digite seu telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            required
          />

          <label>Assunto</label>
          <input
            type="text"
            name="assunto"
            placeholder="Digite seu assunto"
            value={assunto}
            onChange={(e) => setAssunto(e.target.value)}
            required
          />

          <label>Mensagem</label>
          <textarea
            name="mensagem"
            id="mensagem"
            rows={6}
            placeholder="Digite sua demanda"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            required
          ></textarea>

          <button className="btn" type="submit" disabled={isLoading}>
            {isLoading ? "Enviando..." : "Enviar Mensagem"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
