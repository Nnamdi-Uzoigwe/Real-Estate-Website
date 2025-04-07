import Listing from "../../../../lib/models/listing.model"
import { connect } from "../../../../lib/mongodb/mongoose"
import { currentUser } from "@clerk/nextjs/server"

export const POST = async (req) => {
    const user = await currentUser()
    try {
        await connect()
        const data = await req.json()
        if(!user || user.publicMetadata.userMongoId !== data.userMongoId) {
            return new Response("Unauthorized", {
                status: 401,
            })
        }
        const newPost = await Listing.findByIdAndUpdate(
            data.listingId,
            {
                $set: {
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
                },
            },
            { new: true }
        )
        await newPost.save()
        return new Response(JSON.stringify(newPost), {
            status: 200,
        })
    } catch (error) {
        console.log("Error creating post:", error)
        return new Response("Error creating post", {
            status: 500,
        })
    }
}