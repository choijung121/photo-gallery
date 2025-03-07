import React, { useEffect, useState } from 'react';
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

const Gallery = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
    const fetchImages = async () => {
        try {
            setLoading(true)
            const querySnapshot = await getDocs(collection(db, "photos"))
            const photos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data()}))
            console.log("Fetched photos", photos) // to debug
            setImages(photos)
            setLoading(false)
        } catch (error) {
            console.error("Error fetching photos", error) // to debug
            setError(error)
            setLoading(false)
        }
    };

    fetchImages();
}, []);

if (loading) {
    return (
        <p>Loading...</p>
    )
}

if (error) {
    return (
        <p>Error: {error.message}</p>
    )
}

if (images.length === 0) {
    return (
        <p>No images found</p>
    )
}

return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
        {images.map((image) => (
            <img 
                key={image.id}
                src={image.url}
                alt="Gallery"
                style={{ width: "100%", borderRadius: "10px" }} 
            />
        ))}
    </div>
  );
}

export default Gallery;