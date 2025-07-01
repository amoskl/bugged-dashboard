import { useState } from 'react'
import './App.css'

// Mock data for tasks
const initialTasks = [
  { 
    id: 1, 
    title: 'Review project proposal', 
    dueDate: new Date().toISOString().split('T')[0], // Today
    completed: false,
    priority: 'high'
  },
  { 
    id: 2, 
    title: 'Update documentation', 
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    completed: false,
    priority: 'medium'
  },
  { 
    id: 3, 
    title: 'Fix login bug', 
    dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Yesterday
    completed: true,
    priority: 'high'
  },
  { 
    id: 4, 
    title: 'Prepare presentation', 
    dueDate: new Date().toISOString().split('T')[0], // Today
    completed: false,
    priority: 'low'
  },
  { 
    id: 5, 
    title: 'Code review', 
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Day after tomorrow
    completed: true,
    priority: 'medium'
  }
]

function App() {
  const [tasks, setTasks] = useState(initialTasks)
  const [filter, setFilter] = useState('all')

  console.log('🔄 App rendered with filter:', filter)
  console.log('📋 Current tasks:', tasks)

  const getTodayString = () => {
    const today = new Date().toISOString().split('T')[0]
    console.log('📅 Today string:', today)
    return today
  }

  const filteredTasks = tasks.filter(task => {
    console.log(`🔍 Filtering task ${task.id} (${task.title}) with filter: ${filter}`)
    console.log(`   Task dueDate: ${task.dueDate}, Today: ${getTodayString()}`)
    
    if (filter === 'all') {
      console.log('   ✅ Filter: all - including task')
      return true
    }
    if (filter === 'completed') {
      console.log(`   ${task.completed ? '✅' : '❌'} Filter: completed - task.completed: ${task.completed}`)
      return task.completed
    }
    if (filter === 'pending') {
      console.log(`   ${!task.completed ? '✅' : '❌'} Filter: pending - task.completed: ${task.completed}`)
      return !task.completed
    }
    if (filter === 'due-today') {
      const isDueToday = task.dueDate === getTodayString()
      console.log(`   ${isDueToday ? '✅' : '❌'} Filter: due-today - isDueToday: ${isDueToday}`)
      return isDueToday
    }
    console.log('   ⚠️  Unknown filter, including task')
    return true
  })

  console.log('📊 Filtered tasks result:', filteredTasks)

  const markComplete = async (taskId) => {
    console.log(`🎯 markComplete called for task ${taskId}`)
    
    // Mock API call that "works" in backend
    console.log(`📡 Sending API request to mark task ${taskId} as complete...`)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log(`✅ API response: Task ${taskId} marked as complete in backend!`)
    
    // FIX: Uncomment and fix the state update
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
      console.log(`🔄 State updated for task ${taskId}. Updated tasks:`, updatedTasks)
      return updatedTasks
    })
  }

  const handleTaskHover = (task) => {
    console.log(`🖱️  Mouse entered task ${task.id}: "${task.title}"`)
    console.log(`   Task details:`, task)
    
    // FIX: Handle undefined category properly
    if (task.category && task.category.name) {
      console.log(`   Category: ${task.category.name}`)
    } else {
      console.log(`   No category defined for this task`)
    }
    
    console.log(`   Due: ${task.dueDate}, Priority: ${task.priority}, Completed: ${task.completed}`)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (dateString === getTodayString()) return 'Today'
    if (dateString === tomorrow.toISOString().split('T')[0]) return 'Tomorrow'
    return date.toLocaleDateString()
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#ef4444'
      case 'medium': return '#f59e0b'
      case 'low': return '#10b981'
      default: return '#6b7280'
    }
  }

  const handleFilterChange = (newFilter) => {
    console.log(`🔧 Filter changed from "${filter}" to "${newFilter}"`)
    setFilter(newFilter)
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Task Dashboard</h1>
        <p>Manage your daily tasks efficiently</p>
      </header>

      <div className="dashboard-content">
        <div className="filters">
          <button 
            className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => handleFilterChange('all')}
          >
            All Tasks ({tasks.length})
          </button>
          <button 
            className={filter === 'pending' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => handleFilterChange('pending')}
          >
            Pending ({tasks.filter(t => !t.completed).length})
          </button>
          <button 
            className={filter === 'completed' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => handleFilterChange('completed')}
          >
            Completed ({tasks.filter(t => t.completed).length})
          </button>
          <button 
            className={filter === 'due-today' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => handleFilterChange('due-today')}
          >
            Due Today ({tasks.filter(t => t.dueDate === getTodayString()).length})
          </button>
        </div>

        <div className="task-list">
          {filteredTasks.length === 0 ? (
            <div className="no-tasks">
              <p>No tasks found for the selected filter.</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div 
                key={task.id} 
                className={`task-item ${task.completed ? 'completed' : ''}`}
                onMouseEnter={() => handleTaskHover(task)} 
              >
                <div className="task-checkbox">
                  <input 
                    type="checkbox" 
                    checked={task.completed}
                    onChange={() => {
                      console.log(`☑️  Checkbox clicked for task ${task.id}`)
                      markComplete(task.id)
                    }} 
                  />
                </div>
                <div className="task-content">
                  <h3 className="task-title">{task.title}</h3>
                  <div className="task-meta">
                    <span className="task-due-date">
                      Due: {formatDate(task.dueDate)}
                    </span>
                    <span 
                      className="task-priority"
                      style={{ color: getPriorityColor(task.priority) }}
                    >
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="task-actions">
                  <button 
                    className="complete-btn"
                    onClick={() => {
                      console.log(`🔘 Complete button clicked for task ${task.id}`)
                      markComplete(task.id)
                    }}
                    disabled={task.completed}
                  >
                    {task.completed ? 'Completed' : 'Mark Complete'}
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

export default App
