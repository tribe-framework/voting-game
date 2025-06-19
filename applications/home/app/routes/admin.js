import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdminRoute extends Route {
	@service store;

	async model() {
		try {
			const questions = await this.store.query('question', {
				modules: { content_privacy: 'public' },
			});
			const activeQuestions = await this.store.query('question', {
				modules: { active: 'yes' },
			});

			return {
				allQuestions: questions,
				activeQuestions: activeQuestions,
			};
		} catch (error) {
			console.error('Failed to load questions:', error);
			return {
				allQuestions: [],
				activeQuestions: [],
			};
		}
	}

	setupController(controller, model) {
		super.setupController(controller, model);
		controller.set('allQuestions', model.allQuestions);
		controller.set('activeQuestions', model.activeQuestions);

		// Set the first active question as selected if available
		if (model.activeQuestions.length > 0) {
			controller.set('selectedQuestion', model.activeQuestions[0]);
		}
	}
}
