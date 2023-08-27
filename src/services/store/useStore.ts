import { useCallback, useEffect, useRef, useState } from 'react';

import { isNotEqual } from '@/utils/diff';

type GlobalStores = Record<
  string,
  { data: any; rebuilds: Record<string, () => void> }
>;

class Global {
  static key = 'global_store';

  private static get _(): { id: number; stores: GlobalStores } {
    if (typeof window === 'undefined') {
      return { id: 0, stores: {} };
    }
    if (window[Global.key]) {
      return window[Global.key] as any;
    }
    window[Global.key] = {
      id: 0,
      stores: {},
    };
    return window[Global.key];
  }

  static get id() {
    return Global._.id;
  }

  static set id(n: number) {
    Global._.id = n;
  }

  static get stores() {
    return Global._.stores;
  }
}

export const newId = () => (Global.id++).toString();
export const useId = () => useInit(() => newId());

class GlobalStore {
  get<T = any>(key: string): T | undefined {
    return Global.stores[key]?.data;
  }
  set(key: string, data: any) {
    if (Global.stores[key]) {
      if (isNotEqual(Global.stores[key].data, data)) {
        Global.stores[key].data = data;
        Object.values(Global.stores[key].rebuilds).forEach((rebuild) =>
          rebuild(),
        );
      }
    } else {
      Global.stores[key] = {
        data: data,
        rebuilds: {},
      };
    }
  }
  _addRebuildCallback(key: string, id: string, rebuild: () => void) {
    if (Global.stores[key]) {
      Global.stores[key].rebuilds[id] = rebuild;
    } else {
      Global.stores[key] = {
        data: undefined,
        rebuilds: {
          [id]: rebuild,
        },
      };
    }
  }
  _removeRebuildCallback(key: string, id: string) {
    if (Global.stores[key]) {
      delete Global.stores[key].rebuilds[id];
    }
  }
}

export const store = new GlobalStore();

/**
 * 初始化hook
 *
 * 此hook中的初始化函数会立即初始化，且只执行一次
 */
export const useInit = <T>(fn: () => T, deps?: any[]): T => {
  const ref = useRef<any>({
    result: 4041,
    deps: undefined,
  });
  if (ref.current.result === 404 || isNotEqual(ref.current.deps, deps)) {
    ref.current.result = fn();
    ref.current.deps = deps;
  }
  return ref.current.result;
};

export const useDispose = (fn: () => void) => {
  useEffect(() => {
    return fn;
  }, []);
};

export const useRebuild = () => {
  const [flag, setFlag] = useState(false);
  return useCallback(() => {
    setFlag(!flag);
  }, [flag]);
};

export const useRebuildRef = () => {
  const ref = useRef({
    rebuild: () => undefined as any,
  });
  const [flag, setFlag] = useState(false);
  ref.current.rebuild = () => {
    setFlag(!flag);
  };
  return ref;
};

export const useRefCallback = <T = any>(fn: any) => {
  const ref = useRef<T>();
  ref.current = fn;
  return ref;
};

export const useStore = <T = any>(
  key: string,
  data?: any,
  filter?: (state: T | undefined) => any,
): [T, (newData: T | undefined) => void, () => T | undefined] => {
  const ref = useRef({
    id: newId(),
    rebuild: undefined as any,
  });
  const currentData = () => [
    store.get(key),
    (newData) => {
      store.set(key, newData);
    },
    () => store.get(key),
  ];

  // 更新刷新回调
  const _rebuild = useRebuild();
  ref.current.rebuild = _rebuild;
  const memoFilterRef = useMemoFilter({
    filter,
    currentData,
    currentFilterData: () => store.get(key),
    immediately: false,
    onChange: () => {
      ref.current.rebuild();
    },
  });
  const rebuild = useCallback(() => {
    memoFilterRef.current.onChange();
  }, []);

  // 初始化数据
  useInit(() => {
    if (data) {
      store.set(key, data);
    }
  });

  // 注册刷新回调
  useInit(() => {
    store._addRebuildCallback(key, ref.current.id, rebuild);
  }, []);

  useEffect(() => {
    return () => {
      // 当组件卸载后，回收刷新回调
      store._removeRebuildCallback(key, ref.current.id);
    };
  }, []);

  return memoFilterRef.current.data ?? currentData();
};

export const useMemoFilter = <Q = any, F = Q>(props: {
  currentData?: () => Q | undefined;
  onChange?: (oldData: Q | undefined, newData: Q | undefined) => void;
  currentFilterData: () => F | undefined;
  filter?: (state: F | undefined) => any;
  immediately?: boolean;
}) => {
  const {
    currentData,
    currentFilterData,
    filter,
    onChange,
    immediately = true,
  } = props;
  const ref = useRef({
    inited: false,
    data: undefined as any,
    filterOld: undefined as any,
    onChange: undefined as any,
  });
  if (!ref.current.inited) {
    ref.current.data = currentData?.();
    ref.current.inited = true;
  }
  ref.current.onChange = () => {
    const _currentFilterData = currentFilterData();
    const oldData = ref.current.filterOld;
    const newData = filter?.(_currentFilterData as any);
    ref.current.filterOld = newData;
    if (!filter || isNotEqual(oldData, newData)) {
      const _currentData = currentData?.();
      onChange?.(ref.current.data, _currentData);
      ref.current.data = _currentData;
    }
  };
  if (immediately) {
    ref.current.onChange();
  }
  return ref;
};

export const useConsumer = <T = any>(
  key: string,
  filter?: (state: T | undefined) => any,
) => useStore(key, undefined, filter);

export const useProvider = <T>(key: string, data: T | undefined) => {
  useInit(() => {
    if (!Global.stores[key]) {
      // 只初始化一次
      store.set(key, data);
    }
  }, []);
};
