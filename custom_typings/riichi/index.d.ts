declare module 'riichi' {
    export interface RiichiCalc {
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
        hairi?: {
            now: number;
            wait?: {
                [tile: string]: number;
            };
            [tile: string]: {
                [tile: string]: number;
            };
        };
        hairi7and13?: {
            now: number;
            wait?: {
                [tile: string]: number;
            };
        };
    }

    export default class Riichi {
        constructor(hand: string);

        isMenzen(): boolean;
        calcDora(): void;
        calcFu(): void;
        calcTen(): void;
        calcYaku(): void;
        calc(): RiichiCalc;
        disableWyakuman(): void;
        disableKuitan(): void;
        disableAka(): void;
        enableLocalYaku(name: string): void;
        disableYaku(name: string): void;
    }
  }