import { store, useStore } from '@/services/store/useStore';
import { isNotEmpty } from '@/utils/is';

import { Box } from './Box';
import { Center } from './Flex';

const kShowToast = 'kShowToast';
let preTimer: any = undefined;

export const showToast = (text: string, props?: { duration: number }) => {
  const { duration = 2000 } = props ?? {};
  clearTimeout(preTimer);
  store.set(kShowToast, text.trim());
  preTimer = setTimeout(() => {
    hideToast();
  }, duration);
};

export const hideToast = () => {
  store.set(kShowToast, undefined);
};

export const Toast = () => {
  const [text] = useStore(kShowToast);
  const show = isNotEmpty(text);

  return show ? (
    <Center
      width="100vw"
      top="18px"
      left="0"
      position="fixed"
      zIndex={10}
      pointerEvents="none"
    >
      <Center
        maxWidth="500px"
        padding="6px 20px"
        borderRadius="16px"
        background="#3B3B3B"
        color="#76ed50"
        boxShadow="0px 4px 6px rgba(40, 40, 40, 0.25)"
      >
        {text}
      </Center>
    </Center>
  ) : (
    <Box />
  );
};
