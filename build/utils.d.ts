export declare class Utils {
    static test(testFunc: Function, cnt: number, args: any[] | {
        (i?: number): any[];
    }): number;
    static charString(char: string, length: number): string;
    static getAlignedStringNumber(n: number, c: number, d: number): string;
    static toDecimal(n: number, decimal: number): number;
    static logObject(obj: object, options?: {
        numberCeil: number;
        numberDecimal: number;
    }): void;
}
