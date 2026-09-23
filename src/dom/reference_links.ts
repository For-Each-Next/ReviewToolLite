import { copyText } from '../clipboard';
import state from '../state';

export const REFERENCE_MARKER_SELECTOR = '.reference, .mw-ref';
export const REFERENCE_CONTROLS_SELECTOR = '.review-tool-reference-tip';

const escapeWikitext = (text: string): string => text.replace(/[&<>[\]{}|\r\n]/g, character => `&#${character.charCodeAt(0)};`);
const validRevision = (revisionId: number): boolean => Number.isSafeInteger(revisionId) && revisionId > 0;

export function buildReferencePermalink(revisionId: number, referenceId: string): string | null {
    if (!validRevision(revisionId) || !/^cite_note-.+/.test(referenceId)) return null;
    return `[[Special:Permalink/${revisionId}#${escapeWikitext(referenceId)}]]`;
}

export function buildFootnotePermalink(revisionId: number, footnoteId: string, label: string): string | null {
    if (!validRevision(revisionId) || !/^cite_ref-.+/.test(footnoteId) || !label.trim()) return null;
    return `[[Special:Permalink/${revisionId}#${escapeWikitext(footnoteId)}|${escapeWikitext(label.trim())}]]`;
}

function localFragment(link: HTMLAnchorElement): string | null {
    try {
        const url = new URL(link.href, window.location.href);
        if (url.origin !== window.location.origin || url.pathname !== window.location.pathname
            || (url.search && url.search !== window.location.search)) return null;
        return decodeURIComponent(url.hash.slice(1));
    } catch {
        return null;
    }
}

function citationLink(marker: Element): HTMLAnchorElement | null {
    return Array.from(marker.querySelectorAll<HTMLAnchorElement>('a[href]'))
        .find(link => localFragment(link)?.startsWith('cite_note-')) ?? null;
}

function isLocator(marker: Element): boolean {
    // Template:Rp uses the reference class too, but has no Cite anchor/link.
    return marker.tagName === 'SUP' && marker.matches('.reference') && marker.matches('.nowrap')
        && !marker.id.startsWith('cite_ref-') && !citationLink(marker);
}

function footnoteLabel(link: HTMLAnchorElement, marker: Element, citation: Element): string {
    const label = (link.innerText ?? link.textContent ?? '').trim().replace(/^\[\s*|\s*\]$/g, '');
    // Read the rendered number, including subreference numbers. Internal Cite IDs
    // are not display numbers (e.g. cite_ref-52-1 can be displayed as 11.12).
    if (!/^\d+(?:\.\d+)*$/.test(label)) return label;
    const backlinks = Array.from(citation.querySelector('.mw-cite-backlink')?.querySelectorAll<HTMLAnchorElement>('a[href]') ?? []);
    const index = backlinks.findIndex(backlink => localFragment(backlink) === marker.id);
    if (backlinks.length < 2 || index < 0) return label;
    let suffix = '';
    for (let number = index + 1; number > 0; number = Math.floor((number - 1) / 26)) {
        suffix = String.fromCharCode(97 + (number - 1) % 26) + suffix;
    }
    return label + suffix;
}

