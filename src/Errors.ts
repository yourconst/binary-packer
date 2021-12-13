import { StructTyperHelper, TypePacker } from "./Schemas";

export class BinaryPackErrorBase<T extends StructTyperHelper> extends Error {
    packer: TypePacker<T>;

    constructor(message: string, packer: TypePacker<T>) {
        super(message);

        this.packer = packer;
    }
}

export class UnexpectedNull<T extends StructTyperHelper> extends BinaryPackErrorBase<T> {
    constructor(packer: TypePacker<T>) {
        super('Unexpected "null" link', packer);
    }
}

export class BadLengthType<T extends StructTyperHelper> extends BinaryPackErrorBase<T> {
    constructor(packer: TypePacker<T>) {
        super('Bad length type value', packer);
    }
}

export class BadExactLength<T extends StructTyperHelper> extends BinaryPackErrorBase<T> {
    constructor(packer: TypePacker<T>) {
        super('Bad exact length value', packer);
    }
}
