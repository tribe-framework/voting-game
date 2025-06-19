import { module, test } from 'qunit';
import { setupRenderingTest } from 'home/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | qr-display', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<QrDisplay />`);

    assert.dom().hasText('');

    // Template block usage:
    await render(hbs`
      <QrDisplay>
        template block text
      </QrDisplay>
    `);

    assert.dom().hasText('template block text');
  });
});
