import { Schema, SchemaResultType } from '../schemas';
import { _StringEncoding } from '../schemas/types';
import { BinaryBuffer, BinaryBufferLike } from './BinaryBuffer';
import { BufferPointer } from './BufferPointer';
import { parseSchema } from './encoders';
import { TypePacker } from './TypePacker.interface';

export class BinaryPacker<S extends Schema, BBC extends typeof BinaryBuffer = typeof BinaryBuffer> {
    private _type: TypePacker;

    constructor(
        private schema: S,
        /** May be removed in the future */
        private BBConstructor: BBC = <any> BinaryBuffer,
    ) {
        this._type = parseSchema(this.schema);
    }
    
    encode(value: SchemaResultType<S>) {
        const buffer = this.BBConstructor.allocUnsafe(this._type.getSize(
            // @ts-ignore
            value,
        ));
        
        this._type.encode(new BufferPointer(buffer), value);

        return buffer;
    }

    decode(src: BinaryBuffer | ArrayBufferLike | ArrayLike<number>): SchemaResultType<S>
    decode(src: string, encoding?: _StringEncoding): SchemaResultType<S>
    decode(src: any, encoding?: _StringEncoding): SchemaResultType<S> {
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

    toBinaryBuffer(src: ArrayBufferLike | ArrayLike<number>): ReturnType<BBC['from']>;
    toBinaryBuffer(src: string, encoding?: _StringEncoding): ReturnType<BBC['from']>;
    toBinaryBuffer(...params: [any, any?]) {
        return this.BBConstructor.from(...params);
    }

    getSchema() {
        return this.schema;
    }
}
