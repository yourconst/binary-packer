import { TypeEncoder } from '../TypeEncoder.interface';
import * as Types from '../../types/types';
import { BufferPointer } from '../BufferPointer';
import { parseLengthSchema, parseSchema } from '.';
import { BinaryBuffer, StringEncoders } from '../BinaryBuffer';

// const stringBufferCache = new Map<string, BinaryBuffer>();

// const getStringBuffer = (value: string, encoding: Types._StringEncoding) => {
//     let _b = stringBufferCache.get(value);

//     if (!_b) {
//         _b = BinaryBuffer.from(value, encoding);
//         stringBufferCache.set(value, _b);
//     }

//     return _b;
// };

class StringLengthCache {
    private _cache: number[] = [];
    private _it = -1;
    // private _it: Iterator<number>;

    reset() {
        this._cache.length = 0;
        this._it = -1;
        // this._it = this._cache.values();
    }

    add(length: number) {
        this._cache.push(length);
    }

    get() {
        return this._cache[++this._it];
        // return this._it.next().value;
    }
}

export const _stringLengthCache = new StringLengthCache();

export class _te_string implements TypeEncoder<string> {
    readonly isSizeFixed = false;
    private readonly _lengthType: TypeEncoder<number>;
    private readonly _encoding: Types._StringEncoding;

    readonly getSize: TypeEncoder<string>['getSize'];
    readonly checkGetSize: TypeEncoder<string>['checkGetSize'];
    readonly encode: TypeEncoder<string>['encode'];
    readonly decode: TypeEncoder<string>['decode'];

    constructor(readonly schema: Types.String) {
        this._lengthType = parseLengthSchema(schema.lengthType || 'uvarint32');
        this._encoding = schema.encoding || 'utf8';

        const encoder = StringEncoders[this._encoding];
        
        this.getSize = <any> Function('byteLength, _stringLengthCache, lengthType', `
            return value => {
                const _s = Buffer.byteLength(value, '${this._encoding}');
                _stringLengthCache.add(_s);
                return lengthType.getSize(_s) + _s;
            };
        `)(encoder.byteLength, _stringLengthCache, this._lengthType);

        this.checkGetSize = <any> Function('byteLength, _stringLengthCache, lengthType', `
            return value => {
                if (typeof value !== 'string') {
                    throw new Error();
                }
                const _s = Buffer.byteLength(value, '${this._encoding}');
                _stringLengthCache.add(_s);
                return lengthType.getSize(_s) + _s;
            };
        `)(encoder.byteLength, _stringLengthCache, this._lengthType);

        this.encode = <any> Function('encodeInto, _stringLengthCache, lengthType', `
            return (bp, value) => {
                const _s = _stringLengthCache.get();
                lengthType.encode(bp, _s);
                bp.buffer.write(value, bp.getAdd(_s), '${this._encoding}');
                // bp.buffer.${this._encoding}Write(value, bp.getAdd(_s));
                // encodeInto(bp.buffer, value, bp.getAdd(_s));
            };
        `)(encoder.encodeInto, _stringLengthCache, this._lengthType);

        this.decode = <any> Function('decode, lengthType', `
            return bp => {
                const _s = lengthType.decode(bp);
                const _ptr = bp.getAdd(_s);
                return bp.buffer.toString('${this._encoding}', _ptr, _ptr + _s);
                // return decode(bp.buffer, _ptr, _ptr + _s);
            };
        `)(encoder.decode, this._lengthType);
    }

    // getSize(value: string) {
    //     const _b = getStringBuffer(value, this._encoding);

    //     return this._lengthType.getSize(_b.length) + _b.length;
    // }

    // encode(bp: BufferPointer, value: string) {
    //     const _b = getStringBuffer(value, this._encoding);
    //     this._lengthType.encode(bp, _b.length);
    //     bp.buffer.set(_b, bp.getAdd(_b.length));
    // }

    /* getSize(value: string) {
        const _s = _stringLengthCache.bb.byteLength(value, this._encoding);
        _stringLengthCache.add(_s);
        return this._lengthType.getSize(_s) + _s;
    }

    checkGetSize(value: string) {
        if (typeof value !== 'string') {
            throw new Error();
        }

        const _s = _stringLengthCache.bb.byteLength(value, this._encoding);
        _stringLengthCache.add(_s);
        return this._lengthType.checkGetSize(_s) + _s;
    }

    encode(bp: BufferPointer, value: string) {
        const _s = _stringLengthCache.get(); // _stringLengthCache.bb.byteLength(value, this._encoding);
        this._lengthType.encode(bp, _s);
        (<any>bp.buffer).utf8Write(value, bp.getAdd(_s));
        // bp.buffer.write(value, bp.getAdd(_s), this._encoding);
    }

    decode(bp: BufferPointer) {
        const _s = this._lengthType.decode(bp);
        const _ptr = bp.getAdd(_s);
        return bp.buffer.toString(this._encoding, _ptr, _ptr + _s);
    } */

    getSchema(): Types.Schema {
        return {
            type: 'string',
            lengthType: <Types._Length> this._lengthType.getSchema(),
        };
    }
}
