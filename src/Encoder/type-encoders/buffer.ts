import { TypeEncoder } from '../TypeEncoder.interface';
import * as Types from '../../types/types';
import { BufferPointer } from '../BufferPointer';
import { parseLengthSchema, parseSchema } from '.';
import { BinaryBuffer } from '../BinaryBuffer';

export function getArrayBuffer(buffer: Uint8Array) {
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

export class _te_buffer implements TypeEncoder<Uint8Array> {
    readonly isSizeFixed = false;
    private readonly _lengthType: TypeEncoder<number>;

    constructor(readonly schema: Types.Buffer) {
        this._lengthType = parseLengthSchema(schema.lengthType || 'uvarint32');
    }

    getSize(value: Uint8Array) {
        return this._lengthType.getSize(value.length) + value.length;
    }

    checkGetSize(value: Uint8Array, path: string) {
        if (!(value instanceof Uint8Array)) {
            throw new Error(`Is not Uint8Array (${path}, value: ${value})`, { cause: value });
        }
        
        return this.getSize(value);
    }

    encode(bp: BufferPointer, value: Uint8Array) {
        this._lengthType.encode(bp, value.length);
        bp.buffer.set(value, bp.getAdd(value.length));
    }

    decode(bp: BufferPointer) {
        const _s = this._lengthType.decode(bp);
        const _ptr = bp.getAdd(_s);
        return bp.buffer.subarray(_ptr, _ptr + _s);
    }

    getSchema(): Types.Schema {
        return {
            type: 'buffer',
            lengthType: <Types._Length> this._lengthType.getSchema(),
        };
    }
}
