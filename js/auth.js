const loginForm = document.querySelector("#loginForm");
const signupForm = document.querySelector("#signupForm");

async function redirectIfAuthenticated() {
  try {
    const data = await MoodAnswerApi.getSession();

    if (data.authenticated) {
      window.location.href = "/";
    }
  } catch {
    // Login and signup should still render if the session endpoint is unavailable.
  }
}

if (loginForm) {
  const loginMessage = document.querySelector("#loginMessage");
  const loginButton = loginForm.querySelector("button");

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData(loginForm);
    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";
    loginMessage.textContent = "";

    try {
      await MoodAnswerApi.login(data.get("username"), data.get("password"));
      window.location.href = "/";
    } catch (error) {
      loginMessage.textContent = error.message;
    } finally {
      loginButton.disabled = false;
      loginButton.textContent = "Login";
    }
  });
}

if (signupForm) {
  const signupMessage = document.querySelector("#signupMessage");
  const signupButton = signupForm.querySelector("button");

  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData(signupForm);
    signupButton.disabled = true;
    signupButton.textContent = "Creating...";
    signupMessage.textContent = "";

    try {
      await MoodAnswerApi.signup({
        name: data.get("name"),
        email: data.get("email"),
        password: data.get("password"),
      });
      window.location.href = "/";
    } catch (error) {
      signupMessage.textContent = error.message;
    } finally {
      signupButton.disabled = false;
      signupButton.textContent = "Create account";
    }
  });
}

redirectIfAuthenticated();
