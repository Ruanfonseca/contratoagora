import jsPDF from "jspdf";

export default function geradorParceriaRuralPago(dados: any) {
    const doc = new jsPDF();

    // Configuração inicial de fonte ABNT e margens
    doc.setFont("Times");
    const marginLeft = 30;
    const marginRight = 20;
    const marginTop = 20;
    const marginBottom = 20;
    let posY = marginTop;

    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxTextWidth = pageWidth - marginLeft - marginRight;

    // Espaçamento entre linhas 1,5
    const lineHeight = 7.5;

    // Função auxiliar para verificar espaço restante na página
    const checkPageBreak = (additionalHeight: number) => {
        if (posY + additionalHeight >= pageHeight - marginBottom) {
            doc.addPage();
            posY = marginTop;
        }
    };

    // Função auxiliar para adicionar seções formatadas segundo ABNT
    const addSection = (title: string, content: string[]) => {
        const titleHeight = 10;

        // Título da seção
        checkPageBreak(titleHeight);
        doc.setFontSize(12);
        doc.setFont("Times", "bold");
        doc.text(title, pageWidth / 2, posY, { align: "center" });
        posY += titleHeight;

        // Texto do conteúdo
        doc.setFontSize(12);
        doc.setFont("Times", "normal");
        content.forEach((line: string) => {
            const splitLines = doc.splitTextToSize(line, maxTextWidth);
            splitLines.forEach((splitLine: string) => {
                checkPageBreak(lineHeight);
                doc.text(splitLine, marginLeft, posY);
                posY += lineHeight;
            });
        });
    };

    // Função auxiliar para verificar e formatar valores
    const verificarValor = (valor: any, padrao: string = "Não informado") => {
        return valor !== undefined && valor !== null && valor !== "" ? valor : padrao;
    };

    // Cabeçalho da primeira página
    doc.setFontSize(14);
    doc.setFont("Times", "bold");
    doc.text("CONTRATO DE PARCERIA RURAL", pageWidth / 2, posY, { align: "center" });
    posY += 15;

    doc.setFontSize(12);
    doc.setFont("Times", "normal");
    const introText = "Pelo presente instrumento particular de Contrato de Parceria Rural, as partes abaixo identificadas:";
    const introLines = doc.splitTextToSize(introText, maxTextWidth);
    introLines.forEach((line: string) => {
        checkPageBreak(lineHeight);
        doc.text(line, marginLeft, posY);
        posY += lineHeight;
    });

    posY += lineHeight;

    // 1. IDENTIFICAÇÃO DAS PARTES
    const identificacaoPartes = [
        "1. IDENTIFICAÇÃO DAS PARTES",
        "",
        "OUTORGANTE (PARCEIRO CEDENTE)",
        "",
        dados.outorgante === 'fisica' ? "Se pessoa física:" : "Se pessoa jurídica:",
        ""
    ];

    if (dados.outorgante === 'fisica') {
        identificacaoPartes.push(
            `Nome completo: ${verificarValor(dados.nome)}`,
            `CPF: ${verificarValor(dados.cpf)}`,
            `Estado Civil: ${verificarValor(dados.estadoCivil)}`,
            `Nacionalidade: ${verificarValor(dados.nacionalidade)}`,
            `Profissão: ${verificarValor(dados.profissao)}`,
            `Documento de Identificação (RG ou CNH): ${verificarValor(dados.documento)}`,
            `Endereço completo: ${verificarValor(dados.endereco)}`
        );
    } else {
        identificacaoPartes.push(
            `Razão Social: ${verificarValor(dados.razaosocial)}`,
            `CNPJ: ${verificarValor(dados.cnpj)}`,
            `Endereço da sede: ${verificarValor(dados.sede)}`,
            `Representante legal: ${verificarValor(dados.nomeRepresentante)}`,
            `CPF do representante: ${verificarValor(dados.cpfRepresentante)}`,
            `Cargo do representante: ${verificarValor(dados.cargoRepresentante)}`,
            `Documento de Identificação do representante: ${verificarValor(dados.documentoRepresentante)}`,
            `Endereço do representante: ${verificarValor(dados.enderecoRepresentante)}`
        );
    }

    identificacaoPartes.push(
        "",
        "OUTORGADO (PARCEIRO EXPLORADOR)",
        "",
        dados.outorgado === 'fisica' ? "Se pessoa física:" : "Se pessoa jurídica:",
        ""
    );

    if (dados.outorgado === 'fisica') {
        identificacaoPartes.push(
            `Nome completo: ${verificarValor(dados.nomeOutorgado)}`,
            `CPF: ${verificarValor(dados.cpfOutorgado)}`,
            `Estado Civil: ${verificarValor(dados.estadoCivilOutorgado)}`,
            `Nacionalidade: ${verificarValor(dados.nacionalidadeOutorgado)}`,
            `Profissão: ${verificarValor(dados.profissaoOutorgado)}`,
            `Documento de Identificação (RG ou CNH): ${verificarValor(dados.documentoOutorgado)}`,
            `Endereço completo: ${verificarValor(dados.enderecoOutorgado)}`
        );
    } else {
        identificacaoPartes.push(
            `Razão Social: ${verificarValor(dados.razaosocialOutorgado)}`,
            `CNPJ: ${verificarValor(dados.cnpjOutorgado)}`,
            `Endereço da sede: ${verificarValor(dados.sedeOutorgado)}`,
            `Representante legal: ${verificarValor(dados.nomeRepresentanteOutorgado)}`,
            `CPF do representante: ${verificarValor(dados.cpfRepresentanteOutorgado)}`,
            `Cargo do representante: ${verificarValor(dados.cargoRepresentanteOutorgado)}`,
            `Documento de Identificação do representante: ${verificarValor(dados.documentoRepresentanteOutorgado)}`,
            `Endereço do representante: ${verificarValor(dados.enderecoRepresentanteOutorgado)}`
        );
    }

    addSection("", identificacaoPartes);

    // 2. DO OBJETO
    const objetoText = [
        "2. DO OBJETO",
        "",
        "O presente contrato tem por objeto a exploração em parceria do imóvel rural de propriedade do OUTORGANTE, mediante o compartilhamento dos resultados da atividade desenvolvida, nos termos do Estatuto da Terra.",
        "",
        "Atividade principal a ser desenvolvida:",
        dados.atividade === 'mista'
            ? `( ) Agrícola\n( ) Pecuária\n( ) Agroindustrial\n( ) Extrativa\n(X) Mista (especificar): ${verificarValor(dados.descMista)}`
            : `(${dados.atividade === 'agricola' ? 'X' : ' '}) Agrícola\n(${dados.atividade === 'pecuaria' ? 'X' : ' '}) Pecuária\n(${dados.atividade === 'agroindustrial' ? 'X' : ' '}) Agroindustrial\n(${dados.atividade === 'extrativa' ? 'X' : ' '}) Extrativa\n( ) Mista (especificar):`,
        "",
        "Descrição detalhada do imóvel rural:",
        "",
        `Localização: ${verificarValor(dados.localizacao)}`,
        `Tamanho (em hectares): ${verificarValor(dados.tamanho)} ha`,
        `Certificado de Cadastro de Imóvel Rural (CCIR): ${dados.ccir === 'S' ? 'Sim' : 'Não'}`,
        dados.ccir === 'S' ? `Nº do CCIR: ${verificarValor(dados.numeroCCIR)}` : "",
        `Registro de Imóveis: Cartório: ${verificarValor(dados.registroCartorio)}`,
        `Matrícula nº: ${verificarValor(dados.matricula)}`,
        "",
        "Descrição dos bens cedidos:",
        dados.descBens === 'outros'
            ? `( ) Máquinas\n( ) Ferramentas\n( ) Animais\n( ) Insumos\n(X) Outras benfeitorias: ${verificarValor(dados.benfeitorias)}`
            : `(${dados.descBens === 'maquinas' ? 'X' : ' '}) Máquinas\n(${dados.descBens === 'ferramentas' ? 'X' : ' '}) Ferramentas\n(${dados.descBens === 'animais' ? 'X' : ' '}) Animais\n(${dados.descBens === 'insumos' ? 'X' : ' '}) Insumos\n( ) Outras benfeitorias:`
    ];

    addSection("", objetoText);

    // 3. DAS ATIVIDADES RURAIS
    const atividadesRurais = [
        "3. DAS ATIVIDADES RURAIS",
        "",
        "O OUTORGADO poderá utilizar:",
        dados.atividadeRural === 'parteImovel'
            ? `( ) Todo o imóvel\n(X) Parte do imóvel - especificar área: ${verificarValor(dados.descPartImovel)}`
            : `(X) Todo o imóvel\n( ) Parte do imóvel - especificar área:`,
        "",
        "Atividades a serem realizadas:",
        "",
        "O OUTORGADO contribuirá com:",
        dados.contribuicaoOutorgado === 'outrasFormas'
            ? `( ) Somente com mão de obra\n( ) Mão de obra + equipamentos/máquinas\n( ) Insumos (sementes, fertilizantes etc.)\n(X) Outras formas de contribuição: ${verificarValor(dados.descOutrasFormas)}`
            : `(${dados.contribuicaoOutorgado === 'maoObra' ? 'X' : ' '}) Somente com mão de obra\n(${dados.contribuicaoOutorgado === 'equipMaquina' ? 'X' : ' '}) Mão de obra + equipamentos/máquinas\n(${dados.contribuicaoOutorgado === 'insumos' ? 'X' : ' '}) Insumos (sementes, fertilizantes etc.)\n( ) Outras formas de contribuição:`
    ];

    addSection("", atividadesRurais);

    // 4. DA PARTILHA DOS RESULTADOS
    const partilhaResultados = [
        "4. DA PARTILHA DOS RESULTADOS",
        "",
        "As partes acordam que os frutos da produção rural serão partilhados da seguinte forma:",
        "",
        `OUTORGANTE: ${verificarValor(dados.resultOutorgante)}%`,
        `OUTORGADO: ${verificarValor(dados.resultOutorgado)}%`,
        "",
        `O OUTORGANTE deverá ser informado com antecedência mínima de ${verificarValor(dados.qtdDias)} dias sobre a data de início da colheita ou da partilha da produção.`
    ];

    addSection("", partilhaResultados);

    // 5. DAS DESPESAS E ENCARGOS
    const despesasEncargos = [
        "5. DAS DESPESAS E ENCARGOS",
        "",
        "Responsabilidade pelas despesas:",
        "",
        `Cuidados da terra: ${verificarValor(dados.cuidados)}`,
        `Manutenção de máquinas e equipamentos: ${verificarValor(dados.manutencao)}`,
        `Insumos e materiais de produção: ${verificarValor(dados.insumos)}`,
        `Animais: ${verificarValor(dados.animais)}`,
        `Impostos, taxas e tributos: ${verificarValor(dados.impostos)}`
    ];

    addSection("", despesasEncargos);

    // 6. DA SUBPARCERIA
    const subparceria = [
        "6. DA SUBPARCERIA",
        "",
        "Será permitida a subparceria ou contratação de terceiros pelo OUTORGADO?",
        dados.subparceria === 'S'
            ? "(X) Sim, com autorização expressa do OUTORGANTE\n( ) Não, é vedada a subparceria"
            : "( ) Sim, com autorização expressa do OUTORGANTE\n(X) Não, é vedada a subparceria"
    ];

    addSection("", subparceria);

    // 7. DO PRAZO
    const prazo = [
        "7. DO PRAZO",
        "",
        `Este contrato vigorará por prazo determinado de ${verificarValor(dados.prazoDeterminado)} anos, iniciando-se em ${verificarValor(dados.diaInicio)} e encerrando-se em ${verificarValor(dados.diaFim)}.`,
        "",
        "Prorrogável automaticamente por igual período, salvo manifestação em contrário."
    ];

    addSection("", prazo);

    // 8. DA RESCISÃO
    const rescisao = [
        "8. DA RESCISÃO",
        "",
        "O presente contrato poderá ser rescindido:",
        "",
        "- Por mútuo acordo entre as partes;",
        "- Por descumprimento de cláusulas contratuais;",
        "- Por caso fortuito ou força maior, devidamente comprovado.",
        "",
        `Multa por descumprimento: ${verificarValor(dados.multaDescumprimento)}`,
        `Prazo de aviso prévio: ${verificarValor(dados.avisoPrevio)} dias.`
    ];

    addSection("", rescisao);

    // 9. DO DIREITO DE PREFERÊNCIA
    const preferencia = [
        "9. DO DIREITO DE PREFERÊNCIA",
        "",
        "Em caso de alienação do imóvel objeto desta parceria, o OUTORGADO terá direito de preferência na aquisição, nos termos da legislação aplicável, devendo ser notificado por escrito sobre as condições da venda, com prazo de 30 dias para manifestação."
    ];

    addSection("", preferencia);

    // 10. DAS OBRIGAÇÕES DAS PARTES
    const obrigacoes = [
        "10. DAS OBRIGAÇÕES DAS PARTES",
        "",
        "Obrigações do OUTORGANTE:",
        "",
        "- Garantir o uso pacífico do imóvel;",
        "- Entregar o imóvel e bens em condições adequadas;",
        "- Fornecer suporte técnico (se pactuado).",
        "",
        "Obrigações do OUTORGADO:",
        "",
        "- Utilizar o imóvel conforme sua destinação;",
        "- Zelar pela conservação do imóvel e dos bens;",
        "- Cumprir as obrigações legais e ambientais."
    ];

    addSection("", obrigacoes);

    // 11. DO FORO
    const foro = [
        "11. DO FORO",
        "",
        `Fica eleito o foro da Comarca de ${verificarValor(dados.comarca)}, Estado de ${verificarValor(dados.estado)}, para dirimir quaisquer dúvidas oriundas deste contrato, com renúncia expressa de qualquer outro, por mais privilegiado que seja.`
    ];

    addSection("", foro);

    // Rodapé com assinaturas
    const assinaturas = [
        "",
        "E por estarem de pleno acordo, firmam o presente contrato em duas vias de igual teor e forma, juntamente com as testemunhas abaixo.",
        "",
        `Local: ${verificarValor(dados.local)}`,
        `Data: ${verificarValor(dados.data)}`,
        "",
        "",
        "OUTORGANTE",
        "Assinatura: __________________________",
        "",
        "",
        "OUTORGADO",
        "Assinatura: __________________________",
        "",
        "",
        "1ª Testemunha",
        "Nome: ___________________________________",
        "CPF: ____________________________________",
        "Assinatura: _______________________________",
        "",
        "2ª Testemunha",
        "Nome: ___________________________________",
        "CPF: ____________________________________",
        "Assinatura: _______________________________"
    ];

    // Salvar o PDF
    doc.save(`contrato_parceriarural.pdf`);

};