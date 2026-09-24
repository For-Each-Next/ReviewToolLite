# ReviewToolLite

ReviewToolLite 是 [SuperGrey][1] 開發之中文維基百科評審工具 [ReviewTool][2] 的精簡版。
Lite 版移除了「評審管理」工具，僅保留條目頁的「批註模式」。評審者可逐句標記評語，並將意見複製
為wikitext，貼到任何需要的地方，再依需要微調。

## 修改內容

- **註腳複製選單**：在批註模式中，點選註腳旁的「複製 ▾」，即可複製單筆或整組註腳，
  附上來源與可用的存檔連結，方便在來源評審中引用、核查與討論。
- **啟用時清除與復原**：每次載入頁面後，首次啟用批註模式時，若本頁已有批註，
  會透過 Codex 對話框詢問是否清除；按「取消」可保留。誤清除時，可點選通知或批註列表中的「復原清除」。
- **排版捷徑**：輸入 `<<文字>>`，會自動轉為 `「{{仿宋体|1=文字}}」`。
- **子點列評註**：在已有文字的意見行末按 Enter，會為上一行補上 `* ` 標記，
  就同一句話形成縮排點列批註。
- **相關來源**：批註對話框在原文與輸入框之間列出來源標題連結，
  點選旁邊的「[複製22a]」等文字，即可複製註腳並貼入評語。
- **批註時間**：批註列表頂部顯示目前批註的首次建立時間及最近編輯時間，
  使用瀏覽器本地時區，格式如 `2026年9月23日 14:30 [45分鐘前]`，每分鐘更新相對時間。
- **匯入與匯出備份**：在批註列表的「匯入／匯出」選單中，可將批註匯出為 JSON 檔案，
  或把備份匯入目前條目。
- **直接複製評審文字**：在批註列表中點選「複製」，即可取得整理好的評審維基語法，
  貼到評審頁後再自行修改。
- **複製並前往**：複製成功後，可前往條目討論頁、典範條目評選、特色列表評選、
  優良條目評選或同行評審；評審頁會定位至本條目的章節。

## 建構與使用

從 [Releases][6] 下載腳本，選擇一種方式使用：

- `ReviewToolLite.user.js`：以 Greasemonkey 安裝，在中文維基百科自動載入。
- `bundled.js`：將內容貼到自己的 [common.js][4]；也可貼到瀏覽器 Console，僅在目前頁面臨時使用。

在條目頁的「更多／工具」開啟「批註模式」，選取文字即可新增批註；
點選「查看批註」可編輯、備份及複製評審文字。

本機建構需安裝 Git、[Node.js][3] 和 npm：

```sh
git clone https://github.com/For-Each-Next/ReviewToolLite.git
cd ReviewToolLite
npm ci
npm run release
```

產物位於 `dist/`。開發時可用 `npm run watch` 自動重建；提交前執行
`npm run lint`、`npm run typecheck`、`npm test` 及 `npm run release`。

[1]: https://zh.wikipedia.org/wiki/User:SuperGrey
[2]: https://zh.wikipedia.org/wiki/User:SuperGrey/gadgets/ReviewTool
[3]: https://nodejs.org/
[4]: https://zh.wikipedia.org/wiki/Special:MyPage/common.js
[5]: https://github.com/QZGao/ReviewTool
[6]: https://github.com/For-Each-Next/ReviewToolLite/releases
