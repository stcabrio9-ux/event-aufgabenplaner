import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const emptyResources = { tasks: [], costs: [], members: [], comments: [] };
const AppDataContext = createContext(null);

function normalizeEvent(event) {
  return { ...event, startDate: event.startDate || event.date, endDate: event.endDate || event.date, createdBy: event.createdBy || "api-user", individualIds: event.individualIds || [], teamIds: event.teamIds || [] };
}

function normalizeTask(task) {
  return { ...task, key: task.key || `TASK-${String(task.id).slice(0, 8).toUpperCase()}`, assigneeId: task.assigneeId || task.owner || "" };
}

export function AppDataProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [resources, setResources] = useState(emptyResources);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (!sessionStorage.getItem("event-planner-auth-token")) return;
    api.getCurrentUser().then(({ user }) => setCurrentUser(user)).catch(() => sessionStorage.removeItem("event-planner-auth-token"));
  }, []);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    setReloadToken((current) => current + 1);
    try {
      const nextEvents = (await api.getEvents()).map(normalizeEvent);
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
        if (active) setResources({ tasks: tasks.map(normalizeTask), members, costs, comments });
      })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [selectedEventId, reloadToken]);

  const selectedEvent = events.find((item) => item.id === selectedEventId) ?? null;

  const saveEvent = useCallback(async (event) => {
    setError(null);
    try {
      const payload = {
        name: event.name,
        date: event.date || event.startDate,
        participants: event.participants ?? 0
      };
      const savedEvent = normalizeEvent(events.some((item) => item.id === event.id)
        ? await api.updateEvent(event.id, payload)
        : await api.createEvent({ id: event.id, ...payload }));
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
      const createdTask = await api.createTask(selectedEventId, {
        title: task.title,
        status: task.status,
        priority: task.priority,
        owner: task.owner || task.assigneeId || null,
        dueDate: task.dueDate || null
      });
      setResources((current) => ({ ...current, tasks: [normalizeTask(createdTask), ...current.tasks] }));
    } catch (requestError) { setError(requestError.message); throw requestError; }
  }, [selectedEventId]);

  const updateTask = useCallback(async (id, changes) => {
    setError(null);
    try {
      const updatedTask = await api.updateTask(id, {
        ...(changes.title !== undefined ? { title: changes.title } : {}),
        ...(changes.status !== undefined ? { status: changes.status } : {}),
        ...(changes.priority !== undefined ? { priority: changes.priority } : {}),
        ...(changes.owner !== undefined || changes.assigneeId !== undefined
          ? { owner: changes.owner || changes.assigneeId || null }
          : {}),
        ...(Object.hasOwn(changes, "dueDate") ? { dueDate: changes.dueDate || null } : {})
      });
      setResources((current) => ({ ...current, tasks: current.tasks.map((task) => task.id === id ? normalizeTask(updatedTask) : task) }));
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

  const currentPerson = currentUser ? { id: currentUser.id, name: currentUser.name, email: currentUser.email } : null;
  const people = resources.members;
  const accounts = currentUser ? [currentUser] : [];
  const teams = [];
  const notifications = [];
  const taskMessages = resources.comments;
  const eventPeople = useCallback((eventId) => (
    eventId === selectedEventId ? resources.members : []
  ), [resources.members, selectedEventId]);
  const canAccessEvent = useCallback(() => true, []);
  const canEditEvent = useCallback(() => true, []);
  const saveTask = useCallback(async (task) => {
    if (task.id) return updateTask(task.id, task);
    return addTask(task);
  }, [addTask, updateTask]);
  const saveCost = useCallback(async (cost) => {
    if (!cost.id) return addCost(cost);
    setError(null);
    try {
      const updatedCost = await api.updateCost(cost.id, { title: cost.title, category: cost.category, amount: cost.amount });
      setResources((current) => ({ ...current, costs: current.costs.map((item) => item.id === cost.id ? updatedCost : item) }));
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    }
  }, [addCost]);
  const savePerson = useCallback(async (person) => addMember({
    name: person.name,
    projectRole: person.email || null,
    accessRole: "Bearbeiter"
  }), [addMember]);
  const deleteEvent = clearAll;
  const deletePerson = deleteMember;
  const deleteTeam = async () => {};
  const saveTeam = async () => {};
  const login = useCallback(async (credentials) => {
    const user = await api.login(credentials);
    setCurrentUser(user);
    return user;
  }, []);
  const register = async () => { throw new Error("Registrierung ist im Prototyp nicht aktiviert."); };
  const logout = useCallback(async () => { await api.logout(); setCurrentUser(null); }, []);
  const markNotificationsRead = () => {};
  const updateSettings = async () => {};
  const addTaskMessage = useCallback(async (message) => addComment(message.text), [addComment]);

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
    , currentUser, currentPerson, people, accounts, teams, notifications, taskMessages,
    eventPeople, canAccessEvent, canEditEvent, saveTask, saveCost, savePerson,
    deleteEvent, deletePerson, deleteTeam, saveTeam, login, register, logout,
    markNotificationsRead, updateSettings, addTaskMessage
  }), [events, selectedEvent, selectedEventId, resources, loading, error, loadEvents, saveEvent, addTask, updateTask, deleteTask, addCost, deleteCost, addMember, deleteMember, addComment, clearAll, currentUser, currentPerson, people, accounts, teams, notifications, taskMessages, eventPeople, canAccessEvent, canEditEvent, saveTask, saveCost, savePerson, deleteEvent, deletePerson, deleteTeam, saveTeam, login, register, logout, addTaskMessage]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error("useAppData must be used inside AppDataProvider");
  return context;
}
