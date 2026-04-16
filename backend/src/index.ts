import 'dotenv/config';

// Patch for Prisma BigInt serialization
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
