import * as Discord from 'discord.js';
import dotenv from 'dotenv';
import Riichi from 'riichi';

dotenv.config();

function assert(input: boolean, message?: string): asserts input {
    if (!input) throw new Error(message);
}

enum Winds {
    EastWind = 1,
    SouthWind = 2,
    WestWind = 3,
    NorthWind = 4,
}

enum Honors {   
    EastWind = 1,
    SouthWind = 2,
    WestWind = 3,
    NorthWind = 4,
    WhiteDragon = 5,
    GreenDragon = 6,
    RedDragon = 7,
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

        assert(value.length > 0 && value.split('').every((v) => v.match(/[0-9Rr]/g)));

        this.value = value.replace(/[Rr]/g, '0');
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
    honor: Honors;
    count: number;

    constructor(honor: Honors, count: number) {
        super();

        this.honor = honor;
        this.count = !isNaN(count) && isFinite(count) && count > 0 ? count : 1;
    }

    format = () => `${`${this.honor.valueOf()}`.repeat(this.count)}z`;
}

abstract class WindTile extends HonorTile {}

class EastWindTile extends WindTile {
    constructor(count: number) {
        super(Honors.EastWind, count);
    }
}

class SouthWindTile extends WindTile {
    constructor(count: number) {
        super(Honors.SouthWind, count);
    }
}

class WestWindTile extends WindTile {
    constructor(count: number) {
        super(Honors.WestWind, count);
    }
}

class NorthWindTile extends WindTile {
    constructor(count: number) {
        super(Honors.NorthWind, count);
    }
}

abstract class DragonTile extends HonorTile {}

class WhiteDragonTile extends DragonTile {
    constructor(count: number) {
        super(Honors.WhiteDragon, count);
    }
}

class GreenDragonTile extends DragonTile {
    constructor(count: number) {
        super(Honors.GreenDragon, count);
    }
}

class RedDragonTile extends DragonTile {
    constructor(count: number) {
        super(Honors.RedDragon, count);
    }
}

class Stolen extends Thing {
    tile: Tile;

    constructor(tile: Tile) {
        super();

        assert(tile !== undefined);
        this.tile = tile;
    }

    format = () => `${this.tile.format()}`;
}

class Ron extends Thing {
    tile: Tile;

    constructor(tile: Tile) {
        super();

        assert(tile !== undefined);
        this.tile = tile;
    }

    format = () => this.tile.format();
}

class Dora extends Thing {
    tile: Tile;

    constructor(tile: Tile) {
        super();

        assert(tile !== undefined);
        this.tile = tile;
    }

    format = () => `d${this.tile.format()}`;
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

class RoundFlag extends Flag {
    wind: Winds;

    constructor(wind: Winds) {
        super();

        assert(wind !== undefined);
        this.wind = wind;
    }

    format = () => `${this.wind.valueOf()}`;
}

class WindFlag extends Flag {
    wind: Winds;

    constructor(wind: Winds) {
        super();

        assert(wind !== undefined);
        this.wind = wind;
    }

    format = () => `${this.wind.valueOf()}`;
}

const windLookup: {[wind: string]: Winds} = {
    'east': Winds.EastWind,
    'south': Winds.SouthWind,
    'west': Winds.WestWind,
    'north': Winds.NorthWind,
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
    'dora': (values) => new Dora(tileLookup[values[0]]?.(values.slice(1))),
    'riichi': (_values) => new RiichiFlag(),
    'ippatsu': (_values) => new IppatsuFlag(),
    'chankan': (_values) => new RinshanFlag(),
    'rinshan': (_values) => new RinshanFlag(),
    'haitei': (_values) => new HaiteiFlag(),
    'houtei': (_values) => new HaiteiFlag(),
    'wind': (values) => new WindFlag(windLookup[values[0]]),
    'round': (values) => new RoundFlag(windLookup[values[0]]),
};

class RiichiBot {
    separator = '=';
    bot: Discord.Client;

