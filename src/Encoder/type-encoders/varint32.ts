import { TypeEncoder } from '../TypeEncoder.interface';
import * as Types from '../../types/types';
import { BufferPointer } from '../BufferPointer';

const maxInt32 = 2 ** 31 - 1;
const minInt32 = -(2 ** 31);
const getSize = (value: number) => {
    if (value > 0) {
        return value < 64 ? 1 :
            value < 8192 ? 2 :
            value < 1048576 ? 3 :
            value < 134217728 ? 4 :
            5;
    } else {
        return value >= -64 ? 1 :
            value >= -8192 ? 2 :
            value >= -1048576 ? 3 :
            value >= -134217728 ? 4 :
            5;
    }
};

export class _te_varint32 implements TypeEncoder<number> {
    readonly isSizeFixed = false;

    constructor(readonly schema: Types.VarInt32) {}

    getSize(value: number) {
        return getSize(value);
    }

    checkGetSize(value: number, path: string) {
        if (!isFinite(value) || value < minInt32 || maxInt32 < value || Math.trunc(value) !== value) {
            throw new Error(`Is not int32 (${path}, value: ${value})`, { cause: value });
        }
        
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
