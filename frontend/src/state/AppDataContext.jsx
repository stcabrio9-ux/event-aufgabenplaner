import { createContext, useContext, useMemo, useState } from "react";
import { isoNow } from "../utils/format";

const STORAGE_KEY = "event-planner-v2";
const SESSION_KEY = "event-planner-session-v2";
const AppDataContext = createContext(null);

const emptyData = {
  accounts: [],
  people: [],
  teams: [],
  events: [],
  tasks: [],
  costs: [],
  taskMessages: [],
  notifications: []
};

function readData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...emptyData, ...JSON.parse(raw) } : emptyData;
  } catch {
    return emptyData;
  }
}

async function hashPassword(password) {
  const bytes = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function AppDataProvider({ children }) {
  const [data, setData] = useState(readData);
  const [sessionUserId, setSessionUserId] = useState(() => localStorage.getItem(SESSION_KEY));

  function persist(next) {
    setData(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  const currentUser = data.accounts.find((a) => a.id === sessionUserId) ?? null;
  const currentPerson = currentUser
    ? data.people.find((p) => p.accountId === currentUser.id) ?? null
    : null;

  async function register({ name, email, password }) {
    const normalized = email.trim().toLowerCase();
    if (data.accounts.some((a) => a.email === normalized)) {
      throw new Error("Für diese E-Mail existiert bereits ein Konto.");
    }

    const accountId = crypto.randomUUID();
    const personId = crypto.randomUUID();
    const passwordHash = await hashPassword(password);
    const account = {
      id: accountId,
      name: name.trim(),
      email: normalized,
      passwordHash,
      settings: { mentions: true, assignments: true, emailReplies: true }
    };
    const person = {
      id: personId,
      name: name.trim(),
      email: normalized,
      accountId
    };

    persist({
      ...data,
      accounts: [...data.accounts, account],
      people: [...data.people, person]
    });
    localStorage.setItem(SESSION_KEY, accountId);
    setSessionUserId(accountId);
  }

  async function login({ email, password }) {
    const normalized = email.trim().toLowerCase();
    const account = data.accounts.find((a) => a.email === normalized);
    if (!account || account.passwordHash !== await hashPassword(password)) {
      throw new Error("E-Mail oder Passwort ist nicht korrekt.");
    }
    localStorage.setItem(SESSION_KEY, account.id);
    setSessionUserId(account.id);
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setSessionUserId(null);
  }

  function addPerson(person) {
    if (!currentUser) throw new Error("Zum Hinzufügen von Personen ist eine Anmeldung erforderlich.");
    const email = person.email.trim().toLowerCase();
    const existing = data.people.find((p) => p.email === email);
    if (existing) return existing.id;
    const id = crypto.randomUUID();
    persist({
      ...data,
      people: [...data.people, { id, name: person.name.trim(), email, accountId: null }]
    });
    return id;
  }

  function savePerson(person) {
    if (!currentUser) throw new Error("Zum Bearbeiten von Personen ist eine Anmeldung erforderlich.");

    if (person.id) {
      const existing = data.people.find((p) => p.id === person.id);
      if (!existing || existing.accountId) return null;
      const email = person.email.trim().toLowerCase();
      const duplicate = data.people.find((p) => p.email === email && p.id !== person.id);
      if (duplicate) throw new Error("Diese E-Mail-Adresse ist bereits einer Person zugeordnet.");
      persist({
        ...data,
        people: data.people.map((p) => p.id === person.id
          ? { ...p, name: person.name.trim(), email }
          : p)
      });
      return person.id;
    }

    return addPerson(person);
  }

  function deletePerson(id) {
    if (!currentUser) return;
    const person = data.people.find((p) => p.id === id);
    if (!person || person.accountId) return;

    persist({
      ...data,
      people: data.people.filter((p) => p.id !== id),
      teams: data.teams.map((team) => ({
        ...team,
        memberIds: (team.memberIds || []).filter((personId) => personId !== id)
      })),
      events: data.events.map((event) => ({
        ...event,
        individualIds: (event.individualIds || []).filter((personId) => personId !== id)
      })),
      tasks: data.tasks.map((task) => task.assigneeId === id ? { ...task, assigneeId: "" } : task)
    });
  }

  function saveTeam(team) {
    if (!currentUser) throw new Error("Zum Erstellen oder Bearbeiten von Teams ist eine Anmeldung erforderlich.");
    if (team.id) {
      persist({
        ...data,
        teams: data.teams.map((t) => t.id === team.id ? { ...t, ...team } : t)
      });
      return team.id;
    }
    const id = crypto.randomUUID();
    persist({
      ...data,
      teams: [...data.teams, { ...team, id, createdBy: currentUser.id }]
    });
    return id;
  }

  function deleteTeam(id) {
    if (!currentUser) return;
    persist({
      ...data,
      teams: data.teams.filter((t) => t.id !== id),
      events: data.events.map((e) => ({
        ...e,
        teamIds: (e.teamIds || []).filter((x) => x !== id)
      }))
    });
  }

  function canEditEvent(eventId) {
    const event = data.events.find((e) => e.id === eventId);
    return Boolean(currentUser && event && event.createdBy === currentUser.id);
  }

  function canAccessEvent(eventId) {
    const event = data.events.find((e) => e.id === eventId);
    if (!currentUser || !event) return false;
    if (event.createdBy === currentUser.id) return true;
    if (currentPerson?.id && (event.individualIds || []).includes(currentPerson.id)) return true;
    return (event.teamIds || []).some((teamId) =>
      data.teams.find((team) => team.id === teamId)?.memberIds?.includes(currentPerson?.id)
    );
  }

  function saveEvent(event) {
    if (!currentUser) {
      throw new Error("Zum Erstellen eines Events ist ein eigenes Konto erforderlich.");
    }

    if (event.id) {
      const existing = data.events.find((e) => e.id === event.id);
      if (!existing || existing.createdBy !== currentUser.id) {
        throw new Error("Nur der Ersteller des Events kann die Eventdaten bearbeiten.");
      }
      persist({
        ...data,
        events: data.events.map((e) => e.id === event.id ? { ...e, ...event } : e)
      });
      return event.id;
    }

    const id = crypto.randomUUID();
    const individualIds = new Set(event.individualIds || []);
    if (currentPerson?.id) individualIds.add(currentPerson.id);
    persist({
      ...data,
      events: [
        ...data.events,
        {
          ...event,
          individualIds: [...individualIds],
          id,
          createdBy: currentUser.id,
          createdAt: isoNow()
        }
      ]
    });
    return id;
  }

  function deleteEvent(id) {
    if (!canEditEvent(id)) return;
    const taskIds = data.tasks.filter((t) => t.eventId === id).map((t) => t.id);
    persist({
      ...data,
      events: data.events.filter((e) => e.id !== id),
      tasks: data.tasks.filter((t) => t.eventId !== id),
      costs: data.costs.filter((c) => c.eventId !== id),
      taskMessages: data.taskMessages.filter((m) => !taskIds.includes(m.taskId))
    });
  }

  function eventPeople(eventId) {
    const event = data.events.find((e) => e.id === eventId);
    if (!event) return [];
    const ids = new Set(event.individualIds || []);
    (event.teamIds || []).forEach((teamId) => {
      data.teams.find((t) => t.id === teamId)?.memberIds?.forEach((id) => ids.add(id));
    });
    return data.people.filter((p) => ids.has(p.id));
  }

  function nextTaskKey(eventId) {
    const event = data.events.find((e) => e.id === eventId);
    const eventIndex = Math.max(1, data.events.findIndex((e) => e.id === eventId) + 1);
    const count = data.tasks.filter((t) => t.eventId === eventId).length + 1;
    const prefix = (event?.name || "EVT").replace(/[^A-Za-z0-9]/g, "").slice(0, 3).toUpperCase() || "EVT";
    return `${prefix}-${String(eventIndex).padStart(2, "0")}-${String(count).padStart(3, "0")}`;
  }

  function createNotification(personId, payload) {
    const person = data.people.find((p) => p.id === personId);
    if (!person?.accountId) return null;
    return {
      id: crypto.randomUUID(),
      userId: person.accountId,
      read: false,
      createdAt: isoNow(),
      ...payload
    };
  }

  function saveTask(task) {
    if (task.id) {
      const previous = data.tasks.find((t) => t.id === task.id);
      const notifications = [...data.notifications];
      if (task.assigneeId && task.assigneeId !== previous?.assigneeId) {
        const notification = createNotification(task.assigneeId, {
          type: "assignment",
          text: `Dir wurde die Aufgabe ${task.key || previous?.key} zugewiesen.`,
          link: `/events/${task.eventId}/manage/tasks/${task.id}`
        });
        if (notification) notifications.push(notification);
      }
      persist({
        ...data,
        tasks: data.tasks.map((t) => t.id === task.id ? { ...t, ...task } : t),
        notifications
      });
      return task.id;
    }

    const id = crypto.randomUUID();
    const complete = {
      ...task,
      id,
      key: nextTaskKey(task.eventId),
      createdAt: isoNow(),
      createdBy: currentUser?.id
    };
    const notifications = [...data.notifications];
    if (complete.assigneeId) {
      const notification = createNotification(complete.assigneeId, {
        type: "assignment",
        text: `Dir wurde die Aufgabe ${complete.key} zugewiesen.`,
        link: `/events/${task.eventId}/manage/tasks/${id}`
      });
      if (notification) notifications.push(notification);
    }
    persist({ ...data, tasks: [...data.tasks, complete], notifications });
    return id;
  }

  function deleteTask(id) {
    persist({
      ...data,
      tasks: data.tasks.filter((t) => t.id !== id),
      costs: data.costs.map((cost) => cost.taskId === id ? { ...cost, taskId: "" } : cost),
      taskMessages: data.taskMessages.filter((m) => m.taskId !== id)
    });
  }

  function saveCost(cost) {
    if (cost.id) {
      persist({
        ...data,
        costs: data.costs.map((c) => c.id === cost.id ? { ...c, ...cost } : c)
      });
      return cost.id;
    }
    const id = crypto.randomUUID();
    persist({
      ...data,
      costs: [...data.costs, { ...cost, id, createdAt: isoNow() }]
    });
    return id;
  }

  function deleteCost(id) {
    persist({ ...data, costs: data.costs.filter((c) => c.id !== id) });
  }

  function addTaskMessage(message) {
    const complete = {
      id: crypto.randomUUID(),
      createdAt: isoNow(),
      authorId: currentUser?.id,
      authorName: currentUser?.name || "System",
      ...message
    };

    const notifications = [...data.notifications];
    const notifiedAccounts = new Set();

    (message.mentionIds || []).forEach((personId) => {
      const notification = createNotification(personId, {
        type: "mention",
        text: `${currentUser?.name || "Jemand"} hat dich in einer Aufgabe erwähnt.`,
        link: message.link
      });
      if (notification && notification.userId !== currentUser?.id) {
        notifications.push(notification);
        notifiedAccounts.add(notification.userId);
      }
    });

    if (message.type === "comment") {
      const task = data.tasks.find((item) => item.id === message.taskId);
      const assignee = data.people.find((person) => person.id === task?.assigneeId);
      if (
        assignee?.accountId &&
        assignee.accountId !== currentUser?.id &&
        !notifiedAccounts.has(assignee.accountId)
      ) {
        const notification = createNotification(assignee.id, {
          type: "task_comment",
          text: `${currentUser?.name || "Jemand"} hat ${task?.key || "deine Aufgabe"} kommentiert.`,
          link: message.link
        });
        if (notification) notifications.push(notification);
      }
    }

    persist({
      ...data,
      taskMessages: [...data.taskMessages, complete],
      notifications
    });
  }

  function updateSettings(settings) {
    if (!currentUser) return;
    persist({
      ...data,
      accounts: data.accounts.map((a) => a.id === currentUser.id
        ? { ...a, settings: { ...a.settings, ...settings } }
        : a)
    });
  }

  function markNotificationsRead() {
    if (!currentUser) return;
    persist({
      ...data,
      notifications: data.notifications.map((n) => n.userId === currentUser.id ? { ...n, read: true } : n)
    });
  }

  const value = useMemo(() => ({
    ...data,
    currentUser,
    currentPerson,
    register,
    login,
    logout,
    addPerson,
    savePerson,
    deletePerson,
    saveTeam,
    deleteTeam,
    canEditEvent,
    canAccessEvent,
    saveEvent,
    deleteEvent,
    eventPeople,
    saveTask,
    deleteTask,
    saveCost,
    deleteCost,
    addTaskMessage,
    updateSettings,
    markNotificationsRead
  }), [data, sessionUserId]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside AppDataProvider");
  return ctx;
}
