// import {createPacker} from './lib';

import { ArrayTypePacker, ObjectTypePacker, ParamsGenerator, SimpleTypePacker, TypePacker } from "./Schemas";
import { Utils } from "./utils";

try {
    class Vector2 {
        x: number;
        y: number;
    };

    class Vector3 {
        x: number;
        y: number;
        z: number;
    };

    let test = TypePacker.parseSchema({
        type: 'array',
        item: {
            type: 'object',
            // objectConstructor: Vector2,
            properties: {
                x: {type: 'int32'},
                y: {type: 'int32'},
                val: {type: 'int64'},
                someFlag: {type: 'bool'},
                description: {type: 'string'/* , nullable: true */},
                // buffer: {type: 'arraybuffer', nullable: true},
                other: {
                    type: 'object',
                    // nullable: true,
                    properties: {
                        val: {type: 'float64'},
                    },
                },
            },
            // flags: <Array<'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'>> ['1','2','3','4','5','6','7','8'],
            flags: ['1', '2'],
        }
    });

    let boolTest = TypePacker.parseSchema({
        type: 'boolarray',
    });

    (<any> BigInt.prototype).toJSON = function () {
        return this.toString();
    }

    const uia = new Uint8Array([123, 34, 213, 98, 123, 987, 124, 324, 83746, 328747]);

    const data = [
        {
            x:2,y:3,val:BigInt(4), someFlag: true, '2': true, '4': true,
            description: 'aflisuhnfalihilu 🍀 fasdli Привет unfaslyi as',
            // buffer: uia.buffer,
            other: {val: 123},
        },
        {
            x:5,y:6,val:BigInt(7), someFlag: true, '2': true, '4': true,
            description: 'p0u8af af8ynpafl 🍀 elfzna Привет faf.li \n asdky',
            // buffer: uia.buffer,,
            other: {val: 1234},
        },
        {
            x:5,y:6,val:BigInt(7), someFlag: true, '2': true, '4': true,
            description: 'p0u8af af8ynpafl 🍀 elfzna Привет faf.li \n asdky',
            // buffer: uia.buffer,,
            other: {val: 1234},
        },
        {
            x:5,y:6,val:BigInt(7), someFlag: true, '2': true, '4': true,
            description: 'p0u8af af8ynpafl 🍀 elfzna Привет faf.li \n asdky',
            // buffer: uia.buffer,,
            other: {val: 1234},
        },
        {
            x:5,y:6,val:BigInt(7), someFlag: true, '2': true, '4': true,
            description: 'p0u8af af8ynpafl 🍀 elfzna Привет faf.li \n asdky',
            // buffer: uia.buffer,,
            other: {val: 1234},
        },
    ];

    function testAll(cnt: number, unpacked: any, packed: any, jsonPacked: any) {
        const pack = Utils.test(test.pack, cnt, unpacked);
        const stringify = Utils.test(JSON.stringify, cnt, unpacked);
        const unpack = Utils.test(test.unpack, cnt, packed);
        const parse = Utils.test(JSON.parse, cnt, jsonPacked);

        return {
            cnt,
            'pack / stringify': pack / stringify,
            'unpack / parse': unpack / parse,
            pack,
            stringify,
            unpack,
            parse,
        };
    }

    try {
        // @ts-ignore
        const packed = test.pack(data);
        const unpacked = test.unpack(packed);
        const jsonPacked = JSON.stringify(data);

        // console.log(jsonPacked.length, jsonPacked);
        // console.log(packed.length, packed);
        // console.log(unpacked);

        for (let i=10; i<1000000; i*=2) {
            Utils.logObject(testAll(i, [data], [packed], [jsonPacked]));
        }
    } catch (error) {
        console.log(error);
    }
} catch (error) {
    console.log(error);
}
