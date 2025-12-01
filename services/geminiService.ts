// This file is deprecated as we are now fully offline.
// Keeping a dummy export to prevent any lingering import errors if referenced elsewhere,
// though App.tsx no longer uses it.

export const generateEncouragement = async (score: number, total: number): Promise<string> => {
  return "You did great!";
};