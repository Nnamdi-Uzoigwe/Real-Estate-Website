import Listing from "../../../../lib/models/listing.model";
import { connect } from "../../../../lib/mongodb/mongoose";
import { currentUser } from "@clerk/nextjs/server";

export const POST = async (req) => {
    try {
        const user = await currentUser();
        await connect();

        console.log('Current User:', user);
        
        const data = await req.json();
        
        if (!user || user.publicMetadata.userMongoId !== data.userMongoId) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }
        console.log(data);
        
        const newPost = await Listing.create({
            userRef: user.publicMetadata.userMongoId,
            name: data.name,
            description: data.description,
            address: data.address,
            regularPrice: data.regularPrice,
            discountPrice: data.discountPrice,
            bathrooms: data.bathrooms,
            bedrooms: data.bedrooms,
            furnished: data.furnished,
            parking: data.parking,
            type: data.type,
            offer: data.offer,
            imageUrls: data.imageUrls,
            agentEmail: data.agentEmail,
            agentPhone: data.agentPhone
        });
        console.log(newPost)
        // await newPost.save();

        return new Response(JSON.stringify(newPost), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Error creating post:", error);
        return new Response(JSON.stringify({ error: "Error creating post" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};
