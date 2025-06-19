import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class RealtimeSyncService extends Service {
	@service store;

	@tracked lastSync = null;
	@tracked pendingUpdates = [];

	syncInterval = null;
	pollFrequency = 3000; // 3 seconds

	init() {
		super.init(...arguments);
		this.schedulePoll();
	}

	willDestroy() {
		super.willDestroy(...arguments);
		if (this.syncInterval) {
			clearInterval(this.syncInterval);
		}
	}

	@action
	async syncData() {
		try {
			// Reload all questions to get latest data
			await this.store.findAll('question', { reload: true });

			// Process any pending updates
			if (this.pendingUpdates.length > 0) {
				for (const update of this.pendingUpdates) {
					await this.handleUpdate(update);
				}
				this.pendingUpdates = [];
			}

			this.lastSync = new Date();
		} catch (error) {
			console.error('Sync failed:', error);
		}
	}

	@action
	async handleUpdate(update) {
		try {
			switch (update.type) {
				case 'question_updated':
					await this.store.findRecord('question', update.id, { reload: true });
					break;
				case 'new_response':
					// Trigger refresh of response data
					await this.store.query(update.responseType, {
						question: update.questionId,
						reload: true,
					});
					break;
			}
		} catch (error) {
			console.error('Update handling failed:', error);
		}
	}

	@action
	schedulePoll() {
		if (this.syncInterval) {
			clearInterval(this.syncInterval);
		}

		this.syncInterval = setInterval(() => {
			this.syncData();
		}, this.pollFrequency);
	}

	@action
	addPendingUpdate(update) {
		this.pendingUpdates.push(update);
	}

	@action
	forceSync() {
		return this.syncData();
	}
}
