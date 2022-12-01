import { performance } from 'perf_hooks';

export namespace Measuring {
    export class Timer {
        private startTimeHR: number;
        private startTime: number;

        start() {
            this.startTimeHR = performance.now();
            // this.startTime = Date.now();
            return this;
        }

        getDurationS() {
            return (performance.now() - this.startTimeHR) / 1e3;
        }

        getDurationMs() {
            return performance.now() - this.startTimeHR;
        }

        getDurationUs() {
            return (performance.now() - this.startTimeHR) * 1e3;
        }

        getDurationNs() {
            return (performance.now() - this.startTimeHR) * 1e6;
        }
    }

    export function buildShell<T extends any[] = any>(label: string, count: number, f: (...params: T) => any, ...params: T) {
        return {
            label,
            count,
            f,
            params,
        };
    }

    type Shell<T extends any[] = any[]> = ReturnType<typeof buildShell<T>>;

    type Measurement = {
        label: string;
        min: number;
        max: number;
        avg: number;
    };

    function printMeasurement(prefix: string, m: Measurement) {
        console.log(`${prefix}${m.label}. Avg: ${m.avg.toFixed(3)}, Max: ${m.max.toFixed(3)}, Min: ${m.min.toFixed(3)}`);
    }

    function printComparison(prefix: string, m1: Measurement, m2) {
        console.log(
            `${prefix}(${m1.label}/${m2.label}). Avg: ${(m1.avg / m2.avg).toFixed(3)}, Max: ${(m1.max / m2.max).toFixed(3)}, Min: ${(m1.min / m2.min).toFixed(3)}`,
        );
    }

    export function measureVoidSync<T extends any[] = any>({ label, count, f, params }: Shell<T>, logging = true) {
        const timer = new Timer().start();

        for (let i = 0; i < count; ++i) {
            f(...params);
        }

        const duration = timer.getDurationUs();

        if (logging) {
            console.log(`Measure: ${label}. Duration: ${duration.toFixed(3)} , Count: ${count}`, ...(params ? [', Parameters:', params] : []));
        }

        return duration;
    }

    export function compareVoidSync(label: string, count: number, shells: Shell[]) {
        const _s = shells.map(s => ({
            ...s,
            measurement: {
                min: Infinity,
                max: 0,
                avg: 0,
            },
        }));

        for (let i = 0; i < count; ++i) {
            for (const shell of _s) {
                const duration = measureVoidSync(shell, false);

                shell.measurement.min = Math.min(shell.measurement.min, duration / shell.count);
                shell.measurement.max = Math.max(shell.measurement.max, duration / shell.count);

                if (i) {
                    shell.measurement.avg = (shell.measurement.avg * i + (duration / shell.count)) / (i + 1);
                } else {
                    shell.measurement.avg = duration / shell.count;
                }
            }
        }

        console.log(`\n${label}\n\nMeasure:`);
        const s = _s.map(s => {
            const res = { label: s.label, ...s.measurement };
            printMeasurement('', res);
            return res;
        });


        console.log(`\n\nComparison:`);
        for (let i = 0; i < s.length - 1; ++i) {
            for (let j = i + 1; j < s.length; ++j) {
                printComparison('', s[i], s[j]);
            }

            console.log('');
        }

        return s;
    }
}
