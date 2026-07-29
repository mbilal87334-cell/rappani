async function fetchFS() {
  const res = await fetch('https://fakestoreapi.com/products');
  const data = await res.json();
  data.forEach(p => console.log(p.title, "=>", p.image));
}
fetchFS();
