import { TypeEncoder } from '../TypeEncoder.interface';
import * as Types from '../../types/types';
import { BufferPointer } from '../BufferPointer';
import { parseLengthSchema, parseSchema } from '.';

const isNull = (value: any) => value === null || value === undefined;

export class _te_unullable implements TypeEncoder {
    readonly isSizeFixed = false;
    readonly _child: TypeEncoder;

    constructor(readonly schema: Types.UNullable) {
        this._child = parseSchema(schema.child);
    }

    getSize(value: any) {
        return 1 + (((!isNull(value)) || 0) && this._child.getSize(value));
    }

    checkGetSize(value: any, path: string) {
        return 1 + (((!isNull(value)) || 0) && this._child.checkGetSize(value, path));
    }

    encode(bp: BufferPointer, value: any) {
        if (value === null) {
            bp.writeByte(1);
        } else 
        if (value === undefined) {
            bp.writeByte(2);
        } else {
            bp.writeByte(0);
            this._child.encode(bp, value);
        }
    }

    decode(bp: BufferPointer) {
        const value = bp.readByte();

        if (value === 1) {
            return null;
        } else
        if (value === 2) {
            return undefined;
        }
        return this._child.decode(bp);
    }

    getSchema(): Types.Schema {
        return {
            type: 'unullable',
            child: this._child.getSchema(),
        };
    }
}
