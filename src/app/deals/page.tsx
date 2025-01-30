"use client";
import { useState, useEffect } from "react";
import { PencilSquareIcon, TrashIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { useSettings } from '@/contexts/SettingsContext';
import prisma from '@/lib/prisma';
import { Deal, Contact } from '@/types';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

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
                <h3 className="text-lg font-medium text-gray-200 mb-4">Delete Deal</h3>
                <p className="text-gray-300 mb-6">Are you sure you want to delete this deal?</p>
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

const DEAL_STAGES = [
    "Lead",
    "Proposal Sent",
    "Negotiation",
    "Closed Won",
    "Closed Lost"
];

const stageStyles: Record<string, string> = {
    "Lead": "bg-gray-500/20 text-gray-400",
    "Proposal Sent": "bg-blue-500/20 text-blue-400",
    "Negotiation": "bg-yellow-500/20 text-yellow-400",
    "Closed Won": "bg-green-500/20 text-green-400",
    "Closed Lost": "bg-red-500/20 text-red-400"
};

const CURRENCIES = [
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
];

// Add new interface for email draft
interface EmailDraft {
    to: string;
    subject: string;
    content: string;
}

export default function Deals() {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [isAddingDeal, setIsAddingDeal] = useState(false);
    const [newDeal, setNewDeal] = useState({
        name: "",
        value: "",
        stage: "Lead",
        contactId: undefined as number | undefined
    });
    const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [dealToDelete, setDealToDelete] = useState<number | null>(null);
    const { settings } = useSettings();
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<any>(null);
    const [emailDraft, setEmailDraft] = useState<EmailDraft>({
        to: '',
        subject: '',
        content: ''
    });

    const formatCurrency = (value: string) => {
        const numericValue = parseFloat(value);
        return new Intl.NumberFormat(settings.locale, {
            style: 'currency',
            currency: settings.currency.code,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(numericValue);
    };

    useEffect(() => {
        fetchDeals();
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const response = await fetch('/api/contacts');
            if (!response.ok) {
                throw new Error('Failed to fetch contacts');
            }
            const data = await response.json();
            setContacts(data);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    };

    const fetchDeals = async () => {
        try {
            const response = await fetch('/api/deals');
            if (!response.ok) {
                throw new Error('Failed to fetch deals');
            }
            const data: Deal[] = await response.json();
            setDeals(data);
        } catch (error) {
            console.error('Error fetching deals:', error);
        }
    };

    const handleAddDeal = async () => {
        const newDealWithId = { ...newDeal, id: Date.now() }; // Temporary ID for optimistic UI
        setDeals(currentDeals => [newDealWithId, ...currentDeals]); // Optimistic update

        try {
            const response = await fetch('/api/deals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newDeal),
            });
            if (response.ok) {
                const savedDeal = await response.json();
                setDeals(currentDeals => 
                    currentDeals.map(deal => 
                        deal.id === newDealWithId.id ? savedDeal : deal
                    )
                );
                setIsAddingDeal(false);
                setNewDeal({ name: "", value: "", stage: "Lead", contactId: undefined });
            } else {
                // Revert on error
                setDeals(currentDeals => 
                    currentDeals.filter(deal => deal.id !== newDealWithId.id)
                );
                const errorData = await response.json().catch(() => ({}));
                alert(errorData.error || 'Failed to add deal');
            }
        } catch (error: any) {
            console.error('Error adding deal:', error);
            // Revert on error
            setDeals(currentDeals => 
                currentDeals.filter(deal => deal.id !== newDealWithId.id)
            );
            alert('Failed to add deal');
        }
    };

    const handleEditClick = (deal: Deal) => {
        setEditingDeal(deal);
        setNewDeal({
            name: deal.name,
            value: deal.value.toString(), // Ensure it's a string
            stage: deal.stage,
            contactId: deal.contactId
        });
        setIsAddingDeal(true);
    };

    const handleUpdateDeal = async () => {
        if (!editingDeal) return;

        // Validate data first
        if (!newDeal.name || !newDeal.value || !newDeal.stage) {
            console.error('Invalid deal data:', newDeal);
            alert('Please fill in all required fields.');
            return;
        }

        // Create payload
        const payload = {
            name: newDeal.name,
            value: parseFloat(newDeal.value), // Ensure value is a number
            stage: newDeal.stage,
            contactId: newDeal.contactId !== undefined ? newDeal.contactId : null
        };

        console.log('Sending payload:', payload); // Debug log

        // Optimistically update UI
        const updatedDeal = {
            id: editingDeal.id,
            ...payload
        };
        
        setDeals(currentDeals => 
            currentDeals.map(deal => 
                deal.id === editingDeal.id ? updatedDeal : deal
            )
        );

        try {
            const response = await fetch(`/api/deals/${editingDeal.id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || 'Failed to update deal';
                throw new Error(errorMessage);
            }

            const savedDeal = await response.json();
            console.log('Received response:', savedDeal); // Debug log

            // Update the deals list with server response
            setDeals(currentDeals => 
                currentDeals.map(deal => 
                    deal.id === editingDeal.id ? savedDeal : deal
                )
            );

            // Reset form
            setIsAddingDeal(false);
            setEditingDeal(null);
            setNewDeal({ name: "", value: "", stage: "Lead", contactId: undefined });
        } catch (error: any) {
            console.error('Error updating deal:', error);
            alert(error.message || 'Failed to update deal');

            // Revert optimistic update
            fetchDeals();
        }
    };

    const handleDeleteClick = (dealId: number) => {
        setDealToDelete(dealId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (dealToDelete === null) return;

        try {
            const response = await fetch(`/api/deals/${dealToDelete}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || 'Failed to delete deal';
                throw new Error(errorMessage);
            }

            // Remove the deal from the list
            setDeals(currentDeals => 
                currentDeals.filter(deal => deal.id !== dealToDelete)
            );

            setShowDeleteModal(false);
            setDealToDelete(null);
        } catch (error: any) {
            console.error('Error deleting deal:', error);
            alert(error.message || 'Failed to delete deal');
            setShowDeleteModal(false);
            setDealToDelete(null);
        }
    };

    // Add this function to handle email generation (placeholder for GPT integration)
    const generateEmailDraft = async (deal: any, contact: any) => {
        // This will be replaced with actual GPT API call later
        return {
            subject: `Regarding our deal: ${deal.name}`,
            content: `Dear ${contact.name},\n\nI hope this email finds you well. I wanted to follow up regarding our deal "${deal.name}".\n\nBest regards,\n[Your Name]`
        };
    };

    // Add email handling function
    const handleEmailClick = async (deal: any, contact: any) => {
        if (!contact?.email) {
            alert('No email address available for this contact');
            return;
        }

        setSelectedContact(contact);
        // This will be enhanced with GPT integration later
        const draftEmail = await generateEmailDraft(deal, contact);
        
        setEmailDraft({
            to: contact.email,
            subject: draftEmail.subject,
            content: draftEmail.content
        });
        setIsEmailModalOpen(true);
    };

    // Add email sending function (placeholder for now)
    const handleSendEmail = async () => {
        try {
            // This will be replaced with actual email API integration
            console.log('Sending email:', emailDraft);
            // Placeholder for email API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setIsEmailModalOpen(false);
            alert('Email sent successfully!');
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Failed to send email. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 px-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-white">Deals</h1>
                    <button 
                        onClick={() => {
                            setIsAddingDeal(true);
                            setEditingDeal(null);
                            setNewDeal({ name: "", value: "", stage: "Lead", contactId: undefined });
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                    >
                        + Add Deal
                    </button>
                </div>

                {isAddingDeal && (
                    <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-6">
                        <h2 className="text-2xl font-semibold text-gray-200 mb-4">
                            {editingDeal ? 'Edit Deal' : 'Add New Deal'}
                        </h2>
                        <div className="flex flex-col gap-4">
                            <input
                                type="text"
                                value={newDeal.name}
                                onChange={(e) => setNewDeal(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Deal Name"
                                className="bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-white">
                                    Value ({settings.currency.symbol})
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-400 sm:text-sm">
                                            {CURRENCIES.find(c => c.code === settings.currency.code)?.symbol || '$'}
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        name="value"
                                        value={newDeal.value}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^0-9.]/g, '');
                                            setNewDeal({ ...newDeal, value });
                                        }}
                                        className="bg-gray-700 text-white w-full pl-7 pr-12 sm:text-sm rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0.00"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-400 sm:text-sm">{settings.currency.code}</span>
                                    </div>
                                </div>
                            </div>
                            <select 
                                value={newDeal.stage} 
                                onChange={(e) => setNewDeal(prev => ({ ...prev, stage: e.target.value }))}
                                className="bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {DEAL_STAGES.map(stage => (
                                    <option key={stage} value={stage}>
                                        {stage}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={newDeal.contactId || ''}
                                onChange={(e) => setNewDeal(prev => ({ ...prev, contactId: e.target.value ? Number(e.target.value) : undefined }))}
                                className="bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Contact</option>
                                {contacts.map(contact => (
                                    <option key={contact.id} value={contact.id}>
                                        {contact.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setIsAddingDeal(false);
                                    setEditingDeal(null);
                                    setNewDeal({ name: "", value: "", stage: "Lead", contactId: undefined });
                                }}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            {editingDeal ? (
                                <button
                                    onClick={handleUpdateDeal}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                                >
                                    Update Deal
                                </button>
                            ) : (
                                <button
                                    onClick={handleAddDeal}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                                >
                                    Save Deal
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Value</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Stage</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Contact</th>
                                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">Email</th>
                                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {deals.map(deal => {
                                    const contact = contacts.find(c => c.id === deal.contactId);
                                    return (
                                        <tr key={deal.id} className="hover:bg-gray-700 transition-colors">
                                            <td className="px-6 py-4 text-white">{deal.name}</td>
                                            <td className="px-6 py-4 text-white">{formatCurrency(deal.value.toString())}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-sm ${stageStyles[deal.stage]}`}>
                                                    {deal.stage}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {contact ? (
                                                    <div>
                                                        <div className="font-medium text-white">{contact.name}</div>
                                                        <div className="text-sm text-gray-400">{contact.email}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500">No contact assigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleEmailClick(deal, contact)}
                                                    disabled={!contact?.email}
                                                    className={`p-2 rounded-md transition-colors mx-1 ${
                                                        contact?.email 
                                                            ? 'hover:bg-gray-600 text-blue-500' 
                                                            : 'text-gray-500 cursor-not-allowed'
                                                    }`}
                                                    title={contact?.email || 'No email available'}
                                                >
                                                    <EnvelopeIcon className="h-5 w-5" />
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => handleEditClick(deal)}
                                                    className="p-2 hover:bg-gray-600 rounded-md transition-colors mx-1"
                                                >
                                                    <PencilSquareIcon className="h-5 w-5 text-blue-500" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteClick(deal.id)}
                                                    className="p-2 hover:bg-gray-600 rounded-md transition-colors mx-1"
                                                >
                                                    <TrashIcon className="h-5 w-5 text-red-500" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <DeleteConfirmationModal 
                    isOpen={showDeleteModal} 
                    onConfirm={confirmDelete} 
                    onCancel={() => {
                        setShowDeleteModal(false);
                        setDealToDelete(null);
                    }} 
                />
            )}

            {/* Add Email Modal */}
            <Transition appear show={isEmailModalOpen} as={Fragment}>
                <Dialog 
                    as="div" 
                    className="relative z-50" 
                    onClose={() => setIsEmailModalOpen(false)}
                >
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-white mb-4"
                                    >
                                        Draft Email
                                    </Dialog.Title>
                                    <div className="mt-2 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                                To
                                            </label>
                                            <input
                                                type="email"
                                                value={emailDraft.to}
                                                readOnly
                                                className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                                Subject
                                            </label>
                                            <input
                                                type="text"
                                                value={emailDraft.subject}
                                                onChange={(e) => setEmailDraft(prev => ({ ...prev, subject: e.target.value }))}
                                                className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                                Content
                                            </label>
                                            <textarea
                                                value={emailDraft.content}
                                                onChange={(e) => setEmailDraft(prev => ({ ...prev, content: e.target.value }))}
                                                rows={8}
                                                className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                            onClick={() => setIsEmailModalOpen(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                                            onClick={handleSendEmail}
                                        >
                                            Send Email
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}
