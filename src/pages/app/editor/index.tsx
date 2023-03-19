import './style.css';

import { python } from '@codemirror/lang-python';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import CodeMirror from '@uiw/react-codemirror';

const defaultCode = `# Python 3
print('Hello world')`;

export const CodeEditor = () => {
  return (
    <CodeMirror
      width="100%"
      height="100%"
      value={defaultCode}
      theme={vscodeDark}
      extensions={[python()]}
    />
  );
};
