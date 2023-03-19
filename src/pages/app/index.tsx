import { Center, Column, Expand, Row } from '@/components/Flex';
import { envs } from '@/utils/env';

import { CodeEditor } from './editor';
import { useInitAPP } from './initAPP';

export const App = () => {
  useInitAPP();
  console.log('kTest', envs.kTest);

  const $RUN = (
    <Center
      background="#76ed50"
      padding="6px 12px"
      borderRadius="8px"
      cursor="pointer"
    >
      <span
        style={{
          fontWeight: '600',
          fontSize: '16px',
          color: '#000',
        }}
      >
        Run
      </span>
    </Center>
  );

  const $LOGO = (
    <Row cursor="pointer">
      <img src="logo.svg" height="24px" />
      <span
        style={{
          marginLeft: '4px',
          fontWeight: '600',
          fontSize: '16px',
          color: '#76ed50',
        }}
      >
        Python3
      </span>
    </Row>
  );

  return (
    <Column width="100%" height="100vh">
      <Row
        width="100%"
        padding="16px 16px 16px 10px"
        background="#0c0c0d"
        marginBottom="10px"
      >
        {$LOGO}
        <Expand />
        {$RUN}
      </Row>
      <Expand width="100%">
        <CodeEditor />
      </Expand>
    </Column>
  );
};
