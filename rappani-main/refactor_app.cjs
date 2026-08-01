const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Export interfaces
content = content.replace('interface Product {', 'export interface Product {');
content = content.replace('interface Order {', 'export interface Order {');

// 2. Add import
content = content.replace("import { motion, AnimatePresence } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';\nimport AdminApp from './admin/AdminApp';");

// 3. Delete AdminPanel function
const startText = "// --- Admin Panel ---";
const endText = "export default function App() {";

const startIndex = content.indexOf(startText);
const endIndex = content.indexOf(endText);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.slice(0, startIndex) + "\n\n" + content.slice(endIndex);
}

// 4. Update route
content = content.replace(
  /<Route path="\/admin".*?AdminPanel.*? \/>/s,
  '<Route path="/admin/*" element={<AdminApp products={products} setProducts={setProducts} settings={settings} setSettings={setSettings} />} />'
);

fs.writeFileSync('src/App.tsx', content);
console.log("Successfully refactored App.tsx");
