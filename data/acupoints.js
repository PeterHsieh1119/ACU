// 十四經絡 + 穴位資料
// 座標系：y 向上（公尺，身高 1.75），+z 為身體前方，x 為左右（雙側穴位定義於 +x，程式自動鏡射）
// muscles 欄位對應 data/muscles.js 的 id，是「穴位下方 / 鄰近的主要肌肉」
// 深度僅為教科書常見參考值，僅供學習，非臨床指引

export const MERIDIANS = {
  LU:  { name: '手太陰肺經',   color: 0x8ecae6 },
  LI:  { name: '手陽明大腸經', color: 0x219ebc },
  ST:  { name: '足陽明胃經',   color: 0xffb703 },
  SP:  { name: '足太陰脾經',   color: 0xfb8500 },
  HT:  { name: '手少陰心經',   color: 0xe63946 },
  SI:  { name: '手太陽小腸經', color: 0xff70a6 },
  BL:  { name: '足太陽膀胱經', color: 0x2a9d8f },
  KI:  { name: '足少陰腎經',   color: 0x6a4c93 },
  PC:  { name: '手厥陰心包經', color: 0xd81159 },
  TE:  { name: '手少陽三焦經', color: 0xf4a261 },
  GB:  { name: '足少陽膽經',   color: 0x90be6d },
  LR:  { name: '足厥陰肝經',   color: 0x43aa8b },
  REN: { name: '任脈',         color: 0xffd166 },
  DU:  { name: '督脈',         color: 0xadb5bd },
};

