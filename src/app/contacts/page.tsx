"use client";
import { useState, useEffect } from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Contact {
    id: number;
    name: string;
    email: string;
    phone: string;
}

interface DeleteModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

function DeleteConfirmationModal({ isOpen, onConfirm, onCancel }: DeleteModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-[400px] shadow-xl">
                <h3 className="text-lg font-medium text-gray-200 mb-4">Delete Contact</h3>
                <p className="text-gray-300 mb-6">Are you sure you want to delete this contact?</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Contacts() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [isAddingContact, setIsAddingContact] = useState(false);
    const [newContact, setNewContact] = useState({
        name: "",
        email: "",
        phone: ""
    });
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [contactToDelete, setContactToDelete] = useState<number | null>(null);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const response = await fetch('/api/contacts');
            const data = await response.json();
            setContacts(data);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    };

    const handleAddContact = async () => {
        const tempId = Date.now();
        const tempContact = { id: tempId, ...newContact };
        
        // Optimistic update
        setContacts(current => [tempContact, ...current]);
        setIsAddingContact(false);
        
        try {
            const response = await fetch('/api/contacts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newContact),
            });

            if (response.ok) {
                const savedContact = await response.json();
                setContacts(current => 
                    current.map(contact => 
                        contact.id === tempId ? savedContact : contact
                    )
                );
                setNewContact({ name: "", email: "", phone: "" });
            } else {
                // Revert on error
                setContacts(current => 
                    current.filter(contact => contact.id !== tempId)
                );
            }
        } catch (error) {
            console.error('Error adding contact:', error);
            // Revert on error
            setContacts(current => 
                current.filter(contact => contact.id !== tempId)
            );
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-300">Contacts</h1>
                <button 
                    onClick={() => setIsAddingContact(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                    + Add Contact
                </button>
            </div>
            
            {isAddingContact && (
                <div className="mb-6 bg-gray-800 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            type="text"
                            placeholder="Name"
                            value={newContact.name}
                            onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={newContact.email}
                            onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                            className="bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="tel"
                            placeholder="Phone"
                            value={newContact.phone}
                            onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                            className="bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            onClick={() => setIsAddingContact(false)}
                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddContact}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                        >
                            Save Contact
                        </button>
                    </div>
                </div>
            )}
            
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
                                    <button 
                                        onClick={() => {
                                            setEditingContact(contact);
                                            setNewContact(contact);
                                            setIsAddingContact(true);
                                        }}
                                        className="p-2 hover:bg-gray-700 rounded-md transition-colors mx-1"
                                    >
                                        <PencilSquareIcon className="h-5 w-5 text-blue-500" />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            // Add delete functionality
                                            if (window.confirm('Are you sure you want to delete this contact?')) {
                                                // Optimistic delete
                                                const contactToDelete = contact;
                                                setContacts(current => 
                                                    current.filter(c => c.id !== contact.id)
                                                );
                                                
                                                fetch(`/api/contacts/${contact.id}`, {
                                                    method: 'DELETE',
                                                }).catch(() => {
                                                    // Revert on error
                                                    setContacts(current => [...current, contactToDelete]);
                                                });
                                            }
                                        }}
                                        className="p-2 hover:bg-gray-700 rounded-md transition-colors mx-1"
                                    >
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
