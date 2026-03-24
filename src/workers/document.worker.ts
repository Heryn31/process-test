import { parentPort, workerData } from "worker_threads";

const TEMPLATE_COMPILATION_TIME = 100;

interface WorkerInput {
  userId: string;
}

interface WorkerResponse {
  success: boolean;
  buffer?: Buffer;
  error?: string;
}

let compiledTemplate: ((data: { userId: string }) => string) | null = null;

const initTemplate = () => {
  if (!compiledTemplate) {
    console.log("🔥 Compilation du template (1 seule fois par worker)");

    compiledTemplate = (data) => {
      return `<h1>PDF for ${data.userId}</h1>`;
    };
  }
};

const generatePDF = async (data: WorkerInput): Promise<Buffer> => {
  initTemplate();
  const html = compiledTemplate!(data);
  await new Promise((res) => setTimeout(res, TEMPLATE_COMPILATION_TIME));
  return Buffer.from(html);
};

(async () => {
  try {
    const buffer = await generatePDF(workerData as WorkerInput);

    const response: WorkerResponse = {
      success: true,
      buffer,
    };

    parentPort?.postMessage(response);
  } catch (err: any) {
    const response: WorkerResponse = {
      success: false,
      error: err.message,
    };

    parentPort?.postMessage(response);
  }
})();
