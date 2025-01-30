import Link from "next/link";

export default function Home() {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen px-10">
            <h1 className="text-4xl font-bold mb-4 text-gray-100">CRM Dashboard</h1>
            <p className="text-lg text-gray-300">Manage your contacts, deals, and tasks efficiently.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
                <Link href="/contacts" className="bg-gray-800 p-6 rounded-xl shadow-md hover:bg-gray-700 transition">
                    <h2 className="text-2xl font-semibold text-gray-100">📇 Contacts</h2>
                    <p className="text-gray-300">View and manage all customer contacts.</p>
                </Link>
                <Link href="/deals" className="bg-gray-800 p-6 rounded-xl shadow-md hover:bg-gray-700 transition">
                    <h2 className="text-2xl font-semibold text-gray-100">📊 Deals</h2>
                    <p className="text-gray-300">Track your sales pipeline and close deals.</p>
                </Link>
                <Link href="/tasks" className="bg-gray-800 p-6 rounded-xl shadow-md hover:bg-gray-700 transition">
                    <h2 className="text-2xl font-semibold text-gray-100">✅ Tasks</h2>
                    <p className="text-gray-300">Stay on top of follow-ups and reminders.</p>
                </Link>
                <Link href="/settings" className="bg-gray-800 p-6 rounded-xl shadow-md hover:bg-gray-700 transition">
                    <h2 className="text-2xl font-semibold text-gray-100">⚙️ Settings</h2>
                    <p className="text-gray-300">Customize your CRM experience.</p>
                </Link>
            </div>
        </main>
    );
}
