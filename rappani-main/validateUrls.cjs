const urls = [
  'https://upload.wikimedia.org/wikipedia/commons/7/7b/Fountain_pen_writing_%28literacy%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/1/1d/Compass.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/a/a6/Coffee_Mug.jpg', // Might fail
  'https://upload.wikimedia.org/wikipedia/commons/2/23/Keychain.jpg', // Might fail
  'https://upload.wikimedia.org/wikipedia/commons/d/d8/Teddy_bear_early_1900s_-_Smithsonian_Museum_of_Natural_History.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/a/a6/Rubik%27s_cube.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/1/17/Classic_football.png',
  'https://upload.wikimedia.org/wikipedia/commons/8/87/Cricketball.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/d/d7/Rucksack1.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/d/d0/Coin_purse.jpg'
];

async function run() {
  for (let u of urls) {
    try {
      const res = await fetch(u, { method: 'HEAD' });
      console.log(res.status === 200 ? 'OK' : 'FAIL ' + res.status, u);
    } catch(e) {
      console.log('ERR', u);
    }
  }
}
run();
