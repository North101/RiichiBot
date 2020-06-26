import * as Discord from 'discord.js';
import Riichi from 'riichi';

import auth from '../auth.json';

class RiichiBot {
    bot: Discord.Client;

    constructor(bot: Discord.Client) {
        this.bot = bot;

        this.bot.on('ready', () => {
            console.log('Connected');
            console.log(`Logged in as: ${bot.user?.username} (${bot.user?.id})`);
        });
        this.bot.on('message', (message) => {
            if (message.author.bot) return;

            const args = message.content.split(/\s+/);
            switch (args[0]) {
                case '!riichi':
                case `<@${this.bot.user?.id}>`:
                case `<@!${this.bot.user?.id}>`: {
                    return this.handle(message, args.splice(1));
                }
            }
        });
        this.bot.login(auth.token);
    }

    isPlayerMention = (mention: string) => {
        return mention.startsWith('<@') && mention.endsWith('>');
    }

    parsePlayerMention = (mention: string) => {
        let playerID = mention.slice(2, -1);
        if (playerID.startsWith('!')) {
            return playerID.slice(1);
        }
        return playerID;
    }

    handle = (message: Discord.Message, args: string[]) => {
        const riichi = new Riichi(args[0]);
        const result = riichi.calc();
        console.log(result);
        if (result.error) {
            message.channel.send('Invalid Hand');
            message.react('👎');
        } else if (result.yakuman > 0) {
            message.channel.send([
                `${result.ten} ${this.scores(result.name)}`,
                `${result.oya.join(', ')} Dealer Win`,
                `${result.ko.join(', ')} Non-Dealer Win`,
            ].join('\n'));
            message.react('👍');
        } else {
            message.channel.send([
                `${result.ten} ${this.scores(result.name)}`,
                `${result.oya.join(', ')} Dealer Win`,
                `${result.ko.join(', ')} Non-Dealer Win`,
                `${result.han} Han / ${result.fu} Fu`,
                'Yaku:',
                ...Object.entries(result.yaku)
                    .filter(([_, value]) => value.endsWith('飜'))
                    .sort(([_key1, value1], [_key2, value2]) => {
                        if (value1 > value2) {
                            return 1;
                        } else if (value1 < value2) {
                            return -1;
                        } else {
                            return 0;
                        }
                    })
                    .map(([key, value]) => `    ${value.replace('飜', ' Han')}: ${this.yaku(key)}`),
            ].join('\n'));
            message.react('👍');
        }
    }

    scoresLookup: {[name: string]: string} = {
        '満貫': 'Mangan',
        '跳満': 'Haneman',
        '倍満': 'Baiman',
        '三倍満': 'Sanbaiman',
        '役満': 'Yakuman',
        '2倍役満': 'Double Yakuman',
        '3倍役満': 'Double Yakuman',
        '4倍役満': 'Double Yakuman',
        '5倍役満': 'Double Yakuman',
        '6倍役満': 'Double Yakuman',
        '包': 'Pao',
    };

    scores = (name: string) => {
        return this.scoresLookup[name] ?? name;
    }

    yakuLookup: {[name: string]: string} = {
        '立直': 'Ready Hand (Riichi)',
        '一発': 'One-Shot (Ippatsu)',
        '門前清自摸和': 'All Concealed (Menzenchin Tsumohou)',
        '平和': 'Flat Hand (Pinfu)',
        '一盃口': 'Double Sequence (Iipeikou)',
        '断幺九': 'Simple Hand (Tanyao(Chuu))',
        '役牌': 'Value Triplet (Set) (Yakuhai)',
        '役牌中': 'Value Triplet (Set) (Yakuhai)',
        '役牌発': 'Value Triplet (Set) (Yakuhai)',
        '役牌白': 'Value Triplet (Set) (Yakuhai)',
        '自風東': 'Player Wind (Jikaze)',
        '自風南': 'Player Wind (Jikaze)',
        '自風西': 'Player Wind (Jikaze)',
        '自風北': 'Player Wind (Jikaze)',
        '場風東': 'Round Wind (Bakaze)',
        '場風南': 'Round Wind (Bakaze)',
        '場風西': 'Round Wind (Bakaze)',
        '場風北': 'Round Wind (Bakaze)',
        '嶺上開花': 'Win Off The Replacement Tile (Rinshan Kaihou)',
        '搶槓': 'Robbing The Kan (Chankan)',
        '海底撈月': 'Last Pick (Haitei Raoyue)',
        '河底撈魚': 'Last Discard (Houtei Raoyui)',
        'ダブルリーチ': 'Double Riichi (Double Riichi)',
        '七対子': 'Seven Pairs (Chiitoitsu)',
        '全帯幺九': 'Mixed Terminal Hand (Chanta)',
        '三色同順': 'Triple Sequence (Sanshoku Doujun)',
        '一気通貫': 'Straight (Ittsu (Ikkitsuukan))',
        '対々': 'All Triplets (Toitoi)',
        '三暗刻': 'Three Concealed Triplets (Sanankou)',
        '三色同刻': 'Triple Triplets (Sanshoku Doukou)',
        '三槓子': 'Three Kans (Sankantsu)',
        '小三元': 'Little Three Dragons (Shousangen)',
        '混老頭': 'Pure Terminal Hand (Honroutou)',
        '二盃口': 'Double Double Sequence (Ryanpeikou)',
        '混一色': 'Mixed Flush (Honitsu)',
        '純全帯么': 'Mixed Ends Hand (Junchan)',
        '清一色': 'Pure Flush (Chinitsu)',
        '天和': 'Miracle Start (Dealer) (Tenhou)',
        '地和': 'Miracle Start (Non-Dealer) (Chiihou)',
        '国士無双': 'Thirteen Orphans (Kokushi Musou)',
        '九連宝燈': 'Nine Lanterns (Chuuren Poutou)',
        '四暗刻': 'Four Concealed Triples (Suuankou)',
        '大三元': 'Big Three Dragons (Daisangen)',
        '緑一色': 'All Green (Ryuuiisou)',
        '字一色': 'All Word Tiles (Tsuuiisou)',
        '小四喜': 'Four Little Winds (Shousuushii)',
        '大四喜': 'Four Big Winds (Daisuushii)',
        '清老頭': 'All Ends (Chinroutou)',
        '四槓子': 'Four Kans (Suukantsu)',
        '人和': 'Miracle Discard (Renhou)',
        '流し満貫': 'Pool Of Dreams*** (Nagashi Mangan)',
        '数え役満': 'Counted Yakuman (Kazoe Yakuman)',
    };

    yaku = (name: string) => {
        return this.yakuLookup[name] ?? name;
    }
}

// Initialize Discord Bot
const riichiBot = new RiichiBot(new Discord.Client());