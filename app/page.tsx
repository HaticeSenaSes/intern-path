"use client";

import { useState, useEffect } from "react";
import { 
  Search, Info, X, Sparkles, BookOpen, User, 
  GraduationCap, Target, TrendingUp, 
  Calendar, ArrowRight, Loader2, Plus, Trash2, Bookmark, LayoutDashboard
} from "lucide-react";

const GEMINI_API_KEY = "AIzaSyCihCk8WD9gTQqTByc8bWvj1NG9p7UrKYM"; 
const COLORS = {
  primary: "#1E3A8A", 
  secondary: "#78350F",
  bg: "#FDFBF7",
};

const callGeminiAI = async (input: string) => {
  const prompt = `Sen Intern-Path asistanısın. '${input}' terimini sadeleştir. MANTIK: [Açıklama] BENZETME: [Örnek]`;
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const logicMatch = aiText.match(/(?:MANTIK|Mantık)[:,\s]*(.*(?:\n(?!(?:BENZETME|Benzetme)).*)*)/i);
    const analogyMatch = aiText.match(/(?:BENZETME|Benzetme)[:,\s]*(.*)/i);
    return {
      logic: logicMatch ? logicMatch[1].trim() : aiText.slice(0, 180),
      analogy: analogyMatch ? analogyMatch[1].trim() : "Benzetme yolda..."
    };
  } catch (error) { return null; }
};

