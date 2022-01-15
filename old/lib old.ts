import { ReadWriteBuffer } from '../ReadWriteBuffer';
import * as Types from '../types';


function createPackerHelper(t: Types.PackerStructTyperHelper<ReadWriteBuffer>) {
    if (t.type === 'array') {
        createPackerHelper(t.item);

        t._getByteSize = (arr: any[]) => {
            let result = 4;

            for (const item of arr) {
                result += t.item._getByteSize(item);
            }

            return result;
        };

        t._pack = (arr: any[], buf) => {
            // new Uint32Array(buf, 1)[0] = arr.length;
            buf.uint32.write(arr.length);

            arr.forEach((item) => t.item._pack(item, buf));
        };

        t._unpack = (buf) => {
            // const length = new Uint32Array(buf, 1)[0];
            const length = buf.uint32.read();

            const result: any[] = [];

            for (let i = 0; i < length; ++i) {
                result.push(t.item._unpack(buf));
            }

            return result;
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
            t._flagsByteSize = Math.ceil(Math.log2(t.flags.length) / 3);
        }

        t._getByteSize = (obj) => {
            let result = 0;

            for (const [key, tt] of Object.entries(t.properties)) {
                result += tt._getByteSize(obj[key]);
            }

            return result + t._flagsByteSize;
        };

        t._pack = (obj, buf) => {
            for (const [key, tt] of Object.entries(t.properties)) {
                tt._pack(obj[key], buf);
            }

            if (t._flagsByteSize) {
                const flags = t.flags.reduce((acc, key, i) => acc + (obj[key] << i), 0);
                buf.powerUints[t._flagsByteSize - 1].write(flags);
            }
        };

        t._unpack = (buf) => {
            const result = t.objectConstructor ? new t.objectConstructor() : {};

            for (const [key, tt] of Object.entries(t.properties)) {
                result[key] = tt._unpack(buf);
            }

            if (t._flagsByteSize) {
                const flags = buf.powerUints[t._flagsByteSize - 1].read();
                
                t.flags.forEach((key, i) => result[key] = !!(flags & (1 << i)));
            }

            return result;
        };
    } else if (t.type === 'string') {
        t._getByteSize = ReadWriteBuffer.sizes.string;

        t._pack = (val, buf) => {
            buf.string.write(val);
            // new Uint8Array(buf, 1)[0] = val;
        };

        t._unpack = (buf) => buf.string.read();
    } else {
        const byteSize = ReadWriteBuffer.sizes[t.type];

        t._getByteSize = () => byteSize;

        t._pack = (val, buf) => buf[t.type].write(<never> val)

        t._unpack = (buf) => buf[t.type].read();
    }
}

export function createPacker<T extends Types.StructTyperHelper>(t: T): Types.Packer<T> {
    let tt: Types.PackerStructTyperHelper<ReadWriteBuffer> = <any> t;
    createPackerHelper(tt);

    
    return <any> {
        ...t,
        pack(structured: T) {
            const buf = new ReadWriteBuffer(tt._getByteSize(structured));

            tt._pack(structured, buf);

            return buf._b;
        },
        unpack(buf: Types.BufferType) {
            return tt._unpack(new ReadWriteBuffer(buf));
        },
    };
}
