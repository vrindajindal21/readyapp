"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Bell, Clock, Calendar, Volume2, X, Trash2, Edit, CheckCircle } from "lucide-react"
import { format, isToday, isTomorrow, addDays } from "date-fns"
import { NotificationService } from "@/lib/notification-service"
import { ReminderManager, type Reminder } from "@/lib/reminder-manager"
import { VoiceInput } from "@/components/voice-input"
import { RequiredFieldLabel } from "@/components/required-field-label"

interface ScheduleTime {
  id: string
  time: string
  days: string[]
}

const DAYS_OF_WEEK = [
  { id: "monday", label: "Mon", full: "Monday" },
  { id: "tuesday", label: "Tue", full: "Tuesday" },
  { id: "wednesday", label: "Wed", full: "Wednesday" },
  { id: "thursday", label: "Thu", full: "Thursday" },
  { id: "friday", label: "Fri", full: "Friday" },
  { id: "saturday", label: "Sat", full: "Saturday" },
  { id: "sunday", label: "Sun", full: "Sunday" },
]

const REMINDER_CATEGORIES = [
  { value: "medication", label: "Medication", color: "bg-blue-500" },
  { value: "health", label: "Health", color: "bg-green-500" },
  { value: "study", label: "Study", color: "bg-purple-500" },
  { value: "work", label: "Work", color: "bg-orange-500" },
  { value: "personal", label: "Personal", color: "bg-pink-500" },
  { value: "general", label: "General", color: "bg-gray-500" },
]

const REMINDER_COLORS = [
  { name: "Red", value: "bg-red-500", border: "border-red-500" },
  { name: "Blue", value: "bg-blue-500", border: "border-blue-500" },
  { name: "Green", value: "bg-green-500", border: "border-green-500" },
  { name: "Yellow", value: "bg-yellow-500", border: "border-yellow-500" },
  { name: "Purple", value: "bg-purple-500", border: "border-purple-500" },
  { name: "Pink", value: "bg-pink-500", border: "border-pink-500" },
  { name: "Orange", value: "bg-orange-500", border: "border-orange-500" },
  { name: "Teal", value: "bg-teal-500", border: "border-teal-500" },
]

