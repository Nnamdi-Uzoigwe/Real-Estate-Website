

"use client";

import { useEffect, useState } from "react";
import ListingItem from "./components/ListingItem";
import Link from "next/link";

export default function Home() {
  const [rentListings, setRentListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [offerListings, setOfferListings] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchListings(type, offer, setter) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/listing/get`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            offer:offer,
            limit: 4,
            order: "asc",
          }),
        });

        if (!res.ok) throw new Error(`Failed to fetch ${type} listings`);

        const data = await res.json();
        console.log(`Fetched ${type} listings with offer: ${offer}`, data); 
        setter(data);
      } catch (err) {
        setError(err.message);
      }
    }

      fetchListings("rent", true, setRentListings);
      fetchListings("sale", true, setRentListings);
      fetchListings("rent", false, setSaleListings);
      fetchListings("sale", false, setOfferListings);
  }, []);

  return (
    <div>
      <div className="flex flex-col gap-6 p-28 px-3 max-w-6xl mx-auto">
        <h1 className="text-slate-700 font-bold text-3xl lg:text-6xl">
          Find your next <span className="text-slate-500">perfect</span>
          <br />
          home with ease
        </h1>
        <div className="text-gray-400 text-md">
          Favour Realtors is the best place to find your next perfect place to live.
          <br />
          We have a wide range of properties for you to choose from.
        </div>
        <Link
          href="/search"
          className="text-xs sm:text-sm text-blue-800 font-bold hover:underline"
        >
          Let&apos;s get started...
        </Link>
      </div>

      {/* Default image in case no listings are found */}
      <img
        src={(offerListings.length > 0 && offerListings[0].imageUrls[0]) || "/lotus-design.jpg"}
        className="w-full h-[550px] object-cover"
      />

      <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8 my-10">
        {error && <p className="text-red-500">Error: {error}</p>}

        {/* Offers Section */}
        {offerListings.length > 0 && (
          <div>
            <div className="my-3">
              <h2 className="text-2xl font-semibold text-slate-600">Recent Offers</h2>
              <Link className="text-sm text-blue-800 hover:underline" href="/search?offer=true">
                Show more listings
              </Link>
            </div>
            <div className="flex flex-wrap gap-4">
              {offerListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}

        {/* Rent Listings Section */}
        {rentListings.length > 0 && (
          <div>
            <div className="my-3">
              <h2 className="text-2xl font-semibold text-slate-600">Recent places for rent</h2>
              <Link className="text-sm text-blue-800 hover:underline" href="/search?type=rent">
                Show more listings
              </Link>
            </div>
            <div className="flex flex-wrap gap-4">
              {rentListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}
        {/* Rent Listings Section */}
        {saleListings.length > 0 && (
          <div>
            <div className="my-3">
              <h2 className="text-2xl font-semibold text-slate-600">Recent places for sale</h2>
              <Link className="text-sm text-blue-800 hover:underline" href="/search?type=sale">
                Show more listings
              </Link>
            </div>
            <div className="flex flex-wrap gap-4">
              {saleListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
