import { Encoder, Type } from "../../src";
import { Helpers, Test } from "../utils2";
import { Type as PBType, Field, Enum } from 'protobufjs';
import * as BE from 'binary-encoder';

const bpString = new Encoder(Type.Struct({
    str: Type.String('utf8'),
}));

const pTypetring = Helpers.Encoder.getProtobuf(
    new PBType('String')
        .add(new Field('str', 1, 'string')),
);

const beString = Helpers.Encoder.getOtherBinaryEncoder(BE.Structure({
    str: BE.String(),
}));

for (const size of [
    0,
    1,2,3,4,5,6,7,8,9,
    10,15,16,17,18,19,
    20,21,29,
    30,31,32,33,34,38,39,
    40,41,48,49,
    50,51,52,53,54,55,56,57,58,59,
    60,61,62,63,64,65,
    126,127,128,129,
    200,300,400,500,600,700,800,900,
    // 1000,2000,4000,8000,
    // 16000,
]) {
    Test.test(
        {
            label: `String ${size}`,
            count: 5e3,
            repeatCount: 100,
            binaryEncoder: bpString,
            otherEncoders: [pTypetring/* , ...(size < 4000) ? [beString] : [] */],
            json: false,
            jsonBinaryEncoding: <any> null, // 'utf8',
            showBufferSize: false,
            showEncodeTime: true,
            showDecodeTime: true,
        },
        Helpers.generateArray(100, () => ({ str: Helpers.Random.stringUTF8(size) })),
    );
}
