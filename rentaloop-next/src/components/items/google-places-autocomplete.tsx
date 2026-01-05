'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, X, Plus, Loader2, AlertCircle } from 'lucide-react';

export interface PickupLocation {
    placeId: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
}

interface GooglePlacesAutocompleteProps {
    value: PickupLocation[];
    onChange: (locations: PickupLocation[]) => void;
    maxLocations?: number;
    error?: string;
}

// Simplified type declarations for Google Maps
interface GooglePlace {
    place_id?: string;
    name?: string;
    formatted_address?: string;
    geometry?: {
        location: {
            lat: () => number;
            lng: () => number;
        };
    };
}

interface GoogleAutocomplete {
    addListener: (event: string, callback: () => void) => void;
    getPlace: () => GooglePlace;
}

// No global declarations needed if we handle window carefully or assume @types/google.maps
// But to fix the build error "All declarations... must have identical modifiers", we remove the conflicting ones.
// We will access window.google directly.

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        google: any;
    }
}

export function GooglePlacesAutocomplete({
    value,
    onChange,
    maxLocations = 2,
    error,
}: GooglePlacesAutocompleteProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState<string | null>(null);
    const [showInput, setShowInput] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<GoogleAutocomplete | null>(null);
    const scriptLoadedRef = useRef(false);

    const initAutocomplete = useCallback(() => {
        if (!inputRef.current || !window.google?.maps?.places) return;

        try {
            autocompleteRef.current = new window.google.maps.places.Autocomplete(
                inputRef.current,
                {
                    componentRestrictions: { country: 'tw' },
                    fields: ['place_id', 'name', 'formatted_address', 'geometry'],
                }
            );

            if (!autocompleteRef.current) return;

            autocompleteRef.current.addListener('place_changed', () => {
                const place = autocompleteRef.current?.getPlace();
                if (!place?.place_id || !place.geometry?.location) return;

                const newLocation: PickupLocation = {
                    placeId: place.place_id,
                    name: place.name || '',
                    address: place.formatted_address || '',
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                };

                // Check if already exists
                if (value.some(loc => loc.placeId === newLocation.placeId)) {
                    if (inputRef.current) inputRef.current.value = '';
                    return;
                }

                onChange([...value, newLocation]);
                if (inputRef.current) inputRef.current.value = '';
                setShowInput(false);
            });
        } catch (err) {
            console.error('Failed to initialize autocomplete:', err);
            setApiError('Google Maps 初始化失敗');
        }
    }, [value, onChange]);

    useEffect(() => {
        // Check if script already loaded
        if (window.google?.maps?.places) {
            setIsLoading(false);
            return;
        }

        if (scriptLoadedRef.current) return;

        // Check if script with ID already exists
        const scriptId = 'google-maps-script';
        const existingScript = document.getElementById(scriptId);

        if (existingScript) {
            scriptLoadedRef.current = true;
            // Wait for it to load
            // Poll for it
            const interval = setInterval(() => {
                if (window.google?.maps?.places) {
                    setIsLoading(false);
                    clearInterval(interval);
                }
            }, 100);
            return;
        }

        // Load Google Places API script
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
        if (!apiKey) {
            setApiError('Google Places API Key 未設定');
            setIsLoading(false);
            return;
        }

        scriptLoadedRef.current = true;

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=zh-TW&loading=async`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            setIsLoading(false);
        };

        script.onerror = () => {
            setApiError('無法載入 Google Maps');
            setIsLoading(false);
        };

        document.head.appendChild(script);
    }, []);

    useEffect(() => {
        if (!isLoading && showInput && inputRef.current) {
            initAutocomplete();
            inputRef.current.focus();
        }
    }, [isLoading, showInput, initAutocomplete]);

    const removeLocation = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };

    const canAddMore = value.length < maxLocations;

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-gray-400 py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">載入中...</span>
            </div>
        );
    }

    if (apiError) {
        return (
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{apiError}</span>
                </div>
                {/* Fallback to simple text input */}
                <input
                    type="text"
                    name="location"
                    className="w-full rounded-lg px-4 py-2 border border-gray-300 focus:border-green-500 focus:ring-green-500 text-sm"
                    placeholder="請手動輸入面交地點（例：台北市信義區市政府站）"
                />
                <p className="text-xs text-gray-500">
                    Google Maps 不可用，請手動輸入地址。
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Selected Locations */}
            {value.length > 0 && (
                <div className="space-y-2">
                    {value.map((loc, idx) => (
                        <div
                            key={loc.placeId}
                            className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg group"
                        >
                            <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-sm truncate">
                                    {loc.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {loc.address}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeLocation(idx)}
                                className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Location Input */}
            {canAddMore && (
                <>
                    {showInput ? (
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <MapPin className="text-gray-400 w-4 h-4" />
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                className={`w-full rounded-lg pl-9 pr-4 py-2 border text-sm ${error
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
                                    }`}
                                placeholder="搜尋地點..."
                            />
                            <button
                                type="button"
                                onClick={() => setShowInput(false)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setShowInput(true)}
                            className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-500 hover:text-green-600 transition-colors text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            新增面交地點 ({value.length}/{maxLocations})
                        </button>
                    )}
                </>
            )}

            {/* Hidden input for form submission */}
            <input
                type="hidden"
                name="pickupLocations"
                value={JSON.stringify(value)}
            />

            {/* Legacy location field for backward compatibility */}
            <input
                type="hidden"
                name="location"
                value={value.length > 0 ? value.map(l => l.name).join(', ') : ''}
            />

            {error && <p className="text-xs text-red-500">{error}</p>}
            {!error && (
                <p className="text-xs text-gray-500">
                    最多可選擇 {maxLocations} 個面交地點
                </p>
            )}
        </div>
    );
}
