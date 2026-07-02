"use client";

import { useState } from "react";

export function SetupForm() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    const response = await fetch("/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const payload = await response.json();
    if (!response.ok) {
      setMessage(payload.error ?? "Setup failed.");
      return;
    }
    window.location.href = "/admin";
  }

  return (
    <div className="auth-panel narrow-panel">
      <form onSubmit={submit}>
        <label htmlFor="setup-username">Administrator username</label>
        <input id="setup-username" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" />
        <label htmlFor="setup-password">Password</label>
        <input id="setup-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" />
        <label htmlFor="setup-confirm">Confirm password</label>
        <input id="setup-confirm" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" />
        {message && <p className="alert alert-error">{message}</p>}
        <button className="button button-primary" type="submit">Create administrator</button>
      </form>
    </div>
  );
}
