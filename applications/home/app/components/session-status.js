import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class SessionStatus extends Component {
	@service('session-manager') sessionManager;
	@service('realtime-sync') realtimeSync;

	@tracked connectionStatus = 'disconnected';
	@tracked participantCount = 0;

	constructor() {
		super(...arguments);
		this.connectionStatus = this.sessionManager.connectionStatus;
		this.updateParticipantCount();
	}

	get statusClass() {
		switch (this.connectionStatus) {
			case 'connected':
				return 'alert-success';
			case 'connecting':
				return 'alert-warning';
			case 'error':
				return 'alert-danger';
			default:
				return 'alert-secondary';
		}
	}

	get statusIcon() {
		switch (this.connectionStatus) {
			case 'connected':
				return 'bi-wifi';
			case 'connecting':
				return 'bi-arrow-clockwise';
			case 'error':
				return 'bi-wifi-off';
			default:
				return 'bi-wifi-off';
		}
	}

	get statusMessage() {
		switch (this.connectionStatus) {
			case 'connected':
				return 'Connected to session';
			case 'connecting':
				return 'Connecting...';
			case 'error':
				return 'Connection error';
			default:
				return 'Not connected';
		}
	}

	updateParticipantCount() {
		// In a real implementation, this would get actual participant count
		// For now, simulate with a random number for demo purposes
		this.participantCount = Math.floor(Math.random() * 25) + 1;
	}

	@action
	async reconnect() {
		try {
			this.connectionStatus = 'connecting';
			await this.realtimeSync.forceSync();
			this.connectionStatus = 'connected';
			this.updateParticipantCount();
		} catch (error) {
			this.connectionStatus = 'error';
			console.error('Reconnection failed:', error);
		}
	}
}
