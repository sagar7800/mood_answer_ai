const MoodAnswerApi = (() => {
  async function request(path, options = {}) {
    const response = await fetch(path, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Request failed.");
    }

    return data;
  }

  function jsonOptions(payload) {
    return {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };
  }

  return {
    createAnswer(payload) {
      return request("/api/answer", jsonOptions(payload));
    },

    getHistory(limit = 50) {
      return request(`/api/history?limit=${encodeURIComponent(limit)}`);
    },

    getSession() {
      return request("/api/session");
    },

    login(identifier, password) {
      return request("/api/login", jsonOptions({ identifier, password }));
    },

    signup({ name, email, password }) {
      return request("/api/signup", jsonOptions({ name, email, password }));
    },

    logout() {
      return request("/api/logout", { method: "POST" });
    },
  };
})();

window.MoodAnswerApi = MoodAnswerApi;
