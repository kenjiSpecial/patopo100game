import React from 'react';
import { ScoreReport } from '../types';

interface ResultModalProps {
  report: ScoreReport;
  onRestart: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({ report, onRestart }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-600 rounded-xl p-6 max-w-md w-full text-white shadow-2xl animate-fade-in-up">
        <h2 className="text-3xl font-bold mb-6 text-center text-cyan-400">
          建築評価レポート
        </h2>

        <div className="space-y-4 mb-8">
          <ScoreItem
            label="シンメトリー (左右対称性)"
            score={report.symmetryScore}
            detail={report.symmetryDetails}
          />
          <ScoreItem
            label="滑らかさ (地形の起伏)"
            score={report.smoothnessScore}
            detail={report.smoothnessDetails}
          />
          <ScoreItem
            label="空洞ペナルティ (穴の数)"
            score={-report.cavityPenalty}
            detail={report.cavityDetails}
            isNegative
          />
          <ScoreItem
            label="色彩調和 (同色隣接)"
            score={report.colorHarmonyScore}
            detail={report.colorHarmonyDetails}
          />

          <div className="border-t border-gray-600 pt-4 mt-4">
            <div className="flex justify-between items-end">
              <span className="text-xl font-bold text-gray-300">総合スコア</span>
              <span className="text-4xl font-black text-yellow-400">{report.totalScore}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors text-lg shadow-lg"
        >
          次の作品を作る
        </button>
      </div>
    </div>
  );
};

const ScoreItem: React.FC<{
  label: string;
  score: number;
  detail: string;
  isNegative?: boolean;
}> = ({ label, score, detail, isNegative }) => (
  <div className="bg-gray-700/50 p-3 rounded-lg">
    <div className="flex justify-between text-sm text-gray-400 mb-1">
      <span>{label}</span>
      <span>{detail}</span>
    </div>
    <div className={`text-right font-mono text-xl font-bold ${isNegative ? 'text-red-400' : 'text-green-400'}`}>
      {score > 0 && !isNegative ? '+' : ''}{score}
    </div>
  </div>
);

