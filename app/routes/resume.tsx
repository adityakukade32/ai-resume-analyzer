
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import Navbar from "~/components/Navbar";
import { usePuterStore } from "~/lib/puter";
import ScoreCircle from "~/components/ScoreCircle";
import { resumes } from "../../constants";

export default function ResumeDetail() {
    const { id } = useParams();
    const { kv } = usePuterStore();
    const [resume, setResume] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResume = async () => {
            if (!id) return;

            // Check for mock data in constants first
            const mockResume = resumes.find((r) => r.id === id);
            if (mockResume) {
                setResume(mockResume);
                setLoading(false);
                return;
            }

            // Check KV storage (for uploaded resumes)
            try {
                // kv.get usually returns string or null
                const data = await kv.get(`resume:${id}`);
                if (data) {
                    try {
                        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
                        setResume(parsed);
                    } catch (e) {
                        console.error("Failed to parse resume data", e);
                    }
                }
            } catch (error) {
                console.error("Error fetching resume from KV", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResume();
    }, [id, kv]);

    if (loading) return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
            <Navbar />
            <div className="flex justify-center items-center h-[calc(100vh-80px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        </main>
    );

    if (!resume) return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
            <Navbar />
            <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Resume Not Found</h1>
                <p className="text-gray-600">The resume you are looking for does not exist or has been deleted.</p>
                <Link to="/" className="primary-button">Back to Home</Link>
            </div>
        </main>
    );

    const { companyName, jobTitle, feedback, imagePath } = resume;

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 md:p-8 animate-in fade-in duration-500">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8 border-b pb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{companyName}</h1>
                            <h2 className="text-xl text-gray-600 font-medium">{jobTitle}</h2>
                        </div>
                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg shadow-inner">
                            <div className="text-right">
                                <p className="text-sm text-gray-500 uppercase font-semibold">Overall Score</p>
                                <div className="flex items-end justify-end gap-1">
                                    <p className="text-3xl font-bold text-gray-900">{feedback.overallScore}</p>
                                    <span className="text-gray-400 text-lg mb-1">/100</span>
                                </div>
                            </div>
                            <div className="w-16 h-16 flex-shrink-0">
                                <ScoreCircle score={feedback.overallScore} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Resume Image */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24">
                                <div className="bg-gray-100 rounded-lg overflow-hidden shadow-md border border-gray-200 aspect-[1/1.4]">
                                    {imagePath ? (
                                        <img
                                            src={imagePath}
                                            alt="Resume Preview"
                                            className="w-full h-full object-contain bg-white"
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = "/images/pdf-placeholder.png";
                                                // If placeholder also fails, show icon
                                                if (e.currentTarget.src.includes("pdf-placeholder")) {
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                }
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-8">
                                            <img src="/icons/document.svg" className="w-16 h-16 opacity-50 mb-4" alt="" />
                                            <p>No Preview Available</p>
                                        </div>
                                    )}
                                    {/* Fallback container if image fails or path is missing */}
                                    <div className={`hidden w-full h-full flex flex-col items-center justify-center text-gray-400 p-8 bg-gray-50`}>
                                        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                                            <span className="text-2xl font-bold text-gray-400">PDF</span>
                                        </div>
                                        <p>Preview Unavailable</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Feedback Details */}
                        <div className="lg:col-span-2 space-y-6">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Detailed Analysis</h3>

                            {/* Tone & Style */}
                            <FeedbackSection title="Tone & Style" data={feedback.toneAndStyle} color="blue" />

                            {/* ATS Optimization */}
                            <FeedbackSection title="ATS Optimization" data={feedback.ATS} color="green" />

                            {/* Content Quality */}
                            <FeedbackSection title="Content Quality" data={feedback.content} color="purple" />

                            {/* Structure & Layout */}
                            <FeedbackSection title="Structure & Layout" data={feedback.structure} color="orange" />

                            {/* Skills Match */}
                            <FeedbackSection title="Skills Match" data={feedback.skills} color="teal" />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

// Helper component for feedback sections
const FeedbackSection = ({ title, data, color }: any) => {
    if (!data) return null;

    const colors: Record<string, string> = {
        blue: "text-blue-700 bg-blue-50 border-blue-100",
        green: "text-green-700 bg-green-50 border-green-100",
        purple: "text-purple-700 bg-purple-50 border-purple-100",
        orange: "text-orange-700 bg-orange-50 border-orange-100",
        teal: "text-teal-700 bg-teal-50 border-teal-100",
    };

    const themeClass = colors[color] || colors.blue;

    return (
        <section className={`rounded-lg border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md ${themeClass.split(' ')[2]}`}>
            <div className={`px-6 py-4 flex justify-between items-center ${themeClass}`}>
                <h3 className="text-lg font-bold flex items-center gap-2">
                    {title}
                </h3>
                <span className="px-3 py-1 bg-white/80 rounded-full text-sm font-bold shadow-sm backdrop-blur-sm">
                    {data.score} / 100
                </span>
            </div>
            <div className="p-6 bg-white">
                {data.tips && data.tips.length > 0 ? (
                    <div className="space-y-4">
                        {data.tips.map((tip: any, idx: number) => (
                            <div key={idx} className="flex gap-4 items-start group">
                                <div className={`mt-1 min-w-[24px] h-6 rounded-full flex items-center justify-center text-xs text-white font-bold shadow-sm flex-shrink-0
                    ${tip.type === 'good' ? 'bg-green-500' : 'bg-amber-500'}`}>
                                    {tip.type === 'good' ? '✓' : '!'}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{tip.tip}</p>
                                    {tip.explanation && <p className="text-sm text-gray-600 mt-1 leading-relaxed">{tip.explanation}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 italic flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                        No specific improvements suggested for this section.
                    </p>
                )}
            </div>
        </section>
    );
};
