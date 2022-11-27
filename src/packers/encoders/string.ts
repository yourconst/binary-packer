import { TypePacker } from '../TypePacker.interface';
import * as Types from '../../schemas/types';
import { BufferPointer } from '../BufferPointer';
import { parseLengthSchema, parseSchema } from '.';
import { BinaryBuffer } from '../BinaryBuffer';

// const stringBufferCache = new Map<string, BinaryBuffer>();

// const getStringBuffer = (value: string, encoding: Types._StringEncoding) => {
//     let _b = stringBufferCache.get(value);

//     if (!_b) {
//         _b = BinaryBuffer.from(value, encoding);
//         stringBufferCache.set(value, _b);
//     }

//     return _b;
// };

export class _tp_string implements TypePacker<string> {
    readonly isSizeFixed = false;
    private readonly _lengthType: TypePacker<number>;
    private readonly _encoding: Types._StringEncoding;

    constructor(readonly schema: Types.String) {
        this._lengthType = parseLengthSchema(schema.lengthType || 'uint32_le');
        this._encoding = schema.encoding || 'utf8';
    }

    // getSize(value: string) {
    //     const _b = getStringBuffer(value, this._encoding);

    //     return this._lengthType.getSize(_b.length) + _b.length;
    // }

    // encode(bp: BufferPointer, value: string) {
    //     const _b = getStringBuffer(value, this._encoding);
    //     this._lengthType.encode(bp, _b.length);
    //     bp.buffer.set(_b, bp.getAdd(_b.length));
    // }

    getSize(value: string) {
        const _s = BinaryBuffer.byteLength(value, this._encoding);
        return this._lengthType.getSize(_s) + _s;
    }

    encode(bp: BufferPointer, value: string) {
        const _s = BinaryBuffer.byteLength(value, this._encoding);
        this._lengthType.encode(bp, _s);
        bp.buffer.write(value, bp.getAdd(_s), this._encoding);
    }

    decode(bp: BufferPointer) {
        const _s = this._lengthType.decode(bp);
        const _ptr = bp.getAdd(_s);
        return bp.buffer.toString(this._encoding, _ptr, _ptr + _s);
    }

    getSchema(): Types.Schema {
        return {
            type: 'string',
            lengthType: <Types._Length> this._lengthType.getSchema(),
        };
    }
}
