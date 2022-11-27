import { _StringEncoding } from '../../schemas/types';
import * as Encoders from './encoders';

export interface BinaryBuffer extends Uint8Array {
    write(src: string, offset?: number, encoding?: _StringEncoding): number;
    toString(encoding?: _StringEncoding, start?: number, end?: number): string;

    readUInt8(offset?: number): number;
    writeUInt8(value: number, offset?: number): number;
    readInt8(offset?: number): number;
    writeInt8(value: number, offset?: number): number;

    readUInt16LE(offset?: number): number;
    writeUInt16LE(value: number, offset?: number): number;
    readUInt16BE(offset?: number): number;
    writeUInt16BE(value: number, offset?: number): number;
    readInt16LE(offset?: number): number;
    writeInt16LE(value: number, offset?: number): number;
    readInt16BE(offset?: number): number;
    writeInt16BE(value: number, offset?: number): number;

    readUInt32LE(offset?: number): number;
    writeUInt32LE(value: number, offset?: number): number;
    readUInt32BE(offset?: number): number;
    writeUInt32BE(value: number, offset?: number): number;
    readInt32LE(offset?: number): number;
    writeInt32LE(value: number, offset?: number): number;
    readInt32BE(offset?: number): number;
    writeInt32BE(value: number, offset?: number): number;

    readBigUInt64LE(offset?: number): bigint;
    writeBigUInt64LE(value: bigint, offset?: number): number;
    readBigUInt64BE(offset?: number): bigint;
    writeBigUInt64BE(value: bigint, offset?: number): number;
    readBigInt64LE(offset?: number): bigint;
    writeBigInt64LE(value: bigint, offset?: number): number;
    readBigInt64BE(offset?: number): bigint;
    writeBigInt64BE(value: bigint, offset?: number): number;

    readFloatLE(offset?: number): number;
    writeFloatLE(value: number, offset?: number): number;
    readFloatBE(offset?: number): number;
    writeFloatBE(value: number, offset?: number): number;

    readDoubleLE(offset?: number): number;
    writeDoubleLE(value: number, offset?: number): number;
    readDoubleBE(offset?: number): number;
    writeDoubleBE(value: number, offset?: number): number;
}

export interface BinaryBufferConstructor {
    // /**
    //  * @deprecated
    //  */
    // new(str: string, encoding?: BufferEncoding): BinaryBuffer;
    /**
     * @deprecated
     */
    new(size: number): BinaryBuffer;
    // /**
    //  * @deprecated
    //  */
    // new(array: Uint8Array): BinaryBuffer;
    // /**
    //  * @deprecated
    //  */
    // new(arrayBuffer: ArrayBuffer | SharedArrayBuffer): BinaryBuffer;
    // /**
    //  * @deprecated
    //  */
    // new(array: ReadonlyArray<any>): BinaryBuffer;
    // /**
    //  * @deprecated
    //  */
    // new(buffer: BinaryBuffer): BinaryBuffer;

    from(src: ArrayBufferLike | ArrayLike<number>): BinaryBuffer;
    from(src: string, encoding?: _StringEncoding): BinaryBuffer;
    allocUnsafe(size: number): BinaryBuffer;
    byteLength(src: string, encoding?: _StringEncoding): number;
    // concat(list: ReadonlyArray<Uint8Array>): BinaryBuffer;
}

export type BinaryBufferLike = ArrayBufferLike | ArrayLike<number> | string;

// declare var BinaryBuffer: BinaryBufferConstructor;

const ui8a = new Uint8Array([0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88]);
const i8a = new Int8Array(ui8a.buffer);
const ui16a = new Uint16Array(ui8a.buffer);
const i16a = new Int16Array(ui8a.buffer);
const ui32a = new Uint32Array(ui8a.buffer);
const i32a = new Int32Array(ui8a.buffer);
const ui64a = new BigUint64Array(ui8a.buffer);
const i64a = new BigInt64Array(ui8a.buffer);
const f32a = new Float32Array(ui8a.buffer);
const f64a = new Float64Array(ui8a.buffer);

// const te = new TextEncoder();
// const td = new TextDecoder('utf-8');

const getEncoder = (encoding: _StringEncoding = 'utf8') => {
    if (encoding === 'ascii') {
        return Encoders.ascii;
    } else if (encoding === 'utf8') {
        return Encoders.utf8;
    } else {
        throw new Error('');
    }
};

