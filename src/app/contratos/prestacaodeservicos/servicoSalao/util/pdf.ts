import { verificarValor } from "@/lib/utils";
import jsPDF from "jspdf";

export default function geradorServicoSalaoPago(dados: any, extras: ClausulasExtras[]) {
    const doc = new jsPDF();
    const marginX: number = 10;
    let posY: number = 20;
    const maxPageHeight: number = 280;
    const maxTextWidth: number = 190;

    const checkPageBreak = (additionalHeight: number): void => {
        if (posY + additionalHeight >= maxPageHeight) {
            doc.addPage();
            posY = 20;
        }
    };

    const addSection = (title: string, content: string[]): void => {
        checkPageBreak(15);
        doc.setFontSize(12);
        doc.text(title, 105, posY, { align: "center" });
        posY += 15;
        doc.setFontSize(10);

        content.forEach((line: string) => {
            const splitLines: string[] = doc.splitTextToSize(line, maxTextWidth);
            splitLines.forEach((splitLine: string) => {
                checkPageBreak(10);
                doc.text(splitLine, marginX, posY);
                posY += 10;
            });
        });
    };

    // Página 1 - Cabeçalho
    doc.setFontSize(14);
    doc.text("CONTRATO DE PARCERIA SALÃO PARCEIRO", 105, posY, { align: "center" });
    posY += 15;


    addSection("1. IDENTIFICAÇÃO DAS PARTES", [
        `Salão Parceiro:`,
        `Razão Social: ${verificarValor(dados.razaoSocial)}`,
        `CNPJ: ${verificarValor(dados.cnpjsalao)}`,
        `Endereço: ${verificarValor(dados.enderecosalao)}`,
        `Telefone: ${verificarValor(dados.telefonesalao)}`,
        `E-mail: ${verificarValor(dados.emailsalao)}`,
        `1º Representante: ${verificarValor(dados.represetanteNome)}, ${verificarValor(dados.represetanteFuncao)}, ${verificarValor(dados.represetanteCpf)}`,
        `2º Representante: ${verificarValor(dados.doisrepresetanteNome)}, ${verificarValor(dados.doisrepresetanteFuncao)}, ${verificarValor(dados.doisrepresetanteCpf)}`,
        "",
        `Empresa ou Profissional Parceiro:`,
        `Nome/Razão Social: ${verificarValor(dados.razaoSocialouNome)}`,
        `CPF/CNPJ: ${verificarValor(dados.cnpjsalaooucpf)}`,
        `Endereço: ${verificarValor(dados.endereco)}`,
        `Telefone: ${verificarValor(dados.telefone)}`,
        `E-mail: ${verificarValor(dados.email)}`,
        "Conforme disposto no Art. 1º da Lei nº 13.352/2016, este contrato visa regulamentar a relação entre salão parceiro e profissional parceiro."

    ]);

    addSection("2. DO OBJETO", [
        "O presente contrato tem como objeto a prestação de serviços de beleza pelo(a) profissional parceiro(a) dentro do estabelecimento do Salão Parceiro.",
        `Descrição: ${verificarValor(dados.descricaoServico)}`,
        "De acordo com o Art. 1º, § 1º da Lei nº 13.352/2016, este contrato deve estabelecer direitos e deveres de ambas as partes."

    ]);

    addSection("3. DO PRAZO", [
        `Data de início: ${verificarValor(dados.dataPrazo)}`,
        `Prazo para conclusão: ${verificarValor(dados.prazoConclusao)}`,
        "Conforme o Código Civil, contratos devem ter prazo determinado ou indeterminado, respeitando o acordo entre as partes."

    ]);

    addSection("4. DA RETRIBUIÇÃO", [
        `Percentual repassado: ${verificarValor(dados.percentual)}`,
        `Frequência do pagamento: ${verificarValor(dados.formaPagamento)}`,
        dados.formaPagamento === "mensalmente" ? `Valor da parcela: ${verificarValor(dados.valorParcela)}` : `Forma de pagamento: ${verificarValor(dados.modalidade)}`,
        dados.formaPagamento === "mensalmente" ? `Data de vencimento: ${verificarValor(dados.dataVenc)}` : "",
        dados.sinal === "S" ? `Sinal: Sim, Valor: ${verificarValor(dados.valorSinal)}, Data de pagamento: ${verificarValor(dados.dataPag)}` : "Sinal: Não",
        `Multa por atraso: ${verificarValor(dados.multaAtraso)}`,
        `Conta bancária: ${verificarValor(dados.contaBancaria)}`,
        "De acordo com o Art. 1º, § 6º da Lei nº 13.352/2016, a remuneração do profissional parceiro será acordada entre as partes e não configurará vínculo empregatício."

    ]);

    addSection("5. DA FREQUÊNCIA E HORÁRIOS PARA ATENDIMENTO", [
        `Horários de funcionamento: ${verificarValor(dados.horarioFunc)}`,
        `Recepção disponível: ${verificarValor(dados.recepcao)}`,
        `Fornecimento de materiais: ${verificarValor(dados.fornecerMaterial)}`,
        "Nos termos do Art. 1º, § 5º da Lei nº 13.352/2016, o profissional parceiro tem autonomia para definir seus horários de trabalho."

    ]);

    addSection("6. DO DESCUMPRIMENTO", [
        `Em caso de descumprimento, multa de ${verificarValor(dados.percentualDescumprimento)} será aplicada.`,
        "Nos termos do Código Civil, cláusulas de penalidade devem ser proporcionais ao dano causado."

    ]);

    addSection("7. DO FORO", [
        `Foro eleito: Comarca de ${verificarValor(dados.cidade)}/${verificarValor(dados.estado)}`,
        "Nos termos do Art. 63 do Código de Processo Civil, as partes podem eleger foro para dirimir eventuais litígios."

    ]);

    addSection("8. PROPRIEDADE INTELECTUAL E CONFIDENCIALIDADE", [
        "Informações sigilosas sobre clientes e estratégias de negócios não poderão ser compartilhadas sem autorização.",
        `Propriedade intelectual: ${verificarValor(dados.direitos)}`,
        "Conforme a Lei nº 9.279/96 (Lei de Propriedade Industrial), informações confidenciais devem ser protegidas entre as partes."

    ]);

    // Seção OUTRAS CLAUSULAS
    const outrasClausulasContent = [
        `Cláusula Específica: ${verificarValor(dados.clausulaEspecifica)}`,
        "Art. 421 do Código Civil: A liberdade contratual será exercida nos limites da função social do contrato."
    ];

    if (dados.clausulaEspecifica === "S" && extras.length > 0) {
        extras.forEach(({ Titulo, Conteudo }) => {
            outrasClausulasContent.push(`${Titulo}: ${Conteudo}`);
        });
    }

    addSection("9. CLÁUSULAS ADICIONAIS", [
        `${outrasClausulasContent}`,
        "Disposições adicionais relevantes para ambas as partes, respeitando as normas da Lei nº 13.352/2016."
    ]);

    addSection("10. ASSINATURA E TESTEMUNHAS", [
        "Nos termos do Código Civil, testemunhas são recomendadas para garantir validade jurídica ao contrato.",
        `[${verificarValor(dados.razaoSocial)}]`,
        "Assinatura: ___________________________________________",
        `Nome do Representante: ${verificarValor(dados.represetanteNome)}`,
        `CPF: ${verificarValor(dados.represetanteCpf)}`,
        "",
        `[${verificarValor(dados.razaoSocialouNome)}]`,
        "Assinatura: ___________________________________________",
        `Nome do Representante: ${verificarValor(dados.umrepresetanteNome)}`,
        `CPF: ${verificarValor(dados.umrepresetanteCpf)}`,
        "",
        dados.testemunhasNecessarias === "S" ? `Testemunhas:
        Nome: ${verificarValor(dados.nomeTest1)}
        CPF: ${verificarValor(dados.cpfTest1)}
        Assinatura: ________________________________________
        Nome: ${verificarValor(dados.nomeTest2)}
        CPF: ${verificarValor(dados.cpfTest2)}
        Assinatura: ________________________________________` : "",
        `Local: ${verificarValor(dados.local)}`,
        `Data de assinatura: ${verificarValor(dados.dataAssinatura)}`,
        `Registro em cartório: ${verificarValor(dados.registroCartorioTest)}`
    ]);

    doc.save(`contrato_servicosalao.pdf`);

};