import { registerSW } from 'virtual:pwa-register';

import { useInit } from '@/services/store/useStore';

import { python } from './python/runner';

const initAPP = async () => {
  // 注册 service worker（自动更新）
  registerSW({ immediate: true });
  await python.run(
    `
import time
import asyncio

async def main():
    print("Start")
    while True:
      await asyncio.sleep(1)
      print(time.time())
    print("End")

await main()
`,
    { timeout: 10000 },
  );
  await python.dispose();
  console.log('finished');
};

export const useInitAPP = () => {
  useInit(() => {
    initAPP();
  }, []);
};
