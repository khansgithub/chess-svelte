import { mount } from 'svelte'
import './app.css'
import Chess from './Chess.svelte'
import Foo from './Foo.svelte';

const app = mount(Chess, {
// const app = mount(Foo, {
  target: document.getElementById('app')!,
})

export default app
