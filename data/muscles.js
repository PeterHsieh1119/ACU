// 肌肉資料：以簡化「起點→止點」線段（膠囊體）近似呈現
// deep: true 表深層肌（顯示時較透明）；bilateral 肌肉自動鏡射
export const MUSCLES = {
  // --- 肩胛帶 / 軀幹 ---
  trapezius_upper:  { name:'上斜方肌',   latin:'Trapezius (upper)',      path:[[0.02,1.50,-0.06],[0.13,1.44,-0.04]], r:0.020 },
  trapezius_lower:  { name:'下斜方肌',   latin:'Trapezius (lower)',      path:[[0.005,1.20,-0.09],[0.09,1.35,-0.08]], r:0.016 },
  levator_scapulae: { name:'提肩胛肌',   latin:'Levator scapulae',       path:[[0.03,1.52,-0.05],[0.10,1.40,-0.06]], r:0.012 },
  rhomboids:        { name:'菱形肌',     latin:'Rhomboids',              path:[[0.01,1.32,-0.09],[0.085,1.33,-0.085]], r:0.018 },
  serratus_anterior:{ name:'前鋸肌',     latin:'Serratus anterior',      path:[[0.135,1.28,0.02],[0.135,1.15,0.03]], r:0.018 },
  pec_major_clav:   { name:'胸大肌（鎖骨部）', latin:'Pectoralis major (clavicular)', path:[[0.06,1.41,0.08],[0.20,1.38,0.03]], r:0.018 },
  pec_major_sternal:{ name:'胸大肌（胸骨部）', latin:'Pectoralis major (sternal)',    path:[[0.02,1.28,0.10],[0.20,1.37,0.03]], r:0.024 },
  pec_minor:        { name:'胸小肌',     latin:'Pectoralis minor',       path:[[0.07,1.30,0.09],[0.14,1.38,0.05]], r:0.012, deep:true },
  latissimus:       { name:'闊背肌',     latin:'Latissimus dorsi',       path:[[0.02,1.10,-0.08],[0.185,1.36,-0.02]], r:0.024 },
  erector_spinae:   { name:'豎脊肌',     latin:'Erector spinae',         path:[[0.035,1.40,-0.085],[0.035,0.95,-0.08]], r:0.020 },
  rectus_abdominis: { name:'腹直肌',     latin:'Rectus abdominis',       path:[[0.035,1.19,0.095],[0.035,0.91,0.08]], r:0.024 },
  suboccipitals:    { name:'枕下肌群',   latin:'Suboccipitals',          path:[[0.025,1.545,-0.07],[0.045,1.58,-0.055]], r:0.010, deep:true },
  splenius:         { name:'頭夾肌',     latin:'Splenius capitis',       path:[[0.03,1.44,-0.07],[0.06,1.57,-0.05]], r:0.012 },
  masseter:         { name:'咬肌',       latin:'Masseter',               path:[[0.078,1.60,0.035],[0.075,1.555,0.04]], r:0.012 },

  // --- 肩關節 ---
  deltoid_anterior: { name:'三角肌前束', latin:'Deltoid (anterior)',     path:[[0.17,1.42,0.04],[0.225,1.30,0.015]], r:0.019 },
  deltoid_middle:   { name:'三角肌中束', latin:'Deltoid (middle)',       path:[[0.20,1.44,0.0],[0.23,1.30,0.005]], r:0.019 },
  deltoid_posterior:{ name:'三角肌後束', latin:'Deltoid (posterior)',    path:[[0.17,1.41,-0.045],[0.225,1.30,-0.01]], r:0.019 },
  supraspinatus:    { name:'棘上肌',     latin:'Supraspinatus',          path:[[0.06,1.38,-0.075],[0.195,1.43,-0.01]], r:0.012, deep:true },
  infraspinatus:    { name:'棘下肌',     latin:'Infraspinatus',          path:[[0.08,1.31,-0.09],[0.195,1.40,-0.015]], r:0.015 },
  teres_minor:      { name:'小圓肌',     latin:'Teres minor',            path:[[0.12,1.30,-0.075],[0.195,1.40,-0.02]], r:0.010 },
  teres_major:      { name:'大圓肌',     latin:'Teres major',            path:[[0.11,1.27,-0.08],[0.185,1.37,-0.005]], r:0.013 },
  subscapularis:    { name:'肩胛下肌',   latin:'Subscapularis',          path:[[0.12,1.33,-0.04],[0.185,1.39,0.0]], r:0.013, deep:true },
  coracobrachialis: { name:'喙肱肌',     latin:'Coracobrachialis',       path:[[0.17,1.39,0.03],[0.22,1.27,0.02]], r:0.012 },

  // --- 上臂 / 前臂 ---
  biceps:           { name:'肱二頭肌',   latin:'Biceps brachii',         path:[[0.19,1.40,0.03],[0.24,1.18,0.035]], r:0.019 },
  triceps:          { name:'肱三頭肌',   latin:'Triceps brachii',        path:[[0.20,1.39,-0.02],[0.24,1.17,-0.025]], r:0.019 },
  brachioradialis:  { name:'肱橈肌',     latin:'Brachioradialis',        path:[[0.245,1.20,0.02],[0.29,0.97,0.02]], r:0.013 },
  pronator_teres:   { name:'旋前圓肌',   latin:'Pronator teres',         path:[[0.23,1.16,0.03],[0.265,1.08,0.03]], r:0.011 },
  supinator:        { name:'旋後肌',     latin:'Supinator',              path:[[0.255,1.14,0.01],[0.27,1.09,0.02]], r:0.010, deep:true },
  fcr:              { name:'橈側屈腕肌', latin:'Flexor carpi radialis',  path:[[0.235,1.15,0.03],[0.29,0.95,0.03]], r:0.011 },
  fcu:              { name:'尺側屈腕肌', latin:'Flexor carpi ulnaris',   path:[[0.228,1.15,0.028],[0.268,0.93,0.03]], r:0.011 },
  fds:              { name:'屈指淺肌',   latin:'Flexor digitorum superficialis', path:[[0.232,1.15,0.032],[0.28,0.94,0.032]], r:0.012, deep:true },
  ecrl:             { name:'橈側伸腕長肌', latin:'Extensor carpi radialis longus', path:[[0.25,1.18,0.01],[0.295,0.95,0.005]], r:0.012 },
  ecu:              { name:'尺側伸腕肌', latin:'Extensor carpi ulnaris', path:[[0.245,1.14,-0.01],[0.27,0.94,-0.005]], r:0.010 },
  edc:              { name:'伸指總肌',   latin:'Extensor digitorum',     path:[[0.25,1.15,0.0],[0.285,0.94,-0.005]], r:0.012 },
  fdi_hand:         { name:'第一背側骨間肌', latin:'First dorsal interosseous', path:[[0.312,0.88,0.015],[0.318,0.855,0.02]], r:0.008 },

  // --- 髖 / 大腿 ---
  iliopsoas:        { name:'髂腰肌',     latin:'Iliopsoas',              path:[[0.04,1.05,-0.02],[0.08,0.90,0.05]], r:0.017, deep:true },
  adductors:        { name:'內收肌群',   latin:'Adductors',              path:[[0.06,0.89,0.05],[0.075,0.62,0.03]], r:0.024 },
  sartorius:        { name:'縫匠肌',     latin:'Sartorius',              path:[[0.10,0.93,0.06],[0.07,0.53,0.02]], r:0.011 },
  tfl:              { name:'闊筋膜張肌', latin:'Tensor fasciae latae',   path:[[0.115,0.94,0.03],[0.12,0.80,0.0]], r:0.014 },
  gluteus_maximus:  { name:'臀大肌',     latin:'Gluteus maximus',        path:[[0.03,0.95,-0.07],[0.11,0.82,-0.05]], r:0.030 },
  gluteus_medius:   { name:'臀中肌',     latin:'Gluteus medius',         path:[[0.10,0.96,-0.03],[0.115,0.88,-0.01]], r:0.020 },
  piriformis:       { name:'梨狀肌',     latin:'Piriformis',             path:[[0.03,0.92,-0.06],[0.11,0.885,-0.02]], r:0.012, deep:true },
  quadriceps_rf:    { name:'股直肌',     latin:'Rectus femoris',         path:[[0.095,0.90,0.06],[0.095,0.55,0.07]], r:0.024 },
  vastus_medialis:  { name:'股內側肌',   latin:'Vastus medialis',        path:[[0.075,0.68,0.05],[0.08,0.55,0.06]], r:0.017 },
  vastus_lateralis: { name:'股外側肌',   latin:'Vastus lateralis',       path:[[0.115,0.80,0.03],[0.11,0.56,0.05]], r:0.019 },
  hamstrings:       { name:'膕旁肌',     latin:'Hamstrings',             path:[[0.095,0.83,-0.06],[0.09,0.52,-0.045]], r:0.024 },

  // --- 小腿 / 足 ---
  tibialis_anterior:{ name:'脛前肌',     latin:'Tibialis anterior',      path:[[0.105,0.46,0.045],[0.095,0.13,0.055]], r:0.015 },
  edl_leg:          { name:'伸趾長肌',   latin:'Extensor digitorum longus', path:[[0.112,0.45,0.035],[0.10,0.10,0.05]], r:0.011 },
  ehl:              { name:'伸拇長肌',   latin:'Extensor hallucis longus', path:[[0.105,0.30,0.04],[0.09,0.06,0.09]], r:0.009, deep:true },
  peroneus_longus:  { name:'腓骨長肌',   latin:'Peroneus longus',        path:[[0.117,0.45,0.01],[0.115,0.12,-0.005]], r:0.012 },
  peroneus_tertius: { name:'第三腓骨肌', latin:'Peroneus tertius',       path:[[0.112,0.20,0.03],[0.108,0.08,0.05]], r:0.008 },
  gastrocnemius:    { name:'腓腸肌',     latin:'Gastrocnemius',          path:[[0.095,0.49,-0.05],[0.10,0.25,-0.06]], r:0.022 },
  soleus:           { name:'比目魚肌',   latin:'Soleus',                 path:[[0.10,0.35,-0.05],[0.105,0.13,-0.035]], r:0.017 },
  tibialis_posterior:{ name:'脛後肌',    latin:'Tibialis posterior',     path:[[0.09,0.40,-0.03],[0.072,0.10,-0.015]], r:0.011, deep:true },
  fhl_fdl:          { name:'屈拇／屈趾長肌', latin:'FHL / FDL',          path:[[0.095,0.35,-0.04],[0.07,0.08,0.0]], r:0.010, deep:true },
  abductor_hallucis:{ name:'外展拇肌',   latin:'Abductor hallucis',      path:[[0.068,0.03,0.05],[0.075,0.025,0.15]], r:0.010 },
};
