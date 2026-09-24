<script lang="ts" setup>
import state from '../../state';
import { closeDialogAfterTransition } from '../../dialog';
import { commentShortcuts as vCommentShortcuts } from '../comment_shortcuts';
import { copyText } from '../../clipboard';
import type { RelatedSource } from '../../dom/related_sources';
import { ref, computed, watch } from 'vue';

type AnnotationEditorI18n = {
    titleCreate: string;
    titleEdit: string;
    sectionLabel: string;
    sentenceLabel: string;
    sourcesLabel: string;
    copySource: string;
    sourceCopied: string;
    sourceCopyFailed: string;
    opinionLabel: string;
    opinionPlaceholder: string;
    opinionRequired: string;
    cancel: string;
    save: string;
    create: string;
    delete: string;
    deleteConfirm: string;
};

function buildI18n(): AnnotationEditorI18n {
    return {
        titleCreate: state.convByVar({ hant: '新增批註', hans: '新增批注' }),
        titleEdit: state.convByVar({ hant: '編輯批註', hans: '编辑批注' }),
        sectionLabel: state.convByVar({ hant: '章節：', hans: '章节：' }),
        sentenceLabel: state.convByVar({ hant: '句子：', hans: '句子：' }),
        sourcesLabel: state.convByVar({ hant: '相關來源', hans: '相关来源' }),
        copySource: state.convByVar({ hant: '複製', hans: '复制' }),
        sourceCopied: state.convByVar({ hant: '已複製。', hans: '已复制。' }),
        sourceCopyFailed: state.convByVar({ hant: '無法複製，請選取連結文字手動複製。', hans: '无法复制，请选取链接文字手动复制。' }),
        opinionLabel: state.convByVar({ hant: '批註內容', hans: '批注内容' }),
        opinionPlaceholder: state.convByVar({ hant: '請輸入批註內容…', hans: '请输入批注内容…' }),
        opinionRequired: state.convByVar({ hant: '批註內容不能為空', hans: '批注内容不能为空' }),
        cancel: state.convByVar({ hant: '取消', hans: '取消' }),
        save: state.convByVar({ hant: '儲存', hans: '保存' }),
        create: state.convByVar({ hant: '新增', hans: '新增' }),
        delete: state.convByVar({ hant: '刪除', hans: '删除' }),
        deleteConfirm: state.convByVar({ hant: '確定要刪除這條批註？', hans: '确定要删除这条批注？' })
    };
}

const props = withDefaults(defineProps<{
    mode?: 'create' | 'edit';
    sectionPath?: string;
    sentenceText?: string;
    relatedSources?: RelatedSource[];
    initialOpinion?: string;
    allowDelete?: boolean;
    onResolve?: (result: { action: 'save'; opinion: string } | { action: 'delete' } | { action: 'cancel' }) => void;
}>(), {
    mode: 'create',
    sectionPath: '',
    sentenceText: '',
    relatedSources: () => [],
    initialOpinion: '',
    allowDelete: false,
    onResolve: undefined
});

const i18n = buildI18n();
const open = ref(true);
const opinion = ref(typeof props.initialOpinion === 'string' ? props.initialOpinion : '');
const showValidationError = ref(false);
const sourceCopyStatus = ref('');
const failedSourceWikitext = ref('');

async function copySource(source: RelatedSource) {
    failedSourceWikitext.value = '';
    try {
        await copyText(source.wikitext);
        sourceCopyStatus.value = `${source.label} ${i18n.sourceCopied}`;
    } catch {
        failedSourceWikitext.value = source.wikitext;
        sourceCopyStatus.value = i18n.sourceCopyFailed;
    }
}

const dialogTitle = computed(() => (props.mode === 'edit' ? i18n.titleEdit : i18n.titleCreate));
const primaryLabel = computed(() => (props.mode === 'edit' ? i18n.save : i18n.create));
const canSave = computed(() => Boolean((opinion.value || '').trim()));

watch(opinion, () => {
    if (showValidationError.value && canSave.value) {
        showValidationError.value = false;
    }
});

function closeDialog() {
    open.value = false;
    closeDialogAfterTransition();
}

