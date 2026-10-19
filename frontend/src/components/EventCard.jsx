import { Link } from "react-router-dom";
import { formatDateRange } from "../utils/format";
export default function EventCard({event}) {
  return <Link className="event-gallery-card" to={`/events/${event.id}`}>
    <div className="event-card-image">{event.image ? <img src={event.image} alt="" /> : <div className="image-placeholder">Kein Bild</div>}</div>
    <div className="event-gallery-content"><span className="eyebrow">{formatDateRange(event.startDate,event.endDate)}</span><h3>{event.name}</h3><p>{event.location || "Ort noch offen"}</p><span className="event-card-link">Details ansehen →</span></div>
  </Link>
}
