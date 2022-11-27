import { TypePacker } from '../TypePacker.interface';
import * as Types from '../../schemas/types';
import { BufferPointer } from '../BufferPointer';
import { BinaryBuffer } from '../BinaryBuffer';

export class _tp_bool implements TypePacker<boolean> {
    readonly isSizeFixed = true;

    constructor(readonly schema: Types.Bool) {}

    getSize() {
        return 1;
    }

    encode(bp: BufferPointer, value: boolean) {
        bp.writeByte(<any>!!value);
    }

    decode(bp: BufferPointer) {
        return !!bp.readByte();
    }

    getSchema(): Types.Schema {
        return 'bool';
    }
}
