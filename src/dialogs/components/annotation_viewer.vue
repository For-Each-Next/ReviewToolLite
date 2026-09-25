<script lang="ts" setup>
import state from '../../state';
import type { AnnotationGroup } from '../../annotations';
import { groupAnnotations, groupAnnotationsByTime, sortGroupsByPosition } from '../../annotation_order';
import { formatAnnotationTimestamp, getAnnotationTimeRange } from '../../annotation_time';
import { closeDialogAfterTransition } from '../../dialog';
import { copyWritingReview } from '../../copy_review';
import { ref, computed, onMounted, onUnmounted } from 'vue';

type AnnotationViewerI18n = {
    title: string;
    empty: string;
    edit: string;
    delete: string;
    deleteConfirm: string;
    clearAll: string;
    clearAllConfirm: string;
    undoClear: string;
    clearAllNothing: string;
    clearAllError: string;
    sectionFallback: string;
    close: string;
    export: string;
    exportDone: string;
    exportError: string;
    import: string;
    importDone: string;
    importNothing: string;
    importError: string;
    importExport: string;
    copyReview: string;
    copyAndGo: string;
    sortLabel: string;
    sortCreatedAsc: string;
    sortCreatedDesc: string;
    sortPosition: string;
    firstComment: string;
    lastEdit: string;
};

function buildI18n(): AnnotationViewerI18n {
    return {
        title: state.convByVar({ hant: '批註列表', hans: '批注列表' }),
        empty: state.convByVar({ hant: '尚無批註', hans: '尚无批注' }),
        edit: state.convByVar({ hant: '編輯', hans: '编辑' }),
        delete: state.convByVar({ hant: '刪除', hans: '删除' }),
        deleteConfirm: state.convByVar({ hant: '確定刪除？', hans: '确定删除？' }),
        clearAll: state.convByVar({ hant: '清除全部', hans: '清除全部' }),
        clearAllConfirm: state.convByVar({ hant: '確定清除所有批註？清除後可按「復原清除」。', hans: '确定清除所有批注？清除后可按“撤销清除”。' }),
        undoClear: state.convByVar({ hant: '復原清除', hans: '撤销清除' }),
        clearAllNothing: state.convByVar({ hant: '沒有可清除的批註。', hans: '没有可清除的批注。' }),
        clearAllError: state.convByVar({ hant: '清除批註時發生錯誤。', hans: '清除批注时发生错误。' }),
        sectionFallback: state.convByVar({ hant: '（未指定章節）', hans: '（未指定章节）' }),
        close: state.convByVar({ hant: '關閉', hans: '关闭' }),
        export: state.convByVar({ hant: '匯出', hans: '导出' }),
        exportDone: state.convByVar({ hant: '已匯出批註。', hans: '已导出批注。' }),
        exportError: state.convByVar({ hant: '匯出批註時發生錯誤。', hans: '导出批注时发生错误。' }),
        import: state.convByVar({ hant: '匯入', hans: '导入' }),
        importDone: state.convByVar({ hant: '已匯入 $1 則批註。', hans: '已导入 $1 条批注。' }),
        importNothing: state.convByVar({ hant: '沒有新的批註可匯入，已有的批註會略過。', hans: '没有新的批注可导入，已有的批注会跳过。' }),
        importError: state.convByVar({ hant: '無法匯入批註。請檢查 ReviewTool 批註 JSON 檔案及瀏覽器儲存空間。', hans: '无法导入批注。请检查 ReviewTool 批注 JSON 文件及浏览器存储空间。' }),
        importExport: state.convByVar({ hant: '匯入／匯出', hans: '导入／导出' }),
        copyReview: state.convByVar({ hant: '複製', hans: '复制' }),
        copyAndGo: state.convByVar({ hant: '複製並前往', hans: '复制并前往' }),
        sortLabel: state.convByVar({ hant: '排序方式', hans: '排序方式' }),
        sortCreatedAsc: state.convByVar({ hant: '最早時間優先', hans: '最早时间优先' }),
        sortCreatedDesc: state.convByVar({ hant: '最新時間優先', hans: '最新时间优先' }),
        sortPosition: state.convByVar({ hant: '頁面位置', hans: '页面位置' }),
        firstComment: state.convByVar({ hant: '首次批註時間', hans: '首次批注时间' }),
        lastEdit: state.convByVar({ hant: '最近編輯時間', hans: '最近编辑时间' })
    };
}

