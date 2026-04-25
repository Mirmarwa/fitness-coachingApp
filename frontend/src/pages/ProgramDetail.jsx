import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";


function ProgramDetail() {
  const { id } = useParams();
  const [program, setProgram] = useState(null);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/programs/${id}/`)
      .then(res => res.json())
      .then(data => setProgram(data));

    fetch(`http://127.0.0.1:8000/api/payments/check/${id}/`)
       .then(res => res.json())
    .then(data => setPaid(data.paid));
  }, [id]);

  if (!program) return <p>Loading...</p>;

  const handlePayment = async () => {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/payments/create/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        program_id: id,
        amount: 100,
      }),
    });

    if (!res.ok) throw new Error();

    toast.success("Paiement effectué 💰");
  } catch (error) {
    toast.error("Erreur paiement ❌");
  }
};
  return (
    <div style={{ padding: "20px" }}>
      <h1>{program.title}</h1>
      <p>{program.description}</p>

      <h2>Exercises</h2>
      {program.exercises.map((ex) => (
        <div key={ex.id}>
          <p>{ex.name} - {ex.sets} sets x {ex.reps} reps</p>
        </div>
      ))}

      <h2>Nutrition</h2>
      {program.nutrition_plans.map((n) => (
        <div key={n.id}>
          <p>{n.title} - {n.calories} kcal</p>
        </div>
      ))}

        {paid ? (
  <p style={{ color: "green", marginTop: "20px" }}>
    ✔️ Déjà acheté
  </p>
) : (
  <button onClick={handlePayment} style={{ marginTop: "20px" }}>
    Acheter ce programme
  </button>
)}
    </div>
  );
}

export default ProgramDetail;