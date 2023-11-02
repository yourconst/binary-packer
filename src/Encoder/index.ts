import { Schema, SchemaResultType } from '../types';
import { _StringEncoding } from '../types/types';
import { argd } from './argd';
import { BinaryBuffer, BinaryBufferLike, CustomBinaryBuffer } from './BinaryBuffer';
import { BufferPointer } from './BufferPointer';
import { parseSchema } from './type-encoders';
import { _stringLengthCache } from './type-encoders/string';
import { _transformCache } from './type-encoders/transform';
import { TypeEncoder } from './TypeEncoder.interface';

const BBC = argd.CustomBinaryBuffer ? CustomBinaryBuffer : BinaryBuffer;

export class Encoder<S extends Schema/* , BBC extends typeof BinaryBuffer = typeof BinaryBuffer */> {
    private _type: TypeEncoder;

    constructor(private schema: S/* , readonly BBC: BBC = <any> BinaryBuffer */) {
        this._type = parseSchema(this.schema);
    }

    encode = (value: SchemaResultType<S>) => {
        _stringLengthCache.clear();
        _transformCache.clear();
        const buffer = BBC.allocUnsafe(this._type.getSize(value));
        // _transformCache.clear();
        
        this._type.encode(new BufferPointer(buffer), value);

        return buffer;
    }

    checkEncode = (value: SchemaResultType<S>) => {
        _stringLengthCache.clear();
        _transformCache.clear();
        const buffer = BBC.allocUnsafe(this._type.checkGetSize(value, 'root'));
        // _transformCache.clear();

        this._type.encode(new BufferPointer(buffer), value);

        return buffer;
    }

    decode: {
        (src: BinaryBuffer | ArrayBufferLike | ArrayLike<number>): SchemaResultType<S>;
        (src: string, encoding?: _StringEncoding): SchemaResultType<S>
    } = (src: any, encoding?: _StringEncoding): SchemaResultType<S> => {
        let buffer: BinaryBuffer;

        if (src instanceof BBC) {
            buffer = src;
        } else
        if (src?.buffer instanceof ArrayBuffer) {
            buffer = BBC.from(src.buffer);
        } else {
            buffer = BBC.from(src, encoding);
        }

        return this._type.decode(new BufferPointer(buffer));
    }

    _decode = (buffer: BinaryBuffer): SchemaResultType<S> => {
        return this._type.decode(new BufferPointer(buffer));
    }

    getSchema() {
        return this.schema;
    }
}
