import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class AdminController extends Controller {
	@service store;
	@service router;
	@service('session-manager') sessionManager;

	@tracked allQuestions = [];
	@tracked activeQuestions = [];
	@tracked selectedQuestion = null;
	@tracked currentSessionUrl = '';

	get scenarios() {
		return [
			{ key: 'simple_choice', title: 'Simple Choice' },
			{ key: 'choice_overload', title: 'Choice Overload' },
			{ key: 'ranking', title: 'Ranking' },
			{ key: 'point_allocation', title: 'Point Allocation' },
		];
	}

	get canCreateSession() {
		return (
			this.selectedQuestion && this.selectedQuestion.modules.active === 'yes'
		);
	}

	get sessionUrl() {
		if (this.currentSessionUrl) {
			return this.currentSessionUrl;
		}

		if (this.selectedQuestion) {
			// Generate session URL based on current location
			const baseUrl = window.location.origin;
			const sessionId = this.generateSessionId();
			return `${baseUrl}/session/${sessionId}`;
		}

		return '';
	}

	generateSessionId() {
		return (
			Math.random().toString(36).substring(2, 15) +
			Math.random().toString(36).substring(2, 15)
		);
	}

	@action
	selectQuestion(question) {
		this.selectedQuestion = question;
		this.currentSessionUrl = ''; // Reset session URL when question changes
	}

	@action
	async switchScenario(scenario) {
		console.log(scenario);

		if (!this.selectedQuestion) return;

		try {
			this.selectedQuestion.modules.active_scenario = scenario;
			await this.selectedQuestion.save();

			// Refresh the question to ensure consistency
			await this.selectedQuestion.reload();
		} catch (error) {
			console.error('Failed to switch scenario:', error);
			alert('Failed to update scenario. Please try again.');
		}
	}

	@action
	async toggleResults() {
		if (!this.selectedQuestion) return;

		try {
			const newValue =
				this.selectedQuestion.modules.show_results === 'yes' ? 'no' : 'yes';
			this.selectedQuestion.modules.show_results = newValue;
			await this.selectedQuestion.save();

			await this.selectedQuestion.reload();
		} catch (error) {
			console.error('Failed to toggle results:', error);
			alert('Failed to toggle results view. Please try again.');
		}
	}

	@action
	async createSession() {
		if (!this.selectedQuestion) return;

		try {
			const sessionId = await this.sessionManager.createSession(
				this.selectedQuestion.id,
			);
			const baseUrl = window.location.origin;
			this.currentSessionUrl = `${baseUrl}/session/${sessionId}`;
		} catch (error) {
			console.error('Failed to create session:', error);
			alert('Failed to create session. Please try again.');
		}
	}

	@action
	viewResults() {
		if (this.selectedQuestion) {
			this.router.transitionTo('results', this.selectedQuestion.id);
		}
	}

	@action
	async refreshQuestions() {
		try {
			const questions = await this.store.findAll('question', { reload: true });
			this.allQuestions = questions.toArray();
			this.activeQuestions = questions.filter((q) => q.active === 'yes');

			// Update selected question if it exists
			if (this.selectedQuestion) {
				const updatedQuestion = this.allQuestions.find(
					(q) => q.id === this.selectedQuestion.id,
				);
				if (updatedQuestion) {
					this.selectedQuestion = updatedQuestion;
				}
			}
		} catch (error) {
			console.error('Failed to refresh questions:', error);
		}
	}

	@action
	copySessionUrl() {
		if (this.sessionUrl) {
			navigator.clipboard
				.writeText(this.sessionUrl)
				.then(() => {
					// Show success feedback
					const button = event.target;
					const originalText = button.textContent;
					button.textContent = 'Copied!';
					button.classList.add('btn-success');

					setTimeout(() => {
						button.textContent = originalText;
						button.classList.remove('btn-success');
					}, 2000);
				})
				.catch((err) => {
					console.error('Failed to copy URL:', err);
					alert('Failed to copy URL. Please copy manually.');
				});
		}
	}
}
