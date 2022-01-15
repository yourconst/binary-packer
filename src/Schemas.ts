import * as Types from './types';
import { ReadWriteBuffer } from './ReadWriteBuffer';
import * as Errors from './Errors';


export type StructTyperHelperSimple = {
    type: Types.SIMPLE_TYPE;
    nullable?: boolean;
};

export type StructTyperHelperArrayBuffer = {
    type: Types.ARRAY_BUFFER_TYPE;
    nullable?: boolean;
} & ({
    lengthType?: Types.UINTS_TYPE;
    multiplier?: number;
} | {
    exactLength?: number;
});

export type StructTyperHelperBoolArray = {
    type: Types.BOOL_ARRAY_TYPE;
    nullable?: boolean;
} & ({
    lengthType?: Types.UINTS_TYPE;
} | {
    exactLength?: number;
});

export type StructTyperHelperArray = {
    type: Types.ARRAY_TYPE;
    item: StructTyperHelper | TypePacker<any>;
    nullable?: boolean;
} & ({
    lengthType?: Types.UINTS_TYPE;
} | {
    exactLength?: number;
});

export type StructTyperHelperObject = {
    type: Types.OBJECT_TYPE;
    nullable?: boolean;
    objectConstructor?: Types.ClassType;
    properties: {
        [key: string]: StructTyperHelper | TypePacker<any>;
    };
    flags?: string[];
};

export type StructTyperHelper =
    StructTyperHelperSimple |
    StructTyperHelperArrayBuffer |
    StructTyperHelperBoolArray |
    StructTyperHelperArray |
    StructTyperHelperObject;


export type ParamsGenerator<T extends StructTyperHelper | TypePacker<any>> =
    T extends StructTyperHelper ?
        T['type'] extends Types.SIMPLE_TYPE ?
            T['type'] extends Types.BOOLEAN_TYPE ? boolean :
            T['type'] extends Types.BIGINT_TYPE ? BigInt :
            T['type'] extends Types.STRING_TYPE ? string :
            T['type'] extends Types.ARRAY_BUFFER_TYPE ? ArrayBuffer :
            number :
        T['type'] extends Types.BOOL_ARRAY_TYPE ? boolean[] :
        // @ts-ignore
        T['type'] extends Types.ARRAY_TYPE ? ParamsGenerator<T['item']>[] :
        T['type'] extends Types.OBJECT_TYPE ?
        // @ts-ignore
            T['objectConstructor'] extends Types.ClassType ?
            // @ts-ignore
            Types.GetClassExamplerType<T['objectConstructor']> :
            // @ts-ignore
            ((T['properties'] extends Object ? {
                // @ts-ignore
                [key in keyof T['properties']]: ParamsGenerator<T['properties'][key]>;
                // @ts-ignore
            } : {}) & (T['flags'] extends Array<string> ? {
                // @ts-ignore
                [key in T['flags'][number]]: boolean;
            } : {})) :
        null :
    T extends SimpleTypePacker<infer S> ?
        ParamsGenerator<S> :
    T extends BoolArrayTypePacker<infer BA> ?
        ParamsGenerator<BA> :
    T extends ArrayTypePacker<infer A> ?
        ParamsGenerator<A> :
    T extends ObjectTypePacker<infer O> ?
        ParamsGenerator<O> :
        null;


type TypeClass<T extends (StructTyperHelper | TypePacker<any>)> = 
        T extends StructTyperHelperSimple ?
            SimpleTypePacker<T> :
        T extends StructTyperHelperBoolArray ?
            BoolArrayTypePacker<T> :
        T extends StructTyperHelperArray ?
            ArrayTypePacker<T> :
        T extends StructTyperHelperObject ?
            ObjectTypePacker<T> :
        T extends SimpleTypePacker<any> ?
            T :
        T extends BoolArrayTypePacker<any> ?
            T :
        T extends ArrayTypePacker<any> ?
            T :
        T extends ObjectTypePacker<any> ?
            T :
            null;


