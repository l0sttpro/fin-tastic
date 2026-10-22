import './styles/main.css';
import { App } from './ui/app';

const root = document.getElementById('screen');
const canvas = document.getElementById('ocean-canvas') as HTMLCanvasElement | null;

if (!root || !canvas) {
  throw new Error('Fin-tastic: missing mount points');
}

const app = new App(root, canvas);

// Exposed so a run can be poked at from the browser console:
//   finTastic.engine.current
declare global {
  interface Window {
    finTastic: App;
  }
}
window.finTastic = app;
