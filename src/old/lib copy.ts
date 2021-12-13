import * as Types from './types copy';


const numberTypesArraysMap: {
    [key in Types.NUMBER_TYPE]: {
        read: keyof Buffer;
        write: keyof Buffer;
        size: number;
        //GenericTypedArrayConstructor
    };
} = {
    'int8': {read:'readInt8', write:'writeInt8', size: 1},
    'int16': {read:'readInt16BE', write:'writeInt16BE', size: 2},
    'int32': {read:'readInt32BE', write:'writeInt32BE', size: 4},
    'int64': {read:'readBigUInt64BE', write:'writeBigInt64BE', size: 8},
    'uint8': {read:'readUInt8', write:'writeUInt8', size: 1},
    'uint16': {read:'readUInt16BE', write:'writeUInt16BE', size: 2},
    'uint32': {read:'readUInt32BE', write:'writeUInt32BE', size: 4},
    'float32': {read:'readFloatBE', write:'writeFloatBE', size: 4},
    'float64': {read:'readDoubleBE', write:'writeDoubleBE', size: 8},
};

const readWriteFunctionsForFlags: {
    read: keyof Types.BufferType;
    write: keyof Buffer;
}[] = [
    {read:'readUInt8', write:'writeUInt8'},
    {read:'readUInt16BE', write:'writeUInt16BE'},
    {read:'readUInt32BE', write:'writeUInt32BE'},
];

function createPackerHelper(t: Types.PackerStructTyperHelper) {
    if (t.type === 'array') {
        createPackerHelper(t.item);

        t._getByteSize = (arr: any[]) => {
            let result = 4;

            for (const item of arr) {
                result += t.item._getByteSize(arr);
            }

            return result;
        };

        t._pack = (arr: any[], buf, byteIndex) => {
            // new Uint32Array(buf, byteIndex, 1)[0] = arr.length;
            buf.writeUInt32BE(arr.length, byteIndex);
            byteIndex += 4;

            for (const item of arr) {
                byteIndex = t.item._pack(item, buf, byteIndex);
            }

            return byteIndex;
        };

        t._unpack = (buf, byteIndex) => {
            // const length = new Uint32Array(buf, byteIndex, 1)[0];
            const length = buf.readUInt32BE(byteIndex);
            byteIndex += 4;

            const result: any[] = [];

            for (let i = 0; i < length; ++i) {
                const it = t.item._unpack(buf, byteIndex);

                byteIndex = it.byteIndex;
                result.push(it.result);
            }

            return {
                byteIndex,
                result,
            };
        };
    } else if (t.type === 'object') {
        const flagsSet = new Set<string>(t.flags || []);

        Object.entries(t.properties).forEach(([key, tt]) => {
            if (tt.type === 'bool') {
                flagsSet.add(key);

                delete t.properties?.[key];
            } else {
                createPackerHelper(tt);
            }
        });

        t._flagsByteSize = 0;

        if (flagsSet.size) {
            t.flags = Array.from(flagsSet);
            t._flagsByteSize = Math.ceil(Math.log2(t.flags.length));
        }

        t._getByteSize = (obj) => {
            let result = 0;

            for (const [key, tt] of Object.entries(t.properties)) {
                result += tt._getByteSize(obj[key]);
            }

            return result + t._flagsByteSize;
        };

        t._pack = (obj, buf, byteIndex) => {
            for (const [key, tt] of Object.entries(t.properties)) {
                byteIndex = tt._pack(obj[key], buf, byteIndex);
            }

            if (t._flagsByteSize) {
                const flags = t.flags.reduce((acc, key, i) => acc + (obj[key] << i), 0);
                (<any> buf)[readWriteFunctionsForFlags[t._flagsByteSize - 1].write](flags, byteIndex);

                byteIndex += t._flagsByteSize;
            }

            return byteIndex;
        };

        t._unpack = (buf, byteIndex) => {
            const result = t.objectConstructor ? new t.objectConstructor() : {};

            for (const [key, tt] of Object.entries(t.properties)) {
                const it = tt._unpack(buf, byteIndex);

                byteIndex = it.byteIndex;
                result[key] = it.result;
            }

            if (t._flagsByteSize) {
                const flags = (<any> buf)[readWriteFunctionsForFlags[t._flagsByteSize - 1].read](byteIndex);
                
                t.flags.forEach((key, i) => result[key] = !!(flags & (1 << i)));

                byteIndex += t._flagsByteSize;
            }

            return {
                byteIndex,
                result,
            };
        };
    } else if (t.type === 'bool') {
        t._getByteSize = () => 1;

        t._pack = (val, buf, byteIndex) => {
            buf.writeUInt8(val, byteIndex);
            // new Uint8Array(buf, byteIndex, 1)[0] = val;
            return byteIndex + 1;
        };

        t._unpack = (buf, byteIndex) => {
            return {
                byteIndex: byteIndex + 1,
                // result: !!(new Uint8Array(buf, byteIndex, 1)[0]),
                result: !!(buf.readUInt8(byteIndex)),
            };
        };
    } else {
        const ArrayConstructor = numberTypesArraysMap[t.type];

        t._getByteSize = () => ArrayConstructor.size;

        t._pack = (val, buf, byteIndex) => {
            (<any>buf)[ArrayConstructor.write](val, byteIndex);
            // new ArrayConstructor(buf, byteIndex, 1)[0] = val;
            return byteIndex + ArrayConstructor.size;
        };

        t._unpack = (buf, byteIndex) => {
            return {
                byteIndex: byteIndex + ArrayConstructor.size,
                // result: new ArrayConstructor(buf, byteIndex, 1)[0],
                result: (<any>buf)[ArrayConstructor.read](byteIndex),
            };
        };
    }
}

export function createPacker<T extends Types.StructTyperHelper>(t: T): Types.Packer<T> {
    let tt: Types.PackerStructTyperHelper = <any> t;
    createPackerHelper(tt);

    
    return <any> {
        ...t,
        pack(structured: T) {
            const buf = Types.BufferType.alloc(tt._getByteSize(structured));

            tt._pack(structured, buf, 0);

            return buf;
        },
        unpack(buf: Types.BufferType) {
            return tt._unpack(buf, 0).result;
        },
    };
}
