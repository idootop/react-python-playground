import { registerSW } from 'virtual:pwa-register';

import { useInit } from '@/services/store/useStore';

const initAPP = async () => {
  // 注册 service worker（自动更新）
  registerSW({ immediate: true });
};

export const useInitAPP = () => {
  useInit(() => {
    initAPP();
  }, []);
};
