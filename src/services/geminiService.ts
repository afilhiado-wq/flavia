export interface Meal {
  name: string;
  description: string;
  preparation: string;
}

export interface DailyMenu {
  breakfast: Meal;
  lunch: Meal;
  afternoonSnack: Meal;
  dinner: Meal;
}

export interface Workout {
  title: string;
  description: string;
  duration: string;
  intensity: string;
  exercises: string[];
}

export async function generateMenu(
  dislikes: string,
  objective: "Fitness" | "CancerSupport",
  additionalInfo: string
): Promise<DailyMenu> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'menu', dislikes, objective, additionalInfo })
  });
  if (!response.ok) throw new Error('Falha ao gerar cardápio');
  return response.json();
}

export async function generateSingleMeal(
  dislikes: string,
  objective: "Fitness" | "CancerSupport",
  mealType: "breakfast" | "lunch" | "afternoonSnack" | "dinner",
  additionalInfo: string
): Promise<Meal> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'meal', dislikes, objective, mealType, additionalInfo })
  });
  if (!response.ok) throw new Error('Falha ao gerar refeição');
  return response.json();
}

export async function generateWorkout(
  timeInMinutes: string,
  objective: string
): Promise<Workout> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'workout', timeInMinutes, objective })
  });
  if (!response.ok) throw new Error('Falha ao gerar treino');
  return response.json();
}
