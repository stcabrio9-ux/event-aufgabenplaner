import { createContext, useContext, useMemo, useState } from "react";

const STORAGE_KEY = "event-planner-data-v1";

const emptyData = {
  event: null,
  tasks: [],
  costs: [],
  members: [],
  comments: []
};

const AppDataContext = createContext(null);

function loadInitialData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : emptyData;
  } catch {
    return emptyData;
  }
}

export function AppDataProvider({ children }) {
  const [data, setData] = useState(loadInitialData);

  function persist(nextData) {
    setData(nextData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
  }

  function updateEvent(event) {
    persist({ ...data, event });
  }

  function addTask(task) {
    persist({
      ...data,
      tasks: [...data.tasks, { ...task, id: crypto.randomUUID() }]
    });
  }

  function updateTask(id, changes) {
    persist({
      ...data,
      tasks: data.tasks.map((task) =>
        task.id === id ? { ...task, ...changes } : task
      )
    });
  }

  function deleteTask(id) {
    persist({
      ...data,
      tasks: data.tasks.filter((task) => task.id !== id)
    });
  }

  function addCost(cost) {
    persist({
      ...data,
      costs: [...data.costs, { ...cost, id: crypto.randomUUID() }]
    });
  }

  function deleteCost(id) {
    persist({
      ...data,
      costs: data.costs.filter((cost) => cost.id !== id)
    });
  }

  function addMember(member) {
    persist({
      ...data,
      members: [...data.members, { ...member, id: crypto.randomUUID() }]
    });
  }

  function deleteMember(id) {
    persist({
      ...data,
      members: data.members.filter((member) => member.id !== id)
    });
  }

  function addComment(text) {
    persist({
      ...data,
      comments: [
        ...data.comments,
        {
          id: crypto.randomUUID(),
          author: "Eyüp",
          initials: "EE",
          text
        }
      ]
    });
  }

  function clearAll() {
    localStorage.removeItem(STORAGE_KEY);
    setData(emptyData);
  }

  const value = useMemo(
    () => ({
      ...data,
      updateEvent,
      addTask,
      updateTask,
      deleteTask,
      addCost,
      deleteCost,
      addMember,
      deleteMember,
      addComment,
      clearAll
    }),
    [data]
  );

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);

  if (!context) {
    throw new Error("useAppData must be used inside AppDataProvider");
  }

  return context;
}
