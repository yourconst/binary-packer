import * as Types from '../../types/types';
import { TypeEncoder } from '../TypeEncoder.interface';
import { _te_number } from './number';
import { _te_bool } from './bool';
import { _te_string } from './string';
import { _te_enum } from './enum';
import { _te_const } from './const';
import { _te_aligned } from './aligned';
import { _te_array } from './array';
import { _te_struct } from './struct';
import { _te_transform } from './transform';
import { _te_nullable } from './nullable';
import { _te_uleb128 } from './uleb128';
import { _te_leb128 } from './leb128';
import { _te_buffer } from './buffer';
import { _te_one_of } from './one_of';

const typesMap = new Map<Types.SchemaSimple | Types.SchemaComplex['type'], TypeEncoder | ((schema: Types.Schema) => TypeEncoder)>([
    ['uint8', new _te_number('uint8')], ['int8', new _te_number('int8')],
    ['uint16_le', new _te_number('uint16_le')], ['uint16_be', new _te_number('uint16_be')],
    ['int16_le', new _te_number('int16_le')], ['int16_be', new _te_number('int16_be')],
    ['uint32_le', new _te_number('uint32_le')], ['uint32_be', new _te_number('uint32_be')],
    ['int32_le', new _te_number('int32_le')], ['int32_be', new _te_number('int32_be')],
    ['uint64_le', new _te_number('uint64_le')], ['uint64_be', new _te_number('uint64_be')],
    ['int64_le', new _te_number('int64_le')], ['int64_be', new _te_number('int64_be')],

    ['float32_le', new _te_number('float32_le')], ['float32_be', new _te_number('float32_be')],
    ['float64_le', new _te_number('float64_le')], ['float64_be', new _te_number('float64_be')],

    ['uleb128', new _te_uleb128('uleb128')],
    ['leb128', new _te_leb128('leb128')],
    ['bool', new _te_bool('bool')],

    ['string', (schema: Types.String) => new _te_string(schema)],
    ['buffer', (schema: Types.Buffer) => new _te_buffer(schema)],
    ['enum', (schema: Types.Enum) => new _te_enum(schema)],
    ['const', (schema: Types.Const) => new _te_const(schema)],

    ['array', (schema: Types.Array) => new _te_array(schema)],
    ['struct', (schema: Types.Struct) => new _te_struct(schema)],
    ['one_of', (schema: Types.OneOf) => new _te_one_of(schema)],

    ['aligned', (schema: Types.Aligned) => new _te_aligned(schema)],
    ['nullable', (schema: Types.Nullable) => new _te_nullable(schema)],
    ['transform', (schema: Types.Transform) => new _te_transform(schema)],
]);

const lengthTypeNames = new Set<Types._Length/*  | Types.Const['type'] */>([
    'uint8',
    'uint16_le', 'uint16_be',
    'uint32_le', 'uint32_be',
    // 'const',
    'uleb128',
]);

export const parseSchema = (schema: Types.Schema) => {
    if (typeof schema === 'string') {
        return <TypeEncoder> typesMap.get(schema);
    } else {
        const f = <(s: Types.Schema) => TypeEncoder> typesMap.get(schema.type);

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

    if (!isFinite(schema.value) || schema.value < 0 || (Math.trunc(schema.value) !== schema.value)) {
        throw new Error('Bad const length value', { cause: schema });
    }

    return parseSchema(schema);
};
