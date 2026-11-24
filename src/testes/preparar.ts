import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

class ResizeObserverDeTeste {
    observe(): void {
        return;
    }
    unobserve(): void {
        return;
    }
    disconnect(): void {
        return;
    }
}

globalThis.ResizeObserver ??= ResizeObserverDeTeste;

// O jsdom tem o <dialog>, mas não abre nem fecha. Aqui ele só liga e desliga o atributo open, que é o que deixa o
// conteúdo visível para os testes, e avisa o close como o navegador avisa.
HTMLDialogElement.prototype.showModal ??= function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close ??= function close(this: HTMLDialogElement) {
    if (this.hasAttribute("open")) {
        this.removeAttribute("open");
        this.dispatchEvent(new Event("close"));
    }
};

afterEach(() => {
    cleanup();
    localStorage.clear();
});
