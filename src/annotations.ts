import { groupAnnotations } from './annotation_order';
import state from './state';

export interface AnnotationTextAnchor {
    start: number;
    end: number;
    quote: string;
}

export interface Annotation {
    id: string;
    sectionPath: string;
    sentencePos: string;
    sentenceText: string;
    opinion: string;
    createdBy: string;
    createdAt: number;
    updatedAt?: number;
    resolved?: boolean;
    textAnchor?: AnnotationTextAnchor;
}

export interface AnnotationStore {
    pageName: string;
    createdAt: number;
    annotations: Annotation[];
    clearedAnnotations?: Annotation[];
}

export interface AnnotationGroup {
    sectionPath: string;
    annotations: Annotation[];
}

const KEY_PREFIX = 'reviewtool:annotations:';

function storageKeyForPage(pageName: string): string {
    return `${KEY_PREFIX}${pageName || 'unknown'}`;
}

function getStorage(type: 'local' | 'session'): Storage | null {
    if (typeof window === 'undefined') return null;
    try {
        return type === 'local' ? window.localStorage : window.sessionStorage;
    } catch (e) {
        console.error(`[ReviewTool] ${type}Storage unavailable`, e);
        return null;
    }
}

function createEmptyStore(pageName: string): AnnotationStore {
    return {
        pageName,
        createdAt: Date.now(),
        annotations: []
    };
}

function uuidv4(): string {
    // simple UUIDv4 generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === 'object';
}

function normalizeAnnotation(anno: unknown): Annotation | null {
    if (!isRecord(anno)) return null;
    if (typeof anno.id !== 'string') return null;
    if (typeof anno.sectionPath !== 'string') return null;
    if (typeof anno.sentenceText !== 'string') return null;
    if (typeof anno.opinion !== 'string') return null;
    if (typeof anno.createdBy !== 'string') return null;
    if (typeof anno.createdAt !== 'number') return null;

    const sentencePos = typeof anno.sentencePos === 'string' ? anno.sentencePos : '';
    const resolved = typeof anno.resolved === 'boolean' ? anno.resolved : undefined;
    const anchor = isRecord(anno.textAnchor) ? anno.textAnchor : null;
    const textAnchor = anchor
        && typeof anchor.start === 'number' && Number.isInteger(anchor.start) && anchor.start >= 0
        && typeof anchor.end === 'number' && Number.isInteger(anchor.end) && anchor.end > anchor.start
        && typeof anchor.quote === 'string' && anchor.quote.length === anchor.end - anchor.start
        ? { start: anchor.start, end: anchor.end, quote: anchor.quote }
        : undefined;

    return {
        id: anno.id,
        sectionPath: anno.sectionPath,
        sentencePos,
        sentenceText: anno.sentenceText,
        opinion: anno.opinion,
        createdBy: anno.createdBy,
        createdAt: anno.createdAt,
        updatedAt: typeof anno.updatedAt === 'number' && Number.isFinite(new Date(anno.updatedAt).getTime())
            && anno.updatedAt >= anno.createdAt ? anno.updatedAt : undefined,
        resolved,
        textAnchor
    };
}

