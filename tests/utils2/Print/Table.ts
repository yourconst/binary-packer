import { Align, Color, OrderBy, Property, RecursiveRequired, applyAlign, applyColor, getConsoleWidth, lines, sortByOrder } from "./helpers";

export interface INumberOptions {
    decimals?: number;
}

export interface IHeaderOptions {
    name?: string;
    color?: Color;
    align?: Align;
}
export type THeaderOptions = IHeaderOptions | string;

export interface IColumnOptions<P extends Property> {
    field: P;
    header?: THeaderOptions;
    color?: Color;
    align?: Align;
    number?: INumberOptions;
}
export type TColumnOptions<P extends Property> = IColumnOptions<P> | P;
export class Column<O extends Record<string, any>, P extends keyof O = keyof O> {
    static parseNumberOptions(o?: INumberOptions, ref?: INumberOptions): RecursiveRequired<INumberOptions> {
        return {
            decimals: <any> undefined,
            ...ref,
            ...o,
        };
    }

    readonly field: P;
    readonly header: RecursiveRequired<IHeaderOptions>;
    readonly align: Align;
    readonly color: Color;
    readonly number: RecursiveRequired<INumberOptions>;
    _width = 0;
    _widthDecimals = 0;

    readonly cells: string[] = [];

    constructor(readonly table: Table<O>, options: TColumnOptions<P>) {
        const o: IColumnOptions<P> = typeof options === 'object' ? options: { field: <P> options };

        this.field = o.field;
        this.header = Header.parseOptions(o.header);
        this.header.name ||= <string> this.field;
        
        this.align = o.align ?? (typeof this.table.rows[0][this.field] === 'number' ? 'number' : 'left');
        this.color = o.color ?? (this.isNumber ? 'yellow' : 'default');
        this.number = Column.parseNumberOptions(o.number);

        this._width = getConsoleWidth(this.header.name);
    }

    get isNumber() { return this.align === 'number'; }

    get width() {
        return this._width + (this._widthDecimals > 0 ? 1 : 0);
    }

    update(o: O) {
        const v = o[this.field];
        const s: string = (typeof v === 'number' && typeof this.number.decimals === 'number') ?
            (+v.toFixed(this.number.decimals)).toString() :
            v.toString();

        if (this.isNumber) {
            const parts = s.split('.');
            if (typeof this.number.decimals === 'number') {
                parts[1] = parts[1]?.slice(0, this.number.decimals);
            }
            this._widthDecimals = Math.max(this._widthDecimals, getConsoleWidth(parts[1] || ''));
            this._width = Math.max(this._width, getConsoleWidth(parts[0]) + this._widthDecimals);
            this.cells.push(parts[1] ? parts.join('.') : parts[0]);
        } else {
            this._width = Math.max(this._width, getConsoleWidth(s));
            this.cells.push(s);
        }
    }

    get isFirst() {
        return this.table.columns[0] === this;
    }

    get isLast() {
        return this.table.columns.at(-1) === this;
    }

    printHeader(buffer: string[]) {
        buffer.push(
            applyColor(this.header.color,
                applyAlign(this.header.align, this.header.name, this.width),
            ),
        );
    }

    print(buffer: string[], i: number, isLastRow: boolean) {
        buffer.push(
            applyColor(this.color,
                applyAlign(this.align, this.cells[i], this.width, this._widthDecimals),
            ),
        );
    }
}

export class Header<O extends Record<string, any>, P extends keyof O = keyof O> {
    static parseOptions(o?: THeaderOptions): RecursiveRequired<IHeaderOptions> {
        if (typeof o === 'string') {
            return {
                name: o,
                align: 'center',
                color: 'default',
            };
        }
        return {
            name: '',
            align: 'center',
            color: 'default',
            ...o,
        };
    }

    options: RecursiveRequired<IHeaderOptions>;

    constructor(readonly table: Table<O>, options?: THeaderOptions) {
        this.options = Header.parseOptions(options);
    }

    get minWidth() {
        return getConsoleWidth(this.options.name || '') + 2 * this.table.border.indentH + 2;
    }

    get hasName() {
        return !!this.options.name;
    }

