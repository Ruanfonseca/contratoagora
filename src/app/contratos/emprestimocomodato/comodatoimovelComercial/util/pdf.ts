import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function geradorComodatoImovelCPAGO(dados: any) {
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
    doc.text("Contrato de Comodato de Imóvel Comercial", 105, posY, { align: "center" });
    posY += 15;

    // 1. Identificação das Partes
    addSection("1. Identificação das Partes", [
        "Comodante (Pessoa que empresta o imóvel)",
        dados.pessoaComodante === 'fisica' ? "Pessoa Física:" : "Pessoa Jurídica:",
        ...(dados.pessoaComodante === 'fisica' ? [
            `Nome completo: ${verificarValor(dados.nomeCompletoComodante)}`,
            `CPF: ${verificarValor(dados.cpfComodante)}`,
            `Endereço: ${verificarValor(dados.enderecoComodante)}`,
            `Telefone: ${verificarValor(dados.telefoneComodante)}`,
            `Documento de identificação: ${verificarValor(dados.documentoIdentificacaoComodante)}`,
            `Número do documento: ${verificarValor(dados.numeroDocComodante)}`,
            `Estado civil: ${verificarValor(dados.estadoCivilComodante)}`,
            `Profissão: ${verificarValor(dados.profissaoComodante)}`
        ] : [
            `Razão Social: ${verificarValor(dados.razaoSocial)}`,
            `CNPJ: ${verificarValor(dados.cnpj)}`,
            `Endereço: ${verificarValor(dados.endereco)}`,
            `Telefone: ${verificarValor(dados.telefone)}`,
            `Nome do Representante legal: ${verificarValor(dados.representanteNome)}`,
            `Cargo do representante: ${verificarValor(dados.cargoRepresentante)}`,
            `Documento de identificação do representante: ${verificarValor(dados.documentoIdentifica)}`,
            `Número do documento: ${verificarValor(dados.numeroDoc)}`
        ]),
        "Comodatário (Pessoa que recebe o imóvel emprestado)",
        dados.pessoaComodatario === 'fisica' ? "Pessoa Física:" : "Pessoa Jurídica:",
        ...(dados.pessoaComodatario === 'fisica' ? [
            `Nome completo: ${verificarValor(dados.nomeCompletoComodatario)}`,
            `CPF: ${verificarValor(dados.cpfComodatario)}`,
            `Endereço: ${verificarValor(dados.enderecoComodatario)}`,
            `Telefone: ${verificarValor(dados.telefoneComodatario)}`,
            `Documento de identificação: ${verificarValor(dados.documentoIdentificacaoComodatario)}`,
            `Estado civil: ${verificarValor(dados.estadoCivilComodatario)}`,
            `Nacionalidade: ${verificarValor(dados.nacionalidadeComodatario)}`,
            `Profissão: ${verificarValor(dados.profissaoComodatario)}`
        ] : [
            `Razão Social: ${verificarValor(dados.razaoSocialComodatario)}`,
            `CNPJ: ${verificarValor(dados.cnpjComodatario)}`,
            `Endereço: ${verificarValor(dados.enderecoComodatarioPj)}`,
            `Telefone: ${verificarValor(dados.telefoneComodatarioPj)}`,
            `Representante legal: ${verificarValor(dados.representanteNomeComodatario)}`,
            `Cargo do representante: ${verificarValor(dados.cargoRepresentanteComodatario)}`,
            `Documento de identificação do representante: ${verificarValor(dados.documentoIdentificaComodatario)}`
        ])
    ]);

    // 2. Objeto do Contrato
    addSection("2. Objeto do Contrato", [
        `Endereço completo do imóvel cedido: ${verificarValor(dados.enderecoImovel)}`,
        `Descrição detalhada do imóvel: ${verificarValor(dados.descricaoDetalhada)}`
    ]);

    // 3. Destinação do Imóvel
    addSection("3. Destinação do Imóvel", [
        `O imóvel poderá ser utilizado: ${dados.utilizacaoImovel === 'livre' ? 'Livremente' : `Apenas para a finalidade específica: ${verificarValor(dados.finalidade)}`}`,
        "O comodatário compromete-se a utilizar o imóvel de forma adequada, preservando sua integridade e manutenção."
    ]);

    // 4. Direitos e Deveres das Partes
    addSection("4. Direitos e Deveres das Partes", [
        "4.1 Direitos e Deveres do Comodante",
        "Direitos:",
        "- Receber o imóvel de volta ao término do contrato, nas condições acordadas.",
        "- Exigir o cumprimento das obrigações estabelecidas no contrato.",
        "- Fiscalizar o uso do imóvel pelo comodatário para garantir que esteja de acordo com as cláusulas contratuais.",
        "- Requerer a restituição antecipada do imóvel em caso de descumprimento das cláusulas acordadas.",
        "Deveres:",
        "- Entregar o imóvel em boas condições de uso, salvo estipulação diversa.",
        "- Fornecer ao comodatário a posse tranquila do imóvel durante o prazo do contrato.",
        "- Respeitar os direitos do comodatário, desde que este cumpra suas obrigações contratuais.",
        "4.2 Direitos e Deveres do Comodatário",
        "Direitos:",
        "- Utilizar o imóvel conforme acordado durante o período de vigência do contrato.",
        "- Permanecer no imóvel durante o prazo estipulado, salvo em caso de rescisão justificada.",
        "- Ser previamente comunicado sobre qualquer mudança nas condições do comodato.",
        "Deveres:",
        "- Utilizar o imóvel exclusivamente para os fins estabelecidos no contrato.",
        "- Preservar e manter o imóvel em boas condições, arcando com reparos e manutenções necessárias.",
        "- Não realizar modificações estruturais sem autorização prévia do comodante.",
        "- Não ceder, sublocar ou emprestar o imóvel sem a permissão expressa do comodante.",
        "- Restituir o imóvel ao término do contrato, nas mesmas condições em que o recebeu, salvo desgaste natural pelo uso.",
        "- Cumprir com todas as obrigações financeiras assumidas no contrato."
    ]);

    // 5. Taxas, Tributos e Despesas
    addSection("5. Taxas, Tributos e Despesas", [
        `O pagamento dos impostos, taxas e tributos incidentes sobre o imóvel será de responsabilidade de: ${dados.pagamentoImpostos === 'comodante' ? 'Comodante' : 'Comodatário'}`,
        `O imóvel possui taxa de condomínio? ${dados.imoveltxcondominio === 'S' ? `Sim (Quem será responsável pelo pagamento?): ${verificarValor(dados.responsavelPag)}` : 'Não'}`,
        `As despesas com manutenção, energia elétrica, água e outras contas serão arcadas por: ${dados.despesas === 'comodante' ? 'Comodante' : 'Comodatário'}`
    ]);

    // 6. Prazo e Vigência
    addSection("6. Prazo e Vigência", [
        `Data de início do comodato: ${verificarValor(dados.dataInicio)}`,
        `O contrato terá prazo determinado? ${dados.contratoPrazo === 'S' ? `Sim, por ${verificarValor(dados.quantosMeses)} meses.` : 'Não, sendo por prazo indeterminado.'}`,
        `O contrato poderá ser rescindido antes do prazo? ${dados.rescindido === 'S' ? `Sim, mediante aviso prévio de ${verificarValor(dados.avisoPrevio)} dias.` : 'Não'}`
    ]);

    // 7. Proibição de Sublocação e Cessão
    addSection("7. Proibição de Sublocação e Cessão", [
        `O comodatário poderá emprestar, ceder ou alugar o imóvel para terceiros? ${dados.emprestimo === 'S' ? 'Sim' : 'Não'}`
    ]);

    // 8. Benfeitorias e Obras
    addSection("8. Benfeitorias e Obras", [
        `O comodatário poderá realizar benfeitorias no imóvel? ${dados.benfeitorias === 'S' ? 'Sim, desde que previamente autorizadas pelo comodante.' : 'Não'}`,
        `Responsabilidades:`,
        `Necessárias: ${verificarValor(dados.responsaNecessarias)}`,
        `Úteis: ${verificarValor(dados.responsaUteis)}`,
        `Voluptuárias: ${verificarValor(dados.responsaVoluptuarias)}`
    ]);

    // 9. Rescisão e Penalidades
    addSection("9. Rescisão e Penalidades", [
        `O contrato poderá ser rescindido: ${dados.poderaRescidir === 'qualquer' ? 'A qualquer momento, por qualquer uma das partes, mediante aviso prévio de ${verificarValor(dados.avisoPrevioDias)} dias.' : 'Somente em casos de descumprimento contratual.'}`,
        `Em caso de descumprimento, haverá multa? ${dados.multaDescumprimento === 'S' ? `Sim, no valor de R$ ${verificarValor(dados.valorDescumprimento)}` : 'Não'}`,
        "O imóvel deverá ser devolvido nas mesmas condições em que foi recebido, salvo desgaste natural pelo uso."
    ]);

    // 10. Confidencialidade e Sigilo
    addSection("10. Confidencialidade e Sigilo", [
        "As partes comprometem-se a manter confidenciais quaisquer informações obtidas em razão deste contrato, salvo em casos exigidos por lei."
    ]);

    // 11. Foro e Resolução de Disputas
    addSection("11. Foro e Resolução de Disputas", [
        `Registro em Cartório: ${dados.registroCartorioTest === 'S' ? 'Sim' : 'Não'}`,
        `Data de Assinatura: ${verificarValor(dados.dataAssinatura)}`,
        `Necessidade de Testemunhas: ${dados.testemunhasNecessarias === 'S' ? 'Sim' : 'Não'}`,
        ...(dados.testemunhasNecessarias === 'S' ? [
            `1ª Testemunha: ${verificarValor(dados.nomeTest1)}`,
            `CPF: ${verificarValor(dados.cpfTest1)}`,
            `2ª Testemunha: ${verificarValor(dados.nomeTest2)}`,
            `CPF: ${verificarValor(dados.cpfTest2)}`
        ] : []),
        `Local de Assinatura: ${verificarValor(dados.local)}`,
        `Foro e Resolução de Disputas: O foro eleito para resolver quaisquer questões relativas a este contrato será o da Comarca de ${verificarValor(dados.foroResolucaoConflitos)}, Estado de ${verificarValor(dados.estado)}.`,
        "Em caso de litígio, as partes poderão optar pela mediação ou arbitragem antes de recorrer ao Poder Judiciário."
    ]);

    // 12. Assinaturas e Testemunhas
    addSection("12. Assinaturas e Testemunhas", [
        "Comodante:",
        `Nome: ${verificarValor(dados.pessoaComodante === 'fisica' ? dados.nomeCompletoComodante : dados.razaoSocial)}`,
        `CPF/CNPJ: ${verificarValor(dados.pessoaComodante === 'fisica' ? dados.cpfComodante : dados.cnpj)}`,
        "Assinatura: _________________________",
        "",
        "Comodatário:",
        `Nome: ${verificarValor(dados.pessoaComodatario === 'fisica' ? dados.nomeCompletoComodatario : dados.razaoSocialComodatario)}`,
        `CPF/CNPJ: ${verificarValor(dados.pessoaComodatario === 'fisica' ? dados.cpfComodatario : dados.cnpjComodatario)}`,
        "Assinatura: _________________________",
        ...(dados.testemunhasNecessarias === 'S' ? [
            "",
            "Testemunhas:",
            `1ª Testemunha: ${verificarValor(dados.nomeTest1)}`,
            `CPF: ${verificarValor(dados.cpfTest1)}`,
            "Assinatura: _________________________",
            "",
            `2ª Testemunha: ${verificarValor(dados.nomeTest2)}`,
            `CPF: ${verificarValor(dados.cpfTest2)}`,
            "Assinatura: _________________________"
        ] : [])
    ]);
    doc.save(`contrato_ComodatoImovelComercial.pdf`);

};