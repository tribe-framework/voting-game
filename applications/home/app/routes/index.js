import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route {
	@service router;

	beforeModel() {
		// Redirect to admin panel by default
		this.router.transitionTo('admin');
	}
}
