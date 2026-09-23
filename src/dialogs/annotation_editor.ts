import state from '../state';
import {
    loadCodexAndVue,
    mountApp,
    registerCodexComponents,
    removeDialogMount,
    getMountedApp
} from '../dialog';
import AnnotationEditorDialog from './components/annotation_editor.vue';

export interface AnnotationEditorDialogOptions {
    sectionPath: string;
    sentenceText: string;
    initialOpinion?: string;
    mode?: 'create' | 'edit';
    allowDelete?: boolean;
}

export type AnnotationEditorDialogResult =
    | { action: 'save'; opinion: string }
    | { action: 'delete' }
    | { action: 'cancel' };

export async function openAnnotationEditorDialog(options: AnnotationEditorDialogOptions): Promise<AnnotationEditorDialogResult> {
    const dialogOptions: Required<AnnotationEditorDialogOptions> = {
        sectionPath: options.sectionPath,
        sentenceText: options.sentenceText,
        initialOpinion: options.initialOpinion || '',
        mode: options.mode || 'create',
        allowDelete: options.allowDelete ?? options.mode === 'edit'
    };

    if (getMountedApp()) removeDialogMount();

    try {
        const { Vue, Codex } = await loadCodexAndVue();
        return await new Promise<AnnotationEditorDialogResult>((resolve) => {
            const app = Vue.createMwApp({
                render: () => Vue.h(AnnotationEditorDialog, { ...dialogOptions, onResolve: resolve })
            });
            registerCodexComponents(app, Codex);
            mountApp(app);
        });
    } catch (error) {
        console.error('[ReviewTool] Failed to open annotation editor dialog', error);
        mw.notify(state.convByVar({ hant: '無法開啟批註對話框。', hans: '无法开启批注对话框。' }), {
            type: 'error', title: '[ReviewTool]'
        });
        throw error;
    }
}
