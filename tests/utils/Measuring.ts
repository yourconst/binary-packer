export namespace Measuring {
    export class Timer {
        private startTimeHR: number;
        private startTime: number;

        start() {
            // performance.mark('1');
            this.startTimeHR = performance.now();
            // this.startTime = Date.now();
            return this;
        }

        getDuration(decimals = 0) {
            // return performance.measure('1', '1');.duration;
            return +(performance.now() - this.startTimeHR).toFixed(decimals);
        }

        log(label: string, decimals = 0) {
            const duration = this.getDuration(decimals);

            console.log(`${label}. Duration: ${duration}`);

            return duration;
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
        console.log(`${prefix}${m.label}. Avg: ${m.avg.toFixed(3)}, Max: ${m.max}, Min: ${m.min}`);
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

        const duration = timer.getDuration(3);

        // const duration = timer.getDuration(3);

        if (logging) {
            console.log(`Measure: ${label}. Duration: ${duration} , Count: ${count}`, ...(params ? [', Parameters:', params] : []));
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

                shell.measurement.min = Math.min(shell.measurement.min, duration);
                shell.measurement.max = Math.max(shell.measurement.max, duration);

                if (i) {
                    shell.measurement.avg = (shell.measurement.avg * i + duration) / (i + 1);
                } else {
                    shell.measurement.avg = duration;
                }
            }
        }

        const s = _s.map(s => {
            const res = { label: s.label, ...s.measurement };
            printMeasurement(`Measure: ${label}.`, res);
            return res;
        });

        console.log('');
        
        for (let i = 0; i < s.length; ++i) {
            for (let j = i + 1; j < s.length; ++j) {
                printComparison(`Comparison: ${label}.`, s[i], s[j]);
            }

            console.log('');
        }

        return s;
    }
}
