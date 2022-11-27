import { TypePacker } from '../TypePacker.interface';
import * as Types from '../../schemas/types';
import { BufferPointer } from '../BufferPointer';
import { parseLengthSchema, parseSchema } from '.';
import { BinaryBuffer } from '../BinaryBuffer';

type Field = {
    name: string;
    type: TypePacker;
};

export class _tp_struct implements TypePacker {
    readonly isSizeFixed: boolean = true;
    private readonly _fields: Field[] = [];
    private readonly _notFixedFields: Field[] = [];
    private readonly _fixedFieldsSize = 0;

    readonly getSize: (value: Record<string, any>) => number;
    readonly encode: (bp: BufferPointer, value: Record<string, any>) => void;
    readonly decode: (bp: BufferPointer) => Record<string, any>;
    readonly encodeGetBuffers: (barr: BinaryBuffer[], value: any) => void;

    constructor(readonly schema: Types.Struct) {
        const fields = schema.orderedFields ?
            schema.orderedFields :
            Object.entries(schema.fields).map(([name, type]) => ({ name, type }));
        
        
        for (const { name, type } of fields) {
            const _type = parseSchema(type);
            const field = { name, type: _type };

            this._fields.push(field);

            if (_type.isSizeFixed) {
                this._fixedFieldsSize += _type.getSize(null);
            } else {
                this.isSizeFixed = false;
                this._notFixedFields.push(field);
            }
        }

        if (this.isSizeFixed) {
            this.getSize = () => this._fixedFieldsSize;
        } else if (this._fixedFieldsSize) {
            this.getSize = (value) =>
                this._fixedFieldsSize + this._notFixedFields.reduce(
                    (acc, { name, type }) => (acc + type.getSize(value[name])),
                    0,
                );
        } else {
            this.getSize = (value) =>
                this._notFixedFields.reduce(
                    (acc, { name, type }) => (acc + type.getSize(value[name])),
                    0,
                );
        }

        const _fs = this._fields;

        this.encode = Function('_fs', `
            ${_fs.map((_, i) => `const type_${i} = _fs[${i}].type;`).join('\n')}

            return (bp, value) => {
                ${_fs.map(({ name }, i) => `type_${i}.encode(bp, value.${name});`).join('\n')}
            };
        `)(_fs);

        this.decode = Function('_fs', `
            ${_fs.map((_, i) => `const type_${i} = _fs[${i}].type;`).join('\n')}

            return (bp) => {
                ${_fs.map((_, i) => `const val_${i} = type_${i}.decode(bp);`).join('\n')}

                return {
                    ${_fs.map(({ name }, i) => `${name}: val_${i}`).join(',')}
                };
            };
        `)(_fs);

        this.encodeGetBuffers = Function('_fs', `
            ${_fs.map((_, i) => `const type_${i} = _fs[${i}].type;`).join('\n')}

            return (barr, value) => {
                ${_fs.map(({ name }, i) => `type_${i}.encodeGetBuffers(barr, value.${name});`).join('\n')}
            };
        `)(_fs);
    }

    getSchema(): Types.Schema {
        return {
            type: 'struct',
            orderedFields: this._fields.map(f => ({ name: f.name, type: f.type.getSchema() })),
        };
    }
}
