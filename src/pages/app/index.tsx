import { Center, Column, Expand, Row } from '@/components/Flex';
import { Spinner } from '@/components/Spinner';
import { showToast, Toast } from '@/components/Toast';

import { CodeEditor, getPythonCode } from './editor';
import { useInitAPP } from './initAPP';
import { closeOutputs, Outputs, showOutputs } from './Outputs';
import { usePython } from './python/usePython';

export const App = () => {
  useInitAPP();

  const $LOGO = (
    <Row
      cursor="pointer"
      userSelect="none"
      onClick={() =>
        window.open(
          'https://github.com/idootop/react-python-playground',
          '_blank',
        )
      }
    >
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
    <>
      <Toast />
      <Loading />
      <Outputs />
      <Column width="100%" height="100vh">
        <Row
          width="100%"
          padding="16px 16px 16px 10px"
          background="#0c0c0d"
          marginBottom="10px"
        >
          {$LOGO}
          <Expand />
          <RUN />
        </Row>
        <Expand width="100%">
          <CodeEditor />
        </Expand>
      </Column>
    </>
  );
};

const RUN = () => {
  const python = usePython();

  return (
    <Center
      background="#76ed50"
      padding="6px 12px"
      borderRadius="6px"
      cursor="pointer"
      userSelect="none"
      onClick={async () => {
        showOutputs(); // 打开弹窗
        const result = await python.runPython(getPythonCode());
        if (result === 'loadPython') {
          closeOutputs();
          showToast('Python not loaded :(');
        }
      }}
    >
      <span
        style={{
          fontWeight: '600',
          fontSize: '16px',
          color: '#000',
        }}
      >
        {python.running ? 'Executing...' : 'Run'}
      </span>
    </Center>
  );
};

const Loading = () => {
  const python = usePython();

  return (
    <Center
      width="100vw"
      height="100vh"
      position="fixed"
      top="0"
      left="0"
      zIndex={2}
      background="rgba(0,0,0,0.3)"
      visibility={python.inited ? 'hidden' : 'visible'}
    >
      <Spinner />
    </Center>
  );
};
