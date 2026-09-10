// 血管資料
//
// 幾何取自 BodyParts3D 4.0（CC BY 4.0），由 scripts/build-anatomy.mjs 抽出 31 條後
// 打包成 data/anatomy/vessels.bin.gz，打開圖層才下載；這裡只放中文名稱與臨床註記。
// 每個 id 都必須對得上 manifest.groups.vessels 的 key（npm run validate 會檢查）。
//
// kind    : artery 動脈（紅）／ vein 靜脈（藍）
// points  : 走行上或緊鄰的穴位，對應 data/acupoints.js 的 id
// caution : 針刺時與此血管有關的注意事項

export const VESSEL_GROUPS = {
  trunk: '軀幹與頸部',
  upper: '上肢',
  lower: '下肢',
};

export const VESSEL_KINDS = {
  artery: { name: '動脈', color: 0xd94f45 },
  vein: { name: '靜脈', color: 0x4a7fc1 },
};

export const VESSELS = {
  // ===== 軀幹與頸部 =====
  aorta: {
    name: '主動脈', latin: 'Aorta', kind: 'artery', group: 'trunk',
    course: '升主動脈 → 主動脈弓 → 降主動脈（胸段、腹段），沿脊柱左前方下行至第 4 腰椎分為左右髂總動脈',
    points: ['RN17', 'RN14', 'RN12', 'RN8', 'BL17'],
    caution: '腹部深刺（尤其中脘、下脘向後深刺）可能觸及腹主動脈，動脈瘤病人絕對禁止。',
  },
  vena_cava: {
    name: '上／下腔靜脈', latin: 'Superior & inferior vena cava', kind: 'vein', group: 'trunk',
    course: '上腔靜脈收納頭頸與上肢血液、下腔靜脈收納腹部與下肢血液，皆注入右心房',
    points: ['RN17', 'RN12'],
    caution: '位於縱膈與腹膜後深部，常規針刺深度不會觸及；此處僅作為深部解剖定位參考。',
  },
  common_carotid: {
    name: '總頸動脈', latin: 'Common carotid artery', kind: 'artery', group: 'trunk',
    course: '沿氣管與甲狀腺外側上行，於甲狀軟骨上緣（約 C4）分為內、外頸動脈；分叉處即頸動脈竇',
    points: ['ST9', 'ST10', 'LI18', 'RN23'],
    caution: '人迎（ST9）就在總頸動脈搏動處——必須先以手指將動脈推向外側再直刺 0.3–0.5 寸，禁止提插與深刺。壓迫頸動脈竇可引起反射性心搏過緩與暈厥。',
  },
  internal_carotid: {
    name: '內頸動脈', latin: 'Internal carotid artery', kind: 'artery', group: 'trunk',
    course: '不分枝上行至顱底，經頸動脈管入顱供應大腦前 2/3 與眼球',
    points: ['ST9', 'GB12', 'TE17'],
    caution: '位置深且緊貼咽側壁，頸部穴位一律不可向內深刺。',
  },
  vertebral_a: {
    name: '椎動脈', latin: 'Vertebral artery', kind: 'artery', group: 'trunk',
    course: '自鎖骨下動脈發出後穿 C6–C1 橫突孔上行，於寰椎後方轉向內，經枕骨大孔入顱',
    points: ['GB20', 'BL10', 'DU16', 'GB12'],
    caution: '⚠ 風池（GB20）深部即椎動脈與延髓。針尖必須朝向對側眼窩或鼻尖、深度不超過 1 寸；向上或向內深刺曾造成蛛網膜下腔出血與延髓損傷等致命事故。風府、啞門同理。',
  },
  inferior_thyroid: {
    name: '甲狀腺下動脈', latin: 'Inferior thyroid artery', kind: 'artery', group: 'trunk',
    course: '自甲狀頸幹發出，繞至甲狀腺側葉後下方，與喉返神經關係密切',
    points: ['RN22', 'ST10', 'ST11', 'LI17'],
    caution: '天突（REN22）須先直刺 0.2 寸再沿胸骨柄後緣向下平刺，不可向兩側或向後深刺。',
  },
  subclavian_a: {
    name: '鎖骨下動脈', latin: 'Subclavian artery', kind: 'artery', group: 'trunk',
    course: '經前、中斜角肌之間越第 1 肋上面，與臂叢同行，過鎖骨中點後方續為腋動脈',
    points: ['ST12', 'LU1', 'LU2', 'KI27'],
    caution: '缺盆（ST12）深部同時有鎖骨下動脈、臂叢與胸膜頂，只可淺刺 0.3–0.5 寸。',
  },
  internal_jugular: {
    name: '內頸靜脈', latin: 'Internal jugular vein', kind: 'vein', group: 'trunk',
    course: '自頸靜脈孔出顱，於頸動脈鞘內沿總頸動脈外側下行，在鎖骨內側端後方與鎖骨下靜脈匯合',
    points: ['ST9', 'ST11', 'LI18'],
    caution: '與總頸動脈同鞘，人迎一帶針刺誤入可造成血腫；頸部拔針後應加壓數十秒。',
  },
  subclavian_v: {
    name: '鎖骨下靜脈', latin: 'Subclavian vein', kind: 'vein', group: 'trunk',
    course: '走鎖骨下動脈前下方、前斜角肌前面，經第 1 肋上面向內與內頸靜脈匯合',
    points: ['ST12', 'KI27', 'LU2'],
    caution: '緊貼胸膜頂，鎖骨上區深刺同時有氣胸與空氣栓塞風險。',
  },

  // ===== 上肢 =====
  axillary_a: {
    name: '腋動脈', latin: 'Axillary artery', kind: 'artery', group: 'upper',
    course: '自第 1 肋外緣續鎖骨下動脈，被臂叢三索包繞穿行腋窩，至大圓肌下緣續為肱動脈',
    points: ['HT1', 'LU2', 'GB22', 'SP21'],
    caution: '極泉（HT1）在腋窩中央動脈搏動處，須避開動脈直刺 0.3–0.5 寸，或改用彈撥手法。',
  },
  axillary_v: {
    name: '腋靜脈', latin: 'Axillary vein', kind: 'vein', group: 'upper',
    course: '由肱靜脈與貴要靜脈匯合而成，行於腋動脈內側前方，至第 1 肋外緣續為鎖骨下靜脈',
    points: ['HT1', 'GB22'],
    caution: '位於腋動脈淺內側，極泉針刺角度偏內易刺中。',
  },
  brachial_a: {
    name: '肱動脈', latin: 'Brachial artery', kind: 'artery', group: 'upper',
    course: '沿肱二頭肌內側溝與正中神經伴行下降，於肘窩肱二頭肌腱內側分為橈動脈與尺動脈（量血壓的聽診部位）',
    points: ['LU5', 'PC3', 'HT3', 'LU4'],
    caution: '尺澤（LU5）與曲澤（PC3）都緊鄰肱動脈——曲澤在肱二頭肌腱尺側、尺澤在橈側，取穴前先觸診搏動。曲澤點刺出血須避開動脈本身。',
  },
  deep_brachial_a: {
    name: '肱深動脈', latin: 'Deep brachial artery', kind: 'artery', group: 'upper',
    course: '自肱動脈上段發出，與橈神經一同進入肱骨後方的橈神經溝，分側副支參與肘關節動脈網',
    points: ['TE12', 'TE11', 'LI13', 'LI14'],
    caution: '上臂後外側深刺同時涉及橈神經與此動脈。',
  },
  radial_a: {
    name: '橈動脈', latin: 'Radial artery', kind: 'artery', group: 'upper',
    course: '沿肱橈肌內側下行，於橈骨遠端前面僅隔皮膚與筋膜（即中醫「寸口」切脈處），再繞至鼻煙壺入掌參與掌深弓',
    points: ['LU9', 'LU8', 'LU7', 'LI5', 'LU6'],
    caution: '太淵（LU9）就在橈動脈搏動上、經渠（LU8）在其橈側緣——兩穴都須推開動脈後直刺 0.2–0.3 寸，禁止提插搗刺。太淵屬「脈會」，正是因為它在寸口動脈上。',
  },
  ulnar_a: {
    name: '尺動脈', latin: 'Ulnar artery', kind: 'artery', group: 'upper',
    course: '較橈動脈粗，斜穿前臂屈肌深面後與尺神經伴行於尺側屈腕肌橈側，經豌豆骨橈側入掌成掌淺弓',
    points: ['HT7', 'HT6', 'HT5', 'SI4'],
    caution: '神門（HT7）在尺側屈腕肌腱橈側、尺動脈尺側，直刺 0.3–0.5 寸即可，過深或偏橈側易刺中動脈。',
  },
  palmar_arch_a: {
    name: '掌淺弓與掌深弓', latin: 'Superficial & deep palmar arch', kind: 'artery', group: 'upper',
    course: '尺動脈末端與橈動脈掌淺枝形成掌淺弓（較淺、較遠端），橈動脈末端與尺動脈掌深枝形成掌深弓（較深、較近端）',
    points: ['PC8', 'LU10', 'SI3', 'LI4'],
    caution: '勞宮（PC8）深部即掌深弓，直刺 0.3–0.5 寸；合谷向掌側深刺會穿過第一背側骨間肌到達掌深弓。手掌針刺後出血較不易壓迫，需確實按壓。',
  },
  cephalic_v: {
    name: '頭靜脈', latin: 'Cephalic vein', kind: 'vein', group: 'upper',
    course: '起自手背靜脈網橈側，沿前臂橈側與上臂外側上行，經三角胸大肌間溝注入腋靜脈',
    points: ['LI11', 'LI10', 'LU5', 'LI15', 'LU2'],
    caution: '前臂橈側最常用的靜脈採血／輸液部位；針灸時屬淺表可見靜脈，刺中易瘀青，取穴時避開可見血管。',
  },
  basilic_v: {
    name: '貴要靜脈', latin: 'Basilic vein', kind: 'vein', group: 'upper',
    course: '起自手背靜脈網尺側，沿前臂尺側上行至上臂內側，於上臂中段穿深筋膜注入肱靜脈',
    points: ['HT3', 'PC3', 'HT2', 'SI8'],
    caution: '肘窩內側淺層即此靜脈，曲澤、少海取穴須避開。',
  },
  median_cubital_v: {
    name: '肘正中靜脈', latin: 'Median cubital vein', kind: 'vein', group: 'upper',
    course: '在肘窩前面斜行連接頭靜脈與貴要靜脈，位置淺表恆定，下方以肱二頭肌腱膜與肱動脈相隔',
    points: ['PC3', 'LU5', 'HT3'],
    caution: '曲澤（PC3）刺絡放血（中暑、急性吐瀉的傳統用法）主要放的就是這條靜脈；操作時只點破靜脈，不可深入腱膜下傷及肱動脈。',
  },

  // ===== 下肢 =====
  iliac_a: {
    name: '髂動脈', latin: 'Common / external / internal iliac artery', kind: 'artery', group: 'lower',
    course: '腹主動脈於 L4 分為左右髂總動脈，再分髂內動脈（供骨盆臟器）與髂外動脈（經腹股溝韌帶深面續為股動脈）',
    points: ['ST30', 'SP12', 'RN3', 'RN4'],
    caution: '下腹部穴位（關元、中極）深刺主要風險是膀胱與腸道，髂血管位於更深外側。',
  },
  femoral_a: {
    name: '股動脈', latin: 'Femoral artery', kind: 'artery', group: 'lower',
    course: '經腹股溝韌帶中點深面入股三角，位於股神經內側、股靜脈外側，下行穿收肌腱裂孔續為膕動脈',
    points: ['SP12', 'ST30', 'ST31', 'SP11', 'LR12'],
    caution: '股三角由外而內是「神經—動脈—靜脈」。衝門（SP12）與氣衝（ST30）針刺前必須觸診股動脈搏動並向外避開，直刺不超過 1 寸。',
  },
  femoral_v: {
    name: '股靜脈', latin: 'Femoral vein', kind: 'vein', group: 'lower',
    course: '膕靜脈的延續，於股三角內位於股動脈內側，過腹股溝韌帶後續為髂外靜脈',
    points: ['SP12', 'LR12', 'ST30'],
    caution: '深層靜脈血栓好發部位，下肢腫脹合併壓痛者針刺與推拿都應先排除 DVT。',
  },
  popliteal_a: {
    name: '膕動脈', latin: 'Popliteal artery', kind: 'artery', group: 'lower',
    course: '股動脈穿收肌腱裂孔後的延續，貼股骨膕面與膝關節囊後方走膕窩最深層，於膕肌下緣分為脛前、脛後動脈',
    points: ['BL40', 'BL39', 'BL55'],
    caution: '委中（BL40）深部依序是脛神經、膕靜脈、膕動脈。直刺 0.5–1 寸即可，禁止大幅提插；傳統「委中放血」只刺淺表小靜脈。',
  },
  popliteal_v: {
    name: '膕靜脈', latin: 'Popliteal vein', kind: 'vein', group: 'lower',
    course: '由脛前、脛後靜脈匯合而成，位於膕動脈淺後方、脛神經深面，向上續為股靜脈',
    points: ['BL40', 'BL39'],
    caution: '在委中處位置比動脈淺，是深刺最先傷到的血管。',
  },
  anterior_tibial_a: {
    name: '脛前動脈', latin: 'Anterior tibial artery', kind: 'artery', group: 'lower',
    course: '穿骨間膜上緣至小腿前間隔，與腓深神經伴行於脛前肌與伸拇長肌之間下行，過踝關節前方續為足背動脈',
    points: ['ST36', 'ST37', 'ST38', 'ST40', 'ST41'],
    caution: '足三里（ST36）深部即脛前動脈與腓深神經，直刺 1–2 寸屬常規，但出現搏動性阻力或鮮血湧出應立即退針按壓。',
  },
  posterior_tibial_a: {
    name: '脛後動脈', latin: 'Posterior tibial artery', kind: 'artery', group: 'lower',
    course: '走小腿後深間隔、比目魚肌深面，與脛神經伴行下降，經內踝後方的踝管入足底分為足底內、外側動脈',
    points: ['KI3', 'KI7', 'KI8', 'SP6', 'BL60'],
    caution: '太谿（KI3）在內踝尖與跟腱之間的動脈搏動處，須避開動脈直刺 0.5 寸。此處搏動是評估下肢血流的重要臨床指標，糖尿病足病人尤應先觸診。',
  },
  tibial_v: {
    name: '脛前／脛後靜脈', latin: 'Anterior & posterior tibial veins', kind: 'vein', group: 'lower',
    course: '各自伴同名動脈成對上行（伴行靜脈），於膕肌下緣匯合成膕靜脈',
    points: ['ST36', 'KI3', 'SP6', 'BL57'],
    caution: '深層靜脈，小腿針刺後若出現持續脹痛與腫脹須注意血腫。',
  },
  dorsalis_pedis: {
    name: '足背動脈', latin: 'Dorsalis pedis artery', kind: 'artery', group: 'lower',
    course: '脛前動脈過踝關節後的延續，走足背內側、伸拇長肌腱外緣，至第 1 蹠骨間隙穿入足底成足底深弓',
    points: ['ST42', 'LR3', 'ST41', 'GB42', 'EXLE10'],
    caution: '衝陽（ST42）即中醫診脈的「趺陽脈」，就在足背動脈搏動上，須推開動脈淺刺 0.3 寸。太衝（LR3）在第 1、2 蹠骨間，深部亦為此動脈的足底穿枝。',
  },
  plantar_a: {
    name: '足底動脈弓', latin: 'Medial / lateral plantar artery & plantar arch', kind: 'artery', group: 'lower',
    course: '脛後動脈於踝管分出足底內、外側動脈，外側支與足背動脈穿枝在蹠骨底形成足底弓',
    points: ['KI1', 'KI2', 'SP4'],
    caution: '湧泉（KI1）針刺較痛且足底血管神經豐富，一般直刺 0.5–0.8 寸；糖尿病或周邊血管疾病病人足底針刺後傷口不易癒合，宜避免。',
  },
  great_saphenous: {
    name: '大隱靜脈', latin: 'Great saphenous vein', kind: 'vein', group: 'lower',
    course: '人體最長的靜脈。起自足背靜脈弓內側，經內踝前方上行於小腿與大腿內側，於恥骨結節外下方穿隱靜脈裂孔注入股靜脈',
    points: ['SP6', 'SP7', 'SP9', 'LR4', 'SP11', 'SP12'],
    caution: '三陰交（SP6）淺層即大隱靜脈與隱神經並行。靜脈曲張病人此區針刺出血難止，且不宜在曲張靜脈上直接下針。',
  },
  small_saphenous: {
    name: '小隱靜脈', latin: 'Small saphenous vein', kind: 'vein', group: 'lower',
    course: '起自足背靜脈弓外側，經外踝後方沿小腿後正中上行，於膕窩穿深筋膜注入膕靜脈',
    points: ['BL57', 'BL58', 'BL60', 'BL39', 'BL40'],
    caution: '承山（BL57）與崑崙（BL60）附近有此靜脈通過，是小腿後側最常見的淺表出血來源。',
  },
};
