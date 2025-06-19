import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class SessionController extends Controller {
	@service store;
	@service('response-tracker') responseTracker;
	@service('realtime-sync') realtimeSync;

	@tracked currentQuestion = null;
	@tracked activeScenario = 'simple_choice';
	@tracked showResults = false;
	@tracked demographicsCompleted = false;
	@tracked demographics = {};

	get scenarioComponent() {
		const componentMap = {
			simple_choice: 'simple-choice-form',
			choice_overload: 'choice-overload-form',
			ranking: 'ranking-form',
			point_allocation: 'point-allocation-form',
			approval_voting: 'approval-voting-form',
		};

		return componentMap[this.activeScenario] || 'simple-choice-form';
	}

	get canShowResults() {
		return this.currentQuestion?.modules.show_results === 'yes';
	}

	@action
	async loadQuestion() {
		try {
			if (this.currentQuestion.modules) {
				this.activeScenario =
					this.currentQuestion.modules.active_scenario || 'simple_choice';
				this.showResults = this.currentQuestion.modules.show_results === 'yes';
			}
		} catch (error) {
			console.error('Failed to load question:', error);
		}
	}

	@action
	async submitResponse() {
		if (!this.demographicsCompleted) {
			// Show demographics modal first
			this.showDemographicsModal();
			return;
		}

		// Response submission is handled by individual form components
		// This action is called after successful submission
		await this.loadQuestion();
	}

	@action
	showDemographicsModal() {
		// The demographic form component will handle this
		this.demographicsCompleted = false;
	}

	@action
	onDemographicsComplete(demographics) {
		this.demographics = demographics;
		this.demographicsCompleted = true;

		// Store demographics for use in response submission
		this.responseTracker.currentDemographics = demographics;
	}

	@action
	async toggleResults() {
		await this.loadQuestion();
	}

	@action
	async refreshData() {
		await this.realtimeSync.forceSync();
		await this.loadQuestion();
	}
}
