// 內臟與結締組織
//
// 幾何取自 BodyParts3D 4.0（CC BY 4.0），由 scripts/build-anatomy.mjs 打包成
// organs.bin.gz 與 connective.bin.gz，打開圖層才下載。這裡放中文名稱與中醫對應。
// 每個 id 都必須對得上 manifest 對應群組的 key（npm run validate 會檢查）。
//
// meridian  對應的經絡 key（data/acupoints.js 的 MERIDIANS）
// mu / shu  募穴與背俞穴的穴位 id——臟腑辨證最常用的一對「前後配穴」
// tcm       中醫臟象的說明；與西醫解剖的器官不是同一件事，兩者不可直接畫等號
//
// ⚠ 來源資料沒有肺實質、肝實質外殼、甲狀腺、心包膜與胸膜：
//   「肺」只能用支氣管樹代表，「肝」是九個肝靜脈分段（Couinaud）堆出來的體積。

export const ORGAN_GROUPS = {
  thorax: '胸腔',
  abdomen: '腹腔',
  pelvis: '骨盆腔',
  headneck: '頭頸',
  other: '其他',
};

export const ORGANS = {
  heart: {
    name: '心', latin: 'Heart', group: 'thorax', meridian: 'HT', mu: 'RN14', shu: 'BL15',
    anatomy: '位於中縱膈，由左右心房與心室構成；此處顯示心房壁、心室壁與二尖瓣、三尖瓣',
    tcm: '心主血脈、藏神。中醫的「心」除了泵血，還涵蓋意識與思維活動，失眠、心悸、健忘都從心論治。',
    caution: '心前區（膻中、巨闕一帶）的穴位只可平刺或斜刺，直刺過深有心包填塞風險。',
  },
  liver: {
    name: '肝', latin: 'Liver', group: 'abdomen', meridian: 'LR', mu: 'LR14', shu: 'BL18',
    anatomy: '位於右上腹、橫膈之下；模型以九個肝靜脈分段（Couinaud I–IX）堆出肝的體積',
    tcm: '肝主疏泄、藏血，開竅於目，其華在爪。情志不暢、脅痛、目疾、月經不調多從肝論治。',
    caution: '右季肋部（期門、日月、章門）針刺須沿肋骨斜刺，直刺過深可能傷及肝臟，肝腫大者尤忌。',
  },
  gallbladder: {
    name: '膽', latin: 'Gallbladder', group: 'abdomen', meridian: 'GB', mu: 'GB24', shu: 'BL19',
    anatomy: '附著於肝臟下面的梨形囊，經膽囊管、總肝管注入十二指腸',
    tcm: '膽主決斷，貯藏並排泄膽汁，與肝相表裡。膽怯、口苦、驚悸不寐屬膽病。',
    caution: '日月位於乳頭直下第 7 肋間隙，只可斜刺或平刺。',
  },
  spleen: {
    name: '脾（解剖脾）', latin: 'Spleen', group: 'abdomen', meridian: 'SP', mu: 'LR13', shu: 'BL20',
    anatomy: '位於左季肋部第 9–11 肋深面的淋巴器官，過濾血液、參與免疫',
    tcm: '⚠ 中醫的「脾」指運化水穀與統血的功能系統，接近現代的消化吸收機能，'
      + '和這個解剖脾（淋巴器官）不是同一個東西。脾虛、濕困的治療對應的是消化功能而非此器官。',
    caution: '左季肋部深刺可能傷脾，脾腫大者禁針該區。',
  },
  stomach: {
    name: '胃', latin: 'Stomach', group: 'abdomen', meridian: 'ST', mu: 'RN12', shu: 'BL21',
    anatomy: '位於左上腹與劍突下，上接食道、下連十二指腸',
    tcm: '胃主受納腐熟水穀，以降為順，與脾相表裡。胃脘痛、噯氣、嘔吐為胃氣上逆。',
    caution: '中脘直刺時胃充盈的病人深度要減；飯後不宜針上腹部。',
  },
  duodenum: {
    name: '十二指腸', latin: 'Duodenum', group: 'abdomen', meridian: 'ST',
    anatomy: '呈 C 形包繞胰頭，接收膽汁與胰液',
    tcm: '中醫歸屬於胃腑的一部分。',
  },
  small_intestine: {
    name: '小腸', latin: 'Small intestine (jejunum & ileum)', group: 'abdomen', meridian: 'SI', mu: 'RN4', shu: 'BL27',
    anatomy: '空腸與迴腸，盤踞於腹腔中部，為吸收養分的主要部位',
    tcm: '小腸主受盛化物、泌別清濁，與心相表裡。心火下移小腸可見小便短赤。',
  },
  large_intestine: {
    name: '大腸', latin: 'Large intestine', group: 'abdomen', meridian: 'LI', mu: 'ST25', shu: 'BL25',
    anatomy: '升結腸、橫結腸、降結腸、直腸與闌尾，環繞小腸周圍',
    tcm: '大腸主傳導糟粕，與肺相表裡。便秘、泄瀉取天樞、大腸俞、上巨虛。',
  },
  pancreas: {
    name: '胰', latin: 'Pancreas', group: 'abdomen', meridian: 'SP',
    anatomy: '橫臥於胃後方，分泌胰液與胰島素',
    tcm: '古代中醫未單列胰臟，其功能多歸於脾。',
  },
  kidney: {
    name: '腎', latin: 'Kidney', group: 'abdomen', meridian: 'KI', mu: 'GB25', shu: 'BL23',
    anatomy: '位於腹膜後、第 11 胸椎至第 3 腰椎兩側，右腎因肝臟而略低',
    tcm: '腎藏精、主水、主納氣，為先天之本，開竅於耳，其華在髮。腰膝痠軟、耳鳴、遺精屬腎虛。',
    caution: '腎俞、志室向內深刺可能傷腎；腎下垂或單腎者更須注意。',
  },
  ureter: {
    name: '輸尿管', latin: 'Ureter', group: 'abdomen', meridian: 'BL',
    anatomy: '自腎盂下行至膀胱，沿腰大肌前面走行',
  },
  bladder: {
    name: '膀胱', latin: 'Urinary bladder', group: 'pelvis', meridian: 'BL', mu: 'RN3', shu: 'BL28',
    anatomy: '位於恥骨聯合後方，充盈時可上升至臍下',
    tcm: '膀胱主貯尿排尿、氣化則能出，與腎相表裡。癃閉、遺尿取中極、膀胱俞。',
    caution: '⚠ 下腹部（曲骨、中極、關元）針刺前必須先排空膀胱，充盈的膀胱會上升到臍下而被刺中。',
  },
  prostate: {
    name: '攝護腺與精囊', latin: 'Prostate, seminal vesicle & deferent duct', group: 'pelvis', meridian: 'KI',
    anatomy: '攝護腺位於膀胱下方包繞尿道，精囊與輸精管居其後上方',
    tcm: '中醫歸於「精室」，屬腎所主。',
  },
  adrenal: {
    name: '腎上腺', latin: 'Adrenal gland', group: 'abdomen', meridian: 'KI',
    anatomy: '覆蓋於兩腎上極的內分泌腺',
    tcm: '古代解剖未單列，現代多與「腎陽」的功能相參。',
  },
  diaphragm: {
    name: '橫膈', latin: 'Diaphragm', group: 'thorax', meridian: 'REN',
    anatomy: '分隔胸腔與腹腔的穹窿狀肌肉，由膈神經（C3–C5）支配，是最主要的呼吸肌',
    tcm: '中醫稱「膈」，膈俞為八會穴之血會；呃逆（橫膈痙攣）取膈俞、內關、攢竹。',
  },
  trachea: {
    name: '氣管與主支氣管', latin: 'Trachea & main bronchi', group: 'thorax', meridian: 'LU',
    anatomy: '自環狀軟骨下緣至第 4–5 胸椎高度分為左右主支氣管',
    caution: '天突針刺須先直刺 0.2 寸再沿胸骨柄後緣向下，直刺會傷及氣管。',
  },
  bronchi: {
    name: '支氣管樹（代表肺）', latin: 'Segmental bronchial tree', group: 'thorax', meridian: 'LU', mu: 'LU1', shu: 'BL13',
    anatomy: '⚠ 來源資料沒有肺實質的外殼網格，此處以肺段支氣管樹代表肺的位置與範圍；'
      + '右肺三葉、左肺兩葉的分支形態不同，兩側都取自原始資料而非鏡射',
    tcm: '肺主氣司呼吸、主宣發肅降、通調水道，開竅於鼻，外合皮毛，與大腸相表裡。',
    caution: '⚠ 氣胸是針灸最常見的嚴重不良事件。胸背部（缺盆、肺俞、定喘、膏肓、肩井）'
      + '一律沿肋骨斜刺或平刺，絕不可向胸腔直刺深刺。',
  },
  esophagus: {
    name: '食道', latin: 'Esophagus', group: 'thorax', meridian: 'ST',
    anatomy: '自咽下行於氣管後方、穿橫膈食道裂孔入胃',
    tcm: '中醫稱「食管」「胃脘」，噎膈屬其病變。',
  },
  thymus: {
    name: '胸腺', latin: 'Thymus', group: 'thorax', meridian: 'REN',
    anatomy: '位於上縱膈胸骨柄後方，兒童發達、成年後萎縮為脂肪',
    tcm: '古代未單列；現代研究常與膻中穴的免疫調節相參。',
  },
  larynx: {
    name: '喉（甲狀軟骨、環狀軟骨、會厭）', latin: 'Larynx', group: 'headneck', meridian: 'REN',
    anatomy: '甲狀軟骨前突即喉結，是人迎、水突、廉泉定位的關鍵標誌',
    tcm: '喉為肺之門戶、聲音之關。失音、咽腫取廉泉、天突、少商。',
    caution: '喉部前方的穴位（廉泉、天突）淺刺即可，不可刺入喉腔。',
  },
  tongue: {
    name: '舌', latin: 'Tongue', group: 'headneck', meridian: 'HT',
    anatomy: '口腔內的肌性器官，由舌下神經支配運動',
    tcm: '舌為心之苗、脾之外候，舌診是中醫四診的核心之一。',
  },
  salivary: {
    name: '唾液腺（舌下腺、頜下腺）', latin: 'Sublingual & submandibular gland', group: 'headneck', meridian: 'ST',
    anatomy: '位於口底與下頜骨內側，分泌唾液',
    tcm: '唾為腎之液、涎為脾之液；口乾、流涎分屬不同臟腑。',
  },
};

