import { module, test } from 'qunit';
import { setupTest } from 'home/tests/helpers';

module('Unit | Route | results', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:results');
    assert.ok(route);
  });
});
