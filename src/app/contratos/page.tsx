"use client";
import Link from 'next/link';
import Footer from "../pages/components/footer/Footer";
import Navbar from "../pages/components/Navbar-outside/Navbar";
import './contratos.css';

export default function contratos() {
  return (
    <>
      <Navbar />
      <div className="initial-container">
        <div className="initial">
          <h1 className="title">Modelos de contratos e documentos legais</h1>
          <p>
            Escolha entre os diversos modelos de contratos e documentos legais que oferecemos.
            Os nossos modelos são atualizados mensalmente e revisados de acordo com a
            legislação vigente. No final do procedimento em nosso site, os contratos são disponibilizados
            em Word, PDF, assim como para download e impressão.
          </p>
        </div>

        <div className="subinitial">
          <h2 className="subtitle">ALUGUEL | LOCAÇÃO | HOSPEDAGEM</h2>
          <ul>
            <li><Link className='' href="/contratos/alugellocacaohospedagem/hospedagem">Contrato de hospedagem | Locação de Flat ou Apart Hotel - R$ 19,90</Link></li>
            <li><Link className='' href="/contratos/alugellocacaohospedagem/locacaobemmovel">Contrato de locação de bens móveis - R$ 19,90</Link></li>
            <li><Link className='' href="/contratos/alugellocacaohospedagem/locacaoequipamentos">Contrato de locação de equipamentos - R$ 24,90</Link></li>
            <li><Link className='' href="/contratos/alugellocacaohospedagem/locacaoespacoevento">Contrato de locação de espaço para evento - R$ 19,90</Link></li>
            <li><Link className='' href="/contratos/alugellocacaohospedagem/locacaoimovelcomercial">Contrato de locação de imóvel comercial - R$ 29,90</Link></li>
            <li><Link className='' href="/contratos/alugellocacaohospedagem/locacaoimovelresidencial">Contrato de locação de imóvel residencial - R$ 24,90</Link></li>
            <li>Contrato de locação de imóvel residencial para temporada - R$ 19,90</li>
            <li>Contrato de locação de quarto em imóvel residencial - R$ 19,90</li>
            <li>Contrato de locação de vaga de garagem - R$ 19,90</li>
            <li>Contrato de locação de veículo - R$ 24,90</li>
          </ul>

          <h2 className="subtitle">SUBLOCAÇÃO</h2>
          <ul>
            <li>Contrato de sublocação de imóvel comercial - R$ 24,90</li>
            <li>Contrato de sublocação de imóvel residencial - R$ 19,90</li>
          </ul>

          <h2 className="subtitle">COMPRA E VENDA</h2>
          <ul>
            <li><Link className='' href="/contratos/compraevenda/contratodecompraevenda">Contrato de compra e venda - R$ 19,90</Link></li>
            <li>Contrato de compra e venda de estabelecimento comercial (trespasse) - R$ 34,90</li>
            <li>Contrato de compra e venda de imóvel - R$ 29,90</li>
            <li>Contrato de compra e venda de imóvel de gaveta - R$ 29,90</li>
            <li>Contrato de compra e venda de imóvel rural - R$ 29,90</li>
            <li>Contrato de compra e venda de terreno - R$ 29,90</li>
            <li>Contrato de compra e venda de veículo - R$ 24,90</li>
            <li>Contrato de compra e venda de veículo alienado (financiado) - R$ 24,90</li>
          </ul>

          <h2 className="subtitle">CESSÃO DE POSSE</h2>
          <ul>
            <li>Contrato de cessão de posse de imóvel - R$ 29,90</li>
            <li>Contrato de cessão de posse de terreno - R$ 29,90</li>
          </ul>

          <h2 className="subtitle">PRESTAÇÃO DE SERVIÇOS</h2>
          <ul>
            <li>Contrato de corretagem imobiliária - R$ 24,90</li>
            <li>Contrato de empreitada | Obra - R$ 29,90</li>
            <li>Contrato de prestação de serviços - R$ 29,90</li>
            <li>Contrato de prestação de serviços de beleza | Salão-Parceiro - R$ 24,90</li>
            <li>Contrato de prestação de serviços de ensino | aulas | educação - R$ 14,90</li>
            <li>Contrato de prestação de serviços de fisioterapia - R$ 19,90</li>
            <li>Contrato de prestação de serviços de manicure - R$ 19,90</li>
            <li>Contrato de prestação de serviços de nutricionista - R$ 19,90</li>
            <li>Contrato de prestação de serviços de personal trainer - R$ 19,90</li>
            <li>Contrato de prestação de serviços de transporte escolar - R$ 14,90</li>
            <li>Contrato de representação de jogador de futebol | intermediação | agente - R$ 29,90</li>
          </ul>

          <h2 className="subtitle">EMPRÉSTIMO | COMODATO</h2>
          <ul>
            <li>Contrato de comodato de imóvel comercial - R$ 14,90</li>
            <li>Contrato de comodato de imóvel residencial - R$ 14,90</li>
            <li>Contrato de empréstimo de dinheiro - R$ 24,90</li>
            <li>Contrato de empréstimo de veículo - R$ 19,90</li>
          </ul>

          <h2 className="subtitle">TROCA | PERMUTA</h2>
          <ul>
            <li>Contrato de permuta | troca simples - R$ 19,90</li>
            <li>Contrato de permuta de imóveis - R$ 29,90</li>
          </ul>

          <h2 className="subtitle">DOAÇÃO</h2>
          <ul>
            <li>Contrato de doação simples - R$ 19,90</li>
            <li>Contrato de doação de dinheiro - R$ 19,90</li>
            <li>Contrato de doação de imóvel - R$ 24,90</li>
            <li>Contrato de doação de terreno - R$ 24,90</li>
          </ul>

          <h2 className="subtitle">ATIVIDADES E IMÓVEL RURAL</h2>
          <ul>
            <li>Contrato de arrendamento de imóvel rural - R$ 24,90</li>
            <li>Contrato de compra e venda de imóvel rural - R$ 29,90</li>
            <li>Contrato de parceria rural - R$ 24,90</li>
          </ul>

          <h2 className="subtitle">FAMÍLIA, MATRIMÔNIO E SUCESSÃO</h2>
          <ul>
            <li>Contrato de cessão de direitos hereditários - R$ 29,90</li>
            <li>Contrato de compromisso de fidelidade - R$ 19,90</li>
            <li>Contrato de compromisso de fidelidade conjugal - R$ 19,90</li>
            <li>Contrato de namoro - R$ 19,90</li>
            <li>Contrato de união estável - R$ 24,90</li>
            <li>Declaração de dissolução de união estável - R$ 24,90</li>
            <li>Declaração de união estável - R$ 9,90</li>
            <li>Outorga conjugal - R$ 9,90</li>
            <li>Pacto antenupcial - R$ 24,90</li>
            <li>Testamento - R$ 24,90</li>
          </ul>

          <h2 className="subtitle">COTIDIANO</h2>
          <ul>
            <li>Contrato de confissão e renegociação de dívida - R$ 24,90</li>
            <li>Contrato de babá - R$ 24,90</li>
            <li>Contrato de babá não habitual - R$ 14,90</li>
            <li>Contrato de caseiro - R$ 19,90</li>
            <li>Contrato de cuidador de idoso - R$ 24,90</li>
            <li>Contrato de cuidador de idoso não habitual - R$ 14,90</li>
            <li>Contrato de diarista - R$ 14,90</li>
            <li>Contrato de empregada doméstica - R$ 19,90</li>
            <li>Contrato de enfermeira particular - R$ 19,90</li>
            <li>Contrato de representação de jogador de futebol | intermediação | agente - R$ 24,90</li>
            <li>Declaração de residência - R$ 9,90</li>
            <li>Pedido formal de desculpas - R$ 9,90</li>
            <li>Termo de perdão de dívida / Remissão de dívida - R$ 9,90</li>
          </ul>

          <h2 className="subtitle">PROPRIEDADE INTELECTUAL</h2>
          <ul>
            <li>Contrato de cessão de direitos autorais - R$ 24,90</li>
            <li>Contrato de licença de uso de software - R$ 24,90</li>
          </ul>

          <h2 className="subtitle">EMPRESAS, PARCERIAS E STARTUPS</h2>
          <ul>
            <li>Contrato de collab (parceria colaborativa) - R$ 24,90</li>
            <li>Contrato individual de trabalho - R$ 24,90</li>
            <li>Contrato de mútuo conversível em participação societária - R$ 29,90</li>
            <li>Contrato de parceria comercial - R$ 29,90</li>
            <li>Contrato de parceria empresarial - R$ 29,90</li>
            <li>Contrato de parceria salão parceiro | Serviços de beleza - R$ 24,90</li>
            <li>Contrato de patrocínio para participação em evento - R$ 24,90</li>
            <li>Contrato de representação comercial - R$ 24,90</li>
            <li>Contrato de sociedade limitada - R$ 34,90</li>
            <li>Termo de acordo para extinção de contrato de trabalho - R$ 24,90</li>
          </ul>

          <h2 className="subtitle">DISTRATOS</h2>
          <ul>
            <li>Distrato de contrato de compra e venda - R$ 9,90</li>
            <li>Distrato de contrato de compra e venda de imóvel - R$ 9,90</li>
            <li>Distrato de contrato de empreitada - R$ 9,90</li>
            <li>Distrato de contrato de prestação de serviços - R$ 9,90</li>
            <li>Distrato simples - R$ 9,90</li>
            <li>Instrumento particular de distrato - R$ 9,90</li>
          </ul>

          <h2 className="subtitle">PROCURAÇÕES</h2>
          <ul>
            <li>Procuração para compra e venda de veículo - R$ 9,90</li>
            <li>Procuração para inventário e partilha - R$ 9,90</li>
            <li>Procuração para movimentação bancária - R$ 9,90</li>
            <li>Procuração para representação em assembleia de condomínio - R$ 9,90</li>
            <li>Procuração por instrumento particular - R$ 9,90</li>
          </ul>

          <h2 className="subtitle">RECIBOS</h2>
          <ul>
            <li>Recibo de compra e venda - R$ 9,90</li>
            <li>Recibo de pagamento de pagamento de aluguel - R$ 9,90</li>
            <li>Recibo de pagamento de compra e venda de imóvel - R$ 9,90</li>
            <li>Recibo de pagamento de compra e venda de terreno - R$ 9,90</li>
            <li>Recibo de pagamento de compra e venda de veículo - R$ 9,90</li>
            <li>Recibo de pagamento de prestação de serviços - R$ 9,90</li>
            <li>Recibo de pagamento simples - R$ 9,90</li>
          </ul>

          <h2 className="subtitle">COMUNICADOS E NOTIFICAÇÕES</h2>
          <ul>
            <li>Comunicado de reajuste de aluguel - R$ 9,90</li>
            <li>Notificação extrajudicial para cumprimento de obrigação contratual - R$ 9,90</li>
            <li>Notificação para rescisão de contrato de locação residencial - R$ 9,90</li>
          </ul>
        </div>
      </div>
      <Footer />
    </>
  );
}
