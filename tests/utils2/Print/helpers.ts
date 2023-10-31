export type RecursiveRequired<T> = Required<{
    [P in keyof T]: T[P] extends object | undefined ? RecursiveRequired<Required<T[P]>> : T[P];
}>;

export const lines = { v: '│', h: '─', tl: '┌', tr: '┐', ml: '├', mr: '┤', mt: '┬', mb: '┴', bl: '└', br: '┘', x: '┼' };

const colors = {
    default: '\x1b[0m',
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    purple: '\x1b[35m',
    lightblue: '\x1b[36m',
};

export type Color = keyof typeof colors;
export type Align = 'left' | 'center' | 'right' | 'number';


export function applyColor(c: Color, s: string) {
    return colors[c] + s;
}

export function getConsoleWidth(s: string) {
    return s.replace(/\x1b\[([0-9]{1,2})m/ig, '').length;
}

export function applyAlign(align: Align, value: string, width: number, widthDecimals = 0) {
    if (align === 'number' && !widthDecimals) {
        align = 'right';
    }

    const consoleLength = getConsoleWidth(value);

    const wmvl = Math.max(0, width - consoleLength);

    if (align === 'left') {
        return value + ' '.repeat(wmvl);
    } else
    if (align === 'right') {
        return ' '.repeat(wmvl) + value;
    } else
    if (align === 'center') {
        return ' '.repeat((wmvl) >> 1) + value + ' '.repeat(Math.ceil((wmvl) / 2));
    } else {
        const parts = value.split('.');

        return applyAlign('right', parts[0], width - 1 - widthDecimals) +
            (parts[1] ?
                '.' + applyAlign('left', parts[1], widthDecimals) :
                ' '.repeat(1 + widthDecimals));
    }
}

export type Property = string | number | symbol;

export type Order = 'ASC' | 'DESC';
export interface OrderBy<T extends Property> {
    field: T;
    order?: Order;
}

export function sortByOrder<O extends Record<string, any>>(array: O[], order: OrderBy<keyof O>[], mutate = false) {
    if (!mutate) {
        array = array.slice();
    }

    const os = order.map(o => ({
        f: o.field,
        o: o.order === 'DESC' ? -1 : 1,
    }));

    return array.sort((a, b) => {
        for (const o of os) {
            const av = a[o.f];
            const bv = b[o.f];

            let res = o.o;

            if (typeof av === 'number') {
                res *= av - bv;
            } else {
                res *= av > bv ? 1 : av === bv ? 0 : -1;
            }

            if (res !== 0) {
                return res;
            }
        }
        return 0;
    });
}
