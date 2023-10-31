import type { BinaryBuffer } from "..";
import { _native } from "../_native";

export const byteLength = (s: string) => {
    return s.length * 2;
};

const ui8a = new Uint8Array([1, 2]);
const ui16a = new Uint16Array(ui8a.buffer);

const write = ui16a[0] >> 8 === 2 ?
    (v: number, b: Uint8Array, o: number) => {
        ui16a[0] = v;
        // b.set(ui8a, o); // slower
        b[o + 0] = ui8a[0];
        b[o + 1] = ui8a[1];
    } :
    (v: number, b: Uint8Array, o: number) => {
        ui16a[0] = v;
        b[o + 0] = ui8a[1];
        b[o + 1] = ui8a[0];
    };

export const _encodeInto = (buf: Uint8Array, str: string, offset = 0) => {
    for (let i=0; i<str.length; ++i) {
        write(str.charCodeAt(i), buf, offset);
        offset += 2;
    }

    return offset;
};

export const encodeInto = _native.encoders.ucs2.write ?
    (buf: BinaryBuffer, str: string, offset = 0) => buf.ucs2Write(str, offset) :
    _encodeInto;

const read = ui16a[0] >> 8 === 2 ?
    (buf: Uint8Array, start = 0, end = buf.length) => {
        return new Uint16Array(buf.buffer.slice(start, end));
    } :
    (buf: Uint8Array, start = 0, end = buf.length) => {
        const res = new Uint8Array(buf.buffer.slice(start, end));

        for (let i=0; i<res.length; i += 2) {
            const tmp = res[i];
            res[i] = res[i+1];
            res[i+1] = tmp;
        }

        return new Uint16Array(res.buffer);
    };

const MAX_ARGUMENTS_LENGTH = 0x1000;

export const decode = (buf: Uint8Array, start = 0, end = buf.length) => {
    end = Math.min(buf.length, end);

    const points = new Uint16Array(buf.buffer.slice(start, end));

    if (points.length < MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(
            String,
            points,
        );
    }

    // const res: string[] = [];
    let res = '';
    start = 0;
    while (start < points.length) {
        const partEnd = Math.min(points.length, start + MAX_ARGUMENTS_LENGTH);
        // res.push(String.fromCharCode.apply(
        //     String,
        //     buf.subarray(start, partEnd),
        // ));

        res += String.fromCharCode.apply(
            String,
            points.subarray(start, partEnd),
        );

        start = partEnd;
    }
    // return res.join('');
    return res;
}