class BinaryBufferLE extends Uint8Array implements BinaryBuffer {
    static from(arg: any, ...params: any[]) {
        if (typeof arg === 'string') {
            // return new this(new TextEncoder().encode(arg).buffer);
            return new this(getEncoder(params[0]).encode(arg));
        } else if (Array.isArray(arg)) {
            return new this(arg);
        } else if (arg instanceof this) {
            return arg;
        } else if (arg?.buffer instanceof ArrayBuffer) {
            return new this(arg.buffer);
        } else {
            throw new Error('Bad params', { cause: params });
        }
    }

    static allocUnsafe(size: number) {
        return new BinaryBufferLE(size);
    }

    static byteLength(src: string, encoding: _StringEncoding) {
        // return te.encode(src).buffer.byteLength;
        return getEncoder(encoding).byteLength(src);
    }

    // static concat(list: readonly Uint8Array[]) {
    //     // return new BinaryBufferLE(Buffer.concat(list).buffer);
    //     const result = new BinaryBufferLE(list.reduce((acc, a) => acc + a.length, 0));

    //     let offset = 0;
    //     for (const a of list) {
    //         result.set(a, offset);
    //         offset += a.length;
    //     }

    //     return result;
    // }

    write(src: string, offset: number, encoding?: _StringEncoding) {
        // return te.encodeInto(src, this.subarray(offset)).written + offset;
        return getEncoder(encoding).encodeInto(src, <any> this, offset);
        // const units = getEncoder(encoding).encode(src);

        // this.set(units, offset);

        // return units.length + offset;
    }

    toString(encoding?: _StringEncoding, start = 0, end = this.length) {
        // new Blob([this]).text()
        // return td.decode(this.subarray(start, end));
        return getEncoder(encoding).decode(this, start, end);
    }


    readUInt8(offset?: number) {
        return this[offset];
    }
    writeUInt8(value: number, offset = 0) {
        this[offset] = value;
        return offset + 1;
    }

    readInt8(offset?: number) {
        ui8a[0] = this[offset];
        return i8a[0];
    }
    writeInt8(value: number, offset = 0) {
        i8a[0] = value;
        this[offset] = ui8a[0];
        return offset + 1;
    }


    readUInt16LE(offset = 0) {
        // ui8a.set(this.subarray(offset, offset + 2));
        ui8a[0] = this[offset];
        ui8a[1] = this[offset + 1];
        return ui16a[0];
    }
    writeUInt16LE(value: number, offset = 0) {
        ui16a[0] = value;
        // this.set(ui8a.subarray(0, 2));
        this[offset] = ui8a[0];
        this[offset + 1] = ui8a[1];
        return offset + 2;
    }
    readUInt16BE(offset = 0) {
        ui8a[1] = this[offset];
        ui8a[0] = this[offset + 1];
        return ui16a[0];
    }
    writeUInt16BE(value: number, offset = 0) {
        ui16a[0] = value;
        this[offset] = ui8a[1];
        this[offset + 1] = ui8a[0];
        return offset + 2;
    }

    readInt16LE(offset = 0) {
        // ui8a.set(this.subarray(offset, offset + 2));
        ui8a[0] = this[offset];
        ui8a[1] = this[offset + 1];
        return i16a[0];
    }
    writeInt16LE(value: number, offset = 0) {
        i16a[0] = value;
        // this.set(ui8a.subarray(0, 2));
        this[offset] = ui8a[0];
        this[offset + 1] = ui8a[1];
        return offset + 2;
    }
    readInt16BE(offset = 0) {
        ui8a[1] = this[offset];
        ui8a[0] = this[offset + 1];
        return i16a[0];
    }
    writeInt16BE(value: number, offset = 0) {
        i16a[0] = value;
        this[offset] = ui8a[1];
        this[offset + 1] = ui8a[0];
        return offset + 2;
    }


