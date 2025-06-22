import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SessionRoute extends Route {
	@service store;
	@service('session-manager') sessionManager;

	async model(params) {
		try {
			// Join the session
			await this.sessionManager.joinSession(params.session_id);

			// Get the active question
			const activeQuestion = await this.store.query('question', {
				modules: { active: 'yes' },
			});

			if (!activeQuestion) {
				throw new Error('No active question found');
			}

			return {
				sessionId: params.session_id,
				question: activeQuestion[0],
			};
		} catch (error) {
			console.error('Failed to load session:', error);
			throw error;
		}
	}

	setupController(controller, model) {
		super.setupController(controller, model);
		controller.set('sessionId', model.sessionId);
		controller.set('currentQuestion', model.question);
		controller.loadQuestion();
	}
}