const SOUND_TYPES = [
  { value: "bell", label: "Bell" },
  { value: "chime", label: "Chime" },
  { value: "beep", label: "Beep" },
  { value: "medication", label: "Medication" },
  { value: "study", label: "Study" },
  { value: "urgent", label: "Urgent" },
]

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("medication")
  const [scheduleTimes, setScheduleTimes] = useState<ScheduleTime[]>([
    { id: "1", time: "08:00", days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] },
  ])
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [endDate, setEndDate] = useState("")
  const [selectedColor, setSelectedColor] = useState("bg-blue-500")
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [soundType, setSoundType] = useState("bell")
  const [volume, setVolume] = useState([70])

  // Form validation
  const [titleError, setTitleError] = useState("")
  const [scheduleError, setScheduleError] = useState("")

  useEffect(() => {
    loadReminders()
  }, [])

  const loadReminders = () => {
    const allReminders = ReminderManager.getAllReminders()
    setReminders(allReminders)
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setCategory("medication")
    setScheduleTimes([
      { id: "1", time: "08:00", days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] },
    ])
    setStartDate(format(new Date(), "yyyy-MM-dd"))
    setEndDate("")
    setSelectedColor("bg-blue-500")
    setNotificationsEnabled(true)
    setSoundEnabled(true)
    setSoundType("bell")
    setVolume([70])
    setTitleError("")
    setScheduleError("")
    setEditingReminder(null)
  }

  const validateForm = () => {
    let isValid = true

    if (!title.trim()) {
      setTitleError("Title is required")
      isValid = false
    } else {
      setTitleError("")
    }

    if (scheduleTimes.length === 0) {
      setScheduleError("At least one schedule time is required")
      isValid = false
    } else {
      setScheduleError("")
    }

    return isValid
  }

  const addScheduleTime = () => {
    const newTime: ScheduleTime = {
      id: Date.now().toString(),
      time: "09:00",
      days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    }
    setScheduleTimes([...scheduleTimes, newTime])
  }

  const updateScheduleTime = (id: string, field: keyof ScheduleTime, value: any) => {
    setScheduleTimes((prev) => prev.map((time) => (time.id === id ? { ...time, [field]: value } : time)))
  }

  const removeScheduleTime = (id: string) => {
    if (scheduleTimes.length > 1) {
      setScheduleTimes((prev) => prev.filter((time) => time.id !== id))
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      // For recurring reminders, store all selected days in one reminder
      const allDays = Array.from(new Set(scheduleTimes.flatMap(st => st.days)))
      const firstSchedule = scheduleTimes[0]
      const [hours, minutes] = firstSchedule.time.split(":").map(Number)
      const now = new Date()
      let soonestDate: Date | null = null;
      for (const day of allDays) {
        const dayIndex = DAYS_OF_WEEK.findIndex(d => d.id === day);
        let daysUntil = (dayIndex - now.getDay() + 7) % 7;
        const candidate = new Date(now);
        candidate.setDate(now.getDate() + daysUntil);
        candidate.setHours(hours, minutes, 0, 0);
        // If today and time is in the past, skip to next week
        if (daysUntil === 0 && candidate <= now) {
          candidate.setDate(candidate.getDate() + 7);
        }
        if (!soonestDate || candidate < soonestDate) {
          soonestDate = candidate;
        }
      }
      // Use soonestDate as scheduledDate
      const scheduledDate = soonestDate!;
      const parsedStartDate = startDate ? new Date(startDate) : null;
      const parsedEndDate = endDate ? new Date(endDate) : null;
      const reminder: Reminder = {
        id: editingReminder?.id || `${Date.now()}-recurring`,
        title,
        description,
        scheduledTime: scheduledDate,
        type: category as any,
        recurring: true,
        recurringPattern: "weekly",
        soundEnabled,
        soundType,
        soundVolume: volume[0],
        notificationEnabled: notificationsEnabled,
        vibrationEnabled: true,
        data: {
          color: selectedColor,
          days: allDays,
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          scheduleTimes: scheduleTimes.map(st => st.time),
        },
      }
      if (editingReminder) {
        ReminderManager.updateReminder(reminder)
      } else {
        ReminderManager.addReminder(reminder)
      }
      if (notificationsEnabled) {
        if (NotificationService.isSupported() && Notification.permission !== 'granted') {
          await NotificationService.requestPermission();
        }
        NotificationService.showRichNotification({
          title: `✅ Reminder Created: ${title}`,
          body: `Your reminder has been set up successfully`,
          type: category,
        });
      }
      loadReminders()
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error saving reminder:", error)
    }
  }

  const editReminder = (reminder: Reminder) => {
    setEditingReminder(reminder)
    setTitle(reminder.title)
    setDescription(reminder.description || "")
    setCategory(reminder.type)
    setNotificationsEnabled(reminder.notificationEnabled !== false)
    setSoundEnabled(reminder.soundEnabled !== false)
    setSoundType(reminder.soundType || "bell")
    setVolume([reminder.soundVolume || 70])
    setSelectedColor(reminder.data?.color || "bg-blue-500")
    setIsDialogOpen(true)
  }

  const deleteReminder = (id: string | number) => {
    ReminderManager.removeReminder(id)
    loadReminders()
  }

  const completeReminder = (id: string | number) => {
    ReminderManager.completeReminder(id)
    loadReminders()
  }

  const testSound = () => {
    NotificationService.playSound(soundType as any, volume[0])
  }

  const getTodaysReminders = () => {
    return reminders.filter((reminder) => isToday((reminder as any).scheduledTime) && !reminder.completed)
  }

  const getUpcomingReminders = () => {
    return reminders
      .filter((reminder) => (reminder as any).scheduledTime > new Date() && !isToday((reminder as any).scheduledTime))
      .slice(0, 5)
  }

  const getCategoryColor = (type: string) => {
    return REMINDER_CATEGORIES.find((cat) => cat.value === type)?.color || "bg-gray-500"
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reminders</h1>
          <p className="text-muted-foreground">Manage your daily reminders and notifications</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingReminder ? "Edit Reminder" : "Add New Reminder"}</DialogTitle>
              <DialogDescription>Create a new reminder with notifications</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <RequiredFieldLabel htmlFor="title">Title</RequiredFieldLabel>
                <div className="relative">
                  <Input
                    id="title"
                    placeholder="Reminder title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={titleError ? "border-red-500" : ""}
                  />
                  <VoiceInput onTranscript={setTitle} className="absolute right-2 top-1/2 -translate-y-1/2" />
                </div>
                {titleError && <p className="text-sm text-red-500">{titleError}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <div className="relative">
                  <Textarea
                    id="description"
                    placeholder="Additional details"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                  <VoiceInput onTranscript={setDescription} className="absolute right-2 top-2" />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REMINDER_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                          {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Schedule */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Schedule</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addScheduleTime}>
                    <Plus className="mr-1 h-3 w-3" />
                    Add Time
                  </Button>
                </div>

                {scheduleTimes.map((scheduleTime, index) => (
                  <Card key={scheduleTime.id} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <Label>Time</Label>
                        </div>
                        {scheduleTimes.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeScheduleTime(scheduleTime.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <Input
                        type="time"
                        value={scheduleTime.time}
                        onChange={(e) => updateScheduleTime(scheduleTime.id, "time", e.target.value)}
                      />

                      <div className="space-y-2">
                        <Label>Days</Label>
                        <div className="flex flex-wrap gap-2">
                          {DAYS_OF_WEEK.map((day) => (
                            <div key={day.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${scheduleTime.id}-${day.id}`}
                                checked={scheduleTime.days.includes(day.id)}
                                onCheckedChange={(checked) => {
                                  const newDays = checked
                                    ? [...scheduleTime.days, day.id]
                                    : scheduleTime.days.filter((d) => d !== day.id)
                                  updateScheduleTime(scheduleTime.id, "days", newDays)
                                }}
                              />
                              <Label
                                htmlFor={`${scheduleTime.id}-${day.id}`}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {day.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                {scheduleError && <p className="text-sm text-red-500">{scheduleError}</p>}
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="No end date"
                  />
                </div>
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  {REMINDER_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`w-8 h-8 rounded-full ${color.value} border-2 ${
                        selectedColor === color.value ? color.border : "border-transparent"
                      }`}
                      onClick={() => setSelectedColor(color.value)}
                    />
                  ))}
                </div>
              </div>

              <Separator />

              {/* Notifications */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get reminded when it's time</p>
                  </div>
                  <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sound</Label>
                    <p className="text-sm text-muted-foreground">Play a sound when the reminder is due</p>
                  </div>
                  <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                </div>

                {soundEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label>Sound Type</Label>
                      <div className="flex gap-2">
                        <Select value={soundType} onValueChange={setSoundType}>
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SOUND_TYPES.map((sound) => (
                              <SelectItem key={sound.value} value={sound.value}>
                                {sound.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button type="button" variant="outline" size="icon" onClick={testSound}>
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Volume</Label>
                        <span className="text-sm text-muted-foreground">{volume[0]}%</span>
                      </div>
                      <Slider value={volume} onValueChange={setVolume} max={100} step={5} className="w-full" />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>{editingReminder ? "Update Reminder" : "Add Reminder"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Today's Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Today's Reminders
          </CardTitle>
          <CardDescription>{getTodaysReminders().length} reminders for today</CardDescription>
        </CardHeader>
        <CardContent>
          {getTodaysReminders().length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No reminders for today</p>
          ) : (
            <div className="space-y-3">
              {getTodaysReminders().map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getCategoryColor(reminder.type)}`} />
                    <div>
                      <p className="font-medium">{reminder.title}</p>
                      <p className="text-sm text-muted-foreground">{format(reminder.scheduledTime, "h:mm a")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{reminder.type}</Badge>
                    <Button size="sm" variant="outline" onClick={() => completeReminder(reminder.id)}>
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {getUpcomingReminders().length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No upcoming reminders</p>
          ) : (
            <div className="space-y-3">
              {getUpcomingReminders().map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getCategoryColor(reminder.type)}`} />
                    <div>
                      <p className="font-medium">{reminder.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {isTomorrow(reminder.scheduledTime)
                          ? `Tomorrow at ${format(reminder.scheduledTime, "h:mm a")}`
                          : format(reminder.scheduledTime, "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{reminder.type}</Badge>
                    <Button size="sm" variant="ghost" onClick={() => editReminder(reminder)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteReminder(reminder.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Reminders */}
      <Card>
        <CardHeader>
          <CardTitle>All Reminders</CardTitle>
          <CardDescription>{reminders.length} total reminders</CardDescription>
        </CardHeader>
        <CardContent>
          {reminders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No reminders created yet</p>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className={`flex items-center justify-between p-3 border rounded-lg ${
                      reminder.completed ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getCategoryColor(reminder.type)}`} />
                      <div>
                        <p className={`font-medium ${reminder.completed ? "line-through" : ""}`}>{reminder.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(reminder.scheduledTime, "MMM d, h:mm a")}
                          {reminder.recurring && " (Recurring)"}
                        </p>
                        {reminder.description && (
                          <p className="text-sm text-muted-foreground mt-1">{reminder.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{reminder.type}</Badge>
                      {reminder.completed && <Badge variant="secondary">Completed</Badge>}
                      <Button size="sm" variant="ghost" onClick={() => editReminder(reminder)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteReminder(reminder.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
