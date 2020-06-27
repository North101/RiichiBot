import * as Discord from 'discord.js';
import Riichi from 'riichi';

import auth from '../auth.json';

function assert(input: boolean, message?: string): asserts input {
    if (!input) throw new Error(message);
}

enum Winds {
    East = 1,
    South = 2,
    West = 3,
    North = 4,
}

abstract class Thing {
    abstract format(): string;
}

abstract class Tile extends Thing {
    abstract format(): string;
}

abstract class SimpleTile extends Tile {
    value: string;

    constructor(value: string) {
        super();

        assert(value.length > 0 && value.split('').every((v) => v.match(/[1-9]/)));

        this.value = value;
    }
}

class SouTile extends SimpleTile {
    format = () => `${this.value}s`;
}

class PinTile extends SimpleTile {
    format = () => `${this.value}p`;
}

class ManTile extends SimpleTile {
    format = () => `${this.value}m`;
}

abstract class HonorTile extends Tile {
    index: number;
    count: number;

    constructor(index: number, count: number) {
        super();

        this.index = index;
        this.count = !isNaN(count) && isFinite(count) && count > 0 ? count : 1;
    }

    format = () => `${`${this.index}`.repeat(this.count)}z`;
}

abstract class WindTile extends HonorTile {}

class EastWindTile extends WindTile {
    constructor(count: number) {
        super(1, count);
    }
}

class SouthWindTile extends WindTile {
    constructor(count: number) {
        super(2, count);
    }
}

class WestWindTile extends WindTile {
    constructor(count: number) {
        super(3, count);
    }
}

class NorthWindTile extends WindTile {
    constructor(count: number) {
        super(4, count);
    }
}

abstract class DragonTile extends HonorTile {}

class GreenDragonTile extends DragonTile {
    constructor(count: number) {
        super(5, count);
    }
}

class RedDragonTile extends DragonTile {
    constructor(count: number) {
        super(6, count);
    }
}

class WhiteDragonTile extends DragonTile {
    constructor(count: number) {
        super(7, count);
    }
}


class Wind extends Thing {
    wind: Winds;

    constructor(wind: Winds) {
        super();
        this.wind = wind;
    }

    format = () => `${this.wind.valueOf()}`;
}

class Stolen extends Thing {
    tile: Tile;

    constructor(tile: Tile) {
        super();
        this.tile = tile;
    }

    format = () => `${this.tile.format()}`;
}

class Round extends Thing {
    wind: Winds;

    constructor(wind: Winds) {
        super();
        this.wind = wind;
    }

    format = () => `${this.wind.valueOf()}`;
}

class Ron extends Thing {
    tile: Tile;

    constructor(tile: Tile) {
        super();
        this.tile = tile;
    }

    format = () => this.tile.format();
}

abstract class Flag extends Thing {}

class RiichiFlag extends Flag {
    format = () => 'r';
}

class IppatsuFlag extends Flag {
    format = () => 'i';
}

class RinshanFlag extends Flag {
    format = () => 'k';
}

class HaiteiFlag extends Flag {
    format = () => 'h';
}


