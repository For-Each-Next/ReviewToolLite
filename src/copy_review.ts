import type { AnnotationGroup } from './annotations';
import state from './state';
import { buildWritingReviewChapters, buildWritingReviewWikitext } from './writing_review';

async function copyText(text: string): Promise<void> {
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
    const container = previousFocus?.closest('[role="dialog"]') || document.body;
    container.appendChild(textarea);
    try {
        textarea.focus();
        textarea.select();
        if (!document.execCommand('copy')) {
            throw new Error('Clipboard copy failed');
        }
    } finally {
        textarea.remove();
        if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
    }
}

export async function copyWritingReview(groups: AnnotationGroup[]): Promise<boolean> {
    const chapters = buildWritingReviewChapters(groups, state.convByVar({
        hant: '（未指定章節）', hans: '（未指定章节）'
    }));
    if (!chapters.length) {
        mw.notify(state.convByVar({
            hant: '目前沒有可複製的批註。', hans: '目前没有可复制的批注。'
        }), { type: 'warn', tag: 'review-tool' });
        return false;
    }

    try {
        await copyText(buildWritingReviewWikitext(chapters, {
            articleTitle: mw.config.get('wgPageName') || state.articleTitle,
            revisionId: mw.config.get('wgRevisionId'),
            revisionTimestamp: mw.config.get('wgRevisionTimestamp') || mw.config.get('wgCurRevisionTimestamp')
        }).trim());
        mw.notify(state.convByVar({
            hant: '已複製評審文字，可貼到評審頁。', hans: '已复制评审文本，可粘贴到评审页。'
        }), { tag: 'review-tool' });
        return true;
    } catch (error) {
        console.error('[ReviewTool] Failed to copy review text', error);
        mw.notify(state.convByVar({
            hant: '無法複製評審文字，請允許瀏覽器存取剪貼簿後重試。',
            hans: '无法复制评审文本，请允许浏览器访问剪贴板后重试。'
        }), { type: 'error', tag: 'review-tool' });
        return false;
    }
}
