'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface GroceryItem {
  id: string
  item_name: string
  quantity: number
  category: string
  is_purchased: boolean
  meal_id: string | null
}

interface Meal {
  id: string
  title: string
}

export default function GroceryPage() {
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([])
  const [meals, setMeals] = useState<Meal[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    item_name: '',
    quantity: 1,
    category: 'produce',
    meal_id: ''
  })

  const categories = ['produce', 'dairy', 'meat', 'pantry', 'frozen', 'bakery', 'other']

  const fetchGroceryItems = async () => {
    const { data, error } = await supabase
      .from('grocery_items')
      .select('*')
      .order('category', { ascending: true })
    
    if (error) {
      console.error('Error fetching grocery items:', error)
    } else {
      setGroceryItems(data || [])
    }
  }

  const fetchMeals = async () => {
    const { data, error } = await supabase
      .from('meals')
      .select('id, title')
      .order('meal_date', { ascending: true })
    
    if (error) {
      console.error('Error fetching meals:', error)
    } else {
      setMeals(data || [])
    }
  }

  const addGroceryItem = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { data, error } = await supabase
      .from('grocery_items')
      .insert([{
        item_name: formData.item_name,
        quantity: formData.quantity,
        category: formData.category,
        meal_id: formData.meal_id || null,
        user_id: '00000000-0000-0000-0000-000000000000'
      }])
    
    if (error) {
      console.error('Error adding grocery item:', error)
    } else {
      setFormData({ item_name: '', quantity: 1, category: 'produce', meal_id: '' })
      setShowForm(false)
      fetchGroceryItems()
    }
  }

  const togglePurchased = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('grocery_items')
      .update({ is_purchased: !currentStatus })
      .eq('id', id)
    
    if (error) {
      console.error('Error updating grocery item:', error)
    } else {
      fetchGroceryItems()
    }
  }

  const deleteItem = async (id: string) => {
    const { error } = await supabase
      .from('grocery_items')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting grocery item:', error)
    } else {
      fetchGroceryItems()
    }
  }

  useEffect(() => {
    fetchGroceryItems()
    fetchMeals()
  }, [])

  const groupedItems = groceryItems.reduce((groups, item) => {
    const category = item.category || 'other'
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(item)
    return groups
  }, {} as Record<string, GroceryItem[]>)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Grocery List</h1>
          <div className="space-x-4">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {showForm ? 'Cancel' : 'Add Item'}
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
            <h2 className="text-xl font-semibold mb-4">Add Grocery Item</h2>
            <form onSubmit={addGroceryItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.item_name}
                  onChange={(e) => setFormData({...formData, item_name: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Bananas, Milk, Chicken breast"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Related Meal (Optional)
                </label>
                <select
                  value={formData.meal_id}
                  onChange={(e) => setFormData({...formData, meal_id: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">No related meal</option>
                  {meals.map(meal => (
                    <option key={meal.id} value={meal.id}>
                      {meal.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
              >
                Add Item
              </button>
            </form>
          </div>
        )}

        <div className="space-y-6">
          {Object.keys(groupedItems).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No grocery items yet. Add your first item!
            </div>
          ) : (
            Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 capitalize">
                  {category} ({items.length} items)
                </h3>
                
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={item.is_purchased}
                          onChange={() => togglePurchased(item.id, item.is_purchased)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className={`${item.is_purchased ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {item.item_name}
                        </span>
                        <span className="text-sm text-gray-500">
                          (Qty: {item.quantity})
                        </span>
                      </div>
                      
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}