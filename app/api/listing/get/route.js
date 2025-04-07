import Listing from "../../../../lib/models/listing.model";
import { connect } from "../../../../lib/mongodb/mongoose";

export const POST = async (req) => {
    await connect();
    const data = await req.json();

    try {
        const startIndex = parseInt(data.startIndex) || 0;
        const limit = parseInt(data.limit) || 9;
        const sortDirection = data.order === "asc" ? 1 : -1;

        let offer = data.offer;
        if (offer === undefined || offer === "false") {
            offer = { $in: [false, true] };
        }

        let furnished = data.furnished;
        if (furnished === undefined || furnished === "false") {
            furnished = { $in: [false, true] };
        }

        let parking = data.parking;
        if (parking === undefined || parking === "false") {
            parking = { $in: [false, true] };
        }

        let type = data.type;
        if (type === undefined || type === "all") {
            type = { $in: ["sale", "rent"] };
        }

        const listings = await Listing.find({
            ...(data.userId && { userId: data.userId }),
            ...(data.listingId && { _id: data.listingId }),
            ...(data.searchTerm && {
                $or: [
                    { name: { $regex: data.searchTerm, $options: "i" } },
                    { description: { $regex: data.searchTerm, $options: "i" } },
                ],
            }),
            offer,
            furnished,
            parking,
            type,
        })
        .sort({ updatedAt: sortDirection })
        .skip(startIndex)
        .limit(limit); // Fixed typo here

        return new Response(JSON.stringify(listings), {
            status: 200,
        });
    } catch (error) {
        console.log("Error getting posts:", error);
        return new Response("Error getting posts", {
            status: 500,
        });
    }
};


// export default async function Listing({ params }) {
//     const { id } = params;
    
//     try {
//         const result = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/listing/get`, {
//             method: "POST",
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ listingId: id }),
//             cache: "no-store",
//         });
        
//         if (!result.ok) {
//             throw new Error('Failed to fetch listing');
//         }
        
//         const data = await result.json();
//         const listing = data[0]; // Get first (and only) item from array
        
//         if (!listing) {
//             return (
//                 <main className="p-3 flex flex-col max-w-6xl mx-auto min-h-screen">
//                     <h2 className="text-xl mt-10 p-3 text-center font-serif max-w-2xl mx-auto lg:text-2xl">
//                         Listing not found
//                     </h2>
//                 </main>
//             );
//         }

//         // Render your listing...
        
//     } catch (error) {
//         console.error('Error:', error);
//         return (
//             <main className="p-3 flex flex-col max-w-6xl mx-auto min-h-screen">
//                 <h2 className="text-xl mt-10 p-3 text-center font-serif max-w-2xl mx-auto lg:text-2xl">
//                     Error loading listing
//                 </h2>
//             </main>
//         );
//     }
// }