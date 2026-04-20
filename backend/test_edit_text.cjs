const axios = require('axios');
const FormData = require('form-data');

async function test() {
  try {
    const login = await axios.post('http://localhost:3000/api/auth/login', { email: 'test12345@test.com', password: 'password123' });
    const token = login.data.accessToken;
    const user = login.data.user;
    console.log('Logged in:', user._id);

    const fd = new FormData();
    fd.append('phoneNumber', '9999999999');
    fd.append('username', 'newtestuser');
    
    const res = await axios.put('http://localhost:3000/api/user/profile/edit/' + user._id, fd, {
      headers: {
        Authorization: 'Bearer ' + token,
        ...fd.getHeaders()
      }
    });
    console.log('Edit Success:', res.data.success);
    console.log('New User:', res.data.user);
  } catch (e) {
    console.error('Error:', e.response ? e.response.data : e.message);
  }
}

test();
