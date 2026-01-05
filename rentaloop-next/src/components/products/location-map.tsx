"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";

interface Location {
    lat: number;
    lng: number;
    name?: string;
    address?: string;
}

interface LocationMapProps {
    locations: Location[];
    apiKey?: string;
}

// Shared declaration is handled elsewhere or we use type casting
declare global {
    interface Window {
        initProductMap?: () => void;
    }
}

export function LocationMap({ locations, apiKey }: LocationMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!locations || locations.length === 0) {
            setError("無面交地點資訊");
            setIsLoading(false);
            return;
        }

        if (!apiKey) {
            console.error("Missing Google Maps API Key");
            setError("地圖設定錯誤 (Missing API Key)");
            setIsLoading(false);
            return;
        }

        const loadMap = () => {
            if (!window.google?.maps) return;

            if (typeof window.google.maps.Map !== 'function') {
                setError("地圖初始化失敗 (Google Maps API 載入異常)");
                setIsLoading(false);
                return;
            }

            // Calculate center
            const center = locations[0]; // Default to first location

            // Create Map
            const map = new window.google.maps.Map(mapRef.current!, {
                center: { lat: center.lat, lng: center.lng },
                zoom: 14,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: true,
                styles: [
                    {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }]
                    }
                ]
            });

            // Add Markers
            const bounds = new window.google.maps.LatLngBounds();

            locations.forEach((loc) => {
                const marker = new window.google.maps.Marker({
                    position: { lat: loc.lat, lng: loc.lng },
                    map: map,
                    title: loc.name || loc.address,
                    // Use standard pin but maybe colored green?
                    // icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                });

                if (loc.name || loc.address) {
                    const infoWindow = new window.google.maps.InfoWindow({
                        content: `
                            <div style="padding: 8px;">
                                <h3 style="font-weight: bold; margin-bottom: 4px;">${loc.name || '面交地點'}</h3>
                                <p style="font-size: 12px; color: #666;">${loc.address || ''}</p>
                            </div>
                        `
                    });
                    marker.addListener("click", () => {
                        infoWindow.open(map, marker);
                    });
                }

                bounds.extend({ lat: loc.lat, lng: loc.lng });
            });

            // Adjust view if multiple locations
            if (locations.length > 1) {
                map.fitBounds(bounds);
            }

            setIsLoading(false);
        };

        // Check if script already loaded
        if (window.google?.maps) {
            loadMap();
            return;
        }

        // Load script
        const scriptId = 'google-maps-script-map';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&loading=async`;
            script.async = true;
            script.defer = true;
            script.onload = loadMap;
            script.onerror = () => {
                setError("無法載入地圖");
                setIsLoading(false);
            };
            document.body.appendChild(script);
        } else {
            // Script loading started by another component, wait for it
            const existingScript = document.getElementById(scriptId) as HTMLScriptElement;
            const originalOnLoad = existingScript.onload;
            existingScript.onload = (e) => {
                if (typeof originalOnLoad === 'function') (originalOnLoad as any)(e);
                loadMap();
            };
            // Fallback interval check if onload missed
            const checkMap = setInterval(() => {
                if (window.google?.maps) {
                    clearInterval(checkMap);
                    loadMap();
                }
            }, 500);
        }

    }, [locations, apiKey]);

    if (error) {
        return (
            <div className="bg-gray-100 rounded-xl h-64 flex flex-col items-center justify-center p-6 text-center">
                <MapPin className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-gray-500 font-medium">{error}</p>
                <p className="text-xs text-gray-400 mt-1">請確認網路連線或 API 設定</p>
                {/* Fallback list */}
                {locations?.length > 0 && (
                    <div className="mt-4 text-left w-full max-w-xs space-y-2">
                        {locations.map((loc, i) => (
                            <div key={i} className="text-sm bg-white p-2 rounded shadow-sm">
                                <span className="font-bold">{loc.name}: </span>
                                <span>{loc.address}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-gray-100 rounded-xl overflow-hidden relative group">
            <div ref={mapRef} className="w-full h-80 bg-gray-200" />
            {isLoading && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                </div>
            )}
        </div>
    );
}
