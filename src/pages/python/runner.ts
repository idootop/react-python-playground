import { proxy, Remote, wrap } from 'comlink';

import pTimeout from '@/utils/p-timeout';

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
    const { stdout = console.log, stderr = console.error } = props ?? {};
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

  async run(
    code: string,
    props?: {
      /**
       * 运行超时时间，默认一分钟
       */
      timeout: number;
    },
  ) {
    await this.init();
    const { timeout = 60000 } = props ?? {};
    return pTimeout(this.runner!.run(code), timeout).catch(() => '❌ 运行超时');
  }

  dispose() {
    this.runner?.dispose();
    this.worker?.terminate();
    this.runner = undefined;
    this.worker = undefined;
  }
}

export const python = new PythonRunner();
