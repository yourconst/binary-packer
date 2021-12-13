export interface GenericTypedArray<T> extends ArrayLike<number | BigInt> {
    BYTES_PER_ELEMENT: number;
    set(array: ArrayLike<number>, byteOffset?: number): void;
    slice(start?: number, end?: number): T;
    constructor: GenericTypedArrayConstructor<T>;
}

export interface GenericTypedArrayConstructor<T = any> {
    BYTES_PER_ELEMENT: number;
    new (length?: number): T;
    new (buffer?: ArrayBuffer, byteOffset?: number, length?: number): T;
}


export type ClassType = new (...args: any[]) => any;
export type GetClassExamplerType<T> = T extends new (...args: any[]) => infer R ? R : null;
