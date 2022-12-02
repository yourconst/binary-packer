import { TypeEncoder } from '../TypeEncoder.interface';
import * as Types from '../../types/types';
import { BufferPointer } from '../BufferPointer';
import { parseLengthSchema, parseSchema } from '.';

const isNull = (value: any) => value === null || value === undefined;

export class _te_nullable implements TypeEncoder {
    readonly isSizeFixed = false;
    readonly _child: TypeEncoder;

    constructor(readonly schema: Types.Nullable) {
        this._child = parseSchema(schema.child);
    }

    getSize(value: any) {
        return 1 + (((!isNull(value)) || 0) && this._child.getSize(value));
    }

    checkGetSize(value: any) {
        return 1 + (((!isNull(value)) || 0) && this._child.checkGetSize(value));
    }

    encode(bp: BufferPointer, value: any) {
        if (isNull(value)) {
            bp.writeByte(1);
        } else {
            bp.writeByte(0);
            this._child.encode(bp, value);
        }
    }

    decode(bp: BufferPointer) {
        if (bp.readByte()) {
            return null;
        }
        return this._child.decode(bp);
    }

    getSchema(): Types.Schema {
        return {
            type: 'nullable',
            child: this._child.getSchema(),
        };
    }
}
