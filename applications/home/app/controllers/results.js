import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ResultsController extends Controller {
	@service store;
	@service('realtime-sync') realtimeSync;

	@tracked question = null;
	@tracked allResponses = {};
	@tracked analysisData = null;
	@tracked isLoading = false;
	@tracked processedData = {};

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

	get totalResponses() {
		return Object.values(this.allResponses).reduce((total, responses) => {
			return total + (responses?.length || 0);
		}, 0);
	}

	get hasAnyData() {
		return this.totalResponses > 0;
	}

	get keyFindings() {
		if (!this.hasAnyData) return [];

		const findings = [];

		// Consistency across methods
		const consistency = this.calculateConsistency();
		if (consistency < 0.7) {
			findings.push(
				`Low consistency (${Math.round(consistency * 100)}%) across voting methods suggests preference instability`,
			);
		} else {
			findings.push(
				`High consistency (${Math.round(consistency * 100)}%) indicates stable preferences across methods`,
			);
		}

		// Choice overload effect
		const overloadEffect = this.detectChoiceOverload();
		if (overloadEffect.detected) {
			findings.push(`Choice overload detected: ${overloadEffect.description}`);
		}

		// Response time patterns
		const timePatterns = this.analyzeResponseTimes();
		if (timePatterns.significant) {
			findings.push(`${timePatterns.description}`);
		}

		return findings;
	}

	@action
	processResults() {
		const processed = {};

		this.scenarios.forEach((scenario) => {
			const responses = this.allResponses[scenario.responseType] || [];
			processed[scenario.key] = {
				title: scenario.title,
				responses: responses,
				count: responses.length,
				avgTime: this.calculateAverageTime(responses),
				preferences: this.processPreferences(responses, scenario.key),
			};
		});

		this.processedData = processed;
	}

	calculateAverageTime(responses) {
		if (!responses.length) return 0;

		const totalTime = responses.reduce(
			(sum, r) => sum + (r.response_time_seconds || 0),
			0,
		);
		return Math.round((totalTime / responses.length) * 100) / 100;
	}

	processPreferences(responses, scenario) {
		if (!responses.length) return [];

		switch (scenario) {
			case 'simple_choice':
			case 'choice_overload':
				return this.processChoicePreferences(responses);
			case 'ranking':
				return this.processRankingPreferences(responses);
			case 'point_allocation':
				return this.processPointPreferences(responses);
			case 'approval_voting':
				return this.processApprovalPreferences(responses);
			default:
				return [];
		}
	}

	processChoicePreferences(responses) {
		const counts = {};
		responses.forEach((r) => {
			if (r.selected_option) {
				counts[r.selected_option] = (counts[r.selected_option] || 0) + 1;
			}
		});

		return Object.entries(counts)
			.map(([option, count]) => ({
				option,
				count,
				percentage: Math.round((count / responses.length) * 100),
			}))
			.sort((a, b) => b.count - a.count);
	}

	processRankingPreferences(responses) {
		const topChoices = {};
		responses.forEach((r) => {
			if (r.rankings && r.rankings.length > 0) {
				const topChoice = r.rankings[0];
				topChoices[topChoice] = (topChoices[topChoice] || 0) + 1;
			}
		});

		return Object.entries(topChoices)
			.map(([option, count]) => ({
				option,
				count,
				percentage: Math.round((count / responses.length) * 100),
			}))
			.sort((a, b) => b.count - a.count);
	}

	processPointPreferences(responses) {
		const totals = {};
		responses.forEach((r) => {
			if (r.point_distribution && Array.isArray(r.point_distribution)) {
				r.point_distribution.forEach((item) => {
					totals[item.option] = (totals[item.option] || 0) + (item.points || 0);
				});
			}
		});

		const totalPoints = Object.values(totals).reduce(
			(sum, points) => sum + points,
			0,
		);
		return Object.entries(totals)
			.map(([option, points]) => ({
				option,
				points,
				percentage:
					totalPoints > 0 ? Math.round((points / totalPoints) * 100) : 0,
			}))
			.sort((a, b) => b.points - a.points);
	}

	processApprovalPreferences(responses) {
		const approvals = {};
		responses.forEach((r) => {
			if (r.approved_options && Array.isArray(r.approved_options)) {
				r.approved_options.forEach((option) => {
					approvals[option] = (approvals[option] || 0) + 1;
				});
			}
		});

		return Object.entries(approvals)
			.map(([option, count]) => ({
				option,
				count,
				percentage: Math.round((count / responses.length) * 100),
			}))
			.sort((a, b) => b.count - a.count);
	}

	calculateConsistency() {
		// Compare top choices across methods
		const topChoices = {};

		Object.entries(this.processedData).forEach(([scenario, data]) => {
			if (data.preferences.length > 0) {
				topChoices[scenario] = data.preferences[0].option;
			}
		});

		const choices = Object.values(topChoices);
		if (choices.length < 2) return 1;

		const mostCommon = choices.reduce((a, b, _, arr) =>
			arr.filter((v) => v === a).length >= arr.filter((v) => v === b).length
				? a
				: b,
		);

		return (
			choices.filter((choice) => choice === mostCommon).length / choices.length
		);
	}

	detectChoiceOverload() {
		const simpleChoice = this.processedData.simple_choice;
		const choiceOverload = this.processedData.choice_overload;

		if (!simpleChoice.count || !choiceOverload.count) {
			return { detected: false };
		}

		const timeIncrease =
			((choiceOverload.avgTime - simpleChoice.avgTime) / simpleChoice.avgTime) *
			100;

		if (timeIncrease > 20) {
			return {
				detected: true,
				description: `Adding one option increased decision time by ${Math.round(timeIncrease)}%`,
			};
		}

		return { detected: false };
	}

	analyzeResponseTimes() {
		const times = Object.values(this.processedData)
			.map((d) => d.avgTime)
			.filter((t) => t > 0);

		if (times.length < 2) return { significant: false };

		const max = Math.max(...times);
		const min = Math.min(...times);
		const ratio = max / min;

		if (ratio > 2) {
			return {
				significant: true,
				description: `Response times vary significantly (${min}s to ${max}s), indicating different cognitive loads`,
			};
		}

		return { significant: false };
	}

	@action
	async loadAnalysis() {
		try {
			const analyses = await this.store.query('analysis', {
				question: this.question.id,
			});
			this.analysisData = analyses.get('firstObject');
		} catch (error) {
			console.warn('Failed to load analysis:', error);
		}
	}

	@action
	async refreshData() {
		this.isLoading = true;

		try {
			await this.realtimeSync.forceSync();

			// Reload all response data
			const responseTypes = [
				'simple-choice-response',
				'choice-overload-response',
				'ranking-response',
				'point-allocation-response',
				'approval-voting-response',
			];

			const updatedResponses = {};

			for (const responseType of responseTypes) {
				try {
					const responses = await this.store.query(responseType, {
						question: this.question.id,
						reload: true,
					});
					updatedResponses[responseType] = responses.toArray();
				} catch (error) {
					console.warn(`Failed to reload ${responseType}:`, error);
					updatedResponses[responseType] =
						this.allResponses[responseType] || [];
				}
			}

			this.allResponses = updatedResponses;
			this.processResults();

			await this.loadAnalysis();
		} catch (error) {
			console.error('Failed to refresh data:', error);
		} finally {
			this.isLoading = false;
		}
	}
}
