import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ApprovalVotingForm extends Component {
	@service store;
	@service('response-tracker') responseTracker;

	@tracked approvedOptions = [];
	@tracked startTime = null;
	@tracked isSubmitting = false;

	constructor() {
		super(...arguments);
		this.responseTracker.startTimer();
	}

	get options() {
		if (!this.args.question.modules?.options) return [];

		// Include extra option like other scenarios
		const originalOptions = [...this.args.question.modules.options];
		/*
		const extraOptions = ['None of the above', 'Other', 'Prefer not to choose'];
		const availableExtras = extraOptions.filter(
			(extra) =>
				!originalOptions.some((opt) =>
					opt.toLowerCase().includes(extra.toLowerCase()),
				),
		);

		if (availableExtras.length > 0) {
			originalOptions.push(availableExtras[0]);
		}
		*/

		return originalOptions;
	}

	get hasSelections() {
		return this.approvedOptions.length > 0;
	}

	@action
	toggleApproval(option) {
		const currentApproved = [...this.approvedOptions];
		const index = currentApproved.indexOf(option);

		if (index > -1) {
			// Remove if already approved
			currentApproved.splice(index, 1);
		} else {
			// Add if not approved
			currentApproved.push(option);
		}

		this.approvedOptions = currentApproved;
	}

	isApproved = (option)=>{
		return this.approvedOptions.includes(option);
	}

	@action
	async submitResponse() {
		if (!this.hasSelections || this.isSubmitting) return;

		this.isSubmitting = true;

		try {
			const responseData = {
				question: this.args.question.id,
				approved_options: this.approvedOptions,
				session_id: this.args.sessionId,
				device_id: this.args.deviceId,
			};

			await this.responseTracker.saveResponse(
				'approval-voting-response',
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