    readUInt32LE(offset = 0) {
        // ui8a.set(this.subarray(offset, offset + 4));
        ui8a[0] = this[offset];
        ui8a[1] = this[offset + 1];
        ui8a[2] = this[offset + 2];
        ui8a[3] = this[offset + 3];
        return ui32a[0];
    }
    writeUInt32LE(value: number, offset = 0) {
        ui32a[0] = value;
        // this.set(ui8a.subarray(0, 4));
        this[offset] = ui8a[0];
        this[offset + 1] = ui8a[1];
        this[offset + 2] = ui8a[2];
        this[offset + 3] = ui8a[3];
        return offset + 4;
    }
    readUInt32BE(offset = 0) {
        ui8a[3] = this[offset];
        ui8a[2] = this[offset + 1];
        ui8a[1] = this[offset + 2];
        ui8a[0] = this[offset + 3];
        return ui32a[0];
    }
    writeUInt32BE(value: number, offset = 0) {
        ui32a[0] = value;
        this[offset] = ui8a[3];
        this[offset + 1] = ui8a[2];
        this[offset + 2] = ui8a[1];
        this[offset + 3] = ui8a[0];
        return offset + 4;
    }

    readInt32LE(offset = 0) {
        // ui8a.set(this.subarray(offset, offset + 4));
        ui8a[0] = this[offset];
        ui8a[1] = this[offset + 1];
        ui8a[2] = this[offset + 2];
        ui8a[3] = this[offset + 3];
        return i32a[0];
    }
    writeInt32LE(value: number, offset = 0) {
        i32a[0] = value;
        // this.set(ui8a.subarray(0, 4));
        this[offset] = ui8a[0];
        this[offset + 1] = ui8a[1];
        this[offset + 2] = ui8a[2];
        this[offset + 3] = ui8a[3];
        return offset + 4;
    }
    readInt32BE(offset = 0) {
        ui8a[3] = this[offset];
        ui8a[2] = this[offset + 1];
        ui8a[1] = this[offset + 2];
        ui8a[0] = this[offset + 3];
        return i32a[0];
    }
    writeInt32BE(value: number, offset = 0) {
        i32a[0] = value;
        this[offset] = ui8a[3];
        this[offset + 1] = ui8a[2];
        this[offset + 2] = ui8a[1];
        this[offset + 3] = ui8a[0];
        return offset + 4;
    }


    readBigUInt64LE(offset = 0) {
        // ui8a.set(this.subarray(offset, offset + 8));
        ui8a[0] = this[offset];
        ui8a[1] = this[offset + 1];
        ui8a[2] = this[offset + 2];
        ui8a[3] = this[offset + 3];
        ui8a[4] = this[offset + 4];
        ui8a[5] = this[offset + 5];
        ui8a[6] = this[offset + 6];
        ui8a[7] = this[offset + 7];
        return ui64a[0];
    }
    writeBigUInt64LE(value: bigint, offset = 0) {
        ui64a[0] = value;
        // this.set(ui8a.subarray(0, 8));
        this[offset] = ui8a[0];
        this[offset + 1] = ui8a[1];
        this[offset + 2] = ui8a[2];
        this[offset + 3] = ui8a[3];
        this[offset + 4] = ui8a[4];
        this[offset + 5] = ui8a[5];
        this[offset + 6] = ui8a[6];
        this[offset + 7] = ui8a[7];
        return offset + 8;
    }
    readBigUInt64BE(offset = 0) {
        ui8a[7] = this[offset];
        ui8a[6] = this[offset + 1];
        ui8a[5] = this[offset + 2];
        ui8a[4] = this[offset + 3];
        ui8a[3] = this[offset + 4];
        ui8a[2] = this[offset + 5];
        ui8a[1] = this[offset + 6];
        ui8a[0] = this[offset + 7];
        return ui64a[0];
    }
    writeBigUInt64BE(value: bigint, offset = 0) {
        ui64a[0] = value;
        this[offset] = ui8a[7];
        this[offset + 1] = ui8a[6];
        this[offset + 2] = ui8a[5];
        this[offset + 3] = ui8a[4];
        this[offset + 4] = ui8a[3];
        this[offset + 5] = ui8a[2];
        this[offset + 6] = ui8a[1];
        this[offset + 7] = ui8a[0];
        return offset + 8;
    }

