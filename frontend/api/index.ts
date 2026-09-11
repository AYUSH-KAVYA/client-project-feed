export default async function handler(req: any, res: any) {
  try {
    const appModule = await import('../server/app');
    const app = appModule.default;
    return app(req, res);
  } catch (err: any) {
    console.error('Serverless execution error in /api/index:', err);
    res.status(500).json({
      error: 'Serverless Handler Error',
      message: err.message,
      stack: err.stack,
    });
  }
}
