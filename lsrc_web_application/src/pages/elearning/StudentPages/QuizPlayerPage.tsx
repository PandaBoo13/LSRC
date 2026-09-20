import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaFlag,
  FaArrowRight,
  FaArrowLeft as FaArrowLeftIcon,
} from 'react-icons/fa';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

const questions: Question[] = [
  {
    id: 1,
    question: '_HOOK nào được sử dụng để quản lý state trong React?',
    options: ['useEffect', 'useState', 'useContext', 'useReducer'],
    correctAnswer: 1,
  },
  {
    id: 2,
    question: 'JSX là gì?',
    options: [
      'JavaScript XML',
      'Java Syntax Extension',
      'JSON XML',
      'JavaScript Extension',
    ],
    correctAnswer: 0,
  },
  {
    id: 3,
    question: 'Props trong React được sử dụng để làm gì?',
    options: [
      'Quản lý state',
      'Truyền dữ liệu từ parent sang child',
      'Xử lý sự kiện',
      'Tạo component mới',
    ],
    correctAnswer: 1,
  },
  {
    id: 4,
    question: 'Lifecycle method nào chạy sau khi component render xong?',
    options: ['componentDidMount', 'componentWillUnmount', 'shouldComponentUpdate', 'render'],
    correctAnswer: 0,
  },
  {
    id: 5,
    question: 'Virtual DOM trong React hoạt động như thế nào?',
    options: [
      'Thao tác trực tiếp với DOM thật',
      'Tạo bản sao DOM trong bộ nhớ',
      'Bỏ qua việc cập nhật DOM',
      'Chỉ cập nhật khi có sự thay đổi',
    ],
    correctAnswer: 1,
  },
];

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [showResult, setShowResult] = useState(false);
  const [flagged, setFlagged] = useState<Set<number>>(new Set());

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const toggleFlag = () => {
    const newFlagged = new Set(flagged);
    if (newFlagged.has(currentQuestion)) {
      newFlagged.delete(currentQuestion);
    } else {
      newFlagged.add(currentQuestion);
    }
    setFlagged(newFlagged);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });
    return correct;
  };

  const handleSubmit = () => {
    setShowResult(true);
  };

  if (showResult) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 60;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
            passed ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {passed ? (
              <FaCheckCircle className="text-4xl text-green-500" />
            ) : (
              <FaTimesCircle className="text-4xl text-red-500" />
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {passed ? 'Chúc mừng!' : 'Cần cố gắng thêm!'}
          </h2>
          <p className="text-gray-500 mb-6">
            {passed ? 'Bạn đã vượt qua bài kiểm tra' : 'Bạn chưa đạt yêu cầu'}
          </p>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="text-5xl font-bold text-cyan-600 mb-2">{percentage}%</div>
            <p className="text-gray-500">
              {score}/{questions.length} câu đúng
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to="/my-courses"
              className="block w-full bg-cyan-500 text-white py-3 rounded-lg font-semibold hover:bg-cyan-600 transition-colors"
            >
              Tiếp tục học
            </Link>
            <button
              onClick={() => {
                setShowResult(false);
                setCurrentQuestion(0);
                setAnswers(new Array(questions.length).fill(null));
              }}
              className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Làm lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/my-courses" className="text-gray-500 hover:text-gray-700">
              <FaArrowLeft />
            </Link>
            <div>
              <h1 className="font-semibold text-gray-800">Bài kiểm tra: React Fundamentals</h1>
              <p className="text-sm text-gray-500">
                Câu {currentQuestion + 1}/{questions.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-500">
              <FaClock />
              <span>15:00</span>
            </div>
            <button
              onClick={toggleFlag}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm ${
                flagged.has(currentQuestion)
                  ? 'bg-orange-100 text-orange-600'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <FaFlag /> Đánh dấu
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="max-w-4xl mx-auto px-4 pb-4">
          <div className="flex gap-2">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQuestion(i)}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  i === currentQuestion
                    ? 'bg-cyan-500'
                    : answers[i] !== null
                    ? 'bg-green-400'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {questions[currentQuestion].question}
          </h2>

          <div className="space-y-3">
            {questions[currentQuestion].options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  answers[currentQuestion] === i
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    answers[currentQuestion] === i
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {option}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaArrowLeftIcon /> Câu trước
          </button>

          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600"
            >
              Nộp bài <FaCheckCircle />
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-cyan-500 text-white font-semibold hover:bg-cyan-600"
            >
              Câu sau <FaArrowRight />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