    readBigInt64LE(offset = 0) {
        // ui8a.set(this.subarray(offset, offset + 8));
        ui8a[0] = this[offset];
        ui8a[1] = this[offset + 1];
        ui8a[2] = this[offset + 2];
        ui8a[3] = this[offset + 3];
        ui8a[4] = this[offset + 4];
        ui8a[5] = this[offset + 5];
        ui8a[6] = this[offset + 6];
        ui8a[7] = this[offset + 7];
        return i64a[0];
    }
    writeBigInt64LE(value: bigint, offset = 0) {
        i64a[0] = value;
        // this.set(ui8a.subarray(0, 8));
        this[offset] = ui8a[0];
        this[offset + 1] = ui8a[1];
        this[offset + 2] = ui8a[2];
        this[offset + 3] = ui8a[3];
        this[offset + 4] = ui8a[4];
        this[offset + 5] = ui8a[5];
        this[offset + 6] = ui8a[6];
        this[offset + 7] = ui8a[7];
        return offset + 8;
    }
    readBigInt64BE(offset = 0) {
        ui8a[7] = this[offset];
        ui8a[6] = this[offset + 1];
        ui8a[5] = this[offset + 2];
        ui8a[4] = this[offset + 3];
        ui8a[3] = this[offset + 4];
        ui8a[2] = this[offset + 5];
        ui8a[1] = this[offset + 6];
        ui8a[0] = this[offset + 7];
        return i64a[0];
    }
    writeBigInt64BE(value: bigint, offset = 0) {
        i64a[0] = value;
        this[offset] = ui8a[7];
        this[offset + 1] = ui8a[6];
        this[offset + 2] = ui8a[5];
        this[offset + 3] = ui8a[4];
        this[offset + 4] = ui8a[3];
        this[offset + 5] = ui8a[2];
        this[offset + 6] = ui8a[1];
        this[offset + 7] = ui8a[0];
        return offset + 8;
    }



    readFloatLE(offset = 0) {
        // this.set(ui8a.subarray(0, 4));
        ui8a[0] = this[offset];
        ui8a[1] = this[offset + 1];
        ui8a[2] = this[offset + 2];
        ui8a[3] = this[offset + 3];
        return f32a[0];
    }
    writeFloatLE(value: number, offset = 0) {
        f32a[0] = value;
        // this.set(ui8a.subarray(0, 4));
        this[offset] = ui8a[0];
        this[offset + 1] = ui8a[1];
        this[offset + 2] = ui8a[2];
        this[offset + 3] = ui8a[3];
        return offset + 4;
    }
    readFloatBE(offset = 0) {
        ui8a[3] = this[offset];
        ui8a[2] = this[offset + 1];
        ui8a[1] = this[offset + 2];
        ui8a[0] = this[offset + 3];
        return f32a[0];
    }
    writeFloatBE(value: number, offset = 0) {
        f32a[0] = value;
        this[offset] = ui8a[3];
        this[offset + 1] = ui8a[2];
        this[offset + 2] = ui8a[1];
        this[offset + 3] = ui8a[0];
        return offset + 4;
    }


    readDoubleLE(offset = 0) {
        // this.set(ui8a.subarray(0, 8));
        ui8a[0] = this[offset];
        ui8a[1] = this[offset + 1];
        ui8a[2] = this[offset + 2];
        ui8a[3] = this[offset + 3];
        ui8a[4] = this[offset + 4];
        ui8a[5] = this[offset + 5];
        ui8a[6] = this[offset + 6];
        ui8a[7] = this[offset + 7];
        return f64a[0];
    }
    writeDoubleLE(value: number, offset = 0) {
        f64a[0] = value;
        // this.set(ui8a.subarray(0, 8));
        this[offset] = ui8a[0];
        this[offset + 1] = ui8a[1];
        this[offset + 2] = ui8a[2];
        this[offset + 3] = ui8a[3];
        this[offset + 4] = ui8a[4];
        this[offset + 5] = ui8a[5];
        this[offset + 6] = ui8a[6];
        this[offset + 7] = ui8a[7];
        return offset + 8;
    }
    readDoubleBE(offset = 0) {
        ui8a[7] = this[offset];
        ui8a[6] = this[offset + 1];
        ui8a[5] = this[offset + 2];
        ui8a[4] = this[offset + 3];
        ui8a[3] = this[offset + 4];
        ui8a[2] = this[offset + 5];
        ui8a[1] = this[offset + 6];
        ui8a[0] = this[offset + 7];
        return f64a[0];
    }
    writeDoubleBE(value: number, offset = 0) {
        f64a[0] = value;
        this[offset] = ui8a[7];
        this[offset + 1] = ui8a[6];
        this[offset + 2] = ui8a[5];
        this[offset + 3] = ui8a[4];
        this[offset + 4] = ui8a[3];
        this[offset + 5] = ui8a[2];
        this[offset + 6] = ui8a[1];
        this[offset + 7] = ui8a[0];
        return offset + 8;
    }
}

