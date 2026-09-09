// 肌肉資料
//
// path  : 走行控制點（起點 → 止點，2–4 點；程式以樣條掃掠成梭形肌腹）
// r     : 肌腹最大半徑（公尺）
// deep  : 深層肌，顯示時較透明
// midline: 跨越正中線的肌肉，不做左右鏡射
// group : 對應下方 MUSCLE_GROUPS，用於側欄分組
//
// 座標系與 data/acupoints.js 相同：y 向上（身高 1.75 m）、+z 為前方、+x 為一側（自動鏡射）。
// 幾何是「教學示意」等級的簡化，不是斷層掃描重建。

export const MUSCLE_GROUPS = {
  head_neck: '頭頸與顏面',
  trunk: '軀幹',
  shoulder: '肩胛帶',
  arm: '上臂',
  forearm: '前臂與手',
  hip: '髖與大腿',
  leg: '小腿與足',
};

export const MUSCLES = {
  // ===== 頭頸與顏面 =====
  occipitofrontalis: {
    name: '額枕肌', latin: 'Occipitofrontalis', group: 'head_neck',
    path: [[0.030, 1.698, 0.078], [0.036, 1.730, 0.020], [0.030, 1.690, -0.058]], r: 0.010,
    origin: '枕骨上項線 / 帽狀腱膜', insertion: '眉部皮膚', action: '揚眉、皺額', nerve: '顏面神經 (VII)',
  },
  temporalis: {
    name: '顳肌', latin: 'Temporalis', group: 'head_neck',
    path: [[0.076, 1.702, 0.008], [0.084, 1.664, 0.026], [0.072, 1.620, 0.032]], r: 0.014,
    origin: '顳窩', insertion: '下頜骨喙突', action: '閉口、後拉下頜', nerve: '三叉神經下頜支 (V3)',
  },
  masseter: {
    name: '咬肌', latin: 'Masseter', group: 'head_neck',
    path: [[0.078, 1.606, 0.036], [0.081, 1.578, 0.038], [0.070, 1.552, 0.036]], r: 0.013,
    origin: '顴弓', insertion: '下頜角外側面', action: '閉口、咀嚼', nerve: '三叉神經下頜支 (V3)',
  },
  orbicularis_oculi: {
    name: '眼輪匝肌', latin: 'Orbicularis oculi', group: 'head_neck',
    path: [[0.014, 1.658, 0.092], [0.040, 1.666, 0.084], [0.058, 1.646, 0.072], [0.034, 1.630, 0.088]], r: 0.006,
    origin: '眶內側緣', insertion: '眼瞼與眶周皮膚', action: '閉眼、瞬目', nerve: '顏面神經 (VII)',
  },
  orbicularis_oris: {
    name: '口輪匝肌', latin: 'Orbicularis oris', group: 'head_neck', midline: true,
    path: [[0.030, 1.566, 0.090], [0.000, 1.572, 0.101], [-0.030, 1.566, 0.090]], r: 0.007,
    origin: '口周諸肌', insertion: '唇部皮膚黏膜', action: '閉唇、噘嘴', nerve: '顏面神經 (VII)',
  },
  zygomaticus: {
    name: '顴肌', latin: 'Zygomaticus major', group: 'head_neck',
    path: [[0.060, 1.622, 0.058], [0.044, 1.592, 0.082], [0.031, 1.570, 0.090]], r: 0.006,
    origin: '顴骨', insertion: '口角', action: '上提口角（微笑）', nerve: '顏面神經 (VII)',
  },
  scm: {
    name: '胸鎖乳突肌', latin: 'Sternocleidomastoid', group: 'head_neck',
    path: [[0.064, 1.598, -0.014], [0.050, 1.520, 0.026], [0.022, 1.444, 0.054]], r: 0.013,
    origin: '胸骨柄與鎖骨內側', insertion: '顳骨乳突', action: '單側側屈同側＋旋轉對側；雙側屈頸', nerve: '副神經 (XI)、C2–C3',
  },
  scalenes: {
    name: '斜角肌群', latin: 'Scalenes', group: 'head_neck', deep: true,
    path: [[0.032, 1.508, 0.008], [0.046, 1.462, 0.020], [0.056, 1.432, 0.030]], r: 0.010,
    origin: '頸椎橫突', insertion: '第1、2肋', action: '側屈頸部、上提肋骨（吸氣輔助）', nerve: '頸神經前枝 C3–C8',
  },
  splenius: {
    name: '頭夾肌', latin: 'Splenius capitis', group: 'head_neck',
    path: [[0.026, 1.432, -0.076], [0.046, 1.500, -0.068], [0.060, 1.564, -0.044]], r: 0.012,
    origin: '項韌帶、C7–T3棘突', insertion: '乳突與上項線', action: '伸頸、同側側屈與旋轉', nerve: '頸神經後枝',
  },
  semispinalis: {
    name: '半棘肌', latin: 'Semispinalis capitis', group: 'head_neck', deep: true,
    path: [[0.022, 1.400, -0.084], [0.026, 1.480, -0.078], [0.028, 1.546, -0.064]], r: 0.011,
    origin: '上位胸椎與下位頸椎橫突', insertion: '枕骨上下項線之間', action: '伸頸、維持頭部姿勢', nerve: '頸神經後枝',
  },
  suboccipitals: {
    name: '枕下肌群', latin: 'Suboccipitals', group: 'head_neck', deep: true,
    path: [[0.020, 1.542, -0.070], [0.038, 1.572, -0.060]], r: 0.010,
    origin: 'C1橫突、C2棘突', insertion: '枕骨下項線', action: '寰枕微調、頭部本體感覺重鎮', nerve: '枕下神經 (C1)',
  },
  platysma: {
    name: '闊頸肌', latin: 'Platysma', group: 'head_neck',
    path: [[0.052, 1.548, 0.052], [0.060, 1.484, 0.046], [0.076, 1.428, 0.028]], r: 0.008,
    origin: '胸大肌與三角肌上方筋膜', insertion: '下頜下緣與口角', action: '緊張頸部皮膚、下拉口角', nerve: '顏面神經頸支 (VII)',
  },

  // ===== 軀幹 =====
  trapezius_upper: {
    name: '上斜方肌', latin: 'Trapezius (upper)', group: 'trunk',
    path: [[0.012, 1.512, -0.058], [0.062, 1.476, -0.052], [0.118, 1.438, -0.032]], r: 0.018,
    origin: '枕外隆凸、項韌帶', insertion: '鎖骨外1/3與肩峰', action: '肩胛上提與上旋', nerve: '副神經 (XI)',
  },
  trapezius_middle: {
    name: '中斜方肌', latin: 'Trapezius (middle)', group: 'trunk',
    path: [[0.012, 1.398, -0.090], [0.076, 1.412, -0.066], [0.138, 1.424, -0.030]], r: 0.017,
    origin: 'C7–T3棘突', insertion: '肩峰內緣與肩胛岡', action: '肩胛後縮', nerve: '副神經 (XI)',
  },
  trapezius_lower: {
    name: '下斜方肌', latin: 'Trapezius (lower)', group: 'trunk',
    path: [[0.012, 1.200, -0.092], [0.052, 1.282, -0.086], [0.096, 1.376, -0.054]], r: 0.015,
    origin: 'T4–T12棘突', insertion: '肩胛岡內側端', action: '肩胛下壓與上旋', nerve: '副神經 (XI)',
  },
  levator_scapulae: {
    name: '提肩胛肌', latin: 'Levator scapulae', group: 'trunk',
    path: [[0.032, 1.516, -0.048], [0.060, 1.468, -0.064], [0.088, 1.408, -0.072]], r: 0.011,
    origin: 'C1–C4橫突', insertion: '肩胛骨上角', action: '肩胛上提與下旋', nerve: '肩胛背神經 (C5)、C3–C4',
  },
  rhomboids: {
    name: '菱形肌', latin: 'Rhomboids', group: 'trunk',
    path: [[0.012, 1.344, -0.090], [0.050, 1.328, -0.084], [0.090, 1.312, -0.074]], r: 0.017,
    origin: 'C7–T5棘突', insertion: '肩胛骨內緣', action: '肩胛後縮、下旋', nerve: '肩胛背神經 (C5)',
  },
  serratus_anterior: {
    name: '前鋸肌', latin: 'Serratus anterior', group: 'trunk',
    path: [[0.152, 1.188, 0.048], [0.166, 1.238, 0.018], [0.142, 1.286, -0.020]], r: 0.015,
    origin: '第1–9肋外側面', insertion: '肩胛骨內緣前面', action: '肩胛前突與上旋（拳擊肌）', nerve: '胸長神經 (C5–C7)',
  },
  pec_major_clav: {
    name: '胸大肌（鎖骨部）', latin: 'Pectoralis major (clavicular)', group: 'trunk',
    path: [[0.054, 1.406, 0.076], [0.130, 1.400, 0.054], [0.194, 1.384, 0.016]], r: 0.016,
    origin: '鎖骨內側半', insertion: '肱骨大結節嵴', action: '肩屈曲、水平內收、內旋', nerve: '胸外側神經 (C5–C7)',
  },
  pec_major_sternal: {
    name: '胸大肌（胸骨部）', latin: 'Pectoralis major (sternal)', group: 'trunk',
    path: [[0.020, 1.268, 0.096], [0.102, 1.312, 0.080], [0.190, 1.374, 0.020]], r: 0.021,
    origin: '胸骨與上6肋軟骨', insertion: '肱骨大結節嵴', action: '肩內收、內旋、由上往下拉', nerve: '胸內外側神經 (C6–T1)',
  },
  pec_minor: {
    name: '胸小肌', latin: 'Pectoralis minor', group: 'trunk', deep: true,
    path: [[0.074, 1.288, 0.086], [0.110, 1.334, 0.068], [0.140, 1.374, 0.044]], r: 0.011,
    origin: '第3–5肋', insertion: '肩胛骨喙突', action: '肩胛前突與下壓（PNF 前下壓的主角）', nerve: '胸內側神經 (C8–T1)',
  },
  intercostals: {
    name: '肋間肌', latin: 'Intercostals', group: 'trunk', deep: true,
    path: [[0.058, 1.292, 0.088], [0.110, 1.266, 0.068], [0.150, 1.234, 0.028]], r: 0.009,
    origin: '肋骨下緣', insertion: '下位肋骨上緣', action: '呼吸時穩定與活動胸廓', nerve: '肋間神經',
  },
  latissimus: {
    name: '闊背肌', latin: 'Latissimus dorsi', group: 'trunk',
    path: [[0.020, 1.055, -0.086], [0.090, 1.160, -0.086], [0.150, 1.300, -0.048], [0.186, 1.360, -0.008]], r: 0.022,
    origin: 'T7以下棘突、胸腰筋膜、髂嵴', insertion: '肱骨結節間溝', action: '肩伸展、內收、內旋', nerve: '胸背神經 (C6–C8)',
  },
  erector_spinae: {
    name: '豎脊肌', latin: 'Erector spinae', group: 'trunk',
    path: [[0.032, 1.418, -0.080], [0.036, 1.200, -0.092], [0.038, 1.020, -0.082], [0.030, 0.930, -0.072]], r: 0.019,
    origin: '骶骨、髂嵴、腰椎棘突', insertion: '肋骨、胸腰椎橫突與棘突', action: '脊柱伸展、側屈；離心控制前彎', nerve: '脊神經後枝',
  },
  multifidus: {
    name: '多裂肌', latin: 'Multifidus', group: 'trunk', deep: true,
    path: [[0.018, 1.280, -0.086], [0.020, 1.100, -0.080], [0.018, 0.950, -0.070]], r: 0.010,
    origin: '骶骨、乳突與橫突', insertion: '上2–4節棘突', action: '節段性穩定，核心控制關鍵', nerve: '脊神經後枝',
  },
  quadratus_lumborum: {
    name: '腰方肌', latin: 'Quadratus lumborum', group: 'trunk', deep: true,
    path: [[0.050, 1.100, -0.068], [0.058, 1.020, -0.066], [0.062, 0.952, -0.058]], r: 0.013,
    origin: '髂嵴後部', insertion: '第12肋與L1–L4橫突', action: '腰椎側屈、骨盆上提（hip hiking）', nerve: 'T12–L4',
  },
  rectus_abdominis: {
    name: '腹直肌', latin: 'Rectus abdominis', group: 'trunk',
    path: [[0.032, 1.186, 0.092], [0.034, 1.080, 0.095], [0.032, 0.952, 0.086]], r: 0.021,
    origin: '恥骨嵴與恥骨聯合', insertion: '第5–7肋軟骨、劍突', action: '軀幹屈曲、骨盆後傾', nerve: '肋間神經 T7–T12',
  },
  obliques: {
    name: '腹內外斜肌', latin: 'Obliquus externus / internus', group: 'trunk',
    path: [[0.116, 1.186, 0.052], [0.126, 1.088, 0.060], [0.088, 0.978, 0.078]], r: 0.019,
    origin: '下位肋骨 / 髂嵴與胸腰筋膜', insertion: '腹白線、髂嵴 / 下位肋軟骨', action: '軀幹旋轉與側屈，PNF 砍劈的軀幹成分', nerve: '肋間神經 T7–T12、髂腹下神經',
  },
  transversus: {
    name: '腹橫肌', latin: 'Transversus abdominis', group: 'trunk', deep: true,
    path: [[0.120, 1.086, 0.044], [0.070, 1.056, 0.076], [0.020, 1.046, 0.090]], r: 0.012,
    origin: '髂嵴、胸腰筋膜、下6肋軟骨', insertion: '腹白線與恥骨', action: '收束腹壁、提高腹內壓（深層穩定）', nerve: 'T7–T12、L1',
  },

  // ===== 肩胛帶 =====
  deltoid_anterior: {
    name: '三角肌前束', latin: 'Deltoid (anterior)', group: 'shoulder',
    path: [[0.164, 1.428, 0.044], [0.196, 1.376, 0.040], [0.222, 1.310, 0.020]], r: 0.017,
    origin: '鎖骨外1/3', insertion: '肱骨三角肌粗隆', action: '肩屈曲、水平內收、內旋', nerve: '腋神經 (C5–C6)',
  },
  deltoid_middle: {
    name: '三角肌中束', latin: 'Deltoid (middle)', group: 'shoulder',
    path: [[0.192, 1.446, 0.000], [0.222, 1.386, 0.004], [0.228, 1.306, 0.008]], r: 0.018,
    origin: '肩峰', insertion: '肱骨三角肌粗隆', action: '肩外展', nerve: '腋神經 (C5–C6)',
  },
  deltoid_posterior: {
    name: '三角肌後束', latin: 'Deltoid (posterior)', group: 'shoulder',
    path: [[0.160, 1.426, -0.048], [0.198, 1.376, -0.034], [0.225, 1.310, -0.006]], r: 0.017,
    origin: '肩胛岡', insertion: '肱骨三角肌粗隆', action: '肩伸展、水平外展、外旋', nerve: '腋神經 (C5–C6)',
  },
  supraspinatus: {
    name: '棘上肌', latin: 'Supraspinatus', group: 'shoulder', deep: true,
    path: [[0.064, 1.396, -0.076], [0.130, 1.426, -0.048], [0.184, 1.436, -0.008]], r: 0.011,
    origin: '肩胛骨棘上窩', insertion: '肱骨大結節上面', action: '起始外展、穩定肱骨頭', nerve: '肩胛上神經 (C5–C6)',
  },
  infraspinatus: {
    name: '棘下肌', latin: 'Infraspinatus', group: 'shoulder',
    path: [[0.070, 1.298, -0.086], [0.130, 1.344, -0.070], [0.184, 1.398, -0.022]], r: 0.015,
    origin: '肩胛骨棘下窩', insertion: '肱骨大結節中面', action: '肩外旋、後方穩定', nerve: '肩胛上神經 (C5–C6)',
  },
  teres_minor: {
    name: '小圓肌', latin: 'Teres minor', group: 'shoulder',
    path: [[0.114, 1.294, -0.078], [0.154, 1.344, -0.054], [0.188, 1.390, -0.022]], r: 0.010,
    origin: '肩胛骨外緣上部', insertion: '肱骨大結節下面', action: '肩外旋、內收', nerve: '腋神經 (C5–C6)',
  },
  teres_major: {
    name: '大圓肌', latin: 'Teres major', group: 'shoulder',
    path: [[0.104, 1.258, -0.080], [0.150, 1.310, -0.058], [0.188, 1.358, -0.008]], r: 0.013,
    origin: '肩胛骨下角', insertion: '肱骨結節間溝內唇', action: '肩內收、內旋、伸展', nerve: '肩胛下神經 (C5–C6)',
  },
  subscapularis: {
    name: '肩胛下肌', latin: 'Subscapularis', group: 'shoulder', deep: true,
    path: [[0.100, 1.318, -0.052], [0.144, 1.354, -0.028], [0.186, 1.390, 0.000]], r: 0.012,
    origin: '肩胛下窩', insertion: '肱骨小結節', action: '肩內旋、前方穩定', nerve: '肩胛下神經 (C5–C6)',
  },
  coracobrachialis: {
    name: '喙肱肌', latin: 'Coracobrachialis', group: 'shoulder',
    path: [[0.168, 1.386, 0.030], [0.196, 1.330, 0.028], [0.218, 1.272, 0.022]], r: 0.011,
    origin: '肩胛骨喙突', insertion: '肱骨中段內側', action: '肩屈曲、內收', nerve: '肌皮神經 (C5–C7)',
  },

  // ===== 上臂 =====
  biceps: {
    name: '肱二頭肌', latin: 'Biceps brachii', group: 'arm',
    path: [[0.182, 1.400, 0.030], [0.208, 1.310, 0.042], [0.232, 1.214, 0.038], [0.246, 1.174, 0.030]], r: 0.019,
    origin: '長頭：盂上結節；短頭：喙突', insertion: '橈骨粗隆與二頭肌腱膜', action: '屈肘、前臂旋後、肩屈曲', nerve: '肌皮神經 (C5–C6)',
  },
  brachialis: {
    name: '肱肌', latin: 'Brachialis', group: 'arm', deep: true,
    path: [[0.212, 1.300, 0.028], [0.232, 1.234, 0.030], [0.246, 1.186, 0.028]], r: 0.014,
    origin: '肱骨前面下半', insertion: '尺骨粗隆', action: '純粹屈肘（不受旋前旋後影響）', nerve: '肌皮神經 (C5–C6)',
  },
  triceps: {
    name: '肱三頭肌', latin: 'Triceps brachii', group: 'arm',
    path: [[0.190, 1.404, -0.022], [0.212, 1.310, -0.032], [0.238, 1.214, -0.030], [0.248, 1.166, -0.022]], r: 0.019,
    origin: '長頭：盂下結節；內外側頭：肱骨後面', insertion: '尺骨鷹嘴', action: '伸肘、長頭參與肩伸展', nerve: '橈神經 (C6–C8)',
  },
  anconeus: {
    name: '肘肌', latin: 'Anconeus', group: 'arm',
    path: [[0.244, 1.162, -0.022], [0.256, 1.138, -0.018]], r: 0.009,
    origin: '肱骨外上髁後面', insertion: '尺骨鷹嘴外側', action: '協助伸肘、穩定肘關節', nerve: '橈神經 (C7–C8)',
  },

  // ===== 前臂與手 =====
  brachioradialis: {
    name: '肱橈肌', latin: 'Brachioradialis', group: 'forearm',
    path: [[0.243, 1.206, 0.018], [0.262, 1.110, 0.028], [0.283, 0.966, 0.022]], r: 0.013,
    origin: '肱骨外上髁上嵴', insertion: '橈骨莖突', action: '中立位屈肘', nerve: '橈神經 (C5–C6)',
  },
  pronator_teres: {
    name: '旋前圓肌', latin: 'Pronator teres', group: 'forearm',
    path: [[0.232, 1.154, 0.028], [0.248, 1.116, 0.034], [0.264, 1.090, 0.028]], r: 0.011,
    origin: '肱骨內上髁與尺骨喙突', insertion: '橈骨外側中段', action: '前臂旋前、協助屈肘', nerve: '正中神經 (C6–C7)',
  },
  pronator_quadratus: {
    name: '旋前方肌', latin: 'Pronator quadratus', group: 'forearm', deep: true,
    path: [[0.271, 0.960, 0.028], [0.288, 0.952, 0.024]], r: 0.009,
    origin: '尺骨遠端前面', insertion: '橈骨遠端前面', action: '前臂旋前（主要作用肌）', nerve: '正中神經骨間前枝 (C8–T1)',
  },
  supinator: {
    name: '旋後肌', latin: 'Supinator', group: 'forearm', deep: true,
    path: [[0.250, 1.146, 0.004], [0.262, 1.116, 0.018], [0.268, 1.090, 0.026]], r: 0.010,
    origin: '肱骨外上髁、尺骨旋後肌嵴', insertion: '橈骨近端外側', action: '前臂旋後', nerve: '橈神經深枝 (C5–C6)',
  },
  fcr: {
    name: '橈側屈腕肌', latin: 'Flexor carpi radialis', group: 'forearm',
    path: [[0.234, 1.152, 0.032], [0.258, 1.060, 0.038], [0.283, 0.946, 0.030]], r: 0.011,
    origin: '肱骨內上髁', insertion: '第2、3掌骨基底', action: '屈腕、橈偏', nerve: '正中神經 (C6–C7)',
  },
  palmaris_longus: {
    name: '掌長肌', latin: 'Palmaris longus', group: 'forearm',
    path: [[0.233, 1.148, 0.035], [0.256, 1.050, 0.041], [0.282, 0.940, 0.034]], r: 0.008,
    origin: '肱骨內上髁', insertion: '掌腱膜', action: '屈腕、緊張掌腱膜（內關、大陵的定位標誌）', nerve: '正中神經 (C7–C8)',
  },
  fcu: {
    name: '尺側屈腕肌', latin: 'Flexor carpi ulnaris', group: 'forearm',
    path: [[0.228, 1.150, 0.022], [0.248, 1.050, 0.032], [0.270, 0.936, 0.030]], r: 0.011,
    origin: '肱骨內上髁與尺骨鷹嘴', insertion: '豌豆骨、鉤骨、第5掌骨', action: '屈腕、尺偏', nerve: '尺神經 (C7–T1)',
  },
  fds: {
    name: '屈指淺肌', latin: 'Flexor digitorum superficialis', group: 'forearm', deep: true,
    path: [[0.234, 1.144, 0.034], [0.258, 1.050, 0.042], [0.281, 0.946, 0.034]], r: 0.012,
    origin: '內上髁、尺骨與橈骨前面', insertion: '第2–5指中節指骨', action: '屈近端指間關節', nerve: '正中神經 (C7–T1)',
  },
  fdp: {
    name: '屈指深肌', latin: 'Flexor digitorum profundus', group: 'forearm', deep: true,
    path: [[0.240, 1.128, 0.030], [0.260, 1.040, 0.038], [0.280, 0.946, 0.032]], r: 0.011,
    origin: '尺骨前內側面與骨間膜', insertion: '第2–5指遠節指骨', action: '屈遠端指間關節', nerve: '正中神經＋尺神經 (C8–T1)',
  },
  ecrl: {
    name: '橈側伸腕長肌', latin: 'Extensor carpi radialis longus', group: 'forearm',
    path: [[0.246, 1.186, 0.008], [0.266, 1.090, 0.014], [0.288, 0.956, 0.010]], r: 0.012,
    origin: '肱骨外上髁上嵴', insertion: '第2掌骨基底', action: '伸腕、橈偏（網球肘好發）', nerve: '橈神經 (C6–C7)',
  },
  ecrb: {
    name: '橈側伸腕短肌', latin: 'Extensor carpi radialis brevis', group: 'forearm',
    path: [[0.248, 1.166, 0.002], [0.268, 1.080, 0.008], [0.289, 0.950, 0.005]], r: 0.010,
    origin: '肱骨外上髁', insertion: '第3掌骨基底', action: '伸腕（外上髁炎主要受累）', nerve: '橈神經深枝 (C7–C8)',
  },
  edc: {
    name: '伸指總肌', latin: 'Extensor digitorum', group: 'forearm',
    path: [[0.248, 1.156, -0.008], [0.268, 1.060, -0.002], [0.287, 0.946, 0.000]], r: 0.012,
    origin: '肱骨外上髁', insertion: '第2–5指伸肌腱膜', action: '伸指、協助伸腕', nerve: '橈神經深枝 (C7–C8)',
  },
  ecu: {
    name: '尺側伸腕肌', latin: 'Extensor carpi ulnaris', group: 'forearm',
    path: [[0.243, 1.146, -0.018], [0.260, 1.050, -0.012], [0.276, 0.940, -0.006]], r: 0.010,
    origin: '肱骨外上髁與尺骨後緣', insertion: '第5掌骨基底', action: '伸腕、尺偏', nerve: '橈神經深枝 (C7–C8)',
  },
  apl_epb: {
    name: '外展拇長／伸拇短肌', latin: 'Abductor pollicis longus / Ext. pollicis brevis', group: 'forearm',
    path: [[0.262, 1.020, -0.004], [0.278, 0.976, 0.006], [0.295, 0.940, 0.014]], r: 0.009,
    origin: '橈尺骨後面與骨間膜', insertion: '第1掌骨與拇指近節指骨', action: '外展與伸拇（狹窄性腱鞘炎好發）', nerve: '橈神經深枝 (C7–C8)',
  },
  thenar: {
    name: '魚際肌群', latin: 'Thenar muscles', group: 'forearm',
    path: [[0.294, 0.892, 0.028], [0.304, 0.868, 0.032], [0.310, 0.852, 0.032]], r: 0.011,
    origin: '屈肌支持帶、舟狀骨、大多角骨', insertion: '拇指近節指骨', action: '拇指外展、對掌', nerve: '正中神經 (C8–T1)',
  },
  hypothenar: {
    name: '小魚際肌群', latin: 'Hypothenar muscles', group: 'forearm',
    path: [[0.276, 0.895, 0.026], [0.282, 0.868, 0.030], [0.286, 0.850, 0.030]], r: 0.010,
    origin: '豌豆骨、鉤骨鉤', insertion: '第5指近節指骨', action: '小指外展與對掌', nerve: '尺神經 (C8–T1)',
  },
  fdi_hand: {
    name: '第一背側骨間肌', latin: 'First dorsal interosseous', group: 'forearm',
    path: [[0.306, 0.884, 0.014], [0.316, 0.866, 0.020]], r: 0.008,
    origin: '第1、2掌骨相對面', insertion: '食指近節指骨橈側', action: '食指外展（合谷所在）', nerve: '尺神經深枝 (C8–T1)',
  },

  // ===== 髖與大腿 =====
  iliopsoas: {
    name: '髂腰肌', latin: 'Iliopsoas', group: 'hip', deep: true,
    path: [[0.038, 1.076, -0.028], [0.060, 0.990, 0.010], [0.085, 0.916, 0.044]], r: 0.016,
    origin: 'T12–L5椎體橫突、髂窩', insertion: '股骨小轉子', action: '髖屈曲、外旋；腰椎前彎控制', nerve: '腰叢 (L1–L3)、股神經',
  },
  gluteus_maximus: {
    name: '臀大肌', latin: 'Gluteus maximus', group: 'hip',
    path: [[0.024, 0.976, -0.074], [0.076, 0.926, -0.084], [0.116, 0.856, -0.054]], r: 0.028,
    origin: '髂骨後面、骶尾骨、薦結節韌帶', insertion: '髂脛束與臀肌粗隆', action: '髖伸展、外旋（PNF 下肢伸展模式主力）', nerve: '臀下神經 (L5–S2)',
  },
  gluteus_medius: {
    name: '臀中肌', latin: 'Gluteus medius', group: 'hip',
    path: [[0.074, 0.986, -0.044], [0.106, 0.954, -0.024], [0.118, 0.906, -0.004]], r: 0.019,
    origin: '髂骨外面', insertion: '股骨大轉子外側', action: '髖外展、單腳站骨盆穩定', nerve: '臀上神經 (L4–S1)',
  },
  gluteus_minimus: {
    name: '臀小肌', latin: 'Gluteus minimus', group: 'hip', deep: true,
    path: [[0.078, 0.970, -0.030], [0.106, 0.944, -0.012], [0.117, 0.908, 0.000]], r: 0.013,
    origin: '髂骨外面前部', insertion: '股骨大轉子前面', action: '髖外展、內旋', nerve: '臀上神經 (L4–S1)',
  },
  piriformis: {
    name: '梨狀肌', latin: 'Piriformis', group: 'hip', deep: true,
    path: [[0.028, 0.928, -0.062], [0.070, 0.916, -0.044], [0.112, 0.896, -0.018]], r: 0.011,
    origin: '骶骨前面', insertion: '股骨大轉子上緣', action: '髖外旋（屈髖時轉為外展）；坐骨神經穿行處', nerve: '骶叢 (S1–S2)',
  },
  tfl: {
    name: '闊筋膜張肌', latin: 'Tensor fasciae latae', group: 'hip',
    path: [[0.108, 0.956, 0.028], [0.122, 0.900, 0.018], [0.128, 0.846, 0.004]], r: 0.014,
    origin: '髂前上棘與髂嵴前部', insertion: '髂脛束', action: '髖屈曲、外展、內旋', nerve: '臀上神經 (L4–S1)',
  },
  itb: {
    name: '髂脛束', latin: 'Iliotibial band', group: 'hip',
    path: [[0.128, 0.846, 0.004], [0.134, 0.700, 0.006], [0.126, 0.548, 0.014]], r: 0.009,
    origin: '闊筋膜張肌與臀大肌腱膜', insertion: '脛骨外髁 Gerdy 結節', action: '傳遞外展張力、外側穩定（風市、膝陽關循行）', nerve: '（腱膜結構）',
  },
  sartorius: {
    name: '縫匠肌', latin: 'Sartorius', group: 'hip',
    path: [[0.106, 0.936, 0.044], [0.096, 0.800, 0.062], [0.072, 0.600, 0.034], [0.062, 0.536, 0.012]], r: 0.011,
    origin: '髂前上棘', insertion: '脛骨近端內側（鵝足）', action: '髖屈曲外展外旋＋屈膝（盤腿肌）', nerve: '股神經 (L2–L3)',
  },
  pectineus: {
    name: '恥骨肌', latin: 'Pectineus', group: 'hip', deep: true,
    path: [[0.044, 0.936, 0.044], [0.062, 0.902, 0.030], [0.075, 0.866, 0.014]], r: 0.011,
    origin: '恥骨上枝', insertion: '股骨恥骨肌線', action: '髖內收、屈曲', nerve: '股神經 (L2–L3)',
  },
  adductors: {
    name: '內收肌群', latin: 'Adductor longus / brevis / magnus', group: 'hip',
    path: [[0.044, 0.926, 0.028], [0.062, 0.800, 0.020], [0.076, 0.642, 0.014]], r: 0.024,
    origin: '恥骨下枝與坐骨枝', insertion: '股骨粗線與內收肌結節', action: '髖內收，大收肌後部協助伸髖', nerve: '閉孔神經 (L2–L4)',
  },
  gracilis: {
    name: '股薄肌', latin: 'Gracilis', group: 'hip',
    path: [[0.038, 0.926, 0.020], [0.048, 0.750, 0.012], [0.058, 0.546, 0.004]], r: 0.011,
    origin: '恥骨下枝', insertion: '脛骨近端內側（鵝足）', action: '髖內收、屈膝', nerve: '閉孔神經 (L2–L3)',
  },
  quadriceps_rf: {
    name: '股直肌', latin: 'Rectus femoris', group: 'hip',
    path: [[0.098, 0.926, 0.050], [0.098, 0.780, 0.066], [0.094, 0.620, 0.062], [0.090, 0.546, 0.050]], r: 0.022,
    origin: '髂前下棘', insertion: '髕骨、脛骨粗隆', action: '伸膝＋屈髖（唯一跨兩關節的股四頭）', nerve: '股神經 (L2–L4)',
  },
  vastus_lateralis: {
    name: '股外側肌', latin: 'Vastus lateralis', group: 'hip',
    path: [[0.118, 0.856, 0.020], [0.122, 0.720, 0.038], [0.110, 0.586, 0.050]], r: 0.021,
    origin: '股骨大轉子與粗線外唇', insertion: '髕骨外緣', action: '伸膝', nerve: '股神經 (L2–L4)',
  },
  vastus_medialis: {
    name: '股內側肌', latin: 'Vastus medialis', group: 'hip',
    path: [[0.078, 0.720, 0.030], [0.070, 0.626, 0.048], [0.072, 0.560, 0.052]], r: 0.018,
    origin: '股骨粗線內唇', insertion: '髕骨內緣', action: '伸膝、末端伸直與髕骨內側穩定（血海所在）', nerve: '股神經 (L2–L4)',
  },
  vastus_intermedius: {
    name: '股中間肌', latin: 'Vastus intermedius', group: 'hip', deep: true,
    path: [[0.098, 0.820, 0.044], [0.098, 0.680, 0.054], [0.094, 0.576, 0.050]], r: 0.016,
    origin: '股骨前外側面', insertion: '髕骨上緣', action: '伸膝', nerve: '股神經 (L2–L4)',
  },
  biceps_femoris: {
    name: '股二頭肌', latin: 'Biceps femoris', group: 'hip',
    path: [[0.088, 0.916, -0.054], [0.106, 0.750, -0.062], [0.118, 0.576, -0.044], [0.122, 0.526, -0.026]], r: 0.019,
    origin: '長頭：坐骨結節；短頭：股骨粗線', insertion: '腓骨頭', action: '屈膝、伸髖、脛骨外旋', nerve: '坐骨神經 (L5–S2)',
  },
  semi_group: {
    name: '半腱／半膜肌', latin: 'Semitendinosus / Semimembranosus', group: 'hip',
    path: [[0.070, 0.916, -0.056], [0.070, 0.750, -0.062], [0.066, 0.576, -0.046], [0.062, 0.526, -0.028]], r: 0.019,
    origin: '坐骨結節', insertion: '脛骨近端內側', action: '屈膝、伸髖、脛骨內旋（陰谷、委中內側界）', nerve: '坐骨神經 (L5–S2)',
  },
  popliteus: {
    name: '膕肌', latin: 'Popliteus', group: 'hip', deep: true,
    path: [[0.076, 0.502, -0.034], [0.098, 0.478, -0.024]], r: 0.009,
    origin: '股骨外髁外側面', insertion: '脛骨後面近端', action: '解鎖伸直的膝關節（脛骨內旋）', nerve: '脛神經 (L4–S1)',
  },

  // ===== 小腿與足 =====
  tibialis_anterior: {
    name: '脛前肌', latin: 'Tibialis anterior', group: 'leg',
    path: [[0.104, 0.470, 0.042], [0.104, 0.310, 0.048], [0.094, 0.166, 0.052], [0.090, 0.116, 0.056]], r: 0.015,
    origin: '脛骨外側面上2/3', insertion: '內楔骨與第1蹠骨基底', action: '踝背屈、內翻（垂足關鍵肌、足三里所在）', nerve: '腓深神經 (L4–L5)',
  },
  edl_leg: {
    name: '伸趾長肌', latin: 'Extensor digitorum longus', group: 'leg',
    path: [[0.112, 0.456, 0.032], [0.112, 0.300, 0.040], [0.100, 0.156, 0.048]], r: 0.011,
    origin: '腓骨前面與脛骨外髁', insertion: '第2–5趾伸肌腱膜', action: '伸趾、踝背屈', nerve: '腓深神經 (L5–S1)',
  },
  ehl: {
    name: '伸拇長肌', latin: 'Extensor hallucis longus', group: 'leg', deep: true,
    path: [[0.106, 0.336, 0.036], [0.098, 0.200, 0.046], [0.090, 0.100, 0.062]], r: 0.009,
    origin: '腓骨前面中段', insertion: '拇趾遠節趾骨', action: '伸拇趾、踝背屈（解溪定位標誌）', nerve: '腓深神經 (L5–S1)',
  },
  peroneus_longus: {
    name: '腓骨長肌', latin: 'Peroneus longus', group: 'leg',
    path: [[0.118, 0.462, 0.010], [0.122, 0.320, 0.004], [0.116, 0.166, -0.006], [0.112, 0.108, -0.012]], r: 0.012,
    origin: '腓骨頭與腓骨外側面上2/3', insertion: '內楔骨與第1蹠骨基底（繞足底）', action: '踝外翻、蹠屈（陽陵泉下方）', nerve: '腓淺神經 (L5–S1)',
  },
  peroneus_brevis: {
    name: '腓骨短肌', latin: 'Peroneus brevis', group: 'leg',
    path: [[0.118, 0.320, 0.000], [0.116, 0.190, -0.004], [0.112, 0.112, -0.008]], r: 0.009,
    origin: '腓骨外側面下2/3', insertion: '第5蹠骨粗隆', action: '踝外翻', nerve: '腓淺神經 (L5–S1)',
  },
  peroneus_tertius: {
    name: '第三腓骨肌', latin: 'Peroneus tertius', group: 'leg',
    path: [[0.114, 0.216, 0.028], [0.108, 0.146, 0.040], [0.104, 0.098, 0.050]], r: 0.008,
    origin: '腓骨前面下1/3', insertion: '第5蹠骨基底背面', action: '踝背屈＋外翻', nerve: '腓深神經 (L5–S1)',
  },
  gastrocnemius: {
    name: '腓腸肌', latin: 'Gastrocnemius', group: 'leg',
    path: [[0.074, 0.506, -0.038], [0.088, 0.416, -0.054], [0.098, 0.316, -0.054], [0.098, 0.232, -0.040]], r: 0.022,
    origin: '股骨內外髁後面', insertion: '跟骨（經跟腱）', action: '踝蹠屈、屈膝（跨兩關節）', nerve: '脛神經 (S1–S2)',
  },
  soleus: {
    name: '比目魚肌', latin: 'Soleus', group: 'leg',
    path: [[0.098, 0.376, -0.044], [0.100, 0.256, -0.042], [0.098, 0.176, -0.032]], r: 0.018,
    origin: '腓骨頭後面與脛骨比目魚肌線', insertion: '跟骨（經跟腱）', action: '踝蹠屈、站姿姿勢維持', nerve: '脛神經 (S1–S2)',
  },
  achilles: {
    name: '跟腱', latin: 'Calcaneal (Achilles) tendon', group: 'leg',
    path: [[0.098, 0.200, -0.036], [0.096, 0.130, -0.040], [0.095, 0.056, -0.050]], r: 0.009,
    origin: '腓腸肌與比目魚肌', insertion: '跟骨後面', action: '傳遞蹠屈力（崑崙、太溪的定位標誌）', nerve: '（腱組織）',
  },
  tibialis_posterior: {
    name: '脛後肌', latin: 'Tibialis posterior', group: 'leg', deep: true,
    path: [[0.090, 0.402, -0.024], [0.084, 0.256, -0.022], [0.074, 0.136, -0.012]], r: 0.011,
    origin: '脛腓骨後面與骨間膜', insertion: '舟狀骨與楔骨', action: '踝內翻、蹠屈、支撐足弓', nerve: '脛神經 (L4–L5)',
  },
  fhl_fdl: {
    name: '屈拇長／屈趾長肌', latin: 'FHL / FDL', group: 'leg', deep: true,
    path: [[0.094, 0.352, -0.030], [0.086, 0.226, -0.026], [0.074, 0.122, -0.008]], r: 0.010,
    origin: '腓骨與脛骨後面', insertion: '拇趾與第2–5趾遠節趾骨', action: '屈趾、蹠屈、推進期抓地', nerve: '脛神經 (L5–S2)',
  },
  abductor_hallucis: {
    name: '外展拇肌', latin: 'Abductor hallucis', group: 'leg',
    path: [[0.070, 0.028, 0.010], [0.072, 0.022, 0.076], [0.078, 0.020, 0.136]], r: 0.010,
    origin: '跟骨結節內側', insertion: '拇趾近節趾骨內側', action: '外展拇趾、支撐內側縱弓（太白、公孫所在）', nerve: '足底內側神經 (S1–S2)',
  },
  plantar_intrinsics: {
    name: '足底內在肌群', latin: 'Plantar intrinsic muscles', group: 'leg',
    path: [[0.096, 0.016, -0.018], [0.098, 0.012, 0.060], [0.098, 0.012, 0.136]], r: 0.012,
    origin: '跟骨與足底腱膜', insertion: '各趾近節趾骨', action: '維持足弓、細部平衡（湧泉所在）', nerve: '足底內／外側神經',
  },
};