const props = withDefaults(defineProps<{
    pageName: string;
    initialGroups?: AnnotationGroup[];
    initialCanUndoClear?: boolean;
    onEditAnnotation?: (annotationId: string, sectionPath: string) => void;
    onDeleteAnnotation?: (annotationId: string, sectionPath: string) => Promise<void> | void;
    onClearAllAnnotations?: () => Promise<boolean | void> | boolean | void;
    onUndoClearAnnotations?: () => void;
    onImportAnnotations?: (json: string) => Promise<number> | number;
    onClosed?: () => void;
}>(), {
    initialGroups: () => [],
    initialCanUndoClear: false,
    onEditAnnotation: undefined,
    onDeleteAnnotation: undefined,
    onClearAllAnnotations: undefined,
    onUndoClearAnnotations: undefined,
    onImportAnnotations: undefined,
    onClosed: undefined
});

const i18n = buildI18n();
const open = ref(true);
const groups = ref<AnnotationGroup[]>(props.initialGroups);
const canUndoClear = ref(props.initialCanUndoClear);
const deletingAnnotationId = ref<string | null>(null);
const clearingAll = ref(false);
const copyingReview = ref(false);
const importing = ref(false);
const importInput = ref<HTMLInputElement | null>(null);
const fileAction = ref<string | null>(null);
const reviewAction = ref<string | null>(null);
const sortMethod = ref('position');
const now = ref(Date.now());
let timeRefreshInterval: number | undefined;
onMounted(() => {
    timeRefreshInterval = window.setInterval(() => { now.value = Date.now(); }, 60_000);
});
onUnmounted(() => window.clearInterval(timeRefreshInterval));

const talkPageTitle = mw.Title.newFromText(props.pageName)?.getTalkPage()?.getPrefixedText();
const reviewDestinations = [
    {
        value: 'Wikipedia:典范条目评选/提名区',
        label: state.convByVar({ hant: '典範條目評選', hans: '典范条目评选' })
    },
    {
        value: 'Wikipedia:特色列表评选/提名区',
        label: state.convByVar({ hant: '特色列表評選', hans: '特色列表评选' })
    },
    {
        value: 'Wikipedia:優良條目評選/提名區',
        label: state.convByVar({ hant: '優良條目評選', hans: '优良条目评选' })
    },
    {
        value: 'Wikipedia:同行评审/提案区',
        label: state.convByVar({ hant: '同行評審', hans: '同行评审' })
    },
    ...(talkPageTitle ? [{
        value: talkPageTitle,
        label: state.convByVar({ hant: '討論頁', hans: '讨论页' })
    }] : [])
];
defineExpose({ open, groups, canUndoClear });

const canClearAll = computed(() => Boolean(props.onClearAllAnnotations));
const isEmpty = computed(() => groups.value.every(group => !group.annotations.length));

const fileActionsDisabled = computed(() => importing.value || clearingAll.value || deletingAnnotationId.value !== null);
const fileMenuItems = computed(() => [
    { value: 'import', label: i18n.import, disabled: !props.onImportAnnotations },
    { value: 'export', label: i18n.export, disabled: isEmpty.value }
]);

const flattenedAnnotations = computed(() => groups.value.flatMap(group => group.annotations));
const timeRange = computed(() => getAnnotationTimeRange(flattenedAnnotations.value));

const sortingOptions = computed(() => ([
    { value: 'position', label: i18n.sortPosition },
    { value: 'created-desc', label: i18n.sortCreatedDesc },
    { value: 'created-asc', label: i18n.sortCreatedAsc }
]));

const selectedSortLabel = computed(() => sortingOptions.value.find(option => option.value === sortMethod.value)?.label);

const sortedGroups = computed(() => {
    const annotations = flattenedAnnotations.value;
    if (sortMethod.value === 'created-desc') return groupAnnotationsByTime(annotations, 'desc');
    if (sortMethod.value === 'created-asc') return groupAnnotationsByTime(annotations, 'asc');
    return sortGroupsByPosition(groupAnnotations(annotations));
});

function formatTimestamp(ts: number): string {
    return formatAnnotationTimestamp(ts, now.value);
}

function handleEdit(annotationId: string, sectionPath: string) {
    props.onEditAnnotation?.(annotationId, sectionPath);
}

