import { module, test } from 'qunit';
import { setupTest } from 'home/tests/helpers';

module('Unit | Service | realtime-sync', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let service = this.owner.lookup('service:realtime-sync');
    assert.ok(service);
  });
});
