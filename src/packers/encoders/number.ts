import { SchemaNumber } from '../../schemas/types';
import { BinaryBuffer } from '../BinaryBuffer';
import { TypePacker } from '../TypePacker.interface';

const map: {
    [key in SchemaNumber]: { write: keyof Buffer; read: keyof BinaryBuffer; size: number; };
} = {
    'uint8': { write: 'writeUInt8', read: 'readUInt8', size: 1 },
    'int8': { write: 'writeInt8', read: 'readInt8', size: 1 },
    'uint16_le': { write: 'writeUInt16LE', read: 'readUInt16LE', size: 2 },
    'uint16_be': { write: 'writeUInt16BE', read: 'readUInt16BE', size: 2 },
    'int16_le': { write: 'writeInt16LE', read: 'readInt16LE', size: 2 },
    'int16_be': { write: 'writeInt16BE', read: 'readInt16BE', size: 2 },
    'uint32_le': { write: 'writeUInt32LE', read: 'readUInt32LE', size: 4 },
    'uint32_be': { write: 'writeUInt32BE', read: 'readUInt32BE', size: 4 },
    'int32_le': { write: 'writeInt32LE', read: 'readInt32LE', size: 4 },
    'int32_be': { write: 'writeInt32BE', read: 'readInt32BE', size: 4 },
    'uint64_le': { write: 'writeBigUInt64LE', read: 'readBigUInt64LE', size: 8 },
    'uint64_be': { write: 'writeBigUInt64BE', read: 'readBigUInt64BE', size: 8 },
    'int64_le': { write: 'writeBigInt64LE', read: 'readBigInt64LE', size: 8 },
    'int64_be': { write: 'writeBigInt64BE', read: 'readBigInt64BE', size: 8 },
    'float32_le': { write: 'writeFloatLE', read: 'readFloatLE', size: 4 },
    'float32_be': { write: 'writeFloatBE', read: 'readFloatBE', size: 4 },
    'float64_le': { write: 'writeDoubleLE', read: 'readDoubleLE', size: 8 },
    'float64_be': { write: 'writeDoubleBE', read: 'readDoubleBE', size: 8 },
};

export class _tp_number implements TypePacker<number> {
    readonly isSizeFixed = true;
    readonly getSize: TypePacker<number>['getSize'];
    readonly encode: TypePacker<number>['encode'];
    readonly decode: TypePacker<number>['decode'];

    constructor(readonly schema: SchemaNumber) {
        const info = map[schema];

        if (!info) {
            throw new Error('Bad number type', { cause: schema });
        }

        const { write, read, size } = info;

        this.getSize = () => size;
        this.encode = (bp, value: number) => bp.buffer[<'writeUInt8'> write](value, bp.getAdd(size));
        this.decode = (bp) => bp.buffer[<'readUInt8'> read](bp.getAdd(size));

        // TODO: test with Function constructor
    }

    getSchema() {
        return this.schema;
    }
}
