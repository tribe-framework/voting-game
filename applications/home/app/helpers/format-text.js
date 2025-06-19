import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/template';

export default helper(function formatText([text]) {
  if (!text) return '';

  // Basic text formatting - convert line breaks to HTML
  const formatted = text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');

  return htmlSafe(formatted);
});
