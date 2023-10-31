export interface IEncoder {
    readonly byteLength: (str: string) => number;
    readonly encodeInto: (buf: Uint8Array, str: string, offset?: number/* , byteLength?: number */) => number;
    readonly decode: (buf: Uint8Array, start?: number, end?: number) => string;
}
