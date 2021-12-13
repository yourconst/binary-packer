/// <reference types="node" />
import { Buffer } from 'buffer';
import { ClassType, GetClassExamplerType } from './commonTypes';
export { ClassType, GetClassExamplerType } from './commonTypes';
export declare type BIGINT_TYPE = 'int64';
export declare type UINTS_TYPE = 'uint8' | 'uint16' | 'uint32';
export declare type NUMBER_TYPE = 'int8' | 'int16' | 'int32' | BIGINT_TYPE | UINTS_TYPE | 'float32' | 'float64';
export declare type BOOLEAN_TYPE = 'bool';
export declare type STRING_TYPE = 'string';
export declare type ARRAY_BUFFER_TYPE = 'arraybuffer';
export declare type SIMPLE_WO_STRING_TYPE = BOOLEAN_TYPE | NUMBER_TYPE;
export declare type SIMPLE_TYPE = SIMPLE_WO_STRING_TYPE | STRING_TYPE | ARRAY_BUFFER_TYPE;
export declare type BOOL_ARRAY_TYPE = 'boolarray';
export declare type ARRAY_TYPE = 'array';
export declare type OBJECT_TYPE = 'object';
export declare type COMPLEX_TYPE = BOOL_ARRAY_TYPE | ARRAY_TYPE | OBJECT_TYPE;
export declare type TYPE = SIMPLE_TYPE | COMPLEX_TYPE;
export declare const BufferType: BufferConstructor;
export declare type BufferType = Buffer;
export declare type StructTyperHelperSimple = {
    type: SIMPLE_TYPE;
};
export declare type StructTyperHelperArray = {
    type: ARRAY_TYPE;
    item: StructTyperHelper;
    lengthType?: UINTS_TYPE;
};
export declare type StructTyperHelperArrayBuffer = {
    type: ARRAY_BUFFER_TYPE;
    lengthType?: UINTS_TYPE;
};
export declare type StructTyperHelperObject = {
    type: OBJECT_TYPE;
    objectConstructor?: ClassType;
    properties: {
        [key: string]: StructTyperHelper;
    };
    flags?: string[];
};
export declare type StructTyperHelper = StructTyperHelperSimple | StructTyperHelperArray | StructTyperHelperArrayBuffer | StructTyperHelperObject;
export declare type ParamsGenerator<T extends StructTyperHelper> = T['type'] extends SIMPLE_TYPE ? T['type'] extends BOOLEAN_TYPE ? boolean : T['type'] extends BIGINT_TYPE ? BigInt : T['type'] extends STRING_TYPE ? string : T['type'] extends ARRAY_BUFFER_TYPE ? ArrayBuffer : number : T['type'] extends ARRAY_TYPE ? ParamsGenerator<T['item']>[] : T['type'] extends OBJECT_TYPE ? T['objectConstructor'] extends ClassType ? GetClassExamplerType<T['objectConstructor']> : ((T['properties'] extends Object ? {
    [key in keyof T['properties']]: ParamsGenerator<T['properties'][key]>;
} : {}) & (T['flags'] extends Array<string> ? {
    [key in T['flags'][number]]: boolean;
} : {})) : null;
