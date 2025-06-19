import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ResultsRoute extends Route {
	@service store;

	async model(params) {
		try {
			const question = await this.store.findRecord(
				'question',
				params.question_id,
			);

			// Load all response types for this question
			const responseTypes = [
				'simple-choice-response',
				'choice-overload-response',
				'ranking-response',
				'point-allocation-response',
				'approval-voting-response',
			];

			const allResponses = {};

			for (const responseType of responseTypes) {
				try {
					const responses = await this.store.query(responseType, {
						modules: {
							question: params.question_id,
						},
					});
					allResponses[responseType] = responses;
				} catch (error) {
					console.warn(`Failed to load ${responseType}:`, error);
					allResponses[responseType] = [];
				}
			}

			// Load analysis if available
			let analysis = null;
			try {
				const analyses = await this.store.query('analysis', {
					modules: {
						question: params.question_id,
					},
				});
				analysis = analyses.get('firstObject');
			} catch (error) {
				console.warn('No analysis found:', error);
			}

			return {
				question,
				responses: allResponses,
				analysis,
			};
		} catch (error) {
			console.error('Failed to load results:', error);
			throw error;
		}
	}

	setupController(controller, model) {
		super.setupController(controller, model);
		controller.set('question', model.question);
		controller.set('allResponses', model.responses);
		controller.set('analysisData', model.analysis);
		controller.processResults();
	}
}
