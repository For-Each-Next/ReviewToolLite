/**
 * 全局狀態管理。
 */
class State {
    // 簡繁轉換
    convByVar = function (langDict: { hant: string, hans: string }): string {
        if (langDict && langDict.hant) {
            return langDict.hant; // 預設返回繁體中文
        }
        return "繁簡轉換未初始化，且 langDict 無效！";
    };
    initHanAssist(): JQuery.Promise<void> {
        return mw.loader.using('ext.gadget.HanAssist').then((require) => {
            const { convByVar } = require('ext.gadget.HanAssist') as { convByVar: (langDict: { hant: string, hans: string }) => string };
            if (typeof convByVar === 'function') {
                this.convByVar = convByVar;
            }
        });
    }

    // 當前條目標題
    articleTitle = '';

    // 用戶名
    readonly userName = mw.config.get('wgUserName') || 'Example';

    // 批註模式狀態
    private annotationModeState: { [headingTitle: string]: boolean } = {};
    isAnnotationModeActive(headingTitle: string): boolean {
        return !!this.annotationModeState[headingTitle];
    }
    toggleAnnotationModeState(headingTitle: string): void {
        const currentState = this.isAnnotationModeActive(headingTitle);
        this.annotationModeState[headingTitle] = !currentState;
    }
}

export const state = new State();
export default state;
