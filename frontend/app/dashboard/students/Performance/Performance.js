import { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  TimeScale,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";
import api from "@/api";

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  TimeScale,
  Tooltip,
  Legend
);

export default function StudentAnalytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/tests/analytics/student/").then((res) => setData(res.data));
  }, []);

  if (!data)
    return <div className="text-center py-10">Loading analytics...</div>;

  const subjectLabels = data.subject_performance.map(
    (item) => item.test__subject
  );
  const subjectScores = data.subject_performance.map((item) => item.avg_score);

  const timeLabels = data.performance_over_time.map(
    (item) => new Date(item.attempted_at)
  );
  const timeScores = data.performance_over_time.map((item) => item.score);

  const challengeQuestions = data.challenging_questions.map(
    (item) => item.question__question
  );
  const challengeAttempts = data.challenging_questions.map(
    (item) => item.correct_attempts
  );

  return (
    <div className="p-6 space-y-10">
      {/* <h2 className="text-3xl font-bold text-gray-800">Student Analytics</h2> */}

      {/* Top Metrics */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow flex flex-col justify-center items-center">
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Average Score
          </h3>
          <p className="text-4xl font-bold text-blue-600">
            {data.average_score.toFixed(2)}
          </p>
        </div>
      </div> */}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Subject Performance */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-4 text-blue-700">
            Subject Performance
          </h3>
          <Bar
            data={{
              labels: subjectLabels,
              datasets: [
                {
                  label: "Avg Score",
                  data: subjectScores,
                  backgroundColor: subjectScores.map(
                    () =>
                      `hsl(${Math.floor(Math.random() * 360)}, 70%, ${
                        40 + Math.floor(Math.random() * 20)
                      }%)`
                  ),
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
              },
              scales: {
                y: { beginAtZero: true },
              },
            }}
          />
        </div>

        {/* Performance Over Time */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-4 text-blue-700">
            Performance Over Time
          </h3>
          <Line
            data={{
              labels: timeLabels,
              datasets: [
                {
                  label: "Score",
                  data: timeScores,
                  fill: false,
                  borderColor: "#10b981",
                  tension: 0.3,
                },
              ],
            }}
            options={{
              responsive: true,
              scales: {
                x: {
                  type: "time",
                  time: {
                    unit: "day",
                  },
                  title: {
                    display: true,
                    text: "Date",
                  },
                },
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: "Score",
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Challenging Questions */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-semibold mb-4 text-blue-700">
          Challenging Questions
        </h3>
        <Bar
          data={{
            labels: challengeQuestions,
            datasets: [
              {
                label: "Correct Attempts",
                data: challengeAttempts,
                backgroundColor: challengeQuestions.map(
                  () =>
                    `hsl(${Math.floor(Math.random() * 360)}, 70%, ${
                      40 + Math.floor(Math.random() * 20)
                    }%)`
                ),
              },
            ],
          }}
          options={{
            indexAxis: "y",
            responsive: true,
            plugins: {
              legend: { display: false },
            },
            scales: {
              x: { beginAtZero: true },
            },
          }}
        />
      </div>
    </div>
  );
}
