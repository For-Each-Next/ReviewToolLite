# ReviewToolLite

ReviewToolLite 是 [SuperGrey][1] 開發之中文維基百科評審工具 [ReviewTool][2] 的精簡版。
Lite 版移除了「評審管理」工具，僅保留條目頁的「批註模式」。評審者可逐句標記評語，並將意見複製
為wikitext，貼到任何需要的地方，再依需要微調。

原始專案為 Quinn Gao（QZGao／SuperGrey）的 [QZGao/ReviewTool][5]；
本版本由 For-Each-Next 在 AI 協助下修改。

## 修改內容

- **註腳複製選單**：在批註模式中，將滑鼠移到 `[3]` 等註腳標記上，
  或以鍵盤聚焦，再點選旁邊的「複製 ▾」開啟彈出選單。
  「複製註腳」取得目前頁面版本、完整註腳錨點及標籤，例如
  `[[Special:Permalink/123456#cite_ref-Ozawa2023_3-0|3a]]`。
  標籤保留頁面顯示的編號（包括 `5.1` 等子參考編號）；同一引文重複使用時，
  依回鏈順序加上 `a`、`b` 等字母，已顯示字母的標籤則維持原樣。
  「複製引文」保留原有參考資料列表連結格式，例如
  `[[Special:Permalink/123456#cite_note-Ozawa2023-3]]`。
  相鄰註腳有多筆時，群組末端的選單會依原文順序列出每筆註腳的編號，
  例如「複製註腳 [18]」「複製引文 [18]」「複製註腳 [19]」「複製引文 [19]」，
  可直接選擇要複製的項目，不受最後滑過哪個註腳影響。
  另提供「複製本組註腳」，依原文順序複製每個註腳連結，
  以逗號及空格分隔。`:6` 等頁碼／位置標記不會被複製，也不會拆散註腳群組。
  原有註腳標記保留 Reference Tooltips 的預覽與跳轉功能，選單只由獨立按鈕開啟。
  開啟或捲動參考資料預覽時，複製按鈕仍會保留。選單支援方向鍵、Home／End、
  Escape 及點擊外部關閉；關閉批註模式會移除按鈕與選單。
- **啟用時清除與復原**：每次載入頁面後，首次啟用批註模式時，若本頁已有批註，
  會透過 Codex 對話框詢問是否清除；按「取消」可保留。誤清除時，可點選通知或批註列表中的「復原清除」。
  瀏覽器會保留本頁最近一次清除的批註，重新載入後仍可復原，且不會覆蓋新批註。
- **批註時間**：批註列表頂部顯示目前批註的首次建立時間及最近編輯時間，
  使用瀏覽器本地時區，格式如 `2026年9月23日 14:30 [45分鐘前]`，每分鐘更新相對時間。
  編輯時間會隨備份及復原保留；舊批註沒有編輯紀錄時，以建立時間作為最近已知時間。
- **匯入與匯出備份**：在批註列表的「匯入／匯出」選單中，可將批註匯出為 JSON 檔案，
  或把備份匯入目前條目。
- **直接複製評審文字**：在批註列表中點選「複製」，即可取得整理好的評審維基語法，
  貼到評審頁後再自行修改。
- **複製且前往評審頁**：透過「複製並前往」，可選擇典範條目評選、特色列表評選、
  優良條目評選或同行評審。複製成功後，便會前往所選頁面中以本條目為標題的章節。
- **排版捷徑**：輸入 `<<文字>>`，會自動轉為 `「{{仿宋体|1=文字}}」`。
- **子点列评注**：在已有文字的意見行末按 Enter，會為上一行補上 `* ` 標記，就同一句
  话形成缩进点列批注。

批註儲存在目前使用的瀏覽器中，不會自動同步到其他裝置。
如需備份或轉移，可使用 JSON 匯出與匯入功能。

## 建構與使用

先安裝 Git、[Node.js][3] 和 npm，再執行以下指令：

```sh
git clone https://github.com/For-Each-Next/ReviewToolLite.git
cd ReviewToolLite
npm ci
npm run release
```

完成後會產生以下兩個檔案。release 建構會壓縮 `bundled.js` 的 JavaScript，
而 `ReviewToolLite.user.js` 保留可讀的格式；兩者的 CSS 都使用保留換行的多行樣板字串。
可選擇其中一種方式在中文維基百科啟動工具：

- **Greasemonkey 腳本**：`dist/ReviewToolLite.user.js`。在 Greasemonkey 中新增腳本，
  將這個檔案的完整內容貼入並儲存；也可從 GitHub Release 開啟 `.user.js` 附件安裝。
  安裝後，工具會在中文維基百科條目頁自動載入。
- **一般腳本**：`dist/bundled.js`。複製這個檔案的完整內容，依下列方式使用。

- **加入用戶 JS**：將腳本內容附加到自己的 [common.js][4] 頁面並儲存，
  再重新載入條目頁。
- **用 F12 臨時啟動**：在條目頁按 F12 開啟瀏覽器開發者工具，
  切換到 Console（主控台），貼上腳本內容並執行。
  這種方式只在目前頁面生效，重新載入或切換頁面後需要再次執行。

啟動後，在「更多／工具」選單中開啟「批註模式」，即可選取文字並新增批註。
點選「查看批註」可開啟列表，編輯、刪除、備份或複製批註。

開發時可執行以下指令，在檔案變動後自動重新建構兩種腳本：

```sh
npm run watch
```

原始碼使用 TypeScript、Vue 單檔元件和 ES modules，採用 `const`／`let`、箭頭函式、
解構、樣板字串及 `async`／`await` 等現代語法。建構時仍輸出以 ES2019 為目標的
單一腳本；Vue 與 Codex 由維基百科的 ResourceLoader 提供。
兩種輸出共用 `src/bootstrap.ts` 作為啟動入口，等待 MediaWiki 及必要模組就緒後，
才載入並初始化應用程式。

提交變更前可執行以下檢查：

```sh
npm run lint
npm run typecheck
npm test
npm run release
```

`lint` 檢查原始碼、Vue 元件、建構設定與測試；`typecheck` 檢查 TypeScript 模組。
測試涵蓋批註備份、清除與復原、首次啟用提示、註腳連結、排序、評審文字格式、
句子分段、對話框清理及使用者腳本啟動。

[1]: https://zh.wikipedia.org/wiki/User:SuperGrey
[2]: https://zh.wikipedia.org/wiki/User:SuperGrey/gadgets/ReviewTool
[3]: https://nodejs.org/
[4]: https://zh.wikipedia.org/wiki/Special:MyPage/common.js
[5]: https://github.com/QZGao/ReviewTool
