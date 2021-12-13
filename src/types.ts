import {Buffer} from 'buffer';
import {ClassType, GetClassExamplerType} from './commonTypes';

export {ClassType, GetClassExamplerType} from './commonTypes';


export type BIGINT_TYPE = 'int64';

export type UINTS_TYPE = 'uint8' | 'uint16' | 'uint32';

export type NUMBER_TYPE = 'int8' | 'int16' | 'int32' | BIGINT_TYPE |
                UINTS_TYPE |
                /* 'float16' | */ 'float32' | 'float64';

export type BOOLEAN_TYPE = 'bool';
export type STRING_TYPE = 'string';
export type ARRAY_BUFFER_TYPE = 'arraybuffer';

export type SIMPLE_WO_STRING_TYPE = BOOLEAN_TYPE | NUMBER_TYPE;

export type SIMPLE_TYPE = SIMPLE_WO_STRING_TYPE | STRING_TYPE | ARRAY_BUFFER_TYPE;

export type BOOL_ARRAY_TYPE = 'boolarray';
export type ARRAY_TYPE = 'array';
export type OBJECT_TYPE = 'object';

export type COMPLEX_TYPE = BOOL_ARRAY_TYPE | ARRAY_TYPE | OBJECT_TYPE;

export type TYPE = SIMPLE_TYPE | COMPLEX_TYPE;



export const BufferType = Buffer;
export type BufferType = Buffer;



export type StructTyperHelperSimple = {
    type: SIMPLE_TYPE;
};

export type StructTyperHelperArray = {
    type: ARRAY_TYPE;
    item: StructTyperHelper;
    lengthType?: UINTS_TYPE;
};

export type StructTyperHelperArrayBuffer = {
    type: ARRAY_BUFFER_TYPE;
    lengthType?: UINTS_TYPE;
};

export type StructTyperHelperObject = {
    type: OBJECT_TYPE;
    objectConstructor?: ClassType;
    properties: {
        [key: string]: StructTyperHelper;
    };
    flags?: string[];
};

export type StructTyperHelper =
    StructTyperHelperSimple |
    StructTyperHelperArray |
    StructTyperHelperArrayBuffer |
    StructTyperHelperObject;


export type ParamsGenerator<T extends StructTyperHelper> =
    T['type'] extends SIMPLE_TYPE ?
        T['type'] extends BOOLEAN_TYPE ? boolean :
        T['type'] extends BIGINT_TYPE ? BigInt :
        T['type'] extends STRING_TYPE ? string :
        T['type'] extends ARRAY_BUFFER_TYPE ? ArrayBuffer :
        number :
    T['type'] extends ARRAY_TYPE ? ParamsGenerator<T['item']>[] :
    T['type'] extends OBJECT_TYPE ?
        T['objectConstructor'] extends ClassType ?
        GetClassExamplerType<T['objectConstructor']> :
        ((T['properties'] extends Object ? {
            [key in keyof T['properties']]: ParamsGenerator<T['properties'][key]>;
        } : {}) & (T['flags'] extends Array<string> ? {
            [key in T['flags'][number]]: boolean;
        } : {})) :
        null;










/* export type MyParamsGenerator<C extends ClassType, ST extends StructTyper<C, ST>> =
    ST['type'] extends SIMPLE_TYPE ?
        ST['type'] extends BOOLEAN_TYPE ? boolean :
        ST['type'] extends BIGINT_TYPE ? BigInt :
        number :
    ST['type'] extends ARRAY_TYPE ? MyParamsGenerator<ST['item']['objectConstructor'], ST['item']>[] :
    ST['type'] extends OBJECT_TYPE ?
        unknown extends C ?
        ((ST['properties'] extends Object ? {
            [key in keyof ST['properties']]: MyParamsGenerator<ST['properties'][key]['objectConstructor'], ST['properties'][key]>;
        } : {}) & (ST['flags'] extends Array<string> ? {
            [key in ST['flags'][number]]: boolean;
        } : {})) :
        GetClassExamplerType<C> :
        null;

export type MyPacker<C extends ClassType, T extends StructTyper<C, T>> = {
    pack: (structured: MyParamsGenerator<C, T>) => BufferType;
    unpack: (raw: BufferType) => MyParamsGenerator<C, T>;
};

class A {
    x: number;
    y: number;
}

class B {
    a: number;
    b: number;
}

function createPacker<C extends ClassType, ST extends StructTyper<C, ST>>(param: ST): MyPacker<C, ST> {
    return <any> param;
}

const res = createPacker({
    type: 'array',
    item: {
        type: 'object',
        // objectConstructor: A,
        // objectConstructor: null,
        properties: {
            x: { type: 'int32' },
            y: {
                type: 'array',
                item: {
                    type: 'object',
                    objectConstructor: B,
                    properties: {
                        // z: { type: 'int32' },
                        a: { type: 'array', item: {type: 'object', objectConstructor: B, properties: {a: {type: 'int16'}, x: {type: 'int16'}}} }
                        // b: { type: 'bool' },
                        
                    },
                    flags: ['a', 'b']
                }
            },
        },
        flags: ['x', 'y', 'z'],
    }
});



// @ts-ignore
type C = ((typeof A) & null) extends null ? A : B;

type T = typeof res['pack'];
type CT = undefined & T;
type CC = unknown extends T ? A : B;
 */