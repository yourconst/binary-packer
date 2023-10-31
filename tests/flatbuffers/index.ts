import { ArrayStruct, Struct, TypeEnum } from './monster_generated';

const values = [
    Struct.fromValues(1, TypeEnum.a, 123, true),
];

const obj = ArrayStruct.fromValues(values);

const eres = obj.buildFlatbuffer();

console.log(eres);

const dres = ArrayStruct.fromFlatbuffer(eres);

console.log(dres);
