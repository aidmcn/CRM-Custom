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
    position: relative;
    max-width: 500px;
    min-width: 150px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    padding: 4px 8px;
    border-radius: 4px;
    background: rgba(31, 41, 55, 0.5);
    border: 1px solid rgba(75, 85, 99, 0.2);
    height: 32px;
    line-height: 24px;
    transition: all 0.2s ease;
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
    position: absolute;
    height: auto;
    min-height: 32px;
    white-space: normal;
    overflow: visible;
    background: rgb(31, 41, 55);
    z-index: 999;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    max-width: 500px;
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

    // Add this sorting function
    const sortTasks = (tasks: Task[]) => {
        const statusOrder = {
            "In Progress": 0,
            "To Do": 1,
            "Completed": 2
        };

        const priorityOrder = {
            "High": 0,
            "Medium": 1,
            "Low": 2
        };

        return [...tasks].sort((a, b) => {
            // First sort by status
            if (statusOrder[a.status] !== statusOrder[b.status]) {
                return statusOrder[a.status] - statusOrder[b.status];
            }
            
            // Within status, sort by priority
            if (a.priority !== b.priority) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            
            // Within priority, sort by date (closest date first)
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
    };

    return (
        <div className="min-h-screen bg-gray-900 px-8 pb-32">
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
                        <h2 className="text-2xl font-semibold text-gray-200 mb-4">
                            {editingTask ? 'Edit Task' : 'Add New Task'}
                        </h2>
                        <div className="flex flex-col gap-4">
                            <div>
                                <textarea
                                    value={newTask.task}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, task: e.target.value }))}
                                    placeholder="Task Description"
                                    rows={3}
                                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[80px]"
                                />
                            </div>
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

                <div className="bg-gray-800 rounded-lg shadow-xl overflow-visible">
                    <div className="overflow-visible">
                        <table className="w-full table-auto relative">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="w-[45%] px-6 py-3 text-left text-sm font-medium text-gray-300">Task</th>
                                    <th className="w-[20%] px-6 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                                    <th className="w-[15%] px-6 py-3 text-left text-sm font-medium text-gray-300">Due Date</th>
                                    <th className="w-[15%] px-6 py-3 text-left text-sm font-medium text-gray-300">Priority</th>
                                    <th className="w-[5%] px-6 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {sortTasks(tasks).map((task) => (
                                    <tr key={task.id} className="hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-1 text-white">
                                            <div className="truncate-container">
                                                <div className="truncate-fade">
                                                    {task.task}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-1">
                                            <div className="flex justify-start w-full">
                                                <div className="relative w-[140px]">
                                                    <Listbox value={task.status} onChange={(newStatus) => handleStatusChange(task.id, newStatus)}>
                                                        {({ open }) => {
                                                            // Calculate position once when opening
                                                            const buttonRef = React.useRef<DOMRect | null>(null);
                                                            React.useEffect(() => {
                                                                if (open) {
                                                                    buttonRef.current = document.activeElement?.getBoundingClientRect() || null;
                                                                }
                                                            }, [open]);

                                                            return (
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
                                                                        <div className="relative">
                                                                            <Listbox.Options 
                                                                                className="absolute z-[999] w-[140px] overflow-auto rounded-lg bg-gray-800 py-0.5 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-sm"
                                                                                style={{
                                                                                    position: 'fixed',
                                                                                    transform: 'translate3d(0, 0, 0)',
                                                                                    top: buttonRef.current ? `${buttonRef.current.bottom + 4}px` : '0',
                                                                                    left: buttonRef.current ? `${buttonRef.current.left}px` : '0',
                                                                                    display: !buttonRef.current ? 'none' : undefined
                                                                                }}
                                                                            >
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
                                                                        </div>
                                                                    </Transition>
                                                                </div>
                                                            );
                                                        }}
                                                    </Listbox>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-1 text-white whitespace-nowrap">
                                            {formatDate(task.dueDate)}
                                        </td>
                                        <td className="px-6 py-1 text-white whitespace-nowrap">
                                            {task.priority}
                                        </td>
                                        <td className="px-6 py-1">
                                            <div className="flex justify-start gap-3">
                                                <button
                                                    onClick={() => handleEditClick(task)}
                                                    className="text-blue-500 hover:text-blue-600 p-1"
                                                >
                                                    <PencilSquareIcon className="h-6 w-6" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowDeleteModal(true);
                                                        setTaskToDelete(task.id);
                                                    }}
                                                    className="text-red-500 hover:text-red-600 p-1"
                                                >
                                                    <TrashIcon className="h-6 w-6" />
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