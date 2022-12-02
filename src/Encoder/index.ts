import { Schema, SchemaResultType } from '../types';
import { _StringEncoding } from '../types/types';
import { BinaryBuffer, BinaryBufferLike } from './BinaryBuffer';
import { BufferPointer } from './BufferPointer';
import { parseSchema } from './type-encoders';
import { TypeEncoder } from './TypeEncoder.interface';

export class Encoder<S extends Schema, BBC extends typeof BinaryBuffer = typeof BinaryBuffer> {
    private _type: TypeEncoder;

    constructor(
        private schema: S,
        /** May be removed in the future */
        private BBConstructor: BBC = <any> BinaryBuffer,
    ) {
        this._type = parseSchema(this.schema);
    }
    
    encode = (value: SchemaResultType<S>) => {
        const buffer = this.BBConstructor.allocUnsafe(this._type.getSize(
            // @ts-ignore
            value,
        ));
        
        this._type.encode(new BufferPointer(buffer), value);

        return buffer;
    }

    checkEncode = (value: SchemaResultType<S>) => {
        const buffer = this.BBConstructor.allocUnsafe(this._type.checkGetSize(
            // @ts-ignore
            value,
        ));

        this._type.encode(new BufferPointer(buffer), value);

        return buffer;
    }

    decode: {
        (src: BinaryBuffer | ArrayBufferLike | ArrayLike<number>): SchemaResultType<S>;
        (src: string, encoding?: _StringEncoding): SchemaResultType<S>
    } = (src: any, encoding?: _StringEncoding): SchemaResultType<S> => {
        let buffer: BinaryBuffer;

        if (src instanceof BinaryBuffer) {
            buffer = src;
        } else {
            buffer = this.BBConstructor.from(src, encoding);
        }

        return this._type.decode(new BufferPointer(buffer));
    }

    _decode(buffer: BinaryBuffer): SchemaResultType<S> {
        return this._type.decode(new BufferPointer(buffer));
    }

    // encodeChain<
    //     A extends Schema,
    //     B extends Schema,
    //     C extends Schema,
    //     D extends Schema
    // >(value: SchemaResultType<S>, ...pairs: [
    //     [BinaryEncoder<A>, SchemaResultType<A>],
    //     [BinaryEncoder<B>, SchemaResultType<B>]?,
    //     [BinaryEncoder<C>, SchemaResultType<C>]?,
    //     [BinaryEncoder<D>, SchemaResultType<D>]?,
    //     ...[BinaryEncoder<any>, any][],
    // ]) {
    //     // @ts-ignore
    //     const buffer = this.BBConstructor.allocUnsafe(pairs.reduce(
    //         (acc, [enc, val]) => acc + enc._type.getSize(val),
    //         this._type.getSize(value),
    //     ));

    //     const bp = new BufferPointer(buffer);

    //     this._type.encode(bp, value);

    //     for (const [enc, val] of pairs) {
    //         enc._type.encode(bp, val);
    //     }

    //     return buffer;
    // }

    toBinaryBuffer(src: ArrayBufferLike | ArrayLike<number>): ReturnType<BBC['from']>;
    toBinaryBuffer(src: string, encoding?: _StringEncoding): ReturnType<BBC['from']>;
    toBinaryBuffer(...params: [any, any?]) {
        return this.BBConstructor.from(...params);
    }

    getSchema() {
        return this.schema;
    }
}
