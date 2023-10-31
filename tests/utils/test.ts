import { BinaryBuffer, BinaryEncoder, CustomBinaryBuffer } from '../../src';
import { Schema, SchemaResultType } from '../../src/types';
import { Measuring } from './Measuring';

export type OtherEncoder<T = any> = {
    name: string;
    encode(value: T): Uint8Array;
    decode(buffer: Uint8Array): T;
    lastEncoded?: Uint8Array;
    lastDecoded?: T;
};

export function test<T extends Schema>(
    {
        label,
        count,
        groupCount,
        binaryEncoder,
        otherEncoders = [],
    }: {
        label: string;
        count: number;
        groupCount: number;
        binaryEncoder: BinaryEncoder<T, typeof BinaryBuffer>;
        otherEncoders?: OtherEncoder<SchemaResultType<T>>[];
    },
    values: SchemaResultType<T>[],
) {
    const customBinaryEncoder = new BinaryEncoder(binaryEncoder.getSchema(), CustomBinaryBuffer);

    const encoders: OtherEncoder<SchemaResultType<T>>[] = [
        { name: 'Standard +check', encode: binaryEncoder.checkEncode, decode: <any> null },
        { name: 'Custom +check', encode: customBinaryEncoder.checkEncode, decode: <any> null },
        { name: 'Standard', encode: binaryEncoder.encode, decode: binaryEncoder.decode },
        { name: 'Custom', encode: customBinaryEncoder.encode, decode: customBinaryEncoder.decode },
        ...otherEncoders,
    ];

    const { length } = values;
    const createIndexRunner = () => {
        let i = 0;
        return () => (i++) % length;
    };


    Measuring.compareVoidSync(`${label}: Encode`, groupCount, [
        ...encoders.map(oe => {
            const getIndex = createIndexRunner();
            return Measuring.buildShell(oe.name, count, () => { oe.lastEncoded = oe.encode(values[getIndex()]); });
        }),
    ]);

    for (const encoder of encoders) {
        console.log(encoder.name, encoder.lastEncoded);
    }

    Measuring.compareVoidSync(`${label} Decode`, groupCount, [
        ...encoders.slice(2).map(oe => {
            const getIndex = createIndexRunner();
            const encoded = values.map((v: any) => oe.encode(v));
            return Measuring.buildShell(oe.name, count, () => { oe.lastDecoded = oe.decode(encoded[getIndex()]); });
        }),
    ]);

    for (const encoder of encoders.slice(2)) {
        console.log(encoder.name, encoder.lastDecoded);
    }
}
