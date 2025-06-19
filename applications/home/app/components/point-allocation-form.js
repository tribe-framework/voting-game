import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class PointAllocationForm extends Component {
	@service store;
	@service('response-tracker') responseTracker;

	@tracked pointDistribution = [];
	@tracked remainingPoints = 10;
	@tracked startTime = null;
	@tracked isSubmitting = false;

	constructor() {
		super(...arguments);
		this.responseTracker.startTimer();
		this.initializePoints();
	}

	initializePoints() {
		if (this.args.question?.options) {
			// Include extra option like other scenarios
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

			this.pointDistribution = originalOptions.map((option) => ({
				option,
				points: 0,
			}));
		}
	}

	get totalAllocated() {
		return this.pointDistribution.reduce((sum, item) => sum + item.points, 0);
	}

	get isValidAllocation() {
		return this.totalAllocated === 10;
	}

	@action
	adjustPoints(index, change) {
		const newDistribution = [...this.pointDistribution];
		const currentPoints = newDistribution[index].points;
		const newPoints = Math.max(0, Math.min(10, currentPoints + change));

		// Check if we have enough remaining points
		const pointDifference = newPoints - currentPoints;
		if (pointDifference > this.remainingPoints) {
			return; // Not enough points remaining
		}

		newDistribution[index].points = newPoints;
		this.pointDistribution = newDistribution;
		this.remainingPoints = 10 - this.totalAllocated;
	}

	@action
	setPoints(index, value) {
		const points = parseInt(value) || 0;
		const newDistribution = [...this.pointDistribution];
		const oldPoints = newDistribution[index].points;

		// Calculate if this change is valid
		const otherPoints = this.totalAllocated - oldPoints;
		if (otherPoints + points <= 10) {
			newDistribution[index].points = points;
			this.pointDistribution = newDistribution;
			this.remainingPoints = 10 - this.totalAllocated;
		}
	}

	@action
	async submitResponse() {
		if (!this.isValidAllocation || this.isSubmitting) return;

		this.isSubmitting = true;

		try {
			const responseData = {
				question: this.args.question.id,
				point_distribution: this.pointDistribution,
			};

			await this.responseTracker.saveResponse(
				'point-allocation-response',
				responseData,
			);

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
