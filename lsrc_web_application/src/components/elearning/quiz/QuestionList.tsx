// src/components/elearning/quiz/QuestionList.tsx
import { FaPlus, FaEdit, FaTrash, FaGripVertical } from 'react-icons/fa';
import { Panel } from '../ui/Panel';
import type { Quiz } from '../../../types/quiz.types';
import type { Question } from '../../../types/question.types';

type Props = {
  quiz: Quiz;
  questions: Question[];
  onCreate: () => void;
  onEdit: (question: Question) => void;
  onDelete: (question: Question) => void;
};

export function QuestionList({ quiz, questions, onCreate, onEdit, onDelete }: Props) {
  return (
    <Panel className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900">{quiz.title}</h3>
          <p className="text-xs text-slate-400">
            {questions.length} câu hỏi • Điểm đậu: {quiz.passingScore}%
          </p>
        </div>
        <button 
          onClick={onCreate} 
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-600"
        >
          <FaPlus size={12} /> Thêm câu hỏi
        </button>
      </div>
      {questions.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">Chưa có câu hỏi nào</p>
      ) : (
        <div className="space-y-3">
          {questions.map((q, index) => (
            <div 
              key={q.id} 
              className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition"
            >
              <FaGripVertical className="text-slate-300 mt-1 flex-shrink-0" size={14} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{index + 1}. {q.content}</p>
                <p className="text-xs text-slate-400 mt-1">{q.questionType} • {q.points} điểm</p>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => onEdit(q)} 
                  className="p-1.5 rounded text-slate-400 hover:text-indigo-500 hover:bg-indigo-50"
                >
                  <FaEdit size={12} />
                </button>
                <button 
                  onClick={() => onDelete(q)} 
                  className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50"
                >
                  <FaTrash size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}