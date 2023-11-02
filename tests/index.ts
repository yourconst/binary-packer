import { Encoder, Type } from '../src';
import { Type as PBType, Field, Enum } from 'protobufjs';
import * as BE from 'binary-encoder';
import { Helpers, Test } from './utils2';

enum TypeEnum {
    'a' = 1,
    'b' = 2,
    'c' = 3,
}

const pbTypeEnum = Object.fromEntries(Object.values(TypeEnum).map((v, i) => ([v, i])));

const randEnum = () => [TypeEnum.a, TypeEnum.b, TypeEnum.c][Helpers.Random.uint(3)];


// test(
//     {
//         label: 'Struct BE with string (utf8)',
//         count: 5e3,
//         repeatCount: 500,
//         // @ts-ignore
//         binaryEncoder: new Encoder(Type.Array(Type.Struct({
//             id: Type.UInt32(),
//             count: Type.UInt16(),
//             str: Type.String(Type.ULEB128(), 'utf8'),
//         }))),
//         otherEncoders: [getOtherBinaryEncoder(BE.Array(BE.Structure({
//             id: BE.Uint32(),
//             // type: BE.OneOf([TypeEnum.a, TypeEnum.b, TypeEnum.c]),
//             count: BE.Uint16(),
//             // enabled: BE.Optional(BE.Uint8()),
//             str: BE.String(),
//         })))],
//     },
//     new Array(100).fill(1).map(() => new Array(Helpers.Random.int(70, 100)).fill(1).map(() => ({
//         id: Helpers.Random.int(0, 2 ** 32),
//         count: Helpers.Random.int(0, 2 ** 16),
//         str: Helpers.Random.stringUTF8(Helpers.Random.int(10, 123)),
//     }))),
// );

new Encoder(Type.Struct({
    array: Type.Array(Type.Struct({
        id: Type.Int32(),
        type: Type.Enum(TypeEnum),
        count: Type.UInt32(),
        enabled: Type.Nullable(Type.Bool()), // Type.Bool(), //
    })),
})).decode(Buffer.from('')).array[0].type

type et = keyof typeof TypeEnum;

Test.test(
    {
        label: 'Struct',
        count: 5e3,
        repeatCount: 100,
        binaryEncoder: new Encoder(Type.Struct({
            array: Type.Array(Type.Struct({
                id: Type.Int32(),
                type: Type.Enum(TypeEnum),
                count: Type.UInt32(),
                enabled: Type.Nullable(Type.Bool()), // Type.Bool(), //
            })),
        })),
        otherEncoders: [Helpers.Encoder.getProtobuf(
            new PBType('ArrayStruct')
            .add(new PBType('Struct')
                .add(new Enum('TypeEnum', pbTypeEnum))
                .add(new Field('id', 1, 'sfixed32'))
                .add(new Field('type', 2, 'TypeEnum'))
                .add(new Field('count', 3, 'fixed32'))
                .add(new Field('enabled', 4, 'bool', 'optional'))
            ).add(new Field('array', 1, 'Struct', 'repeated')),
        )],
    },
    Helpers.generateArray(100, () => ({
        array: Helpers.generateArray(1/* Helpers.Random.int(70, 100) */, () => ({
            id: Helpers.Random.int32(),
            type: randEnum(),
            count: Helpers.Random.uint32(),
            enabled: Helpers.Random.boolNull(),
        })),
    })),
);

Test.test(
    {
        label: 'Struct with bigint',
        count: 5e3,
        repeatCount: 100,
        binaryEncoder: new Encoder(Type.Struct({
            array: Type.Array(Type.Struct({
                id: Type.Int32(),
                type: Type.Enum(TypeEnum),
                count: Type.UInt32(),
                enabled: Type.Nullable(Type.Bool()), // Type.Bool(), //
                bigint: Type.Int64(),
            })),
        })),
        otherEncoders: [Helpers.Encoder.getProtobuf(
            new PBType('ArrayStruct')
            .add(new PBType('Struct')
                .add(new Enum('TypeEnum', pbTypeEnum))
                .add(new Field('id', 1, 'sfixed32'))
                .add(new Field('type', 2, 'TypeEnum'))
                .add(new Field('count', 3, 'fixed32'))
                .add(new Field('enabled', 4, 'bool', 'optional'))
                .add(new Field('bigint', 5, 'sfixed64'))
            ).add(new Field('array', 1, 'Struct', 'repeated')),
        )],
    },
    Helpers.generateArray(100, () => ({
        array: Helpers.generateArray(100, () => ({
            id: Helpers.Random.int32(),
            type: randEnum(),
            count: Helpers.Random.uint32(),
            enabled: Helpers.Random.boolNull(),
            bigint: Helpers.Random.bigInt(),
        })),
    })),
);


Test.test(
    {
        label: 'Struct with string (utf8)',
        count: 5e3,
        repeatCount: 100,
        binaryEncoder: new Encoder(Type.Struct({
            array: Type.Array(Type.Struct({
                id: Type.Int32(),
                type: Type.Enum(TypeEnum),
                count: Type.UInt32(),
                enabled: Type.Nullable(Type.Bool()), // Type.Bool(), //
                str: Type.String('utf8'),
            })),
        })),
        otherEncoders: [Helpers.Encoder.getProtobuf(
            new PBType('ArrayStructWithString')
            .add(new PBType('StructWithString')
                .add(new Enum('TypeEnum', pbTypeEnum))
                .add(new Field('id', 1, 'sfixed32'))
                .add(new Field('type', 2, 'TypeEnum'))
                .add(new Field('count', 3, 'fixed32'))
                .add(new Field('enabled', 4, 'bool', 'optional'))
                .add(new Field('str', 5, 'string')),
            ).add(new Field('array', 1, 'StructWithString', 'repeated')),
        )],
    },
    Helpers.generateArray(100, () => ({
        array: Helpers.generateArray(100, () => ({
            id: Helpers.Random.int32(),
            type: randEnum(),
            count: Helpers.Random.uint32(),
            enabled: Helpers.Random.boolNull(),
            str: Helpers.Random.stringUTF8(Helpers.Random.int(10, 49)),
        })),
    })),
);
