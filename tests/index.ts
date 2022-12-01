import { BinaryEncoder, Type } from '../src';
import { Type as PBType, Field, Enum } from 'protobufjs';
import * as BE from 'binary-encoder';
import { generateString, getOtherBinaryEncoder, getProtobufEncoder, test } from './utils';

enum TypeEnum {
    'a',
    'b',
    'c',
}

const randEnum = () => [TypeEnum.a, TypeEnum.b, TypeEnum.c][Math.trunc(3 * Math.random())];
const randInt = (min = -(2 ** 51), max = (2 ** 51) - 1) => Math.trunc(min + (max - min) * Math.random());
const randBigInt = (min?: number, max?: number) => BigInt(randInt(min, max));
const randBool = () => [true, false][Math.trunc(2 * Math.random())];
const randBoolNull = () => [true, false, null][Math.trunc(3 * Math.random())];


// test(
//     {
//         label: 'Struct BE with string (utf8)',
//         count: 5e3,
//         groupCount: 500,
//         // @ts-ignore
//         binaryEncoder: new BinaryEncoder(Type.Array(Type.Struct({
//             id: Type.UInt32(),
//             count: Type.UInt16(),
//             str: Type.String(Type.ULEB128(), 'utf8'),
//         }), Type.ULEB128())),
//         otherEncoders: [getOtherBinaryEncoder(BE.Array(BE.Structure({
//             id: BE.Uint32(),
//             // type: BE.OneOf([TypeEnum.a, TypeEnum.b, TypeEnum.c]),
//             count: BE.Uint16(),
//             // enabled: BE.Optional(BE.Uint8()),
//             str: BE.String(),
//         })))],
//     },
//     new Array(100).fill(1).map(() => new Array(randInt(70, 100)).fill(1).map(() => ({
//         id: randInt(0, 2 ** 32),
//         count: randInt(0, 2 ** 16),
//         str: generateString(randInt(10, 123)),
//     }))),
// );


const bpString = new BinaryEncoder(Type.Struct({
    str: Type.String(Type.ULEB128(), 'utf8'),
}));

const pTypetring = getProtobufEncoder(
    new PBType('String')
        .add(new Field('str', 1, 'string')),
);

const beString = getOtherBinaryEncoder(BE.Structure({
    str: BE.String(),
}));

for (let i = 0; i <= 14; ++i) {
    // @ts-ignore
    test(
        {
            label: `String ${2 ** i}`,
            count: 5e3,
            groupCount: 500,
            binaryEncoder: bpString,
            otherEncoders: [pTypetring, beString],
        },
        new Array(100).fill(1).map(() => ({ str: generateString(2 ** i) })),
    );
}

test(
    {
        label: 'Struct',
        count: 5e3,
        groupCount: 500,
        binaryEncoder: new BinaryEncoder(Type.Struct({
            array: Type.Array(Type.Struct({
                id: Type.UInt32(),
                type: Type.Enum([TypeEnum.a, TypeEnum.b, TypeEnum.c]),
                count: Type.UInt16(),
                enabled: Type.Nullable(Type.Bool()), // Type.Bool(), //
            }), Type.ULEB128()),
        })),
        otherEncoders: [getProtobufEncoder(
            new PBType('ArrayStruct')
            .add(new PBType('Struct')
                .add(new Enum('TypeEnum', Object.fromEntries(Object.values(TypeEnum).map((v, i) => ([v, i])))))
                .add(new Field('id', 1, 'uint32'))
                .add(new Field('type', 2, 'TypeEnum'))
                .add(new Field('count', 3, 'uint32'))
                .add(new Field('enabled', 4, 'bool', 'optional'))
            ).add(new Field('array', 1, 'Struct', 'repeated')),
        )],
    },
    new Array(100).fill(1).map(() => ({
        array: new Array(randInt(70, 100)).fill(1).map(() => ({
            id: randInt(0, 2 ** 32),
            type: randEnum(),
            count: randInt(0, 2 ** 16),
            enabled: randBoolNull(),
        })),
    })),
);

