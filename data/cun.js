// 骨度分寸（骨度折量法）與指寸法
//
// 針灸的「寸」不是固定長度，是把兩個骨性標誌之間的距離折成固定的等份：
// 前臂不論長短一律是 12 寸，所以同一個穴在高矮不同的人身上都落在同樣的比例位置。
// 這裡把中國國家標準 GB/T 12346 的常用骨度整理成資料，用途有三個：
//
//   1. 資訊面板顯示「本穴位在哪一段骨度的第幾寸」，以及換算到本模型是幾公分
//   2. js/retarget.js 直接用這些骨性標誌當尺規來定位四肢穴位
//      （原本用的是關節中心——肱骨頭頂、距骨中心——比骨度標誌差 2–5 公分，
//        整段穴位會系統性偏掉將近 1 寸）
//   3. npm run validate 反算實際座標落在第幾寸，和宣告值對不上就報錯
//
// dir  直寸＝沿肢體長軸量；橫寸＝左右方向量
// ruler  [近端標誌, 遠端標誌]，對應 manifest.landmarks 的 key 或下面 DERIVED 的 key
// chain/seg  這把尺對應 js/retarget.js 哪一條體軸的哪一段（沒有就是純參考用）

export const BONE_CUN = {
  // ---- 頭面部 ----
  head_sagittal: { part: '頭面', name: '前髮際正中→後髮際正中', n: 12, dir: '直寸',
    note: '前髮際不明者，由眉心向上量 3 寸為前髮際；後髮際不明者，由大椎向上量 3 寸' },
  head_glabella: { part: '頭面', name: '眉間（印堂）→前髮際正中', n: 3, dir: '直寸' },
  head_c7: { part: '頭面', name: '第7頸椎棘突下（大椎）→後髮際正中', n: 3, dir: '直寸' },
  head_temporal: { part: '頭面', name: '兩額角髮際（頭維）之間', n: 9, dir: '橫寸' },
  head_mastoid: { part: '頭面', name: '耳後兩乳突（完骨）之間', n: 9, dir: '橫寸' },

  // ---- 胸腹脅部 ----
  chest: { part: '胸腹', name: '胸骨上窩（天突）→胸劍聯合中點', n: 9, dir: '直寸',
    ruler: ['jugularNotch', 'sternumBottom'] },
  epigastrium: { part: '胸腹', name: '胸劍聯合中點→臍中', n: 8, dir: '直寸',
    ruler: ['sternumBottom', 'navel'] },
  hypogastrium: { part: '胸腹', name: '臍中→恥骨聯合上緣（曲骨）', n: 5, dir: '直寸',
    ruler: ['navel', 'pubicSymphysis'] },
  nipple: { part: '胸腹', name: '兩乳頭之間', n: 8, dir: '橫寸',
    note: '女性可改用兩鎖骨中線之間' },
  coracoid: { part: '胸腹', name: '兩肩胛骨喙突內側緣之間', n: 12, dir: '橫寸' },
  flank: { part: '胸腹', name: '腋窩頂點→第11肋游離端（章門）', n: 12, dir: '直寸' },

  // ---- 背腰部 ----
  back_scapula: { part: '背腰', name: '肩胛骨內側緣→後正中線', n: 3, dir: '橫寸',
    ruler: ['scapulaMedial', 'midline'],
    note: '背俞穴第一側線旁開 1.5 寸、第二側線旁開 3 寸都由這把尺換算' },
  back_acromion: { part: '背腰', name: '肩峰外緣→後正中線', n: 8, dir: '橫寸' },

  // ---- 上肢部 ----
  upperarm: { part: '上肢', name: '腋前（後）紋頭→肘橫紋（平肘尖）', n: 9, dir: '直寸',
    ruler: ['axillaryFold', 'elbow'], chain: 'arm', seg: 0 },
  forearm: { part: '上肢', name: '肘橫紋（平肘尖）→腕掌（背）側遠端橫紋', n: 12, dir: '直寸',
    ruler: ['elbow', 'wrist'], chain: 'arm', seg: 1 },
  hand: { part: '上肢', name: '腕掌側遠端橫紋→中指尖', n: 8.5, dir: '直寸',
    note: '手指部另用指寸法；掌指關節到指端多以指節與甲角定位' },

  // ---- 下肢部 ----
  thigh: { part: '下肢', name: '股骨大轉子（髀樞）→膕橫紋（平髕尖）', n: 19, dir: '直寸',
    ruler: ['greaterTrochanter', 'patellaApex'], chain: 'leg', seg: 0 },
  thigh_med: { part: '下肢', name: '恥骨聯合上緣→股骨內上髁上緣', n: 18, dir: '直寸',
    ruler: ['pubicSymphysis', 'knee'], chain: 'leg', seg: 0 },
  gluteal: { part: '下肢', name: '臀溝→膕橫紋', n: 14, dir: '直寸',
    note: '與大腿 19 寸共用同一把尺——臀溝正好在大轉子下 5 寸，所以承扶、殷門直接換算成大腿的第幾寸' },
  shank: { part: '下肢', name: '膕橫紋（平髕尖）→外踝尖', n: 16, dir: '直寸',
    ruler: ['patellaApex', 'lateralMalleolus'], chain: 'leg', seg: 1 },
  shank_med: { part: '下肢', name: '脛骨內側髁下方（陰陵泉）→內踝尖', n: 13, dir: '直寸',
    ruler: ['yinlingquan', 'medialMalleolus'], chain: 'leg', seg: 1 },
  foot: { part: '下肢', name: '內踝尖→足底', n: 3, dir: '直寸' },
};

