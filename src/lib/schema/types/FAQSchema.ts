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
  public static async create(questions: FAQItem[], pageUrl?: string): Promise<FAQSchema> {
    return new FAQSchema(questions, pageUrl);
  }
  constructor(questions: FAQItem[], pageUrl?: string) {
    super();
    const schemaId = pageUrl ? `${pageUrl}#faq` : 'https://goflow.plumbing/faqs#webpage';
    this.setType('FAQPage')
        .setId(schemaId)
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
