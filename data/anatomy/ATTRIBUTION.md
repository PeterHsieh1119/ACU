# 解剖模型來源與授權

`data/anatomy/` 內的體表、肌肉與骨骼幾何來自 **BodyParts3D**。

- 資料集：BodyParts3D 4.0，成年男性參考解剖
- 版權：© The Database Center for Life Science（生命科学統合データベースセンター）
- 授權：[Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/)
- 授權說明：<https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html>
- 下載頁：<https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html>
- 論文：Mitsuhashi et al. (2009), *BodyParts3D: 3D structure database for anatomical concepts.*
  <https://doi.org/10.1093/nar/gkn613>

原始網格與英文名稱表經 [ashemag/human-atlas](https://github.com/ashemag/human-atlas)
（MIT 授權的應用程式碼）整理為單位公尺、y 向上的二進位格式，本專案再以
`scripts/build-anatomy.mjs` 抽取所需部位。

## 本專案所做的改作

- 只保留針灸／PNF 教學需要的部位：體表 1 件、肌肉 79 組、骨骼 131 件
- 成對結構只保留左側，右側在瀏覽器端鏡射
- 以 meshoptimizer 精簡（相對誤差上限 2–3%，1200 個三角形以下的網格不簡化）
- 位置量化為 uint16、法線改為載入後即時計算，並打包成 gzip 二進位
- 依 ACU 的肌肉 id 合併多個來源網格（例如三個頭合併為肱三頭肌）

BodyParts3D 是成年男性的參考解剖，不代表所有人的結構與變異；本專案僅供教學參考，
不是臨床或診斷工具。

依 CC BY 4.0 之要求，再散布本目錄內的資料時請保留上述出處與授權說明。
