import { TypePacker } from '../TypePacker.interface';
import * as Types from '../../schemas/types';
import { BufferPointer } from '../BufferPointer';
import { parseLengthSchema, parseSchema } from '.';
import { BinaryBuffer } from '../BinaryBuffer';

export class _tp_enum implements TypePacker {
    readonly isSizeFixed = true;
    readonly _valueIndex: Map<any, number>;
    readonly _indexValue: any[];
    readonly _type: TypePacker<number>;

    constructor(readonly schema: Types.Enum) {
        this._indexValue = [...new Set(
            Array.isArray(schema.values) ?
                schema.values :
                Object.values(schema.values),
        )];

        this._valueIndex = new Map(this._indexValue.map((value, i) => ([value, i])));

        const count = this._indexValue.length;

        if (count < 2) {
            throw new Error('Not enough enum unique values', { cause: schema });
        }

        if (count <= (1 << 8)) {
            this._type = parseLengthSchema('uint8');
        } else if (count <= (1 << 16)) {
            this._type = parseLengthSchema('uint16_le');
        } else {
            throw new Error('Too many unique values for enum', { cause: schema });
        }
    }

    getSize(value: any) {
        return this._type.getSize(value);
    }

    encode(bp: BufferPointer, value: any) {
        this._type.encode(bp, this._valueIndex.get(value));
    }

    decode(bp: BufferPointer) {
        return this._indexValue[this._type.decode(bp)];
    }

    getSchema(): Types.Schema {
        return {
            type: 'enum',
            values: this._indexValue,
        };
    }
}
