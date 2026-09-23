export async function copyText(text: string): Promise<void> {
    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return;
        } catch {
            // Fall back when clipboard access is unavailable or denied.
        }
    }

    const previousFocus = document.activeElement;
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.readOnly = true;
    textarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
    const container = previousFocus?.closest('[role="dialog"]') ?? document.body;
    container.appendChild(textarea);
    try {
        textarea.focus();
        textarea.select();
        if (!document.execCommand('copy')) throw new Error('Clipboard copy failed');
    } finally {
        textarea.remove();
        if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
    }
}
