'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Meal {
  id: string
  title: string
  meal_date: string
  meal_type: string
}

interface GroceryItem {
  id: string
  item_name: string
  is_purchased: boolean
  category: string
}

interface RenovationTask {
  id: string
  task_name: string
  priority: string
  status: string
  room: string
}

export default function Dashboard() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([])
  const [renovationTasks, setRenovationTasks] = useState<RenovationTask[]>([])
  const [currentTime, setCurrentTime] = useState<string>('')

  useEffect(() => {
    // Update time every second
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)

    // Fetch data
    fetchMeals()
    fetchGroceryItems()
    fetchRenovationTasks()

    return () => clearInterval(timer)
  }, [])

  const fetchMeals = async () => {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .gte('meal_date', new Date().toISOString().split('T')[0])
      .order('meal_date', { ascending: true })
      .limit(3)
    
    if (!error) {
      setMeals(data || [])
    }
  }

  const fetchGroceryItems = async () => {
    const { data, error } = await supabase
      .from('grocery_items')
      .select('*')
      .eq('is_purchased', false)
      .order('category', { ascending: true })
      .limit(6)
    
    if (!error) {
      setGroceryItems(data || [])
    }
  }

  const fetchRenovationTasks = async () => {
    const { data, error } = await supabase
      .from('renovation_tasks')
      .select('*')
      .neq('status', 'completed')
      .order('priority', { ascending: true })
      .limit(4)
    
    if (!error) {
      setRenovationTasks(data || [])
    }
  }

  const getTodayDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                Smart Home Hub
              </h1>
              <p className="text-purple-200">{getTodayDate()}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-white">{currentTime}</div>
              <div className="text-sm text-purple-200">Local Time</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Calendar Quick Access */}
        <div className="mb-8">
          <a
            href="/"
            className="block bg-white/15 backdrop-blur-md rounded-2xl border border-white/30 p-8 hover:bg-white/20 transition-all duration-300"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">📅 Smart Calendar</h2>
              <p className="text-purple-200">View your schedule, plan meals, and manage tasks in calendar view</p>
            </div>
          </a>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Meal Planning Widget */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <span className="w-3 h-3 bg-blue-400 rounded-full mr-3"></span>
                Upcoming Meals
              </h2>
              <a
                href="/meals"
                className="text-blue-300 hover:text-blue-200 text-sm"
              >
                View All →
              </a>
            </div>
            
            <div className="space-y-3">
              {meals.length === 0 ? (
                <p className="text-purple-200 text-sm">No upcoming meals planned</p>
              ) : (
                meals.map((meal) => (
                  <div key={meal.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-white font-medium">{meal.title}</h3>
                        <p className="text-purple-200 text-sm">
                          {new Date(meal.meal_date).toLocaleDateString()} • {meal.meal_type}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <a
              href="/meals"
              className="block w-full mt-4 bg-blue-600/80 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-center transition-all duration-200"
            >
              Plan Meals
            </a>
          </div>

          {/* Grocery List Widget */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <span className="w-3 h-3 bg-green-400 rounded-full mr-3"></span>
                Shopping List
              </h2>
              <a
                href="/grocery"
                className="text-green-300 hover:text-green-200 text-sm"
              >
                View All →
              </a>
            </div>
            
            <div className="space-y-2">
              {groceryItems.length === 0 ? (
                <p className="text-purple-200 text-sm">No items on shopping list</p>
              ) : (
                groceryItems.map((item) => (
                  <div key={item.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-white font-medium">{item.item_name}</span>
                        <span className="text-purple-200 text-xs ml-2">({item.category})</span>
                      </div>
                      <div className="w-4 h-4 border-2 border-white/40 rounded"></div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <a
              href="/grocery"
              className="block w-full mt-4 bg-green-600/80 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-center transition-all duration-200"
            >
              Manage List
            </a>
          </div>

          {/* Home Projects Widget */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <span className="w-3 h-3 bg-purple-400 rounded-full mr-3"></span>
                Active Projects
              </h2>
              <a
                href="/projects"
                className="text-purple-300 hover:text-purple-200 text-sm"
              >
                View All →
              </a>
            </div>
            
            <div className="space-y-3">
              {renovationTasks.length === 0 ? (
                <p className="text-purple-200 text-sm">No active projects</p>
              ) : (
                renovationTasks.map((task) => (
                  <div key={task.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-white font-medium text-sm">{task.task_name}</h3>
                        <div className="flex items-center mt-1 space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${ 
                            task.priority === 'urgent' ? 'bg-red-500/20 text-red-300' :
                            task.priority === 'high' ? 'bg-orange-500/20 text-orange-300' :
                            task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-green-500/20 text-green-300'
                          }`}>
                            {task.priority}
                          </span>
                          {task.room && (
                            <span className="text-purple-200 text-xs">{task.room}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <a
              href="/projects"
              className="block w-full mt-4 bg-purple-600/80 hover:bg-purple-600 text-white py-2 px-4 rounded-lg text-center transition-all duration-200"
            >
              Manage Tasks
            </a>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 text-center">
            <div className="text-2xl font-bold text-white">{meals.length}</div>
            <div className="text-purple-200 text-sm">Upcoming Meals</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 text-center">
            <div className="text-2xl font-bold text-white">{groceryItems.length}</div>
            <div className="text-purple-200 text-sm">Items to Buy</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 text-center">
            <div className="text-2xl font-bold text-white">{renovationTasks.length}</div>
            <div className="text-purple-200 text-sm">Active Tasks</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {renovationTasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length}
            </div>
            <div className="text-purple-200 text-sm">High Priority</div>
          </div>
        </div>
      </div>
    </div>
  );
}