"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
    const pathname = usePathname();
    
    const isActive = (path: string) => {
        return pathname === path ? "bg-gray-800" : "";
    };

    return (
        <nav className="bg-gray-900 border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="text-xl font-bold text-white hover:text-gray-300 transition-colors">
                            My CRM
                        </Link>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Link 
                            href="/contacts" 
                            className={`px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors ${isActive('/contacts')}`}
                        >
                            Contacts
                        </Link>
                        <Link 
                            href="/deals" 
                            className={`px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors ${isActive('/deals')}`}
                        >
                            Deals
                        </Link>
                        <Link 
                            href="/tasks" 
                            className={`px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors ${isActive('/tasks')}`}
                        >
                            Tasks
                        </Link>
                        <Link 
                            href="/settings"
                            className={`p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors ${isActive('/settings')}`}
                        >
                            <Cog6ToothIcon className="h-6 w-6" />
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
} 