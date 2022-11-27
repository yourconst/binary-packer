import { TypePacker } from '../TypePacker.interface';
import * as Types from '../../schemas/types';
import { _tp_number } from './number';
import { _tp_bool } from './bool';
import { _tp_string } from './string';
import { _tp_enum } from './enum';
import { _tp_const } from './const';
import { _tp_aligned } from './aligned';
import { _tp_array } from './array';
import { _tp_struct } from './struct';
import { _tp_transform } from './transform';
import { _tp_nullable } from './nullable';
import { _tp_leb128 } from './leb128';
import { _tp_signed_leb128 } from './signed_leb128';

const typesMap = new Map<Types.SchemaSimple | Types.SchemaComplex['type'], TypePacker | ((schema: Types.Schema) => TypePacker)>([
    ['uint8', new _tp_number('uint8')], ['int8', new _tp_number('int8')],
    ['uint16_le', new _tp_number('uint16_le')], ['uint16_be', new _tp_number('uint16_be')],
    ['int16_le', new _tp_number('int16_le')], ['int16_be', new _tp_number('int16_be')],
    ['uint32_le', new _tp_number('uint32_le')], ['uint32_be', new _tp_number('uint32_be')],
    ['int32_le', new _tp_number('int32_le')], ['int32_be', new _tp_number('int32_be')],
    ['uint64_le', new _tp_number('uint64_le')], ['uint64_be', new _tp_number('uint64_be')],
    ['int64_le', new _tp_number('int64_le')], ['int64_be', new _tp_number('int64_be')],

    ['float32_le', new _tp_number('float32_le')], ['float32_be', new _tp_number('float32_be')],
    ['float64_le', new _tp_number('float64_le')], ['float64_be', new _tp_number('float64_be')],

    ['leb128', new _tp_leb128('leb128')],
    ['signed_leb128', new _tp_signed_leb128('signed_leb128')],
    ['bool', new _tp_bool('bool')],

    ['string', (schema: Types.String) => new _tp_string(schema)],
    ['enum', (schema: Types.Enum) => new _tp_enum(schema)],
    ['const', (schema: Types.Const) => new _tp_const(schema)],

    ['array', (schema: Types.Array) => new _tp_array(schema)],
    ['struct', (schema: Types.Struct) => new _tp_struct(schema)],

    ['aligned', (schema: Types.Aligned) => new _tp_aligned(schema)],
    ['nullable', (schema: Types.Nullable) => new _tp_nullable(schema)],
    ['transform', (schema: Types.Transform) => new _tp_transform(schema)],
]);

const lengthTypeNames = new Set<Types._Length/*  | Types.Const['type'] */>([
    'uint8',
    'uint16_le', 'uint16_be',
    'uint32_le', 'uint32_be',
    // 'const',
    'leb128',
]);

export const parseSchema = (schema: Types.Schema) => {
    if (typeof schema === 'string') {
        return <TypePacker> typesMap.get(schema);
    } else {
        const f = <(s: Types.Schema) => TypePacker> typesMap.get(schema.type);

        if (!f) {
            throw new Error('Unknown schema type', { cause: schema });
        }

        return f(schema);
    }
};

export const parseLengthSchema = (schema: Types._Length) => {
    if (typeof schema === 'string') {
        if (lengthTypeNames.has(schema)) {
            return parseSchema(schema);
        } else {
            throw new Error('Bad length type', { cause: schema });
        }
    }

    if (schema.type !== 'const') {
        throw new Error('Bad length type', { cause: schema });
    }

    if (!isFinite(schema.value) || (Math.trunc(schema.value) !== schema.value)) {
        throw new Error('Bad const length value', { cause: schema });
    }

    return parseSchema(schema);
};
