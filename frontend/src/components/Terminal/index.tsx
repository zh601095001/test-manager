import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';

interface TerminalComponentProps {
    input: string;
}

const TerminalComponent: React.FC<TerminalComponentProps> = ({ input }) => {
    const terminalRef = useRef<HTMLDivElement | null>(null);
    const terminalInstanceRef = useRef<Terminal | null>(null);

    useEffect(() => {
        if (terminalRef.current && !terminalInstanceRef.current) {
            const terminal = new Terminal();
            terminal.open(terminalRef.current);
            terminalInstanceRef.current = terminal;
        }
    }, []);

    useEffect(() => {
        if (terminalInstanceRef.current) {
            terminalInstanceRef.current.write(input);
        }
    }, [input]);

    return <div ref={terminalRef} style={{ height: '100%', width: '100%' }} />;
};

export default TerminalComponent;
