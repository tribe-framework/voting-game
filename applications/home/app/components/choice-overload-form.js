import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ChoiceOverloadForm extends Component {
	@service store;
	@service('response-tracker') responseTracker;

	@tracked selectedOption = null;
	@tracked startTime = null;
	@tracked isSubmitting = false;

	constructor() {
		super(...arguments);
		this.responseTracker.startTimer();
	}

	get options() {
		if (!this.args.question.modules?.options) return [];

		// For choice overload, add one extra option
		const originalOptions = [...this.args.question.modules.options];
		const extraOptions = [
			'None of the above',
			'Other',
			'Prefer not to choose',
			'Need more information',
			'All are equally good',
		];

		// Pick a random extra option that's not already in the list
		const availableExtras = extraOptions.filter(
			(extra) =>
				!originalOptions.some((opt) =>
					opt.toLowerCase().includes(extra.toLowerCase()),
				),
		);

		if (availableExtras.length > 0) {
			originalOptions.push(availableExtras[0]);
		}

		return originalOptions;
	}

	@action
	selectOption(option) {
		this.selectedOption = option;
	}

	@action
	async submitResponse() {
		if (!this.selectedOption || this.isSubmitting) return;

		this.isSubmitting = true;

		try {
			const responseData = {
				question: this.args.question.slug,
				selected_option: this.selectedOption,
				session_id: this.args.sessionId,
				device_id: this.args.deviceId,
			};

			await this.responseTracker.saveResponse(
				'choice-overload-response',
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
