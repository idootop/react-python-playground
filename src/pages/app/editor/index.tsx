import './style.css';

import { python } from '@codemirror/lang-python';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import CodeMirror from '@uiw/react-codemirror';

const defaultPythonCode = `import time
import asyncio

async def main():
  for i in range(3):
    print(time.time())
    await asyncio.sleep(1)

main()`;

const extensions = [python()];

let pythonCode = defaultPythonCode;

export const getPythonCode = () => pythonCode;

export const CodeEditor = () => {
  return (
    <CodeMirror
      width="100%"
      height="100%"
      theme={vscodeDark}
      extensions={extensions}
      value={defaultPythonCode}
      onChange={(value) => {
        pythonCode = value;
      }}
    />
  );
};
