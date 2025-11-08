export default class LoginPage {
  async render() {
    return `
      <section class="container">
        <h1>Login</h1>
        <form id="loginForm">
          <div>
            <label for="email">Email:</label><br>
            <input type="email" id="email" placeholder="Email" required />
          </div>
          <div>
            <label for="password">Password:</label><br>
            <input type="password" id="password" placeholder="Password" required />
          </div>
          <button type="submit" id="loginBtn">Login</button>
        </form>
        <p id="loginMessage" style="margin-top:10px; font-weight:bold;"></p>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const message = document.getElementById('loginMessage');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      loginBtn.disabled = true;
      loginBtn.textContent = 'Sedang login...';
      message.textContent = '';

      try {
        const res = await fetch('https://story-api.dicoding.dev/v1/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (!data.error) {
          localStorage.setItem('token', data.loginResult.token);
          localStorage.setItem('userId', data.loginResult.userId || 'user'); 
          message.style.color = 'green';
          message.textContent = 'Login berhasil!';
          setTimeout(() => (window.location.hash = '/'), 1000);
        } else {
          message.style.color = 'red';
          message.textContent = data.message;
        }
      } catch (err) {
        message.style.color = 'red';
        message.textContent = 'Terjadi kesalahan: ' + err.message;
        console.error(err);
      } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
      }
    });
  }
}
