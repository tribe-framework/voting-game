import { module, test } from 'qunit';
import { setupRenderingTest } from 'home/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | session-status', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<SessionStatus />`);

    assert.dom().hasText('');

    // Template block usage:
    await render(hbs`
      <SessionStatus>
        template block text
      </SessionStatus>
    `);

    assert.dom().hasText('template block text');
  });
});