const windLookup: {[wind: string]: Winds} = {
    'east': Winds.East,
    'south': Winds.South,
    'west': Winds.West,
    'north': Winds.North,
};
const tileLookup: { [tag: string]: (values: string[]) => Tile } = {
    'sou': (values) => new SouTile(values[0]),
    'man': (values) => new ManTile(values[0]),
    'pin': (values) => new PinTile(values[0]),
    'east': (values) => new EastWindTile(parseInt(values[0])),
    'south': (values) => new SouthWindTile(parseInt(values[0])),
    'west': (values) => new WestWindTile(parseInt(values[0])),
    'north': (values) => new NorthWindTile(parseInt(values[0])),
    'green': (values) => new GreenDragonTile(parseInt(values[0])),
    'red': (values) => new RedDragonTile(parseInt(values[0])),
    'white': (values) => new WhiteDragonTile(parseInt(values[0])),
};
const lookup: { [tag: string]: (values: string[]) => Thing } = {
    'stolen': (values) => new Stolen(tileLookup[values[0]]?.(values.slice(1))),
    'ron': (values) => new Ron(tileLookup[values[0]]?.(values.slice(1))),
    'riichi': (_values) => new RiichiFlag(),
    'ippatsu': (_values) => new IppatsuFlag(),
    'chankan': (_values) => new RinshanFlag(),
    'rinshan': (_values) => new RinshanFlag(),
    'haitei': (_values) => new HaiteiFlag(),
    'houtei': (_values) => new HaiteiFlag(),
    'wind': (values) => new Wind(windLookup[values[0]]),
    'round': (values) => new Round(windLookup[values[0]]),
};

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
        let arg: string;
        try {
            if (args[0].includes(':') || args.length > 1) {
                const tiles = new Array<Thing>();
                for (const arg of args) {
                    const [tag, ...values] = arg.split(':');
                    const tile = (lookup[tag] ?? tileLookup[tag])?.(values);
                    if (tile !== undefined) {
                        tiles.push(tile);
                    }
                }

                const handTiles: string[] = [];
                const stolenTiles: string[] = [];
                let ron: Ron | undefined;
                let flags = new Array<string>();
                let wind: Wind = new Wind(Winds.South);
                let round: Round = new Wind(Winds.East);

                for (const tile of tiles) {
                    if (tile instanceof Tile) {
                        handTiles.push(tile.format());
                    } else if (tile instanceof Stolen) {
                        stolenTiles.push(tile.format());
                    } else if (tile instanceof Ron) {
                        ron = tile;
                    } else if (tile instanceof Wind) {
                        wind = tile;
                    } else if (tile instanceof Round) {
                        round = tile;
                    } else if (tile instanceof Flag) {
                        flags.push(tile.format());
                    }
                }

                const data: string[] = [];
                if (handTiles.length > 0) {
                    data.push(handTiles.join(''));
                }
                if (stolenTiles.length > 0) {
                    data.push(...stolenTiles);
                }
                if (ron !== undefined) {
                    data.push(ron.format());
                }
                
                flags.push(wind.format(), round.format());
                data.push(flags.join(''));

                arg = data.join('+');
                console.log(arg);
            } else {
                arg = args[0];
            }

            const riichi = new Riichi(arg);
            const result = riichi.calc();
            console.log(result);
            if (result.error) {
                message.channel.send('Invalid Hand');
                message.react('💩');
            } else if (result?.hairi !== undefined) {
                const hairi = result.hairi;
                delete hairi['now'];
                if (hairi.wait !== undefined) {
                    message.channel.send(`Waits: ${Object.keys(hairi.wait).join(', ')}`);
                    message.react('🀄');
                } else if (Object.keys(hairi).length > 0) {
                    message.channel.send([
                        'Invalid Hand. Replace:',
                        ...Object.entries(hairi).map(([key, value]) => {
                            return `${key}: ${Object.keys(value).join(', ')}`;
                        })
                    ].join('\n'));
                    message.react('🀄');
                } else {
                    message.channel.send('Invalid Hand');
                    message.react('💩');
                }
            } else {
                message.channel.send([
                    `${result.ten} ${this.scores(result.name)}`,
                    `${result.oya.join(', ')} Dealer Win`,
                    `${result.ko.join(', ')} Non-Dealer Win`,
                    `${result.han} Han / ${result.fu} Fu`,
                    'Yaku:',
                    ...Object.entries(result.yaku)
                        .sort(([_key1, value1], [_key2, value2]) => {
                            if (value1 > value2) {
                                return 1;
                            } else if (value1 < value2) {
                                return -1;
                            } else {
                                return 0;
                            }
                        })
                        .map(([key, value]) => `  •  ${this.hans(value.replace('飜', ' Han'))}: ${this.yaku(key)}`),
                ].join('\n'));
                message.react('🀄');
            }
        } catch (exception) {
            console.log(exception);

            message.channel.send('Invalid Hand');
            message.react('💩');
        }
    }

    hanLookup: { [name: string]: string } = {
        '役満': 'Yakuman',
        'ダブル役満': 'Double Yakuman',
    }

    hans = (name: string) => {
        return this.hanLookup[name] ?? name;
    }

    scoreLookup: { [name: string]: string } = {
        '満貫': 'Mangan',
        '跳満': 'Haneman',
        '倍満': 'Baiman',
        '三倍満': 'Sanbaiman',
        '役満': 'Yakuman',
        '倍役満': 'Double Yakuman',
        '2倍役満': '2 Double Yakuman',
        '3倍役満': '3 Double Yakuman',
        '4倍役満': '4 Double Yakuman',
        '包': 'Pao',
    };

    scores = (name: string) => {
        return this.scoreLookup[name] ?? name;
    }

    yakuLookup: { [name: string]: string } = {
        '立直': 'Ready Hand (Riichi)',
        '一発': 'One-Shot (Ippatsu)',
        '門前清自摸和': 'All Concealed (Menzenchin Tsumohou)',
        '平和': 'Flat Hand (Pinfu)',
        '一盃口': 'Double Sequence (Iipeikou)',
        '断么九': 'Simple Hand (Tanyaoooooooooooooo)',
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
        '対々和': 'All Triplets (Toitoi)',
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
        '四暗刻単騎待ち': 'Four Concealed Triples Pair Wait (Suuankou Tanki)',
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