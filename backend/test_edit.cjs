const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function test() {
  try {
    const login = await axios.post('http://localhost:3000/api/auth/login', { email: 'test12345@test.com', password: 'password123' });
    const token = login.data.accessToken;
    const user = login.data.user;
    console.log('Logged in:', user._id);

    const fd = new FormData();
    fd.append('image', fs.createReadStream('C:\\Users\\91937\\.gemini\\antigravity\\brain\\aa632bdd-ad30-4423-ae23-1bf25eaf15ad\\real_dummy_image_1776648687521.png'));
    
    const res = await axios.put('http://localhost:3000/api/user/profile/edit/' + user._id, fd, {
      headers: {
        Authorization: 'Bearer ' + token,
        ...fd.getHeaders()
      }
    });
    console.log('Edit Success:', res.data.success);
    console.log('New Profile Pic:', res.data.user.profilePicture);
  } catch (e) {
    console.error('Error:', e.response ? e.response.data : e.message);
  }
}

test();
