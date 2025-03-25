import React, { useEffect, useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../store/authStore';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
}

export default function Tasks() {
  const { tasks, loading, fetchTasks, createTask, updateTask, deleteTask } = useTaskStore();
  const { user, userRole } = useAuthStore();
  const [isCreating, setIsCreating] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    due_date: '',
    assigned_to: ''
  });

  useEffect(() => {
    fetchTasks();
    if (userRole === 'admin') {
      fetchUsers();
    }
  }, [fetchTasks, userRole]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email')
        .eq('role', 'user');
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      await createTask({
        ...newTask,
        created_by: user.id,
        assigned_to: newTask.assigned_to || user.id
      });
      setIsCreating(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        due_date: '',
        assigned_to: ''
      });
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: 'todo' | 'in_progress' | 'completed') => {
    try {
      await updateTask(taskId, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {userRole === 'admin' ? 'Manage Tasks' : 'My Tasks'}
        </h1>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          {userRole === 'admin' ? 'Assign New Task' : 'Create New Task'}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateTask} className="bg-white p-6 rounded-lg shadow">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="datetime-local"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {userRole === 'admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Assign To</label>
                <select
                  value={newTask.assigned_to}
                  onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select User</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.email}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Task
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['todo', 'in_progress', 'completed'].map((status) => (
          <div key={status} className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 capitalize">
              {status.replace('_', ' ')}
            </h2>
            <div className="space-y-4">
              {tasks
                .filter((task) => task.status === status)
                .map((task) => (
                  <div
                    key={task.id}
                    className="border border-gray-200 rounded-lg p-4 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      {(userRole === 'admin' || task.created_by === user?.id) && (
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-600">{task.description}</p>
                    )}
                    <div className="flex justify-between items-center text-sm">
                      <span className={`px-2 py-1 rounded-full ${
                        task.priority === 'high'
                          ? 'bg-red-100 text-red-800'
                          : task.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                      {task.due_date && (
                        <span className="text-gray-500">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                      {status !== 'todo' && (
                        <button
                          onClick={() => handleUpdateStatus(task.id, 'todo')}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Move to Todo
                        </button>
                      )}
                      {status !== 'in_progress' && (
                        <button
                          onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Move to In Progress
                        </button>
                      )}
                      {status !== 'completed' && (
                        <button
                          onClick={() => handleUpdateStatus(task.id, 'completed')}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}