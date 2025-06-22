import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class ScenarioChart extends Component {
	@tracked chartData = [];

	constructor() {
		super(...arguments);
		this.processData();
	}

	processData() {
		if (!this.args.responses || !Array.isArray(this.args.responses)) {
			this.chartData = [];
			return;
		}

		const responses = this.args.responses;
		const scenario = this.args.scenario;

		// Process data based on scenario type
		switch (scenario) {
			case 'simple_choice':
			case 'choice_overload':
				this.chartData = this.processChoiceData(responses);
				break;
			case 'ranking':
				this.chartData = this.processRankingData(responses);
				break;
			case 'point_allocation':
				this.chartData = this.processPointData(responses);
				break;
			default:
				this.chartData = [];
		}
	}

	processChoiceData(responses) {
		const counts = {};
		responses.forEach((response) => {
			const option = response.modules.selected_option;
			if (option) {
				counts[option] = (counts[option] || 0) + 1;
			}
		});

		return Object.entries(counts)
			.map(([label, value]) => ({ label, value }))
			.sort((a, b) => b.value - a.value);
	}

	processRankingData(responses) {
		const scores = {};
		responses.forEach((response) => {
			if (response.modules.rankings && Array.isArray(response.modules.rankings)) {
				response.modules.rankings.forEach((option, index) => {
					const score = response.modules.rankings.length - index; // Higher score for better rank
					scores[option] = (scores[option] || 0) + score;
				});
			}
		});

		return Object.entries(scores)
			.map(([label, value]) => ({ label, value }))
			.sort((a, b) => b.value - a.value);
	}

	processPointData(responses) {
		const totals = {};
		responses.forEach((response) => {
			if (
				response.modules.point_distribution &&
				Array.isArray(response.modules.point_distribution)
			) {
				response.modules.point_distribution.forEach((item) => {
					if (item.option && typeof item.points === 'number') {
						totals[item.option] = (totals[item.option] || 0) + item.points;
					}
				});
			}
		});

		return Object.entries(totals)
			.map(([label, value]) => ({ label, value }))
			.sort((a, b) => b.value - a.value);
	}

	processApprovalData(responses) {
		const counts = {};
		responses.forEach((response) => {
			if (
				response.modules.approved_options &&
				Array.isArray(response.modules.approved_options)
			) {
				response.modules.approved_options.forEach((option) => {
					counts[option] = (counts[option] || 0) + 1;
				});
			}
		});

		return Object.entries(counts)
			.map(([label, value]) => ({ label, value }))
			.sort((a, b) => b.value - a.value);
	}

	get maxValue() {
		if (!this.chartData.length) return 0;
		return Math.max(...this.chartData.map((d) => d.value));
	}

	get averageResponseTime() {
		if (!this.args.responses || !this.args.responses.length) return 0;

		const totalTime = this.args.responses.reduce((sum, response) => {
			return sum + (response.modules.response_time_seconds || 0);
		}, 0);

		return Math.round((totalTime / this.args.responses.length) * 100) / 100;
	}
}
