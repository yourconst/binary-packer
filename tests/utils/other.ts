import { Type } from 'protobufjs';
import * as BE from 'binary-encoder';

export const generateString = (length: number) => {
    const arr = new Array<string>(length);

    for (let i = 0; i < length; ++i) {
        arr[i] = Math.random() > 0.1 ? String.fromCharCode(Math.trunc(65 + 60 * Math.random())) : '😎';
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