// bilateral: true 表雙側對稱（自動鏡射到 -x）
export const POINTS = [
  // ===== 手太陰肺經 LU =====
  { id:'LU1',  code:'LU1',  name:'中府', meridian:'LU', pos:[0.155,1.36,0.09],  bilateral:true, muscles:['pec_major_clav','pec_minor'], loc:'鎖骨下窩外側，第1肋間隙，前正中線旁開6寸', ind:'咳嗽、氣喘、胸痛', depth:'向外斜刺0.5–0.8寸，不可深刺傷肺' },
  { id:'LU5',  code:'LU5',  name:'尺澤', meridian:'LU', pos:[0.25,1.17,0.035],  bilateral:true, muscles:['biceps','brachioradialis'], loc:'肘橫紋上，肱二頭肌腱橈側凹陷', ind:'咳嗽、咽痛、肘臂攣痛', depth:'直刺0.8–1.2寸' },
  { id:'LU6',  code:'LU6',  name:'孔最', meridian:'LU', pos:[0.27,1.05,0.035],  bilateral:true, muscles:['brachioradialis'], loc:'尺澤與太淵連線上，腕橫紋上7寸', ind:'咳血、咽痛、肘臂痛（郄穴）', depth:'直刺0.5–1寸' },
  { id:'LU7',  code:'LU7',  name:'列缺', meridian:'LU', pos:[0.30,0.955,0.025], bilateral:true, muscles:['brachioradialis'], loc:'橈骨莖突上方，腕橫紋上1.5寸', ind:'頭項痛、咳嗽、腕痛（絡穴）', depth:'向上斜刺0.3–0.5寸' },
  { id:'LU9',  code:'LU9',  name:'太淵', meridian:'LU', pos:[0.295,0.93,0.03],  bilateral:true, muscles:[], loc:'腕掌側橫紋橈側，橈動脈搏動處', ind:'咳嗽、無脈症（原穴、脈會）', depth:'避開動脈直刺0.3–0.5寸' },
  { id:'LU10', code:'LU10', name:'魚際', meridian:'LU', pos:[0.305,0.885,0.035],bilateral:true, muscles:[], loc:'第1掌骨中點橈側，赤白肉際', ind:'咽喉腫痛、失音、發熱', depth:'直刺0.5–0.8寸' },
  { id:'LU11', code:'LU11', name:'少商', meridian:'LU', pos:[0.325,0.845,0.03], bilateral:true, muscles:[], loc:'拇指橈側指甲角旁0.1寸', ind:'咽喉腫痛、昏迷急救（井穴）', depth:'淺刺0.1寸或點刺出血' },

  // ===== 手陽明大腸經 LI =====
  { id:'LI1',  code:'LI1',  name:'商陽', meridian:'LI', pos:[0.312,0.775,0.025],bilateral:true, muscles:[], loc:'食指橈側指甲角旁0.1寸', ind:'咽喉腫痛、熱病昏迷（井穴）', depth:'淺刺0.1寸或點刺出血' },
  { id:'LI4',  code:'LI4',  name:'合谷', meridian:'LI', pos:[0.315,0.87,0.015], bilateral:true, muscles:['fdi_hand'], loc:'手背第1、2掌骨間，第2掌骨橈側中點', ind:'頭面諸疾、牙痛、感冒、鎮痛要穴（原穴）', depth:'直刺0.5–1寸，孕婦慎用' },
  { id:'LI5',  code:'LI5',  name:'陽溪', meridian:'LI', pos:[0.302,0.935,0.01], bilateral:true, muscles:[], loc:'腕背橫紋橈側，解剖鼻煙窩凹陷中', ind:'頭痛、腕痛、目赤', depth:'直刺0.5–0.8寸' },
  { id:'LI10', code:'LI10', name:'手三里', meridian:'LI', pos:[0.265,1.10,0.01], bilateral:true, muscles:['ecrl'], loc:'曲池下2寸，陽溪與曲池連線上', ind:'手臂痺痛、腹痛、網球肘', depth:'直刺0.8–1.2寸' },
  { id:'LI11', code:'LI11', name:'曲池', meridian:'LI', pos:[0.255,1.175,0.015],bilateral:true, muscles:['ecrl','brachioradialis'], loc:'屈肘，肘橫紋外側端凹陷', ind:'發熱、高血壓、皮膚病、上肢不遂（合穴）', depth:'直刺1–1.5寸' },
  { id:'LI14', code:'LI14', name:'臂臑', meridian:'LI', pos:[0.225,1.30,0.01],  bilateral:true, muscles:['deltoid_middle'], loc:'三角肌止點處，曲池上7寸', ind:'肩臂痛、頸項拘攣', depth:'直刺或向上斜刺0.8–1.5寸' },
  { id:'LI15', code:'LI15', name:'肩髃', meridian:'LI', pos:[0.215,1.42,0.02],  bilateral:true, muscles:['deltoid_middle','supraspinatus'], loc:'肩峰前下方，臂外展時前凹陷中', ind:'肩臂攣痛、上肢不遂、五十肩', depth:'直刺或向下斜刺0.8–1.5寸' },
  { id:'LI20', code:'LI20', name:'迎香', meridian:'LI', pos:[0.018,1.60,0.10],  bilateral:true, muscles:[], loc:'鼻翼外緣中點旁，鼻唇溝中', ind:'鼻塞、鼻衄、口喎', depth:'平刺或斜刺0.3–0.5寸' },

  // ===== 足陽明胃經 ST =====
  { id:'ST1',  code:'ST1',  name:'承泣', meridian:'ST', pos:[0.032,1.635,0.095],bilateral:true, muscles:[], loc:'目正視，瞳孔直下，眶下緣與眼球之間', ind:'目赤腫痛、迎風流淚', depth:'緊靠眶緣緩慢直刺0.3–0.7寸，禁提插' },
  { id:'ST4',  code:'ST4',  name:'地倉', meridian:'ST', pos:[0.028,1.565,0.095],bilateral:true, muscles:[], loc:'口角旁開0.4寸', ind:'口喎、流涎、面癱', depth:'平刺0.5–0.8寸，可透頰車' },
  { id:'ST6',  code:'ST6',  name:'頰車', meridian:'ST', pos:[0.075,1.555,0.04], bilateral:true, muscles:['masseter'], loc:'下頜角前上方一橫指，咬肌隆起處', ind:'牙痛、面癱、顳顎關節症', depth:'直刺0.3–0.5寸或平刺透地倉' },
  { id:'ST25', code:'ST25', name:'天樞', meridian:'ST', pos:[0.055,1.03,0.09],  bilateral:true, muscles:['rectus_abdominis'], loc:'臍中旁開2寸', ind:'腹痛、腹瀉、便秘（大腸募穴）', depth:'直刺1–1.5寸' },
  { id:'ST34', code:'ST34', name:'梁丘', meridian:'ST', pos:[0.115,0.575,0.065],bilateral:true, muscles:['vastus_lateralis','quadriceps_rf'], loc:'髕骨外上緣上2寸', ind:'胃痛、膝腫痛（郄穴）', depth:'直刺1–1.2寸' },
  { id:'ST36', code:'ST36', name:'足三里', meridian:'ST', pos:[0.105,0.43,0.05],bilateral:true, muscles:['tibialis_anterior'], loc:'犢鼻下3寸，脛骨前嵴外一橫指', ind:'胃痛、消化不良、強壯保健要穴（合穴）', depth:'直刺1–2寸' },
  { id:'ST37', code:'ST37', name:'上巨虛', meridian:'ST', pos:[0.105,0.37,0.05],bilateral:true, muscles:['tibialis_anterior'], loc:'足三里下3寸', ind:'腸鳴、腹瀉、闌尾炎（大腸下合穴）', depth:'直刺1–2寸' },
  { id:'ST40', code:'ST40', name:'豐隆', meridian:'ST', pos:[0.115,0.30,0.045], bilateral:true, muscles:['edl_leg','tibialis_anterior'], loc:'外踝尖上8寸，脛骨前嵴外二橫指', ind:'痰多、咳嗽、頭暈（化痰要穴、絡穴）', depth:'直刺1–1.5寸' },
  { id:'ST41', code:'ST41', name:'解溪', meridian:'ST', pos:[0.095,0.115,0.06], bilateral:true, muscles:['ehl','edl_leg'], loc:'踝關節前面中央凹陷，兩伸肌腱之間', ind:'踝痛、頭痛、下肢痿痺（經穴）', depth:'直刺0.5–1寸' },
  { id:'ST44', code:'ST44', name:'內庭', meridian:'ST', pos:[0.10,0.035,0.15],  bilateral:true, muscles:[], loc:'足背第2、3趾間縫紋端', ind:'牙痛、咽痛、胃熱（滎穴）', depth:'直刺或斜刺0.5–0.8寸' },

  // ===== 足太陰脾經 SP =====
  { id:'SP1',  code:'SP1',  name:'隱白', meridian:'SP', pos:[0.075,0.02,0.165], bilateral:true, muscles:[], loc:'足大趾內側指甲角旁0.1寸', ind:'崩漏、便血、多夢（井穴）', depth:'淺刺0.1寸' },
  { id:'SP3',  code:'SP3',  name:'太白', meridian:'SP', pos:[0.07,0.03,0.12],   bilateral:true, muscles:['abductor_hallucis'], loc:'第1蹠趾關節後下方赤白肉際', ind:'胃痛、腹脹、腹瀉（原穴）', depth:'直刺0.5–0.8寸' },
  { id:'SP4',  code:'SP4',  name:'公孫', meridian:'SP', pos:[0.068,0.04,0.10],  bilateral:true, muscles:['abductor_hallucis'], loc:'第1蹠骨基底部前下方', ind:'胃痛、嘔吐、心胸痛（絡穴、通衝脈）', depth:'直刺0.6–1.2寸' },
  { id:'SP6',  code:'SP6',  name:'三陰交', meridian:'SP', pos:[0.065,0.17,0.01],bilateral:true, muscles:['tibialis_posterior','fhl_fdl','soleus'], loc:'內踝尖上3寸，脛骨內側面後緣', ind:'婦科諸疾、失眠、脾胃虛弱（三陰經交會）', depth:'直刺1–1.5寸，孕婦禁針' },
  { id:'SP9',  code:'SP9',  name:'陰陵泉', meridian:'SP', pos:[0.065,0.46,0.02],bilateral:true, muscles:['soleus'], loc:'脛骨內側髁下緣凹陷中', ind:'水腫、小便不利、膝痛（合穴）', depth:'直刺1–2寸' },
  { id:'SP10', code:'SP10', name:'血海', meridian:'SP', pos:[0.06,0.57,0.055],  bilateral:true, muscles:['vastus_medialis'], loc:'髕骨內上緣上2寸，股內側肌隆起處', ind:'月經不調、皮膚搔癢、血證', depth:'直刺1–1.5寸' },

  // ===== 手少陰心經 HT =====
  { id:'HT1',  code:'HT1',  name:'極泉', meridian:'HT', pos:[0.165,1.38,0.01],  bilateral:true, muscles:['coracobrachialis'], loc:'腋窩正中，腋動脈搏動處', ind:'心痛、上肢不遂、腋臭', depth:'避開動脈直刺0.3–0.5寸' },
  { id:'HT3',  code:'HT3',  name:'少海', meridian:'HT', pos:[0.225,1.16,0.03],  bilateral:true, muscles:['pronator_teres','fcr'], loc:'屈肘，肘橫紋內側端與肱骨內上髁連線中點', ind:'心痛、肘臂攣痛、高爾夫球肘（合穴）', depth:'直刺0.5–1寸' },
  { id:'HT5',  code:'HT5',  name:'通里', meridian:'HT', pos:[0.267,0.955,0.03], bilateral:true, muscles:['fcu'], loc:'腕橫紋上1寸，尺側屈腕肌腱橈側', ind:'心悸、失音、腕臂痛（絡穴）', depth:'直刺0.3–0.5寸' },
  { id:'HT7',  code:'HT7',  name:'神門', meridian:'HT', pos:[0.268,0.925,0.03], bilateral:true, muscles:['fcu'], loc:'腕掌側橫紋尺側端，尺側屈腕肌腱橈側凹陷', ind:'失眠、心悸、健忘（原穴、安神要穴）', depth:'直刺0.3–0.5寸' },
  { id:'HT8',  code:'HT8',  name:'少府', meridian:'HT', pos:[0.29,0.86,0.035],  bilateral:true, muscles:[], loc:'掌心第4、5掌骨之間，握拳小指尖處', ind:'心悸、胸痛、掌中熱（滎穴）', depth:'直刺0.3–0.5寸' },
  { id:'HT9',  code:'HT9',  name:'少衝', meridian:'HT', pos:[0.278,0.79,0.03],  bilateral:true, muscles:[], loc:'小指橈側指甲角旁0.1寸', ind:'心悸、昏迷急救（井穴）', depth:'淺刺0.1寸或點刺出血' },

  // ===== 手太陽小腸經 SI =====
  { id:'SI1',  code:'SI1',  name:'少澤', meridian:'SI', pos:[0.272,0.785,0.02], bilateral:true, muscles:[], loc:'小指尺側指甲角旁0.1寸', ind:'乳汁不足、昏迷、熱病（井穴）', depth:'淺刺0.1寸或點刺出血' },
  { id:'SI3',  code:'SI3',  name:'後溪', meridian:'SI', pos:[0.275,0.86,0.015], bilateral:true, muscles:[], loc:'握拳，第5掌指關節後尺側橫紋頭赤白肉際', ind:'頭項強痛、腰背痛、盜汗（輸穴、通督脈）', depth:'直刺0.5–1寸' },
  { id:'SI6',  code:'SI6',  name:'養老', meridian:'SI', pos:[0.267,0.945,0.005],bilateral:true, muscles:['ecu'], loc:'尺骨莖突橈側骨縫凹陷中', ind:'目視不明、肩背肘臂痠痛（郄穴）', depth:'向上斜刺0.5–0.8寸' },
  { id:'SI8',  code:'SI8',  name:'小海', meridian:'SI', pos:[0.23,1.155,-0.005],bilateral:true, muscles:['fcu'], loc:'尺骨鷹嘴與肱骨內上髁之間凹陷（尺神經溝）', ind:'肘臂痛、麻木（合穴）', depth:'直刺0.3–0.5寸' },
  { id:'SI11', code:'SI11', name:'天宗', meridian:'SI', pos:[0.10,1.30,-0.095], bilateral:true, muscles:['infraspinatus'], loc:'肩胛岡下窩中央凹陷', ind:'肩胛痛、氣喘、乳癰', depth:'直刺或斜刺0.5–1寸' },
  { id:'SI19', code:'SI19', name:'聽宮', meridian:'SI', pos:[0.085,1.63,0.02],  bilateral:true, muscles:[], loc:'耳屏前，張口凹陷處', ind:'耳鳴、耳聾、牙痛', depth:'張口直刺0.5–1寸' },

  // ===== 足太陽膀胱經 BL =====
  { id:'BL1',  code:'BL1',  name:'睛明', meridian:'BL', pos:[0.015,1.65,0.09],  bilateral:true, muscles:[], loc:'目內眥角稍上方凹陷', ind:'目疾要穴', depth:'囑閉目，緊靠眶緣緩慢直刺0.3–0.5寸，禁捻轉提插' },
  { id:'BL2',  code:'BL2',  name:'攢竹', meridian:'BL', pos:[0.02,1.675,0.085], bilateral:true, muscles:[], loc:'眉頭凹陷中', ind:'頭痛、目視不明、眉稜骨痛', depth:'平刺0.5–0.8寸' },
  { id:'BL10', code:'BL10', name:'天柱', meridian:'BL', pos:[0.02,1.50,-0.06],  bilateral:true, muscles:['trapezius_upper','splenius'], loc:'後髮際正中旁開1.3寸，斜方肌外緣凹陷', ind:'後頭痛、項強、眩暈', depth:'直刺或斜刺0.5–0.8寸，不可向內上方深刺' },
  { id:'BL13', code:'BL13', name:'肺俞', meridian:'BL', pos:[0.045,1.34,-0.09], bilateral:true, muscles:['erector_spinae'], loc:'第3胸椎棘突下旁開1.5寸', ind:'咳嗽、氣喘、盜汗（肺之背俞）', depth:'向脊柱斜刺0.5–0.8寸，不可深刺' },
  { id:'BL15', code:'BL15', name:'心俞', meridian:'BL', pos:[0.045,1.29,-0.095],bilateral:true, muscles:['erector_spinae'], loc:'第5胸椎棘突下旁開1.5寸', ind:'心悸、失眠、健忘（心之背俞）', depth:'向脊柱斜刺0.5–0.8寸，不可深刺' },
  { id:'BL17', code:'BL17', name:'膈俞', meridian:'BL', pos:[0.045,1.24,-0.095],bilateral:true, muscles:['erector_spinae'], loc:'第7胸椎棘突下旁開1.5寸', ind:'血證、呃逆、蕁麻疹（血會）', depth:'向脊柱斜刺0.5–0.8寸' },
  { id:'BL18', code:'BL18', name:'肝俞', meridian:'BL', pos:[0.045,1.19,-0.09], bilateral:true, muscles:['erector_spinae'], loc:'第9胸椎棘突下旁開1.5寸', ind:'脅痛、目疾、鬱證（肝之背俞）', depth:'向脊柱斜刺0.5–0.8寸' },
  { id:'BL20', code:'BL20', name:'脾俞', meridian:'BL', pos:[0.045,1.13,-0.088],bilateral:true, muscles:['erector_spinae'], loc:'第11胸椎棘突下旁開1.5寸', ind:'腹脹、腹瀉、倦怠（脾之背俞）', depth:'直刺0.5–1寸' },
  { id:'BL21', code:'BL21', name:'胃俞', meridian:'BL', pos:[0.045,1.10,-0.087],bilateral:true, muscles:['erector_spinae'], loc:'第12胸椎棘突下旁開1.5寸', ind:'胃痛、消化不良（胃之背俞）', depth:'直刺0.5–1寸' },
  { id:'BL23', code:'BL23', name:'腎俞', meridian:'BL', pos:[0.045,1.06,-0.085],bilateral:true, muscles:['erector_spinae'], loc:'第2腰椎棘突下旁開1.5寸', ind:'腰痛、遺精、耳鳴、水腫（腎之背俞）', depth:'直刺0.8–1.2寸' },
  { id:'BL25', code:'BL25', name:'大腸俞', meridian:'BL', pos:[0.045,0.99,-0.085],bilateral:true, muscles:['erector_spinae'], loc:'第4腰椎棘突下旁開1.5寸', ind:'腰痛、腹瀉、便秘（大腸之背俞）', depth:'直刺1–1.5寸' },
  { id:'BL32', code:'BL32', name:'次髎', meridian:'BL', pos:[0.025,0.93,-0.08], bilateral:true, muscles:[], loc:'第2骶後孔中', ind:'腰骶痛、月經不調、小便不利', depth:'直刺1–1.5寸' },
  { id:'BL54', code:'BL54', name:'秩邊', meridian:'BL', pos:[0.09,0.90,-0.09],  bilateral:true, muscles:['gluteus_maximus','piriformis'], loc:'骶管裂孔旁開3寸', ind:'腰腿痛、坐骨神經痛、下肢痿痺', depth:'直刺1.5–3寸' },
  { id:'BL36', code:'BL36', name:'承扶', meridian:'BL', pos:[0.095,0.82,-0.075],bilateral:true, muscles:['hamstrings','gluteus_maximus'], loc:'臀橫紋中點', ind:'腰骶臀股部疼痛、坐骨神經痛', depth:'直刺1.5–2.5寸' },
  { id:'BL40', code:'BL40', name:'委中', meridian:'BL', pos:[0.095,0.50,-0.055],bilateral:true, muscles:['gastrocnemius','hamstrings'], loc:'膕橫紋中點', ind:'腰背痛要穴、膝痛、下肢痿痺（合穴）', depth:'直刺1–1.5寸或點刺出血' },
  { id:'BL57', code:'BL57', name:'承山', meridian:'BL', pos:[0.10,0.32,-0.065], bilateral:true, muscles:['gastrocnemius','soleus'], loc:'腓腸肌兩肌腹交界下端尖角凹陷', ind:'小腿抽筋、痔疾、腰腿痛', depth:'直刺1–2寸' },
  { id:'BL60', code:'BL60', name:'崑崙', meridian:'BL', pos:[0.115,0.10,-0.02], bilateral:true, muscles:['fhl_fdl'], loc:'外踝尖與跟腱之間凹陷', ind:'頭痛、項強、腰骶痛、足跟痛（經穴）', depth:'直刺0.5–0.8寸，孕婦禁針' },
  { id:'BL62', code:'BL62', name:'申脈', meridian:'BL', pos:[0.115,0.075,0.01], bilateral:true, muscles:['peroneus_longus'], loc:'外踝直下方凹陷', ind:'失眠、頭痛、踝關節扭傷（通陽蹻脈）', depth:'直刺0.3–0.5寸' },
  { id:'BL67', code:'BL67', name:'至陰', meridian:'BL', pos:[0.13,0.02,0.15],   bilateral:true, muscles:[], loc:'足小趾外側指甲角旁0.1寸', ind:'胎位不正（灸）、頭痛、目痛（井穴）', depth:'淺刺0.1寸' },

  // ===== 足少陰腎經 KI =====
  { id:'KI1',  code:'KI1',  name:'湧泉', meridian:'KI', pos:[0.095,0.005,0.10], bilateral:true, muscles:[], loc:'足底前1/3與後2/3交界凹陷（捲足時）', ind:'昏厥急救、頭頂痛、失眠（井穴）', depth:'直刺0.5–0.8寸' },
  { id:'KI3',  code:'KI3',  name:'太溪', meridian:'KI', pos:[0.07,0.10,-0.015], bilateral:true, muscles:['tibialis_posterior','fhl_fdl'], loc:'內踝尖與跟腱之間凹陷', ind:'腰痛、耳鳴、遺精、補腎要穴（原穴）', depth:'直刺0.5–0.8寸' },
  { id:'KI6',  code:'KI6',  name:'照海', meridian:'KI', pos:[0.068,0.075,0.005],bilateral:true, muscles:['tibialis_posterior'], loc:'內踝尖直下方凹陷', ind:'咽乾、失眠、月經不調（通陰蹻脈）', depth:'直刺0.3–0.5寸' },
  { id:'KI7',  code:'KI7',  name:'復溜', meridian:'KI', pos:[0.07,0.155,-0.03], bilateral:true, muscles:['soleus','tibialis_posterior'], loc:'內踝尖上2寸，跟腱前緣', ind:'水腫、盜汗、無汗（經穴）', depth:'直刺0.6–1寸' },
  { id:'KI10', code:'KI10', name:'陰谷', meridian:'KI', pos:[0.06,0.50,-0.045], bilateral:true, muscles:['hamstrings'], loc:'膕窩內側，半腱肌腱與半膜肌腱之間', ind:'小便不利、膝痛、崩漏（合穴）', depth:'直刺1–1.5寸' },

  // ===== 手厥陰心包經 PC =====
  { id:'PC3',  code:'PC3',  name:'曲澤', meridian:'PC', pos:[0.235,1.165,0.035],bilateral:true, muscles:['biceps','pronator_teres'], loc:'肘橫紋上，肱二頭肌腱尺側凹陷', ind:'心痛、胃痛、嘔吐、肘臂痛（合穴）', depth:'直刺0.8–1寸或點刺出血' },
  { id:'PC6',  code:'PC6',  name:'內關', meridian:'PC', pos:[0.283,0.985,0.03], bilateral:true, muscles:['fds','fcr'], loc:'腕橫紋上2寸，掌長肌腱與橈側屈腕肌腱之間', ind:'心悸、胸悶、嘔吐、暈車、失眠（絡穴、通陰維脈）', depth:'直刺0.5–1寸' },
  { id:'PC7',  code:'PC7',  name:'大陵', meridian:'PC', pos:[0.285,0.93,0.032], bilateral:true, muscles:['fds'], loc:'腕掌側橫紋中點，兩腱之間', ind:'心痛、胃痛、腕管症候群（原穴）', depth:'直刺0.3–0.5寸' },
  { id:'PC8',  code:'PC8',  name:'勞宮', meridian:'PC', pos:[0.295,0.865,0.038],bilateral:true, muscles:[], loc:'掌心第2、3掌骨間，握拳中指尖處', ind:'心痛、口瘡、中暑（滎穴）', depth:'直刺0.3–0.5寸' },
  { id:'PC9',  code:'PC9',  name:'中衝', meridian:'PC', pos:[0.30,0.775,0.03],  bilateral:true, muscles:[], loc:'中指尖端中央', ind:'昏迷急救、中暑、小兒夜啼（井穴）', depth:'淺刺0.1寸或點刺出血' },

  // ===== 手少陽三焦經 TE =====
  { id:'TE1',  code:'TE1',  name:'關衝', meridian:'TE', pos:[0.29,0.78,0.02],   bilateral:true, muscles:[], loc:'無名指尺側指甲角旁0.1寸', ind:'頭痛、咽痛、熱病（井穴）', depth:'淺刺0.1寸或點刺出血' },
  { id:'TE3',  code:'TE3',  name:'中渚', meridian:'TE', pos:[0.292,0.875,0.012],bilateral:true, muscles:[], loc:'手背第4、5掌骨間，掌指關節後凹陷', ind:'耳鳴、頭痛、手指屈伸不利（輸穴）', depth:'直刺0.3–0.5寸' },
  { id:'TE5',  code:'TE5',  name:'外關', meridian:'TE', pos:[0.283,0.985,-0.005],bilateral:true, muscles:['edc'], loc:'腕背橫紋上2寸，橈尺骨之間', ind:'感冒、頭痛、耳鳴、脅痛（絡穴、通陽維脈）', depth:'直刺0.5–1寸' },
  { id:'TE6',  code:'TE6',  name:'支溝', meridian:'TE', pos:[0.28,1.01,-0.005], bilateral:true, muscles:['edc'], loc:'腕背橫紋上3寸，橈尺骨之間', ind:'便秘、脅肋痛、耳鳴（經穴）', depth:'直刺0.5–1寸' },
  { id:'TE14', code:'TE14', name:'肩髎', meridian:'TE', pos:[0.21,1.415,-0.02], bilateral:true, muscles:['deltoid_posterior'], loc:'肩峰後下方，臂外展時後凹陷中', ind:'肩臂攣痛不遂', depth:'直刺0.8–1.2寸' },
  { id:'TE17', code:'TE17', name:'翳風', meridian:'TE', pos:[0.085,1.60,-0.02], bilateral:true, muscles:[], loc:'耳垂後方，乳突與下頜角之間凹陷', ind:'耳鳴、耳聾、面癱', depth:'直刺0.8–1.2寸' },
  { id:'TE23', code:'TE23', name:'絲竹空', meridian:'TE', pos:[0.055,1.675,0.075],bilateral:true, muscles:[], loc:'眉梢凹陷處', ind:'頭痛、目疾、眼瞼瞤動', depth:'平刺0.5–1寸' },

  // ===== 足少陽膽經 GB =====
  { id:'GB1',  code:'GB1',  name:'瞳子髎', meridian:'GB', pos:[0.05,1.65,0.08], bilateral:true, muscles:[], loc:'目外眥旁0.5寸，眶外緣凹陷', ind:'頭痛、目疾', depth:'平刺0.3–0.5寸' },
  { id:'GB2',  code:'GB2',  name:'聽會', meridian:'GB', pos:[0.085,1.615,0.02], bilateral:true, muscles:[], loc:'耳屏間切跡前，張口凹陷處', ind:'耳鳴、耳聾、牙痛', depth:'張口直刺0.5–0.8寸' },
  { id:'GB8',  code:'GB8',  name:'率谷', meridian:'GB', pos:[0.085,1.70,0.0],   bilateral:true, muscles:[], loc:'耳尖直上入髮際1.5寸', ind:'偏頭痛、眩暈', depth:'平刺0.5–0.8寸' },
  { id:'GB20', code:'GB20', name:'風池', meridian:'GB', pos:[0.04,1.51,-0.055], bilateral:true, muscles:['suboccipitals','splenius','trapezius_upper'], loc:'枕骨下，胸鎖乳突肌與斜方肌之間凹陷', ind:'頭痛、眩暈、感冒、頸項強痛', depth:'向鼻尖方向刺0.8–1.2寸，嚴禁向上深刺' },
  { id:'GB21', code:'GB21', name:'肩井', meridian:'GB', pos:[0.10,1.45,-0.03],  bilateral:true, muscles:['trapezius_upper'], loc:'大椎與肩峰連線中點，斜方肌上緣', ind:'肩背痛、頸項強痛、乳癰', depth:'直刺0.3–0.5寸，深部為肺尖不可深刺，孕婦禁針' },
  { id:'GB30', code:'GB30', name:'環跳', meridian:'GB', pos:[0.105,0.88,-0.055],bilateral:true, muscles:['gluteus_maximus','piriformis'], loc:'股骨大轉子最高點與骶管裂孔連線外1/3處', ind:'坐骨神經痛、下肢痿痺、腰腿痛', depth:'直刺2–3寸' },
  { id:'GB31', code:'GB31', name:'風市', meridian:'GB', pos:[0.115,0.66,0.0],   bilateral:true, muscles:['vastus_lateralis','tfl'], loc:'大腿外側正中，直立垂手中指尖處', ind:'下肢痿痺、遍身搔癢', depth:'直刺1–2寸' },
  { id:'GB34', code:'GB34', name:'陽陵泉', meridian:'GB', pos:[0.115,0.46,0.02],bilateral:true, muscles:['peroneus_longus'], loc:'腓骨小頭前下方凹陷', ind:'脅痛、筋病要穴、膝痛、下肢痿痺（合穴、筋會）', depth:'直刺1–1.5寸' },
  { id:'GB39', code:'GB39', name:'懸鐘', meridian:'GB', pos:[0.115,0.16,0.0],   bilateral:true, muscles:['peroneus_longus','edl_leg'], loc:'外踝尖上3寸，腓骨前緣', ind:'項強、落枕、下肢痿痺（髓會）', depth:'直刺0.8–1寸' },
  { id:'GB41', code:'GB41', name:'足臨泣', meridian:'GB', pos:[0.115,0.035,0.115],bilateral:true, muscles:[], loc:'第4、5蹠骨結合部前方凹陷', ind:'偏頭痛、目疾、脅痛（輸穴、通帶脈）', depth:'直刺0.3–0.5寸' },

  // ===== 足厥陰肝經 LR =====
  { id:'LR1',  code:'LR1',  name:'大敦', meridian:'LR', pos:[0.08,0.02,0.17],   bilateral:true, muscles:[], loc:'足大趾外側指甲角旁0.1寸', ind:'疝氣、崩漏、癲癇（井穴）', depth:'淺刺0.1–0.2寸或點刺出血' },
  { id:'LR2',  code:'LR2',  name:'行間', meridian:'LR', pos:[0.085,0.03,0.145], bilateral:true, muscles:[], loc:'足背第1、2趾間縫紋端', ind:'頭痛、目赤、肝火諸症（滎穴）', depth:'直刺0.5–0.8寸' },
  { id:'LR3',  code:'LR3',  name:'太衝', meridian:'LR', pos:[0.085,0.04,0.115], bilateral:true, muscles:[], loc:'足背第1、2蹠骨間隙後方凹陷', ind:'頭痛、眩暈、鬱證、高血壓、疏肝要穴（原穴）', depth:'直刺0.5–1寸' },
  { id:'LR5',  code:'LR5',  name:'蠡溝', meridian:'LR', pos:[0.068,0.25,0.015], bilateral:true, muscles:[], loc:'內踝尖上5寸，脛骨內側面中央', ind:'陰癢、月經不調（絡穴）', depth:'平刺0.5–0.8寸' },
  { id:'LR8',  code:'LR8',  name:'曲泉', meridian:'LR', pos:[0.06,0.51,0.0],    bilateral:true, muscles:['sartorius','hamstrings'], loc:'屈膝，膝內側橫紋頭上方凹陷', ind:'膝痛、小便不利、陰部疾患（合穴）', depth:'直刺1–1.5寸' },
  { id:'LR14', code:'LR14', name:'期門', meridian:'LR', pos:[0.095,1.17,0.095], bilateral:true, muscles:[], loc:'乳頭直下，第6肋間隙', ind:'脅痛、乳癰、鬱證（肝募穴）', depth:'沿肋間斜刺或平刺0.5–0.8寸，不可深刺' },

  // ===== 任脈 REN =====
  { id:'RN3',  code:'CV3',  name:'中極', meridian:'REN', pos:[0,0.93,0.085],  bilateral:false, muscles:[], loc:'前正中線，臍下4寸', ind:'小便不利、遺尿、月經不調（膀胱募穴）', depth:'直刺1–1.5寸，排尿後針，孕婦禁針' },
  { id:'RN4',  code:'CV4',  name:'關元', meridian:'REN', pos:[0,0.96,0.088],  bilateral:false, muscles:[], loc:'前正中線，臍下3寸', ind:'虛勞、遺精、月經不調、保健要穴（小腸募穴）', depth:'直刺1–1.5寸，孕婦禁針' },
  { id:'RN6',  code:'CV6',  name:'氣海', meridian:'REN', pos:[0,0.995,0.09],  bilateral:false, muscles:[], loc:'前正中線，臍下1.5寸', ind:'虛脫、乏力、腹痛、補氣要穴', depth:'直刺1–1.5寸，孕婦慎用' },
  { id:'RN8',  code:'CV8',  name:'神闕', meridian:'REN', pos:[0,1.03,0.095],  bilateral:false, muscles:[], loc:'臍中央', ind:'虛脫（灸）、腹痛、腹瀉', depth:'禁針，宜灸' },
  { id:'RN12', code:'CV12', name:'中脘', meridian:'REN', pos:[0,1.115,0.095], bilateral:false, muscles:[], loc:'前正中線，臍上4寸', ind:'胃痛、嘔吐、消化不良（胃募穴、腑會）', depth:'直刺1–1.5寸' },
  { id:'RN17', code:'CV17', name:'膻中', meridian:'REN', pos:[0,1.28,0.10],   bilateral:false, muscles:[], loc:'前正中線，兩乳頭連線中點', ind:'胸悶、氣喘、心悸（心包募穴、氣會）', depth:'平刺0.3–0.5寸' },
  { id:'RN22', code:'CV22', name:'天突', meridian:'REN', pos:[0,1.43,0.09],   bilateral:false, muscles:[], loc:'胸骨上窩中央', ind:'咳嗽、氣喘、咽喉腫痛', depth:'先直刺0.2寸再沿胸骨後緣向下刺0.5–1寸，不可過深' },
  { id:'RN24', code:'CV24', name:'承漿', meridian:'REN', pos:[0,1.545,0.10],  bilateral:false, muscles:[], loc:'頦唇溝正中凹陷', ind:'口喎、流涎、牙齦腫痛', depth:'斜刺0.3–0.5寸' },

  // ===== 督脈 DU =====
  { id:'DU1',  code:'GV1',  name:'長強', meridian:'DU', pos:[0,0.86,-0.06],   bilateral:false, muscles:[], loc:'尾骨端與肛門連線中點', ind:'痔疾、脫肛、便血', depth:'緊靠尾骨前面斜刺0.8–1寸' },
  { id:'DU4',  code:'GV4',  name:'命門', meridian:'DU', pos:[0,1.06,-0.085],  bilateral:false, muscles:[], loc:'第2腰椎棘突下凹陷', ind:'腰痛、遺精、陽痿、命門火衰', depth:'直刺0.5–1寸' },
  { id:'DU9',  code:'GV9',  name:'至陽', meridian:'DU', pos:[0,1.24,-0.098],  bilateral:false, muscles:[], loc:'第7胸椎棘突下凹陷', ind:'黃疸、胸背痛、胃痛', depth:'向上斜刺0.5–1寸' },
  { id:'DU14', code:'GV14', name:'大椎', meridian:'DU', pos:[0,1.45,-0.08],   bilateral:false, muscles:[], loc:'第7頸椎棘突下凹陷', ind:'發熱、感冒、項強、諸陽之會', depth:'向上斜刺0.5–1寸' },
  { id:'DU16', code:'GV16', name:'風府', meridian:'DU', pos:[0,1.555,-0.085], bilateral:false, muscles:['suboccipitals'], loc:'後髮際正中直上1寸，枕外隆凸直下凹陷', ind:'頭痛、眩暈、項強、中風', depth:'向下頜方向緩刺0.5–1寸，嚴禁向上深刺（延髓）' },
  { id:'DU20', code:'GV20', name:'百會', meridian:'DU', pos:[0,1.74,0.0],     bilateral:false, muscles:[], loc:'頭頂正中，兩耳尖連線中點', ind:'頭痛、眩暈、失眠、中風、升陽舉陷', depth:'平刺0.5–0.8寸' },
  { id:'DU26', code:'GV26', name:'水溝', meridian:'DU', pos:[0,1.585,0.105],  bilateral:false, muscles:[], loc:'人中溝上1/3與中1/3交界', ind:'昏迷、暈厥急救要穴、急性腰扭傷', depth:'向上斜刺0.3–0.5寸' },
];

