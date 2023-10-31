/* 
    // Array
    Array(Count, Type)
    Array(Count, Type, LengthType)

    // Count - is not a Type. It used for random values generation only
    1,2,3, ...
    randUInt(minValue, maxValue)
    range(start, end)
    set(100,99,...)

    // LengthType
    UVarInt32 | UInt8 | UInt16 | UInt32 | Const = UVarInt32

    // Const
    Const(val)

    // Struct
    Struct(prop1(Type), prop2(Type), ...)

    // OneOf
    OneOf(Struct)

    // Nullable
    Nullable(Type)

    // String
    String()
    String(Count)
    String(Count, Encoding)

    // Encoding
    utf8 | ucs2 | ascii = utf8

    // Endian
    be | le = le

    // Numbers
    UVarInt32, VarInt32
    UInt8, Int8
    UInt16 | UInt16(Endian)
    UInt32 | UInt32(Endian)
    UInt64 | UInt64(Endian)

    Float32 | Float32(Endian)
    Float64 | Float64(Endian)

    // Bool
    Bool
*/

import * as EB from "../src";
import * as PB from 'protobufjs';
import { Endian } from "../src/types";

interface Tree {
    name: string;
    childs?: Tree[];
}

interface TreeResult {
    tree: Tree;
    end: number;
    neighbourStart: number;
}

class FindString extends String {
    getFirstIndex(v: string, start = 0, end = this.length) {
        for (let i=start; i < end; ++i) {
            if (this[i] === v) {
                return i;
            }
        }

        return -1;
    }
    getLastIndex(v: string, end = this.length, start = 0) {
        for (let i=end - 1; start <= i; --i) {
            if (this[i] === v) {
                return i;
            }
        }

        return -1;
    }
    getFirstOfAnySymbol(v: string, start = 0, end = this.length) {
        for (let i=start; i < end; ++i) {
            if (v.includes(this[i])) {
                return { symbol: this[i], index: i };
            }
        }

        return null;
    }
    getLastOfAnySymbol(v: string, end = this.length, start = 0) {
        for (let i=end - 1; start <= i; --i) {
            if (v.includes(this[i])) {
                return { symbol: this[i], index: i };
            }
        }

        return null;
    }
}

function _getTree(str: FindString, start = 0, end = str.length): TreeResult {
    const fd = str.getFirstOfAnySymbol(',(', start);
    const noBracket = !fd || fd.symbol === ',';
    const boi = fd?.index || end;

    if (noBracket) {
        const info = str.getFirstOfAnySymbol(',)', start, end);
        if (info === null) {
            return { tree: { name: str.slice(start, end).trim() }, end, neighbourStart: 0 };
        }
        if (info.symbol === ',') {
            return { tree: { name: str.slice(start, info.index).trim() }, end: info.index - 1, neighbourStart: info.index + 1 };
        }
        return { tree: { name: str.slice(start, info.index).trim() }, end: info.index - 1, neighbourStart: 0 };
    } else {
        let bli = str.getLastIndex(')', end, start);
        if (bli === -1) {
            throw new Error();
        }
        let lastChild = _getTree(str, boi + 1, bli);
        const childs = [lastChild.tree];

        while (lastChild.neighbourStart) {
            lastChild = _getTree(str, lastChild.neighbourStart, bli);
            childs.push(lastChild.tree);
        }

        bli = lastChild.end + 1;

        const ns = str.getFirstIndex(',', bli, end);

        return {
            tree: {
                name: str.slice(start, boi).trim(),
                childs,
            },
            end: bli,
            neighbourStart: ns === -1 ? 0 : ns + 1,
        };
    }
}

function getTree(str: string) {
    return _getTree(new FindString(str)).tree;
}

type T = Exclude<keyof typeof EB.Type, 'Transform'>;

function parseType(tree: Tree) {
    let type: T = <any> tree.name;
    const { childs = [] } = tree;
    const firstChildName = childs[0]?.name;

    switch (type) {
        case 'Bool':
        case 'UVarInt32':
        case 'VarInt32':
        case 'UInt8':
        case 'Int8': return { type };
        case 'UInt16':
        case 'Int16':
        case 'UInt32':
        case 'Int32': 
        case 'UInt64':
        case 'Int64': return { type, endian: <Endian> firstChildName };
        case 'Nullable': return { type, child: parseType(childs[0]) };
        case 'Const': return { type, value: isNaN(+firstChildName) ? firstChildName : +firstChildName };
        case 'String': {
            return {
                type,
                genLength: {},
            }
        }
        break;
    }
}

const tree = getTree('Array(set(1,2),Struct(prop1(UInt8),prop2(Float64(be))))');
console.log(tree);
