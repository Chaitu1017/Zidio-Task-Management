import React from 'react';
import { useTaskStore } from '../store/taskStore';

export default function Dashboard() {
  const tasks = useTaskStore((state) => state.tasks);
  
  const todoCount = tasks.filter(task => task.status === 'todo').length;
  const inProgressCount = tasks.filter(task => task.status === 'in_progress').length;
  const completedCount = tasks.filter(task => task.status === 'completed').length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700">To Do</h2>
          <p className="text-3xl font-bold text-blue-600 mt-2">{todoCount}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700">In Progress</h2>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{inProgressCount}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700">Completed</h2>
          <p className="text-3xl font-bold text-green-600 mt-2">{completedCount}</p>
        </div>
      </div>
    </div>
  );
}