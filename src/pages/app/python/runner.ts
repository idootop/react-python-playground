import { proxy, Remote, wrap } from 'comlink';

import type { PythonWorker } from './worker';

class PythonRunner {
  private worker?: Worker;
  private runner?: Remote<PythonWorker>;

  get inited() {
    return this.worker && this.runner;
  }

  async init(props?: {
    stdout?: (msg: string) => void;
    stderr?: (msg: string) => void;
  }): Promise<boolean> {
    if (this.inited) return true;
    const { stdout = console.log, stderr = stdout } = props ?? {};
    try {
      this.worker = new Worker(new URL('./worker.ts', import.meta.url));
      this.runner = wrap<PythonWorker>(this.worker);
      return await this.runner.init(
        proxy((msg: string) => {
          stdout(msg);
        }),
        proxy((msg: string) => {
          stderr(msg);
        }),
      );
    } catch (_) {
      return false;
    }
  }

  async run(code: string) {
    await this.init();
    return await this.runner!.run(code);
  }

  /**
   * 中断执行
   */
  interruptExecution() {
    this.runner?.interruptExecution();
  }

  dispose() {
    this.interruptExecution();
    this.runner?.dispose();
    this.worker?.terminate();
    this.runner = undefined;
    this.worker = undefined;
  }
}

export const python = new PythonRunner();
