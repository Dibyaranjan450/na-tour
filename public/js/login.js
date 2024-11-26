// const alerts = require('./alerts');

const loginButton = document.getElementById('loginButton');
const logoutBtn = document.querySelector('.nav__el--logout');

const login = async (email, password) => {
  try {
    const res = await fetch('/api/v1/users/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then((response) => response.json())
      .then((json) => json);
    // console.log(res);

    if (res.status === 'success') {
      showAlert('success', 'Logged in successfully');

      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    } else {
      showAlert('error', res.message);
    }
  } catch (err) {
    console.log(err);
  }
};

const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await fetch('/api/v1/users/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
        passwordConfirm,
      }),
    })
      .then((response) => response.json())
      .then((json) => json);
    // console.log(res);

    if (res.status === 'success') {
      showAlert('success', 'Signed in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    } else {
      showAlert('error', res.message.message);
    }
  } catch (err) {
    console.log(err);
  }
};

// LOGIN FUNCTION //
if (loginButton) {
  loginButton.addEventListener('click', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (window.location.pathname === '/signup') {
      // SIGNUP //
      const name = document.getElementById('name').value;
      const passwordConfirm = document.getElementById('passwordConfirm').value;

      if (
        name.trim().length &&
        email.trim().length &&
        password.trim().length &&
        passwordConfirm.trim().length
      ) {
        signup(name, email, password, passwordConfirm);
      }
    } else {
      // LOGIN //
      if (email.trim().length && password.trim().length) {
        login(email, password);
      }
    }
  });
}

// LOGOUT FUNCTION //
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    fetch('/api/v1/users/logout', {
      method: 'GET',
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'success') {
          // location.reload(true);
          location.href = '/';
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        showAlert('error', 'Error logging out: Try again.');
      });
  });
}

const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

const showAlert = (type, msg) => {
  hideAlert();

  const markup = `<div class='alert alert--${type}'>${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);

  window.setTimeout(hideAlert, 3000);
};
