declare module 'riichi' {
    interface RiichiCalc {
        isAgari: boolean,
        yakuman: number,
        yaku: {[name: string]: string},
        han: number,
        fu: number,
        ten: number,
        name: string,
        text: string,
        oya: [number, number, number] | [number],
        ko: [number, number, number] | [number],
        error: boolean,
    }

    export default class Riichi {
        constructor(hand: string);

        isMenzen(): boolean
        calcDora(): void
        calcFu(): void
        calcTen(): void
        calcYaku(): void
        calc(): RiichiCalc
        disableWyakuman(): void
        disableKuitan(): void
        disableAka(): void
        enableLocalYaku(name: string): void
        disableYaku(name: string): void
    }
  }