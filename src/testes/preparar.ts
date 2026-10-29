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

afterEach(() => {
    cleanup();
    localStorage.clear();
});
