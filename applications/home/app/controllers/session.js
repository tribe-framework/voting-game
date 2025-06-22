import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class SessionController extends Controller {
	@service store;
	@service('response-tracker') responseTracker;
	@service('realtime-sync') realtimeSync;

	@tracked currentQuestion = null;
	@tracked sessionId = "";
	@tracked deviceID = "";
	@tracked activeScenario = 'simple_choice';
	@tracked showResults = false;
	@tracked demographicsCompleted = false;
	@tracked demographics = {};
	@tracked responseSubmitted = false;

	constructor() {
		super(...arguments);
		this.initializeDeviceID();
	}

	initializeDeviceID() {
		// Check if deviceID already exists in localStorage
		let storedDeviceID = localStorage.getItem('deviceID');
		
		if (storedDeviceID) {
			this.deviceID = storedDeviceID;
		} else {
			// Generate a new unique device ID
			this.deviceID = this.generateUniqueDeviceID();
			// Store it in localStorage for persistence
			localStorage.setItem('deviceID', this.deviceID);
		}
	}

	generateUniqueDeviceID() {
		// Generate a unique ID using timestamp + random string + browser fingerprint
		const timestamp = Date.now().toString(36);
		const randomPart = Math.random().toString(36).substring(2, 15);
		const navigatorInfo = navigator.userAgent + navigator.language + screen.width + screen.height;
		const fingerprint = this.simpleHash(navigatorInfo).toString(36);
		
		return `device_${timestamp}_${randomPart}_${fingerprint}`;
	}

	simpleHash(str) {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = ((hash << 5) - hash) + char;
			hash = hash & hash; // Convert to 32-bit integer
		}
		return Math.abs(hash);
	}

	get scenarioModel() {
		const componentMap = {
			simple_choice: 'simple-choice-response',
			choice_overload: 'choice-overload-response',
			ranking: 'ranking-response',
			point_allocation: 'point-allocation-response',
			approval_voting: 'approval-voting-response',
		};

		return componentMap[this.activeScenario] || 'simple-choice-response';
	}

	@action
	async loadQuestion() {
		try {
			if (this.currentQuestion.modules !== undefined) {
				this.activeScenario = this.currentQuestion.modules.active_scenario;
				this.showResults = this.currentQuestion.modules.show_results === 'yes';

				let obj = await this.store.query(this.scenarioModel, { modules: {
						device_id: this.deviceID,
						question: this.currentQuestion.modules.slug,
					}
				});

				if (obj[0] !== undefined && obj[0].id !== undefined) {
					this.responseSubmitted = true;
				} else {
					this.responseSubmitted = false;
				}
			}
		} catch (error) {
			console.error('Failed to load question:', error);
		}
	}

	@action
	async submitResponse() {
		this.responseSubmitted = true;
	}

	@action
	showDemographicsModal() {
		// The demographic form component will handle this
		this.demographicsCompleted = false;
	}

	@action
	onDemographicsComplete(demographics) {
		this.demographics = demographics;
		this.demographicsCompleted = true;

		// Store demographics for use in response submission
		this.responseTracker.currentDemographics = demographics;
	}

	@action
	async toggleResults() {
		await this.loadQuestion();
	}

	@action
	async refreshData() {
		await this.realtimeSync.forceSync();
		await this.loadQuestion();
	}

	@action
	regenerateDeviceID() {
		// Method to regenerate device ID if needed (for testing/debugging)
		this.deviceID = this.generateUniqueDeviceID();
		localStorage.setItem('deviceID', this.deviceID);
	}

	@action
	clearDeviceID() {
		// Method to clear device ID from storage (for testing/debugging)
		localStorage.removeItem('deviceID');
		this.deviceID = "";
	}
}