async function handleDelete(annotationId: string, sectionPath: string): Promise<void> {
    if (!props.onDeleteAnnotation || !window.confirm(i18n.deleteConfirm)) return;
    deletingAnnotationId.value = annotationId;
    try {
        await props.onDeleteAnnotation(annotationId, sectionPath);
    } catch (error) {
        console.error('[ReviewTool] Failed to delete annotation', error);
        mw.notify(state.convByVar({ hant: '刪除批註時發生錯誤。', hans: '删除批注时发生错误。' }), {
            type: 'error', title: '[ReviewTool]'
        });
    } finally {
        deletingAnnotationId.value = null;
    }
}

async function handleClearAll(): Promise<void> {
    if (!props.onClearAllAnnotations || isEmpty.value || !window.confirm(i18n.clearAllConfirm)) return;
    clearingAll.value = true;
    try {
        const cleared = await props.onClearAllAnnotations();
        if (!cleared) mw.notify(i18n.clearAllNothing, { tag: 'review-tool' });
    } catch (error) {
        console.error('[ReviewTool] Failed to clear annotations', error);
        mw.notify(i18n.clearAllError, { type: 'error', title: '[ReviewTool]' });
    } finally {
        clearingAll.value = false;
    }
}

async function handleCopyReview(action: string | number | null) {
    reviewAction.value = null;
    if (isEmpty.value || copyingReview.value || importing.value) return;
    const destination = reviewDestinations.find(item => item.value === action);
    if (action !== 'copy' && !destination) return;
    let url = destination ? mw.util.getUrl(destination.value) : null;
    if (url && destination.value !== talkPageTitle) {
        url += `#${mw.util.escapeIdForLink(props.pageName.replace(/_/g, ' '))}`;
    }
    copyingReview.value = true;
    try {
        const copied = await copyWritingReview(groups.value);
        if (copied && url) window.location.assign(url);
    } finally {
        copyingReview.value = false;
    }
}

function handleFileAction(action: string | number | null): void {
    fileAction.value = null;
    if (fileActionsDisabled.value) return;
    if (action === 'import' && props.onImportAnnotations) {
        importInput.value?.click();
    } else if (action === 'export') {
        handleExport();
    }
}

function handleExport() {
    if (isEmpty.value) return;
    try {
        const payload = {
            pageName: props.pageName,
            exportedAt: Date.now(),
            groups: groups.value
        };
        const json = JSON.stringify(payload, null, 2);
        const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
        const filename = `review-tool-annotations-${new Date().toISOString().replace(/[:.]/g, '')}.json`;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        mw.notify(i18n.exportDone, { tag: 'review-tool' });
    } catch (error) {
        console.error('[ReviewTool] Failed to export annotations', error);
        mw.notify(i18n.exportError, { type: 'error', title: '[ReviewTool]' });
    }
}

async function handleImport(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !props.onImportAnnotations || importing.value) return;
    importing.value = true;
    try {
        const json = await file.text();
        if (!open.value) return;
        const imported = await props.onImportAnnotations(json);
        mw.notify(imported ? i18n.importDone.replace('$1', String(imported)) : i18n.importNothing, { tag: 'review-tool' });
    } catch (error) {
        console.error('[ReviewTool] Failed to import annotations', error);
        mw.notify(i18n.importError, { type: 'error', title: '[ReviewTool]' });
    } finally {
        input.value = '';
        importing.value = false;
    }
}

function onUpdateOpen(newValue: boolean) {
    if (!newValue) {
        closeDialog();
    }
}

function closeDialog() {
    open.value = false;
    closeDialogAfterTransition(props.onClosed);
}
</script>

