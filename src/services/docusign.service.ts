export const sendToDocuSign = async (userId: string): Promise<string> => {
  // Simulation service externe avec délai
  await new Promise((res) => setTimeout(res, 100));

  // 30% de chance d’échec
  if (Math.random() < 0.3) {
    throw new Error("DocuSign API error");
  }

  return `signed-${userId}`;
};