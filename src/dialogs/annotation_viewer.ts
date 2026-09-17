import state from "../state";
import { AnnotationGroup } from "../annotations";
import {
    loadCodexAndVue,
    mountApp,
    registerCodexComponents,
    removeDialogMount,
    getMountedApp
} from "../dialog";
import AnnotationViewerDialog from "./components/annotation_viewer.vue";

export interface AnnotationViewerDialogOptions {
    pageName: string;
    groups: AnnotationGroup[];
    onEditAnnotation?: (annotationId: string, sectionPath: string) => void;
    onDeleteAnnotation?: (annotationId: string, sectionPath: string) => Promise<void> | void;
    onClearAllAnnotations?: () => Promise<boolean | void> | boolean | void;
    onImportAnnotations?: (json: string) => Promise<number> | number;
}

type AnnotationViewerDialogVm = {
    open: boolean;
    groups: AnnotationGroup[];
};

let viewerAppInstance: AnnotationViewerDialogVm | null = null;
let viewerDialogOptions: AnnotationViewerDialogOptions | null = null;

export function isAnnotationViewerDialogOpen(): boolean {
    return Boolean(viewerAppInstance);
}

export function closeAnnotationViewerDialog(): void {
    if (viewerAppInstance) {
        viewerAppInstance.open = false;
        setTimeout(() => removeDialogMount(), 200);
        viewerAppInstance = null;
        viewerDialogOptions = null;
    }
}

export function updateAnnotationViewerDialogGroups(groups: AnnotationGroup[]): void {
    if (viewerAppInstance) {
        viewerAppInstance.groups = groups;
    }
}

export function openAnnotationViewerDialog(options: AnnotationViewerDialogOptions): void {
    viewerDialogOptions = {
        pageName: options.pageName,
        groups: options.groups || [],
        onEditAnnotation: options.onEditAnnotation,
        onDeleteAnnotation: options.onDeleteAnnotation,
        onClearAllAnnotations: options.onClearAllAnnotations,
        onImportAnnotations: options.onImportAnnotations
    };

    if (getMountedApp()) removeDialogMount();

    loadCodexAndVue()
        .then(({ Vue, Codex }) => {
            const app = Vue.createMwApp({
                render() {
                    return (Vue as unknown as { h: (comp: unknown, props: Record<string, unknown>) => unknown }).h(
                        AnnotationViewerDialog,
                        {
                            ref: (instance: unknown) => {
                                viewerAppInstance = instance as AnnotationViewerDialogVm | null;
                            },
                            pageName: viewerDialogOptions?.pageName || "",
                            initialGroups: viewerDialogOptions?.groups || [],
                            onEditAnnotation: viewerDialogOptions?.onEditAnnotation,
                            onDeleteAnnotation: viewerDialogOptions?.onDeleteAnnotation,
                            onClearAllAnnotations: viewerDialogOptions?.onClearAllAnnotations,
                            onImportAnnotations: viewerDialogOptions?.onImportAnnotations,
                            onClosed: () => {
                                viewerAppInstance = null;
                                viewerDialogOptions = null;
                            }
                        }
                    );
                }
            });

            registerCodexComponents(app, Codex);
            mountApp(app);
        })
        .catch((error: unknown) => {
            console.error("[ReviewTool] Failed to open annotation viewer dialog", error);
            if (mw && mw.notify) {
                mw.notify(
                    state.convByVar({ hant: "無法開啟批註列表。", hans: "无法开启批注列表。" }),
                    { type: "error", title: "[ReviewTool]" }
                );
            }
        });
}
