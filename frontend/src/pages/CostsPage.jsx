import { useState } from "react";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import StatCard from "../components/StatCard";
import CostModal from "../components/CostModal";
import { useAppData } from "../state/AppDataContext";
import { formatMoney } from "../utils/format";

export default function CostsPage() {
  const { event, costs, addCost, deleteCost } = useAppData();
  const [open, setOpen] = useState(false);

  const total = costs.reduce((sum, cost) => sum + Number(cost.amount), 0);
  const largest = costs.length ? Math.max(...costs.map((cost) => Number(cost.amount))) : 0;

  return (
    <>
      <PageHeader
        eyebrow={event?.name ?? "Kostenverwaltung"}
        title="Kosten"
        meta={<span>Kostenpositionen des Events erfassen</span>}
        action={
          <button className="button primary" type="button" onClick={() => setOpen(true)} disabled={!event}>
            + Kosten erfassen
          </button>
        }
      />

      <main className="page-content">
        {!event ? (
          <EmptyState title="Zuerst ein Event anlegen" text="Kosten werden immer einem Event zugeordnet." />
        ) : costs.length ? (
          <>
            <div className="cost-summary">
              <StatCard label="Gesamtkosten" value={formatMoney(total)} detail={`${costs.length} Positionen`} />
              <StatCard label="Größte Position" value={formatMoney(largest)} />
            </div>

            <section className="card">
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Position</th>
                      <th>Kategorie</th>
                      <th>Betrag</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {costs.map((cost) => (
                      <tr key={cost.id}>
                        <td className="task-name">{cost.title}</td>
                        <td>{cost.category}</td>
                        <td>{formatMoney(cost.amount)}</td>
                        <td className="table-actions">
                          <button className="link-button danger" type="button" onClick={() => deleteCost(cost.id)}>Löschen</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          <EmptyState
            title="Noch keine Kosten erfasst"
            text="Füge bei Bedarf Kostenpositionen hinzu."
            action={<button className="button primary" type="button" onClick={() => setOpen(true)}>Kosten erfassen</button>}
          />
        )}
      </main>

      <CostModal open={open} onClose={() => setOpen(false)} onCreate={addCost} />
    </>
  );
}
