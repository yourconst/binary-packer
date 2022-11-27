import { TypePacker } from '../TypePacker.interface';
import * as Types from '../../schemas/types';
import { BufferPointer } from '../BufferPointer';
import { parseLengthSchema, parseSchema } from '.';
import { BinaryBuffer } from '../BinaryBuffer';

const isNull = (value: any) => value === null || value === undefined;

export class _tp_nullable implements TypePacker {
    readonly isSizeFixed = false;
    // readonly _flagType = parseSchema('bool');
    readonly _child: TypePacker;

    constructor(readonly schema: Types.Nullable) {
        this._child = parseSchema(schema.child);
    }

    getSize(value: any) {
        return /* this._flagType.getSize(null) */ 1 + (((!isNull(value)) || 0) && this._child.getSize(value));
    }

    encode(bp: BufferPointer, value: any) {
        if (isNull(value)) {
            bp.writeByte(1);
            // this._flagType.encode(bp, true);
        } else {
            bp.writeByte(0);
            // this._flagType.encode(bp, false);
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
