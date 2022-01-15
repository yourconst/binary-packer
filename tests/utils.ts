import { performance } from "perf_hooks";

export class Utils {
    static test(testFunc: Function, cnt: number, args: any[] | {(i?: number): any[]}) {
        let accTime = 0;

        for (let i=0; i<cnt; ++i) {
            const rargs = typeof args === 'function' ? args(i) : args;

            const beginItTime = performance.now();
            testFunc(...rargs);
            accTime += performance.now() - beginItTime;
        }

        return accTime;
    }

    static charString(char: string, length: number) {
        return new Array(Math.max(0, length)).fill(char).join('');
    }

    static getAlignedStringNumber(n: number, c: number, d: number, empty = '') {
        let [ceil, decimal = ''] = n.toString().split('.');

        return `${Utils.charString(empty, c - ceil.length)}${ceil}.${decimal.slice(0, d)}${Utils.charString(empty, d - decimal.length)}`
    }

    static toDecimal(n: number, decimal: number) {
        return Math.floor(n * (10 ** decimal)) / (10 ** decimal);
    }

    static logObject(obj: object, options: {numberCeil: number, numberDecimal: number} = {numberCeil: 7, numberDecimal: 3}) {
        console.log(Object.entries(obj).map(([key, val]) => `${key}: ${
            (typeof val === 'number') && options?.numberDecimal ? Utils.getAlignedStringNumber(val, options.numberCeil, options.numberDecimal) : val
        }`).join('  ||  '));
    }
}
