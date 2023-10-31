import { StringDecoder } from 'string_decoder';
import type { BinaryBuffer } from '..';
import { BufferPointer } from '../../BufferPointer';
import { _native } from '../_native';
import { decodeCodePointsArray } from './helpers';

export const byteLength = (s: string) => {
    //assuming the String is UCS-2(aka UTF-16) encoded
    var n = 0;
    for (var i = 0, l = s.length; i < l; i++) {
        var hi = s.charCodeAt(i);
        if (hi < 0x0080) { //[0x0000, 0x007F]
            n += 1;
        } else if (hi < 0x0800) { //[0x0080, 0x07FF]
            n += 2;
        } else if (hi < 0xD800) { //[0x0800, 0xD7FF]
            n += 3;
        } else if (hi < 0xDC00) { //[0xD800, 0xDBFF]
            var lo = s.charCodeAt(++i);
            if (i < l && lo >= 0xDC00 && lo <= 0xDFFF) { //followed by [0xDC00, 0xDFFF]
                n += 4;
            } else {
                throw new Error("UCS-2 String malformed");
            }
        } else if (hi < 0xE000) { //[0xDC00, 0xDFFF]
            throw new Error("UCS-2 String malformed");
        } else { //[0xE000, 0xFFFF]
            n += 3;
        }
    }
    return n;
};

const _encodeInto = (buf: Uint8Array, str: string, offset = 0) => {
    var c1, // character 1
        c2; // character 2
    for (var i = 0; i < str.length; ++i) {
        c1 = str.charCodeAt(i);
        if (c1 < 128) {
            buf[offset++] = c1;
        } else if (c1 < 2048) {
            buf[offset++] = c1 >> 6       | 192;
            buf[offset++] = c1       & 63 | 128;
        } else if ((c1 & 0xFC00) === 0xD800 && ((c2 = str.charCodeAt(i + 1)) & 0xFC00) === 0xDC00) {
            c1 = 0x10000 + ((c1 & 0x03FF) << 10) + (c2 & 0x03FF);
            ++i;
            buf[offset++] = c1 >> 18      | 240;
            buf[offset++] = c1 >> 12 & 63 | 128;
            buf[offset++] = c1 >> 6  & 63 | 128;
            buf[offset++] = c1       & 63 | 128;
        } else {
            buf[offset++] = c1 >> 12      | 224;
            buf[offset++] = c1 >> 6  & 63 | 128;
            buf[offset++] = c1       & 63 | 128;
        }
    }
    return offset;
};

export const encodeInto = _native.encoders.utf8.write ?
    (buf: BinaryBuffer, str: string, offset = 0) => {
        if (str.length < 40) {
            return _encodeInto(buf, str, offset);
        }
        return buf.utf8Write(str, offset);
    } :
    _encodeInto;

export const encode = (s: string, units = Infinity) => {
    const bytes: number[] = [];
    const length = s.length;
    let codePoint: number;
    let leadSurrogate: number = null;

    for (let i = 0; i < length; ++i) {
        codePoint = s.charCodeAt(i);

        // is surrogate component
        if (codePoint > 0xD7FF && codePoint < 0xE000) {
            // last char was a lead
            if (!leadSurrogate) {
                // no lead yet
                if (codePoint > 0xDBFF) {
                    // unexpected trail
                    if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                    continue;
                } else if (i + 1 === length) {
                    // unpaired lead
                    if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                    continue;
                }

                // valid lead
                leadSurrogate = codePoint;

                continue;
            }

            // 2 leads in a row
            if (codePoint < 0xDC00) {
                if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                leadSurrogate = codePoint;
                continue;
            }

            // valid surrogate pair
            codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
        } else if (leadSurrogate) {
            // valid bmp char, but last char was a lead
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
        }

        leadSurrogate = null;

        // encode utf8
        if (codePoint < 0x80) {
            if ((units -= 1) < 0) break;
            bytes.push(codePoint);
        } else if (codePoint < 0x800) {
            if ((units -= 2) < 0) break;
            bytes.push(
                codePoint >> 0x6 | 0xC0,
                codePoint & 0x3F | 0x80
            );
        } else if (codePoint < 0x10000) {
            if ((units -= 3) < 0) break;
            bytes.push(
                codePoint >> 0xC | 0xE0,
                codePoint >> 0x6 & 0x3F | 0x80,
                codePoint & 0x3F | 0x80
            );
        } else if (codePoint < 0x110000) {
            if ((units -= 4) < 0) break;
            bytes.push(
                codePoint >> 0x12 | 0xF0,
                codePoint >> 0xC & 0x3F | 0x80,
                codePoint >> 0x6 & 0x3F | 0x80,
                codePoint & 0x3F | 0x80
            );
        } else {
            throw new Error('Invalid code point');
        }
    }

    return bytes;
}

