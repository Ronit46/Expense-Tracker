const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Unauthorized! Please log in again.");
        window.location.href = "login.html";
        return;
    }
    
    const headers = { "Authorization": `Bearer ${token}`, ...options.headers };
    return fetch(url, { ...options, headers });
};

const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
};

document.getElementById("logoutBtn")?.addEventListener("click", logout);
