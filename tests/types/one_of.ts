import { BinaryEncoder, Type } from '../../src';


const encoder = new BinaryEncoder(Type.OneOf({
    test1: Type.String(),
    test2: Type.ULEB128(),
    test3: Type.Struct({
        test1: Type.String(),
        test2: Type.ULEB128(),
    }),
}));

let buffer = encoder.encode({
    test1: '123',
});
console.log(buffer);
console.log(encoder.decode(buffer));

buffer = encoder.encode({
    test2: 123,
});
console.log(buffer);
console.log(encoder.decode(buffer));

buffer = encoder.encode({
    test3: {
        test1: '123',
        test2: 123,
    },
});
console.log(buffer);
console.log(encoder.decode(buffer));

buffer = encoder.encode({
    test1: '123',
    test2: 123,
    test3: {
        test1: '123',
        test2: 123,
    },
});
console.log(buffer);
console.log(encoder.decode(buffer));

try {
    buffer = encoder.checkEncode({
        test1: '123',
        test2: 123,
        test3: {
            test1: '123',
            test2: 123,
        },
    });
} catch (error) {
    console.log(error);
}
