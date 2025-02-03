export default class Pilha {
    private steps: number[];

    constructor() {
        this.steps = [];
    }

    empilhar(valorStep: number): void {
        this.steps.push(valorStep);
    }

    desempilhar(): number {
        if (this.estaVazia()) {
            console.log("A pilha de steps está vazia");
            return 0;
        }
        const valor = this.steps.pop()!;
        this.steps = this.steps.filter(step => step !== valor);
        return valor;
    }

    estaVazia(): boolean {
        return this.steps.length === 0;
    }

    visualizarPilha(): number[] {
        console.log(this.steps);
        return this.steps;
    }

}
