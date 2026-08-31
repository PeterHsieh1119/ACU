# ACU — 針灸 × PNF 3D 輔助工具

### 🔗 線上直接打開：**[https://peterhsieh1119.github.io/ACU/](https://peterhsieh1119.github.io/ACU/)**

純靜態網頁的 3D 針灸／PNF 學習輔助：在同一個解剖模型上，把 **經絡穴位 ↔ 肌肉 ↔ PNF 對角模式** 三層資料接在一起。

## 功能

- **3D 人體**：可旋轉、縮放，體表透明度可調
- **14 經絡**：十二正經＋任督二脈，可逐條開關，約 100 個常用穴位
- **穴位查詢**：點擊 3D 穴位或側欄清單，顯示定位、主治、刺法參考深度、下方肌肉
- **PNF 模式**：8 個對角模式（上肢／下肢 D1/D2 屈伸），選取後高亮模式的肌肉鏈
- **雙向連結**：PNF 模式 → 肌肉鏈 → 建議參考穴位；穴位 → 相關 PNF 模式

## 使用

點上方連結（GitHub Pages）直接使用，或本地執行：

```bash
python -m http.server 8000
# 瀏覽器開 http://localhost:8000
```

ES module 需經 http 伺服器載入，直接雙擊 index.html 無法執行。

## 資料結構

| 檔案 | 內容 |
|---|---|
| `data/acupoints.js` | 14 經絡定義、穴位（座標／定位／主治／深度／對應肌肉）、經絡走行路徑 |
| `data/muscles.js` | 約 55 條肌肉的簡化幾何（起止線段）與名稱 |
| `data/pnf.js` | 8 個 PNF 對角模式：動作組成、口訣、主要肌肉成分 |

肌肉是三層資料的樞紐：`穴位.muscles` 與 `PNF模式.muscles` 共用同一組肌肉 id，關聯由程式自動推得。

## 資料來源

- 穴位定位依 WHO Standard Acupuncture Point Locations 之通行定位描述
- PNF 肌肉成分整理自 Voss/Knott 傳統與《PNF in Practice》(Adler, Beckers & Buck)
- 穴位—肌肉對應依常用針灸解剖教材整理

## 免責聲明

本工具僅供解剖與經絡**學習參考**。3D 座標為示意近似，針刺深度為教科書常見參考值，皆不可作為臨床操作依據；實際針灸請由合格中醫師執行。
