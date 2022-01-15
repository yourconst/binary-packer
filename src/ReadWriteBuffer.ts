import * as Types from './types';

type TypeReaderWriter<T = number> = {
    size?: number;
    read: () => T;
    write: (val: T) => void;
}

type SimpleReadWriter = {
    [key in Types.SIMPLE_TYPE]: TypeReaderWriter<number | boolean | string | ArrayBuffer>;
};

type SimpleTypesSize = {
    [key in Types.SIMPLE_WO_STRING_TYPE]: number;
} & {
    'string': {(str: string): number};
    'arraybuffer': {(str: ArrayBuffer): number};
};

const createSimpleTypeReadWriter = <T = number>(
    rwb: ReadWriteBuffer, size: number,
    readMethodName: keyof Types.BufferType, writeMethodName: keyof Types.BufferType,
    transformerFrom = (val: number): T => <any> val, transformerTo = (val: T): number => <any> val,
): TypeReaderWriter<T> => {
    return {
        size,
        read: () => {
            const val = (<any>rwb._b)[readMethodName](rwb.offset);
            rwb.offset += size;
            return transformerFrom(val);
        },
        write: (val: any) => {
            (<any>rwb._b)[writeMethodName](transformerTo(val), rwb.offset);
            rwb.offset += size;
        },
    };
};

export class ReadWriteBuffer implements SimpleReadWriter {
    _b: Types.BufferType;
    offset: number = 0;

    constructor(bufferOrSize: ReadWriteBuffer | Types.BufferType | ArrayBuffer | number, offset = 0) {
        if (bufferOrSize instanceof ArrayBuffer) {
            this._b = Types.BufferType.from(bufferOrSize);
        } else if (bufferOrSize instanceof Types.BufferType) {
            this._b = bufferOrSize;
        } else if (bufferOrSize instanceof ReadWriteBuffer) {
            this._b = bufferOrSize._b;
        } else if (typeof bufferOrSize === 'number') {
            this._b = Types.BufferType.alloc(bufferOrSize);
        } else {
            throw new Error('Argument "bufferOrSize" must be buffer or number');
        }

        this.offset = offset;
    }

    static sizes: SimpleTypesSize = {
        'string': (str) => {
            // if ((<any> str).byteLength) {
            //     return (<any> str).byteLength;
            // }
            // returns the byte length of an utf8 string
            let s = str.length;
            for (let i=str.length-1; i>=0; i--) {
              const code = str.charCodeAt(i);
              if (code > 0x7f && code <= 0x7ff) s++;
              else if (code > 0x7ff && code <= 0xffff) s+=2;
              if (code >= 0xDC00 && code <= 0xDFFF) i--; //trail surrogate
            }
            // (<any> str).byteLength = s;
            return ReadWriteBuffer.LENGTH_BYTE_SIZE + s;
        },
        'arraybuffer': (arr) => ReadWriteBuffer.LENGTH_BYTE_SIZE + arr.byteLength,
        'bool': 1,
        'int8': 1,
        'int16': 2,
        'int32': 4,
        'int64': 8,
        'uint8': 1,
        'uint16': 2,
        'uint32': 4,
        'float32': 4,
        'float64': 8,
    };
    
    static LENGTH_TYPE: Types.UINTS_TYPE = 'uint32';
    static LENGTH_BYTE_SIZE = ReadWriteBuffer.sizes[ReadWriteBuffer.LENGTH_TYPE];

    'bool' = createSimpleTypeReadWriter(this, ReadWriteBuffer.sizes['bool'], 'readUInt8', 'writeUInt8', (raw) => !!raw, (src) => Number(!!src));

    'int8' = createSimpleTypeReadWriter(this, ReadWriteBuffer.sizes['int8'], 'readInt8', 'writeInt8');
    'int16' = createSimpleTypeReadWriter(this, ReadWriteBuffer.sizes['int16'], 'readInt16LE', 'writeInt16LE');
    'int32' = createSimpleTypeReadWriter(this, ReadWriteBuffer.sizes['int32'], 'readInt32LE', 'writeInt32LE');
    'int64' = createSimpleTypeReadWriter(this, ReadWriteBuffer.sizes['int64'], 'readBigInt64LE', 'writeBigInt64LE');
    'uint8' = createSimpleTypeReadWriter(this, ReadWriteBuffer.sizes['uint8'], 'readUInt8', 'writeUInt8');
    'uint16' = createSimpleTypeReadWriter(this, ReadWriteBuffer.sizes['uint16'], 'readUInt16LE', 'writeUInt16LE');
    'uint32' = createSimpleTypeReadWriter(this, ReadWriteBuffer.sizes['uint32'], 'readUInt32LE', 'writeUInt32LE');
    'float32' = createSimpleTypeReadWriter(this, ReadWriteBuffer.sizes['float32'], 'readFloatLE', 'writeFloatLE');
    'float64' = createSimpleTypeReadWriter(this, ReadWriteBuffer.sizes['float64'], 'readDoubleLE', 'writeDoubleLE');

    powerUints = [this.uint8, this.uint16, this.uint32];

    'string' = {
        read: (lengthType = ReadWriteBuffer.LENGTH_TYPE) => {
            const size = this[lengthType].read();
            
            this.offset += size;

            return this._b.toString('utf8', this.offset - size, this.offset);
        },
        write: (str: string, lengthType = ReadWriteBuffer.LENGTH_TYPE) => {
            const size = ReadWriteBuffer.sizes.string(str) - ReadWriteBuffer.sizes[lengthType];
            this[lengthType].write(size);

            this._b.write(str, this.offset, size, 'utf8');
            
            this.offset += size;
        },
    };

    'arraybuffer' = {
        read: (lengthType = ReadWriteBuffer.LENGTH_TYPE, multiplier = 1) => {
            const size = multiplier * this[lengthType].read();
            
            this.offset += size;

            return this._b.buffer.slice(this.offset - size, this.offset);
        },
        write: (arr: ArrayBuffer, lengthType = ReadWriteBuffer.LENGTH_TYPE, multiplier = 1) => {
            const size = ReadWriteBuffer.sizes.arraybuffer(arr) - ReadWriteBuffer.sizes[lengthType];
            this[lengthType].write(size / multiplier);

            this._b.fill(new Uint8Array(arr), this.offset, this.offset + size);
            
            this.offset += size;
        },
    };

    arraybufferWoSize = {
        read: (size: number) => {
            this.offset += size;

            return this._b.buffer.slice(this.offset - size, this.offset);
        },
        write: (arr: ArrayBuffer, size = arr.byteLength) => {
            this._b.fill(new Uint8Array(arr), this.offset, this.offset + size);
            
            this.offset += size;
        },
    };
};