export const CONNECTIVES = {
  costal_cartilage: {
    name: '肋軟骨', latin: 'Costal cartilages 1–7', group: 'thorax',
    anatomy: '第 1–7 肋以肋軟骨直接連於胸骨；胸骨角兩側即第 2 肋，是數肋間隙最可靠的起點',
    use: '胸部穴位（俞府、彧中、神藏、屋翳、膺窗…）全部靠肋間隙定位，肋軟骨是數肋的入口。',
  },
  interosseous_forearm: {
    name: '前臂骨間膜', latin: 'Interosseous membrane of forearm', group: 'upper',
    anatomy: '連接橈骨與尺骨的纖維膜，把兩骨固定成一個功能單位',
    use: '外關、支溝、三陽絡「在尺骨與橈骨之間」指的就是這層膜的表面；內關與外關前後相對，中間隔的也是它。',
  },
  interosseous_leg: {
    name: '小腿骨間膜', latin: 'Interosseous membrane of leg', group: 'lower',
    anatomy: '連接脛骨與腓骨的纖維膜，腓深神經與脛前動脈在其前方下行',
    use: '足三里、豐隆深刺時針尖抵到的硬韌組織即此膜。',
  },
  flexor_retinaculum: {
    name: '屈肌支持帶（腕橫韌帶）', latin: 'Flexor retinaculum of wrist', group: 'upper',
    anatomy: '橫跨腕骨溝形成腕隧道的頂，正中神經與屈指肌腱由其下通過',
    use: '大陵正在其近端邊緣；腕隧道症候群的針刺與鬆解都以這條韌帶為目標。',
  },
  long_plantar_ligament: {
    name: '足底長韌帶', latin: 'Long plantar ligament', group: 'lower',
    anatomy: '自跟骨下面延伸至蹠骨底，維持足縱弓',
    use: '足底筋膜炎的壓痛帶與湧泉、然谷一帶的解剖基礎。',
  },
  thyrohyoid: {
    name: '甲狀舌骨膜與莖突舌骨韌帶', latin: 'Thyrohyoid membrane & stylohyoid ligament', group: 'headneck',
    anatomy: '連接舌骨與甲狀軟骨、莖突與舌骨的纖維結構',
    use: '廉泉位於舌骨體上緣，取穴時摸到的硬邊即舌骨與這層膜。',
  },
};
