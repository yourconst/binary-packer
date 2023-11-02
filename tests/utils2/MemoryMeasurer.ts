function getHeapUsedSize() {
    return console?.['memory']?.usedJSHeapSize ?? process?.memoryUsage?.()?.heapUsed ?? 0;
}

export class MemoryMeasurer {
    private _startValue: number;

    start() {
        this._startValue = getHeapUsedSize();
        return this;
    }

    getValue() {
        return getHeapUsedSize() - this._startValue;
    }
}
