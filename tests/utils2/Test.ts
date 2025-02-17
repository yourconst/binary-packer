import { BinaryEncoder, CustomBinaryBuffer, Type } from "../../src";
import { argd } from "../../src/Encoder/argd";
import { Schema } from "../../src/types";
import { _StringEncoding } from "../../src/types/types";
import { Helpers } from "./Helpers";
import { Measuring } from "./Measuring";
import { Print } from "./Print";

import zlib from 'zlib';

export namespace Test {
    export function test<T extends Type.Schema>({
        label,
        repeatCount = argd.testRepeatCount || 100,
        count = argd.testCount || 1000,
        warmupRepeatCount = 10,
        warmupCount = 1000,
        showBufferSize = true,
        showEncodeTime = true,
        showDecodeTime = true,
        binaryEncoder,
        otherEncoders = [],
        json = false,
        jsonBinaryEncoding = 'ucs2',
    }: {
        label: string;
        repeatCount?: number;
        count?: number;
        warmupRepeatCount?: number;
        warmupCount?: number;
        showBufferSize?: boolean;
        showEncodeTime?: boolean;
        showDecodeTime?: boolean;
        binaryEncoder: BinaryEncoder<T>;
        otherEncoders?: Helpers.Encoder.IEncoder<Type.SchemaResultType<T>>[];
        json?: boolean;
        jsonBinaryEncoding?: _StringEncoding;
    }, values: Type.SchemaResultType<T>[]) {
        // const customBinaryEncoder = new BinaryEncoder(binaryEncoder.getSchema(), CustomBinaryBuffer);

        const name = argd.CustomBinaryBuffer ? 'Custom' : 'Standard';

        const encoders: Helpers.Encoder.IEncoder<Type.SchemaResultType<T>, Uint8Array | Buffer | string>[] = [
            { label: Print.applyColor('green', `EB ${name} +check`), encode: binaryEncoder.checkEncode, decode: <any> null },
            // { label: Print.applyColor('green', 'EB Custom +check'), encode: customBinaryEncoder.checkEncode, decode: <any> null },
            { label: Print.applyColor('green', `EB ${name}`), encode: binaryEncoder.encode, decode: binaryEncoder._decode },
            // { label: Print.applyColor('green', 'EB Custom'), encode: customBinaryEncoder.encode, decode: customBinaryEncoder._decode },
            ...otherEncoders,
            ...json ? [
                <any> Helpers.Encoder.getJSON(),
            ] : [],
            ...jsonBinaryEncoding ? [
                <any> Helpers.Encoder.getJSONBinary(jsonBinaryEncoding),
            ] : [],
        ];

        if (showBufferSize) {
            Print.table(
                encoders.map(e => {
                    const m = new Measuring.Measurement(e.label);
                    const mz = new Measuring.Measurement(e.label);

                    for (const v of values) {
                        const b = e.encode(v);
                        m.update(b.length);
                        mz.update(zlib.gzipSync(Buffer.from(b['buffer']), { level: 9 }).length);
                    }

                    return {
                        ...m.toJSON(),
                        'gzip:': '',
                        zavg: mz.avg,
                        zmin: mz.min,
                        zmax: mz.max,
                    };
                }),
                {
                    header: { name: 'Buffer size: ' + label, color: 'lightblue' },
                    columns: ['label', 'avg', 'min', 'max', 'gzip:', 'zavg', 'zmin', 'zmax'],
                    order: [{field: 'avg'}, {field: 'max'}, {field: 'min'}],
                },
            );
        }

        if (showEncodeTime) {
            const valuesAsArgs: [Type.SchemaResultType<T>][] = values.map(v => ([v]));
            new Measuring.Measurer('Encode time: ' + label, encoders.map(e => new Measuring.MeasureShell(
                e.label,
                e.encode,
                Helpers.createCycleArrayRunner(valuesAsArgs),
            )))
                .warmup(warmupRepeatCount, warmupCount)
                .measureBulk(repeatCount, count)
                .printResultOrdered()
                /* .reset()
                .measureBulk(repeatCount, count)
                .printResultOrdered() */;
            }

        if (showDecodeTime) {
            new Measuring.Measurer('Decode time: ' + label, encoders.filter(e => e.decode).map(e => new Measuring.MeasureShell(
                e.label,
                e.decode,
                Helpers.createCycleArrayRunner(values.map(v => (<[Uint8Array]>[e.encode(v)]))),
            )))
                .warmup(warmupRepeatCount, warmupCount)
                .measureBulk(repeatCount, count)
                .printResultOrdered();
            }
    }
}
