const audio = {
  map: new Howl({
    src: './assets/Audio/map.wav',
    html5: true,
    volume: 0.5,
  }),
  initBattle: new Howl({
    src: './assets/Audio/initBattle.wav',
    volume: 0.1,
  }),
  battle: new Howl({
    src: './assets/Audio/battle.mp3',
    volume: 0.4,
  }),
  tackleHit: new Howl({
    src: './assets/Audio/tackleHit.wav',
    volume: 0.3,
  }),
  fireballHit: new Howl({
    src: './assets/Audio/fireballHit.wav',
    volume: 0.5,
  }),
  initFireball: new Howl({
    src: './assets/Audio/initFireball.wav',
    volume: 0.3,
  }),
  victory: new Howl({
    src: './assets/Audio/victory.wav',
    volume: 3,
  }),
};

export default audio;
