import { FolderIcon } from "@heroicons/react/24/outline";
import { registerGroupEditor } from "../group";
import type { ComponentType } from "react";
import { getHelpSection, textStyles, cn } from "@/lib/styles";

registerGroupEditor("shellScript", {
    metadata: {
        key: "shellScript",
        label: "Shell Script",
        description: "Create a shell script",
        icon: FolderIcon,
        color: { light: "bg-gray-50 border-gray-200 hover:bg-gray-100", dark: "bg-gray-900 border-gray-700 hover:bg-gray-800" },
        iconColor: { light: "text-gray-600", dark: "text-gray-400" },
        defaultValue: {
            group: [],
            custom: "shellScript",
        },
        keywords: ["shell", "script", "bash", "sh", "executable"],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component: undefined as unknown as ComponentType<any>, // Will be set by registerGroupEditor
    },
    helpContent(isDark: boolean) {
        return (
            <div className={getHelpSection(isDark).container}>
                <h3 className={getHelpSection(isDark).title}>
                    Shell Script Group
                </h3>
                <div className={getHelpSection(isDark).text}>
                    <p>
                        Creates an executable shell script and configures it for deployment.
                        This group automatically handles script creation, permission setting,
                        PATH configuration, and deployment binary registration.
                    </p>
                    <div>
                        <strong>What this creates:</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>A file directive with your script content</li>
                            <li>A run directive to copy and set permissions</li>
                            <li>Optional environment directive to add to PATH</li>
                            <li>Optional deploy directive for binary registration</li>
                        </ul>
                    </div>
                    <div>
                        <strong>Use cases:</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Custom wrapper scripts for neuroimaging tools</li>
                            <li>Environment setup scripts</li>
                            <li>Data processing pipelines</li>
                            <li>Container initialization scripts</li>
                        </ul>
                    </div>
                    <div className={cn("border rounded-md p-2", isDark ? "bg-blue-900/40 border-blue-700/50" : "bg-blue-50 border-blue-200")}>
                        <p className={cn(textStyles(isDark, { size: 'xs', weight: 'medium' }), isDark ? "text-blue-200" : "text-blue-800")}>
                            💡 Tip: Use the advanced mode to manually edit individual directives if needed
                        </p>
                    </div>
                </div>
            </div>
        )
    },
    arguments: [
        {
            name: "name",
            type: "text",
            required: true,
            defaultValue: "myscript",
            description: "Name of the shell script file.",
        },
        {
            name: "path",
            type: "text",
            required: true,
            defaultValue: "/usr/local/bin",
            description: "Path where the shell script will be created. Must be an absolute path.",
        },
        {
            name: "content",
            type: "text",
            required: true,
            defaultValue: "#!/bin/bash\n\necho 'Hello, World!'",
            description: "Content of the shell script. This should be a valid shell script.",
            multiline: true,
        },
        {
            name: "executable",
            type: "boolean",
            required: false,
            defaultValue: true,
            description: "Make the script executable. If true, the script will be given execute permissions.",
        },
        {
            name: "addToPath",
            type: "boolean",
            required: false,
            defaultValue: true,
            description: "Add the script's directory to the PATH environment variable.",
        },
        {
            name: "makeDeployBin",
            type: "boolean",
            required: false,
            defaultValue: true,
            description: "Register the script as a deploy binary, making it available outside the container.",
        },
    ],
    updateDirective({ name, path, content, executable, addToPath, makeDeployBin }) {
        return {
            group: [
                {
                    file: {
                        name: name as string,
                        contents: content as string,
                    },
                },
                {
                    run: [
                        `cp {{ get_file("${name}") }} ${path}/${name}`,
                        executable ? `chmod +x ${path}/${name}` : "",
                    ].filter(Boolean),
                },
                ...(addToPath ? [{ environment: { PATH: `$PATH:${path}` } }] : []),
                ...(makeDeployBin ? [{ deploy: { bins: [name as string], } }] : []),
            ],
            custom: "shellScript",
        }
    },
})