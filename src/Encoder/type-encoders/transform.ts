import { TypeEncoder } from '../TypeEncoder.interface';
import * as Types from '../../types/types';
import { BufferPointer } from '../BufferPointer';
import { parseLengthSchema, parseSchema } from '.';
import { Cache } from './_Cache';

export const _transformCache = new Cache();

export class _te_transform implements TypeEncoder {
    readonly isSizeFixed: boolean;
    readonly _child: TypeEncoder;
    readonly _encode: (decoded: any) => any;
    readonly _decode: (encoded: any) => any;

    constructor(readonly schema: Types.Transform) {
        this._child = parseSchema(schema.child);

        this.isSizeFixed = this._child.isSizeFixed;

        this._encode = schema.encode;
        this._decode = schema.decode;
    }

    getSize(value: any) {
        const eValue = this._encode(value);
        _transformCache.add(eValue);
        return this._child.getSize(eValue);
    }

    checkGetSize(value: any, path: string) {
        const eValue = this._encode(value);
        _transformCache.add(eValue);
        return this._child.checkGetSize(eValue, path);
    }

    encode(bp: BufferPointer, value: any) {
        this._child.encode(bp, _transformCache.get());
    }

    decode(bp: BufferPointer) {
        return this._decode(this._child.decode(bp));
    }

    getSchema(): Types.Schema {
        return this._child.getSchema();
    }
}
