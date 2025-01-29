"use client";
import { useState } from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function Deals() {
    const [deals, setDeals] = useState([
        { id: 1, name: "Website Redesign", value: "$5,000", stage: "Proposal Sent" },
        { id: 2, name: "Software Subscription", value: "$1,200", stage: "Negotiation" },
    ]);

    return (
        <div className="max-w-4xl mx-auto mt-10">
            <h1 className="text-3xl font-bold text-gray-300 mb-4">Deals</h1>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4">
                + Add Deal
            </button>
            <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-800">
                    <tr>
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Value</th>
                        <th className="border p-2">Stage</th>
                        <th className="border p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {deals.map((deal) => (
                        <tr key={deal.id} className="text-center">
                            <td className="border p-2">{deal.name}</td>
                            <td className="border p-2">{deal.value}</td>
                            <td className="border p-2">{deal.stage}</td>
                            <td className="border p-2">
                                <button className="p-1 mx-1 border border-black rounded hover:scale-110 transition-all hover:bg-blue-100">
                                    <PencilSquareIcon className="h-5 w-5 text-blue-500 hover:text-blue-700" />
                                </button>
                                <button className="p-1 mx-1 border border-black rounded hover:scale-110 transition-all hover:bg-red-100">
                                    <TrashIcon className="h-5 w-5 text-red-500 hover:text-red-700" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
