// src/components/elearning/quiz/QuizQuestion.tsx
import type { QuizOptionItem } from '../../../service/quiz/quiz.types';
import { RichTextDisplay } from '../../ui/RichTextEditor/RichTextDisplay';

type Props = {
  question: {
    id: number;
    content: string;
    questionType: string;
    options: QuizOptionItem[];
  };
  index: number;
  selectedAnswers: string[];
  onAnswerChange: (questionId: number, option: string, questionType: string) => void;
};

export function QuizQuestion({ question, index, selectedAnswers, onAnswerChange }: Props) {
  return (
    <div className="rounded-3xl border border-slate-100 p-5 bg-white shadow-sm">
      {/* Question Header */}
      <div className="font-bold text-slate-900 text-sm sm:text-base flex items-start gap-2">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#49BBBD] text-white text-xs font-bold shrink-0 mt-0.5">
          {index + 1}
        </span>
        {/* FIXED [CRITICAL]: dùng RichTextDisplay thay vì dangerouslySetInnerHTML. */}
        <RichTextDisplay
          content={question.content}
          prose={false}
          className="inline prose prose-slate max-w-none prose-p:inline prose-p:m-0"
        />
      </div>

      {/* Options */}
      <div className="mt-4 grid gap-2.5 md:grid-cols-2">
        {question.options.map((option: QuizOptionItem) => (
          <label
            key={option.label}
            className={`flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
              selectedAnswers.includes(option.label)
                ? 'bg-cyan-50 text-cyan-700 border-2 border-cyan-400 shadow-sm'
                : 'bg-slate-50 text-slate-600 border-2 border-transparent hover:bg-slate-100'
            }`}
          >
            <input
              type={question.questionType === 'MULTIPLE_CHOICE' ? 'checkbox' : 'radio'}
              name={`question-${question.id}`}
              checked={selectedAnswers.includes(option.label)}
              onChange={() => onAnswerChange(question.id, option.label, question.questionType)}
              className="h-4 w-4 accent-cyan-500 shrink-0 cursor-pointer"
            />
            <span className="flex items-center gap-2">
              <span className="font-bold shrink-0">{option.label}.</span>
              <span>{option.content}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}