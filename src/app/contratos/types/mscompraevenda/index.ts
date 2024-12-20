export interface CVInterface {
  isimovel: 'S' | 'N';
  isveiculo: 'S' | 'N';

  // Dados do comprador
  comprador: 'pf' | 'pj';
  compradorSexo: string;
  compradorNome: string;
  compradorEstadoCivil: 'S' | 'CS' | 'DV' | 'Vi';
  compradorProfissao: string;
  compradorDoc: 'Rg' | 'Ifunc' | 'ctps' | 'cnh' | 'passaporte';
  compradorNumDoc: string;
  compradorCpf: string;
  compradorEndereco: string;

  // Dados do vendedor
  vendedor: 'pf' | 'pj';
  vendedorSexo: string;
  vendedorNome: string;
  vendedorEstadoCivil: 'S' | 'CS' | 'DV' | 'Vi';
  vendedorProfissao: string;
  vendedorDoc: 'Rg' | 'Ifunc' | 'ctps' | 'cnh' | 'passaporte';
  vendedorNumDoc: string;
  vendedorCpf: string;
  vendedorEndereco: string;

  // Informações sobre o bem
  descDobemVendido: string;
  detalhesBemVendido: string;

  // Informações de entrega
  entregaDobem: 'hj' | 'outrodia';
  dataDaEntrega?: Date;
  formaDeEntrega: 'compradorBusca' | 'vendedorEntrega';
  enderecoDeEntrega: string;

  // Condições do bem
  isbemVistoriado: 'S' | 'N';

  // Pagamento
  valorDoBem: string;
  formaDePagamento: 'avista' | 'parcelado';
  valorDeEntrada?: string;
  numeroDeParcelas?: number;
  pagamentoDocomprador: 'S' | 'N';

  // Garantia e desistência
  hasGarantia: 'S' | 'N';
  validadeGarantia?: string;
  desistenciaCompra: 'S' | 'N';
  aplicacaoMulta: 'S' | 'N';
  valorMulta?: string;

  // Assinatura e local de assinatura
  cidadeDeassinaturadocv: string;
  dataDaAssinatura: Date;
  testemunha1Nome: string;
  testemunha1CPF: string;
  testemunha2Nome: string;
  testemunha2CPF: string;

  // Cláusula de foro
  foroDeResolucao: string;
}