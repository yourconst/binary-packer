import { performance } from 'perf_hooks';

export class Timer {
    private _startTimeHR: number;
    // private startTime: number;

    start() {
        this._startTimeHR = performance.now();
        // this.startTime = Date.now();
        return this;
    }

    getDurationS() {
        return (performance.now() - this._startTimeHR) / 1e3;
    }

    getDurationMs() {
        return (performance.now() - this._startTimeHR);
    }

    getDurationUs() {
        return (performance.now() - this._startTimeHR) * 1e3;
    }

    getDurationNs() {
        return (performance.now() - this._startTimeHR) * 1e6;
    }
}