    print(buffer: string[]) {
        const color = applyColor(this.table.border.color, '');
        const ih = this.table.border.indentH;

        if (this.hasName) {
            this.table.printBorderLine(buffer, lines.tl, lines.tr);
            buffer.push(
                color + lines.v,
                applyColor(this.options.color, applyAlign(this.options.align, this.options.name, this.table.width - 2)),
                color + lines.v,
                '\n',
            );
        }

        this.table.printBorderColumnsLine(
            buffer,
            this.hasName ? lines.ml : lines.tl,
            lines.mt,
            this.hasName ? lines.mr : lines.tr,
        );

        buffer.push(color + lines.v);
        for (const c of this.table.columns) {
            buffer.push(' '.repeat(ih));
            c.printHeader(buffer);
            buffer.push(' '.repeat(ih));
            buffer.push(color + lines.v);
        }
        buffer.push('\n');

        this.table.printBorderColumnsLine(buffer, lines.ml, lines.x, lines.mr);
    }
}

export interface IBorderOptions {
    color?: Color;
    indentH?: number;
};

export interface ITableOptions<P extends Property> {
    header?: THeaderOptions;
    columns?: TColumnOptions<P>[];
    border?: IBorderOptions;
    order?: OrderBy<P>[];
}
export type TTableOptions<P extends Property> = ITableOptions<P> | string;
export class Table<O extends Record<string, any>, P extends keyof O = keyof O> {
    static print<O extends Record<string, any>>(rows: O[], options: TTableOptions<keyof O>) {
        new Table(rows, options).update().print();
    }

    readonly header: Header<O>;
    readonly columns: Column<O>[];
    readonly border: RecursiveRequired<IBorderOptions>;

    constructor(readonly rows: O[], options: TTableOptions<P> = {}) {
        if (typeof options === 'string') {
            options = {header: {name: options}};
        }

        if (options.order) {
            sortByOrder(this.rows, options.order, true);
        }

        this.header = new Header(this, options.header);
        
        if (!options.columns) {
            options.columns = <P[]>Object.keys(this.rows[0]);
        }

        this.columns = options.columns.map(c => new Column(this, c));

        this.border = {
            color: 'default',
            indentH: 1,
            ...options.border,
        };
    }

    get width() {
        return this.columns.reduce((w, c) => w + c.width, 1 + this.columns.length * (1 + 2 * this.border.indentH));
    }

    update() {
        for (const r of this.rows) {
            for (const c of this.columns) {
                c.update(r);
            }
        }

        if (this.width < this.header.minWidth) {
            const dw = Math.ceil((this.header.minWidth - this.width) / this.columns.length);

            for (const c of this.columns) {
                c._width += dw;
            }
        }

        return this;
    }

    printBorderLine(buffer: string[], left: string, right: string, middle = lines.h) {
        const color = applyColor(this.border.color, '');
        buffer.push(color + left, middle.repeat(this.width - 2), right, '\n');
    }

    printBorderColumnsLine(buffer: string[], left: string, x: string, right: string, middle = lines.h) {
        const color = applyColor(this.border.color, '');
        buffer.push(color + left);
        for (const c of this.columns) {
            buffer.push(middle.repeat(2 * this.border.indentH + c.width));
            buffer.push(x);
        }
        buffer[buffer.length-1] = right;
        buffer.push('\n');
    }

    print(buffer: string[] = []) {
        this.header.print(buffer);

        const color = applyColor(this.border.color, '');
        const ih = this.border.indentH;
        
        for (let i=0; i<this.rows.length; ++i) {
            const isLastRow = i > this.rows.length - 2;

            buffer.push(color + lines.v);
            for (const c of this.columns) {
                buffer.push(' '.repeat(ih));
                c.print(buffer, i, isLastRow);
                buffer.push(' '.repeat(ih));
                buffer.push(color + lines.v);
            }
            buffer.push('\n');

            this.printBorderColumnsLine(buffer, isLastRow ? lines.bl : lines.ml, isLastRow ? lines.mb : lines.x, isLastRow ? lines.br : lines.mr);
        }

        console.log(buffer.join(''));

        return this;
    }
}
