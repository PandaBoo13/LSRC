// src/components/elearning/quiz/QuizCard.tsx
import { FaChevronDown, FaChevronRight, FaEdit, FaTrash, FaPlus, FaGripVertical, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.bubble.css';
import { Panel } from '../ui/Panel';
import type { Quiz, Question } from '../../../types/quiz.types';

type Props = {
  quiz: Quiz;
  expanded: boolean;
  questions: Question[];
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  onAddQuestion: () => void;
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (question: Question) => void;
};

export function QuizCard({ quiz, expanded, questions, onToggleExpand, onEdit, onDelete, onToggleStatus, onAddQuestion, onEditQuestion, onDeleteQuestion }: Props) {
  return (
    <Panel className="overflow-hidden">
      <div className="p-5 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition" onClick={onToggleExpand}>
        <button className="p-1 rounded-lg hover:bg-slate-200 flex-shrink-0">
          {expanded ? <FaChevronDown size={14} className="text-slate-500" /> : <FaChevronRight size={14} className="text-slate-500" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900">{quiz.title}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${quiz.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {quiz.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Nháp'}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
            <span>{quiz.totalQuestions} câu hỏi</span><span>•</span>
            <span>Điểm đậu: {quiz.passingScore}%</span>
            {quiz.timeLimit && <><span>•</span><span>{quiz.timeLimit} phút</span></>}
            {quiz.maxAttempts && <><span>•</span><span>{quiz.maxAttempts} lần làm</span></>}
          </div>
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={onToggleStatus} className={`p-2 rounded-lg transition ${quiz.status === 'PUBLISHED' ? 'text-amber-500 hover:bg-amber-50' : 'text-green-500 hover:bg-green-50'}`} title={quiz.status === 'PUBLISHED' ? 'Chuyển về nháp' : 'Xuất bản'}>
            {quiz.status === 'PUBLISHED' ? <FaToggleOn size={16} /> : <FaToggleOff size={16} />}
          </button>
          <button onClick={onEdit} className="p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50" title="Sửa quiz"><FaEdit size={14} /></button>
          <button onClick={onDelete} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50" title="Xóa quiz"><FaTrash size={14} /></button>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-slate-100">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-slate-700">Danh sách câu hỏi ({questions.length})</h4>
              <button onClick={onAddQuestion} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 text-white text-xs font-medium hover:bg-cyan-600"><FaPlus size={10} /> Thêm câu hỏi</button>
            </div>
            {questions.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Chưa có câu hỏi nào</p>
            ) : (
              <div className="space-y-2">
                {questions.map((q, index) => (
                  <div key={q.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition group">
                    <FaGripVertical className="text-slate-300 mt-1 flex-shrink-0" size={12} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 flex items-start gap-2">
                        <span className="flex-shrink-0">{index + 1}.</span>
                        <ReactQuill value={q.content} readOnly theme="bubble" className="flex-1 [&_.ql-editor]:p-0 [&_.ql-editor]:text-sm [&_.ql-editor]:font-medium" />
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        <span>{q.questionType === 'SINGLE_CHOICE' ? 'Một đáp án' : q.questionType === 'MULTIPLE_CHOICE' ? 'Nhiều đáp án' : q.questionType === 'TRUE_FALSE' ? 'Đúng/Sai' : 'Trả lời ngắn'}</span>
                        <span>•</span><span>{q.points} điểm</span>
                        {q.explanation && <><span>•</span><span className="text-slate-300">Có giải thích</span></>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => onEditQuestion(q)} className="p-1.5 rounded text-slate-400 hover:text-indigo-500 hover:bg-indigo-50"><FaEdit size={11} /></button>
                      <button onClick={() => onDeleteQuestion(q)} className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50"><FaTrash size={11} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Panel>
  );
}