export function loadAnnotations(pageName: string): AnnotationStore {
    const key = storageKeyForPage(pageName);
    const localStore = getStorage('local');
    const sessionStore = getStorage('session');
    let raw: string | null = null;
    let source: 'local' | 'session' | null = null;

    if (localStore) {
        try {
            raw = localStore.getItem(key);
            if (raw) source = 'local';
        } catch (e) {
            console.error('[ReviewTool] failed to read annotations from localStorage', e);
        }
    }

    if (!raw && sessionStore) {
        try {
            raw = sessionStore.getItem(key);
            if (raw) source = 'session';
        } catch (e) {
            console.error('[ReviewTool] failed to read annotations from sessionStorage', e);
        }
    }

    if (!raw) {
        return createEmptyStore(pageName);
    }

    let parsed: unknown = null;
    try {
        parsed = JSON.parse(raw);
    } catch (e) {
        console.warn('[ReviewTool] failed to parse annotations payload', e);
        return createEmptyStore(pageName);
    }

    const parsedRecord = isRecord(parsed) ? parsed : null;
    const parsedAnnotations = parsedRecord && Array.isArray(parsedRecord.annotations)
        ? parsedRecord.annotations
        : [];
    const annotations = parsedAnnotations
        .map(normalizeAnnotation)
        .filter((anno): anno is Annotation => !!anno);

    const normalized: AnnotationStore = {
        pageName: typeof parsedRecord?.pageName === 'string' ? parsedRecord.pageName : pageName,
        createdAt: typeof parsedRecord?.createdAt === 'number' ? parsedRecord.createdAt : Date.now(),
        annotations,
        clearedAnnotations: Array.isArray(parsedRecord?.clearedAnnotations)
            ? parsedRecord.clearedAnnotations.map(normalizeAnnotation).filter((anno): anno is Annotation => !!anno)
            : undefined
    };

    if (source === 'session' && localStore) {
        try {
            localStore.setItem(key, JSON.stringify(normalized));
            sessionStore?.removeItem(key);
        } catch (e) {
            console.error('[ReviewTool] failed to migrate annotations from sessionStorage to localStorage', e);
        }
    }

    return normalized;
}

export function saveAnnotations(store: AnnotationStore): boolean {
    const key = storageKeyForPage(store.pageName);
    const payload = JSON.stringify(store);
    const localStore = getStorage('local');
    if (localStore) {
        try {
            localStore.setItem(key, payload);
            return true;
        } catch (e) {
            console.error('[ReviewTool] failed to save annotations to localStorage', e);
        }
    }

    const sessionStore = getStorage('session');
    if (sessionStore) {
        try {
            sessionStore.setItem(key, payload);
            // A stale local copy would otherwise take precedence over the fallback.
            localStore?.removeItem(key);
            return true;
        } catch (e) {
            console.error('[ReviewTool] failed to save annotations to sessionStorage fallback', e);
        }
    } else {
        console.error('[ReviewTool] no available storage to save annotations');
    }
    return false;
}

/** Import a JSON backup into the current article without replacing existing annotations. */
export function importAnnotations(pageName: string, json: string): number {
    const payload: unknown = JSON.parse(json.replace(/^\uFEFF/, ''));
    if (!isRecord(payload)) throw new Error('Invalid annotation backup');

    let entries: unknown[];
    if (Array.isArray(payload.groups)) {
        entries = [];
        for (const group of payload.groups) {
            if (!isRecord(group) || !Array.isArray(group.annotations)) {
                throw new Error('Invalid annotation group');
            }
            for (const entry of group.annotations as unknown[]) entries.push(entry);
        }
    } else if (Array.isArray(payload.annotations)) {
        entries = payload.annotations;
    } else {
        throw new Error('Missing annotations in backup');
    }

    // Validate the whole backup before changing storage.
    const annotations = entries.map(entry => {
        const annotation = normalizeAnnotation(entry);
        if (!annotation || !annotation.id.trim() || !Number.isFinite(annotation.createdAt)) {
            throw new Error('Invalid annotation in backup');
        }
        return annotation;
    });
    const store = loadAnnotations(pageName);
    const ids = new Set(store.annotations.map(annotation => annotation.id));
    let imported = 0;
    for (const annotation of annotations) {
        if (ids.has(annotation.id)) continue;
        ids.add(annotation.id);
        store.annotations.push(annotation);
        imported++;
    }
    if (imported && !saveAnnotations({ ...store, pageName })) {
        throw new Error('Unable to save imported annotations');
    }
    return imported;
}

