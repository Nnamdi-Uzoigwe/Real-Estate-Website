"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../supabase";
import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";

const UpdateListing = () => {
  const { isSignedIn, user, isLoaded } = useUser()
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState("");
  const [imageUrls, setImageUrls] = useState([]);
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const listingId = pathname.split('/').pop()
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: "",
    description: "",
    address: "",
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  })

  useEffect(() => {
    const fetchListing = async () => {
      const res = await fetch('/api/listing/get', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId,
        }),
      })
      const data = await res.json()
      if(data.success === false) {
        console.log(data.message)
        return
      }
      setFormData(data[0])
      setImageUrls(data[0].imageUrls || []) // Initialize with existing images
    }
    fetchListing()
  }, [])

  const handleImageSubmit = async (e) => {
    e.preventDefault();

    if (files.length === 0) {
      setImageUploadError("Please select an image.");
      return;
    }

    setUploading(true);
    setImageUploadError("");

    const uploadedUrls = [];

    for (const file of files) {
      if (file.size > 2 * 1024 * 1024) {
        setImageUploadError("File size exceeds 2MB.");
        setUploading(false);
        return;
      }

      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("listing-images")
        .upload(fileName, file);

      if (error) {
        setImageUploadError("Image upload failed.");
        setUploading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("listing-images")
        .getPublicUrl(fileName);

      uploadedUrls.push(publicUrlData.publicUrl);
    }

    setImageUrls((prevUrls) => [...prevUrls, ...uploadedUrls]);
    setFormData((prevData) => ({
      ...prevData,
      imageUrls: [...prevData.imageUrls, ...uploadedUrls],
    }));
    setUploading(false);
  };

  const handleChange = (e) => {
    if(e.target.id === "sale" || e.target.id === "rent") {
      setFormData({
        ...formData,
        type: e.target.id,
      })
    }
    if(e.target.id === "parking" || e.target.id === "furnished" || e.target.id === "offer") {
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked,
      })
    }
    if(e.target.type === "number" || e.target.type === "text" || e.target.type === "textarea") {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if(formData.imageUrls.length < 1)
        return setError("You must upload at least one image")
      if(+formData.regularPrice < +formData.discountPrice)
        return setError("Discount price must be lower than regular price")
      setLoading(true)
      setError(false)
      const res = await fetch("/api/listing/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userMongoId: user.publicMetadata.userMongoId,
          listingId,
        }),
      })
      const data = await res.json()
      setLoading(false)
      if (data.success === false) {
        setError(data.message)
      }
      router.push(`/listing/${data._id}`)
    } catch (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  if(!isLoaded) {
    return (
      <div className="text-center text-xl my-7 font-semibold">Loading...</div>
    )
  }
  if(!isSignedIn) {
    return (
      <h1 className="text-center text-cl my-7 font-semibold">
        You are not authorized to view this page
      </h1>
    )
  }
  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Update Listing
      </h1>
      <form className="flex flex-col sm:flex-row gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            placeholder="Name"
            className="border p-3 rounded-lg"
            id="name"
            maxLength="62"
            minLength="10"
            required
            onChange={handleChange}
            value={formData.name}
          />
          <textarea
            type="text"
            placeholder="Description"
            className="border p-3 rounded-lg"
            id="description"
            required
            onChange={handleChange}
            value={formData.description}
          />
          <input
            type="text"
            placeholder="Address"
            className="border p-3 rounded-lg"
            id="address"
            required
            onChange={handleChange}
            value={formData.address}
          />
          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input 
                type="checkbox" 
                id="sale" 
                className="w-5"
                onChange={handleChange} 
                checked={formData.type === "sale"}  
              />
              <span>Sell</span>
            </div>
            <div className="flex gap-2">
              <input 
                type="checkbox" 
                id="rent" 
                className="w-5" 
                onChange={handleChange} 
                checked={formData.type === "rent"} 
              />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input 
                type="checkbox" 
                id="parking" 
                className="w-5" 
                onChange={handleChange}
                checked={formData.parking}
              />
              <span>Parking spot</span>
            </div>
            <div className="flex gap-2">
              <input 
                type="checkbox" 
                id="furnished" 
                className="w-5"
                onChange={handleChange}
                checked={formData.furnished}
              />
              <span>Furnished</span>
            </div>
            <div className="flex gap-2">
              <input 
                type="checkbox" 
                id="offer" 
                className="w-5"
                onChange={handleChange}
                checked={formData.offer} 
              />
              <span>Offer</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <input 
                type="number"
                id="bedrooms"
                min="1"
                max="10"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.bedrooms}
              />
              <p>Beds</p>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="number"
                id="bathrooms"
                min="1"
                max="10"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.bathrooms}
              />
              <p>Baths</p>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="number"
                id="regularPrice"
                min="50"
                max="1000000"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.regularPrice}
              />
              <div className="flex flex-col items-center">
                <p>Regular Price</p>
                <span className="text-sm">($ / month)</span>
              </div>
            </div>
            {formData.offer && (
            <div className="flex items-center gap-2">
              <input 
                type="number"
                id="discountedPrice"
                min="0"
                max="1000000"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.discountPrice}
              />
              <div className="flex flex-col items-center">
                <p>Discounted Price</p>
                <span className="text-sm">($ / month)</span>
              </div>
            </div>
            )}
          </div>
        </div>
        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images:
            <span className="font-normal text-gray-600 ml-2">
              The first image will be the cover (max6)
            </span>
          </p>
          <div className="flex gap-4">
            <input
              className="p-3 border border-gray-300 rounded w-full"
              type="file"
              id="images"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(e.target.files)}
            />
            <button
              disabled={uploading}
              onClick={handleImageSubmit}
              className="p-3 text-green-700 border cursor-pointer border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
          <p className="text-red-700 text-sm">
            {imageUploadError && imageUploadError}
          </p>
          {formData.imageUrls.length > 0 &&
            formData.imageUrls.map((url, index) => (
              <div
                key={url}
                className="flex justify-between p-3 border items-center"
              >
                <img
                  src={url}
                  alt="listing image"
                  className="w-20 h-20 object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
                    }));
                  }}
                  className="p-3 text-red-700 rounded-lg uppercase hover:opacity-75 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            ))}
          <button 
            className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
            disabled={loading || uploading}
          >
            {loading ? "Updating..." : "Update Listing"}
          </button>
          {error && <p className="text-red-700 text-sm">{error}</p>}
        </div>
      </form>
    </main>
  );
};

export default UpdateListing;