import Player from './actors/Player.js';
import Coin from './actors/Coin.js';

export default {
    '#': 'wall',
    ' ': 'empty',
    '>': 'portal-next',
    '<': 'portal-previous',
    '^': 'tree',
    '@': Player,
    '+': Coin
};