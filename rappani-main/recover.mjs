import fs from 'fs';
import path from 'path';

const logFile = 'C:\\Users\\acer\\.gemini\\antigravity\\brain\\319cc5e4-5fb0-459e-ad91-7a007b7bb916\\.system_generated\\logs\\transcript_full.jsonl';
const targetFiles = [
    'Header.tsx',
    'Footer.tsx',
    'ProductCard.tsx',
    'HomePage.tsx',
    'ProductDetailsPage.tsx',
    'CheckoutPage.tsx'
];

const recovered = {};

const lines = fs.readFileSync(logFile, 'utf-8').split('\n');

for (const line of lines) {
    if (!line.trim()) continue;
    try {
        const entry = JSON.parse(line);
        if (entry.type === 'TOOL_RESPONSE' && entry.content) {
            for (const tf of targetFiles) {
                if (entry.content.includes(tf) && entry.content.includes('File Path: ')) {
                    const marker = 'Please note that any changes targeting the original code should remove the line number, colon, and leading space.';
                    if (entry.content.includes(marker)) {
                        let codePart = entry.content.split(marker)[1].trim();
                        const trailing = 'The above content does NOT show the entire file contents';
                        if (codePart.includes(trailing)) {
                            codePart = codePart.split(trailing)[0].trim();
                        }
                        
                        const cleanLines = codePart.split('\n').map(cLine => {
                            const match = cLine.match(/^\d+:\s?(.*)/);
                            return match ? match[1] : cLine;
                        });

                        if (!recovered[tf]) recovered[tf] = [];
                        // We only want the first couple of chunks because later chunks might be the modified file
                        if (recovered[tf].length < 3) {
                            recovered[tf].push(cleanLines.join('\n'));
                            console.log(`Recovered chunk for ${tf}`);
                        }
                    }
                }
            }
        }
    } catch (e) {
        // ignore JSON parse errors
    }
}

for (const [tf, chunks] of Object.entries(recovered)) {
    fs.writeFileSync(path.resolve(tf + '.bak'), chunks.join('\n'));
    console.log(`Saved ${tf}.bak`);
}
