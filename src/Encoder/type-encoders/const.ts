import { TypeEncoder } from '../TypeEncoder.interface';
import * as Types from '../../types/types';

export class _te_const<T = any> implements TypeEncoder<T> {
    readonly isSizeFixed = true;
    readonly isConst = true;
    readonly constValue?: T;

    constructor(readonly schema: Types.Const<T>) {
        this.constValue = schema.value;
    }

    getSize(value: T) {
        if (value !== this.constValue) {
            throw new Error(`Value not equals to const value (value: ${value}, constValue: ${this.constValue})`, {
                cause: {
                    constValue: this.constValue,
                    value,
                },
            });
        }

        return 0;
    }

    checkGetSize(value: T, path: string) {
        if (value !== this.constValue) {
            throw new Error(`Value not equals to const value (${path}, value: ${value}, constValue: ${this.constValue})`, {
                cause: {
                    constValue: this.constValue,
                    value,
                },
            });
        }

        return 0;
    }

    encode(bp: any, value: T) {}

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