function onPrimaryAction() {
    if (!canSave.value) {
        showValidationError.value = true;
        return;
    }
    props.onResolve?.({ action: 'save', opinion: opinion.value.trim() });
    closeDialog();
}

function onCancelAction() {
    props.onResolve?.({ action: 'cancel' });
    closeDialog();
}

function onDeleteClick() {
    if (!props.allowDelete) return;
    const ok = window.confirm(i18n.deleteConfirm);
    if (!ok) return;
    props.onResolve?.({ action: 'delete' });
    closeDialog();
}

function onUpdateOpen(newValue: boolean) {
    if (!newValue) {
        onCancelAction();
    }
}
</script>

<template>
    <cdx-dialog
        v-model:open="open"
        :title="dialogTitle"
        :use-close-button="true"
        @update:open="onUpdateOpen"
        class="review-tool-dialog review-tool-annotation-editor-dialog"
    >
        <div class="review-tool-form-section">
            <div class="review-tool-annotation-editor__label">{{ i18n.sectionLabel }}</div>
            <div class="review-tool-annotation-editor__section">{{ props.sectionPath }}</div>
        </div>

        <div class="review-tool-form-section">
            <div id="annotation-sentence-label" class="review-tool-annotation-editor__label">{{ i18n.sentenceLabel }}</div>
            <div
                class="review-tool-annotation-editor__quote"
                role="region"
                aria-labelledby="annotation-sentence-label"
                tabindex="0"
            >{{ props.sentenceText }}</div>
        </div>

        <div v-if="props.relatedSources.length" class="review-tool-form-section">
            <div id="annotation-sources-label" class="review-tool-annotation-editor__label">{{ i18n.sourcesLabel }}</div>
            <ul class="review-tool-annotation-editor__sources" aria-labelledby="annotation-sources-label">
                <li v-for="source in props.relatedSources" :key="source.wikitext">
                    <a :href="source.url" target="_blank" rel="noopener noreferrer">{{ source.title }}</a>
                    <span class="review-tool-source-copy">[<a
                        href="#"
                        :title="`${i18n.copySource}${source.label}`"
                        :aria-label="`${i18n.copySource}${source.label}`"
                        @click.prevent="copySource(source)"
                        @keydown.space.prevent="copySource(source)"
                    >{{ i18n.copySource }}{{ source.label }}</a>]</span>
                    <code v-if="failedSourceWikitext === source.wikitext">{{ source.wikitext }}</code>
                </li>
            </ul>
            <div role="status" class="review-tool-annotation-editor__sources-hint">{{ sourceCopyStatus }}</div>
        </div>

        <div class="review-tool-form-section" v-comment-shortcuts>
            <label class="review-tool-annotation-editor__label" :for="'annotation-opinion-input'">
                {{ i18n.opinionLabel }}
            </label>
            <cdx-text-area
                id="annotation-opinion-input"
                v-model="opinion"
                rows="5"
                :placeholder="i18n.opinionPlaceholder"
            ></cdx-text-area>
            <div v-if="showValidationError" class="review-tool-annotation-editor__error">
                {{ i18n.opinionRequired }}
            </div>
        </div>

        <template #footer>
            <div class="review-tool-annotation-editor__footer">
                <cdx-button
                    v-if="props.allowDelete"
                    weight="quiet"
                    action="destructive"
                    :title="i18n.delete"
                    class="review-tool-annotation-editor__delete"
                    @click.prevent="onDeleteClick"
                >
                    <span class="review-tool-control-label">{{ i18n.delete }}</span>
                </cdx-button>
                <div class="review-tool-annotation-editor__actions">
                    <cdx-button weight="quiet" :title="i18n.cancel" @click.prevent="onCancelAction">
                        <span class="review-tool-control-label">{{ i18n.cancel }}</span>
                    </cdx-button>
                    <cdx-button
                        action="progressive"
                        weight="primary"
                        :title="primaryLabel"
                        :disabled="!canSave"
                        @click.prevent="onPrimaryAction"
                    >
                        <span class="review-tool-control-label">{{ primaryLabel }}</span>
                    </cdx-button>
                </div>
            </div>
        </template>
    </cdx-dialog>
</template>
