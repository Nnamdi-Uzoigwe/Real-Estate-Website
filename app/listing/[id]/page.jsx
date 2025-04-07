// import LoadingSpinner from "../../components/LoadingSpinner";
import { FaBath, FaBed, FaChair, FaMapMarkerAlt, FaParking } from "react-icons/fa"
import { MdAttachEmail, MdPhoneInTalk } from "react-icons/md";
export default async function Listing({ params }) {
    console.log("Params: ", params)

    const { id } = await params;
    
    let listing = null;

    try {
        const result = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/listing/get`, {
            method: "POST",
            body: JSON.stringify({ listingId: id }),
            cache: "no-store",
        });
        const data = await result.json();
        listing = data[0];
    } catch (error) {
        listing = { name: "Failed to load listing" };
    } 
  

    if (!listing || listing.name === "Failed to load listing") {
        return (
            <main className="p-3 flex flex-col max-w-6xl mx-auto min-h-screen">
                <h2 className="text-xl mt-10 p-3 text-center font-serif max-w-2xl mx-auto lg:text-2xl">
                    Listing not found
                </h2>
            </main>
        );
    }

    return (
        <main>
            <div>
                <img 
                    src={listing.imageUrls[0]}
                    alt={listing.name}
                    className="w-full h-[400px] object-cover"
                />
                <div className="flex flex-col max-w-4xl mx-auto p-3 my-7 gap-4">
                    <p className="text-2xl font-semibold">
                        {listing.name} - <span className="text-md">From </span>₦{" "}
                        {listing.offer
                          ? listing.discountPrice.toLocaleString("en-US")
                          : listing.regularPrice.toLocaleString("en-US")}
                        {listing.type === "rent" && " / month"}
                    </p>
                    <p className="flex items-center mt-6 gap-2 text-slate-600 text-sm">
                        <FaMapMarkerAlt className="text-green-700" />
                        {listing.address}
                    </p>
                    <div className="flex gap-4">
                        <p className="bg-red-900 w-full max-w-[200px] text-white text-center p-1 rounded-md">
                            {listing.type === "rent" ? "For Rent" : "For Sale"}
                        </p>
                        {listing.offer && (
                            <p className="bg-green-900 w-full max-w-[200px] text-white text-center p-1 rounded-md">
                                ₦{+listing.regularPrice - +listing.discountPrice} OFF
                            </p>
                        )}
                    </div>
                    <p className="text-slate-800 whitespace-pre-line">
                        <span className="font-semibold text-black">Description - </span>
                        {listing.description}
                    </p>
                    <ul className="text-green-900 font-semibold text-sm flex flex-wrap items-center gap-4 sm:gap-6">
                        <li className="flex items-center gap-1 whitespace-nowrap">
                            <FaBed className="text-lg" />
                            {listing.bedrooms > 1
                              ? `${listing.bedrooms} beds`
                              : `${listing.bedrooms} bed`}    
                        </li>
                        <li className="flex items-center gap-1 whitespace-nowrap">
                            <FaBath className="text-lg" />
                            {listing.bathrooms > 1
                                ? `${listing.bathrooms} baths`
                                : `${listing.bathrooms} bath`}
                        </li>
                        <li className="flex items-center gap-1 whitespace-nowrap">
                            <FaParking className="text-lg" />
                            {listing.parking ? "Parking spot" : "No Parking"}
                        </li>
                        <li className="flex items-center gap-1 whitespace-nowrap">
                            <FaChair className="text-lg" />
                            {listing.furnished ? "Furnished" : "Not Furnished"}
                        </li>
                    </ul>
                    <h1 className="font-bold text-lg text-red-800 underline">Contact Agent Below</h1>
                        <div className="flex gap-2 items-center">
                            <MdAttachEmail className="text-lg text-green-900" />
                            <span className="text-md text-green-900 font-semibold">{listing.agentEmail}</span>
                        </div>
                        <div className="flex mt-2 gap-2 items-center">
                            <MdPhoneInTalk className="text-lg" />
                            <span className="text-md text-green-900 font-semibold">{listing.agentPhone}</span>
                        </div>
                </div>
            </div>
        </main>
    );
}


