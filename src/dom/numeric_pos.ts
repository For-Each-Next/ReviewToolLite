function countPreviousElementSiblings(node: Element | null): number {
    let index = 0;
    let sibling = node?.previousElementSibling ?? null;
    while (sibling) {
        index++;
        sibling = sibling.previousElementSibling;
    }
    return index;
}

function getElementPathArray(element: Element | null): number[] | null {
    if (!element) return null;
    const rootEl = document.querySelector('#mw-content-text');
    if (!rootEl || !rootEl.contains(element)) return null;

    const path: number[] = [];
    let node: Element | null = element;

    while (node && node !== rootEl) {
        path.push(countPreviousElementSiblings(node));
        node = node.parentElement;
    }

    if (node !== rootEl) {
        return null;
    }

    path.reverse();
    return path;
}

export function getElementOrderKey(element: Element | null): string | null {
    return getElementPathArray(element)?.map(segment => String(segment).padStart(6, '0')).join('.') ?? null;
}

export function compareOrderKeys(a?: string | null, b?: string | null): number {
    if (!a && !b) return 0;
    if (!a) return -1;
    if (!b) return 1;

    const partsA = a.split('.').map((part) => Number.parseInt(part, 10));
    const partsB = b.split('.').map((part) => Number.parseInt(part, 10));
    const len = Math.min(partsA.length, partsB.length);

    for (let i = 0; i < len; i++) {
        if (partsA[i] !== partsB[i]) {
            return partsA[i] - partsB[i];
        }
    }

    return partsA.length - partsB.length;
}
