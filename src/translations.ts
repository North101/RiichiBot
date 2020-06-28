const hanTranslations: { [name: string]: string } = {
    '役満': 'Yakuman',
    'ダブル役満': 'Double Yakuman',
}

export const translateHan = (name: string) => {
    return hanTranslations[name] ?? name;
}

const scoreTranslations: { [name: string]: string } = {
    '満貫': 'Mangan',
    '跳満': 'Haneman',
    '倍満': 'Baiman',
    '三倍満': 'Sanbaiman',
    '役満': 'Yakuman',
    '倍役満': 'Double Yakuman',
    '2倍役満': '2x Double Yakuman',
    '3倍役満': '3x Double Yakuman',
    '4倍役満': '4x Double Yakuman',
    '包': 'Pao',
};

export const translateScore = (name: string) => {
    return scoreTranslations[name] ?? name;
}

const yakuTranslations: { [name: string]: string } = {
    'ドラ': 'Dora',
    '赤ドラ': 'Red Five',
    '立直': 'Ready Hand (Riichi)',
    '一発': 'One-Shot (Ippatsu)',
    '門前清自摸和': 'All Concealed (Menzenchin Tsumohou)',
    '平和': 'Flat Hand (Pinfu)',
    '一盃口': 'Double Sequence (Iipeikou)',
    '断么九': 'Simple Hand (Tanyaoooooooooooooo)',
    '役牌': 'Value Triplet (Yakuhai)',
    '役牌中': 'Red Dragon Triplet (Chun Yakuhai)',
    '役牌発': 'Green Dragon Triplet (Hatsu Yakuhai)',
    '役牌白': 'White Dragon Triplet (Haku Yakuhai)',
    '自風': 'Player Wind (Jikaze)',
    '自風東': 'East Player Wind (Ton Jikaze)',
    '自風南': 'South Player Wind (Nan Jikaze)',
    '自風西': 'West Player Wind (Shā Jikaze)',
    '自風北': 'North Player Wind (Pei Jikaze)',
    '場風': 'Round Wind (Bakaze)',
    '場風東': 'East Round Wind (Ton Bakaze)',
    '場風南': 'South Round Wind (Nan Bakaze)',
    '場風西': 'West Round Wind (Shā Bakaze)',
    '場風北': 'North Round Wind (Pei Bakaze)',
    '嶺上開花': 'Win Off The Replacement Tile (Rinshan Kaihou)',
    '搶槓': 'Robbing The Kan (Chankan)',
    '海底摸月': 'Win By Last Draw (Haitei Raoyue)',
    '河底撈魚': 'Win By Last Discard (Houtei Raoyui)',
    'ダブル立直': 'Double Riichi (Double Riichi)',
    '七対子': 'Seven Pairs (Chiitoitsu)',
    '大七星': 'Great Seven Stars (Dai Shichisei)',
    '混全帯么九': 'Mixed Terminal Hand (Chanta)',
    '混老頭': 'All Terminals And Honors (Honroutou)',
    '三色同順': 'Triple Sequence (Sanshoku Doujun)',
    '一気通貫': 'Straight (Ittsu (Ikkitsuukan))',
    '対々': 'All Triplets (Toitoi)',
    '対々和': 'All Triplets (Toitoi)',
    '三暗刻': 'Three Concealed Triplets (Sanankou)',
    '三色同刻': 'Triple Triplets (Sanshoku Doukou)',
    '三槓子': 'Three Kans (Sankantsu)',
    '小三元': 'Little Three Dragons (Shousangen)',
    '純全帯么九': 'Pure Terminal Hand (Junchantaiyaochuu)',
    '二盃口': 'Double Double Sequence (Ryanpeikou)',
    '混一色': 'Mixed Flush (Honitsu)',
    '純全帯么': 'Mixed Ends Hand (Junchan)',
    '清一色': 'Pure Flush (Chinitsu)',
    '天和': 'Miracle Start (Dealer) (Tenhou)',
    '地和': 'Miracle Start (Non-Dealer) (Chiihou)',
    '国士無双': 'Thirteen Orphans (Kokushi Musou)',
    '国士無双十三面待ち': 'Thirteen Orphans 13 Closed Wait (Kokushi Musou Juusan Menmachi)',
    '九蓮宝燈': 'Nine Lanterns (Chuuren Poutou)',
    '純正九蓮宝燈': 'Pure Nine Lanterns  (Junsei Chuuren Poutou)',
    '四暗刻': 'Four Concealed Triples (Suuankou)',
    '四暗刻単騎待ち': 'Four Concealed Triples Pair Wait (Suuankou Tanki)',
    '大三元': 'Big Three Dragons (Daisangen)',
    '緑一色': 'All Green (Ryuuiisou)',
    '字一色': 'All Word Tiles (Tsuuiisou)',
    '小四喜': 'Four Little Winds (Shousuushii)',
    '大四喜': 'Four Big Winds (Daisuushii)',
    '清老頭': 'All Ends (Chinroutou)',
    '四槓子': 'Four Kans (Suukantsu)',
    '人和': 'Miracle Discard (Renhou)',
    '流し満貫': 'Pool Of Dreams (Nagashi Mangan)',
    '数え役満': 'Counted Yakuman (Kazoe Yakuman)',
};

export const translateYaku = (name: string) => {
    return yakuTranslations[name] ?? name;
}