class BinaryBufferBE extends Uint8Array implements BinaryBuffer {
    static from = BinaryBufferLE.from;
    static allocUnsafe = BinaryBufferLE.allocUnsafe;
    static byteLength = BinaryBufferLE.byteLength;

    write: typeof BinaryBufferLE.prototype.write;
    toString: typeof BinaryBufferLE.prototype.toString;

    readUInt8: typeof BinaryBufferLE.prototype.readUInt8;
    writeUInt8: typeof BinaryBufferLE.prototype.writeUInt8;
    readInt8: typeof BinaryBufferLE.prototype.readInt8;
    writeInt8: typeof BinaryBufferLE.prototype.writeInt8;

    readUInt16BE: typeof BinaryBufferLE.prototype.readUInt16LE;
    writeUInt16BE: typeof BinaryBufferLE.prototype.writeUInt16LE;
    readUInt16LE: typeof BinaryBufferLE.prototype.readUInt16BE;
    writeUInt16LE: typeof BinaryBufferLE.prototype.writeUInt16BE;
    readInt16BE: typeof BinaryBufferLE.prototype.readInt16LE;
    writeInt16BE: typeof BinaryBufferLE.prototype.writeInt16LE;
    readInt16LE: typeof BinaryBufferLE.prototype.readInt16BE;
    writeInt16LE: typeof BinaryBufferLE.prototype.writeInt16BE;

    readUInt32BE: typeof BinaryBufferLE.prototype.readUInt32LE;
    writeUInt32BE: typeof BinaryBufferLE.prototype.writeUInt32LE;
    readUInt32LE: typeof BinaryBufferLE.prototype.readUInt32BE;
    writeUInt32LE: typeof BinaryBufferLE.prototype.writeUInt32BE;
    readInt32BE: typeof BinaryBufferLE.prototype.readInt32LE;
    writeInt32BE: typeof BinaryBufferLE.prototype.writeInt32LE;
    readInt32LE: typeof BinaryBufferLE.prototype.readInt32BE;
    writeInt32LE: typeof BinaryBufferLE.prototype.writeInt32BE;

    readBigUInt64BE: typeof BinaryBufferLE.prototype.readBigUInt64LE;
    writeBigUInt64BE: typeof BinaryBufferLE.prototype.writeBigUInt64LE;
    readBigUInt64LE: typeof BinaryBufferLE.prototype.readBigUInt64BE;
    writeBigUInt64LE: typeof BinaryBufferLE.prototype.writeBigUInt64BE;
    readBigInt64BE: typeof BinaryBufferLE.prototype.readBigInt64LE;
    writeBigInt64BE: typeof BinaryBufferLE.prototype.writeBigInt64LE;
    readBigInt64LE: typeof BinaryBufferLE.prototype.readBigInt64BE;
    writeBigInt64LE: typeof BinaryBufferLE.prototype.writeBigInt64BE;

    readFloatBE: typeof BinaryBufferLE.prototype.readFloatLE;
    writeFloatBE: typeof BinaryBufferLE.prototype.writeFloatLE;
    readFloatLE: typeof BinaryBufferLE.prototype.readFloatBE;
    writeFloatLE: typeof BinaryBufferLE.prototype.writeFloatBE;

    readDoubleBE: typeof BinaryBufferLE.prototype.readDoubleLE;
    writeDoubleBE: typeof BinaryBufferLE.prototype.writeDoubleLE;
    readDoubleLE: typeof BinaryBufferLE.prototype.readDoubleBE;
    writeDoubleLE: typeof BinaryBufferLE.prototype.writeDoubleBE;
}


BinaryBufferBE.prototype.write = BinaryBufferLE.prototype.write;
BinaryBufferBE.prototype.toString = BinaryBufferLE.prototype.toString;

BinaryBufferBE.prototype.readUInt8 = BinaryBufferLE.prototype.readUInt8;
BinaryBufferBE.prototype.writeUInt8 = BinaryBufferLE.prototype.writeUInt8;
BinaryBufferBE.prototype.readInt8 = BinaryBufferLE.prototype.readInt8;
BinaryBufferBE.prototype.writeInt8 = BinaryBufferLE.prototype.writeInt8;

