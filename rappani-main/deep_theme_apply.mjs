import fs from 'fs';
import path from 'path';

function applyDeepTheme(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');

    // 1. Violet and Hex replacements
    content = content.replace(/bg-\[\#7C3AED\]/g, 'bg-primary');
    content = content.replace(/text-\[\#7C3AED\]/g, 'text-gold-500');
    content = content.replace(/border-\[\#7C3AED\]/g, 'border-gold-500');
    content = content.replace(/ring-\[\#7C3AED\]/g, 'ring-gold-500');

    // 2. Generic Whites/Grays to Premium Cards
    // For standard cards
    content = content.replace(/bg-white rounded-2xl shadow-sm/g, 'premium-card');
    content = content.replace(/bg-white rounded-xl shadow-sm/g, 'premium-card');
    content = content.replace(/bg-white rounded-lg shadow-sm/g, 'premium-card');
    content = content.replace(/bg-white shadow-md rounded-2xl/g, 'premium-card');
    content = content.replace(/bg-white rounded-3xl shadow-xl/g, 'premium-card');
    content = content.replace(/bg-white shadow-lg rounded-2xl/g, 'premium-card');
    content = content.replace(/bg-white shadow rounded-lg/g, 'premium-card');
    content = content.replace(/bg-white shadow-sm rounded-xl/g, 'premium-card');
    
    // Header/Navbar Glass effect
    content = content.replace(/sticky top-0 z-50 bg-white shadow-sm/g, 'sticky top-0 z-50 glass-premium');
    content = content.replace(/bg-white shadow-sm sticky top-0/g, 'glass-premium sticky top-0');

    // Modals
    content = content.replace(/bg-white rounded-2xl w-full max-w-md p-6 relative/g, 'glass-premium rounded-3xl w-full max-w-md p-6 relative');

    // 3. Text Typography
    content = content.replace(/text-gray-900/g, 'text-primary');
    content = content.replace(/text-gray-800/g, 'text-primary');
    content = content.replace(/text-gray-700/g, 'text-primary-light');
    content = content.replace(/text-gray-600/g, 'text-neutral-500');
    content = content.replace(/text-gray-500/g, 'text-neutral-500');
    content = content.replace(/text-gray-400/g, 'text-neutral-400');
    content = content.replace(/text-gray-300/g, 'text-neutral-300');
    
    content = content.replace(/text-stone-600/g, 'text-neutral-500');
    content = content.replace(/text-stone-500/g, 'text-neutral-500');
    content = content.replace(/text-stone-400/g, 'text-neutral-400');

    // 4. Backgrounds
    content = content.replace(/bg-gray-50/g, 'bg-neutral-100');
    content = content.replace(/bg-gray-100/g, 'bg-neutral-100');
    content = content.replace(/bg-gray-200/g, 'bg-neutral-300');
    content = content.replace(/bg-stone-50/g, 'bg-gold-50');
    content = content.replace(/bg-gray-900\/40/g, 'bg-primary/60');
    content = content.replace(/bg-gray-900/g, 'bg-primary');
    content = content.replace(/bg-black\/50/g, 'bg-primary/80 backdrop-blur-sm');
    content = content.replace(/bg-black\/60/g, 'bg-primary/80 backdrop-blur-sm');
    content = content.replace(/bg-black\/40/g, 'bg-primary/80 backdrop-blur-sm');
    content = content.replace(/bg-black/g, 'bg-primary');
    
    // 5. Borders
    content = content.replace(/border-gray-100/g, 'border-neutral-300/50');
    content = content.replace(/border-gray-200/g, 'border-neutral-300');
    content = content.replace(/border-gray-300/g, 'border-neutral-300');

    // 6. Buttons
    // Any remaining violet buttons
    content = content.replace(/bg-primary text-white/g, 'premium-button');
    content = content.replace(/hover:bg-primary-dark/g, 'hover:scale-105');
    // Replace long button strings
    content = content.replace(/w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-light transition-colors/g, 'w-full premium-button-gold py-3');
    content = content.replace(/w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-light transition-colors/g, 'w-full premium-button-gold py-3');
    content = content.replace(/px-6 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary-light transition-colors/g, 'px-6 py-2 premium-button');
    content = content.replace(/bg-primary text-white px-4 py-2 rounded-lg/g, 'premium-button px-4 py-2');
    
    // 7. Inputs
    content = content.replace(/w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent/g, 'premium-input');
    content = content.replace(/w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent/g, 'premium-input pl-10');
    content = content.replace(/w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all/g, 'premium-input pl-10 py-3');

    // 8. Specific highlights
    content = content.replace(/bg-yellow-400 text-black/g, 'bg-gold-500 text-white');
    content = content.replace(/text-yellow-400/g, 'text-gold-500');
    
    // Ensure "premium-card" didn't double up
    content = content.replace(/premium-card premium-card/g, 'premium-card');
    
    fs.writeFileSync(filePath, content);
    console.log('Applied deep theme to', filePath);
}

applyDeepTheme(path.resolve('src/App.tsx'));
applyDeepTheme(path.resolve('src/admin/AdminLayout.tsx'));
applyDeepTheme(path.resolve('src/admin/pages/Dashboard.tsx'));
