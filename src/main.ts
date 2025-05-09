import { mount } from 'svelte'
import './app.css'
import Chess from './Chess.svelte'

const app = mount(Chess, {
  target: document.getElementById('app')!,
})

export default app
