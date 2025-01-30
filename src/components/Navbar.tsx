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
        <nav className="bg-gray-800 p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link href="/" className="text-white font-semibold text-xl">
                    CRM
                </Link>
                <div className="flex gap-4">
                    <Link href="/contacts" className="text-gray-300 hover:text-white">
                        Contacts
                    </Link>
                    <Link href="/deals" className="text-gray-300 hover:text-white">
                        Deals
                    </Link>
                    <Link href="/tasks" className="text-gray-300 hover:text-white">
                        Tasks
                    </Link>
                </div>
            </div>
        </nav>
    );
} 