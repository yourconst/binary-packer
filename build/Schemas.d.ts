/// <reference types="node" />
import * as Types from './types';
import { ReadWriteBuffer } from './ReadWriteBuffer';
export declare type StructTyperHelperSimple = {
    type: Types.SIMPLE_TYPE;
    nullable?: boolean;
};
export declare type StructTyperHelperArrayBuffer = {
    type: Types.ARRAY_BUFFER_TYPE;
    nullable?: boolean;
} & ({
    lengthType?: Types.UINTS_TYPE;
} | {
    exactLength?: number;
});
export declare type StructTyperHelperBoolArray = {
    type: Types.BOOL_ARRAY_TYPE;
    nullable?: boolean;
} & ({
    lengthType?: Types.UINTS_TYPE;
} | {
    exactLength?: number;
});
export declare type StructTyperHelperArray = {
    type: Types.ARRAY_TYPE;
    item: StructTyperHelper | TypePacker<any>;
    nullable?: boolean;
} & ({
    lengthType?: Types.UINTS_TYPE;
} | {
    exactLength?: number;
});
export declare type StructTyperHelperObject = {
    type: Types.OBJECT_TYPE;
    nullable?: boolean;
    objectConstructor?: Types.ClassType;
    properties: {
        [key: string]: StructTyperHelper | TypePacker<any>;
    };
    flags?: string[];
};
export declare type StructTyperHelper = StructTyperHelperSimple | StructTyperHelperArrayBuffer | StructTyperHelperBoolArray | StructTyperHelperArray | StructTyperHelperObject;
export declare type ParamsGenerator<T extends StructTyperHelper | TypePacker<any>> = T extends StructTyperHelper ? T['type'] extends Types.SIMPLE_TYPE ? T['type'] extends Types.BOOLEAN_TYPE ? boolean : T['type'] extends Types.BIGINT_TYPE ? BigInt : T['type'] extends Types.STRING_TYPE ? string : T['type'] extends Types.ARRAY_BUFFER_TYPE ? ArrayBuffer : number : T['type'] extends Types.BOOL_ARRAY_TYPE ? boolean[] : T['type'] extends Types.ARRAY_TYPE ? ParamsGenerator<T['item']>[] : T['type'] extends Types.OBJECT_TYPE ? T['objectConstructor'] extends Types.ClassType ? Types.GetClassExamplerType<T['objectConstructor']> : ((T['properties'] extends Object ? {
    [key in keyof T['properties']]: ParamsGenerator<T['properties'][key]>;
} : {}) & (T['flags'] extends Array<string> ? {
    [key in T['flags'][number]]: boolean;
} : {})) : null : T extends SimpleTypePacker<infer S> ? ParamsGenerator<S> : T extends BoolArrayTypePacker<infer BA> ? ParamsGenerator<BA> : T extends ArrayTypePacker<infer A> ? ParamsGenerator<A> : T extends ObjectTypePacker<infer O> ? ParamsGenerator<O> : null;
declare type TypeClass<T extends (StructTyperHelper | TypePacker<any>)> = T extends StructTyperHelperSimple ? SimpleTypePacker<T> : T extends StructTyperHelperBoolArray ? BoolArrayTypePacker<T> : T extends StructTyperHelperArray ? ArrayTypePacker<T> : T extends StructTyperHelperObject ? ObjectTypePacker<T> : T extends SimpleTypePacker<any> ? T : T extends BoolArrayTypePacker<any> ? T : T extends ArrayTypePacker<any> ? T : T extends ObjectTypePacker<any> ? T : null;
export declare abstract class TypePacker<T extends StructTyperHelper> {
    abstract readonly _type: T['type'];
    abstract _getByteSize: (val?: any) => number;
    abstract _pack(val: any, buf: ReadWriteBuffer): void;
    abstract _unpack(buf: ReadWriteBuffer): any;
    _checkNull(val: any): boolean;
    static parseSchema<TP extends (StructTyperHelper | TypePacker<any>)>(schema: TP): TypeClass<TP>;
    pack: (val: ParamsGenerator<T>) => Buffer;
    unpack: (buf: Types.BufferType) => ParamsGenerator<T>;
}
export declare class SimpleTypePacker<T extends StructTyperHelperSimple> extends TypePacker<T> {
    readonly _type: T['type'];
    readonly nullable: boolean;
    readonly _getTypeSize: (val?: any) => number;
    constructor(schema: T);
    _getByteSize: T['type'] extends Types.STRING_TYPE ? {
        (val: string): number;
    } : T['type'] extends Types.ARRAY_BUFFER_TYPE ? {
        (val: ArrayBuffer): number;
    } : {
        (): number;
    };
    _pack(val: ParamsGenerator<T>, buf: ReadWriteBuffer): void;
    _unpack(buf: ReadWriteBuffer): ParamsGenerator<T>;
}
export declare class BoolArrayTypePacker<T extends StructTyperHelperBoolArray> extends TypePacker<T> {
    readonly _type: Types.BOOL_ARRAY_TYPE;
    readonly nullable: boolean;
    readonly lengthType: Types.UINTS_TYPE;
    readonly exactLength: number;
    readonly exactByteCount: number;
    static getByteCountFromBits(bitsCount: number): number;
    constructor(schema: T);
    _getByteSize: (arr: ParamsGenerator<T>) => number;
    _pack(arr: ParamsGenerator<T>, buf: ReadWriteBuffer): void;
    _unpack(buf: ReadWriteBuffer): ParamsGenerator<T>;
}
export declare class ArrayTypePacker<T extends StructTyperHelperArray> extends TypePacker<T> {
    readonly _type: Types.ARRAY_TYPE;
    readonly item: TypeClass<T['item']>;
    readonly nullable: boolean;
    readonly lengthType: Types.UINTS_TYPE;
    readonly exactLength: number;
    constructor(schema: T);
    _getByteSize: (arr: ParamsGenerator<T>) => number;
    _pack(arr: ParamsGenerator<T>, buf: ReadWriteBuffer): void;
    _unpack(buf: ReadWriteBuffer): ParamsGenerator<T>;
}
export declare class ObjectTypePacker<T extends StructTyperHelperObject> extends TypePacker<T> {
    readonly _type: Types.OBJECT_TYPE;
    readonly nullable: boolean;
    readonly propertiesKeys: Array<(keyof T['properties'])>;
    readonly propertiesEntries: Array<[(keyof T['properties']), TypeClass<T['properties'][keyof T['properties']]>]>;
    readonly properties: {
        [Key in keyof T['properties']]: TypeClass<T['properties'][Key]>;
    };
    readonly flags: T['flags'];
    readonly flagsByteSize: number;
    readonly objectConstructor?: T['objectConstructor'];
    constructor(schema: T);
    _getByteSize: (obj: ParamsGenerator<T>) => number;
    _pack(obj: ParamsGenerator<T>, buf: ReadWriteBuffer): void;
    _unpack(buf: ReadWriteBuffer): ParamsGenerator<T>;
}
export {};
