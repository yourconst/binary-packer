import * as Types from './types';
declare type TypeReaderWriter<T = number> = {
    size?: number;
    read: () => T;
    write: (val: T) => void;
};
declare type SimpleReadWriter = {
    [key in Types.SIMPLE_TYPE]: TypeReaderWriter<number | boolean | string | ArrayBuffer>;
};
declare type SimpleTypesSize = {
    [key in Types.SIMPLE_WO_STRING_TYPE]: number;
} & {
    'string': {
        (str: string): number;
    };
    'arraybuffer': {
        (str: ArrayBuffer): number;
    };
};
export declare class ReadWriteBuffer implements SimpleReadWriter {
    _b: Types.BufferType;
    offset: number;
    constructor(bufferOrSize: ReadWriteBuffer | Types.BufferType | ArrayBuffer | number, offset?: number);
    static sizes: SimpleTypesSize;
    static LENGTH_TYPE: Types.UINTS_TYPE;
    static LENGTH_BYTE_SIZE: number;
    'bool': TypeReaderWriter<boolean>;
    'int8': TypeReaderWriter<number>;
    'int16': TypeReaderWriter<number>;
    'int32': TypeReaderWriter<number>;
    'int64': TypeReaderWriter<number>;
    'uint8': TypeReaderWriter<number>;
    'uint16': TypeReaderWriter<number>;
    'uint32': TypeReaderWriter<number>;
    'float32': TypeReaderWriter<number>;
    'float64': TypeReaderWriter<number>;
    powerUints: TypeReaderWriter<number>[];
    'string': {
        read: () => string;
        write: (str: string) => void;
    };
    'arraybuffer': {
        read: () => ArrayBuffer;
        write: (arr: ArrayBuffer) => void;
    };
    arraybufferWoSize: {
        read: (size: number) => ArrayBuffer;
        write: (arr: ArrayBuffer, size?: number) => void;
    };
}
export {};
