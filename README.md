# ReviewToolLite

ReviewToolLite 是 [SuperGrey][1] 開發之中文維基百科評審工具 [ReviewTool][2] 的精簡版。
Lite 版移除了「評審管理」工具，僅保留條目頁的「批註模式」。評審者可逐句標記評語，並將意見複製
為wikitext，貼到任何需要的地方，再依需要微調。

## 修改內容

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

完成後會產生 `dist/bundled.js`。複製這個檔案的完整內容，
可選擇以下任一方式在中文維基百科啟動工具：

- **加入用戶 JS**：將腳本內容附加到自己的 [common.js][4] 頁面並儲存，
  再重新載入條目頁。
- **用 F12 臨時啟動**：在條目頁按 F12 開啟瀏覽器開發者工具，
  切換到 Console（主控台），貼上腳本內容並執行。
  這種方式只在目前頁面生效，重新載入或切換頁面後需要再次執行。

啟動後，在「更多／工具」選單中開啟「批註模式」，即可選取文字並新增批註。
點選「查看批註」可開啟列表，編輯、刪除、備份或複製批註。

開發時可執行以下指令，在檔案變動後自動重新建構：

```sh
npm run watch
```

[1]: https://zh.wikipedia.org/wiki/User:SuperGrey
[2]: https://zh.wikipedia.org/wiki/User:SuperGrey/gadgets/ReviewTool
[3]: https://nodejs.org/
[4]: https://zh.wikipedia.org/wiki/Special:MyPage/common.js
