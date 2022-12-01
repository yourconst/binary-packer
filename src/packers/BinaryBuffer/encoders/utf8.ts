import { BufferPointer } from '../../BufferPointer';

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

export const encodeInto = (string: string, buf: Uint8Array, offset = 0) => {
    const length = string.length;
    let codePoint: number;
    let leadSurrogate: number = null;

    // const bp = new BufferPointer(buf, offset);

    const setSurrogateComponent = () => {
        buf[offset] = 0xEF;
        buf[offset + 1] = 0xBF;
        buf[offset + 2] = 0xBD;
        offset += 3;
    };

    for (let i = 0; i < length; ++i) {
        codePoint = string.charCodeAt(i);

        // is surrogate component
        if (codePoint > 0xD7FF && codePoint < 0xE000) {
            // last char was a lead
            if (!leadSurrogate) {
                // no lead yet
                if (codePoint > 0xDBFF) {
                    // unexpected trail
                    setSurrogateComponent();
                    continue;
                } else if (i + 1 === length) {
                    // unpaired lead
                    setSurrogateComponent();
                    continue;
                }

                // valid lead
                leadSurrogate = codePoint;

                continue;
            }

            // 2 leads in a row
            if (codePoint < 0xDC00) {
                setSurrogateComponent();
                leadSurrogate = codePoint;
                continue;
            }

            // valid surrogate pair
            codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
        } else if (leadSurrogate) {
            // valid bmp char, but last char was a lead
            setSurrogateComponent();
        }

        leadSurrogate = null;

        // encode utf8
        if (codePoint < 0x80) {
            buf[offset++] = codePoint;
        } else if (codePoint < 0x800) {
            buf[offset] = codePoint >> 0x6 | 0xC0;
            buf[offset + 1] = codePoint & 0x3F | 0x80;
            offset += 2;
        } else if (codePoint < 0x10000) {
            buf[offset] = codePoint >> 0xC | 0xE0;
            buf[offset + 1] = codePoint >> 0x6 & 0x3F | 0x80;
            buf[offset + 2] = codePoint & 0x3F | 0x80;
            offset += 3;
        } else if (codePoint < 0x110000) {
            buf[offset] = codePoint >> 0x12 | 0xF0;
            buf[offset + 1] = codePoint >> 0xC & 0x3F | 0x80;
            buf[offset + 2] = codePoint >> 0x6 & 0x3F | 0x80;
            buf[offset + 3] = codePoint & 0x3F | 0x80;
            offset += 4;
        } else {
            throw new Error('Invalid code point');
        }
    }

    return offset;
}

export const encode = (string: string, units = Infinity) => {
    const bytes: number[] = [];
    const length = string.length;
    let codePoint: number;
    let leadSurrogate: number = null;

    for (let i = 0; i < length; ++i) {
        codePoint = string.charCodeAt(i);

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

const getStringFromCodes = (codes: number[]) => {
    return String.fromCharCode.apply(
        String,
        codes,
    );
};

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
const MAX_ARGUMENTS_LENGTH = 0x1000;

export const decode = (buf: Uint8Array, start = 0, end = buf.length) => {
    end = Math.min(buf.length, end);
    const codes: number[] = [];
    // const res: string[] = [];

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

        // if (codes.length >= MAX_ARGUMENTS_LENGTH - 4) {
        //     res.push(getStringFromCodes(codes));
        //     codes.length = 0;
        // }
    }

    // if (codes.length) {
    //     res.push(getStringFromCodes(codes));
    // }

    // return res.join('');
    return decodeCodePointsArray(codes);
}

const decodeCodePointsArray = (codePoints) => {
    const len = codePoints.length;
    if (len <= MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(String, codePoints); // avoid extra slice()
    }

    // Decode in chunks to avoid "call stack size exceeded".
    let res = '';
    // const res: string[] = [];
    let i = 0;
    while (i < len) {
        // res.push(String.fromCharCode.apply(
        //     String,
        //     codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
        // ));
        
        res += String.fromCharCode.apply(
            String,
            codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
        );
    }
    return res;
    // return res.join('');
}
