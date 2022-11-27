import { Schema } from '../schemas';
import { BinaryBuffer } from './BinaryBuffer';
import { BufferPointer } from './BufferPointer';

export interface TypePacker<T = any> {
    readonly schema: Schema;
    readonly isSizeFixed?: boolean;
    readonly isConst?: boolean;
    readonly constValue?: T;

    getSize(value: T): number;

    encode(bp: BufferPointer, value: T): void;
    decode(bp: BufferPointer): T;

    // Was tested: slower than `encode` method from 3 to ... times
    // encodeGetBuffers(barr: BinaryBuffer[], value: T): void;

    getSchema(): Schema;
}

interface TypePackerConstructor {
    new(schema: Schema): TypePacker;
}

declare var TypePacker: TypePackerConstructor;
