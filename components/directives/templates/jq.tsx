import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { registerNeuroDockerTemplate } from "../template";

registerNeuroDockerTemplate({
    metadata: {
        key: "jq",
        label: "jq",
        description: "Command-line JSON processor",
        icon: DocumentDuplicateIcon,
        color: { light: "bg-gray-50 border-gray-200 hover:bg-gray-100", dark: "bg-gray-900 border-gray-700 hover:bg-gray-800" },
        iconColor: { light: "text-gray-600", dark: "text-gray-400" },
        defaultValue: {
            template: {
                name: "jq",
            }
        },
        keywords: ["jq", "json", "processor", "command-line"],
        component: undefined!, // Will be set by registerNeuroDockerTemplate
    },
    name: "jq",
    url: "https://jqlang.github.io/jq/",
    description: "Lightweight and flexible command-line JSON processor",
    binaries: {
        arguments: [
            {
                name: "version",
                type: "dropdown",
                required: true,
                options: ["1.7.1", "1.7", "1.6"],
                description: "jq version to install"
            }
        ]
    },
    source: {
        arguments: [
            {
                name: "version",
                type: "text",
                required: true,
                description: "jq version to build from source"
            }
        ]
    }
});