<template>
    <cdx-dialog
        v-model:open="open"
        :title="i18n.title"
        :use-close-button="true"
        @update:open="onUpdateOpen"
        class="review-tool-dialog review-tool-annotation-viewer-dialog"
    >
        <div v-if="isEmpty" class="review-tool-annotation-viewer__empty">
            {{ i18n.empty }}
        </div>
        <div v-else class="review-tool-annotation-viewer__list">
            <dl v-if="timeRange" class="review-tool-annotation-viewer__times">
                <div>
                    <dt>{{ i18n.firstComment }}</dt>
                    <dd><time :datetime="new Date(timeRange.first).toISOString()">{{ formatTimestamp(timeRange.first) }}</time></dd>
                </div>
                <div>
                    <dt>{{ i18n.lastEdit }}</dt>
                    <dd><time :datetime="new Date(timeRange.last).toISOString()">{{ formatTimestamp(timeRange.last) }}</time></dd>
                </div>
            </dl>
            <div
                v-for="group in sortedGroups"
                :key="group.annotations[0].id"
                class="review-tool-annotation-viewer__section"
            >
                <h4 class="review-tool-annotation-viewer__section-title">
                    {{ group.sectionPath || i18n.sectionFallback }}
                </h4>
                <ul class="review-tool-annotation-viewer__items">
                    <li
                        v-for="anno in group.annotations"
                        :key="anno.id"
                        class="review-tool-annotation-viewer__item"
                    >
                        <div class="review-tool-annotation-viewer__quote">“{{ anno.sentenceText }}”</div>
                        <div class="review-tool-annotation-viewer__opinion">{{ anno.opinion }}</div>
                        <div class="review-tool-annotation-viewer__meta">
                            {{ anno.createdBy }} · {{ formatTimestamp(anno.createdAt) }}
                        </div>
                        <div class="review-tool-annotation-viewer__actions">
                            <cdx-button
                                size="small"
                                weight="quiet"
                                :title="i18n.edit"
                                :disabled="importing"
                                @click.prevent="handleEdit(anno.id, group.sectionPath)"
                            >
                                <span class="review-tool-control-label">{{ i18n.edit }}</span>
                            </cdx-button>
                            <cdx-button
                                size="small"
                                weight="quiet"
                                action="destructive"
                                :title="i18n.delete"
                                :disabled="importing || deletingAnnotationId === anno.id"
                                @click.prevent="handleDelete(anno.id, group.sectionPath)"
                            >
                                <span class="review-tool-control-label">{{ i18n.delete }}</span>
                            </cdx-button>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
        <template #footer>
            <div class="review-tool-annotation-viewer__footer">
                <div class="review-tool-annotation-viewer__footer-left">
                    <cdx-select
                        v-model:selected="sortMethod"
                        :menu-items="sortingOptions"
                        :disabled="isEmpty"
                        :aria-label="i18n.sortLabel"
                        :title="selectedSortLabel"
                        class="review-tool-annotation-viewer__sort-select"
                    />
                </div>
                <div class="review-tool-annotation-viewer__footer-controls">
                    <cdx-button
                        v-if="canUndoClear && props.onUndoClearAnnotations"
                        weight="quiet"
                        :disabled="fileActionsDisabled"
                        @click.prevent="props.onUndoClearAnnotations?.()"
                    >
                        <span class="review-tool-control-label">{{ i18n.undoClear }}</span>
                    </cdx-button>
                    <cdx-button
                        action="destructive"
                        weight="quiet"
                        :title="i18n.clearAll"
                        :disabled="!canClearAll || isEmpty || clearingAll || importing"
                        @click.prevent="handleClearAll"
                    >
                        <span class="review-tool-control-label">{{ i18n.clearAll }}</span>
                    </cdx-button>
                    <div class="review-tool-annotation-viewer__footer-actions">
                        <cdx-button weight="quiet" :title="i18n.close" @click.prevent="closeDialog">
                            <span class="review-tool-control-label">{{ i18n.close }}</span>
                        </cdx-button>
                        <input
                            ref="importInput"
                            type="file"
                            accept=".json,application/json"
                            hidden
                            @change="handleImport"
                        >
                        <cdx-menu-button
                            v-model:selected="fileAction"
                            :menu-items="fileMenuItems"
                            weight="quiet"
                            :title="i18n.importExport"
                            :disabled="fileActionsDisabled"
                            @update:selected="handleFileAction"
                        >
                            <span class="review-tool-control-label">{{ i18n.importExport }}</span>
                        </cdx-menu-button>
                        <cdx-button
                            weight="normal"
                            :title="i18n.copyReview"
                            :disabled="isEmpty || copyingReview || importing"
                            @click.prevent="handleCopyReview('copy')"
                        >
                            <span class="review-tool-control-label">{{ i18n.copyReview }}</span>
                        </cdx-button>
                        <cdx-menu-button
                            v-model:selected="reviewAction"
                            :menu-items="reviewDestinations"
                            action="progressive"
                            weight="primary"
                            :title="i18n.copyAndGo"
                            :disabled="isEmpty || copyingReview || importing"
                            @update:selected="handleCopyReview"
                        >
                            <span class="review-tool-control-label">{{ i18n.copyAndGo }}</span>
                        </cdx-menu-button>
                    </div>
                </div>
            </div>
        </template>
    </cdx-dialog>
</template>