export default function MobileInternApp() {
  const [tab, setTab] = useState("dashboard");
  const [goals, setGoals] = useState<any[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [term, setTerm] = useState("");
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("intern-mobile-v1");
    if (saved) setGoals(JSON.parse(saved));
    else {
      const init = [{ id: 1, title: "Next.js Öğrenimi", note: "App Router yapısı mobil için optimize edildi.", progress: 90, category: "Mobil" }];
      setGoals(init);
      localStorage.setItem("intern-mobile-v1", JSON.stringify(init));
    }
  }, []);

  const save = (data: any[]) => {
    setGoals(data);
    localStorage.setItem("intern-mobile-v1", JSON.stringify(data));
  };

  const addGoal = () => {
    if (!newGoalTitle.trim()) return;
    save([{ id: Date.now(), title: newGoalTitle, note: "", progress: 0, category: "Yeni" }, ...goals]);
    setNewGoalTitle("");
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = term.toLowerCase().trim();
    if (!query) return;
    setIsLoading(true);
    setResult(null);

    const found = goals.find(g => g.title.toLowerCase().includes(query) || g.note.toLowerCase().includes(query));
    if (found && found.note) {
      setResult({ label: found.title, logic: found.note, analogy: "Bu bilgi kendi notlarından getirildi. ✍️", isPersonal: true });
    } else {
      const ai = await callGeminiAI(query);
      setResult(ai ? { label: query.toUpperCase(), ...ai, isPersonal: false } : { label: query.toUpperCase(), logic: "Bulunamadı.", analogy: "Not eklemeyi dene!" });
    }
    setIsLoading(false);
    setTerm("");
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto relative overflow-hidden font-sans" style={{ backgroundColor: COLORS.bg }}>
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-md px-6 pt-10 pb-4 border-b border-zinc-100 flex justify-between items-end">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-900 flex items-center justify-center shadow-md">
            <TrendingUp size={20} className="text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-lg font-bold text-blue-900 leading-none">INTERN-PATH</h1>
            <p className="text-[9px] font-bold text-zinc-400 tracking-widest mt-1 uppercase">Stajyer Paneli</p>
          </div>
        </div>
        <span className="text-[9px] font-black text-amber-800 uppercase bg-amber-100 px-2 py-0.5 rounded-full">Pro</span>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pt-6 pb-32">
        {tab === "dashboard" && (
          <div className="space-y-6">
            <div className="bg-blue-900 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden text-left">
              <div className="relative z-10">
                <p className="text-xs opacity-70">Toplam İlerleme</p>
                <h2 className="text-3xl font-bold mt-1">%{goals.length > 0 ? Math.round(goals.reduce((a,b)=>a+b.progress,0)/goals.length) : 0}</h2>
                <div className="flex items-center gap-2 mt-4 text-[10px] bg-white/10 w-fit px-3 py-1 rounded-full">
                  <Calendar size={12} /> <span>{new Date().toLocaleDateString("tr-TR")}</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <input 
                type="text" placeholder="Yeni bir konu ekle..." 
                className="w-full pl-5 pr-14 py-4 rounded-2xl border-none shadow-md bg-white text-sm outline-none"
                value={newGoalTitle} onChange={(e) => setNewGoalTitle(e.target.value)}
              />
              <button onClick={addGoal} className="absolute right-2 top-2 bottom-2 px-4 bg-blue-900 text-white rounded-xl"><Plus size={20} /></button>
            </div>

            <div className="space-y-4">
              {goals.map(g => (
                <div key={g.id} className="bg-white rounded-[1.8rem] p-5 shadow-sm border border-zinc-50 text-left">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-zinc-800 text-sm flex-1">{g.title}</h4>
                    <button onClick={()=>save(goals.filter(x=>x.id!==g.id))} className="text-zinc-200 hover:text-red-400"><Trash2 size={16}/></button>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-1 bg-zinc-50 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600" style={{ width: `${g.progress}%` }} />
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={()=>save(goals.map(x=>x.id===g.id?{...x,progress:Math.max(0,x.progress-10)}:x))} className="w-6 h-6 bg-zinc-50 rounded-md text-[10px]">-</button>
                      <span className="text-[10px] font-bold text-blue-900">%{g.progress}</span>
                      <button onClick={()=>save(goals.map(x=>x.id===g.id?{...x,progress:Math.min(100,x.progress+10)}:x))} className="w-6 h-6 bg-zinc-50 rounded-md text-[10px]">+</button>
                    </div>
                  </div>
                  <textarea 
                    placeholder="Notlarını buraya yaz..."
                    className="w-full p-3 bg-zinc-50/50 rounded-xl text-xs text-zinc-500 min-h-[80px] outline-none"
                    value={g.note} onChange={(e)=>save(goals.map(x=>x.id===g.id?{...x,note:e.target.value}:x))}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "discover" && (
          <div>
            <div className="text-left mb-6">
                <h2 className="text-2xl font-bold text-blue-900">Akıllı Rehber</h2>
                <p className="text-xs text-zinc-400 mt-1 uppercase font-bold tracking-tighter">Kendi hafızanda veya AI'da ara</p>
            </div>
            <form onSubmit={handleSearch} className="relative mb-8">
              <input 
                type="text" placeholder="Terim ara (Örn: API)..." 
                className="w-full p-5 rounded-2xl bg-white shadow-lg text-sm outline-none"
                value={term} onChange={(e)=>setTerm(e.target.value)}
              />
              <button type="submit" className="absolute right-2 top-2 bottom-2 px-5 bg-blue-900 text-white rounded-xl">
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              </button>
            </form>
            {result && (
              <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl text-left relative overflow-hidden">
                {result.isPersonal && <div className="absolute top-0 right-0 bg-amber-100 text-amber-700 px-4 py-1.5 rounded-bl-2xl text-[8px] font-bold uppercase tracking-widest">Senin Notun</div>}
                <h3 className="text-2xl font-bold text-blue-900 mb-6 uppercase tracking-tight">{result.label}</h3>
                <div className="space-y-6">
                   <div>
                      <p className="text-[9px] font-bold text-zinc-300 uppercase mb-2">Mantık / Tanım,</p>
                      <p className="text-sm leading-relaxed text-zinc-700">{result.logic}</p>
                   </div>
                   <div className="p-5 bg-zinc-50 rounded-2xl italic text-zinc-500 border-l-2 border-amber-200">
                      <p className="text-[9px] font-bold text-amber-700 uppercase mb-2 not-italic">Zihinsel Model,</p>
                      <span className="text-[13px]">"{result.analogy}"</span>
                   </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "profile" && (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 rounded-[2.5rem] mx-auto bg-blue-900 flex items-center justify-center text-3xl text-white font-bold">H</div>
            <h2 className="text-2xl font-bold text-blue-900">Hatice</h2>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Netaş R&D Intern</p>
            <div className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-sm text-left">
              <div className="flex items-center gap-3 mb-4">
                <GraduationCap size={18} className="text-blue-600" />
                <span className="text-xs font-semibold text-zinc-800">Yeditepe Üniversitesi</span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed italic">"Geleceğin teknolojilerini bugün, zihnimdeki en sade modellerle inşa ediyorum."</p>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-xl border-t border-zinc-100 px-10 pb-10 pt-4 z-40">
        <div className="flex justify-between items-center max-w-sm mx-auto">
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "Notlarım" },
            { id: "discover", icon: Search, label: "Rehber" },
            { id: "profile", icon: User, label: "Profil" }
          ].map(item => (
            <button key={item.id} onClick={() => setTab(item.id)} className={`flex flex-col items-center gap-1 ${tab === item.id ? "text-blue-900 scale-110" : "opacity-30"}`}>
              <item.icon size={22} />
              <span className="text-[9px] font-bold uppercase">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}