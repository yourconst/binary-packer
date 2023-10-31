import { Helpers } from "./Helpers";
import { Print } from "./Print";
import { Timer } from "./Timer";

export namespace Measuring {
    export class Measurement {
        min = Infinity;
        max = 0;
        amount = 0;
        count = 0;

        constructor(public label?: string) {}

        get avg() {
            return this.amount / this.count;
        }

        reset() {
            this.min = Infinity;
            this.max = 0;
            this.amount = 0;
            this.count = 0;

            return this;
        }

        update(v: number, count = 1) {
            this.max = Math.max(this.max, v / count);
            this.min = Math.min(this.min, v / count);
            this.amount += v;
            this.count += count;

            return this;
        }

        concat(m: Measurement) {
            this.max = Math.max(this.max, m.max);
            this.min = Math.min(this.min, m.min);
            this.amount += m.amount;
            this.count += m.count;

            return this;
        }

        toJSON(decimals = 100, mult = 1) {
            return {
                label: this.label,
                avg: +(this.avg * mult).toFixed(decimals),
                min: +(this.min * mult).toFixed(decimals),
                max: +(this.max * mult).toFixed(decimals),
                amount: +(this.amount * mult).toFixed(decimals),
                count: +(this.count * mult).toFixed(decimals),
            };
        }
    }

    export class MeasureShell<T extends any[] = any, R = any> {
        readonly measurement: Measurement;

        constructor(
            readonly label: string,
            readonly f: (...params: T) => R,
            readonly getParams: () => T,
        ) {
            this.measurement = new Measurement(this.label);
        }

        warmup(count: number) {
            for (let i=0; i<count; ++i) {
                this.f(...this.getParams());
            }

            return this;
        }

        measure(count: number) {
            globalThis.gc?.();
            const t = new Timer();
            const m = new Measurement();

            for (let i=0; i<count; ++i) {
                t.start();
                this.f(...this.getParams());
                m.update(t.getDurationMs());
            }

            this.measurement.concat(m);

            return m;
        }

        measureBulk(count: number) {
            globalThis.gc?.();
            const t = new Timer().start();

            for (let i=0; i<count; ++i) {
                this.f(...this.getParams());
            }

            this.measurement.update(t.getDurationMs(), count);

            return this;
        }

        static printOrdered(ms: MeasureShell[], orderBy: 'avg' | 'min' | 'max' = 'avg', order: 'ASC' | 'DESC' = 'DESC') {
            const mult = order === 'ASC' ? 1 : -1;
            ms.sort((a, b) => mult * (a.measurement[orderBy] - b.measurement[orderBy]));

            const table = Object.fromEntries(ms.map(m => ([m.label, m.measurement])));

            console.table(table, ['avg', 'min', 'max', 'count']);
        }
    }

    export class Measurer {
        constructor(readonly label: string, readonly shells: MeasureShell[]) {}

        reset() {
            for (const shell of this.shells) {
                shell.measurement.reset();
            }

            return this;
        }

        warmup(repeatCount: number, count: number) {
            for (let i=0; i<repeatCount; ++i) {
                for (const shell of this.shells) {
                    shell.warmup(count);
                }
            }

            return this;
        }

        async warmupAsync(repeatCount: number, count: number, delay = 100) {
            for (let i=0; i<repeatCount; ++i) {
                for (const shell of this.shells) {
                    shell.warmup(count);
                }

                await Helpers.sleep(delay);
            }

            return this;
        }

        measure(repeatCount: number, count: number) {
            for (let i=0; i<repeatCount; ++i) {
                for (const shell of this.shells) {
                    shell.measure(count);
                }
            }

            return this;
        }

        measureBulk(repeatCount: number, count: number) {
            for (let i=0; i<repeatCount; ++i) {
                for (const shell of this.shells) {
                    shell.measureBulk(count);
                }
            }

            return this;
        }

        printResultOrdered({
            resolution = 'us',
            decimals = 3,
            orderBy = 'avg',
            order = 'ASC',
        }: {
            resolution?: 's' | 'ms' | 'us' | 'ns';
            decimals?: number;
            orderBy?: 'avg' | 'min' | 'max';
            order?: 'ASC' | 'DESC';
        } = {}) {
            const mult = order === 'ASC' ? 1 : -1;
            this.shells.sort((a, b) => mult * (a.measurement[orderBy] - b.measurement[orderBy]));
            
            const resMult = { s: 0.001, ms: 1, us: 1000, ns: 1000000 }[resolution];

            const base = this.shells[0].measurement.toJSON(decimals, resMult);
            const results = this.shells.map(s => {
                const r = s.measurement.toJSON(decimals, resMult);

                base.avg = Math.min(base.avg, r.avg);
                base.min = Math.min(base.min, r.min);
                base.max = Math.min(base.max, r.max);

                return r;
            });

            Print.table(results.map(r => ({
                ...r,
                'avg%': +(r.avg/base.avg * 100 - 100).toFixed(decimals),
                'min%': +(r.min/base.min * 100 - 100).toFixed(decimals),
                'max%': +(r.max/base.max * 100 - 100).toFixed(decimals),
            })), {
                header: {
                    name: `${this.label}. Time resolution: ${resolution}. Per unit count: ${this.shells[0].measurement.count}`,
                    color: 'yellow',
                },
                columns: ['label', 'avg', {field:'avg%', color:'green'}, 'min', {field:'min%', color:'green'}, 'max', {field:'max%', color:'green'}],
                order: [{ field: 'avg' }, { field: 'max' }, { field: 'min' }],
            });

            return this;
        }
    }
}
