import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const emptyResources = { tasks: [], costs: [], members: [], comments: [] };
const AppDataContext = createContext(null);

function normalizeEvent(event) {
  return { ...event, startDate: event.startDate || event.date, endDate: event.endDate || event.startDate || event.date, createdBy: event.createdBy || null, individualIds: event.individualIds || [], teamIds: event.teamIds || [] };
}
function normalizeTask(task) {
  return { ...task, key: task.key || `TASK-${String(task.id).slice(0, 8).toUpperCase()}`, assigneeId: task.assigneeId || "" };
}

export function AppDataProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [resources, setResources] = useState(emptyResources);
  const [people, setPeople] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const refreshOrganisation = useCallback(async () => {
    const [nextPeople, nextTeams] = await Promise.all([api.getPeople(), api.getTeams()]);
    setPeople(nextPeople);
    setTeams(nextTeams);
  }, []);

  const loadEvents = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [nextEvents] = await Promise.all([api.getEvents(), refreshOrganisation()]);
      const normalized = nextEvents.map(normalizeEvent);
      setEvents(normalized);
      setSelectedEventId((id) => id && normalized.some((event) => event.id === id) ? id : normalized[0]?.id ?? null);
    } catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }, [refreshOrganisation]);

  useEffect(() => {
    if (!sessionStorage.getItem("event-planner-auth-token")) { setAuthLoading(false); setLoading(false); return undefined; }
    api.getCurrentUser().then(({ user }) => setCurrentUser(user)).catch(() => sessionStorage.removeItem("event-planner-auth-token")).finally(() => setAuthLoading(false));
    return undefined;
  }, []);
  useEffect(() => { loadEvents(); }, [loadEvents]);

  useEffect(() => {
    let active = true;
    if (!selectedEventId) { setResources(emptyResources); return () => { active = false; }; }
    setLoading(true); setError(null);
    Promise.all([api.getTasks(selectedEventId), api.getMembers(selectedEventId), api.getCosts(selectedEventId), api.getComments(selectedEventId)])
      .then(([tasks, members, costs, comments]) => { if (active) setResources({ tasks: tasks.map(normalizeTask), members, costs, comments }); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selectedEventId]);

  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? null;
  const saveEvent = useCallback(async (event) => {
    setError(null);
    const payload = { name: event.name, date: event.date || event.startDate, startDate: event.startDate || event.date, endDate: event.endDate || event.startDate || event.date, startTime: event.startTime || null, endTime: event.endTime || null, description: event.description || "", location: event.location || "", image: event.image || null, participants: event.participants ?? 0, teamIds: event.teamIds || [], individualIds: event.individualIds || [] };
    try {
      const saved = normalizeEvent(events.some((item) => item.id === event.id) ? await api.updateEvent(event.id, payload) : await api.createEvent({ id: event.id, ...payload }));
      setEvents((items) => items.some((item) => item.id === saved.id) ? items.map((item) => item.id === saved.id ? saved : item) : [...items, saved]);
      setSelectedEventId(saved.id); await refreshOrganisation();
      return saved;
    } catch (requestError) { setError(requestError.message); throw requestError; }
  }, [events, refreshOrganisation]);

  const deleteEvent = useCallback(async (id = selectedEventId) => { if (!id) return; await api.deleteEvent(id); setEvents((items) => items.filter((event) => event.id !== id)); setSelectedEventId(null); setResources(emptyResources); }, [selectedEventId]);
  const addTask = useCallback(async (task) => { const created = await api.createTask(selectedEventId, { title: task.title, description: task.description || "", status: task.status, priority: task.priority, owner: task.owner || null, assigneeId: task.assigneeId || null, dueDate: task.dueDate || null }); setResources((r) => ({ ...r, tasks: [normalizeTask(created), ...r.tasks] })); return created; }, [selectedEventId]);
  const updateTask = useCallback(async (id, changes) => { const payload = { ...(changes.title !== undefined ? { title: changes.title } : {}), ...(changes.description !== undefined ? { description: changes.description } : {}), ...(changes.status !== undefined ? { status: changes.status } : {}), ...(changes.priority !== undefined ? { priority: changes.priority } : {}), ...(changes.owner !== undefined ? { owner: changes.owner } : {}), ...(changes.assigneeId !== undefined ? { assigneeId: changes.assigneeId || null } : {}), ...(Object.hasOwn(changes, "dueDate") ? { dueDate: changes.dueDate || null } : {}) }; const updated = await api.updateTask(id, payload); setResources((r) => ({ ...r, tasks: r.tasks.map((task) => task.id === id ? normalizeTask(updated) : task) })); return updated; }, []);
  const deleteTask = useCallback(async (id) => { await api.deleteTask(id); setResources((r) => ({ ...r, tasks: r.tasks.filter((task) => task.id !== id) })); }, []);
  const saveTask = useCallback((task) => task.id ? updateTask(task.id, task) : addTask(task), [addTask, updateTask]);
  const addMember = useCallback(async (member) => { const created = await api.createMember(selectedEventId, member); setResources((r) => ({ ...r, members: [...r.members, created] })); await refreshOrganisation(); return created; }, [selectedEventId, refreshOrganisation]);
  const deleteMember = useCallback(async (id) => { await api.deleteMember(id); setResources((r) => ({ ...r, members: r.members.filter((member) => member.id !== id) })); await refreshOrganisation(); }, [refreshOrganisation]);
  const addCost = useCallback(async (cost) => { const created = await api.createCost(selectedEventId, cost); setResources((r) => ({ ...r, costs: [created, ...r.costs] })); return created; }, [selectedEventId]);
  const saveCost = useCallback(async (cost) => { const payload = { title: cost.title, category: cost.category, amount: cost.amount, note: cost.note || "", taskId: cost.taskId || null }; if (!cost.id) return addCost(payload); const updated = await api.updateCost(cost.id, payload); setResources((r) => ({ ...r, costs: r.costs.map((item) => item.id === cost.id ? updated : item) })); return updated; }, [addCost]);
  const deleteCost = useCallback(async (id) => { await api.deleteCost(id); setResources((r) => ({ ...r, costs: r.costs.filter((cost) => cost.id !== id) })); }, []);
  const addComment = useCallback(async (message) => { const payload = typeof message === "string" ? { text: message } : message; const comment = await api.createComment(selectedEventId, payload); setResources((r) => ({ ...r, comments: [...r.comments, comment] })); return comment; }, [selectedEventId]);
  const addTaskMessage = useCallback((message) => addComment(message), [addComment]);
  const savePerson = useCallback(async (person) => { const payload = { name: person.name, email: person.email, projectRole: person.projectRole || null, accessRole: person.accessRole || "Bearbeiter" }; const saved = person.id ? await api.updatePerson(person.id, payload) : await api.createPerson(payload); setPeople((items) => person.id ? items.map((item) => item.id === saved.id ? saved : item) : [...items, saved]); return saved; }, []);
  const deletePerson = useCallback(async (id) => { await api.deletePerson(id); setPeople((items) => items.filter((person) => person.id !== id)); }, []);
  const saveTeam = useCallback(async (team) => { const payload = { name: team.name, memberIds: team.memberIds || [] }; const saved = team.id ? await api.updateTeam(team.id, payload) : await api.createTeam(payload); setTeams((items) => team.id ? items.map((item) => item.id === saved.id ? saved : item) : [...items, saved]); return saved; }, []);
  const deleteTeam = useCallback(async (id) => { await api.deleteTeam(id); setTeams((items) => items.filter((team) => team.id !== id)); await loadEvents(); }, [loadEvents]);
  const login = useCallback(async (credentials) => { const user = await api.login(credentials); setCurrentUser(user); await loadEvents(); return user; }, [loadEvents]);
  const logout = useCallback(async () => { await api.logout(); setCurrentUser(null); setEvents([]); setSelectedEventId(null); }, []);
  const currentPerson = people.find((person) => person.accountId === currentUser?.id) || currentUser;
  const accounts = currentUser ? [currentUser] : [];
  const isAdmin = currentUser?.role === "admin";
  const eventPeople = useCallback((eventId) => eventId === selectedEventId ? resources.members : [], [resources.members, selectedEventId]);
  const canAccessEvent = useCallback((event) => Boolean(currentUser && (isAdmin || !event || event.createdBy === currentUser.id || event.individualIds?.includes(currentPerson?.id) || event.teamIds?.some((teamId) => teams.find((team) => team.id === teamId)?.memberIds?.includes(currentPerson?.id)))), [currentUser, isAdmin, currentPerson, teams]);
  const canEditEvent = useCallback(() => isAdmin, [isAdmin]);
  const value = useMemo(() => ({ events, event: selectedEvent, selectedEventId, selectEvent: setSelectedEventId, ...resources, loading, authLoading, error, reload: loadEvents, clearError: () => setError(null), saveEvent, updateEvent: saveEvent, addTask, updateTask, deleteTask, saveTask, addMember, addPerson: savePerson, deleteMember, addCost, saveCost, deleteCost, addComment, addTaskMessage, deleteEvent, clearAll: deleteEvent, currentUser, currentPerson, isAdmin, people, accounts, teams, notifications: [], taskMessages: resources.comments, eventPeople, canAccessEvent, canEditEvent, savePerson, deletePerson, saveTeam, deleteTeam, login, logout, register: async () => { throw new Error("Registrierung ist nicht aktiviert."); }, markNotificationsRead: () => {}, updateSettings: async () => {} }), [events, selectedEvent, selectedEventId, resources, loading, authLoading, error, loadEvents, saveEvent, addTask, updateTask, deleteTask, saveTask, addMember, savePerson, deleteMember, addCost, saveCost, deleteCost, addComment, addTaskMessage, deleteEvent, currentUser, currentPerson, isAdmin, people, accounts, teams, eventPeople, canAccessEvent, canEditEvent, deletePerson, saveTeam, deleteTeam, login, logout]);
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
export function useAppData() { const context = useContext(AppDataContext); if (!context) throw new Error("useAppData must be used inside AppDataProvider"); return context; }
