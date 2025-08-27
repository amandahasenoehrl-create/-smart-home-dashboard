'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface RenovationTask {
  id: string
  task_name: string
  description: string
  priority: string
  status: string
  due_date: string | null
  estimated_cost: number | null
  room: string
  created_at: string
}

export default function ProjectsPage() {
  const [tasks, setTasks] = useState<RenovationTask[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    task_name: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    due_date: '',
    estimated_cost: '',
    room: ''
  })

  const priorities = ['low', 'medium', 'high', 'urgent']
  const statuses = ['pending', 'in-progress', 'completed', 'on-hold']
  const rooms = ['kitchen', 'bathroom', 'living room', 'bedroom', 'basement', 'attic', 'garage', 'exterior', 'other']

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('renovation_tasks')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching tasks:', error)
    } else {
      setTasks(data || [])
    }
  }

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { data, error } = await supabase
      .from('renovation_tasks')
      .insert([{
        task_name: formData.task_name,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        due_date: formData.due_date || null,
        estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null,
        room: formData.room,
        user_id: '00000000-0000-0000-0000-000000000000'
      }])
    
    if (error) {
      console.error('Error adding task:', error)
    } else {
      setFormData({ 
        task_name: '', 
        description: '', 
        priority: 'medium', 
        status: 'pending', 
        due_date: '', 
        estimated_cost: '', 
        room: '' 
      })
      setShowForm(false)
      fetchTasks()
    }
  }

  const updateTaskStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('renovation_tasks')
      .update({ status: newStatus })
      .eq('id', id)
    
    if (error) {
      console.error('Error updating task:', error)
    } else {
      fetchTasks()
    }
  }

  const deleteTask = async (id: string) => {
    const { error } = await supabase
      .from('renovation_tasks')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting task:', error)
    } else {
      fetchTasks()
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'on-hold': return 'bg-gray-100 text-gray-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Home Projects</h1>
          <div className="space-x-4">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              {showForm ? 'Cancel' : 'Add Task'}
            </button>
            <a
              href="/"
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Back to Calendar
            </a>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
            <form onSubmit={addTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.task_name}
                  onChange={(e) => setFormData({...formData, task_name: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Install new kitchen faucet"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Additional details about the task..."
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {priorities.map(priority => (
                      <option key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room
                  </label>
                  <select
                    value={formData.room}
                    onChange={(e) => setFormData({...formData, room: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select room</option>
                    {rooms.map(room => (
                      <option key={room} value={room}>
                        {room.charAt(0).toUpperCase() + room.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.estimated_cost}
                    onChange={(e) => setFormData({...formData, estimated_cost: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
              >
                Add Task
              </button>
            </form>
          </div>
        )}

        <div className="grid gap-4">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No renovation tasks yet. Add your first task!
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-800">{task.task_name}</h3>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>

                {task.description && (
                  <p className="text-gray-600 mb-3">{task.description}</p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm text-gray-500">
                  {task.room && (
                    <div>
                      <span className="font-medium">Room:</span> {task.room}
                    </div>
                  )}
                  {task.estimated_cost && (
                    <div>
                      <span className="font-medium">Cost:</span> ${task.estimated_cost}
                    </div>
                  )}
                  {task.due_date && (
                    <div>
                      <span className="font-medium">Due:</span> {new Date(task.due_date).toLocaleDateString()}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Created:</span> {new Date(task.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="space-x-2">
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}