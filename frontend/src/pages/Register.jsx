import React from "react";
import { Link } from "react-router-dom";

export default function Register() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>

        <form style={styles.form}>
          <input type="text" placeholder="Full Name" style={styles.input} />
          <input type="email" placeholder="Email" style={styles.input} />
          <input type="password" placeholder="Password" style={styles.input} />
          <input type="password" placeholder="Confirm Password" style={styles.input} />

          <button style={styles.button}>Sign Up</button>
        </form>

        <p style={styles.text}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #0f172a, #1e3a8a)", // dark + blue
  },
  card: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "15px",
    width: "350px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    textAlign: "center",
  },
  title: {
    marginBottom: "20px",
    color: "#1e3a8a",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    marginBottom: "15px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    outline: "none",
  },
  button: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2563eb", // bleu
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },
  text: {
    marginTop: "15px",
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "bold",
  },
};