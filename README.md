# ReviewTool

專案頁面：[ReviewTool](https://zh.wikipedia.org/wiki/User:SuperGrey/gadgets/ReviewTool)

條目文筆批註小工具，僅在條目頁提供批註功能。

- 在條目頁的「更多／工具」選單中開啟「批註模式」後，選擇文字進行批註。
- 批註本地儲存於瀏覽器中，暫不具備同步功能。在「批註列表」底部開啟「匯入／匯出」選單，選擇「匯出」備份為 JSON 檔，或選擇「匯入」將備份合併到目前條目；重複 ID 的批註會略過，保留現有內容。匯入後會立即更新列表及可定位的批註圖示。
- 「批註列表」底部的排序、複製、複製並前往、匯入／匯出、清除全部及關閉控制項會一直顯示；沒有批註時，需要批註的操作（包括「匯出」選單項目）會停用，仍可開啟「匯入／匯出」選單匯入備份。
- 重新載入條目頁後，會依儲存的位置及原文還原批註圖示；圖示僅在開啟批註模式時顯示，可點擊檢視或編輯。原文不匹配時不顯示圖示，批註仍保留在本地；舊批註會嘗試以原文及章節定位。
- 在「查看批註」列表中，使用「複製」按鈕可直接複製本頁批註的評審維基語法；使用藍色主要按鈕「複製並前往」選擇典範條目評選、特色列表評選、優良條目評選或同行評審，複製成功後會前往該頁以本條目為標題的章節。
- 複製的文字中，每項意見使用 `# ...` 編號列表，保留章節、原文引用及簽名，批註依條目位置排序。
- 意見中以 `*` 開頭的各行（星號後可有或無空格）會轉為 `#* ...` 子意見，列在原文引用下方。
- 在批註意見輸入框中輸入 `<<文字>>`，會即時替換為 `「{{仿宋体|1=文字}}」`。
- 在意見輸入框中按 Enter，會將原意見加上 `* `，並自動在新行插入 `* `，方便繼續輸入下一項子意見。

## 使用方式

### 發行版本

将如下程式碼复制至 [User:你的用戶名/common.js](https://zh.wikipedia.org/wiki/Special:MyPage/common.js) 頁面：

```js
importScript('User:SuperGrey/gadgets/ReviewTool/main.js');  // Backlink: [[User:SuperGrey/gadgets/ReviewTool]]
```

### 從原始碼建構

1. **安裝 Node.js**
   - 請先安裝 [Node.js](https://nodejs.org/)。

2. **安裝依賴套件**
   - 在 ReviewTool 目錄下執行：

     ```sh
     npm install
     ```

3. **建構 Bundled 版本**
   - 執行下列指令以產生 `dist/bundled.js`：

     ```sh
     npm run release
     ```

   - 若需持續監看檔案變動並自動重建，請執行：

     ```sh
     npm run watch
     ```

4. **安裝至維基**
   - 將 `dist/bundled.js` 上傳至你的維基用戶頁面，例如 [User:你的用戶名/ReviewTool.js](https://zh.wikipedia.org/wiki/Special:MyPage/ReviewTool.js)。
   - 在 [User:你的用戶名/common.js](https://zh.wikipedia.org/wiki/Special:MyPage/common.js) 頁面加入：

     ```js
     importScript('User:你的用戶名/ReviewTool.js');  // 修改為你的用戶名
     ```
