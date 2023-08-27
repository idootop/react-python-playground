import 'xterm/css/xterm.css';

import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';

import { Box } from '@/components/Box';
import { Center, Column, Expand, Row } from '@/components/Flex';
import { store, useStore } from '@/services/store/useStore';

import { interruptExecution } from './python/usePython';

let _terminal: Terminal;
const kShowTerminal = 'kShowTerminal';

export const showOutputs = () => {
  // 清空输出
  _terminal.clear();
  // 打开弹窗
  store.set(kShowTerminal, true);
};

export const closeOutputs = () => {
  // 终止Python
  interruptExecution();
  // 关闭弹窗
  store.set(kShowTerminal, false);
};

export const onStdOut = (stdout) => {
  _terminal.writeln('\x1b[32m' + stdout + '\x1b[0m');
};

export const onStdErr = (stderr) => {
  _terminal.writeln('\x1b[31m' + stderr + '\x1b[0m');
};

export const Outputs = () => {
  const [showing = false] = useStore(kShowTerminal);
  return (
    <Column
      position="fixed"
      top="0"
      left="0"
      zIndex={2}
      width="100vw"
      height="100vh"
      justifyContent="center"
      background="rgba(0,0,0,0.4)"
      visibility={showing ? 'visible' : 'hidden'}
    >
      <Row width="100%" color="white" padding="0 20px" maxWidth="1024px">
        <Expand />
        <Center
          padding="10px"
          background="#000"
          borderRadius="50%"
          color="#76ed50"
          border="1px solid #76ed50"
          cursor="pointer"
          onClick={closeOutputs}
        >
          <IconsClose />
        </Center>
      </Row>
      <Column width="100%" height="70vh" padding="20px" maxWidth="1024px">
        <Box
          width="100%"
          height="100%"
          padding="20px"
          background="#000"
          border="1px solid #76ed50"
        >
          <XTerminal />
        </Box>
      </Column>
    </Column>
  );
};

const IconsClose = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 8L40 40"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 40L40 8"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const XTerminal = () => {
  const terminalRef = useRef<any>();

  useEffect(() => {
    _terminal = new Terminal();
    const fitAddon = new FitAddon();
    const linkAddon = new WebLinksAddon();
    _terminal.loadAddon(fitAddon);
    _terminal.loadAddon(linkAddon);

    _terminal.open(terminalRef.current!);
    fitAddon.fit();

    return () => {
      _terminal!.dispose();
    };
  }, []);

  return (
    <div
      className="hide-scrollbar"
      ref={terminalRef}
      style={{
        width: '100%',
        height: '100%',
        overflowY: 'scroll',
      }}
    />
  );
};
