const API_URL = "http://localhost:3000/api";
let currentResumeId = null; // Track which resume is currently being viewed

// --- NAVIGATION & UI ---
function showDashboard() {
  document.getElementById("authSection").classList.add("d-none");
  document.getElementById("dashboardSection").classList.remove("d-none");
  getUserProfile(); // Call GET /me
}

function switchTab(tab) {
  if (tab === "upload") {
    document.getElementById("view-upload").classList.remove("d-none");
    document.getElementById("view-list").classList.add("d-none");
    document.getElementById("tab-upload").classList.add("active");
    document.getElementById("tab-list").classList.remove("active");
  } else {
    document.getElementById("view-upload").classList.add("d-none");
    document.getElementById("view-list").classList.remove("d-none");
    document.getElementById("tab-upload").classList.remove("active");
    document.getElementById("tab-list").classList.add("active");
    loadResumes(); // Auto-load data when clicking tab
  }
}

// --- AUTHENTICATION ---
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      showDashboard();
    } else alert(data.msg);
  } catch (e) {
    console.error(e);
    alert("Login Error");
  }
}

async function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  alert("Signup successful! Please login.");
}

function logout() {
  // POST /logout (Optional backend call)
  fetch(`${API_URL}/auth/logout`, { method: "POST" });
  localStorage.removeItem("token");
  location.reload();
}

// --- [REQ: GET /api/auth/me] ---
async function getUserProfile() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const user = await res.json();
  document.getElementById("userEmailDisplay").innerText = user.email || "User";
}

// --- [REQ: GET /api/resumes] ---
async function loadResumes() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/resumes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const resumes = await res.json();

  const tbody = document.getElementById("resumeTableBody");
  tbody.innerHTML = "";

  if (resumes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center p-4">No candidates found. Upload a resume to begin.</td></tr>`;
    return;
  }

  resumes.forEach((r) => {
    const date = new Date(r.uploadDate).toLocaleDateString();
    const name = r.parsedData?.name || "Unknown";

    tbody.innerHTML += `
            <tr>
                <td class="ps-4 fw-bold">${name}</td>
                <td class="text-muted">${r.fileName}</td>
                <td>${date}</td>
                <td class="text-end pe-4">
                    <button class="btn btn-sm btn-primary me-1" onclick="fetchAndDisplay('${r._id}')">View</button>
                    <button class="btn btn-sm btn-outline-secondary me-1" onclick="downloadResume('${r._id}', '${r.fileName}')">⬇</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteResume('${r._id}')">🗑</button>
                </td>
            </tr>
        `;
  });
}