// @ts-ignore
test(
    {
        label: 'Struct with bigint',
        count: 5e3,
        groupCount: 500,
        binaryEncoder: new BinaryEncoder(Type.Struct({
            array: Type.Array(Type.Struct({
                id: Type.UInt32(),
                type: Type.Enum([TypeEnum.a, TypeEnum.b, TypeEnum.c]),
                count: Type.UInt16(),
                enabled: Type.Nullable(Type.Bool()), // Type.Bool(), //
                bigint: Type.Int64(),
            }), Type.ULEB128()),
        })),
        otherEncoders: [getProtobufEncoder(
            new PBType('ArrayStruct')
            .add(new PBType('Struct')
                .add(new Enum('TypeEnum', Object.fromEntries(Object.values(TypeEnum).map((v, i) => ([v, i])))))
                .add(new Field('id', 1, 'uint32'))
                .add(new Field('type', 2, 'TypeEnum'))
                .add(new Field('count', 3, 'uint32'))
                .add(new Field('enabled', 4, 'bool', 'optional'))
                .add(new Field('bigint', 5, 'int64'))
            ).add(new Field('array', 1, 'Struct', 'repeated')),
        )],
    },
    new Array(100).fill(1).map(() => ({
        array: new Array(randInt(70, 100)).fill(1).map(() => ({
            id: randInt(0, 2 ** 32),
            type: randEnum(),
            count: randInt(0, 2 ** 16),
            enabled: randBoolNull(),
            bigint: randBigInt(),
        })),
    })),
);


test(
    {
        label: 'Struct with string (utf8)',
        count: 5e3,
        groupCount: 500,
        binaryEncoder: new BinaryEncoder(Type.Struct({
            array: Type.Array(Type.Struct({
                id: Type.UInt32(),
                type: Type.Enum([TypeEnum.a, TypeEnum.b, TypeEnum.c]),
                count: Type.UInt16(),
                enabled: Type.Nullable(Type.Bool()), // Type.Bool(), //
                str: Type.String(Type.ULEB128(), 'utf8'),
            }), Type.ULEB128()),
        })),
        otherEncoders: [getProtobufEncoder(
            new PBType('ArrayStructWithString')
            .add(new PBType('StructWithString')
                .add(new Enum('TypeEnum', Object.fromEntries(Object.values(TypeEnum).map((v, i) => ([v, i])))))
                .add(new Field('id', 1, 'uint32'))
                .add(new Field('type', 2, 'TypeEnum'))
                .add(new Field('count', 3, 'uint32'))
                .add(new Field('enabled', 4, 'bool', 'optional'))
                .add(new Field('str', 5, 'string')),
            ).add(new Field('array', 1, 'StructWithString', 'repeated')),
        )],
    },
    new Array(100).fill(1).map(() => ({
        array: new Array(randInt(70, 100)).fill(1).map(() => ({
            id: randInt(0, 2 ** 32),
            type: randEnum(),
            count: randInt(0, 2 ** 16),
            enabled: randBoolNull(),
            str: generateString(randInt(10, 49)),
        })),
    })),
);

// @ts-ignore
test(
    {
        label: 'Struct with string (ascii)',
        count: 5e3,
        groupCount: 500,
        binaryEncoder: new BinaryEncoder(Type.Struct({
            array: Type.Array(Type.Struct({
                id: Type.UInt32(),
                type: Type.Enum([TypeEnum.a, TypeEnum.b, TypeEnum.c]),
                count: Type.UInt16(),
                enabled: Type.Nullable(Type.Bool()), // Type.Bool(), //
                str: Type.String(Type.ULEB128(), 'ascii'),
            }), Type.ULEB128()),
        })),
    },
    new Array(100).fill(1).map(() => ({
        array: new Array(randInt(70, 100)).fill(1).map(() => ({
            id: randInt(0, 2 ** 32),
            type: randEnum(),
            count: randInt(0, 2 ** 16),
            enabled: randBoolNull(),
            str: generateString(randInt(10, 49)),
        })),
    })),
);


setTimeout(console.log, 100000);