export function createAnnotation(
    pageName: string,
    sectionPath: string,
    sentenceText: string,
    opinion: string,
    sentencePos = '',
    textAnchor?: AnnotationTextAnchor
): Annotation {
    const store = loadAnnotations(pageName);
    const normalizedSectionPath = sectionPath === '目次' ? '序言' : sectionPath;
    const anno: Annotation = {
        id: uuidv4(),
        sectionPath: normalizedSectionPath,
        sentencePos,
        sentenceText,
        opinion,
        createdBy: state.userName || 'unknown',
        createdAt: Date.now(),
        resolved: false,
        textAnchor
    };
    store.annotations.push(anno);
    saveAnnotations(store);
    return anno;
}

export function getAnnotationsForSection(pageName: string, sectionPath: string): Annotation[] {
    const store = loadAnnotations(pageName);
    return store.annotations.filter(a => a.sectionPath === sectionPath);
}

export function getAnnotation(pageName: string, id: string): Annotation | null {
    const store = loadAnnotations(pageName);
    return store.annotations.find(a => a.id === id) || null;
}

export function updateAnnotation(
    pageName: string,
    id: string,
    updates: Partial<Pick<Annotation, 'opinion' | 'sentenceText' | 'resolved' | 'sentencePos'>>
): Annotation | null {
    const store = loadAnnotations(pageName);
    const idx = store.annotations.findIndex(a => a.id === id);
    if (idx === -1) return null;
    const updated = { ...store.annotations[idx], ...updates, updatedAt: Date.now() };
    store.annotations[idx] = updated;
    saveAnnotations(store);
    return updated;
}

export function deleteAnnotation(pageName: string, id: string): boolean {
    const store = loadAnnotations(pageName);
    const before = store.annotations.length;
    store.annotations = store.annotations.filter(a => a.id !== id);
    if (store.annotations.length !== before) {
        saveAnnotations(store);
        return true;
    }
    return false;
}

export function clearAnnotations(pageName: string): boolean {
    const store = loadAnnotations(pageName);
    if (!store.annotations.length) return false;
    // Save the empty list and its undo copy together; a failed write leaves comments intact.
    if (!saveAnnotations({ ...store, pageName, annotations: [], clearedAnnotations: store.annotations })) {
        throw new Error('Unable to clear annotations');
    }
    return true;
}

export function canUndoClearAnnotations(pageName: string): boolean {
    return Boolean(loadAnnotations(pageName).clearedAnnotations?.length);
}

export function undoClearAnnotations(pageName: string): number {
    const store = loadAnnotations(pageName);
    if (!store.clearedAnnotations?.length) return 0;
    const ids = new Set(store.annotations.map(annotation => annotation.id));
    const restored = store.clearedAnnotations.filter(annotation => {
        if (ids.has(annotation.id)) return false;
        ids.add(annotation.id);
        return true;
    });
    if (!saveAnnotations({
        ...store,
        pageName,
        annotations: [...store.annotations, ...restored],
        clearedAnnotations: undefined
    })) {
        throw new Error('Unable to restore cleared annotations');
    }
    return restored.length;
}

function sortAnnotationsByTimestamp(list: Annotation[]): Annotation[] {
    return [...list].sort((a, b) => a.createdAt - b.createdAt);
}

export function buildAnnotationGroups(pageName: string): AnnotationGroup[] {
    const store = loadAnnotations(pageName);
    if (!store.annotations.length) {
        return [];
    }

    const groups = groupAnnotations(store.annotations).map(group => ({
        ...group,
        annotations: sortAnnotationsByTimestamp(group.annotations)
    }));

    groups.sort((a, b) => {
        const aTs = a.annotations[0]?.createdAt ?? Number.MAX_SAFE_INTEGER;
        const bTs = b.annotations[0]?.createdAt ?? Number.MAX_SAFE_INTEGER;
        if (aTs === bTs) {
            return a.sectionPath.localeCompare(b.sectionPath);
        }
        return aTs - bTs;
    });

    return groups;
}
