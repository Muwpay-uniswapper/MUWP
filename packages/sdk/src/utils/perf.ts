export class PerfTimer {
  private checkpoints: Record<string, number> = {};

  start(label: string) {
    this.checkpoints[label] = performance.now();
  }

  stop(label: string): number {
    const start = this.checkpoints[label];
    if (typeof start === "undefined") {
      throw new Error(`Timer ${label} not started`);
    }
    const duration = performance.now() - start;
    this.checkpoints[label] = duration;
    return duration;
  }

  summary() {
    return { ...this.checkpoints };
  }
}

