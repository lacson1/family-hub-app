import { useState, useEffect } from 'react'
import { Calendar, CheckSquare, Users, Home, Settings, Plus, Edit2, Trash2, ShoppingCart, MessageSquare, UtensilsCrossed, DollarSign, GitBranch, Contact as ContactIcon, FileText, Menu, TrendingUp, TrendingDown, Wallet, Target, BarChart3, Printer, TestTube2, Play } from 'lucide-react'
import { Modal, ConfirmDialog, Toast } from './components/Modal'
import { TaskForm, EventForm } from './components/Forms'
import { FamilyMemberForm } from './components/FamilyMemberForm'
import { ShoppingForm } from './components/ShoppingForm'
import { MessageForm } from './components/MessageForm'
import { TransactionForm } from './components/TransactionForm'
import { MealForm } from './components/MealForm'
import { BudgetForm } from './components/BudgetForm'
import { MoneyCharts } from './components/MoneyCharts'
import { EnhancedFamilyTree } from './components/EnhancedFamilyTree'
import { RelationshipForm } from './components/RelationshipForm'
import { FamilyMemberDetails } from './components/FamilyMemberDetails'
import { SettingsForm, type AppSettings } from './components/SettingsForm'
import { NotificationPanel } from './components/NotificationPanel'
import { PremiumCalendar } from './components/PremiumCalendar'
import { PWAInstallPrompt, PWAInstallStatus } from './components/PWAInstallPrompt'
import { ContactForm } from './components/ContactForm'
import { AuthPage } from './components/AuthPage'
import { ProfilePage } from './components/ProfilePage'
import { UITestPage } from './components/UITestPage'
import { UserFlowDemo } from './components/UserFlowDemo'
import { notificationsAPI, type Notification, tasksAPI, eventsAPI, familyMembersAPI, shoppingItemsAPI, mealsAPI, transactionsAPI, familyRelationshipsAPI, contactsAPI, type Contact, type Event } from './services/api'
import type { CalendarEvent } from './services/googleCalendar'
import { messagesAPI } from './services/messagesAPI'
import { googleCalendarService } from './services/googleCalendar'
import { useAuth } from './contexts/AuthContext'
import { TypingIndicator } from './components/TypingIndicator'
import { MessageAttachment } from './components/MessageAttachment'

interface Task {
  id: string
  title: string
  assignedTo: string
  dueDate: string
  priority: 'low' | 'medium' | 'high'
  completed: boolean
}

// Removed local Event interface in favor of shared type from services/api

interface FamilyMember {
  id: string
  name: string
  role: string
  color: string
  avatar_url?: string
  avatar_pattern?: string
  birth_date?: string
  phone?: string
  email?: string
  address?: string
  notes?: string
  generation?: number
}

interface ShoppingItem {
  id: string
  name: string
  quantity: string
  category: 'Groceries' | 'Household' | 'Personal' | 'Other'
  notes?: string
  purchased: boolean
  addedBy: string
}

interface Message {
  id: string
  senderId: string
  senderName?: string
  recipientId: string
  recipientName?: string
  content: string
  timestamp: string
  read: boolean
  readAt?: string
  attachmentUrl?: string
  attachmentType?: string
  attachmentName?: string
  edited?: boolean
  editedAt?: string
}

interface Ingredient {
  name: string
  amount: string
  unit?: string
}

interface Meal {
  id: string
  name: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  date: string
  notes?: string
  prepTime?: string
  cookTime?: string
  servings?: number
  ingredients?: Ingredient[]
  instructions?: string
  photoUrl?: string
  isFavorite?: boolean
  isTemplate?: boolean
  tags?: string[]
  createdBy: string
}

interface Transaction {
  id: string
  type: 'income' | 'expense'
  category: string
  amount: number
  description?: string
  date: string
  payment_method?: string
  addedBy: string
  is_recurring?: boolean
  recurrence_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  recurrence_end_date?: string
}

interface Budget {
  id: string
  category: string
  amount: number
  period: 'monthly' | 'yearly'
  spent_amount?: number
  remaining?: number
}

interface FamilyRelationship {
  id: string
  person_id: string
  related_person_id: string
  relationship_type: 'parent' | 'child' | 'spouse' | 'sibling'
  person_name?: string
  person_color?: string
  related_person_name?: string
  related_person_color?: string
}

// Default settings
const defaultSettings: AppSettings = {
  emailNotifications: true,
  pushNotifications: true,
  taskReminders: true,
  eventReminders: true,
  theme: 'light',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  compactView: false,
  showLastSeen: true,
  readReceipts: true,
  defaultView: 'dashboard',
  autoMarkTasksComplete: false,
  showCompletedTasks: true,
}

// Load settings from localStorage or use defaults
const loadSettings = (): AppSettings => {
  try {
    const saved = localStorage.getItem('familyHubSettings')
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings
  } catch {
    return defaultSettings
  }
}

