import { useState, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import { Calendar, ChevronLeft, ChevronRight, Plus, X, Edit2, Trash2, RefreshCw, Download, Upload, MapPin, Bell, Repeat, Paperclip, Users } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import type { Event } from '../services/api'

interface PremiumCalendarProps {
    events: Event[]
    onAddEvent: (eventData: Omit<Event, 'id' | 'attendees' | 'attachments' | 'created_at' | 'updated_at'>) => void | Promise<void>
    onEditEvent: (id: string, eventData: Partial<Omit<Event, 'id' | 'attachments' | 'created_at' | 'updated_at'>>) => void | Promise<void>
    onDeleteEvent: (id: string) => void | Promise<void>
    onUpdateDateTime?: (id: string, datetime: { date?: string; time?: string; end_time?: string }) => void | Promise<void>
    onSyncWithGoogle?: () => void | Promise<void>
    onImportFromGoogle?: () => void | Promise<void>
    isGoogleConnected?: boolean
    onGoogleConnect?: () => void | Promise<void>
    currentUser?: string
}

export function PremiumCalendar({
    events,
    onAddEvent,
    onEditEvent,
    onDeleteEvent,
    onUpdateDateTime,
    onSyncWithGoogle,
    onImportFromGoogle,
    isGoogleConnected = false,
    onGoogleConnect,
    currentUser = 'Demo User'
}: PremiumCalendarProps) {
    const [view, setView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek'>('dayGridMonth')
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [showEventModal, setShowEventModal] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState<Partial<Event> | null>(null)
    const [showEventDetails, setShowEventDetails] = useState(false)
    const calendarRef = useRef<FullCalendar>(null)

    // Convert events to FullCalendar format
    const calendarEvents = events.map(event => {
        let start: string, end: string

        if (event.all_day) {
            // All-day events
            start = event.date
            end = event.date
        } else {
            // Timed events
            start = `${event.date}T${event.time || '00:00'}`
            end = event.end_time ? `${event.date}T${event.end_time}` : start
        }

        return {
            id: event.id,
            title: event.title,
            start,
            end,
            allDay: event.all_day || false,
            extendedProps: {
                type: event.type,
                description: event.description,
                location: event.location,
                reminder_minutes: event.reminder_minutes,
                attendees: event.attendees || [],
                attachments: event.attachments || [],
                recurring_rule: event.recurring_rule,
                originalEvent: event
            },
            backgroundColor: event.type === 'family' ? '#3b82f6' : event.type === 'personal' ? '#10b981' : '#8b5cf6',
            borderColor: event.type === 'family' ? '#2563eb' : event.type === 'personal' ? '#059669' : '#7c3aed',
            classNames: ['cursor-pointer', 'hover:opacity-80', 'transition-opacity']
        }
    })

    const handleEventClick = (clickInfo: { event: { extendedProps?: { originalEvent?: Event } } }) => {
        const event = clickInfo.event.extendedProps?.originalEvent
        if (event) {
            setSelectedEvent(event)
            setShowEventDetails(true)
        }
    }

    const handleDateClick = (dateClickInfo: { date: Date; allDay?: boolean }) => {
        const clickedDate = format(dateClickInfo.date, 'yyyy-MM-dd')
        const clickedTime = format(dateClickInfo.date, 'HH:mm')

        setSelectedEvent({
            title: '',
            date: clickedDate,
            time: dateClickInfo.allDay ? undefined : clickedTime,
            all_day: dateClickInfo.allDay,
            type: 'family',
            description: '',
            created_by: currentUser
        })
        setShowEventModal(true)
    }

    const handleEventDrop = (dropInfo: { event: { id: string; start: Date | null; end?: Date | null; allDay: boolean } }) => {
        if (!onUpdateDateTime) return

        const event = dropInfo.event
        const startDate = event.start
        if (!startDate) return

        const newDate = format(startDate, 'yyyy-MM-dd')
        const newTime = event.allDay ? undefined : format(startDate, 'HH:mm')
        const newEndTime = event.end && !event.allDay ? format(event.end, 'HH:mm') : undefined

        onUpdateDateTime(event.id, {
            date: newDate,
            time: newTime,
            end_time: newEndTime
        })
    }

    const handleEventResize = (resizeInfo: { event: { id: string; end?: Date | null; allDay: boolean } }) => {
        if (!onUpdateDateTime) return

        const event = resizeInfo.event
        const newEndTime = event.end && !event.allDay ? format(event.end, 'HH:mm') : undefined

        if (newEndTime) {
            onUpdateDateTime(event.id, {
                end_time: newEndTime
            })
        }
    }

    const handleViewChange = (newView: typeof view) => {
        setView(newView)
        const calendarApi = calendarRef.current?.getApi()
        if (calendarApi) {
            calendarApi.changeView(newView)
        }
    }

    const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
        const calendarApi = calendarRef.current?.getApi()
        if (calendarApi) {
            if (direction === 'prev') calendarApi.prev()
            else if (direction === 'next') calendarApi.next()
            else calendarApi.today()

            setSelectedDate(calendarApi.getDate())
        }
    }

    const getViewTitle = () => {
        const calendarApi = calendarRef.current?.getApi()
        return calendarApi?.view.title || format(selectedDate, 'MMMM yyyy')
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header with Controls */}
            <div className="bg-white rounded-2xl p-6 shadow-medium border border-gray-100">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Navigation */}
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handleNavigate('prev')}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-all btn-press"
                                aria-label="Previous period"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <button
                                onClick={() => handleNavigate('today')}
                                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all font-medium btn-press"
                            >
                                Today
                            </button>
                            <button
                                onClick={() => handleNavigate('next')}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-all btn-press"
                                aria-label="Next period"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 ml-2">{getViewTitle()}</h3>
                    </div>

                    {/* View Switcher */}
                    <div className="flex items-center space-x-2">
                        <div className="inline-flex bg-gray-100 rounded-xl p-1">
                            <button
                                onClick={() => handleViewChange('dayGridMonth')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'dayGridMonth' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Month
                            </button>
                            <button
                                onClick={() => handleViewChange('timeGridWeek')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'timeGridWeek' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Week
                            </button>
                            <button
                                onClick={() => handleViewChange('timeGridDay')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'timeGridDay' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Day
                            </button>
                            <button
                                onClick={() => handleViewChange('listWeek')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'listWeek' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                List
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                        {isGoogleConnected ? (
                            <>
                                <button
                                    onClick={onSyncWithGoogle}
                                    className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all font-medium btn-press"
                                    title="Sync with Google Calendar"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    <span className="hidden sm:inline">Sync</span>
                                </button>
                                <button
                                    onClick={onImportFromGoogle}
                                    className="flex items-center space-x-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-all font-medium btn-press"
                                    title="Import from Google Calendar"
                                >
                                    <Download className="w-4 h-4" />
                                    <span className="hidden sm:inline">Import</span>
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={onGoogleConnect}
                                className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all font-medium btn-press"
                                title="Connect Google Calendar"
                            >
                                <Upload className="w-4 h-4" />
                                <span className="hidden sm:inline">Connect Google</span>
                            </button>
                        )}
                        <button
                            onClick={() => {
                                setSelectedEvent({
                                    id: '',
                                    title: '',
                                    date: format(new Date(), 'yyyy-MM-dd'),
                                    time: format(new Date(), 'HH:mm'),
                                    type: 'family',
                                    description: ''
                                })
                                setShowEventModal(true)
                            }}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium shadow-soft hover:shadow-medium btn-press"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Event</span>
                        </button>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-600 font-medium">Event Types:</span>
                    <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-xs text-gray-600">Family</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-xs text-gray-600">Personal</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span className="text-xs text-gray-600">Work</span>
                    </div>
                </div>
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-2xl p-6 shadow-medium border border-gray-100">
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                    initialView={view}
                    headerToolbar={false}
                    events={calendarEvents}
                    editable={true}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    weekends={true}
                    eventClick={handleEventClick}
                    dateClick={handleDateClick}
                    eventDrop={handleEventDrop}
                    eventResize={handleEventResize}
                    height="auto"
                    contentHeight="auto"
                    aspectRatio={1.8}
                    eventDisplay="block"
                    displayEventTime={true}
                    displayEventEnd={true}
                    nowIndicator={true}
                    slotMinTime="06:00:00"
                    slotMaxTime="23:00:00"
                    allDaySlot={true}
                    expandRows={true}
                />
            </div>

            {/* Event Details Modal */}
            {showEventDetails && selectedEvent && selectedEvent.id && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 animate-scale-in">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedEvent.title}</h3>
                                <div className="flex items-center space-x-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${selectedEvent.type === 'family' ? 'bg-blue-100 text-blue-700' :
                                        selectedEvent.type === 'personal' ? 'bg-green-100 text-green-700' :
                                            'bg-purple-100 text-purple-700'
                                        }`}>
                                        {selectedEvent.type}
                                    </span>
                                    {selectedEvent.all_day && (
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                            All Day
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setShowEventDetails(false)}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-all"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Date & Time</p>
                                <p className="text-gray-900 font-medium">
                                    {selectedEvent.date && format(parseISO(selectedEvent.date), 'EEEE, MMMM d, yyyy')}
                                    {!selectedEvent.all_day && selectedEvent.time && (
                                        <> at {selectedEvent.time}
                                            {selectedEvent.end_time && ` - ${selectedEvent.end_time}`}
                                        </>
                                    )}
                                </p>
                            </div>

                            {selectedEvent.location && (
                                <div className="flex items-start space-x-2">
                                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500">Location</p>
                                        <p className="text-gray-900">{selectedEvent.location}</p>
                                    </div>
                                </div>
                            )}

                            {selectedEvent.description && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Description</p>
                                    <p className="text-gray-900">{selectedEvent.description}</p>
                                </div>
                            )}

                            {selectedEvent.reminder_minutes && selectedEvent.reminder_minutes > 0 && (
                                <div className="flex items-center space-x-2 text-sm text-gray-700">
                                    <Bell className="w-4 h-4" />
                                    <span>Reminder: {selectedEvent.reminder_minutes} minutes before</span>
                                </div>
                            )}

                            {selectedEvent.recurring_rule && (
                                <div className="flex items-center space-x-2 text-sm text-gray-700">
                                    <Repeat className="w-4 h-4" />
                                    <span>Repeats: {selectedEvent.recurring_rule.frequency}</span>
                                </div>
                            )}

                            {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-2 flex items-center space-x-2">
                                        <Users className="w-4 h-4" />
                                        <span>Attendees</span>
                                    </p>
                                    <div className="space-y-1">
                                        {selectedEvent.attendees.map((attendee, idx) => (
                                            <div key={idx} className="text-sm text-gray-700 flex items-center space-x-2">
                                                <span className={`w-2 h-2 rounded-full ${attendee.status === 'accepted' ? 'bg-green-500' :
                                                    attendee.status === 'declined' ? 'bg-red-500' :
                                                        attendee.status === 'tentative' ? 'bg-yellow-500' :
                                                            'bg-gray-400'
                                                    }`}></span>
                                                <span>{attendee.family_member_name || attendee.user_email}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedEvent.attachments && selectedEvent.attachments.length > 0 && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-2 flex items-center space-x-2">
                                        <Paperclip className="w-4 h-4" />
                                        <span>Attachments</span>
                                    </p>
                                    <div className="space-y-1">
                                        {selectedEvent.attachments.map((attachment) => (
                                            <a
                                                key={attachment.id}
                                                href={attachment.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-600 hover:text-blue-700 block"
                                            >
                                                📎 {attachment.file_name}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedEvent.google_event_id && (
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <Calendar className="w-4 h-4" />
                                    <span>Synced with Google Calendar</span>
                                </div>
                            )}
                        </div>

                        <div className="flex space-x-2 mt-6">
                            <button
                                onClick={() => {
                                    setShowEventDetails(false)
                                    setShowEventModal(true)
                                }}
                                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all font-medium btn-press"
                            >
                                <Edit2 className="w-4 h-4" />
                                <span>Edit</span>
                            </button>
                            <button
                                onClick={() => {
                                    onDeleteEvent(selectedEvent.id!)
                                    setShowEventDetails(false)
                                }}
                                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all font-medium btn-press"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Event Modal */}
            {showEventModal && selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 animate-scale-in">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">
                                {selectedEvent.id ? 'Edit Event' : 'Add Event'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowEventModal(false)
                                    setSelectedEvent(null)
                                }}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-all"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <form
                            onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                                e.preventDefault()
                                const formData = new FormData(e.currentTarget)
                                const allDay = formData.get('all_day') === 'on'

                                const eventData: Partial<Event> = {
                                    title: formData.get('title') as string,
                                    date: formData.get('date') as string,
                                    type: formData.get('type') as 'family' | 'personal' | 'work',
                                    all_day: allDay,
                                    description: formData.get('description') as string || undefined,
                                    location: formData.get('location') as string || undefined,
                                    created_by: currentUser
                                }

                                // Only add time fields if not all-day
                                if (!allDay) {
                                    eventData.time = formData.get('time') as string
                                    eventData.end_time = formData.get('end_time') as string || undefined
                                }

                                // Add reminder
                                const reminderValue = formData.get('reminder_minutes') as string
                                if (reminderValue && reminderValue !== '0') {
                                    eventData.reminder_minutes = parseInt(reminderValue)
                                }

                                // Add recurring rule if set
                                const frequency = formData.get('recurring_frequency') as string
                                if (frequency && frequency !== 'none') {
                                    eventData.recurring_rule = {
                                        frequency: frequency as 'daily' | 'weekly' | 'monthly' | 'yearly'
                                    }
                                }

                                if (selectedEvent.id) {
                                    onEditEvent(selectedEvent.id, eventData)
                                } else if (eventData.title && eventData.date && eventData.type) {
                                    onAddEvent(eventData as Omit<Event, 'id' | 'attendees' | 'attachments' | 'created_at' | 'updated_at'>)
                                }

                                setShowEventModal(false)
                                setSelectedEvent(null)
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    defaultValue={selectedEvent.title}
                                    required
                                    maxLength={255}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Event title"
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="all_day"
                                    name="all_day"
                                    defaultChecked={selectedEvent.all_day}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    onChange={(e) => {
                                        const timeInputs = document.querySelectorAll<HTMLInputElement>('input[name="time"], input[name="end_time"]')
                                        timeInputs.forEach(input => {
                                            input.disabled = e.target.checked
                                            if (e.target.checked) {
                                                input.removeAttribute('required')
                                            } else {
                                                if (input.name === 'time') input.setAttribute('required', 'required')
                                            }
                                        })
                                    }}
                                />
                                <label htmlFor="all_day" className="text-sm font-medium text-gray-700">All-day event</label>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="event-date" className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                                    <input
                                        id="event-date"
                                        type="date"
                                        name="date"
                                        defaultValue={selectedEvent.date}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        aria-label="Event date"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="event-type" className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                                    <select
                                        id="event-type"
                                        name="type"
                                        defaultValue={selectedEvent.type}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        aria-label="Event type"
                                    >
                                        <option value="family">Family</option>
                                        <option value="personal">Personal</option>
                                        <option value="work">Work</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="event-time" className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                                    <input
                                        id="event-time"
                                        type="time"
                                        name="time"
                                        defaultValue={selectedEvent.time}
                                        required={!selectedEvent.all_day}
                                        disabled={selectedEvent.all_day}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        aria-label="Event start time"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="event-end-time" className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                                    <input
                                        id="event-end-time"
                                        type="time"
                                        name="end_time"
                                        defaultValue={selectedEvent.end_time}
                                        disabled={selectedEvent.all_day}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        aria-label="Event end time"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="event-location" className="block text-sm font-medium text-gray-700 mb-2">
                                    <MapPin className="w-4 h-4 inline mr-1" />
                                    Location
                                </label>
                                <input
                                    id="event-location"
                                    type="text"
                                    name="location"
                                    defaultValue={selectedEvent.location}
                                    maxLength={255}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Event location or address"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    name="description"
                                    defaultValue={selectedEvent.description}
                                    rows={3}
                                    maxLength={1000}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                    placeholder="Event description"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="reminder" className="block text-sm font-medium text-gray-700 mb-2">
                                        <Bell className="w-4 h-4 inline mr-1" />
                                        Reminder
                                    </label>
                                    <select
                                        id="reminder"
                                        name="reminder_minutes"
                                        defaultValue={selectedEvent.reminder_minutes?.toString() || '0'}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    >
                                        <option value="0">No reminder</option>
                                        <option value="5">5 minutes before</option>
                                        <option value="15">15 minutes before</option>
                                        <option value="30">30 minutes before</option>
                                        <option value="60">1 hour before</option>
                                        <option value="1440">1 day before</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="recurring" className="block text-sm font-medium text-gray-700 mb-2">
                                        <Repeat className="w-4 h-4 inline mr-1" />
                                        Repeat
                                    </label>
                                    <select
                                        id="recurring"
                                        name="recurring_frequency"
                                        defaultValue={selectedEvent.recurring_rule?.frequency || 'none'}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    >
                                        <option value="none">Does not repeat</option>
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEventModal(false)
                                        setSelectedEvent(null)
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium btn-press"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium shadow-soft hover:shadow-medium btn-press"
                                >
                                    {selectedEvent.id ? 'Update' : 'Add'} Event
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

