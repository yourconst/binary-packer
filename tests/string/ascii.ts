import { Encoder, Type } from "../../src";
import { Helpers, Test } from "../utils2";

const bpString = new Encoder(Type.Struct({
    str: Type.String('ascii'),
}));

for (let i = 0; i <= 11; ++i) {
    Test.test(
        {
            label: `String ${2 ** i}`,
            count: 5e3,
            repeatCount: 100,
            binaryEncoder: bpString,
            json: false,
            jsonBinaryEncoding: 'ascii',
            showBufferSize: true,
        },
        Helpers.generateArray(100, () => ({ str: Helpers.Random.stringASCII(2 ** i) })),
    );
}
