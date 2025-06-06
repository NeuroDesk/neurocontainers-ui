import {
    ChevronDownIcon,
    ChevronRightIcon,
    QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { FileInfo } from "@/components/common";

export default function FileDirectiveComponent({
    file,
    onChange,
}: {
    file: FileInfo;
    onChange: (file: FileInfo) => void;
}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [showDocumentation, setShowDocumentation] = useState(false);
    const [fileContent, setFileContent] = useState(file.contents || "");

    // Determine input type based on file properties
    const getInputType: () => "content" | "url" | "filename" = () => {
        if (file.contents !== undefined) return "content";
        if (file.url !== undefined) return "url";
        return "filename";
    };

    const inputType = getInputType();

    useEffect(() => {
        // Update local state when file changes externally
        setFileContent(file.contents || "");
    }, [file.contents]);

    const updateName = (value: string) => {
        onChange({ ...file, name: value });
    };

    const updateFilename = (value: string) => {
        onChange({
            ...file,
            filename: value,
            contents: undefined,
            url: undefined,
        });
    };

    const updateContents = (value: string) => {
        setFileContent(value);
        onChange({
            ...file,
            contents: value,
            filename: undefined,
            url: undefined,
        });
    };

    const updateUrl = (value: string) => {
        onChange({
            ...file,
            url: value,
            contents: undefined,
            filename: undefined,
        });
    };

    const toggleInputType = (type: "content" | "filename" | "url") => {
        if (type === inputType) return;

        if (type === "content") {
            onChange({
                ...file,
                contents: fileContent,
                filename: undefined,
                url: undefined,
            });
        } else if (type === "filename") {
            onChange({
                ...file,
                contents: undefined,
                filename: file.filename || "",
                url: undefined,
            });
        } else if (type === "url") {
            onChange({
                ...file,
                contents: undefined,
                filename: undefined,
                url: file.url || "",
            });
        }
    };

    return (
        <div className="bg-white rounded-md shadow-sm border border-[#e6f1d6] mb-4">
            <div
                className="flex items-center p-3 bg-[#f0f7e7] rounded-t-md cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <button className="mr-2 text-[#4f7b38]">
                    {isExpanded ? (
                        <ChevronDownIcon className="h-5 w-5" />
                    ) : (
                        <ChevronRightIcon className="h-5 w-5" />
                    )}
                </button>
                <h2 className="text-[#0c0e0a] font-medium flex-grow">
                    File: <span className="font-mono">{file.name}</span>
                </h2>
                <div className="relative">
                    <button
                        className="text-[#4f7b38] hover:text-[#6aa329] p-1"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowDocumentation(!showDocumentation);
                        }}
                        title="Show documentation"
                    >
                        <QuestionMarkCircleIcon className="h-5 w-5" />
                    </button>
                    {showDocumentation && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowDocumentation(false)}
                            />
                            <div className="absolute right-0 top-8 w-80 bg-white border border-gray-200 rounded-md shadow-lg p-4 z-20">
                                <h3 className="font-semibold text-[#0c0e0a] mb-2">
                                    File Directive
                                </h3>
                                <div className="text-sm text-gray-600 space-y-2">
                                    <p>
                                        The File directive allows you to include files in your container build process.
                                    </p>
                                    <div>
                                        <strong>File Source Options:</strong>
                                        <ul className="list-disc list-inside mt-1 space-y-1">
                                            <li><strong>Enter Content:</strong> Directly input the file content inline</li>
                                            <li><strong>Provide Filename:</strong> Reference an existing file by path</li>
                                            <li><strong>Provide URL:</strong> Fetch content from a web address</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <strong>Examples:</strong>
                                        <div className="bg-gray-100 p-2 rounded text-xs mt-1 space-y-1">
                                            <div><strong>Content:</strong> Direct text input</div>
                                            <div><strong>Filename:</strong> ./config/app.conf</div>
                                            <div><strong>URL:</strong> https://example.com/config.json</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-[#e6f1d6]">
                    <div className="mb-4">
                        <label className="block mb-1 font-medium text-sm text-[#1e2a16]">
                            Name
                        </label>
                        <input
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            value={file.name}
                            onChange={(e) => updateName(e.target.value)}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block font-medium text-sm text-[#1e2a16] mb-2">
                            File Source
                        </label>
                        <div className="inline-flex p-1 bg-gray-100 rounded-md mb-4">
                            <button
                                type="button"
                                onClick={() => toggleInputType("content")}
                                className={`px-4 py-2 text-sm rounded-md transition-colors ${inputType === "content"
                                    ? "bg-white shadow-sm text-[#4f7b38] font-medium"
                                    : "text-gray-600 hover:text-[#4f7b38]"
                                    }`}
                            >
                                Enter Content
                            </button>
                            <button
                                type="button"
                                onClick={() => toggleInputType("filename")}
                                className={`px-4 py-2 text-sm rounded-md transition-colors ${inputType === "filename"
                                    ? "bg-white shadow-sm text-[#4f7b38] font-medium"
                                    : "text-gray-600 hover:text-[#4f7b38]"
                                    }`}
                            >
                                Provide Filename
                            </button>
                            <button
                                type="button"
                                onClick={() => toggleInputType("url")}
                                className={`px-4 py-2 text-sm rounded-md transition-colors ${inputType === "url"
                                    ? "bg-white shadow-sm text-[#4f7b38] font-medium"
                                    : "text-gray-600 hover:text-[#4f7b38]"
                                    }`}
                            >
                                Provide URL
                            </button>
                        </div>
                    </div>

                    {inputType === "content" ? (
                        <div>
                            <label className="block mb-1 font-medium text-sm text-[#1e2a16]">
                                File Contents
                            </label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329] font-mono min-h-[200px]"
                                value={fileContent}
                                onChange={(e) => updateContents(e.target.value)}
                                placeholder="Enter file contents here..."
                            />
                        </div>
                    ) : inputType === "filename" ? (
                        <div>
                            <label className="block mb-1 font-medium text-sm text-[#1e2a16]">
                                Filename
                            </label>
                            <input
                                className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                                value={file.filename || ""}
                                onChange={(e) => updateFilename(e.target.value)}
                                placeholder="Path to the file"
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                Enter the path to an existing file
                            </p>
                        </div>
                    ) : (
                        <div>
                            <label className="block mb-1 font-medium text-sm text-[#1e2a16]">
                                URL
                            </label>
                            <input
                                className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                                value={file.url || ""}
                                onChange={(e) => updateUrl(e.target.value)}
                                placeholder="https://example.com/file.txt"
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                Enter a URL to reference a file from the web
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}