export abstract class TypePacker<T extends StructTyperHelper> {
    abstract readonly _type: T['type'];
    // constructor(schema: Types.StructTyperHelper) {}

    abstract _getByteSize: (val?: any) => number;

    abstract _pack(val: any, buf: ReadWriteBuffer): void;
    abstract _unpack(buf: ReadWriteBuffer): any;

    _checkNull(val: any) {
        if (typeof (val) === 'bigint') {
            return false;
        }
        if (typeof (val) === 'number' && isNaN(val)) {
            return true;
        }

        return val === null || val === undefined;
    }

    static parseSchema
        <TP extends (StructTyperHelper | TypePacker<any>)>
        (schema: TP): TypeClass<TP>
    {
        if (schema instanceof TypePacker) {
            // @ts-ignore
            return schema;
        } else
        if (schema.type === 'boolarray') {
            // @ts-ignore
            return new BoolArrayTypePacker(schema);
        } else if (schema.type === 'array') {
            // @ts-ignore
            return new ArrayTypePacker(schema);
        } else if (schema.type === 'object') {
            // @ts-ignore
            return new ObjectTypePacker(schema);
        } else {
            // @ts-ignore
            return new SimpleTypePacker(schema);
        }
    }

    pack = (val: ParamsGenerator<T>) => {
        const buf = new ReadWriteBuffer(this._getByteSize(val));

        this._pack(val, buf);

        return buf._b;
    };

    unpack = (buf: Types.BufferType): ParamsGenerator<T> => {
        return this._unpack(new ReadWriteBuffer(buf));
    };
}



export class SimpleTypePacker
    <T extends StructTyperHelperSimple>
    extends TypePacker<T>
{
    readonly _type: T['type'];
    readonly nullable: boolean;
    readonly _getTypeSize: (val?: any) => number;
    readonly lengthType?: Types.UINTS_TYPE;
    readonly multiplier?: number;

    constructor(schema: T) {
        super();

        this._type = schema.type;
        this.nullable = !!schema.nullable;

        const size = ReadWriteBuffer.sizes[this._type];
        
        this._getTypeSize = <any> (size instanceof Function ? size : () => size);

        this.lengthType = (<any> schema).lengthType || undefined;
        this.multiplier = (<any> schema).multiplier || undefined;
    }

    _getByteSize:
        T['type'] extends Types.STRING_TYPE ?
        {(val: string): number} :
        T['type'] extends Types.ARRAY_BUFFER_TYPE ?
        {(val: ArrayBuffer): number} :
        {(): number} = (val?: any) => {
            if (this.nullable && this._checkNull(val)) {
                return +this.nullable;
            } else if (!this.nullable && this._checkNull(val)) {
                throw new Errors.UnexpectedNull(this);
            }

            return +this.nullable + this._getTypeSize(val);
        };

    _pack(val: ParamsGenerator<T>, buf: ReadWriteBuffer) {
        if (this.nullable) {
            // Because method converts to bool
            buf.bool.write(!this._checkNull(val));
            if (this._checkNull(val)) {
                return;
            }
        } else if (this._checkNull(val)) {
            throw new Errors.UnexpectedNull(this);
        }

        buf[this._type].write(<never> val);
    }

    _unpack(buf: ReadWriteBuffer): ParamsGenerator<T> {
        if (this.nullable && !buf.bool.read()) {
            return null;
        }

        // return (<any> buf[this._type].read());
        return (<any> buf[this._type]).read(this.lengthType, this.multiplier);
    }
}



