// @ts-ignore
importScripts(new URL('comlink', import.meta.url));

// @ts-ignore
importScripts('https://cdn.jsdelivr.net/pyodide/v0.22.1/full/pyodide.js');

export class PythonWorker {
  pyodide = undefined as any;
  async init(stdout?: (msg: string) => void, stderr?: (msg: string) => void) {
    // @ts-ignore
    this.pyodide = await loadPyodide({
      stdout: stdout ?? console.log,
      stderr: stderr ?? console.error,
    }).catch(() => {
      return undefined;
    });
    return this.pyodide !== undefined;
  }
  async run(code: string) {
    await this.pyodide.runPythonAsync(code);
  }
  dispose() {
    this.pyodide = undefined;
    throw new Error('Execution interrupted');
  }
}

// @ts-ignore
self.Comlink.expose(new PythonWorker());
