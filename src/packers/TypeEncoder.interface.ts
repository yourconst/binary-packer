import { Schema } from '../types';
import { BinaryBuffer } from './BinaryBuffer';
import { BufferPointer } from './BufferPointer';

export interface TypeEncoder<T = any> {
    readonly schema: Schema;
    readonly isSizeFixed?: boolean;
    readonly isConst?: boolean;
    readonly constValue?: T;

    getSize(value: T): number;
    checkGetSize(value: T): number;

    encode(bp: BufferPointer, value: T): void;
    decode(bp: BufferPointer): T;

    // Was tested: slower than `encode` method from 3 to ... times
    // encodeGetBuffers(barr: BinaryBuffer[], value: T): void;

    getSchema(): Schema;
}

interface TypeEncoderConstructor {
    new(schema: Schema): TypeEncoder;
}

declare var TypeEncoder: TypeEncoderConstructor;
