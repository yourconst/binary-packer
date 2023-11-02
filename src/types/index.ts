import * as Types from './types';

export { Schema, SchemaResultType } from './types';

export type Endian = 'le' | 'be';

const checkEndian = (endian?: Endian): Endian => endian === 'be' ? endian : 'le';

export const UInt8 = (): Types.UInt8 => `uint8`;
export const Int8 = (): Types.Int8 => `int8`;
export const UInt16 = (endian?: Endian): Types.UInt16 => `uint16_${checkEndian(endian)}`;
export const Int16 = (endian?: Endian): Types.Int16 => `int16_${checkEndian(endian)}`;
export const UInt32 = (endian?: Endian): Types.UInt32 => `uint32_${checkEndian(endian)}`;
export const Int32 = (endian?: Endian): Types.Int32 => `int32_${checkEndian(endian)}`;
export const UInt64 = (endian?: Endian): Types.UInt64 => `uint64_${checkEndian(endian)}`;
export const Int64 = (endian?: Endian): Types.Int64 => `int64_${checkEndian(endian)}`;

export const Float32 = (endian?: Endian): Types.Float32 => `float32_${checkEndian(endian)}`;
export const Float64 = (endian?: Endian): Types.Float64 => `float64_${checkEndian(endian)}`;

export const UVarInt32 = (): Types.UVarInt32 => `uvarint32`;
export const VarInt32 = (): Types.VarInt32 => `varint32`;

export const Bool = (): Types.Bool => `bool`;

export const Const = <T>(value: T): Types.Const<T> => ({
    type: 'const',
    value,
});

export const String = (
    encoding: Types._StringEncoding = 'utf8',
    lengthType: Types._Length = 'uvarint32',
): Types.String => ({
    type: 'string',
    encoding,
    lengthType,
});

/** Alias for `Str` type */
export const Str = String;

export const Buffer = (lengthType: Types._Length = 'uvarint32'): Types.Buffer => ({
    type: 'buffer',
    lengthType,
});

/** Alias for `Buffer` type */
export const Buf = Buffer;

export const Array = <S extends Types.Schema>(
    child: S,
    lengthType: Types._Length = 'uvarint32',
) => ({
    type: <'array'> 'array',
    child,
    lengthType,
});

/** Alias for `Array` type */
export const Vector = Array;

type _Order = {
    type: 'order';
    index: number;
    child: Types.Schema;
};

export const Order = <S extends Types.Schema>(index: number, child: S) => ({
    type: <'order'> 'order',
    index,
    child,
});

export const Struct = <F extends Record<string, Types.Schema | _Order>>(
    fields: F,
) => ({
    type: <'struct'> 'struct',
    fields: <{
        [key in keyof F]: F[key] extends _Order ? F[key]['child'] : F[key];
    }> <any> undefined,
    orderedFields: Object.entries(fields)
        .sort((a: [string, _Order], b: [string, _Order]) => (a[1].index ?? Infinity) - (b[1].index ?? Infinity))
        .map(([name, type]: [string, _Order | Types.Schema]) => ({ name, type: type['type'] === 'order' ? type['child'] : type })),
});

export const OneOf = <F extends Types.OneOf['fields']>(
    fields: F,
) => ({
    type: <'one_of'> 'one_of',
    fields,
});

export const Enum = <T extends string | number>(
    values: T[] | Record<string, T>,
    bigIndexType: Types.UVarInt32 | Types.UInt16 = 'uvarint32',
) => ({
    type: <'enum'> 'enum',
    values: <(T/*  & number */)[]>(
        globalThis.Array.isArray(values) ?
            values :
            Object.values(values)
    ),
    bigIndexType,
});

export const EnumInv = <T extends string>(
    values: Record<T, string | number>,
    bigIndexType: Types.UVarInt32 | Types.UInt16 = 'uvarint32',
) => ({
    type: <'enum'> 'enum',
    values: <T[]> Object.keys(values),
    bigIndexType,
});

export const Nullable = <S extends Types.Schema>(
    child: S,
) => ({
    type: <'nullable'> 'nullable',
    child,
});

export const UNullable = <S extends Types.Schema>(
    child: S,
) => ({
    type: <'unullable'> 'unullable',
    child,
});

export const Aligned = <S extends Types.Schema>(
    align: Types.__Align,
    child: S,
) => ({
    type: <'aligned'> 'aligned',
    align,
    child,
});

export const Transform = <S extends Types.Schema, RT>(
    child: S,
    options: {
        encode: (decoded: RT) => Types.SchemaResultType<S>,
        decode: (encoded: Types.SchemaResultType<S>) => RT,
    },
) => ({
    type: <'transform'> 'transform',
    child,
    encode: options.encode,
    decode: options.decode,
});