export class BoolArrayTypePacker
    <T extends StructTyperHelperBoolArray>
    extends TypePacker<T>
{
    readonly _type: Types.BOOL_ARRAY_TYPE = 'boolarray';
    readonly nullable: boolean;
    readonly lengthType: Types.UINTS_TYPE;
    readonly exactLength: number;
    readonly exactByteCount: number;

    static getByteCountFromBits(bitsCount: number) {
        return Math.ceil(Math.log2(bitsCount) / 3);
    }

    constructor(schema: T) {
        super();

        this.nullable = !!schema.nullable;

        if ('exactLength' in schema) {
            if (typeof(schema.exactLength) !== 'number' || schema.exactLength < 1) {
                throw new Errors.BadExactLength(this);
            }

            this.exactLength = schema.exactLength;
            this.exactByteCount = BoolArrayTypePacker.getByteCountFromBits(this.exactLength);
            this.lengthType = null;
        } else {
            this.exactLength = null;
            this.exactByteCount = null;
            this.lengthType = (<any> schema).lengthType || 'uint32';
        }
    }

    _getByteSize = (arr: ParamsGenerator<T>): number => {
        if (this.nullable && !arr) {
            return +this.nullable;
        } else if (!this.nullable && !arr) {
            throw new Errors.UnexpectedNull(this);
        }

        return +this.nullable + (
            this.exactByteCount ||
            (ReadWriteBuffer.sizes[this.lengthType] + BoolArrayTypePacker.getByteCountFromBits(arr.length))
        );
    }

    _pack(arr: ParamsGenerator<T>, buf: ReadWriteBuffer) {
        if (this.nullable) {
            // Because method converts to bool
            buf.bool.write(<any> arr);
            if (!arr) {
                return;
            }
        } else if (!arr) {
            throw new Errors.UnexpectedNull(this);
        }

        if (this.exactLength) {
            if (arr.length !== this.exactLength) {
                throw new Errors.BadExactLength(this);
            }
        } else {
            buf[this.lengthType].write(arr.length);
        }
        
        const length = this.exactLength || arr.length;
        const size = this.exactByteCount || BoolArrayTypePacker.getByteCountFromBits(arr.length);
        const ui8a = new Uint8Array(size);

        for (let i=0; i<size; ++i) {
            const ri = i << 3;
            let b = ui8a[i];
            for (let j=0; j < 8 && ri + j<length; ++j) {
                b += (<any> arr[ri + j]) << j;
            }
            ui8a[i] = b;
        }

        buf.arraybufferWoSize.write(ui8a.buffer);
    }

    _unpack(buf: ReadWriteBuffer): ParamsGenerator<T> {
        if (this.nullable && !buf.bool.read()) {
            return null;
        }

        const length = this.exactLength || buf[this.lengthType].read();
        const size = this.exactByteCount || BoolArrayTypePacker.getByteCountFromBits(length);
        const ui8a = new Uint8Array(buf.arraybufferWoSize.read(size));

        const result: any = new Array(length);

        for (let i=0; i<size; ++i) {
            const ri = i << 3;
            let b = ui8a[i];
            for (let j=0; j < 8 && ri + j<length; ++j) {
                result[ri + j] = !!(b & (1 << j));
            }
        }

        return result;
    }
}



export class ArrayTypePacker
    <T extends StructTyperHelperArray>
    extends TypePacker<T>
{
    readonly _type: Types.ARRAY_TYPE = 'array';
    readonly item: TypeClass<T['item']>;
    readonly nullable: boolean;
    readonly lengthType: Types.UINTS_TYPE;
    readonly exactLength: number;

    constructor(schema: T) {
        super();

        this.item = <any> TypePacker.parseSchema(schema.item);

        this.nullable = !!schema.nullable;

        if ('exactLength' in schema) {
            if (typeof(schema.exactLength) !== 'number' || schema.exactLength < 1) {
                throw new Errors.BadExactLength(this);
            }

            this.exactLength = schema.exactLength;
            this.lengthType = null;
        } else {
            this.exactLength = null;
            this.lengthType = (<any> schema).lengthType || 'uint32';
        }
    }

    _getByteSize = (arr: ParamsGenerator<T>): number => {
        if (this.nullable && !arr) {
            return +this.nullable;
        } else if (!this.nullable && !arr) {
            throw new Errors.UnexpectedNull(this);
        }

        return arr.reduce(
            (acc, item) => acc + this.item._getByteSize(item),
            +this.nullable + (this.exactLength ? 0 : ReadWriteBuffer.sizes[this.lengthType]),
        );
    }

    _pack(arr: ParamsGenerator<T>, buf: ReadWriteBuffer): void {
        if (this.nullable) {
            // Because method converts to bool
            buf.bool.write(<any> arr);
            if (!arr) {
                return;
            }
        } else if (!arr) {
            throw new Errors.UnexpectedNull(this);
        }

        if (this.exactLength) {
            if (arr.length !== this.exactLength) {
                throw new Errors.BadExactLength(this);
            }
        } else {
            buf[this.lengthType].write(arr.length);
        }
    
        arr.forEach((item) => this.item._pack(item, buf));
    }

    _unpack(buf: ReadWriteBuffer): ParamsGenerator<T> {
        if (this.nullable && !buf.bool.read()) {
            return null;
        }

        const length = this.exactLength || buf[this.lengthType].read();

        const result: any = new Array(length);

        for (let i = 0; i < length; ++i) {
            result[i] = this.item._unpack(buf);
        }

        return result;
    }
}



