export default function TeacherDashboard() {
  const name = localStorage.getItem("full_name");
  return (
    <div style={{ padding: "2rem" }}>
      <h2>👩‍🏫 Καλώς ήρθες, {name}</h2>
      <p>Αυτή είναι η σελίδα του διδάσκοντα.</p>
    </div>
  );
}