export const _decode = (buf: Uint8Array, start: number, end: number) => {
    const codes: number[] = [];

    let i = start;
    while (i < end) {
        const firstByte = buf[i];
        let codePoint = null;
        let bytesPerSequence = (firstByte > 0xEF) ? 4
            : (firstByte > 0xDF) ? 3
                : (firstByte > 0xBF) ? 2
                    : 1;

        if (i + bytesPerSequence <= end) {
            let secondByte, thirdByte, fourthByte, tempCodePoint;

            switch (bytesPerSequence) {
                case 1:
                    if (firstByte < 0x80) {
                        codePoint = firstByte;
                    }
                    break;
                case 2:
                    secondByte = buf[i + 1];
                    if ((secondByte & 0xC0) === 0x80) {
                        tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
                        if (tempCodePoint > 0x7F) {
                            codePoint = tempCodePoint;
                        }
                    }
                    break;
                case 3:
                    secondByte = buf[i + 1];
                    thirdByte = buf[i + 2];
                    if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                        tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
                        if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                            codePoint = tempCodePoint;
                        }
                    }
                    break;
                case 4:
                    secondByte = buf[i + 1];
                    thirdByte = buf[i + 2];
                    fourthByte = buf[i + 3];
                    if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                        tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
                        if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                            codePoint = tempCodePoint;
                        }
                    }
            }
        }

        if (codePoint === null) {
            // we did not generate a valid codePoint so insert a
            // replacement char (U+FFFD) and advance only 1 byte
            codePoint = 0xFFFD;
            bytesPerSequence = 1;
        } else if (codePoint > 0xFFFF) {
            // encode to utf16 (surrogate pair dance)
            codePoint -= 0x10000;
            codes.push(codePoint >>> 10 & 0x3FF | 0xD800);
            codePoint = 0xDC00 | codePoint & 0x3FF;
        }

        codes.push(codePoint);
        i += bytesPerSequence;
    }

    return decodeCodePointsArray(codes);
}

const sd = _native.tryCreateStringDecoder('utf8');
export const decode =
    // (buf: BinaryBuffer, start: number, end: number) => buf.utf8Slice(start, end);
    // _decode;
    // (buf: BinaryBuffer, start: number, end: number) => sd.end(Buffer.from(buf.buffer, start, end - start));
    sd ?
    (_native.encoders.utf8.slice ?
        (buf: BinaryBuffer, start: number, end: number) => {
            if (end - start < 40) {
                return _decode(buf, start, end);
            }
            if (end - start < 53) {
                return buf.utf8Slice(start, end);
            }
            return sd.end(Buffer.from(buf.buffer, start, end - start));
        } :
        (buf: BinaryBuffer, start: number, end: number) => {
            if (end - start < 53) {
                return _decode(buf, start, end);
            }
            return sd.end(Buffer.from(buf.buffer, start, end - start));
        }
    ) :
    (_native.encoders.utf8.slice ?
        (buf: BinaryBuffer, start: number, end: number) => {
            if (end - start < 40) {
                return _decode(buf, start, end);
            }
            return buf.utf8Slice(start, end);
        } :
        _decode
    );
