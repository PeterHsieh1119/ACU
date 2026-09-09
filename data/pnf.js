// PNF 對角模式資料
//
// 依 Voss/Knott 傳統與《PNF in Practice》(Adler, Beckers & Buck) 之主要肌肉成分整理。
// muscles 對應 data/muscles.js 的 id；相關穴位由程式依「穴位.muscles ∩ 模式.muscles」自動推得。
// pair 指向拮抗（反向）模式，便於做動態反轉（dynamic reversals）的對照。

export const PNF_REGIONS = {
  UE: '上肢',
  LE: '下肢',
  SC: '肩胛',
  PV: '骨盆',
  NK: '頭頸',
  CB: '綜合模式',
};

export const PNF_PATTERNS = [
  // ===== 上肢 =====
  {
    id: 'UE_D1F', regionKey: 'UE', region: '上肢', name: 'D1 屈曲（上肢）', pair: 'UE_D1E',
    motion: '肩：屈曲–內收–外旋｜肩胛：前上提｜前臂：旋後｜腕：橈側屈曲｜指：屈曲',
    cue: '像「持劍上撩」— 手由同側髖外側往對側耳的方向劃過',
    grip: '握住掌側與拇指側，另一手扶前臂遠端內側',
    clinical: '進食、梳對側頭髮、繫安全帶；腦中風患者常缺此模式的旋後與橈側屈曲成分',
    technique: '節律性起始、等張組合、收縮–放鬆（針對旋後受限）',
    muscles: ['serratus_anterior', 'trapezius_upper', 'deltoid_anterior', 'pec_major_clav', 'coracobrachialis', 'biceps', 'brachialis', 'supinator', 'fcr', 'fds', 'thenar'],
  },
  {
    id: 'UE_D1E', regionKey: 'UE', region: '上肢', name: 'D1 伸展（上肢）', pair: 'UE_D1F',
    motion: '肩：伸展–外展–內旋｜肩胛：後下壓｜前臂：旋前｜腕：尺側伸展｜指：伸展',
    cue: '像「拉手煞車」— 手由對側耳往同側髖外側劃下',
    grip: '握住手背尺側，另一手托上臂後外側',
    clinical: '推門、撐床起身、輪椅推進；肩胛後下壓成分對圓肩姿勢特別有價值',
    technique: '動態反轉、穩定性反轉、等張組合',
    muscles: ['rhomboids', 'trapezius_lower', 'deltoid_posterior', 'latissimus', 'teres_major', 'subscapularis', 'triceps', 'pronator_teres', 'ecu', 'edc'],
  },
  {
    id: 'UE_D2F', regionKey: 'UE', region: '上肢', name: 'D2 屈曲（上肢）', pair: 'UE_D2E',
    motion: '肩：屈曲–外展–外旋｜肩胛：後上提｜前臂：旋後｜腕：橈側伸展｜指：伸展',
    cue: '像「拔劍出鞘」— 手由對側髖往同側頭上外側劃開',
    grip: '握住手背橈側，另一手扶上臂外側',
    clinical: '伸手取高架物品、梳同側頭髮、游泳自由式出手；肩夾擠患者常在此模式受限',
    technique: '重複牽張、等張組合、收縮–放鬆（針對外旋受限）',
    muscles: ['trapezius_upper', 'trapezius_middle', 'levator_scapulae', 'deltoid_anterior', 'deltoid_middle', 'supraspinatus', 'infraspinatus', 'teres_minor', 'supinator', 'ecrl', 'ecrb', 'edc'],
  },
  {
    id: 'UE_D2E', regionKey: 'UE', region: '上肢', name: 'D2 伸展（上肢）', pair: 'UE_D2F',
    motion: '肩：伸展–內收–內旋｜肩胛：前下壓｜前臂：旋前｜腕：尺側屈曲｜指：屈曲',
    cue: '像「收劍入鞘」— 手由同側頭上外側往對側髖劃回',
    grip: '握住掌側尺側，另一手扶上臂前內側',
    clinical: '扣安全帶、把物品放到對側口袋、投擲的收尾期',
    technique: '動態反轉、節律性穩定',
    muscles: ['pec_minor', 'serratus_anterior', 'pec_major_sternal', 'subscapularis', 'teres_major', 'latissimus', 'pronator_teres', 'pronator_quadratus', 'fcu', 'fds'],
  },

  // ===== 下肢 =====
  {
    id: 'LE_D1F', regionKey: 'LE', region: '下肢', name: 'D1 屈曲（下肢）', pair: 'LE_D1E',
    motion: '髖：屈曲–內收–外旋｜踝：背屈–內翻｜趾：伸展（膝可屈可伸）',
    cue: '腳跟朝對側肩的方向抬起，足內緣上翻',
    grip: '握足背內側，另一手扶大腿前內側',
    clinical: '上車跨腿、翻身起始、步態擺盪初期；足背屈內翻成分是垂足訓練重點',
    technique: '節律性起始、等張組合、重複牽張',
    muscles: ['iliopsoas', 'adductors', 'pectineus', 'sartorius', 'quadriceps_rf', 'tibialis_anterior', 'ehl'],
  },
  {
    id: 'LE_D1E', regionKey: 'LE', region: '下肢', name: 'D1 伸展（下肢）', pair: 'LE_D1F',
    motion: '髖：伸展–外展–內旋｜踝：蹠屈–外翻｜趾：屈曲',
    cue: '腿向後外側踩下，足外緣下壓',
    grip: '托足底外側，另一手扶大腿後外側',
    clinical: '站起、上階、步態推進期；臀中肌與腓骨肌的協同是踝扭傷後訓練關鍵',
    technique: '動態反轉、穩定性反轉',
    muscles: ['gluteus_medius', 'gluteus_minimus', 'gluteus_maximus', 'tfl', 'gastrocnemius', 'soleus', 'peroneus_longus', 'peroneus_brevis'],
  },
  {
    id: 'LE_D2F', regionKey: 'LE', region: '下肢', name: 'D2 屈曲（下肢）', pair: 'LE_D2E',
    motion: '髖：屈曲–外展–內旋｜踝：背屈–外翻｜趾：伸展',
    cue: '腿向同側外上方抬起，足外緣上翻',
    grip: '握足背外側，另一手扶大腿前外側',
    clinical: '跨過障礙物、側向上階；髖外展內旋成分常用於加強步態擺盪期的離地',
    technique: '重複牽張、等張組合',
    muscles: ['tfl', 'gluteus_medius', 'gluteus_minimus', 'quadriceps_rf', 'tibialis_anterior', 'edl_leg', 'peroneus_tertius'],
  },
  {
    id: 'LE_D2E', regionKey: 'LE', region: '下肢', name: 'D2 伸展（下肢）', pair: 'LE_D2F',
    motion: '髖：伸展–內收–外旋｜踝：蹠屈–內翻｜趾：屈曲',
    cue: '腿向後內側踩下劃回，足內緣下壓',
    grip: '托足底內側，另一手扶大腿後內側',
    clinical: '踢球的收腿、單腳站立的內側穩定、步態末期推進',
    technique: '動態反轉、收縮–放鬆（針對內收肌緊繃）',
    muscles: ['gluteus_maximus', 'adductors', 'gracilis', 'biceps_femoris', 'semi_group', 'tibialis_posterior', 'gastrocnemius', 'fhl_fdl'],
  },

  // ===== 肩胛 =====
  {
    id: 'SC_AE', regionKey: 'SC', region: '肩胛', name: '肩胛：前上提', pair: 'SC_PD',
    motion: '肩胛沿對角向「前上方（往鼻子方向）」移動',
    cue: '把肩膀往鼻尖的方向送出去',
    grip: '雙手交疊置於肩峰前上方',
    clinical: '翻身、進食動作的近端起始；肩胛動作是上肢模式的地基',
    technique: '節律性起始、等張組合；常與上肢 D1 屈曲串連',
    muscles: ['serratus_anterior', 'trapezius_upper', 'levator_scapulae'],
  },
  {
    id: 'SC_PD', regionKey: 'SC', region: '肩胛', name: '肩胛：後下壓', pair: 'SC_AE',
    motion: '肩胛沿對角向「後下方（往對側髖）」移動',
    cue: '把肩胛骨往後下方的口袋壓進去',
    grip: '手掌置於肩胛骨內下緣',
    clinical: '撐起身體、輪椅減壓；改善圓肩與上斜方肌代償的核心練習',
    technique: '穩定性反轉、等張組合；常與上肢 D1 伸展串連',
    muscles: ['trapezius_lower', 'rhomboids', 'latissimus'],
  },
  {
    id: 'SC_PE', regionKey: 'SC', region: '肩胛', name: '肩胛：後上提', pair: 'SC_AD',
    motion: '肩胛沿對角向「後上方（往同側耳後）」移動',
    cue: '肩膀往後上方聳起，像要把耳朵靠向肩後',
    grip: '手置於肩胛岡上方與肩峰後緣',
    clinical: '伸手取後上方物品；與上肢 D2 屈曲同一條鏈',
    technique: '重複牽張、動態反轉',
    muscles: ['trapezius_upper', 'trapezius_middle', 'levator_scapulae', 'rhomboids'],
  },
  {
    id: 'SC_AD', regionKey: 'SC', region: '肩胛', name: '肩胛：前下壓', pair: 'SC_PE',
    motion: '肩胛沿對角向「前下方（往對側髖）」移動',
    cue: '肩膀往對側的褲袋方向推下去',
    grip: '手置於喙突與肩峰前下方',
    clinical: '軀幹屈曲旋轉、翻身向對側；與上肢 D2 伸展同一條鏈',
    technique: '動態反轉、節律性穩定',
    muscles: ['pec_minor', 'serratus_anterior', 'pec_major_sternal', 'obliques'],
  },

  // ===== 骨盆 =====
  {
    id: 'PV_AE', regionKey: 'PV', region: '骨盆', name: '骨盆：前上提', pair: 'PV_PD',
    motion: '骨盆沿對角向「前上方」移動（同側骨盆上提並前旋）',
    cue: '把骨盆往前上方帶，像側躺時把髖往肋骨提',
    grip: '雙手置於髂嵴前上方',
    clinical: '步態擺盪期的骨盆前旋、床上移動；側躺是最常用的訓練姿勢',
    technique: '節律性起始、等張組合',
    muscles: ['obliques', 'quadratus_lumborum', 'iliopsoas', 'rectus_abdominis'],
  },
  {
    id: 'PV_PD', regionKey: 'PV', region: '骨盆', name: '骨盆：後下壓', pair: 'PV_AE',
    motion: '骨盆沿對角向「後下方」移動（同側骨盆下壓並後旋）',
    cue: '把坐骨往腳跟的方向踩下去',
    grip: '手置於坐骨結節與髂嵴後下方',
    clinical: '站立期的承重與推進、由坐到站的骨盆控制',
    technique: '穩定性反轉、動態反轉',
    muscles: ['gluteus_maximus', 'biceps_femoris', 'semi_group', 'erector_spinae'],
  },
  {
    id: 'PV_PE', regionKey: 'PV', region: '骨盆', name: '骨盆：後上提', pair: 'PV_AD',
    motion: '骨盆沿對角向「後上方」移動',
    cue: '骨盆往後上方提，像把腰側往肋骨方向縮短',
    grip: '手置於髂嵴後上方',
    clinical: '腰方肌主導的骨盆上提（hip hiking）步態代償之再訓練',
    technique: '重複牽張、等張組合',
    muscles: ['quadratus_lumborum', 'erector_spinae', 'multifidus', 'latissimus'],
  },
  {
    id: 'PV_AD', regionKey: 'PV', region: '骨盆', name: '骨盆：前下壓', pair: 'PV_PE',
    motion: '骨盆沿對角向「前下方」移動',
    cue: '骨盆往前下方沉，像把恥骨帶向對側膝',
    grip: '手置於髂前上棘',
    clinical: '軀幹屈曲旋轉、翻身；骨盆與肩胛的相對模式構成軀幹旋轉',
    technique: '動態反轉、節律性穩定',
    muscles: ['obliques', 'rectus_abdominis', 'iliopsoas', 'adductors'],
  },

  // ===== 頭頸 =====
  {
    id: 'NK_FL', regionKey: 'NK', region: '頭頸', name: '頭頸：屈曲–側屈–旋轉（向下）', pair: 'NK_EX',
    motion: '頸椎屈曲＋向同側側屈＋向同側旋轉，眼睛先動、頭再跟隨',
    cue: '看向自己的口袋，下巴帶著頭往斜下方收',
    grip: '一手托下頜，一手扶枕部',
    clinical: '翻身與坐起的起始、吞嚥前的頭部位置；頭頸模式可用來引導整個軀幹',
    technique: '節律性起始、等張組合、收縮–放鬆',
    muscles: ['scm', 'scalenes', 'platysma', 'rectus_abdominis'],
  },
  {
    id: 'NK_EX', regionKey: 'NK', region: '頭頸', name: '頭頸：伸展–側屈–旋轉（向上）', pair: 'NK_FL',
    motion: '頸椎伸展＋向同側側屈＋向同側旋轉',
    cue: '看向斜上方的天花板角落，頭跟著視線走',
    grip: '一手扶枕部下方，一手置於下頜角',
    clinical: '由趴姿抬頭、坐姿挺直；上斜方肌與夾肌的協同是頸痛族群的重點',
    technique: '動態反轉、穩定性反轉',
    muscles: ['splenius', 'semispinalis', 'suboccipitals', 'trapezius_upper', 'levator_scapulae', 'erector_spinae'],
  },

  // ===== 綜合模式 =====
  {
    id: 'CB_CHOP', regionKey: 'CB', region: '綜合模式', name: '砍劈 Chopping（雙側上肢＋軀幹屈曲旋轉）', pair: 'CB_LIFT',
    motion: '前導手做 D1 伸展、輔助手握住前導手腕，軀幹隨之屈曲並向前導手側旋轉',
    cue: '像揮斧頭往斜下方砍，眼睛跟著手走',
    grip: '一手在前導手手背，一手引導軀幹',
    clinical: '床上翻身與坐起、由坐到站的重心轉移；把上肢模式與軀幹核心連成一條鏈',
    technique: '等張組合、動態反轉；常搭配頭頸屈曲模式',
    muscles: ['latissimus', 'teres_major', 'pec_major_sternal', 'triceps', 'obliques', 'rectus_abdominis', 'ecu', 'edc', 'trapezius_lower'],
  },
  {
    id: 'CB_LIFT', regionKey: 'CB', region: '綜合模式', name: '上舉 Lifting（雙側上肢＋軀幹伸展旋轉）', pair: 'CB_CHOP',
    motion: '前導手做 D2 屈曲、輔助手托住前導手前臂，軀幹隨之伸展並向前導手側旋轉',
    cue: '像雙手捧物往斜上方舉起，胸口打開、視線向上',
    grip: '一手在前導手手背橈側，一手托輔助手前臂',
    clinical: '由躺到坐、駝背姿勢的伸展再教育、上肢舉高功能訓練',
    technique: '重複牽張、等張組合；常搭配頭頸伸展模式',
    muscles: ['trapezius_upper', 'trapezius_middle', 'deltoid_middle', 'supraspinatus', 'infraspinatus', 'erector_spinae', 'multifidus', 'supinator', 'ecrl', 'edc'],
  },
];
