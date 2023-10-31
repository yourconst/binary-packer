import { Type as PBType } from 'protobufjs';
import * as OBE from 'binary-encoder';
import { _StringEncoding } from '../../src/types/types';

export namespace Helpers {
    export namespace Random {
        export const number = (min = 0, max = 1) => min + (max - min) * Math.random();
        export const int = (min = -(2 ** 51), max = (2 ** 51) - 1) => Math.trunc(number(min, max));
        export const uint = (max?: number, min = 0) => int(min, max);
        export const bigInt = (min?: number, max?: number) => BigInt(int(min, max));
        export const bool = () => [true, false][uint(2)];
        export const boolNull = () => [true, false, null][uint(3)];

        export const uint8 = () => uint((2 ** 8) - 1);
        export const int8 = () => int(-(2**7), (2**7) - 1);
        export const uint16 = () => uint((2 ** 16) - 1);
        export const int16 = () => int(-(2 ** 15), (2 ** 15) - 1);
        export const uint32 = () => uint((2 ** 32) - 1);
        export const int32 = () => int(-(2 ** 31), (2 ** 31) - 1);
        // according to js number (float64) resolution
        export const uint64 = () => bigInt(0, (2 ** 63) - 1);
        export const int64 = () => bigInt(-(2 ** 62), (2 ** 62) - 1);
        export const float32 = () => number(-(2 ** 23) + 1, (2 ** 23) - 1);
        export const float64 = () => number(-(2 ** 52) + 1, (2 ** 52) - 1);

        export const stringASCII = (length: number) => {
            const arr = new Array<string>(length);
        
            for (let i = 0; i < length; ++i) {
                arr[i] = String.fromCharCode(int(40, 200));
            }
        
            return arr.join('');
        };

        export const stringUTF8 = (length: number) => {
            const arr = new Array<string>(length);
        
            for (let i = 0; i < length; ++i) {
                arr[i] = Math.random() > 0.1 ? String.fromCharCode(int(40, 200)) : '😎';
                // arr[i] = '😎';
            }
        
            return arr.join('');
        };
    }

    export namespace Encoder {
        export interface IEncoder<T = any, R = Uint8Array> {
            readonly label: string;
            readonly encode: (value: T) => R;
            readonly decode: (buffer: R) => T;
        }

        export const getProtobuf = (type: PBType, label = 'Protobuf'): IEncoder => ({
            label,
            encode: (v) => type.encode(v).finish(),
            decode: (b) => type.decode(b),
        });

        export const getOtherBinaryEncoder = (type: any, label = 'OtherBinaryEncoder'): IEncoder => ({
            label,
            encode: <any> OBE.compileEncoder(type),
            decode: <any> OBE.compileDecoder(type),
        });

        BigInt.prototype['toJSON'] = function() { return this.toString(); }

        export const getJSON = (label = 'JSON'): IEncoder<any, string> => ({
            label,
            encode: JSON.stringify,
            decode: JSON.parse,
        });

        export const getJSONBinary = (encoding: _StringEncoding, label = 'JSONBinary ' + encoding): IEncoder<any, Buffer> => ({
            label,
            encode: (v) => Buffer.from(JSON.stringify(v), encoding),
            decode: (b) => JSON.parse(b.toString(encoding)),
        });
    }

    export const generateArray = <T>(count: number, generator: (index?: number) => T) => {
        return new Array(count).fill(1).map((_, index) => generator(index));
    };

    export const createCycleArrayRunner = <T>(array: T[]) => {
        let i = 0;
        return () => array[(i++) % array.length];
    };

    export const createCycleIndexRunner = (length: number) => {
        let i = 0;
        return () => (i++) % length;
    };

    export const sleep = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));
}
