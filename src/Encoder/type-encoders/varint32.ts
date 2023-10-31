import { TypeEncoder } from '../TypeEncoder.interface';
import * as Types from '../../types/types';
import { BufferPointer } from '../BufferPointer';

const maxUint31 = 2 ** 31 - 1;
const checkRange = (value: number) => {
    if (!isFinite(value) || Math.abs(value) > maxUint31 || Math.trunc(value) !== value) {
        throw new Error(`Value doesn't satisfy constraint int32`, { cause: value });
    }
};
const specificSizes = new Map([
    [0, 1], [64, 2], [8192, 3], [1048576, 4], [134217728, 5],
])
const getSize = (value) => {
    const ss = specificSizes.get(value);
    if (ss) {
        return ss;
    }
    return Math.ceil((Math.log2(Math.abs(value)) + 1) / 7);
};

export class _te_varint32 implements TypeEncoder<number> {
    readonly isSizeFixed = false;

    constructor(readonly schema: Types.VarInt32) {}

    getSize(value: number) {
        return getSize(value);
    }

    checkGetSize(value: number) {
        checkRange(value);
        
        return getSize(value);
    }

    encode(bp: BufferPointer, value: number) {
        while (true) {
            const byte = value & 0x7f;
            value >>= 7;
            if (
                (value === 0 && (byte & 0x40) === 0) ||
                (value === -1 && (byte & 0x40) !== 0)
            ) {
                bp.writeByte(byte);
                break;
            }

            bp.writeByte(byte | 0x80);
        }
    }

    decode(bp: BufferPointer) {
        let result = 0;
        let shift = 0;

        while (true) {
            const byte = bp.readByte();
            result |= (byte & 0x7f) << shift;
            shift += 7;
            if ((0x80 & byte) === 0) {
                if (shift < 32 && (byte & 0x40) !== 0) {
                    return result | (~0 << shift);
                }
                return result;
            }
        }
    }

    getSchema(): Types.Schema {
        return 'varint32';
    }
}
