export type UInt8 = 'uint8';
export type Int8 = 'int8';
export type UInt16 = 'uint16_le' | 'uint16_be';
export type Int16 = 'int16_le' | 'int16_be';
export type UInt32 = 'uint32_le' | 'uint32_be';
export type Int32 = 'int32_le' | 'int32_be';
export type UInt64 = 'uint64_le' | 'uint64_be';
export type Int64 = 'int64_le' | 'int64_be';

export type Float32 = 'float32_le' | 'float32_be';
export type Float64 = 'float64_le' | 'float64_be';

export type LEB128 = 'leb128';
export type SignedLEB128 = 'signed_leb128';


export type Bool = 'bool';

export type Const<T = any> = {
    type: 'const';
    value: T;
};


export type _Length = UInt8 | UInt16 | UInt32 | LEB128 | Const<number>;
export type _StringEncoding = 'utf8' | 'ascii';

export type String = {
    type: 'string';
    encoding?: _StringEncoding;
    lengthType?: _Length;
};

export type Array = {
    type: 'array';
    child: Schema;
    lengthType?: _Length;
};

export type Struct = {
    type: 'struct';
    fields?: {
        [key: string]: Schema;
    };
    orderedFields?: {
        name: string;
        type: Schema;
    }[];
};

export type Enum = {
    type: 'enum',
    values: any[] | {
        [key: string]: any;
    };
};

export type Nullable = {
    type: 'nullable';
    child: Schema;
};

export type __Align = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export const __Align = new Set<__Align>([1, 2, 3, 4, 5, 6, 7, 8]);

export type Aligned = {
    type: 'aligned';
    align: __Align;
    child: Schema;
};

// export type OneOf = {
//     type: 'one_of';
//     childs: Schema[];
// };

export type Transform = {
    type: 'transform';
    child: Schema;
    encode: (decoded: any) => any;
    decode: (encoded: any) => any;
};


export type SchemaInt = UInt8 | Int8 | UInt16 | Int16 | UInt32 | Int32 | UInt64 | Int64;
export type SchemaFloat = Float32 | Float64;
export type SchemaNumber = SchemaInt | SchemaFloat;

export type SchemaSimple = SchemaNumber | Bool | LEB128 | SignedLEB128;
export type SchemaComplex = Const | Aligned | String | Array | Struct | Enum | Nullable | Transform/*  | OneOf */;

export type Schema = SchemaSimple | SchemaComplex;



export type SchemaResultType<S extends Schema> =
    S extends Const ? S['value'] :
    S extends SchemaNumber ? number :
    S extends LEB128 ? number :
    S extends SignedLEB128 ? number :
    S extends String ? string :
    S extends Bool ? boolean :
    S extends Aligned ? SchemaResultType<S['child']> :
    // S extends OneOf ? SchemaResultType<S['childs'][number]> :
    S extends Transform ? ReturnType<S['encode']> :
    S extends Nullable ? null | SchemaResultType<S['child']> :
    S extends Array ? SchemaResultType<S['child']>[] :
    S extends Struct ?
        S['orderedFields'] extends [] ? {
            [key in S['orderedFields'][number]['name']]:
                SchemaResultType<Extract<{ name: key; }, S['orderedFields'][number]>['type']>;
        } : {
            [key in keyof S['fields']]: SchemaResultType<S['fields'][key]>
        } :
    S extends Enum ? S['values'][number] :
    unknown;
