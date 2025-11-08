export default class RegisterPage {
  async render() {
    return `
      <section>
        <h2>Register</h2>
        <form id="registerForm">
          <div>
            <label for="name">Name</label>
            <input type="text" id="name" placeholder="Name" required />
          </div>
          <div>
            <label for="email">Email</label>
            <input type="email" id="email" placeholder="Email" required />
          </div>
          <div>
            <label for="password">Password</label>
            <input type="password" id="password" placeholder="Password" required />
          </div>
          <button type="submit">Register</button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('registerForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const res = await fetch('https://story-api.dicoding.dev/v1/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();

        if (!data.error) {
          alert('Register berhasil. Silakan login');
          window.location.hash = '/login';
        } else {
          alert(data.message);
        }
      } catch (err) {
        console.error(err);
      }
    });
  }
}