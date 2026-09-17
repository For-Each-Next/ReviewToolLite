/**
 * 在 mw-heading 元素中提取章節標題。
 * @param heading {Element} mw-heading 元素
 * @returns {string | null} 章節標題或 null
 */
export function getHeadingTitle(heading: Element): string | null {
    if (!heading) return null;
    // the heading might already be an HTMLHeadingElement
    const htmlHeading = heading instanceof HTMLHeadingElement ? heading : heading.querySelector('h1, h2, h3, h4, h5, h6');
    if (!htmlHeading) return null;
    // prefer explicit id on the HTMLHeadingElement
    if ((htmlHeading as HTMLElement).id) return (htmlHeading as HTMLElement).id;
    // some wikis put an inner span with the encoded id (e.g. .E4.B9...)
    const innerWithId = htmlHeading.querySelector('[id]');
    if (innerWithId && (innerWithId as HTMLElement).id) return (innerWithId as HTMLElement).id;
    // fallback to data-mw-thread-id
    const threadId = htmlHeading.getAttribute && htmlHeading.getAttribute('data-mw-thread-id');
    if (threadId) return threadId;
    // last resort: use the visible text
    const text = htmlHeading.textContent && htmlHeading.textContent.trim();
    return text || null;
}

/**
 * Add a tab button to the Vector skin's p-views menu (next to Read/Edit/History)
 * @param id {string} Element ID for the new tab (e.g., 'ca-annotate')
 * @param label {string} Button label text
 * @param title {string} Button title/tooltip
 * @param onClick {(e: Event) => void} Click handler
 * @param options {object} Optional configuration
 * @returns {HTMLElement | null} The created list item, or null if menu not found
 */
export function addVectorMenuTab(
    id: string,
    label: string,
    title: string,
    onClick: (e: Event) => void,
    options?: { selected?: boolean }
): HTMLElement | null {
    const menu = document.getElementById('p-views');
    if (!menu) {
        console.warn('[ReviewTool] Vector menu #p-views not found');
        return null;
    }

    const list = menu.querySelector('.vector-menu-content-list');
    if (!list) {
        console.warn('[ReviewTool] Vector menu content list not found');
        return null;
    }

    // Check if already exists
    if (document.getElementById(id)) {
        return document.getElementById(id);
    }

    const li = document.createElement('li');
    li.id = id;
    li.className = 'vector-tab-noicon mw-list-item';
    if (options?.selected) {
        li.classList.add('selected');
    }

    const a = document.createElement('a');
    a.href = '#';
    a.title = title;
    a.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick(e);
    };

    const span = document.createElement('span');
    span.textContent = label;
    a.appendChild(span);
    li.appendChild(a);

    // Insert before the watch button if it exists, otherwise append
    const watchLi = list.querySelector('#ca-watch');
    if (watchLi) {
        list.insertBefore(li, watchLi);
    } else {
        list.appendChild(li);
    }

    return li;
}

/**
 * Add or update a portlet link in the actions menu (fallback to toolbox).
 * @param portletId - The HTML id attribute for the portlet link.
 * @param label - The text label for the portlet link.
 * @param onClick - Click handler function for the portlet link.
 */
export function addPortletTrigger(portletId: string, label: string, onClick: () => void): void {
    const targets = ['p-cactions', 'p-tb'];
    let li = document.getElementById(portletId) as HTMLLIElement | null;

    if (!li) {
        for (const target of targets) {
            const added = mw.util.addPortletLink(target, '#', label, portletId, label);
            if (added) {
                li = added;
                break;
            }
        }
    }

    if (!li) return;

    const link = li.querySelector('a');

    // Update text/label if present
    if (link) {
        link.textContent = label;
        link.title = label;
        link.href = '#';
    }

    // Remove previous listeners (avoid stacking)
    const cloned = li.cloneNode(true);
    li.replaceWith(cloned);
    const freshLi = document.getElementById(portletId);
    const freshLink = freshLi?.querySelector('a');

    const handler = (event: Event) => {
        event.preventDefault();
        onClick();
    };

    if (freshLink) {
        freshLink.addEventListener('click', handler);
        freshLink.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick();
            }
        });
    } else if (freshLi) {
        freshLi.addEventListener('click', handler);
    }
}