function App() {
  const { user, isAuthenticated, isLoading } = useAuth()

  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settings, setSettings] = useState<AppSettings>(loadSettings())

  // Money tab state
  const [moneyTab, setMoneyTab] = useState<'overview' | 'transactions' | 'budgets' | 'charts'>('overview')
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)

  // State for data
  const [tasks, setTasks] = useState<Task[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [typingUsers] = useState<Map<string, string>>(new Map())
  const [meals, setMeals] = useState<Meal[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([
    {
      id: '1',
      category: 'Groceries',
      amount: 500,
      period: 'monthly'
    },
    {
      id: '2',
      category: 'Utilities',
      amount: 200,
      period: 'monthly'
    },
  ])
  const [relationships, setRelationships] = useState<FamilyRelationship[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])

  // Modal states
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showFamilyModal, setShowFamilyModal] = useState(false)
  const [showShoppingModal, setShowShoppingModal] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [showMealModal, setShowMealModal] = useState(false)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [showRelationshipModal, setShowRelationshipModal] = useState(false)
  const [showMemberDetailsModal, setShowMemberDetailsModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)

  // Editing states
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null)
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [selectedMemberForDetails, setSelectedMemberForDetails] = useState<FamilyMember | null>(null)

  // Conversation state
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [isGoogleConnected, setIsGoogleConnected] = useState(false)

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  // Confirm dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [deleteAction, setDeleteAction] = useState<(() => void) | null>(null)

  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Data loading state
  const [isDataLoading, setIsDataLoading] = useState(true)

  // Additional modal states for meal search and filter
  const [mealSearchTerm, setMealSearchTerm] = useState('')
  const [mealFilterType, setMealFilterType] = useState<'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack'>('all')
  const [mealShowFavoritesOnly, setMealShowFavoritesOnly] = useState(false)
  const [draggedMeal, setDraggedMeal] = useState<Meal | null>(null)
  const [editingShoppingItem, setEditingShoppingItem] = useState<ShoppingItem | null>(null)

  // Contact search and filter states
  const [contactSearchTerm, setContactSearchTerm] = useState('')
  const [contactCategoryFilter, setContactCategoryFilter] = useState<Contact['category'] | 'All'>('All')

  // Format date based on settings
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()

    switch (settings.dateFormat) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`
      default: // MM/DD/YYYY
        return `${month}/${day}/${year}`
    }
  }

  // Format time based on settings
  const formatTime = (timeString: string) => {
    if (!timeString) return timeString

    if (settings.timeFormat === '24h') {
      return timeString // Already in 24h format (HH:mm)
    }

    // Convert to 12h format
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  // Load data from backend on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load all data in parallel
        const [tasksData, eventsData, familyMembersData, shoppingData, mealsData, transactionsData, relationshipsData, contactsData, messagesData] = await Promise.all([
          tasksAPI.getAll().catch(() => []),
          eventsAPI.getAll().catch(() => []),
          familyMembersAPI.getAll().catch(() => []),
          shoppingItemsAPI.getAll().catch(() => []),
          mealsAPI.getAll().catch(() => []),
          transactionsAPI.getAll().catch(() => []),
          familyRelationshipsAPI.getAll().catch(() => []),
          contactsAPI.getAll().catch(() => []),
          messagesAPI.getAll().catch(() => [])
        ])

        // Transform backend data to match frontend types
        setTasks(tasksData.map((t: unknown) => {
          const task = t as { id: string; title: string; assigned_to: string; due_date: string; priority: Task['priority']; completed: boolean }
          return {
            id: task.id,
            title: task.title,
            assignedTo: task.assigned_to,
            dueDate: task.due_date,
            priority: task.priority,
            completed: task.completed
          }
        }))

        setEvents(eventsData)
        setFamilyMembers(familyMembersData)

        setShoppingItems(shoppingData.map((item: unknown) => {
          const shopping = item as { id: string; name: string; quantity: string; category: ShoppingItem['category']; notes?: string; purchased: boolean; added_by: string }
          return {
            id: shopping.id,
            name: shopping.name,
            quantity: shopping.quantity,
            category: shopping.category,
            notes: shopping.notes,
            purchased: shopping.purchased,
            addedBy: shopping.added_by
          }
        }))

        setMeals(mealsData.map((meal: unknown) => {
          const m = meal as { id: string; name: string; meal_type: Meal['mealType']; date: string; notes?: string; prep_time?: string; created_by: string }
          return {
            id: m.id,
            name: m.name,
            mealType: m.meal_type,
            date: m.date,
            notes: m.notes,
            prepTime: m.prep_time,
            createdBy: m.created_by
          }
        }))

        setTransactions(transactionsData.map((transaction: unknown) => {
          const t = transaction as { id: string; type: Transaction['type']; category: string; amount: number; description?: string; date: string; payment_method?: string; added_by: string }
          return {
            id: t.id,
            type: t.type,
            category: t.category,
            amount: Number(t.amount),
            description: t.description,
            date: t.date,
            payment_method: t.payment_method,
            addedBy: t.added_by
          }
        }))

        setRelationships(relationshipsData)
        setContacts(contactsData)

        // Transform messages data
        setMessages(messagesData.map((msg: unknown) => {
          const m = msg as { id: string; sender_id: string; recipient_id: string; content: string; read: boolean; read_at?: string; attachment_url?: string; attachment_type?: string; attachment_name?: string; edited?: boolean; edited_at?: string; created_at: string }
          // Find sender and recipient names from family members
          const sender = familyMembersData.find((fm: { id: string }) => fm.id === m.sender_id)
          const recipient = familyMembersData.find((fm: { id: string }) => fm.id === m.recipient_id)
          return {
            id: m.id,
            senderId: m.sender_id,
            senderName: sender?.name || 'Unknown',
            recipientId: m.recipient_id,
            recipientName: recipient?.name || 'Unknown',
            content: m.content,
            timestamp: m.created_at,
            read: m.read,
            readAt: m.read_at,
            attachmentUrl: m.attachment_url,
            attachmentType: m.attachment_type,
            attachmentName: m.attachment_name,
            edited: m.edited,
            editedAt: m.edited_at
          }
        }))
      } catch (err) {
        console.error('Error loading data:', err)
      } finally {
        setIsDataLoading(false)
      }
    }

    loadData()
  }, [])

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Initialize Google Calendar
  useEffect(() => {
    const initGoogle = async () => {
      const connected = await googleCalendarService.init()
      setIsGoogleConnected(connected)
    }
    initGoogle()
  }, [])

  // Fetch notifications on mount and periodically
  useEffect(() => {
    if (!user) return

    const currentUserName = user.name || 'User'

    const fetchNotifications = async () => {
      try {
        const data = await notificationsAPI.getAll({ user_id: currentUserName })
        setNotifications(data)
        const unread = data.filter((n: Notification) => !n.read)
        setUnreadCount(unread.length)
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      }
    }

    fetchNotifications()

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)

    return () => clearInterval(interval)
  }, [user])

  // Show loading or auth screens after all hooks
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <AuthPage />
  }

  if (isDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Family Hub...</p>
        </div>
      </div>
    )
  }

  // At this point, user is guaranteed to be non-null
  const userName = user.name || 'User'
  const currentUser = familyMembers.find(m => m.name === userName) || familyMembers[0] || null

  // Google Calendar functions
  const handleGoogleConnect = async () => {
    const success = await googleCalendarService.signIn()
    if (success) {
      setIsGoogleConnected(true)
      showToast('Connected to Google Calendar!', 'success')
    } else {
      showToast('Failed to connect to Google Calendar', 'error')
    }
  }

  const handleSyncWithGoogle = async () => {
    if (!isGoogleConnected) {
      showToast('Please connect to Google Calendar first', 'error')
      return
    }

    showToast('Syncing with Google Calendar...', 'info')

    const calendarEvents: CalendarEvent[] = events
      .filter(e => !!e.time) // only timed events supported by current google sync
      .map(e => ({
        id: e.google_event_id,
        title: e.title,
        date: e.date,
        time: e.time as string,
        type: e.type,
        description: e.description,
      }))

    const result = await googleCalendarService.syncAllEventsToGoogle(calendarEvents)

    if (result.success > 0) {
      showToast(`Successfully synced ${result.success} events to Google Calendar!`, 'success')
    } else {
      showToast('Failed to sync events', 'error')
    }
  }

  const handleImportFromGoogle = async () => {
    if (!isGoogleConnected) {
      showToast('Please connect to Google Calendar first', 'error')
      return
    }

    showToast('Importing from Google Calendar...', 'info')

    const googleEvents = await googleCalendarService.importEventsFromGoogle()

    if (googleEvents.length > 0) {
      // Merge with existing events (avoid duplicates)
      const existingIds = new Set(events.map(e => e.google_event_id).filter(Boolean))
      const newEvents = googleEvents.filter(ge => !existingIds.has(ge.id))

      newEvents.forEach(googleEvent => {
        const newEvent: Event = {
          id: Date.now().toString() + Math.random(),
          title: googleEvent.title,
          date: googleEvent.date,
          time: googleEvent.time,
          type: googleEvent.type,
          description: googleEvent.description,
          google_event_id: googleEvent.id
        }
        setEvents(prev => [...prev, newEvent])
      })

      showToast(`Imported ${newEvents.length} events from Google Calendar!`, 'success')
    } else {
      showToast('No new events to import', 'info')
    }
  }

  // Notification functions
  const createNotification = async (
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    category: 'task' | 'event' | 'message' | 'shopping' | 'meal' | 'family' | 'general' = 'general',
    related_id?: string
  ) => {
    try {
      const currentUserName = user?.name || 'User'
      const newNotification = await notificationsAPI.create({
        user_id: currentUserName,
        title,
        message,
        type,
        category,
        related_id,
      })
      setNotifications([newNotification, ...notifications])
      setUnreadCount(prev => prev + 1)
    } catch (error) {
      console.error('Failed to create notification:', error)
    }
  }

  const handleMarkNotificationAsRead = async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id)
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const handleMarkAllNotificationsAsRead = async () => {
    try {
      // Mark all unread notifications as read individually
      const unreadNotifications = notifications.filter(n => !n.read)
      await Promise.all(unreadNotifications.map(n => notificationsAPI.markAsRead(n.id)))
      setNotifications(notifications.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const handleDeleteNotification = async (id: string) => {
    try {
      await notificationsAPI.delete(id)
      const notification = notifications.find(n => n.id === id)
      setNotifications(notifications.filter(n => n.id !== id))
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const handleClearReadNotifications = async () => {
    try {
      // Delete all read notifications individually
      const readNotifications = notifications.filter(n => n.read)
      await Promise.all(readNotifications.map(n => notificationsAPI.delete(n.id)))
      setNotifications(notifications.filter(n => !n.read))
    } catch (error) {
      console.error('Failed to clear read notifications:', error)
    }
  }

  // Settings functions
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings)
    localStorage.setItem('familyHubSettings', JSON.stringify(newSettings))
    showToast('Settings saved successfully!', 'success')
  }

  // Navigation organized into logical sections with color coding
  const navigationSections = [
    {
      title: 'Main',
      color: 'blue',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
      ]
    },
    {
      title: 'Planning',
      color: 'purple',
      items: [
        { id: 'calendar', label: 'Calendar', icon: Calendar },
        { id: 'tasks', label: 'Tasks', icon: CheckSquare },
      ]
    },
    {
      title: 'Daily Life',
      color: 'green',
      items: [
        { id: 'shopping', label: 'Shopping', icon: ShoppingCart },
        { id: 'meals', label: 'Meals', icon: UtensilsCrossed },
      ]
    },
    {
      title: 'Communication',
      color: 'cyan',
      items: [
        { id: 'messages', label: 'Messages', icon: MessageSquare },
      ]
    },
    {
      title: 'Finance',
      color: 'emerald',
      items: [
        { id: 'money', label: 'Money', icon: DollarSign },
      ]
    },
    {
      title: 'People',
      color: 'pink',
      items: [
        { id: 'family', label: 'Family', icon: Users },
        { id: 'familytree', label: 'Family Tree', icon: GitBranch },
        { id: 'contacts', label: 'Contacts', icon: ContactIcon },
      ]
    },
    {
      title: 'Files',
      color: 'amber',
      items: [
        { id: 'documents', label: 'Documents', icon: FileText },
      ]
    },
    {
      title: 'System',
      color: 'slate',
      items: [
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    },
    // Add development tools
    ...(import.meta.env.DEV ? [{
      title: 'Development',
      color: 'orange',
      items: [
        { id: 'uitest', label: 'UI Test', icon: TestTube2 },
        { id: 'userflow', label: 'User Flow', icon: Play }
      ]
    }] : []),
  ]

  // Helper function to get color classes
  const getColorClasses = (color: string, isActive: boolean) => {
    const colorMap: Record<string, { active: string; inactive: string; hover: string; header: string }> = {
      blue: {
        active: 'bg-blue-50 text-blue-600',
        inactive: 'text-gray-700 hover:bg-blue-50/50 hover:text-blue-600',
        hover: 'hover:bg-blue-50',
        header: 'text-blue-600'
      },
      purple: {
        active: 'bg-purple-50 text-purple-600',
        inactive: 'text-gray-700 hover:bg-purple-50/50 hover:text-purple-600',
        hover: 'hover:bg-purple-50',
        header: 'text-purple-600'
      },
      green: {
        active: 'bg-green-50 text-green-600',
        inactive: 'text-gray-700 hover:bg-green-50/50 hover:text-green-600',
        hover: 'hover:bg-green-50',
        header: 'text-green-600'
      },
      cyan: {
        active: 'bg-cyan-50 text-cyan-600',
        inactive: 'text-gray-700 hover:bg-cyan-50/50 hover:text-cyan-600',
        hover: 'hover:bg-cyan-50',
        header: 'text-cyan-600'
      },
      emerald: {
        active: 'bg-emerald-50 text-emerald-600',
        inactive: 'text-gray-700 hover:bg-emerald-50/50 hover:text-emerald-600',
        hover: 'hover:bg-emerald-50',
        header: 'text-emerald-600'
      },
      pink: {
        active: 'bg-pink-50 text-pink-600',
        inactive: 'text-gray-700 hover:bg-pink-50/50 hover:text-pink-600',
        hover: 'hover:bg-pink-50',
        header: 'text-pink-600'
      },
      amber: {
        active: 'bg-amber-50 text-amber-600',
        inactive: 'text-gray-700 hover:bg-amber-50/50 hover:text-amber-600',
        hover: 'hover:bg-amber-50',
        header: 'text-amber-600'
      },
      slate: {
        active: 'bg-slate-50 text-slate-600',
        inactive: 'text-gray-700 hover:bg-slate-50/50 hover:text-slate-600',
        hover: 'hover:bg-slate-50',
        header: 'text-slate-600'
      },
      orange: {
        active: 'bg-orange-50 text-orange-600',
        inactive: 'text-gray-700 hover:bg-orange-50/50 hover:text-orange-600',
        hover: 'hover:bg-orange-50',
        header: 'text-orange-600'
      }
    }
    return isActive ? colorMap[color].active : colorMap[color].inactive
  }

  // Task functions
  const handleAddTask = async (taskData: { title: string; assignedTo: string; dueDate: string; priority: 'low' | 'medium' | 'high' }) => {
    try {
      const newTask = await tasksAPI.create({
        title: taskData.title,
        assigned_to: taskData.assignedTo,
        due_date: taskData.dueDate,
        priority: taskData.priority
      })
      setTasks([...tasks, {
        id: newTask.id,
        title: newTask.title,
        assignedTo: newTask.assigned_to,
        dueDate: newTask.due_date,
        priority: newTask.priority,
        completed: newTask.completed
      }])
      setShowTaskModal(false)
      showToast('Task added successfully!', 'success')
      createNotification(
        'New Task Created',
        `Task "${taskData.title}" has been assigned to ${taskData.assignedTo}`,
        'info',
        'task',
        newTask.id
      )
    } catch (error) {
      console.error('Error adding task:', error)
      showToast('Failed to add task', 'error')
    }
  }

  const handleEditTask = async (taskData: { title: string; assignedTo: string; dueDate: string; priority: 'low' | 'medium' | 'high' }) => {
    if (editingTask) {
      try {
        const updated = await tasksAPI.update(editingTask.id, {
          title: taskData.title,
          assigned_to: taskData.assignedTo,
          due_date: taskData.dueDate,
          priority: taskData.priority
        })
        setTasks(tasks.map(task =>
          task.id === editingTask.id
            ? {
              id: updated.id,
              title: updated.title,
              assignedTo: updated.assigned_to,
              dueDate: updated.due_date,
              priority: updated.priority,
              completed: updated.completed
            }
            : task
        ))
        setEditingTask(null)
        setShowTaskModal(false)
        showToast('Task updated successfully!', 'success')
      } catch (error) {
        console.error('Error updating task:', error)
        showToast('Failed to update task', 'error')
      }
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await tasksAPI.delete(taskId)
      setTasks(tasks.filter(task => task.id !== taskId))
      showToast('Task deleted successfully!', 'success')
    } catch (error) {
      console.error('Error deleting task:', error)
      showToast('Failed to delete task', 'error')
    }
  }

  const handleToggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    try {
      const updated = await tasksAPI.update(taskId, { completed: !task.completed })
      setTasks(tasks.map(t =>
        t.id === taskId
          ? { ...t, completed: updated.completed }
          : t
      ))
      showToast('Task status updated!', 'success')
      if (!task.completed) {
        createNotification(
          'Task Completed',
          `"${task.title}" has been marked as complete!`,
          'success',
          'task',
          taskId
        )
      }
    } catch (error) {
      console.error('Error toggling task:', error)
      showToast('Failed to update task', 'error')
    }
  }

  // Event functions
  const handleAddEvent = async (eventData: Omit<Event, 'id' | 'attendees' | 'attachments' | 'created_at' | 'updated_at'>) => {
    try {
      const newEvent = await eventsAPI.create(eventData)
      setEvents([...events, newEvent])
      setShowEventModal(false)
      showToast('Event added successfully!', 'success')

      const timeText = eventData.all_day
        ? 'all day'
        : (eventData.time
          ? `at ${eventData.time}${eventData.end_time ? ` - ${eventData.end_time}` : ''}`
          : '')

      createNotification(
        'New Event Created',
        `Event "${eventData.title}" scheduled for ${eventData.date} ${timeText}`,
        'info',
        'event',
        newEvent.id
      )
    } catch (error) {
      console.error('Error adding event:', error)
      showToast('Failed to add event', 'error')
    }
  }

  const handleEditEvent = async (id: string, eventData: Partial<Omit<Event, 'id' | 'attachments' | 'created_at' | 'updated_at'>>) => {
    if (id) {
      try {
        const updated = await eventsAPI.update(id, eventData)
        setEvents(events.map(event =>
          event.id === id
            ? updated
            : event
        ))
        setEditingEvent(null)
        setShowEventModal(false)
        showToast('Event updated successfully!', 'success')
      } catch (error) {
        console.error('Error updating event:', error)
        showToast('Failed to update event', 'error')
      }
    }
  }

  const handleUpdateEventDateTime = async (id: string, datetime: { date?: string; time?: string; end_time?: string }) => {
    try {
      const updated = await eventsAPI.updateDateTime(id, datetime)
      setEvents(events.map(event =>
        event.id === id
          ? updated
          : event
      ))
      showToast('Event time updated!', 'success')
    } catch (error) {
      console.error('Error updating event time:', error)
      showToast('Failed to update event time', 'error')
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await eventsAPI.delete(eventId)
      setEvents(events.filter(event => event.id !== eventId))
      showToast('Event deleted successfully!', 'success')
    } catch (error) {
      console.error('Error deleting event:', error)
      showToast('Failed to delete event', 'error')
    }
  }

  // Family member functions
  const handleAddMember = async (memberData: Omit<FamilyMember, 'id'>) => {
    try {
      const newMember = await familyMembersAPI.create(memberData)
      setFamilyMembers([...familyMembers, newMember])
      setShowFamilyModal(false)
      showToast('Family member added successfully!', 'success')
      createNotification(
        'New Family Member',
        `${memberData.name} has been added as ${memberData.role}`,
        'success',
        'family',
        newMember.id
      )
    } catch (error) {
      console.error('Error adding family member:', error)
      showToast('Failed to add family member', 'error')
    }
  }

  const handleEditMember = async (memberData: { name: string; role: string; color: string }) => {
    if (editingMember) {
      try {
        const updatedMember = await familyMembersAPI.update(editingMember.id, memberData)
        setFamilyMembers(familyMembers.map(member =>
          member.id === editingMember.id ? updatedMember : member
        ))
        setEditingMember(null)
        setShowFamilyModal(false)
        showToast('Family member updated successfully!', 'success')
      } catch (error) {
        console.error('Error updating family member:', error)
        showToast('Failed to update family member', 'error')
      }
    }
  }

  const handleDeleteMember = async (memberId: string) => {
    try {
      await familyMembersAPI.delete(memberId)
      setFamilyMembers(familyMembers.filter(member => member.id !== memberId))
      showToast('Family member removed successfully!', 'success')
    } catch (error) {
      console.error('Error deleting family member:', error)
      showToast('Failed to delete family member', 'error')
    }
  }

  const handleViewMemberDetails = (member: FamilyMember) => {
    setSelectedMemberForDetails(member)
    setShowMemberDetailsModal(true)
  }

  const getTaskCountForMember = (memberName: string) => {
    return tasks.filter(task => task.assignedTo === memberName && !task.completed).length
  }

  // Shopping functions
  const handleAddShoppingItem = async (itemData: { name: string; quantity: string; category: 'Groceries' | 'Household' | 'Personal' | 'Other'; notes?: string }) => {
    try {
      const newItem = await shoppingItemsAPI.create({
        ...itemData,
        added_by: userName
      })
      setShoppingItems([...shoppingItems, {
        id: newItem.id,
        name: newItem.name,
        quantity: newItem.quantity,
        category: newItem.category,
        notes: newItem.notes,
        purchased: newItem.purchased,
        addedBy: newItem.added_by
      }])
      setShowShoppingModal(false)
      showToast('Item added to shopping list!', 'success')
    } catch (error) {
      console.error('Error adding shopping item:', error)
      showToast('Failed to add item', 'error')
    }
  }

  const handleEditShoppingItem = async (itemData: { name: string; quantity: string; category: 'Groceries' | 'Household' | 'Personal' | 'Other'; notes?: string }) => {
    if (editingShoppingItem) {
      try {
        const updated = await shoppingItemsAPI.update(editingShoppingItem.id, itemData)
        setShoppingItems(shoppingItems.map(item =>
          item.id === editingShoppingItem.id
            ? {
              id: updated.id,
              name: updated.name,
              quantity: updated.quantity,
              category: updated.category,
              notes: updated.notes,
              purchased: updated.purchased,
              addedBy: updated.added_by
            }
            : item
        ))
        setEditingShoppingItem(null)
        setShowShoppingModal(false)
        showToast('Shopping item updated!', 'success')
      } catch (error) {
        console.error('Error updating shopping item:', error)
        showToast('Failed to update item', 'error')
      }
    }
  }

  const handleDeleteShoppingItem = async (itemId: string) => {
    try {
      await shoppingItemsAPI.delete(itemId)
      setShoppingItems(shoppingItems.filter(item => item.id !== itemId))
      showToast('Item removed from shopping list!', 'success')
    } catch (error) {
      console.error('Error deleting shopping item:', error)
      showToast('Failed to remove item', 'error')
    }
  }

  const handleToggleShoppingItem = async (itemId: string) => {
    const item = shoppingItems.find(i => i.id === itemId)
    if (!item) return

    try {
      const updated = await shoppingItemsAPI.update(itemId, { purchased: !item.purchased })
      setShoppingItems(shoppingItems.map(i =>
        i.id === itemId
          ? { ...i, purchased: updated.purchased }
          : i
      ))
      showToast(item.purchased ? 'Item marked as needed!' : 'Item marked as purchased!', 'success')
    } catch (error) {
      console.error('Error toggling shopping item:', error)
      showToast('Failed to update item', 'error')
    }
  }

  // Message functions
  const handleSendMessage = async (messageData: {
    content: string
    recipientId: string
    attachmentUrl?: string
    attachmentType?: string
    attachmentName?: string
  }) => {
    if (!user) return
    const recipient = familyMembers.find(m => m.id === messageData.recipientId)
    if (!recipient) return

    try {
      // Upload attachment if provided
      let attachmentData = {}
      if (messageData.attachmentUrl && messageData.attachmentType && messageData.attachmentName) {
        // Note: The attachment URL from the form is a blob URL, we need to get the file
        // For now, we'll pass it through - in a full implementation, you'd upload the file first
        attachmentData = {
          attachment_url: messageData.attachmentUrl,
          attachment_type: messageData.attachmentType,
          attachment_name: messageData.attachmentName
        }
      }

      const newMessage = await messagesAPI.create({
        sender_id: user.id,
        recipient_id: messageData.recipientId,
        content: messageData.content,
        ...attachmentData
      })

      // Transform to local format
      const localMessage: Message = {
        id: newMessage.id,
        senderId: newMessage.sender_id,
        senderName: user.name,
        recipientId: newMessage.recipient_id,
        recipientName: recipient.name,
        content: newMessage.content,
        timestamp: newMessage.created_at,
        read: newMessage.read,
        readAt: newMessage.read_at,
        attachmentUrl: newMessage.attachment_url,
        attachmentType: newMessage.attachment_type,
        attachmentName: newMessage.attachment_name,
        edited: newMessage.edited,
        editedAt: newMessage.edited_at
      }

      setMessages([...messages, localMessage])
      setShowMessageModal(false)
      showToast('Message sent!', 'success')
      createNotification(
        'New Message Sent',
        `Message sent to ${recipient.name}`,
        'success',
        'message',
        newMessage.id
      )
    } catch (error) {
      console.error('Error sending message:', error)
      showToast('Failed to send message', 'error')
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await messagesAPI.delete(messageId)
      setMessages(messages.filter(msg => msg.id !== messageId))
      showToast('Message deleted!', 'success')
    } catch (error) {
      console.error('Error deleting message:', error)
      showToast('Failed to delete message', 'error')
    }
  }

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const updatedMessage = await messagesAPI.markAsRead(messageId)
      setMessages(messages.map(msg =>
        msg.id === messageId ? {
          ...msg,
          read: true,
          readAt: updatedMessage.read_at
        } : msg
      ))
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }


  const getConversations = () => {
    if (!currentUser) return []

    const conversationMap = new Map<string, Message[]>()

    messages.forEach(msg => {
      const otherPersonId = msg.senderId === currentUser?.id ? msg.recipientId : msg.senderId
      if (!conversationMap.has(otherPersonId)) {
        conversationMap.set(otherPersonId, [])
      }
      conversationMap.get(otherPersonId)!.push(msg)
    })

    return Array.from(conversationMap.entries()).map(([personId, msgs]) => {
      const person = familyMembers.find(m => m.id === personId)
      const sortedMsgs = msgs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      const unreadCount = msgs.filter(m => m.recipientId === currentUser?.id && !m.read).length

      return {
        personId,
        personName: person?.name || 'Unknown',
        personColor: person?.color || 'bg-gray-500',
        messages: sortedMsgs,
        lastMessage: sortedMsgs[0],
        unreadCount
      }
    }).sort((a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime())
  }

  // Relationship functions
  const handleAddRelationship = async (relationshipData: {
    person_id: string
    related_person_id: string
    relationship_type: 'parent' | 'child' | 'spouse' | 'sibling'
  }) => {
    try {
      const newRelationship = await familyRelationshipsAPI.create(relationshipData)
      setRelationships([...relationships, newRelationship])

      // Add reciprocal relationship
      const reciprocalType = getReciprocalType(relationshipData.relationship_type)
      if (reciprocalType) {
        const reciprocalRelationship = await familyRelationshipsAPI.create({
          person_id: relationshipData.related_person_id,
          related_person_id: relationshipData.person_id,
          relationship_type: reciprocalType,
        })
        setRelationships(prev => [...prev, reciprocalRelationship])
      }

      setShowRelationshipModal(false)
      showToast('Relationship added successfully!', 'success')
    } catch (error) {
      console.error('Error adding relationship:', error)
      showToast('Failed to add relationship', 'error')
    }
  }

  const handleDeleteRelationship = async (relationshipId: string) => {
    try {
      const relationship = relationships.find(r => r.id === relationshipId)
      if (!relationship) return

      await familyRelationshipsAPI.delete(relationshipId)

      // Find and delete reciprocal relationship
      const reciprocalType = getReciprocalType(relationship.relationship_type)
      const reciprocal = relationships.find(r =>
        r.person_id === relationship.related_person_id &&
        r.related_person_id === relationship.person_id &&
        r.relationship_type === reciprocalType
      )

      if (reciprocal) {
        await familyRelationshipsAPI.delete(reciprocal.id)
      }

      // Update state
      setRelationships(prev =>
        prev.filter(r =>
          r.id !== relationshipId &&
          (reciprocal ? r.id !== reciprocal.id : true)
        )
      )
      showToast('Relationship deleted successfully!', 'success')
    } catch (error) {
      console.error('Error deleting relationship:', error)
      showToast('Failed to delete relationship', 'error')
    }
  }

  const getReciprocalType = (type: string): 'parent' | 'child' | 'spouse' | 'sibling' | null => {
    const reciprocals: { [key: string]: 'parent' | 'child' | 'spouse' | 'sibling' } = {
      'parent': 'child',
      'child': 'parent',
      'spouse': 'spouse',
      'sibling': 'sibling',
    }
    return reciprocals[type] || null
  }

  // Contact functions
  const handleAddContact = async (
    contactData: Omit<Contact, 'id' | 'is_favorite' | 'created_at' | 'updated_at'>,
    selectedMembers: { family_member_id: string; relationship_notes: string }[]
  ) => {
    try {
      const newContact = await contactsAPI.create(contactData)

      // Add family member associations
      for (const member of selectedMembers) {
        await contactsAPI.addAssociation(newContact.id, member)
      }

      setContacts(prev => [...prev, newContact])
      setShowContactModal(false)
      setEditingContact(null)
      showToast('Contact added successfully!', 'success')
    } catch (error) {
      console.error('Error adding contact:', error)
      showToast('Failed to add contact', 'error')
    }
  }

  const handleEditContact = async (
    contactData: Omit<Contact, 'id' | 'is_favorite' | 'created_at' | 'updated_at'>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _selectedMembers: { family_member_id: string; relationship_notes: string }[]
  ) => {
    if (!editingContact) return

    try {
      const updatedContact = await contactsAPI.update(editingContact.id, contactData)

      // TODO: Update associations by comparing _selectedMembers with existing associations
      // For now, associations need to be managed separately

      setContacts(prev => prev.map(c => c.id === editingContact.id ? updatedContact : c))
      setShowContactModal(false)
      setEditingContact(null)
      showToast('Contact updated successfully!', 'success')
    } catch (error) {
      console.error('Error updating contact:', error)
      showToast('Failed to update contact', 'error')
    }
  }

  const handleDeleteContact = async (contactId: string) => {
    try {
      await contactsAPI.delete(contactId)
      setContacts(prev => prev.filter(c => c.id !== contactId))
      showToast('Contact deleted successfully!', 'success')
    } catch (error) {
      console.error('Error deleting contact:', error)
      showToast('Failed to delete contact', 'error')
    }
  }

  const handleToggleFavorite = async (contactId: string) => {
    try {
      const updatedContact = await contactsAPI.toggleFavorite(contactId)
      setContacts(prev => prev.map(c => c.id === contactId ? updatedContact : c))
      showToast(`Contact ${updatedContact.is_favorite ? 'added to' : 'removed from'} favorites!`, 'success')
    } catch (error) {
      console.error('Error toggling favorite:', error)
      showToast('Failed to update contact', 'error')
    }
  }

  // Meal functions
  const handleAddMeal = async (mealData: { name: string; mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'; date: string; notes?: string; prepTime?: string }) => {
    try {
      const newMeal = await mealsAPI.create({
        name: mealData.name,
        meal_type: mealData.mealType,
        date: mealData.date,
        notes: mealData.notes,
        prep_time: mealData.prepTime,
        created_by: userName
      })
      setMeals([...meals, {
        id: newMeal.id,
        name: newMeal.name,
        mealType: newMeal.meal_type,
        date: newMeal.date,
        notes: newMeal.notes,
        prepTime: newMeal.prep_time,
        createdBy: newMeal.created_by
      }])
      setShowMealModal(false)
      showToast('Meal added to planner!', 'success')
      createNotification(
        'Meal Planned',
        `"${mealData.name}" scheduled for ${mealData.mealType} on ${mealData.date}`,
        'info',
        'meal',
        newMeal.id
      )
    } catch (error) {
      console.error('Error adding meal:', error)
      showToast('Failed to add meal', 'error')
    }
  }

  const handleEditMeal = async (mealData: { name: string; mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'; date: string; notes?: string; prepTime?: string }) => {
    if (editingMeal) {
      try {
        const updated = await mealsAPI.update(editingMeal.id, {
          name: mealData.name,
          meal_type: mealData.mealType,
          date: mealData.date,
          notes: mealData.notes,
          prep_time: mealData.prepTime
        })
        setMeals(meals.map(meal =>
          meal.id === editingMeal.id
            ? {
              id: updated.id,
              name: updated.name,
              mealType: updated.meal_type,
              date: updated.date,
              notes: updated.notes,
              prepTime: updated.prep_time,
              createdBy: updated.created_by
            }
            : meal
        ))
        setEditingMeal(null)
        setShowMealModal(false)
        showToast('Meal updated!', 'success')
        createNotification(
          'Meal Updated',
          `${mealData.name} has been updated`,
          'info',
          'meal',
          editingMeal.id
        )
      } catch (error) {
        console.error('Error updating meal:', error)
        showToast('Failed to update meal', 'error')
      }
    }
  }

  const handleDeleteMeal = async (mealId: string) => {
    try {
      await mealsAPI.delete(mealId)
      setMeals(meals.filter(meal => meal.id !== mealId))
      showToast('Meal removed from planner!', 'success')
    } catch (error) {
      console.error('Error deleting meal:', error)
      showToast('Failed to delete meal', 'error')
    }
  }

  const handleAddMealToShopping = async (mealId: string) => {
    try {
      const result = await mealsAPI.addToShoppingList(mealId)
      // Reload shopping items
      const shoppingData = await shoppingItemsAPI.getAll()
      setShoppingItems(shoppingData.map((item: ShoppingItem) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        category: item.category,
        notes: item.notes,
        purchased: item.purchased,
        addedBy: item.addedBy
      })))
      showToast(result.message || 'Ingredients added to shopping list!', 'success')
      createNotification(
        'Shopping List Updated',
        'Meal ingredients added to your shopping list',
        'success',
        'shopping'
      )
    } catch (error) {
      console.error('Error adding to shopping list:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to add ingredients'
      showToast(errorMessage, 'error')
    }
  }

  const handleToggleMealFavorite = async (mealId: string) => {
    const meal = meals.find(m => m.id === mealId)
    if (!meal) return

    try {
      const updated = await mealsAPI.update(mealId, { is_favorite: !meal.isFavorite })
      setMeals(meals.map(m =>
        m.id === mealId
          ? { ...m, isFavorite: updated.is_favorite }
          : m
      ))
      showToast(meal.isFavorite ? 'Removed from favorites' : 'Added to favorites!', 'success')
      if (!meal.isFavorite) {
        createNotification(
          'Favorite Added',
          `${meal.name} added to your favorites`,
          'success',
          'meal',
          mealId
        )
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      showToast('Failed to update favorite', 'error')
    }
  }

  const handleCreateTaskFromMeal = async (meal: Meal) => {
    try {
      const taskTitle = `Prep ${meal.name}`

      const newTask = await tasksAPI.create({
        title: taskTitle,
        assigned_to: currentUser?.name || userName,
        due_date: meal.date,
        priority: 'medium'
      })

      setTasks([...tasks, {
        id: newTask.id,
        title: newTask.title,
        assignedTo: newTask.assigned_to,
        dueDate: newTask.due_date,
        priority: newTask.priority,
        completed: newTask.completed
      }])

      showToast('Prep task created!', 'success')
      createNotification(
        'Task Created',
        `"${taskTitle}" added to your task list`,
        'success',
        'task',
        newTask.id
      )
    } catch (error) {
      console.error('Error creating task from meal:', error)
      showToast('Failed to create task', 'error')
    }
  }

  const handleMealDragStart = (meal: Meal) => {
    setDraggedMeal(meal)
  }

  const handleMealDragOver = (e: React.DragEvent) => {
    e.preventDefault() // Allow drop
  }

  const handleMealDrop = async (targetDate: string, targetMealType: string) => {
    if (!draggedMeal) return

    try {
      // Update meal with new date and/or type
      const updated = await mealsAPI.update(draggedMeal.id, {
        date: targetDate,
        meal_type: targetMealType as 'breakfast' | 'lunch' | 'dinner' | 'snack'
      })

      setMeals(meals.map(m =>
        m.id === draggedMeal.id
          ? { ...m, date: updated.date, mealType: updated.meal_type }
          : m
      ))

      showToast('Meal moved successfully!', 'success')
      setDraggedMeal(null)
    } catch (error) {
      console.error('Error moving meal:', error)
      showToast('Failed to move meal', 'error')
      setDraggedMeal(null)
    }
  }

  const handlePrintMealPlan = () => {
    const weekMeals = getMealsForWeek()
    const printWindow = window.open('', '_blank')

    if (!printWindow) {
      showToast('Please allow popups to print', 'error')
      return
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Weekly Meal Plan - Family Hub</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              padding: 40px;
              max-width: 1200px;
              margin: 0 auto;
            }
            h1 {
              color: #f97316;
              margin-bottom: 10px;
            }
            .subtitle {
              color: #666;
              margin-bottom: 30px;
            }
            .day-section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .day-header {
              background: #f97316;
              color: white;
              padding: 10px 15px;
              border-radius: 8px;
              margin-bottom: 15px;
              font-weight: bold;
            }
            .meal-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
              margin-bottom: 20px;
            }
            .meal-type {
              font-weight: 600;
              font-size: 14px;
              color: #666;
              margin-bottom: 8px;
            }
            .meal-card {
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              padding: 12px;
              background: white;
            }
            .meal-name {
              font-weight: 600;
              margin-bottom: 5px;
            }
            .meal-time {
              font-size: 12px;
              color: #666;
            }
            .meal-notes {
              font-size: 11px;
              color: #888;
              font-style: italic;
              margin-top: 5px;
            }
            .empty-meal {
              color: #ccc;
              font-style: italic;
              font-size: 13px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              font-size: 12px;
              color: #666;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>🍽️ Weekly Meal Plan</h1>
          <p class="subtitle">Family Hub - Generated on ${new Date().toLocaleDateString()}</p>
          
          ${weekMeals.map(day => `
            <div class="day-section">
              <div class="day-header">${day.dayName} - ${day.fullDate}</div>
              <div class="meal-grid">
                ${['breakfast', 'lunch', 'dinner', 'snack'].map(type => `
                  <div>
                    <div class="meal-type">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
                    ${day.meals[type as keyof typeof day.meals].length > 0
        ? day.meals[type as keyof typeof day.meals].map((meal: Meal) => `
                          <div class="meal-card">
                            <div class="meal-name">${meal.name}</div>
                            ${meal.prepTime ? `<div class="meal-time">⏱️ ${meal.prepTime}</div>` : ''}
                            ${meal.notes ? `<div class="meal-notes">${meal.notes}</div>` : ''}
                          </div>
                        `).join('')
        : '<div class="empty-meal">Not planned</div>'
      }
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
          
          <div class="footer">
            <p><strong>Total meals planned:</strong> ${meals.length}</p>
            <p>Generated by Family Hub - Your family organization assistant</p>
          </div>
          
          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="
              background: #f97316;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-size: 16px;
              cursor: pointer;
              margin-right: 10px;
            ">
              🖨️ Print
            </button>
            <button onclick="window.close()" style="
              background: #6b7280;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-size: 16px;
              cursor: pointer;
            ">
              Close
            </button>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    showToast('Print preview opened!', 'info')
  }

  const getFilteredMeals = () => {
    return meals.filter(meal => {
      // Search filter
      const matchesSearch = mealSearchTerm === '' ||
        meal.name.toLowerCase().includes(mealSearchTerm.toLowerCase()) ||
        (meal.notes && meal.notes.toLowerCase().includes(mealSearchTerm.toLowerCase()))

      // Type filter
      const matchesType = mealFilterType === 'all' || meal.mealType === mealFilterType

      // Favorites filter
      const matchesFavorites = !mealShowFavoritesOnly || meal.isFavorite || meal.isTemplate

      return matchesSearch && matchesType && matchesFavorites
    })
  }

  const getMealsForWeek = () => {
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())

    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(weekStart)
      day.setDate(weekStart.getDate() + i)
      return day.toISOString().split('T')[0]
    })

    const filteredMeals = getFilteredMeals()

    return weekDays.map(date => {
      const dayMeals = filteredMeals.filter(meal => meal.date === date)
      return {
        date,
        dayName: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        meals: {
          breakfast: dayMeals.filter(m => m.mealType === 'breakfast'),
          lunch: dayMeals.filter(m => m.mealType === 'lunch'),
          dinner: dayMeals.filter(m => m.mealType === 'dinner'),
          snack: dayMeals.filter(m => m.mealType === 'snack')
        }
      }
    })
  }

  // Transaction functions
  const handleAddTransaction = async (transactionData: { type: 'income' | 'expense'; category: string; amount: number; description?: string; date: string; payment_method?: string }) => {
    try {
      const newTransaction = await transactionsAPI.create({
        ...transactionData,
        added_by: userName
      })
      setTransactions([...transactions, {
        ...newTransaction,
        addedBy: newTransaction.added_by
      }])
      setShowTransactionModal(false)
      showToast(`${transactionData.type === 'income' ? 'Income' : 'Expense'} added successfully!`, 'success')
    } catch (error) {
      console.error('Error adding transaction:', error)
      showToast('Failed to add transaction', 'error')
    }
  }

  const handleEditTransaction = async (transactionData: { type: 'income' | 'expense'; category: string; amount: number; description?: string; date: string; payment_method?: string }) => {
    if (editingTransaction) {
      try {
        const updated = await transactionsAPI.update(editingTransaction.id, transactionData)
        setTransactions(transactions.map(transaction =>
          transaction.id === editingTransaction.id
            ? { ...updated, addedBy: updated.added_by }
            : transaction
        ))
        setEditingTransaction(null)
        setShowTransactionModal(false)
        showToast('Transaction updated!', 'success')
      } catch (error) {
        console.error('Error updating transaction:', error)
        showToast('Failed to update transaction', 'error')
      }
    }
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await transactionsAPI.delete(transactionId)
      setTransactions(transactions.filter(transaction => transaction.id !== transactionId))
      showToast('Transaction deleted!', 'success')
    } catch (error) {
      console.error('Error deleting transaction:', error)
      showToast('Failed to delete transaction', 'error')
    }
  }

  const getTransactionStats = () => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    return {
      income,
      expense,
      balance: income - expense
    }
  }

  // Budget functions
  const handleAddBudget = (budgetData: { category: string; amount: number; period: 'monthly' | 'yearly' }) => {
    const newBudget: Budget = {
      id: Date.now().toString(),
      ...budgetData
    }
    setBudgets([...budgets, newBudget])
    setShowBudgetModal(false)
    showToast('Budget created successfully!', 'success')
  }

  const handleEditBudget = (budgetData: { category: string; amount: number; period: 'monthly' | 'yearly' }) => {
    if (editingBudget) {
      setBudgets(budgets.map(budget =>
        budget.id === editingBudget.id
          ? { ...budget, ...budgetData }
          : budget
      ))
      setEditingBudget(null)
      setShowBudgetModal(false)
      showToast('Budget updated!', 'success')
    }
  }

  const handleDeleteBudget = (budgetId: string) => {
    setBudgets(budgets.filter(budget => budget.id !== budgetId))
    showToast('Budget deleted!', 'success')
  }

  const getBudgetsWithSpending = () => {
    return budgets.map(budget => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0)
      return {
        ...budget,
        spent_amount: spent,
        remaining: budget.amount - spent
      }
    })
  }

  // Export transactions to CSV - Feature for future use
  /*
  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Description', 'Payment Method']
    const csvRows = [headers.join(',')]

    transactions.forEach(t => {
      const values = [
        t.date,
        t.type,
        t.category,
        t.amount,
        t.description || '',
        t.payment_method || ''
      ]
      csvRows.push(values.map(v => `"${v}"`).join(','))
    })

    const csv = csvRows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    showToast('Transactions exported successfully!', 'success')
  }
  */

  const renderMoney = () => {
    const stats = getTransactionStats()
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const budgetsWithSpending = getBudgetsWithSpending()

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-900">Money Management</h3>
          <button
            onClick={() => {
              setEditingTransaction(null)
              setShowTransactionModal(true)
            }}
            className="flex items-center space-x-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium shadow-soft hover:shadow-medium btn-press"
          >
            <Plus className="w-5 h-5" />
            <span>Add Transaction</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-500 rounded-2xl p-6 shadow-medium hover-lift">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm font-medium text-green-100 mb-2">Total Income</p>
                <p className="text-3xl font-bold">${stats.income.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-white opacity-80" />
            </div>
          </div>

          <div className="bg-red-500 rounded-2xl p-6 shadow-medium hover-lift">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm font-medium text-red-100 mb-2">Total Expenses</p>
                <p className="text-3xl font-bold">${stats.expense.toFixed(2)}</p>
              </div>
              <TrendingDown className="h-12 w-12 text-white opacity-80" />
            </div>
          </div>

          <div className={`${stats.balance >= 0 ? 'bg-blue-500' : 'bg-orange-500'} rounded-2xl p-6 shadow-medium hover-lift`}>
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm font-medium mb-2 opacity-90">Balance</p>
                <p className="text-3xl font-bold">${Math.abs(stats.balance).toFixed(2)}</p>
              </div>
              <Wallet className="h-12 w-12 text-white opacity-80" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-medium border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setMoneyTab('transactions')}
              className={`flex-1 px-6 py-4 font-medium transition-all ${moneyTab === 'transactions'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Transactions</span>
              </div>
            </button>
            <button
              onClick={() => setMoneyTab('budgets')}
              className={`flex-1 px-6 py-4 font-medium transition-all ${moneyTab === 'budgets'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Budgets</span>
              </div>
            </button>
            <button
              onClick={() => setMoneyTab('charts')}
              className={`flex-1 px-6 py-4 font-medium transition-all ${moneyTab === 'charts'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Charts</span>
              </div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {moneyTab === 'transactions' && (
              <div>
                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h4>
                    <p className="text-gray-500 text-sm">Start tracking your income and expenses</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedTransactions.map(transaction => (
                      <div
                        key={transaction.id}
                        className={`p-4 rounded-xl border-l-4 transition-all hover-lift ${transaction.type === 'income'
                          ? 'border-l-green-500 bg-green-50'
                          : 'border-l-red-500 bg-red-50'
                          }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${transaction.type === 'income'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                                  }`}
                              >
                                {transaction.type}
                              </span>
                              <span className="font-semibold text-gray-900">
                                {transaction.category}
                              </span>
                            </div>
                            {transaction.description && (
                              <p className="text-sm text-gray-600 mb-2">{transaction.description}</p>
                            )}
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <span>{new Date(transaction.date).toLocaleDateString()}</span>
                              {transaction.payment_method && (
                                <>
                                  <span>•</span>
                                  <span>{transaction.payment_method}</span>
                                </>
                              )}
                              <span>•</span>
                              <span>By {transaction.addedBy}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span
                              className={`text-xl font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                }`}
                            >
                              {transaction.type === 'income' ? '+' : '-'}$
                              {transaction.amount.toFixed(2)}
                            </span>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => {
                                  setEditingTransaction(transaction)
                                  setShowTransactionModal(true)
                                }}
                                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all btn-press"
                                title="Edit transaction"
                                aria-label="Edit transaction"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteAction(() => () => handleDeleteTransaction(transaction.id))
                                  setShowConfirmDialog(true)
                                }}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all btn-press"
                                title="Delete transaction"
                                aria-label="Delete transaction"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {moneyTab === 'budgets' && (
              <div>
                {budgetsWithSpending.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No budgets yet</h4>
                    <p className="text-gray-500 text-sm">Create budgets to track your spending</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {budgetsWithSpending.map(budget => {
                      const percentage = budget.amount > 0 ? (budget.spent_amount! / budget.amount) * 100 : 0
                      const isOverBudget = budget.spent_amount! > budget.amount

                      return (
                        <div key={budget.id} className="p-5 bg-gray-50 rounded-xl hover-lift">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h5 className="font-semibold text-gray-900">{budget.category}</h5>
                              <p className="text-sm text-gray-500 capitalize">{budget.period} Budget</p>
                            </div>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => {
                                  setEditingBudget(budget)
                                  setShowBudgetModal(true)
                                }}
                                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all btn-press"
                                title="Edit budget"
                                aria-label="Edit budget"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteAction(() => () => handleDeleteBudget(budget.id))
                                  setShowConfirmDialog(true)
                                }}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all btn-press"
                                title="Delete budget"
                                aria-label="Delete budget"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="mb-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">
                                ${budget.spent_amount!.toFixed(2)} of ${budget.amount.toFixed(2)}
                              </span>
                              <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                                {isOverBudget ? '+' : ''}${Math.abs(budget.remaining!).toFixed(2)}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div
                                className={`h-3 rounded-full transition-all ${isOverBudget ? 'bg-red-500' : percentage > 75 ? 'bg-orange-500' : 'bg-green-500'
                                  }`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% used</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {moneyTab === 'charts' && (
              <MoneyCharts transactions={transactions} />
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Upcoming Events - Blue */}
        <div className="bg-blue-500 rounded-2xl p-6 shadow-medium hover-lift cursor-pointer stagger-1">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-sm font-medium text-blue-100 mb-2">Upcoming Events</p>
              <p className="text-4xl font-bold">{events.length}</p>
            </div>
            <Calendar className="h-12 w-12 text-white opacity-80" />
          </div>
        </div>

        {/* Pending Tasks - Green */}
        <div className="bg-green-500 rounded-2xl p-6 shadow-medium hover-lift cursor-pointer stagger-2">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-sm font-medium text-green-100 mb-2">Pending Tasks</p>
              <p className="text-4xl font-bold">{tasks.filter(t => !t.completed).length}</p>
            </div>
            <CheckSquare className="h-12 w-12 text-white opacity-80" />
          </div>
        </div>

        {/* Shopping Items - Purple */}
        <div className="bg-purple-500 rounded-2xl p-6 shadow-medium hover-lift cursor-pointer stagger-3" onClick={() => setActiveTab('shopping')}>
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-sm font-medium text-purple-100 mb-2">Shopping Items</p>
              <p className="text-4xl font-bold">{shoppingItems.filter(i => !i.purchased).length}</p>
            </div>
            <ShoppingCart className="h-12 w-12 text-white opacity-80" />
          </div>
        </div>

        {/* Family Members - Orange */}
        <div className="bg-orange-500 rounded-2xl p-6 shadow-medium hover-lift cursor-pointer stagger-4" onClick={() => setActiveTab('family')}>
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-sm font-medium text-orange-100 mb-2">Family Members</p>
              <p className="text-4xl font-bold">{familyMembers.length}</p>
            </div>
            <Users className="h-12 w-12 text-white opacity-80" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-medium border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-gray-900">{userName}'s Events</h3>
            <button
              onClick={() => setActiveTab('calendar')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
            >
              <span>View All</span>
              <span>→</span>
            </button>
          </div>
          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No upcoming events</p>
              </div>
            ) : (
              events.slice(0, 3).map(event => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDate(event.date)}{event.time ? ` at ${formatTime(event.time)}` : ''}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full shadow-soft ${event.type === 'family' ? 'bg-blue-500' :
                    event.type === 'personal' ? 'bg-green-500' : 'bg-purple-500'
                    }`}></div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-medium border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-gray-900">{userName}'s Tasks</h3>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
            >
              <span>View All</span>
              <span>→</span>
            </button>
          </div>
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No pending tasks</p>
              </div>
            ) : (
              tasks.slice(0, 3).map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-400'}`}
                    >
                      {task.completed && <CheckSquare className="w-4 h-4 text-white" />}
                    </button>
                    <span className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.title}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{task.assignedTo}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Messages Section */}
      <div className="bg-white rounded-2xl p-6 shadow-medium border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">Recent Messages</h3>
          <button
            onClick={() => setActiveTab('messages')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
          >
            <span>View All</span>
            <span>→</span>
          </button>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No messages yet</p>
        </div>
      </div>
    </div>
  )

  const renderCalendar = () => {
    return (
      <PremiumCalendar
        events={events}
        onAddEvent={handleAddEvent}
        onEditEvent={handleEditEvent}
        onDeleteEvent={handleDeleteEvent}
        onUpdateDateTime={handleUpdateEventDateTime}
        onSyncWithGoogle={handleSyncWithGoogle}
        onImportFromGoogle={handleImportFromGoogle}
        isGoogleConnected={isGoogleConnected}
        onGoogleConnect={handleGoogleConnect}
        currentUser={user?.name || 'Demo User'}
      />
    )
  }

  const renderTasks = () => {
    // Filter tasks based on settings
    const visibleTasks = settings.showCompletedTasks
      ? tasks
      : tasks.filter(task => !task.completed)

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-900">Family Tasks</h3>
          <button
            onClick={() => {
              setEditingTask(null)
              setShowTaskModal(true)
            }}
            className="flex items-center space-x-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium shadow-soft hover:shadow-medium btn-press"
          >
            <Plus className="w-5 h-5" />
            <span>Add Task</span>
          </button>
        </div>

        {visibleTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-medium border border-gray-100 text-center">
            <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              {!settings.showCompletedTasks && tasks.length > 0 ? 'All tasks completed!' : 'No tasks yet'}
            </h4>
            <p className="text-gray-500 text-sm">
              {!settings.showCompletedTasks && tasks.length > 0
                ? 'Great job! Enable "Show Completed Tasks" in settings to see them.'
                : 'Create tasks to keep your family on track'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleTasks.map(task => (
              <div key={task.id} className={`bg-white rounded-2xl p-5 shadow-medium border-l-4 border-y border-r border-gray-100 hover-lift ${task.priority === 'high' ? 'border-l-red-500' :
                task.priority === 'medium' ? 'border-l-yellow-500' :
                  'border-l-green-500'
                }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-400'}`}
                    >
                      {task.completed && <CheckSquare className="w-5 h-5 text-white" />}
                    </button>
                    <div>
                      <p className={`font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                        <span>Assigned to {task.assignedTo}</span>
                        <span className="text-gray-400">•</span>
                        <span>Due {formatDate(task.dueDate)}</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${task.priority === 'high' ? 'bg-red-100 text-red-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                          {task.priority}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => {
                        setEditingTask(task)
                        setShowTaskModal(true)
                      }}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all btn-press"
                      title="Edit task"
                      aria-label="Edit task"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteAction(() => () => handleDeleteTask(task.id))
                        setShowConfirmDialog(true)
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all btn-press"
                      title="Delete task"
                      aria-label="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderFamily = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-900">Family Members</h3>
        <button
          onClick={() => {
            setEditingMember(null)
            setShowFamilyModal(true)
          }}
          className="flex items-center space-x-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium shadow-soft hover:shadow-medium btn-press"
        >
          <Plus className="w-5 h-5" />
          <span>Add Member</span>
        </button>
      </div>

      {familyMembers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-medium border border-gray-100 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No family members yet</h4>
          <p className="text-gray-500 text-sm">Add your first family member to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {familyMembers.map(member => (
            <div key={member.id} className="bg-white rounded-2xl p-6 shadow-medium border border-gray-100 text-center hover-lift group">
              <div className={`w-16 h-16 ${member.color} rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-medium`}>
                {member.name[0]}
              </div>
              <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
              <p className="text-sm text-gray-500 mb-3 font-medium">{member.role}</p>
              <div className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium mb-4">
                {getTaskCountForMember(member.name)} active tasks
              </div>
              <div className="flex justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setEditingMember(member)
                    setShowFamilyModal(true)
                  }}
                  className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all btn-press"
                  title="Edit family member"
                  aria-label="Edit family member"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setDeleteAction(() => () => handleDeleteMember(member.id))
                    setShowConfirmDialog(true)
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all btn-press"
                  title="Delete family member"
                  aria-label="Delete family member"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderShopping = () => {
    const categories = ['Groceries', 'Household', 'Personal', 'Other'] as const

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-900">Shopping List</h3>
          <button
            onClick={() => {
              setEditingShoppingItem(null)
              setShowShoppingModal(true)
            }}
            className="flex items-center space-x-2 px-5 py-2.5 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all font-medium shadow-soft hover:shadow-medium btn-press"
          >
            <Plus className="w-5 h-5" />
            <span>Add Item</span>
          </button>
        </div>

        {shoppingItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-medium border border-gray-100 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No items yet</h4>
            <p className="text-gray-500 text-sm">Start adding items to your shopping list</p>
          </div>
        ) : (
          <div className="space-y-6">
            {categories.map(category => {
              const categoryItems = shoppingItems.filter(item => item.category === category)
              if (categoryItems.length === 0) return null

              return (
                <div key={category} className="bg-white rounded-2xl p-6 shadow-medium border border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
                    <span>{category}</span>
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {categoryItems.filter(i => !i.purchased).length} / {categoryItems.length}
                    </span>
                  </h4>
                  <div className="space-y-3">
                    {categoryItems.map(item => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border transition-all hover-lift ${item.purchased ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                          }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <button
                              onClick={() => handleToggleShoppingItem(item.id)}
                              className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${item.purchased
                                ? 'bg-purple-500 border-purple-500'
                                : 'border-gray-300 hover:border-purple-400'
                                }`}
                            >
                              {item.purchased && (
                                <CheckSquare className="w-4 h-4 text-white" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`font-medium ${item.purchased ? 'line-through text-gray-500' : 'text-gray-900'
                                  }`}
                              >
                                {item.name}
                              </p>
                              <p className="text-sm text-gray-500 mt-0.5">{item.quantity}</p>
                              {item.notes && (
                                <p className="text-sm text-gray-400 mt-1 italic">{item.notes}</p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">Added by {item.addedBy}</p>
                            </div>
                          </div>
                          <div className="flex space-x-1 ml-2">
                            <button
                              onClick={() => {
                                setEditingShoppingItem(item)
                                setShowShoppingModal(true)
                              }}
                              className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-xl transition-all btn-press"
                              title="Edit item"
                              aria-label="Edit item"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteAction(() => () => handleDeleteShoppingItem(item.id))
                                setShowConfirmDialog(true)
                              }}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all btn-press"
                              title="Delete item"
                              aria-label="Delete item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const renderContacts = () => {
    const getCategoryColor = (category: string) => {
      const colors: Record<string, string> = {
        'Medical': 'bg-red-100 text-red-700',
        'Emergency': 'bg-orange-100 text-orange-700',
        'School': 'bg-blue-100 text-blue-700',
        'Friends': 'bg-purple-100 text-purple-700',
        'Family': 'bg-green-100 text-green-700',
        'Work': 'bg-gray-100 text-gray-700',
        'Services': 'bg-yellow-100 text-yellow-700',
        'Other': 'bg-slate-100 text-slate-700',
      };
      return colors[category] || colors.Other;
    };

    const getCategoryIcon = (category: string) => {
      switch (category) {
        case 'Medical': return '🏥';
        case 'Emergency': return '🚨';
        case 'School': return '🎓';
        case 'Friends': return '👥';
        case 'Family': return '👨‍👩‍👧‍👦';
        case 'Work': return '💼';
        case 'Services': return '🔧';
        default: return '📋';
      }
    };

    // Filter contacts
    const filteredContacts = contacts.filter(contact => {
      const matchesSearch = contact.name.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
        contact.phone?.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
        contact.company_organization?.toLowerCase().includes(contactSearchTerm.toLowerCase());

      const matchesCategory = contactCategoryFilter === 'All' || contact.category === contactCategoryFilter;

      return matchesSearch && matchesCategory;
    });

    const favoriteContacts = filteredContacts.filter(c => c.is_favorite);
    const categories: Array<Contact['category'] | 'All'> = ['All', 'Family', 'Friends', 'Medical', 'Services', 'Emergency', 'School', 'Work', 'Other'];

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-900">Contacts</h3>
          <button
            onClick={() => {
              setEditingContact(null);
              setShowContactModal(true);
            }}
            className="flex items-center space-x-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium shadow-soft hover:shadow-medium btn-press"
          >
            <Plus className="w-5 h-5" />
            <span>Add Contact</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-medium border border-gray-100">
          <input
            type="text"
            placeholder="Search contacts by name, email, phone, or organization..."
            value={contactSearchTerm}
            onChange={(e) => setContactSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Category Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-medium border border-gray-100">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setContactCategoryFilter(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${contactCategoryFilter === cat
                  ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-500'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                  }`}
              >
                {cat !== 'All' && <span className="mr-1">{getCategoryIcon(cat)}</span>}
                {cat} {cat === 'All' && `(${contacts.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Favorites Section */}
        {favoriteContacts.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-medium border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">⭐</span>
              <h4 className="text-lg font-semibold text-gray-900">Quick Access Favorites</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteContacts.map(contact => (
                <div
                  key={contact.id}
                  className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border-2 border-yellow-200 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCategoryIcon(contact.category)}</span>
                      <h5 className="font-semibold text-gray-900">{contact.name}</h5>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(contact.category)}`}>
                      {contact.category}
                    </span>
                  </div>
                  {contact.phone && (
                    <p className="text-sm text-gray-600 mb-1">📞 {contact.phone}</p>
                  )}
                  {contact.email && (
                    <p className="text-sm text-gray-600 mb-2 truncate">📧 {contact.email}</p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        setEditingContact(contact);
                        setShowContactModal(true);
                      }}
                      className="flex-1 px-3 py-1.5 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-all text-sm font-medium"
                    >
                      <Edit2 className="w-4 h-4 inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleFavorite(contact.id)}
                      className="px-3 py-1.5 bg-white text-yellow-600 rounded-lg hover:bg-gray-100 transition-all"
                    >
                      ⭐
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Contacts */}
        <div className="bg-white rounded-2xl p-6 shadow-medium border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            All Contacts {filteredContacts.length > 0 && `(${filteredContacts.length})`}
          </h4>

          {filteredContacts.length === 0 ? (
            <div className="text-center py-12">
              <ContactIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No contacts found</h4>
              <p className="text-gray-500 text-sm">
                {contactSearchTerm || contactCategoryFilter !== 'All'
                  ? 'Try adjusting your search or filters'
                  : 'Add your first contact to get started'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContacts.map(contact => (
                <div
                  key={contact.id}
                  className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCategoryIcon(contact.category)}</span>
                      <h5 className="font-semibold text-gray-900">{contact.name}</h5>
                    </div>
                    <button
                      onClick={() => handleToggleFavorite(contact.id)}
                      className={`text-lg ${contact.is_favorite ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500'}`}
                    >
                      ⭐
                    </button>
                  </div>

                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${getCategoryColor(contact.category)}`}>
                    {contact.category}
                  </span>

                  {contact.job_title_specialty && (
                    <p className="text-sm text-gray-600 mb-1 font-medium">{contact.job_title_specialty}</p>
                  )}
                  {contact.company_organization && (
                    <p className="text-sm text-gray-500 mb-2">{contact.company_organization}</p>
                  )}
                  {contact.phone && (
                    <p className="text-sm text-gray-600 mb-1">📞 {contact.phone}</p>
                  )}
                  {contact.email && (
                    <p className="text-sm text-gray-600 mb-2 truncate">📧 {contact.email}</p>
                  )}

                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <button
                      onClick={() => {
                        setEditingContact(contact);
                        setShowContactModal(true);
                      }}
                      className="flex-1 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-all text-sm font-medium"
                    >
                      <Edit2 className="w-4 h-4 inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setDeleteAction(() => () => handleDeleteContact(contact.id));
                        setShowConfirmDialog(true);
                      }}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all text-sm font-medium"
                      aria-label="Delete contact"
                      title="Delete contact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Settings</h3>
          <p className="text-sm text-gray-500 mt-1">Manage your app preferences and notifications</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-medium border border-gray-100">
        <SettingsForm
          initialSettings={settings}
          onSave={handleSaveSettings}
        />
      </div>
    </div>
  )

  const renderMeals = () => {
    const weekMeals = getMealsForWeek()
    const mealTypeIcons = {
      breakfast: '🍳',
      lunch: '🥗',
      dinner: '🍝',
      snack: '🍎'
    }
    const mealTypeColors = {
      breakfast: 'bg-yellow-50 border-yellow-200',
      lunch: 'bg-green-50 border-green-200',
      dinner: 'bg-orange-50 border-orange-200',
      snack: 'bg-purple-50 border-purple-200'
    }

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-2xl font-bold text-gray-900">Weekly Meal Planner</h3>
          <div className="flex gap-2">
            <button
              onClick={handlePrintMealPlan}
              className="flex items-center space-x-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium shadow-soft hover:shadow-medium btn-press"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={() => {
                setEditingMeal(null)
                setShowMealModal(true)
              }}
              className="flex items-center space-x-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all font-medium shadow-soft hover:shadow-medium btn-press"
            >
              <Plus className="w-5 h-5" />
              <span>Add Meal</span>
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-medium border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search meals by name or notes..."
                value={mealSearchTerm}
                onChange={(e) => setMealSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={mealFilterType}
                onChange={(e) => setMealFilterType(e.target.value as 'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack')}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                aria-label="Filter meals by type"
              >
                <option value="all">All Types</option>
                <option value="breakfast">🍳 Breakfast</option>
                <option value="lunch">🥗 Lunch</option>
                <option value="dinner">🍝 Dinner</option>
                <option value="snack">🍎 Snack</option>
              </select>
              <button
                onClick={() => setMealShowFavoritesOnly(!mealShowFavoritesOnly)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${mealShowFavoritesOnly
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                ⭐ Favorites
              </button>
              {(mealSearchTerm || mealFilterType !== 'all' || mealShowFavoritesOnly) && (
                <button
                  onClick={() => {
                    setMealSearchTerm('')
                    setMealFilterType('all')
                    setMealShowFavoritesOnly(false)
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-all"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          {(mealSearchTerm || mealFilterType !== 'all' || mealShowFavoritesOnly) && (
            <div className="mt-3 text-sm text-gray-600">
              Showing {getFilteredMeals().length} of {meals.length} meals
            </div>
          )}
        </div>

        {meals.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-medium border border-gray-100 text-center">
            <UtensilsCrossed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No meals planned yet</h4>
            <p className="text-gray-500 text-sm">Start planning your family meals for the week</p>
          </div>
        ) : (
          <div className="space-y-4">
            {weekMeals.map(day => {
              const hasMeals = Object.values(day.meals).some(mealList => mealList.length > 0)

              return (
                <div key={day.date} className="bg-white rounded-2xl p-6 shadow-medium border border-gray-100">
                  <div className="mb-4 pb-3 border-b border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                      <span>{day.dayName} - {day.fullDate}</span>
                      {!hasMeals && (
                        <span className="text-sm font-normal text-gray-400">No meals planned</span>
                      )}
                    </h4>
                  </div>

                  {hasMeals ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(mealType => (
                        <div
                          key={mealType}
                          className="space-y-2"
                          onDragOver={handleMealDragOver}
                          onDrop={() => handleMealDrop(day.date, mealType)}
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xl">{mealTypeIcons[mealType]}</span>
                            <h5 className="text-sm font-semibold text-gray-700 capitalize">{mealType}</h5>
                          </div>
                          {day.meals[mealType].length === 0 ? (
                            <div
                              className={`p-3 rounded-xl border-2 border-dashed transition-all text-center ${draggedMeal ? 'border-orange-400 bg-orange-50' : 'border-gray-200'
                                }`}
                            >
                              <p className="text-xs text-gray-400">
                                {draggedMeal ? 'Drop here' : 'Not planned'}
                              </p>
                            </div>
                          ) : (
                            day.meals[mealType].map(meal => (
                              <div
                                key={meal.id}
                                draggable
                                onDragStart={() => handleMealDragStart(meal)}
                                onDragEnd={() => setDraggedMeal(null)}
                                className={`p-3 rounded-xl border-2 transition-all hover-lift group cursor-move ${draggedMeal?.id === meal.id ? 'opacity-50' : ''
                                  } ${mealTypeColors[mealType]}`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 text-sm truncate">{meal.name}</p>
                                    {meal.prepTime && (
                                      <p className="text-xs text-gray-500 mt-1 flex items-center">
                                        <span className="mr-1">⏱️</span>
                                        {meal.prepTime}
                                      </p>
                                    )}
                                    {meal.notes && (
                                      <p className="text-xs text-gray-600 mt-1 italic line-clamp-2">{meal.notes}</p>
                                    )}
                                  </div>
                                  <div className="flex flex-col space-y-1 ml-2">
                                    {meal.isFavorite && (
                                      <span className="text-yellow-500 text-xs">⭐</span>
                                    )}
                                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={() => handleToggleMealFavorite(meal.id)}
                                        className={`p-1 rounded-lg transition-all btn-press ${meal.isFavorite
                                          ? 'text-yellow-500 hover:text-yellow-600 hover:bg-white'
                                          : 'text-gray-400 hover:text-yellow-500 hover:bg-white'
                                          }`}
                                        title={meal.isFavorite ? "Remove from favorites" : "Add to favorites"}
                                        aria-label="Toggle favorite"
                                      >
                                        <span className="text-xs">⭐</span>
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingMeal(meal)
                                          setShowMealModal(true)
                                        }}
                                        className="p-1 text-gray-400 hover:text-blue-500 hover:bg-white rounded-lg transition-all btn-press"
                                        title="Edit meal"
                                        aria-label="Edit meal"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => handleCreateTaskFromMeal(meal)}
                                        className="p-1 text-gray-400 hover:text-purple-500 hover:bg-white rounded-lg transition-all btn-press"
                                        title="Create prep task"
                                        aria-label="Create task"
                                      >
                                        <CheckSquare className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => handleAddMealToShopping(meal.id)}
                                        className="p-1 text-gray-400 hover:text-green-500 hover:bg-white rounded-lg transition-all btn-press"
                                        title="Add ingredients to shopping list"
                                        aria-label="Add to shopping"
                                      >
                                        <ShoppingCart className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          setDeleteAction(() => () => handleDeleteMeal(meal.id))
                                          setShowConfirmDialog(true)
                                        }}
                                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-all btn-press"
                                        title="Delete meal"
                                        aria-label="Delete meal"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <button
                        onClick={() => {
                          setEditingMeal(null)
                          setShowMealModal(true)
                        }}
                        className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                      >
                        + Add meal for this day
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const renderMessages = () => {
    if (!currentUser) {
      return (
        <div className="space-y-6 animate-fade-in">
          <h3 className="text-2xl font-bold text-gray-900">Messages</h3>
          <div className="bg-white rounded-2xl p-12 shadow-medium border border-gray-100 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Setup Required</h4>
            <p className="text-gray-500 text-sm mb-4">
              To use messaging, you need to add family members first.
            </p>
            <button
              onClick={() => setActiveTab('family')}
              className="px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium shadow-soft hover:shadow-medium btn-press"
            >
              Go to Family Members
            </button>
          </div>
        </div>
      )
    }
    const conversations = getConversations()

    if (selectedConversation) {
      const conversation = conversations.find(c => c.personId === selectedConversation)
      if (!conversation) return null

      const conversationMessages = conversation.messages.sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )

      // Mark messages as read when viewing
      conversationMessages.forEach(msg => {
        if (msg.recipientId === currentUser?.id && !msg.read) {
          handleMarkAsRead(msg.id)
        }
      })

      return (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSelectedConversation(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all btn-press"
                title="Back to conversations"
                aria-label="Back to conversations"
              >
                ←
              </button>
              <div className={`w-12 h-12 ${conversation.personColor} rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-medium`}>
                {conversation.personName[0]}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{conversation.personName}</h3>
                <p className="text-sm text-gray-500">Conversation</p>
              </div>
            </div>
            <button
              onClick={() => setShowMessageModal(true)}
              className="flex items-center space-x-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium shadow-soft hover:shadow-medium btn-press"
            >
              <Plus className="w-5 h-5" />
              <span>New Message</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-medium border border-gray-100 min-h-[500px] max-h-[600px] overflow-y-auto">
            <div className="space-y-4">
              {conversationMessages.map(msg => {
                const isCurrentUser = msg.senderId === currentUser?.id
                return (
                  <div key={msg.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                      <div className={`p-4 rounded-2xl ${isCurrentUser
                        ? 'bg-blue-500 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                        }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        {msg.edited && (
                          <p className="text-xs opacity-70 mt-1 italic">(edited)</p>
                        )}
                        {/* Show attachment if exists */}
                        {msg.attachmentUrl && msg.attachmentType && msg.attachmentName && (
                          <div className="mt-3">
                            <MessageAttachment
                              url={msg.attachmentUrl}
                              type={msg.attachmentType}
                              name={msg.attachmentName}
                            />
                          </div>
                        )}
                      </div>
                      <div className={`flex items-center space-x-2 mt-1 text-xs text-gray-500 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                        <span>{new Date(msg.timestamp).toLocaleString()}</span>
                        {/* Read receipts for sent messages */}
                        {isCurrentUser && (
                          <span className="flex items-center space-x-1">
                            {msg.read ? (
                              <span className="text-blue-500" title={`Read ${msg.readAt ? new Date(msg.readAt).toLocaleString() : ''}`}>
                                ✓✓
                              </span>
                            ) : (
                              <span className="text-gray-400" title="Delivered">
                                ✓
                              </span>
                            )}
                          </span>
                        )}
                        {isCurrentUser && (
                          <button
                            onClick={() => {
                              setDeleteAction(() => () => handleDeleteMessage(msg.id))
                              setShowConfirmDialog(true)
                            }}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="Delete message"
                            aria-label="Delete message"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              {/* Typing indicator */}
              {typingUsers.has(selectedConversation) && (
                <div className="flex justify-start">
                  <div className="max-w-[70%]">
                    <TypingIndicator userName={conversation.personName} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-900">Messages</h3>
          <button
            onClick={() => setShowMessageModal(true)}
            className="flex items-center space-x-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium shadow-soft hover:shadow-medium btn-press"
          >
            <Plus className="w-5 h-5" />
            <span>New Message</span>
          </button>
        </div>

        {conversations.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-medium border border-gray-100 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h4>
            <p className="text-gray-500 text-sm">Start a conversation with your family members</p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map(conv => (
              <div
                key={conv.personId}
                onClick={() => setSelectedConversation(conv.personId)}
                className="bg-white rounded-2xl p-5 shadow-medium border border-gray-100 hover-lift cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 ${conv.personColor} rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-medium flex-shrink-0`}>
                    {conv.personName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900">{conv.personName}</h4>
                      <span className="text-xs text-gray-500">
                        {new Date(conv.lastMessage.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                      {conv.lastMessage.senderId === currentUser?.id ? 'You: ' : ''}
                      {conv.lastMessage.content}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-medium">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Family Hub</h1>
              <p className="text-xs text-gray-500">Stay connected</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-4 overflow-y-auto">
          {navigationSections.map((section, sectionIndex) => {
            const colorMap: Record<string, string> = {
              blue: 'text-blue-600',
              purple: 'text-purple-600',
              green: 'text-green-600',
              cyan: 'text-cyan-600',
              emerald: 'text-emerald-600',
              pink: 'text-pink-600',
              amber: 'text-amber-600',
              slate: 'text-slate-600',
              orange: 'text-orange-600'
            }
            return (
              <div key={section.title} className={sectionIndex > 0 ? 'pt-2' : ''}>
                <p className={`px-3 text-xs font-semibold uppercase tracking-wider mb-2 ${colorMap[section.color]}`}>
                  {section.title}
                </p>
                <div className="space-y-1">
                  {section.items.map(item => {
                    const Icon = item.icon
                    const isActive = activeTab === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id)
                          setSidebarOpen(false)
                        }}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all btn-press ${getColorClasses(section.color, isActive)}`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</p>
          <button
            onClick={() => {
              setActiveTab('profile')
              setSidebarOpen(false)
            }}
            className="w-full flex items-center space-x-3 px-3 py-2 mb-2 hover:bg-gray-50 rounded-lg transition-all cursor-pointer"
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user?.name || 'User'} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </button>
          {/* Logout button hidden - login disabled for now
          <button
            onClick={signOut}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all btn-press"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
          */}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all btn-press"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome back, {userName}!</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 hidden sm:block">Showing activities for {userName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <NotificationPanel
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={handleMarkNotificationAsRead}
                onMarkAllAsRead={handleMarkAllNotificationsAsRead}
                onDelete={handleDeleteNotification}
                onClearRead={handleClearReadNotifications}
              />
              <button
                onClick={() => setActiveTab('settings')}
                className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all btn-press"
                title="Settings"
                aria-label="Open settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'calendar' && renderCalendar()}
          {activeTab === 'tasks' && renderTasks()}
          {activeTab === 'family' && renderFamily()}
          {activeTab === 'shopping' && renderShopping()}
          {activeTab === 'messages' && renderMessages()}
          {activeTab === 'meals' && renderMeals()}
          {activeTab === 'money' && renderMoney()}
          {activeTab === 'familytree' && (
            <EnhancedFamilyTree
              members={familyMembers}
              relationships={relationships}
              onAddRelationship={() => setShowRelationshipModal(true)}
              onDeleteRelationship={handleDeleteRelationship}
              onViewMemberDetails={handleViewMemberDetails}
            />
          )}
          {activeTab === 'contacts' && renderContacts()}
          {activeTab === 'documents' && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Documents</h3>
              <p className="text-gray-500">Documents feature coming soon!</p>
            </div>
          )}
          {activeTab === 'profile' && <ProfilePage />}
          {activeTab === 'settings' && renderSettings()}
          {activeTab === 'uitest' && <UITestPage />}
          {activeTab === 'userflow' && <UserFlowDemo />}
        </main>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false)
          setEditingTask(null)
        }}
        title={editingTask ? 'Edit Task' : 'Add New Task'}
      >
        <TaskForm
          onSubmit={editingTask ? handleEditTask : handleAddTask}
          onCancel={() => {
            setShowTaskModal(false)
            setEditingTask(null)
          }}
          familyMembers={familyMembers.map(m => m.name)}
          initialData={editingTask ? {
            title: editingTask.title,
            assignedTo: editingTask.assignedTo,
            dueDate: editingTask.dueDate,
            priority: editingTask.priority
          } : undefined}
        />
      </Modal>

      <Modal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false)
          setEditingEvent(null)
        }}
        title={editingEvent ? 'Edit Event' : 'Add New Event'}
      >
        <EventForm
          onSubmit={editingEvent
            ? (eventData) => handleEditEvent(editingEvent.id, eventData)
            : handleAddEvent}
          onCancel={() => {
            setShowEventModal(false)
            setEditingEvent(null)
          }}
          initialData={editingEvent ? {
            title: editingEvent.title,
            date: editingEvent.date,
            time: editingEvent.time || '',
            type: editingEvent.type,
            description: editingEvent.description
          } : undefined}
        />
      </Modal>

      <Modal
        isOpen={showFamilyModal}
        onClose={() => {
          setShowFamilyModal(false)
          setEditingMember(null)
        }}
        title={editingMember ? 'Edit Family Member' : 'Add Family Member'}
      >
        <FamilyMemberForm
          onSubmit={editingMember ? handleEditMember : handleAddMember}
          onCancel={() => {
            setShowFamilyModal(false)
            setEditingMember(null)
          }}
          initialData={editingMember ? {
            name: editingMember.name,
            role: editingMember.role,
            color: editingMember.color,
            avatar_url: editingMember.avatar_url,
            avatar_pattern: editingMember.avatar_pattern,
            birth_date: editingMember.birth_date,
            phone: editingMember.phone,
            email: editingMember.email,
            address: editingMember.address,
            notes: editingMember.notes,
            generation: editingMember.generation
          } : undefined}
        />
      </Modal>

      <Modal
        isOpen={showShoppingModal}
        onClose={() => {
          setShowShoppingModal(false)
          setEditingShoppingItem(null)
        }}
        title={editingShoppingItem ? 'Edit Shopping Item' : 'Add Shopping Item'}
      >
        <ShoppingForm
          onSubmit={editingShoppingItem ? handleEditShoppingItem : handleAddShoppingItem}
          onCancel={() => {
            setShowShoppingModal(false)
            setEditingShoppingItem(null)
          }}
          initialData={editingShoppingItem ? {
            name: editingShoppingItem.name,
            quantity: editingShoppingItem.quantity,
            category: editingShoppingItem.category,
            notes: editingShoppingItem.notes
          } : undefined}
        />
      </Modal>

      <Modal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        title="Send Message"
      >
        <MessageForm
          onSubmit={handleSendMessage}
          onCancel={() => setShowMessageModal(false)}
          familyMembers={familyMembers}
          currentUserId={currentUser?.id || ''}
        />
      </Modal>

      <Modal
        isOpen={showRelationshipModal}
        onClose={() => setShowRelationshipModal(false)}
        title="Add Family Relationship"
      >
        <RelationshipForm
          familyMembers={familyMembers}
          onSubmit={handleAddRelationship}
          onCancel={() => setShowRelationshipModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showContactModal}
        onClose={() => {
          setShowContactModal(false)
          setEditingContact(null)
        }}
        title={editingContact ? 'Edit Contact' : 'Add New Contact'}
      >
        <ContactForm
          contact={editingContact || undefined}
          familyMembers={familyMembers}
          currentUser={userName}
          onSubmit={editingContact ? handleEditContact : handleAddContact}
          onClose={() => {
            setShowContactModal(false)
            setEditingContact(null)
          }}
        />
      </Modal>

      {showMemberDetailsModal && selectedMemberForDetails && (
        <FamilyMemberDetails
          member={selectedMemberForDetails}
          relationships={relationships}
          onClose={() => {
            setShowMemberDetailsModal(false)
            setSelectedMemberForDetails(null)
          }}
          onEdit={(member) => {
            setEditingMember(member)
            setShowFamilyModal(true)
          }}
        />
      )}

      <Modal
        isOpen={showMealModal}
        onClose={() => {
          setShowMealModal(false)
          setEditingMeal(null)
        }}
        title={editingMeal ? 'Edit Meal' : 'Add Meal'}
      >
        <MealForm
          onSubmit={editingMeal ? handleEditMeal : handleAddMeal}
          onCancel={() => {
            setShowMealModal(false)
            setEditingMeal(null)
          }}
          initialData={editingMeal ? {
            name: editingMeal.name,
            mealType: editingMeal.mealType,
            date: editingMeal.date,
            notes: editingMeal.notes,
            prepTime: editingMeal.prepTime
          } : undefined}
        />
      </Modal>

      <Modal
        isOpen={showTransactionModal}
        onClose={() => {
          setShowTransactionModal(false)
          setEditingTransaction(null)
        }}
        title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
      >
        <TransactionForm
          onSubmit={editingTransaction ? handleEditTransaction : handleAddTransaction}
          onCancel={() => {
            setShowTransactionModal(false)
            setEditingTransaction(null)
          }}
          initialData={editingTransaction ? {
            type: editingTransaction.type,
            category: editingTransaction.category,
            amount: editingTransaction.amount,
            description: editingTransaction.description,
            date: editingTransaction.date,
            payment_method: editingTransaction.payment_method
          } : undefined}
        />
      </Modal>

      <Modal
        isOpen={showBudgetModal}
        onClose={() => {
          setShowBudgetModal(false)
          setEditingBudget(null)
        }}
        title={editingBudget ? 'Edit Budget' : 'Create Budget'}
      >
        <BudgetForm
          onSubmit={editingBudget ? handleEditBudget : handleAddBudget}
          onCancel={() => {
            setShowBudgetModal(false)
            setEditingBudget(null)
          }}
          initialData={editingBudget ? {
            category: editingBudget.category,
            amount: editingBudget.amount,
            period: editingBudget.period
          } : undefined}
          categories={['Groceries', 'Dining', 'Transportation', 'Utilities', 'Rent/Mortgage', 'Entertainment', 'Healthcare', 'Education', 'Shopping', 'Insurance', 'Other Expense']}
        />
      </Modal>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false)
          setDeleteAction(null)
        }}
        onConfirm={() => {
          if (deleteAction) {
            deleteAction()
            setShowConfirmDialog(false)
            setDeleteAction(null)
          }
        }}
        title="Confirm Delete"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      <Toast
        message={toast?.message || ''}
        type={toast?.type || 'info'}
        isVisible={!!toast}
        onClose={() => setToast(null)}
      />

      {/* PWA Components */}
      <PWAInstallPrompt />
      <PWAInstallStatus />
    </div>
  )
}

export default App
