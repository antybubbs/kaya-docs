"use client";

import { Eye, FilePlus, LogOut, Save, Trash2, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type User = { username: string; role: "viewer" | "editor" | "admin" } | null;
type ManagedUser = { username: string; role: "viewer" | "editor" | "admin"; createdAt: string; updatedAt: string };
type PageRecord = {
  slug: string;
  title: string;
  description: string;
  order: number;
  version?: string;
  body: string;
};

const emptyPage: PageRecord = {
  slug: "getting-started/new-page",
  title: "New Page",
  description: "",
  order: 999,
  version: "current",
  body: "Write the page in MDX."
};

export function AdminEditor({ initialUser }: { initialUser: User }) {
  const [user, setUser] = useState(initialUser);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pages, setPages] = useState<PageRecord[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [draft, setDraft] = useState<PageRecord>(emptyPage);
  const [message, setMessage] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
  const [newUser, setNewUser] = useState({ username: "", password: "", role: "viewer" as ManagedUser["role"] });

  const selected = useMemo(() => pages.find((page) => page.slug === selectedSlug), [pages, selectedSlug]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/docs")
      .then((response) => response.json())
      .then((payload) => {
        setPages(payload.pages ?? []);
        const first = payload.pages?.[0];
        if (first) {
          setSelectedSlug(first.slug);
          setDraft(first);
        }
      });
    if (user.role === "admin") loadUsers();
  }, [user]);

  useEffect(() => {
    if (selected) setDraft(selected);
  }, [selected]);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setMessage(payload.setupRequired ? "Setup is not complete. Create the first administrator account." : "Invalid username or password.");
      return;
    }
    const payload = await response.json();
    setUser({ username, role: payload.role });
  }

  async function savePage(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/docs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft)
    });
    setMessage(response.ok ? "Saved to the content directory." : "Save failed.");
    if (response.ok) {
      const nextPages = pages.filter((page) => page.slug !== draft.slug).concat(draft).sort((a, b) => a.slug.localeCompare(b.slug));
      setPages(nextPages);
      setSelectedSlug(draft.slug);
    }
  }

  async function deletePage() {
    if (!confirm(`Delete ${draft.slug}?`)) return;
    const response = await fetch("/api/docs", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: draft.slug })
    });
    setMessage(response.ok ? "Page deleted." : "Delete failed. Admin role is required.");
    if (response.ok) {
      setPages(pages.filter((page) => page.slug !== draft.slug));
      setDraft(emptyPage);
      setSelectedSlug("");
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setPages([]);
    setManagedUsers([]);
  }

  async function loadUsers() {
    const response = await fetch("/api/users");
    if (!response.ok) return;
    const payload = await response.json();
    setManagedUsers(payload.users ?? []);
  }

  async function saveUser(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser)
    });
    const payload = await response.json();
    if (!response.ok) {
      setMessage(payload.error ?? "Unable to save user.");
      return;
    }
    setManagedUsers(payload.users ?? []);
    setNewUser({ username: "", password: "", role: "viewer" });
    setMessage("User saved.");
  }

  async function updateUserRole(username: string, role: ManagedUser["role"]) {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, role })
    });
    const payload = await response.json();
    setMessage(response.ok ? "User role updated." : payload.error ?? "Unable to update user.");
    if (response.ok) setManagedUsers(payload.users ?? []);
  }

  async function deleteUser(username: string) {
    if (!confirm(`Delete ${username}?`)) return;
    const response = await fetch("/api/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username })
    });
    const payload = await response.json();
    setMessage(response.ok ? "User deleted." : payload.error ?? "Unable to delete user.");
    if (response.ok) setManagedUsers(payload.users ?? []);
  }

  if (!user) {
    return (
      <div className="auth-panel narrow-panel">
        <form onSubmit={login}>
          <label htmlFor="username">Username</label>
          <input id="username" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
          {message && <p className="alert alert-error">{message}</p>}
          {message.includes("Setup") && <a className="button button-secondary" href="/setup">Open setup</a>}
          <button className="button button-primary" type="submit">Sign in</button>
        </form>
      </div>
    );
  }

  return (
    <div className="editor-layout">
      <aside className="admin-panel editor-side">
        <div className="admin-panel-header">
          <div>
            <strong>{user.username}</strong>
            <p className="field-help">{user.role}</p>
          </div>
          <button className="icon-button" onClick={logout} title="Sign out"><LogOut size={17} /></button>
        </div>
        <button className="button button-secondary editor-wide-button" onClick={() => { setDraft(emptyPage); setSelectedSlug(""); }}>
          <FilePlus size={17} /> New page
        </button>
        <div className="editor-page-list">
          {pages.map((page) => (
            <button key={page.slug} className={page.slug === draft.slug ? "active" : ""} onClick={() => setSelectedSlug(page.slug)}>
              <strong>{page.title}</strong>
              <span>{page.slug}</span>
            </button>
          ))}
        </div>
        {user.role === "admin" && (
          <div className="user-management">
            <h2>Users</h2>
            <form onSubmit={saveUser} className="mini-form">
              <input aria-label="Username" placeholder="Username" value={newUser.username} onChange={(event) => setNewUser({ ...newUser, username: event.target.value })} />
              <input aria-label="Password" placeholder="Password" type="password" value={newUser.password} onChange={(event) => setNewUser({ ...newUser, password: event.target.value })} />
              <select aria-label="Role" value={newUser.role} onChange={(event) => setNewUser({ ...newUser, role: event.target.value as ManagedUser["role"] })}>
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
              <button className="button button-secondary" type="submit"><UserPlus size={17} /> Add user</button>
            </form>
            <div className="managed-user-list">
              {managedUsers.map((managedUser) => (
                <div key={managedUser.username}>
                  <strong>{managedUser.username}</strong>
                  <select value={managedUser.role} onChange={(event) => updateUserRole(managedUser.username, event.target.value as ManagedUser["role"])}>
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button className="icon-button" type="button" onClick={() => deleteUser(managedUser.username)} title="Delete user"><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>
      <form className="admin-panel editor-form" onSubmit={savePage}>
        <div className="form-actions">
          <div>
            <h2>Edit MDX</h2>
            <p className="field-help">Changing the slug moves the page path under content.</p>
          </div>
          <div className="table-actions">
            <button className="button button-secondary" type="button" onClick={() => setPreviewHtml(renderPreview(draft.body))}><Eye size={17} /> Preview</button>
            <button className="button button-primary" type="submit"><Save size={17} /> Save</button>
            <button className="button button-danger" type="button" onClick={deletePage}><Trash2 size={17} /> Delete</button>
          </div>
        </div>
        {message && <p className="message">{message}</p>}
        <div className="editor-fields">
          <label>Slug<input value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} /></label>
          <label>Title<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
          <label>Description<input value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label>
          <label>Order<input type="number" value={draft.order} onChange={(event) => setDraft({ ...draft, order: Number(event.target.value) })} /></label>
        </div>
        <label>MDX body</label>
        <textarea className="markdown-source" value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })} />
        {previewHtml && (
          <div className="preview-panel markdown-body">
            <h2>Preview</h2>
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        )}
      </form>
    </div>
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function inlineMarkdown(value: string) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function renderPreview(source: string) {
  const lines = source.split(/\r?\n/);
  const html: string[] = [];
  let inCode = false;
  let code: string[] = [];

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (inCode) {
        html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
        code = [];
      }
      inCode = !inCode;
      continue;
    }
    if (inCode) {
      code.push(line);
      continue;
    }
    if (!line.trim()) continue;
    if (line.startsWith("### ")) html.push(`<h3>${inlineMarkdown(line.slice(4))}</h3>`);
    else if (line.startsWith("## ")) html.push(`<h2>${inlineMarkdown(line.slice(3))}</h2>`);
    else if (line.startsWith("# ")) html.push(`<h1>${inlineMarkdown(line.slice(2))}</h1>`);
    else if (line.startsWith("- ")) html.push(`<p>• ${inlineMarkdown(line.slice(2))}</p>`);
    else if (/^\d+\.\s/.test(line)) html.push(`<p>${inlineMarkdown(line)}</p>`);
    else if (line.startsWith("<Callout")) html.push('<aside class="callout"><strong>Callout</strong>');
    else if (line.startsWith("</Callout")) html.push("</aside>");
    else if (!line.startsWith("<")) html.push(`<p>${inlineMarkdown(line)}</p>`);
  }

  if (code.length > 0) html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
  return html.join("\n");
}
