import { StructTyperHelper, TypePacker } from "./Schemas";
export declare class BinaryPackErrorBase<T extends StructTyperHelper> extends Error {
    packer: TypePacker<T>;
    constructor(message: string, packer: TypePacker<T>);
}
export declare class UnexpectedNull<T extends StructTyperHelper> extends BinaryPackErrorBase<T> {
    constructor(packer: TypePacker<T>);
}
export declare class BadLengthType<T extends StructTyperHelper> extends BinaryPackErrorBase<T> {
    constructor(packer: TypePacker<T>);
}
export declare class BadExactLength<T extends StructTyperHelper> extends BinaryPackErrorBase<T> {
    constructor(packer: TypePacker<T>);
}
