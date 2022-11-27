import { BinaryPacker, BinarySchemas as BS } from '../src';
import { Type, Field, Root, Enum } from 'protobufjs';
import { test } from './utils/test';

enum TypeEnum {
    'a',
    'b',
    'c',
}

const pbStruct = new Type('Struct')
    .add(new Enum('TypeEnum', Object.fromEntries(Object.values(TypeEnum).map((v, i) => ([v, i])))))
    .add(new Field('id', 1, 'uint32'))
    .add(new Field('type', 2, 'TypeEnum'))
    .add(new Field('count', 3, 'uint32'))
    .add(new Field('enabled', 4, 'bool', 'optional'))
    // .add(new Field('str', 5, 'string'))
    ;

const pbArrayStruct = new Type('ArrayStruct')
    .add(pbStruct)
    .add(new Field('array', 1, 'Struct', 'repeated'));

const pbStructWithString = new Type('StructWithString')
    .add(new Enum('TypeEnum', Object.fromEntries(Object.values(TypeEnum).map((v, i) => ([v, i])))))
    .add(new Field('id', 1, 'uint32'))
    .add(new Field('type', 2, 'TypeEnum'))
    .add(new Field('count', 3, 'uint32'))
    .add(new Field('enabled', 4, 'bool', 'optional'))
    .add(new Field('str', 5, 'string'))
    ;

const pbArrayStructWithString = new Type('ArrayStructWithString')
    .add(pbStruct)
    .add(new Field('array', 1, 'StructWithString', 'repeated'));
    
const pbRoot = new Root().define("Root")
    .add(pbStruct).add(pbArrayStruct)
    .add(pbStructWithString).add(pbArrayStructWithString);

const bpArrayStruct = new BinaryPacker(BS.Struct({
    array: BS.Array(BS.Struct({
        id: BS.UInt32(),
        type: BS.Enum([TypeEnum.a, TypeEnum.b, TypeEnum.c]),
        count: BS.UInt16(),
        enabled: BS.Nullable(BS.Bool()), // BS.Bool(), //
    }), BS.LEB128()),
}));

const bpArrayStructWithStringUTF8 = new BinaryPacker(BS.Struct({
    array: BS.Array(BS.Struct({
        id: BS.UInt32(),
        type: BS.Enum([TypeEnum.a, TypeEnum.b, TypeEnum.c]),
        count: BS.UInt16(),
        enabled: BS.Nullable(BS.Bool()), // BS.Bool(), //
        str: BS.String(BS.LEB128(), 'utf8'),
    }), BS.LEB128()),
}));

const bpArrayStructWithStringASCII = new BinaryPacker(BS.Struct({
    array: BS.Array(BS.Struct({
        id: BS.UInt32(),
        type: BS.Enum([TypeEnum.a, TypeEnum.b, TypeEnum.c]),
        count: BS.UInt16(),
        enabled: BS.Nullable(BS.Bool()), // BS.Bool(), //
        str: BS.String(BS.LEB128(), 'ascii'),
    }), BS.LEB128()),
}));


const generateString = (length: number) => {
    const arr = new Array<string>(length);

    for (let i = 0; i < length; ++i) {
        arr[i] = Math.random() > 0.1 ? String.fromCharCode(Math.trunc(65 + 60 * Math.random())) : '😎';
    }

    return arr.join('');
};

const generateStruct = () => {
    return {
        id: Math.trunc(1e6 * Math.random()),
        type: [TypeEnum.a, TypeEnum.b, TypeEnum.c][Math.trunc(3 * Math.random())],
        count: Math.trunc(1e4 * Math.random()),
        enabled: [true, false, null][Math.trunc(3 * Math.random())],
        str: generateString(20),
    };
};

const generateStructArray = (count: number) => {
    return new Array(count).fill(1).map(() => generateStruct());
};

const values = [
    { array: generateStructArray(20) },
    { array: generateStructArray(100) },
    { array: generateStructArray(2) },
    { array: generateStructArray(1) },
    { array: generateStructArray(500) },
    { array: generateStructArray(123) },
    { array: generateStructArray(123) },
    { array: generateStructArray(123) },
    { array: generateStructArray(123) },
    { array: generateStructArray(123) },
    { array: generateStructArray(123) },
    { array: generateStructArray(123) },
    { array: generateStructArray(123) },
    { array: generateStructArray(123) },
    { array: generateStructArray(123) },
    { array: generateStructArray(123) },
    { array: generateStructArray(123) },
    { array: generateStructArray(123) },
    { array: generateStructArray(123) },
    { array: generateStructArray(123) },
    { array: generateStructArray(123) },
    { array: generateStructArray(123) },
    { array: generateStructArray(123) },
    { array: generateStructArray(123) },
    { array: generateStructArray(123) },
    { array: generateStructArray(123) },
    { array: generateStructArray(123) },
    { array: generateStructArray(123) },
    // {
    //     array: [
    //         { id: 11, type: TypeEnum.c, count: 1234, enabled: null, str: 'It is some string 😎' },
    //         { id: 22, type: TypeEnum.b, count: 7567, enabled: true, str: 'It is some another string 😎' },
    //         { id: 33, type: TypeEnum.a, count: 4356, enabled: false, str: 'It is some string 3 😎' },
    //     ],
    // },
];

const count = 1e3;
const groupCount = 500;

// @ts-ignore
test(
    {
        label: 'Struct',
        count,
        groupCount,
        protobufType: pbArrayStruct,
        binaryPacker: bpArrayStruct,
    },
    values,
);


// @ts-ignore
test(
    {
        label: 'Struct with string (utf8)',
        count,
        groupCount,
        protobufType: pbArrayStructWithString,
        binaryPacker: bpArrayStructWithStringUTF8,
    },
    values,
);


// @ts-ignore
test(
    {
        label: 'Struct with string (ascii)',
        count,
        groupCount,
        // Protobuf supports `utf8` only
        protobufType: pbArrayStructWithString,
        binaryPacker: bpArrayStructWithStringASCII,
    },
    values,
);


setTimeout(console.log, 100000);
