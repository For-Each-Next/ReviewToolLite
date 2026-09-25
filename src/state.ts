/**
 * 全局狀態管理。
 */
class State {
    // 簡繁轉換
    convByVar = (langDict: { hant: string; hans: string }): string => {
        if (langDict?.hant) {
            return langDict.hant; // 預設返回繁體中文
        }
        return '繁簡轉換未初始化，且 langDict 無效！';
    };
    async initHanAssist(): Promise<void> {
        const requireModule = await mw.loader.using('ext.gadget.HanAssist');
        const { convByVar } = requireModule('ext.gadget.HanAssist') as Pick<State, 'convByVar'>;
        if (typeof convByVar === 'function') this.convByVar = convByVar;
    }

    // 當前條目標題
    articleTitle = '';

    // 用戶名
    readonly userName = mw.config.get('wgUserName') || 'Example';
}

export default new State();