// 指寸法：手邊沒有尺、或骨度標誌摸不清楚時用受檢者本人的手指當尺
export const FINGER_CUN = [
  { name: '中指同身寸', n: 1, how: '中指屈曲，中節橈側兩端指紋頭之間的距離為 1 寸' },
  { name: '拇指同身寸', n: 1, how: '拇指指間關節的橫向寬度為 1 寸' },
  { name: '橫指同身寸（一夫法）', n: 3, how: '食、中、無名、小指四指併攏，以中指近端指間關節橫紋為準，四指的橫向寬度為 3 寸' },
  { name: '二橫指', n: 1.5, how: '食、中兩指併攏的寬度約 1.5 寸' },
];

// 由既有 landmark 推出來的標誌。骨度量的是體表摸得到的位置，
// 有些（腋前紋頭、陰陵泉）沒有單獨的骨頭可以抓，只能由鄰近的骨性標誌推。
const DERIVED = {
  // 腋前紋頭：約在肱骨全長的近端 1/6 處（胸大肌止點下緣一帶），無法由骨頭直接量
  axillaryFold: L => lerp(L.shoulder, L.elbow, 0.17),
  // 陰陵泉：脛骨內側髁「下方」的凹陷，比脛骨平臺低約 3 公分
  yinlingquan: L => shiftToward(L.tibiaCondyle, L.medialMalleolus, 0.03),
  // 胸骨上窩：胸骨體頂端再往上一個柄長
  jugularNotch: L => [L.sternumTop[0], L.sternumTop[1] + 0.048, L.sternumTop[2]],
  // 臍：模型上沒有肚臍這個標誌，但骨度已經定義了它的位置——
  // 胸劍聯合到恥骨聯合上緣共 13 寸，臍把這段分成 8:5，直接照這個比例取。
  // （原本借用第 3 腰椎棘突高度，比這個高 2.4 公分，下腹部整排穴位都會偏上）
  navel: L => {
    const a = landmarkOf(L, 'sternumBottom'), b = landmarkOf(L, 'pubicSymphysis');
    const p = lerp(a, b, 8 / 13);
    return [0, p[1], p[2]];
  },
  midline: L => [0, L.scapulaMedial[1], L.scapulaMedial[2]],
  // 臀溝：模型上沒有皮膚皺褶可以量。骨度給「臀溝→膕橫紋 14 寸」而
  // 「大轉子→膕橫紋 19 寸」，兩者相減即臀溝在大轉子下 5 寸，照這個定義取。
  glutealFold: L => lerp(landmarkOf(L, 'greaterTrochanter'), landmarkOf(L, 'patellaApex'), 5 / 19),
};

const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
/** 由 a 往 b 的方向移動固定距離 */
function shiftToward(a, b, d) {
  const L = dist(a, b) || 1;
  return lerp(a, b, d / L);
}

/** 取得某個骨度標誌在真實模型上的座標（+x 側） */
export function landmarkOf(L, key) {
  if (DERIVED[key]) return DERIVED[key](L);
  const v = L[key];
  if (!v) throw new Error(`骨度標誌不存在：${key}`);
  return v;
}

/**
 * 把每一把尺換算成「本模型 1 寸 = 幾公尺」。
 * 骨度是比例制，所以各段的 1 寸長度本來就不一樣（前臂約 2.0 cm、小腿約 2.4 cm）。
 */
export function cunScale(L) {
  const out = {};
  for (const [key, s] of Object.entries(BONE_CUN)) {
    if (!s.ruler) continue;
    const a = landmarkOf(L, s.ruler[0]), b = landmarkOf(L, s.ruler[1]);
    out[key] = { metres: dist(a, b) / s.n, span: dist(a, b), a, b, n: s.n };
  }
  return out;
}
