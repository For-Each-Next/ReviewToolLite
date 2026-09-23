import { copyText } from './clipboard';
import type { AnnotationGroup } from './annotations';
import state from './state';
import { buildWritingReviewChapters, buildWritingReviewWikitext } from './writing_review';

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
        const revisionId = mw.config.get('wgRevisionId');
        if (!revisionId) throw new Error('Missing article revision ID');
        await mw.loader.using('mediawiki.api');
        const response = await new mw.Api().get({
            action: 'query',
            prop: 'revisions',
            revids: revisionId,
            rvprop: 'timestamp',
            formatversion: 2
        }) as { query?: { pages?: { revisions?: { timestamp?: string }[] }[] } };
        const revisionTimestamp = response.query?.pages?.[0]?.revisions?.[0]?.timestamp;
        if (!revisionTimestamp) throw new Error('Missing article revision timestamp');
        await copyText(buildWritingReviewWikitext(chapters, {
            articleTitle: mw.config.get('wgPageName') || state.articleTitle,
            revisionId,
            revisionTimestamp
        }).trim());
        mw.notify(state.convByVar({
            hant: '已複製評審文字，可貼到評審頁。', hans: '已复制评审文本，可粘贴到评审页。'
        }), { tag: 'review-tool' });
        return true;
    } catch (error) {
        console.error('[ReviewTool] Failed to copy review text', error);
        mw.notify(state.convByVar({
            hant: '無法複製評審文字，請檢查網路連線及剪貼簿權限後重試。',
            hans: '无法复制评审文本，请检查网络连接及剪贴板权限后重试。'
        }), { type: 'error', tag: 'review-tool' });
        return false;
    }
}
