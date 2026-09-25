// ==UserScript==
// ReviewToolLite (based on [[User:SuperGrey/gadgets/ReviewTool]])
// Original project: https://github.com/QZGao/ReviewTool
// Modifications: For-Each-Next, with AI assistance
// Timestamp: 2026-09-25T06:07:00.070Z
//
// @name         ReviewToolLite
// @namespace    https://github.com/For-Each-Next/ReviewToolLite
// @version      1.2.0
// @description  Annotate Chinese Wikipedia articles and copy review feedback as wikitext.
// @author       Quinn Gao (QZGao / SuperGrey) https://zh.wikipedia.org/wiki/User:SuperGrey
// @license      MIT
// @homepageURL  https://github.com/For-Each-Next/ReviewToolLite
// @supportURL   https://github.com/For-Each-Next/ReviewToolLite/issues
// @match        https://zh.wikipedia.org/*
// @match        https://zh.m.wikipedia.org/*
// @run-at       document-end
// @grant        none
// @noframes
// ==/UserScript==
// <nowiki>
(() => {
  function reviewToolApplication() {
    var __defProp = Object.defineProperty;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __esm = (fn, res) => function __init() {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    };
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var State, state_default;
    var init_state = __esm({
      "src/state.ts"() {
        State = class {
          constructor() {
            this.convByVar = (langDict) => {
              if (langDict == null ? void 0 : langDict.hant) {
                return langDict.hant;
              }
              return "繁簡轉換未初始化，且 langDict 無效！";
            };
            this.articleTitle = "";
            this.userName = mw.config.get("wgUserName") || "Example";
          }
          async initHanAssist() {
            const requireModule = await mw.loader.using("ext.gadget.HanAssist");
            const { convByVar } = requireModule("ext.gadget.HanAssist");
            if (typeof convByVar === "function") this.convByVar = convByVar;
          }
        };
        state_default = new State();
      }
    });
    var styles_default;
    var init_styles = __esm({
      "src/styles.css"() {
        styles_default = `.review-tool-dialog {
    /* Wrap prose and long URLs without hiding any of the annotation. */
    overflow-wrap: anywhere;
}

.review-tool-dialog .cdx-button,
.review-tool-dialog .cdx-menu-button {
    max-inline-size: 100%;
}

.review-tool-dialog .cdx-menu-button,
.review-tool-dialog .cdx-text-area,
.review-tool-dialog .cdx-select-vue__handle {
    /* Codex form controls otherwise have a 256px minimum width. */
    min-inline-size: 0;
}

.review-tool-dialog .cdx-menu-button > .cdx-button {
    inline-size: 100%;
}

/* Keep controls one line high; the full label remains in their text and title. */
.review-tool-control-label {
    display: block;
    min-inline-size: 0;
    max-inline-size: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.review-tool-dialog .review-tool-form-section:not(:first-child) {
    margin-top: 10px;
}

.review-tool-dialog textarea {
    min-height: 32px;
    max-height: 160px;
    resize: vertical;
}

/* Annotation controls */
.review-tool-annotation-ui.floating-button {
    position: absolute;
    transform: translate(-50%, -100%);
    z-index: 9999;
    pointer-events: auto;
    background: #1976d2;
    color: #fff;
    border: none;
    padding: 6px 8px;
    border-radius: 4px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    font-size: 13px;
    line-height: 1.2;
    white-space: nowrap;
}

.review-tool-annotation-ui.floating-button:hover {
    background: #1e88e5;
}

.review-tool-reference-tip {
    margin-inline-start: 0.25em;
    color: var(--color-subtle, #54595d);
    font-size: 0.75em;
    vertical-align: super;
    white-space: nowrap;
    user-select: none;
}

.review-tool-reference-tip button {
    appearance: none;
    padding: 0 0.15em;
    border: 0;
    background: transparent;
    color: var(--color-progressive, #36c);
    font: inherit;
    cursor: pointer;
}

.review-tool-reference-tip button:hover,
.review-tool-reference-tip button:focus-visible {
    text-decoration: underline;
}

.review-tool-reference-tip .review-tool-reference-trigger {
    padding: 1px 5px;
    border: 1px solid var(--border-color-base, #a2a9b1);
    border-radius: 2px;
    background: var(--background-color-base, #fff);
    color: var(--color-base, #202122);
}

.review-tool-reference-tip .review-tool-reference-trigger:hover {
    background: var(--background-color-interactive, #eaecf0);
    text-decoration: none;
}

.review-tool-reference-menu {
    position: fixed;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    min-width: 10em;
    max-width: calc(100vw - 8px);
    max-height: calc(100vh - 8px);
    overflow: auto;
    box-sizing: border-box;
    padding: 4px;
    border: 1px solid var(--border-color-base, #a2a9b1);
    border-radius: 4px;
    background: var(--background-color-base, #fff);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    font-size: 14px;
    line-height: 1.5;
    white-space: normal;
}

.review-tool-reference-menu button {
    padding: 6px 12px;
    text-align: start;
    color: var(--color-base, #202122);
}

.review-tool-reference-menu button:hover,
.review-tool-reference-menu button:focus-visible {
    background: var(--background-color-interactive, #eaecf0);
    text-decoration: none;
}

.review-tool-reference-menu button:disabled {
    color: var(--color-disabled, #72777d);
    cursor: default;
}

.review-tool-reference-tip[hidden],
.review-tool-reference-tip [hidden] {
    display: none;
}

.review-tool-undo-clear {
    margin-inline-start: 8px;
    cursor: pointer;
}

.review-tool-global-button {
    display: none;
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 10100;
    padding: 10px 16px;
    background: #36c;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.review-tool-global-button:hover {
    background: #447ff5;
}

.review-tool-annotation-mode .review-tool-global-button {
    display: block;
}

.review-tool-inline-annotation {
    display: none;
    align-items: center;
    margin-left: 4px;
    vertical-align: baseline;
    gap: 2px;
}

.review-tool-annotation-mode .review-tool-inline-annotation {
    display: inline-flex;
}

.review-tool-inline-annotation__icon {
    background: #fff7d1;
    border: 1px solid #f5c400;
    border-radius: 999px;
    color: #202122;
    cursor: pointer;
    font-size: 11px;
    line-height: 1.3;
    padding: 0 6px;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 16px;
}

.review-tool-inline-annotation__icon:hover {
    background: #ffe58f;
}

.review-tool-annotation-editor__label {
    font-size: 12px;
    font-weight: 600;
    color: #54595d;
    margin-bottom: 4px;
}

.review-tool-annotation-editor__section {
    font-size: 13px;
    color: #202122;
}

.review-tool-annotation-editor__quote {
    background: #f8f9fa;
    border: 1px solid #eaecf0;
    border-radius: 4px;
    padding: 8px;
    white-space: pre-wrap;
    max-height: 160px;
    overflow-y: auto;
}

.review-tool-annotation-editor__quote:focus-visible {
    outline: 2px solid var(--color-progressive, #36c);
    outline-offset: 2px;
}

.review-tool-annotation-editor__error {
    color: #d73333;
    font-size: 12px;
    margin-top: 4px;
}

.review-tool-annotation-editor__quick-input {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 4px;
}

.review-tool-annotation-editor__footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: var(--spacing-75, 12px);
    padding-top: 12px;
}

.review-tool-annotation-editor__sources-hint {
    margin: 4px 0;
    font-size: 12px;
    color: var(--color-subtle, #54595d);
}

.review-tool-annotation-editor__sources {
    margin: 0;
    padding-inline-start: 24px;
    max-height: 200px;
    overflow-y: auto;
}

.review-tool-annotation-editor__sources li {
    margin-bottom: 8px;
}

.review-tool-annotation-editor__sources a {
    overflow-wrap: anywhere;
}

.review-tool-source-copy {
    margin-inline-start: 6px;
    white-space: nowrap;
}

.review-tool-annotation-editor__sources code {
    display: block;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    user-select: text;
}

.review-tool-annotation-editor__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-75, 12px);
    margin-inline-start: auto;
}

.review-tool-annotation-viewer__empty {
    text-align: center;
    color: #54595d;
    padding: 32px 0;
}

.review-tool-annotation-viewer__footer {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-75, 12px);
    padding-top: 12px;
}

.review-tool-annotation-viewer__footer-left {
    display: flex;
    align-items: center;
}

.review-tool-annotation-viewer__sort-select {
    inline-size: 220px;
    max-inline-size: 100%;
    min-inline-size: 0;
}

.review-tool-annotation-viewer__footer-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--spacing-75, 12px);
    flex-wrap: wrap;
}

.review-tool-annotation-viewer__footer-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-75, 12px);
    justify-content: flex-end;
    margin-inline-start: auto;
    flex-wrap: wrap;
}

.review-tool-annotation-editor__footer,
.review-tool-annotation-editor__actions,
.review-tool-annotation-viewer__footer,
.review-tool-annotation-viewer__footer-left,
.review-tool-annotation-viewer__footer-controls,
.review-tool-annotation-viewer__footer-actions {
    min-inline-size: 0;
    max-inline-size: 100%;
}

@media (max-width: 480px) {
    .review-tool-annotation-viewer__footer-controls,
    .review-tool-annotation-viewer__footer-actions,
    .review-tool-annotation-editor__footer,
    .review-tool-annotation-editor__actions {
        /* Put primary actions first when stacked, in both reading directions. */
        flex-direction: column-reverse;
        align-items: stretch;
    }

    .review-tool-annotation-viewer__footer-actions,
    .review-tool-annotation-editor__actions {
        margin-inline-start: 0;
    }

    .review-tool-annotation-viewer__sort-select {
        inline-size: 100%;
    }
}

@media (max-width: 480px) and (max-height: 480px) {
    /* Leave room for the content when a landscape screen or keyboard reduces height. */
    .review-tool-annotation-viewer__footer-controls,
    .review-tool-annotation-viewer__footer-actions,
    .review-tool-annotation-editor__footer,
    .review-tool-annotation-editor__actions {
        flex-direction: row;
        align-items: center;
    }

    .review-tool-annotation-viewer__footer-actions,
    .review-tool-annotation-editor__actions {
        margin-inline-start: auto;
    }
}

.review-tool-annotation-viewer__section {
    margin-bottom: 16px;
}

.review-tool-annotation-viewer__times {
    margin: 0 0 16px;
    font-size: 13px;
    color: var(--color-subtle, #54595d);
}

.review-tool-annotation-viewer__times > div {
    display: flex;
    flex-wrap: wrap;
    column-gap: 8px;
    margin-bottom: 4px;
}

.review-tool-annotation-viewer__times dt {
    font-weight: 600;
}

.review-tool-annotation-viewer__times dd {
    margin: 0;
}

.review-tool-annotation-viewer__section-title {
    font-size: 13px;
    font-weight: 600;
    margin: 0 0 6px;
}

.review-tool-annotation-viewer__items {
    list-style: none;
    padding: 0;
    margin: 0;
}

.review-tool-annotation-viewer__item {
    border: 1px solid #eaecf0;
    border-radius: 6px;
    padding: 8px;
    margin-bottom: 8px;
    background: #fff;
}

.review-tool-annotation-viewer__quote {
    font-style: italic;
    color: #54595d;
}

.review-tool-annotation-viewer__opinion {
    margin-top: 4px;
}

.review-tool-annotation-viewer__quote,
.review-tool-annotation-viewer__opinion {
    white-space: pre-wrap;
}

.review-tool-annotation-viewer__meta {
    font-size: 12px;
    color: #72777d;
    margin-top: 4px;
}

.review-tool-annotation-viewer__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-75, 12px);
    margin-top: 6px;
}

/* Sentence selection and hover states. */
.review-tool-annotation-ui.sentence {
    background: transparent;
    transition: background 120ms ease-in;
    cursor: pointer;
    pointer-events: auto;
}

.review-tool-annotation-ui.sentence:hover {
    background: rgba(255, 235, 59, 0.22) !important;
}

html.rt-selecting .review-tool-annotation-ui.sentence {
    cursor: text;
}

/* While annotation mode is active, allow selection over known inline editor widgets
   that set \`user-select: none\` (e.g. ipe quick-edit buttons). This only applies
   while our mode is on to avoid changing page behavior permanently. */
.review-tool-annotation-mode .ipe__in-article-link,
.review-tool-annotation-mode .ipe-quick-edit,
.review-tool-annotation-mode .ipe-quick-edit--create-only,
.review-tool-annotation-mode .qeec-ref-tag-copy-btn {
    user-select: text !important;
    pointer-events: auto !important;
}
`;
      }
    });
    function getHeadingTitle(heading) {
      var _a;
      if (!heading) return null;
      const htmlHeading = heading instanceof HTMLHeadingElement ? heading : heading.querySelector("h1, h2, h3, h4, h5, h6");
      if (!htmlHeading) return null;
      if (htmlHeading.id) return htmlHeading.id;
      const innerWithId = htmlHeading.querySelector("[id]");
      if (innerWithId == null ? void 0 : innerWithId.id) return innerWithId.id;
      const threadId = htmlHeading.getAttribute("data-mw-thread-id");
      if (threadId) return threadId;
      const text = (_a = htmlHeading.textContent) == null ? void 0 : _a.trim();
      return text || null;
    }
    function addPortletTrigger(portletId, label, onClick) {
      const targets = ["p-cactions", "p-tb"];
      let li = document.getElementById(portletId);
      if (!li) {
        for (const target of targets) {
          const added = mw.util.addPortletLink(target, "#", label, portletId, label);
          if (added) {
            li = added;
            break;
          }
        }
      }
      if (!li) return;
      const link = li.querySelector("a");
      if (link) {
        link.textContent = label;
        link.title = label;
        link.href = "#";
      }
      const cloned = li.cloneNode(true);
      li.replaceWith(cloned);
      const freshLi = document.getElementById(portletId);
      const freshLink = freshLi == null ? void 0 : freshLi.querySelector("a");
      const handler = (event) => {
        event.preventDefault();
        onClick();
      };
      if (freshLink) {
        freshLink.addEventListener("click", handler);
        freshLink.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick();
          }
        });
      } else if (freshLi) {
        freshLi.addEventListener("click", handler);
      }
    }
    var init_utils = __esm({
      "src/dom/utils.ts"() {
      }
    });
    function countPreviousElementSiblings(node) {
      var _a;
      let index = 0;
      let sibling = (_a = node == null ? void 0 : node.previousElementSibling) != null ? _a : null;
      while (sibling) {
        index++;
        sibling = sibling.previousElementSibling;
      }
      return index;
    }
    function getElementPathArray(element) {
      if (!element) return null;
      const rootEl = document.querySelector("#mw-content-text");
      if (!rootEl || !rootEl.contains(element)) return null;
      const path = [];
      let node = element;
      while (node && node !== rootEl) {
        path.push(countPreviousElementSiblings(node));
        node = node.parentElement;
      }
      if (node !== rootEl) {
        return null;
      }
      path.reverse();
      return path;
    }
    function getElementOrderKey(element) {
      var _a, _b;
      return (_b = (_a = getElementPathArray(element)) == null ? void 0 : _a.map((segment) => String(segment).padStart(6, "0")).join(".")) != null ? _b : null;
    }
    function compareOrderKeys(a, b) {
      if (!a && !b) return 0;
      if (!a) return -1;
      if (!b) return 1;
      const partsA = a.split(".").map((part) => Number.parseInt(part, 10));
      const partsB = b.split(".").map((part) => Number.parseInt(part, 10));
      const len = Math.min(partsA.length, partsB.length);
      for (let i = 0; i < len; i++) {
        if (partsA[i] !== partsB[i]) {
          return partsA[i] - partsB[i];
        }
      }
      return partsA.length - partsB.length;
    }
    var init_numeric_pos = __esm({
      "src/dom/numeric_pos.ts"() {
      }
    });
    function groupAnnotations(annotations) {
      const buckets = /* @__PURE__ */ new Map();
      for (const annotation of annotations) {
        const sectionPath = annotation.sectionPath.trim();
        const bucket = buckets.get(sectionPath);
        if (bucket) bucket.push(annotation);
        else buckets.set(sectionPath, [annotation]);
      }
      return Array.from(buckets, ([sectionPath, entries]) => ({ sectionPath, annotations: entries }));
    }
    function sortGroupsByPosition(groups) {
      return groups.filter(({ annotations }) => annotations.length).map((group) => ({
        ...group,
        annotations: [...group.annotations].sort((a, b) => compareOrderKeys(a.sentencePos, b.sentencePos) || a.createdAt - b.createdAt)
      })).sort((a, b) => compareOrderKeys(a.annotations[0].sentencePos, b.annotations[0].sentencePos) || a.sectionPath.localeCompare(b.sectionPath));
    }
    function groupAnnotationsByTime(annotations, order) {
      const direction = order === "asc" ? 1 : -1;
      const sorted = [...annotations].sort((a, b) => direction * (a.createdAt - b.createdAt));
      const groups = [];
      for (const annotation of sorted) {
        const sectionPath = annotation.sectionPath.trim();
        const previous = groups[groups.length - 1];
        if ((previous == null ? void 0 : previous.sectionPath) === sectionPath) previous.annotations.push(annotation);
        else groups.push({ sectionPath, annotations: [annotation] });
      }
      return groups;
    }
    var init_annotation_order = __esm({
      "src/annotation_order.ts"() {
        init_numeric_pos();
      }
    });
    function storageKeyForPage(pageName) {
      return `${KEY_PREFIX}${pageName || "unknown"}`;
    }
    function getStorage(type) {
      if (typeof window === "undefined") return null;
      try {
        return type === "local" ? window.localStorage : window.sessionStorage;
      } catch (e) {
        console.error(`[ReviewTool] ${type}Storage unavailable`, e);
        return null;
      }
    }
    function createEmptyStore(pageName) {
      return {
        pageName,
        createdAt: Date.now(),
        annotations: []
      };
    }
    function uuidv4() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === "x" ? r : r & 3 | 8;
        return v.toString(16);
      });
    }
    function isRecord(value) {
      return !!value && typeof value === "object";
    }
    function normalizeAnnotation(anno) {
      if (!isRecord(anno)) return null;
      if (typeof anno.id !== "string" || !anno.id.trim()) return null;
      if (typeof anno.sectionPath !== "string") return null;
      if (typeof anno.sentenceText !== "string") return null;
      if (typeof anno.opinion !== "string") return null;
      if (typeof anno.createdBy !== "string") return null;
      if (typeof anno.createdAt !== "number" || !Number.isFinite(new Date(anno.createdAt).getTime())) return null;
      const sentencePos = typeof anno.sentencePos === "string" ? anno.sentencePos : "";
      const resolved = typeof anno.resolved === "boolean" ? anno.resolved : void 0;
      const anchor = isRecord(anno.textAnchor) ? anno.textAnchor : null;
      const textAnchor = anchor && typeof anchor.start === "number" && Number.isInteger(anchor.start) && anchor.start >= 0 && typeof anchor.end === "number" && Number.isInteger(anchor.end) && anchor.end > anchor.start && typeof anchor.quote === "string" && anchor.quote.length === anchor.end - anchor.start ? { start: anchor.start, end: anchor.end, quote: anchor.quote } : void 0;
      return {
        id: anno.id,
        sectionPath: anno.sectionPath,
        sentencePos,
        sentenceText: anno.sentenceText,
        opinion: anno.opinion,
        createdBy: anno.createdBy,
        createdAt: anno.createdAt,
        updatedAt: typeof anno.updatedAt === "number" && Number.isFinite(new Date(anno.updatedAt).getTime()) && anno.updatedAt >= anno.createdAt ? anno.updatedAt : void 0,
        resolved,
        textAnchor
      };
    }
    function loadAnnotations(pageName) {
      const key = storageKeyForPage(pageName);
      const localStore = getStorage("local");
      const sessionStore = getStorage("session");
      let raw = null;
      let source = null;
      if (localStore) {
        try {
          raw = localStore.getItem(key);
          if (raw) source = "local";
        } catch (e) {
          console.error("[ReviewTool] failed to read annotations from localStorage", e);
        }
      }
      if (!raw && sessionStore) {
        try {
          raw = sessionStore.getItem(key);
          if (raw) source = "session";
        } catch (e) {
          console.error("[ReviewTool] failed to read annotations from sessionStorage", e);
        }
      }
      if (!raw) {
        return createEmptyStore(pageName);
      }
      let parsed = null;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        console.warn("[ReviewTool] failed to parse annotations payload", e);
        return createEmptyStore(pageName);
      }
      const parsedRecord = isRecord(parsed) ? parsed : null;
      const parsedAnnotations = parsedRecord && Array.isArray(parsedRecord.annotations) ? parsedRecord.annotations : [];
      const annotations = parsedAnnotations.map(normalizeAnnotation).filter((anno) => !!anno);
      const normalized = {
        pageName,
        createdAt: typeof (parsedRecord == null ? void 0 : parsedRecord.createdAt) === "number" ? parsedRecord.createdAt : Date.now(),
        annotations,
        clearedAnnotations: Array.isArray(parsedRecord == null ? void 0 : parsedRecord.clearedAnnotations) ? parsedRecord.clearedAnnotations.map(normalizeAnnotation).filter((anno) => !!anno) : void 0
      };
      if (source === "session" && localStore) {
        try {
          localStore.setItem(key, JSON.stringify(normalized));
          sessionStore == null ? void 0 : sessionStore.removeItem(key);
        } catch (e) {
          console.error("[ReviewTool] failed to migrate annotations from sessionStorage to localStorage", e);
        }
      }
      return normalized;
    }
    function saveAnnotations(store) {
      const key = storageKeyForPage(store.pageName);
      const payload = JSON.stringify(store);
      const localStore = getStorage("local");
      if (localStore) {
        try {
          localStore.setItem(key, payload);
          return true;
        } catch (e) {
          console.error("[ReviewTool] failed to save annotations to localStorage", e);
        }
      }
      const sessionStore = getStorage("session");
      if (sessionStore) {
        try {
          sessionStore.setItem(key, payload);
          localStore == null ? void 0 : localStore.removeItem(key);
          return true;
        } catch (e) {
          console.error("[ReviewTool] failed to save annotations to sessionStorage fallback", e);
        }
      } else {
        console.error("[ReviewTool] no available storage to save annotations");
      }
      return false;
    }
    function importAnnotations(pageName, json) {
      const payload = JSON.parse(json.replace(/^\uFEFF/, ""));
      if (!isRecord(payload)) throw new Error("Invalid annotation backup");
      let entries;
      if (Array.isArray(payload.groups)) {
        entries = [];
        for (const group of payload.groups) {
          if (!isRecord(group) || !Array.isArray(group.annotations)) {
            throw new Error("Invalid annotation group");
          }
          for (const entry of group.annotations) entries.push(entry);
        }
      } else if (Array.isArray(payload.annotations)) {
        entries = payload.annotations;
      } else {
        throw new Error("Missing annotations in backup");
      }
      const annotations = entries.map((entry) => {
        const annotation = normalizeAnnotation(entry);
        if (!annotation) {
          throw new Error("Invalid annotation in backup");
        }
        return annotation;
      });
      const store = loadAnnotations(pageName);
      const ids = new Set(store.annotations.map((annotation) => annotation.id));
      let imported = 0;
      for (const annotation of annotations) {
        if (ids.has(annotation.id)) continue;
        ids.add(annotation.id);
        store.annotations.push(annotation);
        imported++;
      }
      if (imported && !saveAnnotations({ ...store, pageName })) {
        throw new Error("Unable to save imported annotations");
      }
      return imported;
    }
    function createAnnotation(pageName, sectionPath, sentenceText, opinion, sentencePos = "", textAnchor) {
      const store = loadAnnotations(pageName);
      const normalizedSectionPath = sectionPath === "目次" ? "序言" : sectionPath;
      const anno = {
        id: uuidv4(),
        sectionPath: normalizedSectionPath,
        sentencePos,
        sentenceText,
        opinion,
        createdBy: state_default.userName || "unknown",
        createdAt: Date.now(),
        resolved: false,
        textAnchor
      };
      store.annotations.push(anno);
      if (!saveAnnotations(store)) throw new Error("Unable to save annotation");
      return anno;
    }
    function getAnnotation(pageName, id) {
      const store = loadAnnotations(pageName);
      return store.annotations.find((a) => a.id === id) || null;
    }
    function updateAnnotation(pageName, id, updates) {
      const store = loadAnnotations(pageName);
      const idx = store.annotations.findIndex((a) => a.id === id);
      if (idx === -1) return null;
      const updated = { ...store.annotations[idx], ...updates, updatedAt: Date.now() };
      store.annotations[idx] = updated;
      if (!saveAnnotations(store)) throw new Error("Unable to update annotation");
      return updated;
    }
    function deleteAnnotation(pageName, id) {
      const store = loadAnnotations(pageName);
      const before = store.annotations.length;
      store.annotations = store.annotations.filter((a) => a.id !== id);
      if (store.annotations.length !== before) {
        if (!saveAnnotations(store)) throw new Error("Unable to delete annotation");
        return true;
      }
      return false;
    }
    function clearAnnotations(pageName) {
      const store = loadAnnotations(pageName);
      if (!store.annotations.length) return false;
      if (!saveAnnotations({ ...store, pageName, annotations: [], clearedAnnotations: store.annotations })) {
        throw new Error("Unable to clear annotations");
      }
      return true;
    }
    function canUndoClearAnnotations(pageName) {
      var _a;
      return Boolean((_a = loadAnnotations(pageName).clearedAnnotations) == null ? void 0 : _a.length);
    }
    function undoClearAnnotations(pageName) {
      var _a;
      const store = loadAnnotations(pageName);
      if (!((_a = store.clearedAnnotations) == null ? void 0 : _a.length)) return 0;
      const ids = new Set(store.annotations.map((annotation) => annotation.id));
      const restored = store.clearedAnnotations.filter((annotation) => {
        if (ids.has(annotation.id)) return false;
        ids.add(annotation.id);
        return true;
      });
      if (!saveAnnotations({
        ...store,
        pageName,
        annotations: [...store.annotations, ...restored],
        clearedAnnotations: void 0
      })) {
        throw new Error("Unable to restore cleared annotations");
      }
      return restored.length;
    }
    function sortAnnotationsByTimestamp(list) {
      return [...list].sort((a, b) => a.createdAt - b.createdAt);
    }
    function buildAnnotationGroups(pageName) {
      const store = loadAnnotations(pageName);
      if (!store.annotations.length) {
        return [];
      }
      const groups = groupAnnotations(store.annotations).map((group) => ({
        ...group,
        annotations: sortAnnotationsByTimestamp(group.annotations)
      }));
      groups.sort((a, b) => {
        var _a, _b, _c, _d;
        const aTs = (_b = (_a = a.annotations[0]) == null ? void 0 : _a.createdAt) != null ? _b : Number.MAX_SAFE_INTEGER;
        const bTs = (_d = (_c = b.annotations[0]) == null ? void 0 : _c.createdAt) != null ? _d : Number.MAX_SAFE_INTEGER;
        if (aTs === bTs) {
          return a.sectionPath.localeCompare(b.sectionPath);
        }
        return aTs - bTs;
      });
      return groups;
    }
    var KEY_PREFIX;
    var init_annotations = __esm({
      "src/annotations.ts"() {
        init_annotation_order();
        init_state();
        KEY_PREFIX = "reviewtool:annotations:";
      }
    });
    function isValidTimestamp(value) {
      return Number.isFinite(value) && Number.isFinite(new Date(value).getTime());
    }
    function getAnnotationTimeRange(annotations) {
      var _a;
      let first = Infinity;
      let last = -Infinity;
      for (const annotation of annotations) {
        if (!isValidTimestamp(annotation.createdAt)) continue;
        first = Math.min(first, annotation.createdAt);
        const updatedAt = (_a = annotation.updatedAt) != null ? _a : annotation.createdAt;
        last = Math.max(last, annotation.createdAt, isValidTimestamp(updatedAt) ? updatedAt : annotation.createdAt);
      }
      return Number.isFinite(first) ? { first, last } : null;
    }
    function formatAnnotationTimestamp(timestamp, now = Date.now()) {
      if (!isValidTimestamp(timestamp)) return "";
      const date = new Date(timestamp);
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const absolute = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${hours}:${minutes}`;
      const elapsedMinutes = Math.floor(Math.abs(now - timestamp) / 6e4);
      let relative = state_default.convByVar({ hant: "剛剛", hans: "刚刚" });
      if (elapsedMinutes >= 1) {
        const amount = elapsedMinutes >= 1440 ? Math.floor(elapsedMinutes / 1440) : elapsedMinutes >= 60 ? Math.floor(elapsedMinutes / 60) : elapsedMinutes;
        const unit = elapsedMinutes >= 1440 ? "日" : elapsedMinutes >= 60 ? state_default.convByVar({ hant: "小時", hans: "小时" }) : state_default.convByVar({ hant: "分鐘", hans: "分钟" });
        const direction = now >= timestamp ? "前" : state_default.convByVar({ hant: "後", hans: "后" });
        relative = `${amount}${unit}${direction}`;
      }
      return `${absolute} [${relative}]`;
    }
    var init_annotation_time = __esm({
      "src/annotation_time.ts"() {
        init_state();
      }
    });
    function isEditableEventTarget(target) {
      if (!target || !(target instanceof HTMLElement)) return false;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        return !target.disabled && !target.readOnly;
      }
      return target.isContentEditable;
    }
    function onCompositionStart() {
      if (imeResetTimer !== null) {
        window.clearTimeout(imeResetTimer);
        imeResetTimer = null;
      }
      isImeComposing = true;
      lastCompositionAt = Date.now();
    }
    function onCompositionEnd() {
      lastCompositionAt = Date.now();
      if (imeResetTimer !== null) {
        window.clearTimeout(imeResetTimer);
      }
      imeResetTimer = window.setTimeout(() => {
        isImeComposing = false;
        imeResetTimer = null;
      }, 80);
    }
    function onCompositionInput(event) {
      const inputType = typeof event.inputType === "string" ? event.inputType : "";
      if (event.isComposing || inputType.startsWith("insertComposition")) {
        lastCompositionAt = Date.now();
        isImeComposing = true;
      }
    }
    function isCompositionLikelyActive() {
      if (isImeComposing) return true;
      return Date.now() - lastCompositionAt <= 500;
    }
    function onEscapeKey(event) {
      if (event.key !== "Escape") return;
      const isImeKeyEvent = event.isComposing || event.keyCode === 229;
      const editableTarget = isEditableEventTarget(event.target) || isEditableEventTarget(document.activeElement);
      if (isImeKeyEvent || editableTarget && isCompositionLikelyActive()) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
      }
    }
    function onDialogCancel(event) {
      const target = event.target;
      if (!target || target.tagName !== "DIALOG") return;
      if (!isCompositionLikelyActive()) return;
      if (!isEditableEventTarget(document.activeElement)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
    }
    function installImeEscGuard() {
      if (imeListenersInstalled) return;
      window.addEventListener("compositionstart", onCompositionStart, true);
      window.addEventListener("compositionend", onCompositionEnd, true);
      window.addEventListener("beforeinput", onCompositionInput, true);
      window.addEventListener("input", onCompositionInput, true);
      window.addEventListener("keydown", onEscapeKey, true);
      window.addEventListener("keyup", onEscapeKey, true);
      window.addEventListener("cancel", onDialogCancel, true);
      imeListenersInstalled = true;
    }
    function removeImeEscGuard() {
      if (!imeListenersInstalled) return;
      window.removeEventListener("compositionstart", onCompositionStart, true);
      window.removeEventListener("compositionend", onCompositionEnd, true);
      window.removeEventListener("beforeinput", onCompositionInput, true);
      window.removeEventListener("input", onCompositionInput, true);
      window.removeEventListener("keydown", onEscapeKey, true);
      window.removeEventListener("keyup", onEscapeKey, true);
      window.removeEventListener("cancel", onDialogCancel, true);
      if (imeResetTimer !== null) {
        window.clearTimeout(imeResetTimer);
        imeResetTimer = null;
      }
      imeListenersInstalled = false;
      isImeComposing = false;
      lastCompositionAt = 0;
    }
    async function loadCodexAndVue() {
      var _a;
      const requireModule = await mw.loader.using("@wikimedia/codex");
      const Vue = requireModule("vue");
      const Codex = requireModule("@wikimedia/codex");
      window.Vue = (_a = window.Vue) != null ? _a : Vue;
      return { Vue, Codex };
    }
    function createDialogMountIfNeeded() {
      const existing = document.getElementById(MOUNT_ID);
      if (existing) return existing;
      const mountPoint = document.createElement("div");
      mountPoint.id = MOUNT_ID;
      document.body.appendChild(mountPoint);
      return mountPoint;
    }
    function mountApp(app) {
      if (mountedApp) removeDialogMount();
      const mountPoint = createDialogMountIfNeeded();
      installImeEscGuard();
      mountedApp = app;
      return app.mount(mountPoint);
    }
    function removeDialogMount() {
      var _a;
      const app = mountedApp;
      mountedApp = null;
      app == null ? void 0 : app.unmount();
      (_a = document.getElementById(MOUNT_ID)) == null ? void 0 : _a.remove();
      removeImeEscGuard();
    }
    function closeDialogAfterTransition(onClosed) {
      const app = mountedApp;
      if (!app) return;
      window.setTimeout(() => {
        if (mountedApp !== app) return;
        removeDialogMount();
        onClosed == null ? void 0 : onClosed();
      }, CLOSE_DELAY_MS);
    }
    function registerCodexComponents(app, Codex) {
      const components = {
        "cdx-dialog": Codex.CdxDialog,
        "cdx-text-area": Codex.CdxTextArea,
        "cdx-select": Codex.CdxSelect,
        "cdx-button": Codex.CdxButton,
        "cdx-menu-button": Codex.CdxMenuButton
      };
      for (const [name, component] of Object.entries(components)) {
        if (component) app.component(name, component);
      }
    }
    var mountedApp, imeListenersInstalled, isImeComposing, imeResetTimer, lastCompositionAt, MOUNT_ID, CLOSE_DELAY_MS;
    var init_dialog = __esm({
      "src/dialog.ts"() {
        mountedApp = null;
        imeListenersInstalled = false;
        isImeComposing = false;
        imeResetTimer = null;
        lastCompositionAt = 0;
        MOUNT_ID = "review-tool-dialog-mount";
        CLOSE_DELAY_MS = 200;
      }
    });
    async function openConfirmationDialog(options) {
      const { Vue, Codex } = await loadCodexAndVue();
      if (!Codex.CdxDialog) throw new Error("Codex dialog is unavailable");
      return new Promise((resolve) => {
        const app = Vue.createMwApp({
          setup() {
            const open = Vue.ref(true);
            let settled = false;
            const settle = (confirmed) => {
              if (settled) return;
              settled = true;
              resolve(confirmed);
            };
            const close = (confirmed) => {
              if (settled) return;
              open.value = false;
              closeDialogAfterTransition();
              settle(confirmed);
            };
            Vue.onUnmounted(() => settle(false));
            return () => Vue.h(Codex.CdxDialog, {
              open: open.value,
              title: options.title,
              useCloseButton: true,
              primaryAction: { label: options.confirmLabel, actionType: "destructive" },
              defaultAction: { label: options.cancelLabel },
              class: "review-tool-dialog",
              onPrimary: () => close(true),
              onDefault: () => close(false),
              "onUpdate:open": (value) => {
                if (!value) close(false);
              }
            }, { default: () => [
              Vue.h("p", options.message),
              ...options.detail ? [Vue.h("p", options.detail)] : []
            ] });
          }
        });
        mountApp(app);
      });
    }
    var init_confirmation = __esm({
      "src/dialogs/confirmation.ts"() {
        init_dialog();
      }
    });
    async function confirmClearOnFirstActivation(pageName, clear) {
      if (activatedPages.has(pageName)) return;
      activatedPages.add(pageName);
      const { annotations } = loadAnnotations(pageName);
      if (!annotations.length) return;
      const timeRange = getAnnotationTimeRange(annotations);
      const confirmed = await openConfirmationDialog({
        title: state_default.convByVar({ hant: "開始新的評審", hans: "开始新的评审" }),
        message: state_default.convByVar({
          hant: "要清除本頁已有的批註，開始新的評審嗎？清除後可在批註列表按「復原清除」。按「取消」保留現有批註。",
          hans: "要清除本页已有的批注，开始新的评审吗？清除后可在批注列表按“撤销清除”。按“取消”保留现有批注。"
        }),
        detail: timeRange ? state_default.convByVar({
          hant: `最後修改時間：${formatAnnotationTimestamp(timeRange.last)}`,
          hans: `最后修改时间：${formatAnnotationTimestamp(timeRange.last)}`
        }) : void 0,
        confirmLabel: state_default.convByVar({ hant: "清除批註", hans: "清除批注" }),
        cancelLabel: state_default.convByVar({ hant: "取消", hans: "取消" })
      });
      if (confirmed) clear();
    }
    var activatedPages;
    var init_annotation_session = __esm({
      "src/annotation_session.ts"() {
        init_annotations();
        init_annotation_time();
        init_confirmation();
        init_state();
        activatedPages = /* @__PURE__ */ new Set();
      }
    });
    async function copyText(text) {
      var _a, _b;
      if ((_a = navigator.clipboard) == null ? void 0 : _a.writeText) {
        try {
          await navigator.clipboard.writeText(text);
          return;
        } catch {
        }
      }
      const previousFocus = document.activeElement;
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.readOnly = true;
      textarea.style.cssText = "position:fixed;opacity:0;pointer-events:none;";
      const container = (_b = previousFocus == null ? void 0 : previousFocus.closest('[role="dialog"]')) != null ? _b : document.body;
      container.appendChild(textarea);
      try {
        textarea.focus();
        textarea.select();
        if (!document.execCommand("copy")) throw new Error("Clipboard copy failed");
      } finally {
        textarea.remove();
        if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
      }
    }
    var init_clipboard = __esm({
      "src/clipboard.ts"() {
      }
    });
    function buildFootnotePermalink(revisionId, footnoteId, label) {
      if (!validRevision(revisionId) || !/^cite_ref-.+/.test(footnoteId) || !label.trim()) return null;
      return `[[Special:Permalink/${revisionId}#${escapeWikitext(footnoteId)}|${escapeWikitext(label.trim())}]]`;
    }
    function localFragment(link) {
      try {
        const url = new URL(link.href, window.location.href);
        if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || url.search && url.search !== window.location.search) return null;
        return decodeURIComponent(url.hash.slice(1));
      } catch {
        return null;
      }
    }
    function citationLink(marker) {
      var _a;
      return (_a = Array.from(marker.querySelectorAll("a[href]")).find((link) => {
        var _a2;
        return (_a2 = localFragment(link)) == null ? void 0 : _a2.startsWith("cite_note-");
      })) != null ? _a : null;
    }
    function isLocator(marker) {
      return marker.tagName === "SUP" && marker.matches(".reference") && marker.matches(".nowrap") && !marker.id.startsWith("cite_ref-") && !citationLink(marker);
    }
    function footnoteLabel(root, link, marker, citation) {
      var _a, _b;
      const label = ((_b = (_a = link.innerText) != null ? _a : link.textContent) != null ? _b : "").trim().replace(/^\[\s*|\s*\]$/g, "");
      if (!/^\d+(?:\.\d+)*$/.test(label)) return label;
      let occurrences = Array.from(new Set(Array.from(citation.querySelectorAll("a[href]")).filter((backlink) => backlink.closest('.mw-cite-backlink, [rel~="mw:referencedBy"]')).map(localFragment).filter((id) => id == null ? void 0 : id.startsWith("cite_ref-"))));
      if (occurrences.length < 2 || !occurrences.includes(marker.id)) {
        occurrences = Array.from(new Set(Array.from(root.querySelectorAll(REFERENCE_MARKER_SELECTOR)).filter((item) => {
          const anchor = citationLink(item);
          return item.id.startsWith("cite_ref-") && anchor && localFragment(anchor) === citation.id;
        }).map((item) => item.id)));
      }
      const index = occurrences.indexOf(marker.id);
      if (occurrences.length < 2 || index < 0) return label;
      let suffix = "";
      for (let number = index + 1; number > 0; number = Math.floor((number - 1) / 26)) {
        suffix = String.fromCharCode(97 + (number - 1) % 26) + suffix;
      }
      return label + suffix;
    }
    function webUrl(href) {
      try {
        const url = new URL(href, window.location.href);
        return /^https?:$/.test(url.protocol) ? url : null;
      } catch {
        return null;
      }
    }
    function archiveUrl(url) {
      return /(^|\.)(?:web\.archive\.org|archive\.(?:today|is|ph|vn|md|fo|li)|webcitation\.org|perma\.cc)$/.test(url.hostname);
    }
    function externalLink(url, label) {
      const href = url.href.replace(/[\s<>[\]{}|]/g, (character) => encodeURIComponent(character));
      return `[${href} ${escapeWikitext(label)}]`;
    }
    function archiveMonth(text, url) {
      var _a;
      const numericDate = (_a = text.match(/存[檔档]\s*[於于]\s*(\d{4})(?:-|年\s*)(\d{1,2})/)) != null ? _a : text.match(/archived(?:\s+from\s+the\s+original)?(?:\s*\([^)]*\))?\s+on\s+(\d{4})-(\d{1,2})/i);
      const englishDate = text.match(/archived(?:\s+from\s+the\s+original)?(?:\s*\([^)]*\))?\s+on\s+(?:\d{1,2}\s+)?([a-z]+)\.?\s+(?:\d{1,2},?\s+)?(\d{4})/i);
      const timestamp = url.pathname.match(/^\/(?:web\/)?(\d{4})(\d{2})\d{2}\d*(?:[a-z_]+)?\//);
      const dates = [
        numericDate && [Number(numericDate[1]), Number(numericDate[2])],
        englishDate && [Number(englishDate[2]), ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(englishDate[1].slice(0, 3).toLowerCase()) + 1],
        timestamp && [Number(timestamp[1]), Number(timestamp[2])]
      ];
      const date = dates.find((value) => value && value[0] > 0 && value[1] >= 1 && value[1] <= 12);
      return date ? `${date[0]}年${date[1]}月` : null;
    }
    function citationDetails(reference, format) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
      const content = (_a = reference.querySelector(".reference-text, .mw-reference-text")) != null ? _a : reference;
      const citation = (_c = (_b = content.querySelector(".citation")) != null ? _b : content.querySelector("cite")) != null ? _c : content;
      const links = Array.from(citation.querySelectorAll("a[href]")).flatMap((link) => {
        var _a2;
        if (!link.matches(".external") && !((_a2 = link.getAttribute("rel")) == null ? void 0 : _a2.split(/\s+/).includes("mw:ExtLink"))) return [];
        if (link.closest('.mw-cite-backlink, .cs1-maint, .cs1-visible-error, .mw-editsection, button, [role="button"], [role="menu"], [role="tooltip"], [data-gadget], [data-widget]') || link.matches(".extiw")) return [];
        const url = webUrl(link.href);
        return url && url.origin !== window.location.origin ? [{ link, url }] : [];
      });
      const archive = links.find(({ url }) => archiveUrl(url));
      const original = (_d = links.find(({ link, url }) => {
        var _a2;
        return !archiveUrl(url) && /^(?:原始(?:內容|内容|文獻|文献)|the original|original)(?:\s|$)/i.test(((_a2 = link.textContent) != null ? _a2 : "").trim());
      })) != null ? _d : links.find(({ url }) => !archiveUrl(url));
      const embeddedOriginal = (_e = archive == null ? void 0 : archive.url.href.match(/\/(https?:\/\/.+)$/)) == null ? void 0 : _e[1];
      const source = (_f = original == null ? void 0 : original.url) != null ? _f : embeddedOriginal ? webUrl(embeddedOriginal) : null;
      const details = [];
      if (source) details.push(externalLink(source, source.hostname.replace(/^www\./, "")));
      if (archive) {
        const text = (_h = (_g = citation.innerText) != null ? _g : citation.textContent) != null ? _h : "";
        const archiveDate = archiveMonth(text, archive.url);
        const archiveLabel = format === "comment" ? `${archiveDate != null ? archiveDate : ""}存` : state_default.convByVar({
          hant: archiveDate ? `存檔於${archiveDate}` : "存檔",
          hans: archiveDate ? `存档于${archiveDate}` : "存档"
        });
        details.push(externalLink(archive.url, archiveLabel));
      }
      const titleLink = (_j = (_i = [original, archive].find((item) => {
        var _a2;
        return item && !/^(?:原始(?:內容|内容|文獻|文献)|存[檔档]|the original|original|archived?)(?:\s|$)/i.test(((_a2 = item.link.textContent) != null ? _a2 : "").trim());
      })) != null ? _i : original) != null ? _j : archive;
      const title = ((titleLink == null ? void 0 : titleLink.link.textContent) || citation.textContent || "").replace(/\s+/g, " ").trim();
      const wikitext = !details.length ? "" : format === "comment" ? `<small>（${details.join("，")}）</small>` : ` <small>(${details.join(", ")})</small>`;
      return {
        wikitext,
        title,
        url: (_l = (_k = titleLink == null ? void 0 : titleLink.url.href) != null ? _k : source == null ? void 0 : source.href) != null ? _l : null
      };
    }
    function getReferenceLinkData(root, marker, format = "footnote") {
      var _a;
      const link = citationLink(marker);
      const referenceId = link ? localFragment(link) : null;
      const target = referenceId ? document.getElementById(referenceId) : null;
      const revisionId = mw.config.get("wgRevisionId");
      if (!validRevision(revisionId) || !referenceId || !/^cite_note-.+/.test(referenceId) || !root.contains(marker) || !target || !root.contains(target)) return null;
      const label = footnoteLabel(root, link, marker, target);
      const footnote = buildFootnotePermalink(revisionId, marker.id, format === "comment" ? `Ref. ${label}` : label);
      const details = citationDetails(target, format);
      return {
        footnote: footnote ? footnote + details.wikitext : null,
        label,
        title: details.title || state_default.convByVar({ hant: `註腳 ${label}`, hans: `脚注 ${label}` }),
        url: (_a = details.url) != null ? _a : new URL(`#${encodeURIComponent(referenceId)}`, window.location.href).href
      };
    }
    function installReferenceLinkTips(root) {
      const tip = document.createElement("span");
      tip.className = "review-tool-reference-tip";
      tip.hidden = true;
      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "review-tool-reference-trigger";
      trigger.textContent = state_default.convByVar({ hant: "複製 ▾", hans: "复制 ▾" });
      trigger.title = state_default.convByVar({ hant: "複製", hans: "复制" });
      trigger.setAttribute("aria-haspopup", "menu");
      trigger.setAttribute("aria-expanded", "false");
      const menu = document.createElement("span");
      menu.className = "review-tool-reference-menu";
      menu.setAttribute("role", "menu");
      menu.setAttribute("aria-label", state_default.convByVar({ hant: "註腳複製選單", hans: "脚注复制菜单" }));
      menu.hidden = true;
      let actionButtons = [];
      const makeAction = (label, text) => {
        const action = document.createElement("button");
        action.type = "button";
        action.textContent = label;
        action.setAttribute("role", "menuitem");
        action.tabIndex = -1;
        action.disabled = !text;
        action.title = text != null ? text : "";
        action.onclick = (event) => copy(event, text);
        menu.appendChild(action);
        actionButtons.push(action);
      };
      tip.append(trigger, menu);
      let activeLink = null;
      let activeMarkers = [];
      const closeMenu = (restoreFocus = false) => {
        menu.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
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
      const linkData = (link) => {
        const marker = link.closest(REFERENCE_MARKER_SELECTOR);
        return marker && citationLink(marker) === link ? getReferenceLinkData(root, marker) : null;
      };
      const adjacentMarker = (marker, direction) => {
        var _a, _b;
        let node = marker;
        while (node) {
          while (!node[direction] && ((_a = node.parentElement) == null ? void 0 : _a.matches(".sentence"))) node = node.parentElement;
          node = node[direction];
          while (node instanceof Element && node.matches(".sentence") && node.firstChild) {
            node = direction === "nextSibling" ? node.firstChild : node.lastChild;
          }
          if (!node) return null;
          if (node === tip || node.nodeType === Node.COMMENT_NODE || node.nodeType === Node.TEXT_NODE && !((_b = node.textContent) == null ? void 0 : _b.trim()) || node instanceof Element && node.matches(".sentence") && !node.firstChild) continue;
          return node instanceof Element && root.contains(node) && node.matches(REFERENCE_MARKER_SELECTOR) ? node : null;
        }
        return null;
      };
      const show = (event) => {
        if (!(event.target instanceof Element)) return;
        const link = event.target.closest("a[href]");
        const marker = link == null ? void 0 : link.closest(REFERENCE_MARKER_SELECTOR);
        if (!link || !marker || !root.contains(link) || isLocator(marker)) return;
        const data = linkData(link);
        if (!data) {
          hide();
          return;
        }
        const markers = [marker];
        let sibling = marker;
        while (sibling = adjacentMarker(sibling, "previousSibling")) markers.unshift(sibling);
        sibling = marker;
        while (sibling = adjacentMarker(sibling, "nextSibling")) markers.push(sibling);
        activeLink = link;
        if (!menu.hidden && markers.length === activeMarkers.length && markers.every((item, index) => item === activeMarkers[index])) return;
        const references = markers.filter((item) => !isLocator(item)).map((item) => {
          const anchor = citationLink(item);
          return anchor ? linkData(anchor) : null;
        });
        closeMenu();
        activeMarkers = markers;
        menu.replaceChildren();
        actionButtons = [];
        for (const reference of references) {
          if (!reference) continue;
          makeAction(state_default.convByVar({
            hant: `複製${reference.label}`,
            hans: `复制${reference.label}`
          }), reference.footnote);
        }
        const links = references.map((reference) => reference == null ? void 0 : reference.footnote);
        if (links.length > 1 && links.every(Boolean)) {
          makeAction(state_default.convByVar({ hant: "複製本組", hans: "复制本组" }), links.join(", "));
        }
        trigger.setAttribute("aria-label", references.length > 1 ? state_default.convByVar({
          hant: "複製本組",
          hans: "复制本组"
        }) : state_default.convByVar({
          hant: `複製${data.label}`,
          hans: `复制${data.label}`
        }));
        const lastMarker = markers[markers.length - 1];
        if (lastMarker.nextSibling !== tip) lastMarker.after(tip);
        tip.hidden = false;
      };
      const actions = () => actionButtons.filter((button) => !button.disabled);
      const positionMenu = () => {
        var _a;
        if (menu.hidden) return;
        const anchor = trigger.getBoundingClientRect();
        const bounds = menu.getBoundingClientRect();
        const gap = 4;
        const maxLeft = Math.max(gap, window.innerWidth - bounds.width - gap);
        const maxTop = Math.max(gap, window.innerHeight - bounds.height - gap);
        const previews = Array.from(document.querySelectorAll(".rt-tooltip, .mwe-popups")).map((preview) => preview.getBoundingClientRect()).filter((rect) => rect.width && rect.height);
        const candidates = [
          { left: anchor.left, top: anchor.bottom + gap },
          { left: anchor.left, top: anchor.top - bounds.height - gap },
          ...previews.flatMap((rect) => [
            { left: rect.right + gap, top: anchor.bottom + gap },
            { left: rect.left - bounds.width - gap, top: anchor.bottom + gap },
            { left: anchor.left, top: rect.bottom + gap },
            { left: anchor.left, top: rect.top - bounds.height - gap }
          ])
        ].map((point) => ({ left: Math.max(gap, Math.min(point.left, maxLeft)), top: Math.max(gap, Math.min(point.top, maxTop)) }));
        const position = (_a = candidates.find((point) => previews.every((rect) => point.left + bounds.width <= rect.left || point.left >= rect.right || point.top + bounds.height <= rect.top || point.top >= rect.bottom))) != null ? _a : candidates[0];
        menu.style.left = `${position.left}px`;
        menu.style.top = `${position.top}px`;
      };
      const openMenu = (last = false) => {
        var _a;
        menu.hidden = false;
        trigger.setAttribute("aria-expanded", "true");
        positionMenu();
        const buttons = actions();
        (_a = buttons[last ? buttons.length - 1 : 0]) == null ? void 0 : _a.focus();
      };
      trigger.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (menu.hidden) openMenu();
        else closeMenu(true);
      };
      trigger.onkeydown = (event) => {
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
        event.preventDefault();
        event.stopPropagation();
        openMenu(event.key === "ArrowUp");
      };
      menu.onkeydown = (event) => {
        var _a;
        if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        event.stopPropagation();
        const buttons = actions();
        const current = buttons.indexOf(document.activeElement);
        const index = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (current + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length;
        (_a = buttons[index]) == null ? void 0 : _a.focus();
      };
      const onKeyDown = (event) => {
        if (event.key === "Tab" && !menu.hidden) closeMenu(true);
        if (event.key !== "Escape" || tip.hidden) return;
        if (!menu.hidden) {
          closeMenu(true);
        } else {
          if (tip.contains(document.activeElement)) activeLink == null ? void 0 : activeLink.focus();
          hide();
        }
      };
      const onOutsidePointer = (event) => {
        if (!(event.target instanceof Node) || !tip.contains(event.target)) closeMenu();
      };
      const onFocusOut = (event) => {
        if (!(event.relatedTarget instanceof Node) || !tip.contains(event.relatedTarget)) closeMenu();
      };
      tip.onclick = (event) => event.stopPropagation();
      tip.addEventListener("focusout", onFocusOut);
      const copy = (event, text) => {
        event.preventDefault();
        event.stopPropagation();
        if (!text) return;
        closeMenu(true);
        void copyText(text).then(() => {
          mw.notify(state_default.convByVar({ hant: "已複製永久連結。", hans: "已复制永久链接。" }), { tag: "review-tool-reference" });
        }).catch((error) => {
          console.error("[ReviewTool] Failed to copy reference link", error);
          mw.notify(state_default.convByVar({ hant: "無法複製連結，請檢查剪貼簿權限後重試。", hans: "无法复制链接，请检查剪贴板权限后重试。" }), {
            type: "error",
            tag: "review-tool-reference"
          });
        });
      };
      root.addEventListener("mouseover", show, { capture: true });
      root.addEventListener("focusin", show, { capture: true });
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("pointerdown", onOutsidePointer);
      window.addEventListener("scroll", positionMenu, { capture: true });
      window.addEventListener("resize", positionMenu);
      return () => {
        hide();
        root.removeEventListener("mouseover", show, { capture: true });
        root.removeEventListener("focusin", show, { capture: true });
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("pointerdown", onOutsidePointer);
        window.removeEventListener("scroll", positionMenu, { capture: true });
        window.removeEventListener("resize", positionMenu);
        tip.removeEventListener("focusout", onFocusOut);
        tip.remove();
      };
    }
    var REFERENCE_MARKER_SELECTOR, REFERENCE_CONTROLS_SELECTOR, escapeWikitext, validRevision;
    var init_reference_links = __esm({
      "src/dom/reference_links.ts"() {
        init_clipboard();
        init_state();
        REFERENCE_MARKER_SELECTOR = ".reference, .mw-ref";
        REFERENCE_CONTROLS_SELECTOR = ".review-tool-reference-tip";
        escapeWikitext = (text) => text.replace(/[&<>[\]{}|\r\n]/g, (character) => `&#${character.charCodeAt(0)};`);
        validRevision = (revisionId) => Number.isSafeInteger(revisionId) && revisionId > 0;
      }
    });
    function buildArticleTextIndex(root) {
      const segments = [];
      let text = "";
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: (node2) => {
          var _a;
          return ((_a = node2.parentElement) == null ? void 0 : _a.closest(EXCLUDED_TEXT)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        }
      });
      let node;
      while (node = walker.nextNode()) {
        const value = node.data;
        const offsets = [];
        const characters = value.replace(/\s/g, "");
        if (!characters) continue;
        for (let i = 0; i < value.length; i++) {
          if (!/\s/.test(value[i])) offsets.push(i);
        }
        segments.push({ node, start: text.length, offsets });
        text += characters;
      }
      return { text, segments };
    }
    function captureAnnotationAnchor(index, range) {
      let start;
      let end = 0;
      for (const { node, start: segmentStart, offsets } of index.segments) {
        if (!range.intersectsNode(node)) continue;
        for (const [characterIndex, offset] of offsets.entries()) {
          if (range.comparePoint(node, offset) < 0) continue;
          if (range.comparePoint(node, offset + 1) > 0) break;
          if (start === void 0) start = segmentStart + characterIndex;
          end = segmentStart + characterIndex + 1;
        }
      }
      return start === void 0 ? void 0 : { start, end, quote: index.text.slice(start, end) };
    }
    function rangeAt(index, start, end) {
      const first = index.segments.find((segment) => start >= segment.start && start < segment.start + segment.offsets.length);
      const last = index.segments.find((segment) => end > segment.start && end <= segment.start + segment.offsets.length);
      if (!first || !last) return null;
      const range = document.createRange();
      range.setStart(first.node, first.offsets[start - first.start]);
      range.setEnd(last.node, last.offsets[end - last.start - 1] + 1);
      return range;
    }
    function findAnnotationRange(index, annotation, sectionPathForNode) {
      const anchor = annotation.textAnchor;
      if (anchor) {
        return index.text.slice(anchor.start, anchor.end) === anchor.quote ? rangeAt(index, anchor.start, anchor.end) : null;
      }
      const quote = annotation.sentenceText.replace(/\s/g, "");
      if (!quote) return null;
      const matches = [];
      let start = index.text.indexOf(quote);
      while (start !== -1) {
        const range = rangeAt(index, start, start + quote.length);
        if (range) matches.push(range);
        start = index.text.indexOf(quote, start + 1);
      }
      if (matches.length === 1) return matches[0];
      const inSection = matches.filter((range) => sectionPathForNode(range.startContainer) === annotation.sectionPath);
      return inSection.length === 1 ? inSection[0] : null;
    }
    var EXCLUDED_TEXT;
    var init_annotation_anchor = __esm({
      "src/dom/annotation_anchor.ts"() {
        EXCLUDED_TEXT = [
          "script",
          "style",
          "noscript",
          "textarea",
          "button",
          "input",
          "select",
          ".reference",
          ".mw-ref",
          ".citation",
          ".ref",
          ".reference-text",
          ".reference-note",
          "[data-reference]",
          "[data-ref]",
          ".mw-editsection",
          ".qeec-ref-tag-copy-btn",
          "ipe-quick-edit",
          ".ipe__in-article-link",
          ".ipe-quick-edit",
          ".ipe-quick-edit--create-only",
          ".review-tool-inline-annotation",
          ".floating-button",
          ".review-tool-global-button",
          ".review-tool-dialog",
          ".review-tool-reference-tip"
        ].join(",");
      }
    });
    function shouldTreatHalfWidthTerminators(lang) {
      if (!lang) return false;
      return !(lang.startsWith("zh") || lang.startsWith("ja"));
    }
    function getSentenceTerminatorRegex(allowHalfWidth) {
      const terminators = allowHalfWidth ? "。！？?!…." : "。！？…";
      return new RegExp(`[」』】〗〕\\)\\]\\}\\"'’”〉》]*[${terminators}]+[」』】〗〕\\)\\]\\}\\"'’”〉》]*`, "g");
    }
    function splitTextToPartsSimple(text, allowHalfWidth) {
      const terminators = allowHalfWidth ? "。！？!?；;」』】〗〕\\]］}｝\\." : "。！？；;」』】〗〕\\]］}｝";
      const re = new RegExp(`(?<=[${terminators}])\\s*`, "g");
      return text.split(re).filter((p) => p.trim());
    }
    function splitTextIntoRanges(text, lang) {
      const ranges = [];
      if (!text || !text.trim()) return ranges;
      const re = getSentenceTerminatorRegex(shouldTreatHalfWidthTerminators(lang));
      let lastIndex = 0;
      while (re.exec(text) !== null) {
        const endPos = re.lastIndex;
        const part = text.slice(lastIndex, endPos);
        if (part.trim()) ranges.push({ start: lastIndex, end: endPos });
        lastIndex = endPos;
      }
      if (lastIndex < text.length) {
        const tail = text.slice(lastIndex);
        if (tail.trim()) ranges.push({ start: lastIndex, end: text.length });
      }
      if (ranges.length <= 1) {
        const alt = [];
        const altRe = new RegExp(`${getSentenceTerminatorRegex(shouldTreatHalfWidthTerminators(lang)).source}|(?:\\r?\\n)+|(?:\\s{2,})`, "g");
        let last = 0;
        while (altRe.exec(text) !== null) {
          const endPos = altRe.lastIndex;
          const part = text.slice(last, endPos);
          if (part.trim()) alt.push({ start: last, end: endPos });
          last = endPos;
        }
        if (last < text.length) {
          const tail2 = text.slice(last);
          if (tail2.trim()) alt.push({ start: last, end: text.length });
        }
        if (alt.length > 1) {
          return alt;
        }
      }
      return ranges;
    }
    var init_sentences = __esm({
      "src/dom/sentences.ts"() {
      }
    });
    function collectRelatedSources(root, selection) {
      var _a, _b, _c;
      if (!selection || !root.contains(selection.startContainer) || !root.contains(selection.endContainer)) return [];
      const blocks = /* @__PURE__ */ new Map();
      const sources = [];
      const seen = /* @__PURE__ */ new Set();
      for (const marker of Array.from(root.querySelectorAll(REFERENCE_MARKER_SELECTOR))) {
        const block = (_a = marker.closest("p, li, td, th, dd, dt, blockquote")) != null ? _a : marker.parentElement;
        if (!block || !root.contains(block) || !selection.intersectsNode(block)) continue;
        let context = blocks.get(block);
        if (!context) {
          const index = buildArticleTextIndex(block);
          const anchor = captureAnnotationAnchor(index, selection);
          const lang = (_c = (_b = block.closest("[lang]")) == null ? void 0 : _b.getAttribute("lang")) != null ? _c : document.documentElement.lang;
          const sentences = anchor ? splitTextIntoRanges(index.text, lang).filter((sentence) => sentence.start < anchor.end && sentence.end > anchor.start) : [];
          context = { index, sentences };
          blocks.set(block, context);
        }
        let position = 0;
        for (const segment of context.index.segments) {
          if (!(marker.compareDocumentPosition(segment.node) & Node.DOCUMENT_POSITION_PRECEDING)) break;
          position = segment.start + segment.offsets.length;
        }
        if (!context.sentences.some((sentence) => position > sentence.start && position <= sentence.end)) continue;
        const data = getReferenceLinkData(root, marker, "comment");
        if (!(data == null ? void 0 : data.footnote) || seen.has(marker.id)) continue;
        seen.add(marker.id);
        sources.push({ label: data.label, title: data.title, url: data.url, wikitext: data.footnote });
      }
      return sources;
    }
    var init_related_sources = __esm({
      "src/dom/related_sources.ts"() {
        init_annotation_anchor();
        init_reference_links();
        init_sentences();
      }
    });
    function continueCommentList(textarea) {
      const caret = textarea.selectionStart;
      const newline = caret - 1;
      if (textarea.value[newline] !== "\n") return;
      const lineStart = textarea.value.slice(0, newline).lastIndexOf("\n") + 1;
      const previousLine = textarea.value.slice(lineStart, newline);
      if (!previousLine.trim()) return;
      const bullet = previousLine.match(/^([ \t]*)(\*+)[ \t]*/);
      const marker = bullet ? `${bullet[1]}${bullet[2]} ` : "* ";
      const firstComment = bullet ? previousLine : `* ${previousLine}`;
      const nextCaret = caret + firstComment.length - previousLine.length + marker.length;
      textarea.value = `${textarea.value.slice(0, lineStart) + firstComment}
${marker}${textarea.value.slice(caret)}`;
      textarea.setSelectionRange(nextCaret, nextCaret);
    }
    function expandShortcuts(textarea) {
      const changes = [];
      const value = textarea.value.replace(/<<([^<>]+)>>/g, (match, content, offset) => {
        const replacement = `「{{仿宋体|1=${content}}}」`;
        changes.push({ offset, length: match.length, replacementLength: replacement.length });
        return replacement;
      });
      if (!changes.length) return false;
      const mapPosition = (position) => {
        let shift = 0;
        for (const change of changes) {
          if (position <= change.offset) break;
          if (position < change.offset + change.length) {
            return change.offset + shift + change.replacementLength;
          }
          shift += change.replacementLength - change.length;
        }
        return position + shift;
      };
      const start = mapPosition(textarea.selectionStart);
      const end = mapPosition(textarea.selectionEnd);
      const direction = textarea.selectionDirection;
      textarea.value = value;
      textarea.setSelectionRange(start, end, direction);
      return true;
    }
    var cleanupHandlers, commentShortcuts;
    var init_comment_shortcuts = __esm({
      "src/dialogs/comment_shortcuts.ts"() {
        cleanupHandlers = /* @__PURE__ */ new WeakMap();
        commentShortcuts = {
          mounted(element) {
            const textarea = element.querySelector("textarea");
            if (!textarea) return;
            let composing = false;
            const onCompositionStart2 = () => {
              composing = true;
            };
            const onInput = (event) => {
              const inputEvent = event;
              if (composing || inputEvent.isComposing) return;
              if (inputEvent.inputType === "insertLineBreak" || inputEvent.inputType === "insertParagraph") {
                continueCommentList(textarea);
              }
              expandShortcuts(textarea);
            };
            const onCompositionEnd2 = () => {
              composing = false;
              if (expandShortcuts(textarea)) {
                textarea.dispatchEvent(new Event("input", { bubbles: true }));
              }
            };
            textarea.addEventListener("input", onInput, true);
            textarea.addEventListener("compositionstart", onCompositionStart2);
            textarea.addEventListener("compositionend", onCompositionEnd2);
            cleanupHandlers.set(element, () => {
              textarea.removeEventListener("input", onInput, true);
              textarea.removeEventListener("compositionstart", onCompositionStart2);
              textarea.removeEventListener("compositionend", onCompositionEnd2);
            });
          },
          unmounted(element) {
            var _a;
            (_a = cleanupHandlers.get(element)) == null ? void 0 : _a();
            cleanupHandlers.delete(element);
          }
        };
      }
    });
    function render(_ctx, _cache, $props, $setup, $data, $options) {
      const { toDisplayString: _toDisplayString, createElementVNode: _createElementVNode, renderList: _renderList, Fragment: _Fragment, openBlock: _openBlock, createElementBlock: _createElementBlock, withModifiers: _withModifiers, withKeys: _withKeys, createTextVNode: _createTextVNode, createCommentVNode: _createCommentVNode, resolveComponent: _resolveComponent, withCtx: _withCtx, createVNode: _createVNode, withDirectives: _withDirectives, createBlock: _createBlock } = window.Vue;
      const _component_cdx_button = _resolveComponent("cdx-button");
      const _component_cdx_text_area = _resolveComponent("cdx-text-area");
      const _component_cdx_dialog = _resolveComponent("cdx-dialog");
      return _openBlock(), _createBlock(_component_cdx_dialog, {
        open: $setup.open,
        "onUpdate:open": [
          _cache[2] || (_cache[2] = ($event) => $setup.open = $event),
          $setup.onUpdateOpen
        ],
        title: $setup.dialogTitle,
        "use-close-button": true,
        class: "review-tool-dialog review-tool-annotation-editor-dialog"
      }, {
        footer: _withCtx(() => [
          _createElementVNode("div", { class: "review-tool-annotation-editor__footer" }, [
            $setup.props.allowDelete ? (_openBlock(), _createBlock(_component_cdx_button, {
              key: 0,
              weight: "quiet",
              action: "destructive",
              title: $setup.i18n.delete,
              class: "review-tool-annotation-editor__delete",
              onClick: _withModifiers($setup.onDeleteClick, ["prevent"])
            }, {
              default: _withCtx(() => [
                _createElementVNode(
                  "span",
                  { class: "review-tool-control-label" },
                  _toDisplayString($setup.i18n.delete),
                  1
                  /* TEXT */
                )
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title"])) : _createCommentVNode("v-if", true),
            _createElementVNode("div", { class: "review-tool-annotation-editor__actions" }, [
              _createVNode(_component_cdx_button, {
                weight: "quiet",
                title: $setup.i18n.cancel,
                onClick: _withModifiers($setup.onCancelAction, ["prevent"])
              }, {
                default: _withCtx(() => [
                  _createElementVNode(
                    "span",
                    { class: "review-tool-control-label" },
                    _toDisplayString($setup.i18n.cancel),
                    1
                    /* TEXT */
                  )
                ]),
                _: 1
                /* STABLE */
              }, 8, ["title"]),
              _createVNode(_component_cdx_button, {
                action: "progressive",
                weight: "primary",
                title: $setup.primaryLabel,
                disabled: !$setup.canSave,
                onClick: _withModifiers($setup.onPrimaryAction, ["prevent"])
              }, {
                default: _withCtx(() => [
                  _createElementVNode(
                    "span",
                    { class: "review-tool-control-label" },
                    _toDisplayString($setup.primaryLabel),
                    1
                    /* TEXT */
                  )
                ]),
                _: 1
                /* STABLE */
              }, 8, ["title", "disabled"])
            ])
          ])
        ]),
        default: _withCtx(() => [
          _createElementVNode("div", { class: "review-tool-form-section" }, [
            _createElementVNode(
              "div",
              { class: "review-tool-annotation-editor__label" },
              _toDisplayString($setup.i18n.sectionLabel),
              1
              /* TEXT */
            ),
            _createElementVNode(
              "div",
              { class: "review-tool-annotation-editor__section" },
              _toDisplayString($setup.props.sectionPath),
              1
              /* TEXT */
            )
          ]),
          _createElementVNode("div", { class: "review-tool-form-section" }, [
            _createElementVNode(
              "div",
              {
                id: "annotation-sentence-label",
                class: "review-tool-annotation-editor__label"
              },
              _toDisplayString($setup.i18n.sentenceLabel),
              1
              /* TEXT */
            ),
            _createElementVNode(
              "div",
              {
                class: "review-tool-annotation-editor__quote",
                role: "region",
                "aria-labelledby": "annotation-sentence-label",
                tabindex: "0"
              },
              _toDisplayString($setup.props.sentenceText),
              1
              /* TEXT */
            )
          ]),
          $setup.props.relatedSources.length ? (_openBlock(), _createElementBlock("div", {
            key: 0,
            class: "review-tool-form-section"
          }, [
            _createElementVNode(
              "div",
              {
                id: "annotation-sources-label",
                class: "review-tool-annotation-editor__label"
              },
              _toDisplayString($setup.i18n.sourcesLabel),
              1
              /* TEXT */
            ),
            _createElementVNode("ul", {
              class: "review-tool-annotation-editor__sources",
              "aria-labelledby": "annotation-sources-label"
            }, [
              (_openBlock(true), _createElementBlock(
                _Fragment,
                null,
                _renderList($setup.props.relatedSources, (source) => {
                  return _openBlock(), _createElementBlock("li", {
                    key: source.wikitext
                  }, [
                    _createElementVNode("a", {
                      href: source.url,
                      target: "_blank",
                      rel: "noopener noreferrer"
                    }, _toDisplayString(source.title), 9, ["href"]),
                    _createElementVNode("span", { class: "review-tool-source-copy" }, [
                      _createTextVNode("["),
                      _createElementVNode("a", {
                        href: "#",
                        title: `${$setup.i18n.copySource}${source.label}`,
                        "aria-label": `${$setup.i18n.copySource}${source.label}`,
                        onClick: _withModifiers(($event) => $setup.copySource(source), ["prevent"]),
                        onKeydown: _withKeys(_withModifiers(($event) => $setup.copySource(source), ["prevent"]), ["space"])
                      }, _toDisplayString($setup.i18n.copySource) + _toDisplayString(source.label), 41, ["title", "aria-label", "onClick", "onKeydown"]),
                      _createTextVNode("]")
                    ]),
                    $setup.failedSourceWikitext === source.wikitext ? (_openBlock(), _createElementBlock(
                      "code",
                      { key: 0 },
                      _toDisplayString(source.wikitext),
                      1
                      /* TEXT */
                    )) : _createCommentVNode("v-if", true)
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            _createElementVNode(
              "div",
              {
                role: "status",
                class: "review-tool-annotation-editor__sources-hint"
              },
              _toDisplayString($setup.sourceCopyStatus),
              1
              /* TEXT */
            )
          ])) : _createCommentVNode("v-if", true),
          _withDirectives((_openBlock(), _createElementBlock("div", {
            ref: "opinionField",
            class: "review-tool-form-section"
          }, [
            _createElementVNode(
              "label",
              {
                class: "review-tool-annotation-editor__label",
                for: "annotation-opinion-input"
              },
              _toDisplayString($setup.i18n.opinionLabel),
              1
              /* TEXT */
            ),
            _createElementVNode("div", {
              class: "review-tool-annotation-editor__quick-input",
              role: "group",
              "aria-label": $setup.i18n.quickInput
            }, [
              (_openBlock(), _createElementBlock(
                _Fragment,
                null,
                _renderList($setup.quickInputs, (input) => {
                  return _createVNode(_component_cdx_button, {
                    key: input.openTag,
                    type: "button",
                    size: "small",
                    title: `${input.openTag}…${input.closeTag}`,
                    onMousedown: _cache[0] || (_cache[0] = _withModifiers(() => {
                    }, ["prevent"])),
                    onClick: ($event) => $setup.insertCommentMarkup(input.openTag, input.closeTag)
                  }, {
                    default: _withCtx(() => [
                      _createTextVNode(
                        _toDisplayString(input.label),
                        1
                        /* TEXT */
                      )
                    ]),
                    _: 2
                    /* DYNAMIC */
                  }, 1032, ["title", "onClick"]);
                }),
                64
                /* STABLE_FRAGMENT */
              ))
            ], 8, ["aria-label"]),
            _createVNode(_component_cdx_text_area, {
              id: "annotation-opinion-input",
              modelValue: $setup.opinion,
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.opinion = $event),
              rows: "5",
              placeholder: $setup.i18n.opinionPlaceholder
            }, null, 8, ["modelValue", "placeholder"]),
            $setup.showValidationError ? (_openBlock(), _createElementBlock(
              "div",
              {
                key: 0,
                class: "review-tool-annotation-editor__error"
              },
              _toDisplayString($setup.i18n.opinionRequired),
              1
              /* TEXT */
            )) : _createCommentVNode("v-if", true)
          ])), [
            [$setup["vCommentShortcuts"]]
          ])
        ]),
        _: 1
        /* STABLE */
      }, 8, ["open", "title"]);
    }
    var _defineComponent, ref, computed, watch, __sfc__, annotation_editor_default;
    var init_annotation_editor = __esm({
      "src/dialogs/components/annotation_editor.vue"() {
        init_state();
        init_dialog();
        init_comment_shortcuts();
        init_clipboard();
        _defineComponent = (...args) => {
          var _a, _b, _c;
          return (_c = (_b = (_a = window.Vue) == null ? void 0 : _a.defineComponent) == null ? void 0 : _b.call(_a, ...args)) != null ? _c : args[0];
        };
        ref = (...args) => window.Vue.ref(...args);
        computed = (...args) => window.Vue.computed(...args);
        watch = (...args) => window.Vue.watch(...args);
        __sfc__ = _defineComponent({
          __name: "annotation_editor",
          props: {
            mode: { type: String, required: false, default: "create" },
            sectionPath: { type: String, required: false, default: "" },
            sentenceText: { type: String, required: false, default: "" },
            relatedSources: { type: Array, required: false, default: () => [] },
            initialOpinion: { type: String, required: false, default: "" },
            allowDelete: { type: Boolean, required: false, default: false },
            onResolve: { type: Function, required: false, default: void 0 }
          },
          setup(__props, { expose: __expose }) {
            __expose();
            function buildI18n() {
              return {
                titleCreate: state_default.convByVar({ hant: "新增批註", hans: "新增批注" }),
                titleEdit: state_default.convByVar({ hant: "編輯批註", hans: "编辑批注" }),
                sectionLabel: state_default.convByVar({ hant: "章節：", hans: "章节：" }),
                sentenceLabel: state_default.convByVar({ hant: "句子：", hans: "句子：" }),
                sourcesLabel: state_default.convByVar({ hant: "相關來源", hans: "相关来源" }),
                copySource: state_default.convByVar({ hant: "複製", hans: "复制" }),
                sourceCopied: state_default.convByVar({ hant: "已複製。", hans: "已复制。" }),
                sourceCopyFailed: state_default.convByVar({ hant: "無法複製，請選取連結文字手動複製。", hans: "无法复制，请选取链接文字手动复制。" }),
                opinionLabel: state_default.convByVar({ hant: "批註內容", hans: "批注内容" }),
                opinionPlaceholder: state_default.convByVar({ hant: "請輸入批註內容…", hans: "请输入批注内容…" }),
                opinionRequired: state_default.convByVar({ hant: "批註內容不能為空", hans: "批注内容不能为空" }),
                quickInput: state_default.convByVar({ hant: "快速輸入", hans: "快速输入" }),
                smallText: state_default.convByVar({ hant: "小字", hans: "小字" }),
                joking: state_default.convByVar({ hant: "開玩笑的", hans: "开玩笑的" }),
                cancel: state_default.convByVar({ hant: "取消", hans: "取消" }),
                save: state_default.convByVar({ hant: "儲存", hans: "保存" }),
                create: state_default.convByVar({ hant: "新增", hans: "新增" }),
                delete: state_default.convByVar({ hant: "刪除", hans: "删除" }),
                deleteConfirm: state_default.convByVar({ hant: "確定要刪除這條批註？", hans: "确定要删除这条批注？" })
              };
            }
            const props = __props;
            const i18n = buildI18n();
            const quickInputs = [
              { label: i18n.smallText, openTag: "<small>", closeTag: "</small>" },
              {
                label: i18n.joking,
                openTag: '<span title="開玩笑的" style="color: grey; text-decoration: line-through">',
                closeTag: "</span>"
              }
            ];
            const open = ref(true);
            const opinionField = ref(null);
            const opinion = ref(typeof props.initialOpinion === "string" ? props.initialOpinion : "");
            const showValidationError = ref(false);
            const sourceCopyStatus = ref("");
            const failedSourceWikitext = ref("");
            function insertCommentMarkup(openTag, closeTag) {
              var _a;
              const textarea = (_a = opinionField.value) == null ? void 0 : _a.querySelector("textarea");
              if (!textarea) return;
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const direction = textarea.selectionDirection;
              const selectedText = textarea.value.slice(start, end);
              textarea.focus();
              textarea.setRangeText(`${openTag}${selectedText}${closeTag}`, start, end, "select");
              textarea.setSelectionRange(start + openTag.length, end + openTag.length, direction);
              textarea.dispatchEvent(new Event("input", { bubbles: true }));
            }
            async function copySource(source) {
              failedSourceWikitext.value = "";
              try {
                await copyText(source.wikitext);
                sourceCopyStatus.value = `${source.label} ${i18n.sourceCopied}`;
              } catch {
                failedSourceWikitext.value = source.wikitext;
                sourceCopyStatus.value = i18n.sourceCopyFailed;
              }
            }
            const dialogTitle = computed(() => props.mode === "edit" ? i18n.titleEdit : i18n.titleCreate);
            const primaryLabel = computed(() => props.mode === "edit" ? i18n.save : i18n.create);
            const canSave = computed(() => Boolean((opinion.value || "").trim()));
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
              var _a;
              if (!canSave.value) {
                showValidationError.value = true;
                return;
              }
              (_a = props.onResolve) == null ? void 0 : _a.call(props, { action: "save", opinion: opinion.value.trim() });
              closeDialog();
            }
            function onCancelAction() {
              var _a;
              (_a = props.onResolve) == null ? void 0 : _a.call(props, { action: "cancel" });
              closeDialog();
            }
            function onDeleteClick() {
              var _a;
              if (!props.allowDelete) return;
              const ok = window.confirm(i18n.deleteConfirm);
              if (!ok) return;
              (_a = props.onResolve) == null ? void 0 : _a.call(props, { action: "delete" });
              closeDialog();
            }
            function onUpdateOpen(newValue) {
              if (!newValue) {
                onCancelAction();
              }
            }
            const __returned__ = { buildI18n, props, i18n, quickInputs, open, opinionField, opinion, showValidationError, sourceCopyStatus, failedSourceWikitext, insertCommentMarkup, copySource, dialogTitle, primaryLabel, canSave, closeDialog, onPrimaryAction, onCancelAction, onDeleteClick, onUpdateOpen, get vCommentShortcuts() {
              return commentShortcuts;
            } };
            Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
            return __returned__;
          }
        });
        __sfc__.render = render;
        annotation_editor_default = __sfc__;
      }
    });
    async function openAnnotationEditorDialog(options) {
      var _a, _b;
      const dialogOptions = {
        sectionPath: options.sectionPath,
        sentenceText: options.sentenceText,
        relatedSources: (_a = options.relatedSources) != null ? _a : [],
        initialOpinion: options.initialOpinion || "",
        mode: options.mode || "create",
        allowDelete: (_b = options.allowDelete) != null ? _b : options.mode === "edit"
      };
      try {
        const { Vue, Codex } = await loadCodexAndVue();
        return await new Promise((resolve) => {
          const app = Vue.createMwApp({
            setup() {
              Vue.onUnmounted(() => resolve({ action: "replaced" }));
              return () => Vue.h(annotation_editor_default, { ...dialogOptions, onResolve: resolve });
            }
          });
          registerCodexComponents(app, Codex);
          mountApp(app);
        });
      } catch (error) {
        console.error("[ReviewTool] Failed to open annotation editor dialog", error);
        mw.notify(state_default.convByVar({ hant: "無法開啟批註對話框。", hans: "无法开启批注对话框。" }), {
          type: "error",
          title: "[ReviewTool]"
        });
        throw error;
      }
    }
    var init_annotation_editor2 = __esm({
      "src/dialogs/annotation_editor.ts"() {
        init_state();
        init_dialog();
        init_annotation_editor();
      }
    });
    function buildWritingReviewChapters(groups, fallbackTitle) {
      return sortGroupsByPosition(groups).map((group) => ({
        title: group.sectionPath || fallbackTitle,
        suggestions: group.annotations.map((anno) => ({
          quote: anno.sentenceText || "",
          suggestion: anno.opinion || ""
        }))
      }));
    }
    function formatSuggestion(suggestion) {
      return suggestion.trim().replace(/\r\n?/g, "\n").split(/(?=^[ \t]*\*)/m).map((block) => {
        const bullet = block.match(/^[ \t]*(\*+)[ \t]*/);
        const text = bullet ? block.slice(bullet[0].length) : block;
        const formatted = text.trim().replace(/\n{2,}/g, "{{pb}}").replace(/\n/g, "<br>");
        return bullet ? `
#${bullet[1]} ${formatted}` : formatted;
      }).join("");
    }
    function formatRevisionLabel(timestamp) {
      const date = new Date(timestamp);
      if (Number.isNaN(date.getTime())) throw new Error("Invalid revision timestamp");
      return `${date.getUTCFullYear()}年${date.getUTCMonth() + 1}月${date.getUTCDate()}日 ${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
    }
    function buildWritingReviewWikitext(chapters, context) {
      if (!chapters.length) return "";
      const revisionLabel = formatRevisionLabel(context.revisionTimestamp);
      let wikitext = "";
      for (const chapter of chapters) {
        const title = (chapter.title || "").trim();
        const sectionLink = `[[${context.articleTitle}#${title}|${title}]]`;
        const permalink = `[[Special:PermaLink/${context.revisionId}#${title}|${revisionLabel}]]`;
        wikitext += `'''${sectionLink}'''<small>（基于${permalink}版）</small>
`;
        for (const item of chapter.suggestions) {
          const quote = (item.quote || "").trim();
          const suggestion = formatSuggestion(item.suggestion || "");
          wikitext += `# ${quote ? `{{rvw|1=${quote}}} —— ` : ""}${suggestion}
`;
        }
        wikitext += "--~~~~\n\n";
      }
      return wikitext;
    }
    var init_writing_review = __esm({
      "src/writing_review.ts"() {
        init_annotation_order();
      }
    });
    function hasCopiedReview(key) {
      if (copiedReviews.has(key)) return true;
      for (const type of storageTypes) {
        try {
          if (window[type].getItem(key) === "1") return true;
        } catch {
        }
      }
      return false;
    }
    function rememberCopiedReview(key) {
      copiedReviews.add(key);
      for (const type of storageTypes) {
        try {
          window[type].setItem(key, "1");
          return;
        } catch {
        }
      }
    }
    async function copyWritingReview(groups) {
      var _a, _b, _c, _d, _e;
      const chapters = buildWritingReviewChapters(groups, state_default.convByVar({
        hant: "（未指定章節）",
        hans: "（未指定章节）"
      }));
      if (!chapters.length) {
        mw.notify(state_default.convByVar({
          hant: "目前沒有可複製的批註。",
          hans: "目前没有可复制的批注。"
        }), { type: "warn", tag: "review-tool" });
        return false;
      }
      try {
        const revisionId = mw.config.get("wgRevisionId");
        if (!revisionId) throw new Error("Missing article revision ID");
        await mw.loader.using("mediawiki.api");
        const response = await new mw.Api().get({
          action: "query",
          prop: "revisions",
          revids: revisionId,
          rvprop: "timestamp",
          formatversion: 2
        });
        const revisionTimestamp = (_e = (_d = (_c = (_b = (_a = response.query) == null ? void 0 : _a.pages) == null ? void 0 : _b[0]) == null ? void 0 : _c.revisions) == null ? void 0 : _d[0]) == null ? void 0 : _e.timestamp;
        if (!revisionTimestamp) throw new Error("Missing article revision timestamp");
        const articleTitle = mw.config.get("wgPageName") || state_default.articleTitle;
        const historyKey = `reviewtool:review-copied:${articleTitle.replace(/_/g, " ")}`;
        const reviewText = buildWritingReviewWikitext(chapters, {
          articleTitle,
          revisionId,
          revisionTimestamp
        }).trim();
        await copyText(hasCopiedReview(historyKey) ? reviewText : `${reviewIntroduction}

${reviewText}`);
        rememberCopiedReview(historyKey);
        mw.notify(state_default.convByVar({
          hant: "已複製評審文字，可貼到目標頁面。",
          hans: "已复制评审文本，可粘贴到目标页面。"
        }), { tag: "review-tool" });
        return true;
      } catch (error) {
        console.error("[ReviewTool] Failed to copy review text", error);
        mw.notify(state_default.convByVar({
          hant: "無法複製評審文字，請檢查網路連線及剪貼簿權限後重試。",
          hans: "无法复制评审文本，请检查网络连接及剪贴板权限后重试。"
        }), { type: "error", tag: "review-tool" });
        return false;
      }
    }
    var reviewIntroduction, copiedReviews, storageTypes;
    var init_copy_review = __esm({
      "src/copy_review.ts"() {
        init_clipboard();
        init_state();
        init_writing_review();
        reviewIntroduction = "意見由[[WP:ReviewTool|ReviewTool]]協助生成。";
        copiedReviews = /* @__PURE__ */ new Set();
        storageTypes = ["localStorage", "sessionStorage"];
      }
    });
    function render2(_ctx, _cache, $props, $setup, $data, $options) {
      const { toDisplayString: _toDisplayString, openBlock: _openBlock, createElementBlock: _createElementBlock, createCommentVNode: _createCommentVNode, createElementVNode: _createElementVNode, renderList: _renderList, Fragment: _Fragment, resolveComponent: _resolveComponent, withModifiers: _withModifiers, withCtx: _withCtx, createVNode: _createVNode, createBlock: _createBlock } = window.Vue;
      const _component_cdx_button = _resolveComponent("cdx-button");
      const _component_cdx_select = _resolveComponent("cdx-select");
      const _component_cdx_menu_button = _resolveComponent("cdx-menu-button");
      const _component_cdx_dialog = _resolveComponent("cdx-dialog");
      return _openBlock(), _createBlock(_component_cdx_dialog, {
        open: $setup.open,
        "onUpdate:open": [
          _cache[5] || (_cache[5] = ($event) => $setup.open = $event),
          $setup.onUpdateOpen
        ],
        title: $setup.i18n.title,
        "use-close-button": true,
        class: "review-tool-dialog review-tool-annotation-viewer-dialog"
      }, {
        footer: _withCtx(() => [
          _createElementVNode("div", { class: "review-tool-annotation-viewer__footer" }, [
            _createElementVNode("div", { class: "review-tool-annotation-viewer__footer-left" }, [
              _createVNode(_component_cdx_select, {
                selected: $setup.sortMethod,
                "onUpdate:selected": _cache[0] || (_cache[0] = ($event) => $setup.sortMethod = $event),
                "menu-items": $setup.sortingOptions,
                disabled: $setup.isEmpty,
                "aria-label": $setup.i18n.sortLabel,
                title: $setup.selectedSortLabel,
                class: "review-tool-annotation-viewer__sort-select"
              }, null, 8, ["selected", "menu-items", "disabled", "aria-label", "title"])
            ]),
            _createElementVNode("div", { class: "review-tool-annotation-viewer__footer-controls" }, [
              $setup.canUndoClear && $setup.props.onUndoClearAnnotations ? (_openBlock(), _createBlock(_component_cdx_button, {
                key: 0,
                weight: "quiet",
                disabled: $setup.fileActionsDisabled,
                onClick: _cache[1] || (_cache[1] = _withModifiers(($event) => {
                  var _a, _b;
                  return (_b = (_a = $setup.props).onUndoClearAnnotations) == null ? void 0 : _b.call(_a);
                }, ["prevent"]))
              }, {
                default: _withCtx(() => [
                  _createElementVNode(
                    "span",
                    { class: "review-tool-control-label" },
                    _toDisplayString($setup.i18n.undoClear),
                    1
                    /* TEXT */
                  )
                ]),
                _: 1
                /* STABLE */
              }, 8, ["disabled"])) : _createCommentVNode("v-if", true),
              _createVNode(_component_cdx_button, {
                action: "destructive",
                weight: "quiet",
                title: $setup.i18n.clearAll,
                disabled: !$setup.canClearAll || $setup.isEmpty || $setup.clearingAll || $setup.importing,
                onClick: _withModifiers($setup.handleClearAll, ["prevent"])
              }, {
                default: _withCtx(() => [
                  _createElementVNode(
                    "span",
                    { class: "review-tool-control-label" },
                    _toDisplayString($setup.i18n.clearAll),
                    1
                    /* TEXT */
                  )
                ]),
                _: 1
                /* STABLE */
              }, 8, ["title", "disabled"]),
              _createElementVNode("div", { class: "review-tool-annotation-viewer__footer-actions" }, [
                _createVNode(_component_cdx_button, {
                  weight: "quiet",
                  title: $setup.i18n.close,
                  onClick: _withModifiers($setup.closeDialog, ["prevent"])
                }, {
                  default: _withCtx(() => [
                    _createElementVNode(
                      "span",
                      { class: "review-tool-control-label" },
                      _toDisplayString($setup.i18n.close),
                      1
                      /* TEXT */
                    )
                  ]),
                  _: 1
                  /* STABLE */
                }, 8, ["title"]),
                _createElementVNode(
                  "input",
                  {
                    ref: "importInput",
                    type: "file",
                    accept: ".json,application/json",
                    hidden: "",
                    onChange: $setup.handleImport
                  },
                  null,
                  544
                  /* NEED_HYDRATION, NEED_PATCH */
                ),
                _createVNode(_component_cdx_menu_button, {
                  selected: $setup.fileAction,
                  "onUpdate:selected": [
                    _cache[2] || (_cache[2] = ($event) => $setup.fileAction = $event),
                    $setup.handleFileAction
                  ],
                  "menu-items": $setup.fileMenuItems,
                  weight: "quiet",
                  title: $setup.i18n.importExport,
                  disabled: $setup.fileActionsDisabled
                }, {
                  default: _withCtx(() => [
                    _createElementVNode(
                      "span",
                      { class: "review-tool-control-label" },
                      _toDisplayString($setup.i18n.importExport),
                      1
                      /* TEXT */
                    )
                  ]),
                  _: 1
                  /* STABLE */
                }, 8, ["selected", "menu-items", "title", "disabled"]),
                _createVNode(_component_cdx_button, {
                  weight: "normal",
                  title: $setup.i18n.copyReview,
                  disabled: $setup.isEmpty || $setup.copyingReview || $setup.importing,
                  onClick: _cache[3] || (_cache[3] = _withModifiers(($event) => $setup.handleCopyReview("copy"), ["prevent"]))
                }, {
                  default: _withCtx(() => [
                    _createElementVNode(
                      "span",
                      { class: "review-tool-control-label" },
                      _toDisplayString($setup.i18n.copyReview),
                      1
                      /* TEXT */
                    )
                  ]),
                  _: 1
                  /* STABLE */
                }, 8, ["title", "disabled"]),
                _createVNode(_component_cdx_menu_button, {
                  selected: $setup.reviewAction,
                  "onUpdate:selected": [
                    _cache[4] || (_cache[4] = ($event) => $setup.reviewAction = $event),
                    $setup.handleCopyReview
                  ],
                  "menu-items": $setup.reviewDestinations,
                  action: "progressive",
                  weight: "primary",
                  title: $setup.i18n.copyAndGo,
                  disabled: $setup.isEmpty || $setup.copyingReview || $setup.importing
                }, {
                  default: _withCtx(() => [
                    _createElementVNode(
                      "span",
                      { class: "review-tool-control-label" },
                      _toDisplayString($setup.i18n.copyAndGo),
                      1
                      /* TEXT */
                    )
                  ]),
                  _: 1
                  /* STABLE */
                }, 8, ["selected", "title", "disabled"])
              ])
            ])
          ])
        ]),
        default: _withCtx(() => [
          $setup.isEmpty ? (_openBlock(), _createElementBlock(
            "div",
            {
              key: 0,
              class: "review-tool-annotation-viewer__empty"
            },
            _toDisplayString($setup.i18n.empty),
            1
            /* TEXT */
          )) : (_openBlock(), _createElementBlock("div", {
            key: 1,
            class: "review-tool-annotation-viewer__list"
          }, [
            $setup.timeRange ? (_openBlock(), _createElementBlock("dl", {
              key: 0,
              class: "review-tool-annotation-viewer__times"
            }, [
              _createElementVNode("div", null, [
                _createElementVNode(
                  "dt",
                  null,
                  _toDisplayString($setup.i18n.firstComment),
                  1
                  /* TEXT */
                ),
                _createElementVNode("dd", null, [
                  _createElementVNode("time", {
                    datetime: new Date($setup.timeRange.first).toISOString()
                  }, _toDisplayString($setup.formatTimestamp($setup.timeRange.first)), 9, ["datetime"])
                ])
              ]),
              _createElementVNode("div", null, [
                _createElementVNode(
                  "dt",
                  null,
                  _toDisplayString($setup.i18n.lastEdit),
                  1
                  /* TEXT */
                ),
                _createElementVNode("dd", null, [
                  _createElementVNode("time", {
                    datetime: new Date($setup.timeRange.last).toISOString()
                  }, _toDisplayString($setup.formatTimestamp($setup.timeRange.last)), 9, ["datetime"])
                ])
              ])
            ])) : _createCommentVNode("v-if", true),
            (_openBlock(true), _createElementBlock(
              _Fragment,
              null,
              _renderList($setup.sortedGroups, (group) => {
                return _openBlock(), _createElementBlock("div", {
                  key: group.annotations[0].id,
                  class: "review-tool-annotation-viewer__section"
                }, [
                  _createElementVNode(
                    "h4",
                    { class: "review-tool-annotation-viewer__section-title" },
                    _toDisplayString(group.sectionPath || $setup.i18n.sectionFallback),
                    1
                    /* TEXT */
                  ),
                  _createElementVNode("ul", { class: "review-tool-annotation-viewer__items" }, [
                    (_openBlock(true), _createElementBlock(
                      _Fragment,
                      null,
                      _renderList(group.annotations, (anno) => {
                        return _openBlock(), _createElementBlock("li", {
                          key: anno.id,
                          class: "review-tool-annotation-viewer__item"
                        }, [
                          _createElementVNode(
                            "div",
                            { class: "review-tool-annotation-viewer__quote" },
                            "“" + _toDisplayString(anno.sentenceText) + "”",
                            1
                            /* TEXT */
                          ),
                          _createElementVNode(
                            "div",
                            { class: "review-tool-annotation-viewer__opinion" },
                            _toDisplayString(anno.opinion),
                            1
                            /* TEXT */
                          ),
                          _createElementVNode(
                            "div",
                            { class: "review-tool-annotation-viewer__meta" },
                            _toDisplayString(anno.createdBy) + " · " + _toDisplayString($setup.formatTimestamp(anno.createdAt)),
                            1
                            /* TEXT */
                          ),
                          _createElementVNode("div", { class: "review-tool-annotation-viewer__actions" }, [
                            _createVNode(_component_cdx_button, {
                              size: "small",
                              weight: "quiet",
                              title: $setup.i18n.edit,
                              disabled: $setup.importing,
                              onClick: _withModifiers(($event) => $setup.handleEdit(anno.id, group.sectionPath), ["prevent"])
                            }, {
                              default: _withCtx(() => [
                                _createElementVNode(
                                  "span",
                                  { class: "review-tool-control-label" },
                                  _toDisplayString($setup.i18n.edit),
                                  1
                                  /* TEXT */
                                )
                              ]),
                              _: 1
                              /* STABLE */
                            }, 8, ["title", "disabled", "onClick"]),
                            _createVNode(_component_cdx_button, {
                              size: "small",
                              weight: "quiet",
                              action: "destructive",
                              title: $setup.i18n.delete,
                              disabled: $setup.importing || $setup.deletingAnnotationId === anno.id,
                              onClick: _withModifiers(($event) => $setup.handleDelete(anno.id, group.sectionPath), ["prevent"])
                            }, {
                              default: _withCtx(() => [
                                _createElementVNode(
                                  "span",
                                  { class: "review-tool-control-label" },
                                  _toDisplayString($setup.i18n.delete),
                                  1
                                  /* TEXT */
                                )
                              ]),
                              _: 1
                              /* STABLE */
                            }, 8, ["title", "disabled", "onClick"])
                          ])
                        ]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ]))
        ]),
        _: 1
        /* STABLE */
      }, 8, ["open", "title"]);
    }
    var _defineComponent2, ref2, computed2, onMounted, onUnmounted, __sfc__2, annotation_viewer_default;
    var init_annotation_viewer = __esm({
      "src/dialogs/components/annotation_viewer.vue"() {
        init_state();
        init_annotation_order();
        init_annotation_time();
        init_dialog();
        init_copy_review();
        _defineComponent2 = (...args) => {
          var _a, _b, _c;
          return (_c = (_b = (_a = window.Vue) == null ? void 0 : _a.defineComponent) == null ? void 0 : _b.call(_a, ...args)) != null ? _c : args[0];
        };
        ref2 = (...args) => window.Vue.ref(...args);
        computed2 = (...args) => window.Vue.computed(...args);
        onMounted = (...args) => window.Vue.onMounted(...args);
        onUnmounted = (...args) => window.Vue.onUnmounted(...args);
        __sfc__2 = _defineComponent2({
          __name: "annotation_viewer",
          props: {
            pageName: { type: String, required: true },
            initialGroups: { type: Array, required: false, default: () => [] },
            initialCanUndoClear: { type: Boolean, required: false, default: false },
            onEditAnnotation: { type: Function, required: false, default: void 0 },
            onDeleteAnnotation: { type: Function, required: false, default: void 0 },
            onClearAllAnnotations: { type: Function, required: false, default: void 0 },
            onUndoClearAnnotations: { type: Function, required: false, default: void 0 },
            onImportAnnotations: { type: Function, required: false, default: void 0 },
            onClosed: { type: Function, required: false, default: void 0 }
          },
          setup(__props, { expose: __expose }) {
            var _a, _b;
            function buildI18n() {
              return {
                title: state_default.convByVar({ hant: "批註列表", hans: "批注列表" }),
                empty: state_default.convByVar({ hant: "尚無批註", hans: "尚无批注" }),
                edit: state_default.convByVar({ hant: "編輯", hans: "编辑" }),
                delete: state_default.convByVar({ hant: "刪除", hans: "删除" }),
                deleteConfirm: state_default.convByVar({ hant: "確定刪除？", hans: "确定删除？" }),
                clearAll: state_default.convByVar({ hant: "清除全部", hans: "清除全部" }),
                clearAllConfirm: state_default.convByVar({ hant: "確定清除所有批註？清除後可按「復原清除」。", hans: "确定清除所有批注？清除后可按“撤销清除”。" }),
                undoClear: state_default.convByVar({ hant: "復原清除", hans: "撤销清除" }),
                clearAllNothing: state_default.convByVar({ hant: "沒有可清除的批註。", hans: "没有可清除的批注。" }),
                clearAllError: state_default.convByVar({ hant: "清除批註時發生錯誤。", hans: "清除批注时发生错误。" }),
                sectionFallback: state_default.convByVar({ hant: "（未指定章節）", hans: "（未指定章节）" }),
                close: state_default.convByVar({ hant: "關閉", hans: "关闭" }),
                export: state_default.convByVar({ hant: "匯出", hans: "导出" }),
                exportDone: state_default.convByVar({ hant: "已匯出批註。", hans: "已导出批注。" }),
                exportError: state_default.convByVar({ hant: "匯出批註時發生錯誤。", hans: "导出批注时发生错误。" }),
                import: state_default.convByVar({ hant: "匯入", hans: "导入" }),
                importDone: state_default.convByVar({ hant: "已匯入 $1 則批註。", hans: "已导入 $1 条批注。" }),
                importNothing: state_default.convByVar({ hant: "沒有新的批註可匯入，已有的批註會略過。", hans: "没有新的批注可导入，已有的批注会跳过。" }),
                importError: state_default.convByVar({ hant: "無法匯入批註。請檢查 ReviewTool 批註 JSON 檔案及瀏覽器儲存空間。", hans: "无法导入批注。请检查 ReviewTool 批注 JSON 文件及浏览器存储空间。" }),
                importExport: state_default.convByVar({ hant: "匯入／匯出", hans: "导入／导出" }),
                copyReview: state_default.convByVar({ hant: "複製", hans: "复制" }),
                copyAndGo: state_default.convByVar({ hant: "複製並前往", hans: "复制并前往" }),
                sortLabel: state_default.convByVar({ hant: "排序方式", hans: "排序方式" }),
                sortCreatedAsc: state_default.convByVar({ hant: "最早時間優先", hans: "最早时间优先" }),
                sortCreatedDesc: state_default.convByVar({ hant: "最新時間優先", hans: "最新时间优先" }),
                sortPosition: state_default.convByVar({ hant: "頁面位置", hans: "页面位置" }),
                firstComment: state_default.convByVar({ hant: "首次批註時間", hans: "首次批注时间" }),
                lastEdit: state_default.convByVar({ hant: "最近編輯時間", hans: "最近编辑时间" })
              };
            }
            const props = __props;
            const i18n = buildI18n();
            const open = ref2(true);
            const groups = ref2(props.initialGroups);
            const canUndoClear = ref2(props.initialCanUndoClear);
            const deletingAnnotationId = ref2(null);
            const clearingAll = ref2(false);
            const copyingReview = ref2(false);
            const importing = ref2(false);
            const importInput = ref2(null);
            const fileAction = ref2(null);
            const reviewAction = ref2(null);
            const sortMethod = ref2("position");
            const now = ref2(Date.now());
            let timeRefreshInterval;
            onMounted(() => {
              timeRefreshInterval = window.setInterval(() => {
                now.value = Date.now();
              }, 6e4);
            });
            onUnmounted(() => window.clearInterval(timeRefreshInterval));
            const talkPageTitle = (_b = (_a = mw.Title.newFromText(props.pageName)) == null ? void 0 : _a.getTalkPage()) == null ? void 0 : _b.getPrefixedText();
            const reviewDestinations = [
              {
                value: "Wikipedia:典范条目评选/提名区",
                label: state_default.convByVar({ hant: "典範條目評選", hans: "典范条目评选" })
              },
              {
                value: "Wikipedia:特色列表评选/提名区",
                label: state_default.convByVar({ hant: "特色列表評選", hans: "特色列表评选" })
              },
              {
                value: "Wikipedia:優良條目評選/提名區",
                label: state_default.convByVar({ hant: "優良條目評選", hans: "优良条目评选" })
              },
              {
                value: "Wikipedia:同行评审/提案区",
                label: state_default.convByVar({ hant: "同行評審", hans: "同行评审" })
              },
              ...talkPageTitle ? [{
                value: talkPageTitle,
                label: state_default.convByVar({ hant: "討論頁", hans: "讨论页" })
              }] : []
            ];
            __expose({ open, groups, canUndoClear });
            const canClearAll = computed2(() => Boolean(props.onClearAllAnnotations));
            const isEmpty = computed2(() => groups.value.every((group) => !group.annotations.length));
            const fileActionsDisabled = computed2(() => importing.value || clearingAll.value || deletingAnnotationId.value !== null);
            const fileMenuItems = computed2(() => [
              { value: "import", label: i18n.import, disabled: !props.onImportAnnotations },
              { value: "export", label: i18n.export, disabled: isEmpty.value }
            ]);
            const flattenedAnnotations = computed2(() => groups.value.flatMap((group) => group.annotations));
            const timeRange = computed2(() => getAnnotationTimeRange(flattenedAnnotations.value));
            const sortingOptions = computed2(() => [
              { value: "position", label: i18n.sortPosition },
              { value: "created-desc", label: i18n.sortCreatedDesc },
              { value: "created-asc", label: i18n.sortCreatedAsc }
            ]);
            const selectedSortLabel = computed2(() => {
              var _a2;
              return (_a2 = sortingOptions.value.find((option) => option.value === sortMethod.value)) == null ? void 0 : _a2.label;
            });
            const sortedGroups = computed2(() => {
              const annotations = flattenedAnnotations.value;
              if (sortMethod.value === "created-desc") return groupAnnotationsByTime(annotations, "desc");
              if (sortMethod.value === "created-asc") return groupAnnotationsByTime(annotations, "asc");
              return sortGroupsByPosition(groupAnnotations(annotations));
            });
            function formatTimestamp(ts) {
              return formatAnnotationTimestamp(ts, now.value);
            }
            function handleEdit(annotationId, sectionPath) {
              var _a2;
              (_a2 = props.onEditAnnotation) == null ? void 0 : _a2.call(props, annotationId, sectionPath);
            }
            async function handleDelete(annotationId, sectionPath) {
              if (!props.onDeleteAnnotation || !window.confirm(i18n.deleteConfirm)) return;
              deletingAnnotationId.value = annotationId;
              try {
                await props.onDeleteAnnotation(annotationId, sectionPath);
              } catch (error) {
                console.error("[ReviewTool] Failed to delete annotation", error);
                mw.notify(state_default.convByVar({ hant: "刪除批註時發生錯誤。", hans: "删除批注时发生错误。" }), {
                  type: "error",
                  title: "[ReviewTool]"
                });
              } finally {
                deletingAnnotationId.value = null;
              }
            }
            async function handleClearAll() {
              if (!props.onClearAllAnnotations || isEmpty.value || !window.confirm(i18n.clearAllConfirm)) return;
              clearingAll.value = true;
              try {
                const cleared = await props.onClearAllAnnotations();
                if (!cleared) mw.notify(i18n.clearAllNothing, { tag: "review-tool" });
              } catch (error) {
                console.error("[ReviewTool] Failed to clear annotations", error);
                mw.notify(i18n.clearAllError, { type: "error", title: "[ReviewTool]" });
              } finally {
                clearingAll.value = false;
              }
            }
            async function handleCopyReview(action) {
              reviewAction.value = null;
              if (isEmpty.value || copyingReview.value || importing.value) return;
              const destination = reviewDestinations.find((item) => item.value === action);
              if (action !== "copy" && !destination) return;
              let url = destination ? mw.util.getUrl(destination.value) : null;
              if (url && destination.value !== talkPageTitle) {
                url += `#${mw.util.escapeIdForLink(props.pageName.replace(/_/g, " "))}`;
              }
              copyingReview.value = true;
              try {
                const copied = await copyWritingReview(groups.value);
                if (copied && url) window.location.assign(url);
              } finally {
                copyingReview.value = false;
              }
            }
            function handleFileAction(action) {
              var _a2;
              fileAction.value = null;
              if (fileActionsDisabled.value) return;
              if (action === "import" && props.onImportAnnotations) {
                (_a2 = importInput.value) == null ? void 0 : _a2.click();
              } else if (action === "export") {
                handleExport();
              }
            }
            function handleExport() {
              if (isEmpty.value) return;
              try {
                const payload = {
                  pageName: props.pageName,
                  exportedAt: Date.now(),
                  groups: groups.value
                };
                const json = JSON.stringify(payload, null, 2);
                const blob = new Blob([json], { type: "application/json;charset=utf-8" });
                const filename = `review-tool-annotations-${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "")}.json`;
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
                mw.notify(i18n.exportDone, { tag: "review-tool" });
              } catch (error) {
                console.error("[ReviewTool] Failed to export annotations", error);
                mw.notify(i18n.exportError, { type: "error", title: "[ReviewTool]" });
              }
            }
            async function handleImport(event) {
              var _a2;
              const input = event.target;
              const file = (_a2 = input.files) == null ? void 0 : _a2[0];
              if (!file || !props.onImportAnnotations || importing.value) return;
              importing.value = true;
              try {
                const json = await file.text();
                if (!open.value) return;
                const imported = await props.onImportAnnotations(json);
                mw.notify(imported ? i18n.importDone.replace("$1", String(imported)) : i18n.importNothing, { tag: "review-tool" });
              } catch (error) {
                console.error("[ReviewTool] Failed to import annotations", error);
                mw.notify(i18n.importError, { type: "error", title: "[ReviewTool]" });
              } finally {
                input.value = "";
                importing.value = false;
              }
            }
            function onUpdateOpen(newValue) {
              if (!newValue) {
                closeDialog();
              }
            }
            function closeDialog() {
              open.value = false;
              closeDialogAfterTransition(props.onClosed);
            }
            const __returned__ = { buildI18n, props, i18n, open, groups, canUndoClear, deletingAnnotationId, clearingAll, copyingReview, importing, importInput, fileAction, reviewAction, sortMethod, now, get timeRefreshInterval() {
              return timeRefreshInterval;
            }, set timeRefreshInterval(v) {
              timeRefreshInterval = v;
            }, talkPageTitle, reviewDestinations, canClearAll, isEmpty, fileActionsDisabled, fileMenuItems, flattenedAnnotations, timeRange, sortingOptions, selectedSortLabel, sortedGroups, formatTimestamp, handleEdit, handleDelete, handleClearAll, handleCopyReview, handleFileAction, handleExport, handleImport, onUpdateOpen, closeDialog };
            Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
            return __returned__;
          }
        });
        __sfc__2.render = render2;
        annotation_viewer_default = __sfc__2;
      }
    });
    function isAnnotationViewerDialogOpen() {
      return Boolean(viewerAppInstance);
    }
    function closeAnnotationViewerDialog() {
      if (viewerAppInstance) {
        viewerAppInstance.open = false;
        closeDialogAfterTransition();
        viewerAppInstance = null;
      }
    }
    function updateAnnotationViewerDialogGroups(groups, canUndoClear) {
      if (viewerAppInstance) {
        viewerAppInstance.groups = groups;
        viewerAppInstance.canUndoClear = canUndoClear;
      }
    }
    async function openAnnotationViewerDialog(options) {
      try {
        const { Vue, Codex } = await loadCodexAndVue();
        await mw.loader.using("mediawiki.Title");
        const { groups: initialGroups = [], ...dialogOptions } = options;
        const app = Vue.createMwApp({
          render: () => Vue.h(annotation_viewer_default, {
            ...dialogOptions,
            initialGroups,
            ref: (instance) => {
              viewerAppInstance = instance;
            },
            onClosed: () => {
              viewerAppInstance = null;
            }
          })
        });
        registerCodexComponents(app, Codex);
        mountApp(app);
      } catch (error) {
        console.error("[ReviewTool] Failed to open annotation viewer dialog", error);
        mw.notify(state_default.convByVar({ hant: "無法開啟批註列表。", hans: "无法开启批注列表。" }), {
          type: "error",
          title: "[ReviewTool]"
        });
      }
    }
    var viewerAppInstance;
    var init_annotation_viewer2 = __esm({
      "src/dialogs/annotation_viewer.ts"() {
        init_state();
        init_dialog();
        init_annotation_viewer();
        viewerAppInstance = null;
      }
    });
    function cleanContainerText(container) {
      var _a;
      const selector = `${TEXT_DECORATIONS}, style, ipe-quick-edit`;
      container.querySelectorAll(selector).forEach((node) => node.remove());
      return ((_a = container.textContent) != null ? _a : "").replace(/Copy permalink/g, "").replace(/\s+/g, " ").trim();
    }
    function getCleanTextFromRange(range) {
      if (!range) return "";
      const wrapper = document.createElement("div");
      wrapper.appendChild(range.cloneContents());
      return cleanContainerText(wrapper);
    }
    function previousNode(node) {
      if (!node) return null;
      if (node.previousSibling) {
        let p = node.previousSibling;
        while (p == null ? void 0 : p.lastChild) p = p.lastChild;
        return p;
      }
      return node.parentNode;
    }
    function findHeadingElementFromNode(node) {
      let cur = node;
      while (cur) {
        if (cur instanceof Element) {
          const el = cur;
          const tag = el.tagName.toLowerCase();
          if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)) return el;
          if (el.classList.contains("mw-heading")) return el;
        }
        cur = cur.parentNode;
      }
      return null;
    }
    function getHeadingLevelAndTitle(el) {
      if (!el) return { level: null, title: null };
      const tag = el.tagName.toLowerCase();
      if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)) {
        const level = parseInt(tag.charAt(1), 10);
        const title = getHeadingTitle(el) || null;
        return { level, title };
      }
      const inner = el.querySelector("h1,h2,h3,h4,h5,h6");
      if (inner) {
        const lvl = parseInt(inner.tagName.charAt(1), 10);
        const title = getHeadingTitle(el) || getHeadingTitle(inner) || null;
        return { level: lvl, title };
      }
      const t = getHeadingTitle(el);
      return { level: null, title: t };
    }
    function computeSectionPathFromNode(startNode) {
      const pageFallback = state_default.articleTitle || state_default.convByVar({ hant: "導言", hans: "导言" });
      if (!startNode) return pageFallback;
      let anchor = startNode;
      if (anchor.nodeType === Node.TEXT_NODE) anchor = anchor.parentNode;
      if (!anchor) return pageFallback;
      const nearestByLevel = /* @__PURE__ */ new Map();
      let nextLevel = 7;
      let cur = anchor;
      while (cur) {
        cur = previousNode(cur);
        if (!cur) break;
        const hEl = findHeadingElementFromNode(cur);
        if (!hEl) continue;
        const info = getHeadingLevelAndTitle(hEl);
        if (!info.title || info.level === null) continue;
        if (info.level === 1) continue;
        if (info.level >= nextLevel) continue;
        nextLevel = info.level;
        nearestByLevel.set(info.level, info.title);
        if (info.level === 2) break;
      }
      if (nearestByLevel.size === 0) return pageFallback;
      const parts = [];
      for (let lvl = 2; lvl <= 6; lvl++) {
        const title = nearestByLevel.get(lvl);
        if (title) parts.push(title);
      }
      return parts.join("—");
    }
    var TEXT_DECORATIONS;
    var init_article_text = __esm({
      "src/dom/article_text.ts"() {
        init_state();
        init_utils();
        init_reference_links();
        TEXT_DECORATIONS = [
          ".reference",
          ".mw-ref",
          ".citation",
          ".ref",
          ".reference-text",
          ".qeec-ref-tag-copy-btn",
          "[data-reference]",
          "[data-ref]",
          ".reference-note",
          ".review-tool-inline-annotation",
          REFERENCE_CONTROLS_SELECTOR
        ].join(",");
      }
    });
    function wrapArticleSentences(container) {
      function getComputedLang(node) {
        var _a, _b, _c;
        let el = null;
        if (node instanceof Element) el = node;
        el = (_a = el != null ? el : node == null ? void 0 : node.parentElement) != null ? _a : null;
        while (el) {
          const lang = el.getAttribute("lang") || el.getAttribute("xml:lang");
          if (lang) return lang.toLowerCase();
          el = el.parentElement;
        }
        const docLang = (_b = document.documentElement) == null ? void 0 : _b.getAttribute("lang");
        return (_c = docLang == null ? void 0 : docLang.toLowerCase()) != null ? _c : null;
      }
      function shouldSkipElement(node) {
        if (node.nodeType !== Node.ELEMENT_NODE) return false;
        const el = node;
        if (el.classList.contains(ANNOTATION_CONTAINER_CLASS) || el.classList.contains("review-tool-inline-annotation") || el.matches(REFERENCE_CONTROLS_SELECTOR)) return true;
        if (el.matches(`${REFERENCE_MARKER_SELECTOR}, .reference-text, .mw-reference-text, .citation, .mw-cite-backlink,
            .references, .mw-references-wrap, .reflist, [id^="cite_note-"],
            table, pre, code, svg, math, script, style, noscript, button, input, select, textarea`)) return true;
        if (el.hasAttribute("data-gadget") || el.hasAttribute("data-widget")) return true;
        const skipClasses = [
          "mw-editsection",
          "mw-indicator",
          "navbox",
          "infobox",
          "metadata",
          "noprint",
          "navigation",
          "catlinks",
          "printfooter",
          "mw-jump-link",
          "skin-",
          // prefix match for skin-specific elements
          "vector-",
          // prefix match for Vector skin elements
          "qeec-ref-tag-copy-btn",
          "ipe__in-article-link",
          "ipe-quick-edit",
          "ipe-quick-edit--create-only"
        ];
        for (const cls of skipClasses) {
          if (el.className && (el.classList.contains(cls) || typeof el.className === "string" && el.className.includes(cls))) {
            return true;
          }
        }
        if (el.id) {
          if (el.id.startsWith("mw-") || el.id.startsWith("footer-") || el.id.startsWith("p-") || el.id === "siteSub" || el.id === "contentSub") {
            return true;
          }
        }
        return false;
      }
      function createSentenceSpan(content) {
        const span = document.createElement("span");
        span.className = `${ANNOTATION_CONTAINER_CLASS} ${SENTENCE_CLASS}`;
        span.append(content);
        return span;
      }
      function wrapTextNode(node, parts) {
        const content = parts.length > 1 ? parts : [node.data];
        node.replaceWith(...content.map(createSentenceSpan));
      }
      function processElementRoot(root) {
        if (shouldSkipElement(root)) return;
        const allowHalfWidth = shouldTreatHalfWidthTerminators(getComputedLang(root));
        const elementChildren = Array.from(root.children);
        const hasNonInlineElementChildren = elementChildren.some((el) => !INLINE_TAGS.has(el.tagName.toLowerCase()));
        if (hasNonInlineElementChildren) {
          Array.from(root.childNodes).forEach((child) => {
            if (child.nodeType === Node.TEXT_NODE) {
              const textNode = child;
              const text = textNode.nodeValue || "";
              if (!text.trim()) return;
              const parts = splitTextIntoRanges(text, getComputedLang(textNode)).map((r) => text.slice(r.start, r.end)).filter((p) => p.trim());
              wrapTextNode(textNode, parts);
            } else if (child.nodeType === Node.ELEMENT_NODE) {
              processElementRoot(child);
            }
          });
          return;
        }
        const filterNode = (node) => {
          if (node.nodeType !== Node.TEXT_NODE) return NodeFilter.FILTER_SKIP;
          let parent = node.parentElement;
          while (parent && parent !== root) {
            if (shouldSkipElement(parent)) {
              return NodeFilter.FILTER_REJECT;
            }
            parent = parent.parentElement;
          }
          return NodeFilter.FILTER_ACCEPT;
        };
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: filterNode });
        const segments = [];
        let acc = "";
        let tn = walker.nextNode();
        while (tn) {
          const t = tn.nodeValue || "";
          if (t) {
            segments.push({ node: tn, start: acc.length, end: acc.length + t.length });
            acc += t;
          }
          tn = walker.nextNode();
        }
        if (!segments.length) return;
        const ranges = splitTextIntoRanges(acc, getComputedLang(root));
        const mapped = [];
        for (const r of ranges) {
          let startNode = null;
          let startOffset = 0;
          let endNode = null;
          let endOffset = 0;
          for (const seg of segments) {
            if (r.start >= seg.start && r.start <= seg.end) {
              startNode = seg.node;
              startOffset = r.start - seg.start;
            }
            if (r.end >= seg.start && r.end <= seg.end) {
              endNode = seg.node;
              endOffset = r.end - seg.start;
            }
            if (startNode && endNode) break;
          }
          if (startNode && endNode) {
            mapped.push({ startNode, startOffset, endNode, endOffset, absStart: r.start, absEnd: r.end });
          }
        }
        if (!mapped.length) return;
        mapped.sort((a, b) => b.absStart - a.absStart);
        let successCount = 0;
        for (const m of mapped) {
          if (m.absStart >= m.absEnd) continue;
          try {
            if (!m.startNode.isConnected || !m.endNode.isConnected) {
              console.warn("[ReviewTool] mapped nodes not connected, skipping", m);
              continue;
            }
            if (!root.contains(m.startNode) || !root.contains(m.endNode)) {
              console.warn("[ReviewTool] mapped nodes no longer in root, skipping", m);
              continue;
            }
            const range = document.createRange();
            range.setStart(m.startNode, m.startOffset);
            range.setEnd(m.endNode, m.endOffset);
            const frag = range.extractContents();
            range.insertNode(createSentenceSpan(frag));
            successCount++;
          } catch (e) {
            console.warn("[ReviewTool] range wrapping failed for one range, continuing", e, m);
          }
        }
        if (successCount === 0) {
          console.warn("[ReviewTool] no mapped ranges wrapped successfully, performing fallback wrapping for this root");
          const walker2 = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: filterNode });
          const nodes = [];
          let tn2;
          while (tn2 = walker2.nextNode()) nodes.push(tn2);
          for (const tn22 of nodes) {
            const text = tn22.nodeValue || "";
            if (!text.trim()) {
              continue;
            }
            const parts = splitTextToPartsSimple(text, allowHalfWidth);
            wrapTextNode(tn22, parts);
          }
        }
      }
      Array.from(container.childNodes).filter((node) => !shouldSkipElement(node)).forEach((rootNode) => {
        if (rootNode.nodeType === Node.ELEMENT_NODE) {
          processElementRoot(rootNode);
        } else if (rootNode.nodeType === Node.TEXT_NODE) {
          const textNode = rootNode;
          const text = textNode.textContent || "";
          if (!text.trim()) return;
          const parts = splitTextToPartsSimple(text, shouldTreatHalfWidthTerminators(getComputedLang(textNode)));
          wrapTextNode(textNode, parts);
        }
      });
    }
    function clearWrappedSentences(container) {
      container.querySelectorAll(SENTENCE_SELECTOR).forEach((el) => {
        const parent = el.parentNode;
        if (!parent) return;
        const frag = document.createDocumentFragment();
        while (el.firstChild) {
          frag.appendChild(el.firstChild);
        }
        parent.replaceChild(frag, el);
      });
    }
    var ANNOTATION_CONTAINER_CLASS, SENTENCE_CLASS, SENTENCE_SELECTOR, INLINE_TAGS;
    var init_sentence_wrapping = __esm({
      "src/dom/sentence_wrapping.ts"() {
        init_sentences();
        init_reference_links();
        ANNOTATION_CONTAINER_CLASS = "review-tool-annotation-ui";
        SENTENCE_CLASS = "sentence";
        SENTENCE_SELECTOR = ".review-tool-annotation-ui.sentence";
        INLINE_TAGS = /* @__PURE__ */ new Set([
          "a",
          "span",
          "em",
          "strong",
          "b",
          "i",
          "small",
          "sup",
          "sub",
          "code",
          "cite",
          "abbr",
          "time",
          "mark",
          "var",
          "img",
          "kbd"
        ]);
      }
    });
    function installArticleSelection(root, annotate) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "review-tool-annotation-ui floating-button";
      button.textContent = state_default.convByVar({ hant: "批註", hans: "批注" });
      button.style.display = "none";
      document.body.appendChild(button);
      let selecting = false;
      let dragged = false;
      let pressPosition = null;
      let selectionTimer;
      let hideTimer;
      const hide = () => {
        window.clearTimeout(hideTimer);
        button.style.display = "none";
        button.onclick = null;
      };
      const insideButton = (event) => event.target instanceof Node && button.contains(event.target);
      const selectedRange = () => {
        const selection = document.getSelection();
        if (!(selection == null ? void 0 : selection.rangeCount) || selection.isCollapsed) return null;
        const range = selection.getRangeAt(0);
        return root.contains(range.startContainer) && root.contains(range.endContainer) ? range : null;
      };
      const show = (range) => {
        var _a, _b;
        const text = getCleanTextFromRange(range);
        if (!text) {
          hide();
          return;
        }
        const savedRange = range.cloneRange();
        const node = range.startContainer;
        const element = node instanceof Element ? node : node.parentElement;
        const sentence = (_a = element == null ? void 0 : element.closest(SENTENCE_SELECTOR)) != null ? _a : element;
        const position = (_b = getElementOrderKey(sentence)) != null ? _b : "";
        const rect = range.getBoundingClientRect();
        const centerX = Math.max(40, Math.min(window.innerWidth - 40, rect.left + rect.width / 2));
        window.clearTimeout(hideTimer);
        button.style.left = `${centerX + window.scrollX}px`;
        button.style.top = `${Math.max(8, rect.top + window.scrollY - 8)}px`;
        button.style.display = "block";
        button.onclick = (event) => {
          var _a2;
          event.preventDefault();
          event.stopPropagation();
          hide();
          window.clearTimeout(selectionTimer);
          if (!root.isConnected || !root.contains(savedRange.commonAncestorContainer)) return;
          (_a2 = document.getSelection()) == null ? void 0 : _a2.removeAllRanges();
          annotate(savedRange, text, position);
        };
      };
      const onSelectionChange = () => {
        window.clearTimeout(selectionTimer);
        if (selecting) return;
        selectionTimer = window.setTimeout(() => {
          const range = selectedRange();
          if (root.isConnected && range) show(range);
          else hide();
        }, 120);
      };
      const onPress = (event) => {
        if (insideButton(event)) return;
        dragged = false;
        pressPosition = event instanceof MouseEvent ? { x: event.clientX, y: event.clientY } : null;
        selecting = true;
        window.clearTimeout(selectionTimer);
        document.documentElement.classList.add("rt-selecting");
        hide();
      };
      const onRelease = (event) => {
        dragged = event instanceof MouseEvent && pressPosition !== null && (Math.abs(event.clientX - pressPosition.x) > 3 || Math.abs(event.clientY - pressPosition.y) > 3);
        pressPosition = null;
        selecting = false;
        document.documentElement.classList.remove("rt-selecting");
        if (!insideButton(event)) onSelectionChange();
      };
      const onClick = (event) => {
        var _a;
        if (!(event.target instanceof Element) || event.target.closest(`${REFERENCE_MARKER_SELECTOR}, ${REFERENCE_CONTROLS_SELECTOR}, .review-tool-inline-annotation`)) return;
        const sentence = event.target.closest(SENTENCE_SELECTOR);
        if (!sentence || !root.contains(sentence) || dragged || !((_a = document.getSelection()) == null ? void 0 : _a.isCollapsed)) return;
        event.preventDefault();
        event.stopPropagation();
        const range = document.createRange();
        range.selectNodeContents(sentence);
        const selection = document.getSelection();
        selection == null ? void 0 : selection.removeAllRanges();
        selection == null ? void 0 : selection.addRange(range);
        show(range);
      };
      button.onmouseenter = () => window.clearTimeout(hideTimer);
      button.onmouseleave = () => {
        hideTimer = window.setTimeout(hide, 180);
      };
      root.addEventListener("click", onClick);
      document.addEventListener("selectionchange", onSelectionChange);
      document.addEventListener("mousedown", onPress);
      document.addEventListener("mouseup", onRelease);
      document.addEventListener("touchstart", onPress, { passive: true });
      document.addEventListener("touchend", onRelease);
      document.addEventListener("touchcancel", onRelease);
      return () => {
        window.clearTimeout(selectionTimer);
        window.clearTimeout(hideTimer);
        document.documentElement.classList.remove("rt-selecting");
        root.removeEventListener("click", onClick);
        document.removeEventListener("selectionchange", onSelectionChange);
        document.removeEventListener("mousedown", onPress);
        document.removeEventListener("mouseup", onRelease);
        document.removeEventListener("touchstart", onPress);
        document.removeEventListener("touchend", onRelease);
        document.removeEventListener("touchcancel", onRelease);
        button.remove();
      };
    }
    var init_article_selection = __esm({
      "src/dom/article_selection.ts"() {
        init_state();
        init_article_text();
        init_numeric_pos();
        init_reference_links();
        init_sentence_wrapping();
      }
    });
    function sanitizePlainText(text) {
      if (!text) return "";
      let s = text.replace(/\[\s*\d+\s*\]/g, "");
      s = s.replace(/[\u00B9\u00B2\u00B3\u2070-\u2079]+/g, "");
      return s.replace(/\s+/g, " ").trim();
    }
    function getArticleContentContainer() {
      const selectors = ["#mw-content-text .mw-parser-output", "#mw-content-text", ".mw-parser-output", "#content", "#bodyContent"];
      for (const selector of selectors) {
        const container = document.querySelector(selector);
        if (container) return container;
      }
      return null;
    }
    function restoreInlineAnnotationBubbles(pageName) {
      const container = getArticleContentContainer();
      if (!container) return;
      const annotations = loadAnnotations(pageName).annotations;
      const ids = new Set(annotations.map((annotation) => annotation.id));
      inlineAnnotationBubbles.forEach((bubble, id) => {
        if (!container.contains(bubble) || !ids.has(id)) removeInlineAnnotationBubble(id);
      });
      const missing = annotations.filter((annotation) => !inlineAnnotationBubbles.has(annotation.id));
      if (!missing.length) return;
      const index = buildArticleTextIndex(container);
      const placements = missing.map((annotation) => ({
        annotation,
        range: findAnnotationRange(index, annotation, computeSectionPathFromNode)
      }));
      for (const { annotation, range } of placements) {
        if (!range) continue;
        insertInlineAnnotationBubble(range, pageName, annotation.sectionPath, annotation.id, annotation.opinion);
      }
    }
    function clearAllInlineAnnotationBubbles() {
      inlineAnnotationBubbles.forEach((bubble) => bubble.remove());
      inlineAnnotationBubbles.clear();
      document.querySelectorAll(".review-tool-inline-annotation").forEach((bubble) => {
        bubble.remove();
      });
    }
    function createInlineAnnotationBubbleElement(pageName, sectionPath, annotationId, opinion) {
      const bubble = document.createElement("span");
      bubble.className = "review-tool-inline-annotation";
      bubble.dataset.annoId = annotationId;
      bubble.title = opinion;
      const icon = document.createElement("span");
      icon.className = "review-tool-inline-annotation__icon";
      icon.textContent = "💬";
      icon.title = opinion;
      icon.setAttribute("role", "button");
      icon.tabIndex = 0;
      icon.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        void openAnnotationDialog(pageName, annotationId, sectionPath);
      };
      icon.onkeydown = (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          icon.click();
        }
      };
      bubble.appendChild(icon);
      return bubble;
    }
    function insertInlineAnnotationBubble(range, pageName, sectionPath, annotationId, opinion) {
      if (!range) {
        console.warn("[ReviewTool] Cannot insert inline annotation bubble without a selection range.");
        return;
      }
      removeInlineAnnotationBubble(annotationId);
      const bubble = createInlineAnnotationBubbleElement(pageName, sectionPath, annotationId, opinion);
      inlineAnnotationBubbles.set(annotationId, bubble);
      const insertionRange = range.cloneRange();
      insertionRange.collapse(false);
      insertionRange.insertNode(bubble);
    }
    function updateInlineAnnotationBubble(annotationId, opinion) {
      const bubble = inlineAnnotationBubbles.get(annotationId);
      if (!bubble) return;
      bubble.title = opinion;
      if (bubble.firstElementChild) {
        bubble.firstElementChild.title = opinion;
      }
    }
    function removeInlineAnnotationBubble(annotationId) {
      const bubble = inlineAnnotationBubbles.get(annotationId);
      if (!bubble) return;
      bubble.remove();
      inlineAnnotationBubbles.delete(annotationId);
    }
    async function openAnnotationDialog(pageName, annotationId, sectionPath, options = {}) {
      var _a, _b;
      const selectionRange = (_b = (_a = options.selectionRange) == null ? void 0 : _a.cloneRange()) != null ? _b : null;
      const isEdit = annotationId !== null;
      const existingAnnotation = isEdit && annotationId ? getAnnotation(pageName, annotationId) : null;
      const displaySentenceText = isEdit ? (existingAnnotation == null ? void 0 : existingAnnotation.sentenceText) || "" : sanitizePlainText(options.sentenceText || "");
      const initialOpinion = isEdit ? (existingAnnotation == null ? void 0 : existingAnnotation.opinion) || "" : "";
      let shouldReopenViewer = isAnnotationViewerDialogOpen();
      sectionPath = sectionPath === "目次" ? "序言" : sectionPath;
      try {
        const container = getArticleContentContainer();
        const sourceRange = selectionRange != null ? selectionRange : container && existingAnnotation ? findAnnotationRange(buildArticleTextIndex(container), existingAnnotation, computeSectionPathFromNode) : null;
        const relatedSources = container ? collectRelatedSources(container, sourceRange) : [];
        if (shouldReopenViewer) {
          closeAnnotationViewerDialog();
        }
        const result = await openAnnotationEditorDialog({
          sectionPath,
          sentenceText: displaySentenceText,
          relatedSources,
          initialOpinion,
          mode: isEdit ? "edit" : "create",
          allowDelete: isEdit
        });
        if (result.action === "replaced") {
          shouldReopenViewer = false;
          return;
        }
        if (result.action === "cancel") {
          return;
        }
        if (result.action === "delete" && isEdit && annotationId) {
          const removed = deleteAnnotation(pageName, annotationId);
          if (removed) {
            removeInlineAnnotationBubble(annotationId);
          }
          return;
        }
        if (result.action === "save") {
          if (isEdit && annotationId) {
            const updated = updateAnnotation(pageName, annotationId, { opinion: result.opinion });
            if (updated) {
              updateInlineAnnotationBubble(annotationId, result.opinion);
            }
          } else {
            const sentencePosKey = options.sentencePos || "";
            const container2 = getArticleContentContainer();
            const textAnchor = container2 && selectionRange ? captureAnnotationAnchor(buildArticleTextIndex(container2), selectionRange) : void 0;
            const created = createAnnotation(pageName, sectionPath, displaySentenceText, result.opinion, sentencePosKey, textAnchor);
            insertInlineAnnotationBubble(selectionRange, pageName, sectionPath, created.id, result.opinion);
          }
        }
      } catch (error) {
        console.error("[ReviewTool] Annotation action failed", error);
        mw.notify(state_default.convByVar({
          hant: "無法完成批註操作，請檢查瀏覽器儲存空間後重試。",
          hans: "无法完成批注操作，请检查浏览器存储空间后重试。"
        }), { type: "error", tag: "review-tool" });
      } finally {
        if (shouldReopenViewer) {
          showAnnotationViewer(pageName);
        }
      }
    }
    function refreshAnnotationViewer(pageName) {
      updateAnnotationViewerDialogGroups(buildAnnotationGroups(pageName), canUndoClearAnnotations(pageName));
    }
    function restoreClearedPageAnnotations(pageName) {
      try {
        const restored = undoClearAnnotations(pageName);
        refreshAnnotationViewer(pageName);
        restoreInlineAnnotationBubbles(pageName);
        mw.notify(state_default.convByVar({
          hant: `已復原 ${restored} 則批註。`,
          hans: `已恢复 ${restored} 条批注。`
        }), { tag: "review-tool-clear" });
      } catch (error) {
        console.error("[ReviewTool] Failed to restore cleared annotations", error);
        mw.notify(state_default.convByVar({
          hant: "無法復原批註，請檢查瀏覽器儲存空間後重試。",
          hans: "无法恢复批注，请检查浏览器存储空间后重试。"
        }), { type: "error", tag: "review-tool" });
      }
    }
    function clearPageAnnotations(pageName) {
      if (!clearAnnotations(pageName)) return false;
      clearAllInlineAnnotationBubbles();
      refreshAnnotationViewer(pageName);
      const message = document.createElement("span");
      message.textContent = state_default.convByVar({ hant: "已清除本頁批註。", hans: "已清除本页批注。" });
      const undo = document.createElement("button");
      undo.type = "button";
      undo.className = "review-tool-undo-clear";
      undo.textContent = state_default.convByVar({ hant: "復原清除", hans: "撤销清除" });
      undo.onclick = (event) => {
        event.stopPropagation();
        restoreClearedPageAnnotations(pageName);
      };
      message.appendChild(undo);
      mw.notify(message, { autoHide: false, tag: "review-tool-clear" });
      return true;
    }
    function showAnnotationViewer(pageName) {
      if (isAnnotationViewerDialogOpen()) {
        closeAnnotationViewerDialog();
        return;
      }
      const groups = buildAnnotationGroups(pageName);
      void openAnnotationViewerDialog({
        pageName,
        groups,
        initialCanUndoClear: canUndoClearAnnotations(pageName),
        onEditAnnotation: (annotationId, sectionPath) => {
          void openAnnotationDialog(pageName, annotationId, sectionPath);
        },
        onDeleteAnnotation: (annotationId) => {
          const removed = deleteAnnotation(pageName, annotationId);
          if (removed) {
            removeInlineAnnotationBubble(annotationId);
            refreshAnnotationViewer(pageName);
          }
        },
        onClearAllAnnotations: () => clearPageAnnotations(pageName),
        onUndoClearAnnotations: () => restoreClearedPageAnnotations(pageName),
        onImportAnnotations: (json) => {
          const imported = importAnnotations(pageName, json);
          refreshAnnotationViewer(pageName);
          restoreInlineAnnotationBubbles(pageName);
          return imported;
        }
      });
    }
    function addMainPageReviewToolButtonsToDOM(pageName) {
      restoreInlineAnnotationBubbles(pageName);
      addGlobalAnnotationViewerButton(pageName);
      syncAnnotationModeMenuState(annotationModeActive, pageName);
      if (annotationModeActive) installArticleInteractions(pageName);
    }
    function addGlobalAnnotationViewerButton(pageName) {
      if (document.querySelector(".review-tool-global-button")) return;
      const btn = document.createElement("button");
      btn.className = "review-tool-global-button";
      btn.textContent = state_default.convByVar({ hant: "查看批註", hans: "查看批注" });
      btn.title = state_default.convByVar({ hant: "查看本頁所有批註", hans: "查看本页所有批注" });
      btn.onclick = () => showAnnotationViewer(state_default.articleTitle || pageName);
      document.body.appendChild(btn);
    }
    async function toggleArticleAnnotationMode(pageName) {
      if (annotationActivationPending) return;
      const container = getArticleContentContainer();
      if (!annotationModeActive) {
        if (!container) return;
        annotationActivationPending = true;
        try {
          await confirmClearOnFirstActivation(pageName, () => {
            clearPageAnnotations(pageName);
          });
        } catch (error) {
          console.error("[ReviewTool] Failed to clear annotations", error);
          mw.notify(state_default.convByVar({ hant: "無法清除批註，已保留原有批註。", hans: "无法清除批注，已保留原有批注。" }), {
            type: "error",
            tag: "review-tool-clear"
          });
        } finally {
          annotationActivationPending = false;
        }
      }
      annotationModeActive = !annotationModeActive;
      const isActive = annotationModeActive;
      syncAnnotationModeMenuState(isActive, pageName);
      document.documentElement.classList.toggle("review-tool-annotation-mode", isActive);
      mw.notify(state_default.convByVar({
        hant: isActive ? "批註模式已啟用。" : "批註模式已停用。",
        hans: isActive ? "批注模式已启用。" : "批注模式已停用。"
      }), { tag: "review-tool" });
      if (isActive) installArticleInteractions(pageName);
      else {
        removeArticleInteractions == null ? void 0 : removeArticleInteractions();
        removeArticleInteractions = null;
      }
    }
    function installArticleInteractions(pageName) {
      removeArticleInteractions == null ? void 0 : removeArticleInteractions();
      removeArticleInteractions = null;
      const container = getArticleContentContainer();
      if (!container) return;
      wrapArticleSentences(container);
      const removeSelection = installArticleSelection(container, (range, sentenceText, sentencePos) => {
        void openAnnotationDialog(pageName, null, computeSectionPathFromNode(range.startContainer), {
          sentenceText,
          selectionRange: range,
          sentencePos
        });
      });
      const removeReferences = installReferenceLinkTips(container);
      removeArticleInteractions = () => {
        removeSelection();
        removeReferences();
        clearWrappedSentences(container);
      };
    }
    function getReviewToolPortletLabel(isActive) {
      return state_default.convByVar({
        hant: isActive ? "關閉批註模式" : "啟用批註模式",
        hans: isActive ? "关闭批注模式" : "开启批注模式"
      });
    }
    function syncAnnotationModeMenuState(isActive, pageName) {
      addPortletTrigger(REVIEWTOOL_PORTLET_ID, getReviewToolPortletLabel(isActive), () => {
        void toggleArticleAnnotationMode(pageName);
      });
      const portlet = document.getElementById(REVIEWTOOL_PORTLET_ID);
      if (portlet) {
        portlet.classList.toggle("selected", isActive);
      }
    }
    var inlineAnnotationBubbles, removeArticleInteractions, annotationModeActive, annotationActivationPending, REVIEWTOOL_PORTLET_ID;
    var init_article_page = __esm({
      "src/dom/article_page.ts"() {
        init_utils();
        init_state();
        init_annotation_session();
        init_reference_links();
        init_related_sources();
        init_annotations();
        init_annotation_editor2();
        init_annotation_viewer2();
        init_article_text();
        init_article_selection();
        init_sentence_wrapping();
        init_annotation_anchor();
        inlineAnnotationBubbles = /* @__PURE__ */ new Map();
        removeArticleInteractions = null;
        annotationModeActive = false;
        annotationActivationPending = false;
        REVIEWTOOL_PORTLET_ID = "ca-reviewtool-toggle";
      }
    });
    var main_exports = {};
    __export(main_exports, {
      init: () => init
    });
    function injectStyles(css) {
      if (!css) return;
      const style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);
    }
    async function init() {
      const namespace = mw.config.get("wgNamespaceNumber");
      const pageName = mw.config.get("wgPageName");
      if (namespace !== 0 && pageName !== "User:SuperGrey/gadgets/ReviewTool/TestPage") {
        return;
      }
      if (typeof document !== "undefined") {
        injectStyles(styles_default);
      }
      await state_default.initHanAssist();
      state_default.articleTitle = pageName;
      mw.hook("wikipage.content").add(() => addMainPageReviewToolButtonsToDOM(pageName));
    }
    var init_main = __esm({
      "src/main.ts"() {
        init_state();
        init_styles();
        init_article_page();
      }
    });
    function waitForMediaWiki() {
      return new Promise((resolve) => {
        const queue = window.RLQ = window.RLQ || [];
        queue.push(() => resolve());
      });
    }
    async function startReviewTool() {
      await waitForMediaWiki();
      await mw.loader.using("mediawiki.util");
      const { init: init2 } = await Promise.resolve().then(() => (init_main(), main_exports));
      await init2();
    }
    void startReviewTool().catch((error) => console.error("[ReviewTool] Initialization failed", error));
  }
  function installInPage(application) {
    const script = document.createElement("script");
    script.textContent = "(" + application.toString() + ")();";
    document.documentElement.appendChild(script);
    script.remove();
  }
  installInPage(reviewToolApplication);
})();
// </nowiki>
