import Notes from "./Notes";
import Interviews from "./Interviews";

export default function ApplicationDetails({ app, onClose }) {
  return (
    <section className="card details">
      <div className="row between">
        <div>
          <h2>{app.title}</h2>
          <div className="sub">
            {app.company} · {app.stage}
          </div>
        </div>
        <button className="secondary" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="detailgrid">
        <Interviews appId={app.id} />
        <Notes appId={app.id} />
      </div>
    </section>
  );
}
