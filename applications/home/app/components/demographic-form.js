import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class DemographicForm extends Component {
	@tracked gender = '';
	@tracked age = '';
	@tracked caste = '';
	@tracked isVisible = true;

	@action
	updateField(field, event) {
		this[field] = event.target.value;
	}

	@action
	submitDemographics() {
		const demographics = {
			gender: this.gender.trim(),
			age: this.age.trim(),
			caste: this.caste.trim(),
		};

		this.isVisible = false;

		if (this.args.onComplete) {
			this.args.onComplete(demographics);
		}
	}

	@action
	skipDemographics() {
		this.isVisible = false;

		if (this.args.onComplete) {
			this.args.onComplete({});
		}
	}

	get hasAnyData() {
		return this.gender.trim() || this.age.trim() || this.caste.trim();
	}
}
