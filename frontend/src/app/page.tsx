import Link from "next/link";

export default function Home() {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-10">
            <h1 className="text-4xl font-bold mb-4 text-gray-900">CRM Dashboard</h1>
            <p className="text-lg text-gray-800">Manage your contacts, deals, and tasks efficiently.</p>

            <div className="grid grid-cols-3 gap-6 mt-10">
                <Link href="/contacts" className="bg-white p-6 rounded-xl shadow-md hover:bg-gray-200 transition">
                    <h2 className="text-2xl font-semibold text-gray-900">📇 Contacts</h2>
                    <p className="text-gray-700">View and manage all customer contacts.</p>
                </Link>
                <Link href="/deals" className="bg-white p-6 rounded-xl shadow-md hover:bg-gray-200 transition">
                    <h2 className="text-2xl font-semibold text-gray-900">📊 Deals</h2>
                    <p className="text-gray-700">Track your sales pipeline and close deals.</p>
                </Link>
                <Link href="/tasks" className="bg-white p-6 rounded-xl shadow-md hover:bg-gray-200 transition">
                    <h2 className="text-2xl font-semibold text-gray-900">✅ Tasks</h2>
                    <p className="text-gray-700">Stay on top of follow-ups and reminders.</p>
                </Link>
            </div>
        </main>
    );
}