// 經絡走行路徑：陣列元素為穴位 id 或補間座標 [x,y,z]
export const ROUTES = {
  LU:  ['LU1', [0.19,1.40,0.05], [0.225,1.28,0.04], 'LU5','LU6','LU7','LU9','LU10','LU11'],
  LI:  ['LI1','LI4','LI5', [0.285,1.02,0.008], 'LI10','LI11','LI14','LI15', [0.19,1.46,0.01], [0.06,1.52,0.05], 'LI20'],
  ST:  ['ST1','ST4','ST6', [0.075,1.50,0.03], [0.045,1.44,0.07], [0.095,1.28,0.105], 'ST25', [0.06,0.92,0.07], 'ST34', [0.11,0.52,0.06], 'ST36','ST37','ST40','ST41','ST44'],
  SP:  ['SP1','SP3','SP4', [0.065,0.09,0.03], 'SP6','SP9','SP10', [0.07,0.90,0.075], [0.07,1.05,0.09], [0.10,1.25,0.10]],
  HT:  ['HT1','HT3','HT5','HT7','HT8','HT9'],
  SI:  ['SI1','SI3','SI6','SI8', [0.22,1.30,-0.03], [0.15,1.38,-0.07], 'SI11', [0.06,1.42,-0.06], 'SI19'],
  BL:  ['BL1','BL2', [0.025,1.71,0.06], [0.025,1.735,0], [0.025,1.60,-0.075], 'BL10','BL13','BL15','BL17','BL18','BL20','BL21','BL23','BL25','BL32','BL54','BL36','BL40','BL57','BL60','BL62','BL67'],
  KI:  ['KI1', [0.075,0.03,0.05], 'KI6','KI3','KI7', [0.065,0.35,-0.03], 'KI10', [0.06,0.70,0.02], [0.03,1.00,0.085], [0.03,1.35,0.095]],
  PC:  [[0.10,1.30,0.10], 'PC3','PC6','PC7','PC8','PC9'],
  TE:  ['TE1','TE3', [0.288,0.93,0.0], 'TE5','TE6', [0.24,1.16,-0.03], [0.22,1.30,-0.025], 'TE14', [0.13,1.47,-0.03], 'TE17', [0.09,1.68,-0.01], 'TE23'],
  GB:  ['GB1','GB2', [0.08,1.66,0.03], 'GB8', [0.06,1.57,-0.06], 'GB20','GB21', [0.13,1.15,0.0], [0.11,0.95,-0.02], 'GB30','GB31', [0.11,0.50,0.01], 'GB34','GB39', [0.112,0.08,0.03], 'GB41'],
  LR:  ['LR1','LR2','LR3', [0.075,0.09,0.05], 'LR5', [0.062,0.48,0.01], 'LR8', [0.065,0.72,0.05], [0.06,0.90,0.07], 'LR14'],
  REN: ['RN3','RN4','RN6','RN8','RN12','RN17','RN22','RN24'],
  DU:  ['DU1','DU4','DU9','DU14','DU16', [0,1.70,-0.05], 'DU20', [0,1.70,0.06], 'DU26'],
};
