import { Endian } from "../../types";
import { _StringEncoding } from "../../types/types";
import type { StringDecoder } from "node:string_decoder";

function isFunctionNative(f: Function) {
    return /\[native code\]\s*\}$/g.test(f.toString());
}

function checkFNAndTryGet(f: Function): any {
    return f && isFunctionNative(f) ? f : null;
}

function getDeviceEndian(): Endian {
    const ui8a = new Uint8Array([1, 2]);
    const ui16a = new Uint16Array(ui8a.buffer);

    return ui16a[0] === 1 + (2 << 8) ? 'le' : 'be';
}

const B = globalThis['Buffer'];
let SD: typeof StringDecoder;
try {
    SD = require('node:string_decoder').StringDecoder;
} finally {}

const isBufferNative = !!checkFNAndTryGet(B?.prototype?.utf8Write);

export const _native: {
    readonly endian: Endian;
    readonly Buffer?: BufferConstructor;
    readonly StringDecoder?: typeof StringDecoder;
    readonly tryCreateStringDecoder: (encoding: _StringEncoding) => StringDecoder;
    readonly allocUnsafe?: (size: number) => Buffer;
    readonly byteLength?: BufferConstructor['byteLength'];
    readonly encoders: {
        [key in _StringEncoding]: {
            readonly write?: (str: string, offset?: number, length?: number) => number;
            readonly slice?: (start?: number, end?: number) => string;
        };
    };
} = {
    endian: getDeviceEndian(),
    Buffer: isBufferNative ? B : null,
    StringDecoder: SD,
    tryCreateStringDecoder: (encoding: _StringEncoding) => SD ? new SD(encoding) : null,
    allocUnsafe: isBufferNative ? B.allocUnsafe : null,
    byteLength: isBufferNative ? B.byteLength : null,
    encoders: {
        utf8: {
            write: checkFNAndTryGet(B?.prototype?.utf8Write),
            slice: checkFNAndTryGet(B?.prototype?.utf8Slice),
        },
        ucs2: {
            write: checkFNAndTryGet(B?.prototype?.ucs2Write),
            slice: checkFNAndTryGet(B?.prototype?.ucs2Slice),
        },
        ascii: {
            write: checkFNAndTryGet(B?.prototype?.asciiWrite),
            slice: checkFNAndTryGet(B?.prototype?.asciiSlice),
        },
    },
};
