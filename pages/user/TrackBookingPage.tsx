// This is necessary because the Google Maps script is loaded globally and not imported as a module.
declare const google: any;

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

// Helper to create a data URI for the SVG icon
const createMechanicIcon = (color: string) => {
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="5.5" cy="17.5" r="2.5" />
          <circle cx="18.5" cy="17.5" r="2.5" />
          <path d="M12 6V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
          <path d="M12 17.5h-5l-2.2-6.5 1.5-1 3.2 2.5 4.5-4.5 2 2" />
          <path d="m11 14 3 3" />
      </svg>
    `;
    const svgWrapper = `
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="24" fill="${color}"/>
        <g transform="translate(12, 12)">
            ${svgString}
        </g>
    </svg>`;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgWrapper);
};


const statusSteps = ['Accepted', 'On The Way', 'Arrived', 'Completed'];

const TrackBookingPage = () => {
  const { bookingId } = useParams();

  // Map and location state
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const userMarker = useRef<any>(null);
  const mechanicMarker = useRef<any>(null);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mechanicLocation, setMechanicLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [eta, setEta] = useState<number | null>(null);
  const [currentStatusIndex, setCurrentStatusIndex] = useState(1); // Start at "On The Way"
  const [error, setError] = useState<string | null>(null);
  
  // Get user's location
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newUserLocation = { lat: latitude, lng: longitude };
        setUserLocation(newUserLocation);
        setError(null);
      },
      (err) => {
        setError(`Unable to retrieve your location: ${err.message}`);
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Initialize map and start simulation
  useEffect(() => {
    if (userLocation && mapRef.current && !mapInstance.current) {
        if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
            console.error("Google Maps script not loaded.");
            setError("Could not load map. Please refresh the page.");
            return;
        }

        // Initialize map
        mapInstance.current = new google.maps.Map(mapRef.current, {
            center: userLocation,
            zoom: 15,
            disableDefaultUI: true,
            styles: [
                { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
                { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
                { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
                { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
                { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
                { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
                { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
                { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
                { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
                { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
                { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
                { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
                { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
                { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
                { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
            ],
        });

        // Add user marker
        userMarker.current = new google.maps.Marker({
            position: userLocation,
            map: mapInstance.current,
            title: "Your Location",
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "white",
                strokeWeight: 2,
            },
        });

        // Set initial mechanic location for simulation
        const initialMechanicLocation = {
            lat: userLocation.lat + 0.05,
            lng: userLocation.lng + 0.05,
        };
        setMechanicLocation(initialMechanicLocation);
    }
  }, [userLocation]);


  // Update mechanic marker and map bounds
  useEffect(() => {
    if (!mapInstance.current || !mechanicLocation || !userLocation || typeof google === 'undefined') return;
    
    // Create or update mechanic marker
    if (!mechanicMarker.current) {
        mechanicMarker.current = new google.maps.Marker({
            position: mechanicLocation,
            map: mapInstance.current,
            title: "Mechanic",
            icon: {
              url: createMechanicIcon('#FFD700'),
              scaledSize: new google.maps.Size(48, 48),
              anchor: new google.maps.Point(24, 24),
            },
        });
    } else {
        mechanicMarker.current.setPosition(mechanicLocation);
    }

    // Update map bounds to show both markers
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(userLocation);
    bounds.extend(mechanicLocation);
    mapInstance.current.fitBounds(bounds, 100); // 100px padding

  }, [mechanicLocation, userLocation]);

  // Mechanic movement simulation and ETA calculation
  useEffect(() => {
    if (!mechanicLocation || !userLocation || typeof google === 'undefined') return;

    const interval = setInterval(() => {
        const mechanicLatLng = new google.maps.LatLng(mechanicLocation.lat, mechanicLocation.lng);
        const userLatLng = new google.maps.LatLng(userLocation.lat, userLocation.lng);

        const distance = google.maps.geometry.spherical.computeDistanceBetween(mechanicLatLng, userLatLng);

        // Update ETA (assume 30 km/h avg speed)
        const speedKmh = 30;
        const etaMinutes = (distance / 1000) / speedKmh * 60;
        setEta(Math.ceil(etaMinutes));

        // Update status based on distance
        if (distance < 500 && currentStatusIndex < 2) {
            setCurrentStatusIndex(2); // Arrived
        }
        if (distance < 50) {
            clearInterval(interval);
            setEta(0);
            return;
        }

        // Move mechanic closer to user
        const newLat = mechanicLocation.lat + (userLocation.lat - mechanicLocation.lat) * 0.1;
        const newLng = mechanicLocation.lng + (userLocation.lng - mechanicLocation.lng) * 0.1;
        setMechanicLocation({ lat: newLat, lng: newLng });

    }, 2000);

    return () => clearInterval(interval);

  }, [mechanicLocation, userLocation, currentStatusIndex]);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] bg-gray-100">
      {/* Map Section */}
      <div className="flex-grow h-1/2 lg:h-full bg-gray-800 flex items-center justify-center relative">
        {error && <p className="text-red-400 z-10">{error}</p>}
        {(!userLocation && !error) && <p className="text-white animate-pulse z-10">Waiting for your location...</p>}
        <div ref={mapRef} className="w-full h-full" />
      </div>
      
      {/* Info Panel */}
      <div className="w-full lg:w-96 bg-white p-6 shadow-2xl overflow-y-auto">
        <h1 className="text-3xl font-bold text-dark mb-2">Tracking Your Mechanic</h1>
        <p className="text-gray-600 mb-6">
          Estimated Arrival: 
          <span className="font-bold text-accent ml-2">
            {eta !== null ? (eta > 1 ? `${eta} minutes` : 'Arriving now') : 'Calculating...'}
          </span>
        </p>

        {/* Status Timeline */}
        <div className="mb-8">
            <h2 className="text-xl font-bold text-dark mb-4">Live Status</h2>
            <ol className="relative border-l border-gray-200">
                {statusSteps.map((status, index) => (
                    <li key={index} className="mb-10 ml-6">
                        <span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-8 ring-white ${index <= currentStatusIndex ? 'bg-accent text-white' : 'bg-gray-200 text-gray-600'}`}>
                            {index <= currentStatusIndex && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>}
                        </span>
                        <h3 className={`flex items-center mb-1 text-lg font-semibold ${index <= currentStatusIndex ? 'text-dark' : 'text-gray-400'}`}>{status}</h3>
                    </li>
                ))}
            </ol>
        </div>
        
        {/* Mechanic Info */}
        <div className="bg-gray-50 p-4 rounded-xl">
            <h2 className="text-xl font-bold text-dark mb-4">Your Mechanic</h2>
            <div className="flex items-center">
                <img className="w-16 h-16 rounded-full mr-4 object-cover" src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=300" alt="Mechanic"/>
                <div>
                    <p className="font-bold text-lg">Ramesh Kumar</p>
                    <p className="text-gray-600">Quick Fix Auto</p>
                    <p className="text-yellow-500 font-bold">★★★★☆</p>
                </div>
            </div>
            <div className="mt-4 flex space-x-2">
                <button className="flex-1 bg-accent text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors">Call</button>
                <button className="flex-1 bg-gray-200 text-dark font-bold py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors">Message</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TrackBookingPage;