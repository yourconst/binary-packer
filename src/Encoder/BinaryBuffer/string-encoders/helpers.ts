// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
const MAX_ARGUMENTS_LENGTH = 0x1000;

export const decodeCodePointsArray = (codePoints: number[] | Uint8Array | Uint16Array) => {
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
