declare module 'riichi' {
    export interface Hairi {
        now: number;
        wait?: {
            [tile: string]: number;
        };
    }
    export interface HairiReplace {
        [tile: string]: {
            [tile: string]: number;
        };
    }

    export interface RiichiResult {
        isAgari: boolean;
        yakuman: number;
        yaku: {[name: string]: string};
        han: number;
        fu: number;
        ten: number;
        name: string;
        text: string;
        oya: [number, number, number] | [number];
        ko: [number, number, number] | [number];
        error: boolean;
    }

    export interface RiichiResultHairi extends RiichiResult {
        hairi: Hairi & HairiReplace;
        hairi7and13: Hairi & HairiReplace;
    }

    export default class Riichi {
        constructor(hand: string);

        isMenzen(): boolean;
        calcDora(): void;
        calcFu(): void;
        calcTen(): void;
        calcYaku(): void;
        calc(): RiichiResult | RiichiResultHairi;
        disableWyakuman(): void;
        disableKuitan(): void;
        disableAka(): void;
        enableLocalYaku(name: string): void;
        disableYaku(name: string): void;
    }
  }