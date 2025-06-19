import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class RefreshButton extends Component {
	@tracked isRefreshing = false;

	@action
	async triggerRefresh() {
		if (this.isRefreshing || !this.args.onRefresh) return;

		this.isRefreshing = true;

		try {
			await this.args.onRefresh();
		} catch (error) {
			console.error('Refresh failed:', error);
		} finally {
			this.isRefreshing = false;
		}
	}
}
