const mongoose = require('mongoose');

async function getWikiImage(query) {
  try {
    const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(query)}`);
    const data = await res.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pageId !== '-1' && pages[pageId].original) {
       return pages[pageId].original.source;
    }
  } catch(e) {}
  return null;
}

async function run() {
  const q = ['Geometry Box', 'Fountain pen', 'Tennis racket', 'Teddy bear', 'Backpack'];
  for (let k of q) {
    const img = await getWikiImage(k);
    console.log(k, "=>", img);
  }
}
run();