export class ObjectTypePacker
    <T extends StructTyperHelperObject>
    extends TypePacker<T>
{
    readonly _type: Types.OBJECT_TYPE = 'object';
    readonly nullable: boolean;
    readonly propertiesKeys: Array<(keyof T['properties'])>;
    readonly propertiesEntries: Array<[(keyof T['properties']), TypeClass<T['properties'][keyof T['properties']]>]>;
    readonly properties: {
        [Key in keyof T['properties']]: TypeClass<T['properties'][Key]>;
    };
    readonly flags: T['flags'];
    readonly flagsByteSize: number;
    readonly objectConstructor?: T['objectConstructor'];

    constructor(schema: T) {
        super();
        
        this.nullable = !!schema.nullable;
        this.flags = schema.flags || [];

        this.propertiesKeys = Object.keys(schema.properties).filter((key) => {
            const property = schema.properties[key];

            if (property instanceof TypePacker) {
                return true;
            }

            if (property.type === 'bool' && !property.nullable) {
                this.flags?.push(key);
                return false;
            }

            return true;
        })/* .sort() */;

        this.properties = <any> {};
        this.propertiesEntries = [];

        for (const key of this.propertiesKeys) {
            this.properties[key] = <any> TypePacker.parseSchema(schema.properties[key]);
            this.propertiesEntries.push([key, this.properties[key]]);
        }

        this.flags.sort();

        this.flagsByteSize = schema.flags?.length ? Math.ceil(Math.log2(schema.flags.length) / 3) : 0;
    }

    _getByteSize = (obj: ParamsGenerator<T>): number => {
        if (this.nullable) {
            if (!obj) {
                return +this.nullable;
            }
        } else if (!obj) {
            throw new Errors.UnexpectedNull(this);
        }

        return this.propertiesEntries.reduce(
            (acc, [key, property]) => acc + property._getByteSize(obj[<any> key]),
            +this.nullable + this.flagsByteSize,
        )
    };

    _pack(obj: ParamsGenerator<T>, buf: ReadWriteBuffer) {
        if (this.nullable) {
            // Because method converts to bool
            buf.bool.write(<any> obj);
            if (!obj) {
                return;
            }
        } else if (!obj) {
            throw new Errors.UnexpectedNull(this);
        }

        for (const [key, property] of this.propertiesEntries) {
            property._pack(obj[<any> key], buf);
        }

        if (this.flagsByteSize) {
            const flags = this.flags.reduce((acc, key, i) => acc + (obj[key] << i), 0);
            buf.powerUints[this.flagsByteSize - 1].write(flags);
        }
    }

    _unpack(buf: ReadWriteBuffer): ParamsGenerator<T> {
        if (this.nullable && !buf.bool.read()) {
            return null;
        }

        const result = this.objectConstructor ? new this.objectConstructor() : {};

        for (const [key, property] of this.propertiesEntries) {
            result[key] = property._unpack(buf);
        }

        if (this.flagsByteSize) {
            const flags = buf.powerUints[this.flagsByteSize - 1].read();
            
            this.flags.forEach((key, i) => result[key] = !!(flags & (1 << i)));
        }

        return result;
    }
}
