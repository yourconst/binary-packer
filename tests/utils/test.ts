import { Type } from 'protobufjs';
import { BinaryBuffer, BinaryPacker, CustomBinaryBuffer } from '../../src';
import { Schema, SchemaResultType } from '../../src/schemas';
import { Measuring } from './Measuring';

export function test<T extends Schema>(
    {
        label,
        count,
        groupCount,
        binaryPacker,
        protobufType,
    }: {
        label: string;
        count: number;
        groupCount: number;
        binaryPacker: BinaryPacker<T, typeof BinaryBuffer>;
        protobufType: Type;
    },
    values: SchemaResultType<T>[],
) {
    const customBinaryPacker = new BinaryPacker(binaryPacker.getSchema(), CustomBinaryBuffer);

    // @ts-ignore
    const encodedPB = values.map(v => protobufType.encode(v).finish());
    const encodedBP = values.map(v => binaryPacker.encode(v));

    const { length } = values;
    const createIndexRunner = () => {
        let i = 0;
        return () => (i++) % length;
    };
    const getIndexPB = createIndexRunner();
    const getIndexBPS = createIndexRunner();
    const getIndexBPC = createIndexRunner();

    let lastEncodedPB: Uint8Array = <any> null;
    let lastEncodedBPS: Uint8Array = <any> null;
    let lastEncodedBPC: Uint8Array = <any> null;
    let lastDecodedPB: SchemaResultType<T> = <any> null;
    let lastDecodedBPS: SchemaResultType<T> = <any> null;
    let lastDecodedBPC: SchemaResultType<T> = <any> null;


    Measuring.compareVoidSync(`${label}: Encode`, groupCount, [
        Measuring.buildShell('Protobuf', count, () => { lastEncodedPB = protobufType.encode(values[getIndexPB()]).finish(); }),
        Measuring.buildShell('Standard', count, () => { lastEncodedBPS = binaryPacker.encode(values[getIndexBPS()]); }),
        Measuring.buildShell('Custom', count, () => { lastEncodedBPC = customBinaryPacker.encode(values[getIndexBPC()]); }),
    ]);

    console.log(lastEncodedPB);
    console.log(lastEncodedBPS);
    console.log(lastEncodedBPC);

    Measuring.compareVoidSync(`${label} Decode`, groupCount, [
        Measuring.buildShell('Protobuf', count, () => { lastDecodedPB = <any> protobufType.decode(encodedPB[getIndexPB()]); }),
        Measuring.buildShell('Standard', count, () => { lastDecodedBPS = binaryPacker.decode(encodedBP[getIndexBPS()]); }),
        Measuring.buildShell('Custom', count, () => { lastDecodedBPC = customBinaryPacker.decode(encodedBP[getIndexBPC()]); }),
    ]);

    console.log(lastDecodedPB);
    console.log(lastDecodedBPS);
    console.log(lastDecodedBPC);
}
