import fs from 'fs';
import path from 'path';

async function testUpload() {
  try {
    // Create a dummy image using a 1x1 pixel base64 string
    const base64Data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync('dummy.png', buffer);

    const formData = new FormData();
    const fileBlob = new Blob([buffer], { type: 'image/png' });
    formData.append('image', fileBlob, 'dummy.png');

    console.log("Sending request to http://localhost:3000/api/upload...");
    const res = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Upload failed with status ${res.status}: ${text}`);
    }

    const data = await res.json();
    console.log("Upload success! URL:", data.imageUrl);
  } catch (err) {
    console.error("Test failed:", err.message);
  } finally {
    if (fs.existsSync('dummy.png')) {
      fs.unlinkSync('dummy.png');
    }
  }
}

testUpload();
