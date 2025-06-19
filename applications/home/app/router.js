import EmberRouter from '@ember/routing/router';
import config from 'home/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('session', { path: '/session/:session_id' });
  this.route('results', { path: '/results/:question_id' });
  this.route('admin');
});
