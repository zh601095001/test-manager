import React, {useState, useCallback, useEffect} from 'react';
import {Select, message} from 'antd';
import CodeMirror, {EditorView, lineNumbers, keymap} from '@uiw/react-codemirror';
import {javascript} from '@codemirror/lang-javascript';
import {python} from '@codemirror/lang-python';
import {StreamLanguage} from '@codemirror/language';
import {shell} from '@codemirror/legacy-modes/mode/shell';
import {Extension} from '@codemirror/state';
import {vscodeDark} from '@uiw/codemirror-themes-all';
import {defaultKeymap} from '@codemirror/commands';

const {Option} = Select;

interface CodeEditorFormProps {
    value?: string;
    onChange?: (value: string) => void;
    defaultLanguage?: string; // 默认脚本语言
    disableLanguageSwitch?: boolean; // 是否禁用语言切换
    onSave: ({code}: { code: string }) => Promise<any>
}

const getLanguageExtension = (language: string): Extension => {
    switch (language) {
        case 'python':
            return python();
        case 'shell':
            return StreamLanguage.define(shell);
        case 'javascript':
        default:
            return javascript({});
    }
};

const getShebang = (language: string): string => {
    switch (language) {
        case 'python':
            return '#!/bin/env python';
        case 'shell':
            return '#!/bin/bash'; // 为 shell 添加 Shebang
        case 'javascript':
            return '#!/bin/env node';
        default:
            return '';
    }
};

const CodeEditorForm: React.FC<CodeEditorFormProps> = ({
                                                           value = '',
                                                           onChange = () => null,
                                                           onSave,
                                                           defaultLanguage = 'javascript', // 默认脚本语言
                                                           disableLanguageSwitch = false // 是否禁用语言切换
                                                       }) => {
    const [language, setLanguage] = useState<string>(defaultLanguage);
    const [isSaving, setIsSaving] = useState<boolean>(false); // 新增的状态
    const [saveStatus, setSaveStatus] = useState<boolean>(true); // 保存状态
    const initialShebang = getShebang(language);
    const [codeValue, setCodeValue] = useState<string>(value || (initialShebang ? `${initialShebang}\n` : ''));
    useEffect(() => {
        const shebang = getShebang(language);
        if (value && !value.startsWith(shebang)) {
            setCodeValue(`${shebang}\n${value.trim()}`);
        } else {
            setCodeValue(value || `${shebang}\n`);
        }
    }, [value, language]);

    const handleLanguageChange = (newLanguage: string) => {
        setLanguage(newLanguage);
        const newShebang = getShebang(newLanguage);
        const currentShebang = getShebang(language);
        let newValue = codeValue;
        if (currentShebang && codeValue.startsWith(currentShebang)) {
            newValue = codeValue.replace(currentShebang, newShebang);
        } else {
            newValue = newShebang ? `${newShebang}\n${newValue.trim()}` : newValue;
        }
        onChange(newValue);
        setCodeValue(newValue);
        setSaveStatus(false); // 修改语言时显示未保存状态
    };

    const handleCodeChange = useCallback((val: string, viewUpdate: any) => {
        const shebang = getShebang(language);
        const currentFirstLine = val.split('\n')[0];
        if (shebang && currentFirstLine !== shebang) {
            if (currentFirstLine.startsWith('#!')) {
                // Replace existing shebang
                val = val.replace(currentFirstLine, shebang);
            } else {
                // Add shebang at the top
                val = `${shebang}\n${val}`;
            }
        }
        onChange(val);
        setCodeValue(val);
        setSaveStatus(false); // 输入代码时显示未保存状态
    }, [onChange, language]);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            message.loading({content: '保存中...', key: 'save'});
            // 调用后端接口保存代码
            await onSave({code: codeValue})
            message.success({content: '代码保存成功!', key: 'save', duration: 2});
            setSaveStatus(true); // 保存成功后显示已保存状态
        } catch (error) {
            message.error({content: '保存失败!', key: 'save', duration: 2});
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault();
                handleSave();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [codeValue]);

    return (
        <div>
            <div style={{display: "flex", alignItems: "center", marginBottom: 10}}>
                <Select
                    defaultValue={defaultLanguage}
                    style={{width: 120,}}
                    onChange={handleLanguageChange}
                    disabled={disableLanguageSwitch || isSaving}  // 根据 disableLanguageSwitch 和 isSaving 属性禁用选择器
                >
                    <Option value="javascript">JavaScript</Option>
                    <Option value="python">Python</Option>
                    <Option value="shell">Shell</Option>
                </Select>
                <span style={{marginLeft: 10, fontSize: 14, color: "gray"}}>
                    <span style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        display: "inline-block",
                        background: saveStatus ? "green" : "red",
                        marginRight: 5
                    }}></span>
                    {saveStatus ? "已保存" : "未保存(Ctrl+S)"}
                </span> {/* 添加保存状态文本 */}
            </div>
            <CodeMirror
                value={codeValue}
                height="200px"
                theme={vscodeDark}
                onChange={handleCodeChange}
                editable={!isSaving} // 在保存期间禁用输入
                extensions={[
                    getLanguageExtension(language),
                    EditorView.lineWrapping, // 启用行自动换行
                    lineNumbers(),
                    keymap.of(defaultKeymap)
                ]}
                style={{width: '100%', fontSize: '14px', lineHeight: '1.5'}} // 调整字体大小和行高
            />
        </div>
    );
};

export default CodeEditorForm;
