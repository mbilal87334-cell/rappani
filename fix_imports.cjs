const fs = require('fs');

// Fix App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
if (!appCode.includes('ArrowLeft,')) {
    appCode = appCode.replace("import { Phone,", "import { Phone, ArrowLeft,");
    fs.writeFileSync('src/App.tsx', appCode, 'utf8');
    console.log("Fixed ArrowLeft in App.tsx");
}

// Fix AdminLayout.tsx
let adminLayoutCode = fs.readFileSync('src/admin/AdminLayout.tsx', 'utf8');
if (!adminLayoutCode.includes('Store')) {
    adminLayoutCode = adminLayoutCode.replace("import { LayoutDashboard,", "import { LayoutDashboard, Store,");
    fs.writeFileSync('src/admin/AdminLayout.tsx', adminLayoutCode, 'utf8');
    console.log("Fixed Store in AdminLayout.tsx");
}

// Also let's define Product's shopId in App.tsx just to clear TS error (it's safe)
if (!appCode.includes('shopId?: string;')) {
    appCode = appCode.replace("reviews?: Review[];", "reviews?: Review[];\n  shopId?: string;");
    fs.writeFileSync('src/App.tsx', appCode, 'utf8');
    console.log("Fixed Product shopId interface in App.tsx");
}

// Fix ProductManager.tsx interface as well
let pmCode = fs.readFileSync('src/admin/pages/ProductManager.tsx', 'utf8');
if (!pmCode.includes('shopId?: string;')) {
    pmCode = pmCode.replace("reviews?: any[];", "reviews?: any[];\n  shopId?: string;");
    fs.writeFileSync('src/admin/pages/ProductManager.tsx', pmCode, 'utf8');
    console.log("Fixed Product shopId interface in ProductManager.tsx");
}
