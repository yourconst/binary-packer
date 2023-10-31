import { TypeEncoder } from '../TypeEncoder.interface';
import * as Types from '../../types/types';
import { parseLengthSchema, parseSchema } from '.';

type Field = {
    name: string;
    type: TypeEncoder;
};

export class _te_struct implements TypeEncoder<Record<string, any>> {
    readonly isSizeFixed: boolean = true;
    private readonly _fields: Field[] = [];
    private readonly _notFixedFields: Field[] = [];
    private readonly _fixedFieldsSize = 0;

    readonly getSize: TypeEncoder<Record<string, any>>['getSize'];
    readonly checkGetSize: TypeEncoder<Record<string, any>>['checkGetSize'];
    readonly encode: TypeEncoder<Record<string, any>>['encode'];
    readonly decode: TypeEncoder<Record<string, any>>['decode'];

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

        const _fs = this._fields;

        if (this.isSizeFixed) {
            this.getSize = () => this._fixedFieldsSize;
        } else if (this._fixedFieldsSize) {
            this.getSize = Function('_fixedFieldsSize, _nffs', `
                ${this._notFixedFields.map((_, i) => `const type_${i} = _nffs[${i}].type;`).join('\n')};

                return (value) => {
                    return _fixedFieldsSize + ${this._notFixedFields.map(({ name }, i) => `type_${i}.getSize(value.${name})`).join('+')};
                };
            `)(this._fixedFieldsSize, this._notFixedFields);
            // this.getSize = (value) =>
            //     this._fixedFieldsSize + this._notFixedFields.reduce(
            //         (acc, { name, type }) => (acc + type.getSize(value[name])),
            //         0,
            //     );
        } else {
            this.getSize = Function('_fs', `
                ${_fs.map((_, i) => `const type_${i} = _fs[${i}].type;`).join('\n')};

                return (value) => {
                    return ${_fs.map(({ name }, i) => `type_${i}.getSize(value.${name})`).join('+')};
                };
            `)(_fs);
            // this.getSize = (value) =>
            //     this._notFixedFields.reduce(
            //         (acc, { name, type }) => (acc + type.getSize(value[name])),
            //         0,
            //     );
        }

        this.checkGetSize = Function('_fs', `
                ${_fs.map((_, i) => `const type_${i} = _fs[${i}].type;`).join('\n')};

                return (value) => {
                    return ${_fs.map(({ name }, i) => `type_${i}.checkGetSize(value.${name})`).join('+')};
                };
            `)(_fs);

        this.encode = Function('_fs', `
            ${_fs.map((_, i) => `const type_${i} = _fs[${i}].type;`).join('\n')}

            return (bp, value) => {
                ${_fs.map(({ name }, i) => `type_${i}.encode(bp, value.${name});`).join('\n')}
            };
        `)(_fs);

        // according to https://stackoverflow.com/questions/16200387/are-javascript-object-properties-assigned-in-order
        this.decode = Function('_fs', `
            ${_fs.map((_, i) => `const type_${i} = _fs[${i}].type;`).join('\n')}

            return (bp) => ({
                ${_fs.map(({ name }, i) => `${name}: type_${i}.decode(bp)`).join(',\n')}
            });
        `)(_fs);
    }

    getSchema(): Types.Schema {
        return {
            type: 'struct',
            orderedFields: this._fields.map(f => ({ name: f.name, type: f.type.getSchema() })),
        };
    }
}
