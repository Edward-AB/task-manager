import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme.js';
import { useAuth } from '../hooks/useAuth.js';
import { useNarrow } from '../hooks/useNarrow.js';
import { useDate } from '../contexts/DateContext.jsx';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts.js';
import useTeams from '../hooks/useTeams.js';
import { apiGet, apiPost, apiPatch, apiDelete, apiPut } from '../api/client.js';
import { dateKey, todayKey, formatDate, getMonday, addDays } from '../utils/dates.js';
import { playTick, playCelebration } from '../utils/sounds.js';
import { DEFAULT_TASK_DURATION } from '../constants';

/** Map snake_case DB fields to camelCase for consistent frontend usage */
function normalizeTask(t) {
  return {
    ...t,
    colorId: t.color_id ?? t.colorId ?? 'white',
    deadlineId: t.deadline_id ?? t.deadlineId ?? null,
    projectId: t.project_id ?? t.projectId ?? null,
    parentTaskId: t.parent_task_id ?? t.parentTaskId ?? null,
  };
}

// Sub-components
import GreetingCard from '../components/dashboard/GreetingCard.jsx';
import DayNoteCard from '../components/dashboard/DayNoteCard.jsx';
import CelebrationOverlay from '../components/dashboard/CelebrationOverlay.jsx';
import OverviewCard from '../components/overview/OverviewCard.jsx';
import AddTaskForm from '../components/tasks/AddTaskForm.jsx';
import TaskList from '../components/tasks/TaskList.jsx';
import DeadlineList from '../components/deadlines/DeadlineList.jsx';
import DaySchedule from '../components/calendar/DaySchedule.jsx';
import NoteModal from '../components/notes/NoteModal.jsx';

