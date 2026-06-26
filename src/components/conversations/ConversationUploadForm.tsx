import { useState, useEffect } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { Upload, FileAudio, AlertCircle, Loader2, Check } from 'lucide-react';
import { uploadConversationAudio, createConversationFromTranscript, getConversation } from '../../api/conversations';
import type { Project } from '../../types';
import apiClient from '../../api/client';

interface ConversationUploadFormProps {
    onSuccess: (conversationId: string) => void;
}

type UploadTab = 'audio' | 'transcript';
type ProcessingStep = 'idle' | 'uploading' | 'transcribing' | 'analyzing' | 'completed' | 'failed';

const ALLOWED_FORMATS = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a'];
const MAX_FILE_SIZE_MB = 25;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const ConversationUploadForm: React.FC<ConversationUploadFormProps> = ({ onSuccess }) => {
    const [activeTab, setActiveTab] = useState<UploadTab>('audio');
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [projectId, setProjectId] = useState('');
    const [transcript, setTranscript] = useState('');
    const [projects, setProjects] = useState<Project[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');
    const [uploadProgress, setUploadProgress] = useState(0);

    // Auto-fill title with current date
    useEffect(() => {
        if (!title) {
            const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            setTitle(`Meeting - ${today}`);
        }
    }, []);

    // Fetch projects
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await apiClient.get('/pm-dashboard/projects');
                setProjects(response.data.data);
            } catch (err) {
                console.error('Error fetching projects:', err);
            }
        };
        fetchProjects();
    }, []);

    const validateFile = (selectedFile: File): boolean => {
        if (!ALLOWED_FORMATS.includes(selectedFile.type)) {
            setError(`Invalid file format. Allowed: mp3, wav, m4a, mp4`);
            return false;
        }
        if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
            setError(`File too large. Maximum size: ${MAX_FILE_SIZE_MB}MB`);
            return false;
        }
        setError(null);
        return true;
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && validateFile(droppedFile)) {
            setFile(droppedFile);
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && validateFile(selectedFile)) {
            setFile(selectedFile);
        }
    };

    const pollConversationStatus = async (conversationId: string, signal: AbortSignal) => {
        const maxAttempts = 60; // 5 minutes (5 seconds interval)
        let attempts = 0;

        const poll = async () => {
            if (signal.aborted) return;

            try {
                const conversation = await getConversation(conversationId);
                const status = conversation.status;

                if (status === 'transcribing') {
                    setProcessingStep('transcribing');
                } else if (status === 'analyzing') {
                    setProcessingStep('analyzing');
                } else if (status === 'completed') {
                    setProcessingStep('completed');
                    setTimeout(() => onSuccess(conversationId), 1000);
                    return;
                } else if (status === 'failed') {
                    setProcessingStep('failed');
                    setError('Processing failed. Please try again.');
                    return;
                }

                attempts++;
                if (attempts < maxAttempts && !signal.aborted) {
                    setTimeout(poll, 5000); // Poll every 5 seconds
                } else if (attempts >= maxAttempts) {
                    setError('Processing timeout. Please check conversation status later.');
                    setProcessingStep('failed');
                }
            } catch (err) {
                console.error('Error polling conversation:', err);
                if (!signal.aborted) {
                    setError('Failed to check processing status');
                    setProcessingStep('failed');
                }
            }
        };

        poll();
    };

    const handleSubmit = async () => {
        if (!projectId) {
            setError('Please select a project');
            return;
        }

        setError(null);
        setProcessingStep('uploading');
        setUploadProgress(0);

        const controller = new AbortController();

        try {
            let conversationId: string;

            if (activeTab === 'audio' && file) {
                const result = await uploadConversationAudio(
                    file,
                    projectId,
                    (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(percentCompleted);
                    },
                    title
                );
                conversationId = result.id;
            } else if (activeTab === 'transcript' && transcript.trim()) {
                const result = await createConversationFromTranscript({
                    transcript: transcript.trim(),
                    project_id: projectId,
                    conversation_date: new Date().toISOString(),
                    title
                });
                conversationId = result.id;
            } else {
                setError('Please provide audio file or transcript');
                setProcessingStep('idle');
                return;
            }

            // Start polling for processing status
            await pollConversationStatus(conversationId, controller.signal);
        } catch (err: any) {
            console.error('Error uploading conversation:', err);
            setError(err.response?.data?.message || 'Failed to upload conversation');
            setProcessingStep('failed');
        }

        // Cleanup function for useEffect if we were in a hook, 
        // but since this is a manual trigger, we'll return a cleanup if needed
        return () => controller.abort();
    };


    const getStepMessage = () => {
        switch (processingStep) {
            case 'uploading':
                return 'Uploading...';
            case 'transcribing':
                return 'Transcribing audio with Whisper...';
            case 'analyzing':
                return 'Analyzing with GPT-4...';
            case 'completed':
                return 'Processing complete! Redirecting...';
            case 'failed':
                return 'Processing failed';
            default:
                return '';
        }
    };

    const isProcessing = ['uploading', 'transcribing', 'analyzing'].includes(processingStep);

    return (
        <div className="max-w-3xl mx-auto p-8">
            <div className="bg-card border border-border rounded-lg p-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">Upload Client Conversation</h2>
                <p className="text-muted-foreground text-sm mb-6">
                    Upload audio or paste transcript for AI-powered analysis
                </p>

                {/* Project Selector */}
                <div className="mb-6">
                    <label className="block text-sm font-bold text-foreground mb-2">
                        Project <span className="text-rose-500">*</span>
                    </label>
                    <select
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        disabled={isProcessing}
                        className="w-full bg-background border border-border text-foreground rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                    >
                        <option value="">Select Project</option>
                        {projects.map((project) => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Title Input */}
                <div className="mb-6">
                    <label className="block text-sm font-bold text-foreground mb-2">
                        Title (optional)
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={isProcessing}
                        placeholder="Meeting title"
                        className="w-full bg-background border border-border text-foreground rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                    />
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border mb-6">
                    <button
                        onClick={() => setActiveTab('audio')}
                        disabled={isProcessing}
                        className={`px-6 py-3 font-bold text-sm transition-colors ${activeTab === 'audio'
                            ? 'text-blue-400 border-b-2 border-blue-500'
                            : 'text-muted-foreground hover:text-foreground'
                            } disabled:opacity-50`}
                    >
                        Upload Audio
                    </button>
                    <button
                        onClick={() => setActiveTab('transcript')}
                        disabled={isProcessing}
                        className={`px-6 py-3 font-bold text-sm transition-colors ${activeTab === 'transcript'
                            ? 'text-blue-400 border-b-2 border-blue-500'
                            : 'text-muted-foreground hover:text-foreground'
                            } disabled:opacity-50`}
                    >
                        Paste Transcript
                    </button>
                </div>

                {/* Audio Upload Tab */}
                {activeTab === 'audio' && (
                    <div className="mb-6">
                        <div
                            onDrop={handleDrop}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${isDragging
                                ? 'border-blue-500 bg-blue-500/5'
                                : 'border-border hover:border-[var(--border-hover)]'
                                } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            <input
                                type="file"
                                id="audioFile"
                                accept=".mp3,.wav,.m4a,.mp4"
                                onChange={handleFileChange}
                                disabled={isProcessing}
                                className="hidden"
                            />
                            <label htmlFor="audioFile" className="cursor-pointer">
                                <div className="flex flex-col items-center">
                                    {file ? (
                                        <FileAudio className="w-12 h-12 text-blue-500 mb-4" />
                                    ) : (
                                        <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                                    )}
                                    <p className="text-lg font-bold text-foreground mb-2">
                                        {file ? file.name : 'Drag audio file here or click to browse'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Formats: mp3, wav, m4a, mp4 • Max: {MAX_FILE_SIZE_MB}MB
                                    </p>
                                </div>
                            </label>
                        </div>

                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="mt-4">
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-600 transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Transcript Tab */}
                {activeTab === 'transcript' && (
                    <div className="mb-6">
                        <textarea
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                            disabled={isProcessing}
                            placeholder="Paste conversation transcript here..."
                            rows={12}
                            className="w-full bg-background border border-border text-foreground rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors resize-none disabled:opacity-50"
                        />
                    </div>
                )}

                {/* Processing Status */}
                {isProcessing && (
                    <div className="mb-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                        <div>
                            <p className="text-blue-400 font-bold text-sm">{getStepMessage()}</p>
                            <p className="text-muted-foreground text-xs mt-1">
                                This may take a few minutes. Please don't close this window.
                            </p>
                        </div>
                    </div>
                )}

                {/* Success Status */}
                {processingStep === 'completed' && (
                    <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
                        <Check className="w-5 h-5 text-emerald-400" />
                        <p className="text-emerald-400 font-bold text-sm">{getStepMessage()}</p>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="mb-6 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-rose-400" />
                        <p className="text-rose-400 text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={isProcessing || !projectId || (activeTab === 'audio' && !file) || (activeTab === 'transcript' && !transcript.trim())}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-muted disabled:text-muted-foreground text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:shadow-none flex items-center justify-center gap-2"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Upload className="w-5 h-5" />
                            Process with AI
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
