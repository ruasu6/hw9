# 錯題研究室｜日文讀解與文法筆記

把自己的日文錯題整理成可以繼續擴充的學習網站。這份作業的核心是 **AGENTS.md + 結構化內容 + 共用頁面**：之後加入新題目時，AI 依同一套規則整理，就能自動產生索引、解析頁與複習內容。

- 網頁成果：https://ruasu6.github.io/hw9/
- 專案規則：[AGENTS.md](AGENTS.md)
- 新題格式：[docs/NOTE_TEMPLATE.json](docs/NOTE_TEMPLATE.json)
- 錯題資料：[content/notes.json](content/notes.json)

## 專案目的與功能

學習日文時，不只記住「哪個選項對」，也記錄自己的誤選、正解的語意依據，以及其他選項不適合的原因。

- 依題號、關鍵字、文法標籤及來源搜尋與篩選。
- 每題都有共用的解說結構：原題、誤選原因、正解線索、選項比較、一句重點與自編例句。
- 使用完整筆記中的自編練習複習，作答後顯示答案與理由。
- 可標記「已理解」；進度僅保存在當前瀏覽器，不跨裝置同步。
- 手機與桌面皆使用同一套響應式版面；不需要登入、API key 或後端。

## 資料來源與目前範圍

原始需求來自「解釋讀解文法題」的對話預覽，但預覽沒有附件原文。**沒有聲稱讀取完整舊對話或試卷。**

- 第 36 題：依使用者在本次對話新提供的圖片轉錄。使用者選 3「そのころに」，使用者提供的正解為 2「それなりに」。試卷名稱與回次未註記，未另核對官方答案。
- 第 14、15、19、20、21、22、27、28、29、37、43、45、54 題：僅有題號，狀態為 `pending`。
- 第 49 題：只有「今にも動き出して」與て形的提問片段，狀態為 `pending`，不推測原題解答。
- 共 15 個題號、1 篇完整解析、14 筆待補資料；不同回次可能有相同題號，後續須補來源，不能只靠題號辨識。
- 例句與練習為自編並清楚標示；未上傳試卷圖片或完整私人對話。

## 如何繼續新增內容

1. 先讓 AI 讀取 `AGENTS.md`。
2. 提供試卷名稱／回次、完整題幹、四個選項、你的答案、正確答案與依據。
3. 依 `docs/NOTE_TEMPLATE.json` 的結構，在 `content/notes.json` 新增一筆，ID 必須唯一。範本含第 36 題示例文字，新增時每個內容欄位都須換成新題的內容。
4. 檢查內容並執行 `npm run check`、`npm run build`。
5. 推送至 `main`，GitHub Actions 會驗證並重新發布網站。新增題目不需要修改 HTML 或 JavaScript。

可直接給 AI 的指令：

```text
先讀取 AGENTS.md，依 docs/NOTE_TEMPLATE.json 將下面的錯題
加入 content/notes.json。保留既有內容；資料不足標記 pending，
不推測答案。完成後執行 npm run check 與 npm run build。

試卷／回次：
題幹與選項：
我的答案：
正確答案與依據：
我的疑問：
```

## 檔案結構

```text
AGENTS.md                  AI 的專案規則
content/notes.json         錯題資料，唯一內容來源
docs/NOTE_TEMPLATE.json    完整筆記資料格式與範例
site/index.html            頁面骨架
site/styles.css            共用視覺風格與響應式版面
site/app.js                搜尋、動態解說、練習與本機進度
scripts/check.mjs          資料驗證
scripts/build.mjs          靜態網站建置
.github/workflows/pages.yml 自動發布流程
dist/                      建置結果（不提交）
```

## 本機開發與驗證

使用 Node.js 22 或更新版本；無第三方套件，不需 `npm install`。

```sh
npm run check
npm run build
```

一般本機電腦可用靜態伺服器瀏覽 `dist/`，例如 `python3 -m http.server 8000 --directory dist`，再開啟 http://localhost:8000 。不要直接以 `file://` 開啟，因為瀏覽器會限制 JSON 的載入。受管理的 Cloud 環境應使用其內建預覽工具。

`check` 會驗證唯一 ID、必填內容、狀態、四個選項與答案範圍。修改互動時另需檢查搜尋、篩選、詳細頁、練習回饋與進度保存。此開發環境缺少 Sites 的瀏覽器預覽工具，未進行實際瀏覽器視覺驗證；資料檢查、JavaScript 語法與線上 HTTP 資源可獨立驗證。

## GitHub Pages

GitHub repository 的 Settings → Pages → Source 使用 **GitHub Actions**。`main` 更新後，`pages.yml` 會建置 `dist/` 並發布。網站使用相對資源路徑與 hash 導覽，因此可在 `/hw9/` 下瀏覽，詳細頁重新整理也不會產生路徑 404。

## 作業說明用文字

我的專案是「錯題研究室」，以自己的日文讀解與文法錯題建立可搜尋的筆記網站。我在 AGENTS.md 規定專案目的、手帳風格、檔案結構、錯題欄位、內容正確性要求與驗證流程。每篇筆記共用「原題 → 誤選原因 → 正解依據 → 選項比較 → 重點 → 自編練習」的格式。未來新增題目時，只要讓 AI 先讀規則，再加入結構化資料，就能延續相同的頁面與互動方式，並經由 GitHub Actions 更新公開網站。
