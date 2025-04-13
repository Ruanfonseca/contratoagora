import { extenso, verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function geradorArredamentoPago(dados: any) {
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



    // Cabeçalho da primeira página
    doc.setFontSize(14);
    doc.setFont("Times", "bold");
    doc.text("CONTRATO DE ARRENDAMENTO DE IMÓVEL RURAL", pageWidth / 2, posY, { align: "center" });
    posY += 15;

    doc.setFontSize(12);
    doc.setFont("Times", "normal");
    const introText = "Lei Federal nº 4.504 e pelo Decreto nº. 59.566.";
    const introLines = doc.splitTextToSize(introText, maxTextWidth);
    introLines.forEach((line: string) => {
        checkPageBreak(lineHeight);
        doc.text(line, marginLeft, posY);
        posY += lineHeight;
    });

    posY += lineHeight * 2; // Espaçamento adicional

    // Seção ARRENDADORA
    const arrendadoraContent = [
        "Entre:",
        "",
        "ARRENDADORA:",
        dados.arrendadoraPessoa === 'fisica' ?
            `(X) Pessoa Física: ${verificarValor(dados.nome)}, ${verificarValor(dados.estadoCivil)}, nacionalidade: ${verificarValor(dados.nacionalidade)}, profissão: ${verificarValor(dados.profissao)}, carteira de identidade n.º ${verificarValor(dados.numeroCarteira)}, CPF n.º ${verificarValor(dados.cpf)}, residente em: ${verificarValor(dados.endereco)}.` :
            `(X) Pessoa Jurídica: Razão Social: ${verificarValor(dados.razaoSocial)}, CNPJ nº ${verificarValor(dados.cnpj)}, com sede em ${verificarValor(dados.sede)}, neste ato representada por seu representante legal ${verificarValor(dados.nomeRepresentante)}, nacionalidade: ${verificarValor(dados.nacionalidadeRepresentante)}, estado civil: ${verificarValor(dados.estadoCivilRepresentante)}, profissão: ${verificarValor(dados.profissaoRepresentante)}, portador da cédula de identidade nº ${verificarValor(dados.identidadeRepresentante)} e CPF nº ${verificarValor(dados.cpfRepresentante)}.`,
        "",
        "doravante denominada ARRENDADORA."
    ];
    addSection("", arrendadoraContent);

    posY += lineHeight;

    // Seção ARRENDATÁRIA
    const arrendatariaContent = [
        "E:",
        "",
        "ARRENDATÁRIA:",
        dados.arrendatariaPessoa === 'fisica' ?
            `(X) Pessoa Física: ${verificarValor(dados.nomeArrendataria)}, ${verificarValor(dados.estadoCivilArrendataria)}, nacionalidade: ${verificarValor(dados.nacionalidadeArrendataria)}, profissão: ${verificarValor(dados.profissaoArrendataria)}, carteira de identidade n.º ${verificarValor(dados.numeroCarteiraArrendataria)}, CPF n.º ${verificarValor(dados.cpfArrendataria)}, residente em: ${verificarValor(dados.enderecoArrendataria)}.` :
            `(X) Pessoa Jurídica: Razão Social: ${verificarValor(dados.razaoSocialArrendataria)}, CNPJ nº ${verificarValor(dados.cnpjArrendataria)}, com sede em ${verificarValor(dados.sedeArrendataria)}, neste ato representada por seu representante legal ${verificarValor(dados.nomeRepresentanteArrendataria)}, nacionalidade: ${verificarValor(dados.nacionalidadeRepresentanteArrendataria)}, estado civil: ${verificarValor(dados.estadoCivilRepresentanteArrendataria)}, profissão: ${verificarValor(dados.profissaoRepresentanteArrendataria)}, portador da cédula de identidade nº ${verificarValor(dados.identidadeRepresentanteArrendataria)} e CPF nº ${verificarValor(dados.cpfRepresentanteArrendataria)}.`,
        "",
        "doravante denominada ARRENDATÁRIA."
    ];
    addSection("", arrendatariaContent);

    posY += lineHeight * 2;

    // Texto introdutório
    const introContrato = [
        "As partes acima identificadas têm entre si justo e acertado o presente contrato de arrendamento rural, ficando desde já aceito nas cláusulas e condições abaixo descritas."
    ];
    addSection("", introContrato);

    posY += lineHeight * 2;

    // CLÁUSULA 1ª – DO OBJETO
    const objetoContent = [
        `A ARRENDADORA e a ARRENDATÁRIA acima qualificadas, firmam entre si, o presente contrato de arrendamento do imóvel rural cadastrado no INCRA conforme Certificado de Cadastro de Imóvel Rural (CCIR) nº ${verificarValor(dados.ccir)}, situado em:`,
        "",
        verificarValor(dados.enderecoObjeto),
        "",
        "e com os seguintes limites e confrontações:",
        "",
        verificarValor(dados.limitesConfrontacoes),
        "",
        `§ 1º. Por meio deste instrumento contratual, será cedida à ARRENDATÁRIA a área total do imóvel rural, totalizada em ${verificarValor(dados.area)} hectares.`,
        "§ 2º. O presente contrato é acompanhado de um laudo de vistoria, que descreve o imóvel rural e o seu estado de conservação no momento em que o mesmo foi entregue à ARRENDATÁRIA.",
        `§ 3º. O imóvel rural objeto deste contrato deverá ser utilizado pela ARRENDATÁRIA ou seus familiares para atividades de ${verificarValor(dados.atividades)}, mais especificamente para:`,
        "",
        verificarValor(dados.espec),
        "",
        "§ 4º. Não será permitida, em hipótese alguma, a mudança de uso e destinação do imóvel rural, sem prévio e expresso consentimento de propriedade da ARRENDADORA.",
        "§ 5º. Qualquer financiamento que a ARRENDATÁRIA faça perante particulares ou instituições financeiras, para custear as fases do plantio, serão de sua inteira responsabilidade, ficando vedado oferecer em garantia as terras arrendadas e seus acessórios."
    ];
    addSection("CLÁUSULA 1ª – DO OBJETO", objetoContent);

    // CLÁUSULA 2ª – DO USO DA TERRA
    const usoContent = [
        "A ARRENDATÁRIA se obriga e usar terra de conformidade com as normas técnicas, de modo a impedir a erosão do solo, empregando materiais e insumos que não degradem sua qualidade, observando as normas de segurança estabelecidas para o uso de agrotóxicos e aquelas destinadas ao controle de pragas, arcando com as penalizações impostas pelas autoridades competentes por descumprimento de tais normas.",
        "",
        "§ 1º. Obriga-se a ARRENDATÁRIA a observar as normas ambientais, preservando os recursos naturais da propriedade arrendada, as áreas de Preservação Permanente e de Reserva Legal, vedada a utilização destas últimas mesmo mediante manejo sustentado.",
        "§ 2º. Para a prática de qualquer atividade que demande prévio licenciamento ambiental, fica a ARRENDATÁRIA obrigado à obtenção dele, arcando com as cominações legais em caso de omissão.",
        "§ 3º. São por conta da ARRENDATÁRIA os materiais, sementes, insumos e tudo o mais que for necessário para o cultivo ou exploração da propriedade."
    ];
    addSection("CLÁUSULA 2ª – DO USO DA TERRA", usoContent);

    // CLÁUSULA 3ª – DA TRANSFERÊNCIA DOS DIREITOS DE USO DO IMÓVEL RURAL
    const transferenciaContent = [
        "Fica permitida à ARRENDATÁRIA subarrendar, ceder, ou emprestar do imóvel rural, que ora lhe foi locado, a terceiros, desde que se mantenha a sua utilização descrita neste instrumento."
    ];
    addSection("CLÁUSULA 3ª – DA TRANSFERÊNCIA DOS DIREITOS DE USO DO IMÓVEL RURAL", transferenciaContent);

    // CLÁUSULA 4ª – DO VALOR DO ARRENDAMENTO
    const valorContent = [
        `O valor mensal do arrendamento, livremente ajustado pelas partes, é de R$ ${verificarValor(dados.valorMensal)} (${dados.valorMensal ? extenso(parseFloat(dados.valorMensal)) : "zero reais"}).`,
        "",
        `§ 1º. O pagamento do referido arrendamento terá vencimento todo dia ${verificarValor(dados.diaPag)} de cada mês vencido.`,
        "§ 2º. O pagamento do referido arrendamento será efetuado em cheque, entregue para a ARRENDADORA ou para terceiro previamente especificado por ela.",
        "§ 3º. Durante a vigência deste contrato, assim como em uma eventual prorrogação, ficará a encargo da ARRENDATÁRIA o pagamento da totalidade das contas de consumo e uso de energia, gás, água e esgoto que venham a incidir sobre o imóvel rural por ora arrendado, sendo inclusive responsável por eventuais multas e infrações que venha dar causa.",
        "§ 4º. As partes também acordam, que ficará a encargo da ARRENDADORA o pagamento da totalidade do Imposto sobre a Propriedade Territorial Rural (ITR), assim como outros impostos, taxas e tributos que incidam sobre o imóvel rural ora arrendado.",
        "§ 5º. Caso a ARRENDATÁRIA não efetue o pagamento do arrendamento até a data firmada neste contrato, ficará obrigada a pagar multa de 0% (zero por cento) sobre o valor devido, bem como juros de mora de 1% (um por cento) ao mês, mais correção monetária apurada conforme variação do IGP-M no período."
    ];
    addSection("CLÁUSULA 4ª – DO VALOR DO ARRENDAMENTO", valorContent);

    // CLÁUSULA 5ª – DO PRAZO DO ARRENDAMENTO
    const prazoContent = [
        `O presente contrato de arrendamento tem prazo indeterminado, com início em ${verificarValor(dados.dataInicio)}.`,
        "",
        "§ 1º. O prazo mínimo para a vigência deste contrato de arrendamento de imóvel rural é de três anos, ficando as partes impedidas de rescindir em prazo inferior.",
        "§ 2º. Caso a ARRENDATÁRIA queira iniciar qualquer cultura cujos frutos não possam ser recolhidos antes de terminado o prazo de arrendamento, deverá ajustar, previamente, com a ARRENDADORA a forma de pagamento do uso da terra por esse prazo excedente."
    ];
    addSection("CLÁUSULA 5ª – DO PRAZO DO ARRENDAMENTO", prazoContent);

    // CLÁUSULA 6ª – DOS DEVERES DA ARRENDATÁRIA
    const deveresArrendatariaContent = [
        "Sem prejuízo de outras disposições deste contrato, constituem deveres da ARRENDATÁRIA:",
        "",
        "I – pagar pontualmente o preço do arrendamento, pelo modo e prazos definidos neste instrumento;",
        "II – utilizar o imóvel rural conforme o convencionado, ou presumido, e a tratá-lo com o mesmo cuidado como se fosse seu, não podendo mudar sua destinação contratual;",
        "III – levar ao conhecimento da ARRENDADORA, imediatamente, qualquer ameaça ou ato de contestação à posse ou direito de posse, ou qualquer ato em que o possuidor seja privado da posse, e ainda, de qualquer fato do qual resulte a necessidade da execução de obras e reparos indispensáveis à garantia do uso do imóvel rural;",
        "IV – fazer as benfeitorias úteis e necessárias ao imóvel rural, durante a vigência do contrato, salvo convenção em contrário;",
        "V – devolver o imóvel rural, ao término do contrato, tal como o recebeu, salvo as deteriorações naturais ao uso regular;",
        "VI – responder por qualquer prejuízo resultante do uso predatório, culposo ou doloso, quer em relação à área cultivada, quer em relação às benfeitorias, equipamentos, máquinas, instrumentos de trabalho e quaisquer outros bens a ele cedidos pela ARRENDADORA;",
        "VII – respeitar os direitos e vantagens estabelecidas no Estatuto da Terra e em seu regulamento;",
        "VIII – permitir à ARRENDADORA ou seu mandatário o direito de realizar vistoria do imóvel rural mediante combinação prévia de dia e hora."
    ];
    addSection("CLÁUSULA 6ª – DOS DEVERES DA ARRENDATÁRIA", deveresArrendatariaContent);

    // CLÁUSULA 7ª – DOS DEVERES DA ARRENDADORA
    const deveresArrendadoraContent = [
        "Sem prejuízo de outras disposições deste contrato, constituem deveres da ARRENDADORA:",
        "",
        "I – Entregar o imóvel rural, com suas pertenças, em condições adequadas para o uso a que se destina;",
        "II – Garantir à ARRENDATÁRIA o uso pacífico do imóvel rural arrendado durante toda a vigência deste contrato;",
        "III – Respeitar os termos acordados neste contrato;",
        "IV – Comunicar previamente qualquer alteração que possa afetar os direitos da ARRENDATÁRIA;",
        "V – Fica vedado à ARRENDADORA exigir da ARRENDATÁRIA:",
        "   a) Prestação de serviços gratuitos;",
        "   b) Exclusividade na venda da colheita;",
        "   c) Obrigatoriedade do beneficiamento da produção em seu estabelecimento;",
        "   d) Obrigatoriedade de aquisição de gêneros e utilidades em seus armazéns ou barracões;",
        "   e) Aceitação de pagamento em 'ordens', 'vales', 'borós' ou quaisquer outras formas regionais substitutivas da moeda corrente."
    ];
    addSection("CLÁUSULA 7ª – DOS DEVERES DA ARRENDADORA", deveresArrendadoraContent);

    // CLÁUSULA 8ª – DAS BENFEITORIAS NECESSÁRIAS, ÚTEIS E VOLUPTUÁRIAS
    const benfeitoriasContent = [
        "As benfeitorias necessárias terão o direito de retenção ou indenização, desde que antecipadamente submetidas à autorização e aceite expresso da ARRENDADORA.",
        "",
        "§ 1º. As benfeitorias úteis terão direito a retenção ou indenização, desde que antecipadamente submetidas à autorização e aceite expresso da ARRENDADORA.",
        "§ 2º. As benfeitorias voluptuárias não terão o direito de retenção ou indenização, restando à ARRENDATÁRIA no fim do arrendamento, modificar o imóvel rural para retornar à maneira que lhe foi entregue."
    ];
    addSection("CLÁUSULA 8ª – DAS BENFEITORIAS NECESSÁRIAS, ÚTEIS E VOLUPTUÁRIAS", benfeitoriasContent);

    // CLÁUSULA 9ª – DO DIREITO DE PREFERÊNCIA
    const preferenciaContent = [
        "No caso de alienação do imóvel arrendado, a ARRENDATÁRIA terá preferência para adquiri-lo em igualdade de condições. Para tanto, a ARRENDADORA deverá notificá-la formalmente sobre a intenção de venda, possibilitando o exercício do direito de preferência no prazo de 30 (trinta) dias, contados da data da notificação judicial ou de outra comunicação válida, desde que devidamente comprovada por recibo.",
        "",
        "§ 1º. A comunicação mencionada no caput deverá conter todas as condições do negócio, especialmente o preço, a forma de pagamento, a existência de ônus reais, bem como o local e o horário em que a documentação pertinente poderá ser examinada.",
        "§ 2º. Recebida a comunicação de venda por parte da ARRENDADORA, a ARRENDATÁRIA deverá manifestar-se no prazo de 30 (trinta) dias, a contar da data da comunicação.",
        "§ 3º. Caso a ARRENDADORA não comunique a venda do imóvel rural, a ARRENDATÁRIA poderá, no prazo de 6 (seis) meses, contados da transcrição do ato de alienação no Registro de Imóveis, depositar o valor correspondente ao preço da venda e requerer judicialmente a adjudicação do imóvel em seu favor."
    ];
    addSection("CLÁUSULA 9ª – DO DIREITO DE PREFERÊNCIA", preferenciaContent);

    // CLÁUSULA 10ª – DA EXTINÇÃO DO CONTRATO
    const extincaoContent = [
        "Ocorrerá a extinção do presente contrato quando:",
        "",
        "I – ocorrer o término do prazo do contrato e de sua renovação;",
        "II – ocorrer a retomada do imóvel rural pela ARRENDADORA;",
        "III – caso ocorra a aquisição da gleba arrendada, pela ARRENDATÁRIA;",
        "IV – se houver distrato ou rescisão do contrato;",
        "V – ocorrendo resolução ou extinção do direito da ARRENDADORA;",
        "VI – por motivo de força maior, que impossibilite a execução do contrato;",
        "VII – por sentença judicial irrecorrível;",
        "VIII – pela perda do imóvel rural;",
        "IX – pela desapropriação, parcial ou total, do imóvel rural;",
        "X – por qualquer outra causa prevista em lei."
    ];
    addSection("CLÁUSULA 10ª – DA EXTINÇÃO DO CONTRATO", extincaoContent);

    // CLÁUSULA 11ª – DA RESCISÃO
    const rescisaoContent = [
        "O presente instrumento ser rescindido, sem gerar direito a indenização ou qualquer ônus para a ARRENDADORA, caso o imóvel rural seja utilizado de forma diversa da estabelecida neste instrumento."
    ];
    addSection("CLÁUSULA 11ª – DA RESCISÃO", rescisaoContent);

    // CLÁUSULA 12ª – DO DESCUMPRIMENTO
    const descumprimentoContent = [
        "Caso ocorra o descumprimento de uma ou mais cláusulas deste contrato por qualquer das partes, tal descumprimento poderá levar à rescisão imediata do contrato.",
        "",
        "Parágrafo único. Qualquer eventual tolerância ou concessão entre as partes em relação ao descumprimento de qualquer cláusula deste contrato não implicará alteração ou modificação das cláusulas contratuais."
    ];
    addSection("CLÁUSULA 12ª – DO DESCUMPRIMENTO", descumprimentoContent);

    // CLÁUSULA 13ª – DO FORO
    const foroContent = [
        `Fica desde já eleito o foro da comarca de ${verificarValor(dados.cidade)} para serem resolvidas eventuais pendências decorrentes deste contrato.`
    ];
    addSection("CLÁUSULA 13ª – DO FORO", foroContent);

    // Rodapé com assinaturas
    posY += lineHeight * 2;
    const assinaturasContent = [
        "Por estarem assim certos e ajustados, firmam os signatários este instrumento em 02 (duas) vias de igual teor e forma.",
        "",
        "",
        `${verificarValor(dados.cidade)}, ${new Date().toLocaleDateString('pt-BR')}.`,
        "",
        "",
        "___________________________________",
        `ARRENDADORA: ${dados.arrendadoraPessoa === 'fisica' ? verificarValor(dados.nome) : verificarValor(dados.razaoSocial)}`,
        "",
        "",
        "___________________________________",
        `ARRENDATÁRIA: ${dados.arrendatariaPessoa === 'fisica' ? verificarValor(dados.nomeArrendataria) : verificarValor(dados.razaoSocialArrendataria)}`
    ];
    addSection("", assinaturasContent);

    // Salvar o PDF
    doc.save(`Contrato_Arrendamento.pdf`);

};