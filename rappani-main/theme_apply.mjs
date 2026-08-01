import fs from 'fs';
import path from 'path';

function applyTheme(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');

    // Colors
    content = content.replace(/bg-violet-600/g, 'bg-primary');
    content = content.replace(/bg-violet-500/g, 'bg-primary/90');
    content = content.replace(/bg-violet-700/g, 'bg-primary');
    content = content.replace(/bg-violet-50/g, 'bg-gold-500/10');
    content = content.replace(/bg-violet-100/g, 'bg-gold-500/20');
    content = content.replace(/text-violet-600/g, 'text-gold-500');
    content = content.replace(/text-violet-500/g, 'text-gold-500');
    content = content.replace(/text-violet-700/g, 'text-gold-500');
    content = content.replace(/ring-violet-500/g, 'ring-gold-500');
    content = content.replace(/border-violet-100/g, 'border-gold-500/20');
    content = content.replace(/border-violet-200/g, 'border-gold-500/30');
    content = content.replace(/border-violet-500/g, 'border-gold-500');
    content = content.replace(/from-violet-600/g, 'from-primary');
    content = content.replace(/to-violet-800/g, 'to-primary-dark');
    content = content.replace(/from-violet-500/g, 'from-primary');
    content = content.replace(/to-fuchsia-500/g, 'to-gold-500');
    content = content.replace(/to-purple-600/g, 'to-primary');
    content = content.replace(/from-indigo-600/g, 'from-primary');

    // Structural elements (cards)
    // Find generic cards and make them premium-cards
    content = content.replace(/bg-white rounded-2xl shadow-sm border border-gray-100/g, 'premium-card');
    content = content.replace(/bg-white rounded-xl shadow-sm border border-gray-100/g, 'premium-card');
    content = content.replace(/bg-white rounded-xl shadow-sm/g, 'premium-card');
    content = content.replace(/bg-white rounded-2xl shadow-sm/g, 'premium-card');
    content = content.replace(/bg-white rounded-2xl shadow-md/g, 'premium-card');
    content = content.replace(/bg-white rounded-3xl shadow-xl/g, 'premium-card');

    // Buttons
    // Find generic primary buttons and replace with premium-button-gold
    content = content.replace(/w-full bg-violet-600 text-white py-3 rounded-xl font-semibold hover:bg-violet-700 transition-colors/g, 'w-full premium-button-gold');
    content = content.replace(/bg-violet-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-violet-700 transition-colors/g, 'premium-button-gold');
    content = content.replace(/bg-violet-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-violet-700 transition-colors/g, 'premium-button-gold text-sm');
    content = content.replace(/bg-white text-violet-600 px-6 py-2 rounded-xl font-semibold hover:bg-gray-50 transition-colors/g, 'premium-button text-primary');

    // Inputs
    content = content.replace(/w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all/g, 'w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm');

    fs.writeFileSync(filePath, content);
    console.log('Applied theme to', filePath);
}

applyTheme(path.resolve('src/App.tsx'));
applyTheme(path.resolve('src/admin/AdminLayout.tsx'));
applyTheme(path.resolve('src/admin/pages/Dashboard.tsx'));
