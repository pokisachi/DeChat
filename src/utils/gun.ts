import Gun from 'gun';

export const initGun = () => {
  return Gun({
    peers: [
      'https://gun-manhattan.herokuapp.com/gun',
      'https://peer.wallie.io/gun'
    ],
    localStorage: false,
    radisk: false
  });
}


