import { useEffect } from 'react';

import { store, useProvider, useStore } from '@/services/store/useStore';
import pTimeout from '@/utils/p-timeout';

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

const loadPython = async () => {
  const isLoading = store.get(kPythonStatesKey)!.loading;
  if (isLoading) {
    // 避免重复加载
    return;
  } else {
    store.set(kPythonStatesKey, {
      ...store.get(kPythonStatesKey)!,
      loading: true,
    });
  }
  const success = await python.init({
    stdout: (msg) => {
      console.log(msg);
      const datas = store.get(kPythonStatesKey)!;
      store.set(kPythonStatesKey, {
        ...datas,
        outputs: [...datas.outputs, { msg, type: 'stdout' }],
      });
    },
    stderr: (msg) => {
      console.error(msg);
      const datas = store.get(kPythonStatesKey)!;
      store.set(kPythonStatesKey, {
        ...datas,
        outputs: [...datas.outputs, { msg, type: 'stderr' }],
      });
    },
  });
  store.set(kPythonStatesKey, {
    ...store.get(kPythonStatesKey)!,
    loading: false,
    inited: success,
  });
};

export const usePython = () => {
  useProvider<PythonStates>(kPythonStatesKey, {
    loading: false,
    inited: false,
    running: false,
    outputs: [],
  });

  useEffect(() => {
    // 加载 Python worker runner
    loadPython();
  }, []);

  const [states, setStates] = useStore<PythonStates>(kPythonStatesKey);
  const { loading, inited, running, outputs } = states;

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
      return;
    }
    setStates({
      ...store.get(kPythonStatesKey)!,
      running: true,
      outputs: [], //清空上次的输出
    });
    const { timeout = 60 * 60 * 1000 } = props ?? {};
    await pTimeout(python.run(code), timeout).catch(() => '❌ 运行超时');
    setStates({
      ...store.get(kPythonStatesKey)!,
      running: false,
    });
  };

  const interruptExecution = () => {
    python.interruptExecution();
    setStates({
      ...store.get(kPythonStatesKey)!,
      running: false,
    });
  };

  return {
    running,
    outputs,
    runPython,
    loadPython,
    interruptExecution,
  };
};
