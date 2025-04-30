import type { WithContext, FAQPage, Question, Answer } from 'schema-dts';
import { GoFlowSchema } from '../base/GoFlowSchema';

interface FAQItem {
  question: string;
  answer: string;
}

type FAQQuestion = Question & {
  acceptedAnswer: Answer;
};

export class FAQSchema extends GoFlowSchema<FAQPage> {
  constructor(questions: FAQItem[]) {
    super();
    this.setType('FAQPage')
        .setId('https://goflow.plumbing/faqs#webpage')
        .addProperty('mainEntity', questions.map(q => ({
          '@type': 'Question',
          'name': q.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': q.answer
          }
        } as FAQQuestion)));
  }

  public build(): WithContext<FAQPage> {
    return super.build();
  }
}
