'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Meal {
  id: string
  title: string
  description: string
  meal_date: string
  meal_type: string
  ingredients: string[]
}

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meal_date: '',
    meal_type: 'dinner',
    ingredients: ''
  })

  const fetchMeals = async () => {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .order('meal_date', { ascending: true })
    
    if (error) {
      console.error('Error fetching meals:', error)
    } else {
      setMeals(data || [])
    }
  }

  const addMeal = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { data, error } = await supabase
      .from('meals')
      .insert([{
        title: formData.title,
        description: formData.description,
        meal_date: formData.meal_date,
        meal_type: formData.meal_type,
        ingredients: formData.ingredients.split(',').map(i => i.trim()),
        user_id: '00000000-0000-0000-0000-000000000000' // Temporary UUID format
      }])
    
    if (error) {
      console.error('Error adding meal:', error)
    } else {
      setFormData({ title: '', description: '', meal_date: '', meal_type: 'dinner', ingredients: '' })
      setShowForm(false)
      fetchMeals()
    }
  }

  useEffect(() => {
    fetchMeals()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meal Planning</h1>
          <div className="space-x-4">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {showForm ? 'Cancel' : 'Add Meal'}
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
            <h2 className="text-xl font-semibold mb-4">Add New Meal</h2>
            <form onSubmit={addMeal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meal Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.meal_date}
                    onChange={(e) => setFormData({...formData, meal_date: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meal Type
                  </label>
                  <select
                    value={formData.meal_type}
                    onChange={(e) => setFormData({...formData, meal_type: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ingredients (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.ingredients}
                  onChange={(e) => setFormData({...formData, ingredients: e.target.value})}
                  placeholder="chicken, rice, vegetables, olive oil"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Add Meal
              </button>
            </form>
          </div>
        )}

        <div className="grid gap-4">
          {meals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No meals planned yet. Add your first meal!
            </div>
          ) : (
            meals.map((meal) => (
              <div key={meal.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-800">{meal.title}</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {meal.meal_type}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-2">{meal.description}</p>
                <p className="text-sm text-gray-500 mb-3">
                  Scheduled for: {new Date(meal.meal_date).toLocaleDateString()}
                </p>
                
                {meal.ingredients && meal.ingredients.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Ingredients:</h4>
                    <div className="flex flex-wrap gap-1">
                      {meal.ingredients.map((ingredient, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                        >
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}