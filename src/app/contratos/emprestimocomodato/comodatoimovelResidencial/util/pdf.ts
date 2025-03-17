import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function GeracaodeComodatoResidencialPAGO(dados: any) {
    const doc = new jsPDF();

    // Configuração inicial de fonte e margens
    const marginX = 10;
    let posY = 20;

    // Altura máxima permitida antes de criar uma nova página
    const maxPageHeight = 280;

    // Largura do texto permitida dentro das margens
    const maxTextWidth = 190;

    // Função auxiliar para verificar espaço restante na página
    const checkPageBreak = (additionalHeight: number) => {
        if (posY + additionalHeight >= maxPageHeight) {
            doc.addPage();
            posY = 20; // Reinicia a posição no topo da nova página
        }
    };

    // Função auxiliar para adicionar seções e ajustar a posição Y
    const addSection = (title: string, content: string[]) => {
        const titleHeight = 15; // Altura do título
        const lineHeight = 10; // Altura de cada linha de texto

        // Verifica espaço antes de adicionar o título
        checkPageBreak(titleHeight);
        doc.setFontSize(12);
        doc.text(title, 105, posY, { align: "center" });
        posY += titleHeight;

        // Adiciona o conteúdo, verificando quebra de páginas
        doc.setFontSize(10);
        content.forEach((line: string) => {
            // Divide o texto em linhas com base na largura permitida
            const splitLines = doc.splitTextToSize(line, maxTextWidth); // Quebra automática
            splitLines.forEach((splitLine: string) => {
                checkPageBreak(lineHeight); // Verifica quebra de página para cada linha
                doc.text(splitLine, marginX, posY);
                posY += lineHeight;
            });
        });
    };



    // Página 1 - Cabeçalho
    doc.setFontSize(14);
    doc.text("Contrato de Comodato de Imóvel Residencial", 105, posY, { align: "center" });
    posY += 15;

    // Seção 1: Identificação das Partes
    addSection("1. IDENTIFICAÇÃO DAS PARTES", [
        "Comodante (Pessoa que vai emprestar)",
        dados.pessoaComodante === "juridico" ? "Pessoa Jurídica:" : "Pessoa Física:",
        ...(dados.pessoaComodante === "juridico"
            ? [
                `Razão social: ${verificarValor(dados.razaoSocial)}`,
                `CNPJ: ${verificarValor(dados.cnpj)}`,
                `Endereço: ${verificarValor(dados.endereco)}`,
                `Nome do representante: ${verificarValor(dados.representanteNome)}`,
                `Cargo do representante: ${verificarValor(dados.cargoRepresentante)}`,
                `Carteira de identidade do representante: ${verificarValor(dados.documentoIdentifica)}`,
                `CPF do representante: ${verificarValor(dados.cpfRepresentante)}`
            ]
            : [
                `Nome: ${verificarValor(dados.nomeCompletoComodante)}`,
                `Estado civil: ${verificarValor(dados.estadoCivilComodante)}`,
                `Nacionalidade: ${verificarValor(dados.nacionalidadeComodante)}`,
                `Profissão: ${verificarValor(dados.profissaoComodante)}`,
                `Documento de identificação: ${verificarValor(dados.documentoIdentificacaoComodante)}`,
                `Número do documento: ${verificarValor(dados.numeroDocComodante)}`,
                `CPF: ${verificarValor(dados.cpfComodante)}`,
                `Endereço completo: ${verificarValor(dados.enderecoComodante)}`
            ]),
        "Comodatário (Pessoa que vai receber emprestado)",
        dados.pessoaComodatario === "juridico" ? "Pessoa Jurídica:" : "Pessoa Física:",
        ...(dados.pessoaComodatario === "juridico"
            ? [
                `Razão social: ${verificarValor(dados.razaoSocialComodatario)}`,
                `CNPJ: ${verificarValor(dados.cnpjComodatario)}`,
                `Endereço: ${verificarValor(dados.enderecoComodatarioPj)}`,
                `Nome do representante: ${verificarValor(dados.representanteNomeComodatario)}`,
                `Cargo do representante: ${verificarValor(dados.cargoRepresentanteComodatario)}`,
                `Carteira de identidade do representante: ${verificarValor(dados.documentoIdentificaComodatario)}`,
                `CPF do representante: ${verificarValor(dados.cpfRepresentanteComodatarioPj)}`
            ]
            : [
                `Nome: ${verificarValor(dados.nomeCompletoComodatario)}`,
                `Estado civil: ${verificarValor(dados.estadoCivilComodatario)}`,
                `Nacionalidade: ${verificarValor(dados.nacionalidadeComodatario)}`,
                `Profissão: ${verificarValor(dados.profissaoComodatario)}`,
                `Documento de identificação: ${verificarValor(dados.documentoIdentificacaoComodatario)}`,
                `CPF: ${verificarValor(dados.cpfComodatario)}`,
                `Endereço completo: ${verificarValor(dados.enderecoComodatario)}`
            ])
    ]);

    // Seção 2: Do Objeto
    addSection("2. DO OBJETO", [
        `Endereço do imóvel cedido: ${verificarValor(dados.enderecoImovel)}`,
        `Descrição do imóvel: ${verificarValor(dados.descricaoDetalhada)}`
    ]);

    // Seção 3: Da Destinação do Imóvel
    addSection("3. DA DESTINAÇÃO DO IMÓVEL", [
        `O comodatário poderá utilizar o imóvel: ${dados.utilizacaoImovel === "livre" ? "Livremente" : `Somente para um fim específico: ${verificarValor(dados.finalidade)}`}`
    ]);

    // Seção 4: Das Taxas e Impostos
    addSection("4. DAS TAXAS E IMPOSTOS", [
        `O responsável pelo pagamento dos impostos e taxas do imóvel será: ${dados.pagamentoImpostos === "comodante" ? "Comodante" : "Comodatário"}`,
        `O imóvel possui condomínio mensal? ${dados.imoveltxcondominio === "S" ? "Sim" : "Não"}`,
        ...(dados.imoveltxcondominio === "S" ? [`O responsável pelo pagamento do condomínio será: ${dados.responsavelPag === "comodante" ? "Comodante" : "Comodatário"}`] : []),
        `As despesas com manutenção, energia elétrica, água e outras contas serão arcadas por? ${dados.despesas === "comodante" ? "Comodante" : "Comodatário"}`
    ]);

    // Seção 5: Do Prazo do Comodato
    addSection("5. DO PRAZO DO COMODATO", [
        `Data de início: ${verificarValor(dados.dataInicio)}`,
        `O empréstimo terá um prazo para encerrar? ${dados.contratoPrazo === "S" ? "Sim" : "Não"}`,
        ...(dados.contratoPrazo === "S" ? [`O imóvel será emprestado por ${verificarValor(dados.quantosMeses)} meses.`] : [])
    ]);

    // Seção 6: Da Vedação à Sublocação e Empréstimo do Imóvel
    addSection("6. DA VEDAÇÃO À SUBLOCAÇÃO E EMPRÉSTIMO DO IMÓVEL", [
        `O comodatário poderá emprestar, ceder ou alugar o imóvel para terceiros? ${dados.emprestimo === "S" ? "Sim" : "Não"}`
    ]);

    // Seção 7: Das Benfeitorias Necessárias, Úteis e Voluptuárias
    addSection("7. DAS BENFEITORIAS NECESSÁRIAS, ÚTEIS E VOLUPTUÁRIAS", [
        `Quem será responsável pelo pagamento das benfeitorias necessárias? ${dados.benfeitoriasNecessarias === "comodato" ? "Comodante" : "Comodatário"}`,
        `Quem será responsável pelo pagamento das benfeitorias úteis? ${dados.benfeitoriasUteis === "comodato" ? "Comodante" : "Comodatário"}`
    ]);

    // Seção 8: Dos Direitos e Deveres das Partes
    addSection("8. DOS DIREITOS E DEVERES DAS PARTES", [
        "Direitos do Comodante:",
        "- Reaver o imóvel ao final do prazo acordado ou mediante aviso prévio de 30 (trinta) dias.",
        "- Exigir a devolução do imóvel em condições semelhantes às que foi entregue, salvo desgaste natural.",
        "- Receber indenização por eventuais danos causados pelo comodatário.",
        "- Fiscalizar o uso do imóvel.",
        "Direitos do Comodatário:",
        "- Utilizar o imóvel de acordo com o que foi estabelecido no contrato.",
        "- Permanecer no imóvel durante o prazo estabelecido, desde que cumpra suas obrigações.",
        "- Ser ressarcido pelo comodante caso realize benfeitorias necessárias previamente autorizadas.",
        "Deveres do Comodatário:",
        "- Utilizar o imóvel unicamente para os fins acordados.",
        "- Zelar pela manutenção e conservação do imóvel.",
        "- Restituir o imóvel nas condições acordadas ao final do prazo.",
        "- Informar imediatamente ao comodante qualquer dano ou problema estrutural."
    ]);

    // Seção 9: Do Descumprimento e Rescisão
    addSection("9. DO DESCUMPRIMENTO E RESCISÃO", [
        `Haverá cobrança de multa em caso de descumprimento do contrato? ${dados.descumprimento === "S" ? "Sim" : "Não"}`,
        ...(dados.descumprimento === "S" ? [`O valor da multa será de R$ ${verificarValor(dados.multaDescumprimento)}.`] : []),
        "O descumprimento de qualquer cláusula poderá resultar na rescisão imediata do contrato, com restituição do imóvel ao comodante.",
        "O contrato também poderá ser rescindido por qualquer das partes mediante aviso prévio de 30 (trinta) dias."
    ]);

    // Seção 10: Da Resolução de Conflitos
    addSection("10. DA RESOLUÇÃO DE CONFLITOS", [
        `As partes comprometem-se a resolver eventuais conflitos decorrentes deste contrato de forma amigável. Caso não seja possível, fica eleito o foro da comarca de ${verificarValor(dados.comarcaEleita)}, com exclusão de qualquer outro, por mais privilegiado que seja.`
    ]);

    // Seção 11: Cláusulas Adicionais
    addSection("11. CLÁUSULAS ADICIONAIS", [
        "Confidencialidade: As partes comprometem-se a não divulgar informações relativas a este contrato a terceiros sem a prévia autorização por escrito da outra parte.",
        "Proibição de obras estruturais: O comodatário não poderá realizar qualquer obra estrutural no imóvel sem o consentimento prévio e expresso do comodante. Caso sejam necessárias intervenções estruturais, estas deverão ser previamente acordadas entre as partes.",
        "Uso exclusivo: O comodatário declara estar ciente de que o imóvel será utilizado exclusivamente para os fins acordados neste contrato, não podendo desvirtuar sua destinação sem autorização do comodante."
    ]);

    // Seção 12: Data e Local da Assinatura
    addSection("DATA E LOCAL DA ASSINATURA", [
        `Cidade: ${verificarValor(dados.cidade)}`,
        `Estado: ${verificarValor(dados.estado)}`,
        `Data: ${verificarValor(dados.dataAssinatura)}`,
        "ASSINATURAS",
        `Comodante: ____________________________ CPF: ${verificarValor(dados.cpfComodante)}`,
        `Comodatário: ___________________________ CPF: ${verificarValor(dados.cpfComodatario)}`,
        ...(dados.testemunhasNecessarias === "S"
            ? [
                `1ª Testemunha: ${verificarValor(dados.nomeTest1)} CPF: ${verificarValor(dados.cpfTest1)}`,
                "Assinatura: _________________________",

                `2ª Testemunha: ${verificarValor(dados.nomeTest2)} CPF: ${verificarValor(dados.cpfTest2)}`,
                "Assinatura: _________________________",
            ]
            : []),


        `O contrato será registrado em cartório? ${dados.registroCartorioTest === "S" ? "Sim" : "Não"}`
    ]);

    const pdfDataUri = doc.output("datauristring");
    return pdfDataUri;
};