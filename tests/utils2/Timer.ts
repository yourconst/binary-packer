import { performance } from 'perf_hooks';

const perf = globalThis?.performance ?? performance;

export class Timer {
    private _startTimeHR: number;
    // private startTime: number;

    start() {
        this._startTimeHR = perf.now();
        // this.startTime = Date.now();
        return this;
    }

    getDurationS() {
        return (perf.now() - this._startTimeHR) / 1e3;
    }

    getDurationMs() {
        return (perf.now() - this._startTimeHR);
    }

    getDurationUs() {
        return (perf.now() - this._startTimeHR) * 1e3;
    }

    getDurationNs() {
        return (perf.now() - this._startTimeHR) * 1e6;
    }
}
