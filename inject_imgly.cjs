const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Add import
if (!content.includes("import imglyRemoveBackground from '@imgly/background-removal';")) {
  const importsEnd = content.lastIndexOf("import ");
  const nextLine = content.indexOf('\n', importsEnd) + 1;
  content = content.slice(0, nextLine) + "import imglyRemoveBackground from '@imgly/background-removal';\n" + content.slice(nextLine);
}

// 2. Add state isRemovingBackground
const stateRegex = /const \[isUploading, setIsUploading\] = useState\(false\);/;
if (stateRegex.test(content) && !content.includes("const [isRemovingBackground, setIsRemovingBackground] = useState(false);")) {
  content = content.replace(stateRegex, match => match + "\n  const [isRemovingBackground, setIsRemovingBackground] = useState(false);");
}

// 3. Replace handleFileChange
const handleFileChangeRegex = /const handleFileChange = async \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?setIsUploading\(false\);\s*\}\s*\}\s*\};\s*\};\s*catch\s*\(err\)\s*\{\s*console\.error\("Upload failed", err\);\s*setFormError\("Image upload failed\. Please try again\."\);\s*setIsUploading\(false\);\s*\}\s*\}\s*\};/m;

const newHandleFileChange = `const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsRemovingBackground(true);
        // Remove background using AI locally in browser
        const bgRemovedBlob = await imglyRemoveBackground(file);
        setIsRemovingBackground(false);
        
        setIsUploading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const dataUrl = reader.result as string;
            const imageUrl = await uploadImage(dataUrl);
            setCurrentProduct({ ...currentProduct, image: imageUrl });
            setFormError('');
          } catch (err) {
            console.error("Upload failed", err);
            setFormError("Image upload failed. Please try again.");
          } finally {
            setIsUploading(false);
          }
        };
        reader.readAsDataURL(bgRemovedBlob);
      } catch (err) {
        console.error("Upload or Background Removal failed", err);
        setFormError("AI Background Removal or upload failed. Please try again.");
        setIsRemovingBackground(false);
        setIsUploading(false);
      }
    }
  };`;

// We use string indexOf to replace handleFileChange because the regex might be tricky
const startHandleFileChange = content.indexOf("const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {");
const endTriggerCamera = content.indexOf("const triggerCamera = () => {");
if (startHandleFileChange !== -1 && endTriggerCamera !== -1 && !content.includes("imglyRemoveBackground(file)")) {
  content = content.slice(0, startHandleFileChange) + newHandleFileChange + "\n\n  " + content.slice(endTriggerCamera);
}

// 4. Update UI loading indicator
const uiSearch = `{isUploading && (
                      <div className="absolute inset-0 bg-zinc-900/40 glass/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg top-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mb-2"></div>
                        <p className="text-xs font-bold text-rose-600">Uploading Image...</p>
                      </div>
                    )}`;

const uiReplacement = `{(isUploading || isRemovingBackground) && (
                      <div className="absolute inset-0 bg-zinc-900/40 glass/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg top-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mb-2"></div>
                        <p className="text-xs font-bold text-rose-600">
                          {isRemovingBackground ? "Removing AI Background..." : "Uploading Image..."}
                        </p>
                      </div>
                    )}`;

if (content.includes(uiSearch) && !content.includes("Removing AI Background...")) {
  content = content.replace(uiSearch, uiReplacement);
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log("imgly injected securely.");
