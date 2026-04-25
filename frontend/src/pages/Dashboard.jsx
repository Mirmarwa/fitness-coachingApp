import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import toast from "react-hot-toast";

function Dashboard() {
  const [payments, setPayments] = useState([]);
  const [programs, setPrograms] = useState({});

  const chartData = payments.map(p => ({
  name: programs[p.program]?.title || `Prog ${p.program}`,
  amount: p.amount
  }));
  const total = payments.reduce((sum, p) => sum + p.amount, 0);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/payments/my/")
      .then(res => res.json())
      .then(data => {
        setPayments(data);

        // 🔥 récupérer chaque programme
        data.forEach((p) => {
          fetch(`http://127.0.0.1:8000/api/programs/${p.program}/`)
            .then(res => res.json())
            .then(programData => {
              setPrograms(prev => ({
                ...prev,
                [p.program]: programData
              }));
            });
        });
      });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Mes Programmes</h1>

      {payments.length === 0 ? (
        <p>Aucun programme acheté</p>
      ) : (
        payments.map((p) => {
          const program = programs[p.program];

          return (
            <div
              key={p.id}
              style={{
                border: "1px solid #ddd",
                padding: "15px",
                marginBottom: "15px",
                borderRadius: "10px"
              }}
            >
              {program ? (
                <>
                  <h3>{program.title}</h3>
                  <p>{program.description}</p>

                  <img
                    src={`http://127.0.0.1:8000${program.image}`}
                    width="200"
                    alt=""
                  />

                  <p>💰 {p.amount} DH</p>

                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>

  <Link to={`/program/${program.id}`}>
    <button>Voir détails</button>
  </Link>

  <button
  onClick={() => toast.success("Reprise du programme 💪")}
  style={{
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    padding: "5px 10px",
    borderRadius: "5px",
    cursor: "pointer"
  }}
>
  Continuer
</button>

</div>
                </>
              ) : (
                <p>Chargement...</p>
              )}
              <h2>Statistiques</h2>

                 <BarChart width={500} height={300} data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#28a745" />
                  </BarChart>
              
              <p style={{ fontWeight: "bold", marginTop: "20px" }}>
                  Total dépensé : {total} DH
              </p>
            </div>
            
          );
        })
      )}
    </div>
  );
}

export default Dashboard;