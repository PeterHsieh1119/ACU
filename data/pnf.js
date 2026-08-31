// PNF 對角模式資料（依 Voss/Knott 傳統與《PNF in Practice》之主要肌肉成分整理）
// muscles 對應 data/muscles.js 的 id；相關穴位由程式依「穴位.muscles ∩ 模式.muscles」自動推得
export const PNF_PATTERNS = [
  {
    id: 'UE_D1F', region: '上肢', name: 'D1 屈曲（上肢）',
    motion: '肩：屈曲–內收–外旋｜肩胛：前上提｜前臂：旋後｜腕：橈側屈曲｜指：屈曲',
    cue: '像「持劍上撩」— 手由同側髖外側往對側耳的方向劃過',
    muscles: ['serratus_anterior','trapezius_upper','deltoid_anterior','pec_major_clav','coracobrachialis','biceps','supinator','fcr','fds'],
  },
  {
    id: 'UE_D1E', region: '上肢', name: 'D1 伸展（上肢）',
    motion: '肩：伸展–外展–內旋｜肩胛：後下壓｜前臂：旋前｜腕：尺側伸展｜指：伸展',
    cue: '像「開車拉手剎」— 手由對側耳往同側髖外側劃下',
    muscles: ['rhomboids','deltoid_posterior','latissimus','teres_major','subscapularis','triceps','pronator_teres','ecu','edc'],
  },
  {
    id: 'UE_D2F', region: '上肢', name: 'D2 屈曲（上肢）',
    motion: '肩：屈曲–外展–外旋｜肩胛：後上提｜前臂：旋後｜腕：橈側伸展｜指：伸展',
    cue: '像「拔劍出鞘」— 手由對側髖往同側頭上外側劃開',
    muscles: ['trapezius_upper','levator_scapulae','deltoid_anterior','deltoid_middle','supraspinatus','infraspinatus','teres_minor','supinator','ecrl','edc'],
  },
  {
    id: 'UE_D2E', region: '上肢', name: 'D2 伸展（上肢）',
    motion: '肩：伸展–內收–內旋｜肩胛：前下壓｜前臂：旋前｜腕：尺側屈曲｜指：屈曲',
    cue: '像「收劍入鞘」— 手由同側頭上外側往對側髖劃回',
    muscles: ['pec_minor','serratus_anterior','pec_major_sternal','subscapularis','teres_major','pronator_teres','fcu','fds'],
  },
  {
    id: 'LE_D1F', region: '下肢', name: 'D1 屈曲（下肢）',
    motion: '髖：屈曲–內收–外旋｜踝：背屈–內翻｜趾：伸展（膝可屈可伸）',
    cue: '腳跟朝對側肩的方向抬起，足內緣上翻',
    muscles: ['iliopsoas','adductors','sartorius','tibialis_anterior','ehl'],
  },
  {
    id: 'LE_D1E', region: '下肢', name: 'D1 伸展（下肢）',
    motion: '髖：伸展–外展–內旋｜踝：蹠屈–外翻｜趾：屈曲',
    cue: '腿向後外側踩下，足外緣下壓',
    muscles: ['gluteus_medius','gluteus_maximus','gastrocnemius','soleus','peroneus_longus'],
  },
  {
    id: 'LE_D2F', region: '下肢', name: 'D2 屈曲（下肢）',
    motion: '髖：屈曲–外展–內旋｜踝：背屈–外翻｜趾：伸展',
    cue: '腿向同側外上方抬起，足外緣上翻',
    muscles: ['tfl','gluteus_medius','edl_leg','peroneus_tertius','tibialis_anterior'],
  },
  {
    id: 'LE_D2E', region: '下肢', name: 'D2 伸展（下肢）',
    motion: '髖：伸展–內收–外旋｜踝：蹠屈–內翻｜趾：屈曲',
    cue: '腿向後內側踩下劃回，足內緣下壓',
    muscles: ['gluteus_maximus','adductors','hamstrings','tibialis_posterior','gastrocnemius','fhl_fdl'],
  },
];
