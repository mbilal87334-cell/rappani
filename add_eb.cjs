const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const errorBoundaryCode = `
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', background: '#ffe6e6', height: '100vh', width: '100vw' }}>
          <h2>React App Crashed!</h2>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
`;

if (!code.includes('class ErrorBoundary')) {
  // Insert ErrorBoundary after imports
  const importEnd = code.lastIndexOf("import ") + code.substring(code.lastIndexOf("import ")).indexOf("\n") + 1;
  code = code.substring(0, importEnd) + "\n" + errorBoundaryCode + "\n" + code.substring(importEnd);
  
  // Wrap return in App component
  code = code.replace(
    'return (\n    <BrowserRouter>',
    'return (\n    <ErrorBoundary>\n      <BrowserRouter>'
  );
  code = code.replace(
    '    </BrowserRouter>\n  );',
    '    </BrowserRouter>\n    </ErrorBoundary>\n  );'
  );
  
  fs.writeFileSync('src/App.tsx', code, 'utf8');
  console.log("Added ErrorBoundary to App.tsx");
} else {
  console.log("ErrorBoundary already exists");
}
