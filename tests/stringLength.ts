import { createCycleIndexRunner, randString, Measuring, randInt } from './utils';

const f1 = (string: string) => {
    let byteLength = 0;
    const length = string.length;
    let leadSurrogate = 0;
    let codePoint: number;

    for (let i = 0; i < length; ++i) {
        codePoint = string.charCodeAt(i);

        // is surrogate component
        if (codePoint > 0xD7FF && codePoint < 0xE000) {
            if (!leadSurrogate) {
                if (codePoint > 0xDBFF) {
                    byteLength += 3;
                    continue;
                } else if (i + 1 === length) {
                    byteLength += 3;
                    continue;
                }

                leadSurrogate = codePoint;

                continue;
            }

            if (codePoint < 0xDC00) {
                byteLength += 3;
                leadSurrogate = codePoint;
                continue;
            }

            codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
        } else if (leadSurrogate) {
            byteLength += 3;
        }

        leadSurrogate = 0;

        // encode utf8
        if (codePoint < 0x80) {
            byteLength += 1;
        } else if (codePoint < 0x800) {
            byteLength += 2;
        } else if (codePoint < 0x10000) {
            byteLength += 3;
        } else if (codePoint < 0x110000) {
            byteLength += 4;
        } else {
            throw new Error('Invalid code point');
        }
    }

    return byteLength;
};

const f2 = (string) => {
    var len = 0,
        c = 0;
    for (var i = 0; i < string.length; ++i) {
        c = string.charCodeAt(i);
        if (c < 128)
            len += 1;
        else if (c < 2048)
            len += 2;
        else if ((c & 0xFC00) === 0xD800 && (string.charCodeAt(i + 1) & 0xFC00) === 0xDC00) {
            ++i;
            len += 4;
        } else
            len += 3;
    }
    return len;
};

const f3 = (s: string) => {
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

const f31 = (s: string) => {
    let n = 0;
    for (let i = 0, l = s.length; i < l; ++i) {
        const hi = s.charCodeAt(i);
        if (hi < 0x0080) { //[0x0000, 0x007F]
            n += 1;
        } else if (hi < 0x0800) { //[0x0080, 0x07FF]
            n += 2;
        } else if (hi < 0xD800) { //[0x0800, 0xD7FF]
            n += 3;
        } else if (hi < 0xDC00) { //[0xD800, 0xDBFF]
            const lo = s.charCodeAt(++i);
            if (i < l && lo >= 0xDC00 && lo <= 0xDFFF) { //followed by [0xDC00, 0xDFFF]
                n += 4;
            }
        } else if (0xE000 < hi){ //[0xE000, 0xFFFF]
            n += 3;
        }
    }
    return n;
};

const f4 = (str: string) => {
    let s = str.length;
    for (let i = s - 1; i >= 0; --i) {
        const code = str.charCodeAt(i);
        if (code > 0x007F && code <= 0x07FF) ++s;
        else if (code > 0x07FF && code <= 0xFFFF) s += 2;
        if (code >= 0xDC00 && code <= 0xDFFF) --i; //trail surrogate
    }

    return s;
};

const f41 = (str: string) => {
    let s = str.length;
    for (let i = s - 1; i >= 0; --i) {
        const code = str.charCodeAt(i);
        if (code < 0x0080) continue;
        if (code < 0x0800) ++s;
        else if (code <= 0xFFFF) s += 2;
        if (code >= 0xDC00 && code <= 0xDFFF) --i; //trail surrogate
    }

    return s;
};

const fs = [f1, f2, f3, f31, f4, f41]/* .reverse() */;

const strings = new Array(100).fill(1).map(() => randString(randInt(10, 100)));
const results = new Array(fs.length).fill(0);

// console.log(strings);

const groupCount = 100;
const count = 1e5;

const shells = fs.map((f, i) => {
    const getIndex = createCycleIndexRunner(strings.length);

    return Measuring.buildShell(f.name, count, () => { results[i] = f(strings[getIndex()]); });
});

Measuring.compareVoidSync('Length warmup 1', groupCount, shells);

console.log(results);

setTimeout(() => {
    Measuring.compareVoidSync('Length warmup 2', groupCount, shells);

    console.log(results);

    setTimeout(() => {
        Measuring.compareVoidSync('Length', groupCount, shells);

        console.log(results);
    }, 5000);
}, 5000);
