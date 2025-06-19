import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class QrDisplay extends Component {
	@tracked qrCodeUrl = '';

	constructor() {
		super(...arguments);
		this.generateQRCode();
	}

	generateQRCode() {
		if (this.args.sessionUrl) {
			// Using QR Server API for generating QR codes
			const size = '300x300';
			const data = encodeURIComponent(this.args.sessionUrl);
			this.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}&data=${data}&margin=10`;
		}
	}

	get sessionUrl() {
		return this.args.sessionUrl || '';
	}

	get shortUrl() {
		if (!this.sessionUrl) return '';

		try {
			const url = new URL(this.sessionUrl);
			return url.hostname + url.pathname;
		} catch {
			return this.sessionUrl;
		}
	}
}
