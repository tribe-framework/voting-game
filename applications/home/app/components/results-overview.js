import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ResultsOverview extends Component {
	@service store;
	@service('realtime-sync') realtimeSync;

	@tracked resultsData = [];
	@tracked isLoading = false;

	constructor() {
		super(...arguments);
		this.loadResults();
	}

	get scenarios() {
		return [
			{
				key: 'simple_choice',
				title: 'Simple Choice',
				responseType: 'simple-choice-response',
			},
			{
				key: 'choice_overload',
				title: 'Choice Overload',
				responseType: 'choice-overload-response',
			},
			{ key: 'ranking', title: 'Ranking', responseType: 'ranking-response' },
			{
				key: 'point_allocation',
				title: 'Point Allocation',
				responseType: 'point-allocation-response',
			},
			{
				key: 'approval_voting',
				title: 'Approval Voting',
				responseType: 'approval-voting-response',
			},
		];
	}

	@action
	async loadResults() {
		if (!this.args.question) return;

		this.isLoading = true;

		try {
			const scenarioResults = await Promise.all(
				this.scenarios.map(async (scenario) => {
					try {
						const responses = await this.store.query(scenario.responseType, {
							question: this.args.question.id,
						});

						return {
							scenario: scenario.key,
							title: scenario.title,
							responses: responses.toArray(),
							count: responses.length,
						};
					} catch (error) {
						console.warn(`Failed to load ${scenario.key} responses:`, error);
						return {
							scenario: scenario.key,
							title: scenario.title,
							responses: [],
							count: 0,
						};
					}
				}),
			);

			this.resultsData = scenarioResults;
		} catch (error) {
			console.error('Error loading results:', error);
			this.resultsData = [];
		} finally {
			this.isLoading = false;
		}
	}

	@action
	async refreshResults() {
		await this.realtimeSync.forceSync();
		await this.loadResults();
	}

	get totalResponses() {
		return this.resultsData.reduce((sum, scenario) => sum + scenario.count, 0);
	}

	get hasAnyResults() {
		return this.totalResponses > 0;
	}
}
