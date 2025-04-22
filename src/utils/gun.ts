import Gun from 'gun';

const peers = [
  'http://localhost:8765/gun', // Local peer
  'https://gun-manhattan.herokuapp.com/gun', // Public peer 1
  'https://gun-us.herokuapp.com/gun', // Public peer 2
  // Thêm nhiều peer khác
];

export const initGun = () => {
  return Gun({
    peers: [
      'https://gun-manhattan.herokuapp.com/gun',
      'https://peer.wallie.io/gun'
    ],
    localStorage: false
  });
}

