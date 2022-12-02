import { BinaryBuffer, BinaryBufferLike } from './BinaryBuffer';

export class BufferPointer {
    constructor(readonly buffer: BinaryBuffer, private _ptr = 0) {}

    get() {
        return this._ptr;
    }
    
    add(offset: number) {
        this._ptr += offset;
        return this._ptr;
    }

    getAdd(offset: number) {
        const current = this._ptr;
        this._ptr += offset;
        return current;
    }

    fill(byte: number, size: number) {
        this.buffer.fill(byte, this._ptr, this._ptr + size);
        this._ptr += size;
        return this;
    }

    writeByte(byte: number) {
        this.buffer[this._ptr++] = byte;
        return this;
    }

    readByte() {
        return this.buffer[this._ptr++];
    }
}
