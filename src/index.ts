import app from './app.js';

/** Start A2A Agent */
(async () => {
  try {
    const port = process.env.PORT || 4000;
    app.listen(port, () => {
      console.log(`⚡️ A2A Agent is running on port ${port}! ⚡️`);
    });
  } catch (error) {
    console.error('Unable to start A2A Agent', error);
  }
})();
