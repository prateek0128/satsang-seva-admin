// import React, { useState, useEffect } from 'react'
// import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

// const containerStyle = {
//     width: '100%',
//     height: '300px',
//     borderRadius: '1rem'
// };

// function EventMap({ center }) {
//     const { isLoaded } = useJsApiLoader({
//         id: 'google-map-script',
//         googleMapsApiKey: process.env.REACT_APP_GMAP_KEY
//     })

//     const [map, setMap] = React.useState(null)
//     const [userLocation, setUserLocation] = React.useState(null)
//     const [distance, setDistance] = React.useState(null)
//     const [duration, setDuration] = React.useState(null)

//     const onLoad = React.useCallback(function callback(map) {
//         // This is just an example of getting and using the map instance!!! don't just blindly copy!
//         const bounds = new window.google.maps.LatLngBounds(center);
//         map.fitBounds(bounds);
//         map.setMapTypeId('hybrid');

//         setMap(map)
//     }, [])

//     const onUnmount = React.useCallback(function callback(map) {
//         setMap(null)
//     }, [])

//     useEffect(() => {
//         const coordinates = localStorage.getItem("loc");
//         if (coordinates.split(',').length === 2) {
//             const userLocation = {
//                 lat: parseFloat(coordinates.split(',')[0]),
//                 lng: parseFloat(coordinates.split(',')[1])
//             }

//             return setUserLocation(userLocation);
//         }
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition(position => {
//                 const userLocation = {
//                     lat: position.coords.latitude,
//                     lng: position.coords.longitude
//                 }
//                 setUserLocation(userLocation);
//             })
//         }
//     }, [])

//     useEffect(() => {
//         if (isLoaded && google && userLocation && center) {
//             const origin = new window.google.maps.LatLng(userLocation.lat, userLocation.lng)
//             const destination = new window.google.maps.LatLng(center.lat, center.lng)
//             const distanceMatrixService = new window.google.maps.DistanceMatrixService()
//             distanceMatrixService.getDistanceMatrix({
//                 origins: [origin],
//                 destinations: [destination],
//                 travelMode: 'DRIVING'
//             }, response => {
//                 const distance = response.rows[0].elements[0].distance.text
//                 const duration = response.rows[0].elements[0].duration.text
//                 setDistance(distance)
//                 setDuration(duration)
//             })
//         }
//     }, [isLoaded, google, userLocation, center])

//     return isLoaded ? (
//         <>
//             {distance && duration && (
//                 <div className='flex'>
//                     <p className='m-1 pr-2'>Distance: <span className="text-tomato fw-bold">{distance}</span></p>
//                     <p className='m-1'>Duration: <span className="text-tomato fw-bold">{duration}</span></p>
//                 </div>
//             )}
//             <GoogleMap
//                 mapContainerStyle={containerStyle}
//                 center={center}
//                 zoom={10}
//                 mapTypeId='hybrid'
//                 onLoad={onLoad}
//                 onUnmount={onUnmount}
//             >
//                 <Marker position={center} />
//                 {userLocation && <Marker position={userLocation} />}
//             </GoogleMap>

//         </>
//     ) : <>Loading...</>
// }

// export default React.memo(EventMap)

import React, { useState, useEffect, useCallback } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "1rem",
};

function EventMap({ center }) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_GMAP_KEY,
  });

  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

  const onLoad = useCallback(
    (map) => {
      const bounds = new window.google.maps.LatLngBounds(center);
      map.fitBounds(bounds);
      map.setMapTypeId("hybrid");
      setMap(map);
    },
    [center]
  );

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  useEffect(() => {
    const coordinates = localStorage.getItem("loc");
    if (coordinates && coordinates.split(",").length === 2) {
      const [lat, lng] = coordinates.split(",").map(parseFloat);
      setUserLocation({ lat, lng });
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error obtaining geolocation:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (isLoaded && userLocation && center) {
      const origin = new window.google.maps.LatLng(
        userLocation.lat,
        userLocation.lng
      );
      const destination = new window.google.maps.LatLng(center.lat, center.lng);
      const distanceMatrixService =
        new window.google.maps.DistanceMatrixService();

      distanceMatrixService.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: "DRIVING",
        },
        (response, status) => {
          if (status === "OK") {
            const element = response.rows[0].elements[0];
            if (element.status === "OK") {
              setDistance(element.distance.text);
              setDuration(element.duration.text);
            } else {
              console.warn(
                "Distance Matrix API returned status:",
                element.status
              );
            }
          } else {
            console.error("Distance Matrix API request failed due to:", status);
          }
        }
      );
    }
  }, [isLoaded, userLocation, center]);

  return isLoaded ? (
    <>
      {distance && duration && (
        <div className="flex">
          <p className="m-1 pr-2">
            Distance: <span className="text-tomato fw-bold">{distance}</span>
          </p>
          <p className="m-1">
            Duration: <span className="text-tomato fw-bold">{duration}</span>
          </p>
        </div>
      )}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        mapTypeId="hybrid"
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        <Marker position={center} />
        {userLocation && <Marker position={userLocation} />}
      </GoogleMap>
    </>
  ) : (
    <>Loading...</>
  );
}

export default React.memo(EventMap);
