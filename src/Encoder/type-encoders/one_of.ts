import { TypeEncoder } from '../TypeEncoder.interface';
import * as Types from '../../types/types';
import { BufferPointer } from '../BufferPointer';
import { parseLengthSchema, parseSchema } from '.';

export class _te_one_of implements TypeEncoder<Record<string, any>> {
    // TODO: check
    readonly isSizeFixed = false;
    readonly _valueIndex: Map<string, { index: number; type: TypeEncoder }>;
    readonly _indexValue: { name: string; type: TypeEncoder }[];
    readonly _type: TypeEncoder<number>;

    constructor(readonly schema: Types.OneOf) {
        const fields = schema.orderedFields || Object.entries(schema.fields).map(([name, type]) => ({ name, type }));

        this._indexValue = fields.map(({ name, type }) => ({ name, type: parseSchema(type) }));
        this._valueIndex = new Map(this._indexValue.map((value, i) => ([value.name, { index: i, type: value.type }])));

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

    getSize(value: Record<string, any>) {
        const key = Object.keys(value)[0];
        const r = this._valueIndex.get(key);
        return this._type.getSize(r.index) + r.type.getSize(value[key]);
    }

    checkGetSize(value: Record<string, any>) {
        const keys = Object.keys(value);
        if (keys.length !== 1) {
            throw new Error();
        }

        const key = keys[0];
        const r = this._valueIndex.get(key);
        if (!r) {
            throw new Error();
        }
        
        return this._type.checkGetSize(r.index) + r.type.checkGetSize(value[key]);
    }

    encode(bp: BufferPointer, value: any) {
        const key = Object.keys(value)[0];
        const r = this._valueIndex.get(key);
        this._type.encode(bp, r.index);
        r.type.encode(bp, value[key]);
    }

    decode(bp: BufferPointer) {
        const r = this._indexValue[this._type.decode(bp)];
        return {
            [r.name]: r.type.decode(bp),
        };
    }

    getSchema(): Types.Schema {
        return {
            type: 'one_of',
            orderedFields: this._indexValue.map(
                ({ name, type }) => ({ name, type: type.getSchema() }),
            ),
        };
    }
}
