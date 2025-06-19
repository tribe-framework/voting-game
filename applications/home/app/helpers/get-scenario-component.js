import { helper } from '@ember/component/helper';

export default helper(function getScenarioComponent([scenario]) {
  const componentMap = {
    simple_choice: 'simple-choice-form',
    choice_overload: 'choice-overload-form',
    ranking: 'ranking-form',
    point_allocation: 'point-allocation-form',
    approval_voting: 'approval-voting-form',
  };

  return componentMap[scenario] || 'simple-choice-form';
});
