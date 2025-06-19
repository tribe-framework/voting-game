import { module, test } from 'qunit';
import { setupTest } from 'home/tests/helpers';

module('Unit | Service | response-tracker', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let service = this.owner.lookup('service:response-tracker');
    assert.ok(service);
  });
});
