import { loadAnnotations } from './annotations';
import { formatAnnotationTimestamp, getAnnotationTimeRange } from './annotation_time';
import { openConfirmationDialog } from './dialogs/confirmation';
import state from './state';

const activatedPages = new Set<string>();

export async function confirmClearOnFirstActivation(pageName: string, clear: () => void): Promise<void> {
    if (activatedPages.has(pageName)) return;
    activatedPages.add(pageName);
    const { annotations } = loadAnnotations(pageName);
    if (!annotations.length) return;
    const timeRange = getAnnotationTimeRange(annotations);
    const confirmed = await openConfirmationDialog({
        title: state.convByVar({ hant: '開始新的評審', hans: '开始新的评审' }),
        message: state.convByVar({
            hant: '要清除本頁已有的批註，開始新的評審嗎？清除後可在批註列表按「復原清除」。按「取消」保留現有批註。',
            hans: '要清除本页已有的批注，开始新的评审吗？清除后可在批注列表按“撤销清除”。按“取消”保留现有批注。'
        }),
        detail: timeRange ? state.convByVar({
            hant: `最後修改時間：${formatAnnotationTimestamp(timeRange.last)}`,
            hans: `最后修改时间：${formatAnnotationTimestamp(timeRange.last)}`
        }) : undefined,
        confirmLabel: state.convByVar({ hant: '清除批註', hans: '清除批注' }),
        cancelLabel: state.convByVar({ hant: '取消', hans: '取消' })
    });
    if (confirmed) clear();
}