    constructor(bot: Discord.Client) {
        this.bot = bot;

        this.bot.on('ready', () => {
            console.log('Connected');
            console.log(`Logged in as: ${bot.user?.username} (${bot.user?.id})`);

            this.bot.user!.setAvatar('https://iconarchive.com/icons/google/noto-emoji-activities/1024/52779-mahjong-red-dragon-icon.png');
            this.bot.user!.setActivity({
                name: '!riichi',
                type: 'LISTENING',
            });
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
        this.bot.login(process.env.DISCORD_BOT_TOKEN);
    }

    parseHand = (args: string[]) => {
        const tiles: Thing[] = [];
        for (const arg of args) {
            const [tag, ...values] = arg.split(this.separator);
            const tile = (lookup[tag] ?? tileLookup[tag])?.(values);
            if (tile !== undefined) {
                tiles.push(tile);
            }
        }

        const handTiles: Tile[] = [];
        const stolenTiles: Stolen[] = [];
        const dora: Dora[] = [];
        const flags: Flag[] = [];
        let ron: Ron | undefined;
        let wind: WindFlag = new WindFlag(Winds.SouthWind);
        let round: RoundFlag = new RoundFlag(Winds.EastWind);

        for (const tile of tiles) {
            if (tile instanceof Tile) {
                handTiles.push(tile);
            } else if (tile instanceof Stolen) {
                stolenTiles.push(tile);
            } else if (tile instanceof Dora) {
                dora.push(tile);
            } else if (tile instanceof Flag) {
                flags.push(tile);
            } else if (tile instanceof Ron) {
                ron = tile;
            } else if (tile instanceof WindFlag) {
                wind = tile;
            } else if (tile instanceof RoundFlag) {
                round = tile;
            }
        }

        const data: string[] = [];
        if (handTiles.length > 0) {
            data.push(handTiles.map((tile) => tile.format()).join(''));
        }
        if (stolenTiles.length > 0) {
            data.push(...stolenTiles.map((tile) => tile.format()));
        }
        if (ron !== undefined) {
            data.push(ron.format());
        }
        if (dora.length > 0) {
            data.push(...dora.map((tile) => tile.format()));
        }
        
        flags.push(round, wind);
        data.push(flags.map((flag) => flag.format()).join(''));

        return data.join('+');
    }

    handle = (message: Discord.Message, args: string[]) => {
        let arg: string = message.content;
        try {
            if (args[0].includes(this.separator) || args.length > 1) {
                arg = this.parseHand(args);
            } else {
                arg = args[0];
            }
            console.log(arg);

            const riichi = new Riichi(arg);
            const result = riichi.calc();
            console.log(result);
            if (result.error) {
                message.channel.send([
                    arg,
                    'Invalid Hand',
                ].join('\n'));
                message.react('💩');
            } else if ('hairi' in result) {
                const now = result.hairi.now;
                const wait = result.hairi.wait;
                const hairi = Object.entries(result.hairi)
                    .filter(([key, _value]) => !['now', 'wait'].includes(key))
                    .reduce((result, [key, value]) => result.set(key, value), new Map<string, {[tile: string]: number}>());

                if (wait !== undefined) {
                    message.channel.send([
                        arg,
                        `Waits: ${Object.keys(wait).join(', ')}`
                    ].join('\n'));
                    message.react('🀄');
                } else if (hairi.size > 0) {
                    message.channel.send([
                        arg,
                        'Invalid Hand. Replace:',
                        ...[...hairi.entries()].map(([key, value]) => {
                            return `${key}: ${Object.keys(value).join(', ')}`;
                        })
                    ].join('\n'));
                    message.react('🀄');
                } else {
                    message.channel.send([
                        arg,
                        'Invalid Hand'
                    ].join('\n'));
                    message.react('💩');
                }
            } else {
                message.channel.send([
                    arg,
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

            message.channel.send([
                arg,
                'Invalid Hand',
            ].join('\n'));
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
        '2倍役満': '2x Double Yakuman',
        '3倍役満': '3x Double Yakuman',
        '4倍役満': '4x Double Yakuman',
        '包': 'Pao',
    };

    scores = (name: string) => {
        return this.scoreLookup[name] ?? name;
    }

    yakuLookup: { [name: string]: string } = {
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
        '三色同順': 'Triple Sequence (Sanshoku Doujun)',
        '一気通貫': 'Straight (Ittsu (Ikkitsuukan))',
        '対々': 'All Triplets (Toitoi)',
        '対々和': 'All Triplets (Toitoi)',
        '三暗刻': 'Three Concealed Triplets (Sanankou)',
        '三色同刻': 'Triple Triplets (Sanshoku Doukou)',
        '三槓子': 'Three Kans (Sankantsu)',
        '小三元': 'Little Three Dragons (Shousangen)',
        '純全帯么九': 'Pure Terminal Hand (Honroutou)',
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

    yaku = (name: string) => {
        return this.yakuLookup[name] ?? name;
    }
}

// Initialize Discord Bot
const riichiBot = new RiichiBot(new Discord.Client());