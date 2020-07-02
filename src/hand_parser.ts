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
    EastWind = Winds.EastWind,
    SouthWind = Winds.SouthWind,
    WestWind = Winds.WestWind,
    NorthWind = Winds.NorthWind,
    WhiteDragon = 5,
    GreenDragon = 6,
    RedDragon = 7,
}

abstract class Hand {
    abstract format: () => string;
}

abstract class Tile extends Hand {}

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

class Stolen extends Hand {
    tile: Tile;

    constructor(tile: Tile) {
        super();

        assert(tile !== undefined);
        this.tile = tile;
    }

    format = () => `${this.tile.format()}`;
}

class Ron extends Hand {
    tile: Tile;

    constructor(tile: Tile) {
        super();

        assert(tile !== undefined);
        this.tile = tile;
    }

    format = () => this.tile.format();
}

class Dora extends Hand {
    tile: Tile;

    constructor(tile: Tile) {
        super();

        assert(tile !== undefined);
        this.tile = tile;
    }

    format = () => `d${this.tile.format()}`;
}

abstract class Flag extends Hand {}

class RiichiFlag extends Flag {
    double: boolean;

    constructor(double: boolean) {
        super();
        this.double = double;
    }

    format = () => this.double ? 'w' : 'r';
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

class LocalFlag extends Flag {
    format = () => 'o';
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

const tileLookup: { [tag: string]: (...values: string[]) => Tile } = {
    'sou': (tag) => new SouTile(tag),
    'man': (tag) => new ManTile(tag),
    'pin': (tag) => new PinTile(tag),
    'east': (tag) => new EastWindTile(parseInt(tag)),
    'south': (tag) => new SouthWindTile(parseInt(tag)),
    'west': (tag) => new WestWindTile(parseInt(tag)),
    'north': (tag) => new NorthWindTile(parseInt(tag)),
    'green': (tag) => new GreenDragonTile(parseInt(tag)),
    'red': (tag) => new RedDragonTile(parseInt(tag)),
    'white': (tag) => new WhiteDragonTile(parseInt(tag)),
};

const handLookup: { [tag: string]: (...values: string[]) => Hand } = {
    'stolen': (tag, ...values) => new Stolen(tileLookup[tag]?.(...values)),
    'ron': (tag, ...values) => new Ron(tileLookup[tag]?.(...values)),
    'dora': (tag, ...values) => new Dora(tileLookup[tag]?.(...values)),
    'riichi': (tag) => new RiichiFlag(tag === 'double'),
    'ippatsu': () => new IppatsuFlag(),
    'chankan': () => new RinshanFlag(),
    'rinshan': () => new RinshanFlag(),
    'haitei': () => new HaiteiFlag(),
    'houtei': () => new HaiteiFlag(),
    'local': () => new LocalFlag(),
    'wind': (tag) => new WindFlag(windLookup[tag]),
    'round': (tag) => new RoundFlag(windLookup[tag]),
};

export function parseHandArgs(args: string[], separator: string) {
    const elements: Hand[] = [];
    for (const arg of args) {
        const [tag, ...values] = arg.split(separator);
        const element = (handLookup[tag] ?? tileLookup[tag])?.(...values);
        if (element !== undefined) {
            elements.push(element);
        } else {
            throw Error(`Unknown element: ${element}`);
        }
    }

    const handTiles: Tile[] = [];
    const stolenTiles: Stolen[] = [];
    const dora: Dora[] = [];
    const flags: Flag[] = [];
    let ron: Ron | undefined;
    let wind: WindFlag = new WindFlag(Winds.SouthWind);
    let round: RoundFlag = new RoundFlag(Winds.EastWind);

    for (const element of elements) {
        if (element instanceof Tile) {
            handTiles.push(element);
        } else if (element instanceof Stolen) {
            stolenTiles.push(element);
        } else if (element instanceof Dora) {
            dora.push(element);
        } else if (element instanceof Flag) {
            flags.push(element);
        } else if (element instanceof Ron) {
            ron = element;
        } else if (element instanceof WindFlag) {
            wind = element;
        } else if (element instanceof RoundFlag) {
            round = element;
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