import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ResponseTrackerService extends Service {
	@service store;

	@tracked responseStartTime = null;
	@tracked currentResponse = null;

	@action
	startTimer() {
		this.responseStartTime = new Date();
	}

	@action
	calculateResponseTime() {
		if (!this.responseStartTime) return 0;

		const endTime = new Date();
		const responseTime = (endTime - this.responseStartTime) / 1000; // seconds
		return parseFloat(responseTime.toFixed(2));
	}

	@action
	async saveResponse(responseType, responseData, demographics = {}) {
		try {
			const responseTime = this.calculateResponseTime();

			const formattedData = this.formatResponseData({
				...responseData,
				response_time_seconds: responseTime,
				gender: demographics.gender || '',
				age: demographics.age || '',
				caste: demographics.caste || '',
				timestamp: new Date().toISOString(),
			});

			const response = this.store.createRecord(responseType, formattedData);
			await response.save();

			this.currentResponse = response;
			this.responseStartTime = null;

			return response;
		} catch (error) {
			console.error('Error saving response:', error);
			throw error;
		}
	}

	formatResponseData(data) {
		// Ensure data matches the expected format for each response type
		const formatted = { ...data };

		// Convert arrays to proper format if needed
		if (formatted.rankings && Array.isArray(formatted.rankings)) {
			formatted.rankings = formatted.rankings;
		}

		if (
			formatted.point_distribution &&
			Array.isArray(formatted.point_distribution)
		) {
			formatted.point_distribution = formatted.point_distribution;
		}

		if (
			formatted.approved_options &&
			Array.isArray(formatted.approved_options)
		) {
			formatted.approved_options = formatted.approved_options;
		}

		return formatted;
	}

	@action
	resetTimer() {
		this.responseStartTime = null;
		this.currentResponse = null;
	}
}
