import { Center } from '@/components/Flex';
import { Text } from '@/components/Text';
import { envs } from '@/utils/env';

import { useInitAPP } from './initAPP';

export const App = () => {
  useInitAPP();
  console.log('kTest', envs.kTest);
  return (
    <Center width="100%" height="100vh">
      <Center background={'pink'} size="200px">
        <Text>Hello world!</Text>
        <Text>{envs.kTest}</Text>
        <Text maxLines={1}>
          风急天高猿啸哀，渚清沙白鸟飞回。 无边落木萧萧下，不尽长江滚滚来。
        </Text>
        <img src="logo.svg" />
      </Center>
    </Center>
  );
};
