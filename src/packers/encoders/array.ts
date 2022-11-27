import { TypePacker } from '../TypePacker.interface';
import * as Types from '../../schemas/types';
import { BufferPointer } from '../BufferPointer';
import { parseLengthSchema, parseSchema } from '.';
import { BinaryBuffer } from '../BinaryBuffer';

export class _tp_array implements TypePacker {
    readonly isSizeFixed: boolean;
    private readonly _lengthType: TypePacker<number>;
    private readonly _child: TypePacker;

    readonly getSize: (value: any[]) => number;

    constructor(readonly schema: Types.Array) {
        this._lengthType = parseLengthSchema(schema.lengthType || 'uint32_le');
        this._child = parseSchema(schema.child);

        this.isSizeFixed = this._lengthType.isConst && this._child.isSizeFixed;

        if (this.isSizeFixed) {
            const s = this._lengthType.constValue * this._child.getSize(null);
            this.getSize = () => s;
        } else if (this._child.isSizeFixed) {
            const cs = this._child.getSize(null);
            this.getSize = (value: any[]) =>
                this._lengthType.getSize(value.length) + cs * value.length;
        } else {
            this.getSize = (value: any[]) =>
                value.reduce((acc, el) => acc + this._child.getSize(el), this._lengthType.getSize(value.length));
        }
    }

    encode(bp: BufferPointer, value: any[]) {
        this._lengthType.encode(bp, value.length);

        for (let i = 0; i < value.length; ++i) {
            this._child.encode(bp, value[i]);
        }
    }

    decode(bp: BufferPointer) {
        const res = new Array(this._lengthType.decode(bp));

        for (let i = 0; i < res.length; ++i) {
            res[i] = this._child.decode(bp);
        }

        return res;
    }

    getSchema(): Types.Schema {
        return {
            type: 'array',
            child: this._child.getSchema(),
            lengthType: <Types._Length> this._lengthType.getSchema(),
        };
    }
}