export function installReferenceLinkTips(root: Element): () => void {
    // Only this separate button opens our popup. The original marker retains all
    // hover/click/focus events used by Reference Tooltips and Reference Previews.
    const tip = document.createElement('span');
    tip.className = 'review-tool-reference-tip';
    tip.hidden = true;
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.textContent = state.convByVar({ hant: '複製 ▾', hans: '复制 ▾' });
    trigger.setAttribute('aria-haspopup', 'menu');
    trigger.setAttribute('aria-expanded', 'false');
    const menu = document.createElement('span');
    menu.className = 'review-tool-reference-menu';
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', state.convByVar({ hant: '註腳複製選單', hans: '脚注复制菜单' }));
    menu.hidden = true;
    let actionButtons: HTMLButtonElement[] = [];
    const makeAction = (label: string, text: string | null) => {
        const action = document.createElement('button');
        action.type = 'button';
        action.textContent = label;
        action.setAttribute('role', 'menuitem');
        action.tabIndex = -1;
        action.disabled = !text;
        action.title = text ?? '';
        action.onclick = event => copy(event, text);
        menu.appendChild(action);
        actionButtons.push(action);
    };
    tip.append(trigger, menu);

    let activeLink: HTMLAnchorElement | null = null;
    let activeMarkers: Element[] = [];
    const closeMenu = (restoreFocus = false) => {
        menu.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
        if (restoreFocus) trigger.focus();
    };
    const hide = () => {
        closeMenu();
        tip.hidden = true;
        activeLink = null;
        activeMarkers = [];
        menu.replaceChildren();
        actionButtons = [];
    };
    const linkData = (link: HTMLAnchorElement) => {
        const referenceId = localFragment(link);
        const marker = link.closest(REFERENCE_MARKER_SELECTOR);
        const target = referenceId ? document.getElementById(referenceId) : null;
        const text = referenceId ? buildReferencePermalink(mw.config.get('wgRevisionId'), referenceId) : null;
        if (!text || !marker || !root.contains(marker) || !target || !root.contains(target)) return null;
        const label = footnoteLabel(link, marker, target);
        return {
            citation: text,
            footnote: buildFootnotePermalink(mw.config.get('wgRevisionId'), marker.id, label),
            label
        };
    };
    const adjacentMarker = (marker: Element, direction: 'previousSibling' | 'nextSibling'): Element | null => {
        let node: Node | null = marker;
        while (node) {
            // Sentence wrapping is transparent, but never cross a paragraph boundary.
            while (!node[direction] && node.parentElement?.matches('.sentence')) node = node.parentElement;
            node = node[direction];
            while (node instanceof Element && node.matches('.sentence') && node.firstChild) {
                node = direction === 'nextSibling' ? node.firstChild : node.lastChild;
            }
            if (!node) return null;
            if (node === tip || node.nodeType === Node.COMMENT_NODE
                || (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim())
                || (node instanceof Element && node.matches('.sentence') && !node.firstChild)) continue;
            return node instanceof Element && root.contains(node) && node.matches(REFERENCE_MARKER_SELECTOR) ? node : null;
        }
        return null;
    };
    const show = (event: Event) => {
        if (!(event.target instanceof Element)) return;
        const link = event.target.closest<HTMLAnchorElement>('a[href]');
        const marker = link?.closest(REFERENCE_MARKER_SELECTOR);
        if (!link || !marker || !root.contains(link) || isLocator(marker)) return;
        const data = linkData(link);
        if (!data) {
            hide();
            return;
        }
        const markers = [marker];
        let sibling: Element | null = marker;
        while ((sibling = adjacentMarker(sibling, 'previousSibling'))) markers.unshift(sibling);
        sibling = marker;
        while ((sibling = adjacentMarker(sibling, 'nextSibling'))) markers.push(sibling);
        activeLink = link;
        // The button belongs to the whole group. Crossing another marker on the
        // way to it must not change the available actions or dismiss an open menu.
        if (!menu.hidden && markers.length === activeMarkers.length
            && markers.every((item, index) => item === activeMarkers[index])) return;
        const references = markers.filter(item => !isLocator(item)).map(item => {
            const anchor = citationLink(item);
            return anchor ? linkData(anchor) : null;
        });

        closeMenu();
        activeMarkers = markers;
        menu.replaceChildren();
        actionButtons = [];
        for (const reference of references) {
            if (!reference) continue;
            makeAction(state.convByVar({
                hant: `複製註腳 [${reference.label}]`,
                hans: `复制脚注 [${reference.label}]`
            }), reference.footnote);
            makeAction(state.convByVar({
                hant: `複製引文 [${reference.label}]`,
                hans: `复制引文 [${reference.label}]`
            }), reference.citation);
        }
        // Locators are transparent; a broken actual reference must not be omitted.
        const links = references.map(reference => reference?.footnote);
        if (links.length > 1 && links.every(Boolean)) {
            makeAction(state.convByVar({ hant: '複製本組註腳', hans: '复制本组脚注' }), links.join(', '));
        }
        trigger.setAttribute('aria-label', references.length > 1 ? state.convByVar({
            hant: '複製註腳群組', hans: '复制脚注组'
        }) : state.convByVar({
            hant: `複製註腳 ${data.label}`,
            hans: `复制脚注 ${data.label}`
        }));
        const lastMarker = markers[markers.length - 1];
        if (lastMarker.nextSibling !== tip) lastMarker.after(tip);
        tip.hidden = false;
    };
    const actions = () => actionButtons.filter(button => !button.disabled);
    const positionMenu = () => {
        if (menu.hidden) return;
        const anchor = trigger.getBoundingClientRect();
        const bounds = menu.getBoundingClientRect();
        const gap = 4;
        const maxLeft = Math.max(gap, window.innerWidth - bounds.width - gap);
        const maxTop = Math.max(gap, window.innerHeight - bounds.height - gap);
        const previews = Array.from(document.querySelectorAll('.rt-tooltip, .mwe-popups'))
            .map(preview => preview.getBoundingClientRect()).filter(rect => rect.width && rect.height);
        const candidates = [
            { left: anchor.left, top: anchor.bottom + gap },
            { left: anchor.left, top: anchor.top - bounds.height - gap },
            ...previews.flatMap(rect => [
                { left: rect.right + gap, top: anchor.bottom + gap },
                { left: rect.left - bounds.width - gap, top: anchor.bottom + gap },
                { left: anchor.left, top: rect.bottom + gap },
                { left: anchor.left, top: rect.top - bounds.height - gap }
            ])
        ].map(point => ({ left: Math.max(gap, Math.min(point.left, maxLeft)), top: Math.max(gap, Math.min(point.top, maxTop)) }));
        const position = candidates.find(point => previews.every(rect => point.left + bounds.width <= rect.left
            || point.left >= rect.right || point.top + bounds.height <= rect.top || point.top >= rect.bottom)) ?? candidates[0];
        menu.style.left = `${position.left}px`;
        menu.style.top = `${position.top}px`;
    };
    const openMenu = (last = false) => {
        menu.hidden = false;
        trigger.setAttribute('aria-expanded', 'true');
        positionMenu();
        const buttons = actions();
        buttons[last ? buttons.length - 1 : 0]?.focus();
    };
    trigger.onclick = event => {
        event.preventDefault();
        event.stopPropagation();
        if (menu.hidden) openMenu();
        else closeMenu(true);
    };
    trigger.onkeydown = event => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        event.preventDefault();
        event.stopPropagation();
        openMenu(event.key === 'ArrowUp');
    };
    menu.onkeydown = event => {
        if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        event.stopPropagation();
        const buttons = actions();
        const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
        const index = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1
            : (current + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
        buttons[index]?.focus();
    };
    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Tab' && !menu.hidden) closeMenu(true);
        if (event.key !== 'Escape' || tip.hidden) return;
        if (!menu.hidden) {
            closeMenu(true);
        } else {
            if (tip.contains(document.activeElement)) activeLink?.focus();
            hide();
        }
    };
    const onOutsidePointer = (event: Event) => {
        if (!(event.target instanceof Node) || !tip.contains(event.target)) closeMenu();
    };
    const onFocusOut = (event: FocusEvent) => {
        if (!(event.relatedTarget instanceof Node) || !tip.contains(event.relatedTarget)) closeMenu();
    };
    tip.onclick = event => event.stopPropagation();
    tip.addEventListener('focusout', onFocusOut);
    const copy = (event: MouseEvent, text: string | null) => {
        event.preventDefault();
        event.stopPropagation();
        if (!text) return;
        closeMenu(true);
        void copyText(text).then(() => {
            mw.notify(state.convByVar({ hant: '已複製永久連結。', hans: '已复制永久链接。' }), { tag: 'review-tool-reference' });
        }).catch(error => {
            console.error('[ReviewTool] Failed to copy reference link', error);
            mw.notify(state.convByVar({ hant: '無法複製連結，請檢查剪貼簿權限後重試。', hans: '无法复制链接，请检查剪贴板权限后重试。' }), {
                type: 'error', tag: 'review-tool-reference'
            });
        });
    };
    // Keep the trigger available when moving into or scrolling a native preview.
    root.addEventListener('mouseover', show, { capture: true });
    root.addEventListener('focusin', show, { capture: true });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onOutsidePointer);
    window.addEventListener('scroll', positionMenu, { capture: true });
    window.addEventListener('resize', positionMenu);
    return () => {
        hide();
        root.removeEventListener('mouseover', show, { capture: true });
        root.removeEventListener('focusin', show, { capture: true });
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('pointerdown', onOutsidePointer);
        window.removeEventListener('scroll', positionMenu, { capture: true });
        window.removeEventListener('resize', positionMenu);
        tip.removeEventListener('focusout', onFocusOut);
        tip.remove();
    };
}
