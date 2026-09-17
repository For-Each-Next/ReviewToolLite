import state from "./state";
import styles from './styles.css';
import { addMainPageReviewToolButtonsToDOM } from "./dom/article_page";

/**
 * 將 CSS 樣式注入到頁面中。
 * @param css {string} 要注入的 CSS 樣式
 */
function injectStyles(css: string): void {
    if (!css) return;
    try {
        const styleEl = document.createElement('style');
        styleEl.appendChild(document.createTextNode(css));
        document.head.appendChild(styleEl);
    } catch {
        // Fallback for older environments
        const div = document.createElement('div');
        div.innerHTML = `<style>${css}</style>`;
        document.head.appendChild(div.firstChild as Node);
    }
}

/**
 * 小工具入口。
 */
function init(): void {
    // 只在條目頁及批註測試頁啟用小工具。
    const namespace = mw.config.get('wgNamespaceNumber');
    const pageName = mw.config.get('wgPageName');
    if (namespace !== 0 && pageName !== 'User:SuperGrey/gadgets/ReviewTool/TestPage') {
        return;
    }

    // Inject bundled CSS into the page.
    if (typeof document !== 'undefined') {
        injectStyles(styles);
    }

    state.initHanAssist().then(() => {
        state.articleTitle = pageName;
        mw.hook('wikipage.content').add(function () {
            addMainPageReviewToolButtonsToDOM(pageName);
        });
    });
}

init();
