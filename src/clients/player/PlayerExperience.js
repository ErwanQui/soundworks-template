import { Experience } from '@soundworks/core/client';
import { render, html } from 'lit-html';
import renderAppInitialization from '../views/renderAppInitialization';

class PlayerExperience extends Experience {
  constructor(client, config = {}, $container) {
    super(client);

    this.config = config;
    this.$container = $container;

    // require services

    // default initialization views
    renderAppInitialization(client, config, $container);
  }

  start() {
    super.start();

    this.renderApp(`Hello ${this.client.id}`);
  }

  renderApp(msg) {
    render(html`
      <div class="screen">
        <section class="half-screen aligner">
          <h1 class="title">${msg}</h1>
        </section>
        <section class="half-screen aligner"></section>
      </div>
    `, this.$container);
  }
}

export default PlayerExperience;
