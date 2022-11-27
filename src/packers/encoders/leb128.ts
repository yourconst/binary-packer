import { TypePacker } from '../TypePacker.interface';
import * as Types from '../../schemas/types';
import { BufferPointer } from '../BufferPointer';
import { parseLengthSchema, parseSchema } from '.';
import { BinaryBuffer } from '../BinaryBuffer';

const maxUint31 = 2 ** 31 - 1;
const checkRange = (value: number) => {
    if (!isFinite(value) || value < 0 || value > maxUint31 || Math.trunc(value) !== value) {
        throw new Error(`Value doesn't satisfy constraint uint31`, { cause: value });
    }
};
const getSize = (value: number) => Math.ceil((Math.log2(value < 2 ? 2 : value + 1) / 7));

export class _tp_leb128 implements TypePacker<number> {
    readonly isSizeFixed = false;

    constructor(readonly schema: Types.LEB128) {}

    getSize(value: number) {
        checkRange(value);

        return getSize(value);
    }

    encode(bp: BufferPointer, value: number) {
        while (true) {
            let byte = value & 127;

            if (value <= byte) {
                bp.writeByte(byte);
                break;
            }

            bp.writeByte(byte | 128);
            // bp.buffer.writeUInt8(byte | 128, bp.getAdd(1));

            value >>= 7;
        }
    }

    decode(bp: BufferPointer) {
        let result = 0;
        let shift = 0;

        while (true) {
            const byte = bp.readByte();
            result |= (byte & 127) << shift;
            if ((byte & 128) == 0)
                break;
            shift += 7;
        }

        return result;
    }

    getSchema(): Types.Schema {
        return 'leb128';
    }
}
