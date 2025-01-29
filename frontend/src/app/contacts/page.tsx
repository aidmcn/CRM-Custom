"use client";
import { useState } from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function Contacts() {
    const [contacts, setContacts] = useState([
        { id: 1, name: "John Doe", email: "john@example.com", phone: "123-456-7890" },
        { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "987-654-3210" },
    ]);

    return (
        <div className="max-w-4xl mx-auto mt-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-300">Contacts</h1>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors">
                    + Add Contact
                </button>
            </div>
            
            <div className="bg-gray-900 rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-700">
                            <th className="text-left p-4 text-gray-400 font-medium">Name</th>
                            <th className="text-left p-4 text-gray-400 font-medium">Email</th>
                            <th className="text-left p-4 text-gray-400 font-medium">Phone</th>
                            <th className="text-right p-4 text-gray-400 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contacts.map((contact) => (
                            <tr 
                                key={contact.id} 
                                className="border-b border-gray-700 hover:bg-gray-800 transition-colors"
                            >
                                <td className="p-4">{contact.name}</td>
                                <td className="p-4">{contact.email}</td>
                                <td className="p-4">{contact.phone}</td>
                                <td className="p-4 text-right">
                                    <button className="p-2 hover:bg-gray-700 rounded-md transition-colors mx-1">
                                        <PencilSquareIcon className="h-5 w-5 text-blue-500" />
                                    </button>
                                    <button className="p-2 hover:bg-gray-700 rounded-md transition-colors mx-1">
                                        <TrashIcon className="h-5 w-5 text-red-500" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
