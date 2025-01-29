"use client";
import { useState } from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function Tasks() {
    const [tasks, setTasks] = useState([
        { id: 1, task: "Follow up with client", status: "To Do" },
        { id: 2, task: "Send proposal", status: "Completed" },
    ]);

    const handleStatusChange = (taskId: number, newStatus: string) => {
        setTasks(tasks.map(task => 
            task.id === taskId ? { ...task, status: newStatus } : task
        ));
    };

    const statusStyles = {
        "To Do": "bg-red-500 hover:bg-red-400",
        "In Progress": "bg-orange-500 hover:bg-orange-400",
        "Completed": "bg-green-500 hover:bg-green-400"
    };

    return (
        <div className="max-w-4xl mx-auto mt-10">
            <h1 className="text-3xl font-bold text-gray-300 mb-4">Tasks</h1>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4">
                + Add Task
            </button>
            <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-800">
                    <tr>
                        <th className="border p-2">Task</th>
                        <th className="border p-2">Status</th>
                        <th className="border p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map((task) => (
                        <tr key={task.id} className="text-center">
                            <td className="border p-2">{task.task}</td>
                            <td className="border p-2">
                                <select 
                                    value={task.status}
                                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                    className={`${statusStyles[task.status as keyof typeof statusStyles]} text-white p-1 rounded transition-opacity hover:opacity-80`}
                                >
                                    <option value="To Do">To Do</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </td>
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
