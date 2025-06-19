import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class QuestionDisplay extends Component {
	@service store;

	@tracked currentQuestion = this.args.question;
	@tracked timeStarted = new Date();

	get scenarioTitle() {
		const titles = {
			simple_choice: 'Simple Choice',
			choice_overload: 'Choice Overload',
			ranking: 'Ranking',
			point_allocation: 'Point Allocation',
			approval_voting: 'Approval Voting',
		};

		return titles[this.currentQuestion.modules?.active_scenario] || 'Voting Exercise';
	}

	get scenarioDescription() {
		const descriptions = {
			simple_choice: 'Select one option from the choices below.',
			choice_overload: 'Select one option from the choices below.',
			ranking: 'Drag and drop to rank all options from best to worst.',
			point_allocation:
				'Distribute 10 points among the options based on your preferences.',
			approval_voting:
				'Select all options you find acceptable (you can choose multiple).',
		};

		return descriptions[this.currentQuestion.modules?.active_scenario] || '';
	}
}
