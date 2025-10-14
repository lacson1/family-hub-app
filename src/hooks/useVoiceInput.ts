import { useState, useEffect, useRef } from 'react';

// TypeScript interface for SpeechRecognition API
interface SpeechRecognitionEvent {
    resultIndex: number;
    results: {
        length: number;
        [index: number]: {
            [index: number]: { transcript: string };
            isFinal: boolean;
        };
    };
}

interface SpeechRecognitionErrorEvent {
    error: string;
}

interface SpeechRecognitionInstance {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onstart: () => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
    start: () => void;
    stop: () => void;
}

interface VoiceInputOptions {
    continuous?: boolean;
    interimResults?: boolean;
    language?: string;
    onResult?: (transcript: string, isFinal: boolean) => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
}

interface VoiceInputReturn {
    transcript: string;
    isListening: boolean;
    isSupported: boolean;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
}

export const useVoiceInput = (options: VoiceInputOptions = {}): VoiceInputReturn => {
    const {
        continuous = false,
        interimResults = true,
        language = 'en-US',
        onResult,
        onEnd,
        onError
    } = options;

    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSupported] = useState(() => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

    const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

    useEffect(() => {
        if (!isSupported) return;

        // Create recognition instance
        const SpeechRecognition = (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance; webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        const recognition = new SpeechRecognition();

        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.lang = language;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcriptPart = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcriptPart + ' ';
                } else {
                    interimTranscript += transcriptPart;
                }
            }

            const fullTranscript = finalTranscript || interimTranscript;
            setTranscript(fullTranscript.trim());

            if (onResult) {
                onResult(fullTranscript.trim(), !!finalTranscript);
            }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);

            if (onError) {
                onError(event.error);
            }
        };

        recognition.onend = () => {
            setIsListening(false);

            if (onEnd) {
                onEnd();
            }
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [continuous, interimResults, language, isSupported, onResult, onEnd, onError]);

    const startListening = () => {
        if (!isSupported) {
            console.error('Speech recognition is not supported in this browser');
            return;
        }

        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
            } catch (error) {
                console.error('Error starting speech recognition:', error);
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    };

    const resetTranscript = () => {
        setTranscript('');
    };

    return {
        transcript,
        isListening,
        isSupported,
        startListening,
        stopListening,
        resetTranscript
    };
};

// Helper function to parse natural language into task/shopping items
export const parseVoiceCommand = (text: string): { type: string; content: string; details?: Record<string, unknown> } => {
    const lowerText = text.toLowerCase().trim();

    // Shopping item patterns
    const buyPatterns = [
        /^buy (.+)/i,
        /^get (.+)/i,
        /^add (.+) to (shopping|list)/i,
        /^need (.+)/i
    ];

    for (const pattern of buyPatterns) {
        const match = lowerText.match(pattern);
        if (match) {
            return {
                type: 'shopping',
                content: match[1]
            };
        }
    }

    // Task patterns
    const taskPatterns = [
        /^remind me to (.+)/i,
        /^task[:\s]+(.+)/i,
        /^todo[:\s]+(.+)/i
    ];

    for (const pattern of taskPatterns) {
        const match = lowerText.match(pattern);
        if (match) {
            return {
                type: 'task',
                content: match[1]
            };
        }
    }

    // Event patterns
    const eventPatterns = [
        /^(.+) (at|on) (.+)/i,
        /^meeting[:\s]+(.+)/i
    ];

    for (const pattern of eventPatterns) {
        const match = lowerText.match(pattern);
        if (match) {
            return {
                type: 'event',
                content: match[0]
            };
        }
    }

    // Default to task
    return {
        type: 'task',
        content: text
    };
};

export default useVoiceInput;

