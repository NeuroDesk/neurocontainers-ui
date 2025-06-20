import { InformationCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { ContainerRecipe, Architecture, CopyrightInfo, StructuredReadme, convertStructuredReadmeToText, CATEGORIES } from "@/components/common";
import { useState, useEffect } from "react";
import {
    BasicInfoSection,
    ArchitectureSelector,
    CategorySelector,
    DocumentationSection,
    LicenseSection,
    ValidationSummary,
} from "@/components/ui";

// Validation functions
function validateName(name: string): string | null {
    if (!name.trim()) return "Container name is required";
    if (name.length < 2) return "Container name must be at least 2 characters";
    if (name.length > 63) return "Container name cannot exceed 63 characters";
    
    // Container name validation: lowercase letters and numbers only, no hyphens
    const validNameRegex = /^[a-z0-9]+$/;
    if (!validNameRegex.test(name)) {
        return "Container name must be lowercase and can only contain letters and numbers";
    }
    return null;
}

function validateVersion(version: string): string | null {
    if (!version.trim()) return "Version is required";
    return null;
}

function validateDocumentation(recipe: ContainerRecipe): string | null {
    const hasReadme = recipe.readme && recipe.readme.trim();
    const hasReadmeUrl = recipe.readme_url && recipe.readme_url.trim();
    const hasStructuredReadme = recipe.structured_readme && (
        recipe.structured_readme.description.trim() ||
        recipe.structured_readme.example.trim() ||
        recipe.structured_readme.documentation.trim() ||
        recipe.structured_readme.citation.trim()
    );

    if (!hasReadme && !hasReadmeUrl && !hasStructuredReadme) {
        return "Documentation is required (either content, structured, or URL)";
    }

    if (hasReadmeUrl && !/^https?:\/\/.+/.test(recipe.readme_url!)) {
        return "Documentation URL must be a valid HTTP/HTTPS URL";
    }

    return null;
}

export default function ContainerMetadata({
    recipe,
    onChange,
    onNameEditStart,
    onNameEditFinish,
}: {
    recipe: ContainerRecipe;
    onChange: (recipe: ContainerRecipe) => void;
    onNameEditStart?: () => void;
    onNameEditFinish?: () => void;
}) {
    const [showInputTypeWarning, setShowInputTypeWarning] = useState(false);
    const [pendingInputType, setPendingInputType] = useState<"content" | "url" | null>(null);
    const [showValidation, setShowValidation] = useState(false);
    const [showBasicInfoHelp, setShowBasicInfoHelp] = useState(false);
    const [showArchitectureHelp, setShowArchitectureHelp] = useState(false);
    const [showDocumentationHelp, setShowDocumentationHelp] = useState(false);
    const [showLicenseHelp, setShowLicenseHelp] = useState(false);
    const [showCategoryHelp, setShowCategoryHelp] = useState(false);

    // Reset state when recipe changes (different container loaded)
    useEffect(() => {
        setShowInputTypeWarning(false);
        setPendingInputType(null);
        setShowValidation(false);
        setShowBasicInfoHelp(false);
        setShowArchitectureHelp(false);
        setShowDocumentationHelp(false);
        setShowLicenseHelp(false);
        setShowCategoryHelp(false);
    }, [recipe.name, recipe.version, recipe.readme, recipe.readme_url, recipe.structured_readme]); // Reset when container or documentation changes

    // Validation states
    const nameError = validateName(recipe.name);
    const versionError = validateVersion(recipe.version);
    const documentationError = validateDocumentation(recipe);
    const architectureError = recipe.architectures.length === 0 ? "At least one architecture must be selected" : null;
    const categoryError = !recipe.categories || recipe.categories.length === 0 ? "At least one category must be selected" : null;

    const hasErrors = !!(nameError || versionError || documentationError || architectureError || categoryError);

    // Show validation after user has interacted with the form
    useEffect(() => {
        // Always show validation for required fields that are empty
        const hasRequiredEmptyFields = !recipe.name.trim() || !recipe.version.trim() || 
            (!recipe.readme?.trim() && !recipe.readme_url?.trim() && !recipe.structured_readme) || 
            recipe.architectures.length === 0 || !recipe.categories || recipe.categories.length === 0;
        
        if (recipe.name || recipe.version || recipe.readme || recipe.readme_url || recipe.structured_readme || hasRequiredEmptyFields) {
            setShowValidation(true);
        }
    }, [recipe.name, recipe.version, recipe.readme, recipe.readme_url, recipe.structured_readme, recipe.architectures, recipe.categories]);

    const updateName = (name: string) => {
        onChange({ ...recipe, name });
    };

    const updateVersion = (version: string) => {
        onChange({ ...recipe, version });
    };

    const updateArchitectures = (architectures: Architecture[]) => {
        onChange({ ...recipe, architectures });
    };

    const updateCategories = (categories: (keyof typeof CATEGORIES)[]) => {
        onChange({ ...recipe, categories });
    };

    const updateReadme = (readme: string) => {
        onChange({ ...recipe, readme, readme_url: undefined, structured_readme: undefined });
    };

    const updateReadmeUrl = (readme_url: string) => {
        onChange({ ...recipe, readme_url, readme: undefined, structured_readme: undefined });
    };

    const updateStructuredReadme = (structured_readme: StructuredReadme) => {
        // Auto-generate plain text readme for builder
        const plainTextReadme = convertStructuredReadmeToText(structured_readme, recipe.name, recipe.version);
        onChange({ 
            ...recipe, 
            structured_readme, 
            readme: plainTextReadme,
            readme_url: undefined 
        });
    };

    const updateCopyright = (copyright: CopyrightInfo[]) => {
        onChange({ ...recipe, copyright });
    };

    const addLicense = (index?: number) => {
        const newLicense = { license: "", url: "" };
        const licenses = [...(recipe.copyright || [])];
        if (index !== undefined) {
            licenses.splice(index, 0, newLicense);
        } else {
            licenses.push(newLicense);
        }
        updateCopyright(licenses);
    };

    const moveLicense = (index: number, direction: "up" | "down") => {
        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= (recipe.copyright || []).length) return;

        const updatedLicenses = [...(recipe.copyright || [])];
        const temp = updatedLicenses[index];
        updatedLicenses[index] = updatedLicenses[newIndex];
        updatedLicenses[newIndex] = temp;
        updateCopyright(updatedLicenses);
    };

    const reorderLicenses = (licenses: CopyrightInfo[]) => {
        updateCopyright(licenses);
    };

    // Input type switching with warning
    const handleReadmeChange = (readme: string) => {
        // Check if there's URL content that would be lost
        if (recipe.readme_url?.trim()) {
            setPendingInputType("content");
            setShowInputTypeWarning(true);
            return;
        }
        updateReadme(readme);
    };

    const handleReadmeUrlChange = (url: string) => {
        // Check if there's content that would be lost
        if (recipe.readme?.trim()) {
            setPendingInputType("url");
            setShowInputTypeWarning(true);
            return;
        }
        updateReadmeUrl(url);
    };

    const confirmInputTypeSwitch = () => {
        if (pendingInputType === "content") {
            updateReadme("");
        } else if (pendingInputType === "url") {
            updateReadmeUrl("");
        }
        setShowInputTypeWarning(false);
        setPendingInputType(null);
    };

    const cancelInputTypeSwitch = () => {
        setShowInputTypeWarning(false);
        setPendingInputType(null);
    };

    const basicInfoHelpContent = (
        <>
            <h4 className="font-semibold text-[#0c0e0a] mb-2">Basic Information</h4>
            <div className="text-sm text-gray-600 space-y-2">
                <div>
                    <strong>Container Name:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Must be lowercase letters and numbers only</li>
                        <li>Should be named for the primary tool in the container</li>
                        <li>Will be used as the Docker image name</li>
                        <li>Examples: fsl, ants, freesurfer, neurodebian</li>
                    </ul>
                </div>
                <div>
                    <strong>Version:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Use semantic versioning (e.g., 1.0.0, 2.1.3)</li>
                        <li>Or tool-specific versions (e.g., 6.0.5, latest)</li>
                        <li>Helps users identify which version they&apos;re using</li>
                    </ul>
                </div>
            </div>
        </>
    );

    const architectureHelpContent = (
        <>
            <h4 className="font-semibold text-[#0c0e0a] mb-2">Target Architectures</h4>
            <div className="text-sm text-gray-600 space-y-2">
                <p>Choose the processor architectures your container should support:</p>
                <div className="space-y-2">
                    <div>
                        <strong>x86_64 (Intel/AMD):</strong> Most common architecture
                        <ul className="list-disc list-inside ml-4 mt-1 text-xs">
                            <li>Desktop computers, most laptops</li>
                            <li>Most cloud instances (AWS EC2, Google Cloud, Azure)</li>
                            <li>Traditional servers and workstations</li>
                        </ul>
                    </div>
                    <div>
                        <strong>aarch64 (ARM 64-bit):</strong> Growing in popularity
                        <ul className="list-disc list-inside ml-4 mt-1 text-xs">
                            <li>Apple Silicon Macs (M1, M2, M3)</li>
                            <li>AWS Graviton instances</li>
                            <li>Raspberry Pi 4+ and other ARM devices</li>
                        </ul>
                    </div>
                </div>
                <p className="text-xs">
                    💡 <strong>Tip:</strong> Select both for maximum compatibility, or just x86_64 if you&apos;re unsure.
                </p>
            </div>
        </>
    );

    const documentationHelpContent = (
        <>
            <h4 className="font-semibold text-[#0c0e0a] mb-2">Documentation</h4>
            <div className="text-sm text-gray-600 space-y-2">
                <p>Provide documentation for your container users:</p>
                <div>
                    <strong>Options:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li><strong>Structured (Recommended):</strong> Fill out structured fields that automatically generate a standardized README following NeuroContainers conventions</li>
                        <li><strong>Enter Content:</strong> Write documentation directly using Markdown syntax</li>
                        <li><strong>Provide URL:</strong> Link to external documentation (e.g., GitHub README)</li>
                    </ul>
                </div>
                <p>The structured option ensures consistency with existing NeuroContainers and includes all required sections (description, usage example, documentation link, and citation).</p>
            </div>
        </>
    );

    const licenseHelpContent = (
        <>
            <h4 className="font-semibold text-[#0c0e0a] mb-2">License Information</h4>
            <div className="text-sm text-gray-600 space-y-2">
                <p>Specify licenses for your container and any included software:</p>
                <div>
                    <strong>Options:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li><strong>SPDX Licenses:</strong> Choose from common standardized licenses</li>
                        <li><strong>Custom License:</strong> Specify your own license name and URL</li>
                    </ul>
                </div>
                <p>This is important for legal compliance and distribution.</p>
            </div>
        </>
    );


    return (
        <>
            <div className="bg-white rounded-lg shadow-md border border-[#d3e7b6] mb-6">
                <ValidationSummary
                    errors={[nameError, versionError, documentationError, architectureError, categoryError]}
                    show={showValidation && hasErrors}
                />

                <div className="p-4 sm:p-6">
                    {/* Basic Information Section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="text-lg font-medium text-[#0c0e0a]">Basic Information</h3>
                            <button
                                type="button"
                                className={`text-[#4f7b38] hover:text-[#6aa329] p-1 transition-colors ${showBasicInfoHelp ? 'text-[#6aa329]' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowBasicInfoHelp(!showBasicInfoHelp);
                                }}
                                title={showBasicInfoHelp ? "Hide documentation" : "Show documentation"}
                            >
                                <InformationCircleIcon className="h-4 w-4" />
                            </button>
                        </div>

                        {showBasicInfoHelp && (
                            <div className="mb-4 px-4 py-3 bg-[#fafcf7] border border-[#e6f1d6] rounded-md">
                                {basicInfoHelpContent}
                            </div>
                        )}

                        <BasicInfoSection
                            name={recipe.name}
                            version={recipe.version}
                            onNameChange={updateName}
                            onVersionChange={updateVersion}
                            nameError={nameError}
                            versionError={versionError}
                            showValidation={showValidation}
                            onNameEditStart={onNameEditStart}
                            onNameEditFinish={onNameEditFinish}
                        />
                    </div>

                    {/* Architecture Section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="text-lg font-medium text-[#0c0e0a]">
                                Target Architectures *
                            </h3>
                            <button
                                type="button"
                                className={`text-[#4f7b38] hover:text-[#6aa329] p-1 transition-colors ${showArchitectureHelp ? 'text-[#6aa329]' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowArchitectureHelp(!showArchitectureHelp);
                                }}
                                title={showArchitectureHelp ? "Hide documentation" : "Show documentation"}
                            >
                                <InformationCircleIcon className="h-4 w-4" />
                            </button>
                        </div>

                        {showArchitectureHelp && (
                            <div className="mb-4 px-4 py-3 bg-[#fafcf7] border border-[#e6f1d6] rounded-md">
                                {architectureHelpContent}
                            </div>
                        )}

                        <ArchitectureSelector
                            selectedArchitectures={recipe.architectures}
                            onChange={updateArchitectures}
                            error={architectureError}
                            showValidation={showValidation}
                        />
                    </div>

                    {/* Category Section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="text-lg font-medium text-[#0c0e0a]">
                                Categories *
                            </h3>
                            <button
                                type="button"
                                className={`text-[#4f7b38] hover:text-[#6aa329] p-1 transition-colors ${showCategoryHelp ? 'text-[#6aa329]' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowCategoryHelp(!showCategoryHelp);
                                }}
                                title={showCategoryHelp ? "Hide documentation" : "Show documentation"}
                            >
                                <InformationCircleIcon className="h-4 w-4" />
                            </button>
                        </div>

                        {showCategoryHelp && (
                            <div className="mb-4 px-4 py-3 bg-[#fafcf7] border border-[#e6f1d6] rounded-md">
                                <h4 className="font-semibold text-[#0c0e0a] mb-2">Container Categories</h4>
                                <div className="text-sm text-gray-600 space-y-2">
                                    <p>Select one or more categories that best describe your container&apos;s functionality:</p>
                                    <ul className="list-disc list-inside mt-1 space-y-1">
                                        <li>Categories help users discover and understand your container</li>
                                        <li>Choose all categories that apply to your tool</li>
                                        <li>At least one category is required</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        <CategorySelector
                            selectedCategories={recipe.categories || []}
                            onChange={updateCategories}
                            error={categoryError}
                            showValidation={showValidation}
                        />
                    </div>

                    {/* Documentation Section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="text-lg font-medium text-[#0c0e0a]">Documentation *</h3>
                            <button
                                type="button"
                                className={`text-[#4f7b38] hover:text-[#6aa329] p-1 transition-colors ${showDocumentationHelp ? 'text-[#6aa329]' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDocumentationHelp(!showDocumentationHelp);
                                }}
                                title={showDocumentationHelp ? "Hide documentation" : "Show documentation"}
                            >
                                <InformationCircleIcon className="h-4 w-4" />
                            </button>
                        </div>

                        {showDocumentationHelp && (
                            <div className="mb-4 px-4 py-3 bg-[#fafcf7] border border-[#e6f1d6] rounded-md">
                                {documentationHelpContent}
                            </div>
                        )}

                        <DocumentationSection
                            readme={recipe.readme}
                            readmeUrl={recipe.readme_url}
                            structuredReadme={recipe.structured_readme}
                            containerName={recipe.name}
                            containerVersion={recipe.version}
                            onReadmeChange={handleReadmeChange}
                            onReadmeUrlChange={handleReadmeUrlChange}
                            onStructuredReadmeChange={updateStructuredReadme}
                            error={documentationError}
                            showValidation={showValidation}
                        />
                    </div>

                    {/* License Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="text-lg font-medium text-[#0c0e0a]">License Information</h3>
                            <button
                                type="button"
                                className={`text-[#4f7b38] hover:text-[#6aa329] p-1 transition-colors ${showLicenseHelp ? 'text-[#6aa329]' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowLicenseHelp(!showLicenseHelp);
                                }}
                                title={showLicenseHelp ? "Hide documentation" : "Show documentation"}
                            >
                                <InformationCircleIcon className="h-4 w-4" />
                            </button>
                        </div>

                        {showLicenseHelp && (
                            <div className="mb-4 px-4 py-3 bg-[#fafcf7] border border-[#e6f1d6] rounded-md">
                                {licenseHelpContent}
                            </div>
                        )}

                        <LicenseSection
                            licenses={recipe.copyright || []}
                            onChange={updateCopyright}
                            onAddLicense={addLicense}
                            showAddButton={false}
                            onMoveLicense={moveLicense}
                            onReorderLicenses={reorderLicenses}
                        />
                    </div>
                </div>
            </div>

            {/* Input Type Switch Warning Modal */}
            {showInputTypeWarning && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Switch Documentation Input?
                                    </h3>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-6">
                                You have existing documentation content. Switching to{" "}
                                {pendingInputType === "content" ? "content entry" : "URL input"} will
                                clear your current{" "}
                                {recipe.readme ? "written content" : "URL"}. This action cannot be
                                undone.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                                    onClick={cancelInputTypeSwitch}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-md transition-colors"
                                    onClick={confirmInputTypeSwitch}
                                >
                                    Switch Anyway
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}