import type { Component } from 'vue';
import {
    closeDialogAfterTransition,
    getMountedApp,
    loadCodexAndVue,
    mountApp,
    removeDialogMount
} from '../dialog';

interface ConfirmationDialogOptions {
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
}

export async function openConfirmationDialog(options: ConfirmationDialogOptions): Promise<boolean> {
    const { Vue, Codex } = await loadCodexAndVue();
    if (!Codex.CdxDialog) throw new Error('Codex dialog is unavailable');
    if (getMountedApp()) removeDialogMount();

    return new Promise<boolean>((resolve) => {
        const app = Vue.createMwApp({
            setup() {
                const open = Vue.ref(true);
                let settled = false;
                const settle = (confirmed: boolean) => {
                    if (settled) return;
                    settled = true;
                    resolve(confirmed);
                };
                const close = (confirmed: boolean) => {
                    if (settled) return;
                    open.value = false;
                    closeDialogAfterTransition();
                    settle(confirmed);
                };
                // Replacing this dialog must also release the pending activation.
                Vue.onUnmounted(() => settle(false));
                return () => Vue.h(Codex.CdxDialog as Component, {
                    open: open.value,
                    title: options.title,
                    useCloseButton: true,
                    primaryAction: { label: options.confirmLabel, actionType: 'destructive' },
                    defaultAction: { label: options.cancelLabel },
                    class: 'review-tool-dialog',
                    onPrimary: () => close(true),
                    onDefault: () => close(false),
                    'onUpdate:open': (value: boolean) => { if (!value) close(false); }
                }, { default: () => Vue.h('p', options.message) });
            }
        });
        mountApp(app);
    });
}
