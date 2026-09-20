// src/components/elearning/quiz/QuizList.tsx
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { Panel } from '../ui/Panel';
import type { Quiz } from '../../../types/quiz.types';

type Props = {
  quizzes: Quiz[];
  selectedQuiz: Quiz | null;
  onSelect: (quiz: Quiz) => void;
  onCreate: () => void;
  onEdit: (quiz: Quiz) => void;
  onDelete: (quiz: Quiz) => void;
};

export function QuizList({ quizzes, selectedQuiz, onSelect, onCreate, onEdit, onDelete }: Props) {
  return (
    <Panel className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900">Danh sách Quiz</h3>
        <button onClick={onCreate} className="p-2 rounded-lg text-cyan-600 hover:bg-cyan-50">
          <FaPlus size={14} />
        </button>
      </div>
      {quizzes.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">Chưa có quiz nào</p>
      ) : (
        <div className="space-y-2">
          {quizzes.map((quiz) => (
            <div 
              key={quiz.id} 
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition ${
                selectedQuiz?.id === quiz.id 
                  ? 'bg-cyan-50 border border-cyan-200' 
                  : 'hover:bg-slate-50 border border-transparent'
              }`} 
              onClick={() => onSelect(quiz)}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-800 truncate">{quiz.title}</p>
                <p className="text-xs text-slate-400">
                  {quiz.totalQuestions} câu • {quiz.status === 'PUBLISHED' ? '✅ Đã xuất bản' : '📝 Nháp'}
                </p>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); onEdit(quiz); }} 
                  className="p-1.5 rounded text-slate-400 hover:text-indigo-500 hover:bg-indigo-50"
                >
                  <FaEdit size={12} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(quiz); }} 
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