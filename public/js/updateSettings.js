const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

// type is either 'password' or 'data'
const updateSettings = async (data, type) => {
  const url = `/api/v1/users/${
    type === 'password' ? 'updatePassword' : 'updateMe'
  }`;

  try {
    const responce = await fetch(url, {
      method: 'PATCH',
      ...(type === 'password' && {
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      body: type === 'password' ? JSON.stringify(data) : data,
    });
    const res = await responce.json();
    // console.log(res);

    if (res.status === 'success') {
      showAlert(
        'success',
        `${type === 'data' ? 'Data' : 'Password'} upload successfully`
      );
    }

    return res;
  } catch (err) {
    showAlert('error', 'Please enter valid details!');
  }
};

if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'data');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    document.querySelector('.btn--save-password').textContent = 'Updating...';
    const password = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    const responce = await updateSettings(
      { password, newPassword, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save Password';

    if (responce.status === 'success') {
      document.getElementById('password-current').value = '';
      document.getElementById('password').value = '';
      document.getElementById('password-confirm').value = '';
    }
  });
}
