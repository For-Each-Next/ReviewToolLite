// [[User:SuperGrey/gadgets/ReviewTool]]
// Repository: https://github.com/QZGao/ReviewTool
// Release: 1.0.1
// Timestamp: 2026-09-18T14:15:02.774Z
// <nowiki>
(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

  // src/state.ts
  var State = class {
    constructor() {
      // 簡繁轉換
      this.convByVar = function(langDict) {
        if (langDict && langDict.hant) {
          return langDict.hant;
        }
        return "繁簡轉換未初始化，且 langDict 無效！";
      };
      // 當前條目標題
      this.articleTitle = "";
      // 用戶名
      this.userName = mw.config.get("wgUserName") || "Example";
      // 批註模式狀態
      this.annotationModeState = {};
    }
    initHanAssist() {
      return mw.loader.using("ext.gadget.HanAssist").then((require2) => {
        const { convByVar } = require2("ext.gadget.HanAssist");
        if (typeof convByVar === "function") {
          this.convByVar = convByVar;
        }
      });
    }
    isAnnotationModeActive(headingTitle) {
      return !!this.annotationModeState[headingTitle];
    }
    toggleAnnotationModeState(headingTitle) {
      const currentState = this.isAnnotationModeActive(headingTitle);
      this.annotationModeState[headingTitle] = !currentState;
    }
  };
  var state = new State();
  var state_default = state;

  // src/styles.css
  var styles_default = ".review-tool-dialog {\n    /* Wrap prose and long URLs without hiding any of the annotation. */\n    overflow-wrap: anywhere;\n}\n\n.review-tool-dialog .cdx-button,\n.review-tool-dialog .cdx-menu-button {\n    max-inline-size: 100%;\n}\n\n.review-tool-dialog .cdx-menu-button,\n.review-tool-dialog .cdx-text-area,\n.review-tool-dialog .cdx-select-vue__handle {\n    /* Codex form controls otherwise have a 256px minimum width. */\n    min-inline-size: 0;\n}\n\n.review-tool-dialog .cdx-menu-button > .cdx-button {\n    inline-size: 100%;\n}\n\n/* Keep controls one line high; the full label remains in their text and title. */\n.review-tool-control-label {\n    display: block;\n    min-inline-size: 0;\n    max-inline-size: 100%;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n}\n\n.review-tool-dialog .review-tool-form-section:not(:first-child) {\n    margin-top: 10px;\n}\n\n.review-tool-dialog textarea {\n    min-height: 32px;\n    max-height: 160px;\n    resize: vertical;\n}\n\n/* Annotation UI styles */\n.review-tool-annotation-ui .sentence {\n    background: transparent;\n}\n\n.review-tool-annotation-ui .sentence:hover {\n    background: rgba(255, 235, 59, 0.12);\n}\n\n.review-tool-annotation-ui .annotation-badge {\n    display: inline-block;\n    background: #ffcc00;\n    color: #000;\n    border-radius: 10px;\n    padding: 0 6px;\n    font-size: 11px;\n    margin-left: 6px;\n}\n\n.review-tool-annotation-ui .floating-button {\n    background: #1976d2;\n    color: white;\n    border: none;\n    padding: 6px 8px;\n    border-radius: 4px;\n    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);\n    cursor: pointer;\n}\n\n/* Floating popup button: span has both classes on same element */\n.review-tool-annotation-ui.floating-button,\n.floating-button.review-tool-annotation-ui {\n    background: #1976d2;\n    color: #fff;\n    border: none;\n    padding: 6px 8px;\n    border-radius: 4px;\n    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);\n    cursor: pointer;\n    font-size: 13px;\n    line-height: 1.2;\n    white-space: nowrap;\n}\n\n.review-tool-annotation-ui.floating-button:hover {\n    background: #1e88e5;\n}\n\n/* Annotation badge actual class name fix */\n.review-tool-annotation-badge {\n    display: inline-block;\n    background: #ffcc00;\n    color: #000;\n    border-radius: 10px;\n    padding: 0 6px;\n    font-size: 11px;\n    margin-left: 4px;\n    vertical-align: baseline;\n    text-decoration: none;\n}\n\n.review-tool-annotation-badge:hover {\n    filter: brightness(1.1);\n}\n\n.review-tool-annotation-badge--section {\n    margin-left: 6px;\n}\n\n.review-tool-inline-annotation {\n    display: none;\n    align-items: center;\n    margin-left: 4px;\n    vertical-align: baseline;\n    gap: 2px;\n}\n\n.review-tool-annotation-mode .review-tool-inline-annotation {\n    display: inline-flex;\n}\n\n.review-tool-inline-annotation__icon {\n    background: #fff7d1;\n    border: 1px solid #f5c400;\n    border-radius: 999px;\n    color: #202122;\n    cursor: pointer;\n    font-size: 11px;\n    line-height: 1.3;\n    padding: 0 6px;\n    text-decoration: none;\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    min-height: 16px;\n}\n\n.review-tool-inline-annotation__icon:hover {\n    background: #ffe58f;\n}\n\n.review-tool-annotation-editor__label {\n    font-size: 12px;\n    font-weight: 600;\n    color: #54595d;\n    margin-bottom: 4px;\n}\n\n.review-tool-annotation-editor__section {\n    font-size: 13px;\n    color: #202122;\n}\n\n.review-tool-annotation-editor__quote {\n    background: #f8f9fa;\n    border: 1px solid #eaecf0;\n    border-radius: 4px;\n    padding: 8px;\n    white-space: pre-wrap;\n    max-height: 160px;\n    overflow-y: auto;\n}\n\n.review-tool-annotation-editor__quote:focus-visible {\n    outline: 2px solid var(--color-progressive, #36c);\n    outline-offset: 2px;\n}\n\n.review-tool-annotation-editor__error {\n    color: #d73333;\n    font-size: 12px;\n    margin-top: 4px;\n}\n\n.review-tool-annotation-editor__footer {\n    display: flex;\n    flex-wrap: wrap;\n    justify-content: space-between;\n    align-items: center;\n    gap: var(--spacing-75, 12px);\n    padding-top: 12px;\n}\n\n.review-tool-annotation-editor__actions {\n    display: flex;\n    flex-wrap: wrap;\n    gap: var(--spacing-75, 12px);\n    margin-inline-start: auto;\n}\n\n.review-tool-annotation-viewer__empty {\n    text-align: center;\n    color: #54595d;\n    padding: 32px 0;\n}\n\n.review-tool-annotation-viewer__footer {\n    display: flex;\n    flex-direction: column;\n    gap: var(--spacing-75, 12px);\n    padding-top: 12px;\n}\n\n.review-tool-annotation-viewer__footer-left {\n    display: flex;\n    align-items: center;\n}\n\n.review-tool-annotation-viewer__sort-select {\n    inline-size: 220px;\n    max-inline-size: 100%;\n    min-inline-size: 0;\n}\n\n.review-tool-annotation-viewer__footer-controls {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    gap: var(--spacing-75, 12px);\n    flex-wrap: wrap;\n}\n\n.review-tool-annotation-viewer__footer-actions {\n    display: flex;\n    align-items: center;\n    gap: var(--spacing-75, 12px);\n    justify-content: flex-end;\n    margin-inline-start: auto;\n    flex-wrap: wrap;\n}\n\n.review-tool-annotation-editor__footer,\n.review-tool-annotation-editor__actions,\n.review-tool-annotation-viewer__footer,\n.review-tool-annotation-viewer__footer-left,\n.review-tool-annotation-viewer__footer-controls,\n.review-tool-annotation-viewer__footer-actions {\n    min-inline-size: 0;\n    max-inline-size: 100%;\n}\n\n@media (max-width: 480px) {\n    .review-tool-annotation-viewer__footer-controls,\n    .review-tool-annotation-viewer__footer-actions,\n    .review-tool-annotation-editor__footer,\n    .review-tool-annotation-editor__actions {\n        /* Put primary actions first when stacked, in both reading directions. */\n        flex-direction: column-reverse;\n        align-items: stretch;\n    }\n\n    .review-tool-annotation-viewer__footer-actions,\n    .review-tool-annotation-editor__actions {\n        margin-inline-start: 0;\n    }\n\n    .review-tool-annotation-viewer__sort-select {\n        inline-size: 100%;\n    }\n}\n\n@media (max-width: 480px) and (max-height: 480px) {\n    /* Leave room for the content when a landscape screen or keyboard reduces height. */\n    .review-tool-annotation-viewer__footer-controls,\n    .review-tool-annotation-viewer__footer-actions,\n    .review-tool-annotation-editor__footer,\n    .review-tool-annotation-editor__actions {\n        flex-direction: row;\n        align-items: center;\n    }\n\n    .review-tool-annotation-viewer__footer-actions,\n    .review-tool-annotation-editor__actions {\n        margin-inline-start: auto;\n    }\n}\n\n.review-tool-annotation-viewer__section {\n    margin-bottom: 16px;\n}\n\n.review-tool-annotation-viewer__section-title {\n    font-size: 13px;\n    font-weight: 600;\n    margin: 0 0 6px;\n}\n\n.review-tool-annotation-viewer__items {\n    list-style: none;\n    padding: 0;\n    margin: 0;\n}\n\n.review-tool-annotation-viewer__item {\n    border: 1px solid #eaecf0;\n    border-radius: 6px;\n    padding: 8px;\n    margin-bottom: 8px;\n    background: #fff;\n}\n\n.review-tool-annotation-viewer__quote {\n    font-style: italic;\n    color: #54595d;\n}\n\n.review-tool-annotation-viewer__opinion {\n    margin-top: 4px;\n}\n\n.review-tool-annotation-viewer__quote,\n.review-tool-annotation-viewer__opinion {\n    white-space: pre-wrap;\n}\n\n.review-tool-annotation-viewer__meta {\n    font-size: 12px;\n    color: #72777d;\n    margin-top: 4px;\n}\n\n.review-tool-annotation-viewer__actions {\n    display: flex;\n    flex-wrap: wrap;\n    gap: var(--spacing-75, 12px);\n    margin-top: 6px;\n}\n\n/* Sentence highlight styles adapt to current DOM: spans carry both classes */\n.review-tool-annotation-ui.sentence {\n    background: transparent;\n    transition: background 120ms ease-in;\n}\n\n.review-tool-annotation-ui.sentence:hover {\n    background: rgba(255, 235, 59, 0.2);\n}\n\n/* Keep descendant version for future container-based refactor */\n.review-tool-annotation-ui .sentence:hover {\n    background: rgba(255, 235, 59, 0.2);\n}\n\n/* Cursor behavior for annotation sentences */\n.review-tool-annotation-ui.sentence {\n    cursor: pointer;\n}\n\nhtml.rt-selecting .review-tool-annotation-ui.sentence {\n    cursor: text;\n}\n\n/* Ensure floating button is always clickable */\n.review-tool-annotation-ui.floating-button,\n.floating-button.review-tool-annotation-ui {\n    cursor: pointer;\n}\n\n/* Stronger highlight rule to ensure visibility on pages with competing styles */\n.review-tool-annotation-ui.sentence:hover,\n.review-tool-annotation-ui .sentence:hover {\n    background: rgba(255, 235, 59, 0.22) !important;\n}\n\n/* While annotation mode is active, allow selection over known inline editor widgets\n   that set `user-select: none` (e.g. ipe quick-edit buttons). This only applies\n   while our mode is on to avoid changing page behavior permanently. */\n.review-tool-annotation-mode .ipe__in-article-link,\n.review-tool-annotation-mode .ipe-quick-edit,\n.review-tool-annotation-mode .ipe-quick-edit--create-only,\n.review-tool-annotation-mode .qeec-ref-tag-copy-btn {\n    user-select: text !important;\n    pointer-events: auto !important;\n}\n";

  // src/dom/utils.ts
  function getHeadingTitle(heading) {
    if (!heading) return null;
    const htmlHeading = heading instanceof HTMLHeadingElement ? heading : heading.querySelector("h1, h2, h3, h4, h5, h6");
    if (!htmlHeading) return null;
    if (htmlHeading.id) return htmlHeading.id;
    const innerWithId = htmlHeading.querySelector("[id]");
    if (innerWithId && innerWithId.id) return innerWithId.id;
    const threadId = htmlHeading.getAttribute && htmlHeading.getAttribute("data-mw-thread-id");
    if (threadId) return threadId;
    const text = htmlHeading.textContent && htmlHeading.textContent.trim();
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

  // src/annotations.ts
  var KEY_PREFIX = "reviewtool:annotations:";
  function storageKeyForPage(pageName) {
    return KEY_PREFIX + (pageName || "unknown");
  }
  function getStorage(type) {
    if (typeof window === "undefined") return null;
    try {
      return type === "local" ? window.localStorage : window.sessionStorage;
    } catch (e) {
      console.error("[ReviewTool] ".concat(type, "Storage unavailable"), e);
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
    if (typeof anno.id !== "string") return null;
    if (typeof anno.sectionPath !== "string") return null;
    if (typeof anno.sentenceText !== "string") return null;
    if (typeof anno.opinion !== "string") return null;
    if (typeof anno.createdBy !== "string") return null;
    if (typeof anno.createdAt !== "number") return null;
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
    const annotations = parsedAnnotations.map((anno) => normalizeAnnotation(anno)).filter((anno) => !!anno);
    const normalized = {
      pageName: typeof (parsedRecord == null ? void 0 : parsedRecord.pageName) === "string" ? parsedRecord.pageName : pageName,
      createdAt: typeof (parsedRecord == null ? void 0 : parsedRecord.createdAt) === "number" ? parsedRecord.createdAt : Date.now(),
      annotations
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
      if (!annotation || !annotation.id.trim() || !Number.isFinite(annotation.createdAt)) {
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
    if (imported && !saveAnnotations(__spreadProps(__spreadValues({}, store), { pageName }))) {
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
    saveAnnotations(store);
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
    const updated = __spreadValues(__spreadValues({}, store.annotations[idx]), updates);
    store.annotations[idx] = updated;
    saveAnnotations(store);
    return updated;
  }
  function deleteAnnotation(pageName, id) {
    const store = loadAnnotations(pageName);
    const before = store.annotations.length;
    store.annotations = store.annotations.filter((a) => a.id !== id);
    if (store.annotations.length !== before) {
      saveAnnotations(store);
      return true;
    }
    return false;
  }
  function clearAnnotations(pageName) {
    const key = storageKeyForPage(pageName);
    const localStore = getStorage("local");
    const sessionStore = getStorage("session");
    let removed = false;
    if (localStore) {
      try {
        if (localStore.getItem(key) !== null) removed = true;
        localStore.removeItem(key);
      } catch (e) {
        console.error("[ReviewTool] failed to clear annotations from localStorage", e);
      }
    }
    if (sessionStore) {
      try {
        if (sessionStore.getItem(key) !== null) removed = true;
        sessionStore.removeItem(key);
      } catch (e) {
        console.error("[ReviewTool] failed to clear annotations from sessionStorage", e);
      }
    }
    return removed;
  }
  function sortAnnotationsByTimestamp(list) {
    return [...list].sort((a, b) => a.createdAt - b.createdAt);
  }
  function buildAnnotationGroups(pageName) {
    const store = loadAnnotations(pageName);
    if (!store.annotations.length) {
      return [];
    }
    const buckets = /* @__PURE__ */ new Map();
    for (const anno of store.annotations) {
      const key = typeof anno.sectionPath === "string" && anno.sectionPath.trim() ? anno.sectionPath.trim() : "";
      const existing = buckets.get(key);
      if (existing) {
        existing.push(anno);
      } else {
        buckets.set(key, [anno]);
      }
    }
    const groups = [];
    for (const [sectionPath, annotations] of buckets.entries()) {
      groups.push({
        sectionPath,
        annotations: sortAnnotationsByTimestamp(annotations)
      });
    }
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

  // src/dialog.ts
  var _mountedApp = null;
  var _mountedRoot = null;
  var _imeListenersInstalled = false;
  var _isImeComposing = false;
  var _imeResetTimer = null;
  var _lastCompositionAt = 0;
  function isEditableEventTarget(target) {
    if (!target || !(target instanceof HTMLElement)) return false;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      return !target.disabled && !target.readOnly;
    }
    return target.isContentEditable;
  }
  function onCompositionStart() {
    if (_imeResetTimer !== null) {
      window.clearTimeout(_imeResetTimer);
      _imeResetTimer = null;
    }
    _isImeComposing = true;
    _lastCompositionAt = Date.now();
  }
  function onCompositionEnd() {
    _lastCompositionAt = Date.now();
    if (_imeResetTimer !== null) {
      window.clearTimeout(_imeResetTimer);
    }
    _imeResetTimer = window.setTimeout(() => {
      _isImeComposing = false;
      _imeResetTimer = null;
    }, 80);
  }
  function onCompositionInput(event) {
    const inputType = typeof event.inputType === "string" ? event.inputType : "";
    if (event.isComposing || inputType.indexOf("insertComposition") === 0) {
      _lastCompositionAt = Date.now();
      _isImeComposing = true;
    }
  }
  function isCompositionLikelyActive() {
    if (_isImeComposing) return true;
    return Date.now() - _lastCompositionAt <= 500;
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
    if (_imeListenersInstalled) return;
    window.addEventListener("compositionstart", onCompositionStart, true);
    window.addEventListener("compositionend", onCompositionEnd, true);
    window.addEventListener("beforeinput", onCompositionInput, true);
    window.addEventListener("input", onCompositionInput, true);
    window.addEventListener("keydown", onEscapeKey, true);
    window.addEventListener("keyup", onEscapeKey, true);
    window.addEventListener("cancel", onDialogCancel, true);
    _imeListenersInstalled = true;
  }
  function removeImeEscGuard() {
    if (!_imeListenersInstalled) return;
    window.removeEventListener("compositionstart", onCompositionStart, true);
    window.removeEventListener("compositionend", onCompositionEnd, true);
    window.removeEventListener("beforeinput", onCompositionInput, true);
    window.removeEventListener("input", onCompositionInput, true);
    window.removeEventListener("keydown", onEscapeKey, true);
    window.removeEventListener("keyup", onEscapeKey, true);
    window.removeEventListener("cancel", onDialogCancel, true);
    if (_imeResetTimer !== null) {
      window.clearTimeout(_imeResetTimer);
      _imeResetTimer = null;
    }
    _imeListenersInstalled = false;
    _isImeComposing = false;
    _lastCompositionAt = 0;
  }
  function loadCodexAndVue() {
    return mw.loader.using("@wikimedia/codex").then((requireFn) => {
      const Vue = requireFn("vue");
      const Codex = requireFn("@wikimedia/codex");
      if (typeof window !== "undefined" && !window.Vue) {
        window.Vue = Vue;
      }
      return { Vue, Codex };
    });
  }
  function createDialogMountIfNeeded() {
    if (!document.getElementById("review-tool-dialog-mount")) {
      const mountPoint = document.createElement("div");
      mountPoint.id = "review-tool-dialog-mount";
      document.body.appendChild(mountPoint);
    }
    return document.getElementById("review-tool-dialog-mount");
  }
  function mountApp(app) {
    createDialogMountIfNeeded();
    installImeEscGuard();
    _mountedApp = app;
    _mountedRoot = app.mount("#review-tool-dialog-mount");
    return _mountedRoot;
  }
  function getMountedApp() {
    return _mountedApp;
  }
  function removeDialogMount() {
    const mountPoint = document.getElementById("review-tool-dialog-mount");
    if (mountPoint) mountPoint.remove();
    removeImeEscGuard();
    _mountedApp = null;
    _mountedRoot = null;
  }
  function registerCodexComponents(app, Codex) {
    if (!app || !app.component || !Codex) return;
    try {
      app.component("cdx-dialog", Codex.CdxDialog).component("cdx-text-area", Codex.CdxTextArea).component("cdx-select", Codex.CdxSelect).component("cdx-button", Codex.CdxButton).component("cdx-menu-button", Codex.CdxMenuButton);
    } catch (e) {
    }
  }

  // src/dialogs/comment_shortcuts.ts
  var cleanupHandlers = /* @__PURE__ */ new WeakMap();
  function continueCommentList(textarea) {
    const caret = textarea.selectionStart;
    const newline = caret - 1;
    if (textarea.value[newline] !== "\n") return;
    const lineStart = textarea.value.slice(0, newline).lastIndexOf("\n") + 1;
    const previousLine = textarea.value.slice(lineStart, newline);
    if (!previousLine.trim()) return;
    const bullet = previousLine.match(/^([ \t]*)(\*+)[ \t]*/);
    const marker = bullet ? "".concat(bullet[1]).concat(bullet[2], " ") : "* ";
    const firstComment = bullet ? previousLine : "* ".concat(previousLine);
    const nextCaret = caret + firstComment.length - previousLine.length + marker.length;
    textarea.value = textarea.value.slice(0, lineStart) + firstComment + "\n" + marker + textarea.value.slice(caret);
    textarea.setSelectionRange(nextCaret, nextCaret);
  }
  function expandShortcuts(textarea) {
    const changes = [];
    const value = textarea.value.replace(/<<([^<>]+)>>/g, (match, content, offset) => {
      const replacement = "「{{仿宋体|1=".concat(content, "}}」");
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
  var commentShortcuts = {
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

  // src/dialogs/components/annotation_editor.vue
  var _defineComponent = (...args) => window.Vue && window.Vue.defineComponent ? window.Vue.defineComponent(...args) : args[0];
  var __sfc__ = _defineComponent({
    __name: "annotation_editor",
    props: {
      mode: { type: String, required: false, default: "create" },
      sectionPath: { type: String, required: false, default: "" },
      sentenceText: { type: String, required: false, default: "" },
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
          opinionLabel: state_default.convByVar({ hant: "批註內容", hans: "批注内容" }),
          opinionPlaceholder: state_default.convByVar({ hant: "請輸入批註內容…", hans: "请输入批注内容…" }),
          opinionRequired: state_default.convByVar({ hant: "批註內容不能為空", hans: "批注内容不能为空" }),
          cancel: state_default.convByVar({ hant: "取消", hans: "取消" }),
          save: state_default.convByVar({ hant: "儲存", hans: "保存" }),
          create: state_default.convByVar({ hant: "新增", hans: "新增" }),
          delete: state_default.convByVar({ hant: "刪除", hans: "删除" }),
          deleteConfirm: state_default.convByVar({ hant: "確定要刪除這條批註？", hans: "确定要删除这条批注？" })
        };
      }
      const VueRuntime = window.Vue;
      if (!VueRuntime) {
        throw new Error("Vue runtime not found");
      }
      const { ref, computed, watch } = VueRuntime;
      const props = __props;
      const i18n = buildI18n();
      const open = ref(true);
      const opinion = ref(typeof props.initialOpinion === "string" ? props.initialOpinion : "");
      const showValidationError = ref(false);
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
        setTimeout(() => removeDialogMount(), 200);
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
      const __returned__ = { buildI18n, VueRuntime, ref, computed, watch, props, i18n, open, opinion, showValidationError, dialogTitle, primaryLabel, canSave, closeDialog, onPrimaryAction, onCancelAction, onDeleteClick, onUpdateOpen, get vCommentShortcuts() {
        return commentShortcuts;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function render(_ctx, _cache, $props, $setup, $data, $options) {
    const { toDisplayString: _toDisplayString, createElementVNode: _createElementVNode, resolveComponent: _resolveComponent, createVNode: _createVNode, openBlock: _openBlock, createElementBlock: _createElementBlock, createCommentVNode: _createCommentVNode, withDirectives: _withDirectives, withModifiers: _withModifiers, withCtx: _withCtx, createBlock: _createBlock } = window.Vue;
    const _component_cdx_text_area = _resolveComponent("cdx-text-area");
    const _component_cdx_button = _resolveComponent("cdx-button");
    const _component_cdx_dialog = _resolveComponent("cdx-dialog");
    return _openBlock(), _createBlock(_component_cdx_dialog, {
      open: $setup.open,
      "onUpdate:open": [
        _cache[1] || (_cache[1] = ($event) => $setup.open = $event),
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
        _withDirectives((_openBlock(), _createElementBlock("div", { class: "review-tool-form-section" }, [
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
          _createVNode(_component_cdx_text_area, {
            id: "annotation-opinion-input",
            modelValue: $setup.opinion,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.opinion = $event),
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
  __sfc__.render = render;
  var annotation_editor_default = __sfc__;

  // src/dialogs/annotation_editor.ts
  function openAnnotationEditorDialog(options) {
    var _a;
    const dialogOptions = {
      sectionPath: options.sectionPath,
      sentenceText: options.sentenceText,
      initialOpinion: options.initialOpinion || "",
      mode: options.mode || "create",
      allowDelete: (_a = options.allowDelete) != null ? _a : options.mode === "edit"
    };
    if (getMountedApp()) removeDialogMount();
    return loadCodexAndVue().then(({ Vue, Codex }) => {
      return new Promise((resolve) => {
        let resolved = false;
        const finalize = (result) => {
          if (resolved) return;
          resolved = true;
          resolve(result);
        };
        const app = Vue.createMwApp({
          render() {
            return Vue.h(
              annotation_editor_default,
              {
                sectionPath: dialogOptions.sectionPath,
                sentenceText: dialogOptions.sentenceText,
                initialOpinion: dialogOptions.initialOpinion,
                mode: dialogOptions.mode,
                allowDelete: dialogOptions.allowDelete,
                onResolve: finalize
              }
            );
          }
        });
        registerCodexComponents(app, Codex);
        mountApp(app);
      });
    }).catch((error) => {
      console.error("[ReviewTool] Failed to open annotation editor dialog", error);
      if (mw && mw.notify) {
        mw.notify(state_default.convByVar({ hant: "無法開啟批註對話框。", hans: "无法开启批注对话框。" }), {
          type: "error",
          title: "[ReviewTool]"
        });
      }
      throw error;
    });
  }

  // src/dom/numeric_pos.ts
  var DEFAULT_ROOT_SELECTOR = "#mw-content-text";
  var DEFAULT_PADDING = 6;
  function resolveRoot(root) {
    if (!root) {
      return document.querySelector(DEFAULT_ROOT_SELECTOR);
    }
    if (typeof root === "string") {
      return document.querySelector(root);
    }
    return root;
  }
  function countPreviousElementSiblings(node) {
    let index = 0;
    let sibling = node ? node.previousElementSibling : null;
    while (sibling) {
      index++;
      sibling = sibling.previousElementSibling;
    }
    return index;
  }
  function getElementPathArray(element, root) {
    if (!element) return null;
    const rootEl = resolveRoot(root);
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
  function pathArrayToKey(path, paddingWidth = DEFAULT_PADDING) {
    if (!path) return null;
    const width = Math.max(1, paddingWidth | 0);
    return path.map((segment) => String(segment).padStart(width, "0")).join(".");
  }
  function getElementOrderKey(element, options) {
    var _a, _b;
    const path = getElementPathArray(element, (_a = options == null ? void 0 : options.root) != null ? _a : DEFAULT_ROOT_SELECTOR);
    return pathArrayToKey(path, (_b = options == null ? void 0 : options.paddingWidth) != null ? _b : DEFAULT_PADDING);
  }
  function compareOrderKeys(a, b) {
    if (!a && !b) return 0;
    if (!a) return -1;
    if (!b) return 1;
    const partsA = a.split(".").map((part) => parseInt(part, 10));
    const partsB = b.split(".").map((part) => parseInt(part, 10));
    const len = Math.min(partsA.length, partsB.length);
    for (let i = 0; i < len; i++) {
      if (partsA[i] !== partsB[i]) {
        return partsA[i] - partsB[i];
      }
    }
    return partsA.length - partsB.length;
  }

  // src/writing_review.ts
  function buildWritingReviewChapters(groups, fallbackTitle) {
    return groups.filter((group) => group.annotations.length).map((group) => __spreadProps(__spreadValues({}, group), {
      annotations: group.annotations.slice().sort((a, b) => {
        const cmp = compareOrderKeys(a.sentencePos, b.sentencePos);
        return cmp || (a.createdAt || 0) - (b.createdAt || 0);
      })
    })).sort((a, b) => {
      var _a, _b;
      const cmp = compareOrderKeys((_a = a.annotations[0]) == null ? void 0 : _a.sentencePos, (_b = b.annotations[0]) == null ? void 0 : _b.sentencePos);
      return cmp || (a.sectionPath || "").localeCompare(b.sectionPath || "");
    }).map((group) => ({
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
      return bullet ? "\n#".concat(bullet[1], " ").concat(formatted) : formatted;
    }).join("");
  }
  function formatRevisionLabel(timestamp) {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) throw new Error("Invalid revision timestamp");
    return "".concat(date.getUTCFullYear(), "年").concat(date.getUTCMonth() + 1, "月").concat(date.getUTCDate(), "日 ").concat(String(date.getUTCHours()).padStart(2, "0"), ":").concat(String(date.getUTCMinutes()).padStart(2, "0"));
  }
  function buildWritingReviewWikitext(chapters, context) {
    let wikitext = "";
    for (const chapter of chapters) {
      const title = (chapter.title || "").trim();
      const sectionLink = "[[".concat(context.articleTitle, "#").concat(title, "|").concat(title, "]]");
      const permalink = "[[Special:PermaLink/".concat(context.revisionId, "#").concat(title, "|").concat(formatRevisionLabel(context.revisionTimestamp), "]]");
      wikitext += "'''".concat(sectionLink, "'''<small>（基于").concat(permalink, "版）</small>\n");
      for (const item of chapter.suggestions) {
        const quote = (item.quote || "").trim();
        const suggestion = formatSuggestion(item.suggestion || "");
        wikitext += "# ".concat(quote ? "{{rvw|1=".concat(quote, "}} —— ") : "").concat(suggestion, "\n");
      }
      wikitext += "--~~~~\n\n";
    }
    return wikitext;
  }

  // src/copy_review.ts
  async function copyText(text) {
    var _a;
    if ((_a = navigator.clipboard) == null ? void 0 : _a.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch (e) {
      }
    }
    const previousFocus = document.activeElement;
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.readOnly = true;
    textarea.style.cssText = "position:fixed;opacity:0;pointer-events:none;";
    const container = (previousFocus == null ? void 0 : previousFocus.closest('[role="dialog"]')) || document.body;
    container.appendChild(textarea);
    try {
      textarea.focus();
      textarea.select();
      if (!document.execCommand("copy")) {
        throw new Error("Clipboard copy failed");
      }
    } finally {
      textarea.remove();
      if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
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
      await copyText(buildWritingReviewWikitext(chapters, {
        articleTitle: mw.config.get("wgPageName") || state_default.articleTitle,
        revisionId,
        revisionTimestamp
      }).trim());
      mw.notify(state_default.convByVar({
        hant: "已複製評審文字，可貼到評審頁。",
        hans: "已复制评审文本，可粘贴到评审页。"
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

  // src/dialogs/components/annotation_viewer.vue
  var _defineComponent2 = (...args) => window.Vue && window.Vue.defineComponent ? window.Vue.defineComponent(...args) : args[0];
  var __sfc__2 = _defineComponent2({
    __name: "annotation_viewer",
    props: {
      pageName: { type: String, required: true },
      initialGroups: { type: Array, required: false, default: () => [] },
      onEditAnnotation: { type: Function, required: false, default: void 0 },
      onDeleteAnnotation: { type: Function, required: false, default: void 0 },
      onClearAllAnnotations: { type: Function, required: false, default: void 0 },
      onImportAnnotations: { type: Function, required: false, default: void 0 },
      onClosed: { type: Function, required: false, default: void 0 }
    },
    setup(__props, { expose: __expose }) {
      function buildI18n() {
        return {
          title: state_default.convByVar({ hant: "批註列表", hans: "批注列表" }),
          empty: state_default.convByVar({ hant: "尚無批註", hans: "尚无批注" }),
          edit: state_default.convByVar({ hant: "編輯", hans: "编辑" }),
          delete: state_default.convByVar({ hant: "刪除", hans: "删除" }),
          deleteConfirm: state_default.convByVar({ hant: "確定刪除？", hans: "确定删除？" }),
          clearAll: state_default.convByVar({ hant: "清除全部", hans: "清除全部" }),
          clearAllConfirm: state_default.convByVar({ hant: "確定刪除所有批註？", hans: "确定删除所有批注？" }),
          clearAllDone: state_default.convByVar({ hant: "已清除所有批註。", hans: "已清除所有批注。" }),
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
          sortPosition: state_default.convByVar({ hant: "頁面位置", hans: "页面位置" })
        };
      }
      const VueRuntime = window.Vue;
      if (!VueRuntime) {
        throw new Error("Vue runtime not found");
      }
      const { ref, computed } = VueRuntime;
      const props = __props;
      const i18n = buildI18n();
      const open = ref(true);
      const groups = ref(props.initialGroups || []);
      const deletingAnnotationId = ref(null);
      const clearingAll = ref(false);
      const copyingReview = ref(false);
      const importing = ref(false);
      const importInput = ref(null);
      const fileAction = ref(null);
      const reviewAction = ref(null);
      const sortMethod = ref("position");
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
        }
      ];
      __expose({ open, groups });
      const canClearAll = computed(() => Boolean(props.onClearAllAnnotations));
      const isEmpty = computed(() => {
        if (!Array.isArray(groups.value) || !groups.value.length) return true;
        return groups.value.every((group) => !group.annotations || group.annotations.length === 0);
      });
      const fileActionsDisabled = computed(() => importing.value || clearingAll.value || deletingAnnotationId.value !== null);
      const fileMenuItems = computed(() => [
        { value: "import", label: i18n.import, disabled: !props.onImportAnnotations },
        { value: "export", label: i18n.export, disabled: isEmpty.value }
      ]);
      const flattenedAnnotations = computed(() => {
        if (!Array.isArray(groups.value)) return [];
        const list = [];
        groups.value.forEach((group) => {
          if (!Array.isArray(group.annotations)) return;
          group.annotations.forEach((anno) => list.push(anno));
        });
        return list;
      });
      const sortingOptions = computed(() => [
        { value: "position", label: i18n.sortPosition || "頁面位置" },
        { value: "created-desc", label: i18n.sortCreatedDesc || "最新時間優先" },
        { value: "created-asc", label: i18n.sortCreatedAsc || "最早時間優先" }
      ]);
      const selectedSortLabel = computed(() => {
        var _a;
        return (_a = sortingOptions.value.find((option) => option.value === sortMethod.value)) == null ? void 0 : _a.label;
      });
      function buildPositionSortedGroups() {
        const buckets = /* @__PURE__ */ new Map();
        flattenedAnnotations.value.forEach((anno) => {
          const key = (anno.sectionPath || "").trim();
          const bucket = buckets.get(key);
          if (bucket) {
            bucket.push(anno);
          } else {
            buckets.set(key, [anno]);
          }
        });
        const mapped = Array.from(buckets.entries()).map(([sectionPath, annotations]) => ({
          sectionPath,
          annotations: annotations.slice().sort((a, b) => {
            const cmp = compareOrderKeys(a.sentencePos, b.sentencePos);
            if (cmp !== 0) return cmp;
            return (a.createdAt || 0) - (b.createdAt || 0);
          })
        }));
        mapped.sort((a, b) => {
          const firstA = a.annotations[0];
          const firstB = b.annotations[0];
          const cmp = compareOrderKeys(firstA == null ? void 0 : firstA.sentencePos, firstB == null ? void 0 : firstB.sentencePos);
          if (cmp !== 0) return cmp;
          return (a.sectionPath || "").localeCompare(b.sectionPath || "");
        });
        return mapped;
      }
      function buildTimeSortedGroups(order) {
        const sorted = flattenedAnnotations.value.slice().sort((a, b) => {
          const delta = (a.createdAt || 0) - (b.createdAt || 0);
          return order === "asc" ? delta : -delta;
        });
        const mapped = [];
        sorted.forEach((anno) => {
          const sectionPath = (anno.sectionPath || "").trim();
          const lastGroup = mapped[mapped.length - 1];
          if (!lastGroup || lastGroup.sectionPath !== sectionPath) {
            mapped.push({ sectionPath, annotations: [anno] });
          } else {
            lastGroup.annotations.push(anno);
          }
        });
        return mapped;
      }
      const sortedGroups = computed(() => {
        if (sortMethod.value === "created-desc") {
          return buildTimeSortedGroups("desc");
        }
        if (sortMethod.value === "created-asc") {
          return buildTimeSortedGroups("asc");
        }
        return buildPositionSortedGroups();
      });
      function formatTimestamp(ts) {
        if (!ts) return "";
        try {
          return new Date(ts).toLocaleString();
        } catch (e) {
          return "";
        }
      }
      function handleEdit(annotationId, sectionPath) {
        var _a;
        (_a = props.onEditAnnotation) == null ? void 0 : _a.call(props, annotationId, sectionPath);
      }
      function handleDelete(annotationId, sectionPath) {
        if (!props.onDeleteAnnotation) return;
        const ok = window.confirm(i18n.deleteConfirm);
        if (!ok) return;
        deletingAnnotationId.value = annotationId;
        Promise.resolve(props.onDeleteAnnotation(annotationId, sectionPath)).catch((error) => {
          console.error("[ReviewTool] Failed to delete annotation", error);
          if (mw && mw.notify) {
            mw.notify(
              state_default.convByVar({ hant: "刪除批註時發生錯誤。", hans: "删除批注时发生错误。" }),
              { type: "error", title: "[ReviewTool]" }
            );
          }
        }).finally(() => {
          deletingAnnotationId.value = null;
        });
      }
      function handleClearAll() {
        if (!props.onClearAllAnnotations || isEmpty.value) return;
        const ok = window.confirm(i18n.clearAllConfirm);
        if (!ok) return;
        clearingAll.value = true;
        Promise.resolve(props.onClearAllAnnotations()).then((result) => {
          const cleared = Boolean(result);
          if (mw && mw.notify) {
            mw.notify(
              cleared ? i18n.clearAllDone : i18n.clearAllNothing,
              { tag: "review-tool" }
            );
          }
        }).catch((error) => {
          console.error("[ReviewTool] Failed to clear annotations", error);
          if (mw && mw.notify) {
            mw.notify(i18n.clearAllError, { type: "error", title: "[ReviewTool]" });
          }
        }).finally(() => {
          clearingAll.value = false;
        });
      }
      async function handleCopyReview(action) {
        reviewAction.value = null;
        if (isEmpty.value || copyingReview.value || importing.value) return;
        const destination = reviewDestinations.find((item) => item.value === action);
        if (action !== "copy" && !destination) return;
        const url = destination ? "".concat(mw.util.getUrl(destination.value), "#").concat(mw.util.escapeIdForLink(props.pageName.replace(/_/g, " "))) : null;
        copyingReview.value = true;
        try {
          const copied = await copyWritingReview(groups.value);
          if (copied && url) window.location.assign(url);
        } finally {
          copyingReview.value = false;
        }
      }
      function handleFileAction(action) {
        var _a;
        fileAction.value = null;
        if (fileActionsDisabled.value) return;
        if (action === "import" && props.onImportAnnotations) {
          (_a = importInput.value) == null ? void 0 : _a.click();
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
          const filename = "review-tool-annotations-".concat((/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, ""), ".json");
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          if (mw && mw.notify) {
            mw.notify(i18n.exportDone, { tag: "review-tool" });
          }
        } catch (error) {
          console.error("[ReviewTool] Failed to export annotations", error);
          if (mw && mw.notify) {
            mw.notify(i18n.exportError, { type: "error", title: "[ReviewTool]" });
          }
        }
      }
      async function handleImport(event) {
        var _a;
        const input = event.target;
        const file = (_a = input.files) == null ? void 0 : _a[0];
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
        setTimeout(() => {
          var _a;
          removeDialogMount();
          (_a = props.onClosed) == null ? void 0 : _a.call(props);
        }, 200);
      }
      const __returned__ = { buildI18n, VueRuntime, ref, computed, props, i18n, open, groups, deletingAnnotationId, clearingAll, copyingReview, importing, importInput, fileAction, reviewAction, sortMethod, reviewDestinations, canClearAll, isEmpty, fileActionsDisabled, fileMenuItems, flattenedAnnotations, sortingOptions, selectedSortLabel, buildPositionSortedGroups, buildTimeSortedGroups, sortedGroups, formatTimestamp, handleEdit, handleDelete, handleClearAll, handleCopyReview, handleFileAction, handleExport, handleImport, onUpdateOpen, closeDialog };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function render2(_ctx, _cache, $props, $setup, $data, $options) {
    const { toDisplayString: _toDisplayString, openBlock: _openBlock, createElementBlock: _createElementBlock, createCommentVNode: _createCommentVNode, renderList: _renderList, Fragment: _Fragment, createElementVNode: _createElementVNode, resolveComponent: _resolveComponent, withModifiers: _withModifiers, withCtx: _withCtx, createVNode: _createVNode, createBlock: _createBlock } = window.Vue;
    const _component_cdx_button = _resolveComponent("cdx-button");
    const _component_cdx_select = _resolveComponent("cdx-select");
    const _component_cdx_menu_button = _resolveComponent("cdx-menu-button");
    const _component_cdx_dialog = _resolveComponent("cdx-dialog");
    return _openBlock(), _createBlock(_component_cdx_dialog, {
      open: $setup.open,
      "onUpdate:open": [
        _cache[4] || (_cache[4] = ($event) => $setup.open = $event),
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
                  _cache[1] || (_cache[1] = ($event) => $setup.fileAction = $event),
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
                onClick: _cache[2] || (_cache[2] = _withModifiers(($event) => $setup.handleCopyReview("copy"), ["prevent"]))
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
                  _cache[3] || (_cache[3] = ($event) => $setup.reviewAction = $event),
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
          (_openBlock(true), _createElementBlock(
            _Fragment,
            null,
            _renderList($setup.sortedGroups, (group) => {
              return _openBlock(), _createElementBlock("div", {
                key: group.sectionPath || "default",
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
  __sfc__2.render = render2;
  var annotation_viewer_default = __sfc__2;

  // src/dialogs/annotation_viewer.ts
  var viewerAppInstance = null;
  var viewerDialogOptions = null;
  function isAnnotationViewerDialogOpen() {
    return Boolean(viewerAppInstance);
  }
  function closeAnnotationViewerDialog() {
    if (viewerAppInstance) {
      viewerAppInstance.open = false;
      setTimeout(() => removeDialogMount(), 200);
      viewerAppInstance = null;
      viewerDialogOptions = null;
    }
  }
  function updateAnnotationViewerDialogGroups(groups) {
    if (viewerAppInstance) {
      viewerAppInstance.groups = groups;
    }
  }
  function openAnnotationViewerDialog(options) {
    viewerDialogOptions = {
      pageName: options.pageName,
      groups: options.groups || [],
      onEditAnnotation: options.onEditAnnotation,
      onDeleteAnnotation: options.onDeleteAnnotation,
      onClearAllAnnotations: options.onClearAllAnnotations,
      onImportAnnotations: options.onImportAnnotations
    };
    if (getMountedApp()) removeDialogMount();
    loadCodexAndVue().then(({ Vue, Codex }) => {
      const app = Vue.createMwApp({
        render() {
          return Vue.h(
            annotation_viewer_default,
            {
              ref: (instance) => {
                viewerAppInstance = instance;
              },
              pageName: (viewerDialogOptions == null ? void 0 : viewerDialogOptions.pageName) || "",
              initialGroups: (viewerDialogOptions == null ? void 0 : viewerDialogOptions.groups) || [],
              onEditAnnotation: viewerDialogOptions == null ? void 0 : viewerDialogOptions.onEditAnnotation,
              onDeleteAnnotation: viewerDialogOptions == null ? void 0 : viewerDialogOptions.onDeleteAnnotation,
              onClearAllAnnotations: viewerDialogOptions == null ? void 0 : viewerDialogOptions.onClearAllAnnotations,
              onImportAnnotations: viewerDialogOptions == null ? void 0 : viewerDialogOptions.onImportAnnotations,
              onClosed: () => {
                viewerAppInstance = null;
                viewerDialogOptions = null;
              }
            }
          );
        }
      });
      registerCodexComponents(app, Codex);
      mountApp(app);
    }).catch((error) => {
      console.error("[ReviewTool] Failed to open annotation viewer dialog", error);
      if (mw && mw.notify) {
        mw.notify(
          state_default.convByVar({ hant: "無法開啟批註列表。", hans: "无法开启批注列表。" }),
          { type: "error", title: "[ReviewTool]" }
        );
      }
    });
  }

  // src/dom/annotation_anchor.ts
  var EXCLUDED_TEXT = [
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
    ".review-tool-annotation-badge",
    ".floating-button",
    ".review-tool-global-button",
    ".review-tool-dialog"
  ].join(",");
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
    for (const segment of index.segments) {
      if (!range.intersectsNode(segment.node)) continue;
      for (let i = 0; i < segment.offsets.length; i++) {
        const offset = segment.offsets[i];
        if (range.comparePoint(segment.node, offset) < 0) continue;
        if (range.comparePoint(segment.node, offset + 1) > 0) break;
        if (start === void 0) start = segment.start + i;
        end = segment.start + i + 1;
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

  // src/dom/article_page.ts
  var floatingButton = null;
  var ANNOTATION_CONTAINER_CLASS = "review-tool-annotation-ui";
  var SENTENCE_CLASS = "sentence";
  var FLOATING_BUTTON_CLASS = "floating-button";
  var activeSectionStart = null;
  var activeSectionEnd = null;
  var activeSectionPath = null;
  var activePageName = null;
  var restrictSelectionToDescendants = false;
  var isMouseDown = false;
  var mouseDownPos = null;
  var HIDE_DELAY_MS = 180;
  var SELECTION_SHOW_DELAY_MS = 120;
  var selectionShowTimer = null;
  var floatingHideTimer = null;
  var inlineAnnotationBubbles = /* @__PURE__ */ new Map();
  var ARTICLE_ANNOTATION_KEY = "__article__";
  var REVIEWTOOL_PORTLET_ID = "ca-reviewtool-toggle";
  var onMouseDownListener = (e) => onMouseDown(e);
  var onMouseUpListener = (e) => onMouseUp(e);
  var onTouchStartListener = (e) => onTouchStart(e);
  var onTouchEndListener = (e) => onTouchEnd(e);
  function getCleanTextFromElement(el) {
    if (!el) return "";
    const clone = el.cloneNode(true);
    try {
      clone.querySelectorAll("sup.reference, sup.mw-ref, .reference, .mw-ref, .citation, .ref, .reference-text, .qeec-ref-tag-copy-btn").forEach((n) => n.remove());
      clone.querySelectorAll("[data-reference], [data-ref], .reference-note, .qeec-ref-tag-copy-btn, .review-tool-inline-annotation").forEach((n) => n.remove());
    } catch (e) {
      console.error("[ReviewTool][getCleanTextFromElement] failed to remove decoration nodes", e);
      throw e;
    }
    const txt = clone.textContent || "";
    return txt.replace(/Copy permalink/g, "").replace(/\s+/g, " ").trim();
  }
  function removeDecorationsFromContainer(container) {
    try {
      container.querySelectorAll("sup.reference, sup.mw-ref, .reference, .mw-ref, .citation, .ref, .reference-text, .qeec-ref-tag-copy-btn, style, ipe-quick-edit").forEach((n) => n.remove());
      container.querySelectorAll("[data-reference], [data-ref], .reference-note, .qeec-ref-tag-copy-btn, .review-tool-inline-annotation").forEach((n) => n.remove());
    } catch (e) {
      console.error("[ReviewTool][removeDecorationsFromContainer] failed", e);
      throw e;
    }
  }
  function getCleanTextFromRange(range) {
    if (!range) return "";
    const frag = range.cloneContents();
    const wrapper = document.createElement("div");
    wrapper.appendChild(frag);
    removeDecorationsFromContainer(wrapper);
    let txt = wrapper.textContent || "";
    txt = txt.replace(/Copy permalink/g, "");
    return txt.replace(/\s+/g, " ").trim();
  }
  function sanitizePlainText(text) {
    if (!text) return "";
    let s = text.replace(/\[\s*\d+\s*\]/g, "");
    s = s.replace(/[\u00B9\u00B2\u00B3\u2070-\u2079]+/g, "");
    return s.replace(/\s+/g, " ").trim();
  }
  function installSelectionListenersForSection(pageName, sectionStart, sectionEnd, sectionPath, restrictToDescendants = false) {
    uninstallSelectionListeners();
    activeSectionStart = sectionStart;
    activeSectionEnd = sectionEnd;
    activeSectionPath = sectionPath;
    activePageName = pageName;
    restrictSelectionToDescendants = restrictToDescendants;
    document.addEventListener("selectionchange", onSelectionChange);
    document.addEventListener("mouseup", onMouseUpListener);
    document.addEventListener("mousedown", onMouseDownListener);
    document.addEventListener("touchstart", onTouchStartListener, { passive: true });
    document.addEventListener("touchend", onTouchEndListener);
  }
  function uninstallSelectionListeners() {
    document.removeEventListener("selectionchange", onSelectionChange);
    document.removeEventListener("mouseup", onMouseUpListener);
    document.removeEventListener("mousedown", onMouseDownListener);
    document.removeEventListener("touchstart", onTouchStartListener);
    document.removeEventListener("touchend", onTouchEndListener);
    if (selectionShowTimer) {
      clearTimeout(selectionShowTimer);
      selectionShowTimer = null;
    }
    if (floatingHideTimer) {
      clearTimeout(floatingHideTimer);
      floatingHideTimer = null;
    }
    hideFloatingButton();
    document.documentElement.classList.remove("rt-selecting");
    activeSectionStart = null;
    activeSectionEnd = null;
    activeSectionPath = null;
    activePageName = null;
    restrictSelectionToDescendants = false;
  }
  function isNodeWithinSection(node) {
    if (!node || !activeSectionStart) return false;
    let el = null;
    if (node.nodeType === Node.TEXT_NODE) el = node.parentElement;
    else if (node instanceof Element) el = node;
    if (!el) return false;
    if (activeSectionStart === el || activeSectionStart.contains(el)) return true;
    if (!activeSectionEnd) {
      if (restrictSelectionToDescendants) {
        return false;
      }
      return (activeSectionStart.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
    }
    const startBeforeEl = (activeSectionStart.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
    const elBeforeEnd = (el.compareDocumentPosition(activeSectionEnd) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
    return startBeforeEl && elBeforeEnd;
  }
  function selectionInsideActiveSection() {
    const sel = document.getSelection();
    if (!sel || sel.isCollapsed) return null;
    const range = sel.getRangeAt(0);
    if (!activeSectionStart) return null;
    const startIn = isNodeWithinSection(range.startContainer);
    const endIn = isNodeWithinSection(range.endContainer);
    if (!startIn || !endIn) return null;
    return range;
  }
  function onMouseDown(e) {
    const target = e == null ? void 0 : e.target;
    if (target && floatingButton && (target === floatingButton || floatingButton.contains(target))) {
      return;
    }
    if (e) {
      mouseDownPos = { x: e.clientX, y: e.clientY };
    }
    isMouseDown = true;
    document.documentElement.classList.add("rt-selecting");
    hideFloatingButton();
  }
  function onMouseUp(e) {
    const target = e == null ? void 0 : e.target;
    if (target && floatingButton && (target === floatingButton || floatingButton.contains(target))) {
      isMouseDown = false;
      mouseDownPos = null;
      document.documentElement.classList.remove("rt-selecting");
      return;
    }
    isMouseDown = false;
    mouseDownPos = null;
    document.documentElement.classList.remove("rt-selecting");
    onSelectionChange();
  }
  function wasMouseDragged(e) {
    if (!mouseDownPos) return false;
    const dx = Math.abs(e.clientX - mouseDownPos.x);
    const dy = Math.abs(e.clientY - mouseDownPos.y);
    return dx > 3 || dy > 3;
  }
  function onTouchStart(e) {
    const target = e == null ? void 0 : e.target;
    if (target && floatingButton && (target === floatingButton || floatingButton.contains(target))) {
      return;
    }
    isMouseDown = true;
    document.documentElement.classList.add("rt-selecting");
    hideFloatingButton();
  }
  function onTouchEnd(e) {
    const target = e == null ? void 0 : e.target;
    if (target && floatingButton && (target === floatingButton || floatingButton.contains(target))) {
      isMouseDown = false;
      document.documentElement.classList.remove("rt-selecting");
      return;
    }
    isMouseDown = false;
    document.documentElement.classList.remove("rt-selecting");
    onSelectionChange();
  }
  function onSelectionChange() {
    if (isMouseDown) return;
    if (selectionShowTimer) {
      clearTimeout(selectionShowTimer);
      selectionShowTimer = null;
    }
    selectionShowTimer = window.setTimeout(() => {
      const selectionRange = selectionInsideActiveSection();
      if (!selectionRange) {
        hideFloatingButton();
        return;
      }
      const rect = selectionRange.getBoundingClientRect();
      const centerX = Math.max(40, Math.min(window.innerWidth - 40, rect.left + rect.width / 2));
      const topY = Math.max(8, rect.top + window.scrollY - 8);
      const rangeClone = selectionRange.cloneRange();
      showFloatingButton(centerX + window.scrollX, topY, () => {
        const selectedText = getCleanTextFromRange(selectionRange);
        if (!selectedText) {
          hideFloatingButton();
          return;
        }
        if (activePageName) {
          hideFloatingButton();
          const sel = document.getSelection();
          if (sel) sel.removeAllRanges();
          const computedSectionPath = computeSectionPathFromNode(selectionRange ? selectionRange.startContainer : null);
          const sentencePos = computeSentenceOrderKey(selectionRange ? selectionRange.startContainer : null);
          void openAnnotationDialog(activePageName, null, computedSectionPath, {
            sentenceText: selectedText,
            selectionRange: rangeClone,
            sentencePos
          });
        }
      });
    }, SELECTION_SHOW_DELAY_MS);
  }
  function findAncestorSentence(node) {
    let cur = node;
    while (cur && cur !== document.body) {
      if (cur instanceof Element && cur.classList.contains(SENTENCE_CLASS)) return cur;
      cur = cur.parentNode;
    }
    return null;
  }
  function computeSentenceOrderKey(target) {
    const sentenceEl = (() => {
      if (!target) return null;
      if (target instanceof Element) {
        return target.classList.contains(SENTENCE_CLASS) ? target : findAncestorSentence(target);
      }
      return findAncestorSentence(target);
    })();
    if (!sentenceEl) return "";
    return getElementOrderKey(sentenceEl) || "";
  }
  function previousNode(node) {
    if (!node) return null;
    if (node.previousSibling) {
      let p = node.previousSibling;
      while (p && p.lastChild) p = p.lastChild;
      return p;
    }
    return node.parentNode;
  }
  function findHeadingElementFromNode(node) {
    let cur = node;
    while (cur) {
      if (cur instanceof Element) {
        const el = cur;
        const tag = (el.tagName || "").toLowerCase();
        if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)) return el;
        if (el.classList && el.classList.contains("mw-heading")) return el;
      }
      cur = cur.parentNode;
    }
    return null;
  }
  function getHeadingLevelAndTitle(el) {
    if (!el) return { level: null, title: null };
    const tag = (el.tagName || "").toLowerCase();
    if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)) {
      const level = parseInt(tag.charAt(1), 10);
      const title = getHeadingTitle(el) || null;
      return { level, title };
    }
    const inner = el.querySelector("h1,h2,h3,h4,h5,h6");
    if (inner) {
      const lvl = parseInt((inner.tagName || "").charAt(1), 10);
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
    let cur = anchor;
    while (cur) {
      cur = previousNode(cur);
      if (!cur) break;
      const hEl = findHeadingElementFromNode(cur);
      if (!hEl) continue;
      const info = getHeadingLevelAndTitle(hEl);
      if (!info.title || info.level === null) continue;
      if (info.level === 1) continue;
      if (nearestByLevel.has(info.level)) continue;
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
  function showFloatingButton(x, y, onClick) {
    if (!floatingButton) {
      floatingButton = document.createElement("button");
      floatingButton.className = "".concat(ANNOTATION_CONTAINER_CLASS, " ").concat(FLOATING_BUTTON_CLASS);
      floatingButton.textContent = state_default.convByVar({ hant: "批註", hans: "批注" });
      floatingButton.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        onClick();
      };
      floatingButton.style.pointerEvents = "auto";
      document.body.appendChild(floatingButton);
    } else {
      floatingButton.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        onClick();
      };
    }
    if (floatingHideTimer) {
      clearTimeout(floatingHideTimer);
      floatingHideTimer = null;
    }
    floatingButton.style.position = "absolute";
    floatingButton.style.left = "".concat(x, "px");
    floatingButton.style.top = "".concat(y, "px");
    floatingButton.style.transform = "translate(-50%, -100%)";
    floatingButton.style.zIndex = "9999";
    floatingButton.style.display = "block";
    floatingButton.onmouseenter = () => {
      if (floatingHideTimer) {
        clearTimeout(floatingHideTimer);
        floatingHideTimer = null;
      }
    };
    floatingButton.onmouseleave = () => {
      if (floatingHideTimer) {
        clearTimeout(floatingHideTimer);
      }
      floatingHideTimer = window.setTimeout(() => hideFloatingButton(), HIDE_DELAY_MS);
    };
  }
  function hideFloatingButton() {
    if (floatingHideTimer) {
      clearTimeout(floatingHideTimer);
      floatingHideTimer = null;
    }
    if (floatingButton) {
      floatingButton.style.display = "none";
    }
  }
  function wrapSectionSentences(sectionStart, sectionEnd) {
    function getComputedLang(node) {
      var _a;
      let el = null;
      if (node instanceof Element) el = node;
      if (!el && node && node.parentElement) el = node.parentElement;
      while (el) {
        const lang = el.getAttribute("lang") || el.getAttribute("xml:lang");
        if (lang) return lang.toLowerCase();
        el = el.parentElement;
      }
      const docLang = (_a = document.documentElement) == null ? void 0 : _a.getAttribute("lang");
      return docLang ? docLang.toLowerCase() : null;
    }
    function shouldTreatHalfWidthTerminators(lang) {
      if (!lang) return false;
      return !(lang.startsWith("zh") || lang.startsWith("ja"));
    }
    function getSentenceTerminatorRegex(allowHalfWidth) {
      const terminators = allowHalfWidth ? "。！？?!…." : "。！？…";
      return new RegExp("[」』】〗〕\\)\\]\\}\\\"'’”〉》]*[".concat(terminators, "]+[」』】〗〕\\)\\]\\}\\\"'’”〉》]*"), "g");
    }
    function splitTextToPartsSimple(text, allowHalfWidth) {
      const terminators = allowHalfWidth ? "。！？!?；;」』】〗〕\\]］}｝\\." : "。！？；;」』】〗〕\\]］}｝";
      const re = new RegExp("(?<=[".concat(terminators, "])\\s*"), "g");
      return text.split(re).filter((p) => p.trim());
    }
    function shouldSkipElement(node) {
      if (node.nodeType !== Node.ELEMENT_NODE) return false;
      const el = node;
      if (el.classList.contains(ANNOTATION_CONTAINER_CLASS) || el.classList.contains("review-tool-inline-annotation")) return true;
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
    const sectionElements = [];
    if (sectionStart && sectionStart.childNodes && sectionStart.childNodes.length > 0 && !sectionEnd) {
      sectionStart.childNodes.forEach((n) => {
        if (!shouldSkipElement(n)) sectionElements.push(n);
        else console.log("[ReviewTool] Skipping element to preserve other scripts:", n);
      });
    } else {
      let cur = sectionStart.nextSibling;
      while (cur && cur !== sectionEnd) {
        if (!shouldSkipElement(cur)) {
          sectionElements.push(cur);
        } else {
          console.log("[ReviewTool] Skipping element to preserve other scripts:", cur);
        }
        cur = cur.nextSibling;
      }
    }
    let sentenceIndex = 0;
    console.log("[ReviewTool] wrapSectionSentences: processing", sectionElements.length, "child nodes");
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
        const altRe = new RegExp("".concat(getSentenceTerminatorRegex(shouldTreatHalfWidthTerminators(lang)).source, "|(?:\\r?\\n)+|(?:\\s{2,})"), "g");
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
    function processElementRoot(root) {
      if (shouldSkipElement(root)) return;
      const allowHalfWidth = shouldTreatHalfWidthTerminators(getComputedLang(root));
      function isInlineElement(el) {
        if (!el || !el.tagName) return false;
        const t = el.tagName.toLowerCase();
        const inlineTags = /* @__PURE__ */ new Set([
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
        return inlineTags.has(t);
      }
      const elementChildren = Array.from(root.childNodes).filter((n) => n.nodeType === Node.ELEMENT_NODE);
      const hasNonInlineElementChildren = elementChildren.some((el) => !isInlineElement(el));
      if (hasNonInlineElementChildren) {
        Array.from(root.childNodes).forEach((child) => {
          if (child.nodeType === Node.TEXT_NODE) {
            const textNode = child;
            const text = textNode.nodeValue || "";
            if (!text.trim()) return;
            const parts = splitTextIntoRanges(text, getComputedLang(textNode)).map((r) => text.slice(r.start, r.end)).filter((p) => p.trim());
            if (parts.length <= 1) {
              const span = document.createElement("span");
              span.className = "".concat(ANNOTATION_CONTAINER_CLASS, " ").concat(SENTENCE_CLASS);
              span.setAttribute("data-sentence-index", String(sentenceIndex++));
              span.textContent = text;
              if (textNode.parentNode) {
                textNode.parentNode.replaceChild(span, textNode);
              }
            } else {
              const frag = document.createDocumentFragment();
              parts.forEach((part) => {
                const span = document.createElement("span");
                span.className = "".concat(ANNOTATION_CONTAINER_CLASS, " ").concat(SENTENCE_CLASS);
                span.setAttribute("data-sentence-index", String(sentenceIndex++));
                span.textContent = part;
                frag.appendChild(span);
              });
              if (textNode.parentNode) {
                textNode.parentNode.replaceChild(frag, textNode);
              }
            }
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
          const span = document.createElement("span");
          span.className = "".concat(ANNOTATION_CONTAINER_CLASS, " ").concat(SENTENCE_CLASS);
          span.setAttribute("data-sentence-index", String(sentenceIndex++));
          span.appendChild(frag);
          range.insertNode(span);
          const detach = range.detach;
          if (typeof detach === "function") {
            detach.call(range);
          }
          successCount++;
        } catch (e) {
          console.warn("[ReviewTool] range wrapping failed for one range, continuing", e, m);
        }
      }
      if (successCount === 0) {
        console.warn("[ReviewTool] no mapped ranges wrapped successfully, performing fallback wrapping for this root");
        const walker2 = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: filterNode });
        let tn2 = walker2.nextNode();
        while (tn2) {
          const text = tn2.nodeValue || "";
          if (!text.trim()) {
            tn2 = walker2.nextNode();
            continue;
          }
          const parts = splitTextToPartsSimple(text, allowHalfWidth);
          if (parts.length <= 1) {
            const span = document.createElement("span");
            span.className = "".concat(ANNOTATION_CONTAINER_CLASS, " ").concat(SENTENCE_CLASS);
            span.setAttribute("data-sentence-index", String(sentenceIndex++));
            span.textContent = text;
            if (tn2.parentNode) {
              tn2.parentNode.replaceChild(span, tn2);
            }
          } else {
            const frag = document.createDocumentFragment();
            parts.forEach((part) => {
              const span = document.createElement("span");
              span.className = "".concat(ANNOTATION_CONTAINER_CLASS, " ").concat(SENTENCE_CLASS);
              span.setAttribute("data-sentence-index", String(sentenceIndex++));
              span.textContent = part;
              frag.appendChild(span);
            });
            if (tn2.parentNode) {
              tn2.parentNode.replaceChild(frag, tn2);
            }
          }
          tn2 = walker2.nextNode();
        }
      }
    }
    sectionElements.forEach((rootNode) => {
      if (rootNode.nodeType === Node.ELEMENT_NODE) {
        const el = rootNode;
        const tag = (el.tagName || "").toLowerCase();
        if (tag === "ul" || tag === "ol" || tag === "dl") {
          const items = Array.from(el.children);
          items.forEach((item) => {
            processElementRoot(item);
          });
        } else {
          processElementRoot(el);
        }
      } else if (rootNode.nodeType === Node.TEXT_NODE) {
        const textNode = rootNode;
        const text = textNode.textContent || "";
        if (!text.trim()) return;
        const parts = splitTextToPartsSimple(text, shouldTreatHalfWidthTerminators(getComputedLang(textNode)));
        if (parts.length <= 1) {
          const span = document.createElement("span");
          span.className = "".concat(ANNOTATION_CONTAINER_CLASS, " ").concat(SENTENCE_CLASS);
          span.setAttribute("data-sentence-index", String(sentenceIndex++));
          span.textContent = text;
          if (textNode.parentNode) {
            textNode.parentNode.replaceChild(span, textNode);
          }
        } else {
          const frag = document.createDocumentFragment();
          parts.forEach((part) => {
            const span = document.createElement("span");
            span.className = "".concat(ANNOTATION_CONTAINER_CLASS, " ").concat(SENTENCE_CLASS);
            span.setAttribute("data-sentence-index", String(sentenceIndex++));
            span.textContent = part;
            frag.appendChild(span);
          });
          if (textNode.parentNode) {
            textNode.parentNode.replaceChild(frag, textNode);
          }
        }
      }
    });
    try {
      attachSentenceClickHandlers(sectionStart, sectionEnd);
    } catch (e) {
      console.error("[ReviewTool] attachSentenceClickHandlers failed", e);
      throw e;
    }
    try {
      const selector = ".".concat(ANNOTATION_CONTAINER_CLASS, ".").concat(SENTENCE_CLASS);
      const within = sectionStart.querySelectorAll ? sectionStart.querySelectorAll(selector) : document.querySelectorAll(selector);
      console.log("[ReviewTool] wrapSectionSentences: sentence spans found in section:", within.length);
    } catch (e) {
      console.error("[ReviewTool] counting sentence spans failed", e);
      throw e;
    }
  }
  function ensureWrappedSection(sectionStart, sectionEnd, attempts, delayMs) {
    if (!sectionStart) return;
    const sel = ".".concat(ANNOTATION_CONTAINER_CLASS, ".").concat(SENTENCE_CLASS);
    function countSpans() {
      try {
        if (sectionEnd === null && sectionStart.querySelectorAll) {
          return sectionStart.querySelectorAll(sel).length;
        }
        const all = Array.from(document.querySelectorAll(sel));
        return all.filter((el) => sectionStart.contains(el)).length;
      } catch (e) {
        return 0;
      }
    }
    let schedule;
    const baseDelay = typeof delayMs === "number" ? Math.max(0, delayMs) : 250;
    if (Array.isArray(attempts)) {
      schedule = attempts.filter((value) => typeof value === "number");
    } else {
      schedule = [0, baseDelay, baseDelay * 3, baseDelay * 6, baseDelay * 12, baseDelay * 20];
    }
    if (!Array.isArray(attempts) && typeof attempts === "number") {
      schedule = schedule.slice(0, Math.max(1, attempts));
    }
    let idx = 0;
    function runOnce() {
      try {
        wrapSectionSentences(sectionStart, sectionEnd);
      } catch (e) {
        console.warn("[ReviewTool] ensureWrappedSection wrap failed", e);
      }
      const found = countSpans();
      console.log("[ReviewTool] ensureWrappedSection: attempt", idx + 1, "found", found);
      if (found > 0) return;
      idx++;
      if (idx < schedule.length) {
        setTimeout(runOnce, schedule[idx]);
      }
    }
    setTimeout(runOnce, schedule[0]);
  }
  function clearWrappedSentences() {
    document.querySelectorAll(".".concat(ANNOTATION_CONTAINER_CLASS, ".").concat(SENTENCE_CLASS)).forEach((el) => {
      const parent = el.parentNode;
      if (!parent) return;
      const frag = document.createDocumentFragment();
      while (el.firstChild) {
        frag.appendChild(el.firstChild);
      }
      parent.replaceChild(frag, el);
    });
    document.querySelectorAll(".review-tool-annotation-badge").forEach((badge) => badge.remove());
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
    inlineAnnotationBubbles.forEach((bubble) => {
      try {
        bubble.remove();
      } catch (e) {
        console.error("[ReviewTool] failed to remove inline annotation bubble", e, bubble);
      }
    });
    inlineAnnotationBubbles.clear();
    document.querySelectorAll(".review-tool-inline-annotation").forEach((bubble) => {
      bubble.remove();
    });
  }
  function createInlineAnnotationBubbleElement(pageName, sectionPath, annotationId, opinion) {
    const bubble = document.createElement("span");
    bubble.className = "review-tool-inline-annotation";
    bubble.dataset.annoId = annotationId;
    bubble.dataset.sectionPath = sectionPath;
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
    bubble.setAttribute("data-opinion", opinion);
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
    const selectionRange = options.selectionRange ? options.selectionRange.cloneRange() : null;
    const isEdit = annotationId !== null;
    const existingAnnotation = isEdit && annotationId ? getAnnotation(pageName, annotationId) : null;
    const displaySentenceText = isEdit ? (existingAnnotation == null ? void 0 : existingAnnotation.sentenceText) || "" : sanitizePlainText(options.sentenceText || "");
    const initialOpinion = isEdit ? (existingAnnotation == null ? void 0 : existingAnnotation.opinion) || "" : "";
    const shouldReopenViewer = isAnnotationViewerDialogOpen();
    sectionPath = sectionPath === "目次" ? "序言" : sectionPath;
    try {
      if (shouldReopenViewer) {
        closeAnnotationViewerDialog();
      }
      const result = await openAnnotationEditorDialog({
        sectionPath,
        sentenceText: displaySentenceText,
        initialOpinion,
        mode: isEdit ? "edit" : "create",
        allowDelete: isEdit
      });
      if (!result || result.action === "cancel") {
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
          const sentencePosKey = options.sentencePos || computeSentenceOrderKey(selectionRange ? selectionRange.startContainer : null);
          const container = getArticleContentContainer();
          const textAnchor = container && selectionRange ? captureAnnotationAnchor(buildArticleTextIndex(container), selectionRange) : void 0;
          const created = createAnnotation(pageName, sectionPath, displaySentenceText, result.opinion, sentencePosKey, textAnchor);
          insertInlineAnnotationBubble(selectionRange, pageName, sectionPath, created.id, result.opinion);
        }
      }
    } catch (error) {
      console.error("[ReviewTool] Failed to open annotation editor dialog", error);
    } finally {
      if (shouldReopenViewer) {
        showAnnotationViewer(pageName);
      }
    }
  }
  function attachSentenceClickHandlers(sectionStart, sectionEnd) {
    if (!sectionStart) return;
    if (!sectionEnd) {
      const spans = sectionStart.querySelectorAll(".".concat(ANNOTATION_CONTAINER_CLASS, ".").concat(SENTENCE_CLASS));
      spans.forEach((s) => {
        if (s instanceof HTMLElement) attachHandlerToSpan(s);
      });
      if (sectionStart instanceof HTMLElement && sectionStart.classList.contains(ANNOTATION_CONTAINER_CLASS) && sectionStart.classList.contains(SENTENCE_CLASS)) {
        attachHandlerToSpan(sectionStart);
      }
      return;
    }
    let cur = sectionStart.nextSibling;
    while (cur && cur !== sectionEnd) {
      if (cur.nodeType === Node.ELEMENT_NODE) {
        const el = cur;
        el.querySelectorAll(".".concat(ANNOTATION_CONTAINER_CLASS, ".").concat(SENTENCE_CLASS)).forEach((span) => {
          if (span instanceof HTMLElement) attachHandlerToSpan(span);
        });
        if (el instanceof HTMLElement && el.classList.contains(ANNOTATION_CONTAINER_CLASS) && el.classList.contains(SENTENCE_CLASS)) {
          attachHandlerToSpan(el);
        }
      }
      cur = cur.nextSibling;
    }
    function attachHandlerToSpan(s) {
      if (s.dataset.clickAttached) return;
      s.dataset.clickAttached = "1";
      try {
        s.dataset._rtHandler = "1";
      } catch (e) {
      }
      try {
        s.style.pointerEvents = "auto";
      } catch (e) {
        console.error("[ReviewTool] failed to set pointerEvents on sentence span", e, s);
        throw e;
      }
      try {
        s.style.cursor = "pointer";
      } catch (e) {
        console.error("[ReviewTool] failed to set cursor on sentence span", e, s);
        throw e;
      }
      const origBg = s.style.background;
      s.addEventListener("mouseenter", () => {
        try {
          s.style.background = "rgba(255,235,59,0.18)";
        } catch (e) {
          console.error("[ReviewTool] span mouseenter styling failed", e, s);
          throw e;
        }
      });
      s.addEventListener("mouseleave", () => {
        try {
          s.style.background = origBg || "";
        } catch (e) {
          console.error("[ReviewTool] span mouseleave styling failed", e, s);
          throw e;
        }
      });
      s.addEventListener("click", (e) => {
        if (wasMouseDragged(e)) {
          return;
        }
        const existingSelection = window.getSelection();
        if (existingSelection && !existingSelection.isCollapsed) {
          return;
        }
        e.stopPropagation();
        e.preventDefault();
        if (!activePageName || !activeSectionPath) return;
        const sentenceText = getCleanTextFromElement(s);
        const range = document.createRange();
        range.selectNodeContents(s);
        const rangeClone = range.cloneRange();
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
        const r = s.getBoundingClientRect();
        const centerX = Math.max(40, Math.min(window.innerWidth - 40, r.left + r.width / 2));
        const topY = Math.max(8, r.top + window.scrollY - 8);
        showFloatingButton(centerX + window.scrollX, topY, () => {
          if (activePageName) {
            hideFloatingButton();
            const sel = window.getSelection();
            if (sel) sel.removeAllRanges();
            const computedSectionPath = computeSectionPathFromNode(s);
            const sentencePos = computeSentenceOrderKey(s);
            void openAnnotationDialog(activePageName, null, computedSectionPath, {
              sentenceText,
              selectionRange: rangeClone,
              sentencePos
            });
          }
        });
      });
    }
  }
  function showAnnotationViewer(pageName) {
    if (isAnnotationViewerDialogOpen()) {
      closeAnnotationViewerDialog();
      return;
    }
    const groups = buildAnnotationGroups(pageName);
    openAnnotationViewerDialog({
      pageName,
      groups,
      onEditAnnotation: (annotationId, sectionPath) => {
        void openAnnotationDialog(pageName, annotationId, sectionPath);
      },
      onDeleteAnnotation: (annotationId) => {
        const removed = deleteAnnotation(pageName, annotationId);
        if (removed) {
          removeInlineAnnotationBubble(annotationId);
          updateAnnotationViewerDialogGroups(buildAnnotationGroups(pageName));
        }
      },
      onClearAllAnnotations: () => {
        const cleared = clearAnnotations(pageName);
        clearAllInlineAnnotationBubbles();
        updateAnnotationViewerDialogGroups(buildAnnotationGroups(pageName));
        return cleared;
      },
      onImportAnnotations: (json) => {
        const imported = importAnnotations(pageName, json);
        updateAnnotationViewerDialogGroups(buildAnnotationGroups(pageName));
        restoreInlineAnnotationBubbles(pageName);
        return imported;
      }
    });
  }
  function addMainPageReviewToolButtonsToDOM(pageName) {
    restoreInlineAnnotationBubbles(pageName);
    addGlobalAnnotationViewerButton(pageName);
    syncAnnotationModeMenuState(state_default.isAnnotationModeActive(ARTICLE_ANNOTATION_KEY), pageName);
  }
  function addGlobalAnnotationViewerButton(pageName) {
    if (document.querySelector(".review-tool-global-button")) return;
    const btn = document.createElement("button");
    btn.className = "review-tool-global-button";
    btn.textContent = state_default.convByVar({ hant: "查看批註", hans: "查看批注" });
    btn.title = state_default.convByVar({ hant: "查看本頁所有批註", hans: "查看本页所有批注" });
    btn.style.position = "fixed";
    btn.style.bottom = "20px";
    btn.style.right = "20px";
    btn.style.zIndex = "10100";
    btn.style.padding = "10px 16px";
    btn.style.backgroundColor = "#36c";
    btn.style.color = "#fff";
    btn.style.border = "none";
    btn.style.borderRadius = "4px";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "14px";
    btn.style.fontWeight = "bold";
    btn.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
    btn.style.display = "none";
    btn.onclick = () => {
      try {
        showAnnotationViewer(state_default.articleTitle || pageName);
      } catch (error) {
        console.error("[ReviewTool] failed to open viewer", error);
        throw error;
      }
    };
    btn.onmouseenter = () => {
      btn.style.backgroundColor = "#447ff5";
    };
    btn.onmouseleave = () => {
      btn.style.backgroundColor = "#36c";
    };
    document.body.appendChild(btn);
  }
  function toggleArticleAnnotationMode(pageName) {
    state_default.toggleAnnotationModeState(ARTICLE_ANNOTATION_KEY);
    const isActive = state_default.isAnnotationModeActive(ARTICLE_ANNOTATION_KEY);
    syncAnnotationModeMenuState(isActive, pageName);
    if (isActive) {
      document.documentElement.classList.add("review-tool-annotation-mode");
      if (mw && mw.notify) {
        mw.notify(state_default.convByVar({
          hant: "批註模式已啟用。",
          hans: "批注模式已启用。"
        }), { tag: "review-tool" });
      }
      console.log("[ReviewTool] 條目「".concat(state_default.articleTitle, "」批註模式已啟用。"));
      const container = getArticleContentContainer();
      if (container) {
        console.log("[ReviewTool] chosen content container:", container.tagName, container.id || "(no id)", container.className || "(no class)");
      } else {
        console.warn("[ReviewTool] could not find an article content container");
      }
      if (!container) {
        console.warn("[ReviewTool] 未找到主要內容容器，無法啟用批註模式。");
        return;
      }
      const sectionPath = state_default.articleTitle || pageName;
      installSelectionListenersForSection(state_default.articleTitle || pageName, container, null, sectionPath, true);
      const tryCount = ensureWrappedSection ? ensureWrappedSection : wrapSectionSentences;
      tryCount(container, null, 4, 220);
      const gv = document.querySelector(".review-tool-global-button");
      if (gv) gv.style.display = "block";
    } else {
      console.log("[ReviewTool] 條目「".concat(state_default.articleTitle, "」批註模式已停用。"));
      uninstallSelectionListeners();
      clearWrappedSentences();
      try {
        document.documentElement.classList.remove("review-tool-annotation-mode");
      } catch (e) {
        console.error("[ReviewTool] failed to remove annotation mode class", e);
        throw e;
      }
      try {
        if (mw && mw.notify) {
          mw.notify(state_default.convByVar({
            hant: "批註模式已停用。",
            hans: "批注模式已停用。"
          }), { tag: "review-tool" });
        }
      } catch (e) {
        console.error("[ReviewTool] mw.notify failed", e);
        throw e;
      }
      try {
        const gv = document.querySelector(".review-tool-global-button");
        if (gv) gv.style.display = "none";
      } catch (e) {
        console.error("[ReviewTool] failed to hide global viewer button", e);
        throw e;
      }
    }
  }
  function getReviewToolPortletLabel(isActive) {
    return state_default.convByVar({
      hant: isActive ? "關閉批註模式" : "啟用批註模式",
      hans: isActive ? "关闭批注模式" : "开启批注模式"
    });
  }
  function syncAnnotationModeMenuState(isActive, pageName) {
    addPortletTrigger(REVIEWTOOL_PORTLET_ID, getReviewToolPortletLabel(isActive), () => {
      toggleArticleAnnotationMode(pageName);
    });
    const portlet = document.getElementById(REVIEWTOOL_PORTLET_ID);
    if (portlet) {
      portlet.classList.toggle("selected", isActive);
    }
  }

  // src/main.ts
  function injectStyles(css) {
    if (!css) return;
    try {
      const styleEl = document.createElement("style");
      styleEl.appendChild(document.createTextNode(css));
      document.head.appendChild(styleEl);
    } catch (e) {
      const div = document.createElement("div");
      div.innerHTML = "<style>".concat(css, "</style>");
      document.head.appendChild(div.firstChild);
    }
  }
  function init() {
    const namespace = mw.config.get("wgNamespaceNumber");
    const pageName = mw.config.get("wgPageName");
    if (namespace !== 0 && pageName !== "User:SuperGrey/gadgets/ReviewTool/TestPage") {
      return;
    }
    if (typeof document !== "undefined") {
      injectStyles(styles_default);
    }
    state_default.initHanAssist().then(() => {
      state_default.articleTitle = pageName;
      mw.hook("wikipage.content").add(function() {
        addMainPageReviewToolButtonsToDOM(pageName);
      });
    });
  }
  init();
})();
// </nowiki>