BinaryBufferBE.prototype.readUInt16BE = BinaryBufferLE.prototype.readUInt16LE;
BinaryBufferBE.prototype.writeUInt16BE = BinaryBufferLE.prototype.writeUInt16LE;
BinaryBufferBE.prototype.readUInt16LE = BinaryBufferLE.prototype.readUInt16BE;
BinaryBufferBE.prototype.writeUInt16LE = BinaryBufferLE.prototype.writeUInt16BE;
BinaryBufferBE.prototype.readInt16BE = BinaryBufferLE.prototype.readInt16LE;
BinaryBufferBE.prototype.writeInt16BE = BinaryBufferLE.prototype.writeInt16LE;
BinaryBufferBE.prototype.readInt16LE = BinaryBufferLE.prototype.readInt16BE;
BinaryBufferBE.prototype.writeInt16LE = BinaryBufferLE.prototype.writeInt16BE;

BinaryBufferBE.prototype.readUInt32BE = BinaryBufferLE.prototype.readUInt32LE;
BinaryBufferBE.prototype.writeUInt32BE = BinaryBufferLE.prototype.writeUInt32LE;
BinaryBufferBE.prototype.readUInt32LE = BinaryBufferLE.prototype.readUInt32BE;
BinaryBufferBE.prototype.writeUInt32LE = BinaryBufferLE.prototype.writeUInt32BE;
BinaryBufferBE.prototype.readInt32BE = BinaryBufferLE.prototype.readInt32LE;
BinaryBufferBE.prototype.writeInt32BE = BinaryBufferLE.prototype.writeInt32LE;
BinaryBufferBE.prototype.readInt32LE = BinaryBufferLE.prototype.readInt32BE;
BinaryBufferBE.prototype.writeInt32LE = BinaryBufferLE.prototype.writeInt32BE;

BinaryBufferBE.prototype.readBigUInt64BE = BinaryBufferLE.prototype.readBigUInt64LE;
BinaryBufferBE.prototype.writeBigUInt64BE = BinaryBufferLE.prototype.writeBigUInt64LE;
BinaryBufferBE.prototype.readBigUInt64LE = BinaryBufferLE.prototype.readBigUInt64BE;
BinaryBufferBE.prototype.writeBigUInt64LE = BinaryBufferLE.prototype.writeBigUInt64BE;
BinaryBufferBE.prototype.readBigInt64BE = BinaryBufferLE.prototype.readBigInt64LE;
BinaryBufferBE.prototype.writeBigInt64BE = BinaryBufferLE.prototype.writeBigInt64LE;
BinaryBufferBE.prototype.readBigInt64LE = BinaryBufferLE.prototype.readBigInt64BE;
BinaryBufferBE.prototype.writeBigInt64LE = BinaryBufferLE.prototype.writeBigInt64BE;

BinaryBufferBE.prototype.readFloatBE = BinaryBufferLE.prototype.readFloatLE;
BinaryBufferBE.prototype.writeFloatBE = BinaryBufferLE.prototype.writeFloatLE;
BinaryBufferBE.prototype.readFloatLE = BinaryBufferLE.prototype.readFloatBE;
BinaryBufferBE.prototype.writeFloatLE = BinaryBufferLE.prototype.writeFloatBE;

BinaryBufferBE.prototype.readDoubleBE = BinaryBufferLE.prototype.readDoubleLE;
BinaryBufferBE.prototype.writeDoubleBE = BinaryBufferLE.prototype.writeDoubleLE;
BinaryBufferBE.prototype.readDoubleLE = BinaryBufferLE.prototype.readDoubleBE;
BinaryBufferBE.prototype.writeDoubleLE = BinaryBufferLE.prototype.writeDoubleBE;



let _BBC: BinaryBufferConstructor;
let _CBBC: BinaryBufferConstructor;

if (typeof Buffer !== 'undefined') {
    _BBC = Buffer;
}

if (ui16a[0] === 0x11 + (0x22 << 8)) {
    _CBBC = BinaryBufferLE;
} else {
    _CBBC = BinaryBufferBE;
}

if (!_BBC) {
    _BBC = _CBBC;
}

export interface CustomBinaryBuffer extends BinaryBuffer {}

export const BinaryBuffer = _BBC;
export const CustomBinaryBuffer = _CBBC;

// console.log(BinaryBuffer.name, CustomBinaryBuffer.name);
