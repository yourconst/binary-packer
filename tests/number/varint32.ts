import { Encoder, Type } from "../../src";
import { Helpers, Test } from "../utils2";
import { Type as PBType, Field, Enum } from 'protobufjs';
import * as BE from 'binary-encoder';

for (let i = 0; i <= 11; ++i) {
    const count = 2 ** i;
    Test.test(
        {
            label: `VarInt32 x ${count}`,
            count: 5e3,
            repeatCount: 100,
            binaryEncoder: new Encoder(Type.Struct({
                array: Type.Array(Type.VarInt32()),
            })),
            otherEncoders: [
                Helpers.Encoder.getProtobuf(
                    new PBType('Message')
                        .add(new Field('array', 1, 'int32', 'repeated')),
                ),
                // ...(count * 4 < 4096) ? [Helpers.Encoder.getOtherBinaryEncoder(BE.Structure({
                //     array: BE.Array(BE.UInt32()),
                // }))] : [],
            ],
            json: false,
            jsonBinaryEncoding: 'ascii',
            showBufferSize: true,
        },
        Helpers.generateArray(100, () => ({
            array: Helpers.generateArray(count, () => Helpers.Random.int32()),
        })),
    );
}
