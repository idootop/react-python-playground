import { registerSW } from 'virtual:pwa-register';

import { useInit } from '@/services/store/useStore';

export const useInitAPP = () => {
  // APP 初始化
  useInit(() => {
    // 注册 service worker（自动更新）
    registerSW({ immediate: true });
  }, []);
};
