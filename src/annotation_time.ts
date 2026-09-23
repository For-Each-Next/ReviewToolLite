import type { Annotation } from './annotations';
import state from './state';

function isValidTimestamp(value: number): boolean {
    return Number.isFinite(value) && Number.isFinite(new Date(value).getTime());
}

/** The first creation and most recent creation/edit among the current annotations. */
export function getAnnotationTimeRange(annotations: Annotation[]): { first: number; last: number } | null {
    let first = Infinity;
    let last = -Infinity;
    for (const annotation of annotations) {
        if (!isValidTimestamp(annotation.createdAt)) continue;
        first = Math.min(first, annotation.createdAt);
        const updatedAt = annotation.updatedAt ?? annotation.createdAt;
        last = Math.max(last, annotation.createdAt, isValidTimestamp(updatedAt) ? updatedAt : annotation.createdAt);
    }
    return Number.isFinite(first) ? { first, last } : null;
}

/** Display local time, matching the browser timezone used by the annotation list. */
export function formatAnnotationTimestamp(timestamp: number, now = Date.now()): string {
    if (!isValidTimestamp(timestamp)) return '';
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const absolute = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${hours}:${minutes}`;
    const elapsedMinutes = Math.floor(Math.abs(now - timestamp) / 60_000);
    let relative = state.convByVar({ hant: '剛剛', hans: '刚刚' });
    if (elapsedMinutes >= 1) {
        const amount = elapsedMinutes >= 1440 ? Math.floor(elapsedMinutes / 1440)
            : elapsedMinutes >= 60 ? Math.floor(elapsedMinutes / 60) : elapsedMinutes;
        const unit = elapsedMinutes >= 1440 ? '日' : elapsedMinutes >= 60
            ? state.convByVar({ hant: '小時', hans: '小时' })
            : state.convByVar({ hant: '分鐘', hans: '分钟' });
        const direction = now >= timestamp ? '前' : state.convByVar({ hant: '後', hans: '后' });
        relative = `${amount}${unit}${direction}`;
    }
    return `${absolute} [${relative}]`;
}
