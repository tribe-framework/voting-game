import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class SessionManagerService extends Service {
	@service store;

	@tracked activeSession = null;
	@tracked connectionStatus = 'disconnected';

	@action
	async createSession(questionId) {
		try {
			this.connectionStatus = 'connecting';
			const sessionId = this.generateSessionId();

			const question = await this.store.findRecord('question', questionId);
			this.activeSession = {
				id: sessionId,
				question: question,
				createdAt: new Date(),
				participantCount: 0,
			};

			this.connectionStatus = 'connected';
			return sessionId;
		} catch (error) {
			this.connectionStatus = 'error';
			throw error;
		}
	}

	@action
	async joinSession(sessionId) {
		try {
			this.connectionStatus = 'connecting';

			// In a real app, this would validate session exists
			this.activeSession = {
				id: sessionId,
				joinedAt: new Date(),
			};

			this.connectionStatus = 'connected';
			return true;
		} catch (error) {
			this.connectionStatus = 'error';
			throw error;
		}
	}

	@action
	async updateSession(sessionData) {
		if (this.activeSession) {
			this.activeSession = { ...this.activeSession, ...sessionData };
		}
	}

	generateSessionId() {
		return (
			Math.random().toString(36).substring(2, 15) +
			Math.random().toString(36).substring(2, 15)
		);
	}
}
