import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const emptyResources = { tasks: [], costs: [], members: [], comments: [] };
const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [resources, setResources] = useState(emptyResources);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    setReloadToken((current) => current + 1);
    try {
      const nextEvents = await api.getEvents();
      setEvents(nextEvents);
      setSelectedEventId((currentId) =>
        currentId && nextEvents.some((item) => item.id === currentId)
          ? currentId
          : nextEvents[0]?.id ?? null
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  useEffect(() => {
    let active = true;
    if (!selectedEventId) {
      setResources(emptyResources);
      return () => { active = false; };
    }

    setLoading(true);
    setError(null);
    Promise.all([
      api.getTasks(selectedEventId),
      api.getMembers(selectedEventId),
      api.getCosts(selectedEventId),
      api.getComments(selectedEventId)
    ])
      .then(([tasks, members, costs, comments]) => {
        if (active) setResources({ tasks, members, costs, comments });
      })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [selectedEventId, reloadToken]);

  const selectedEvent = events.find((item) => item.id === selectedEventId) ?? null;

  const saveEvent = useCallback(async (event) => {
    setError(null);
    try {
      const payload = { name: event.name, date: event.date, participants: event.participants };
      const savedEvent = events.some((item) => item.id === event.id)
        ? await api.updateEvent(event.id, payload)
        : await api.createEvent({ id: event.id, ...payload });
      setEvents((current) => {
        const exists = current.some((item) => item.id === savedEvent.id);
        return exists
          ? current.map((item) => item.id === savedEvent.id ? savedEvent : item)
          : [...current, savedEvent].sort((a, b) => a.date.localeCompare(b.date));
      });
      setSelectedEventId(savedEvent.id);
    } catch (requestError) { setError(requestError.message); throw requestError; }
  }, [events]);

  const clearAll = useCallback(async () => {
    if (!selectedEventId) return;
    setError(null);
    try {
      await api.deleteEvent(selectedEventId);
      setEvents((current) => current.filter((item) => item.id !== selectedEventId));
      setSelectedEventId(null);
    } catch (requestError) { setError(requestError.message); throw requestError; }
  }, [selectedEventId]);

  const addTask = useCallback(async (task) => {
    if (!selectedEventId) return;
    setError(null);
    try {
      const createdTask = await api.createTask(selectedEventId, { ...task, dueDate: task.dueDate || null });
      setResources((current) => ({ ...current, tasks: [createdTask, ...current.tasks] }));
    } catch (requestError) { setError(requestError.message); throw requestError; }
  }, [selectedEventId]);

  const updateTask = useCallback(async (id, changes) => {
    setError(null);
    try {
      const updatedTask = await api.updateTask(id, {
        ...changes,
        ...(Object.hasOwn(changes, "dueDate") ? { dueDate: changes.dueDate || null } : {})
      });
      setResources((current) => ({ ...current, tasks: current.tasks.map((task) => task.id === id ? updatedTask : task) }));
    } catch (requestError) { setError(requestError.message); throw requestError; }
  }, []);

  const deleteTask = useCallback(async (id) => {
    setError(null);
    try {
      await api.deleteTask(id);
      setResources((current) => ({ ...current, tasks: current.tasks.filter((task) => task.id !== id) }));
    } catch (requestError) { setError(requestError.message); throw requestError; }
  }, []);

  const addMember = useCallback(async (member) => {
    if (!selectedEventId) return;
    setError(null);
    try {
      const createdMember = await api.createMember(selectedEventId, member);
      setResources((current) => ({ ...current, members: [...current.members, createdMember] }));
    } catch (requestError) { setError(requestError.message); throw requestError; }
  }, [selectedEventId]);

  const deleteMember = useCallback(async (id) => {
    setError(null);
    try {
      await api.deleteMember(id);
      setResources((current) => ({ ...current, members: current.members.filter((member) => member.id !== id) }));
    } catch (requestError) { setError(requestError.message); throw requestError; }
  }, []);

  const addCost = useCallback(async (cost) => {
    if (!selectedEventId) return;
    setError(null);
    try {
      const createdCost = await api.createCost(selectedEventId, cost);
      setResources((current) => ({ ...current, costs: [createdCost, ...current.costs] }));
    } catch (requestError) { setError(requestError.message); throw requestError; }
  }, [selectedEventId]);

  const deleteCost = useCallback(async (id) => {
    setError(null);
    try {
      await api.deleteCost(id);
      setResources((current) => ({ ...current, costs: current.costs.filter((cost) => cost.id !== id) }));
    } catch (requestError) { setError(requestError.message); throw requestError; }
  }, []);

  const addComment = useCallback(async (text) => {
    if (!selectedEventId) return;
    setError(null);
    try {
      const comment = await api.createComment(selectedEventId, { author: "Eyüp", initials: "EE", text });
      setResources((current) => ({ ...current, comments: [...current.comments, comment] }));
    } catch (requestError) { setError(requestError.message); throw requestError; }
  }, [selectedEventId]);

  const value = useMemo(() => ({
    events,
    event: selectedEvent,
    selectedEventId,
    selectEvent: setSelectedEventId,
    ...resources,
    loading,
    error,
    reload: loadEvents,
    clearError: () => setError(null),
    updateEvent: saveEvent,
    addTask,
    updateTask,
    deleteTask,
    addCost,
    deleteCost,
    addMember,
    deleteMember,
    addComment,
    clearAll
  }), [events, selectedEvent, selectedEventId, resources, loading, error, loadEvents, saveEvent, addTask, updateTask, deleteTask, addCost, deleteCost, addMember, deleteMember, addComment, clearAll]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error("useAppData must be used inside AppDataProvider");
  return context;
}
