import { TypeEncoder } from '../TypeEncoder.interface';
import * as Types from '../../types/types';
import { BufferPointer } from '../BufferPointer';
import { parseLengthSchema, parseSchema } from '.';

export class _te_enum implements TypeEncoder {
    readonly isSizeFixed = true;
    readonly _valueIndex: Map<any, number>;
    readonly _indexValue: any[];
    readonly _type: TypeEncoder<number>;

    constructor(readonly schema: Types.Enum) {
        this._indexValue = [...new Set(schema.values)];

        this._valueIndex = new Map(this._indexValue.map((value, i) => ([value, i])));

        const count = this._indexValue.length;

        if (count < 2) {
            throw new Error('Not enough enum unique values', { cause: schema });
        }

        if (count <= (1 << 8)) {
            this._type = parseLengthSchema('uint8');
        } else if (count <= (1 << 16)) {
            this._type = parseLengthSchema(schema.bigIndexType ?? 'uvarint32');
        } else {
            throw new Error('Too many unique values for enum', { cause: schema });
        }
    }

    getSize(value: any) {
        return this._type.getSize(null);
    }

    checkGetSize(value: any, path: string) {
        if (!this._valueIndex.has(value)) {
            throw new Error(`Is not enum value (${path}, value: ${value})`, { cause: value });
        }

        // Because it is static
        return this._type.getSize(null);
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
            bigIndexType: <Types.UVarInt32>this._type.getSchema(),
        };
    }
}
