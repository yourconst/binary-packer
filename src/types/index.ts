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

export const Buffer = (lengthType: Types._Length = 'uvarint32'): Types.Buffer => ({
    type: 'buffer',
    lengthType,
});

export const Array = <S extends Types.Schema>(
    child: S,
    lengthType: Types._Length = 'uvarint32',
) => ({
    type: <'array'> 'array',
    child,
    lengthType,
});

export const Struct = <F extends Types.Struct['fields']>(
    fields: F,
) => ({
    type: <'struct'> 'struct',
    fields,
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
    values,
    bigIndexType,
});

export const Nullable = <S extends Types.Schema>(
    child: S,
) => ({
    type: <'nullable'> 'nullable',
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
