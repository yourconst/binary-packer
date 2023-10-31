import { Encoder, Type } from "../../src";
import { Helpers, Test } from "../utils2";

// import * as BufferImport from 'buffer';
// import { StringDecoder } from 'string_decoder';

// console.log(BufferImport, StringDecoder);

const bpString = new Encoder(Type.Struct({
    str: Type.String('ucs2'),
}));

for (let i = 0; i <= 11; ++i) {
    Test.test(
        {
            label: `String ${2 ** i}`,
            count: 5e3,
            repeatCount: 100,
            binaryEncoder: bpString,
            json: false,
            jsonBinaryEncoding: 'ucs2',
            showBufferSize: true,
        },
        Helpers.generateArray(100, () => ({ str: Helpers.Random.stringUTF8(2 ** i) })),
    );
}
