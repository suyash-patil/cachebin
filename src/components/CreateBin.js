import React, { useMemo, useState } from 'react'
import {Block} from 'baseui/block'
import { HeadingLevel } from 'baseui/heading'
import { Textarea } from "baseui/textarea";
import {Input} from "baseui/input";
import {ParagraphMedium} from "baseui/typography";
import {Button} from "baseui/button";
import { Checkbox, LABEL_PLACEMENT } from "baseui/checkbox";
import { FileUploader } from 'baseui/file-uploader';
import {Card} from 'baseui/card';
import {Table} from 'baseui/table-semantic';
import {Combobox} from 'baseui/combobox';
import { Web3Storage } from 'web3.storage'
const CryptoJS = require("crypto-js");

const CreateBin = () => {
    const [loading, setLoading] = useState(false);
    const [isUpload, setIsUpload] = useState(false);
    const [lang, setLang] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadFiles, setUploadFiles] = React.useState([]);
    const [text, setText] = useState("");
    const [password, setPassword] = React.useState("");
    const [enablePassword, setEnablePassword] = React.useState(false);
    const [cid, setCid] = useState("");

    const storageClient = new Web3Storage({ token: process.env.REACT_APP_WEB3_STORAGE_TOKEN })

    const reset = () => {
        setIsUploading(false);
    }

    const handleUpload = (acceptedFiles, rejectedFiles) => {
        setIsUploading(true);
        setUploadFiles(acceptedFiles);
        setIsUploading(false);
    }

    const generateRandomPassword = () => {
        // remove decimal
        const password = Math.random().toString(36).substring(2, 15);
        setPassword(password);
    }

    const sha256 = async (str) => {
        // TextEncoder is used to convert a given string to utf-8 standard. It returns Uint8Array from the string
        const buf = await crypto.subtle.digest("SHA-256", new TextEncoder("utf-8").encode(str));
        return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
    }

    const getInfo = () => {
        const data = []
        for (const uploadFile of uploadFiles) {
            data.push([
                uploadFile.name,
                uploadFile.type,
                uploadFile.size + ' bytes',
            ])
        }
        return data;
    }

    const createNewPaste = async () => {
        setLoading(true);

        let formattedContent, serializedFiles;

        if (isUpload) {
            serializedFiles = [];
            const filePromises = uploadFiles.map((file) => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = async () => {
                        try {
                            const response = {
                                content: Array.from(new Uint8Array(reader.result)),
                                type: file.type,
                                name: file.name,
                            };
                            resolve(response);
                        } catch (err) {
                            reject(err);
                        }
                    };
                    reader.onerror = (error) => {
                        reject(error);
                    };
                    //used to start reading file
                    reader.readAsArrayBuffer(file);
                });
            });
            serializedFiles = await Promise.all(filePromises);
        } else {
            serializedFiles = [{
                content: text,
                type: null,
                name: null,
            }];
        }

        formattedContent = {
            isFile: isUpload,
            files: serializedFiles,
            language: lang === "none" ? "" : lang,
            timestamp: new Date().getTime(),
        }
        const serializedFileContent = JSON.stringify(formattedContent);
        const finalizedFileContent = enablePassword ? CryptoJS.AES.encrypt(serializedFileContent, password).toString() : serializedFileContent;
        const file = new File([finalizedFileContent], await sha256(finalizedFileContent), { type: 'text/plain' });
        const cid = await storageClient.put([file]);

        setCid(cid);
        setLoading(false);
    }

    const langOptions = useMemo(() => {
        const supportedLanguages = [
            "none", "abap", "actionscript", "ada", "arduino", "autoit", "c", "clojure", "cs", "c", "cpp", "coffeescript", "csharp", "css", "cuda", "d", "dart", "delphi", "elixir", "elm", "erlang", "fortran", "foxpro", "fsharp", "go", "graphql", "gql", "groovy", "haskell", "haxe", "html", "java", "javascript", "json", "julia", "jsx", "js", "kotlin", "latex", "lisp", "livescript", "lua", "mathematica", "makefile", "matlab", "objectivec", "objective", "objective", "objectpascal", "ocaml", "octave", "perl", "php", "powershell", "prolog", "puppet", "python", "qml", "r", "racket", "restructuredtext", "rest", "ruby", "rust", "sass", "less", "scala", "scheme", "shell", "smalltalk", "sql", "standardml", "sml", "swift", "tcl", "tex", "text", "tsx", "ts", "typescript", "vala", "vbnet", "verilog", "vhdl", "xml", "xquery", "yaml"
        ]
        return supportedLanguages.filter(option => {
            return option
                .toLowerCase()
                .includes(lang.toLowerCase());
        });
    }, [lang]);

  return (
    <Block width="100%">
        <HeadingLevel>
            <ParagraphMedium>
                Create a paste
            </ParagraphMedium>
            <Checkbox 
            checked={isUpload}
            onChange={(e) => {
                setLang("none");
                setIsUpload(e.target.checked);
            }}
                labelPlacement={LABEL_PLACEMENT.right}
            >
                Upload a file
            </Checkbox>
            <div style={{marginTop: 16, marginBottom: 16}}/>
            {
                isUpload && (
                    <div>
                        <FileUploader 
                            onCancel={reset}
                            onDrop={handleUpload}
                            progressMessage={
                                isUploading ? 'Uploading' : ''
                            }
                        />
                        <br/>
                        <Card>
                        <div style={{marginTop: 16, marginBottom: 16}}/>
                            <h4>Uploaded items</h4>
                            <Table 
                                overrides={{
                                    Root: {
                                        style: {
                                            maxHeight: '300px'
                                        }
                                    }
                                }}
                                columns = {[
                                    'Name',
                                    'Type',
                                    'Size',
                                ]}
                                data = {getInfo()}
                            />
                        </Card>
                    </div>
                )
            }
            {
                !isUpload && (
                    <Textarea 
                        value={text}
                        onChange={(e) => setText(e.currentTarget.value)}
                        placeholder="Input text..."
                        clearable
                        autoFocus
                        overrides={{
                            Input: {
                                    style: {
                                        minHeight: '300px',
                                        width: '100vw',
                                        resize: 'vertical',
                                    },
                                },
                        }}
                    />
                )
            }
            <div style={{marginTop: 16, marginBottom: 16}}/>
            <ParagraphMedium><strong>Options</strong></ParagraphMedium>
            {!isUpload && (
                <Combobox 
                    value={lang}
                    onChange={nextValue => setLang(nextValue)}
                    options={langOptions}
                    mapOptionToString={option => option}
                    autocomplete={true}
                    overrides={{
                            Input: {
                                props: {
                                    placeholder: 'Select language',
                                },
                            },
                    }}
                />
            )}
            <div style={{marginTop: 16, marginBottom: 16}}/>
            <Checkbox
                    checked={enablePassword}
                    onChange={e => {
                        generateRandomPassword();
                        setEnablePassword(e.currentTarget.checked)
                    }}
                    labelPlacement={LABEL_PLACEMENT.right}
                >
                    Password Protection
                </Checkbox>
                <div style={{marginTop: 16, marginBottom: 16}}/>
                {enablePassword && (
                    <Input
                        value={password}
                        onChange={e => setPassword(e.currentTarget.value)}
                        placeholder="Password"
                        clearOnEscape
                    />
                )}
            <div style={{marginTop: 16, marginBottom: 16}}/>
            <Button size="compact" isLoading={loading} onClick={createNewPaste}>
                Create New Paste
            </Button>
            {cid && (
                    <>
                        <div style={{marginTop: 16, marginBottom: 16}}/>
                        <Card>
                                Create successfully! Remember the Paste Hash for sharing: <strong>{cid}</strong>
                        </Card>
                    </>
            )}
        </HeadingLevel>
    </Block>
  )
}

export default CreateBin