export default function DashboardPage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const narrow = useNarrow();
  const navigate = useNavigate();
  const taskInputRef = useRef(null);
  const { date, setDate } = useDate();

  // ── State ──────────────────────────────────────────
  const [allTasks, setAllTasks] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [projects, setProjects] = useState([]);
  const [events, setEvents] = useState([]);
  const [blockedTimes, setBlockedTimes] = useState([]);
  const [dayNote, setDayNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [calView, setCalView] = useState('week');
  const [noteTask, setNoteTask] = useState(null);
  const [celebrating, setCelebrating] = useState(false);
  const [celebratedKey, setCelebratedKey] = useState(null);
  const { teams } = useTeams();

  // ── Keyboard shortcuts ────────────────────────────
  useKeyboardShortcuts({
    onNewTask: () => taskInputRef.current?.focus(),
    onToggleTheme: toggleTheme,
    onPrevDay: () => setDate((d) => addDays(d, -1)),
    onNextDay: () => setDate((d) => addDays(d, 1)),
    onEscape: () => setNoteTask(null),
    onHelp: () => navigate('/help'),
  });

  // ── Derived values ─────────────────────────────────
  const dk = dateKey(date);
  const monday = getMonday(date);
  const sunday = addDays(monday, 6);
  const fromStr = dateKey(monday);
  const toStr = dateKey(sunday);
  const dayTasks = allTasks.filter((t) => t.date === dk);

  // ── Data fetching ──────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const [tasksRes, dlRes, projRes, evRes, btRes, noteRes] = await Promise.all([
        apiGet(`/api/tasks?from=${fromStr}&to=${toStr}`).catch(() => []),
        apiGet('/api/deadlines').catch(() => []),
        apiGet('/api/projects').catch(() => []),
        apiGet(`/api/events?from=${fromStr}&to=${toStr}`).catch(() => []),
        apiGet('/api/blocked-times').catch(() => []),
        apiGet(`/api/day-notes?date=${dk}`).catch(() => ({})),
      ]);

      // Normalize responses - the API may return arrays directly or {data: [...]}
      const norm = (res) => Array.isArray(res) ? res : (res?.data || []);

      setAllTasks(norm(tasksRes).map(normalizeTask));
      setDeadlines(norm(dlRes));
      setProjects(norm(projRes));
      setEvents(norm(evRes));
      setBlockedTimes(norm(btRes));
      setDayNote(noteRes?.content || noteRes?.note || noteRes?.text || noteRes?.data?.content || '');
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    }
    setLoading(false);
  }, [fromStr, toStr, dk]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Re-fetch day note on date change within the same week
  useEffect(() => {
    apiGet(`/api/day-notes?date=${dk}`)
      .then((res) => setDayNote(res?.content || res?.note || res?.text || res?.data?.content || ''))
      .catch(() => setDayNote(''));
  }, [dk]);

  // Reset celebration flag when date changes
  useEffect(() => {
    setCelebratedKey(null);
  }, [dk]);

  // ── Celebration check ──────────────────────────────
  useEffect(() => {
    if (
      dayTasks.length > 0 &&
      dayTasks.every((t) => t.done) &&
      celebratedKey !== dk
    ) {
      setCelebrating(true);
      setCelebratedKey(dk);
    }
  }, [dayTasks, dk, celebratedKey]);

  const handleCelebrationDone = useCallback(() => {
    setCelebrating(false);
  }, []);

  // ── Task actions ───────────────────────────────────
  const handleAddTask = async (taskData) => {
    try {
      const { team_id: teamId, ...rest } = taskData;
      const res = await apiPost('/api/tasks', {
        ...rest,
        date: dk,
        duration: taskData.duration || DEFAULT_TASK_DURATION,
      });
      const newTask = normalizeTask(res?.data || res);
      setAllTasks((prev) => [...prev, newTask]);
      if (teamId && newTask?.id) {
        apiPost(`/api/tasks/${newTask.id}/assign`, { teamId }).catch(() => {});
      }
    } catch (err) {
      console.error('Add task error:', err);
    }
  };

  const handleToggle = async (idOrTask, doneArg) => {
    let id, newDone;
    if (typeof idOrTask === 'object') {
      id = idOrTask.id;
      newDone = !idOrTask.done;
    } else {
      id = idOrTask;
      newDone = doneArg;
    }

    playTick();
    setAllTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: newDone ? 1 : 0 } : t))
    );

    try {
      await apiPatch(`/api/tasks/${id}`, {
        done: newDone ? 1 : 0,
        done_at: newDone ? Date.now() : null,
      });
    } catch {
      fetchData();
    }
  };

  const handleDelete = async (idOrTask) => {
    const id = typeof idOrTask === 'object' ? idOrTask.id : idOrTask;
    const prev = allTasks;
    setAllTasks((t) => t.filter((task) => task.id !== id));
    try {
      await apiDelete(`/api/tasks/${id}`);
    } catch {
      setAllTasks(prev);
    }
  };

  const handleUpdate = async (id, updates) => {
    setAllTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    try {
      await apiPatch(`/api/tasks/${id}`, updates);
    } catch {
      fetchData();
    }
  };

  const handleMove = async (idOrTask) => {
    const id = typeof idOrTask === 'object' ? idOrTask.id : idOrTask;
    const task = allTasks.find((t) => t.id === id);
    if (!task) return;
    const tomorrow = dateKey(addDays(new Date(task.date + 'T12:00:00'), 1));
    setAllTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, date: tomorrow, slot: null } : t))
    );
    try {
      await apiPatch(`/api/tasks/${id}`, { date: tomorrow, slot: null });
    } catch {
      fetchData();
    }
  };

  const handleNoteOpen = (task) => {
    setNoteTask(task);
  };

  const handleSaveNote = async (text) => {
    if (!noteTask) return;
    const id = noteTask.id;
    setNoteTask(null);
    handleUpdate(id, { note: text });
  };

  // ── Schedule actions ───────────────────────────────
  const handleSlotClick = (slot) => {
    // Placeholder for future quick-add at slot
  };

  const handleTaskDrop = async (taskId, slot) => {
    setAllTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, slot, date: dk } : t))
    );
    try {
      await apiPatch(`/api/tasks/${taskId}`, { slot, date: dk });
    } catch {
      fetchData();
    }
  };

  const handleTaskToggle = (task) => {
    handleToggle(task.id, !task.done);
  };

  const handleUnschedule = (taskId) => {
    handleUpdate(taskId, { slot: null });
  };

  // ── Day note ───────────────────────────────────────
  const handleSaveDayNote = async (content) => {
    setDayNote(content);
    try {
      await apiPut('/api/day-notes', { date: dk, content });
    } catch (err) {
      console.error('Save day note error:', err);
    }
  };

  // ── Deadline actions ───────────────────────────────
  const handleAddDeadline = async (dlData) => {
    try {
      await apiPost('/api/deadlines', dlData);
      fetchData();
    } catch (err) {
      console.error('Add deadline error:', err);
    }
  };

  const handleEditDeadline = async (id, data) => {
    try {
      await apiPatch(`/api/deadlines/${id}`, data);
      fetchData();
    } catch (err) {
      console.error('Edit deadline error:', err);
    }
  };

  const handleDeleteDeadline = async (id) => {
    try {
      await apiDelete(`/api/deadlines/${id}`);
      fetchData();
    } catch (err) {
      console.error('Delete deadline error:', err);
    }
  };

  // ── Loading skeleton ───────────────────────────────
  if (loading && allTasks.length === 0) {
    return (
      <div style={{ padding: narrow ? 12 : 24, maxWidth: 1400, margin: '0 auto' }}>
        <div style={{
          display: 'flex', gap: 20, flexWrap: 'wrap',
        }}>
          <div style={{ flex: '1 1 260px' }}>
            <div style={{
              height: 200, marginBottom: 16, borderRadius: theme.radius.lg,
              background: theme.bgTertiary, animation: 'skeleton-pulse 1.5s ease infinite',
            }} />
            <div style={{
              height: 300, borderRadius: theme.radius.lg,
              background: theme.bgTertiary, animation: 'skeleton-pulse 1.5s ease infinite',
            }} />
          </div>
          <div style={{ flex: '2 1 300px' }}>
            <div style={{
              height: 60, marginBottom: 16, borderRadius: theme.radius.lg,
              background: theme.bgTertiary, animation: 'skeleton-pulse 1.5s ease infinite',
            }} />
            <div style={{
              height: 400, borderRadius: theme.radius.lg,
              background: theme.bgTertiary, animation: 'skeleton-pulse 1.5s ease infinite',
            }} />
          </div>
          <div style={{ flex: '1.4 1 300px' }}>
            <div style={{
              height: 600, borderRadius: theme.radius.lg,
              background: theme.bgTertiary, animation: 'skeleton-pulse 1.5s ease infinite',
            }} />
          </div>
        </div>
        <style>{`@keyframes skeleton-pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.7; } }`}</style>
      </div>
    );
  }

  // ── Shared sub-component blocks ───────────────────��
  const greetingCard = (
    <GreetingCard
      date={date}
      onDateChange={setDate}
      tasks={dayTasks}
      deadlines={deadlines}
      calView={calView}
      onCalViewChange={setCalView}
    />
  );

  const overviewCard = <OverviewCard tasks={dayTasks} />;
  const overviewCardEmbedded = <OverviewCard tasks={dayTasks} embedded />;

  const deadlineList = (
    <DeadlineList
      deadlines={deadlines}
      tasks={allTasks}
      projects={projects}
      onAdd={handleAddDeadline}
      onEdit={handleEditDeadline}
      onDelete={handleDeleteDeadline}
    />
  );

  const deadlineListEmbedded = (
    <DeadlineList
      deadlines={deadlines}
      tasks={allTasks}
      projects={projects}
      onAdd={handleAddDeadline}
      onEdit={handleEditDeadline}
      onDelete={handleDeleteDeadline}
      embedded
    />
  );

  const dayNoteCard = (
    <DayNoteCard note={dayNote} onSave={handleSaveDayNote} />
  );

  const addTaskForm = (
    <AddTaskForm
      onAdd={handleAddTask}
      deadlines={deadlines}
      projects={projects}
      teams={teams}
      inputRef={taskInputRef}
    />
  );

  const taskList = (
    <TaskList
      date={date}
      tasks={allTasks}
      allTasks={allTasks}
      deadlines={deadlines}
      onToggle={handleToggle}
      onDelete={handleDelete}
      onNote={handleNoteOpen}
      onUpdate={handleUpdate}
      onMove={handleMove}
      onDrop={handleUnschedule}
      onEditDeadline={handleEditDeadline}
    />
  );

  const daySchedule = (
    <DaySchedule
      date={date}
      tasks={allTasks}
      deadlines={deadlines}
      blockedTimes={blockedTimes}
      events={events}
      onSlotClick={handleSlotClick}
      onTaskDrop={handleTaskDrop}
      onTaskToggle={handleTaskToggle}
      onTaskUpdate={handleUpdate}
      onUnschedule={handleUnschedule}
    />
  );

  // ── Narrow (mobile) layout ─────────────────────────
  if (narrow) {
    return (
      <div style={{ padding: 12, maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {greetingCard}
          {addTaskForm}
          {taskList}
          {daySchedule}
          {overviewCard}
          {deadlineList}
          {dayNoteCard}
        </div>

        {noteTask && (
          <NoteModal task={noteTask} onSave={handleSaveNote} onClose={() => setNoteTask(null)} />
        )}
        <CelebrationOverlay active={celebrating} onDone={handleCelebrationDone} />
      </div>
    );
  }

  // ── Wide (desktop) layout ──────────────────────────
  // v1 pattern: explicit height calc so grid rows are bounded and columns scroll
  return (
    <>
      <div style={{
        height: 'calc(100vh - 76px)',
        padding: '14px 20px',
        display: 'grid',
        gridTemplateColumns: '25% minmax(0,1fr) minmax(0,1fr)',
        gridTemplateRows: 'minmax(0, 1fr)',
        gap: 14,
        overflow: 'hidden',
      }}>
        {/* Left column */}
        <div className="col-scroll" style={{
          display: 'flex', flexDirection: 'column', gap: 12,
          overflowY: 'auto', paddingRight: 2, paddingBottom: 14, minHeight: 0,
        }}>
          {greetingCard}
          <div style={{
            background: theme.bgSecondary,
            border: `0.5px solid ${theme.border}`,
            borderRadius: theme.radius.md,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
          }}>
            {overviewCardEmbedded}
            <div style={{
              height: '0.5px',
              background: theme.hourRule || theme.border,
              margin: '16px 0 14px 0',
              flexShrink: 0,
            }} />
            {deadlineListEmbedded}
          </div>
        </div>

        {/* Middle column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, minHeight: 0, overflow: 'hidden' }}>
          <div style={{ flexShrink: 0, marginBottom: 10 }}>
            {addTaskForm}
          </div>
          {taskList}
          {dayNoteCard}
        </div>

        {/* Right column */}
        {daySchedule}
      </div>

      {/* Modals and overlays — outside grid so they don't create extra rows */}
      {noteTask && (
        <NoteModal task={noteTask} onSave={handleSaveNote} onClose={() => setNoteTask(null)} />
      )}
      <CelebrationOverlay active={celebrating} onDone={handleCelebrationDone} />
    </>
  );
}
