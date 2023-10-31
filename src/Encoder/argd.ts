const argv = globalThis.process?.argv?.slice(2) || [];

export const rawArgd: Record<string, boolean | string | number> = Object.fromEntries(
    argv.map(a => a.replace(/^-{1,2}/, '').split(/^([^=]+)=(.*)/).filter(p => p)).map(([key, value]) => {
        let rv: boolean | string | number = value;

        if (!rv || (rv === 'true')) {
            rv = true;
        } else
        if (rv === 'false') {
            rv = false;
        } else
        if (/^d+$/.test(rv)) {
            rv = +rv;
        }

        return [key, rv];
    })
);

export const argd: {
    CustomBinaryBuffer: boolean;
    testRepeatCount: number;
    testCount: number;
    gcRequired: boolean;
} = {
    CustomBinaryBuffer: !!(rawArgd['cbb'] || rawArgd['CBB'] || rawArgd['CustomBinaryBuffer']),
    testRepeatCount: +(rawArgd['trc'] || rawArgd['TRC'] || rawArgd['testRepeatCount'] || 0),
    testCount: +(rawArgd['tc'] || rawArgd['TC'] || rawArgd['testCount'] || 0),
    gcRequired: !!(rawArgd['gc'] || rawArgd['GC'] || rawArgd['gcRequired']),
};
