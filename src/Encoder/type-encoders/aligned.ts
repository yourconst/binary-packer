import { TypeEncoder } from '../TypeEncoder.interface';
import * as Types from '../../types/types';
import { BufferPointer } from '../BufferPointer';
import { parseLengthSchema, parseSchema } from '.';

const getAlignOffset = (size: number, align: number) => {
    return (align - (size % align)) % align;
};

export class _te_aligned implements TypeEncoder {
    readonly isSizeFixed: boolean;
    readonly _align: Types.__Align;
    readonly _child: TypeEncoder;
    private _offset?: number;

    readonly getSize: (value: any) => number;

    constructor(readonly schema: Types.Aligned) {
        this._align = schema.align || 1;

        if (!Types.__Align.has(this._align)) {
            throw new Error('Bad align value', { cause: schema });
        }

        this._child = parseSchema(schema.child);

        this.isSizeFixed = this._child.isSizeFixed;

        if (this.isSizeFixed) {
            const _childFixedSize = this._child.getSize(null);
            this._offset = getAlignOffset(_childFixedSize, this._align);

            const _l = _childFixedSize + this._offset;

            this.getSize = () => _l;
        } else {
            this.getSize = (value: any) => {
                const _childSize = this._child.getSize(value);
                return _childSize + getAlignOffset(_childSize, this._align);
            }
        }
    }

    checkGetSize(value: any, path: string) {
        const _childSize = this._child.checkGetSize(value, path);
        return _childSize + getAlignOffset(_childSize, this._align);
    }

    encode(bp: BufferPointer, value: any) {
        if (this.isSizeFixed) {
            this._child.encode(bp, value);
            bp.fill(0, this._offset);
        } else {
            const _ptr = bp.get();
            this._child.encode(bp, value);
            bp.fill(0, getAlignOffset(bp.get() - _ptr, this._align));
        }
    }

    decode(bp: BufferPointer) {
        const _ptr = bp.get();
        const value = this._child.decode(bp);
        bp.getAdd(getAlignOffset(bp.get() - _ptr, this._align));

        return value;
    }

    getSchema(): Types.Schema {
        return {
            type: 'aligned',
            align: this._align,
            child: this._child.getSchema(),
        };
    }
}
