import { Encoder, Type } from "../../src";
import { Helpers, Test } from "../utils2";
import { SomeEnum, randSomeEnum } from "./_defEnum";
import { Type as PBType, Field, Enum } from 'protobufjs';

Test.test(
    {
        label: 'Struct',
        binaryEncoder: new Encoder(Type.Struct({
            array: Type.Array(Type.Struct({
                id: Type.Int32(),
                count: Type.UInt32(),
                enabled: Type.Bool(),
            })),
        })),
        otherEncoders: [Helpers.Encoder.getProtobuf(
            new PBType('ArrayStruct')
            .add(new PBType('Struct')
                .add(new Field('id', 1, 'sfixed32', 'required'))
                .add(new Field('count', 3, 'fixed32'))
                .add(new Field('enabled', 4, 'bool'))
            ).add(new Field('array', 1, 'Struct', 'repeated')),
        )],
    },
    Helpers.generateArray(100, () => ({
        array: Helpers.generateArray(100/* Helpers.Random.int(70, 100) */, () => ({
            id: Helpers.Random.int32(),
            count: Helpers.Random.uint32(),
            enabled: Helpers.Random.bool(),
        })),
    })),
);
