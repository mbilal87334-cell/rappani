import jwt from 'jsonwebtoken';

const token = jwt.sign({ userId: 'dummy', role: 'superadmin' }, 'rappani_super_secret_key', { expiresIn: '1h' });

async function test() {
  const res = await fetch('http://localhost:5000/api/products/all', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Body:", text.substring(0, 500));
}

test();
