import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <nav className="bg-blue-600 text-white p-4 flex justify-between">
                    <h1 className="text-xl font-bold">My CRM</h1>
                    <div className="flex gap-4">
                        <Link href="/" className="hover:underline">Dashboard</Link>
                        <Link href="/contacts" className="hover:underline">Contacts</Link>
                        <Link href="/deals" className="hover:underline">Deals</Link>
                        <Link href="/tasks" className="hover:underline">Tasks</Link>
                    </div>
                </nav>
                <main className="p-6">{children}</main>
            </body>
        </html>
    );
}
