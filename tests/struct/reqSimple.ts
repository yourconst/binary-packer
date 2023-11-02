import { Encoder, Type } from "../../src";
import { Helpers, Test } from "../utils2";
import { SomeEnum, randSomeEnum } from "./_defEnum";
import { Type as PBType, Field, Enum } from 'protobufjs';

Test.test(
    {
        label: 'Struct',
        binaryEncoder: new Encoder(Type.Struct({
            array: Type.Array(Type.Struct({
                id: Type.Order(1, Type.Int32()),
                count: Type.UInt32(),
                varint: Type.VarInt32(),
                uvarint: Type.UVarInt32(),
                enabled: Type.Order(2, Type.Bool()),
            })),
        })),
        otherEncoders: [Helpers.Encoder.getProtobuf(
            new PBType('ArrayStruct')
            .add(new PBType('Struct')
                .add(new Field('id', 1, 'sfixed32', 'required'))
                .add(new Field('count', 2, 'fixed32', 'required'))
                .add(new Field('varint', 3, 'int32', 'required'))
                .add(new Field('uvarint', 4, 'uint32', 'required'))
                .add(new Field('enabled', 5, 'bool', 'required'))
            ).add(new Field('array', 1, 'Struct', 'repeated')),
        )],
    },
    Helpers.generateArray(100, () => ({
        array: Helpers.generateArray(100/* Helpers.Random.int(70, 100) */, () => ({
            id: Helpers.Random.int32(),
            count: Helpers.Random.uint32(),
            varint: Helpers.Random.int32(),
            uvarint: Helpers.Random.uint32(),
            enabled: Helpers.Random.bool(),
        })),
    })),
);
