import type { AnnotationGroup } from './annotations';
import { compareOrderKeys } from './dom/numeric_pos';

export type WritingReviewSuggestion = { quote: string; suggestion: string };
export type WritingReviewChapter = { title: string; suggestions: WritingReviewSuggestion[] };

export function buildWritingReviewChapters(groups: AnnotationGroup[], fallbackTitle: string): WritingReviewChapter[] {
    return groups
        .filter(group => group.annotations.length)
        .map(group => ({
            ...group,
            annotations: group.annotations.slice().sort((a, b) => {
                const cmp = compareOrderKeys(a.sentencePos, b.sentencePos);
                return cmp || (a.createdAt || 0) - (b.createdAt || 0);
            })
        }))
        .sort((a, b) => {
            const cmp = compareOrderKeys(a.annotations[0]?.sentencePos, b.annotations[0]?.sentencePos);
            return cmp || (a.sectionPath || '').localeCompare(b.sectionPath || '');
        })
        .map(group => ({
            title: group.sectionPath || fallbackTitle,
            suggestions: group.annotations.map(anno => ({
                quote: anno.sentenceText || '',
                suggestion: anno.opinion || ''
            }))
        }));
}

function formatSuggestion(suggestion: string): string {
    return suggestion.trim().replace(/\r\n?/g, '\n')
        // Keep each bullet's continuation lines together when formatting line breaks.
        .split(/(?=^[ \t]*\*)/m)
        .map(block => {
            const bullet = block.match(/^[ \t]*(\*+)[ \t]*/);
            const text = bullet ? block.slice(bullet[0].length) : block;
            const formatted = text.trim()
                .replace(/\n{2,}/g, '{{pb}}')
                .replace(/\n/g, '<br>');
            return bullet ? `\n#${bullet[1]} ${formatted}` : formatted;
        }).join('');
}

export type WritingReviewLinkContext = {
    articleTitle: string;
    revisionId: number;
    revisionTimestamp?: string;
};

function formatRevisionLabel(timestamp?: string): string {
    const date = timestamp ? new Date(timestamp) : new Date();
    if (Number.isNaN(date.getTime())) return '';
    return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}版`;
}

export function buildWritingReviewWikitext(chapters: WritingReviewChapter[], context: WritingReviewLinkContext): string {
    let wikitext = '';
    for (const chapter of chapters) {
        const title = (chapter.title || '').trim();
        const sectionLink = `[[${context.articleTitle}#${title}|${title}]]`;
        const permalink = `[[Special:PermaLink/${context.revisionId}#${title}|${formatRevisionLabel(context.revisionTimestamp)}]]`;
        wikitext += `'''${sectionLink}'''<small>（${permalink}）</small>\n`;
        for (const item of chapter.suggestions) {
            const quote = (item.quote || '').trim();
            const suggestion = formatSuggestion(item.suggestion || '');
            wikitext += `# ${quote ? `{{rvw|1=${quote}}} —— ` : ''}${suggestion}\n`;
        }
        wikitext += '--~~~~\n\n';
    }
    return wikitext;
}
