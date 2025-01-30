"use client";
import React from 'react';
import { useState, useEffect, Fragment } from "react";
import { PencilSquareIcon, TrashIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { Listbox, Transition } from "@headlessui/react";

interface Task {
    id: number;
    task: string;
    status: "To Do" | "In Progress" | "Completed";
    priority: string;
    dueDate: string;
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
                <h3 className="text-lg font-medium text-gray-200 mb-4">Delete Task</h3>
                <p className="text-gray-300 mb-6">Are you sure you want to delete this task?</p>
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

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const truncateStyles = `
  .truncate-container {
    position: relative;
    height: 32px;
    padding: 0 6px;
    width: 100%;
  }

  .truncate-fade {
    position: absolute;
    top: 0;
    left: 6px;
    right: 6px;
    max-width: 600px;  /* Increased from 400px */
    min-width: 200px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    padding: 4px 8px;
    border-radius: 4px;
    background: rgba(31, 41, 55, 0.5);
    border: 1px solid rgba(75, 85, 99, 0.2);
    height: 32px;
    line-height: 24px;
  }

  .truncate-fade::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    width: 50px;
    background: linear-gradient(to right, rgba(31, 41, 55, 0) 0%, rgb(31, 41, 55) 100%);
    pointer-events: none;
  }

  .truncate-fade:hover {
    height: auto;
    min-height: 32px;
    white-space: normal;
    overflow: visible;
    background: rgb(31, 41, 55);
    z-index: 999;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .truncate-fade:hover::after {
    display: none;
  }
`;

export default function Tasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTask, setNewTask] = useState({
        task: "",
        status: "To Do" as Task["status"],
        priority: "Medium",
        dueDate: new Date().toISOString().split('T')[0]
    });
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

    useEffect(() => {
        // Create style element
        const style = document.createElement('style');
        style.textContent = truncateStyles;
        document.head.appendChild(style);

        // Cleanup
        return () => {
            document.head.removeChild(style);
        };
    }, []); // Empty dependency array means this runs once on mount

    useEffect(() => {
        fetchTasks();
    }, []);

    useEffect(() => {
        const elements = document.querySelectorAll('.truncate-fade');
        elements.forEach(el => {
            if (el instanceof HTMLElement) {
                const isTruncated = el.scrollWidth > el.clientWidth;
                el.style.pointerEvents = isTruncated ? 'auto' : 'none';
            }
        });
    }, [tasks]);

    const fetchTasks = async () => {
        try {
            const response = await fetch('/api/tasks');
            const data = await response.json();
            setTasks(data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const handleAddTask = async () => {
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTask),
            });
            if (response.ok) {
                await fetchTasks();
                setIsAddingTask(false);
                setNewTask({
                    task: "",
                    status: "To Do",
                    priority: "Medium",
                    dueDate: new Date().toISOString().split('T')[0]
                });
            }
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const handleStatusChange = async (taskId: number, newStatus: Task['status']) => {
        // Optimistically update the UI
        setTasks(currentTasks => 
            currentTasks.map(task => 
                task.id === taskId 
                    ? { ...task, status: newStatus }
                    : task
            )
        );

        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            
            if (!response.ok) {
                // Revert the optimistic update if the server request fails
                setTasks(currentTasks => 
                    currentTasks.map(task => 
                        task.id === taskId 
                            ? { ...task, status: task.status }
                            : task
                    )
                );
                console.error('Failed to update task status');
            }
        } catch (error) {
            // Revert the optimistic update on error
            setTasks(currentTasks => 
                currentTasks.map(task => 
                    task.id === taskId 
                        ? { ...task, status: task.status }
                        : task
                )
            );
            console.error('Error updating task status:', error);
        }
    };

    const handleEditClick = (task: Task) => {
        setEditingTask(task);
        setNewTask({
            task: task.task,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate
        });
        setIsAddingTask(true);
    };

    const handleUpdateTask = async () => {
        try {
            const response = await fetch(`/api/tasks/${editingTask?.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTask),
            });
            if (response.ok) {
                await fetchTasks();
                setIsAddingTask(false);
                setEditingTask(null);
                setNewTask({
                    task: "",
                    status: "To Do",
                    priority: "Medium",
                    dueDate: new Date().toISOString().split('T')[0]
                });
            }
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        // Store task for potential revert
        const taskToRestore = tasks.find(t => t.id === taskId);
        
        // Optimistically remove from UI
        setTasks(currentTasks => currentTasks.filter(t => t.id !== taskId));
        
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE',
            });
            
            if (!response.ok && taskToRestore) {
                // Revert on error
                setTasks(currentTasks => [...currentTasks, taskToRestore]);
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            if (taskToRestore) {
                setTasks(currentTasks => [...currentTasks, taskToRestore]);
            }
        }
    };

    const statusStyles = {
        "To Do": "bg-red-500/20 text-red-500 border-red-500",
        "In Progress": "bg-blue-500/20 text-blue-500 border-blue-500",
        "Completed": "bg-green-500/20 text-green-500 border-green-500"
    };

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-white">Tasks</h1>
                    <button 
                        onClick={() => {
                            setIsAddingTask(true);
                            setEditingTask(null);
                            setNewTask({
                                task: "",
                                status: "To Do",
                                priority: "Medium",
                                dueDate: new Date().toISOString().split('T')[0]
                            });
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                    >
                        + Add Task
                    </button>
                </div>
                
                {isAddingTask && (
                    <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-6">
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Task name"
                                value={newTask.task}
                                onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
                                className="bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <select
                                value={newTask.priority}
                                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                className="bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                            <input
                                type="date"
                                value={newTask.dueDate}
                                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                className="bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setIsAddingTask(false);
                                    setEditingTask(null);
                                }}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={editingTask ? handleUpdateTask : handleAddTask}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                            >
                                {editingTask ? 'Update Task' : 'Add Task'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="w-[45%] px-6 py-3 text-left text-sm font-medium text-gray-300">Task</th>
                                    <th className="w-[20%] px-6 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                                    <th className="w-[15%] px-6 py-3 text-left text-sm font-medium text-gray-300">Due Date</th>
                                    <th className="w-[15%] px-6 py-3 text-left text-sm font-medium text-gray-300">Priority</th>
                                    <th className="w-[5%] px-6 py-3 text-right text-sm font-medium text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {tasks.map((task) => (
                                    <tr key={task.id} className="hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-1 text-white">
                                            <div className="truncate-container">
                                                <div className="truncate-fade text-white">
                                                    {task.task}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-1">
                                            <div className="flex justify-start w-full">
                                                <div className="relative w-[140px]">
                                                    <Listbox value={task.status} onChange={(newStatus) => handleStatusChange(task.id, newStatus)}>
                                                        <div className="relative">
                                                            <Listbox.Button className={`${statusStyles[task.status]} relative w-full cursor-pointer rounded-full pl-3 pr-8 py-1 text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-blue-500`}>
                                                                <span className="block truncate">{task.status}</span>
                                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                                    <ChevronDownIcon className={`h-4 w-4 ${statusStyles[task.status].split(' ')[1]}`} />
                                                                </span>
                                                            </Listbox.Button>
                                                            <Transition
                                                                as={Fragment}
                                                                leave="transition ease-in duration-100"
                                                                leaveFrom="opacity-100"
                                                                leaveTo="opacity-0"
                                                            >
                                                                <Listbox.Options className="absolute z-50 mt-1 w-full overflow-auto rounded-lg bg-gray-800 py-0.5 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-sm">
                                                                    {["To Do", "In Progress", "Completed"].map((status) => (
                                                                        <Listbox.Option
                                                                            key={status}
                                                                            value={status}
                                                                            className={({ active }) =>
                                                                                `relative cursor-pointer select-none py-1.5 pl-3 pr-9 ${
                                                                                    active ? 'bg-gray-700' : 'bg-gray-800'
                                                                                } ${statusStyles[status].split(' ')[1]}`
                                                                            }
                                                                        >
                                                                            {status}
                                                                        </Listbox.Option>
                                                                    ))}
                                                                </Listbox.Options>
                                                            </Transition>
                                                        </div>
                                                    </Listbox>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-1 text-right">
                                            {formatDate(task.dueDate)}
                                        </td>
                                        <td className="px-6 py-1 text-right">
                                            {task.priority}
                                        </td>
                                        <td className="px-6 py-1">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditClick(task)}
                                                    className="text-blue-500 hover:text-blue-600"
                                                >
                                                    <PencilSquareIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowDeleteModal(true);
                                                        setTaskToDelete(task.id);
                                                    }}
                                                    className="text-red-500 hover:text-red-600"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showDeleteModal && taskToDelete && (
                <DeleteConfirmationModal
                    isOpen={showDeleteModal}
                    onConfirm={() => {
                        handleDeleteTask(taskToDelete);
                        setShowDeleteModal(false);
                    }}
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}
        </div>
    );
}