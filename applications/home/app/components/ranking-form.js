import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class RankingForm extends Component {
	@service store;
	@service('response-tracker') responseTracker;
	@service sortablejs;

	@tracked rankings = [];
	@tracked startTime = null;
	@tracked isSubmitting = false;

	constructor() {
		super(...arguments);
		this.responseTracker.startTimer();
		this.initializeRankings();
	}

	initializeRankings() {
		if (this.args.question?.options) {
			// Include the extra option like choice overload
			const originalOptions = [...this.args.question.options];
			const extraOptions = [
				'None of the above',
				'Other',
				'Prefer not to choose',
			];
			const availableExtras = extraOptions.filter(
				(extra) =>
					!originalOptions.some((opt) =>
						opt.toLowerCase().includes(extra.toLowerCase()),
					),
			);

			if (availableExtras.length > 0) {
				originalOptions.push(availableExtras[0]);
			}

			// Shuffle options for ranking
			this.rankings = this.shuffleArray(originalOptions);
		}
	}

	shuffleArray(array) {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}

	@action
	updateRankings(newOrder) {
		this.rankings = newOrder;
	}

	@action
	moveUp(index) {
		if (index > 0) {
			const newRankings = [...this.rankings];
			[newRankings[index - 1], newRankings[index]] = [
				newRankings[index],
				newRankings[index - 1],
			];
			this.rankings = newRankings;
		}
	}

	@action
	moveDown(index) {
		if (index < this.rankings.length - 1) {
			const newRankings = [...this.rankings];
			[newRankings[index], newRankings[index + 1]] = [
				newRankings[index + 1],
				newRankings[index],
			];
			this.rankings = newRankings;
		}
	}

	@action
	async submitResponse() {
		if (!this.rankings.length || this.isSubmitting) return;

		this.isSubmitting = true;

		try {
			const responseData = {
				question: this.args.question.id,
				rankings: this.rankings,
			};

			await this.responseTracker.saveResponse('ranking-response', responseData);

			if (this.args.onSubmit) {
				this.args.onSubmit();
			}
		} catch (error) {
			console.error('Error submitting response:', error);
		} finally {
			this.isSubmitting = false;
		}
	}
}
