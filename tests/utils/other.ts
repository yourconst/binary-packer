import { Type } from 'protobufjs';
import * as BE from 'binary-encoder';

export const randInt = (min = -(2 ** 51), max = (2 ** 51) - 1) => Math.trunc(min + (max - min) * Math.random());
export const randBigInt = (min?: number, max?: number) => BigInt(randInt(min, max));
export const randBool = () => [true, false][Math.trunc(2 * Math.random())];
export const randBoolNull = () => [true, false, null][Math.trunc(3 * Math.random())];

export const randString = (length: number) => {
    const arr = new Array<string>(length);

    for (let i = 0; i < length; ++i) {
        arr[i] = Math.random() > 0.1 ? String.fromCharCode(randInt(40, 200)) : '😎';
        // arr[i] = '😎';
    }

    return arr.join('');
};

export const createCycleIndexRunner = (length: number) => {
    let i = 0;
    return () => (i++) % length;
};

export const getProtobufEncoder = (type: Type, name = 'Protobuf') => ({
    name,
    encode: (v: any) => type.encode(v).finish(),
    decode: (b: Uint8Array) => <any> type.decode(b),
});

export const getOtherBinaryEncoder = (type: any, name = 'OtherBinaryEncoder') => ({
    name,
    encode: <any> BE.compileEncoder(type),
    decode: <any> BE.compileDecoder(type),
});
