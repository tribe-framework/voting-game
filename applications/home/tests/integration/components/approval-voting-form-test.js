import { module, test } from 'qunit';
import { setupRenderingTest } from 'home/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | approval-voting-form', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<ApprovalVotingForm />`);

    assert.dom().hasText('');

    // Template block usage:
    await render(hbs`
      <ApprovalVotingForm>
        template block text
      </ApprovalVotingForm>
    `);

    assert.dom().hasText('template block text');
  });
});
