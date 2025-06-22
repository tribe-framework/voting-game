import { helper } from '@ember/component/helper';

export default helper(function getScenarioComponent([scenario]) {
  const componentMap = {
    simple_choice: 'simple-choice-response',
    choice_overload: 'choice-overload-response',
    ranking: 'ranking-response',
    point_allocation: 'point-allocation-response',
    approval_voting: 'approval-voting-response',
  };

  return componentMap[scenario] || 'simple-choice-response';
});
