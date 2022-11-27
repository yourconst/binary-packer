import { TypePacker } from '../TypePacker.interface';
import * as Types from '../../schemas/types';
import { BinaryBuffer } from '../BinaryBuffer';

export class _tp_const<T = any> implements TypePacker<T> {
    readonly isSizeFixed = true;
    readonly isConst = true;
    readonly constValue?: T;

    constructor(readonly schema: Types.Const<T>) {
        this.constValue = schema.value;
    }

    getSize(value: T) {
        if (value !== this.constValue) {
            throw new Error('Value not equals to const value', {
                cause: {
                    constValue: this.constValue,
                    value,
                },
            });
        }

        return 0;
    }

    encode(bp: any, value: T) {
        if (value !== this.constValue) {
            throw new Error('Value not equals to const value', {
                cause: {
                    constValue: this.constValue,
                    value,
                },
            });
        }
    }

    decode() {
        return this.constValue;
    }

    getSchema(): Types.Schema {
        return {
            type: 'const',
            value: this.constValue,
        };
    }
}
