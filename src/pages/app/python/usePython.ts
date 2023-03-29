import { useEffect } from 'react';

import { store, useStore } from '@/services/store/useStore';
import { delay, jsonDecode, jsonEncode } from '@/utils/base';
import pTimeout from '@/utils/p-timeout';

import { onStdErr, onStdOut } from '../Outputs';
import { python } from './runner';

const kPythonStatesKey = 'kPythonStates';
interface PythonStates {
  loading: boolean;
  inited: boolean;
  running: boolean;
  outputs: {
    type: 'stdout' | 'stderr';
    msg: string;
  }[];
}

const getPythonStates = () =>
  jsonDecode(jsonEncode(store.get(kPythonStatesKey))) ?? {};

const loadPython = async () => {
  const isLoading = getPythonStates().loading;
  if (isLoading) {
    // 避免重复加载
    return;
  } else {
    store.set(kPythonStatesKey, {
      ...getPythonStates(),
      loading: true,
    });
  }
  const success = await python.init({
    stdout: (msg) => {
      onStdOut(msg);
      const datas = getPythonStates();
      store.set(kPythonStatesKey, {
        ...datas,
        outputs: [...datas.outputs, { msg, type: 'stdout' }],
      });
    },
    stderr: (msg) => {
      onStdErr(msg);
      const datas = getPythonStates();
      store.set(kPythonStatesKey, {
        ...datas,
        outputs: [...datas.outputs, { msg, type: 'stderr' }],
      });
    },
  });
  store.set(kPythonStatesKey, {
    ...getPythonStates(),
    loading: false,
    inited: success,
  });
};

export const interruptExecution = () => {
  python.interruptExecution();
  store.set(kPythonStatesKey, {
    ...getPythonStates(),
    running: false,
  });
};

export const usePython = () => {
  useEffect(() => {
    // 加载 Python worker runner
    loadPython();
  }, []);

  const [states, setStates] = useStore<PythonStates>(kPythonStatesKey);
  const { loading, inited, running, outputs } = states ?? {};

  const runPython = async (
    code: string,
    props?: {
      /**
       * 运行超时时间，默认 1h
       */
      timeout: number;
    },
  ) => {
    if (loading || !inited || running) {
      if (!loading && !inited) {
        // 重新加载 Python
        loadPython();
      }
      return 'loadPython';
    }
    setStates({
      ...getPythonStates(),
      running: true,
      outputs: [], //清空上次的输出
    });
    const { timeout = 60 * 60 * 1000 } = props ?? {};
    const start = Date.now();
    await pTimeout(python.run(code), timeout).catch(() => '❌ 运行超时');
    const time = Date.now() - start;
    await delay(100);
    onStdOut(`\nDone in ${time}ms\n`);
    setStates({
      ...getPythonStates(),
      running: false,
    });
  };

  const interruptExecution = () => {
    python.interruptExecution();
    setStates({
      ...getPythonStates(),
      running: false,
    });
  };

  return {
    inited,
    loading,
    running,
    outputs,
    runPython,
    loadPython,
    interruptExecution,
  };
};