// --- [REQ: POST /api/resumes/upload] ---
async function uploadResume() {
  const fileInput = document.getElementById("resumeFile");
  const token = localStorage.getItem("token");
  if (!fileInput.files[0]) return alert("Please select a file");

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  document.getElementById("resultsArea").innerHTML =
    `<div class="alert alert-info">Analyzing...</div>`;

  try {
    const res = await fetch(`${API_URL}/resumes/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (res.status !== 200) throw new Error(data.msg || "Upload failed");
    renderResumeDetail(data);
  } catch (err) {
    document.getElementById("resultsArea").innerHTML =
      `<div class="alert alert-danger">${err.message}</div>`;
  }
}

// --- [REQ: GET /api/resumes/:id] ---
async function fetchAndDisplay(id) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/resumes/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();

  switchTab("upload"); // Switch to view tab
  renderResumeDetail(data); // Reuse the display function
}

// --- [REQ: DELETE /api/resumes/:id] ---
async function deleteResume(id) {
  if (!confirm("Are you sure you want to delete this candidate?")) return;

  const token = localStorage.getItem("token");
  await fetch(`${API_URL}/resumes/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  loadResumes(); // Refresh list
}

// --- [REQ: GET /api/resumes/:id/download] ---
async function downloadResume(id, fileName) {
  const token = localStorage.getItem("token");
  console.log("Attempting download for:", id);

  try {
    const res = await fetch(`${API_URL}/resumes/${id}/download`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status !== 200) {
      const errorData = await res.json();
      throw new Error(errorData.msg || "Download failed on server");
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (err) {
    console.error(err);
    alert("Error: " + err.message);
  }
}

// --- RENDER LOGIC (Handles Display & Edit Mode) ---
function renderResumeDetail(data) {
  currentResumeId = data._id; // Store ID for updating later
  const p = data.parsedData;

  // Format helpers
  const skillsHtml = (p.skills || [])
    .map((s) => `<span class="badge-skill">${s}</span>`)
    .join("");
  const listHtml = (items) =>
    (items || [])
      .map((i) => {
        const title = i.job_title || i.degree || i;
        const sub = i.company || i.institution || "";
        const date = i.duration || i.year || "";
        return `<li class="mb-2 border-bottom pb-2"><strong>${title}</strong> <span class="text-muted">at ${sub}</span> <span class="small text-secondary">${date}</span></li>`;
      })
      .join("");

  const html = `
        <div class="card shadow mt-3">
            <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
                <h3 class="mb-0 text-primary" id="disp-name">${p.name || "Unknown Candidate"}</h3>
                <div>
                    <button onclick="enableEditMode()" class="btn btn-outline-primary btn-sm me-2">✏ Edit</button>
                    <button onclick="downloadResume('${data._id}', '${data.fileName}')" class="btn btn-outline-dark btn-sm">⬇ Download Original</button>
                </div>
            </div>
            
            <div class="card-body" id="display-mode">
                <div class="row mb-4">
                    <div class="col-md-6"><strong>📧 Email:</strong> <span id="disp-email">${p.email || "N/A"}</span></div>
                    <div class="col-md-6"><strong>📱 Phone:</strong> <span id="disp-phone">${p.phone || "N/A"}</span></div>
                </div>
                <div class="mb-4"><h6>Technical Skills</h6><div>${skillsHtml || "None"}</div></div>
                <div class="row">
                    <div class="col-md-6"><h6>Experience</h6><ul class="list-unstyled">${listHtml(p.experience)}</ul></div>
                    <div class="col-md-6"><h6>Education</h6><ul class="list-unstyled">${listHtml(p.education)}</ul></div>
                </div>
            </div>

            <div class="card-body d-none" id="edit-mode">
                <div class="mb-3"><label>Name</label><input type="text" id="edit-name" class="form-control" value="${p.name || ""}"></div>
                <div class="mb-3"><label>Email</label><input type="text" id="edit-email" class="form-control" value="${p.email || ""}"></div>
                <div class="mb-3"><label>Phone</label><input type="text" id="edit-phone" class="form-control" value="${p.phone || ""}"></div>
                <div class="d-flex justify-content-end">
                    <button onclick="cancelEdit()" class="btn btn-secondary me-2">Cancel</button>
                    <button onclick="saveResumeChanges()" class="btn btn-success">Save Changes</button>
                </div>
            </div>
        </div>
    `;
  document.getElementById("resultsArea").innerHTML = html;
}

function enableEditMode() {
  document.getElementById("display-mode").classList.add("d-none");
  document.getElementById("edit-mode").classList.remove("d-none");
}

function cancelEdit() {
  document.getElementById("display-mode").classList.remove("d-none");
  document.getElementById("edit-mode").classList.add("d-none");
}

// --- [REQ: PUT /api/resumes/:id] ---
async function saveResumeChanges() {
  const token = localStorage.getItem("token");
  const updatedData = {
    parsedData: {
      name: document.getElementById("edit-name").value,
      email: document.getElementById("edit-email").value,
      phone: document.getElementById("edit-phone").value,
    },
  };

  await fetch(`${API_URL}/resumes/${currentResumeId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updatedData),
  });

  fetchAndDisplay(currentResumeId); // Reload to show updates
}

// Check login on load
if (localStorage.getItem("token")) showDashboard();
