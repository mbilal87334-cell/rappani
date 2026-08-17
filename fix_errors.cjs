const fs = require('fs');

let content = fs.readFileSync('src/admin/AdminLayout.tsx', 'utf8');

if (!content.includes('Store')) {
  // Let's add Store to lucide-react import
  content = content.replace("Layers\n} from 'lucide-react';", "Layers,\n  Store\n} from 'lucide-react';");
  fs.writeFileSync('src/admin/AdminLayout.tsx', content, 'utf8');
  console.log("Added Store to AdminLayout.tsx");
}

let appContent = fs.readFileSync('src/App.tsx', 'utf8');
if (!appContent.includes('state = { hasError: false, error: null };')) {
  appContent = appContent.replace(
    'class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {',
    'class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {\n  state = { hasError: false, error: null };'
  );
  fs.writeFileSync('src/App.tsx', appContent, 'utf8');
  console.log("Fixed ErrorBoundary state in App.tsx");
}
