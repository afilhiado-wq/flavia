import React, { useState, useEffect, ReactNode, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Leaf, 
  Utensils, 
  Dumbbell, 
  HeartPulse, 
  ChevronRight, 
  RotateCcw, 
  Save, 
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Coffee,
  Sun,
  CloudSun,
  Moon,
  LogOut,
  Timer,
  Zap,
  Play,
  Flame,
  Clock
} from 'lucide-react';
import { generateMenu, generateSingleMeal, generateWorkout, DailyMenu, Meal, Workout } from './services/geminiService';

type Objective = 'Fitness' | 'CancerSupport';
type MealType = 'breakfast' | 'lunch' | 'afternoonSnack' | 'dinner';
type Tab = 'diet' | 'workouts';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('diet');
  const [dislikes, setDislikes] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [objective, setObjective] = useState<Objective>('Fitness');
  const [loading, setLoading] = useState(false);
  const [mealLoading, setMealLoading] = useState<MealType | null>(null);
  const [menu, setMenu] = useState<DailyMenu | null>(null);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [workoutTime, setWorkoutTime] = useState('15');
  const [workoutObjective, setWorkoutObjective] = useState('Corpo Inteiro');
  const [workoutLoading, setWorkoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMenus, setSavedMenus] = useState<DailyMenu[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem('flavia_scandolo_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    const saved = localStorage.getItem('flavia_scandolo_menus');
    if (saved) {
      try {
        setSavedMenus(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading saved menus", e);
      }
    }
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const generatedMenu = await generateMenu(dislikes, objective, additionalInfo);
      setMenu(generatedMenu);
      // Scroll to results
      setTimeout(() => {
        document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao gerar seu cardápio. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateMeal = async (mealType: MealType) => {
    if (!menu) return;
    setMealLoading(mealType);
    try {
      const newMeal = await generateSingleMeal(dislikes, objective, mealType, additionalInfo);
      setMenu({
        ...menu,
        [mealType]: newMeal
      });
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar nova opção para esta refeição.');
    } finally {
      setMealLoading(null);
    }
  };

  const downloadMenu = () => {
    if (!menu) return;
    
    const content = `
FLAVIA SCANDOLO DESPERTAR - SEU CARDÁPIO DIÁRIO
Objetivo: ${objective === 'Fitness' ? 'Fitness' : 'Apoio Câncer'}
--------------------------------------------------

CAFÉ DA MANHÃ:
Prato: ${menu.breakfast.name}
Descrição: ${menu.breakfast.description}
Preparo: ${menu.breakfast.preparation}

ALMOÇO:
Prato: ${menu.lunch.name}
Descrição: ${menu.lunch.description}
Preparo: ${menu.lunch.preparation}

CAFÉ DA TARDE:
Prato: ${menu.afternoonSnack.name}
Descrição: ${menu.afternoonSnack.description}
Preparo: ${menu.afternoonSnack.preparation}

JANTAR:
Prato: ${menu.dinner.name}
Descrição: ${menu.dinner.description}
Preparo: ${menu.dinner.preparation}

--------------------------------------------------
Dica: Mantenha-se hidratado e prefira alimentos naturais.
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cardapio-despertar-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const saveMenu = () => {
    if (menu) {
      const newSaved = [menu, ...savedMenus].slice(0, 5); // Keep last 5
      setSavedMenus(newSaved);
      localStorage.setItem('flavia_scandolo_menus', JSON.stringify(newSaved));
      alert('Cardápio salvo com sucesso!');
    }
  };

  const reset = () => {
    setMenu(null);
    setDislikes('');
    setAdditionalInfo('');
    setObjective('Fitness');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('flavia_scandolo_auth');
    setLoginPass('');
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (loginUser.toLowerCase() === 'despertar' && loginPass === '1234') {
      setIsAuthenticated(true);
      sessionStorage.setItem('flavia_scandolo_auth', 'true');
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleGenerateWorkout = async () => {
    setWorkoutLoading(true);
    setError(null);
    try {
      const generatedWorkout = await generateWorkout(workoutTime, workoutObjective);
      setWorkout(generatedWorkout);
    } catch (err) {
      console.error(err);
      setError('Erro ao gerar seu treino. Tente novamente.');
    } finally {
      setWorkoutLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-brand-100 w-full max-w-md"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="bg-brand-500 p-3 rounded-2xl mb-4">
              <Leaf className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-brand-700 tracking-tight">
              Flavia Scandolo <span className="font-light text-slate-500">Despertar</span>
            </h1>
            <p className="text-slate-500 text-sm mt-2">Acesse sua jornada de bem-estar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Usuário</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                placeholder="Seu login"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                placeholder="Sua senha"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                required
              />
            </div>
            
            {loginError && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-xs font-medium flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3" />
                Usuário ou senha incorretos.
              </motion.p>
            )}

            <button 
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-200 transition-all flex items-center justify-center gap-2 group"
            >
              Entrar
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          
          <p className="text-center text-slate-400 text-xs mt-8">
            Dica: login "despertar" | senha "1234"
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-brand-100">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand-500 p-1.5 rounded-lg">
              <Leaf className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-brand-700 tracking-tight">
              Flavia Scandolo <span className="font-light text-slate-500">Despertar</span>
            </h1>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button 
              onClick={() => setActiveTab('diet')}
              className={`transition-colors ${activeTab === 'diet' ? 'text-brand-600 font-bold' : 'hover:text-brand-600'}`}
            >
              Dieta
            </button>
            <button 
              onClick={() => setActiveTab('workouts')}
              className={`transition-colors ${activeTab === 'workouts' ? 'text-brand-600 font-bold' : 'hover:text-brand-600'}`}
            >
              Treinos
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>

          {/* Mobile Logout Only */}
          <div className="sm:hidden">
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-brand-100 z-50 px-6 py-3">
        <div className="flex justify-around items-center">
          <button 
            onClick={() => setActiveTab('diet')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'diet' ? 'text-brand-600' : 'text-slate-400'}`}
          >
            <Utensils className={`w-6 h-6 ${activeTab === 'diet' ? 'fill-brand-50' : ''}`} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Dieta</span>
          </button>
          <button 
            onClick={() => setActiveTab('workouts')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'workouts' ? 'text-brand-600' : 'text-slate-400'}`}
          >
            <Dumbbell className={`w-6 h-6 ${activeTab === 'workouts' ? 'fill-brand-50' : ''}`} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Treinos</span>
          </button>
        </div>
      </nav>

      <main className="flex-grow max-w-5xl mx-auto px-4 py-8 w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'diet' ? (
            <motion.div
              key="diet-tab"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Hero Section */}
              <section className="text-center mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="inline-block px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider mb-4">
                    Nutrição Prática e Acessível
                  </span>
                  <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 leading-tight">
                    Seu Despertar para uma <br />
                    <span className="text-brand-600">Vida mais Saudável</span>
                  </h2>
                  <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                    Cardápios com ingredientes de supermercado, simples de fazer e pensados para o seu dia a dia.
                  </p>
                </motion.div>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Section */}
                <section className="lg:col-span-5 space-y-6">
                  <motion.div 
                    className="bg-white p-6 rounded-2xl shadow-sm border border-brand-100"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-brand-500" />
                      Personalize seu Plano
                    </h3>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          O que você NÃO come (restrições)
                        </label>
                        <textarea
                          placeholder="Ex: Glúten, lactose, coentro, carne vermelha, cebola..."
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-none h-24 text-sm"
                          value={dislikes}
                          onChange={(e) => setDislikes(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Informações Adicionais (Registro)
                        </label>
                        <textarea
                          placeholder="Ex: Tenho pouco tempo para cozinhar, prefiro pratos gelados, sou vegetariano..."
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-none h-24 text-sm"
                          value={additionalInfo}
                          onChange={(e) => setAdditionalInfo(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">
                          Seu Objetivo Principal
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setObjective('Fitness')}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                              objective === 'Fitness'
                                ? 'border-brand-500 bg-brand-50 text-brand-700'
                                : 'border-slate-100 hover:border-brand-200 text-slate-500'
                            }`}
                          >
                            <Dumbbell className="w-6 h-6" />
                            <span className="text-xs font-bold">Fitness</span>
                          </button>
                          <button
                            onClick={() => setObjective('CancerSupport')}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                              objective === 'CancerSupport'
                                ? 'border-brand-500 bg-brand-50 text-brand-700'
                                : 'border-slate-100 hover:border-brand-200 text-slate-500'
                            }`}
                          >
                            <HeartPulse className="w-6 h-6" />
                            <span className="text-xs font-bold">Apoio Câncer</span>
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            Gerar Cardápio Simples
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>

                  {/* Info Box */}
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
                    <p className="text-xs text-blue-700 leading-relaxed">
                      {objective === 'Fitness' 
                        ? 'Dietas práticas com ingredientes de fácil acesso para otimizar seus resultados.'
                        : 'Opções nutritivas e suaves, ideais para quem busca praticidade durante o tratamento.'}
                    </p>
                  </div>
                </section>

                {/* Results Section */}
                <section id="result-section" className="lg:col-span-7">
                  <AnimatePresence mode="wait">
                    {!menu && !loading ? (
                      <motion.div 
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-brand-200 rounded-3xl bg-white/50"
                      >
                        <div className="bg-brand-100 p-4 rounded-full mb-4">
                          <Utensils className="w-8 h-8 text-brand-500" />
                        </div>
                        <h4 className="text-xl font-semibold text-slate-800 mb-2">Seu cardápio aparecerá aqui</h4>
                        <p className="text-slate-500 text-sm max-w-xs">
                          Diga-nos o que você não come e clique em gerar para receber sugestões super simples.
                        </p>
                      </motion.div>
                    ) : loading ? (
                      <motion.div 
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl shadow-sm border border-brand-100"
                      >
                        <div className="relative mb-6">
                          <div className="w-20 h-20 border-4 border-brand-100 border-t-brand-500 rounded-full animate-spin"></div>
                          <Leaf className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-500 w-8 h-8" />
                        </div>
                        <h4 className="text-xl font-semibold text-slate-800 mb-2">Criando opções práticas...</h4>
                        <p className="text-slate-500 text-sm animate-pulse">
                          Buscando as melhores receitas de supermercado para você.
                        </p>
                      </motion.div>
                    ) : error ? (
                      <motion.div 
                        key="error"
                        className="bg-red-50 p-8 rounded-3xl border border-red-100 text-center"
                      >
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-red-700">{error}</p>
                        <button onClick={handleGenerate} className="mt-4 text-brand-600 font-bold underline">Tentar novamente</button>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="content"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <h3 className="text-2xl font-bold text-slate-900">Seu Cardápio Profissional</h3>
                          <div className="flex gap-2">
                            <button 
                              onClick={downloadMenu}
                              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg shadow-slate-200 active:scale-95"
                              title="Baixar Cardápio em PDF/Texto"
                            >
                              <Download className="w-4 h-4" />
                              Baixar Plano
                            </button>
                            <button 
                              onClick={saveMenu}
                              className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 active:scale-95"
                            >
                              <Save className="w-4 h-4" />
                              Salvar no App
                            </button>
                            <button 
                              onClick={reset}
                              className="p-3 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors border border-slate-100"
                              title="Limpar e Recomeçar"
                            >
                              <RotateCcw className="w-5 h-5 rotate-90" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <MealCard 
                            icon={<Coffee className="w-5 h-5" />} 
                            title="Café da Manhã" 
                            meal={menu!.breakfast} 
                            color="bg-amber-50 text-amber-600"
                            onRegenerate={() => handleRegenerateMeal('breakfast')}
                            isLoading={mealLoading === 'breakfast'}
                          />
                          <MealCard 
                            icon={<Sun className="w-5 h-5" />} 
                            title="Almoço" 
                            meal={menu!.lunch} 
                            color="bg-orange-50 text-orange-600"
                            onRegenerate={() => handleRegenerateMeal('lunch')}
                            isLoading={mealLoading === 'lunch'}
                          />
                          <MealCard 
                            icon={<CloudSun className="w-5 h-5" />} 
                            title="Café da Tarde" 
                            meal={menu!.afternoonSnack} 
                            color="bg-brand-50 text-brand-600"
                            onRegenerate={() => handleRegenerateMeal('afternoonSnack')}
                            isLoading={mealLoading === 'afternoonSnack'}
                          />
                          <MealCard 
                            icon={<Moon className="w-5 h-5" />} 
                            title="Jantar" 
                            meal={menu!.dinner} 
                            color="bg-indigo-50 text-indigo-600"
                            onRegenerate={() => handleRegenerateMeal('dinner')}
                            isLoading={mealLoading === 'dinner'}
                          />
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-brand-100 shadow-sm">
                          <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-brand-500" />
                            Dica da Nutri
                          </h4>
                          <p className="text-sm text-slate-600 italic">
                            "Lembre-se de se hidratar bem ao longo do dia. A água é fundamental para o metabolismo e para a absorção de nutrientes."
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>
              </div>

              {/* Saved Menus Section */}
              {savedMenus.length > 0 && (
                <section className="mt-20">
                  <h3 className="text-2xl font-bold text-slate-900 mb-8">Cardápios Salvos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedMenus.map((m, idx) => (
                      <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                          <div className="bg-brand-50 p-2 rounded-lg">
                            <Utensils className="w-5 h-5 text-brand-500" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Salvo #{savedMenus.length - idx}</span>
                        </div>
                        <h4 className="font-bold text-slate-800 mb-1 truncate">{m.lunch.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-4">{m.lunch.description}</p>
                        <button 
                          onClick={() => setMenu(m)}
                          className="w-full py-2 text-xs font-bold text-brand-600 bg-brand-50 rounded-lg group-hover:bg-brand-600 group-hover:text-white transition-all"
                        >
                          Visualizar
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="workouts-tab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              {/* Hero Section Workouts */}
              <section className="text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="inline-block px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider mb-4">
                    Treinos Inteligentes em Casa
                  </span>
                  <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 leading-tight">
                    Treino sob medida para <br />
                    <span className="text-brand-600">o seu tempo</span>
                  </h2>
                  <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                    Diga quanto tempo você tem e a IA monta o treino ideal para você.
                  </p>
                </motion.div>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Workout Form */}
                <section className="lg:col-span-5">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-100 space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Timer className="w-5 h-5 text-brand-500" />
                      Configurar Treino
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Quanto tempo você tem?</label>
                        <select 
                          value={workoutTime}
                          onChange={(e) => setWorkoutTime(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm"
                        >
                          <option value="5">5 minutos (Express)</option>
                          <option value="10">10 minutos (Rápido)</option>
                          <option value="15">15 minutos (Ideal)</option>
                          <option value="20">20 minutos (Completo)</option>
                          <option value="30">30 minutos (Intenso)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Qual o foco de hoje?</label>
                        <select 
                          value={workoutObjective}
                          onChange={(e) => setWorkoutObjective(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm"
                        >
                          <option value="Corpo Inteiro">Corpo Inteiro (Geral)</option>
                          <option value="Cardio / HIIT">Cardio / HIIT (Queima)</option>
                          <option value="Mobilidade / Alongamento">Mobilidade / Alongamento</option>
                          <option value="Fortalecimento">Fortalecimento</option>
                          <option value="Abdômen">Foco em Abdômen</option>
                        </select>
                      </div>

                      <button
                        onClick={handleGenerateWorkout}
                        disabled={workoutLoading}
                        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 group"
                      >
                        {workoutLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            Montar Meu Treino
                            <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </section>

                {/* Workout Result */}
                <section className="lg:col-span-7">
                  <AnimatePresence mode="wait">
                    {!workout && !workoutLoading ? (
                      <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-brand-200 rounded-3xl bg-white/50">
                        <div className="bg-brand-100 p-4 rounded-full mb-4">
                          <Dumbbell className="w-8 h-8 text-brand-500" />
                        </div>
                        <h4 className="text-xl font-semibold text-slate-800 mb-2">Seu treino aparecerá aqui</h4>
                        <p className="text-slate-500 text-sm max-w-xs">
                          Escolha o tempo e o foco para receber uma rotina personalizada.
                        </p>
                      </div>
                    ) : workoutLoading ? (
                      <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl shadow-sm border border-brand-100">
                        <Loader2 className="w-12 h-12 text-brand-500 animate-spin mb-4" />
                        <h4 className="text-xl font-semibold text-slate-800 mb-2">Preparando sua rotina...</h4>
                        <p className="text-slate-500 text-sm">Otimizando exercícios para {workoutTime} minutos.</p>
                      </div>
                    ) : (
                      <WorkoutCard workout={workout} />
                    )}
                  </AnimatePresence>
                </section>
              </div>

              <div className="bg-brand-50 p-8 rounded-3xl border border-brand-100 flex flex-col md:flex-row items-center gap-8">
                <div className="bg-white p-4 rounded-2xl shadow-sm shrink-0">
                  <Timer className="w-12 h-12 text-brand-500" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Por que treinar em casa?</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Treinos curtos de alta intensidade (HIIT) ou mobilidade podem ser feitos em qualquer lugar. 
                    A constância é mais importante que a duração. Comece com 5 minutos hoje!
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-brand-100 py-12 mt-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="bg-brand-500 p-1.5 rounded-lg">
                <Leaf className="text-white w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-brand-700 tracking-tight">
                Flavia Scandolo <span className="font-light text-slate-500">Despertar</span>
              </h1>
            </div>
            <p className="text-slate-400 text-sm">
              © 2026 Flavia Scandolo Despertar. Todos os direitos reservados.
            </p>
            <div className="flex gap-4">
              <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-brand-50 hover:text-brand-500 transition-all">
                <Download className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-brand-50 hover:text-brand-500 transition-all">
                <HeartPulse className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface WorkoutCardProps {
  workout: {
    id?: string;
    title: string;
    description: string;
    duration: string;
    intensity: string;
    exercises: string[];
  };
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout }) => {
  const getIntensityColor = (intensity: string) => {
    const i = intensity.toLowerCase();
    if (i.includes('muito alta')) return 'bg-red-50 text-red-600';
    if (i.includes('alta')) return 'bg-orange-50 text-orange-600';
    if (i.includes('média') || i.includes('media')) return 'bg-brand-50 text-brand-600';
    return 'bg-emerald-50 text-emerald-600';
  };

  const getWorkoutIcon = (intensity: string) => {
    const i = intensity.toLowerCase();
    if (i.includes('muito alta')) return <Flame className="w-6 h-6" />;
    if (i.includes('alta')) return <Zap className="w-6 h-6" />;
    return <Timer className="w-6 h-6" />;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-6 rounded-3xl border border-brand-100 shadow-sm hover:shadow-md transition-all group h-full"
    >
      <div className="flex items-start justify-between mb-6">
        <div className={`p-4 rounded-2xl ${getIntensityColor(workout.intensity)}`}>
          {getWorkoutIcon(workout.intensity)}
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Clock className="w-3 h-3" />
            {workout.duration}
          </div>
          <div className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">
            Intensidade: {workout.intensity}
          </div>
        </div>
      </div>

      <h4 className="text-xl font-bold text-slate-900 mb-2">{workout.title}</h4>
      <p className="text-sm text-slate-500 mb-6 leading-relaxed">
        {workout.description}
      </p>

      <div className="space-y-3">
        <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Play className="w-3 h-3 text-brand-500 fill-brand-500" />
          Exercícios
        </h5>
        <ul className="space-y-2">
          {workout.exercises.map((ex: string, i: number) => (
            <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-200" />
              {ex}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

function MealCard({ 
  icon, 
  title, 
  meal, 
  color, 
  onRegenerate, 
  isLoading 
}: { 
  icon: ReactNode, 
  title: string, 
  meal: Meal, 
  color: string, 
  onRegenerate: () => void, 
  isLoading: boolean 
}) {
  return (
    <motion.div 
      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
      whileHover={{ y: -2 }}
    >
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-10 flex items-center justify-center"
          >
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${color} shrink-0`}>
          {icon}
        </div>
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
            <button 
              onClick={onRegenerate}
              disabled={isLoading}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-brand-600 transition-all disabled:opacity-50"
              title="Trocar esta refeição"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
          <h4 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">{meal.name}</h4>
          <p className="text-sm text-slate-600 mb-4 leading-relaxed">
            {meal.description}
          </p>
          
          <div className="bg-slate-50 p-4 rounded-xl">
            <h5 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Utensils className="w-3 h-3 text-brand-500" />
              Sugestão de Preparo
            </h5>
            <p className="text-xs text-slate-500 leading-relaxed">
              {meal.preparation}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
