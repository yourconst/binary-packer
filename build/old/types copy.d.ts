/// <reference types="node" />
import { Buffer } from 'buffer';
import { ClassType, GetClassExamplerType } from './commonTypes';
export declare type BIGINT_TYPE = 'int64';
export declare type NUMBER_TYPE = 'int8' | 'int16' | 'int32' | BIGINT_TYPE | 'uint8' | 'uint16' | 'uint32' | 'float32' | 'float64';
export declare type BOOLEAN_TYPE = 'bool';
export declare type SIMPLE_TYPE = BOOLEAN_TYPE | NUMBER_TYPE;
export declare type ARRAY_TYPE = 'array';
export declare type OBJECT_TYPE = 'object';
export declare type COMPLEX_TYPE = ARRAY_TYPE | OBJECT_TYPE;
export declare type TYPE = SIMPLE_TYPE | COMPLEX_TYPE;
export declare const BufferType: BufferConstructor;
export declare type BufferType = Buffer;
export declare type StructTyperHelper = {
    type: SIMPLE_TYPE;
} | {
    type: ARRAY_TYPE;
    item: StructTyperHelper;
} | {
    type: OBJECT_TYPE;
    objectConstructor?: ClassType;
    properties: {
        [key: string]: StructTyperHelper;
    };
    flags?: string[];
};
export declare type PackerStructTyperHelper = ({
    type: SIMPLE_TYPE;
} | {
    type: ARRAY_TYPE;
    item: PackerStructTyperHelper;
} | {
    type: OBJECT_TYPE;
    objectConstructor?: ClassType;
    properties: {
        [key: string]: PackerStructTyperHelper;
    };
    flags?: string[];
}) & {
    _pack?: (structured: any, buf: BufferType, byteIndex: number) => number;
    _unpack?: (buf: BufferType, byteIndex: number) => {
        byteIndex: number;
        result: any;
    };
    _getByteSize?: (structured: any) => number;
    _flagsByteSize?: number;
};
export declare type ParamsGenerator<T extends StructTyperHelper> = T['type'] extends SIMPLE_TYPE ? T['type'] extends BOOLEAN_TYPE ? boolean : T['type'] extends BIGINT_TYPE ? BigInt : number : T['type'] extends ARRAY_TYPE ? ParamsGenerator<T['item']>[] : T['type'] extends OBJECT_TYPE ? T['objectConstructor'] extends ClassType ? GetClassExamplerType<T['objectConstructor']> : ((T['properties'] extends Object ? {
    [key in keyof T['properties']]: ParamsGenerator<T['properties'][key]>;
} : {}) & (T['flags'] extends Array<string> ? {
    [key in T['flags'][number]]: boolean;
} : {})) : null;
export declare type Packer<T extends StructTyperHelper, PA extends ParamsGenerator<T> = ParamsGenerator<T>> = {
    pack: (structured: PA) => ArrayBuffer;
    unpack: (raw: ArrayBuffer) => PA;
};
export declare type StructTyper<T extends StructTyperHelper> = {
    type: T['type'];
} & (T['type'] extends ARRAY_TYPE ? {
    item: StructTyper<T['item']>;
} : {}) & (T['type'] extends OBJECT_TYPE ? {
    objectConstructor?: T['objectConstructor'];
    properties: {
        [Key in keyof T['properties']]: StructTyper<T['properties'][Key]>;
    };
    flags?: T['flags'];
} : {});
